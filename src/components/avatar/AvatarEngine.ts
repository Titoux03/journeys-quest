/**
 * AvatarEngine - Pure pixel art sprite data and color system
 * All sprites are 12x17 on a shared palette system
 * No emojis anywhere - 100% pixel art
 */

export type AvatarGender = 'male' | 'female';

// Color indices in sprites:
// 0 = transparent
// 1 = skin
// 2 = skin shadow
// 3 = clothing primary
// 4 = clothing shadow / shoes
// 5 = eye color
// 6 = hair color
// 7 = hair shadow
// 8 = accent/detail
// 9 = highlight

export interface AvatarColors {
  skin: string;
  skinShadow: string;
  eyes: string;
  clothing: string;
  clothingShadow: string;
  shoes: string;
  hair: string;
  hairShadow: string;
}

export interface AvatarConfig {
  gender: AvatarGender;
  skinIndex: number;
  eyeIndex: number;
  clothingIndex: number;
  shoesIndex: number;
  hairIndex: number;
  hairStyleIndex: number;
}

// ── Color Palettes ─────────────────────────────────────────

export const SKIN_PALETTES = [
  { main: '#FDDCB5', shadow: '#E8BA8A', label: 'Porcelaine' },
  { main: '#F5D0B0', shadow: '#D9A878', label: 'Ivoire' },
  { main: '#F5C8A0', shadow: '#D9A070', label: 'Pêche' },
  { main: '#E8B890', shadow: '#CC9668', label: 'Sable' },
  { main: '#D4A984', shadow: '#B88A66', label: 'Doré' },
  { main: '#C8A882', shadow: '#A68060', label: 'Hâlé' },
  { main: '#B89070', shadow: '#967050', label: 'Caramel' },
  { main: '#A67B5B', shadow: '#8B6040', label: 'Bronze' },
  { main: '#8D5524', shadow: '#6B3F1A', label: 'Brun' },
  { main: '#7A4820', shadow: '#5A3010', label: 'Acajou' },
  { main: '#6B4423', shadow: '#4A2E15', label: 'Ébène' },
  { main: '#4A3020', shadow: '#2E1D12', label: 'Nuit' },
];

export const EYE_PALETTES = [
  { color: '#4A90D9', label: 'Bleu', rarity: 'common' },
  { color: '#5FAA55', label: 'Vert', rarity: 'common' },
  { color: '#8B6914', label: 'Noisette', rarity: 'common' },
  { color: '#4A3520', label: 'Marron', rarity: 'common' },
  { color: '#2A2A2A', label: 'Noir', rarity: 'common' },
  { color: '#7B7B7B', label: 'Gris', rarity: 'common' },
  { color: '#6B8E23', label: 'Olive', rarity: 'common' },
  { color: '#8B4513', label: 'Ambre', rarity: 'common' },
  { color: '#00BBCC', label: 'Turquoise', rarity: 'uncommon' },
  { color: '#9B59B6', label: 'Violet', rarity: 'rare', levelRequired: 20 },
  { color: '#FFD700', label: 'Or', rarity: 'epic', levelRequired: 50 },
  { color: '#FF4444', label: 'Rubis', rarity: 'legendary', levelRequired: 75 },
];

export const CLOTHING_PALETTES = [
  { main: '#3B5998', shadow: '#2C4270', label: 'Bleu' },
  { main: '#C25B78', shadow: '#9B3A58', label: 'Rose' },
  { main: '#4A8A4A', shadow: '#2E6E2E', label: 'Vert' },
  { main: '#8B4513', shadow: '#6B2F0A', label: 'Brun' },
  { main: '#6A3A8A', shadow: '#4A1A6E', label: 'Violet' },
  { main: '#CC3333', shadow: '#991111', label: 'Rouge' },
  { main: '#2A2A2A', shadow: '#1A1A1A', label: 'Noir' },
  { main: '#D4AF37', shadow: '#B8930A', label: 'Or' },
  { main: '#E8E8E8', shadow: '#BBBBBB', label: 'Blanc' },
  { main: '#FF8C00', shadow: '#CC6600', label: 'Orange' },
  { main: '#20B2AA', shadow: '#188880', label: 'Turquoise' },
  { main: '#708090', shadow: '#4A5A6A', label: 'Ardoise' },
  { main: '#DC143C', shadow: '#A01030', label: 'Cramoisi' },
  { main: '#556B2F', shadow: '#3A4A1F', label: 'Kaki' },
  { main: '#4169E1', shadow: '#2A4AB0', label: 'Royal' },
  { main: '#FF69B4', shadow: '#CC4488', label: 'Fuchsia' },
  { main: '#40E0D0', shadow: '#20B0A0', label: 'Cyan' },
  { main: '#B22222', shadow: '#8B1A1A', label: 'Bordeaux' },
  { main: '#9370DB', shadow: '#7050B0', label: 'Lavande' },
  { main: '#2F4F4F', shadow: '#1A3030', label: 'Forêt' },
  { main: '#FFD700', shadow: '#CCA800', label: 'Doré', levelRequired: 30 },
  { main: '#C0C0C0', shadow: '#808080', label: 'Argent', levelRequired: 15 },
  { main: '#E0115F', shadow: '#B00040', label: 'Rubis', levelRequired: 60 },
  { main: '#00CED1', shadow: '#009090', label: 'Cristal', levelRequired: 80 },
];

export const SHOES_PALETTES = [
  { main: '#4A3520', shadow: '#2E1D12', label: 'Cuir' },
  { main: '#2A2A2A', shadow: '#1A1A1A', label: 'Noir' },
  { main: '#8B4513', shadow: '#6B2F0A', label: 'Brun' },
  { main: '#CC3333', shadow: '#991111', label: 'Rouge' },
  { main: '#3B5998', shadow: '#2C4270', label: 'Bleu' },
  { main: '#E8E8E8', shadow: '#BBBBBB', label: 'Blanc' },
  { main: '#4A8A4A', shadow: '#2E6E2E', label: 'Vert' },
  { main: '#FF8C00', shadow: '#CC6600', label: 'Orange' },
  { main: '#6A3A8A', shadow: '#4A1A6E', label: 'Violet' },
  { main: '#C25B78', shadow: '#9B3A58', label: 'Rose' },
  { main: '#FFD700', shadow: '#CCA800', label: 'Or', levelRequired: 40 },
  { main: '#333333', shadow: '#111111', label: 'Obsidienne', levelRequired: 70 },
];

export const HAIR_PALETTES = [
  { main: '#2A1A0E', shadow: '#1A0D05', label: 'Brun foncé' },
  { main: '#5A3A1E', shadow: '#3A2210', label: 'Châtain' },
  { main: '#D4A030', shadow: '#B88010', label: 'Blond' },
  { main: '#CC4422', shadow: '#992211', label: 'Roux' },
  { main: '#1A1A1A', shadow: '#0A0A0A', label: 'Noir' },
  { main: '#8A8A8A', shadow: '#5A5A5A', label: 'Gris' },
  { main: '#E0C090', shadow: '#C0A060', label: 'Platine' },
  { main: '#6030A0', shadow: '#401880', label: 'Violet' },
  { main: '#2877A8', shadow: '#1D5A7E', label: 'Bleu' },
  { main: '#CC3366', shadow: '#991144', label: 'Rose' },
  { main: '#00AA88', shadow: '#008060', label: 'Émeraude', levelRequired: 25 },
  { main: '#FF4500', shadow: '#CC2200', label: 'Flamme', levelRequired: 50 },
];

export function getAvatarColors(config: AvatarConfig): AvatarColors {
  const skin = SKIN_PALETTES[config.skinIndex] || SKIN_PALETTES[0];
  const eye = EYE_PALETTES[config.eyeIndex] || EYE_PALETTES[0];
  const clothing = CLOTHING_PALETTES[config.clothingIndex] || CLOTHING_PALETTES[0];
  const shoes = SHOES_PALETTES[config.shoesIndex] || SHOES_PALETTES[0];
  const hair = HAIR_PALETTES[config.hairIndex] || HAIR_PALETTES[0];

  return {
    skin: skin.main,
    skinShadow: skin.shadow,
    eyes: eye.color,
    clothing: clothing.main,
    clothingShadow: clothing.shadow,
    shoes: shoes.main,
    hair: hair.main,
    hairShadow: hair.shadow,
  };
}

// ── Base Sprites ─────────────────────────────────────────
// Color indices: 0=transparent, 1=skin, 2=skinShadow, 3=clothing, 4=shoes,
//                5=eyes, 6=hair, 7=hairShadow, 8=accent, 9=white/highlight

