import { useState } from 'react';
import { Sparkles, User, Box } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ImageUploader } from './components/ImageUploader';
import { CameraCapture } from './components/CameraCapture';
import { PixelCharacter2DCard } from './components/PixelCharacter2DCard';
import { ThreePixelCharacter } from './components/ThreePixelCharacter';
import { AvatarDisplay } from './components/AvatarDisplay';
import { DetectionReviewCard } from './components/DetectionReviewCard';
import { detectFeaturesFromImage, DEFAULT_DETECTED_FEATURES, type DetectedFeatures } from './utils/featureDetector';
import { DEFAULT_PIXEL_OPTIONS } from './utils/pixelEngine';
import { soundManager } from './utils/sound';

export function App() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState('INICIANDO ESCÁNER...');
  const [detectedFeatures, setDetectedFeatures] = useState<DetectedFeatures>(DEFAULT_DETECTED_FEATURES);

  // Character customization
  const [playerName, setPlayerName] = useState('DEV_HERO');
  const [playerRole, setPlayerRole] = useState('GDG TACNA');
  const [accessory, setAccessory] = useState<'none' | 'lanyard' | 'coffee' | 'laptop' | 'gamepad' | 'sword'>('lanyard');
  const [activeTab, setActiveTab] = useState<'features' | 'identity'>('features');
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'photo'>('2d');

  // UI state
  const [scanlinesEnabled, setScanlinesEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Handle image selected: run AI scanner
  const handleImageLoaded = async (imgUrl: string) => {
    setSourceImage(imgUrl);
    setIsCameraOpen(false);
    setIsAnalyzing(true);
    soundManager.playPixelate();

    // Sequence of retro analysis steps matching user requirements
    setAnalyzingStep('ANALIZANDO ESTRUCTURA FACIAL Y TEZ...');
    await new Promise(r => setTimeout(r, 380));
    setAnalyzingStep('EXTRAYENDO VOLUMEN, COLOR Y PEINADO...');
    await new Promise(r => setTimeout(r, 380));
    setAnalyzingStep('IDENTIFICANDO OJOS, LENTES Y CEJAS...');
    await new Promise(r => setTimeout(r, 380));
    setAnalyzingStep('DETECTANDO BARBA Y VELLO FACIAL...');
    await new Promise(r => setTimeout(r, 380));
    setAnalyzingStep('CONFIGURANDO POLERA A JUEGO Y PANTALÓN NEGRO...');
    await new Promise(r => setTimeout(r, 350));
    setAnalyzingStep('CONSTRUYENDO PERSONAJE 2D PIXEL ART FIEL...');
    await new Promise(r => setTimeout(r, 300));

    const features = await detectFeaturesFromImage(imgUrl);
    setDetectedFeatures(features);
    setIsAnalyzing(false);
    soundManager.playSuccess();
  };

  return (
    <div className="min-h-screen bg-[#101114] text-[#F8F9FA] flex flex-col relative font-pixel">
      {/* Scanline CRT overlay */}
      {scanlinesEnabled && (
        <div className="fixed inset-0 scanlines pointer-events-none z-40" />
      )}

      {/* Top Navbar */}
      <Navbar
        scanlinesEnabled={scanlinesEnabled}
        setScanlinesEnabled={setScanlinesEnabled}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Arcade HUD Status Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-[#17181f] border-2 border-black p-2.5 shadow-[3px_3px_0_#000]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#34A853] animate-pulse inline-block" />
              <span className="font-pixel-heading text-[10px] text-white">
                MODO: 2D PIXEL ART CHARACTER
              </span>
            </div>
            <span className="text-gray-600">|</span>
            <div className="hidden sm:flex items-center gap-1 font-pixel text-[10px] text-[#34A853]">
              <span>IA SCANNER:</span>
              <span className="text-white">TONO DE PIEL + LENTES + BARBA + PRENDA DE TORSO</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#252733] border border-black text-[#FBBC05] font-pixel text-[10px]">
              GDG Pixel Studio
            </span>
          </div>
        </div>

        {/* Camera Modal */}
        {isCameraOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <CameraCapture
              onCapture={(dataUrl) => {
                handleImageLoaded(dataUrl);
              }}
              onCancel={() => setIsCameraOpen(false)}
            />
          </div>
        )}

        {/* Scanning Loading State */}
        {isAnalyzing ? (
          <div className="pixel-box p-12 max-w-lg mx-auto text-center my-12 bg-[#17181f] relative overflow-hidden">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#34A853]/20 border-2 border-[#34A853] flex items-center justify-center animate-bounce">
              <Box className="text-[#34A853]" size={32} />
            </div>

            <h3 className="font-pixel-heading text-sm text-[#FBBC05] mb-3">
              ESCANEANDO RASGOS FACIALES & PRENDA
            </h3>

            <div className="w-full bg-black border-2 border-black h-4 mb-4 overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] animate-pulse w-full" />
            </div>

            <p className="font-pixel text-xs text-[#34A853] animate-pulse tracking-wide">
              {analyzingStep}
            </p>
          </div>
        ) : !sourceImage ? (
          /* View 1: When no image is selected yet */
          <div className="py-4">
            <ImageUploader
              onImageSelected={handleImageLoaded}
              onOpenCamera={() => setIsCameraOpen(true)}
            />

            {/* Feature highlights banner */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              <div className="pixel-box p-4 bg-[#16171d]">
                <div className="w-8 h-8 mb-2 bg-[#E0AC69] border-2 border-black flex items-center justify-center text-white text-base">
                  🎨
                </div>
                <h4 className="font-pixel-heading text-xs text-[#FBBC05] mb-1">
                  1. TONO DE PIEL
                </h4>
                <p className="font-pixel text-[11px] text-gray-400">
                  Detección precisa del tono de tez real y matices faciales, transferidos al rostro, cuello y manos del personaje 2D.
                </p>
              </div>

              <div className="pixel-box p-4 bg-[#16171d]">
                <div className="w-8 h-8 mb-2 bg-[#4285F4] border-2 border-black flex items-center justify-center text-white text-base">
                  👓
                </div>
                <h4 className="font-pixel-heading text-xs text-[#4285F4] mb-1">
                  2. LENTES
                </h4>
                <p className="font-pixel text-[11px] text-gray-400">
                  Identifica si llevas gafas o lentes de lectura a través del puente nasal y genera monturas pixel art con reflejo de luz.
                </p>
              </div>

              <div className="pixel-box p-4 bg-[#16171d]">
                <div className="w-8 h-8 mb-2 bg-[#EA4335] border-2 border-black flex items-center justify-center text-white text-base">
                  🧔
                </div>
                <h4 className="font-pixel-heading text-xs text-[#EA4335] mb-1">
                  3. BARBA
                </h4>
                <p className="font-pixel text-[11px] text-gray-400">
                  Detecta barba completa, candado, bigote o sombra en el mentón combinando con el color de tu peinado.
                </p>
              </div>

              <div className="pixel-box p-4 bg-[#16171d]">
                <div className="w-8 h-8 mb-2 bg-[#34A853] border-2 border-black flex items-center justify-center text-white text-base">
                  👕
                </div>
                <h4 className="font-pixel-heading text-xs text-[#34A853] mb-1">
                  4. POLERA & PANTALÓN NEGRO
                </h4>
                <p className="font-pixel text-[11px] text-gray-400">
                  La polera adopta el color de la ropa de tu foto, combinada permanentemente con un pantalón negro clásico.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* View 2: 2D Pixel Character Generator + Controls */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Character Viewports (6 cols) */}
            <div className="lg:col-span-6 sticky top-4 space-y-3">
              {/* View Switcher Tabs (2D Pixel Art by default!) */}
              <div className="flex border-2 border-black p-1 bg-[#17181f] gap-1 shadow-[3px_3px_0_#000]">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setViewMode('2d');
                  }}
                  className={`pixel-btn text-[10px] py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5 ${
                    viewMode === '2d' ? 'pixel-btn-green' : 'pixel-btn-dark'
                  }`}
                >
                  <span>👤</span>
                  <span>PERSONAJE 2D</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    setViewMode('3d');
                  }}
                  className={`pixel-btn text-[10px] py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5 ${
                    viewMode === '3d' ? 'pixel-btn-blue' : 'pixel-btn-dark'
                  }`}
                >
                  <span>🧊</span>
                  <span>MODELO 3D</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    setViewMode('photo');
                  }}
                  className={`pixel-btn text-[10px] py-1.5 px-3 flex-1 flex items-center justify-center gap-1.5 ${
                    viewMode === 'photo' ? 'pixel-btn-yellow' : 'pixel-btn-dark'
                  }`}
                >
                  <span>📷</span>
                  <span>FOTO PIXEL</span>
                </button>
              </div>

              {/* View Mode 1: 2D Pixel Art Character (Primary) */}
              {viewMode === '2d' && (
                <PixelCharacter2DCard
                  features={detectedFeatures}
                  name={playerName}
                  role={playerRole}
                  sourceImage={sourceImage}
                  onRetake={() => setSourceImage(null)}
                  accessory={accessory}
                  onAccessoryChange={setAccessory}
                />
              )}

              {/* View Mode 2: 3D Voxel Model */}
              {viewMode === '3d' && (
                <div className="space-y-3">
                  <ThreePixelCharacter
                    features={detectedFeatures}
                    name={playerName}
                    role={playerRole}
                    accessory={accessory === 'sword' ? 'diamond-sword' : accessory === 'laptop' ? 'none' : 'none'}
                  />
                  <div className="p-2 bg-[#17181f] border-2 border-black flex items-center justify-between text-[10px] text-gray-400">
                    <span>💡 Usa el mouse para rotar en 360° o hacer zoom</span>
                    <button
                      onClick={() => setViewMode('2d')}
                      className="pixel-btn pixel-btn-green text-[9px] py-1 px-2"
                    >
                      VOLVER A 2D
                    </button>
                  </div>
                </div>
              )}

              {/* View Mode 3: Photo Pixel Filter */}
              {viewMode === 'photo' && (
                <AvatarDisplay
                  sourceImage={sourceImage}
                  options={{
                    ...DEFAULT_PIXEL_OPTIONS,
                    name: playerName,
                    role: playerRole
                  }}
                  onChangePhoto={() => setSourceImage(null)}
                />
              )}

              {/* Original photo comparison preview */}
              <div className="flex items-center gap-3 p-2.5 bg-[#17181f] border-2 border-black shadow-[2px_2px_0_#000]">
                <img
                  src={sourceImage}
                  alt="Original"
                  className="w-12 h-12 object-cover border border-black shadow-[2px_2px_0_#000]"
                />
                <div className="text-left font-pixel text-[10px] flex-1">
                  <div className="text-gray-400">FOTO ORIGINAL ESCANEADA</div>
                  <div className="text-[#34A853]">
                    Rasgos transferidos a tu personaje 2D pixel art
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setSourceImage(null);
                  }}
                  className="pixel-btn pixel-btn-dark text-[9px] py-1 px-2 text-gray-400 hover:text-white"
                >
                  CAMBIAR
                </button>
              </div>
            </div>

            {/* Right: Controls & Detected Features (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Tab Selector */}
              <div className="flex border-b-2 border-black gap-2">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setActiveTab('features');
                  }}
                  className={`pixel-btn text-xs py-2 px-4 flex-1 ${
                    activeTab === 'features' ? 'pixel-btn-blue' : 'pixel-btn-dark'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>1. RASGOS DETECTADOS</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    setActiveTab('identity');
                  }}
                  className={`pixel-btn text-xs py-2 px-4 flex-1 ${
                    activeTab === 'identity' ? 'pixel-btn-yellow' : 'pixel-btn-dark'
                  }`}
                >
                  <User size={14} />
                  <span>2. IDENTIDAD & TAG</span>
                </button>
              </div>

              {/* Tab 1: Detection Review Card */}
              {activeTab === 'features' && (
                <DetectionReviewCard
                  features={detectedFeatures}
                  onChange={setDetectedFeatures}
                  accessory={accessory}
                  onAccessoryChange={setAccessory}
                  onRetake={() => setSourceImage(null)}
                />
              )}

              {/* Tab 2: Identity & Name Tag */}
              {activeTab === 'identity' && (
                <div className="pixel-box p-4 space-y-5 text-left bg-[#181920]">
                  <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                    <User className="text-[#FBBC05]" size={18} />
                    <h3 className="font-pixel-heading text-xs text-[#FBBC05]">
                      IDENTIDAD DE JUGADOR & DEV
                    </h3>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block font-pixel text-xs text-gray-300 mb-1.5">
                      NOMBRE EN EL TAG DEL PERSONAJE:
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                      placeholder="EJ: TU NOMBRE"
                      className="w-full pixel-input text-xs uppercase tracking-widest text-[#55FF55] font-pixel-heading"
                    />
                  </div>

                  {/* Role / Subtitle Input */}
                  <div>
                    <label className="block font-pixel text-xs text-gray-300 mb-1.5">
                      CLAN / COMUNIDAD (SUBTÍTULO):
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={playerRole}
                      onChange={(e) => setPlayerRole(e.target.value.toUpperCase())}
                      placeholder="EJ: GDG TACNA"
                      className="w-full pixel-input text-xs uppercase text-[#FBBC05] font-pixel"
                    />

                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {['GDG TACNA', 'GOOGLE DEV', 'FULLSTACK', 'VOXEL HERO', 'AI MASTER'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            setPlayerRole(tag);
                          }}
                          className="text-[8px] font-pixel px-1.5 py-0.5 bg-[#252733] hover:bg-[#FBBC05]/20 hover:text-[#FBBC05] border border-black text-gray-400"
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-3 bg-[#111216] border border-black text-gray-400 text-[11px] leading-relaxed space-y-1">
                    <div>
                      💡 El nombre se renderiza en la placa flotante retro sobre el personaje y en la <strong className="text-white">Credencial Oficial GDG Pass</strong>.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
