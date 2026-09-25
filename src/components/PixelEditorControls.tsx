import { Palette, ZoomIn, Layers, RefreshCw, Box, Sparkles } from 'lucide-react';
import type { PixelOptions } from '../utils/pixelEngine';
import { soundManager } from '../utils/sound';

interface PixelEditorControlsProps {
  options: PixelOptions;
  onChange: (options: PixelOptions) => void;
  onReset: () => void;
}

export const PixelEditorControls: React.FC<PixelEditorControlsProps> = ({
  options,
  onChange,
  onReset
}) => {
  const updateOption = <K extends keyof PixelOptions>(key: K, value: PixelOptions[K]) => {
    soundManager.playClick();
    onChange({
      ...options,
      [key]: value
    });
  };

  const resolutions = [
    { label: '48px Clásico', val: 48 },
    { label: '64px Skin', val: 64 },
    { label: '80px HD', val: 80 },
    { label: '96px Ultra', val: 96 },
    { label: '128px Max', val: 128 },
  ];

  const colorLevels = [
    { label: 'Fiel (Color Real)', val: 64 },
    { label: 'Alta (32 Colores)', val: 32 },
    { label: 'Retro (16 Colores)', val: 16 },
  ];

  const backgrounds: { id: PixelOptions['background']; name: string; color: string }[] = [
    { id: 'original', name: 'Original', color: '#333' },
    { id: 'minecraft-dirt', name: 'Bloque Tierra', color: '#866043' },
    { id: 'google-blue', name: 'G-Azul', color: '#4285F4' },
    { id: 'google-red', name: 'G-Rojo', color: '#EA4335' },
    { id: 'google-yellow', name: 'G-Amarillo', color: '#FBBC05' },
    { id: 'google-green', name: 'G-Verde', color: '#34A853' },
    { id: 'checker', name: 'Ajedrez', color: 'conic-gradient(#4285F4 25%, #EA4335 0 50%, #FBBC05 0 75%, #34A853 0)' },
    { id: 'arcade', name: 'Arcade Dark', color: '#121316' },
  ];

  return (
    <div className="pixel-box p-4 space-y-5 text-left bg-[#181920]">
      {/* Title */}
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2">
          <Box className="text-[#34A853]" size={18} />
          <h3 className="font-pixel-heading text-xs text-[#34A853]">
            MOTOR PIXEL MINECRAFT
          </h3>
        </div>
        <button
          onClick={() => {
            soundManager.playClick();
            onReset();
          }}
          className="pixel-btn pixel-btn-dark text-[10px] px-2 py-1"
          title="Restablecer ajustes por defecto"
        >
          <RefreshCw size={11} />
          <span>RESET</span>
        </button>
      </div>

      {/* 1. Resolution / Pixel Clarity */}
      <div>
        <label className="flex items-center justify-between font-pixel text-xs text-gray-300 mb-1.5">
          <span>NITIDEZ Y TAMAÑO DE BLOQUE:</span>
          <span className="text-[#FBBC05] font-pixel-heading text-[10px]">
            {options.resolution}x{options.resolution}
          </span>
        </label>
        <div className="grid grid-cols-5 gap-1">
          {resolutions.map(r => (
            <button
              key={r.val}
              onClick={() => updateOption('resolution', r.val)}
              className={`pixel-btn text-[9px] py-1.5 px-0.5 ${
                options.resolution === r.val ? 'pixel-btn-green' : 'pixel-btn-dark'
              }`}
            >
              {r.val}px
            </button>
          ))}
        </div>
        <div className="mt-1 font-pixel text-[10px] text-gray-400">
          💡 A mayor resolución (80px - 128px), el rostro y la ropa se reconocen con máxima nitidez.
        </div>
      </div>

      {/* 2. Minecraft 3D Voxel Blocks & Facial Sharpness */}
      <div className="p-3 bg-[#111216] border-2 border-black space-y-3">
        {/* Minecraft Voxel Blocks Bevel */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🧱</span>
            <div>
              <div className="font-pixel text-xs text-white">TEXTURA BLOQUES MINECRAFT</div>
              <div className="font-pixel text-[9px] text-gray-400">Bisel y relieve 3D en cada pixel</div>
            </div>
          </div>
          <button
            onClick={() => updateOption('minecraftBlocks', !options.minecraftBlocks)}
            className={`pixel-btn text-[9px] py-1.5 px-3 ${
              options.minecraftBlocks ? 'pixel-btn-green' : 'pixel-btn-dark'
            }`}
          >
            {options.minecraftBlocks ? 'ACTIVADO' : 'PLANO'}
          </button>
        </div>

        {/* Facial Sharpness Filter */}
        <div>
          <div className="flex justify-between font-pixel text-[11px] text-gray-300 mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#FBBC05]" />
              <span>Claridad y Nitidez Facial (Ojos, boca, cabello):</span>
            </span>
            <span className="text-[#FBBC05] font-pixel-heading text-[10px]">{options.sharpness}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={options.sharpness}
            onChange={(e) => updateOption('sharpness', Number(e.target.value))}
            className="w-full pixel-range"
          />
        </div>
      </div>

      {/* 3. Color Fidelity (Preserving skin tone and clothing) */}
      <div>
        <label className="flex items-center justify-between font-pixel text-xs text-gray-300 mb-1.5">
          <span>FIDELIDAD DE PIEL Y ROPA:</span>
          <span className="text-[#4285F4] font-pixel-heading text-[10px]">
            {options.colorSteps === 64 ? 'COLOR REAL' : `${options.colorSteps} PASOS`}
          </span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {colorLevels.map(c => (
            <button
              key={c.val}
              onClick={() => updateOption('colorSteps', c.val)}
              className={`pixel-btn text-[9px] py-1.5 px-1 ${
                options.colorSteps === c.val ? 'pixel-btn-blue' : 'pixel-btn-dark'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Color calibration (Saturation, Contrast, Brightness) */}
      <div className="space-y-2 pt-2 border-t-2 border-black/60">
        <div className="font-pixel text-[11px] text-gray-400 flex items-center gap-1.5">
          <Palette size={12} className="text-[#EA4335]" />
          <span>CALIBRACIÓN DE COLOR & TONOS:</span>
        </div>

        {/* Saturation */}
        <div>
          <div className="flex justify-between font-pixel text-[10px] text-gray-300 mb-1">
            <span>Saturación / Vibrancia de ropa:</span>
            <span className="text-[#EA4335]">{options.saturation > 0 ? `+${options.saturation}` : options.saturation}%</span>
          </div>
          <input
            type="range"
            min={-30}
            max={70}
            step={5}
            value={options.saturation}
            onChange={(e) => updateOption('saturation', Number(e.target.value))}
            className="w-full pixel-range"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between font-pixel text-[10px] text-gray-300 mb-1">
            <span>Contraste:</span>
            <span className="text-[#4285F4]">{options.contrast > 0 ? `+${options.contrast}` : options.contrast}%</span>
          </div>
          <input
            type="range"
            min={-30}
            max={40}
            step={5}
            value={options.contrast}
            onChange={(e) => updateOption('contrast', Number(e.target.value))}
            className="w-full pixel-range"
          />
        </div>

        {/* Brightness */}
        <div>
          <div className="flex justify-between font-pixel text-[10px] text-gray-300 mb-1">
            <span>Brillo:</span>
            <span className="text-[#FBBC05]">{options.brightness > 0 ? `+${options.brightness}` : options.brightness}</span>
          </div>
          <input
            type="range"
            min={-30}
            max={30}
            step={5}
            value={options.brightness}
            onChange={(e) => updateOption('brightness', Number(e.target.value))}
            className="w-full pixel-range"
          />
        </div>
      </div>

      {/* 5. Zoom & Framing Presets */}
      <div className="space-y-2 pt-2 border-t-2 border-black/60">
        <div className="flex items-center justify-between font-pixel text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <ZoomIn size={12} className="text-[#34A853]" />
            <span>ENCUADRE DEL PERSONAJE:</span>
          </span>
        </div>

        {/* Quick zoom presets */}
        <div className="flex gap-1.5">
          <button
            onClick={() => {
              updateOption('zoom', 1.6);
              updateOption('panY', -10);
            }}
            className="flex-1 pixel-btn pixel-btn-dark text-[9px] py-1"
          >
            ROSTRO (1.6x)
          </button>
          <button
            onClick={() => {
              updateOption('zoom', 1.35);
              updateOption('panY', -5);
            }}
            className="flex-1 pixel-btn pixel-btn-green text-[9px] py-1"
          >
            BUSTO (1.35x)
          </button>
          <button
            onClick={() => {
              updateOption('zoom', 1.0);
              updateOption('panY', 0);
            }}
            className="flex-1 pixel-btn pixel-btn-dark text-[9px] py-1"
          >
            COMPLETO (1.0x)
          </button>
        </div>

        <div>
          <div className="flex justify-between font-pixel text-[10px] text-gray-300 mb-1">
            <span>Zoom manual:</span>
            <span className="text-[#34A853]">{options.zoom.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={1.0}
            max={2.4}
            step={0.05}
            value={options.zoom}
            onChange={(e) => updateOption('zoom', Number(e.target.value))}
            className="w-full pixel-range"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between font-pixel text-[9px] text-gray-400 mb-1">
              <span>Posición X:</span>
              <span>{options.panX}%</span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={options.panX}
              onChange={(e) => updateOption('panX', Number(e.target.value))}
              className="w-full pixel-range"
            />
          </div>
          <div>
            <div className="flex justify-between font-pixel text-[9px] text-gray-400 mb-1">
              <span>Posición Y:</span>
              <span>{options.panY}%</span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={options.panY}
              onChange={(e) => updateOption('panY', Number(e.target.value))}
              className="w-full pixel-range"
            />
          </div>
        </div>
      </div>

      {/* 6. Background Selector */}
      <div className="pt-2 border-t-2 border-black/60">
        <div className="font-pixel text-[11px] text-gray-400 flex items-center gap-1.5 mb-2">
          <Layers size={12} className="text-[#FBBC05]" />
          <span>FONDO:</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {backgrounds.map(bg => (
            <button
              key={bg.id}
              onClick={() => updateOption('background', bg.id)}
              className={`pixel-btn text-[8px] py-1.5 px-1 truncate flex items-center gap-1 ${
                options.background === bg.id ? 'pixel-btn-yellow border-[#FBBC05]' : 'pixel-btn-dark'
              }`}
              title={bg.name}
            >
              <span
                className="w-2.5 h-2.5 border border-black inline-block shrink-0"
                style={{ background: bg.color }}
              />
              <span className="truncate">{bg.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
