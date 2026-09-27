import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  Award,
  Play,
  Pause,
  Sparkles,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { DetectedFeatures } from '../utils/featureDetector';
import {
  renderPixelCharacter2D,
  exportCharacter2DPng,
  type Character2DOptions
} from '../utils/pixelCharacter2D';
import { soundManager } from '../utils/sound';
import { GdgIdCardModal } from './GdgIdCardModal';

interface PixelCharacter2DCardProps {
  features: DetectedFeatures;
  name: string;
  role: string;
  sourceImage?: string | null;
  onRetake: () => void;
  accessory?: 'none' | 'lanyard' | 'coffee' | 'laptop' | 'gamepad' | 'sword';
  onAccessoryChange?: (acc: 'none' | 'lanyard' | 'coffee' | 'laptop' | 'gamepad' | 'sword') => void;
}

export const PixelCharacter2DCard: React.FC<PixelCharacter2DCardProps> = ({
  features,
  name,
  role,
  sourceImage,
  onRetake,
  accessory = 'lanyard',
  onAccessoryChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [cardCanvasSource, setCardCanvasSource] = useState<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [pose, setPose] = useState<Character2DOptions['pose']>('idle');
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  // Animation Loop (Breathing + Blinking)
  useEffect(() => {
    if (!isAnimating) return;

    // Breathing rhythm: bob every 750ms
    const breathTimer = setInterval(() => {
      setCurrentFrame(prev => (prev === 0 ? 1 : 0));
    }, 750);

    // Blinking rhythm: blink every 3.5 seconds for 160ms
    const blinkTimer = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3500);

    return () => {
      clearInterval(breathTimer);
      clearInterval(blinkTimer);
    };
  }, [isAnimating]);

  // Render character on canvas whenever state or features update
  const drawCharacter = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    renderPixelCharacter2D(canvas, features, {
      name: name || 'DEV_HERO',
      role: role || 'GDG TACNA',
      pose,
      accessory: accessory || 'lanyard',
      beardStyle: features.beardStyle || 'full',
      showShadow: true,
      showNameTag: true,
      backgroundColor: '#121318',
      animationFrame: isAnimating ? currentFrame : 0,
      isBlinking: isAnimating ? isBlinking : false
    });
  }, [features, name, role, pose, accessory, isAnimating, currentFrame, isBlinking]);

  useEffect(() => {
    drawCharacter();
  }, [drawCharacter]);

  // Confetti trigger
  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853']
    });
  };

  // Download High-Res 2D PNG
  const handleDownload = () => {
    soundManager.playCoin();
    triggerConfetti();

    const dataUrl = exportCharacter2DPng(
      features,
      {
        name: name || 'DEV_HERO',
        role: role || 'GDG TACNA',
        pose,
        accessory: accessory || 'lanyard',
        beardStyle: features.beardStyle || 'full',
        showShadow: true,
        showNameTag: true,
        backgroundColor: '#121318'
      },
      640,
      896
    );

    const safeName = (name || 'PIXEL_CHARACTER').replace(/[^a-zA-Z0-9_-]/g, '_');
    const link = document.createElement('a');
    link.download = `${safeName}_2d_pixel_art.png`;
    link.href = dataUrl;
    link.click();
  };

  // Copy to clipboard
  const handleCopyClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      soundManager.playClick();
      canvasRef.current.toBlob(async blob => {
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
    <div className="pixel-box p-4 sm:p-5 text-center bg-[#17181f] relative">
      {/* Top action header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-2.5 mb-3.5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#34A853] border border-black animate-pulse" />
          <h2 className="font-pixel-heading text-xs sm:text-sm text-[#34A853]">
            PERSONAJE 2D PIXEL ART
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Animation Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              setIsAnimating(!isAnimating);
            }}
            className={`pixel-btn text-[10px] py-1 px-2 ${
              isAnimating ? 'pixel-btn-green' : 'pixel-btn-dark text-gray-400'
            }`}
            title="Pausar o reanudar animación"
          >
            {isAnimating ? <Pause size={11} /> : <Play size={11} />}
            <span>{isAnimating ? 'ANIMADO' : 'PAUSADO'}</span>
          </button>

          {/* Compare with original photo */}
          {sourceImage && (
            <button
              onClick={() => {
                soundManager.playClick();
                setShowOriginal(!showOriginal);
              }}
              className={`pixel-btn text-[10px] py-1 px-2 ${
                showOriginal ? 'pixel-btn-yellow' : 'pixel-btn-dark'
              }`}
              title="Comparar con la foto original"
            >
              {showOriginal ? <EyeOff size={11} /> : <Eye size={11} />}
              <span>{showOriginal ? 'VER PIXEL' : 'VER FOTO'}</span>
            </button>
          )}

          {/* Change photo */}
          <button
            onClick={() => {
              soundManager.playClick();
              onRetake();
            }}
            className="pixel-btn pixel-btn-dark text-[10px] py-1 px-2 text-gray-300"
            title="Subir o tomar otra fotografía"
          >
            <Camera size={11} />
            <span className="hidden sm:inline">OTRA FOTO</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative aspect-[40/56] max-w-[280px] sm:max-w-[340px] mx-auto bg-[#121318] border-4 border-black shadow-[6px_6px_0_#000] mb-3.5 overflow-hidden group">
        {/* The 2D Pixel Art Canvas */}
        <canvas
          ref={canvasRef}
          width={320}
          height={448}
          className={`w-full h-full object-contain crisp-pixel transition-opacity ${
            showOriginal ? 'opacity-0 absolute pointer-events-none' : 'opacity-100'
          }`}
        />

        {/* Original photo overlay */}
        {showOriginal && sourceImage && (
          <img
            src={sourceImage}
            alt="Foto Original"
            className="w-full h-full object-cover"
          />
        )}

        {/* Top Floating Badge */}
        <div className="absolute top-2 left-2 bg-black/85 px-2 py-0.5 border border-black font-pixel text-[9px] text-[#FBBC05] pointer-events-none flex items-center gap-1.5">
          <Sparkles size={10} className="text-[#FBBC05]" />
          <span>{showOriginal ? 'FOTO ORIGINAL' : '2D PIXEL SPRITE'}</span>
        </div>

        {/* Bottom Floating Resolution tag */}
        <div className="absolute bottom-2 right-2 bg-black/85 px-1.5 py-0.5 border border-black font-pixel text-[8px] text-[#34A853] pointer-events-none">
          40x56 GRID HD
        </div>
      </div>

      {/* Pose Selector Bar */}
      <div className="mb-2 p-2 bg-[#121317] border-2 border-black flex items-center justify-between gap-1 max-w-md mx-auto">
        <span className="font-pixel text-[9px] text-gray-400 pl-1">POSE:</span>
        <div className="flex items-center gap-1 flex-1 justify-end">
          {[
            { id: 'idle', label: '🧍 Normal' },
            { id: 'wave', label: '👋 Saludo' },
            { id: 'dev', label: '💻 Dev' },
            { id: 'victory', label: '✌️ Victoria' }
          ].map(pItem => (
            <button
              key={pItem.id}
              onClick={() => {
                soundManager.playClick();
                setPose(pItem.id as any);
              }}
              className={`pixel-btn text-[9px] py-1 px-2 ${
                pose === pItem.id ? 'pixel-btn-blue' : 'pixel-btn-dark'
              }`}
            >
              {pItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Accessory Selector */}
      {onAccessoryChange && (
        <div className="mb-3.5 p-1.5 bg-[#121317] border-2 border-black flex items-center justify-between gap-1 max-w-md mx-auto">
          <span className="font-pixel text-[9px] text-gray-400 pl-1">ITEM:</span>
          <div className="flex items-center gap-1 flex-1 justify-end flex-wrap">
            {[
              { id: 'lanyard', label: '🪪 Pass' },
              { id: 'coffee', label: '☕ Café' },
              { id: 'laptop', label: '💻 Laptop' },
              { id: 'gamepad', label: '🎮 Pad' },
              { id: 'none', label: '❌' }
            ].map(aItem => (
              <button
                key={aItem.id}
                onClick={() => {
                  soundManager.playClick();
                  onAccessoryChange(aItem.id as any);
                }}
                className={`pixel-btn text-[9px] py-0.5 px-1.5 ${
                  accessory === aItem.id ? 'pixel-btn-green' : 'pixel-btn-dark'
                }`}
              >
                {aItem.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Distinguishable Features Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-4 text-left font-pixel text-[9px] max-w-lg mx-auto">
        {/* 1. Skin tone */}
        <div className="p-2 bg-[#121317] border border-black flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 border border-black inline-block shadow-[1px_1px_0_#000]"
            style={{ backgroundColor: features.skinColor }}
          />
          <div className="truncate">
            <div className="text-gray-400 text-[8px]">PIEL:</div>
            <div className="text-white truncate font-pixel-heading text-[8px]">
              {features.skinToneName}
            </div>
          </div>
        </div>

        {/* 2. Glasses */}
        <div className="p-2 bg-[#121317] border border-black flex items-center gap-2">
          <span className="text-base">👓</span>
          <div className="truncate">
            <div className="text-gray-400 text-[8px]">LENTES:</div>
            <div
              className={`font-pixel-heading text-[8px] ${
                features.hasGlasses ? 'text-[#34A853]' : 'text-gray-400'
              }`}
            >
              {features.hasGlasses ? 'DETECTADOS' : 'SIN LENTES'}
            </div>
          </div>
        </div>

        {/* 3. Beard */}
        <div className="p-2 bg-[#121317] border border-black flex items-center gap-2">
          <span className="text-base">🧔</span>
          <div className="truncate">
            <div className="text-gray-400 text-[8px]">BARBA:</div>
            <div
              className={`font-pixel-heading text-[8px] ${
                features.hasBeard ? 'text-[#34A853]' : 'text-gray-400'
              }`}
            >
              {features.hasBeard ? 'DETECTADA' : 'AFEITADO'}
            </div>
          </div>
        </div>

        {/* 4. Torso garment & pants */}
        <div className="p-2 bg-[#121317] border border-black flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 border border-black inline-block shadow-[1px_1px_0_#000]"
            style={{ backgroundColor: features.clothingColor }}
          />
          <div className="truncate">
            <div className="text-gray-400 text-[8px]">ROPA:</div>
            <div className="text-white truncate font-pixel-heading text-[8px]">
              Polera + Pant. Negro
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto">
        {/* Download Pixel Art PNG */}
        <button
          onClick={handleDownload}
          className="pixel-btn pixel-btn-green text-xs py-2.5 px-3 shadow-[3px_3px_0_#000]"
        >
          <Download size={14} />
          <span>DESCARGAR PNG</span>
        </button>

        {/* Credencial GDG Pass */}
        <button
          onClick={() => {
            soundManager.playClick();
            setCardCanvasSource(canvasRef.current);
            setShowIdCardModal(true);
          }}
          className="pixel-btn pixel-btn-blue text-xs py-2.5 px-3 shadow-[3px_3px_0_#000]"
        >
          <Award size={14} />
          <span>CREDENCIAL GDG</span>
        </button>

        {/* Copy to clipboard */}
        <button
          onClick={handleCopyClipboard}
          className={`pixel-btn text-xs py-2.5 px-3 shadow-[3px_3px_0_#000] ${
            copied ? 'pixel-btn-yellow' : 'pixel-btn-dark'
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? '¡COPIADO!' : 'COPIAR AVATAR'}</span>
        </button>
      </div>

      {/* GDG ID Card Modal */}
      {showIdCardModal && (
        <GdgIdCardModal
          avatarCanvas={cardCanvasSource}
          name={name || 'DEVELOPER'}
          role={role || 'GDG COMMUNITY'}
          onClose={() => setShowIdCardModal(false)}
        />
      )}
    </div>
  );
};
