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
  ChevronDown,
  User
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GlobalAvatar } from '@/components/avatar/GlobalAvatar';

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
    { id: 'avatar', icon: User, label: 'Avatar', desc: 'Ton personnage' },
    { id: 'journal', icon: TrendingUp, label: 'Score', desc: 'Évalue ta journée' },
    { id: 'todos', icon: CheckSquare, label: t('navigation.todos'), desc: 'Gère tes tâches' },
    { id: 'notes', icon: PenTool, label: t('navigation.notes'), desc: 'Prends des notes' },
    { id: 'meditation', icon: Timer, label: 'Focus', desc: 'Méditation guidée' },
    { id: 'abstinence', icon: Shield, label: t('navigation.addictions'), desc: 'Suivi addictions' },
    { id: 'stretching', icon: Leaf, label: t('navigation.stretching'), desc: 'Étirements quotidiens' },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 safe-area-inset-bottom lg:hidden">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25,
              duration: 0.25,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl p-3 mb-2"
          >
            <div className="grid grid-cols-2 gap-2 mb-3">
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
                    <div className="flex items-center gap-2 w-full">
                      <Icon size={18} className="shrink-0" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1">{item.desc}</span>
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                onClick={handleAuthAction}
                className="h-auto py-3 flex flex-col items-start gap-1 text-left col-span-2"
              >
                <div className="flex items-center gap-2">
                  {user ? <LogOut size={18} /> : <LogIn size={18} />}
                  <span className="font-medium text-sm">
                    {user ? t('navigation.signOut') : t('navigation.signIn')}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {user ? 'Se déconnecter du compte' : 'Accéder à votre compte'}
                </span>
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="w-full py-2 flex items-center justify-center gap-2 hover:bg-accent/50"
            >
              <ChevronDown size={18} />
              <span className="text-xs font-medium">Réduire</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isExpanded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring", 
            damping: 20,
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-full shadow-xl"
        >
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full py-3 px-4 flex items-center justify-center gap-3 hover:bg-accent/20 rounded-full transition-colors"
          >
            {/* Show mini avatar in collapsed menu */}
            {user && (
              <div className="flex items-center">
                <GlobalAvatar size="xs" animate={false} showGlow={false} />
              </div>
            )}
            <ChevronUp size={20} className="shrink-0" />
            <span className="text-sm font-medium">Menu</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