const MALE_BASE: number[][] = [
  [0,0,0,0,6,6,6,6,0,0,0,0],
  [0,0,0,6,6,6,6,6,6,0,0,0],
  [0,0,6,6,6,6,6,6,6,6,0,0],
  [0,0,7,6,6,6,6,6,6,7,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,5,2,1,1,2,5,1,0,0],
  [0,0,1,1,1,2,2,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,2,1,1,2,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,3,3,3,3,3,3,3,3,0,0],
  [0,3,3,3,3,3,3,3,3,3,3,0],
  [0,3,3,3,8,3,3,8,3,3,3,0],
  [0,3,3,3,8,3,3,8,3,3,3,0],
  [0,0,3,3,3,3,3,3,3,3,0,0],
  [0,0,0,1,1,0,0,1,1,0,0,0],
  [0,0,0,4,4,0,0,4,4,0,0,0],
];

const FEMALE_BASE: number[][] = [
  [0,0,0,6,6,6,6,6,6,0,0,0],
  [0,0,6,6,6,6,6,6,6,6,0,0],
  [0,6,6,6,6,6,6,6,6,6,6,0],
  [0,7,6,6,6,6,6,6,6,6,7,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,5,2,1,1,2,5,1,0,0],
  [0,0,1,1,1,2,2,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,2,1,1,2,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,3,3,3,3,3,3,3,3,0,0],
  [0,3,3,3,3,3,3,3,3,3,3,0],
  [0,3,3,3,3,3,3,3,3,3,3,0],
  [0,0,3,3,3,3,3,3,3,3,0,0],
  [0,0,0,3,3,3,3,3,3,0,0,0],
  [0,0,0,1,1,0,0,1,1,0,0,0],
  [0,0,0,4,4,0,0,4,4,0,0,0],
];

export function getBaseSprite(gender: AvatarGender): number[][] {
  return gender === 'female' ? FEMALE_BASE : MALE_BASE;
}

export const GRID_COLS = 12;
export const GRID_ROWS = 17;

// ── Pixel Art Item Overlays ─────────────────────────────────
// Each item is a 12x17 sparse overlay (0 = transparent, color indices map to its own palette)

export interface PixelItemOverlay {
  key: string;
  name: string;
  nameFr: string;
  slot: string;
  rarity: string;
  levelRequired: number;
  pixels: number[][];
  palette: string[];
}

// Helper to create empty rows
const E = [0,0,0,0,0,0,0,0,0,0,0,0];

