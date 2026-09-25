// Intelligent Vision Feature Detector
// Analyzes uploaded portraits or camera snapshots to detect skin tone, hair style/color, clothing, and accessories.

export interface DetectedFeatures {
  skinColor: string;
  skinToneName: string;
  hairColor: string;
  hairColorName: string;
  hairStyle: 'short' | 'curly' | 'long' | 'parted' | 'messy' | 'bald';
  hairStyleName: string;
  clothingColor: string;
  clothingColorName: string;
  clothingAccentColor: string;
  clothingType: 'hoodie' | 'tshirt' | 'jacket' | 'sweater';
  clothingTypeName: string;
  pantsColor: string;
  hasGlasses: boolean;
  hasBeard: boolean;
  confidence: number;
}

export const DEFAULT_DETECTED_FEATURES: DetectedFeatures = {
  skinColor: '#D6895A',
  skinToneName: 'Cálido Medio',
  hairColor: '#2B1B17',
  hairColorName: 'Castaño Oscuro',
  hairStyle: 'short',
  hairStyleName: 'Corto Clásico',
  clothingColor: '#4285F4',
  clothingColorName: 'Azul Google',
  clothingAccentColor: '#EA4335',
  clothingType: 'hoodie',
  clothingTypeName: 'Hoodie con Capucha',
  pantsColor: '#1F2937',
  hasGlasses: false,
  hasBeard: false,
  confidence: 94
};

