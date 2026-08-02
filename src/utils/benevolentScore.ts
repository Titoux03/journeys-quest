/**
 * Scoring BIENVEILLANT.
 * Principe (Antoine #9 équanimité + The Slight Edge) : on ne juge JAMAIS une journée.
 * La trajectoire compte, pas le jour. Même une journée basse fait ressortir ses "lumières"
 * (ce qui a tenu), et l'app valorise le simple fait de s'être posé pour faire le point.
 * → Zéro score rouge, zéro verdict. On éclaire ce qui va, on ménage le reste.
 */

export interface Light {
  key: string;
  label: string;
  value: number;
}

export type SoulTone = 'radiant' | 'steady' | 'tender';

export interface BenevolentSummary {
  tone: SoulTone;
  average: number;
  lights: Light[];
  allLow: boolean;
  headline: string;
  reframe: string;
  lightsTitle: string;
}

export function getBenevolentSummary(
  scores: Record<string, number>,
  labels: Record<string, string> = {}
): BenevolentSummary {
  const entries = Object.entries(scores);
  const average = entries.length
    ? entries.reduce((sum, [, v]) => sum + v, 0) / entries.length
    : 0;

  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const lights: Light[] = sorted
    .slice(0, 3)
    .map(([key, value]) => ({ key, label: labels[key] || key, value }));
  const allLow = sorted.length > 0 && sorted.every(([, v]) => v <= 3);

  let tone: SoulTone;
  let headline: string;
  let reframe: string;

  if (average >= 7) {
    tone = 'radiant';
    headline = 'Journée lumineuse';
    reframe = "Ton âme rayonne aujourd'hui. Savoure ce moment — c'est toi qui l'as construit.";
  } else if (average >= 4.5) {
    tone = 'steady';
    headline = 'Journée traversée';
    reframe = "Ni sommet ni gouffre, et c'est très bien comme ça. Tu avances, un jour après l'autre.";
  } else {
    tone = 'tender';
    headline = 'Journée à ménager';
    reframe = allLow
      ? "Journée rude. Mais tu es là, tu fais le point — et ça, personne ne peut te l'enlever. Une journée basse ne casse pas ta trajectoire."
      : "Basse dans l'ensemble, mais regarde ce qui a tenu debout : ce sont tes lumières. Demain repart de zéro.";
  }

  const lightsTitle = allLow ? 'Ce qui a tenu aujourd\'hui' : 'Tes lumières du jour';

  return { tone, average, lights, allLow, headline, reframe, lightsTitle };
}

/** Message de la boucle perso↔journal : le simple fait de faire le point nourrit l'âme. */
export function getSoulGrowthMessage(tone: SoulTone): string {
  switch (tone) {
    case 'radiant':
      return 'Ton âme grandit et rayonne. ✨';
    case 'steady':
      return "Ton âme grandit — la régularité, c'est elle qui forge.";
    case 'tender':
      return "Tu t'es posé un instant pour toi. Ton âme grandit quand même. 🌙";
  }
}
