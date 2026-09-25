// Generates crisp pixel art textures for Three.js 3D Character models
import * as THREE from 'three';
import type { DetectedFeatures } from './featureDetector';

export function createFaceTexture(features: DetectedFeatures): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Fill base skin color
    ctx.fillStyle = features.skinColor;
    ctx.fillRect(0, 0, 64, 64);

    // Subtle skin pixel shading
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 0; y < 64; y += 4) {
      for (let x = 0; x < 64; x += 4) {
        if ((x + y) % 8 === 0) {
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }

    // 2. Eyes (Crisp, defined pixel eyes)
    const eyeY = 26;
    // Left eye (viewer's left: x=12..24)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(12, eyeY, 12, 10);
    ctx.fillStyle = '#221510'; // Pupil
    ctx.fillRect(16, eyeY + 2, 8, 8);
    ctx.fillStyle = '#4285F4'; // Google Blue iris accent
    ctx.fillRect(18, eyeY + 4, 4, 4);
    ctx.fillStyle = '#FFFFFF'; // Highlight shine
    ctx.fillRect(16, eyeY + 2, 3, 3);

    // Right eye (viewer's right: x=40..52)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(40, eyeY, 12, 10);
    ctx.fillStyle = '#221510';
    ctx.fillRect(40, eyeY + 2, 8, 8);
    ctx.fillStyle = '#4285F4';
    ctx.fillRect(42, eyeY + 4, 4, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(40, eyeY + 2, 3, 3);

    // Eyebrows (using hair color)
    ctx.fillStyle = features.hairColor;
    ctx.fillRect(10, eyeY - 6, 16, 4);
    ctx.fillRect(38, eyeY - 6, 16, 4);

    // 3. Nose hint
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(30, 38, 4, 6);

    // 4. Mouth / Smile
    ctx.fillStyle = 'rgba(150, 40, 40, 0.65)';
    ctx.fillRect(24, 48, 16, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(26, 48, 12, 2); // subtle teeth smile

    // 5. Reading Glasses (Lentes de lectura con cristales transparentes)
    if (features.hasGlasses) {
      // Thin reading glasses frame rims
      ctx.strokeStyle = '#22262E';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(10, eyeY - 3, 16, 15);
      ctx.strokeRect(38, eyeY - 3, 16, 15);

      // Nose bridge
      ctx.fillStyle = '#22262E';
      ctx.fillRect(26, eyeY + 3, 12, 2.5);

      // Transparent clear glass tint (eyes fully visible behind!)
      ctx.fillStyle = 'rgba(215, 235, 255, 0.22)';
      ctx.fillRect(11, eyeY - 2, 14, 13);
      ctx.fillRect(39, eyeY - 2, 14, 13);

      // Subtle prescription glass glint (white diagonal slash)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fillRect(13, eyeY, 3, 2);
      ctx.fillRect(15, eyeY + 2, 3, 2);
      ctx.fillRect(41, eyeY, 3, 2);
      ctx.fillRect(43, eyeY + 2, 3, 2);
    }

    // 6. Beard / Goatee (if detected)
    if (features.hasBeard) {
      ctx.fillStyle = features.hairColor;
      ctx.fillRect(20, 52, 24, 10);
      ctx.fillRect(24, 44, 16, 3); // mustache
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createTorsoTexture(features: DetectedFeatures): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    if (features.clothingType === 'tshirt') {
      // --- T-SHIRT / POLERA ---
      // 1. Solid base clothing color
      ctx.fillStyle = features.clothingColor;
      ctx.fillRect(0, 0, 64, 96);

      // 2. Round crew neck showing skin
      ctx.fillStyle = features.skinColor;
      ctx.beginPath();
      ctx.arc(32, 0, 16, 0, Math.PI);
      ctx.fill();

      // Collar trim
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(32, 0, 17, 0, Math.PI);
      ctx.stroke();

      // Clean chest: Google mini logo
      const badgeX = 14;
      const badgeY = 28;
      ctx.fillStyle = '#4285F4'; ctx.fillRect(badgeX, badgeY, 5, 5);
      ctx.fillStyle = '#EA4335'; ctx.fillRect(badgeX + 5, badgeY, 5, 5);
      ctx.fillStyle = '#FBBC05'; ctx.fillRect(badgeX, badgeY + 5, 5, 5);
      ctx.fillStyle = '#34A853'; ctx.fillRect(badgeX + 5, badgeY + 5, 5, 5);

      // Bottom hem
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 90, 64, 6);

    } else if (features.clothingType === 'jacket') {
      // --- JACKET / CHAQUETA ---
      // Outer jacket color on sides
      ctx.fillStyle = features.clothingColor;
      ctx.fillRect(0, 0, 64, 96);

      // Open front: Inner white/light-gray t-shirt
      ctx.fillStyle = '#F3F4F6';
      ctx.fillRect(22, 0, 20, 96);

      // Inner shirt crew neck showing skin
      ctx.fillStyle = features.skinColor;
      ctx.beginPath();
      ctx.arc(32, 0, 12, 0, Math.PI);
      ctx.fill();

      // Open jacket lapels (darker shade or contrasting border)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(20, 0, 3, 96); // left zipper edge
      ctx.fillRect(41, 0, 3, 96); // right zipper edge

      // Zipper teeth / slider in metal silver
      ctx.fillStyle = '#9CA3AF';
      for (let y = 14; y < 96; y += 8) {
        ctx.fillRect(21, y, 2, 4);
        ctx.fillRect(41, y, 2, 4);
      }

      // Jacket side pockets
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(6, 62, 14, 16);
      ctx.fillRect(44, 62, 14, 16);

      // Google Pin on left lapel
      ctx.fillStyle = '#FBBC05';
      ctx.fillRect(10, 26, 6, 6);

    } else {
      // --- HOODIE / SUDADERA CON CAPUCHA ---
      ctx.fillStyle = features.clothingColor;
      ctx.fillRect(0, 0, 64, 96);

      // V-neck hoodie collar opening
      ctx.fillStyle = features.skinColor;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(42, 0);
      ctx.lineTo(32, 16);
      ctx.closePath();
      ctx.fill();

      // Thick hoodie collar rim
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(20, 14, 24, 4);

      // White drawstring cords
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(25, 16, 3, 24);
      ctx.fillRect(36, 16, 3, 24);
      // Cord metal tips
      ctx.fillStyle = '#D1D5DB';
      ctx.fillRect(25, 38, 3, 4);
      ctx.fillRect(36, 38, 3, 4);

      // Front kangaroo pocket with distinct shadow and top opening
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(8, 54, 48, 32);
      ctx.fillStyle = features.clothingColor;
      ctx.fillRect(10, 56, 44, 28);
      // Kangaroo pocket slanted side openings
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(8, 58, 4, 18);
      ctx.fillRect(52, 58, 4, 18);

      // Bottom ribbed waistband
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 88, 64, 8);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
