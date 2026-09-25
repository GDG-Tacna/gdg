export const Footer = () => {
  return (
    <footer className="mt-12 w-full border-t-4 border-black bg-[#16171d] py-6 px-4 text-center select-none">
      <div className="google-stripe w-full mb-6" />

      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 bg-[#4285F4]" />
          <div className="w-2.5 h-2.5 bg-[#EA4335]" />
          <div className="w-2.5 h-2.5 bg-[#FBBC05]" />
          <div className="w-2.5 h-2.5 bg-[#34A853]" />
          <span className="font-pixel-heading text-xs text-white ml-1">
            GOOGLE PIXEL AVATAR STUDIO
          </span>
        </div>

        <p className="font-pixel text-[11px] text-gray-400 max-w-lg mx-auto leading-relaxed">
          Diseñado con estética arcade retro de 8-bit & 16-bit. Preserva la riqueza de tonos de piel y prendas de vestir convirtiéndolas en sprites pixel art para perfiles, eventos y credenciales GDG.
        </p>

        <div className="pt-2 text-[10px] font-pixel text-gray-400">
          HECHO CON <span className="text-[#EA4335]">❤</span> PARA LA COMUNIDAD • 100% CLIENT-SIDE & PRIVADO
        </div>
      </div>
    </footer>
  );
};
