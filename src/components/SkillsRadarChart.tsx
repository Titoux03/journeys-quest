import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useAddictions } from '@/hooks/useAddictions';
import { usePremium } from '@/hooks/usePremium';

interface JournalEntry {
  date: string;
  scores: Record<string, number>;
  totalScore: number;
  mood: 'low' | 'medium' | 'high';
}

interface SkillsRadarChartProps {
  entries: JournalEntry[];
}

export const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({ entries }) => {
  const { userAddictions } = useAddictions();
  const { isPremium } = usePremium();

  const calculateSkillScores = () => {
    if (entries.length === 0) {
      return [
        { skill: 'Mental', score: 0, maxScore: 10, color: '#22c55e', fillColor: 'rgba(34, 197, 94, 0.15)' },
        { skill: 'Physique', score: 0, maxScore: 10, color: '#3b82f6', fillColor: 'rgba(59, 130, 246, 0.15)' },
        { skill: 'Régularité', score: 0, maxScore: 10, color: '#8b5cf6', fillColor: 'rgba(139, 92, 246, 0.15)' },
        { skill: 'Réalisation', score: 0, maxScore: 10, color: '#f59e0b', fillColor: 'rgba(245, 158, 11, 0.15)' },
        { skill: 'Force âme', score: 0, maxScore: 10, color: '#ffffff', fillColor: 'rgba(255, 255, 255, 0.15)' }
      ];
    }

    // Calculer les moyennes des dernières 7 entrées
    const recentEntries = entries.slice(0, 7);
    const totalDays = recentEntries.length;

    // Santé mentale : basée sur méditation, bien-être, vie sociale
    const mentalHealthScore = recentEntries.reduce((sum, entry) => {
      const meditation = entry.scores.meditation || 0;
      const wellbeing = entry.scores.wellbeing || entry.scores['bien-être'] || 0;
      const social = entry.scores.social || 0;
      return sum + (meditation + wellbeing + social) / 3;
    }, 0) / totalDays;

    // Physique : basée sur sport et énergie générale
    const physicalScore = recentEntries.reduce((sum, entry) => {
      const sport = entry.scores.sport || 0;
      const wellbeing = entry.scores.wellbeing || entry.scores['bien-être'] || 0;
      return sum + (sport + wellbeing) / 2;
    }, 0) / totalDays;

    // Régularité : basée sur la fréquence des entrées et les streaks d'addiction
    const regularityScore = (() => {
      const entryFrequency = Math.min(totalDays / 7 * 10, 10); // Max 10 si 7 jours complets
      const addictionBonus = userAddictions.reduce((acc, addiction) => {
        return acc + Math.min(addiction.current_streak * 0.2, 3); // Bonus pour les streaks
      }, 0);
      return Math.min(entryFrequency + addictionBonus, 10);
    })();

    // Réalisation : basée sur apprentissage, travail, objectifs
    const realizationScore = recentEntries.reduce((sum, entry) => {
      const learning = entry.scores.learning || entry.scores.apprentissage || 0;
      const work = entry.scores.work || entry.scores.travail || 0;
      const creativity = entry.scores.creativity || entry.scores.créativité || 0;
      const scores = [learning, work, creativity].filter(s => s > 0);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : entry.totalScore;
      return sum + avg;
    }, 0) / totalDays;

    // Force de l'âme : basée sur la résistance aux addictions et le bien-être émotionnel
    const soulStrengthScore = (() => {
      const addictionStrength = userAddictions.length > 0 
        ? userAddictions.reduce((acc, addiction) => acc + Math.min(addiction.current_streak * 0.3, 4), 0) / userAddictions.length
        : 5;
      
      const emotionalScore = recentEntries.reduce((sum, entry) => {
        const family = entry.scores.family || entry.scores.famille || 0;
        const love = entry.scores.love || entry.scores.amour || 0;
        const wellbeing = entry.scores.wellbeing || entry.scores['bien-être'] || 0;
        return sum + (family + love + wellbeing) / 3;
      }, 0) / totalDays;

      return Math.min((addictionStrength + emotionalScore) / 2, 10);
    })();

    return [
      { skill: 'Mental', score: Math.round(mentalHealthScore * 10) / 10, maxScore: 10, color: '#22c55e', fillColor: 'rgba(34, 197, 94, 0.15)' },
      { skill: 'Physique', score: Math.round(physicalScore * 10) / 10, maxScore: 10, color: '#3b82f6', fillColor: 'rgba(59, 130, 246, 0.15)' },
      { skill: 'Régularité', score: Math.round(regularityScore * 10) / 10, maxScore: 10, color: '#8b5cf6', fillColor: 'rgba(139, 92, 246, 0.15)' },
      { skill: 'Réalisation', score: Math.round(realizationScore * 10) / 10, maxScore: 10, color: '#f59e0b', fillColor: 'rgba(245, 158, 11, 0.15)' },
      { skill: 'Force âme', score: Math.round(soulStrengthScore * 10) / 10, maxScore: 10, color: '#ffffff', fillColor: 'rgba(255, 255, 255, 0.15)' }
    ];
  };

  const skillData = calculateSkillScores();
  const averageScore = skillData.reduce((sum, skill) => sum + skill.score, 0) / skillData.length;

  return (
    <div className="relative">
      {/* Fond décoratif avec feu follet */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className="relative">
          {/* Corps du feu follet */}
          <div className="w-32 h-40 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-accent/40 to-secondary/50 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-20 bg-gradient-to-t from-primary/50 via-accent/60 to-secondary/70 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-primary/70 via-accent/80 to-secondary/90 rounded-full blur-md animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Particules flottantes */}
          <div className="absolute -top-4 left-4 w-2 h-2 bg-accent rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute -top-2 right-6 w-1 h-1 bg-primary rounded-full animate-bounce opacity-80" style={{ animationDelay: '0.7s' }}></div>
          <div className="absolute top-6 -left-2 w-1.5 h-1.5 bg-secondary rounded-full animate-bounce opacity-70" style={{ animationDelay: '1.2s' }}></div>
          <div className="absolute top-12 right-2 w-1 h-1 bg-accent rounded-full animate-bounce opacity-50" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>

      {/* Graphique radar */}
      <div className="relative z-10 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={skillData} margin={{ top: 50, right: 60, bottom: 50, left: 60 }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <PolarGrid 
              stroke="#ffffff" 
              strokeWidth={2}
              strokeOpacity={0.6}
              radialLines={true}
            />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ 
                fontSize: 13, 
                fill: 'hsl(var(--foreground))',
                fontWeight: 600
              }}
              className="text-sm font-semibold"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 10]} 
              tick={{ fontSize: 12, fill: '#ffffff', fontWeight: 'bold' }}
              axisLine={false}
              tickCount={11}
            />
            
            {/* Une ligne colorée pour chaque compétence */}
            {skillData.map((skill, index) => (
              <Radar
                key={skill.skill}
                name={skill.skill}
                dataKey="score"
                stroke={skill.color}
                strokeWidth={4}
                fill="transparent"
                fillOpacity={0}
                filter="url(#glow)"
                dot={{ 
                  fill: skill.color, 
                  strokeWidth: 4, 
                  stroke: 'hsl(var(--background))',
                  r: 8,
                  filter: 'url(#glow)'
                }}
              />
            ))}
            
            {/* Remplissage global subtil */}
            <Radar
              name="Zone globale"
              dataKey="score"
              stroke="transparent"
              strokeWidth={0}
              fill="hsl(var(--primary) / 0.05)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score moyen */}
      <div className="text-center mt-4">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
          averageScore >= 7 ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white' :
          averageScore >= 4 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
          'bg-gradient-to-br from-red-400 to-rose-600 text-white'
        } shadow-lg`}>
          {averageScore.toFixed(1)}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Score global de développement
        </p>
        
        {/* Légende motivante */}
        <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
          <p className="text-sm font-medium text-primary">
            {averageScore >= 8 && "🌟 Équilibre exceptionnel ! Vous maîtrisez votre développement personnel."}
            {averageScore >= 6 && averageScore < 8 && "💪 Belle progression ! Continuez sur cette voie."}
            {averageScore >= 4 && averageScore < 6 && "🌱 En développement. Chaque jour compte."}
            {averageScore < 4 && "🌅 Un nouveau départ. Chaque petit pas vous rapproche de vos objectifs."}
          </p>
        </div>

        {/* Légende des couleurs */}
        <div className="mt-6 grid grid-cols-5 gap-2 text-xs">
          {skillData.map((skill, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-4 h-4 rounded-full mb-1" 
                style={{ backgroundColor: skill.color }}
              ></div>
              <span className="text-muted-foreground text-center leading-tight">
                {skill.skill}
              </span>
              <span className="text-primary font-semibold">
                {skill.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};