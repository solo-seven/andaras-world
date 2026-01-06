import * as PIXI from 'pixi.js';
import type { AssetManifest } from './manifest';

type ProgressCallback = (progress: number, currentAsset?: string) => void;

/**
 * AssetLoader handles loading textures and sprite sheets
 */
export class AssetLoader {
  private textures: Map<string, PIXI.Texture> = new Map();
  private loadingProgress: number = 0;
  private onProgressCallback?: ProgressCallback;
  private app: PIXI.Application | null = null;

  constructor(app: PIXI.Application) {
    this.app = app;
  }

  /**
   * Load a single texture
   */
  async loadTexture(path: string): Promise<PIXI.Texture> {
    try {
      const texture = await PIXI.Assets.load<PIXI.Texture>(path);
      return texture;
    } catch (error) {
      console.error(`Failed to load texture: ${path}`, error);
      return this.createFallbackTexture();
    }
  }

  /**
   * Load a sprite sheet (texture atlas)
   */
  async loadSpriteSheet(atlasPath: string): Promise<PIXI.Spritesheet> {
    try {
      const spritesheet = await PIXI.Assets.load<PIXI.Spritesheet>(atlasPath);
      return spritesheet;
    } catch (error) {
      console.error(`Failed to load sprite sheet: ${atlasPath}`, error);
      throw error;
    }
  }

  /**
   * Load all assets from manifest
   */
  async loadAll(manifest: AssetManifest): Promise<void> {
    const totalAssets = manifest.textures.length + manifest.spritesheets.length;
    let loadedAssets = 0;

    // Load individual textures
    for (const textureAsset of manifest.textures) {
      try {
        const texture = await this.loadTexture(textureAsset.path);
        this.textures.set(textureAsset.name, texture);
        this.updateProgress(++loadedAssets / totalAssets, textureAsset.name);
      } catch (error) {
        console.error(`Failed to load texture: ${textureAsset.name}`, error);
        // Use fallback
        const fallback = this.createFallbackTexture();
        this.textures.set(textureAsset.name, fallback);
        this.updateProgress(++loadedAssets / totalAssets, textureAsset.name);
      }
    }

    // Load sprite sheets
    for (const sheetAsset of manifest.spritesheets) {
      try {
        const spritesheet = await this.loadSpriteSheet(sheetAsset.atlasPath);
        // Store each texture from atlas with prefix
        Object.entries(spritesheet.textures).forEach(([name, texture]) => {
          this.textures.set(`${sheetAsset.name}:${name}`, texture);
        });
        this.updateProgress(++loadedAssets / totalAssets, sheetAsset.name);
      } catch (error) {
        console.error(`Failed to load sprite sheet: ${sheetAsset.name}`, error);
        // Continue loading other assets even if one fails
        this.updateProgress(++loadedAssets / totalAssets, sheetAsset.name);
      }
    }
  }

  /**
   * Get a loaded texture by name
   */
  getTexture(name: string): PIXI.Texture {
    const texture = this.textures.get(name);
    if (!texture) {
      console.warn(`Texture not found: ${name}, using fallback`);
      return this.createFallbackTexture();
    }
    return texture;
  }

  /**
   * Check if a texture is loaded
   */
  hasTexture(name: string): boolean {
    return this.textures.has(name);
  }

  /**
   * Get loading progress (0-1)
   */
  getProgress(): number {
    return this.loadingProgress;
  }

  /**
   * Set progress callback
   */
  onProgress(callback: ProgressCallback): void {
    this.onProgressCallback = callback;
  }

  /**
   * Create a fallback texture (magenta placeholder)
   */
  private createFallbackTexture(): PIXI.Texture {
    if (!this.app) {
      throw new Error('PixiJS Application not initialized');
    }

    // Create a simple colored rectangle as fallback
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xff00ff); // Magenta for visibility
    graphics.drawRect(0, 0, 32, 32);
    graphics.endFill();
    return this.app.renderer.generateTexture(graphics);
  }

  /**
   * Update loading progress
   */
  private updateProgress(progress: number, currentAsset?: string): void {
    this.loadingProgress = Math.min(1, Math.max(0, progress));
    if (this.onProgressCallback) {
      this.onProgressCallback(this.loadingProgress, currentAsset);
    }
  }

  /**
   * Clear all loaded textures
   */
  clear(): void {
    this.textures.clear();
    this.loadingProgress = 0;
  }
}
