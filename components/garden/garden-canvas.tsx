'use client';

import { useEffect, useRef } from 'react';
import type * as Phaser from 'phaser';
import { useGardenStore } from '@/lib/store/garden-store';
import type { GardenScene } from '@/lib/game/scenes/garden-scene';
import type { PlantedCrop } from '@/lib/persistence/schema';
import { sfx } from '@/lib/audio/synth';

/**
 * Phaser bridge. The scene draws crops; this component pushes the latest
 * planted-crops list into the scene whenever the store changes, and exposes
 * harvest clicks back to the store.
 */
export function GardenCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GardenScene | null>(null);
  const prevCropsRef = useRef<PlantedCrop[]>([]);

  const crops = useGardenStore((s) => s.plantedCrops);
  const hydrated = useGardenStore((s) => s.hydrated);
  const harvest = useGardenStore((s) => s.harvest);
  const audioEnabled = useGardenStore((s) => s.settings.audioEnabled);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    let cancelled = false;
    (async () => {
      const [PhaserMod, { makePhaserConfig }] = await Promise.all([
        import('phaser'),
        import('@/lib/game/config'),
      ]);
      if (cancelled || !containerRef.current) return;
      const cfg = makePhaserConfig(containerRef.current);
      const game = new PhaserMod.Game(cfg);
      gameRef.current = game;

      game.events.on('garden-ready', () => {
        const s = game.scene.getScene('GardenScene') as GardenScene | null;
        sceneRef.current = s;
        s?.setHandlers({
          onHarvest: (cropId) => {
            const ok = harvest(cropId);
            if (ok) {
              const before = useGardenStore.getState().plantedCrops;
              const justRemoved = prevCropsRef.current.find(
                (c) => c.id === cropId && !before.some((b) => b.id === c.id),
              );
              if (justRemoved) s.playHarvestBurst(justRemoved.plotIndex);
              if (audioEnabled) sfx.summon();
            }
          },
        });
        const current = useGardenStore.getState().plantedCrops;
        s?.syncCrops(current);
        prevCropsRef.current = current;
      });
    })();

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, [harvest, audioEnabled]);

  useEffect(() => {
    if (!hydrated || !sceneRef.current) return;
    sceneRef.current.syncCrops(crops);
    prevCropsRef.current = crops;
  }, [crops, hydrated]);

  return (
    <div className="overflow-hidden rounded-2xl border border-garden-loam/10 bg-garden-cream shadow-sm dark:border-white/10 dark:bg-garden-night/40">
      <div
        ref={containerRef}
        className="aspect-[11/9] w-full"
        role="img"
        aria-label="Your garden. Crops grow on plots, tap a ripe one to harvest."
      />
    </div>
  );
}
