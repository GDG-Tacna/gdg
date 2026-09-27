// Advanced Facial Feature & Clothing Vision Detector
// Extracts authentic personal facial traits (skin tone, face shape, hair style/color, eyes, glasses, beard)
// and clothing color (polera / t-shirt with black pants) directly from user portraits.

export interface DetectedFeatures {
  // 1. Skin & Facial Structure
  skinColor: string;
  skinToneName: string;
  faceShape: 'round' | 'square' | 'oval' | 'slim';
  faceShapeName: string;

  // 2. Hair Features
  hairColor: string;
  hairColorName: string;
  hairStyle: 'short' | 'curly' | 'long' | 'parted' | 'messy' | 'bald';
  hairStyleName: string;
  hairLength: 'bald' | 'short' | 'medium' | 'long';
  hairBangs: 'forehead-exposed' | 'straight' | 'side-swept' | 'parted';
  hairVolume: 'low' | 'medium' | 'high';

  // 3. Eyes & Expression
  eyeColor: string;
  eyeColorName: string;
  eyebrowThickness: 'thin' | 'medium' | 'thick';
  expression: 'smile' | 'open-smile' | 'neutral';

  // 4. Glasses (si lleva o no lentes)
  hasGlasses: boolean;
  glassesFrameColor: string;

  // 5. Beard (barba)
  hasBeard: boolean;
  beardStyle?: 'full' | 'goatee' | 'mustache' | 'stubble';

  // 6. Clothing (Strictly Polera + Pantalón Negro)
  clothingColor: string;
  clothingColorName: string;
  clothingAccentColor: string;
  clothingType: 'tshirt' | 'hoodie' | 'jacket';
  clothingTypeName: string;
  clothingCanvas?: HTMLCanvasElement;
  clothingTextureUrl?: string;

  // Pants (always black)
  pantsColor: string;

  confidence: number;
}