// All items are pixel art - no emojis
export const PIXEL_ITEMS: PixelItemOverlay[] = [
  // ═══════════════════════════════════════════════
  // ── HEAD ITEMS ──
  // ═══════════════════════════════════════════════
  {
    key: 'bandana_basic',
    name: 'Basic Bandana',
    nameFr: 'Bandana Simple',
    slot: 'head',
    rarity: 'common',
    levelRequired: 3,
    palette: ['', '#CC3333', '#991111', '#FFFFFF'],
    pixels: [
      E,
      [0,0,0,1,1,1,1,1,1,0,0,0],
      [0,0,1,2,1,1,1,1,2,1,0,0],
      E,E,E,E,E,E,E,E,E,E,E,E,E,E,
    ],
  },
  {
    key: 'cap_sport',
    name: 'Sport Cap',
    nameFr: 'Casquette Sport',
    slot: 'head',
    rarity: 'common',
    levelRequired: 5,
    palette: ['', '#3B5998', '#2C4270', '#FFFFFF'],
    pixels: [
      [0,0,0,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,3,1,1,3,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      E,E,E,E,E,E,E,E,E,E,E,E,E,E,
    ],
  },
  {
    key: 'helmet_iron',
    name: 'Iron Helmet',
    nameFr: 'Casque de Fer',
    slot: 'head',
    rarity: 'uncommon',
    levelRequired: 10,
    palette: ['', '#888888', '#666666', '#AAAAAA', '#444444'],
    pixels: [
      [0,0,0,0,0,3,3,0,0,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,0,1,3,2,1,1,2,3,1,0,0],
      [0,0,2,1,1,1,1,1,1,2,0,0],
      E,E,E,E,E,E,E,E,E,E,E,E,E,
    ],
  },
  {
    key: 'wizard_hat',
    name: 'Wizard Hat',
    nameFr: 'Chapeau de Mage',
    slot: 'head',
    rarity: 'rare',
    levelRequired: 30,
    palette: ['', '#4A1A8A', '#6030B0', '#FFD700', '#8050D0'],
    pixels: [
      [0,0,0,0,0,0,3,0,0,0,0,0],
      [0,0,0,0,0,1,1,0,0,0,0,0],
      [0,0,0,0,1,2,2,1,0,0,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
      [0,0,3,4,4,4,4,4,4,3,0,0],
      E,E,E,E,E,E,E,E,E,E,E,E,
    ],
  },
  {
    key: 'crown_gold',
    name: 'Golden Crown',
    nameFr: 'Couronne Dorée',
    slot: 'head',
    rarity: 'epic',
    levelRequired: 50,
    palette: ['', '#FFD700', '#FFA500', '#FFFFFF', '#B8860B'],
    pixels: [
      [0,0,1,4,1,0,0,1,4,1,0,0],
      [0,0,1,1,1,3,3,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
      E,E,E,E,E,E,E,E,E,E,E,E,E,E,
    ],
  },
  {
    key: 'halo',
    name: 'Halo',
    nameFr: 'Auréole',
    slot: 'head',
    rarity: 'legendary',
    levelRequired: 100,
    palette: ['', '#FFE88899', '#FFD70099', '#FFFFFF66'],
    pixels: [
      [0,0,0,1,2,3,3,2,1,0,0,0],
      [0,0,1,0,0,0,0,0,0,1,0,0],
      E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,
    ],
  },
  {
    key: 'headband_zen',
    name: 'Zen Headband',
    nameFr: 'Bandeau Zen',
    slot: 'head',
    rarity: 'uncommon',
    levelRequired: 15,
    palette: ['', '#FFFFFF', '#DDDDDD', '#FFD700'],
    pixels: [
      E,E,
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,0,0,3,3,0,0,0,0,0],
      E,E,E,E,E,E,E,E,E,E,E,E,E,
    ],
  },

  // ═══════════════════════════════════════════════
  // ── FACE ITEMS ──
  // ═══════════════════════════════════════════════
  {
    key: 'glasses_round',
    name: 'Round Glasses',
    nameFr: 'Lunettes Rondes',
    slot: 'face',
    rarity: 'common',
    levelRequired: 5,
    palette: ['', '#333333', '#555555', '#88CCFF'],
    pixels: [
      E,E,E,E,
      E,
      [0,1,1,1,1,1,1,1,1,1,1,0],
      E,E,E,E,E,E,E,E,E,E,E,
    ],
  },
  {
    key: 'sunglasses',
    name: 'Sunglasses',
    nameFr: 'Lunettes de Soleil',
    slot: 'face',
    rarity: 'common',
    levelRequired: 8,
    palette: ['', '#111111', '#333333', '#222222'],
    pixels: [
      E,E,E,E,
      E,
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,3,3,0,0,3,3,0,0,0],
      E,E,E,E,E,E,E,E,E,E,
    ],
  },
  {
    key: 'scar',
    name: 'Battle Scar',
    nameFr: 'Cicatrice',
    slot: 'face',
    rarity: 'uncommon',
    levelRequired: 20,
    palette: ['', '#CC6666', '#AA4444'],
    pixels: [
      E,E,E,E,E,
      [0,0,0,0,0,0,0,0,1,0,0,0],
      [0,0,0,0,0,0,0,1,0,0,0,0],
      [0,0,0,0,0,0,0,0,2,0,0,0],
      E,E,E,E,E,E,E,E,E,
    ],
  },
  {
    key: 'mask_hero',
    name: 'Hero Mask',
    nameFr: 'Masque de Héros',
    slot: 'face',
    rarity: 'rare',
    levelRequired: 35,
    palette: ['', '#222222', '#444444', '#FF4444'],
    pixels: [
      E,E,E,E,E,
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,0,1,0,2,1,1,2,0,1,0,0],
      E,E,E,E,E,E,E,E,E,E,
    ],
  },
  {
    key: 'monocle',
    name: 'Monocle',
    nameFr: 'Monocle',
    slot: 'face',
    rarity: 'epic',
    levelRequired: 60,
    palette: ['', '#FFD700', '#FFFFFF', '#88CCFF'],
    pixels: [
      E,E,E,E,E,
      [0,0,0,0,0,0,0,0,1,1,0,0],
      [0,0,0,0,0,0,0,0,1,3,1,0],
      [0,0,0,0,0,0,0,0,0,1,0,0],
      [0,0,0,0,0,0,0,0,0,1,0,0],
      E,E,E,E,E,E,E,E,
    ],
  },

  // ═══════════════════════════════════════════════
  // ── OUTFIT ITEMS ──
  // ═══════════════════════════════════════════════
  {
    key: 'tshirt_basic',
    name: 'Basic T-Shirt',
    nameFr: 'T-Shirt Basique',
    slot: 'outfit',
    rarity: 'common',
    levelRequired: 1,
    palette: ['', '#5588CC', '#3366AA', '#FFFFFF'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      E,E,
    ],
  },
  {
    key: 'hoodie',
    name: 'Hoodie',
    nameFr: 'Sweat à Capuche',
    slot: 'outfit',
    rarity: 'uncommon',
    levelRequired: 10,
    palette: ['', '#555555', '#333333', '#777777', '#FFFFFF'],
    pixels: [
      E,E,E,
      [0,0,0,0,1,3,3,1,0,0,0,0],
      E,E,E,E,E,E,
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,2,1,4,4,1,2,1,1,0],
      [0,1,1,2,1,1,1,1,2,1,1,0],
      [0,1,1,2,1,1,1,1,2,1,1,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      E,E,
    ],
  },
  {
    key: 'vest_leather',
    name: 'Leather Vest',
    nameFr: 'Veste en Cuir',
    slot: 'outfit',
    rarity: 'uncommon',
    levelRequired: 20,
    palette: ['', '#6B3F1A', '#4A2A10', '#8B5A2B', '#FFD700'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,1,2,3,1,1,1,1,3,2,1,0],
      [0,1,2,3,1,4,4,1,3,2,1,0],
      [0,1,2,3,1,1,1,1,3,2,1,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      E,E,
    ],
  },
  {
    key: 'armor_knight',
    name: 'Knight Armor',
    nameFr: 'Armure de Chevalier',
    slot: 'outfit',
    rarity: 'rare',
    levelRequired: 30,
    palette: ['', '#888888', '#666666', '#AAAAAA', '#FFD700'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,1,3,3,4,3,3,4,3,3,1,0],
      [0,1,3,1,2,1,1,2,1,3,0,0],
      [0,1,3,1,2,1,1,2,1,3,0,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      E,E,
    ],
  },
  {
    key: 'robe_mage',
    name: 'Mage Robe',
    nameFr: 'Robe de Mage',
    slot: 'outfit',
    rarity: 'epic',
    levelRequired: 50,
    palette: ['', '#4A1A8A', '#6030B0', '#FFD700', '#8050D0'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,
      [0,0,1,1,2,1,1,2,1,1,0,0],
      [0,1,2,2,3,2,2,3,2,2,1,0],
      [0,1,2,4,2,2,2,2,4,2,1,0],
      [0,1,2,2,2,2,2,2,2,2,1,0],
      [0,0,1,2,2,2,2,2,2,1,0,0],
      E,E,
    ],
  },
  {
    key: 'armor_dragon',
    name: 'Dragon Armor',
    nameFr: 'Armure de Dragon',
    slot: 'outfit',
    rarity: 'legendary',
    levelRequired: 90,
    palette: ['', '#CC2222', '#881111', '#FFD700', '#FF6600', '#440000'],
    pixels: [
      E,E,E,E,E,E,E,E,E,
      [0,0,0,0,0,1,1,0,0,0,0,0],
      [0,4,1,1,1,1,1,1,1,1,4,0],
      [0,1,2,5,3,2,2,3,5,2,1,0],
      [0,1,2,5,3,4,4,3,5,2,1,0],
      [0,1,2,2,3,2,2,3,2,2,1,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      E,E,
    ],
  },

  // ═══════════════════════════════════════════════
  // ── CAPE ITEMS ──
  // ═══════════════════════════════════════════════
  {
    key: 'cape_traveler',
    name: 'Traveler Cloak',
    nameFr: 'Cape de Voyageur',
    slot: 'cape',
    rarity: 'common',
    levelRequired: 7,
    palette: ['', '#8B6914', '#6B4F0A', '#A08020'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,2,0,0,0,0,0,0,0,0,2,1],
      [0,1,0,0,0,0,0,0,0,0,1,0],
      [0,1,2,0,0,0,0,0,0,2,1,0],
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [0,0,0,1,0,0,0,0,1,0,0,0],
      [0,0,0,0,2,0,0,2,0,0,0,0],
    ],
  },
  {
    key: 'cape_red',
    name: 'Red Cape',
    nameFr: 'Cape Rouge',
    slot: 'cape',
    rarity: 'uncommon',
    levelRequired: 15,
    palette: ['', '#CC2222', '#991111', '#FF4444'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,3,0,0,0,0,0,0,0,0,3,1],
      [2,1,0,0,0,0,0,0,0,0,1,2],
      [2,1,3,0,0,0,0,0,0,3,1,2],
      [0,2,1,0,0,0,0,0,0,1,2,0],
      [0,0,2,1,0,0,0,0,1,2,0,0],
      [0,0,0,2,0,0,0,0,2,0,0,0],
    ],
  },
  {
    key: 'cape_royal',
    name: 'Royal Cape',
    nameFr: 'Cape Royale',
    slot: 'cape',
    rarity: 'epic',
    levelRequired: 50,
    palette: ['', '#6030A0', '#401880', '#FFD700', '#8050D0'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,3,0,0,0,0,0,0,0,0,3,1],
      [2,1,3,0,0,0,0,0,0,3,1,2],
      [2,1,4,3,0,0,0,0,3,4,1,2],
      [0,2,1,4,0,0,0,0,4,1,2,0],
      [0,0,2,1,3,0,0,3,1,2,0,0],
      [0,0,0,2,4,3,3,4,2,0,0,0],
    ],
  },
  {
    key: 'cape_phoenix',
    name: 'Phoenix Wings',
    nameFr: 'Ailes de Phénix',
    slot: 'cape',
    rarity: 'legendary',
    levelRequired: 85,
    palette: ['', '#FF4400', '#FF8800', '#FFCC00', '#FF220066'],
    pixels: [
      E,E,E,E,E,E,E,
      [0,0,0,0,0,0,0,0,0,0,0,3],
      [3,0,0,0,0,0,0,0,0,0,3,2],
      [2,3,0,0,0,0,0,0,0,3,2,1],
      [1,2,3,0,0,0,0,0,3,2,1,0],
      [1,1,2,0,0,0,0,0,2,1,1,0],
      [0,1,2,3,0,0,0,3,2,1,0,0],
      [4,0,1,2,0,0,0,2,1,0,4,0],
      [0,4,0,1,3,0,3,1,0,4,0,0],
      [0,0,4,0,2,1,2,0,4,0,0,0],
    ],
  },

  // ═══════════════════════════════════════════════
  // ── WEAPON ITEMS ──
  // ═══════════════════════════════════════════════
  {
    key: 'stick_wood',
    name: 'Wooden Stick',
    nameFr: 'Bâton en Bois',
    slot: 'weapon',
    rarity: 'common',
    levelRequired: 3,
    palette: ['', '#8B6914', '#6B4F0A'],
    pixels: [
      E,E,E,E,E,E,
      [0,0,0,0,0,0,0,0,0,1,0,0],
      [0,0,0,0,0,0,0,0,1,0,0,0],
      [0,0,0,0,0,0,0,1,0,0,0,0],
      [0,0,0,0,0,0,2,0,0,0,0,0],
      [0,0,0,0,0,2,0,0,0,0,0,0],
      [0,0,0,0,2,0,0,0,0,0,0,0],
      E,E,E,E,E,
    ],
  },
  {
    key: 'sword_iron',
    name: 'Iron Sword',
    nameFr: 'Épée de Fer',
    slot: 'weapon',
    rarity: 'uncommon',
    levelRequired: 10,
    palette: ['', '#AAAAAA', '#888888', '#CCCCCC', '#8B4513'],
    pixels: [
      E,E,E,
      [0,0,0,0,0,0,0,0,0,0,3,0],
      [0,0,0,0,0,0,0,0,0,3,0,0],
      [0,0,0,0,0,0,0,0,3,0,0,0],
      [0,0,0,0,0,0,0,1,0,0,0,0],
      [0,0,0,0,0,0,1,0,0,0,0,0],
      [0,0,0,0,0,1,0,0,0,0,0,0],
      [0,0,0,0,2,0,0,0,0,0,0,0],
      [0,0,0,4,2,4,0,0,0,0,0,0],
      [0,0,0,0,4,0,0,0,0,0,0,0],
      [0,0,0,0,4,0,0,0,0,0,0,0],
      E,E,E,E,E,
    ],
  },
  {
    key: 'staff_magic',
    name: 'Magic Staff',
    nameFr: 'Bâton Magique',
    slot: 'weapon',
    rarity: 'rare',
    levelRequired: 25,
    palette: ['', '#8B4513', '#A0522D', '#FF00FF', '#FFD700'],
    pixels: [
      [0,0,0,0,0,0,0,0,0,0,0,3],
      [0,0,0,0,0,0,0,0,0,0,3,4],
      [0,0,0,0,0,0,0,0,0,3,4,0],
      E,E,
      [0,0,0,0,0,0,0,0,0,2,0,0],
      [0,0,0,0,0,0,0,0,2,0,0,0],
      [0,0,0,0,0,0,0,1,0,0,0,0],
      [0,0,0,0,0,0,1,0,0,0,0,0],
      [0,0,0,0,0,1,0,0,0,0,0,0],
      [0,0,0,0,1,0,0,0,0,0,0,0],
      [0,0,0,1,0,0,0,0,0,0,0,0],
      [0,0,1,0,0,0,0,0,0,0,0,0],
      E,E,E,E,
    ],
  },
  {
    key: 'sword_flame',
    name: 'Flame Sword',
    nameFr: 'Épée de Flamme',
    slot: 'weapon',
    rarity: 'legendary',
    levelRequired: 75,
    palette: ['', '#FF4400', '#FF8800', '#FFCC00', '#8B4513', '#CC2200'],
    pixels: [
      [0,0,0,0,0,0,0,0,0,0,3,0],
      [0,0,0,0,0,0,0,0,0,2,3,0],
      [0,0,0,0,0,0,0,0,0,1,2,0],
      [0,0,0,0,0,0,0,0,1,5,0,0],
      [0,0,0,0,0,0,0,1,5,0,0,0],
      [0,0,0,0,0,0,1,5,0,0,0,0],
      [0,0,0,0,0,1,5,0,0,0,0,0],
      [0,0,0,0,1,5,0,0,0,0,0,0],
      [0,0,0,0,5,0,0,0,0,0,0,0],
      [0,0,0,4,5,4,0,0,0,0,0,0],
      [0,0,0,0,4,0,0,0,0,0,0,0],
      [0,0,0,0,4,0,0,0,0,0,0,0],
      E,E,E,E,E,
    ],
  },
  {
    key: 'katana',
    name: 'Katana',
    nameFr: 'Katana',
    slot: 'weapon',
    rarity: 'epic',
    levelRequired: 55,
    palette: ['', '#DDDDDD', '#AAAAAA', '#333333', '#CC0000'],
    pixels: [
      E,E,
      [0,0,0,0,0,0,0,0,0,0,0,1],
      [0,0,0,0,0,0,0,0,0,0,1,0],
      [0,0,0,0,0,0,0,0,0,1,0,0],
      [0,0,0,0,0,0,0,0,1,0,0,0],
      [0,0,0,0,0,0,0,2,0,0,0,0],
      [0,0,0,0,0,0,2,0,0,0,0,0],
      [0,0,0,0,0,2,0,0,0,0,0,0],
      [0,0,0,0,3,0,0,0,0,0,0,0],
      [0,0,0,4,3,4,0,0,0,0,0,0],
      [0,0,0,0,3,0,0,0,0,0,0,0],
      E,E,E,E,E,
    ],
  },

  // ═══════════════════════════════════════════════
  // ── AURA ITEMS ──
  // ═══════════════════════════════════════════════
  {
    key: 'aura_calm',
    name: 'Calm Aura',
    nameFr: 'Aura de Calme',
    slot: 'aura',
    rarity: 'uncommon',
    levelRequired: 15,
    palette: ['', '#88CCFF22', '#55AAFF22', '#AADDFF11'],
    pixels: [
      [0,0,0,3,0,0,0,0,3,0,0,0],
      [0,0,3,0,0,0,0,0,0,3,0,0],
      [0,3,0,0,0,0,0,0,0,0,3,0],
      [3,0,0,0,0,0,0,0,0,0,0,3],
      [2,0,0,0,0,0,0,0,0,0,0,2],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      E,
      [1,0,0,0,0,0,0,0,0,0,0,1],
      E,
      [1,0,0,0,0,0,0,0,0,0,0,1],
      E,
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [2,0,0,0,0,0,0,0,0,0,0,2],
      [3,0,0,0,0,0,0,0,0,0,0,3],
      [0,3,0,0,0,0,0,0,0,0,3,0],
      [0,0,3,0,0,0,0,0,0,3,0,0],
      [0,0,0,3,2,1,1,2,3,0,0,0],
    ],
  },
  {
    key: 'aura_fire',
    name: 'Fire Aura',
    nameFr: 'Aura de Feu',
    slot: 'aura',
    rarity: 'rare',
    levelRequired: 30,
    palette: ['', '#FF440044', '#FF880044', '#FFCC0044'],
    pixels: [
      [0,0,0,0,3,0,0,3,0,0,0,0],
      [0,0,0,3,2,0,0,2,3,0,0,0],
      [0,0,3,2,0,0,0,0,2,3,0,0],
      [0,3,2,0,0,0,0,0,0,2,3,0],
      [3,2,1,0,0,0,0,0,0,1,2,3],
      [2,1,0,0,0,0,0,0,0,0,1,2],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [2,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,0,0,0,0,0,0,0,0,1,2],
      [3,2,0,0,0,0,0,0,0,0,2,3],
      [0,3,2,0,0,0,0,0,0,2,3,0],
      [0,0,3,2,0,0,0,0,2,3,0,0],
      [0,0,0,3,2,1,1,2,3,0,0,0],
    ],
  },
  {
    key: 'aura_ice',
    name: 'Ice Aura',
    nameFr: 'Aura de Glace',
    slot: 'aura',
    rarity: 'epic',
    levelRequired: 50,
    palette: ['', '#00BBFF44', '#55DDFF44', '#AAEEFF33'],
    pixels: [
      [0,0,3,0,0,3,3,0,0,3,0,0],
      [0,3,0,0,2,0,0,2,0,0,3,0],
      [3,0,0,2,0,0,0,0,2,0,0,3],
      [0,0,2,0,0,0,0,0,0,2,0,0],
      [0,1,0,0,0,0,0,0,0,0,1,0],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      E,
      [1,0,0,0,0,0,0,0,0,0,0,1],
      E,
      [1,0,0,0,0,0,0,0,0,0,0,1],
      E,
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [0,1,0,0,0,0,0,0,0,0,1,0],
      [0,0,2,0,0,0,0,0,0,2,0,0],
      [3,0,0,2,0,0,0,0,2,0,0,3],
      [0,3,0,0,2,0,0,2,0,0,3,0],
      [0,0,3,0,0,1,1,0,0,3,0,0],
    ],
  },
  {
    key: 'aura_cosmic',
    name: 'Cosmic Aura',
    nameFr: 'Aura Cosmique',
    slot: 'aura',
    rarity: 'legendary',
    levelRequired: 90,
    palette: ['', '#AA55FF44', '#FF55AA44', '#55FFFF33', '#FFD70033'],
    pixels: [
      [4,0,0,3,0,1,1,0,3,0,0,4],
      [0,0,3,0,2,0,0,2,0,3,0,0],
      [0,3,0,2,0,0,0,0,2,0,3,0],
      [3,0,2,0,0,0,0,0,0,2,0,3],
      [0,1,0,0,0,0,0,0,0,0,1,0],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [4,0,0,0,0,0,0,0,0,0,0,4],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [4,0,0,0,0,0,0,0,0,0,0,4],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [0,1,0,0,0,0,0,0,0,0,1,0],
      [3,0,2,0,0,0,0,0,0,2,0,3],
      [0,3,0,2,0,0,0,0,2,0,3,0],
      [0,0,3,0,2,0,0,2,0,3,0,0],
      [4,0,0,3,0,1,1,0,3,0,0,4],
    ],
  },

  // ═══════════════════════════════════════════════
  // ── PET ITEMS ──
  // ═══════════════════════════════════════════════
  {
    key: 'pet_cat',
    name: 'Cat',
    nameFr: 'Chat',
    slot: 'pet',
    rarity: 'uncommon',
    levelRequired: 10,
    palette: ['', '#FF8800', '#CC6600', '#FFFFFF', '#222222'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,E,E,E,
      [0,0,0,0,0,0,0,0,0,1,0,1],
      [0,0,0,0,0,0,0,0,0,1,1,1],
      [0,0,0,0,0,0,0,0,0,4,3,4],
      [0,0,0,0,0,0,0,0,2,1,1,1],
    ],
  },
  {
    key: 'pet_bird',
    name: 'Blue Bird',
    nameFr: 'Oiseau Bleu',
    slot: 'pet',
    rarity: 'common',
    levelRequired: 5,
    palette: ['', '#4A90D9', '#2C6AAA', '#FFFFFF', '#FF8800'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,E,
      [0,0,0,0,0,0,0,0,0,0,1,0],
      [0,0,0,0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0,3,1,4],
      [0,0,0,0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0,0,2,2],
    ],
  },
  {
    key: 'pet_owl',
    name: 'Owl',
    nameFr: 'Hibou',
    slot: 'pet',
    rarity: 'rare',
    levelRequired: 25,
    palette: ['', '#8B6914', '#6B4F0A', '#FFD700', '#FFFFFF'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,E,E,
      [0,0,0,0,0,0,0,0,0,1,0,1],
      [0,0,0,0,0,0,0,0,0,1,1,1],
      [0,0,0,0,0,0,0,0,4,3,3,4],
      [0,0,0,0,0,0,0,0,0,1,1,0],
      [0,0,0,0,0,0,0,0,0,2,2,0],
    ],
  },
  {
    key: 'pet_wolf',
    name: 'Wolf Cub',
    nameFr: 'Louveteau',
    slot: 'pet',
    rarity: 'epic',
    levelRequired: 45,
    palette: ['', '#777777', '#555555', '#FFFFFF', '#222222'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,E,E,
      [0,0,0,0,0,0,0,0,1,0,0,1],
      [0,0,0,0,0,0,0,0,1,1,1,1],
      [0,0,0,0,0,0,0,0,4,3,3,4],
      [0,0,0,0,0,0,0,2,1,1,1,1],
      [0,0,0,0,0,0,0,2,0,0,0,2],
    ],
  },
  {
    key: 'pet_dragon',
    name: 'Baby Dragon',
    nameFr: 'Bébé Dragon',
    slot: 'pet',
    rarity: 'legendary',
    levelRequired: 80,
    palette: ['', '#44AA44', '#228822', '#FFDD00', '#FF4400'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,E,
      [0,0,0,0,0,0,0,0,0,0,4,0],
      [0,0,0,0,0,0,0,0,0,4,0,0],
      [0,0,0,0,0,0,0,0,1,2,1,0],
      [0,0,0,0,0,0,0,0,1,3,1,0],
      [0,0,0,0,0,0,0,1,1,1,1,0],
      [0,0,0,0,0,0,0,2,0,0,2,0],
    ],
  },

  // ═══════════════════════════════════════════════
  // ── BACKGROUND ITEMS ──
  // ═══════════════════════════════════════════════
  {
    key: 'bg_meadow',
    name: 'Meadow',
    nameFr: 'Prairie',
    slot: 'background',
    rarity: 'common',
    levelRequired: 3,
    palette: ['', '#2A6A2A18', '#3A8A3A18', '#4AAA4A10'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,E,E,E,E,
      [1,0,0,0,2,0,0,0,0,1,0,0],
      [2,1,0,0,0,0,3,0,0,0,1,2],
      [3,2,1,0,0,0,0,0,0,1,2,3],
    ],
  },
  {
    key: 'bg_forest',
    name: 'Forest',
    nameFr: 'Forêt',
    slot: 'background',
    rarity: 'uncommon',
    levelRequired: 12,
    palette: ['', '#1A4A1A22', '#2A6A2A22', '#3A8A3A22'],
    pixels: [
      [1,1,2,1,1,0,0,1,1,2,1,1],
      [2,2,3,2,0,0,0,0,2,3,2,2],
      [1,3,3,0,0,0,0,0,0,3,3,1],
      [0,2,0,0,0,0,0,0,0,0,2,0],
      E,E,E,E,E,E,E,E,E,E,
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [2,1,0,0,0,0,0,0,0,0,1,2],
      [3,2,1,0,0,0,0,0,0,1,2,3],
    ],
  },
  {
    key: 'bg_mountain',
    name: 'Mountain',
    nameFr: 'Montagne',
    slot: 'background',
    rarity: 'rare',
    levelRequired: 30,
    palette: ['', '#55667744', '#33445533', '#FFFFFF22', '#88AABB22'],
    pixels: [
      [0,0,0,0,0,3,3,0,0,0,0,0],
      [0,0,0,0,1,3,3,1,0,0,0,0],
      [0,0,0,1,2,1,1,2,1,0,0,0],
      [0,0,1,2,0,0,0,0,2,1,0,0],
      [0,1,2,0,0,0,0,0,0,2,1,0],
      E,E,E,E,E,E,E,E,E,E,E,E,
    ],
  },
  {
    key: 'bg_stars',
    name: 'Starry Night',
    nameFr: 'Nuit Étoilée',
    slot: 'background',
    rarity: 'epic',
    levelRequired: 50,
    palette: ['', '#FFD70033', '#FFFFFF22', '#88AAFF22'],
    pixels: [
      [1,0,0,2,0,0,0,0,2,0,0,1],
      [0,0,2,0,0,0,1,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,2,0,0],
      [0,2,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,2,0,0,0,0,0,2,0],
      E,
      [2,0,0,0,0,0,0,2,0,0,0,0],
      [0,0,0,2,0,0,0,0,0,0,0,2],
      E,
      [0,2,0,0,0,0,0,0,0,2,0,0],
      [0,0,0,0,0,0,2,0,0,0,0,0],
      E,
      [0,0,2,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,2,0,0,0],
      [2,0,0,0,0,0,0,0,0,0,2,0],
      [0,0,0,0,2,0,0,0,0,0,0,0],
      [0,2,0,0,0,0,0,2,0,0,0,1],
    ],
  },
  {
    key: 'bg_cosmos',
    name: 'Cosmos',
    nameFr: 'Cosmos',
    slot: 'background',
    rarity: 'legendary',
    levelRequired: 95,
    palette: ['', '#AA55FF22', '#FF55AA18', '#55FFFF18', '#FFD70022'],
    pixels: [
      [1,0,4,0,0,2,2,0,0,4,0,1],
      [0,3,0,0,1,0,0,1,0,0,3,0],
      [4,0,0,1,0,0,0,0,1,0,0,4],
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [0,2,0,0,0,0,0,0,0,0,2,0],
      [3,0,0,0,0,0,0,0,0,0,0,3],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [0,0,4,0,0,0,0,0,0,4,0,0],
      [3,0,0,0,0,0,0,0,0,0,0,3],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,2,0,0,0,0,0,0,0,0,2,0],
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [4,0,0,1,0,0,0,0,1,0,0,4],
      [0,3,0,0,2,0,0,2,0,0,3,0],
      [1,0,4,0,0,3,3,0,0,4,0,1],
      [0,0,0,4,0,0,0,0,4,0,0,0],
    ],
  },
];

