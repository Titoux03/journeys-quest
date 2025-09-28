import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Star, Check, X, ArrowLeft, Target, Zap, Trophy, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTodos } from '@/hooks/useTodos';
import { motion, AnimatePresence } from 'framer-motion';

interface TodoListProps {
  onNavigate: (screen: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { 
    todos, 
    saveTodo, 
    deleteTodo, 
    updateTodo, 
    toggleTodo, 
    getTodayStats,
    isLoading 
  } = useTodos();

  const [newTodoText, setNewTodoText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [priorityMode, setPriorityMode] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const todayStats = getTodayStats();
  const todayTodos = todos.filter(todo => {
    const todoDate = new Date(todo.created_at).toDateString();
    const today = new Date().toDateString();
    return todoDate === today;
  });

  const priorityTodos = todayTodos.filter(todo => todo.is_priority && !todo.is_completed);
  const normalTodos = todayTodos.filter(todo => !todo.is_priority && !todo.is_completed);
  const completedTodos = todayTodos.filter(todo => todo.is_completed);

  const handleAddTodo = async () => {
    if (!newTodoText.trim()) return;

    const success = await saveTodo({
      text: newTodoText.trim(),
      is_priority: false,
      is_completed: false
    });

    if (success) {
      setNewTodoText('');
      setIsAdding(false);
    }
  };

  const handleTogglePriority = async (todoId: string, currentPriority: boolean) => {
    await updateTodo(todoId, { is_priority: !currentPriority });
  };

  const handleToggleComplete = async (todoId: string) => {
    await toggleTodo(todoId);
  };

  const handleDeleteTodo = async (todoId: string) => {
    await deleteTodo(todoId);
  };

  // Animations variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 }
  };

  const statsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="journey-card max-w-md w-full p-8"
        >
          <Target className="w-16 h-16 mx-auto mb-6 text-primary animate-pulse-glow" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Organisez vos journées
          </h2>
          <p className="text-muted-foreground mb-6">
            Connectez-vous pour accéder à votre to-do list personnalisée et ne plus jamais procrastiner.
          </p>
          <Button 
            onClick={() => onNavigate('auth')} 
            className="journey-button-primary w-full"
          >
            Se connecter
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border/30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className="hover:bg-accent/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-gradient-primary">
                To-Do List
              </h1>
            </div>
          </div>
          
          {/* Quick Stats */}
          <motion.div 
            variants={statsVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-2"
          >
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              {todayStats.completed}/{todayStats.total}
            </Badge>
            {todayStats.progressPercent === 100 && (
              <Trophy className="w-5 h-5 text-primary animate-pulse-glow" />
            )}
          </motion.div>
        </div>

        {/* Progress Bar */}
        {todayStats.total > 0 && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-3">
              <Progress 
                value={todayStats.progressPercent} 
                className="flex-1 h-2"
              />
              <span className="text-sm font-medium text-primary">
                {todayStats.progressPercent}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Add New Todo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="journey-card"
        >
          {!isAdding ? (
            <Button
              onClick={() => setIsAdding(true)}
              className="w-full journey-button-accent p-6 text-base"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter une tâche du jour
            </Button>
          ) : (
            <div className="space-y-4">
              <Input
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Qu'avez-vous prévu aujourd'hui ?"
                className="text-base p-4 border-border/50 focus:border-primary"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddTodo}
                  disabled={!newTodoText.trim() || isLoading}
                  className="journey-button-primary flex-1"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Ajouter
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false);
                    setNewTodoText('');
                  }}
                  variant="outline"
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Priority Tasks */}
        {priorityTodos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-semibold text-warning">
                Priorités ({priorityTodos.length})
              </h2>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {priorityTodos.map((todo, index) => (
                  <motion.div
                    key={todo.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: index * 0.05 }}
                    className="journey-card p-4 border-l-4 border-warning bg-warning/5"
                  >
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleComplete(todo.id)}
                        className="hover:bg-success/20 hover:text-success rounded-full p-2"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      
                      <span className="flex-1 text-foreground font-medium">
                        {todo.text}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePriority(todo.id, todo.is_priority)}
                        className="text-warning hover:bg-warning/20 rounded-full p-2"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="hover:bg-destructive/20 hover:text-destructive rounded-full p-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Normal Tasks */}
        {normalTodos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-accent">
                Tâches ({normalTodos.length})
              </h2>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {normalTodos.map((todo, index) => (
                  <motion.div
                    key={todo.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: index * 0.05 }}
                    className="journey-card p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleComplete(todo.id)}
                        className="hover:bg-success/20 hover:text-success rounded-full p-2"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      
                      <span className="flex-1 text-foreground">
                        {todo.text}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePriority(todo.id, todo.is_priority)}
                        className="text-muted-foreground hover:bg-warning/20 hover:text-warning rounded-full p-2"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="hover:bg-destructive/20 hover:text-destructive rounded-full p-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Completed Tasks */}
        {completedTodos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="ghost"
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2 mb-3 hover:bg-success/10"
            >
              {showCompleted ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <Check className="w-5 h-5 text-success" />
              <span className="text-lg font-semibold text-success">
                Terminées ({completedTodos.length})
              </span>
            </Button>
            
            <AnimatePresence>
              {showCompleted && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {completedTodos.map((todo, index) => (
                    <motion.div
                      key={todo.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      className="journey-card p-4 bg-success/5 border-success/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-success" />
                        </div>
                        
                        <span className="flex-1 text-muted-foreground line-through">
                          {todo.text}
                        </span>
                        
                        {todo.is_priority && (
                          <Star className="w-4 h-4 text-warning fill-current" />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="hover:bg-destructive/20 hover:text-destructive rounded-full p-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {todayTodos.length === 0 && !isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="journey-card p-8 text-center"
          >
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Prêt pour une journée productive ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Commencez par ajouter vos tâches du jour et organisez vos priorités.
            </p>
            <Button
              onClick={() => setIsAdding(true)}
              className="journey-button-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer ma première tâche
            </Button>
          </motion.div>
        )}

        {/* Motivational Footer */}
        {todayStats.total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="journey-card p-6 text-center bg-gradient-to-r from-primary/10 to-accent/10"
          >
            {todayStats.progressPercent === 100 ? (
              <div className="space-y-2">
                <Trophy className="w-8 h-8 mx-auto text-primary animate-pulse-glow" />
                <h3 className="text-lg font-bold text-primary">
                  Journée terminée ! 🎉
                </h3>
                <p className="text-muted-foreground">
                  Vous avez accompli toutes vos tâches. Félicitations !
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Zap className="w-6 h-6 mx-auto text-accent" />
                <p className="text-sm text-muted-foreground">
                  Plus que {todayStats.total - todayStats.completed} tâche{todayStats.total - todayStats.completed > 1 ? 's' : ''} pour terminer votre journée !
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};