import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, X, Heart, Target, ArrowRight, PenTool, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AddictionType } from '@/hooks/useAddictions';

interface AddictionCommitmentProps {
  addictionType: AddictionType;
  onConfirm: (selectedEffects: string[], personalGoal: string) => void;
  onCancel: () => void;
}

const addictionEffects = {
  cigarette: [
    "Dépendance physique et mentale",
    "Risques pour la santé (cancer, maladies cardiaques)",
    "Coût financier élevé",
    "Mauvaise haleine et odeur",
    "Essoufflement et fatigue",
    "Vieillissement prématuré de la peau"
  ],
  alcool: [
    "Dépendance physique et psychologique",
    "Problèmes de foie et de santé",
    "Mauvaises décisions sous influence",
    "Coût financier important",
    "Problèmes relationnels",
    "Baisse des performances physiques et mentales"
  ],
  pornographie: [
    "Dépendance comportementale",
    "Vision déformée des relations intimes",
    "Problèmes de concentration",
    "Culpabilité et honte",
    "Isolation sociale",
    "Problèmes d'estime de soi"
  ],
  procrastination: [
    "Stress et anxiété constants",
    "Baisse de productivité",
    "Objectifs non atteints",
    "Culpabilité et frustration",
    "Perte d'opportunités",
    "Problèmes de confiance en soi"
  ],
  'réseaux sociaux': [
    "Perte de temps précieux",
    "Comparaison sociale constante",
    "Addiction au scroll infini",
    "Baisse de concentration",
    "Problèmes de sommeil",
    "Déconnexion de la réalité"
  ],
  jeux: [
    "Perte de temps excessive",
    "Négligence des responsabilités",
    "Problèmes de sommeil",
    "Isolation sociale",
    "Dépenses excessives",
    "Baisse des performances scolaires/professionnelles"
  ],
  sucre: [
    "Prise de poids",
    "Problèmes dentaires",
    "Risque de diabète",
    "Variations d'humeur",
    "Dépendance physique",
    "Baisse d'énergie"
  ],
  'fast-food': [
    "Prise de poids",
    "Problèmes de santé",
    "Coût financier",
    "Baisse d'énergie",
    "Mauvaises habitudes alimentaires",
    "Culpabilité après consommation"
  ]
};

export const AddictionCommitment: React.FC<AddictionCommitmentProps> = ({
  addictionType,
  onConfirm,
  onCancel
}) => {
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [personalGoal, setPersonalGoal] = useState('');
  const [step, setStep] = useState(1);
  const [signature, setSignature] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const effects = addictionEffects[addictionType.name.toLowerCase() as keyof typeof addictionEffects] || [
    "Impact sur la santé physique",
    "Impact sur le bien-être mental",
    "Coût financier",
    "Perte de temps",
    "Impact sur les relations"
  ];

  const toggleEffect = (effect: string) => {
    setSelectedEffects(prev => 
      prev.includes(effect) 
        ? prev.filter(e => e !== effect)
        : [...prev, effect]
    );
  };

  const handleNext = () => {
    if (selectedEffects.length > 0) {
      setStep(2);
    }
  };

  const handleConfirm = () => {
    if (personalGoal.trim() && selectedEffects.length > 0 && signature) {
      onConfirm(selectedEffects, personalGoal.trim());
    }
  };

  useEffect(() => {
    if (step === 2 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctxRef.current = ctx;
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [step]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = ('touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX) * scaleX;
    const y = ('touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = ('touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX) * scaleX;
    const y = ('touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY) * scaleY;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Save signature
    setSignature(canvas.toDataURL());
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-24 bg-background/80 backdrop-blur-lg">
      <div className="journey-card-premium max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8 pt-4">
          <div 
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: addictionType.color + '20', color: addictionType.color }}
          >
            {addictionType.icon}
          </div>
          
          <h1 className="text-3xl font-bold text-gradient-primary mb-3">
            Engagement de Liberté
          </h1>
          
          <p className="text-muted-foreground leading-relaxed">
            Prenons un moment pour clarifier pourquoi vous voulez arrêter <span className="text-primary font-semibold">{addictionType.name}</span>
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" />
                Quels effets négatifs ressentez-vous actuellement ?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Sélectionnez tous les effets que vous reconnaissez dans votre vie :
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {effects.map((effect, index) => (
                  <button
                    key={index}
                    onClick={() => toggleEffect(effect)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      selectedEffects.includes(effect)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{effect}</span>
                      {selectedEffects.includes(effect) && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                onClick={onCancel}
                variant="outline"
                className="px-8"
              >
                Annuler
              </Button>
              <Button
                onClick={handleNext}
                disabled={selectedEffects.length === 0}
                className="journey-button-primary px-8"
              >
                Continuer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-primary" />
                Que voulez-vous retrouver dans votre vie ?
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Décrivez ce que vous aimeriez accomplir ou ressentir en vous libérant de cette addiction :
              </p>
              
              <Textarea
                value={personalGoal}
                onChange={(e) => setPersonalGoal(e.target.value)}
                placeholder="Par exemple: Retrouver ma confiance en moi, avoir plus de temps pour mes proches, améliorer ma santé, me sentir libre et en contrôle de ma vie..."
                className="min-h-[120px] resize-none mb-6"
              />

              <div className="journey-card bg-primary/5 border-primary/20 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-primary flex items-center">
                    <PenTool className="w-4 h-4 mr-2" />
                    Signez votre engagement
                  </h3>
                  <Button
                    onClick={clearSignature}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Effacer
                  </Button>
                </div>
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 bg-white mb-4">
                  <canvas
                    ref={canvasRef}
                    width={350}
                    height={150}
                    className="border border-gray-200 rounded w-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ touchAction: 'none' }}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Dessinez votre signature dans la zone ci-dessus
                  </p>
                </div>
              </div>
            </div>

            <div className="journey-card bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2 text-primary">Récapitulatif de votre engagement :</h3>
              <p className="text-sm text-muted-foreground mb-3">
                "Je, soussigné(e), m'engage solennellement à arrêter <strong>{addictionType.name}</strong> car je reconnais que cela me cause :"
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-3">
                {selectedEffects.map((effect, index) => (
                  <li key={index}>{effect}</li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mb-3">
                "Et je veux retrouver : <strong>{personalGoal || '...'}</strong>"
              </p>
              <p className="text-xs text-muted-foreground italic">
                En signant, je m'engage à respecter cet engagement et à utiliser tous les outils à ma disposition pour réussir.
              </p>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="px-8"
              >
                Retour
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!personalGoal.trim() || !signature}
                className="journey-button-primary px-8"
              >
                <Heart className="w-4 h-4 mr-2" />
                Confirmer l'engagement
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};