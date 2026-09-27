// Retro 2D Pixel Art Character Generator Engine
// Creates authentic, personalized 2D pixel art character sprites (40x56 grid scaled with Nearest-Neighbor)
// Accurately reflects facial similarity (face shape, hair silhouette/color, eyes, eyebrows, expression, glasses, beard)
// Strictly dressed in a Polera (T-Shirt) in the detected clothing color, and Black Pants.

import type { DetectedFeatures } from './featureDetector';

export interface Character2DOptions {
  name?: string;
  role?: string;
  pose?: 'idle' | 'wave' | 'dev' | 'victory';
  accessory?: 'none' | 'lanyard' | 'coffee' | 'laptop' | 'gamepad' | 'sword';
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
 * 2D Pixel Character Sprite Renderer with Facial Similarity
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

  // Palettes
  const skin = features.skinColor || '#D6895A';
  const skinShadow = shadeColor(skin, -22);
  const skinHighlight = shadeColor(skin, 16);
  const skinBlush = shadeColor(skin, -12);

  const hair = features.hairColor || '#2B1B17';
  const hairDark = shadeColor(hair, -28);
  const hairLight = shadeColor(hair, 22);

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

  // 1. BLACK PANTS (STRICTLY ALWAYS BLACK) (Y=42 to Y=50)
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

  // 2. RETRO SNEAKERS (Y=51 to Y=54)
  rect(ctx, 12, 51, 7, 2, '#1E2028');
  rect(ctx, 11, 53, 8, 1, '#FFFFFF'); // White sole
  rect(ctx, 11, 54, 8, 1, '#A0A4AE');
  p(ctx, 15, 51, '#4285F4'); // Google Blue lace

  rect(ctx, 21, 51, 7, 2, '#1E2028');
  rect(ctx, 21, 53, 8, 1, '#FFFFFF');
  rect(ctx, 21, 54, 8, 1, '#A0A4AE');
  p(ctx, 24, 51, '#EA4335'); // Google Red lace

  // 3. TORSO: STRICTLY POLERA (T-SHIRT) IN DETECTED COLOR (Y=26+bobY to Y=41+bobY)
  const ty = 26 + bobY;

  // Base Polera Body (X=12 to X=27)
  rect(ctx, 12, ty + 1, 16, 15, cloth);

  // Shading & Outlines
  rect(ctx, 12, ty + 1, 1, 15, clothDark);
  rect(ctx, 27, ty + 1, 1, 15, clothDark);
  rect(ctx, 13, ty + 15, 14, 1, clothDark);

  // Crew Neckline Cutout (revealing neck skin tone at throat)
  rect(ctx, 17, ty, 6, 2, skin);
  p(ctx, 18, ty + 2, skin);
  p(ctx, 21, ty + 2, skin);

  // Ribbed collar trim
  rect(ctx, 16, ty + 1, 1, 2, clothDark);
  rect(ctx, 23, ty + 1, 1, 2, clothDark);
  rect(ctx, 17, ty + 2, 6, 1, clothDark);

  // Subtle Google GDG 4-color chest emblem
  p(ctx, 15, ty + 6, '#4285F4'); // Blue
  p(ctx, 16, ty + 6, '#EA4335'); // Red
  p(ctx, 15, ty + 7, '#FBBC05'); // Yellow
  p(ctx, 16, ty + 7, '#34A853'); // Green

  // 4. ARMS & HANDS (POLERA SHORT SLEEVES: BARE ARMS IN DETECTED SKIN TONE)
  const pose = options.pose || 'idle';

  // Left Arm
  // Short sleeve
  rect(ctx, 8, ty + 1, 4, 5, cloth);
  rect(ctx, 8, ty + 1, 1, 5, clothDark);
  // Bare Arm in Skin Tone
  rect(ctx, 8, ty + 6, 4, 6, skin);
  rect(ctx, 8, ty + 6, 1, 6, skinShadow);
  // Left Hand
  rect(ctx, 8, ty + 12, 4, 3, skin);
  rect(ctx, 8, ty + 12, 1, 3, skinShadow);

