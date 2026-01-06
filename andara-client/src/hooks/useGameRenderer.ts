import { useEffect, useRef, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { WorldRenderer } from '../game/renderer/WorldRenderer';
import { Camera } from '../game/renderer/Camera';
import { TileRenderer } from '../game/renderer/TileRenderer';
import { mapZoneDataToTileMap } from '../utils/mappers';

interface UseGameRendererOptions {
  canvasElement?: HTMLElement | null;
}

export const useGameRenderer = (options: UseGameRendererOptions = {}) => {
  const { canvasElement } = options;
  const rendererRef = useRef<WorldRenderer | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const tileRendererRef = useRef<TileRenderer | null>(null);
  const initializedRef = useRef(false);

  // Redux state
  const party = useAppSelector((state) => state.party);
  const world = useAppSelector((state) => state.world);
  const combat = useAppSelector((state) => state.combat);

  /**
   * Callback to be passed to GameCanvas's onRendererReady prop
   * This populates the refs when the renderer is initialized
   */
  const handleRendererReady = useCallback((renderer: WorldRenderer) => {
    rendererRef.current = renderer;
    
    // Extract camera from renderer
    const camera = renderer.getCamera();
    if (camera) {
      cameraRef.current = camera;
    }

    // Note: TileRenderer is not directly accessible from WorldRenderer
    // It would need to be passed separately or exposed via a getter method
    // For now, we'll leave tileRendererRef as null until TileRenderer integration is complete
    
    initializedRef.current = true;
  }, []);

  // Update party position when it changes
  useEffect(() => {
    if (!rendererRef.current || !party.position) return;

    rendererRef.current.updatePartyPosition(party.position);
  }, [party.position]);

  // Update zone tiles when zone changes
  useEffect(() => {
    if (!rendererRef.current || !world.currentZone) return;

    const zoneData = world.currentZone as any;
    if (zoneData && zoneData.tiles) {
      // Update tile map via WorldRenderer
      // Note: This will need to be implemented in WorldRenderer.updateTileMap
      rendererRef.current.updateTileMap(mapZoneDataToTileMap(zoneData));
    }
  }, [world.currentZone]);

  // Update character sprites when characters change
  useEffect(() => {
    if (!rendererRef.current || !party.members) return;

    Object.values(party.members).forEach((character: any) => {
      rendererRef.current?.updateCharacterSprite(character);
    });
  }, [party.members]);

  // Update combat state
  useEffect(() => {
    if (!rendererRef.current || combat.status !== 'active') return;

    rendererRef.current.updateCombatState(combat);
  }, [combat]);

  return {
    renderer: rendererRef.current,
    camera: cameraRef.current,
    tileRenderer: tileRendererRef.current,
    onRendererReady: handleRendererReady,
  };
};
