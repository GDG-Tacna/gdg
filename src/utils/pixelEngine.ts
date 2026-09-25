// Minecraft Style Pixel Engine
// High-clarity blocky aesthetic preserving skin tone and clothing with sharp facial recognition.

export interface PixelOptions {
  resolution: number; // e.g. 48, 64, 80, 96, 128 (high clarity)
  colorSteps: number; // 16, 32, 64 (Full)
  dither: 'none' | 'bayer4x4';
  outline: 'none' | 'subtle' | 'bold';
  sharpness: number; // 0 to 100% (Unsharp mask for facial clarity)
  minecraftBlocks: boolean; // 3D Minecraft voxel block bevel effect
  brightness: number; // -40 to 40
  contrast: number; // -30 to 50
  saturation: number; // -30 to 80
  background: 'original' | 'google-blue' | 'google-red' | 'google-yellow' | 'google-green' | 'minecraft-dirt' | 'checker' | 'arcade';
  zoom: number; // 1.0 to 2.5
  panX: number; // -50 to 50 %
  panY: number; // -50 to 50 %
  name?: string;
  role?: string;
  nameStyle?: 'minecraft-tag' | 'arcade-plate' | 'none';
  showHearts?: boolean;
  frame?: 'minecraft-dirt' | 'minecraft-diamond' | 'google-4color' | 'arcade' | 'none';
  sticker?: 'none' | 'diamond-helmet' | 'diamond-sword' | 'glasses' | 'google-hat' | 'gdg-badge' | 'heart' | 'gamepad';
  stickerScale?: number;
  stickerY?: number;
}

export const DEFAULT_PIXEL_OPTIONS: PixelOptions = {
  resolution: 96, // 96x96 default: high clarity, clearly visible face and clothes!
  colorSteps: 64, // Full color fidelity to preserve exact skin tone and clothes
  dither: 'none', // No noisy dither by default, clean Minecraft blocks
  outline: 'none',
  sharpness: 45, // Sharp facial features
  minecraftBlocks: true, // 3D block bevel for authentic Minecraft look
  brightness: 0,
  contrast: 10,
  saturation: 15,
  background: 'original',
  zoom: 1.35, // Focus on portrait bust
  panX: 0,
  panY: -5,
  name: 'STEVE_DEV',
  role: 'GDG MINER',
  nameStyle: 'minecraft-tag',
  showHearts: true,
  frame: 'minecraft-dirt',
  sticker: 'none',
  stickerScale: 1,
  stickerY: 0
};

// 4x4 Bayer Dithering Matrix
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

// Color adjustment helper
function adjustColor(r: number, g: number, b: number, brightness: number, contrast: number, saturation: number): [number, number, number] {
  let nr = r + brightness * 1.4;
  let ng = g + brightness * 1.4;
  let nb = b + brightness * 1.4;

  if (contrast !== 0) {
    const factor = (259 * (contrast + 100)) / (100 * (259 - contrast));
    nr = factor * (nr - 128) + 128;
    ng = factor * (ng - 128) + 128;
    nb = factor * (nb - 128) + 128;
  }

  nr = Math.max(0, Math.min(255, nr));
  ng = Math.max(0, Math.min(255, ng));
  nb = Math.max(0, Math.min(255, nb));

  if (saturation !== 0) {
    const gray = 0.2989 * nr + 0.587 * ng + 0.114 * nb;
    const satFactor = 1 + saturation / 100;
    nr = Math.max(0, Math.min(255, gray + (nr - gray) * satFactor));
    ng = Math.max(0, Math.min(255, gray + (ng - gray) * satFactor));
    nb = Math.max(0, Math.min(255, gray + (nb - gray) * satFactor));
  }

  return [Math.round(nr), Math.round(ng), Math.round(nb)];
}

// Color quantization
function quantizeChannel(val: number, steps: number, ditherOffset = 0): number {
  if (steps >= 64) return Math.max(0, Math.min(255, Math.round(val)));
  const dithered = Math.max(0, Math.min(255, val + ditherOffset));
  const stepSize = 255 / (steps - 1);
  return Math.round(Math.round(dithered / stepSize) * stepSize);
}

