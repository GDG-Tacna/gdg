import { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, SwitchCamera, AlertTriangle } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Start webcam stream
  const startCamera = async (mode: 'user' | 'environment') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraError(null);
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setCameraError('No se pudo acceder a la cámara. Asegúrate de otorgar permisos o sube una imagen.');
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Flip camera
  const toggleFacingMode = () => {
    soundManager.playClick();
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Trigger countdown snapshot
  const triggerSnapshot = () => {
    soundManager.playClick();
    setCountdown(3);
    soundManager.playBeep(false);

    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
        soundManager.playBeep(false);
      } else {
        clearInterval(interval);
        setCountdown(null);
        takePicture();
      }
    }, 800);
  };

  // Capture frame
  const takePicture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    soundManager.playBeep(true);
    soundManager.playShutter();
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const canvas = canvasRef.current || document.createElement('canvas');
    const minDim = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = minDim;
    canvas.height = minDim;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Mirror if user-facing
      if (facingMode === 'user') {
        ctx.translate(minDim, 0);
        ctx.scale(-1, 1);
      }

      // Center crop square
      const sx = (video.videoWidth - minDim) / 2;
      const sy = (video.videoHeight - minDim) / 2;
      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, minDim, minDim);

      const dataUrl = canvas.toDataURL('image/png');
      setCapturedPreview(dataUrl);
    }
  };

  // Retake photo
  const handleRetake = () => {
    soundManager.playClick();
    setCapturedPreview(null);
  };

  // Confirm photo
  const handleConfirm = () => {
    if (capturedPreview) {
      soundManager.playSuccess();
      onCapture(capturedPreview);
    }
  };

  return (
    <div className="pixel-box p-4 md:p-6 w-full max-w-xl mx-auto text-center relative overflow-hidden">
      {/* Flash overlay */}
      {isFlashActive && (
        <div className="absolute inset-0 bg-white z-50 animate-fade-out" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#EA4335] border border-black" />
          <h2 className="font-pixel-heading text-xs sm:text-sm text-[#FBBC05]">
            CÁMARA ARCADE
          </h2>
        </div>
        <button
          onClick={() => {
            soundManager.playClick();
            onCancel();
          }}
          className="text-gray-400 hover:text-white p-1 hover:bg-[#2c2d38] border border-transparent hover:border-black"
        >
          <X size={18} />
        </button>
      </div>

      {cameraError ? (
        <div className="bg-[#241315] border-2 border-[#EA4335] p-6 text-center my-4">
          <AlertTriangle className="mx-auto text-[#EA4335] mb-2" size={36} />
          <p className="font-pixel text-xs text-red-200 mb-4">{cameraError}</p>
          <button
            onClick={() => startCamera(facingMode)}
            className="pixel-btn pixel-btn-red text-xs py-2 px-4"
          >
            <RefreshCw size={14} /> REINTENTAR
          </button>
        </div>
      ) : (
        <div className="relative aspect-square max-w-[360px] mx-auto bg-black border-4 border-black overflow-hidden shadow-[4px_4px_0_#000] mb-4">
          {capturedPreview ? (
            <img
              src={capturedPreview}
              alt="Snapshot"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Retro Viewfinder overlay */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                <div className="flex justify-between text-[#34A853] font-pixel text-[10px]">
                  <span>[REC] 8-BIT</span>
                  <span>100% GDG</span>
                </div>

                {/* Center targeting reticle */}
                <div className="m-auto w-36 h-36 border-2 border-dashed border-[#4285F4]/60 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#EA4335]" />
                </div>

                <div className="text-[#FBBC05] font-pixel text-[10px] text-center">
                  CENTRA TU ROSTRO Y ROPA
                </div>
              </div>

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="font-pixel-heading text-6xl text-[#FBBC05] animate-ping">
                    {countdown}
                  </div>
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {!capturedPreview ? (
          <>
            <button
              onClick={toggleFacingMode}
              className="pixel-btn pixel-btn-dark text-xs py-2 px-3"
              title="Cambiar entre cámara frontal y trasera"
            >
              <SwitchCamera size={14} />
              <span className="font-pixel text-[10px]">GIRAR</span>
            </button>

            <button
              onClick={triggerSnapshot}
              disabled={countdown !== null || !!cameraError}
              className="pixel-btn pixel-btn-red text-xs py-3 px-6 shadow-[3px_3px_0_#000]"
            >
              <Camera size={18} />
              <span>CAPTURAR (3s)</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleRetake}
              className="pixel-btn pixel-btn-dark text-xs py-2 px-4"
            >
              <RefreshCw size={14} />
              <span>REPETIR</span>
            </button>

            <button
              onClick={handleConfirm}
              className="pixel-btn pixel-btn-green text-xs py-2 px-6"
            >
              <Check size={16} />
              <span>USAR ESTA FOTO</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
