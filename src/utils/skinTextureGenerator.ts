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

    // Subtle skin pixel shading / noise
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    for (let y = 0; y < 64; y += 4) {
      for (let x = 0; x < 64; x += 4) {
        if ((x + y) % 8 === 0) {
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }

    // 2. Eyes
    const eyeY = 26;
    // Left eye (from viewer perspective: x=14)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(12, eyeY, 12, 10);
    ctx.fillStyle = '#221510'; // Pupil
    ctx.fillRect(16, eyeY + 2, 8, 8);
    ctx.fillStyle = '#4285F4'; // Google Blue iris accent
    ctx.fillRect(18, eyeY + 4, 4, 4);
    ctx.fillStyle = '#FFFFFF'; // Highlight shine
    ctx.fillRect(16, eyeY + 2, 3, 3);

    // Right eye (x=40)
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

    // 5. Glasses (if detected)
    if (features.hasGlasses) {
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 3;
      ctx.strokeRect(9, eyeY - 2, 18, 14);
      ctx.strokeRect(37, eyeY - 2, 18, 14);
      ctx.beginPath();
      ctx.moveTo(27, eyeY + 4);
      ctx.lineTo(37, eyeY + 4);
      ctx.stroke();
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
    // Base clothing color
    ctx.fillStyle = features.clothingColor;
    ctx.fillRect(0, 0, 64, 96);

    // Subtle fabric pixel texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let y = 0; y < 96; y += 4) {
      for (let x = 0; x < 64; x += 4) {
        if ((x + y) % 8 === 0) ctx.fillRect(x, y, 4, 4);
      }
    }

    // Collar / Neck opening
    ctx.fillStyle = features.skinColor;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(42, 0);
    ctx.lineTo(32, 18);
    ctx.closePath();
    ctx.fill();

    if (features.clothingType === 'hoodie') {
      // Hoodie neckline string & kangaroo pocket
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(25, 12, 3, 22);
      ctx.fillRect(36, 12, 3, 22);

      // Kangaroo pocket
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(10, 58, 44, 28);
      ctx.fillStyle = features.clothingColor;
      ctx.fillRect(12, 60, 40, 24);
    } else if (features.clothingType === 'jacket') {
      // Inner shirt (white or secondary)
      ctx.fillStyle = '#F3F4F6';
      ctx.fillRect(26, 0, 12, 96);
      // Jacket zipper / borders
      ctx.fillStyle = '#111827';
      ctx.fillRect(24, 0, 2, 96);
      ctx.fillRect(38, 0, 2, 96);
    }

    // Google Community Badge on chest
    const badgeX = 42;
    const badgeY = 28;
    ctx.fillStyle = '#4285F4'; ctx.fillRect(badgeX, badgeY, 4, 4);
    ctx.fillStyle = '#EA4335'; ctx.fillRect(badgeX + 4, badgeY, 4, 4);
    ctx.fillStyle = '#FBBC05'; ctx.fillRect(badgeX, badgeY + 4, 4, 4);
    ctx.fillStyle = '#34A853'; ctx.fillRect(badgeX + 4, badgeY + 4, 4, 4);

    // Bottom hem
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 88, 64, 8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
