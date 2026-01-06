import * as PIXI from 'pixi.js';
import { AssetLoader } from './AssetLoader';

/**
 * SpriteManager handles sprite creation and pooling for performance
 */
export class SpriteManager {
  private assetLoader: AssetLoader;
  private spritePool: Map<string, PIXI.Sprite[]> = new Map();
  private activeSprites: Set<PIXI.Sprite> = new Set();

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
  }

  /**
   * Create a sprite from a texture name
   */
  createSprite(textureName: string): PIXI.Sprite {
    // Check pool first
    const pooled = this.getFromPool(textureName);
    if (pooled) {
      pooled.visible = true;
      pooled.alpha = 1;
      pooled.tint = 0xffffff;
      this.activeSprites.add(pooled);
      return pooled;
    }

    // Create new sprite
    const texture = this.assetLoader.getTexture(textureName);
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5, 0.5); // Center anchor by default
    this.activeSprites.add(sprite);
    return sprite;
  }

  /**
   * Release a sprite back to the pool
   */
  releaseSprite(sprite: PIXI.Sprite, textureName: string): void {
    sprite.visible = false;
    sprite.parent?.removeChild(sprite);
    this.activeSprites.delete(sprite);

    // Reset sprite properties
    sprite.position.set(0, 0);
    sprite.rotation = 0;
    sprite.scale.set(1, 1);
    sprite.alpha = 1;
    sprite.tint = 0xffffff;

    // Return to pool
    if (!this.spritePool.has(textureName)) {
      this.spritePool.set(textureName, []);
    }
    this.spritePool.get(textureName)!.push(sprite);
  }

  /**
   * Get a sprite from the pool
   */
  private getFromPool(textureName: string): PIXI.Sprite | null {
    const pool = this.spritePool.get(textureName);
    if (pool && pool.length > 0) {
      return pool.pop() || null;
    }
    return null;
  }

  /**
   * Create an animated sprite from a texture array
   */
  createAnimatedSprite(textureNames: string[], animationSpeed: number = 0.1): PIXI.AnimatedSprite {
    const textures = textureNames.map((name) => this.assetLoader.getTexture(name));
    const animatedSprite = new PIXI.AnimatedSprite(textures);
    animatedSprite.animationSpeed = animationSpeed;
    animatedSprite.anchor.set(0.5, 0.5);
    this.activeSprites.add(animatedSprite);
    return animatedSprite;
  }

  /**
   * Release an animated sprite
   */
  releaseAnimatedSprite(sprite: PIXI.AnimatedSprite): void {
    sprite.stop();
    sprite.visible = false;
    sprite.parent?.removeChild(sprite);
    this.activeSprites.delete(sprite);
    // Animated sprites are not pooled (too complex to reset)
  }

  /**
   * Get pool statistics
   */
  getPoolStats(): { textureName: string; poolSize: number }[] {
    const stats: { textureName: string; poolSize: number }[] = [];
    for (const [textureName, pool] of this.spritePool.entries()) {
      stats.push({ textureName, poolSize: pool.length });
    }
    return stats;
  }

  /**
   * Clear all pools
   */
  clearPools(): void {
    this.spritePool.clear();
  }

  /**
   * Get number of active sprites
   */
  getActiveSpriteCount(): number {
    return this.activeSprites.size;
  }
}