// ── Level-based unlock schedule ─────────────────────────────
// Maps level → items that unlock at that level
export function getItemsForLevel(level: number): PixelItemOverlay[] {
  return PIXEL_ITEMS.filter(item => item.levelRequired === level);
}

export function getNextUnlock(currentLevel: number): { item: PixelItemOverlay; level: number } | null {
  const future = PIXEL_ITEMS
    .filter(i => i.levelRequired > currentLevel)
    .sort((a, b) => a.levelRequired - b.levelRequired);
  if (future.length === 0) return null;
  return { item: future[0], level: future[0].levelRequired };
}

// Slot metadata (pixel art icons instead of emojis)
export const SLOT_META: { id: string; label: string; iconPixels: number[][]; iconPalette: string[] }[] = [
  {
    id: 'head', label: 'Tête',
    iconPalette: ['', '#FFD700', '#FFA500'],
    iconPixels: [[0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0]],
  },
  {
    id: 'face', label: 'Visage',
    iconPalette: ['', '#333333', '#88CCFF'],
    iconPixels: [[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0]],
  },
  {
    id: 'outfit', label: 'Tenue',
    iconPalette: ['', '#5588CC', '#3366AA'],
    iconPixels: [[0,1,1,1,0],[1,2,1,2,1],[0,1,1,1,0]],
  },
  {
    id: 'weapon', label: 'Arme',
    iconPalette: ['', '#AAAAAA', '#8B4513'],
    iconPixels: [[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,2,0,0,0],[0,2,0,0,0]],
  },
  {
    id: 'cape', label: 'Cape',
    iconPalette: ['', '#CC2222', '#991111'],
    iconPixels: [[1,0,0,0,1],[1,2,0,2,1],[0,1,0,1,0]],
  },
  {
    id: 'aura', label: 'Aura',
    iconPalette: ['', '#FF880066', '#FFCC0066'],
    iconPixels: [[0,1,0,1,0],[1,0,0,0,1],[0,2,0,2,0]],
  },
  {
    id: 'background', label: 'Fond',
    iconPalette: ['', '#2A6A2A44', '#1A4A1A44'],
    iconPixels: [[1,0,2,0,1],[0,0,0,0,0],[2,0,1,0,2]],
  },
  {
    id: 'pet', label: 'Compagnon',
    iconPalette: ['', '#FF8800', '#FFFFFF'],
    iconPixels: [[1,0,1],[1,1,1],[2,0,2]],
  },
];

