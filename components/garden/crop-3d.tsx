'use client';

import * as THREE from 'three';
import { useMemo } from 'react';
import { CROPS, STAGE_COUNT, getSpecies, type CropShape } from '@/lib/garden/catalog';
import type { CropSpeciesId } from '@/lib/persistence/schema';

/**
 * Procedural low-poly 3D crop. Each species is built from primitive geometries
 * (cones, capsules, spheres) coloured from the species hue. Stage controls
 * scale and which parts are revealed.
 *
 * Replace later by dropping a .glb at `public/models/<speciesId>.glb` and
 * swapping this file's switch to load gltf models.
 */

interface Crop3DProps {
  speciesId: CropSpeciesId;
  stage: number;
}

export function Crop3D({ speciesId, stage }: Crop3DProps) {
  const species = useMemo(() => getSpecies(speciesId), [speciesId]);
  const stageNorm = Math.min(stage, STAGE_COUNT) / STAGE_COUNT; // 0..1

  switch (species.shape as CropShape) {
    case 'root':
      return <RootCrop hue={species.hue} stage={stage} stageNorm={stageNorm} />;
    case 'stalk':
      return <StalkCrop hue={species.hue} stage={stage} stageNorm={stageNorm} />;
    case 'bush':
      return <BushCrop hue={species.hue} stage={stage} stageNorm={stageNorm} />;
    case 'vine':
      return <VineCrop hue={species.hue} stage={stage} stageNorm={stageNorm} />;
    case 'tree':
      return <TreeCrop hue={species.hue} stage={stage} stageNorm={stageNorm} />;
    default:
      return null;
  }
}

interface ShapeProps {
  hue: number;
  stage: number;
  stageNorm: number;
}

const STEM_COLOR = new THREE.Color('#3f6a3a');
const LEAF_COLOR = new THREE.Color('#8fb86b');
const LEAF_LIGHT = new THREE.Color('#b9d68c');
const SOIL_COLOR = new THREE.Color('#5a3e2a');

function fruitColors(hue: number): { main: THREE.Color; light: THREE.Color; dark: THREE.Color } {
  return {
    main: new THREE.Color().setHSL(hue / 360, 0.7, 0.55),
    light: new THREE.Color().setHSL(hue / 360, 0.7, 0.7),
    dark: new THREE.Color().setHSL(hue / 360, 0.7, 0.4),
  };
}