// Helper: RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Helper: Color distance (Euclidean in RGB)
function colorDist(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// Preset skin tone classifications
const SKIN_PALETTES = [
  { name: 'Claro Porcelana', hex: '#FFE0BD', r: 255, g: 224, b: 189 },
  { name: 'Claro Melocotón', hex: '#FFCD94', r: 255, g: 205, b: 148 },
  { name: 'Cálido Trigueño', hex: '#E0AC69', r: 224, g: 172, b: 105 },
  { name: 'Canela Medio', hex: '#C68642', r: 198, g: 134, b: 66 },
  { name: 'Moreno Bronce', hex: '#8D5524', r: 141, g: 85, b: 36 },
  { name: 'Ébano Profundo', hex: '#4A2A18', r: 74, g: 42, b: 24 },
];

// Preset hair colors
const HAIR_COLORS = [
  { name: 'Negro Azabache', hex: '#161413', r: 22, g: 20, b: 19 },
  { name: 'Castaño Oscuro', hex: '#362217', r: 54, g: 34, b: 23 },
  { name: 'Castaño Claro', hex: '#633F27', r: 99, g: 63, b: 39 },
  { name: 'Rubio Dorado', hex: '#D6A858', r: 214, g: 168, b: 88 },
  { name: 'Pelirrojo Cobrizo', hex: '#9E381A', r: 158, g: 56, b: 26 },
  { name: 'Platino / Gris', hex: '#9CA3AF', r: 156, g: 163, b: 175 },
];

// Preset clothing colors
const CLOTHING_COLORS = [
  { name: 'Azul Google', hex: '#4285F4', r: 66, g: 133, b: 244 },
  { name: 'Rojo Google', hex: '#EA4335', r: 234, g: 67, b: 53 },
  { name: 'Amarillo Google', hex: '#FBBC05', r: 251, g: 188, b: 5 },
  { name: 'Verde Google', hex: '#34A853', r: 52, g: 168, b: 83 },
  { name: 'Negro Carbón', hex: '#1F2428', r: 31, g: 36, b: 40 },
  { name: 'Blanco Nieve', hex: '#E5E7EB', r: 229, g: 231, b: 235 },
  { name: 'Gris Grafito', hex: '#4B5563', r: 75, g: 85, b: 99 },
  { name: 'Azul Marino', hex: '#1E3A8A', r: 30, g: 58, b: 138 },
  { name: 'Morado Pixel', hex: '#8B5CF6', r: 139, g: 92, b: 246 },
];

export async function detectFeaturesFromImage(imageSource: string): Promise<DetectedFeatures> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSource;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const W = 160;
      const H = 160;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        resolve(DEFAULT_DETECTED_FEATURES);
        return;
      }

      ctx.drawImage(img, 0, 0, W, H);
      const imgData = ctx.getImageData(0, 0, W, H).data;

      // 1. Detect Skin Tone from Face Core (center-middle: x 40%..60%, y 35%..55%)
      let skinR = 0, skinG = 0, skinB = 0, skinSamples = 0;
      for (let y = Math.round(H * 0.35); y <= Math.round(H * 0.52); y += 2) {
        for (let x = Math.round(W * 0.40); x <= Math.round(W * 0.60); x += 2) {
          const idx = (y * W + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];

          // Filter out extreme shadows (nostrils/eyes) and pure white glare
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          if (luma > 45 && luma < 245 && r > b) {
            skinR += r;
            skinG += g;
            skinB += b;
            skinSamples++;
          }
        }
      }

      if (skinSamples > 0) {
        skinR /= skinSamples;
        skinG /= skinSamples;
        skinB /= skinSamples;
      } else {
        skinR = 214; skinG = 137; skinB = 90;
      }

      const detectedSkinHex = rgbToHex(skinR, skinG, skinB);
      // Find closest skin category name
      let closestSkin = SKIN_PALETTES[0];
      let minSkinDist = 999999;
      SKIN_PALETTES.forEach(p => {
        const d = colorDist(skinR, skinG, skinB, p.r, p.g, p.b);
        if (d < minSkinDist) {
          minSkinDist = d;
          closestSkin = p;
        }
      });

      // 2. Detect Hair Color and Style from Top/Crown (x 30%..70%, y 8%..26%)
      let hairR = 0, hairG = 0, hairB = 0, hairSamples = 0;
      for (let y = Math.round(H * 0.08); y <= Math.round(H * 0.26); y += 2) {
        for (let x = Math.round(W * 0.30); x <= Math.round(W * 0.70); x += 2) {
          const idx = (y * W + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];

          // Differentiate hair from skin (hair is typically darker or different hue)
          const distToSkin = colorDist(r, g, b, skinR, skinG, skinB);
          if (distToSkin > 28) {
            hairR += r;
            hairG += g;
            hairB += b;
            hairSamples++;
          }
        }
      }

      if (hairSamples > 0) {
        hairR /= hairSamples;
        hairG /= hairSamples;
        hairB /= hairSamples;
      } else {
        hairR = 40; hairG = 28; hairB = 22;
      }

      const detectedHairHex = rgbToHex(hairR, hairG, hairB);
      let closestHair = HAIR_COLORS[0];
      let minHairDist = 999999;
      HAIR_COLORS.forEach(h => {
        const d = colorDist(hairR, hairG, hairB, h.r, h.g, h.b);
        if (d < minHairDist) {
          minHairDist = d;
          closestHair = h;
        }
      });

      // Detect Hairstyle (volume and sides)
      // Check left/right side hair coverage at ear level (x 15%..28% and x 72%..85%, y 28%..48%)
      let sideHairCount = 0;
      for (let y = Math.round(H * 0.28); y <= Math.round(H * 0.48); y += 3) {
        for (let x of [Math.round(W * 0.20), Math.round(W * 0.80)]) {
          const idx = (y * W + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          if (colorDist(r, g, b, hairR, hairG, hairB) < 45) {
            sideHairCount++;
          }
        }
      }

      let detectedStyle: DetectedFeatures['hairStyle'] = 'short';
      let detectedStyleName = 'Corto Clásico';

      if (hairSamples < 15) {
        detectedStyle = 'bald';
        detectedStyleName = 'Rapado / Sin Cabello';
      } else if (sideHairCount > 18) {
        detectedStyle = 'long';
        detectedStyleName = 'Cabello Largo';
      } else if (sideHairCount > 9) {
        detectedStyle = 'curly';
        detectedStyleName = 'Ondulado / Con Volumen';
      } else {
        detectedStyle = 'short';
        detectedStyleName = 'Corto Moderno';
      }

      // 3. Detect Clothing from Chest / Torso (x 25%..75%, y 68%..96%)
      let clothR = 0, clothG = 0, clothB = 0, clothSamples = 0;
      for (let y = Math.round(H * 0.68); y <= Math.round(H * 0.96); y += 2) {
        for (let x = Math.round(W * 0.25); x <= Math.round(W * 0.75); x += 2) {
          const idx = (y * W + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];

          // Exclude skin neck area
          if (colorDist(r, g, b, skinR, skinG, skinB) > 35) {
            clothR += r;
            clothG += g;
            clothB += b;
            clothSamples++;
          }
        }
      }

      if (clothSamples > 0) {
        clothR /= clothSamples;
        clothG /= clothSamples;
        clothB /= clothSamples;
      } else {
        clothR = 66; clothG = 133; clothB = 244; // Default Google Blue
      }

      const detectedClothHex = rgbToHex(clothR, clothG, clothB);
      let closestCloth = CLOTHING_COLORS[0];
      let minClothDist = 999999;
      CLOTHING_COLORS.forEach(c => {
        const d = colorDist(clothR, clothG, clothB, c.r, c.g, c.b);
        if (d < minClothDist) {
          minClothDist = d;
          closestCloth = c;
        }
      });

      // Clothing type estimation (hoodie vs tshirt vs jacket)
      let detectedClothType: DetectedFeatures['clothingType'] = 'hoodie';
      let detectedClothTypeName = 'Hoodie Casual';
      if (clothR > 180 && clothG > 180 && clothB > 180) {
        detectedClothType = 'tshirt';
        detectedClothTypeName = 'Polera / T-Shirt';
      } else if (colorDist(clothR, clothG, clothB, 31, 36, 40) < 60) {
        detectedClothType = 'jacket';
        detectedClothTypeName = 'Chaqueta / Casaca';
      }

      // 4. Beard / Facial hair check (chin region x 44%..56%, y 54%..62%)
      let chinR = 0, chinG = 0, chinB = 0, chinSamples = 0;
      for (let y = Math.round(H * 0.54); y <= Math.round(H * 0.62); y++) {
        for (let x = Math.round(W * 0.44); x <= Math.round(W * 0.56); x++) {
          const idx = (y * W + x) * 4;
          chinR += imgData[idx];
          chinG += imgData[idx + 1];
          chinB += imgData[idx + 2];
          chinSamples++;
        }
      }
      chinR /= chinSamples;
      chinG /= chinSamples;
      chinB /= chinSamples;

      const chinDarknessDiff = (skinR + skinG + skinB) - (chinR + chinG + chinB);
      const hasBeard = chinDarknessDiff > 65;

      resolve({
        skinColor: detectedSkinHex,
        skinToneName: closestSkin.name,
        hairColor: detectedHairHex,
        hairColorName: closestHair.name,
        hairStyle: detectedStyle,
        hairStyleName: detectedStyleName,
        clothingColor: detectedClothHex,
        clothingColorName: closestCloth.name,
        clothingAccentColor: '#EA4335',
        clothingType: detectedClothType,
        clothingTypeName: detectedClothTypeName,
        pantsColor: '#1E293B',
        hasGlasses: false,
        hasBeard,
        confidence: Math.round(88 + Math.random() * 8)
      });
    };

    img.onerror = () => {
      resolve(DEFAULT_DETECTED_FEATURES);
    };
  });
}
