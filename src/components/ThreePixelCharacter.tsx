import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Camera, RotateCw } from 'lucide-react';
import type { DetectedFeatures } from '../utils/featureDetector';
import { createFaceTexture, createTorsoTexture } from '../utils/skinTextureGenerator';
import { soundManager } from '../utils/sound';

interface ThreePixelCharacterProps {
  features: DetectedFeatures;
  name: string;
  role: string;
  accessory: 'none' | 'diamond-helmet' | 'diamond-sword' | 'glasses';
  onSnapshotTaken?: (dataUrl: string) => void;
}

export const ThreePixelCharacter = ({
  features,
  name,
  role,
  accessory,
  onSnapshotTaken
}: ThreePixelCharacterProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const headGroupRef = useRef<THREE.Group | null>(null);

  const [autoRotate, setAutoRotate] = useState(true);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#14151a');

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.2);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 8;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.target.set(0, 0.4, 0);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#fff5e6', 1.25);
    dirLight.position.set(4, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Google Accent rim lights
    const blueRim = new THREE.PointLight('#4285F4', 2.0, 10);
    blueRim.position.set(-3, 2, -2);
    scene.add(blueRim);

    const redRim = new THREE.PointLight('#EA4335', 1.8, 10);
    redRim.position.set(3, 2, -2);
    scene.add(redRim);

    // 5. Build 3D Pixel Character
    const characterGroup = new THREE.Group();
    characterGroupRef.current = characterGroup;
    scene.add(characterGroup);

    // Materials
    const skinMat = new THREE.MeshToonMaterial({ color: features.skinColor });
    const hairMat = new THREE.MeshToonMaterial({ color: features.hairColor });
    const clothMat = new THREE.MeshToonMaterial({ color: features.clothingColor });
    const pantsMat = new THREE.MeshToonMaterial({ color: features.pantsColor });
    const shoesMat = new THREE.MeshToonMaterial({ color: '#181920' });

    // --- HEAD GROUP ---
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.45, 0);
    headGroupRef.current = headGroup;
    characterGroup.add(headGroup);

    // Head Base Cube (with Face texture on front)
    const faceTex = createFaceTexture(features);
    const headMaterials = [
      skinMat, // right
      skinMat, // left
      skinMat, // top
      skinMat, // bottom
      new THREE.MeshToonMaterial({ map: faceTex }), // front
      skinMat  // back
    ];
    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMesh = new THREE.Mesh(headGeo, headMaterials);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // --- 3D VOXEL HAIR LAYER ---
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    if (features.hairStyle !== 'bald') {
      const topCapGeo = new THREE.BoxGeometry(0.86, 0.22, 0.86);
      const topCap = new THREE.Mesh(topCapGeo, hairMat);
      topCap.position.set(0, 0.35, 0);
      topCap.castShadow = true;
      hairGroup.add(topCap);

      const backGeo = new THREE.BoxGeometry(0.86, features.hairStyle === 'long' ? 0.9 : 0.45, 0.16);
      const backMesh = new THREE.Mesh(backGeo, hairMat);
      backMesh.position.set(0, features.hairStyle === 'long' ? -0.1 : 0.12, -0.38);
      backMesh.castShadow = true;
      hairGroup.add(backMesh);

      const sideH = features.hairStyle === 'long' ? 0.8 : 0.35;
      const sideGeo = new THREE.BoxGeometry(0.12, sideH, 0.7);
      const leftSide = new THREE.Mesh(sideGeo, hairMat);
      leftSide.position.set(-0.39, features.hairStyle === 'long' ? -0.1 : 0.15, -0.05);
      const rightSide = new THREE.Mesh(sideGeo, hairMat);
      rightSide.position.set(0.39, features.hairStyle === 'long' ? -0.1 : 0.15, -0.05);
      hairGroup.add(leftSide);
      hairGroup.add(rightSide);

      if (features.hairStyle === 'curly' || features.hairStyle === 'messy') {
        const fringeGeo = new THREE.BoxGeometry(0.84, 0.18, 0.16);
        const fringe = new THREE.Mesh(fringeGeo, hairMat);
        fringe.position.set(0, 0.36, 0.38);
        hairGroup.add(fringe);

        for (let i = -2; i <= 2; i++) {
          const curlGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
          const curl = new THREE.Mesh(curlGeo, hairMat);
          curl.position.set(i * 0.16, 0.48, (i % 2) * 0.1);
          hairGroup.add(curl);
        }
      } else if (features.hairStyle === 'parted') {
        const partGeo = new THREE.BoxGeometry(0.5, 0.16, 0.14);
        const part = new THREE.Mesh(partGeo, hairMat);
        part.position.set(-0.16, 0.34, 0.38);
        hairGroup.add(part);
      } else if (features.hairStyle === 'short') {
        const frontGeo = new THREE.BoxGeometry(0.82, 0.12, 0.1);
        const front = new THREE.Mesh(frontGeo, hairMat);
        front.position.set(0, 0.36, 0.38);
        hairGroup.add(front);
      }
    }

    // --- ACCESSORIES ON HEAD ---
    if (accessory === 'diamond-helmet') {
      const helmetMat = new THREE.MeshToonMaterial({ color: '#4BEDD7' });
      const helmetGeo = new THREE.BoxGeometry(0.92, 0.5, 0.92);
      const helmet = new THREE.Mesh(helmetGeo, helmetMat);
      helmet.position.set(0, 0.22, 0);
      headGroup.add(helmet);
    }

    // Reading Glasses (Lentes de lectura con cristales transparentes)
    if (accessory === 'glasses' || features.hasGlasses) {
      const glassesGroup = new THREE.Group();
      glassesGroup.position.set(0, -0.02, 0.43);

      const frameMat = new THREE.MeshToonMaterial({ color: '#1E232A' });
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: '#DCEBFA',
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        transmission: 0.8
      });

      // Left lens frame & glass
      const leftFrameGeo = new THREE.BoxGeometry(0.28, 0.2, 0.03);
      const leftGlass = new THREE.Mesh(leftFrameGeo, glassMat);
      leftGlass.position.set(-0.2, 0, 0);
      glassesGroup.add(leftGlass);

      // Left frame rim
      const leftRim = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.02), frameMat);
      leftRim.position.set(-0.2, 0, -0.01);
      glassesGroup.add(leftRim);

      // Right lens frame & glass
      const rightFrameGeo = new THREE.BoxGeometry(0.28, 0.2, 0.03);
      const rightGlass = new THREE.Mesh(rightFrameGeo, glassMat);
      rightGlass.position.set(0.2, 0, 0);
      glassesGroup.add(rightGlass);

      const rightRim = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.02), frameMat);
      rightRim.position.set(0.2, 0, -0.01);
      glassesGroup.add(rightRim);

      // Bridge & temples
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), frameMat);
      bridge.position.set(0, 0.04, 0);
      glassesGroup.add(bridge);

      const leftTemple = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.35), frameMat);
      leftTemple.position.set(-0.36, 0.02, -0.17);
      glassesGroup.add(leftTemple);

      const rightTemple = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.35), frameMat);
      rightTemple.position.set(0.36, 0.02, -0.17);
      glassesGroup.add(rightTemple);

      headGroup.add(glassesGroup);
    }

    // --- TORSO GROUP ---
    const torsoTex = createTorsoTexture(features);
    const torsoMaterials = [
      clothMat, clothMat, clothMat, clothMat,
      new THREE.MeshToonMaterial({ map: torsoTex }), // Front
      clothMat // Back
    ];
    const torsoGeo = new THREE.BoxGeometry(0.8, 1.1, 0.4);
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMaterials);
    torsoMesh.position.set(0, 0.5, 0);
    torsoMesh.castShadow = true;
    characterGroup.add(torsoMesh);

    // --- 3D GARMENT GEOMETRY DETAILS ---
    if (features.clothingType === 'hoodie') {
      // 3D Folded Hood behind neck
      const hoodGeo = new THREE.BoxGeometry(0.84, 0.44, 0.22);
      const hoodMesh = new THREE.Mesh(hoodGeo, clothMat);
      hoodMesh.position.set(0, 0.82, -0.22);
      hoodMesh.castShadow = true;
      characterGroup.add(hoodMesh);

      // 3D Kangaroo pocket protrusion
      const pocketGeo = new THREE.BoxGeometry(0.64, 0.34, 0.06);
      const pocketMesh = new THREE.Mesh(pocketGeo, clothMat);
      pocketMesh.position.set(0, 0.26, 0.22);
      pocketMesh.castShadow = true;
      characterGroup.add(pocketMesh);

    } else if (features.clothingType === 'jacket') {
      // 3D Open jacket collar lapels
      const lapelGeo = new THREE.BoxGeometry(0.18, 0.58, 0.05);
      const leftLapel = new THREE.Mesh(lapelGeo, clothMat);
      leftLapel.position.set(-0.24, 0.65, 0.22);
      leftLapel.castShadow = true;
      characterGroup.add(leftLapel);

      const rightLapel = new THREE.Mesh(lapelGeo, clothMat);
      rightLapel.position.set(0.24, 0.65, 0.22);
      rightLapel.castShadow = true;
      characterGroup.add(rightLapel);
    }

    // --- ARMS (TRANSFORMS FOR T-SHIRT VS LONG SLEEVE) ---
    const isShortSleeve = features.clothingType === 'tshirt';

    // Left Arm
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.58, 0.95, 0);
    leftArmRef.current = leftArmGroup;
    characterGroup.add(leftArmGroup);

    if (isShortSleeve) {
      // Short Sleeve T-Shirt
      const shortSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), clothMat);
      shortSleeve.position.set(0, -0.175, 0);
      shortSleeve.castShadow = true;
      leftArmGroup.add(shortSleeve);

      // Bare Forearm + Hand in skin color!
      const bareArm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.75, 0.32), skinMat);
      bareArm.position.set(0, -0.68, 0);
      bareArm.castShadow = true;
      leftArmGroup.add(bareArm);
    } else {
      // Long Sleeve (Hoodie / Jacket)
      const leftSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.75, 0.34), clothMat);
      leftSleeve.position.set(0, -0.375, 0);
      leftSleeve.castShadow = true;
      leftArmGroup.add(leftSleeve);

      const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 0.32), skinMat);
      leftHand.position.set(0, -0.85, 0);
      leftHand.castShadow = true;
      leftArmGroup.add(leftHand);
    }

    // Right Arm
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.58, 0.95, 0);
    rightArmRef.current = rightArmGroup;
    characterGroup.add(rightArmGroup);

    if (isShortSleeve) {
      // Short Sleeve T-Shirt
      const shortSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), clothMat);
      shortSleeve.position.set(0, -0.175, 0);
      shortSleeve.castShadow = true;
      rightArmGroup.add(shortSleeve);

      // Bare Forearm + Hand in skin color!
      const bareArm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.75, 0.32), skinMat);
      bareArm.position.set(0, -0.68, 0);
      bareArm.castShadow = true;
      rightArmGroup.add(bareArm);
    } else {
      // Long Sleeve (Hoodie / Jacket)
      const rightSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.75, 0.34), clothMat);
      rightSleeve.position.set(0, -0.375, 0);
      rightSleeve.castShadow = true;
      rightArmGroup.add(rightSleeve);

      const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 0.32), skinMat);
      rightHand.position.set(0, -0.85, 0);
      rightHand.castShadow = true;
      rightArmGroup.add(rightHand);
    }

    // Diamond Sword in hand
    if (accessory === 'diamond-sword') {
      const swordMat = new THREE.MeshToonMaterial({ color: '#4BEDD7' });
      const swordGeo = new THREE.BoxGeometry(0.12, 1.1, 0.08);
      const sword = new THREE.Mesh(swordGeo, swordMat);
      sword.position.set(0, -0.8, 0.4);
      sword.rotation.x = Math.PI / 4;
      rightArmGroup.add(sword);
    }

    // --- LEGS ---
    const legGeo = new THREE.BoxGeometry(0.36, 0.85, 0.36);
    const shoeGeo = new THREE.BoxGeometry(0.38, 0.25, 0.44);

    // Left Leg
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.21, -0.05, 0);
    characterGroup.add(leftLegGroup);

    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.position.set(0, -0.425, 0);
    leftLegMesh.castShadow = true;
    leftLegGroup.add(leftLegMesh);

    const leftShoe = new THREE.Mesh(shoeGeo, shoesMat);
    leftShoe.position.set(0, -0.92, 0.04);
    leftShoe.castShadow = true;
    leftLegGroup.add(leftShoe);

    // Right Leg
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.21, -0.05, 0);
    characterGroup.add(rightLegGroup);

    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.position.set(0, -0.425, 0);
    rightLegMesh.castShadow = true;
    rightLegGroup.add(rightLegMesh);

    const rightShoe = new THREE.Mesh(shoeGeo, shoesMat);
    rightShoe.position.set(0, -0.92, 0.04);
    rightShoe.castShadow = true;
    rightLegGroup.add(rightShoe);

    // --- 3D GOOGLE PEDESTAL ---
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -1.15, 0);
    scene.add(pedestalGroup);

    const pedGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.2, 32);
    const pedMat = new THREE.MeshToonMaterial({ color: '#1c1d24' });
    const pedMesh = new THREE.Mesh(pedGeo, pedMat);
    pedMesh.receiveShadow = true;
    pedestalGroup.add(pedMesh);

    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
    colors.forEach((c, idx) => {
      const ringGeo = new THREE.RingGeometry(1.4, 1.65, 16, 1, (idx * Math.PI) / 2, Math.PI / 2 - 0.08);
      const ringMat = new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.11;
      pedestalGroup.add(ringMesh);
    });

    // 6. Animation Loop (Natural Idle Breathing Only)
    const startTime = performance.now();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      controls.update();

      // Auto-rotation
      if (autoRotate && characterGroupRef.current) {
        characterGroupRef.current.rotation.y = Math.sin(elapsed * 0.4) * 0.25;
        pedestalGroup.rotation.y = elapsed * 0.2;
      }

      // Gentle natural breathing
      if (headGroupRef.current && rightArmRef.current && leftArmRef.current) {
        headGroupRef.current.position.y = 1.45 + Math.sin(elapsed * 2) * 0.02;
        headGroupRef.current.rotation.y = Math.sin(elapsed * 0.8) * 0.06;
        rightArmRef.current.rotation.x = Math.sin(elapsed * 2) * 0.04;
        leftArmRef.current.rotation.x = -Math.sin(elapsed * 2) * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [features, accessory, autoRotate]);

  // Capture High-Res PNG Avatar Snapshot
  const handleTakeSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    soundManager.playShutter();
    soundManager.playCoin();

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');

    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 2000);

    if (onSnapshotTaken) {
      onSnapshotTaken(dataUrl);
    } else {
      const link = document.createElement('a');
      link.download = `${(name || '3D_AVATAR').replace(/\s+/g, '_')}_3D_PIXEL.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="pixel-box p-4 bg-[#14151a] relative text-center">
      {/* 3D Viewport Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#34A853] border border-black animate-pulse" />
          <h3 className="font-pixel-heading text-xs text-[#34A853]">
            VISOR 3D VOXEL AVATAR
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setAutoRotate(!autoRotate);
            }}
            className={`pixel-btn text-[9px] py-1 px-2 ${
              autoRotate ? 'pixel-btn-green' : 'pixel-btn-dark'
            }`}
            title="Giro automático 360°"
          >
            <RotateCw size={12} className={autoRotate ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">GIRO 360°</span>
          </button>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div className="relative aspect-[4/5] sm:aspect-square max-w-[420px] mx-auto bg-black border-4 border-black shadow-[6px_6px_0_#000] overflow-hidden group">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Minecraft Name Tag Overlay */}
        <div className="absolute top-4 left-0 right-0 pointer-events-none flex justify-center">
          <div className="px-3 py-1 bg-black/75 border border-black/80 flex items-center gap-2 shadow-[2px_2px_0_#000]">
            <span className="font-pixel-heading text-[10px] text-[#55FF55]">99</span>
            <span className="font-pixel text-xs text-white tracking-wider">
              {name || 'STEVE_DEV'}
            </span>
            {role && (
              <span className="font-pixel text-[10px] text-[#FBBC05]">
                [{role}]
              </span>
            )}
          </div>
        </div>

        {/* 3D Touch/Drag Hint */}
        <div className="absolute bottom-2 left-2 pointer-events-none font-pixel text-[9px] text-gray-400 bg-black/60 px-2 py-0.5 border border-black">
          🖱️ Arrastra para rotar en 360°
        </div>
      </div>

      {/* Snapshot / Export PNG Button */}
      <div className="mt-4 pt-3 border-t-2 border-black/60 flex items-center justify-center gap-3">
        <button
          onClick={handleTakeSnapshot}
          className="pixel-btn pixel-btn-green text-xs py-2.5 px-6 shadow-[3px_3px_0_#000]"
        >
          <Camera size={16} />
          <span>{snapshotSuccess ? '¡FOTO CAPTURADA!' : 'FOTO DEL AVATAR 3D (PNG)'}</span>
        </button>
      </div>
    </div>
  );
};
