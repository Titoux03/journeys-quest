import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  TrendingUp, 
  BarChart3, 
  Timer, 
  Shield, 
  Leaf,
  LogOut,
  LogIn,
  PenTool,
  CheckSquare,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BottomNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentScreen, 
  onNavigate 
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    } else {
      navigate('/auth');
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: t('navigation.home'), desc: 'Tableau de bord' },
    { id: 'journal', icon: TrendingUp, label: 'Score', desc: 'Évalue ta journée' },
    { id: 'todos', icon: CheckSquare, label: t('navigation.todos'), desc: 'Gère tes tâches' },
    { id: 'notes', icon: PenTool, label: t('navigation.notes'), desc: 'Prends des notes' },
    { id: 'meditation', icon: Timer, label: 'Focus', desc: 'Méditation guidée' },
    { id: 'abstinence', icon: Shield, label: t('navigation.addictions'), desc: 'Suivi addictions' },
    { id: 'stretching', icon: Leaf, label: t('navigation.stretching'), desc: 'Étirements quotidiens' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-2 safe-area-inset-bottom lg:hidden">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-2 bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg p-3"
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsExpanded(false);
                    }}
                    className="h-auto py-3 flex flex-col items-start gap-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={18} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                  </Button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg overflow-hidden">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 flex items-center justify-center gap-2 border-b border-border/50 hover:bg-accent/50"
        >
          {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          <span className="text-xs font-medium">
            {isExpanded ? 'Réduire' : 'Voir toutes les fonctionnalités'}
          </span>
        </Button>

        <div className="grid grid-cols-8 gap-0 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-1 h-auto py-3 px-1 rounded-none border-0 transition-all duration-200 min-h-[72px] ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span className="text-[8px] font-medium leading-none text-center">{item.label}</span>
              </Button>
            );
          })}
          
          <Button
            variant="ghost"
            onClick={handleAuthAction}
            className={`flex flex-col items-center justify-center gap-1 h-auto py-3 px-1 rounded-none border-0 transition-all duration-200 min-h-[72px] ${
              user 
                ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
            }`}
          >
            {user ? (
              <>
                <LogOut size={20} className="shrink-0" />
                <span className="text-[8px] font-medium leading-none text-center">{t('navigation.signOut')}</span>
              </>
            ) : (
              <>
                <LogIn size={20} className="shrink-0" />
                <span className="text-[8px] font-medium leading-none text-center">{t('navigation.signIn')}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};