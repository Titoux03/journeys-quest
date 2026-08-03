/**
 * CATALOGUE ÉTENDU — nouveaux emplacements et items pour Le Sanctuaire.
 *
 * Construction : chaque item = une FORME (pixel art) × une ESSENCE (matériau/couleur).
 * Ça donne du volume réel sans dégrader la qualité, et ajouter une essence
 * multiplie le catalogue d'un coup.
 *
 * Grille 12×17. Repères du sprite de base :
 *   lignes 0-3 = tête/cheveux · 4-8 = visage · 9 = cou · 10-13 = torse · 14-16 = jambes
 * Index de palette : 0 = transparent, 1 = teinte principale, 2 = ombre, 3 = éclat.
 */
import { PixelItemOverlay } from './AvatarEngine';

const E = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

interface Shape {
  id: string;
  nameFr: string;
  slot: string;
  baseLevel: number;
  pixels: number[][];
}

interface Essence {
  id: string;
  nameFr: string;
  rarity: string;
  levelOffset: number;
  /** [principale, ombre, éclat] */
  colors: [string, string, string];
}

/* ─────────────────────────  ESSENCES  ───────────────────────── */

const METAL_ESSENCES: Essence[] = [
  { id: 'fer', nameFr: 'de Fer', rarity: 'common', levelOffset: 0, colors: ['#9AA3AD', '#666E77', '#C9D1D9'] },
  { id: 'bronze', nameFr: 'de Bronze', rarity: 'uncommon', levelOffset: 6, colors: ['#B87333', '#8A5423', '#DFA45C'] },
  { id: 'argent', nameFr: "d'Argent", rarity: 'rare', levelOffset: 14, colors: ['#D8DEE9', '#A2AAB8', '#FFFFFF'] },
  { id: 'or', nameFr: "d'Or", rarity: 'epic', levelOffset: 26, colors: ['#FFD34D', '#C9A227', '#FFF3B0'] },
  { id: 'obsidienne', nameFr: "d'Obsidienne", rarity: 'legendary', levelOffset: 42, colors: ['#37324A', '#1B1826', '#8B7BF0'] },
];

const WING_ESSENCES: Essence[] = [
  { id: 'plume', nameFr: 'de Plume', rarity: 'uncommon', levelOffset: 0, colors: ['#EDF2F7', '#B8C2CE', '#FFFFFF'] },
  { id: 'ombre', nameFr: "d'Ombre", rarity: 'rare', levelOffset: 10, colors: ['#3B3550', '#221E30', '#6C5CE7'] },
  { id: 'braise', nameFr: 'de Braise', rarity: 'epic', levelOffset: 24, colors: ['#FF7A3D', '#C43E12', '#FFD08A'] },
  { id: 'astre', nameFr: "d'Astre", rarity: 'legendary', levelOffset: 40, colors: ['#8BE9FD', '#2AA9D6', '#FFFFFF'] },
];

/* ─────────────────────────  FORMES — COUVRE-CHEF (slot 'head')  ───────────────────────── */

const HEAD_SHAPES: Shape[] = [
  {
    id: 'couronne', nameFr: 'Couronne', slot: 'head', baseLevel: 8,
    pixels: [
      [0, 0, 3, 0, 3, 0, 0, 3, 0, 3, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0],
    ],
  },
  {
    id: 'capuche', nameFr: 'Capuche', slot: 'head', baseLevel: 4,
    pixels: [
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 0],
      [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
      [0, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 0],
    ],
  },
  {
    id: 'heaume', nameFr: 'Heaume', slot: 'head', baseLevel: 12,
    pixels: [
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 3, 3, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 2, 1, 0, 0, 0, 0, 1, 2, 0, 0],
    ],
  },
  {
    id: 'aureole', nameFr: 'Auréole', slot: 'head', baseLevel: 20,
    pixels: [[0, 0, 0, 3, 1, 1, 1, 1, 3, 0, 0, 0]],
  },
  {
    id: 'bandeau', nameFr: 'Bandeau', slot: 'head', baseLevel: 2,
    pixels: [E, E, E, [0, 0, 1, 1, 3, 1, 1, 3, 1, 1, 0, 0]],
  },
  {
    id: 'chapeau_mage', nameFr: 'Chapeau de Mage', slot: 'head', baseLevel: 16,
    pixels: [
      [0, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    ],
  },
  {
    id: 'cornes', nameFr: 'Cornes', slot: 'head', baseLevel: 18,
    pixels: [
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0],
    ],
  },
  {
    id: 'diademe', nameFr: 'Diadème', slot: 'head', baseLevel: 10,
    pixels: [E, E, [0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0], [0, 0, 2, 1, 1, 3, 3, 1, 1, 2, 0, 0]],
  },
];

/* ─────────────────────────  FORMES — AILES / DOS (slot 'back')  ───────────────────────── */

