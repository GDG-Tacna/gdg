import { useRef, useEffect, useState } from 'react';
import { Download, Copy, Check, Eye, EyeOff, Award, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { type PixelOptions, renderPixelArt } from '../utils/pixelEngine';
import { soundManager } from '../utils/sound';
import { GdgIdCardModal } from './GdgIdCardModal';

interface AvatarDisplayProps {
  sourceImage: string;
  options: PixelOptions;
  onChangePhoto: () => void;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  sourceImage,
  options,
  onChangePhoto
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Load source image into HTMLImageElement
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceImage;
    img.onload = () => {
      setImgElement(img);
    };
  }, [sourceImage]);

  // Re-render pixel art whenever options or source image change
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;
    renderPixelArt(imgElement, canvasRef.current, options, 512);
  }, [imgElement, options]);

  // Trigger celebratory confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853']
    });
  };

  // Download Pixel Art PNG
  const handleDownload = () => {
    if (!canvasRef.current) return;
    soundManager.playCoin();
    triggerConfetti();

    const link = document.createElement('a');
    const safeName = (options.name || 'PIXEL_AVATAR').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeName}_pixel_avatar.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Copy to clipboard
  const handleCopyClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      soundManager.playClick();
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        soundManager.playSuccess();
        setTimeout(() => setCopied(false), 2500);
      });
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <div className="pixel-box p-4 sm:p-6 text-center bg-[#17181f]">
      {/* Top action header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#34A853] border border-black" />
          <h2 className="font-pixel-heading text-xs sm:text-sm text-[#34A853]">
            AVATAR GENERADO
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setShowOriginal(!showOriginal);
            }}
            className={`pixel-btn text-[10px] py-1 px-2.5 ${
              showOriginal ? 'pixel-btn-yellow' : 'pixel-btn-dark'
            }`}
            title="Comparar con la foto original"
          >
            {showOriginal ? <EyeOff size={12} /> : <Eye size={12} />}
            <span>{showOriginal ? 'VER PIXEL' : 'VER ORIGINAL'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onChangePhoto();
            }}
            className="pixel-btn pixel-btn-dark text-[10px] py-1 px-2.5 text-gray-300"
            title="Cambiar fotografía"
          >
            <RefreshCw size={12} />
            <span className="hidden sm:inline">CAMBIAR FOTO</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative aspect-square max-w-[340px] sm:max-w-[400px] mx-auto bg-black border-4 border-black shadow-[6px_6px_0_#000] mb-5 overflow-hidden group">
        {/* The Live Pixel Art Canvas */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-contain crisp-pixel transition-opacity ${
            showOriginal ? 'opacity-0 absolute pointer-events-none' : 'opacity-100'
          }`}
        />

        {/* Original Image comparison overlay */}
        {showOriginal && (
          <img
            src={sourceImage}
            alt="Original"
            className="w-full h-full object-cover"
          />
        )}

        {/* Floating status tag */}
        <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 border border-black font-pixel text-[9px] text-[#FBBC05] pointer-events-none">
          {showOriginal ? 'FOTO ORIGINAL' : `PIXEL RES: ${options.resolution}x${options.resolution}`}
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto">
        {/* Download Avatar */}
        <button
          onClick={handleDownload}
          className="pixel-btn pixel-btn-green text-xs py-3 px-3 shadow-[3px_3px_0_#000]"
        >
          <Download size={15} />
          <span>DESCARGAR PNG</span>
        </button>

        {/* Developer Pass Card */}
        <button
          onClick={() => {
            soundManager.playClick();
            setShowIdCardModal(true);
          }}
          className="pixel-btn pixel-btn-blue text-xs py-3 px-3 shadow-[3px_3px_0_#000]"
        >
          <Award size={15} />
          <span>CREDENCIAL GDG</span>
        </button>

        {/* Copy to clipboard */}
        <button
          onClick={handleCopyClipboard}
          className={`pixel-btn text-xs py-3 px-3 shadow-[3px_3px_0_#000] ${
            copied ? 'pixel-btn-yellow' : 'pixel-btn-dark'
          }`}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          <span>{copied ? '¡COPIADO!' : 'COPIAR AVATAR'}</span>
        </button>
      </div>

      {/* ID Card Modal */}
      {showIdCardModal && (
        <GdgIdCardModal
          avatarCanvas={canvasRef.current}
          name={options.name || 'DEVELOPER'}
          role={options.role || 'GDG COMMUNITY'}
          onClose={() => setShowIdCardModal(false)}
        />
      )}
    </div>
  );
};
