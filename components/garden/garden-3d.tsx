'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Sparkles } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import { GARDEN_CAPACITY, GARDEN_COLS, STAGE_COUNT } from '@/lib/garden/catalog';
import { useGardenStore } from '@/lib/store/garden-store';
import { growthFor } from '@/lib/garden/growth';
import { sfx } from '@/lib/audio/synth';
import { Crop3D } from '@/components/garden/crop-3d';
import type { CropTier, PlantedCrop } from '@/lib/persistence/schema';

const ROWS = Math.ceil(GARDEN_CAPACITY / GARDEN_COLS);
const PLOT_SIZE = 1.4;
const PLOT_GAP = 0.12;
const STEP = PLOT_SIZE + PLOT_GAP;

const TIER_GLOW: Record<CropTier, string> = {
  common: '#c2de9b',
  rare: '#c0b9dd',
  epic: '#75d1b7',
  legendary: '#d18a75',
  mythic: '#a33e7e',
};

interface PlotProps {
  position: [number, number, number];
  occupied: boolean;
  onClick?: () => void;
}

function Plot({ position, occupied, onClick }: PlotProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        <boxGeometry args={[PLOT_SIZE, PLOT_SIZE, 0.18]} />
        <meshStandardMaterial
          color={occupied ? '#5a3e2a' : '#caa97a'}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={false}>
        <ringGeometry args={[PLOT_SIZE * 0.49, PLOT_SIZE * 0.51, 32]} />
        <meshBasicMaterial
          color={hovered ? '#fff7d0' : '#8c7256'}
          transparent
          opacity={hovered ? 0.9 : 0.35}
        />
      </mesh>
    </group>
  );
}

interface CropPlantProps {
  crop: PlantedCrop;
  position: [number, number, number];
  onHarvest: () => void;
  onMatureBurst?: () => void;
}

function CropPlant({ crop, position, onHarvest, onMatureBurst }: CropPlantProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matureRef = useRef(false);
  const [stage, setStage] = useState(() =>
    Math.min(growthFor(crop, Date.now()).stage, STAGE_COUNT),
  );
  const [mature, setMature] = useState(() => growthFor(crop, Date.now()).mature);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    const g = growthFor(crop, Date.now());
    const nextStage = g.mature ? STAGE_COUNT : g.stage;
    if (nextStage !== stage) setStage(nextStage);
    if (g.mature !== mature) setMature(g.mature);
  });

  useEffect(() => {
    if (!groupRef.current) return;
    gsap.fromTo(
      groupRef.current.scale,
      { x: 0.85, y: 0.6, z: 0.85 },
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.55,
        ease: 'back.out(2.4)',
      },
    );
    gsap.fromTo(
      groupRef.current.rotation,
      { y: groupRef.current.rotation.y - 0.25 },
      { y: groupRef.current.rotation.y, duration: 0.6, ease: 'power3.out' },
    );
  }, [stage]);

  useEffect(() => {
    if (!groupRef.current) return;
    if (mature && !matureRef.current) {
      matureRef.current = true;
      onMatureBurst?.();
      gsap.to(groupRef.current.position, {
        y: position[1] + 0.18,
        duration: 0.9,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    } else if (!mature && matureRef.current) {
      matureRef.current = false;
      gsap.killTweensOf(groupRef.current.position);
      groupRef.current.position.y = position[1];
    }
  }, [mature, position, onMatureBurst]);

  const glowColor = TIER_GLOW[crop.tier];

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (mature) {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        if (mature) document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (mature) onHarvest();
      }}
    >
      <Crop3D speciesId={crop.speciesId} stage={stage} />
      {mature && (
        <>
          <pointLight color={glowColor} intensity={hovered ? 1.4 : 0.8} distance={1.6} decay={2} />
          <Sparkles
            count={hovered ? 18 : 10}
            scale={1.5}
            size={hovered ? 5 : 3}
            speed={0.6}
            color={glowColor}
          />
        </>
      )}
    </group>
  );
}

