/**
 * Asset manifest for game resources
 */
export interface TextureAsset {
  name: string;
  path: string;
}

export interface SpriteSheetAsset {
  name: string;
  atlasPath: string;
}

export interface AssetManifest {
  textures: TextureAsset[];
  spritesheets: SpriteSheetAsset[];
}

/**
 * Default asset manifest
 * This will be expanded as assets are added
 */
export const assetManifest: AssetManifest = {
  textures: [
    // Terrain textures (placeholders - will be replaced with actual assets)
    { name: 'terrain_grass', path: '/assets/terrain/grass.png' },
    { name: 'terrain_grass_0', path: '/assets/terrain/grass_0.png' },
    { name: 'terrain_grass_1', path: '/assets/terrain/grass_1.png' },
    { name: 'terrain_grass_2', path: '/assets/terrain/grass_2.png' },
    { name: 'terrain_grass_3', path: '/assets/terrain/grass_3.png' },
    { name: 'terrain_dirt', path: '/assets/terrain/dirt.png' },
    { name: 'terrain_dirt_0', path: '/assets/terrain/dirt_0.png' },
    { name: 'terrain_dirt_1', path: '/assets/terrain/dirt_1.png' },
    { name: 'terrain_dirt_2', path: '/assets/terrain/dirt_2.png' },
    { name: 'terrain_dirt_3', path: '/assets/terrain/dirt_3.png' },
    { name: 'terrain_stone', path: '/assets/terrain/stone.png' },
    { name: 'terrain_stone_0', path: '/assets/terrain/stone_0.png' },
    { name: 'terrain_stone_1', path: '/assets/terrain/stone_1.png' },
    { name: 'terrain_stone_2', path: '/assets/terrain/stone_2.png' },
    { name: 'terrain_stone_3', path: '/assets/terrain/stone_3.png' },
    { name: 'terrain_water', path: '/assets/terrain/water.png' },
    { name: 'terrain_rubble', path: '/assets/terrain/rubble.png' },
  ],
  spritesheets: [
    // Character spritesheets
    { name: 'characters', atlasPath: '/assets/spritesheets/characters.json' },
    // UI spritesheets
    { name: 'ui', atlasPath: '/assets/spritesheets/ui.json' },
    // Effect spritesheets
    { name: 'effects', atlasPath: '/assets/spritesheets/effects.json' },
  ],
};
