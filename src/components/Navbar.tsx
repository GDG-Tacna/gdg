import { Volume2, VolumeX, Tv, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface NavbarProps {
  scanlinesEnabled: boolean;
  setScanlinesEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  scanlinesEnabled,
  setScanlinesEnabled,
  isMuted,
  setIsMuted
}) => {
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
    if (!next) soundManager.playCoin();
  };

  const toggleScanlines = () => {
    soundManager.playClick();
    setScanlinesEnabled(prev => !prev);
  };

  return (
    <header className="relative w-full bg-[#16171d] border-b-4 border-black z-30 select-none">
      {/* Google 4-color accent top strip */}
      <div className="google-stripe w-full" />

      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 font-pixel-heading text-lg sm:text-2xl tracking-wider">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>
          <div className="hidden sm:inline-block px-2 py-0.5 bg-[#252730] border-2 border-black font-pixel-heading text-[10px] text-[#FBBC05] shadow-[2px_2px_0px_#000]">
            PIXEL STUDIO
          </div>
          <div className="inline-block px-2 py-0.5 bg-[#4285F4] border-2 border-black font-pixel-heading text-[9px] text-white shadow-[2px_2px_0px_#000]">
            GDG EDITION
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CRT scanlines toggle */}
          <button
            onClick={toggleScanlines}
            className={`pixel-btn text-xs px-2 sm:px-3 py-1.5 ${
              scanlinesEnabled ? 'pixel-btn-green' : 'pixel-btn-dark'
            }`}
            title="Efecto CRT retro de líneas de televisión"
          >
            <Tv size={14} />
            <span className="hidden md:inline font-pixel text-[11px]">
              CRT: {scanlinesEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            className={`pixel-btn text-xs px-2 sm:px-3 py-1.5 ${
              isMuted ? 'pixel-btn-red' : 'pixel-btn-yellow'
            }`}
            title={isMuted ? 'Activar efectos de sonido 8-bit' : 'Silenciar sonido'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span className="hidden md:inline font-pixel text-[11px]">
              {isMuted ? 'MUTED' : '8-BIT SFX'}
            </span>
          </button>

          {/* Retro 8-bit Coin/Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-[#101114] border-2 border-black font-pixel text-xs text-[#FBBC05]">
            <Sparkles size={12} className="text-[#FBBC05]" />
            <span>PRESS START</span>
          </div>
        </div>
      </div>
    </header>
  );
};