  // Right Arm (adapts to Pose)
  if (pose === 'wave') {
    // Wave pose: raised arm
    rect(ctx, 28, ty - 2, 4, 4, cloth);
    rect(ctx, 30, ty - 6, 4, 5, skin);
    rect(ctx, 31, ty - 10, 4, 4, skin);
    p(ctx, 30, ty - 9, skin); // Thumb
    p(ctx, 36, ty - 11, '#FBBC05');
  } else if (pose === 'victory') {
    // Victory pose: thumbs up
    rect(ctx, 28, ty + 1, 4, 4, cloth);
    rect(ctx, 28, ty + 5, 4, 4, skin);
    rect(ctx, 27, ty + 8, 4, 4, skin);
    p(ctx, 28, ty + 6, skin);
  } else {
    // Idle / Dev: resting right arm
    rect(ctx, 28, ty + 1, 4, 5, cloth);
    rect(ctx, 31, ty + 1, 1, 5, clothDark);
    rect(ctx, 28, ty + 6, 4, 6, skin);
    rect(ctx, 31, ty + 6, 1, 6, skinShadow);
    rect(ctx, 28, ty + 12, 4, 3, skin);
    rect(ctx, 31, ty + 12, 1, 3, skinShadow);
  }

  // 5. ACCESSORIES
  if (options.accessory === 'lanyard') {
    rect(ctx, 16, ty + 1, 1, 9, '#EA4335'); // Google Red ribbon
    rect(ctx, 23, ty + 1, 1, 9, '#4285F4'); // Google Blue ribbon
    rect(ctx, 18, ty + 10, 4, 5, '#FFFFFF'); // ID Badge
    rect(ctx, 18, ty + 10, 4, 1, '#1A1C20');
    p(ctx, 19, ty + 12, '#4285F4');
    p(ctx, 20, ty + 12, '#EA4335');
    p(ctx, 19, ty + 13, '#FBBC05');
    p(ctx, 20, ty + 13, '#34A853');
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
    p(ctx, 17, ty + 11, '#EA4335'); // D-pad
    p(ctx, 22, ty + 10, '#34A853'); // Button
    p(ctx, 23, ty + 11, '#FBBC05');
  } else if (options.accessory === 'sword') {
    rect(ctx, 29, ty + 2, 2, 10, '#4BEDD7');
    p(ctx, 30, ty + 1, '#FFFFFF');
    rect(ctx, 28, ty + 11, 4, 1, '#633F27');
    rect(ctx, 29, ty + 12, 2, 3, '#866043');
  }

  // 6. NECK
  const hy = headBobY;
  rect(ctx, 17, 24 + hy, 6, 3, skinShadow);

  // 7. DYNAMIC FACE SHAPE & JAWLINE (MIRRORS PHOTO GEOMETRY)
  const faceShape = features.faceShape || 'oval';

  if (faceShape === 'square') {
    // Square Jaw / Broad Face: strong angular jawline
    rect(ctx, 10, 7 + hy, 20, 17, skin);
    rect(ctx, 11, 24 + hy, 18, 1, skin);
    rect(ctx, 14, 25 + hy, 12, 1, skinShadow); // Flat chin
  } else if (faceShape === 'round') {
    // Round Face: soft curves, slightly wider cheeks
    rect(ctx, 9, 7 + hy, 22, 16, skin);
    rect(ctx, 11, 23 + hy, 18, 1, skin);
    rect(ctx, 13, 24 + hy, 14, 1, skin);
    rect(ctx, 16, 25 + hy, 8, 1, skinShadow); // Soft rounded chin
  } else if (faceShape === 'slim') {
    // Slim Face: tapered V-chin
    rect(ctx, 11, 7 + hy, 18, 16, skin);
    rect(ctx, 12, 23 + hy, 16, 1, skin);
    rect(ctx, 14, 24 + hy, 12, 1, skin);
    rect(ctx, 17, 25 + hy, 6, 1, skinShadow); // Tapered V-chin tip
  } else {
    // Oval Face: classic balanced proportions
    rect(ctx, 10, 7 + hy, 20, 17, skin);
    rect(ctx, 12, 24 + hy, 16, 1, skin);
    rect(ctx, 15, 25 + hy, 10, 1, skinShadow);
  }

  // Ears
  rect(ctx, 8, 15 + hy, 2, 4, skin);
  p(ctx, 9, 16 + hy, skinShadow);
  rect(ctx, 30, 15 + hy, 2, 4, skin);
  p(ctx, 30, 16 + hy, skinShadow);

