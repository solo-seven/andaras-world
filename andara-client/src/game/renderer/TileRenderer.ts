import * as PIXI from 'pixi.js';
import { TileMap, TerrainType } from './TileMap';
import { Camera } from './Camera';
import { SpriteManager } from '../assets/SpriteManager';

/**
 * TileRenderer renders tiles based on camera viewport with culling and fog of war
 */
export class TileRenderer {
  private tileMap: TileMap;
  private spriteManager: SpriteManager;
  private camera: Camera;
  private container: PIXI.Container;
  private tileSprites: Map<string, PIXI.Sprite> = new Map();
  private showGrid: boolean = false;
  private gridGraphics: PIXI.Graphics | null = null;

  constructor(
    tileMap: TileMap,
    spriteManager: SpriteManager,
    camera: Camera,
    container: PIXI.Container
  ) {
    this.tileMap = tileMap;
    this.spriteManager = spriteManager;
    this.camera = camera;
    this.container = container;
  }

  /**
   * Render visible tiles based on camera viewport
   */
  render(): void {
    const cameraBounds = this.camera.getWorldBounds();

    // Calculate visible tile range
    const startX = Math.floor(cameraBounds.x / TileMap.TILE_SIZE) - 1;
    const startY = Math.floor(cameraBounds.y / TileMap.TILE_SIZE) - 1;
    const endX = Math.ceil((cameraBounds.x + cameraBounds.width) / TileMap.TILE_SIZE) + 1;
    const endY = Math.ceil((cameraBounds.y + cameraBounds.height) / TileMap.TILE_SIZE) + 1;

    // Track which tiles should be visible
    const visibleTiles = new Set<string>();

    // Render visible tiles
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const tile = this.tileMap.getTile(x, y);
        if (!tile) continue;

        const key = `${x},${y}`;
        visibleTiles.add(key);

        // Get or create sprite for this tile
        let sprite = this.tileSprites.get(key);
        if (!sprite) {
          const textureName = this.getTextureName(tile);
          sprite = this.spriteManager.createSprite(textureName);
          sprite.position.set(
            x * TileMap.TILE_SIZE,
            y * TileMap.TILE_SIZE
          );
          sprite.anchor.set(0, 0); // Top-left anchor for tiles
          this.container.addChild(sprite);
          this.tileSprites.set(key, sprite);
        }

        // Apply fog of war
        if (!tile.discovered) {
          sprite.tint = 0x333333; // Darkened
          sprite.alpha = 0.5;
        } else {
          sprite.tint = 0xffffff;
          sprite.alpha = 1.0;
        }

        sprite.visible = true;
      }
    }

    // Hide sprites outside viewport
    for (const [key, sprite] of this.tileSprites) {
      if (!visibleTiles.has(key)) {
        sprite.visible = false;
      }
    }

    // Render grid overlay if enabled
    if (this.showGrid) {
      this.renderGrid(cameraBounds, startX, startY, endX, endY);
    } else if (this.gridGraphics) {
      this.gridGraphics.clear();
    }
  }

  /**
   * Get texture name for a tile
   */
  private getTextureName(tile: { terrain: TerrainType; variant: number }): string {
    return `terrain_${tile.terrain}_${tile.variant}`;
  }

  /**
   * Update tile map from zone data
   */
  updateFromZoneData(zoneData: {
    width: number;
    height: number;
    tiles: Array<Array<{ terrain: string; variant: number; discovered: boolean }>>;
  }): void {
    // Clear existing sprites
    this.clear();

    // Update tile map
    for (let y = 0; y < zoneData.height; y++) {
      for (let x = 0; x < zoneData.width; x++) {
        const tileData = zoneData.tiles[y][x];
        this.tileMap.setTile(x, y, {
          terrain: tileData.terrain as TerrainType,
          variant: tileData.variant,
          discovered: tileData.discovered,
        });
      }
    }

    // Force re-render on next frame
    this.render();
  }

  /**
   * Toggle grid overlay
   */
  toggleGrid(show: boolean): void {
    this.showGrid = show;
    if (!show && this.gridGraphics) {
      this.gridGraphics.clear();
    }
  }

  /**
   * Render grid overlay
   */
  private renderGrid(
    cameraBounds: { x: number; y: number; width: number; height: number },
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): void {
    if (!this.gridGraphics) {
      this.gridGraphics = new PIXI.Graphics();
      this.container.addChild(this.gridGraphics);
    }

    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0x4da6ff, 0.3); // Rift energy color, low opacity

    // Draw vertical lines
    for (let x = startX; x <= endX; x++) {
      const worldX = x * TileMap.TILE_SIZE;
      const screenStart = this.camera.worldToScreen(worldX, cameraBounds.y);
      const screenEnd = this.camera.worldToScreen(
        worldX,
        cameraBounds.y + cameraBounds.height
      );
      this.gridGraphics.moveTo(screenStart.x, screenStart.y);
      this.gridGraphics.lineTo(screenEnd.x, screenEnd.y);
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y++) {
      const worldY = y * TileMap.TILE_SIZE;
      const screenStart = this.camera.worldToScreen(cameraBounds.x, worldY);
      const screenEnd = this.camera.worldToScreen(
        cameraBounds.x + cameraBounds.width,
        worldY
      );
      this.gridGraphics.moveTo(screenStart.x, screenStart.y);
      this.gridGraphics.lineTo(screenEnd.x, screenEnd.y);
    }
  }

  /**
   * Clear all tile sprites
   */
  clear(): void {
    for (const [key, sprite] of this.tileSprites) {
      const tile = this.tileMap.getTile(
        parseInt(key.split(',')[0]),
        parseInt(key.split(',')[1])
      );
      if (tile) {
        const textureName = this.getTextureName(tile);
        this.spriteManager.releaseSprite(sprite, textureName);
      }
    }
    this.tileSprites.clear();

    if (this.gridGraphics) {
      this.gridGraphics.clear();
    }
  }

  /**
   * Destroy renderer and clean up
   */
  destroy(): void {
    this.clear();
    if (this.gridGraphics) {
      this.container.removeChild(this.gridGraphics);
      this.gridGraphics.destroy();
      this.gridGraphics = null;
    }
  }
}
