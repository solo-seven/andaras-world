/**
 * Terrain types for tiles
 */
export enum TerrainType {
  GRASS = 'grass',
  DIRT = 'dirt',
  STONE = 'stone',
  WATER = 'water',
  RUBBLE = 'rubble',
}

/**
 * Tile data structure
 */
export interface Tile {
  terrain: TerrainType;
  variant: number; // 0-3 for visual variety
  discovered: boolean;
  properties?: Record<string, unknown>; // Additional tile properties
}

/**
 * TileMap manages a 2D grid of tiles
 */
export class TileMap {
  private tiles: Tile[][];
  readonly width: number;
  readonly height: number;
  static readonly TILE_SIZE = 32; // 32x32 pixels per tile

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = this.initializeTiles(width, height);
  }

  /**
   * Initialize tiles with default values
   */
  private initializeTiles(width: number, height: number): Tile[][] {
    const tiles: Tile[][] = [];
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      for (let x = 0; x < width; x++) {
        tiles[y][x] = {
          terrain: TerrainType.GRASS,
          variant: Math.floor(Math.random() * 4),
          discovered: false,
        };
      }
    }
    return tiles;
  }

  /**
   * Get tile at coordinates
   */
  getTile(x: number, y: number): Tile | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.tiles[y][x];
  }

  /**
   * Set tile at coordinates
   */
  setTile(x: number, y: number, tile: Tile): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y][x] = { ...tile };
    }
  }

  /**
   * Mark tile as discovered
   */
  discoverTile(x: number, y: number): void {
    const tile = this.getTile(x, y);
    if (tile) {
      tile.discovered = true;
    }
  }

  /**
   * Mark area as discovered
   */
  discoverArea(centerX: number, centerY: number, radius: number): void {
    for (let y = centerY - radius; y <= centerY + radius; y++) {
      for (let x = centerX - radius; x <= centerX + radius; x++) {
        const distance = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        if (distance <= radius) {
          this.discoverTile(x, y);
        }
      }
    }
  }

  /**
   * Get all tiles in a rectangular area
   */
  getTilesInArea(
    x: number,
    y: number,
    width: number,
    height: number
  ): Tile[] {
    const tiles: Tile[] = [];
    const startX = Math.max(0, Math.floor(x));
    const startY = Math.max(0, Math.floor(y));
    const endX = Math.min(this.width, Math.floor(x + width));
    const endY = Math.min(this.height, Math.floor(y + height));

    for (let ty = startY; ty < endY; ty++) {
      for (let tx = startX; tx < endX; tx++) {
        const tile = this.getTile(tx, ty);
        if (tile) {
          tiles.push(tile);
        }
      }
    }
    return tiles;
  }

  /**
   * Check if coordinates are valid
   */
  isValidCoordinate(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Convert world coordinates to tile coordinates
   */
  worldToTile(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: Math.floor(worldX / TileMap.TILE_SIZE),
      y: Math.floor(worldY / TileMap.TILE_SIZE),
    };
  }

  /**
   * Convert tile coordinates to world coordinates (center of tile)
   */
  tileToWorld(tileX: number, tileY: number): { x: number; y: number } {
    return {
      x: tileX * TileMap.TILE_SIZE + TileMap.TILE_SIZE / 2,
      y: tileY * TileMap.TILE_SIZE + TileMap.TILE_SIZE / 2,
    };
  }
}
