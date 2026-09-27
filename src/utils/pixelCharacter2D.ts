// Retro 2D Pixel Art Character Generator Engine
// Creates authentic, crisp 2D pixel art character sprites (40x56 grid scaled with Nearest-Neighbor)
// Accurately reflects skin tone, glasses, beard, and torso garment (hoodie, t-shirt, shirt, jacket).

import type { DetectedFeatures } from './featureDetector';

export interface Character2DOptions {
  name?: string;
  role?: string;
  pose?: 'idle' | 'wave' | 'dev' | 'victory';
  accessory?: 'none' | 'lanyard' | 'coffee' | 'laptop' | 'gamepad' | 'sword';
  beardStyle?: 'full' | 'goatee' | 'mustache' | 'stubble';
  showShadow?: boolean;
  showNameTag?: boolean;
  backgroundColor?: string; // 'transparent', '#14151a', '#4285F4', etc.
  animationFrame?: number;  // 0, 1, 2 for breathing bob
  isBlinking?: boolean;
}

export const DEFAULT_CHARACTER_2D_OPTIONS: Character2DOptions = {
  name: 'DEV_HERO',
  role: 'GDG TACNA',
  pose: 'idle',
  accessory: 'lanyard',
  beardStyle: 'full',
  showShadow: true,
  showNameTag: true,
  backgroundColor: '#121318',
  animationFrame: 0,
  isBlinking: false
};

// Helper: Hex color manipulation
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

