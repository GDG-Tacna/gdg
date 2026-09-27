// Retro 2D Pixel Art Character Generator Engine
// Creates authentic, personalized 2D pixel art character sprites (40x56 grid scaled with Nearest-Neighbor)
// Accurately reflects facial similarity (gender presentation, face shape, hair silhouette/color, eyes, eyebrows, lips, expression, glasses, beard)
// Strictly dressed in a Polera (T-Shirt) in the detected clothing color, and Black Pants.

import type { DetectedFeatures } from './featureDetector';

export interface Character2DOptions {
  name?: string;
  role?: string;
  pose?: 'idle' | 'wave' | 'dev' | 'victory';
  accessory?: 'none' | 'lanyard' | 'coffee' | 'laptop' | 'gamepad' | 'sword';
  gender?: 'female' | 'male';
  beardStyle?: 'full' | 'goatee' | 'mustache' | 'stubble';
  showShadow?: boolean;
  showNameTag?: boolean;
  backgroundColor?: string;
  animationFrame?: number; // 0, 1 for breathing bob
  isBlinking?: boolean;
}

export const DEFAULT_CHARACTER_2D_OPTIONS: Character2DOptions = {
  name: 'DEV_HERO',
  role: 'GDG TACNA',
  pose: 'idle',
  accessory: 'lanyard',
  showShadow: true,
  showNameTag: true,
  backgroundColor: '#121318',
  animationFrame: 0,
  isBlinking: false
};

