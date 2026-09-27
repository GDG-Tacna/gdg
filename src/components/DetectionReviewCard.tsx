import { Sparkles, CheckCircle2, RefreshCw, Scissors, Shirt, Eye } from 'lucide-react';
import type { DetectedFeatures } from '../utils/featureDetector';
import { soundManager } from '../utils/sound';

interface DetectionReviewCardProps {
  features: DetectedFeatures;
  onChange: (features: DetectedFeatures) => void;
  accessory: 'none' | 'lanyard' | 'coffee' | 'laptop' | 'gamepad' | 'sword';
  onAccessoryChange: (acc: 'none' | 'lanyard' | 'coffee' | 'laptop' | 'gamepad' | 'sword') => void;
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

  const faceShapes: { id: DetectedFeatures['faceShape']; label: string }[] = [
    { id: 'oval', label: 'Óvalo' },
    { id: 'round', label: 'Redondo' },
    { id: 'square', label: 'Cuadrado' },
    { id: 'slim', label: 'Mentón V' }
  ];

  const hairStyles: { id: DetectedFeatures['hairStyle']; label: string }[] = [
    { id: 'short', label: 'Corto' },
    { id: 'curly', label: 'Ondulado / Afro' },
    { id: 'long', label: 'Largo' },
    { id: 'parted', label: 'De Lado' },
    { id: 'messy', label: 'Despeinado' },
    { id: 'bald', label: 'Rapado' }
  ];

  const bangsStyles: { id: DetectedFeatures['hairBangs']; label: string }[] = [
    { id: 'side-swept', label: 'De Lado' },
    { id: 'forehead-exposed', label: 'Despejada' },
    { id: 'straight', label: 'Flequillo' },
    { id: 'parted', label: 'Al Medio' }
  ];

  const eyeColors = [
    { name: 'Castaño Oscuro', color: '#1F1612' },
    { name: 'Castaño Claro', color: '#482D1B' },
    { name: 'Miel / Ámbar', color: '#8A562B' },
    { name: 'Verde', color: '#4E8B42' },
    { name: 'Azul', color: '#3A75C4' },
  ];

  const eyebrowOptions: { id: DetectedFeatures['eyebrowThickness']; label: string }[] = [
    { id: 'thin', label: 'Finas' },
    { id: 'medium', label: 'Medias' },
    { id: 'thick', label: 'Pobladas' }
  ];

  const beardStyles: { id: NonNullable<DetectedFeatures['beardStyle']>; label: string }[] = [
    { id: 'full', label: 'Completa' },
    { id: 'goatee', label: 'Candado' },
    { id: 'mustache', label: 'Bigote' },
    { id: 'stubble', label: 'Corta / Sombra' }
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
    { name: 'Negro Carbón', color: '#1F2428' },
    { name: 'Blanco', color: '#E5E7EB' },
  ];

