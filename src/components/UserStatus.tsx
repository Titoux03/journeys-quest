import React from 'react';
import { User, LogIn, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { useNavigate } from 'react-router-dom';
export const UserStatus: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    isPremium
  } = usePremium();
  const navigate = useNavigate();
  if (!user) {
    return <div className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm border-b border-border/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Mode invité</p>
            <p className="text-xs text-muted-foreground">Inscrit toi pour sauvegarder<br />tes notes et ta progression</p>
          </div>
        </div>
        
        <button onClick={() => navigate('/auth')} className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <LogIn className="w-4 h-4" />
          <span>Se connecter</span>
        </button>
      </div>;
  }
  return <div className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm border-b border-border/30">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          {isPremium ? <Crown className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-primary" />}
        </div>
        <div>
          <p className="text-sm font-medium">
            {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isPremium ? 'Journeys Premium' : 'Version gratuite'}
          </p>
        </div>
      </div>
      
      {isPremium && <div className="flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
          <Crown className="w-3 h-3" />
          <span>Premium</span>
        </div>}
    </div>;
};