// Rarity system (5 tiers including Mythic for Premium)
export const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
  mythic: '#FF2D78',
};

export const RARITY_GRADIENTS: Record<string, string> = {
  common: 'from-gray-400 to-gray-500',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
  mythic: 'from-pink-500 via-rose-500 to-red-500',
};

export const RARITY_LABELS: Record<string, string> = {
  common: 'Commun',
  uncommon: 'Peu commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
  mythic: 'Mythique',
};

// Premium-exclusive neon color palettes
export const PREMIUM_CLOTHING_PALETTES = [
  { main: '#FF00FF', shadow: '#CC00CC', label: 'Néon Rose', levelRequired: 0 },
  { main: '#00FFFF', shadow: '#00CCCC', label: 'Néon Cyan', levelRequired: 0 },
  { main: '#FF3300', shadow: '#CC2200', label: 'Néon Flamme', levelRequired: 0 },
  { main: '#7700FF', shadow: '#5500CC', label: 'Néon Violet', levelRequired: 0 },
  { main: '#00FF88', shadow: '#00CC66', label: 'Néon Émeraude', levelRequired: 0 },
  { main: '#FFAA00', shadow: '#CC8800', label: 'Néon Or', levelRequired: 0 },
];

export const PREMIUM_EYE_PALETTES = [
  { color: '#FF00FF', label: 'Néon', rarity: 'mythic' },
  { color: '#00FFFF', label: 'Plasma', rarity: 'mythic' },
  { color: '#FFFFFF', label: 'Argent Pur', rarity: 'mythic' },
];

