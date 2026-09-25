import { Type, Sparkles, Award, Heart } from 'lucide-react';
import type { PixelOptions } from '../utils/pixelEngine';
import { soundManager } from '../utils/sound';

interface DetailCustomizerProps {
  options: PixelOptions;
  onChange: (options: PixelOptions) => void;
}

export const DetailCustomizer: React.FC<DetailCustomizerProps> = ({
  options,
  onChange
}) => {
  const updateOption = <K extends keyof PixelOptions>(key: K, value: PixelOptions[K]) => {
    soundManager.playClick();
    onChange({
      ...options,
      [key]: value
    });
  };

  const nameStyles: { id: PixelOptions['nameStyle']; label: string }[] = [
    { id: 'minecraft-tag', label: '🏷️ Tag Minecraft' },
    { id: 'arcade-plate', label: '🕹️ Placa Arcade' },
    { id: 'none', label: '❌ Sin Placa' }
  ];

  const frames: { id: PixelOptions['frame']; label: string; color: string }[] = [
    { id: 'minecraft-dirt', label: 'Bloque Tierra', color: '#497e28' },
    { id: 'minecraft-diamond', label: 'Diamante', color: '#4BEDD7' },
    { id: 'google-4color', label: 'Google 4C', color: '#4285F4' },
    { id: 'arcade', label: 'Arcade Gold', color: '#FBBC05' },
    { id: 'none', label: 'Sin Marco', color: '#555' }
  ];

  const stickers: { id: PixelOptions['sticker']; label: string; icon: string }[] = [
    { id: 'none', label: 'Ninguno', icon: '❌' },
    { id: 'diamond-helmet', label: 'Casco Diamante', icon: '🪖' },
    { id: 'diamond-sword', label: 'Espada Diamante', icon: '⚔️' },
    { id: 'glasses', label: 'Lentes Pixel', icon: '🕶️' },
    { id: 'google-hat', label: 'G-Gorro', icon: '🧢' },
    { id: 'gdg-badge', label: 'Pin GDG', icon: '🛡️' },
    { id: 'heart', label: 'Corazón', icon: '❤️' },
    { id: 'gamepad', label: 'Gamepad', icon: '🎮' }
  ];

  return (
    <div className="pixel-box p-4 space-y-5 text-left bg-[#181920]">
      {/* Section Header */}
      <div className="flex items-center gap-2 border-b-2 border-black pb-2">
        <Sparkles className="text-[#FBBC05]" size={16} />
        <h3 className="font-pixel-heading text-xs text-[#FBBC05]">
          DETALLES & ESTILO MINECRAFT
        </h3>
      </div>

      {/* 1. Name Tag Input */}
      <div>
        <label className="flex items-center gap-2 font-pixel text-xs text-gray-300 mb-1.5">
          <Type size={12} className="text-[#4285F4]" />
          <span>NOMBRE DEL PERSONAJE:</span>
        </label>
        <div className="relative">
          <input
            type="text"
            maxLength={16}
            value={options.name || ''}
            onChange={(e) => updateOption('name', e.target.value.toUpperCase())}
            placeholder="EJ: STEVE_DEV"
            className="w-full pixel-input text-xs uppercase tracking-widest text-[#FBBC05] font-pixel-heading"
          />
          <span className="absolute right-2 top-2.5 text-[9px] font-pixel text-gray-500">
            {(options.name || '').length}/16
          </span>
        </div>
      </div>

      {/* 2. Role / Subtitle */}
      <div>
        <label className="flex items-center gap-2 font-pixel text-xs text-gray-300 mb-1.5">
          <Award size={12} className="text-[#34A853]" />
          <span>CLAN / ROL (SUBTÍTULO):</span>
        </label>
        <div className="relative">
          <input
            type="text"
            maxLength={22}
            value={options.role || ''}
            onChange={(e) => updateOption('role', e.target.value.toUpperCase())}
            placeholder="EJ: GDG COMMUNITY"
            className="w-full pixel-input text-xs uppercase text-[#34A853] font-pixel"
          />
          <span className="absolute right-2 top-2.5 text-[9px] font-pixel text-gray-500">
            {(options.role || '').length}/22
          </span>
        </div>

        {/* Quick tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {['GDG MINER', 'DIAMOND DEV', 'STEVE', 'ALEX', 'GOOGLE CLOUD'].map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => updateOption('role', tag)}
              className="text-[8px] font-pixel px-1.5 py-0.5 bg-[#252730] hover:bg-[#34A853]/20 hover:text-[#34A853] border border-black text-gray-400"
            >
              +{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Name Tag Display Style */}
      <div className="pt-2 border-t-2 border-black/60">
        <label className="block font-pixel text-xs text-gray-300 mb-1.5">
          TIPO DE PLACA DE NOMBRE:
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {nameStyles.map(s => (
            <button
              key={s.id}
              onClick={() => updateOption('nameStyle', s.id)}
              className={`pixel-btn text-[9px] py-1.5 px-1 ${
                options.nameStyle === s.id ? 'pixel-btn-yellow' : 'pixel-btn-dark'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Minecraft 10-Hearts Bar Toggle */}
      <div className="p-3 bg-[#111216] border-2 border-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-[#EA4335]" />
          <div>
            <div className="font-pixel text-xs text-white">BARRA DE 10 CORAZONES</div>
            <div className="font-pixel text-[9px] text-gray-400">Vida estilo Minecraft en la parte superior</div>
          </div>
        </div>
        <button
          onClick={() => updateOption('showHearts', !options.showHearts)}
          className={`pixel-btn text-[9px] py-1 px-3 ${
            options.showHearts ? 'pixel-btn-red' : 'pixel-btn-dark'
          }`}
        >
          {options.showHearts ? 'MOSTRAR' : 'OCULTAR'}
        </button>
      </div>

      {/* 5. Minecraft Frames */}
      <div className="pt-2 border-t-2 border-black/60">
        <label className="block font-pixel text-xs text-gray-300 mb-2">
          MARCO DE ENCUADRE:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {frames.map(f => (
            <button
              key={f.id}
              onClick={() => updateOption('frame', f.id)}
              className={`pixel-btn text-[9px] py-1.5 px-2 flex items-center justify-between ${
                options.frame === f.id ? 'pixel-btn-blue' : 'pixel-btn-dark'
              }`}
            >
              <span className="truncate">{f.label}</span>
              <span
                className="w-2.5 h-2.5 border border-black inline-block shrink-0"
                style={{ backgroundColor: f.color }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 6. Minecraft Items & Accessories */}
      <div className="pt-2 border-t-2 border-black/60">
        <label className="block font-pixel text-xs text-gray-300 mb-2">
          ITEMS Y ACCESORIOS MINECRAFT:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {stickers.map(s => (
            <button
              key={s.id}
              onClick={() => updateOption('sticker', s.id)}
              className={`pixel-btn text-[9px] py-2 px-1 flex flex-col items-center gap-1 ${
                options.sticker === s.id ? 'pixel-btn-green' : 'pixel-btn-dark'
              }`}
            >
              <span className="text-sm">{s.icon}</span>
              <span className="truncate text-[8px]">{s.label}</span>
            </button>
          ))}
        </div>

        {options.sticker && options.sticker !== 'none' && (
          <div className="mt-3 p-2 bg-[#121316] border border-black space-y-2">
            <div>
              <div className="flex justify-between font-pixel text-[9px] text-gray-400 mb-1">
                <span>Posición Vertical:</span>
                <span>{options.stickerY || 0}px</span>
              </div>
              <input
                type="range"
                min={-15}
                max={15}
                value={options.stickerY || 0}
                onChange={(e) => updateOption('stickerY', Number(e.target.value))}
                className="w-full pixel-range"
              />
            </div>

            <div>
              <div className="flex justify-between font-pixel text-[9px] text-gray-400 mb-1">
                <span>Tamaño Item:</span>
                <span>{((options.stickerScale || 1) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0.6}
                max={1.6}
                step={0.1}
                value={options.stickerScale || 1}
                onChange={(e) => updateOption('stickerScale', Number(e.target.value))}
                className="w-full pixel-range"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
