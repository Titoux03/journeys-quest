import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Star, ArrowUp, RotateCcw, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTodos } from '@/hooks/useTodos';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { PremiumLock } from '@/components/PremiumLock';
import { TodoCompletionCelebration } from '@/components/TodoCompletionCelebration';
import { useAIOptimization } from '@/hooks/useAIOptimization';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface TodoListProps {
  onNavigate: (screen: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isPremium, showUpgradeModal } = usePremium();
  const { trackBehavior } = useAIOptimization();
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [celebration, setCelebration] = useState<{ text: string } | null>(null);
  const [completionCount, setCompletionCount] = useState(0);

  const {
    todos,
    isLoading,
    saveTodo,
    toggleTodo,
    deleteTodo,
    getTodayStats,
    loadTodos,
  } = useTodos();

  useEffect(() => {
    if (user && isPremium) {
      carryImportantTodosFromYesterday();
    }
  }, [user, isPremium]);

  // AI Optimization: Celebrate completions and track behavior
  const handleToggleTodo = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    // If completing a todo (not un-completing)
    if (!todo.is_completed) {
      trackBehavior('todo_completed', { 
        todoText: todo.text, 
        priorityLevel: todo.priority_level 
      });
      
      // Show celebration
      setCelebration({ text: todo.text });
      
      // Increment completion count
      const newCount = completionCount + 1;
      setCompletionCount(newCount);
      
      // AI Optimization: Show premium modal after 3 completions (motivation peak)
      if (!isPremium && newCount === 3) {
        setTimeout(() => {
          trackBehavior('premium_modal_triggered_after_accomplishment', {
            completionCount: newCount,
          });
          showUpgradeModal();
        }, 3000); // After celebration
      }
    }

    // Toggle the todo
    await toggleTodo(todoId);
  };

  // Fonction pour reporter les tâches importantes de la veille
  const carryImportantTodosFromYesterday = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    const yesterdayTodos = todos.filter(todo => {
      const todoDate = new Date(todo.created_at).toDateString();
      return todoDate === yesterdayString && todo.priority_level >= 2 && !todo.is_completed;
    });

    for (const todo of yesterdayTodos) {
      await saveTodo({
        text: `📅 ${todo.text}`,
        priority_level: Math.max(1, todo.priority_level - 1), // Diminuer la priorité
        is_completed: false,
        carried_from_previous: true,
      });
    }
  };

  const handleAddTodo = async () => {
    if (!newTodoText.trim()) return;

    setIsAdding(true);
    const success = await saveTodo({
      text: newTodoText.trim(),
      priority_level: newTodoPriority,
      is_completed: false,
    });

    if (success) {
      setNewTodoText('');
      setNewTodoPriority(0);
    }
    setIsAdding(false);
  };

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 3: return 'text-red-500 bg-red-50 border-red-200';
      case 2: return 'text-orange-500 bg-orange-50 border-orange-200';
      case 1: return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getPriorityLabel = (level: number) => {
    switch (level) {
      case 3: return 'Ultra Important';
      case 2: return 'Important';
      case 1: return 'À faire';
      default: return 'Normal';
    }
  };

  const sortedTodos = [...todos]
    .filter(todo => {
      const todoDate = new Date(todo.created_at).toDateString();
      const today = new Date().toDateString();
      return todoDate === today;
    })
    .sort((a, b) => {
      // Trier par priorité (du plus élevé au plus bas), puis par date de création
      if (a.priority_level !== b.priority_level) {
        return b.priority_level - a.priority_level;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  const incompleteTodos = sortedTodos.filter(todo => !todo.is_completed);
  const completedTodos = sortedTodos.filter(todo => todo.is_completed);
  const todayStats = getTodayStats();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold text-foreground mb-2">{t('todos.signInTitle')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('todos.signInDesc')}
            </p>
            <Button 
              onClick={() => onNavigate('auth')}
              className="journey-button-primary"
            >
              {t('userStatus.signIn')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PremiumLock 
      feature="La liste de tâches matinale révolutionnaire qui transforme votre productivité en empêchant la procrastination. Notez vos tâches chaque matin avec Journeys et changez vraiment votre vie !"
      className="min-h-screen"
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <div className="max-w-md mx-auto">
          {/* Header avec stats */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gradient-primary flex items-center gap-2">
                  <CheckSquare className="w-6 h-6" />
                  Tâches du jour
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                  {!isPremium && (
                    <span className="text-xs text-warning animate-pulse">
                      🔥 Imaginez vos progrès avec Premium Insights
                    </span>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Barre de progression motivante */}
            <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progression du jour</span>
                <span className="text-sm font-bold text-primary">{todayStats.progressPercent}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <motion.div
                  className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${todayStats.progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{todayStats.completed}/{todayStats.total} tâches</span>
                <span>{todayStats.priorityCompleted}/{todayStats.priority} priorités</span>
              </div>
            </Card>
          </motion.div>

          {/* Zone d'ajout de tâche */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="p-4">
              <div className="space-y-3">
                <Input
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                  placeholder="📝 Nouvelle tâche pour transformer votre journée..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                  className="border-primary/20 focus:border-primary"
                />
                
                {/* Sélecteur de priorité amélioré */}
                <div>
                  <p className="text-sm font-medium mb-2">Niveau d'importance</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((level) => (
                      <Button
                        key={level}
                        variant={newTodoPriority === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewTodoPriority(level)}
                        className={`relative ${newTodoPriority === level ? 'ring-2 ring-primary' : ''}`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {level === 0 && <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
                          {level === 1 && <Star className="w-3 h-3 text-yellow-500" />}
                          {level === 2 && <ArrowUp className="w-3 h-3 text-orange-500" />}
                          {level === 3 && <Sparkles className="w-3 h-3 text-red-500" />}
                          <span className="text-xs">{getPriorityLabel(level)}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleAddTodo}
                  disabled={!newTodoText.trim() || isAdding}
                  className="w-full journey-button-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isAdding ? 'Ajout...' : 'Ajouter la tâche'}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Liste des tâches */}
          <div className="space-y-4">
            {/* Tâches incomplètes */}
            <AnimatePresence>
              {incompleteTodos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    À accomplir ({incompleteTodos.length})
                  </h3>
                  <div className="space-y-2">
                    {incompleteTodos.map((todo, index) => (
                      <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={`p-3 border-l-4 ${todo.priority_level > 0 ? 'border-l-primary' : 'border-l-muted'} hover:shadow-md transition-all`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleTodo(todo.id)}
                                className="p-1 hover:bg-success/20"
                              >
                                <CheckSquare className="w-4 h-4 text-muted-foreground hover:text-success" />
                              </Button>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {todo.priority_level > 0 && (
                                    <Badge variant="outline" className={`text-xs ${getPriorityColor(todo.priority_level)}`}>
                                      {getPriorityLabel(todo.priority_level)}
                                    </Badge>
                                  )}
                                  {todo.carried_from_previous && (
                                    <Badge variant="outline" className="text-xs text-blue-500 bg-blue-50 border-blue-200">
                                      <RotateCcw className="w-3 h-3 mr-1" />
                                      Reporté
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-foreground">{todo.text}</p>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTodo(todo.id)}
                              className="p-1 text-destructive hover:bg-destructive/20"
                            >
                              ×
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tâches complétées */}
            {completedTodos.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                    ✅ Terminées ({completedTodos.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCompleted(!showCompleted)}
                  >
                    {showCompleted ? 'Masquer' : 'Afficher'}
                  </Button>
                </div>
                
                <AnimatePresence>
                  {showCompleted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      {completedTodos.map((todo) => (
                        <Card key={todo.id} className="p-3 bg-muted/50 opacity-60">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleTodo(todo.id)}
                                className="p-1"
                              >
                                <CheckSquare className="w-4 h-4 text-success" fill="currentColor" />
                              </Button>
                              <p className="text-sm line-through text-muted-foreground">{todo.text}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTodo(todo.id)}
                              className="p-1 text-destructive hover:bg-destructive/20"
                            >
                              ×
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* État vide */}
            {sortedTodos.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center py-12"
              >
                <CheckSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Prêt à transformer votre journée ?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par noter vos tâches du matin. Journeys vous aide à vaincre la procrastination !
                </p>
                <div className="bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg p-4 text-sm text-muted-foreground">
                  💡 <strong>Astuce :</strong> Notez 3-5 tâches importantes chaque matin pour une productivité maximale
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer motivant */}
          {todayStats.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center"
            >
              <Card className="p-4 bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
                <p className="text-sm font-medium text-foreground">
                  {todayStats.progressPercent === 100 
                    ? "🎉 Journée parfaite ! Vous avez tout accompli !"
                    : todayStats.progressPercent >= 75 
                    ? "🔥 Excellent ! Plus que quelques tâches !"
                    : todayStats.progressPercent >= 50 
                    ? "💪 Bon rythme ! Continuez comme ça !"
                    : "🌅 C'est parti ! Chaque tâche vous rapproche du succès !"
                  }
                </p>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* AI Optimization: Celebration on completion */}
      {celebration && (
        <TodoCompletionCelebration
          todoText={celebration.text}
          onComplete={() => setCelebration(null)}
        />
      )}
    </PremiumLock>
  );
};

export default TodoList;