// Items flagged as premium-only (mythic rarity)
export const PREMIUM_PIXEL_ITEMS: PixelItemOverlay[] = [
  {
    key: 'crown_mythic',
    name: 'Mythic Crown',
    nameFr: 'Couronne Mythique',
    slot: 'head',
    rarity: 'mythic',
    levelRequired: 1,
    palette: ['', '#FF2D78', '#FF69B4', '#FFFFFF', '#FFD700'],
    pixels: [
      [0,0,1,4,1,0,0,1,4,1,0,0],
      [0,0,1,3,1,3,3,1,3,1,0,0],
      [0,0,4,1,1,1,1,1,1,4,0,0],
      E,E,E,E,E,E,E,E,E,E,E,E,E,E,
    ],
  },
  {
    key: 'aura_mythic',
    name: 'Mythic Aura',
    nameFr: 'Aura Mythique',
    slot: 'aura',
    rarity: 'mythic',
    levelRequired: 1,
    palette: ['', '#FF2D7844', '#FF69B444', '#FFD70033', '#FFFFFF22'],
    pixels: [
      [4,0,3,0,0,1,1,0,0,3,0,4],
      [0,3,0,0,2,0,0,2,0,0,3,0],
      [3,0,0,2,0,0,0,0,2,0,0,3],
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [0,1,0,0,0,0,0,0,0,0,1,0],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [4,0,0,0,0,0,0,0,0,0,0,4],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      E,
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [4,0,0,0,0,0,0,0,0,0,0,4],
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [0,1,0,0,0,0,0,0,0,0,1,0],
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [3,0,0,2,0,0,0,0,2,0,0,3],
      [0,3,0,0,2,0,0,2,0,0,3,0],
      [4,0,3,0,0,1,1,0,0,3,0,4],
    ],
  },
  {
    key: 'bg_mythic',
    name: 'Mythic Realm',
    nameFr: 'Royaume Mythique',
    slot: 'background',
    rarity: 'mythic',
    levelRequired: 1,
    palette: ['', '#FF2D7822', '#FF69B418', '#FFD70022', '#FFFFFF18'],
    pixels: [
      [1,0,4,0,0,3,3,0,0,4,0,1],
      [0,3,0,0,2,0,0,2,0,0,3,0],
      [4,0,0,1,0,0,0,0,1,0,0,4],
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [0,2,0,0,0,0,0,0,0,0,2,0],
      [3,0,0,0,0,0,0,0,0,0,0,3],
      E,
      [1,0,0,0,0,0,0,0,0,0,0,1],
      [0,0,4,0,0,0,0,0,0,4,0,0],
      [3,0,0,0,0,0,0,0,0,0,0,3],
      E,
      [0,2,0,0,0,0,0,0,0,0,2,0],
      [0,0,1,0,0,0,0,0,0,1,0,0],
      [4,0,0,1,0,0,0,0,1,0,0,4],
      [0,3,0,0,2,0,0,2,0,0,3,0],
      [1,0,4,0,0,3,3,0,0,4,0,1],
      [0,0,0,4,0,0,0,0,4,0,0,0],
    ],
  },
  {
    key: 'outfit_mythic',
    name: 'Mythic Armor',
    nameFr: 'Armure Mythique',
    slot: 'outfit',
    rarity: 'mythic',
    levelRequired: 1,
    palette: ['', '#FF2D78', '#FF69B4', '#FFD700', '#FFFFFF', '#AA0044'],
    pixels: [
      E,E,E,E,E,E,E,E,E,
      [0,0,0,0,0,1,1,0,0,0,0,0],
      [0,5,1,1,3,1,1,3,1,1,5,0],
      [0,1,2,4,3,2,2,3,4,2,1,0],
      [0,1,2,5,3,4,4,3,5,2,1,0],
      [0,1,2,2,3,2,2,3,2,2,1,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      E,E,
    ],
  },
  {
    key: 'pet_phoenix',
    name: 'Phoenix',
    nameFr: 'Phénix',
    slot: 'pet',
    rarity: 'mythic',
    levelRequired: 1,
    palette: ['', '#FF4400', '#FF8800', '#FFCC00', '#FFFFFF'],
    pixels: [
      E,E,E,E,E,E,E,E,E,E,E,
      [0,0,0,0,0,0,0,0,0,3,0,0],
      [0,0,0,0,0,0,0,0,0,2,3,0],
      [0,0,0,0,0,0,0,0,4,1,1,0],
      [0,0,0,0,0,0,0,0,1,2,1,3],
      [0,0,0,0,0,0,0,0,0,1,3,0],
      [0,0,0,0,0,0,0,0,0,2,2,0],
    ],
  },
];

// Get all items including premium
export function getAllPixelItems(includePremium: boolean): PixelItemOverlay[] {
  return includePremium ? [...PIXEL_ITEMS, ...PREMIUM_PIXEL_ITEMS] : PIXEL_ITEMS;
}

// Evolution stage config
export interface EvolutionStage {
  name: string;
  color: string;
  minLevel: number;
  glowColor?: string;
}

export const EVOLUTION_STAGES: EvolutionStage[] = [
  { name: 'Initié', color: 'from-gray-400 to-blue-400', minLevel: 0 },
  { name: 'Voyageur', color: 'from-blue-400 to-cyan-500', minLevel: 10 },
  { name: 'Guerrier Zen', color: 'from-orange-400 to-red-500', minLevel: 25 },
  { name: 'Maître Astral', color: 'from-purple-400 to-indigo-600', minLevel: 50, glowColor: 'hsl(270 80% 60% / 0.25)' },
  { name: 'Légende Cosmique', color: 'from-purple-500 via-pink-500 to-cyan-500', minLevel: 100, glowColor: 'hsl(280 100% 70% / 0.3)' },
];

export function getEvolutionStage(level: number): EvolutionStage {
  return [...EVOLUTION_STAGES].reverse().find(s => level >= s.minLevel) || EVOLUTION_STAGES[0];
}

// Default avatar config
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  gender: 'male',
  skinIndex: 2,
  eyeIndex: 0,
  clothingIndex: 0,
  shoesIndex: 0,
  hairIndex: 0,
  hairStyleIndex: 0,
};

// ── Hairstyle System ────────────────────────────────────────
// Each hairstyle is a partial overlay on rows 0-3 (hair area) of the 12x17 grid
// Uses color indices: 6=hair main, 7=hair shadow, 0=transparent, 1=skin (for exposed skin)

export interface HairStyle {
  key: string;
  name: string;
  nameFr: string;
  gender: 'male' | 'female' | 'unisex';
  rarity: string;
  levelRequired: number;
  /** Rows 0-3 override (4 rows x 12 cols), uses indices: 0=transparent, 6=hair, 7=hairShadow, 1=skin */
  rows: number[][];
}