  return (
    <div className="pixel-box p-4 space-y-4 text-left bg-[#181920]">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#FBBC05]" size={18} />
          <h3 className="font-pixel-heading text-xs text-[#FBBC05]">
            SIMILITUD FACIAL & RASGOS DETECTADOS
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#34A853]/20 border border-[#34A853] text-[#34A853] font-pixel text-[10px]">
          <CheckCircle2 size={12} />
          <span>IA {features.confidence}%</span>
        </div>
      </div>

      <p className="font-pixel text-[11px] text-gray-300 leading-relaxed">
        El analizador capturó la fisonomía de tu rostro (mandíbula, cejas, ojos, lentes, barba) y el color de tu ropa para vestir a tu personaje con <strong className="text-white">polera a juego y pantalón negro</strong>.
      </p>

      {/* 1. Forma de Rostro y Tono de Piel */}
      <div className="p-3 bg-[#111216] border-2 border-black space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border border-black inline-block shadow-[1px_1px_0_#000]" style={{ backgroundColor: features.skinColor }} />
            <span className="font-pixel text-xs text-white">FORMA DE ROSTRO & TEZ:</span>
          </div>
          <span className="font-pixel-heading text-[10px] text-[#FBBC05]">{features.skinToneName}</span>
        </div>

        {/* Face shape chips */}
        <div>
          <div className="font-pixel text-[10px] text-gray-400 mb-1">Estructura Facial:</div>
          <div className="grid grid-cols-4 gap-1">
            {faceShapes.map(f => (
              <button
                key={f.id}
                onClick={() => {
                  updateFeature('faceShape', f.id);
                  updateFeature('faceShapeName', f.label);
                }}
                className={`pixel-btn text-[9px] py-1 px-1 ${
                  features.faceShape === f.id ? 'pixel-btn-yellow' : 'pixel-btn-dark'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick skin color chips */}
        <div>
          <div className="font-pixel text-[10px] text-gray-400 mb-1">Tono de Piel:</div>
          <div className="flex items-center gap-2 flex-wrap">
            {skinPresets.map(p => (
              <button
                key={p.name}
                onClick={() => updateFeature('skinColor', p.color)}
                className={`w-6 h-6 border-2 ${features.skinColor.toLowerCase() === p.color.toLowerCase() ? 'border-white scale-110' : 'border-black'} shadow-[2px_2px_0_#000]`}
                style={{ backgroundColor: p.color }}
                title={p.name}
              />
            ))}
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
      </div>

      {/* 2. Cabello, Peinado & Flequillo */}
      <div className="p-3 bg-[#111216] border-2 border-black space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors size={14} className="text-[#EA4335]" />
            <span className="font-pixel text-xs text-white">CABELLO & PEINADO:</span>
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

        {/* Bangs Style */}
        <div>
          <div className="font-pixel text-[10px] text-gray-400 mb-1">Caída / Frente:</div>
          <div className="grid grid-cols-4 gap-1">
            {bangsStyles.map(b => (
              <button
                key={b.id}
                onClick={() => updateFeature('hairBangs', b.id)}
                className={`pixel-btn text-[8px] py-1 px-1 ${
                  features.hairBangs === b.id ? 'pixel-btn-red' : 'pixel-btn-dark'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
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

      {/* 3. Ojos & Cejas */}
      <div className="p-3 bg-[#111216] border-2 border-black space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-[#34A853]" />
            <span className="font-pixel text-xs text-white">OJOS & CEJAS:</span>
          </div>
          <span className="font-pixel-heading text-[10px] text-[#34A853]">{features.eyeColorName}</span>
        </div>

        {/* Eye color chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-pixel text-[10px] text-gray-400">Iris:</span>
          {eyeColors.map(ec => (
            <button
              key={ec.name}
              onClick={() => {
                updateFeature('eyeColor', ec.color);
                updateFeature('eyeColorName', ec.name);
              }}
              className={`w-5 h-5 border-2 ${features.eyeColor.toLowerCase() === ec.color.toLowerCase() ? 'border-white scale-110' : 'border-black'} shadow-[1px_1px_0_#000]`}
              style={{ backgroundColor: ec.color }}
              title={ec.name}
            />
          ))}
        </div>

        {/* Eyebrow thickness */}
        <div>
          <div className="font-pixel text-[10px] text-gray-400 mb-1">Cejas:</div>
          <div className="grid grid-cols-3 gap-1">
            {eyebrowOptions.map(eb => (
              <button
                key={eb.id}
                onClick={() => updateFeature('eyebrowThickness', eb.id)}
                className={`pixel-btn text-[9px] py-1 px-1 ${
                  features.eyebrowThickness === eb.id ? 'pixel-btn-green' : 'pixel-btn-dark'
                }`}
              >
                {eb.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Lentes & Barba */}
      <div className="p-3 bg-[#111216] border-2 border-black space-y-3">
        <div className="font-pixel text-xs text-white">LENTES & BARBA:</div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateFeature('hasGlasses', !features.hasGlasses)}
            className={`pixel-btn text-[10px] py-2 px-2 flex items-center justify-between ${
              features.hasGlasses ? 'pixel-btn-yellow' : 'pixel-btn-dark'
            }`}
          >
            <span>👓 LENTES:</span>
            <span className="font-pixel-heading">{features.hasGlasses ? 'SÍ' : 'NO'}</span>
          </button>

          <button
            onClick={() => updateFeature('hasBeard', !features.hasBeard)}
            className={`pixel-btn text-[10px] py-2 px-2 flex items-center justify-between ${
              features.hasBeard ? 'pixel-btn-yellow' : 'pixel-btn-dark'
            }`}
          >
            <span>🧔 BARBA:</span>
            <span className="font-pixel-heading">{features.hasBeard ? 'SÍ' : 'NO'}</span>
          </button>
        </div>

        {/* Beard style selector if beard is enabled */}
        {features.hasBeard && (
          <div className="pt-2 border-t border-black">
            <div className="font-pixel text-[10px] text-gray-400 mb-1.5">Estilo de Barba:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              {beardStyles.map(b => (
                <button
                  key={b.id}
                  onClick={() => updateFeature('beardStyle', b.id)}
                  className={`pixel-btn text-[8px] py-1 px-1 ${
                    (features.beardStyle || 'full') === b.id ? 'pixel-btn-yellow' : 'pixel-btn-dark'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Ropa (Strictly Polera + Pantalón Negro) */}
      <div className="p-3 bg-[#111216] border-2 border-black space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shirt size={14} className="text-[#4285F4]" />
            <span className="font-pixel text-xs text-white">POLERA & PANTALÓN:</span>
          </div>
          <span className="font-pixel-heading text-[10px] text-[#4285F4]">{features.clothingColorName}</span>
        </div>

        <div className="text-[10px] font-pixel text-gray-300">
          👕 <strong className="text-white">Polera:</strong> Color extraído de tu foto. <br />
          👖 <strong className="text-white">Pantalón:</strong> Siempre Negro.
        </div>

        {/* Clothing color chips */}
        <div>
          <div className="font-pixel text-[10px] text-gray-400 mb-1">Color de la Polera:</div>
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

      {/* 6. Accesorios del Personaje */}
      <div className="pt-2 border-t-2 border-black/60">
        <label className="block font-pixel text-xs text-gray-300 mb-2">
          ACCESORIO:
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {[
            { id: 'lanyard', label: 'Credencial', icon: '🪪' },
            { id: 'coffee', label: 'Café Dev', icon: '☕' },
            { id: 'laptop', label: 'Laptop', icon: '💻' },
            { id: 'gamepad', label: 'Gamepad', icon: '🎮' },
            { id: 'sword', label: 'Espada', icon: '⚔️' },
            { id: 'none', label: 'Ninguno', icon: '❌' },
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
              <span className="text-sm">{acc.icon}</span>
              <span className="truncate text-[8px]">{acc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Retake button */}
      <div className="pt-2 border-t-2 border-black/60">
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
