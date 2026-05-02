'use client';

import { useEffect, useRef } from 'react';
import type * as Phaser from 'phaser';
import { useRealmStore } from '@/lib/store/realm-store';
import type { RealmScene } from '@/lib/game/scenes/realm-scene';
import type { SpiritInstance } from '@/lib/persistence/schema';

export function RealmCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<RealmScene | null>(null);
  const prevSpiritsRef = useRef<SpiritInstance[]>([]);

  const spirits = useRealmStore((s) => s.spirits);
  const hydrated = useRealmStore((s) => s.hydrated);

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

      game.events.on('realm-ready', () => {
        const s = game.scene.getScene('RealmScene') as RealmScene | null;
        sceneRef.current = s;
        const current = useRealmStore.getState().spirits;
        s?.syncSpirits(current);
        prevSpiritsRef.current = current;
      });
    })();

    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || !sceneRef.current) return;
    sceneRef.current.syncSpirits(spirits);
    // Detect new spirits and play burst on each.
    const prev = new Set(prevSpiritsRef.current.map((s) => s.id));
    for (const s of spirits) {
      if (!prev.has(s.id)) {
        sceneRef.current.playSummonBurst(s.plotIndex);
      }
    }
    prevSpiritsRef.current = spirits;
  }, [spirits, hydrated]);

  return (
    <div className="overflow-hidden rounded-2xl border border-realm-ink/10 bg-realm-meadow/20 dark:border-white/10">
      <div
        ref={containerRef}
        className="aspect-[7/4] w-full"
        role="img"
        aria-label="Your focus realm. Spirits stand on plots and bobble gently."
      />
    </div>
  );
}
