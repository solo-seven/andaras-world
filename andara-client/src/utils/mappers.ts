import { TileMap, TerrainType } from '../game/renderer/TileMap';

/**
 * Map backend zone data to TileMap
 */
export function mapZoneDataToTileMap(zoneData: {
  width: number;
  height: number;
  tiles: Array<Array<{ terrain: string; variant: number; discovered: boolean }>>;
}): TileMap {
  const tileMap = new TileMap(zoneData.width, zoneData.height);

  for (let y = 0; y < zoneData.height; y++) {
    for (let x = 0; x < zoneData.width; x++) {
      const backendTile = zoneData.tiles[y][x];
      tileMap.setTile(x, y, {
        terrain: backendTile.terrain as TerrainType,
        variant: backendTile.variant,
        discovered: backendTile.discovered,
      });
    }
  }

  return tileMap;
}

/**
 * Map character data to sprite configuration
 */
export function mapCharacterToSprite(character: {
  id: string;
  appearance?: any;
  position?: { x: number; y: number };
}): {
  textureName: string;
  position: { x: number; y: number };
} {
  // Determine texture based on character appearance
  const textureName = character.appearance
    ? `character_${character.appearance.bodyType || 'default'}`
    : 'character_default';

  const position = character.position || { x: 0, y: 0 };

  return {
    textureName,
    position,
  };
}

/**
 * Update sprite properties from character state
 */
export function updateSpriteFromCharacter(
  sprite: { tint: number; alpha: number; visible: boolean },
  character: {
    status?: { dead?: boolean; incapacitated?: boolean };
    health?: number;
    maxHealth?: number;
  }
): void {
  if (character.status?.dead) {
    sprite.tint = 0x666666; // Gray for dead
    sprite.alpha = 0.7;
  } else if (character.status?.incapacitated) {
    sprite.tint = 0xaa6666; // Reddish for incapacitated
    sprite.alpha = 0.8;
  } else {
    sprite.tint = 0xffffff; // Normal
    sprite.alpha = 1.0;
  }

  // Health-based tinting (optional)
  if (character.health !== undefined && character.maxHealth !== undefined) {
    const healthRatio = character.health / character.maxHealth;
    if (healthRatio < 0.3) {
      // Low health - slight red tint
      sprite.tint = 0xffaaaa;
    } else if (healthRatio < 0.6) {
      // Medium health - slight yellow tint
      sprite.tint = 0xffffaa;
    }
  }
}