/** Carrot-like: leafy crown above, root cone hidden until mature. */
function RootCrop({ hue, stage, stageNorm }: ShapeProps) {
  const fruit = fruitColors(hue);
  const sproutScale = stageNorm; // grows with stage
  return (
    <group>
      {/* leafy crown (always visible from stage 1) */}
      {stage >= 1 && (
        <group
          position={[0, 0.18 + sproutScale * 0.1, 0]}
          scale={[sproutScale, sproutScale, sproutScale]}
        >
          <Leaf position={[0, 0.18, 0]} scale={[0.55, 0.45, 0.55]} />
          <Leaf position={[0.13, 0.16, 0]} rotation={[0, 0, 0.4]} scale={[0.4, 0.36, 0.4]} />
          <Leaf position={[-0.13, 0.16, 0]} rotation={[0, 0, -0.4]} scale={[0.4, 0.36, 0.4]} />
          <Leaf position={[0, 0.16, 0.12]} rotation={[0.4, 0, 0]} scale={[0.4, 0.36, 0.4]} />
          <Leaf position={[0, 0.16, -0.12]} rotation={[-0.4, 0, 0]} scale={[0.4, 0.36, 0.4]} />
          <Stem position={[0, 0, 0]} scale={[0.18, 0.4, 0.18]} />
        </group>
      )}
      {stage >= STAGE_COUNT && (
        <mesh position={[0, 0.05, 0]} castShadow>
          <coneGeometry args={[0.22, 0.5, 18]} />
          <meshStandardMaterial color={fruit.main} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

/** Wheat / sunflower: tall stem, wide head at top when mature. */
function StalkCrop({ hue, stage, stageNorm }: ShapeProps) {
  const fruit = fruitColors(hue);
  const tall = 0.3 + stageNorm * 0.85;
  return (
    <group>
      <mesh position={[0, tall / 2, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, tall, 8]} />
        <meshStandardMaterial color={STEM_COLOR} roughness={0.8} />
      </mesh>
      {stage >= 2 && (
        <>
          <Leaf
            position={[0.16, tall * 0.5, 0]}
            rotation={[0, 0, -1.2]}
            scale={[0.32, 0.22, 0.32]}
          />
          <Leaf
            position={[-0.16, tall * 0.55, 0]}
            rotation={[0, 0, 1.2]}
            scale={[0.32, 0.22, 0.32]}
          />
        </>
      )}
      {stage >= 3 && (
        <mesh position={[0, tall + 0.1, 0]} castShadow>
          <sphereGeometry args={[0.16, 14, 12]} />
          <meshStandardMaterial color={fruit.main} roughness={0.55} />
        </mesh>
      )}
      {stage >= STAGE_COUNT && (
        <>
          <mesh position={[0, tall + 0.12, 0]} castShadow>
            <sphereGeometry args={[0.27, 18, 14]} />
            <meshStandardMaterial color={fruit.main} roughness={0.5} />
          </mesh>
          {/* sunflower-ish ray petals */}
          <mesh position={[0, tall + 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.06, 6, 14]} />
            <meshStandardMaterial color={fruit.light} roughness={0.6} />
          </mesh>
        </>
      )}
    </group>
  );
}

/** Strawberry / tomato: low rounded bush with clustered fruits. */
function BushCrop({ hue, stage, stageNorm }: ShapeProps) {
  const fruit = fruitColors(hue);
  const r = 0.25 + stageNorm * 0.25;
  return (
    <group>
      <mesh position={[0, r * 0.8, 0]} castShadow>
        <sphereGeometry args={[r, 18, 14]} />
        <meshStandardMaterial color={LEAF_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[0, r * 0.8, 0]} castShadow>
        <sphereGeometry args={[r * 0.92, 14, 10]} />
        <meshStandardMaterial color={LEAF_LIGHT} roughness={0.85} transparent opacity={0.55} />
      </mesh>
      {stage >= 3 && (
        <>
          <Berry position={[r * 0.5, r * 0.7, 0]} color={fruit.main} />
          <Berry position={[-r * 0.45, r * 0.6, r * 0.3]} color={fruit.main} />
        </>
      )}
      {stage >= STAGE_COUNT && (
        <>
          <Berry position={[r * 0.55, r * 1.1, r * 0.2]} color={fruit.main} large />
          <Berry position={[-r * 0.5, r * 1.05, -r * 0.2]} color={fruit.main} large />
          <Berry position={[0, r * 1.2, r * 0.4]} color={fruit.light} large />
        </>
      )}
    </group>
  );
}

/** Pumpkin / grape: low spreading vine with one big or many small fruits. */
function VineCrop({ hue, stage, stageNorm }: ShapeProps) {
  const fruit = fruitColors(hue);
  const r = 0.3 + stageNorm * 0.3;
  return (
    <group>
      {/* leafy vine pad */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[r, r, 0.06, 18]} />
        <meshStandardMaterial color={LEAF_COLOR} roughness={0.85} />
      </mesh>
      {stage >= 2 && (
        <>
          <Leaf position={[r * 0.7, 0.12, 0]} scale={[0.35, 0.2, 0.35]} />
          <Leaf position={[-r * 0.7, 0.12, 0]} scale={[0.35, 0.2, 0.35]} />
          <Leaf position={[0, 0.12, r * 0.7]} scale={[0.35, 0.2, 0.35]} />
        </>
      )}
      {stage >= STAGE_COUNT && (
        <group position={[0, 0.32, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.34, 18, 14]} />
            <meshStandardMaterial color={fruit.main} roughness={0.5} />
          </mesh>
          {/* pumpkin ridges */}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} rotation={[0, (i / 6) * Math.PI * 2, 0]} position={[0, 0, 0]}>
              <torusGeometry args={[0.34, 0.04, 6, 14, Math.PI]} />
              <meshStandardMaterial color={fruit.dark} roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 0.12, 8]} />
            <meshStandardMaterial color={STEM_COLOR} roughness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** Pineapple / fruit-tree: trunk + crown with spiky leaves. */
function TreeCrop({ hue, stage, stageNorm }: ShapeProps) {
  const fruit = fruitColors(hue);
  const trunk = 0.2 + stageNorm * 0.7;
  return (
    <group>
      <mesh position={[0, trunk / 2, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, trunk, 10]} />
        <meshStandardMaterial color={STEM_COLOR} roughness={0.9} />
      </mesh>
      {stage >= 2 && (
        <group position={[0, trunk + 0.14, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.32 * (0.5 + stageNorm * 0.5), 16, 12]} />
            <meshStandardMaterial color={LEAF_COLOR} roughness={0.85} />
          </mesh>
        </group>
      )}
      {stage >= STAGE_COUNT && (
        <group position={[0, trunk + 0.18, 0]}>
          <mesh castShadow>
            <coneGeometry args={[0.28, 0.5, 12]} />
            <meshStandardMaterial color={fruit.main} roughness={0.55} />
          </mesh>
          {/* crown leaves */}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 6) * Math.PI * 2) * 0.12,
                0.32,
                Math.sin((i / 6) * Math.PI * 2) * 0.12,
              ]}
              rotation={[0, (i / 6) * Math.PI * 2, 0.45]}
            >
              <coneGeometry args={[0.05, 0.32, 4]} />
              <meshStandardMaterial color={LEAF_COLOR} roughness={0.85} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

interface PrimProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

function Leaf({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] }: PrimProps) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow>
      <sphereGeometry args={[0.14, 12, 8]} />
      <meshStandardMaterial color={LEAF_COLOR} roughness={0.85} />
    </mesh>
  );
}

function Stem({ position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] }: PrimProps) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow>
      <cylinderGeometry args={[0.18, 0.18, 0.4, 8]} />
      <meshStandardMaterial color={STEM_COLOR} roughness={0.85} />
    </mesh>
  );
}

interface BerryProps {
  position: [number, number, number];
  color: THREE.Color;
  large?: boolean;
}
function Berry({ position, color, large }: BerryProps) {
  const r = large ? 0.13 : 0.09;
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[r, 14, 10]} />
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  );
}

/** Compile-time guard: all species declared in CROPS must have a shape we can render. */
const _shapeCheck: Record<CropShape, true> = {
  root: true,
  stalk: true,
  bush: true,
  vine: true,
  tree: true,
};
void _shapeCheck;
void CROPS;
void SOIL_COLOR;
