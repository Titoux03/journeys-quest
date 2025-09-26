import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useAddictions } from '@/hooks/useAddictions';
import { usePremium } from '@/hooks/usePremium';
import { usePremiumPreview } from '@/contexts/PremiumPreviewContext';
import vitruvianMan from '@/assets/vitruvian-man.png';

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
  const { isPreviewMode } = usePremiumPreview();

  const calculateSkillScores = () => {
    if (entries.length === 0) {
      return [
        { skill: 'Mental', score: 0, maxScore: 10, color: '#3b82f6', fillColor: 'hsl(var(--skill-mental) / 0.2)' },
        { skill: 'Physique', score: 0, maxScore: 10, color: '#10b981', fillColor: 'hsl(var(--skill-physique) / 0.2)' },
        { skill: 'Régularité', score: 0, maxScore: 10, color: '#f59e0b', fillColor: 'hsl(var(--skill-regularite) / 0.2)' },
        { skill: 'Réalisation', score: 0, maxScore: 10, color: '#8b5cf6', fillColor: 'hsl(var(--skill-realisation) / 0.2)' },
        { skill: 'Force âme', score: 0, maxScore: 10, color: '#ef4444', fillColor: 'hsl(var(--skill-ame) / 0.15)' }
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
      { skill: 'Mental', score: Math.round(mentalHealthScore * 10) / 10, maxScore: 10, color: '#3b82f6', fillColor: 'hsl(var(--skill-mental) / 0.2)' },
      { skill: 'Physique', score: Math.round(physicalScore * 10) / 10, maxScore: 10, color: '#10b981', fillColor: 'hsl(var(--skill-physique) / 0.2)' },
      { skill: 'Régularité', score: Math.round(regularityScore * 10) / 10, maxScore: 10, color: '#f59e0b', fillColor: 'hsl(var(--skill-regularite) / 0.2)' },
      { skill: 'Réalisation', score: Math.round(realizationScore * 10) / 10, maxScore: 10, color: '#8b5cf6', fillColor: 'hsl(var(--skill-realisation) / 0.2)' },
      { skill: 'Force âme', score: Math.round(soulStrengthScore * 10) / 10, maxScore: 10, color: '#ef4444', fillColor: 'hsl(var(--skill-ame) / 0.15)' }
    ];
  };

  const skillData = calculateSkillScores();
  const averageScore = skillData.reduce((sum, skill) => sum + skill.score, 0) / skillData.length;

  return (
    <div className="relative">
      {/* Graphique radar */}
      <div className="relative z-10 h-[300px] sm:h-[400px] md:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={skillData} margin={{ 
            top: window.innerWidth < 640 ? 60 : window.innerWidth < 768 ? 70 : 80, 
            right: window.innerWidth < 640 ? 50 : window.innerWidth < 768 ? 60 : 100, 
            bottom: window.innerWidth < 640 ? 60 : window.innerWidth < 768 ? 70 : 80, 
            left: window.innerWidth < 640 ? 50 : window.innerWidth < 768 ? 60 : 100 
          }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <PolarGrid 
              stroke="#ffffff" 
              strokeWidth={2}
              strokeOpacity={0.8}
              radialLines={true}
            />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={({ x, y, textAnchor, value, index }) => {
                const skill = skillData[index];
                const fontSize = window.innerWidth < 640 ? 12 : window.innerWidth < 768 ? 14 : 16;
                return (
                  <text 
                    x={x} 
                    y={y} 
                    textAnchor={textAnchor} 
                    fontSize={fontSize}
                    fontWeight="600"
                    fill={skill?.color || '#ffffff'}
                  >
                    {value}
                  </text>
                );
              }}
              className="text-xs sm:text-sm md:text-base font-semibold"
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 10]} 
              tick={false}
              axisLine={false}
              tickCount={11}
            />
            
            {/* Zones remplies avec effet de superposition - couleurs plus vives */}
            <Radar
              name="Zone principale"
              dataKey="score"
              stroke="#ffffff"
              strokeWidth={3}
              fill="hsl(var(--primary) / 0.25)"
              fillOpacity={0.6}
            />
            
            <Radar
              name="Zone secondaire"
              dataKey="score"
              stroke="#ffffff"
              strokeWidth={2}
              fill="hsl(var(--accent) / 0.3)"
              fillOpacity={0.4}
            />
            
            <Radar
              name="Zone tertiaire"
              dataKey="score"
              stroke="#ffffff"
              strokeWidth={2}
              fill="hsl(var(--secondary) / 0.35)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score moyen */}
      {!isPreviewMode && (
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
          <div className="mt-6 grid grid-cols-5 gap-1 text-xs">
            {skillData.map((skill, index) => (
              <div key={index} className="flex flex-col items-center px-1">
                <div 
                  className="w-3 h-3 rounded-full mb-1" 
                  style={{ backgroundColor: skill.color }}
                ></div>
                <span className="text-muted-foreground text-center leading-none text-[10px] sm:text-[11px] font-medium">
                  {skill.skill}
                </span>
                <span className="text-primary font-semibold text-[11px] sm:text-xs mt-0.5">
                  {skill.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};