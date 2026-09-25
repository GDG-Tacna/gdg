import { useRef, useState } from 'react';
import { Upload, Camera, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { generateSamplePortrait } from '../utils/sampleImages';

interface ImageUploaderProps {
  onImageSelected: (dataUrl: string) => void;
  onOpenCamera: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onOpenCamera
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen (PNG, JPG o WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        soundManager.playPixelate();
        onImageSelected(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handlePresetSelect = (preset: 'dev1' | 'dev2' | 'dev3') => {
    soundManager.playPixelate();
    const dataUrl = generateSamplePortrait(preset);
    onImageSelected(dataUrl);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Upload & Camera Hero Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`pixel-box p-6 sm:p-10 text-center transition-all ${
          isDragging ? 'border-[#4285F4] bg-[#1a233a]' : 'bg-[#1a1b22]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-16 h-16 mx-auto mb-4 bg-[#272935] border-2 border-black flex items-center justify-center shadow-[3px_3px_0_#000]">
          <Upload className="text-[#4285F4]" size={28} />
        </div>

        <h2 className="font-pixel-heading text-base sm:text-lg text-white mb-2">
          CREA TU AVATAR PIXEL
        </h2>
        <p className="font-pixel text-xs text-gray-300 max-w-md mx-auto mb-6 leading-relaxed">
          Sube tu foto o tómate una instantánea con la cámara. Mantendremos tus colores de ropa y tono de piel con estilo pixel art retro.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => {
              soundManager.playClick();
              fileInputRef.current?.click();
            }}
            className="w-full sm:w-auto pixel-btn pixel-btn-blue text-xs py-3 px-6"
          >
            <Upload size={16} />
            <span>SUBIR FOTO</span>
          </button>

          <span className="font-pixel text-xs text-gray-500">O BIEN</span>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCamera();
            }}
            className="w-full sm:w-auto pixel-btn pixel-btn-red text-xs py-3 px-6"
          >
            <Camera size={16} />
            <span>USAR CÁMARA</span>
          </button>
        </div>

        <p className="mt-4 font-pixel text-[11px] text-gray-400">
          Arrastra y suelta tu archivo aquí (PNG, JPG, WebP)
        </p>
      </div>

      {/* Instant Demo Presets */}
      <div className="pixel-box p-4 bg-[#14151a]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-[#FBBC05]" size={16} />
          <h3 className="font-pixel text-xs text-[#FBBC05]">
            ¿NO TIENES FOTO AHORA? PRUEBA UN EJEMPLO:
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handlePresetSelect('dev1')}
            className="pixel-btn pixel-btn-dark p-2 text-left flex items-center gap-3 hover:border-[#4285F4]"
          >
            <div className="w-10 h-10 border border-black bg-[#4285F4]/20 flex items-center justify-center text-xs">
              👨🏽‍💻
            </div>
            <div>
              <div className="font-pixel-heading text-[10px] text-white">DEV WARM</div>
              <div className="font-pixel text-[9px] text-[#4285F4]">Hoodie Azul</div>
            </div>
          </button>

          <button
            onClick={() => handlePresetSelect('dev2')}
            className="pixel-btn pixel-btn-dark p-2 text-left flex items-center gap-3 hover:border-[#EA4335]"
          >
            <div className="w-10 h-10 border border-black bg-[#EA4335]/20 flex items-center justify-center text-xs">
              👩🏼‍💻
            </div>
            <div>
              <div className="font-pixel-heading text-[10px] text-white">DEV LIGHT</div>
              <div className="font-pixel text-[9px] text-[#EA4335]">Chaqueta Roja</div>
            </div>
          </button>

          <button
            onClick={() => handlePresetSelect('dev3')}
            className="pixel-btn pixel-btn-dark p-2 text-left flex items-center gap-3 hover:border-[#34A853]"
          >
            <div className="w-10 h-10 border border-black bg-[#34A853]/20 flex items-center justify-center text-xs">
              👨🏿‍💻
            </div>
            <div>
              <div className="font-pixel-heading text-[10px] text-white">DEV DEEP</div>
              <div className="font-pixel text-[9px] text-[#34A853]">Polera Verde</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