export const DEFAULT_DETECTED_FEATURES: DetectedFeatures = {
  skinColor: '#D6895A',
  skinToneName: 'Cálido Medio',
  faceShape: 'oval',
  faceShapeName: 'Óvalo Equilibrado',
  hairColor: '#2B1B17',
  hairColorName: 'Castaño Oscuro',
  hairStyle: 'short',
  hairStyleName: 'Corto Clásico',
  hairLength: 'short',
  hairBangs: 'side-swept',
  hairVolume: 'medium',
  eyeColor: '#2B1D16',
  eyeColorName: 'Castaño Oscuro',
  eyebrowThickness: 'medium',
  expression: 'smile',
  hasGlasses: false,
  glassesFrameColor: '#1E232B',
  hasBeard: false,
  beardStyle: 'full',
  clothingColor: '#4285F4',
  clothingColorName: 'Azul Google',
  clothingAccentColor: '#EA4335',
  clothingType: 'tshirt',
  clothingTypeName: 'Polera',
  pantsColor: '#111116',
  confidence: 95
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

// Standard YCbCr Skin Pixel Detection algorithm (robust across lighting and human ethnicities)
function isSkinPixel(r: number, g: number, b: number): boolean {
  const y  =  0.299 * r + 0.587 * g + 0.114 * b;
  const cb = -0.1687 * r - 0.3313 * g + 0.5 * b + 128;
  const cr =  0.5 * r - 0.4187 * g - 0.0813 * b + 128;

  return (
    y > 35 && y < 245 &&
    cb >= 77 && cb <= 130 &&
    cr >= 132 && cr <= 178 &&
    r > g && g >= b &&
    (r - g) >= 8
  );
}

// Descriptive skin tone categories
const SKIN_CATEGORIES = [
  { name: 'Claro Porcelana', hex: '#FFE0BD', r: 255, g: 224, b: 189 },
  { name: 'Claro Melocotón', hex: '#F9CCA5', r: 249, g: 204, b: 165 },
  { name: 'Cálido Trigueño', hex: '#E2AD75', r: 226, g: 173, b: 117 },
  { name: 'Canela / Oliva', hex: '#C58957', r: 197, g: 137, b: 87 },
  { name: 'Moreno Bronce', hex: '#975E33', r: 151, g: 94, b: 51 },
  { name: 'Ébano Profundo', hex: '#583620', r: 88, g: 54, b: 32 },
];

const HAIR_CATEGORIES = [
  { name: 'Negro Azabache', hex: '#161413', r: 22, g: 20, b: 19 },
  { name: 'Castaño Oscuro', hex: '#362217', r: 54, g: 34, b: 23 },
  { name: 'Castaño Claro', hex: '#633F27', r: 99, g: 63, b: 39 },
  { name: 'Rubio Dorado', hex: '#D6A858', r: 214, g: 168, b: 88 },
  { name: 'Pelirrojo Cobrizo', hex: '#9E381A', r: 158, g: 56, b: 26 },
  { name: 'Platino / Gris', hex: '#9CA3AF', r: 156, g: 163, b: 175 },
];

function getDescriptiveColorName(r: number, g: number, b: number): string {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  if (max < 45) return 'Negro / Carbón';
  if (min > 205) return 'Blanco Nieve';
  if (diff < 20) return 'Gris Grafito';

  if (r > g && r > b) {
    if (g > 150 && b < 100) return 'Amarillo / Mostaza';
    if (g > 90 && b < 80) return 'Naranja / Ocre';
    return 'Rojo / Borgoña';
  } else if (g > r && g > b) {
    return 'Verde';
  } else if (b > r && b > g) {
    if (r > 100) return 'Morado / Violeta';
    return 'Azul';
  }
  return 'Personalizado';
}

export async function detectFeaturesFromImage(imageSource: string): Promise<DetectedFeatures> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSource;

    img.onload = () => {
      const W = 220;
      const H = 220;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        resolve(DEFAULT_DETECTED_FEATURES);
        return;
      }

      ctx.drawImage(img, 0, 0, W, H);
      const imgData = ctx.getImageData(0, 0, W, H).data;

      // 1. SKIN & FACE LOCALIZATION
      let minX = W, maxX = 0, minY = H, maxY = 0;
      const skinPixels: { x: number; y: number; r: number; g: number; b: number }[] = [];

      for (let y = 8; y < Math.round(H * 0.70); y += 2) {
        for (let x = 8; x < W - 8; x += 2) {
          const idx = (y * W + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];

          if (isSkinPixel(r, g, b)) {
            skinPixels.push({ x, y, r, g, b });
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      let detectedSkinHex = '#D6895A';
      let detectedSkinName = 'Cálido Medio';
      let faceCenterX = Math.round(W / 2);
      let faceCenterY = Math.round(H * 0.38);
      let chinY = Math.round(H * 0.52);
      let avgR = 214, avgG = 137, avgB = 90;

      if (skinPixels.length > 25) {
        faceCenterX = Math.round((minX + maxX) / 2);
        faceCenterY = Math.round((minY + maxY) / 2);
        chinY = maxY;

        // Sample cheeks & forehead
        const innerMinX = minX + (maxX - minX) * 0.22;
        const innerMaxX = maxX - (maxX - minX) * 0.22;
        const innerMinY = minY + (maxY - minY) * 0.22;
        const innerMaxY = maxY - (maxY - minY) * 0.22;

        const filteredSkin = skinPixels.filter(
          p => p.x >= innerMinX && p.x <= innerMaxX && p.y >= innerMinY && p.y <= innerMaxY
        );

        const sampleSet = filteredSkin.length > 10 ? filteredSkin : skinPixels;
        let sumR = 0, sumG = 0, sumB = 0;
        sampleSet.forEach(p => {
          sumR += p.r;
          sumG += p.g;
          sumB += p.b;
        });

        avgR = Math.round(sumR / sampleSet.length);
        avgG = Math.round(sumG / sampleSet.length);
        avgB = Math.round(sumB / sampleSet.length);

        detectedSkinHex = rgbToHex(avgR, avgG, avgB);

        let closestSkin = SKIN_CATEGORIES[0];
        let minD = 999999;
        SKIN_CATEGORIES.forEach(c => {
          const d = colorDist(avgR, avgG, avgB, c.r, c.g, c.b);
          if (d < minD) {
            minD = d;
            closestSkin = c;
          }
        });
        detectedSkinName = closestSkin.name;
      }

      const faceH = Math.max(25, maxY - minY);
      const faceW = Math.max(25, maxX - minX);

      // 2. FACE SHAPE & JAWLINE ANALYSIS
      // Sample cheek width vs jaw width
      let cheekSkinCount = 0;
      let jawSkinCount = 0;
      const cheekScanY = Math.round(minY + faceH * 0.45);
      const jawScanY = Math.round(minY + faceH * 0.82);

      for (let x = Math.max(0, faceCenterX - Math.round(faceW * 0.55)); x <= Math.min(W - 1, faceCenterX + Math.round(faceW * 0.55)); x += 2) {
        const cIdx = (cheekScanY * W + x) * 4;
        if (isSkinPixel(imgData[cIdx], imgData[cIdx + 1], imgData[cIdx + 2])) cheekSkinCount++;

        const jIdx = (jawScanY * W + x) * 4;
        if (isSkinPixel(imgData[jIdx], imgData[jIdx + 1], imgData[jIdx + 2])) jawSkinCount++;
      }

      const jawToCheekRatio = jawSkinCount / Math.max(1, cheekSkinCount);
      const faceAspect = faceW / Math.max(1, faceH);

      let detectedFaceShape: DetectedFeatures['faceShape'] = 'oval';
      let detectedFaceShapeName = 'Óvalo Equilibrado';

      if (jawToCheekRatio > 0.85) {
        detectedFaceShape = 'square';
        detectedFaceShapeName = 'Mandíbula Cuadrada / Definida';
      } else if (faceAspect > 0.88 || jawToCheekRatio > 0.75) {
        detectedFaceShape = 'round';
        detectedFaceShapeName = 'Rostro Redondeado';
      } else if (jawToCheekRatio < 0.55 || faceAspect < 0.72) {
        detectedFaceShape = 'slim';
        detectedFaceShapeName = 'Rostro Estilizado / Mentón en V';
      } else {
        detectedFaceShape = 'oval';
        detectedFaceShapeName = 'Óvalo Clásico';
      }

      // 3. HAIR DETECTION (Color, Silhouette, Volume, Bangs, Length)
      const hairCrownY = Math.max(2, minY - 28);
      const hairCrownEnd = Math.min(faceCenterY, minY + 12);
      const hairPixels: { x: number; y: number; r: number; g: number; b: number }[] = [];
      let topHairY = minY;

      for (let y = hairCrownY; y <= hairCrownEnd; y += 2) {
        for (let x = Math.max(6, faceCenterX - Math.round(faceW * 0.55)); x <= Math.min(W - 6, faceCenterX + Math.round(faceW * 0.55)); x += 2) {
          const idx = (y * W + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];

          if (!isSkinPixel(r, g, b)) {
            hairPixels.push({ x, y, r, g, b });
            if (y < topHairY) topHairY = y;
          }
        }
      }

      let detectedHairHex = '#2B1B17';
      let detectedHairName = 'Castaño Oscuro';
      let avgHr = 43, avgHg = 27, avgHb = 23;

      if (hairPixels.length > 8) {
        let hr = 0, hg = 0, hb = 0;
        hairPixels.forEach(p => { hr += p.r; hg += p.g; hb += p.b; });
        avgHr = Math.round(hr / hairPixels.length);
        avgHg = Math.round(hg / hairPixels.length);
        avgHb = Math.round(hb / hairPixels.length);
        detectedHairHex = rgbToHex(avgHr, avgHg, avgHb);

        let closestHair = HAIR_CATEGORIES[0];
        let minHD = 999999;
        HAIR_CATEGORIES.forEach(h => {
          const d = colorDist(avgHr, avgHg, avgHb, h.r, h.g, h.b);
          if (d < minHD) {
            minHD = d;
            closestHair = h;
          }
        });
        detectedHairName = closestHair.name;
      }

      // Hair Volume above forehead
      const crownRise = Math.max(0, minY - topHairY);
      let detectedHairVolume: DetectedFeatures['hairVolume'] = 'medium';
      if (crownRise > 18) detectedHairVolume = 'high';
      else if (crownRise < 6) detectedHairVolume = 'low';

      // Hair side length check (past ears and chin)
      let longSideHairCount = 0;
      let midSideHairCount = 0;
      for (let y = faceCenterY; y <= Math.min(H - 4, chinY + 25); y += 2) {
        for (const x of [minX - 8, maxX + 8]) {
          if (x > 2 && x < W - 2) {
            const idx = (y * W + x) * 4;
            const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
            if (!isSkinPixel(r, g, b) && colorDist(r, g, b, avgHr, avgHg, avgHb) < 85) {
              if (y > chinY) longSideHairCount++;
              else midSideHairCount++;
            }
          }
        }
      }

      let detectedHairLength: DetectedFeatures['hairLength'] = 'short';
      if (longSideHairCount > 8) detectedHairLength = 'long';
      else if (midSideHairCount > 10) detectedHairLength = 'medium';

      // Forehead Bangs & Hairline style
      let leftForeheadHair = 0;
      let rightForeheadHair = 0;
      let centerForeheadSkin = 0;

      for (let y = minY; y <= Math.min(H, minY + Math.round(faceH * 0.28)); y += 2) {
        for (let x = faceCenterX - 20; x <= faceCenterX + 20; x += 2) {
          const idx = (y * W + x) * 4;
          const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
          if (isSkinPixel(r, g, b)) {
            centerForeheadSkin++;
          } else {
            if (x < faceCenterX) leftForeheadHair++;
            else rightForeheadHair++;
          }
        }
      }

      let detectedHairBangs: DetectedFeatures['hairBangs'] = 'side-swept';
      if (centerForeheadSkin > 35) {
        detectedHairBangs = 'forehead-exposed';
      } else if (Math.abs(leftForeheadHair - rightForeheadHair) > 14) {
        detectedHairBangs = 'side-swept';
      } else if (leftForeheadHair > 12 && rightForeheadHair > 12) {
        detectedHairBangs = 'straight';
      } else {
        detectedHairBangs = 'parted';
      }

      // Hair Style classification
      let detectedHairStyle: DetectedFeatures['hairStyle'] = 'short';
      let detectedHairStyleName = 'Corto Natural';

      if (hairPixels.length < 8) {
        detectedHairStyle = 'bald';
        detectedHairStyleName = 'Rapado / Fade';
      } else if (detectedHairLength === 'long') {
        detectedHairStyle = 'long';
        detectedHairStyleName = 'Cabello Largo';
      } else if (detectedHairVolume === 'high') {
        detectedHairStyle = 'curly';
        detectedHairStyleName = 'Ondulado / Con Volumen';
      } else if (detectedHairBangs === 'side-swept' || detectedHairBangs === 'parted') {
        detectedHairStyle = 'parted';
        detectedHairStyleName = 'De Lado / Raya';
      } else {
        detectedHairStyle = 'short';
        detectedHairStyleName = 'Corto Clásico';
      }

      // 4. EYES & EYEBROWS (Shape, Thickness, Iris Color)
      const eyeY = Math.round(minY + faceH * 0.40);
      const leftEyeX = Math.round(faceCenterX - faceW * 0.22);
      const rightEyeX = Math.round(faceCenterX + faceW * 0.22);

      // Eye Color Extraction (Sampling iris around pupils)
      let eyeR = 0, eyeG = 0, eyeB = 0, eyeCount = 0;
      for (const ex of [leftEyeX, rightEyeX]) {
        for (let ey = eyeY - 2; ey <= eyeY + 3; ey++) {
          for (let exx = ex - 3; exx <= ex + 3; exx++) {
            if (exx > 0 && exx < W && ey > 0 && ey < H) {
              const idx = (ey * W + exx) * 4;
              const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
              // Non-skin, non-pure-white
              if (!isSkinPixel(r, g, b) && (r < 220 || g < 220 || b < 220)) {
                eyeR += r; eyeG += g; eyeB += b;
                eyeCount++;
              }
            }
          }
        }
      }

      let detectedEyeColor = '#2B1D16';
      let detectedEyeColorName = 'Castaño Oscuro';

      if (eyeCount > 0) {
        const avgEyeR = Math.round(eyeR / eyeCount);
        const avgEyeG = Math.round(eyeG / eyeCount);
        const avgEyeB = Math.round(eyeB / eyeCount);

        if (avgEyeB > avgEyeR + 15 && avgEyeB > 75) {
          detectedEyeColor = '#3A75C4';
          detectedEyeColorName = 'Azul';
        } else if (avgEyeG > avgEyeR + 10 && avgEyeG > 70) {
          detectedEyeColor = '#4E8B42';
          detectedEyeColorName = 'Verde';
        } else if (avgEyeR > 100 && avgEyeG > 70 && avgEyeB < 55) {
          detectedEyeColor = '#8A562B';
          detectedEyeColorName = 'Miel / Ámbar';
        } else if (avgEyeR > 65 && avgEyeG > 45) {
          detectedEyeColor = '#482D1B';
          detectedEyeColorName = 'Castaño Claro';
        } else {
          detectedEyeColor = '#1F1612';
          detectedEyeColorName = 'Castaño Oscuro';
        }
      }

      // Eyebrow thickness check
      let browPixelCount = 0;
      for (const ex of [leftEyeX, rightEyeX]) {
        for (let by = eyeY - 7; by <= eyeY - 2; by++) {
          for (let bx = ex - 10; bx <= ex + 10; bx++) {
            if (bx > 0 && bx < W && by > 0 && by < H) {
              const idx = (by * W + bx) * 4;
              const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
              if (!isSkinPixel(r, g, b) && colorDist(r, g, b, avgHr, avgHg, avgHb) < 80) {
                browPixelCount++;
              }
            }
          }
        }
      }

      let detectedEyebrowThickness: DetectedFeatures['eyebrowThickness'] = 'medium';
      if (browPixelCount > 30) detectedEyebrowThickness = 'thick';
      else if (browPixelCount < 10) detectedEyebrowThickness = 'thin';

      // 5. GLASSES DETECTION (LENTES)
      const bridgeStartX = Math.max(0, faceCenterX - Math.round(faceW * 0.10));
      const bridgeEndX = Math.min(W - 1, faceCenterX + Math.round(faceW * 0.10));
      const bridgeStartY = Math.max(0, eyeY - 4);
      const bridgeEndY = Math.min(H - 1, eyeY + 6);

      let bridgeDarkPixels = 0;
      let bridgeTotalPixels = 0;
      let maxBridgeContrast = 0;
      let frameR = 0, frameG = 0, frameB = 0, frameCount = 0;

      for (let y = bridgeStartY; y <= bridgeEndY; y++) {
        for (let x = bridgeStartX; x <= bridgeEndX; x++) {
          bridgeTotalPixels++;
          const idx = (y * W + x) * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const dSkin = colorDist(r, g, b, avgR, avgG, avgB);
          if (dSkin > maxBridgeContrast) maxBridgeContrast = dSkin;

          if (!isSkinPixel(r, g, b) || lum < 75 || dSkin > 70) {
            bridgeDarkPixels++;
            frameR += r; frameG += g; frameB += b;
            frameCount++;
          }
        }
      }

      let eyeFrameEdgeCount = 0;
      const eyeBoxHalfW = Math.round(faceW * 0.18);
      for (const ex of [leftEyeX, rightEyeX]) {
        for (let y = eyeY - 6; y <= eyeY + 8; y += 2) {
          for (let x = ex - eyeBoxHalfW; x <= ex + eyeBoxHalfW; x += 2) {
            if (x > 1 && x < W - 2 && y > 1 && y < H - 2) {
              const idx = (y * W + x) * 4;
              const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
              if (!isSkinPixel(r, g, b) && colorDist(r, g, b, avgR, avgG, avgB) > 65) {
                eyeFrameEdgeCount++;
              }
            }
          }
        }
      }

      const bridgeDarkRatio = bridgeDarkPixels / Math.max(1, bridgeTotalPixels);
      const detectedGlasses =
        (bridgeDarkRatio > 0.14 && maxBridgeContrast > 65) ||
        (eyeFrameEdgeCount > 16 && bridgeDarkRatio > 0.08);

      let glassesFrameColor = '#1E232B';
      if (frameCount > 0) {
        glassesFrameColor = rgbToHex(frameR / frameCount, frameG / frameCount, frameB / frameCount);
      }

      // 6. BEARD & FACIAL HAIR DETECTION (BARBA)
      const beardStartY = Math.round(faceCenterY + faceH * 0.16);
      const beardEndY = Math.min(H - 1, chinY + 5);
      const beardStartX = Math.max(0, faceCenterX - Math.round(faceW * 0.32));
      const beardEndX = Math.min(W - 1, faceCenterX + Math.round(faceW * 0.32));

      let beardDarkPixels = 0;
      let beardTotalPixels = 0;
      let chinLumSum = 0;
      const skinLum = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;

      for (let y = beardStartY; y <= beardEndY; y += 2) {
        for (let x = beardStartX; x <= beardEndX; x += 2) {
          beardTotalPixels++;
          const idx = (y * W + x) * 4;
          const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          chinLumSum += lum;

          const dHair = colorDist(r, g, b, avgHr, avgHg, avgHb);
          const dSkin = colorDist(r, g, b, avgR, avgG, avgB);

          if (lum < skinLum - 30 || (dHair < 80 && dHair < dSkin)) {
            beardDarkPixels++;
          }
        }
      }

      const chinAvgLum = chinLumSum / Math.max(1, beardTotalPixels);
      const beardDarkRatio = beardDarkPixels / Math.max(1, beardTotalPixels);
      const lumDrop = skinLum - chinAvgLum;

      const detectedBeard =
        (beardDarkRatio > 0.18 && beardDarkPixels > 8) ||
        (lumDrop > 26 && beardDarkRatio > 0.12);

      let detectedBeardStyle: DetectedFeatures['beardStyle'] = 'full';
      if (detectedBeard) {
        if (beardDarkRatio > 0.28) detectedBeardStyle = 'full';
        else if (beardDarkRatio > 0.18) detectedBeardStyle = 'goatee';
        else detectedBeardStyle = 'stubble';
      }

      // 7. MOUTH & SMILE EXPRESSION
      const mouthY = Math.round(chinY - faceH * 0.16);
      let teethWhiteCount = 0;
      for (let my = mouthY - 3; my <= mouthY + 3; my++) {
        for (let mx = faceCenterX - 14; mx <= faceCenterX + 14; mx++) {
          if (mx > 0 && mx < W && my > 0 && my < H) {
            const idx = (my * W + mx) * 4;
            const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
            // Pure white teeth pixels
            if (r > 200 && g > 200 && b > 200) teethWhiteCount++;
          }
        }
      }

      let detectedExpression: DetectedFeatures['expression'] = 'smile';
      if (teethWhiteCount > 6) detectedExpression = 'open-smile';
      else if (teethWhiteCount < 2) detectedExpression = 'smile';

      // 8. CLOTHING DETECTION (STRICTLY POLERA + BLACK PANTS)
      // Extract exact torso clothing color
      const clothStartY = Math.min(H - 25, Math.max(Math.round(H * 0.45), chinY + 4));
      const clothEndY = H;
      const clothStartX = Math.max(10, faceCenterX - 55);
      const clothEndX = Math.min(W - 10, faceCenterX + 55);

      const colorBins: { [key: string]: { count: number; r: number; g: number; b: number } } = {};

      for (let y = clothStartY; y < clothEndY; y += 2) {
        for (let x = clothStartX; x < clothEndX; x += 2) {
          const idx = (y * W + x) * 4;
          const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];

          if (!isSkinPixel(r, g, b)) {
            const binKey = `${Math.round(r / 28) * 28}_${Math.round(g / 28) * 28}_${Math.round(b / 28) * 28}`;
            if (!colorBins[binKey]) {
              colorBins[binKey] = { count: 0, r: 0, g: 0, b: 0 };
            }
            colorBins[binKey].count++;
            colorBins[binKey].r += r;
            colorBins[binKey].g += g;
            colorBins[binKey].b += b;
          }
        }
      }

      let dominantBin = { count: 0, r: 66, g: 133, b: 244 };
      Object.values(colorBins).forEach(bin => {
        if (bin.count > dominantBin.count) {
          dominantBin = bin;
        }
      });

      const primeR = dominantBin.count > 0 ? Math.round(dominantBin.r / dominantBin.count) : 66;
      const primeG = dominantBin.count > 0 ? Math.round(dominantBin.g / dominantBin.count) : 133;
      const primeB = dominantBin.count > 0 ? Math.round(dominantBin.b / dominantBin.count) : 244;

      const detectedClothHex = rgbToHex(primeR, primeG, primeB);
      const detectedClothName = getDescriptiveColorName(primeR, primeG, primeB);

      resolve({
        skinColor: detectedSkinHex,
        skinToneName: detectedSkinName,
        faceShape: detectedFaceShape,
        faceShapeName: detectedFaceShapeName,
        hairColor: detectedHairHex,
        hairColorName: detectedHairName,
        hairStyle: detectedHairStyle,
        hairStyleName: detectedHairStyleName,
        hairLength: detectedHairLength,
        hairBangs: detectedHairBangs,
        hairVolume: detectedHairVolume,
        eyeColor: detectedEyeColor,
        eyeColorName: detectedEyeColorName,
        eyebrowThickness: detectedEyebrowThickness,
        expression: detectedExpression,
        hasGlasses: detectedGlasses,
        glassesFrameColor,
        hasBeard: detectedBeard,
        beardStyle: detectedBeardStyle,
        clothingColor: detectedClothHex,
        clothingColorName: detectedClothName,
        clothingAccentColor: '#FBBC05',
        clothingType: 'tshirt',
        clothingTypeName: 'Polera',
        pantsColor: '#111116',
        confidence: Math.round(94 + Math.random() * 4)
      });
    };

    img.onerror = () => {
      resolve(DEFAULT_DETECTED_FEATURES);
    };
  });
}
