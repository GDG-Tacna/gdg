// Generates crisp pixel art textures for Three.js 3D Character models
import * as THREE from 'three';
import type { DetectedFeatures } from './featureDetector';

export function createFaceTexture(features: DetectedFeatures): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Fill base skin color (exact detected skin tone)
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
    const lipCol = features.gender === 'female' ? (features.lipColor || '#C83E58') : 'rgba(150, 40, 40, 0.65)';
    ctx.fillStyle = lipCol;
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

    // 6. Beard / Goatee (strictly disabled for female presentation)
    if (features.hasBeard && features.gender !== 'female') {
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
    // Check if we have the user's actual clothing crop
    if (features.clothingCanvas) {
      // 1. Draw the user's exact clothing image in crisp pixel art!
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(features.clothingCanvas, 0, 0, 64, 96);

      // 2. Add collar details matching the clothing style and skin tone
      if (features.clothingType === 'tshirt') {
        // Crew neckline showing exact skin tone
        ctx.fillStyle = features.skinColor;
        ctx.beginPath();
        ctx.arc(32, 0, 15, 0, Math.PI);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(32, 0, 16, 0, Math.PI);
        ctx.stroke();
      } else if (features.clothingType === 'jacket') {
        // Zipper / open front division
        ctx.strokeStyle = '#1E232A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(32, 0);
        ctx.lineTo(32, 96);
        ctx.stroke();
      } else if (features.clothingType === 'hoodie') {
        // Hoodie white strings
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(26, 14, 2.5, 22);
        ctx.fillRect(35, 14, 2.5, 22);
      }
    } else {
      // Procedural garment rendering
      if (features.clothingType === 'tshirt') {
        // --- T-SHIRT / POLERA ---
        ctx.fillStyle = features.clothingColor;
        ctx.fillRect(0, 0, 64, 96);

        // Round crew neck showing skin
        ctx.fillStyle = features.skinColor;
        ctx.beginPath();
        ctx.arc(32, 0, 16, 0, Math.PI);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(32, 0, 17, 0, Math.PI);
        ctx.stroke();

        // Google mini logo
        const badgeX = 14;
        const badgeY = 28;
        ctx.fillStyle = '#4285F4'; ctx.fillRect(badgeX, badgeY, 5, 5);
        ctx.fillStyle = '#EA4335'; ctx.fillRect(badgeX + 5, badgeY, 5, 5);
        ctx.fillStyle = '#FBBC05'; ctx.fillRect(badgeX, badgeY + 5, 5, 5);
        ctx.fillStyle = '#34A853'; ctx.fillRect(badgeX + 5, badgeY + 5, 5, 5);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 90, 64, 6);

      } else if (features.clothingType === 'jacket') {
        // --- JACKET / CHAQUETA ---
        ctx.fillStyle = features.clothingColor;
        ctx.fillRect(0, 0, 64, 96);

        // Open front: Inner white/light-gray t-shirt
        ctx.fillStyle = '#F3F4F6';
        ctx.fillRect(22, 0, 20, 96);

        // Inner shirt crew neck
        ctx.fillStyle = features.skinColor;
        ctx.beginPath();
        ctx.arc(32, 0, 12, 0, Math.PI);
        ctx.fill();

        // Open jacket lapel borders
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(20, 0, 3, 96);
        ctx.fillRect(41, 0, 3, 96);

        // Metal zipper teeth
        ctx.fillStyle = '#9CA3AF';
        for (let y = 14; y < 96; y += 8) {
          ctx.fillRect(21, y, 2, 4);
          ctx.fillRect(41, y, 2, 4);
        }

        // Pockets
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(6, 62, 14, 16);
        ctx.fillRect(44, 62, 14, 16);

      } else {
        // --- POLERA / T-SHIRT (DEFAULT) ---
        ctx.fillStyle = features.clothingColor;
        ctx.fillRect(0, 0, 64, 96);

        // V-neck opening
        ctx.fillStyle = features.skinColor;
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(42, 0);
        ctx.lineTo(32, 16);
        ctx.closePath();
        ctx.fill();

        // Collar rim
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(20, 14, 24, 4);

        // White cords
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(25, 16, 3, 24);
        ctx.fillRect(36, 16, 3, 24);

        // Kangaroo pocket
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(8, 54, 48, 32);
        ctx.fillStyle = features.clothingColor;
        ctx.fillRect(10, 56, 44, 28);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.fillRect(0, 88, 64, 8);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
