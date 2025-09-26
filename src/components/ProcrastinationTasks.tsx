import React, { useState, useEffect } from 'react';
import { CheckCircle2, Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGongSounds } from '@/hooks/useGongSounds';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface ProcrastinationTasksProps {
  className?: string;
}

export const ProcrastinationTasks: React.FC<ProcrastinationTasksProps> = ({ className = "" }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const { playPremium } = useGongSounds();

  // Charger les tâches depuis localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('procrastination-tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  // Sauvegarder les tâches dans localStorage
  useEffect(() => {
    localStorage.setItem('procrastination-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        createdAt: new Date()
      };
      setTasks(prev => [...prev, newTask]);
      setNewTaskText('');
      playPremium();
    }
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
    playPremium();
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className={`journey-card p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary" />
          Liste Anti-Procrastination
        </h3>
        <p className="text-muted-foreground text-sm">
          Accomplissez ces tâches avant de vous reposer !
        </p>
        
        {totalTasks > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Progression: {completedTasks}/{totalTasks} tâches
              </span>
              <span className="text-primary font-medium">
                {Math.round(completionRate)}%
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Ajout de tâche */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Ajouter une tâche importante..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={addTask} size="sm">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Liste des tâches */}
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune tâche ajoutée.</p>
          <p className="text-sm">Ajoutez des tâches importantes à accomplir !</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                task.completed 
                  ? 'bg-gradient-to-r from-primary/10 to-primary-glow/5 border-primary/20' 
                  : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all ${
                  task.completed
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-border hover:border-primary'
                }`}
              >
                {task.completed && <CheckCircle2 className="w-3 h-3" />}
              </button>
              
              <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.text}
              </span>
              
              <button
                onClick={() => deleteTask(task.id)}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {completedTasks === totalTasks && totalTasks > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary-glow/5 border border-primary/20 rounded-lg text-center">
          <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-primary font-medium">Félicitations !</p>
          <p className="text-sm text-muted-foreground">
            Toutes vos tâches sont terminées. Vous pouvez vous reposer !
          </p>
        </div>
      )}
    </div>
  );
};