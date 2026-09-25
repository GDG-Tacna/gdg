import { Sparkles, CheckCircle2, RefreshCw, Scissors, Shirt } from 'lucide-react';
import type { DetectedFeatures } from '../utils/featureDetector';
import { soundManager } from '../utils/sound';

interface DetectionReviewCardProps {
  features: DetectedFeatures;
  onChange: (features: DetectedFeatures) => void;
  accessory: 'none' | 'diamond-helmet' | 'diamond-sword' | 'glasses';
  onAccessoryChange: (acc: 'none' | 'diamond-helmet' | 'diamond-sword' | 'glasses') => void;
  onRetake: () => void;
}

export const DetectionReviewCard: React.FC<DetectionReviewCardProps> = ({
  features,
  onChange,
  accessory,
  onAccessoryChange,
  onRetake
}) => {
  const updateFeature = <K extends keyof DetectedFeatures>(key: K, value: DetectedFeatures[K]) => {
    soundManager.playClick();
    onChange({
      ...features,
      [key]: value
    });
  };

  const hairStyles: { id: DetectedFeatures['hairStyle']; label: string }[] = [
    { id: 'short', label: 'Corto' },
    { id: 'curly', label: 'Ondulado / Afro' },
    { id: 'long', label: 'Largo' },
    { id: 'parted', label: 'De Lado' },
    { id: 'messy', label: 'Despeinado' },
    { id: 'bald', label: 'Rapado' }
  ];

  const clothingTypes: { id: DetectedFeatures['clothingType']; label: string }[] = [
    { id: 'hoodie', label: 'Hoodie' },
    { id: 'tshirt', label: 'Polera' },
    { id: 'jacket', label: 'Chaqueta' }
  ];

  const skinPresets = [
    { name: 'Claro', color: '#FFE0BD' },
    { name: 'Melocotón', color: '#FFCD94' },
    { name: 'Cálido', color: '#E0AC69' },
    { name: 'Canela', color: '#C68642' },
    { name: 'Moreno', color: '#8D5524' },
    { name: 'Ébano', color: '#4A2A18' },
  ];

  const hairPresets = [
    { name: 'Negro', color: '#161413' },
    { name: 'Castaño Oscuro', color: '#362217' },
    { name: 'Castaño Claro', color: '#633F27' },
    { name: 'Rubio', color: '#D6A858' },
    { name: 'Pelirrojo', color: '#9E381A' },
    { name: 'Platino', color: '#9CA3AF' },
  ];

  const clothPresets = [
    { name: 'Azul Google', color: '#4285F4' },
    { name: 'Rojo Google', color: '#EA4335' },
    { name: 'Amarillo Google', color: '#FBBC05' },
    { name: 'Verde Google', color: '#34A853' },
    { name: 'Negro', color: '#1F2428' },
    { name: 'Blanco', color: '#E5E7EB' },
  ];

  return (
    <div className="pixel-box p-4 space-y-5 text-left bg-[#181920]">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#FBBC05]" size={18} />
          <h3 className="font-pixel-heading text-xs text-[#FBBC05]">
            RASGOS DETECTADOS EN TU FOTO
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#34A853]/20 border border-[#34A853] text-[#34A853] font-pixel text-[10px]">
          <CheckCircle2 size={12} />
          <span>IA {features.confidence}%</span>
        </div>
      </div>

      <p className="font-pixel text-[11px] text-gray-300 leading-relaxed">
        El analizador extrajo tu tono de piel, peinado y ropa. Puedes ajustar cualquier detalle en tiempo real para ver cómo cambia tu personaje en 3D.
      </p>

      {/* 1. Tono de Piel */}
      <div className="p-3 bg-[#111216] border-2 border-black space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border border-black inline-block rounded-xs shadow-[1px_1px_0_#000]" style={{ backgroundColor: features.skinColor }} />
            <span className="font-pixel text-xs text-white">TONO DE PIEL:</span>
          </div>
          <span className="font-pixel-heading text-[10px] text-[#FBBC05]">{features.skinToneName}</span>
        </div>

        {/* Quick color chips */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {skinPresets.map(p => (
            <button
              key={p.name}
              onClick={() => updateFeature('skinColor', p.color)}
              className={`w-6 h-6 border-2 ${features.skinColor.toLowerCase() === p.color.toLowerCase() ? 'border-white scale-110' : 'border-black'} shadow-[2px_2px_0_#000]`}
              style={{ backgroundColor: p.color }}
              title={p.name}
            />
          ))}
          {/* Custom color input */}
          <label className="flex items-center gap-1 cursor-pointer font-pixel text-[9px] text-gray-400 ml-auto">
            <span>Selector:</span>
            <input
              type="color"
              value={features.skinColor}
              onChange={(e) => updateFeature('skinColor', e.target.value)}
              className="w-6 h-6 p-0 border border-black cursor-pointer bg-transparent"
            />
          </label>
        </div>
      </div>

      {/* 2. Cabello y Peinado */}
      <div className="p-3 bg-[#111216] border-2 border-black space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors size={14} className="text-[#EA4335]" />
            <span className="font-pixel text-xs text-white">ESTILO DE PEINADO:</span>
          </div>
          <span className="font-pixel-heading text-[10px] text-[#EA4335]">{features.hairStyleName}</span>
        </div>

        {/* Style selector */}
        <div className="grid grid-cols-3 gap-1.5">
          {hairStyles.map(s => (
            <button
              key={s.id}
              onClick={() => {
                updateFeature('hairStyle', s.id);
                updateFeature('hairStyleName', s.label);
              }}
              className={`pixel-btn text-[9px] py-1.5 px-1 truncate ${
                features.hairStyle === s.id ? 'pixel-btn-red' : 'pixel-btn-dark'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Hair color chips */}
        <div>
          <div className="font-pixel text-[10px] text-gray-400 mb-1">Color de Cabello:</div>
          <div className="flex items-center gap-2 flex-wrap">
            {hairPresets.map(h => (
              <button
                key={h.name}
                onClick={() => updateFeature('hairColor', h.color)}
                className={`w-6 h-6 border-2 ${features.hairColor.toLowerCase() === h.color.toLowerCase() ? 'border-white scale-110' : 'border-black'} shadow-[2px_2px_0_#000]`}
                style={{ backgroundColor: h.color }}
                title={h.name}
              />
            ))}
            <label className="flex items-center gap-1 cursor-pointer font-pixel text-[9px] text-gray-400 ml-auto">
              <span>Selector:</span>
              <input
                type="color"
                value={features.hairColor}
                onChange={(e) => updateFeature('hairColor', e.target.value)}
                className="w-6 h-6 p-0 border border-black cursor-pointer bg-transparent"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 3. Ropa y Prendas */}
      <div className="p-3 bg-[#111216] border-2 border-black space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shirt size={14} className="text-[#4285F4]" />
            <span className="font-pixel text-xs text-white">ROPA Y COLOR:</span>
          </div>
          <span className="font-pixel-heading text-[10px] text-[#4285F4]">{features.clothingTypeName}</span>
        </div>

        {/* Clothing type buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          {clothingTypes.map(c => (
            <button
              key={c.id}
              onClick={() => {
                updateFeature('clothingType', c.id);
                updateFeature('clothingTypeName', c.label);
              }}
              className={`pixel-btn text-[9px] py-1.5 px-1 truncate ${
                features.clothingType === c.id ? 'pixel-btn-blue' : 'pixel-btn-dark'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Clothing color chips */}
        <div>
          <div className="font-pixel text-[10px] text-gray-400 mb-1">Color de Prenda:</div>
          <div className="flex items-center gap-2 flex-wrap">
            {clothPresets.map(c => (
              <button
                key={c.name}
                onClick={() => updateFeature('clothingColor', c.color)}
                className={`w-6 h-6 border-2 ${features.clothingColor.toLowerCase() === c.color.toLowerCase() ? 'border-white scale-110' : 'border-black'} shadow-[2px_2px_0_#000]`}
                style={{ backgroundColor: c.color }}
                title={c.name}
              />
            ))}
            <label className="flex items-center gap-1 cursor-pointer font-pixel text-[9px] text-gray-400 ml-auto">
              <span>Selector:</span>
              <input
                type="color"
                value={features.clothingColor}
                onChange={(e) => updateFeature('clothingColor', e.target.value)}
                className="w-6 h-6 p-0 border border-black cursor-pointer bg-transparent"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 4. Rasgos Adicionales (Lentes / Barba) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => updateFeature('hasGlasses', !features.hasGlasses)}
          className={`pixel-btn text-[10px] py-2 px-2 flex items-center justify-between ${
            features.hasGlasses ? 'pixel-btn-yellow' : 'pixel-btn-dark'
          }`}
        >
          <span>👓 LENTES:</span>
          <span>{features.hasGlasses ? 'SÍ' : 'NO'}</span>
        </button>

        <button
          onClick={() => updateFeature('hasBeard', !features.hasBeard)}
          className={`pixel-btn text-[10px] py-2 px-2 flex items-center justify-between ${
            features.hasBeard ? 'pixel-btn-yellow' : 'pixel-btn-dark'
          }`}
        >
          <span>🧔 BARBA:</span>
          <span>{features.hasBeard ? 'SÍ' : 'NO'}</span>
        </button>
      </div>

      {/* 5. Accesorios 3D Minecraft */}
      <div className="pt-2 border-t-2 border-black/60">
        <label className="block font-pixel text-xs text-gray-300 mb-2">
          ACCESORIO 3D EN EL PERSONAJE:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {[
            { id: 'none', label: 'Ninguno', icon: '❌' },
            { id: 'diamond-helmet', label: 'Casco Diamante', icon: '🪖' },
            { id: 'diamond-sword', label: 'Espada Diamante', icon: '⚔️' },
            { id: 'glasses', label: 'Lentes 3D', icon: '🕶️' },
          ].map(acc => (
            <button
              key={acc.id}
              onClick={() => {
                soundManager.playClick();
                onAccessoryChange(acc.id as any);
              }}
              className={`pixel-btn text-[9px] py-2 px-1 flex flex-col items-center gap-1 ${
                accessory === acc.id ? 'pixel-btn-green' : 'pixel-btn-dark'
              }`}
            >
              <span>{acc.icon}</span>
              <span className="truncate text-[8px]">{acc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Retake button */}
      <div className="pt-3 border-t-2 border-black/60">
        <button
          onClick={() => {
            soundManager.playClick();
            onRetake();
          }}
          className="w-full pixel-btn pixel-btn-dark text-xs py-2 px-4 text-gray-300"
        >
          <RefreshCw size={13} />
          <span>SUBIR O TOMAR OTRA FOTO</span>
        </button>
      </div>
    </div>
  );
};
