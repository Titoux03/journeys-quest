import React, { useState } from 'react';
import { Send, Lightbulb, Heart, Smile } from 'lucide-react';

interface ReflectionScreenProps {
  mood: 'low' | 'medium' | 'high';
  totalScore: number;
  onComplete: (reflection: string) => void;
  freeWriting?: boolean;
}

export const ReflectionScreen: React.FC<ReflectionScreenProps> = ({
  mood,
  totalScore,
  onComplete,
  freeWriting = false
}) => {
  const [reflection, setReflection] = useState('');

  const lowScoreQuestions = [
    "Qu'est-ce que j'ai fait dont je suis fier aujourd'hui, même si c'était petit ?",
    "Qu'est-ce que j'ai appris sur moi-même aujourd'hui ?",
    "Quel moment de la journée m'a fait sourire, même brièvement ?",
    "Comment puis-je me montrer bienveillant envers moi-même ce soir ?",
    "Quelle petite action positive puis-je faire demain ?"
  ];

  const highScoreQuestions = [
    "🌟 Qu'est-ce qui vous rend le plus fier de cette excellente journée ?",
    "🚀 Comment pouvez-vous maintenir cette énergie positive demain ?",
    "✨ Quel moment de la journée vous a procuré le plus de satisfaction ?",
    "💪 Quelle nouvelle habitude positive pourriez-vous adopter après cette réussite ?",
    "🎯 Comment cette belle journée vous rapproche-t-elle de vos objectifs ?",
    "🌈 Que souhaitez-vous partager ou transmettre suite à cette expérience positive ?",
    "🔥 Quelle est la prochaine étape pour dépasser encore vos attentes ?"
  ];

  const getPromptContent = () => {
    if (mood === 'low') {
      return {
        title: "Moment de réflexion bienveillante 💙",
        subtitle: "Les jours difficiles nous apprennent aussi quelque chose",
        icon: Heart,
        questions: lowScoreQuestions,
        placeholder: "Prenez le temps de réfléchir avec bienveillance...",
        buttonText: "Terminer ma réflexion"
      };
    } else {
      // Pour les scores élevés, sélectionner 3 questions aléatoires
      const randomQuestions = mood === 'high' 
        ? highScoreQuestions.sort(() => 0.5 - Math.random()).slice(0, 3)
        : [];
        
      return {
        title: mood === 'high' ? "Capturez vos moments heureux ✨" : "Partagez votre journée 😊",
        subtitle: mood === 'high' 
          ? "Une belle journée mérite d'être immortalisée !" 
          : "Racontez-nous ce qui a rendu cette journée spéciale",
        icon: mood === 'high' ? Smile : Lightbulb,
        questions: randomQuestions,
        placeholder: mood === 'high'
          ? "Décrivez vos moments de bonheur, vos réussites, ce qui vous a rendu fier..."
          : "Partagez vos pensées, vos découvertes, vos petites victoires du jour...",
        buttonText: "Sauvegarder mon histoire"
      };
    }
  };

  const content = getPromptContent();
  const IconComponent = content.icon;

  const handleSubmit = () => {
    if (reflection.trim()) {
      onComplete(reflection);
    }
  };

  const handleQuestionClick = (question: string) => {
    if (reflection) {
      setReflection(reflection + '\n\n' + question + '\n');
    } else {
      setReflection(question + '\n');
    }
  };

  return (
    <div className="min-h-screen p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="floating-element inline-block mb-4">
            <IconComponent className="w-12 h-12 text-accent mx-auto" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient-primary mb-2">
            {freeWriting ? "Vos notes du jour ✍️" : content.title}
          </h1>
          <p className="text-muted-foreground">
            {freeWriting ? "Écrivez librement vos pensées et réflexions" : content.subtitle}
          </p>
        </div>

        {/* Score display - masqué en écriture libre */}
        {!freeWriting && (
          <div className="journey-card mb-6 text-center animate-scale-in">
            <p className="text-sm text-muted-foreground mb-2">Votre score du jour</p>
            <div className={`score-indicator mx-auto ${
              mood === 'high' ? 'score-high' : 
              mood === 'medium' ? 'score-medium' : 'score-low'
            }`}>
              {totalScore.toFixed(1)}
            </div>
          </div>
        )}

        {/* Questions de réflexion - masquées en écriture libre */}
        {!freeWriting && content.questions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 text-card-foreground">
              Questions pour vous accompagner :
            </h3>
            <div className="space-y-3">
              {content.questions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(question)}
                  className="w-full journey-card hover:journey-card-glow transition-all duration-300 p-4 text-left animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-card-foreground">{question}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Zone d'écriture */}
        <div className="journey-card mb-6 animate-scale-in">
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder={freeWriting ? "Écrivez vos pensées, vos émotions, vos découvertes du jour..." : content.placeholder}
            className="w-full h-64 p-0 border-0 bg-transparent resize-none focus:outline-none text-card-foreground placeholder-muted-foreground"
            style={{ fontSize: '16px', lineHeight: '1.6' }}
          />
        </div>

        {/* Encouragement - adapté pour l'écriture libre */}
        <div className="journey-card mb-6 bg-accent/10 border-accent/20 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">
                {freeWriting 
                  ? "L'écriture libère l'esprit"
                  : (mood === 'low' 
                    ? "Chaque jour est un nouveau départ"
                    : "Votre parcours inspire !"
                  )
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {freeWriting
                  ? "Exprimez-vous sans contrainte, chaque mot compte"
                  : (mood === 'low'
                    ? "Soyez fier de prendre ce moment pour vous"
                    : "Continuez à cultiver ces beaux moments"
                  )
                }
              </p>
            </div>
          </div>
        </div>

        {/* Bouton de validation */}
        <button
          onClick={handleSubmit}
          disabled={!reflection.trim()}
          className={`w-full py-4 text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
            reflection.trim()
              ? 'journey-button-primary pulse-glow' 
              : 'bg-muted text-muted-foreground cursor-not-allowed rounded-2xl px-6 py-3'
          }`}
        >
          <Send className="w-6 h-6" />
          {freeWriting ? "Sauvegarder mes notes" : content.buttonText}
        </button>
      </div>
    </div>
  );
};