function HarvestBurst({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current.scale,
      { x: 0.2, y: 0.2, z: 0.2 },
      { x: 2.5, y: 2.5, z: 2.5, duration: 0.65, ease: 'power2.out' },
    );
  }, []);
  return (
    <group ref={ref} position={position}>
      <Sparkles count={28} scale={1.3} size={6} speed={1.2} color="#fff5b8" />
    </group>
  );
}

function plotPosition(index: number): [number, number, number] {
  const col = index % GARDEN_COLS;
  const row = Math.floor(index / GARDEN_COLS);
  const x = (col - (GARDEN_COLS - 1) / 2) * STEP;
  const z = (row - (ROWS - 1) / 2) * STEP;
  return [x, 0, z];
}

interface SceneProps {
  onHarvest: (cropId: string) => boolean;
}

function GardenSceneContent({ onHarvest }: SceneProps) {
  const crops = useGardenStore((s) => s.plantedCrops);
  const audioEnabled = useGardenStore((s) => s.settings.audioEnabled);
  const reducedMotion = useGardenStore((s) => s.settings.reducedMotion);
  const [bursts, setBursts] = useState<{ id: number; pos: [number, number, number] }[]>([]);

  const cropPlots = useMemo(() => {
    return Array.from({ length: GARDEN_CAPACITY }, (_, i) => {
      const c = crops.find((cr) => cr.plotIndex === i);
      return { index: i, crop: c };
    });
  }, [crops]);

  const handleHarvest = (crop: PlantedCrop) => {
    const ok = onHarvest(crop.id);
    if (ok) {
      const pos = plotPosition(crop.plotIndex);
      const id = Date.now() + crop.plotIndex;
      setBursts((prev) => [...prev, { id, pos: [pos[0], 0.45, pos[2]] }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 900);
      if (audioEnabled) sfx.summon();
    }
  };

  return (
    <>
      <ambientLight intensity={0.55} color="#fff8e7" />
      <directionalLight
        castShadow={!reducedMotion}
        position={[5, 8, 4]}
        intensity={1.05}
        color="#fff1cf"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <hemisphereLight intensity={0.25} color="#cfe9ff" groundColor="#7d6852" />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#a7c46a" roughness={1} />
      </mesh>

      {/* Decorative outer fence-grass strips */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.105, 0]}>
        <ringGeometry args={[3.6, 4.4, 64]} />
        <meshStandardMaterial color="#86a955" roughness={1} transparent opacity={0.6} />
      </mesh>

      {cropPlots.map(({ index, crop }) => (
        <Plot key={`p${index}`} position={plotPosition(index)} occupied={!!crop} />
      ))}
      {cropPlots.map(({ index, crop }) =>
        crop ? (
          <CropPlant
            key={crop.id}
            crop={crop}
            position={plotPosition(index)}
            onHarvest={() => handleHarvest(crop)}
          />
        ) : null,
      )}

      <ContactShadows
        position={[0, -0.05, 0]}
        opacity={0.35}
        scale={10}
        blur={2.5}
        far={2}
        color="#3b2918"
      />

      {bursts.map((b) => (
        <HarvestBurst key={b.id} position={b.pos} />
      ))}
    </>
  );
}

function CameraFraming() {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.set(0, 5.6, 6.2);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

interface Garden3DProps {
  className?: string;
}

export function Garden3D({ className }: Garden3DProps) {
  const harvest = useGardenStore((s) => s.harvest);
  const reducedMotion = useGardenStore((s) => s.settings.reducedMotion);

  return (
    <div
      className={
        className ??
        'overflow-hidden rounded-2xl border border-garden-loam/10 bg-gradient-to-b from-[#dff0c5] via-[#cfe5b0] to-[#a8c481] shadow-sm dark:border-white/10'
      }
    >
      <div
        className="aspect-[5/4] w-full"
        role="img"
        aria-label="Your 3D garden. Plant seeds with focus sessions, tap a ripe crop to harvest."
      >
        <Canvas
          shadows={!reducedMotion}
          dpr={[1, 1.6]}
          camera={{ fov: 36, near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <CameraFraming />
          <Suspense fallback={null}>
            <GardenSceneContent onHarvest={(id) => harvest(id)} />
          </Suspense>
          <OrbitControls
            makeDefault
            enablePan={false}
            minDistance={5}
            maxDistance={11}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.4}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    </div>
  );
}
