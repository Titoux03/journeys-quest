import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, Zap, TrendingUp, Calendar, Star } from 'lucide-react';
import { useTodos } from '@/hooks/useTodos';
import { motion } from 'framer-motion';

interface TodoStatsProps {
  className?: string;
}

export const TodoStats: React.FC<TodoStatsProps> = ({ className = '' }) => {
  const { getTodayStats, getGlobalStats } = useTodos();
  
  const todayStats = getTodayStats();
  const globalStats = getGlobalStats();

  const statCards = [
    {
      title: "Aujourd'hui",
      icon: Target,
      value: `${todayStats.completed}/${todayStats.total}`,
      progress: todayStats.progressPercent,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Tâches terminées",
    },
    {
      title: "Priorités",
      icon: Zap,
      value: `${todayStats.priorityCompleted}/${todayStats.priority}`,
      progress: todayStats.priority > 0 ? Math.round((todayStats.priorityCompleted / todayStats.priority) * 100) : 0,
      color: "text-warning",
      bgColor: "bg-warning/10",
      description: "Tâches prioritaires",
    },
    {
      title: "Streak",
      icon: Trophy,
      value: globalStats.currentStreak,
      progress: Math.min((globalStats.currentStreak / 7) * 100, 100), // Objectif de 7 jours
      color: "text-success",
      bgColor: "bg-success/10",
      description: "Jours consécutifs",
    },
    {
      title: "Global",
      icon: TrendingUp,
      value: `${globalStats.completionRate}%`,
      progress: globalStats.completionRate,
      color: "text-accent",
      bgColor: "bg-accent/10",
      description: "Taux de réussite",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <Card className="journey-card p-4 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    {stat.title}
                  </p>
                  <p className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  value={stat.progress} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Achievement Badges */}
      {(globalStats.longestStreak >= 7 || globalStats.completionRate >= 80 || todayStats.progressPercent === 100) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="journey-card p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Achievements</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {globalStats.longestStreak >= 7 && (
              <Badge className="bg-success/20 text-success border-success/30">
                <Calendar className="w-3 h-3 mr-1" />
                Régularité 7j
              </Badge>
            )}
            
            {globalStats.completionRate >= 80 && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Target className="w-3 h-3 mr-1" />
                Expert 80%+
              </Badge>
            )}
            
            {todayStats.progressPercent === 100 && (
              <Badge className="bg-accent/20 text-accent border-accent/30">
                <Star className="w-3 h-3 mr-1" />
                Journée parfaite
              </Badge>
            )}
            
            {globalStats.longestStreak >= 30 && (
              <Badge className="bg-warning/20 text-warning border-warning/30">
                <Trophy className="w-3 h-3 mr-1" />
                Champion 30j
              </Badge>
            )}
          </div>
        </motion.div>
      )}

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="journey-card p-4 text-center bg-gradient-to-r from-primary/5 to-accent/5"
      >
        {todayStats.progressPercent === 100 ? (
          <div className="space-y-2">
            <Trophy className="w-8 h-8 mx-auto text-primary animate-pulse-glow" />
            <p className="text-sm font-medium text-primary">
              Parfait ! Vous avez terminé toutes vos tâches du jour 🎉
            </p>
          </div>
        ) : todayStats.total > 0 ? (
          <div className="space-y-2">
            <Target className="w-6 h-6 mx-auto text-accent" />
            <p className="text-sm text-muted-foreground">
              Plus que {todayStats.total - todayStats.completed} tâche{todayStats.total - todayStats.completed > 1 ? 's' : ''} pour terminer votre journée !
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Zap className="w-6 h-6 mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">
              Prêt à conquérir cette journée ? Ajoutez vos premières tâches !
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};