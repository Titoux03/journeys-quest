import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Star, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/hooks/useProgress';
import { usePremium } from '@/hooks/usePremium';

interface CalendarViewProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectDate,
  selectedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { journalEntries } = useProgress();
  const { isPremium } = usePremium();
  
  const today = new Date();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  // Créer un array des jours du mois
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getScoreForDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    const entry = journalEntries.find(e => e.date === dateString);
    return entry?.total_score || 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-success/20 border-success/40 text-success';
    if (score >= 60) return 'bg-warning/20 border-warning/40 text-warning';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500/40 text-orange-500';
    if (score > 0) return 'bg-destructive/20 border-destructive/40 text-destructive';
    return 'bg-muted/20 border-muted/40 text-muted-foreground';
  };

  const isToday = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(date);
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <Card className="journey-card-glow">
        <div className="flex items-center justify-between p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gradient-primary">
              {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isPremium ? 'Journeys Premium' : 'Calendrier Journeys'}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* Calendrier */}
      <Card className="journey-card">
        <div className="p-4">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier */}
          <div className="grid grid-cols-7 gap-2">
            {/* Jours vides du mois précédent */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="h-12" />
            ))}
            
            {/* Jours du mois */}
            {days.map((day) => {
              const score = getScoreForDate(day);
              const colorClass = getScoreColor(score);
              
              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    h-12 rounded-xl transition-all duration-300 border-2 text-sm font-medium
                    hover:scale-105 hover:shadow-lg relative overflow-hidden
                    ${colorClass}
                    ${isSelected(day) ? 'ring-2 ring-primary' : ''}
                    ${isToday(day) ? 'ring-2 ring-accent' : ''}
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className={isToday(day) ? 'font-bold' : ''}>{day}</span>
                    {score > 0 && (
                      <div className="absolute bottom-1 right-1">
                        {score >= 80 ? (
                          <Star className="w-3 h-3" />
                        ) : (
                          <Target className="w-2 h-2" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Effet de survol */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <Card className="journey-card">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-16 flex flex-col gap-2"
              onClick={() => onSelectDate(today)}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Nouveau jour</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col gap-2"
              onClick={() => onSelectDate(selectedDate)}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Voir détails</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};