  // Face highlights & Cheek blush
  rect(ctx, 14, 8 + hy, 12, 2, skinHighlight);
  rect(ctx, 11, 19 + hy, 2, 2, skinBlush);
  rect(ctx, 27, 19 + hy, 2, 2, skinBlush);

  // 8. EYES & EYEBROWS (MIRRORS EYE COLOR & EYEBROW THICKNESS)
  const eyeColor = features.eyeColor || '#2B1D16';
  const browThickness = features.eyebrowThickness || 'medium';

  // Eyebrows
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

  if (options.isBlinking) {
    // Blinking eye slit
    rect(ctx, 13, 17 + hy, 4, 1, hairDark);
    rect(ctx, 23, 17 + hy, 4, 1, hairDark);
  } else {
    // Left Eye
    rect(ctx, 13, 16 + hy, 4, 3, '#FFFFFF'); // Sclera (White)
    rect(ctx, 14, 16 + hy, 2, 2, '#111216'); // Dark Pupil
    p(ctx, 15, 17 + hy, eyeColor); // Personal Iris Color!
    p(ctx, 14, 16 + hy, '#FFFFFF'); // Specular catchlight

    // Right Eye
    rect(ctx, 23, 16 + hy, 4, 3, '#FFFFFF');
    rect(ctx, 24, 16 + hy, 2, 2, '#111216');
    p(ctx, 25, 17 + hy, eyeColor); // Personal Iris Color!
    p(ctx, 24, 16 + hy, '#FFFFFF');
  }

  // Nose Shadow / Definition
  p(ctx, 19, 19 + hy, skinShadow);
  p(ctx, 20, 19 + hy, skinShadow);
  p(ctx, 20, 20 + hy, skinShadow);

  // 9. MOUTH & SMILE EXPRESSION
  const expression = features.expression || 'smile';
  if (expression === 'open-smile') {
    // Open smile showing white teeth
    rect(ctx, 17, 22 + hy, 6, 2, '#933835');
    rect(ctx, 18, 22 + hy, 4, 1, '#FFFFFF'); // White teeth
  } else if (expression === 'neutral') {
    // Calm neutral line
    rect(ctx, 18, 22 + hy, 4, 1, '#933835');
  } else {
    // Classic warm smile
    rect(ctx, 18, 22 + hy, 4, 1, '#933835');
    p(ctx, 17, 21 + hy, '#933835'); // Smile corner left
    p(ctx, 22, 21 + hy, '#933835'); // Smile corner right
    p(ctx, 19, 22 + hy, '#FFFFFF'); // Subtle teeth hint
    p(ctx, 20, 22 + hy, '#FFFFFF');
  }

  // 10. GLASSES (SI LLEVA O NO LENTES)
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

  // 11. BEARD & FACIAL HAIR (BARBA)
  if (features.hasBeard) {
    const bStyle = features.beardStyle || 'full';

    if (bStyle === 'mustache') {
      // Bigote Retro
      rect(ctx, 16, 21 + hy, 8, 2, hair);
      p(ctx, 15, 22 + hy, hairDark);
      p(ctx, 24, 22 + hy, hairDark);
    } else if (bStyle === 'goatee') {
      // Candado / Perilla
      rect(ctx, 16, 21 + hy, 8, 1, hair);
      rect(ctx, 16, 22 + hy, 1, 3, hair);
      rect(ctx, 23, 22 + hy, 1, 3, hair);
      rect(ctx, 17, 24 + hy, 6, 2, hair);
      rect(ctx, 18, 26 + hy, 4, 1, hairDark);
    } else if (bStyle === 'stubble') {
      // Barba Corta / Sombra
      for (let by = 21; by <= 24; by++) {
        for (let bx = 12; bx <= 27; bx++) {
          if ((bx + by) % 2 === 0) {
            p(ctx, bx, by + hy, hairDark);
          }
        }
      }
    } else {
      // Barba Completa
      rect(ctx, 16, 21 + hy, 8, 1, hair); // Mustache
      rect(ctx, 14, 23 + hy, 12, 3, hair); // Chin
      rect(ctx, 15, 25 + hy, 10, 2, hair);
      rect(ctx, 16, 27 + hy, 8, 1, hairDark);
      rect(ctx, 11, 21 + hy, 3, 3, hair); // Jaw sides
      rect(ctx, 26, 21 + hy, 3, 3, hair);
    }
  }

