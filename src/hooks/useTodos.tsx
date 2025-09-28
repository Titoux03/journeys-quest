import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Todo {
  id: string;
  user_id: string;
  text: string;
  is_priority: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  progressPercent: number;
  priority: number;
  priorityCompleted: number;
}

export const useTodos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les todos de l'utilisateur
  const loadTodos = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('todos' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des todos:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos tâches.",
          variant: "destructive",
        });
        return;
      }

      setTodos((data as unknown as Todo[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder un nouveau todo
  const saveTodo = async (todoData: {
    text: string;
    is_priority: boolean;
    is_completed: boolean;
  }) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour créer des tâches.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('todos' as any)
        .insert([{
          user_id: user.id,
          text: todoData.text,
          is_priority: todoData.is_priority,
          is_completed: todoData.is_completed,
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la sauvegarde du todo:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder la tâche.",
          variant: "destructive",
        });
        return false;
      }

      // Ajouter le nouveau todo à la liste
      setTodos(prev => [data as unknown as Todo, ...prev]);
      
      toast({
        title: "Tâche ajoutée",
        description: "Votre tâche a été ajoutée avec succès.",
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du todo:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mettre à jour un todo
  const updateTodo = async (todoId: string, updates: Partial<Todo>) => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('todos' as any)
        .update(updates)
        .eq('id', todoId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du todo:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la tâche.",
          variant: "destructive",
        });
        return false;
      }

      // Mettre à jour le todo dans la liste
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? data as unknown as Todo : todo
      ));

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du todo:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Basculer l'état de complétion d'un todo
  const toggleTodo = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return false;

    const updates = {
      is_completed: !todo.is_completed,
      completed_at: !todo.is_completed ? new Date().toISOString() : null,
    };

    const success = await updateTodo(todoId, updates);
    
    if (success && !todo.is_completed) {
      toast({
        title: "Tâche terminée ! 🎉",
        description: "Félicitations pour ce progrès.",
      });
    }

    return success;
  };

  // Supprimer un todo
  const deleteTodo = async (todoId: string) => {
    if (!user) return false;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('todos' as any)
        .delete()
        .eq('id', todoId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la suppression du todo:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la tâche.",
          variant: "destructive",
        });
        return false;
      }

      // Retirer le todo de la liste
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
      
      toast({
        title: "Tâche supprimée",
        description: "La tâche a été supprimée avec succès.",
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du todo:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir les statistiques du jour
  const getTodayStats = (): TodoStats => {
    const today = new Date().toDateString();
    const todayTodos = todos.filter(todo => {
      const todoDate = new Date(todo.created_at).toDateString();
      return todoDate === today;
    });

    const completed = todayTodos.filter(todo => todo.is_completed).length;
    const priority = todayTodos.filter(todo => todo.is_priority).length;
    const priorityCompleted = todayTodos.filter(todo => todo.is_priority && todo.is_completed).length;

    return {
      total: todayTodos.length,
      completed,
      progressPercent: todayTodos.length > 0 ? Math.round((completed / todayTodos.length) * 100) : 0,
      priority,
      priorityCompleted,
    };
  };

  // Obtenir les todos d'une date spécifique
  const getTodosByDate = (date: string) => {
    const targetDate = new Date(date).toDateString();
    return todos.filter(todo => {
      const todoDate = new Date(todo.created_at).toDateString();
      return todoDate === targetDate;
    });
  };

  // Obtenir les statistiques globales
  const getGlobalStats = () => {
    const totalTodos = todos.length;
    const completedTodos = todos.filter(todo => todo.is_completed).length;
    const priorityTodos = todos.filter(todo => todo.is_priority).length;
    const completedPriorityTodos = todos.filter(todo => todo.is_priority && todo.is_completed).length;

    // Calcul des streaks
    const sortedDates = [...new Set(todos.map(todo => new Date(todo.created_at).toDateString()))].sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    for (let i = 0; i < 30; i++) { // Vérifier les 30 derniers jours
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const checkDateString = checkDate.toDateString();
      
      const dayTodos = getTodosByDate(checkDateString);
      const dayCompleted = dayTodos.filter(todo => todo.is_completed).length;
      
      if (dayTodos.length > 0 && dayCompleted === dayTodos.length) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak; // Si c'est aujourd'hui
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
      }
    }

    if (tempStreak > longestStreak) longestStreak = tempStreak;

    return {
      totalTodos,
      completedTodos,
      priorityTodos,
      completedPriorityTodos,
      currentStreak,
      longestStreak,
      completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
    };
  };

  // Charger les données au montage et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      loadTodos();
    } else {
      setTodos([]);
    }
  }, [user]);

  return {
    todos,
    isLoading,
    saveTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    getTodayStats,
    getTodosByDate,
    getGlobalStats,
    loadTodos,
  };
};