// Optimisations pour les tâches en production
import { performanceMonitor } from '@/utils/performanceOptimization';

// Validation des données de tâches
export const validateTodoData = (todo: any): boolean => {
  if (!todo.text || typeof todo.text !== 'string' || todo.text.trim().length === 0) {
    return false;
  }
  
  if (todo.priority_level !== undefined && 
      (typeof todo.priority_level !== 'number' || 
       todo.priority_level < 0 || 
       todo.priority_level > 3)) {
    return false;
  }
  
  return true;
};

// Fonction pour nettoyer les tâches anciennes (performance)
export const cleanupOldTodos = async (supabase: any, userId: string) => {
  try {
    // Supprimer les tâches complétées de plus de 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('user_id', userId)
      .eq('is_completed', true)
      .lt('completed_at', thirtyDaysAgo.toISOString());
    
    if (error) {
      console.warn('Erreur lors du nettoyage des tâches anciennes:', error);
    }
  } catch (error) {
    console.warn('Erreur lors du nettoyage automatique:', error);
  }
};

// Optimisation de la synchronisation des tâches
export const optimizedTodoSync = async (syncFunction: () => Promise<any>) => {
  return await performanceMonitor.measureDBQuery(syncFunction, 'todo-sync');
};

// Fonction pour calculer les stats de manière optimisée
export const calculateTodoStats = (todos: any[]) => {
  const today = new Date().toDateString();
  
  // Utiliser une seule boucle pour calculer toutes les stats
  const stats = todos.reduce((acc, todo) => {
    const todoDate = new Date(todo.created_at).toDateString();
    const isToday = todoDate === today;
    
    if (isToday) {
      acc.today.total++;
      if (todo.is_completed) acc.today.completed++;
      if (todo.priority_level > 0) {
        acc.today.priority++;
        if (todo.is_completed) acc.today.priorityCompleted++;
      }
    }
    
    acc.global.total++;
    if (todo.is_completed) acc.global.completed++;
    if (todo.priority_level > 0) {
      acc.global.priority++;
      if (todo.is_completed) acc.global.priorityCompleted++;
    }
    
    return acc;
  }, {
    today: { total: 0, completed: 0, priority: 0, priorityCompleted: 0 },
    global: { total: 0, completed: 0, priority: 0, priorityCompleted: 0 }
  });
  
  return {
    today: {
      ...stats.today,
      progressPercent: stats.today.total > 0 ? 
        Math.round((stats.today.completed / stats.today.total) * 100) : 0
    },
    global: {
      ...stats.global,
      completionRate: stats.global.total > 0 ? 
        Math.round((stats.global.completed / stats.global.total) * 100) : 0
    }
  };
};