// ── Male Hairstyles (22) ────────────────────────────────────
export const MALE_HAIRSTYLES: HairStyle[] = [
  {
    key: 'm_short_classic', name: 'Classic Short', nameFr: 'Court Classique',
    gender: 'male', rarity: 'common', levelRequired: 1,
    rows: [
      [0,0,0,0,6,6,6,6,0,0,0,0],
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,0,7,6,6,6,6,6,6,7,0,0],
    ],
  },
  {
    key: 'm_buzz', name: 'Buzz Cut', nameFr: 'Rasé',
    gender: 'male', rarity: 'common', levelRequired: 1,
    rows: [
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,7,7,7,7,0,0,0,0],
      [0,0,0,7,7,7,7,7,7,0,0,0],
      [0,0,7,7,7,7,7,7,7,7,0,0],
    ],
  },
  {
    key: 'm_spiky', name: 'Spiky', nameFr: 'Hérissé',
    gender: 'male', rarity: 'common', levelRequired: 3,
    rows: [
      [0,0,0,6,0,6,6,0,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,0,7,6,6,6,6,6,6,7,0,0],
    ],
  },
  {
    key: 'm_curly', name: 'Curly', nameFr: 'Bouclé',
    gender: 'male', rarity: 'common', levelRequired: 5,
    rows: [
      [0,0,0,6,7,6,6,7,6,0,0,0],
      [0,0,6,7,6,7,7,6,7,6,0,0],
      [0,0,6,6,7,6,6,7,6,6,0,0],
      [0,0,7,6,6,6,6,6,6,7,0,0],
    ],
  },
  {
    key: 'm_fade', name: 'Modern Fade', nameFr: 'Dégradé Moderne',
    gender: 'male', rarity: 'common', levelRequired: 7,
    rows: [
      [0,0,0,0,6,6,6,6,0,0,0,0],
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,0,7,7,6,6,6,6,7,7,0,0],
    ],
  },
  {
    key: 'm_afro', name: 'Afro', nameFr: 'Afro',
    gender: 'male', rarity: 'uncommon', levelRequired: 10,
    rows: [
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,6,7,6,6,6,6,7,6,6,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [0,6,7,6,6,6,6,6,6,7,6,0],
    ],
  },
  {
    key: 'm_midlong', name: 'Medium Length', nameFr: 'Mi-Long',
    gender: 'male', rarity: 'common', levelRequired: 8,
    rows: [
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [0,7,6,6,6,6,6,6,6,6,7,0],
    ],
  },
  {
    key: 'm_manbun', name: 'Man Bun', nameFr: 'Chignon Homme',
    gender: 'male', rarity: 'uncommon', levelRequired: 12,
    rows: [
      [0,0,0,0,0,6,6,6,0,0,0,0],
      [0,0,0,0,6,6,7,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,0,7,6,6,6,6,6,6,7,0,0],
    ],
  },
  {
    key: 'm_undercut', name: 'Undercut', nameFr: 'Undercut',
    gender: 'male', rarity: 'uncommon', levelRequired: 15,
    rows: [
      [0,0,0,6,6,6,6,6,0,0,0,0],
      [0,0,6,6,6,6,6,6,0,0,0,0],
      [0,0,6,6,6,6,6,6,7,7,0,0],
      [0,0,7,6,6,6,6,6,7,7,0,0],
    ],
  },
  {
    key: 'm_braids', name: 'Thin Braids', nameFr: 'Tresses Fines',
    gender: 'male', rarity: 'uncommon', levelRequired: 18,
    rows: [
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,7,6,7,7,6,7,6,0,0],
      [0,0,6,6,7,6,6,7,6,6,0,0],
      [0,0,7,6,6,7,7,6,6,7,0,0],
    ],
  },
  {
    key: 'm_mohawk', name: 'Mohawk', nameFr: 'Crête',
    gender: 'male', rarity: 'rare', levelRequired: 20,
    rows: [
      [0,0,0,0,0,6,6,0,0,0,0,0],
      [0,0,0,0,6,6,6,6,0,0,0,0],
      [0,0,0,0,6,6,6,6,0,0,0,0],
      [0,0,7,7,6,6,6,6,7,7,0,0],
    ],
  },
  {
    key: 'm_pompadour', name: 'Pompadour', nameFr: 'Pompadour',
    gender: 'male', rarity: 'rare', levelRequired: 25,
    rows: [
      [0,0,0,6,6,6,6,0,0,0,0,0],
      [0,0,6,6,6,6,6,6,0,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,0,7,6,6,6,6,6,6,7,0,0],
    ],
  },
  {
    key: 'm_samurai', name: 'Samurai', nameFr: 'Samouraï',
    gender: 'male', rarity: 'rare', levelRequired: 30,
    rows: [
      [0,0,0,0,6,6,7,6,0,0,0,0],
      [0,0,0,6,6,7,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,7,6,6,6,6,6,6,7,6,0],
    ],
  },
  {
    key: 'm_dreadlocks', name: 'Dreadlocks', nameFr: 'Dreadlocks',
    gender: 'male', rarity: 'rare', levelRequired: 35,
    rows: [
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,7,6,7,6,6,7,6,7,6,0],
      [0,6,6,7,6,7,7,6,7,6,6,0],
      [6,7,6,6,6,6,6,6,6,6,7,6],
    ],
  },
  {
    key: 'm_slickback', name: 'Slick Back', nameFr: 'Plaqué Arrière',
    gender: 'male', rarity: 'uncommon', levelRequired: 14,
    rows: [
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,0,7,6,6,6,6,6,6,7,0,0],
    ],
  },
  {
    key: 'm_warrior', name: 'Warrior Cut', nameFr: 'Coupe Guerrier',
    gender: 'male', rarity: 'epic', levelRequired: 40,
    rows: [
      [0,0,6,0,6,6,6,6,0,6,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,6,7,6,6,6,6,7,6,6,0],
      [0,7,6,6,6,6,6,6,6,6,7,0],
    ],
  },
  {
    key: 'm_royal', name: 'Royal Hair', nameFr: 'Coiffure Royale',
    gender: 'male', rarity: 'epic', levelRequired: 50,
    rows: [
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,7,6,6,7,6,6,0,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [0,7,6,6,6,6,6,6,6,6,7,0],
    ],
  },
  {
    key: 'm_flame', name: 'Flame Hair', nameFr: 'Cheveux de Flamme',
    gender: 'male', rarity: 'epic', levelRequired: 60,
    rows: [
      [0,0,6,0,6,0,0,6,0,6,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,0,6,7,6,6,6,6,7,6,0,0],
      [0,0,7,6,6,6,6,6,6,7,0,0],
    ],
  },
  {
    key: 'm_cosmic', name: 'Cosmic Flow', nameFr: 'Flux Cosmique',
    gender: 'male', rarity: 'legendary', levelRequired: 75,
    rows: [
      [0,6,0,6,6,6,6,6,6,0,6,0],
      [0,6,6,6,7,6,6,7,6,6,6,0],
      [6,6,7,6,6,6,6,6,6,7,6,6],
      [7,6,6,6,6,6,6,6,6,6,6,7],
    ],
  },
  {
    key: 'm_legend', name: 'Legend Mane', nameFr: 'Crinière Légendaire',
    gender: 'male', rarity: 'legendary', levelRequired: 90,
    rows: [
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [6,6,7,6,7,6,6,7,6,7,6,6],
      [6,7,6,6,6,6,6,6,6,6,7,6],
      [6,6,6,6,6,6,6,6,6,6,6,6],
    ],
  },
  {
    key: 'm_divine', name: 'Divine Locks', nameFr: 'Mèches Divines',
    gender: 'male', rarity: 'legendary', levelRequired: 100,
    rows: [
      [6,6,6,6,6,6,6,6,6,6,6,6],
      [6,7,6,7,6,7,7,6,7,6,7,6],
      [6,6,7,6,6,6,6,6,6,7,6,6],
      [7,6,6,6,6,6,6,6,6,6,6,7],
    ],
  },
  {
    key: 'm_bald', name: 'Bald', nameFr: 'Chauve',
    gender: 'male', rarity: 'common', levelRequired: 1,
    rows: [
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
    ],
  },
];

