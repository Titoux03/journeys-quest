import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone, Plus, Share, Download } from 'lucide-react';

interface InstallPWAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPWAModal: React.FC<InstallPWAModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Smartphone className="h-6 w-6 text-primary" />
            Ajoutez Journeys à votre écran d'accueil
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            Accédez rapidement à vos fonctionnalités premium en ajoutant Journeys sur votre écran d'accueil !
          </p>
          
          {/* Instructions iOS */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              📱 Sur iOS (iPhone/iPad)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p>Appuyez sur le bouton <Share className="inline h-4 w-4 mx-1" /> <strong>Partager</strong> en bas de Safari</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <p>Sélectionnez <strong>"Sur l'écran d'accueil"</strong> <Plus className="inline h-4 w-4 mx-1" /></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <p>Appuyez sur <strong>"Ajouter"</strong> en haut à droite</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Instructions Android */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              🤖 Sur Android
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p>Appuyez sur le menu <strong>⋮</strong> en haut à droite de Chrome</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <p>Sélectionnez <Download className="inline h-4 w-4 mx-1" /> <strong>"Ajouter à l'écran d'accueil"</strong></p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <p>Confirmez en appuyant sur <strong>"Ajouter"</strong></p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-accent/20 rounded-lg p-4">
            <p className="text-sm text-center">
              ✨ Une fois ajoutée, Journeys se comportera comme une vraie app avec toutes vos fonctionnalités premium !
            </p>
          </div>
        </div>
        
        <Button onClick={onClose} className="w-full mt-4">
          Parfait, j'ai compris !
        </Button>
      </DialogContent>
    </Dialog>
  );
};