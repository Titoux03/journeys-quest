import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  Timer, 
  Shield, 
  Dumbbell,
  LogOut,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
    } else {
      navigate('/auth');
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'journal', icon: BookOpen, label: 'Journal' },
    { id: 'meditation', icon: Timer, label: 'Focus' },
    { id: 'abstinence', icon: Shield, label: 'Abstinence' },
    { id: 'stretching', icon: Dumbbell, label: 'Stretching' },
    { id: 'progress', icon: BarChart3, label: 'Progrès' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-2 safe-area-inset-bottom">
      <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-0">
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
                <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
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
                <span className="text-[10px] font-medium leading-tight text-center">Sortir</span>
              </>
            ) : (
              <>
                <LogIn size={20} className="shrink-0" />
                <span className="text-[10px] font-medium leading-tight text-center">Connexion</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};