// ── Female Hairstyles (22) ──────────────────────────────────
export const FEMALE_HAIRSTYLES: HairStyle[] = [
  {
    key: 'f_long_straight', name: 'Long Straight', nameFr: 'Long Lisse',
    gender: 'female', rarity: 'common', levelRequired: 1,
    rows: [
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [0,7,6,6,6,6,6,6,6,6,7,0],
    ],
  },
  {
    key: 'f_long_wavy', name: 'Long Wavy', nameFr: 'Long Ondulé',
    gender: 'female', rarity: 'common', levelRequired: 1,
    rows: [
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,7,6,6,7,6,6,0,0],
      [0,6,6,7,6,6,6,6,7,6,6,0],
      [0,7,6,6,6,6,6,6,6,6,7,0],
    ],
  },
  {
    key: 'f_ponytail', name: 'Ponytail', nameFr: 'Queue de Cheval',
    gender: 'female', rarity: 'common', levelRequired: 3,
    rows: [
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [0,7,6,6,6,6,6,6,6,6,7,6],
    ],
  },
  {
    key: 'f_braid', name: 'Single Braid', nameFr: 'Tresse Simple',
    gender: 'female', rarity: 'common', levelRequired: 5,
    rows: [
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [0,7,6,6,6,6,6,6,7,6,7,0],
    ],
  },
  {
    key: 'f_twin_braids', name: 'Twin Braids', nameFr: 'Double Tresse',
    gender: 'female', rarity: 'common', levelRequired: 7,
    rows: [
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [0,7,6,7,6,6,6,6,7,6,7,0],
    ],
  },
  {
    key: 'f_bob', name: 'Bob Cut', nameFr: 'Carré Court',
    gender: 'female', rarity: 'common', levelRequired: 4,
    rows: [
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
    ],
  },
  {
    key: 'f_afro', name: 'Afro', nameFr: 'Afro Volumineux',
    gender: 'female', rarity: 'uncommon', levelRequired: 10,
    rows: [
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [6,6,7,6,6,6,6,6,6,7,6,6],
      [6,6,6,6,6,6,6,6,6,6,6,6],
      [6,7,6,6,6,6,6,6,6,6,7,6],
    ],
  },
  {
    key: 'f_curly_mid', name: 'Curly Medium', nameFr: 'Mi-Long Bouclé',
    gender: 'female', rarity: 'common', levelRequired: 8,
    rows: [
      [0,0,6,7,6,6,6,6,7,6,0,0],
      [0,6,7,6,7,6,6,7,6,7,6,0],
      [0,6,6,7,6,6,6,6,7,6,6,0],
      [0,7,6,6,6,6,6,6,6,6,7,0],
    ],
  },
  {
    key: 'f_bangs', name: 'Straight Bangs', nameFr: 'Frange Droite',
    gender: 'female', rarity: 'common', levelRequired: 6,
    rows: [
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [0,7,6,6,6,6,6,6,6,6,7,0],
    ],
  },
  {
    key: 'f_bun', name: 'Bun', nameFr: 'Chignon',
    gender: 'female', rarity: 'uncommon', levelRequired: 12,
    rows: [
      [0,0,0,0,6,6,6,6,0,0,0,0],
      [0,0,0,6,6,7,7,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,7,6,6,6,6,6,6,6,6,7,0],
    ],
  },
  {
    key: 'f_pigtails', name: 'Pigtails', nameFr: 'Couettes',
    gender: 'female', rarity: 'uncommon', levelRequired: 14,
    rows: [
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [6,7,6,6,6,6,6,6,6,6,7,6],
    ],
  },
  {
    key: 'f_pixie', name: 'Pixie Cut', nameFr: 'Coupe Pixie',
    gender: 'female', rarity: 'uncommon', levelRequired: 16,
    rows: [
      [0,0,0,0,6,6,6,6,0,0,0,0],
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,0,7,6,6,6,6,6,6,7,0,0],
    ],
  },
  {
    key: 'f_sideshave', name: 'Side Shave', nameFr: 'Côté Rasé',
    gender: 'female', rarity: 'uncommon', levelRequired: 18,
    rows: [
      [0,0,6,6,6,6,6,6,0,0,0,0],
      [0,6,6,6,6,6,6,6,0,0,0,0],
      [0,6,6,6,6,6,6,6,7,7,0,0],
      [0,7,6,6,6,6,6,6,7,7,0,0],
    ],
  },
  {
    key: 'f_crown_braid', name: 'Crown Braid', nameFr: 'Tresse Couronne',
    gender: 'female', rarity: 'rare', levelRequired: 20,
    rows: [
      [0,0,6,7,6,7,7,6,7,6,0,0],
      [0,6,7,6,6,6,6,6,6,7,6,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [0,7,6,6,6,6,6,6,6,6,7,0],
    ],
  },
  {
    key: 'f_waterfall', name: 'Waterfall', nameFr: 'Cascade',
    gender: 'female', rarity: 'rare', levelRequired: 25,
    rows: [
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,6,7,6,6,6,6,7,6,6,0],
      [6,6,7,6,6,6,6,6,6,7,6,6],
      [7,6,6,6,6,6,6,6,6,6,6,7],
    ],
  },
  {
    key: 'f_elegant', name: 'Elegant Updo', nameFr: 'Chignon Élégant',
    gender: 'female', rarity: 'rare', levelRequired: 30,
    rows: [
      [0,0,0,6,7,6,6,7,6,0,0,0],
      [0,0,6,6,6,7,7,6,6,6,0,0],
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,0,7,6,6,6,6,6,6,7,0,0],
    ],
  },
  {
    key: 'f_space_buns', name: 'Space Buns', nameFr: 'Macarons',
    gender: 'female', rarity: 'rare', levelRequired: 35,
    rows: [
      [0,0,6,6,0,0,0,0,6,6,0,0],
      [0,0,6,7,6,6,6,6,7,6,0,0],
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [0,7,6,6,6,6,6,6,6,6,7,0],
    ],
  },
  {
    key: 'f_warrior', name: 'Warrior Braids', nameFr: 'Tresses Guerrière',
    gender: 'female', rarity: 'epic', levelRequired: 40,
    rows: [
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [0,6,7,6,7,6,6,7,6,7,6,0],
      [0,6,6,7,6,6,6,6,7,6,6,0],
      [6,7,6,6,6,6,6,6,6,6,7,6],
    ],
  },
  {
    key: 'f_mermaid', name: 'Mermaid Waves', nameFr: 'Vagues Sirène',
    gender: 'female', rarity: 'epic', levelRequired: 50,
    rows: [
      [0,0,6,6,6,6,6,6,6,6,0,0],
      [0,6,7,6,7,6,6,7,6,7,6,0],
      [6,6,6,7,6,7,7,6,7,6,6,6],
      [7,6,7,6,6,6,6,6,6,7,6,7],
    ],
  },
  {
    key: 'f_empress', name: 'Empress Hair', nameFr: 'Coiffure Impératrice',
    gender: 'female', rarity: 'epic', levelRequired: 60,
    rows: [
      [0,6,6,6,6,6,6,6,6,6,6,0],
      [6,6,7,6,7,6,6,7,6,7,6,6],
      [6,7,6,6,6,6,6,6,6,6,7,6],
      [7,6,6,6,6,6,6,6,6,6,6,7],
    ],
  },
  {
    key: 'f_starlight', name: 'Starlight Flow', nameFr: 'Flux Stellaire',
    gender: 'female', rarity: 'legendary', levelRequired: 75,
    rows: [
      [6,6,6,6,6,6,6,6,6,6,6,6],
      [6,7,6,7,6,7,7,6,7,6,7,6],
      [6,6,7,6,6,6,6,6,6,7,6,6],
      [7,6,6,6,6,6,6,6,6,6,6,7],
    ],
  },
  {
    key: 'f_divine', name: 'Divine Cascade', nameFr: 'Cascade Divine',
    gender: 'female', rarity: 'legendary', levelRequired: 100,
    rows: [
      [6,6,6,6,6,6,6,6,6,6,6,6],
      [6,7,6,7,6,7,7,6,7,6,7,6],
      [6,6,7,6,7,6,6,7,6,7,6,6],
      [7,6,6,7,6,6,6,6,7,6,6,7],
    ],
  },
];

// ── Unisex Hairstyles ──────────────────────────────────────
export const UNISEX_HAIRSTYLES: HairStyle[] = [
  {
    key: 'u_shaved_sides', name: 'Shaved Sides', nameFr: 'Côtés Rasés',
    gender: 'unisex', rarity: 'uncommon', levelRequired: 13,
    rows: [
      [0,0,0,0,6,6,6,6,0,0,0,0],
      [0,0,0,6,6,6,6,6,6,0,0,0],
      [0,0,7,6,6,6,6,6,6,7,0,0],
      [0,0,7,7,6,6,6,6,7,7,0,0],
    ],
  },
  {
    key: 'u_wild', name: 'Wild Style', nameFr: 'Sauvage',
    gender: 'unisex', rarity: 'rare', levelRequired: 22,
    rows: [
      [0,6,0,6,6,6,6,6,6,0,6,0],
      [6,6,6,6,7,6,6,7,6,6,6,6],
      [0,6,6,7,6,6,6,6,7,6,6,0],
      [6,7,6,6,6,6,6,6,6,6,7,6],
    ],
  },
];

export function getHairstylesForGender(gender: AvatarGender): HairStyle[] {
  const genderStyles = gender === 'male' ? MALE_HAIRSTYLES : FEMALE_HAIRSTYLES;
  return [...genderStyles, ...UNISEX_HAIRSTYLES];
}

export function getHairStyleSprite(gender: AvatarGender, hairStyleIndex: number): number[][] | null {
  const styles = getHairstylesForGender(gender);
  const style = styles[hairStyleIndex];
  if (!style) return null;
  return style.rows;
}
