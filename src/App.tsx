import { useState } from 'react';
import { Sparkles, User, Box } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ImageUploader } from './components/ImageUploader';
import { CameraCapture } from './components/CameraCapture';
import { ThreePixelCharacter } from './components/ThreePixelCharacter';
import { DetectionReviewCard } from './components/DetectionReviewCard';
import { detectFeaturesFromImage, DEFAULT_DETECTED_FEATURES, type DetectedFeatures } from './utils/featureDetector';
import { soundManager } from './utils/sound';

export function App() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState('INICIANDO ESCÁNER...');
  const [detectedFeatures, setDetectedFeatures] = useState<DetectedFeatures>(DEFAULT_DETECTED_FEATURES);

  // Character customization
  const [playerName, setPlayerName] = useState('STEVE_DEV');
  const [playerRole, setPlayerRole] = useState('GDG MINER');
  const [accessory, setAccessory] = useState<'none' | 'diamond-helmet' | 'diamond-sword' | 'glasses'>('none');
  const [activeTab, setActiveTab] = useState<'features' | 'identity'>('features');

  // UI state
  const [scanlinesEnabled, setScanlinesEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Handle image selected: run AI scanner
  const handleImageLoaded = async (imgUrl: string) => {
    setSourceImage(imgUrl);
    setIsCameraOpen(false);
    setIsAnalyzing(true);
    soundManager.playPixelate();

    // Sequence of retro analysis steps
    setAnalyzingStep('ANALIZANDO TONO DE PIEL...');
    await new Promise(r => setTimeout(r, 450));
    setAnalyzingStep('DETECTANDO COLOR Y ESTILO DE CABELLO...');
    await new Promise(r => setTimeout(r, 450));
    setAnalyzingStep('IDENTIFICANDO PRENDAS Y ROPA...');
    await new Promise(r => setTimeout(r, 450));
    setAnalyzingStep('CONSTRUYENDO PERSONAJE 3D PIXEL ART...');
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
              <span className="w-2.5 h-2.5 bg-[#4285F4] animate-pulse inline-block" />
              <span className="font-pixel-heading text-[10px] text-white">MODO: 3D VOXEL RECOGNITION</span>
            </div>
            <span className="text-gray-600">|</span>
            <div className="hidden sm:flex items-center gap-1 font-pixel text-[10px] text-[#34A853]">
              <span>IA SCANNER:</span>
              <span className="text-white">EXTRACCIÓN DE RASGOS + 3D EN TIEMPO REAL</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#252733] border border-black text-[#FBBC05] font-pixel text-[10px]">
              GDG 3D Pixel Studio
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
            <div className="w-16 h-16 mx-auto mb-4 bg-[#4285F4]/20 border-2 border-[#4285F4] flex items-center justify-center animate-bounce">
              <Box className="text-[#4285F4]" size={32} />
            </div>

            <h3 className="font-pixel-heading text-sm text-[#FBBC05] mb-3">
              ESCANEANDO RASGOS FACIALES
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
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="pixel-box p-4 bg-[#16171d]">
                <div className="w-8 h-8 mb-2 bg-[#4285F4] border-2 border-black flex items-center justify-center text-white">
                  👕
                </div>
                <h4 className="font-pixel-heading text-xs text-[#4285F4] mb-1">
                  DETECCIÓN DE ROPA
                </h4>
                <p className="font-pixel text-[11px] text-gray-400">
                  La IA detecta automáticamente el tipo de prenda (hoodie, polera, chaqueta) y sus colores para vestir a tu personaje 3D.
                </p>
              </div>

              <div className="pixel-box p-4 bg-[#16171d]">
                <div className="w-8 h-8 mb-2 bg-[#EA4335] border-2 border-black flex items-center justify-center text-white">
                  💇
                </div>
                <h4 className="font-pixel-heading text-xs text-[#EA4335] mb-1">
                  PEINADO & CORTE
                </h4>
                <p className="font-pixel text-[11px] text-gray-400">
                  Identifica volumen, longitud y color de cabello generando la geometría 3D voxel adecuada (corto, ondulado, largo, etc.).
                </p>
              </div>

              <div className="pixel-box p-4 bg-[#16171d]">
                <div className="w-8 h-8 mb-2 bg-[#34A853] border-2 border-black flex items-center justify-center text-white">
                  🧱
                </div>
                <h4 className="font-pixel-heading text-xs text-[#34A853] mb-1">
                  PERSONAJE 3D EN VIVO
                </h4>
                <p className="font-pixel text-[11px] text-gray-400">
                  Visualiza tu avatar en 360°, rota la cámara con el mouse, prueba animaciones (caminar, saludar) y exporta fotos nítidas.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* View 2: 3D Character Viewer + Detection Review */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Three.js 3D Voxel Character Viewer (6 cols) */}
            <div className="lg:col-span-6 sticky top-4">
              <ThreePixelCharacter
                features={detectedFeatures}
                name={playerName}
                role={playerRole}
                accessory={accessory}
              />

              {/* Original photo thumbnail comparison */}
              <div className="mt-3 flex items-center gap-3 p-2 bg-[#17181f] border-2 border-black">
                <img
                  src={sourceImage}
                  alt="Original"
                  className="w-12 h-12 object-cover border border-black shadow-[2px_2px_0_#000]"
                />
                <div className="text-left font-pixel text-[10px]">
                  <div className="text-gray-400">FOTO ORIGINAL ESCANEADA</div>
                  <div className="text-[#34A853]">Rasgos transferidos a tu personaje 3D</div>
                </div>
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
                  <span>2. NOMBRE & TAG 3D</span>
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
                      IDENTIDAD DE JUGADOR
                    </h3>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block font-pixel text-xs text-gray-300 mb-1.5">
                      NOMBRE EN EL TAG FLOTANTE 3D:
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
                      CLAN / COMUNIDAD:
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={playerRole}
                      onChange={(e) => setPlayerRole(e.target.value.toUpperCase())}
                      placeholder="EJ: GDG COMMUNITY"
                      className="w-full pixel-input text-xs uppercase text-[#FBBC05] font-pixel"
                    />

                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {['GDG MINER', 'GOOGLE DEV', 'VOXEL HERO', 'FULLSTACK', 'AI MASTER'].map(tag => (
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
                  <div className="p-3 bg-[#111216] border border-black text-gray-400 text-[11px] leading-relaxed">
                    💡 La etiqueta flotante se renderiza directamente sobre la cabeza del personaje 3D con tu nivel de experiencia <span className="text-[#55FF55]">99</span> y gira junto con el modelo.
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