// Apply unsharp mask filter to enhance facial clarity (eyes, nose, mouth)
function applySharpen(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  if (amount <= 0) return;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const copy = new Uint8ClampedArray(data);
  const factor = (amount / 100) * 0.8;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const center = copy[idx + c];
        const neighbors = (
          copy[((y - 1) * w + x) * 4 + c] +
          copy[((y + 1) * w + x) * 4 + c] +
          copy[(y * w + (x - 1)) * 4 + c] +
          copy[(y * w + (x + 1)) * 4 + c]
        );
        const sharpened = center + (center * 4 - neighbors) * factor;
        data[idx + c] = Math.max(0, Math.min(255, Math.round(sharpened)));
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

// Main Pixel Render Function
export function renderPixelArt(
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  options: PixelOptions,
  exportSize = 512
) {
  const {
    resolution,
    colorSteps,
    dither,
    outline,
    sharpness,
    minecraftBlocks,
    brightness,
    contrast,
    saturation,
    background,
    zoom,
    panX,
    panY,
    name,
    role,
    nameStyle,
    showHearts,
    frame,
    sticker
  } = options;

  const lowW = resolution;
  const lowH = resolution;

  // 1. Offscreen low-resolution sampling canvas
  const lowCanvas = document.createElement('canvas');
  lowCanvas.width = lowW;
  lowCanvas.height = lowH;
  const lowCtx = lowCanvas.getContext('2d', { willReadFrequently: true });
  if (!lowCtx) return;

  // High quality sampling
  lowCtx.imageSmoothingEnabled = true;
  lowCtx.imageSmoothingQuality = 'high';

  // Compute crop coordinates
  const srcW = 'videoWidth' in source ? source.videoWidth : source.width;
  const srcH = 'videoHeight' in source ? source.videoHeight : source.height;
  const minDim = Math.min(srcW, srcH);
  const cropDim = minDim / zoom;

  const centerX = srcW / 2 + (panX / 100) * (srcW / 2);
  const centerY = srcH / 2 + (panY / 100) * (srcH / 2);

  const srcX = Math.max(0, Math.min(srcW - cropDim, centerX - cropDim / 2));
  const srcY = Math.max(0, Math.min(srcH - cropDim, centerY - cropDim / 2));

  // Draw cropped region into low-res canvas
  lowCtx.drawImage(source, srcX, srcY, cropDim, cropDim, 0, 0, lowW, lowH);

  // Apply facial clarity sharpen
  if (sharpness > 0) {
    applySharpen(lowCtx, lowW, lowH, sharpness);
  }

  // 2. Process pixel data
  const imgData = lowCtx.getImageData(0, 0, lowW, lowH);
  const data = imgData.data;

  // Luminance buffer for optional edge outline
  const lumaBuffer = outline !== 'none' ? new Float32Array(lowW * lowH) : null;

  for (let y = 0; y < lowH; y++) {
    for (let x = 0; x < lowW; x++) {
      const idx = (y * lowW + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];

      // Exact skin tone and clothing adjustment
      [r, g, b] = adjustColor(r, g, b, brightness, contrast, saturation);

      if (lumaBuffer) {
        lumaBuffer[y * lowW + x] = 0.299 * r + 0.587 * g + 0.114 * b;
      }

      // Dithering
      let ditherOffset = 0;
      if (dither === 'bayer4x4' && colorSteps < 64) {
        const bayerVal = BAYER_4X4[y % 4][x % 4];
        const stepRange = 255 / (colorSteps - 1);
        ditherOffset = (bayerVal / 15 - 0.5) * (stepRange * 0.7);
      }

      // Quantization
      r = quantizeChannel(r, colorSteps, ditherOffset);
      g = quantizeChannel(g, colorSteps, ditherOffset);
      b = quantizeChannel(b, colorSteps, ditherOffset);

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
    }
  }

  // Edge outline if requested
  if (outline !== 'none' && lumaBuffer) {
    const threshold = outline === 'bold' ? 24 : 38;
    for (let y = 0; y < lowH - 1; y++) {
      for (let x = 0; x < lowW - 1; x++) {
        const cur = lumaBuffer[y * lowW + x];
        const right = lumaBuffer[y * lowW + (x + 1)];
        const bottom = lumaBuffer[(y + 1) * lowW + x];
        const diff = Math.max(Math.abs(cur - right), Math.abs(cur - bottom));
        if (diff > threshold) {
          const idx = (y * lowW + x) * 4;
          data[idx] = Math.round(data[idx] * 0.3);
          data[idx + 1] = Math.round(data[idx + 1] * 0.3);
          data[idx + 2] = Math.round(data[idx + 2] * 0.3);
        }
      }
    }
  }

  lowCtx.putImageData(imgData, 0, 0);

  // 3. Render onto high-res target canvas
  targetCanvas.width = exportSize;
  targetCanvas.height = exportSize;
  const targetCtx = targetCanvas.getContext('2d');
  if (!targetCtx) return;

  targetCtx.imageSmoothingEnabled = false;

  // Background
  if (background === 'google-blue') {
    targetCtx.fillStyle = '#4285F4';
    targetCtx.fillRect(0, 0, exportSize, exportSize);
  } else if (background === 'google-red') {
    targetCtx.fillStyle = '#EA4335';
    targetCtx.fillRect(0, 0, exportSize, exportSize);
  } else if (background === 'google-yellow') {
    targetCtx.fillStyle = '#FBBC05';
    targetCtx.fillRect(0, 0, exportSize, exportSize);
  } else if (background === 'google-green') {
    targetCtx.fillStyle = '#34A853';
    targetCtx.fillRect(0, 0, exportSize, exportSize);
  } else if (background === 'minecraft-dirt') {
    // Minecraft Dirt block background
    targetCtx.fillStyle = '#866043';
    targetCtx.fillRect(0, 0, exportSize, exportSize);
    const step = exportSize / 16;
    for (let cy = 0; cy < 16; cy++) {
      for (let cx = 0; cx < 16; cx++) {
        if ((cx * 7 + cy * 13) % 5 === 0) {
          targetCtx.fillStyle = '#714e35';
          targetCtx.fillRect(cx * step, cy * step, step, step);
        } else if ((cx * 3 + cy * 11) % 4 === 0) {
          targetCtx.fillStyle = '#9b7252';
          targetCtx.fillRect(cx * step, cy * step, step, step);
        }
      }
    }
  } else if (background === 'checker') {
    const checkerSize = exportSize / 16;
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
    for (let cy = 0; cy < 16; cy++) {
      for (let cx = 0; cx < 16; cx++) {
        targetCtx.fillStyle = colors[(cx + cy) % 4];
        targetCtx.fillRect(cx * checkerSize, cy * checkerSize, checkerSize, checkerSize);
      }
    }
  } else if (background === 'arcade') {
    targetCtx.fillStyle = '#121316';
    targetCtx.fillRect(0, 0, exportSize, exportSize);
  }

  // Draw pixel portrait: either with 3D Minecraft voxel block bevels or crisp flat blocks
  const blockSize = exportSize / lowW;

  if (minecraftBlocks) {
    // Render authentic Minecraft voxel blocks with subtle top/left highlight and bottom/right shadow!
    for (let y = 0; y < lowH; y++) {
      for (let x = 0; x < lowW; x++) {
        const idx = (y * lowW + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const px = Math.round(x * blockSize);
        const py = Math.round(y * blockSize);
        const pw = Math.round((x + 1) * blockSize) - px;
        const ph = Math.round((y + 1) * blockSize) - py;

        // Base block fill
        targetCtx.fillStyle = `rgb(${r},${g},${b})`;
        targetCtx.fillRect(px, py, pw, ph);

        // Subtle 3D Minecraft voxel bevel (only on high res when block size >= 3px)
        if (blockSize >= 4) {
          // Top & Left highlight (sunlight)
          targetCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          targetCtx.fillRect(px, py, pw, 1);
          targetCtx.fillRect(px, py, 1, ph);

          // Bottom & Right shadow
          targetCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          targetCtx.fillRect(px, py + ph - 1, pw, 1);
          targetCtx.fillRect(px + pw - 1, py, 1, ph);
        }
      }
    }
  } else {
    // Clean crisp flat pixels
    targetCtx.drawImage(lowCanvas, 0, 0, exportSize, exportSize);
  }

  // 4. Draw Minecraft Hearts Bar (if enabled)
  if (showHearts) {
    drawMinecraftHearts(targetCtx, exportSize);
  }

  // 5. Draw Stickers / Accessories
  if (sticker && sticker !== 'none') {
    drawMinecraftSticker(targetCtx, sticker, exportSize, options.stickerScale || 1, options.stickerY || 0);
  }

  // 6. Draw Frame
  if (frame && frame !== 'none') {
    drawMinecraftFrame(targetCtx, frame, exportSize);
  }

  // 7. Draw Name Tag
  if (name && name.trim().length > 0) {
    if (nameStyle === 'minecraft-tag') {
      drawMinecraftNameTag(targetCtx, name.trim(), role?.trim() || '', exportSize);
    } else if (nameStyle === 'arcade-plate') {
      drawArcadeNameplate(targetCtx, name.toUpperCase().trim(), role?.toUpperCase().trim() || '', exportSize);
    }
  }
}

// Draw authentic Minecraft In-Game Floating Player Name Tag
function drawMinecraftNameTag(ctx: CanvasRenderingContext2D, name: string, role: string, size: number) {
  const tagY = size - 48 * (size / 512);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const displayText = role ? `${name} [${role}]` : name;
  const fontSize = Math.max(11, Math.round(size * 0.038));
  ctx.font = `bold ${fontSize}px "Silkscreen", "Press Start 2P", monospace`;

  const textWidth = ctx.measureText(displayText).width;
  const boxW = textWidth + 24;
  const boxH = fontSize * 1.8;
  const boxX = (size - boxW) / 2;

  // Minecraft player nametag: black semi-transparent box
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(boxX, tagY - boxH / 2, boxW, boxH);

  // Minecraft level badge (green text like in Minecraft XP bar)
  ctx.fillStyle = '#55FF55'; // Classic Minecraft bright green
  ctx.font = `bold ${Math.round(fontSize * 0.85)}px "Press Start 2P", monospace`;
  ctx.fillText('99', boxX + 10, tagY);

  // Name text: White with subtle black shadow
  ctx.font = `bold ${fontSize}px "Silkscreen", monospace`;
  ctx.fillStyle = '#000000';
  ctx.fillText(displayText, size / 2 + 10 + 1, tagY + 1);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(displayText, size / 2 + 10, tagY);

  ctx.restore();
}

// Draw Arcade HUD Nameplate
function drawArcadeNameplate(ctx: CanvasRenderingContext2D, name: string, role: string, size: number) {
  const plateHeight = role ? size * 0.15 : size * 0.11;
  const plateY = size - plateHeight - 16;
  const plateX = 24;
  const plateW = size - 48;

  ctx.fillStyle = '#000000';
  ctx.fillRect(plateX + 4, plateY + 4, plateW, plateHeight);
  ctx.fillStyle = '#181920';
  ctx.fillRect(plateX, plateY, plateW, plateHeight);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(plateX, plateY, plateW, plateHeight);

  // Google 4 colors top line
  ctx.fillStyle = '#4285F4';
  ctx.fillRect(plateX + 4, plateY + 3, plateW * 0.25 - 2, 3);
  ctx.fillStyle = '#EA4335';
  ctx.fillRect(plateX + plateW * 0.25 + 2, plateY + 3, plateW * 0.25 - 2, 3);
  ctx.fillStyle = '#FBBC05';
  ctx.fillRect(plateX + plateW * 0.5 + 2, plateY + 3, plateW * 0.25 - 2, 3);
  ctx.fillStyle = '#34A853';
  ctx.fillRect(plateX + plateW * 0.75 + 2, plateY + 3, plateW * 0.25 - 6, 3);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(size * 0.045)}px "Press Start 2P", monospace`;
  ctx.fillStyle = '#FBBC05';
  ctx.fillText(name, size / 2, plateY + (role ? plateHeight * 0.38 : plateHeight * 0.55));

  if (role) {
    ctx.font = `bold ${Math.round(size * 0.024)}px "Silkscreen", monospace`;
    ctx.fillStyle = '#34A853';
    ctx.fillText(role, size / 2, plateY + plateHeight * 0.75);
  }
}

// Draw Minecraft 10-Heart Bar
function drawMinecraftHearts(ctx: CanvasRenderingContext2D, size: number) {
  const p = size / 256;
  const startX = 16 * p;
  const startY = 16 * p;
  const heartSpacing = 11 * p;

  ctx.save();
  for (let i = 0; i < 10; i++) {
    const hx = startX + i * heartSpacing;
    const hy = startY;

    // Heart black border
    ctx.fillStyle = '#000000';
    ctx.fillRect(hx + 1 * p, hy, 3 * p, 1 * p);
    ctx.fillRect(hx + 5 * p, hy, 3 * p, 1 * p);
    ctx.fillRect(hx, hy + 1 * p, 9 * p, 4 * p);
    ctx.fillRect(hx + 1 * p, hy + 5 * p, 7 * p, 2 * p);
    ctx.fillRect(hx + 2 * p, hy + 7 * p, 5 * p, 1.5 * p);
    ctx.fillRect(hx + 3 * p, hy + 8.5 * p, 3 * p, 1 * p);
    ctx.fillRect(hx + 4 * p, hy + 9.5 * p, 1 * p, 1 * p);

    // Heart red fill
    ctx.fillStyle = '#EA4335'; // Google Red
    ctx.fillRect(hx + 1 * p, hy + 1 * p, 3 * p, 1 * p);
    ctx.fillRect(hx + 5 * p, hy + 1 * p, 3 * p, 1 * p);
    ctx.fillRect(hx + 1 * p, hy + 2 * p, 7 * p, 3 * p);
    ctx.fillRect(hx + 2 * p, hy + 5 * p, 5 * p, 2 * p);
    ctx.fillRect(hx + 3 * p, hy + 7 * p, 3 * p, 1.5 * p);
    ctx.fillRect(hx + 4 * p, hy + 8.5 * p, 1 * p, 1 * p);

    // Pixel highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(hx + 2 * p, hy + 2 * p, 1 * p, 1 * p);
  }
  ctx.restore();
}

// Draw Minecraft Stickers / Items
function drawMinecraftSticker(
  ctx: CanvasRenderingContext2D,
  sticker: PixelOptions['sticker'],
  size: number,
  scale: number,
  yOffset: number
) {
  const p = size / 32;
  const midX = size / 2;
  const centerY = size * 0.42 + yOffset * p;

  ctx.save();
  ctx.translate(midX, centerY);
  ctx.scale(scale, scale);

  if (sticker === 'diamond-helmet') {
    // Minecraft Diamond Helmet
    const hy = -13 * p;
    // Diamond cyan main color: #4BEDD7
    ctx.fillStyle = '#000000';
    ctx.fillRect(-12 * p, hy - 1 * p, 24 * p, 18 * p);

    ctx.fillStyle = '#4BEDD7'; // Diamond
    ctx.fillRect(-11 * p, hy, 22 * p, 8 * p);
    // Left ear guard
    ctx.fillRect(-11 * p, hy + 8 * p, 6 * p, 8 * p);
    // Right ear guard
    ctx.fillRect(5 * p, hy + 8 * p, 6 * p, 8 * p);
    // Nose bridge
    ctx.fillRect(-2 * p, hy + 8 * p, 4 * p, 5 * p);

    // Dark diamond shading
    ctx.fillStyle = '#2CBAA8';
    ctx.fillRect(-11 * p, hy + 14 * p, 6 * p, 2 * p);
    ctx.fillRect(5 * p, hy + 14 * p, 6 * p, 2 * p);
    ctx.fillRect(-11 * p, hy, 22 * p, 2 * p);
  } else if (sticker === 'diamond-sword') {
    // Minecraft Diamond Sword held on the right
    const sx = 7 * p;
    const sy = 2 * p;
    // Blade
    ctx.fillStyle = '#4BEDD7';
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(sx + i * 1.5 * p, sy - i * 1.5 * p, 3 * p, 3 * p);
    }
    // Guard
    ctx.fillStyle = '#313233';
    ctx.fillRect(sx - 1 * p, sy + 3 * p, 4 * p, 2 * p);
    // Handle
    ctx.fillStyle = '#866043';
    ctx.fillRect(sx - 2 * p, sy + 5 * p, 2 * p, 3 * p);
  } else if (sticker === 'glasses') {
    // Thug Life / 8-Bit Pixel Sunglasses
    ctx.fillStyle = '#000000';
    ctx.fillRect(-10 * p, -3 * p, 9 * p, 5 * p);
    ctx.fillRect(1 * p, -3 * p, 9 * p, 5 * p);
    ctx.fillRect(-1 * p, -2 * p, 2 * p, 2 * p);
    ctx.fillRect(-13 * p, -3 * p, 3 * p, 2 * p);
    ctx.fillRect(10 * p, -3 * p, 3 * p, 2 * p);
    // White pixel glare
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-8 * p, -2 * p, 2 * p, 1.5 * p);
    ctx.fillRect(3 * p, -2 * p, 2 * p, 1.5 * p);
  } else if (sticker === 'google-hat') {
    // Google Colors Beanie
    const capY = -14 * p;
    ctx.fillStyle = '#4285F4';
    ctx.fillRect(-12 * p, capY + 4 * p, 24 * p, 3 * p);
    ctx.fillStyle = '#EA4335';
    ctx.fillRect(-10 * p, capY + 1 * p, 20 * p, 3 * p);
    ctx.fillStyle = '#FBBC05';
    ctx.fillRect(-8 * p, capY - 2 * p, 16 * p, 3 * p);
    ctx.fillStyle = '#34A853';
    ctx.fillRect(-5 * p, capY - 4 * p, 10 * p, 2 * p);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-2 * p, capY - 6 * p, 4 * p, 2 * p);
  } else if (sticker === 'gdg-badge') {
    // GDG Community Pin
    const pinX = 6 * p;
    const pinY = 6 * p;
    ctx.fillStyle = '#000000';
    ctx.fillRect(pinX - 1 * p, pinY - 1 * p, 8 * p, 8 * p);
    ctx.fillStyle = '#4285F4';
    ctx.fillRect(pinX, pinY, 3 * p, 3 * p);
    ctx.fillStyle = '#EA4335';
    ctx.fillRect(pinX + 3 * p, pinY, 3 * p, 3 * p);
    ctx.fillStyle = '#FBBC05';
    ctx.fillRect(pinX, pinY + 3 * p, 3 * p, 3 * p);
    ctx.fillStyle = '#34A853';
    ctx.fillRect(pinX + 3 * p, pinY + 3 * p, 3 * p, 3 * p);
  } else if (sticker === 'heart') {
    ctx.fillStyle = '#EA4335';
    const hx = 6 * p;
    const hy = -8 * p;
    ctx.fillRect(hx + 1 * p, hy, 2 * p, 2 * p);
    ctx.fillRect(hx + 4 * p, hy, 2 * p, 2 * p);
    ctx.fillRect(hx, hy + 2 * p, 7 * p, 3 * p);
    ctx.fillRect(hx + 1 * p, hy + 5 * p, 5 * p, 2 * p);
    ctx.fillRect(hx + 2 * p, hy + 7 * p, 3 * p, 1.5 * p);
    ctx.fillRect(hx + 3 * p, hy + 8.5 * p, 1 * p, 1 * p);
  } else if (sticker === 'gamepad') {
    ctx.fillStyle = '#202124';
    ctx.fillRect(-8 * p, 8 * p, 16 * p, 7 * p);
    ctx.fillStyle = '#4285F4';
    ctx.fillRect(-6 * p, 10 * p, 4 * p, 1.5 * p);
    ctx.fillRect(-5 * p, 9 * p, 2 * p, 3.5 * p);
    ctx.fillStyle = '#EA4335';
    ctx.fillRect(4 * p, 10.5 * p, 2 * p, 2 * p);
    ctx.fillStyle = '#FBBC05';
    ctx.fillRect(1.5 * p, 11.5 * p, 2 * p, 2 * p);
  }

  ctx.restore();
}

// Draw Frames
function drawMinecraftFrame(ctx: CanvasRenderingContext2D, frame: string, size: number) {
  const p = size / 32;

  if (frame === 'minecraft-dirt') {
    // Minecraft Grass / Dirt Block Border
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#5c3d25';
    ctx.strokeRect(7, 7, size - 14, size - 14);

    // Top grass block green rim
    ctx.fillStyle = '#497e28';
    ctx.fillRect(0, 0, size, 16);
    ctx.fillStyle = '#3a6620';
    for (let i = 0; i < size; i += 16) {
      ctx.fillRect(i, 16, 8, 6);
    }
  } else if (frame === 'minecraft-diamond') {
    // Minecraft Diamond Block Border
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#2cbbaa';
    ctx.strokeRect(6, 6, size - 12, size - 12);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#6ef4e2';
    ctx.strokeRect(12, 12, size - 24, size - 24);
  } else if (frame === 'google-4color') {
    const bSize = 2 * p;
    const cornerLen = 6 * p;

    // Top-Left: Blue
    ctx.fillStyle = '#4285F4';
    ctx.fillRect(0, 0, cornerLen, bSize);
    ctx.fillRect(0, 0, bSize, cornerLen);

    // Top-Right: Red
    ctx.fillStyle = '#EA4335';
    ctx.fillRect(size - cornerLen, 0, cornerLen, bSize);
    ctx.fillRect(size - bSize, 0, bSize, cornerLen);

    // Bottom-Left: Yellow
    ctx.fillStyle = '#FBBC05';
    ctx.fillRect(0, size - bSize, cornerLen, bSize);
    ctx.fillRect(0, size - cornerLen, bSize, cornerLen);

    // Bottom-Right: Green
    ctx.fillStyle = '#34A853';
    ctx.fillRect(size - cornerLen, size - bSize, cornerLen, bSize);
    ctx.fillRect(size - bSize, size - cornerLen, bSize, cornerLen);

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(2, 2, size - 4, size - 4);
  } else if (frame === 'arcade') {
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(6, 6, size - 12, size - 12);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FBBC05';
    ctx.strokeRect(14, 14, size - 28, size - 28);
  }
}