// Helper: Hex color shading
export function shadeColor(color: string, percent: number): string {
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const num = parseInt(hex, 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function p(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/**
 * 2D Pixel Character Sprite Renderer with Authentic Facial Similarity
 */
export function renderPixelCharacter2D(
  targetCanvas: HTMLCanvasElement,
  features: DetectedFeatures,
  opts: Partial<Character2DOptions> = {}
) {
  const options: Character2DOptions = { ...DEFAULT_CHARACTER_2D_OPTIONS, ...opts };
  const targetCtx = targetCanvas.getContext('2d');
  if (!targetCtx) return;

  const SPRITE_W = 40;
  const SPRITE_H = 56;

  const offscreen = document.createElement('canvas');
  offscreen.width = SPRITE_W;
  offscreen.height = SPRITE_H;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return;

  // Background
  if (options.backgroundColor && options.backgroundColor !== 'transparent') {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, SPRITE_W, SPRITE_H);
  } else {
    ctx.clearRect(0, 0, SPRITE_W, SPRITE_H);
  }

  // Determine gender presentation
  const isFemale = (options.gender || features.gender) === 'female';

  // Palettes
  const skin = features.skinColor || '#D6895A';
  const skinShadow = shadeColor(skin, -22);
  const skinHighlight = shadeColor(skin, 16);
  const skinBlush = isFemale ? '#F4929D' : shadeColor(skin, -12);

  const hair = features.hairColor || '#2B1B17';
  const hairDark = shadeColor(hair, -28);
  const hairLight = shadeColor(hair, 24);

  // Lip colors
  const lipColor = features.lipColor || (isFemale ? '#C83E58' : '#933835');
  const lipDark = shadeColor(lipColor, -25);

  // Clothing: Strictly Polera in detected color
  const cloth = features.clothingColor || '#4285F4';
  const clothDark = shadeColor(cloth, -25);

  // Pants: Strictly Black
  const pants = '#111116';
  const pantsDark = '#09090C';
  const pantsLight = '#232530';

  // Breathing animation offset
  const bobY = options.animationFrame === 1 ? -1 : 0;
  const headBobY = bobY;

  // 0. Floor Drop Shadow
  if (options.showShadow) {
    rect(ctx, 11, 52, 18, 3, 'rgba(0, 0, 0, 0.45)');
    rect(ctx, 13, 51, 14, 1, 'rgba(0, 0, 0, 0.25)');
    rect(ctx, 13, 55, 14, 1, 'rgba(0, 0, 0, 0.25)');
  }

  // 1. BACK HAIR LAYER (Falls behind shoulders/torso for medium & long hairstyles)
  const hairLength = features.hairLength || (isFemale ? 'long' : 'short');
  const hairStyle = features.hairStyle || (isFemale ? 'long' : 'short');

  if (hairLength === 'long' || hairStyle === 'long') {
    rect(ctx, 6, 12, 28, 18, hair);
    rect(ctx, 5, 16, 30, 14, hairDark);
  } else if (hairLength === 'medium') {
    rect(ctx, 7, 12, 26, 12, hair);
  }

  // 2. BLACK PANTS (STRICTLY ALWAYS BLACK) (Y=42 to Y=50)
  // Belt
  rect(ctx, 13, 42, 14, 1, '#1A1816');
  rect(ctx, 18, 42, 4, 1, '#C5A059'); // Buckle

  // Left & Right Leg Base
  rect(ctx, 13, 43, 6, 8, pants); // Left leg
  rect(ctx, 21, 43, 6, 8, pants); // Right leg

  // Inseam gap shadow
  rect(ctx, 19, 44, 2, 7, 'rgba(0, 0, 0, 0.85)');

  // Black Pants subtle folds
  rect(ctx, 13, 43, 1, 8, pantsDark);
  rect(ctx, 26, 43, 1, 8, pantsDark);
  rect(ctx, 14, 46, 4, 1, pantsLight);
  rect(ctx, 22, 46, 4, 1, pantsLight);

  // 3. RETRO SNEAKERS (Y=51 to Y=54)
  rect(ctx, 12, 51, 7, 2, '#1E2028');
  rect(ctx, 11, 53, 8, 1, '#FFFFFF'); // White sole
  rect(ctx, 11, 54, 8, 1, '#A0A4AE');
  p(ctx, 15, 51, '#4285F4'); // Google Blue lace

  rect(ctx, 21, 51, 7, 2, '#1E2028');
  rect(ctx, 21, 53, 8, 1, '#FFFFFF');
  rect(ctx, 21, 54, 8, 1, '#A0A4AE');
  p(ctx, 24, 51, '#EA4335'); // Google Red lace

  // 4. TORSO: STRICTLY POLERA (T-SHIRT) IN DETECTED COLOR (Y=26+bobY to Y=41+bobY)
  const ty = 26 + bobY;

  if (isFemale) {
    // Feminine tailored Polera (14px wide at waist with soft curves)
    rect(ctx, 13, ty + 1, 14, 15, cloth);
    rect(ctx, 13, ty + 1, 1, 15, clothDark);
    rect(ctx, 26, ty + 1, 1, 15, clothDark);
    rect(ctx, 14, ty + 15, 12, 1, clothDark);

    // Feminine scooped neckline revealing delicate collarbone skin
    rect(ctx, 17, ty, 6, 3, skin);
    p(ctx, 18, ty + 3, skinShadow);
    p(ctx, 21, ty + 3, skinShadow);
    rect(ctx, 16, ty + 1, 1, 2, clothDark);
    rect(ctx, 23, ty + 1, 1, 2, clothDark);
  } else {
    // Classic masculine cut Polera (16px wide boxy fit)
    rect(ctx, 12, ty + 1, 16, 15, cloth);
    rect(ctx, 12, ty + 1, 1, 15, clothDark);
    rect(ctx, 27, ty + 1, 1, 15, clothDark);
    rect(ctx, 13, ty + 15, 14, 1, clothDark);

    // Crew neckline cutout
    rect(ctx, 17, ty, 6, 2, skin);
    p(ctx, 18, ty + 2, skin);
    p(ctx, 21, ty + 2, skin);
    rect(ctx, 16, ty + 1, 1, 2, clothDark);
    rect(ctx, 23, ty + 1, 1, 2, clothDark);
    rect(ctx, 17, ty + 2, 6, 1, clothDark);
  }

  // Subtle Google GDG 4-color chest emblem
  p(ctx, 15, ty + 6, '#4285F4'); // Blue
  p(ctx, 16, ty + 6, '#EA4335'); // Red
  p(ctx, 15, ty + 7, '#FBBC05'); // Yellow
  p(ctx, 16, ty + 7, '#34A853'); // Green

  // 5. ARMS & HANDS (POLERA SHORT SLEEVES: BARE ARMS IN DETECTED SKIN TONE)
  const pose = options.pose || 'idle';

  if (isFemale) {
    // Feminine Arms & Hands (slightly more slender)
    // Left Arm
    rect(ctx, 9, ty + 1, 4, 4, cloth);
    rect(ctx, 9, ty + 1, 1, 4, clothDark);
    rect(ctx, 9, ty + 5, 3, 7, skin);
    rect(ctx, 9, ty + 5, 1, 7, skinShadow);
    rect(ctx, 9, ty + 12, 3, 3, skin);
    rect(ctx, 9, ty + 12, 1, 3, skinShadow);

    // Right Arm
    if (pose === 'wave') {
      rect(ctx, 27, ty - 2, 4, 4, cloth);
      rect(ctx, 29, ty - 6, 3, 5, skin);
      rect(ctx, 30, ty - 10, 3, 4, skin);
      p(ctx, 29, ty - 9, skin);
      p(ctx, 35, ty - 11, '#FBBC05');
    } else if (pose === 'victory') {
      rect(ctx, 27, ty + 1, 4, 4, cloth);
      rect(ctx, 28, ty + 5, 3, 4, skin);
      rect(ctx, 28, ty + 8, 3, 4, skin);
      p(ctx, 29, ty + 6, skin);
    } else {
      rect(ctx, 27, ty + 1, 4, 4, cloth);
      rect(ctx, 30, ty + 1, 1, 4, clothDark);
      rect(ctx, 28, ty + 5, 3, 7, skin);
      rect(ctx, 30, ty + 5, 1, 7, skinShadow);
      rect(ctx, 28, ty + 12, 3, 3, skin);
      rect(ctx, 30, ty + 12, 1, 3, skinShadow);
    }
  } else {
    // Classic Male Arms & Hands
    // Left Arm
    rect(ctx, 8, ty + 1, 4, 5, cloth);
    rect(ctx, 8, ty + 1, 1, 5, clothDark);
    rect(ctx, 8, ty + 6, 4, 6, skin);
    rect(ctx, 8, ty + 6, 1, 6, skinShadow);
    rect(ctx, 8, ty + 12, 4, 3, skin);
    rect(ctx, 8, ty + 12, 1, 3, skinShadow);

    // Right Arm
    if (pose === 'wave') {
      rect(ctx, 28, ty - 2, 4, 4, cloth);
      rect(ctx, 30, ty - 6, 4, 5, skin);
      rect(ctx, 31, ty - 10, 4, 4, skin);
      p(ctx, 30, ty - 9, skin);
      p(ctx, 36, ty - 11, '#FBBC05');
    } else if (pose === 'victory') {
      rect(ctx, 28, ty + 1, 4, 4, cloth);
      rect(ctx, 28, ty + 5, 4, 4, skin);
      rect(ctx, 27, ty + 8, 4, 4, skin);
      p(ctx, 28, ty + 6, skin);
    } else {
      rect(ctx, 28, ty + 1, 4, 5, cloth);
      rect(ctx, 31, ty + 1, 1, 5, clothDark);
      rect(ctx, 28, ty + 6, 4, 6, skin);
      rect(ctx, 31, ty + 6, 1, 6, skinShadow);
      rect(ctx, 28, ty + 12, 4, 3, skin);
      rect(ctx, 31, ty + 12, 1, 3, skinShadow);
    }
  }

  // 6. ACCESSORIES
  if (options.accessory === 'lanyard') {
    rect(ctx, 17, ty + 1, 1, 9, '#EA4335'); // Google Red ribbon
    rect(ctx, 22, ty + 1, 1, 9, '#4285F4'); // Google Blue ribbon
    rect(ctx, 18, ty + 9, 4, 5, '#FFFFFF'); // ID Badge
    rect(ctx, 18, ty + 9, 4, 1, '#1A1C20');
    p(ctx, 19, ty + 11, '#4285F4');
    p(ctx, 20, ty + 11, '#EA4335');
    p(ctx, 19, ty + 12, '#FBBC05');
    p(ctx, 20, ty + 12, '#34A853');
  } else if (options.accessory === 'coffee' || pose === 'dev') {
    const cx = pose === 'wave' ? 8 : 26;
    const cy = ty + 10;
    rect(ctx, cx, cy, 5, 5, '#FFFFFF');
    p(ctx, cx + 5, cy + 1, '#FFFFFF');
    p(ctx, cx + 5, cy + 3, '#FFFFFF');
    rect(ctx, cx + 1, cy, 3, 1, '#5C3820');
    p(ctx, cx + 2, cy + 2, '#4285F4');
    p(ctx, cx + 2, cy - 2, 'rgba(255, 255, 255, 0.7)');
  } else if (options.accessory === 'laptop') {
    rect(ctx, 14, ty + 8, 12, 7, '#1F2428');
    rect(ctx, 15, ty + 9, 10, 5, '#4285F4');
    p(ctx, 19, ty + 11, '#FFFFFF');
    rect(ctx, 12, ty + 14, 16, 2, '#374151');
  } else if (options.accessory === 'gamepad') {
    rect(ctx, 15, ty + 9, 10, 5, '#20222A');
    p(ctx, 17, ty + 11, '#EA4335');
    p(ctx, 22, ty + 10, '#34A853');
    p(ctx, 23, ty + 11, '#FBBC05');
  } else if (options.accessory === 'sword') {
    rect(ctx, 29, ty + 2, 2, 10, '#4BEDD7');
    p(ctx, 30, ty + 1, '#FFFFFF');
    rect(ctx, 28, ty + 11, 4, 1, '#633F27');
    rect(ctx, 29, ty + 12, 2, 3, '#866043');
  }

  // 7. NECK
  const hy = headBobY;
  if (isFemale) {
    rect(ctx, 18, 24 + hy, 4, 3, skinShadow); // Slender 4px neck
  } else {
    rect(ctx, 17, 24 + hy, 6, 3, skinShadow); // Classic 6px neck
  }

  // 8. DYNAMIC FACE SHAPE & JAWLINE
  const faceShape = features.faceShape || 'oval';

  if (isFemale) {
    // Feminine Face: 18px width, soft rounded cheeks, elegant jawline
    rect(ctx, 11, 7 + hy, 18, 16, skin);
    rect(ctx, 12, 23 + hy, 16, 1, skin);
    rect(ctx, 14, 24 + hy, 12, 1, skin);
    rect(ctx, 16, 25 + hy, 8, 1, skinShadow); // Soft rounded chin
  } else {
    // Masculine Face: 20px width with structured jawlines
    if (faceShape === 'square') {
      rect(ctx, 10, 7 + hy, 20, 17, skin);
      rect(ctx, 11, 24 + hy, 18, 1, skin);
      rect(ctx, 14, 25 + hy, 12, 1, skinShadow);
    } else if (faceShape === 'round') {
      rect(ctx, 9, 7 + hy, 22, 16, skin);
      rect(ctx, 11, 23 + hy, 18, 1, skin);
      rect(ctx, 13, 24 + hy, 14, 1, skin);
      rect(ctx, 16, 25 + hy, 8, 1, skinShadow);
    } else if (faceShape === 'slim') {
      rect(ctx, 11, 7 + hy, 18, 16, skin);
      rect(ctx, 12, 23 + hy, 16, 1, skin);
      rect(ctx, 14, 24 + hy, 12, 1, skin);
      rect(ctx, 17, 25 + hy, 6, 1, skinShadow);
    } else {
      rect(ctx, 10, 7 + hy, 20, 17, skin);
      rect(ctx, 12, 24 + hy, 16, 1, skin);
      rect(ctx, 15, 25 + hy, 10, 1, skinShadow);
    }
  }

  // Ears & Earrings
  rect(ctx, 9, 15 + hy, 2, 4, skin);
  p(ctx, 9, 16 + hy, skinShadow);
  rect(ctx, 29, 15 + hy, 2, 4, skin);
  p(ctx, 30, 16 + hy, skinShadow);

  // Earrings (Gold hoops if female or detected)
  if (isFemale || features.hasEarrings) {
    p(ctx, 9, 18 + hy, '#F7D046');
    p(ctx, 9, 19 + hy, '#D4A017');
    p(ctx, 30, 18 + hy, '#F7D046');
    p(ctx, 30, 19 + hy, '#D4A017');
  }

  // Cheeks & Highlights
  rect(ctx, 14, 8 + hy, 12, 2, skinHighlight);
  if (isFemale) {
    // Rosy feminine blush
    rect(ctx, 12, 19 + hy, 2, 2, skinBlush);
    rect(ctx, 26, 19 + hy, 2, 2, skinBlush);
  } else {
    rect(ctx, 11, 19 + hy, 2, 2, skinBlush);
    rect(ctx, 27, 19 + hy, 2, 2, skinBlush);
  }

  // 9. EYES & EYEBROWS (GENDER STYLING + EYE COLOR + EYEBROW THICKNESS)
  const eyeColor = features.eyeColor || '#2B1D16';
  const browThickness = features.eyebrowThickness || 'medium';

  // Eyebrows
  if (isFemale) {
    // Elegant arched feminine eyebrows
    rect(ctx, 13, 13 + hy, 4, 1, hair);
    p(ctx, 12, 14 + hy, hair);
    rect(ctx, 23, 13 + hy, 4, 1, hair);
    p(ctx, 27, 14 + hy, hair);
  } else {
    // Masculine eyebrows
    if (browThickness === 'thick') {
      rect(ctx, 12, 13 + hy, 5, 2, hair);
      rect(ctx, 23, 13 + hy, 5, 2, hair);
    } else if (browThickness === 'thin') {
      rect(ctx, 13, 14 + hy, 4, 1, hair);
      rect(ctx, 23, 14 + hy, 4, 1, hair);
    } else {
      rect(ctx, 13, 13 + hy, 4, 1, hair);
      rect(ctx, 13, 14 + hy, 4, 1, hair);
      rect(ctx, 23, 13 + hy, 4, 1, hair);
      rect(ctx, 23, 14 + hy, 4, 1, hair);
    }
  }

  if (options.isBlinking) {
    // Blinking eye slit
    rect(ctx, 13, 17 + hy, 4, 1, hairDark);
    rect(ctx, 23, 17 + hy, 4, 1, hairDark);
  } else {
    if (isFemale) {
      // Feminine Eyes with delicate eyeliner and outer winged eyelash!
      // Left Eye
      rect(ctx, 13, 15 + hy, 4, 1, '#111216'); // Upper lashline
      p(ctx, 12, 15 + hy, '#111216');          // Winged eyelash flick!
      rect(ctx, 13, 16 + hy, 4, 3, '#FFFFFF'); // Sclera (White)
      rect(ctx, 14, 16 + hy, 2, 2, '#111216'); // Pupil
      p(ctx, 15, 17 + hy, eyeColor);           // Personal Iris Color
      p(ctx, 14, 16 + hy, '#FFFFFF');          // Specular catchlight

      // Right Eye
      rect(ctx, 23, 15 + hy, 4, 1, '#111216');
      p(ctx, 27, 15 + hy, '#111216');          // Winged eyelash flick!
      rect(ctx, 23, 16 + hy, 4, 3, '#FFFFFF');
      rect(ctx, 24, 16 + hy, 2, 2, '#111216');
      p(ctx, 25, 17 + hy, eyeColor);
      p(ctx, 24, 16 + hy, '#FFFFFF');
    } else {
      // Masculine Classic Pixel Eyes
      // Left Eye
      rect(ctx, 13, 16 + hy, 4, 3, '#FFFFFF');
      rect(ctx, 14, 16 + hy, 2, 2, '#111216');
      p(ctx, 15, 17 + hy, eyeColor);
      p(ctx, 14, 16 + hy, '#FFFFFF');

      // Right Eye
      rect(ctx, 23, 16 + hy, 4, 3, '#FFFFFF');
      rect(ctx, 24, 16 + hy, 2, 2, '#111216');
      p(ctx, 25, 17 + hy, eyeColor);
      p(ctx, 24, 16 + hy, '#FFFFFF');
    }
  }

  // Nose Definition
  p(ctx, 19, 19 + hy, skinShadow);
  p(ctx, 20, 19 + hy, skinShadow);
  if (!isFemale) {
    p(ctx, 20, 20 + hy, skinShadow);
  }

  // 10. MOUTH & SMILE EXPRESSION (FEMININE LIPSTICK VS MASCULINE)
  const expression = features.expression || 'smile';

  if (isFemale) {
    // Feminine Lips with detected Lipstick color
    if (expression === 'open-smile' || expression === 'smile') {
      rect(ctx, 17, 21 + hy, 6, 1, lipColor); // Upper lip
      rect(ctx, 17, 22 + hy, 6, 2, lipColor); // Lower lip base
      rect(ctx, 18, 22 + hy, 4, 1, '#FFFFFF'); // Radiant white teeth!
      p(ctx, 17, 22 + hy, lipDark); // Smile corners
      p(ctx, 22, 22 + hy, lipDark);
      rect(ctx, 18, 23 + hy, 4, 1, lipColor);
    } else {
      rect(ctx, 17, 22 + hy, 6, 1, lipColor);
      rect(ctx, 18, 23 + hy, 4, 1, lipDark);
    }
  } else {
    // Masculine Mouth
    if (expression === 'open-smile') {
      rect(ctx, 17, 22 + hy, 6, 2, '#933835');
      rect(ctx, 18, 22 + hy, 4, 1, '#FFFFFF');
    } else if (expression === 'neutral') {
      rect(ctx, 18, 22 + hy, 4, 1, '#933835');
    } else {
      rect(ctx, 18, 22 + hy, 4, 1, '#933835');
      p(ctx, 17, 21 + hy, '#933835');
      p(ctx, 22, 21 + hy, '#933835');
      p(ctx, 19, 22 + hy, '#FFFFFF');
      p(ctx, 20, 22 + hy, '#FFFFFF');
    }
  }

  // 11. GLASSES (SI LLEVA O NO LENTES)
  if (features.hasGlasses) {
    const frameColor = features.glassesFrameColor || '#1E232B';
    const glassTint = 'rgba(195, 230, 255, 0.35)';

    // Left Rim
    rect(ctx, 12, 15 + hy, 6, 1, frameColor);
    rect(ctx, 12, 19 + hy, 6, 1, frameColor);
    rect(ctx, 12, 15 + hy, 1, 5, frameColor);
    rect(ctx, 17, 15 + hy, 1, 5, frameColor);
    rect(ctx, 13, 16 + hy, 4, 3, glassTint);
    p(ctx, 13, 16 + hy, '#FFFFFF'); // Glare

    // Right Rim
    rect(ctx, 22, 15 + hy, 6, 1, frameColor);
    rect(ctx, 22, 19 + hy, 6, 1, frameColor);
    rect(ctx, 22, 15 + hy, 1, 5, frameColor);
    rect(ctx, 27, 15 + hy, 1, 5, frameColor);
    rect(ctx, 23, 16 + hy, 4, 3, glassTint);
    p(ctx, 23, 16 + hy, '#FFFFFF'); // Glare

    // Bridge & Temples
    rect(ctx, 18, 17 + hy, 4, 1, frameColor);
    rect(ctx, 10, 16 + hy, 2, 1, frameColor);
    rect(ctx, 28, 16 + hy, 2, 1, frameColor);
  }

  // 12. BEARD & FACIAL HAIR (STRICTLY DISABLED FOR FEMALE PORTRAITS)
  const shouldRenderBeard = !isFemale && (features.hasBeard || !!options.beardStyle);

  if (shouldRenderBeard) {
    const bStyle = options.beardStyle || features.beardStyle || 'full';

    if (bStyle === 'mustache') {
      rect(ctx, 16, 21 + hy, 8, 2, hair);
      p(ctx, 15, 22 + hy, hairDark);
      p(ctx, 24, 22 + hy, hairDark);
    } else if (bStyle === 'goatee') {
      rect(ctx, 16, 21 + hy, 8, 1, hair);
      rect(ctx, 16, 22 + hy, 1, 3, hair);
      rect(ctx, 23, 22 + hy, 1, 3, hair);
      rect(ctx, 17, 24 + hy, 6, 2, hair);
      rect(ctx, 18, 26 + hy, 4, 1, hairDark);
    } else if (bStyle === 'stubble') {
      for (let by = 21; by <= 24; by++) {
        for (let bx = 12; bx <= 27; bx++) {
          if ((bx + by) % 2 === 0) {
            p(ctx, bx, by + hy, hairDark);
          }
        }
      }
    } else {
      // Full Beard
      rect(ctx, 16, 21 + hy, 8, 1, hair);
      rect(ctx, 14, 23 + hy, 12, 3, hair);
      rect(ctx, 15, 25 + hy, 10, 2, hair);
      rect(ctx, 16, 27 + hy, 8, 1, hairDark);
      rect(ctx, 11, 21 + hy, 3, 3, hair);
      rect(ctx, 26, 21 + hy, 3, 3, hair);
    }
  }

  // 13. HAIR RENDERING (CROWN, BANGS, & FLOWING LOCKS)
  const bangs = features.hairBangs || 'side-swept';
  const volume = features.hairVolume || 'medium';
  const topRise = volume === 'high' ? 4 : volume === 'low' ? 6 : 5;

  if (hairStyle === 'bald') {
    rect(ctx, 10, 6 + hy, 20, 2, hairDark);
    rect(ctx, 9, 8 + hy, 2, 7, hairDark);
    rect(ctx, 29, 8 + hy, 2, 7, hairDark);
  } else if (hairStyle === 'curly') {
    // Voluminous curly hair
    rect(ctx, 7, topRise - 2 + hy, 26, 6, hair);
    rect(ctx, 8, topRise - 3 + hy, 24, 2, hairLight);
    rect(ctx, 6, topRise + 1 + hy, 28, 4, hair);
    rect(ctx, 6, topRise + 5 + hy, 4, 6, hair);
    rect(ctx, 30, topRise + 5 + hy, 4, 6, hair);

    p(ctx, 12, topRise + hy, hairLight);
    p(ctx, 18, topRise - 1 + hy, hairLight);
    p(ctx, 25, topRise + hy, hairLight);
    p(ctx, 10, topRise + 4 + hy, hairLight);
    p(ctx, 28, topRise + 4 + hy, hairLight);

    rect(ctx, 12, 8 + hy, 4, 2, hair);
    rect(ctx, 20, 8 + hy, 5, 2, hair);
  } else {
    // Crown Base with highlights
    if (isFemale) {
      rect(ctx, 8, 4 + hy, 24, 4, hair);
      rect(ctx, 10, 3 + hy, 20, 2, hair);
      rect(ctx, 12, 3 + hy, 16, 1, hairLight);
    } else {
      rect(ctx, 9, topRise + hy, 22, 5, hair);
      rect(ctx, 12, topRise - 1 + hy, 16, 2, hairLight);
    }

    // Bangs Style matching photo
    if (bangs === 'forehead-exposed') {
      rect(ctx, 9, 8 + hy, 4, 4, hair);
      rect(ctx, 27, 8 + hy, 4, 4, hair);
      rect(ctx, 10, 7 + hy, 20, 1, hair);
    } else if (bangs === 'straight') {
      rect(ctx, 10, 8 + hy, 20, 4, hair);
      rect(ctx, 12, 12 + hy, 16, 1, hairDark);
    } else if (bangs === 'parted') {
      rect(ctx, 10, 8 + hy, 8, 4, hair);
      rect(ctx, 22, 8 + hy, 8, 4, hair);
      p(ctx, 19, 9 + hy, skin);
      p(ctx, 20, 9 + hy, skin);
    } else {
      // Side-swept bangs
      if (isFemale) {
        rect(ctx, 10, 7 + hy, 20, 2, hair);
        rect(ctx, 11, 9 + hy, 7, 2, hair);
        rect(ctx, 22, 9 + hy, 7, 2, hair);
      } else {
        rect(ctx, 10, 8 + hy, 20, 3, hair);
        rect(ctx, 12, 10 + hy, 12, 2, hair);
      }
    }

    // Sideburns
    rect(ctx, 9, 9 + hy, 2, 7, hair);
    rect(ctx, 29, 9 + hy, 2, 7, hair);

    // Flowing hair strands cascading in front of shoulders
    if (hairLength === 'long' || hairStyle === 'long') {
      if (isFemale) {
        // Cascading locks framing cheeks and resting over Polera shoulders
        // Left front lock
        rect(ctx, 6, 7 + hy, 4, 27, hair);
        rect(ctx, 7, 10 + hy, 3, 24, hair);
        rect(ctx, 8, 14 + hy, 1, 18, hairLight);
        rect(ctx, 9, 25 + hy, 2, 8, hair); // rests softly on left chest

        // Right front lock
        rect(ctx, 30, 7 + hy, 4, 27, hair);
        rect(ctx, 30, 10 + hy, 3, 24, hair);
        rect(ctx, 31, 14 + hy, 1, 18, hairLight);
        rect(ctx, 29, 25 + hy, 2, 8, hair); // rests softly on right chest
      } else {
        rect(ctx, 7, 8 + hy, 4, 20, hair);
        rect(ctx, 29, 8 + hy, 4, 20, hair);
        rect(ctx, 8, 12 + hy, 1, 16, hairDark);
        rect(ctx, 31, 12 + hy, 1, 16, hairDark);
      }
    } else if (hairLength === 'medium') {
      rect(ctx, 8, 8 + hy, 3, 14, hair);
      rect(ctx, 29, 8 + hy, 3, 14, hair);
    }
  }

  // 14. CRISP NEAREST-NEIGHBOR SCALING
  const tw = targetCanvas.width;
  const th = targetCanvas.height;

  targetCtx.imageSmoothingEnabled = false;
  // @ts-expect-error browser prefix
  targetCtx.mozImageSmoothingEnabled = false;
  // @ts-expect-error browser prefix
  targetCtx.webkitImageSmoothingEnabled = false;
  // @ts-expect-error browser prefix
  targetCtx.msImageSmoothingEnabled = false;

  targetCtx.clearRect(0, 0, tw, th);

  const scale = Math.max(1, Math.min(Math.floor(tw / SPRITE_W), Math.floor(th / SPRITE_H)));
  const scaledW = SPRITE_W * scale;
  const scaledH = SPRITE_H * scale;
  const offsetX = Math.floor((tw - scaledW) / 2);
  const offsetY = Math.floor((th - scaledH) / 2);

  targetCtx.drawImage(offscreen, 0, 0, SPRITE_W, SPRITE_H, offsetX, offsetY, scaledW, scaledH);

  // 15. RETRO FLOATING NAME TAG
  if (options.showNameTag && options.name) {
    const tagText = options.name.toUpperCase();
    targetCtx.font = '10px "Press Start 2P", monospace, sans-serif';
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';

    const textMetrics = targetCtx.measureText(tagText);
    const tagW = textMetrics.width + 16;
    const tagH = 18;
    const tagX = tw / 2;
    const tagY = Math.max(16, offsetY - 14);

    targetCtx.fillStyle = '#000000';
    targetCtx.fillRect(tagX - tagW / 2, tagY - tagH / 2, tagW, tagH);

    targetCtx.strokeStyle = isFemale ? '#EA4335' : '#34A853';
    targetCtx.lineWidth = 2;
    targetCtx.strokeRect(tagX - tagW / 2, tagY - tagH / 2, tagW, tagH);

    targetCtx.fillStyle = isFemale ? '#FF7A90' : '#55FF55';
    targetCtx.fillText(tagText, tagX, tagY);
  }
}

export function exportCharacter2DPng(
  features: DetectedFeatures,
  options: Partial<Character2DOptions> = {},
  exportWidth = 640,
  exportHeight = 896
): string {
  const canvas = document.createElement('canvas');
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  renderPixelCharacter2D(canvas, features, options);
  return canvas.toDataURL('image/png');
}
