import { useRef, useEffect } from 'react';
import { X, Download, Award } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface GdgIdCardModalProps {
  avatarCanvas: HTMLCanvasElement | null;
  name: string;
  role: string;
  onClose: () => void;
}

export const GdgIdCardModal: React.FC<GdgIdCardModalProps> = ({
  avatarCanvas,
  name,
  role,
  onClose
}) => {
  const cardCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!avatarCanvas || !cardCanvasRef.current) return;

    const canvas = cardCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Card dimensions: 640 x 400 (Golden badge ratio)
    const W = 640;
    const H = 400;
    canvas.width = W;
    canvas.height = H;

    // Outer Background
    ctx.fillStyle = '#16171d';
    ctx.fillRect(0, 0, W, H);

    // Thick black border
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(4, 4, W - 8, H - 8);

    // Google color header stripe
    const stripeColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
    const segW = W / 4;
    stripeColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * segW, 8, segW, 10);
    });

    // Inner Card Header Box
    ctx.fillStyle = '#20222a';
    ctx.fillRect(20, 28, W - 40, 52);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(20, 28, W - 40, 52);

    // Header Title
    ctx.fillStyle = '#FBBC05';
    ctx.font = 'bold 15px "Press Start 2P", monospace';
    ctx.fillText('GOOGLE DEVELOPER CARD', 40, 52);

    ctx.fillStyle = '#4285F4';
    ctx.font = 'bold 10px "Silkscreen", monospace';
    ctx.fillText('OFFICIAL 8-BIT RETRO COMMUNITY PASS', 40, 70);

    // Draw the Avatar (square 220x220)
    const avatarX = 35;
    const avatarY = 100;
    const avatarSize = 220;

    // Avatar shadow & border
    ctx.fillStyle = '#000000';
    ctx.fillRect(avatarX + 6, avatarY + 6, avatarSize, avatarSize);
    ctx.drawImage(avatarCanvas, avatarX, avatarY, avatarSize, avatarSize);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(avatarX, avatarY, avatarSize, avatarSize);

    // Right details container
    const infoX = 280;
    let currY = 115;

    // Name field
    ctx.fillStyle = '#9aa0a6';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillText('PLAYER / DEV:', infoX, currY);

    currY += 24;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Press Start 2P", monospace';
    ctx.fillText((name || 'DEV').toUpperCase().slice(0, 14), infoX, currY);

    // Role field
    currY += 28;
    ctx.fillStyle = '#9aa0a6';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillText('ROLE / GUILD:', infoX, currY);

    currY += 20;
    ctx.fillStyle = '#34A853';
    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.fillText((role || 'GDG COMMUNITY').toUpperCase().slice(0, 18), infoX, currY);

    // Stats Grid
    currY += 32;
    ctx.fillStyle = '#101114';
    ctx.fillRect(infoX, currY, 320, 68);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(infoX, currY, 320, 68);

    // Stat 1: LEVEL
    ctx.fillStyle = '#FBBC05';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillText('LVL: 99', infoX + 16, currY + 24);
    ctx.fillStyle = '#4285F4';
    ctx.fillText('HP: 9999/9999', infoX + 130, currY + 24);

    // Stat 2: EXP / SKILL
    ctx.fillStyle = '#EA4335';
    ctx.fillText('PASS: #GDG-2026', infoX + 16, currY + 50);
    ctx.fillStyle = '#34A853';
    ctx.fillText('STATUS: ONLINE', infoX + 180, currY + 50);

    // Bottom Barcode / Security strip
    currY = 345;
    ctx.fillStyle = '#000000';
    // Draw pseudo-barcode
    const barcodeWidths = [3, 1, 4, 2, 5, 2, 1, 3, 2, 4, 1, 3, 5, 2, 2, 4, 1, 3, 4, 2, 1, 3, 4];
    let bcX = 35;
    barcodeWidths.forEach(w => {
      ctx.fillRect(bcX, currY, w, 28);
      bcX += w + 3;
    });

    // Card Footer Text
    ctx.fillStyle = '#5f6368';
    ctx.font = 'bold 8px "Silkscreen", monospace';
    ctx.fillText('VERIFIED GOOGLE DEVELOPER GROUP IDENTITY • AUTHENTIC PIXEL ART', 220, 362);
  }, [avatarCanvas, name, role]);

  const handleDownload = () => {
    if (!cardCanvasRef.current) return;
    soundManager.playCoin();
    const link = document.createElement('a');
    link.download = `GDG_DEV_PASS_${(name || 'AVATAR').replace(/\s+/g, '_')}.png`;
    link.href = cardCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="pixel-box p-4 sm:p-6 w-full max-w-2xl bg-[#16171d] relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Award className="text-[#FBBC05]" size={20} />
            <h3 className="font-pixel-heading text-xs sm:text-sm text-[#FBBC05]">
              CREDENCIAL GDG RETRO
            </h3>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 hover:bg-[#2c2d38] border border-transparent hover:border-black text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Card Canvas Preview */}
        <div className="overflow-x-auto p-2 bg-[#0b0c0e] border-2 border-black flex justify-center mb-4">
          <canvas
            ref={cardCanvasRef}
            className="max-w-full h-auto shadow-[4px_4px_0_#000] crisp-pixel"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full sm:w-auto pixel-btn pixel-btn-dark text-xs py-2.5 px-4"
          >
            CERRAR
          </button>
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto pixel-btn pixel-btn-green text-xs py-2.5 px-6"
          >
            <Download size={16} />
            <span>DESCARGAR CREDENCIAL (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