  // 12. HAIR RENDERING (MATCHING USER'S ACTUAL VOLUME, BANGS, & SILHOUETTE)
  const hairStyle = features.hairStyle || 'short';
  const bangs = features.hairBangs || 'side-swept';
  const volume = features.hairVolume || 'medium';
  const length = features.hairLength || 'short';

  const topRise = volume === 'high' ? 4 : volume === 'low' ? 6 : 5;

  if (hairStyle === 'bald') {
    // Rapado / Buzzcut Fade
    rect(ctx, 10, 6 + hy, 20, 2, hairDark);
    rect(ctx, 9, 8 + hy, 2, 7, hairDark);
    rect(ctx, 29, 8 + hy, 2, 7, hairDark);
  } else if (hairStyle === 'curly') {
    // Ondulado / Afro con volumen
    rect(ctx, 7, topRise - 2 + hy, 26, 6, hair);
    rect(ctx, 8, topRise - 3 + hy, 24, 2, hairLight);
    rect(ctx, 6, topRise + 1 + hy, 28, 4, hair);
    rect(ctx, 6, topRise + 5 + hy, 4, 6, hair);
    rect(ctx, 30, topRise + 5 + hy, 4, 6, hair);

    // Curls highlights
    p(ctx, 12, topRise + hy, hairLight);
    p(ctx, 18, topRise - 1 + hy, hairLight);
    p(ctx, 25, topRise + hy, hairLight);
    p(ctx, 10, topRise + 4 + hy, hairLight);
    p(ctx, 28, topRise + 4 + hy, hairLight);

    // Bangs
    rect(ctx, 12, 8 + hy, 4, 2, hair);
    rect(ctx, 20, 8 + hy, 5, 2, hair);
  } else {
    // Crown Base
    rect(ctx, 9, topRise + hy, 22, 5, hair);
    rect(ctx, 12, topRise - 1 + hy, 16, 2, hairLight);

    // Bangs Style matching photo
    if (bangs === 'forehead-exposed') {
      // High Forehead / Swept back
      rect(ctx, 9, 8 + hy, 4, 4, hair);
      rect(ctx, 27, 8 + hy, 4, 4, hair);
      rect(ctx, 10, 7 + hy, 20, 1, hair);
    } else if (bangs === 'straight') {
      // Full fringe across forehead
      rect(ctx, 10, 8 + hy, 20, 4, hair);
      rect(ctx, 12, 12 + hy, 16, 1, hairDark);
    } else if (bangs === 'parted') {
      // Center parted bangs
      rect(ctx, 10, 8 + hy, 8, 4, hair);
      rect(ctx, 22, 8 + hy, 8, 4, hair);
      p(ctx, 19, 9 + hy, skin);
      p(ctx, 20, 9 + hy, skin);
    } else {
      // Side-swept bangs (Default)
      rect(ctx, 10, 8 + hy, 20, 3, hair);
      rect(ctx, 12, 10 + hy, 12, 2, hair);
    }

    // Sideburns
    rect(ctx, 9, 9 + hy, 2, 7, hair);
    rect(ctx, 29, 9 + hy, 2, 7, hair);

    // Long hair flowing down past chin
    if (length === 'long' || hairStyle === 'long') {
      rect(ctx, 7, 8 + hy, 4, 20, hair);
      rect(ctx, 29, 8 + hy, 4, 20, hair);
      rect(ctx, 8, 12 + hy, 1, 16, hairDark);
      rect(ctx, 31, 12 + hy, 1, 16, hairDark);
    } else if (length === 'medium') {
      rect(ctx, 8, 8 + hy, 3, 11, hair);
      rect(ctx, 29, 8 + hy, 3, 11, hair);
    }
  }

  // 13. CRISP NEAREST-NEIGHBOR SCALING
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

  // 14. RETRO FLOATING NAME TAG
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

    targetCtx.strokeStyle = '#34A853';
    targetCtx.lineWidth = 2;
    targetCtx.strokeRect(tagX - tagW / 2, tagY - tagH / 2, tagW, tagH);

    targetCtx.fillStyle = '#55FF55';
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
