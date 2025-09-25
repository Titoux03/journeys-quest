import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  Timer, 
  Shield, 
  Activity,
  LogOut 
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
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'journal', icon: BookOpen, label: 'Journal' },
    { id: 'meditation', icon: Timer, label: 'Méditation' },
    { id: 'abstinence', icon: Shield, label: 'Abstinence' },
    { id: 'stretching', icon: Activity, label: 'Stretching' },
    { id: 'progress', icon: BarChart3, label: 'Progrès' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-4 mb-4 bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut size={18} />
            <span className="text-xs font-medium">Sortir</span>
          </Button>
        </div>
      </div>
    </div>
  );
};