const BACK_SHAPES: Shape[] = [
  {
    id: 'ailes_ange', nameFr: 'Ailes', slot: 'back', baseLevel: 14,
    pixels: [
      E, E, E, E, E, E, E, E,
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
      [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
    ],
  },
  {
    id: 'ailes_larges', nameFr: 'Grandes Ailes', slot: 'back', baseLevel: 24,
    pixels: [
      E, E, E, E, E, E,
      [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
      [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
    ],
  },
  {
    id: 'ailes_dechirees', nameFr: 'Ailes Déchirées', slot: 'back', baseLevel: 20,
    pixels: [
      E, E, E, E, E, E, E, E,
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
    ],
  },
  {
    id: 'manteau_dos', nameFr: 'Manteau', slot: 'back', baseLevel: 6,
    pixels: [
      E, E, E, E, E, E, E, E, E,
      [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0],
      [0, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 0],
      [0, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0],
      [0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0],
    ],
  },
  {
    id: 'orbes', nameFr: 'Orbes Gardiens', slot: 'back', baseLevel: 30,
    pixels: [
      E, E, E, E,
      [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
      [3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3],
      [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
      E, E, E,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3],
      [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
    ],
  },
];

/* ─────────────────────────  DÉCORS D'ÂME (slot 'background') — uniques  ───────────────────────── */

export const BACKDROP_ITEMS: PixelItemOverlay[] = [
  {
    key: 'background_lune', name: 'Moon', nameFr: 'Lune Veilleuse', slot: 'background',
    rarity: 'uncommon', levelRequired: 9,
    palette: ['', '#FFF1B8AA', '#E8D48866'],
    pixels: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0],
    ],
  },
  {
    key: 'background_etoiles', name: 'Stars', nameFr: 'Voûte Étoilée', slot: 'background',
    rarity: 'common', levelRequired: 5,
    palette: ['', '#FFFFFFAA', '#AFC8FF88'],
    pixels: [
      [1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      E, E, E, E, E, E, E, E, E, E,
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    ],
  },
  {
    key: 'background_aurore', name: 'Aurora', nameFr: 'Aurore', slot: 'background',
    rarity: 'rare', levelRequired: 28,
    palette: ['', '#6CF0C255', '#8B7BF055', '#FF9ED855'],
    pixels: [
      [1, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 1],
      [0, 1, 1, 2, 2, 3, 3, 2, 2, 1, 1, 0],
      [0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0],
    ],
  },
  {
    key: 'background_montagne', name: 'Peaks', nameFr: 'Cimes Lointaines', slot: 'background',
    rarity: 'uncommon', levelRequired: 13,
    palette: ['', '#3C4A6688', '#2A3550AA'],
    pixels: [
      E, E, E, E, E, E, E, E, E, E, E, E, E,
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0],
      [0, 1, 1, 2, 2, 1, 1, 1, 1, 1, 0, 0],
      [1, 1, 2, 2, 2, 2, 1, 1, 2, 1, 1, 0],
    ],
  },
  {
    key: 'background_portail', name: 'Portal', nameFr: "Portail d'Âme", slot: 'background',
    rarity: 'epic', levelRequired: 45,
    palette: ['', '#B07BF088', '#6C5CE788', '#FFD9FF66'],
    pixels: [
      [0, 0, 0, 3, 2, 1, 1, 2, 3, 0, 0, 0],
      [0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0, 0],
      [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
      [0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0, 0],
      [0, 0, 0, 3, 2, 1, 1, 2, 3, 0, 0, 0],
    ],
  },
  {
    key: 'background_pluie', name: 'Starfall', nameFr: "Pluie d'Étoiles", slot: 'background',
    rarity: 'legendary', levelRequired: 60,
    palette: ['', '#FFE9A8AA', '#FFFFFF88'],
    pixels: [
      [0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 2, 0, 1, 0, 0, 2],
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0],
    ],
  },
];

/* ─────────────────────────  FAMILIERS (slot 'pet') — uniques, auto-recadrés  ───────────────────────── */

export const PET_ITEMS: PixelItemOverlay[] = [
  {
    key: 'pet_chat', name: 'Cat', nameFr: 'Chat de Nuit', slot: 'pet',
    rarity: 'uncommon', levelRequired: 7,
    palette: ['', '#4A4458', '#2B2736', '#8BE9FD'],
    pixels: [
      [1, 0, 0, 1, 0],
      [1, 1, 1, 1, 0],
      [3, 1, 1, 3, 0],
      [1, 1, 1, 1, 1],
      [2, 0, 0, 2, 0],
    ],
  },
  {
    key: 'pet_renard', name: 'Fox', nameFr: 'Renard Roux', slot: 'pet',
    rarity: 'uncommon', levelRequired: 11,
    palette: ['', '#E07A3F', '#A34F1E', '#FFF3E0'],
    pixels: [
      [1, 0, 0, 1, 0],
      [1, 1, 1, 1, 0],
      [3, 1, 1, 3, 1],
      [1, 1, 1, 1, 1],
      [2, 0, 0, 2, 2],
    ],
  },
  {
    key: 'pet_corbeau', name: 'Raven', nameFr: 'Corbeau Messager', slot: 'pet',
    rarity: 'rare', levelRequired: 19,
    palette: ['', '#2E2A3B', '#16141F', '#8B7BF0'],
    pixels: [
      [0, 1, 1, 0, 0],
      [1, 1, 1, 1, 0],
      [1, 3, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 2, 0, 2, 0],
    ],
  },
  {
    key: 'pet_loup', name: 'Wolf', nameFr: 'Loup Gardien', slot: 'pet',
    rarity: 'rare', levelRequired: 25,
    palette: ['', '#8A93A3', '#5B6272', '#C9F0FF'],
    pixels: [
      [1, 0, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [3, 1, 1, 3, 1],
      [1, 1, 1, 1, 1],
      [2, 0, 2, 0, 2],
    ],
  },
  {
    key: 'pet_wisp', name: 'Wisp', nameFr: 'Feu Follet', slot: 'pet',
    rarity: 'epic', levelRequired: 33,
    palette: ['', '#7FE7FF', '#2AA9D6', '#FFFFFF'],
    pixels: [
      [0, 3, 0],
      [3, 1, 3],
      [1, 1, 1],
      [0, 2, 0],
    ],
  },
  {
    key: 'pet_dragonnet', name: 'Drakeling', nameFr: 'Dragonnet', slot: 'pet',
    rarity: 'epic', levelRequired: 40,
    palette: ['', '#5FBF6A', '#2F7A3A', '#FFD34D'],
    pixels: [
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
      [3, 1, 1, 1, 3],
      [0, 1, 1, 1, 0],
      [0, 2, 0, 2, 0],
    ],
  },
  {
    key: 'pet_phenix', name: 'Phoenix', nameFr: 'Phénix Naissant', slot: 'pet',
    rarity: 'legendary', levelRequired: 52,
    palette: ['', '#FF9A3D', '#C43E12', '#FFE08A'],
    pixels: [
      [0, 3, 0, 3, 0],
      [3, 1, 1, 1, 3],
      [1, 1, 3, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 2, 0, 2, 0],
    ],
  },
  {
    key: 'pet_esprit', name: 'Spirit', nameFr: 'Esprit Ancestral', slot: 'pet',
    rarity: 'mythic', levelRequired: 75,
    palette: ['', '#D8B4FE', '#8B5CF6', '#FFFFFF'],
    pixels: [
      [0, 3, 3, 0],
      [3, 1, 1, 3],
      [1, 3, 3, 1],
      [1, 1, 1, 1],
      [0, 2, 2, 0],
    ],
  },
];

/* ─────────────────────────  GÉNÉRATION forme × essence  ───────────────────────── */

function buildFromShapes(shapes: Shape[], essences: Essence[]): PixelItemOverlay[] {
  const out: PixelItemOverlay[] = [];
  for (const shape of shapes) {
    for (const essence of essences) {
      out.push({
        key: `${shape.id}_${essence.id}`,
        name: `${shape.id} ${essence.id}`,
        nameFr: `${shape.nameFr} ${essence.nameFr}`,
        slot: shape.slot,
        rarity: essence.rarity,
        levelRequired: shape.baseLevel + essence.levelOffset,
        palette: ['', ...essence.colors],
        pixels: shape.pixels,
      });
    }
  }
  return out;
}

export const HEAD_ITEMS = buildFromShapes(HEAD_SHAPES, METAL_ESSENCES);
export const BACK_ITEMS = buildFromShapes(BACK_SHAPES, WING_ESSENCES);

/** Tous les nouveaux items du catalogue étendu. */
export const EXTENDED_ITEMS: PixelItemOverlay[] = [
  ...HEAD_ITEMS,
  ...BACK_ITEMS,
  ...BACKDROP_ITEMS,
  ...PET_ITEMS,
];

/** Métadonnées des nouveaux emplacements (même forme que SLOT_META pour l'UI). */
export const EXTENDED_SLOTS = [
  {
    id: 'head', label: 'Couvre-chef',
    iconPalette: ['', '#FFD34D', '#C9A227'],
    iconPixels: [[1, 0, 1, 0, 1], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2]],
  },
  {
    id: 'back', label: 'Dos',
    iconPalette: ['', '#EDF2F7', '#B8C2CE'],
    iconPixels: [[1, 0, 0, 0, 1], [1, 1, 0, 1, 1], [2, 0, 0, 0, 2]],
  },
  {
    id: 'background', label: "Décor d'âme",
    iconPalette: ['', '#FFF1B8', '#8B7BF0'],
    iconPixels: [[1, 0, 2, 0, 1], [0, 0, 0, 0, 0], [2, 0, 1, 0, 2]],
  },
  {
    id: 'pet', label: 'Familier',
    iconPalette: ['', '#5FBF6A', '#2F7A3A'],
    iconPixels: [[1, 0, 0, 1, 0], [1, 1, 1, 1, 0], [2, 0, 0, 2, 0]],
  },
];
