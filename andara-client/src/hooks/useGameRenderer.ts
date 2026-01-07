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
  // canvasElement is reserved for future use (e.g., input handling)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { canvasElement: _canvasElement } = options;
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
  // Note: party.position contains regionId/zoneId, not pixel/grid coordinates
  // For now, we skip position updates until coordinate data is available
  // This will be implemented when party movement/position tracking is added
  useEffect(() => {
    if (!rendererRef.current || !party.position) return;

    // Check if position has coordinate data (gridX/gridY or x/y)
    // If it only has regionId/zoneId, skip the update
    const position = party.position as any;
    const hasGridCoordinates = 'gridX' in position && 'gridY' in position && typeof position.gridX === 'number' && typeof position.gridY === 'number';
    const hasPixelCoordinates = 'x' in position && 'y' in position && typeof position.x === 'number' && typeof position.y === 'number';

    if (hasGridCoordinates) {
      rendererRef.current.updatePartyPosition({ gridX: position.gridX, gridY: position.gridY });
    } else if (hasPixelCoordinates) {
      rendererRef.current.updatePartyPosition({ x: position.x, y: position.y });
    }
    // If position only has regionId/zoneId, skip the update
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