// Draw a single pixel on the pixel grid
function p(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

// Draw a pixel rectangle
function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/**
 * Main 2D Pixel Character Sprite Renderer
 * Draws onto an offscreen 40x56 grid, then scales cleanly to target canvas.
 */
export function renderPixelCharacter2D(
  targetCanvas: HTMLCanvasElement,
  features: DetectedFeatures,
  opts: Partial<Character2DOptions> = {}
) {
  const options: Character2DOptions = { ...DEFAULT_CHARACTER_2D_OPTIONS, ...opts };
  const targetCtx = targetCanvas.getContext('2d');
  if (!targetCtx) return;

  // Internal pixel sprite dimensions: 40 x 56 pixels
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

  // Derived color palettes
  const skin = features.skinColor || '#D6895A';
  const skinShadow = shadeColor(skin, -22);
  const skinHighlight = shadeColor(skin, 16);
  const skinBlush = shadeColor(skin, -10);

  const hair = features.hairColor || '#2B1B17';
  const hairDark = shadeColor(hair, -28);
  const hairLight = shadeColor(hair, 22);

  const cloth = features.clothingColor || '#4285F4';
  const clothDark = shadeColor(cloth, -25);
  const clothDeepDark = shadeColor(cloth, -42);
  const clothLight = shadeColor(cloth, 20);

  const pants = features.pantsColor || '#1E293B';
  const pantsDark = shadeColor(pants, -25);

  // Breathing / Bob animation offset (affects head, torso, arms)
  const bobY = options.animationFrame === 1 ? -1 : 0;
  const headBobY = bobY;

  // 0. Floor Drop Shadow (Voxel / Retro elliptical shadow)
  if (options.showShadow) {
    rect(ctx, 11, 52, 18, 3, 'rgba(0, 0, 0, 0.45)');
    rect(ctx, 13, 51, 14, 1, 'rgba(0, 0, 0, 0.25)');
    rect(ctx, 13, 55, 14, 1, 'rgba(0, 0, 0, 0.25)');
  }

  // 1. LEGS & PANTS (Y=42 to Y=50)
  // Belt
  rect(ctx, 13, 42, 14, 1, '#1A1816');
  rect(ctx, 18, 42, 4, 1, '#D4AF37'); // Gold belt buckle

  // Left & Right Leg Base
  rect(ctx, 13, 43, 6, 8, pants); // Left leg
  rect(ctx, 21, 43, 6, 8, pants); // Right leg
  // Inseam gap shadow
  rect(ctx, 19, 44, 2, 7, 'rgba(0, 0, 0, 0.6)');
  // Pants folds & shading
  rect(ctx, 13, 43, 1, 8, pantsDark);
  rect(ctx, 26, 43, 1, 8, pantsDark);
  rect(ctx, 14, 47, 4, 1, pantsDark);
  rect(ctx, 22, 47, 4, 1, pantsDark);

  // 2. RETRO SNEAKERS / SHOES (Y=51 to Y=54)
  // Left shoe
  rect(ctx, 12, 51, 7, 2, '#20222B');
  rect(ctx, 11, 53, 8, 1, '#FFFFFF'); // White sole
  rect(ctx, 11, 54, 8, 1, '#B0B4BC'); // Bottom rubber grip
  p(ctx, 15, 51, '#4285F4'); // Google Blue lace accent
  p(ctx, 16, 52, '#EA4335'); // Google Red stripe

  // Right shoe
  rect(ctx, 21, 51, 7, 2, '#20222B');
  rect(ctx, 21, 53, 8, 1, '#FFFFFF'); // White sole
  rect(ctx, 21, 54, 8, 1, '#B0B4BC'); // Bottom rubber grip
  p(ctx, 24, 51, '#FBBC05'); // Google Yellow lace accent
  p(ctx, 25, 52, '#34A853'); // Google Green stripe

  // 3. TORSO & CLOTHING (Y=26+bobY to Y=41+bobY)
  const ty = 26 + bobY;
  const clothType = features.clothingType || 'tshirt';

  // Base Torso Block (X=12 to X=27)
  rect(ctx, 12, ty + 1, 16, 15, cloth);

  // Outer Torso Outlines / Shadow
  rect(ctx, 12, ty + 1, 1, 15, clothDark);
  rect(ctx, 27, ty + 1, 1, 15, clothDark);
  rect(ctx, 13, ty + 15, 14, 1, clothDark);

  if (clothType === 'hoodie') {
    // --- HOODIE RENDERING ---
    // Chunky hood collar fold wrapping neck
    rect(ctx, 14, ty, 12, 3, clothLight);
    rect(ctx, 15, ty - 1, 10, 1, cloth);
    rect(ctx, 16, ty + 1, 8, 2, clothDeepDark);

    // Front kangaroo pouch pocket
    rect(ctx, 14, ty + 9, 12, 5, clothDark);
    rect(ctx, 15, ty + 10, 10, 4, cloth);
    rect(ctx, 14, ty + 9, 12, 1, clothDeepDark); // Top pocket opening slit

    // Hoodie white drawstring cords
    rect(ctx, 17, ty + 2, 1, 6, '#FFFFFF');
    rect(ctx, 22, ty + 2, 1, 6, '#FFFFFF');
    p(ctx, 17, ty + 8, '#D6D9E0'); // Left knot
    p(ctx, 22, ty + 8, '#D6D9E0'); // Right knot
  } else if (clothType === 'jacket') {
    // --- JACKET / CASACA RENDERING ---
    // Inner T-shirt in accent color / yellow
    const innerColor = features.clothingAccentColor || '#FBBC05';
    rect(ctx, 18, ty + 1, 4, 14, innerColor);

    // Neck skin visible at inner collar
    rect(ctx, 18, ty, 4, 2, skin);

    // Jacket Lapels & Front Opening
    rect(ctx, 16, ty + 1, 2, 14, clothDark);
    rect(ctx, 22, ty + 1, 2, 14, clothDark);

    // Metallic Zipper Line
    rect(ctx, 19, ty + 2, 2, 13, '#1E232B');
    p(ctx, 19, ty + 5, '#E5E7EB'); // Silver zipper slider
    p(ctx, 20, ty + 5, '#9CA3AF');

    // Pocket flaps
    rect(ctx, 13, ty + 10, 4, 1, clothDeepDark);
    rect(ctx, 23, ty + 10, 4, 1, clothDeepDark);
  } else if (clothType === 'shirt') {
    // --- CAMISA / POLO CON CUELLO ---
    // V-neck throat skin
    rect(ctx, 18, ty, 4, 3, skin);

    // Folded collar triangles
    rect(ctx, 15, ty, 3, 3, clothLight);
    p(ctx, 17, ty + 3, clothDark);
    rect(ctx, 22, ty, 3, 3, clothLight);
    p(ctx, 22, ty + 3, clothDark);

    // Center button placket
    rect(ctx, 19, ty + 3, 2, 12, clothDark);
    p(ctx, 19, ty + 5, '#FFFFFF'); // Button 1
    p(ctx, 19, ty + 9, '#FFFFFF'); // Button 2
    p(ctx, 19, ty + 13, '#FFFFFF'); // Button 3

    // Pocket
    rect(ctx, 14, ty + 6, 3, 4, clothDark);
  } else {
    // --- T-SHIRT / POLERA RENDERING ---
    // Crew Neckline Cutout showing neck skin
    rect(ctx, 17, ty, 6, 2, skin);
    p(ctx, 18, ty + 2, skin);
    p(ctx, 21, ty + 2, skin);

    // Ribbed collar line
    rect(ctx, 16, ty + 1, 1, 2, clothDark);
    rect(ctx, 23, ty + 1, 1, 2, clothDark);
    rect(ctx, 17, ty + 2, 6, 1, clothDark);

    // Chest Google GDG 4-color emblem
    p(ctx, 15, ty + 6, '#4285F4'); // Blue
    p(ctx, 16, ty + 6, '#EA4335'); // Red
    p(ctx, 15, ty + 7, '#FBBC05'); // Yellow
    p(ctx, 16, ty + 7, '#34A853'); // Green
  }

  // 4. ARMS & HANDS (adapts to Pose & Clothing Type)
  const pose = options.pose || 'idle';
  const isShortSleeves = clothType === 'tshirt' || clothType === 'shirt';

  // Left Arm (Viewer's left: X=8 to X=11)
  // Shoulder sleeve
  rect(ctx, 8, ty + 1, 4, 5, cloth);
  rect(ctx, 8, ty + 1, 1, 5, clothDark);

  if (isShortSleeves) {
    // Bare arm in skin tone
    rect(ctx, 8, ty + 6, 4, 6, skin);
    rect(ctx, 8, ty + 6, 1, 6, skinShadow);
  } else {
    // Long sleeve in clothing color
    rect(ctx, 8, ty + 6, 4, 6, cloth);
    rect(ctx, 8, ty + 6, 1, 6, clothDark);
    rect(ctx, 8, ty + 11, 4, 1, clothLight); // Cuff
  }
  // Left Hand
  rect(ctx, 8, ty + 12, 4, 3, skin);
  rect(ctx, 8, ty + 12, 1, 3, skinShadow);

  // Right Arm (Viewer's right: X=28 to X=31) - changes depending on pose
  if (pose === 'wave') {
    // --- WAVE POSE: Raised Right Arm waving friendly ---
    rect(ctx, 28, ty - 2, 4, 4, cloth);
    rect(ctx, 30, ty - 6, 4, 5, isShortSleeves ? skin : cloth);
    // Raised Hand waving
    rect(ctx, 31, ty - 10, 4, 4, skin);
    p(ctx, 30, ty - 9, skin); // Thumb
    // Friendly wave sparks
    p(ctx, 36, ty - 11, '#FBBC05');
    p(ctx, 37, ty - 8, '#FBBC05');
  } else if (pose === 'victory') {
    // --- VICTORY POSE: Thumbs up / Peace ---
    rect(ctx, 28, ty + 1, 4, 4, cloth);
    rect(ctx, 28, ty + 5, 4, 4, isShortSleeves ? skin : cloth);
    // Hand in front with thumb up
    rect(ctx, 27, ty + 8, 4, 4, skin);
    p(ctx, 28, ty + 6, skin); // Thumb up!
    p(ctx, 28, ty + 7, skin);
  } else {
    // --- IDLE / DEV POSE: Normal Resting Right Arm ---
    rect(ctx, 28, ty + 1, 4, 5, cloth);
    rect(ctx, 31, ty + 1, 1, 5, clothDark);

    if (isShortSleeves) {
      rect(ctx, 28, ty + 6, 4, 6, skin);
      rect(ctx, 31, ty + 6, 1, 6, skinShadow);
    } else {
      rect(ctx, 28, ty + 6, 4, 6, cloth);
      rect(ctx, 31, ty + 6, 1, 6, clothDark);
      rect(ctx, 28, ty + 11, 4, 1, clothLight); // Cuff
    }
    // Right Hand
    rect(ctx, 28, ty + 12, 4, 3, skin);
    rect(ctx, 31, ty + 12, 1, 3, skinShadow);
  }

  // 5. ACCESSORY IN HAND / CHEST
  if (options.accessory === 'lanyard') {
    // GDG Developer Pass Lanyard hanging from neck
    rect(ctx, 16, ty + 1, 1, 9, '#EA4335'); // Google Red lanyard ribbon
    rect(ctx, 23, ty + 1, 1, 9, '#4285F4'); // Google Blue lanyard ribbon
    rect(ctx, 18, ty + 10, 4, 5, '#FFFFFF'); // ID Badge Card
    rect(ctx, 18, ty + 10, 4, 1, '#1A1C20'); // Badge Clip
    p(ctx, 19, ty + 12, '#4285F4'); // GDG logo hint
    p(ctx, 20, ty + 12, '#EA4335');
    p(ctx, 19, ty + 13, '#FBBC05');
    p(ctx, 20, ty + 13, '#34A853');
  } else if (options.accessory === 'coffee' || pose === 'dev') {
    // Developer Pixel Coffee Mug in Hand
    const cx = pose === 'wave' ? 8 : 26;
    const cy = ty + 10;
    rect(ctx, cx, cy, 5, 5, '#FFFFFF');
    p(ctx, cx + 5, cy + 1, '#FFFFFF'); // Handle
    p(ctx, cx + 5, cy + 3, '#FFFFFF');
    rect(ctx, cx + 1, cy, 3, 1, '#5C3820'); // Coffee liquid
    p(ctx, cx + 2, cy + 2, '#4285F4'); // Blue GDG letter
    // Steam pixel
    p(ctx, cx + 2, cy - 2, 'rgba(255, 255, 255, 0.7)');
    p(ctx, cx + 3, cy - 4, 'rgba(255, 255, 255, 0.4)');
  } else if (options.accessory === 'laptop') {
    // Pixel Open Laptop resting in hands
    rect(ctx, 14, ty + 8, 12, 7, '#1F2428'); // Laptop Screen
    rect(ctx, 15, ty + 9, 10, 5, '#4285F4'); // Glowing Screen
    p(ctx, 19, ty + 11, '#FFFFFF'); // Logo
    rect(ctx, 12, ty + 14, 16, 2, '#374151'); // Keyboard base
  } else if (options.accessory === 'sword') {
    // Diamond Pixel Sword in Hand
    rect(ctx, 29, ty + 2, 2, 10, '#4BEDD7'); // Diamond blade
    p(ctx, 30, ty + 1, '#FFFFFF'); // Tip
    rect(ctx, 28, ty + 11, 4, 1, '#633F27'); // Crossguard
    rect(ctx, 29, ty + 12, 2, 3, '#866043'); // Hilt
  }

  // 6. NECK (Y=23+headBobY to Y=26+headBobY)
  const hy = headBobY;
  rect(ctx, 17, 24 + hy, 6, 3, skinShadow);

  // 7. HEAD & FACE BASE (X=10 to X=29, Y=7+hy to Y=24+hy)
  // Base Face Skin
  rect(ctx, 10, 7 + hy, 20, 18, skin);

  // Ears
  rect(ctx, 8, 15 + hy, 2, 4, skin);
  p(ctx, 9, 16 + hy, skinShadow);
  rect(ctx, 30, 15 + hy, 2, 4, skin);
  p(ctx, 30, 16 + hy, skinShadow);

  // Face Shading & Highlights
  rect(ctx, 10, 24 + hy, 20, 1, skinShadow); // Jawline shadow
  rect(ctx, 14, 8 + hy, 12, 2, skinHighlight); // Forehead highlight
  // Cute cheek blush
  rect(ctx, 11, 19 + hy, 2, 2, skinBlush);
  rect(ctx, 27, 19 + hy, 2, 2, skinBlush);

  // 8. EYES & NOSE & MOUTH
  // Eyebrows
  rect(ctx, 13, 14 + hy, 4, 1, hair);
  rect(ctx, 23, 14 + hy, 4, 1, hair);

  if (options.isBlinking) {
    // Blinking Eyes: cute pixel slit
    rect(ctx, 13, 17 + hy, 4, 1, hairDark);
    rect(ctx, 23, 17 + hy, 4, 1, hairDark);
  } else {
    // Left Eye
    rect(ctx, 13, 16 + hy, 4, 3, '#FFFFFF'); // Eye white
    rect(ctx, 14, 16 + hy, 2, 2, '#181A20'); // Dark pupil
    p(ctx, 15, 17 + hy, '#4285F4'); // Iris blue sparkle
    p(ctx, 14, 16 + hy, '#FFFFFF'); // Catchlight glint

    // Right Eye
    rect(ctx, 23, 16 + hy, 4, 3, '#FFFFFF'); // Eye white
    rect(ctx, 24, 16 + hy, 2, 2, '#181A20'); // Dark pupil
    p(ctx, 25, 17 + hy, '#4285F4'); // Iris blue sparkle
    p(ctx, 24, 16 + hy, '#FFFFFF'); // Catchlight glint
  }

  // Nose shadow
  p(ctx, 19, 19 + hy, skinShadow);
  p(ctx, 20, 19 + hy, skinShadow);

  // Smiling Mouth
  rect(ctx, 18, 22 + hy, 4, 1, '#933835');
  p(ctx, 19, 22 + hy, '#FFFFFF'); // Teeth smile
  p(ctx, 20, 22 + hy, '#FFFFFF');

  // 9. LENTES / GLASSES (SI LLEVA LENTES)
  if (features.hasGlasses) {
    const frameColor = '#1C2028';
    const glassTint = 'rgba(195, 230, 255, 0.35)';

    // Left Rim Box (X=12 to X=17, Y=15 to Y=19)
    rect(ctx, 12, 15 + hy, 6, 1, frameColor); // top
    rect(ctx, 12, 19 + hy, 6, 1, frameColor); // bottom
    rect(ctx, 12, 15 + hy, 1, 5, frameColor); // left
    rect(ctx, 17, 15 + hy, 1, 5, frameColor); // right
    // Tinted Lens
    rect(ctx, 13, 16 + hy, 4, 3, glassTint);
    // Lens Glare / Glint
    p(ctx, 13, 16 + hy, '#FFFFFF');

    // Right Rim Box (X=22 to X=27, Y=15 to Y=19)
    rect(ctx, 22, 15 + hy, 6, 1, frameColor);
    rect(ctx, 22, 19 + hy, 6, 1, frameColor);
    rect(ctx, 22, 15 + hy, 1, 5, frameColor);
    rect(ctx, 27, 15 + hy, 1, 5, frameColor);
    // Tinted Lens
    rect(ctx, 23, 16 + hy, 4, 3, glassTint);
    // Lens Glare / Glint
    p(ctx, 23, 16 + hy, '#FFFFFF');

    // Nose Bridge connecting frames
    rect(ctx, 18, 17 + hy, 4, 1, frameColor);

    // Temples reaching to ears
    rect(ctx, 10, 16 + hy, 2, 1, frameColor);
    rect(ctx, 28, 16 + hy, 2, 1, frameColor);
  }

  // 10. BARBA / VELLO FACIAL (SI LLEVA BARBA)
  if (features.hasBeard) {
    const bStyle = options.beardStyle || features.beardStyle || 'full';

    if (bStyle === 'mustache') {
      // Bigote Retro
      rect(ctx, 16, 21 + hy, 8, 2, hair);
      p(ctx, 15, 22 + hy, hairDark);
      p(ctx, 24, 22 + hy, hairDark);
    } else if (bStyle === 'goatee') {
      // Candado
      rect(ctx, 16, 21 + hy, 8, 1, hair); // Mustache
      rect(ctx, 16, 22 + hy, 1, 3, hair);
      rect(ctx, 23, 22 + hy, 1, 3, hair);
      rect(ctx, 17, 24 + hy, 6, 2, hair); // Chin
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
      // Barba Completa Clásica (Default Full Beard)
      // Mustache
      rect(ctx, 16, 21 + hy, 8, 1, hair);
      // Chin Beard
      rect(ctx, 14, 23 + hy, 12, 3, hair);
      rect(ctx, 15, 25 + hy, 10, 2, hair);
      rect(ctx, 16, 27 + hy, 8, 1, hairDark);
      // Jawline sideburn connection
      rect(ctx, 11, 21 + hy, 3, 3, hair);
      rect(ctx, 26, 21 + hy, 3, 3, hair);
    }
  }

  // 11. CABELLO / HAIRSTYLE
  const hairStyle = features.hairStyle || 'short';

  if (hairStyle === 'bald') {
    // Rapado / Buzzcut Fade
    rect(ctx, 10, 6 + hy, 20, 2, hairDark);
    rect(ctx, 9, 8 + hy, 2, 7, hairDark);
    rect(ctx, 29, 8 + hy, 2, 7, hairDark);
  } else if (hairStyle === 'curly') {
    // Ondulado / Afro con volumen
    rect(ctx, 7, 3 + hy, 26, 6, hair);
    rect(ctx, 8, 2 + hy, 24, 2, hairLight);
    rect(ctx, 6, 6 + hy, 28, 4, hair);
    rect(ctx, 6, 10 + hy, 4, 6, hair);
    rect(ctx, 30, 10 + hy, 4, 6, hair);
    // Curls highlights
    p(ctx, 12, 4 + hy, hairLight);
    p(ctx, 18, 3 + hy, hairLight);
    p(ctx, 25, 4 + hy, hairLight);
    p(ctx, 10, 8 + hy, hairLight);
    p(ctx, 28, 8 + hy, hairLight);
    // Forehead curl bangs
    rect(ctx, 12, 8 + hy, 4, 2, hair);
    rect(ctx, 20, 8 + hy, 5, 2, hair);
  } else if (hairStyle === 'long') {
    // Cabello Largo cayendo sobre hombros
    rect(ctx, 9, 5 + hy, 22, 5, hair);
    rect(ctx, 12, 4 + hy, 16, 2, hairLight);
    // Front bangs
    rect(ctx, 11, 9 + hy, 18, 3, hair);
    p(ctx, 19, 10 + hy, skin); // Parting gap
    // Flowing hair strands over shoulders down to torso
    rect(ctx, 7, 8 + hy, 4, 18, hair);
    rect(ctx, 29, 8 + hy, 4, 18, hair);
    rect(ctx, 8, 12 + hy, 1, 14, hairDark);
    rect(ctx, 31, 12 + hy, 1, 14, hairDark);
  } else if (hairStyle === 'parted') {
    // De Lado / Raya elegante
    rect(ctx, 9, 5 + hy, 22, 5, hair);
    rect(ctx, 14, 4 + hy, 14, 2, hairLight);
    // Side parting swooping left to right
    rect(ctx, 10, 8 + hy, 19, 3, hair);
    rect(ctx, 12, 10 + hy, 12, 2, hair);
    rect(ctx, 9, 9 + hy, 2, 8, hair);
    rect(ctx, 29, 9 + hy, 2, 7, hairDark);
  } else if (hairStyle === 'messy') {
    // Despeinado / Spiky Anime Style
    rect(ctx, 9, 6 + hy, 22, 5, hair);
    // Spikes pointing up
    rect(ctx, 10, 3 + hy, 3, 4, hair);
    rect(ctx, 15, 2 + hy, 4, 5, hairLight);
    rect(ctx, 22, 3 + hy, 3, 4, hair);
    rect(ctx, 26, 4 + hy, 3, 3, hair);
    // Spiky Bangs
    rect(ctx, 11, 9 + hy, 18, 3, hair);
    p(ctx, 14, 12 + hy, hair);
    p(ctx, 18, 13 + hy, hair);
    p(ctx, 24, 12 + hy, hair);
  } else {
    // Corto Clásico (Default Short)
    rect(ctx, 9, 5 + hy, 22, 5, hair);
    rect(ctx, 13, 4 + hy, 14, 2, hairLight);
    rect(ctx, 10, 8 + hy, 20, 3, hair);
    rect(ctx, 9, 9 + hy, 2, 7, hair); // Sideburn left
    rect(ctx, 29, 9 + hy, 2, 7, hair); // Sideburn right
  }

  // 12. SCALE TO TARGET CANVAS WITH CRISP NEAREST-NEIGHBOR
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

  // Calculate integer scale factor preserving aspect ratio
  const scale = Math.max(1, Math.min(Math.floor(tw / SPRITE_W), Math.floor(th / SPRITE_H)));
  const scaledW = SPRITE_W * scale;
  const scaledH = SPRITE_H * scale;
  const offsetX = Math.floor((tw - scaledW) / 2);
  const offsetY = Math.floor((th - scaledH) / 2);

  targetCtx.drawImage(offscreen, 0, 0, SPRITE_W, SPRITE_H, offsetX, offsetY, scaledW, scaledH);

  // 13. RETRO FLOATING NAME TAG (IF ENABLED)
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

    // Tag background plate
    targetCtx.fillStyle = '#000000';
    targetCtx.fillRect(tagX - tagW / 2, tagY - tagH / 2, tagW, tagH);

    targetCtx.strokeStyle = '#34A853'; // Google Green border
    targetCtx.lineWidth = 2;
    targetCtx.strokeRect(tagX - tagW / 2, tagY - tagH / 2, tagW, tagH);

    // Tag text
    targetCtx.fillStyle = '#55FF55';
    targetCtx.fillText(tagText, tagX, tagY);
  }
}

/**
 * Generate high-resolution crystal-clear Data URL for download
 */
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
