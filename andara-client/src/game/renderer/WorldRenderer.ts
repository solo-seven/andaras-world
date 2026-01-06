import * as PIXI from 'pixi.js';
import { Camera } from './Camera';

interface Animation {
  sprite: PIXI.Sprite;
  target: { x: number; y: number };
  speed: number;
}

/**
 * WorldRenderer manages the PixiJS application and rendering layers
 */
export class WorldRenderer {
  private app: PIXI.Application;
  private layers: {
    terrain: PIXI.Container;
    objects: PIXI.Container;
    entities: PIXI.Container;
    effects: PIXI.Container;
    uiOverlay: PIXI.Container;
  };
  private updateCallback?: (deltaTime: number) => void;
  private camera?: Camera;
  private partySprite?: PIXI.Sprite;
  private characterSprites: Map<string, PIXI.Sprite> = new Map();
  private animationQueue: Animation[] = [];

  constructor(app: PIXI.Application) {
    this.app = app;

    // Create rendering layers
    this.layers = {
      terrain: new PIXI.Container(),
      objects: new PIXI.Container(),
      entities: new PIXI.Container(),
      effects: new PIXI.Container(),
      uiOverlay: new PIXI.Container(),
    };

    // Set z-index by adding layers to stage in order
    this.app.stage.addChild(this.layers.terrain);
    this.app.stage.addChild(this.layers.objects);
    this.app.stage.addChild(this.layers.entities);
    this.app.stage.addChild(this.layers.effects);
    this.app.stage.addChild(this.layers.uiOverlay);

    // Start game loop
    this.app.ticker.add(this.update, this);

    // FPS monitoring in development mode
    if (import.meta.env.DEV) {
      this.setupFPSMonitoring();
    }
  }

  /**
   * Get a specific rendering layer
   */
  getLayer(name: keyof typeof this.layers): PIXI.Container {
    return this.layers[name];
  }

  /**
   * Get all layers
   */
  getLayers() {
    return this.layers;
  }

  /**
   * Get the PixiJS application instance
   */
  getApp(): PIXI.Application {
    return this.app;
  }

  /**
   * Set update callback for game loop
   */
  setUpdateCallback(callback: (deltaTime: number) => void): void {
    this.updateCallback = callback;
  }

  /**
   * Set camera instance
   */
  setCamera(camera: Camera): void {
    this.camera = camera;
    camera.resize(this.app.screen.width, this.app.screen.height);
  }

  /**
   * Get camera instance
   */
  getCamera(): Camera | undefined {
    return this.camera;
  }

  /**
   * Update party position with smooth animation
   */
  updatePartyPosition(position: { gridX: number; gridY: number } | { x: number; y: number }): void {
    if (!this.partySprite) {
      // Create party sprite if it doesn't exist
      // This would use SpriteManager in a real implementation
      return;
    }

    const targetX = 'gridX' in position ? position.gridX * 32 : position.x;
    const targetY = 'gridY' in position ? position.gridY * 32 : position.y;

    // Add to animation queue for smooth movement
    this.animationQueue.push({
      sprite: this.partySprite,
      target: { x: targetX, y: targetY },
      speed: 200, // pixels per second
    });
  }

  /**
   * Update character sprite
   */
  updateCharacterSprite(character: {
    id: string;
    position?: { x: number; y: number };
    status?: { dead?: boolean; incapacitated?: boolean };
  }): void {
    let sprite = this.characterSprites.get(character.id);

    if (!sprite) {
      // Create new sprite for character
      // This would use SpriteManager in a real implementation
      return;
    }

    // Update sprite properties based on character state
    if (character.status?.dead) {
      sprite.tint = 0x666666;
    } else if (character.status?.incapacitated) {
      sprite.tint = 0xaa6666;
    } else {
      sprite.tint = 0xffffff;
    }

    // Update position if provided
    if (character.position) {
      this.animationQueue.push({
        sprite,
        target: { x: character.position.x, y: character.position.y },
        speed: 200,
      });
    }
  }

  /**
   * Update tile map
   */
  updateTileMap(_tileMap: unknown): void {
    // This would update the TileRenderer
    // Implementation depends on how TileRenderer is integrated
  }

  /**
   * Update combat state
   */
  updateCombatState(_combat: unknown): void {
    // Update combat entities and UI
    // Implementation depends on combat system
  }

  /**
   * Handle window resize
   */
  handleResize(width: number, height: number): void {
    if (this.camera) {
      this.camera.resize(width, height);
    }
  }

  /**
   * Game loop update function
   */
  private update = (ticker: PIXI.Ticker): void => {
    const deltaTime = ticker.deltaTime / 60; // Normalize to 60 FPS

    // Update camera
    if (this.camera) {
      this.camera.update(deltaTime);
      this.camera.applyToContainer(this.app.stage);
    }

    // Process animation queue for smooth movement
    this.animationQueue = this.animationQueue.filter((anim: Animation) => {
      const dx = anim.target.x - anim.sprite.x;
      const dy = anim.target.y - anim.sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 1) {
        // Reached target
        anim.sprite.position.set(anim.target.x, anim.target.y);
        return false; // Remove from queue
      }

      // Interpolate position
      // deltaTime is already normalized to 60 FPS, so no need to divide by 60 again
      const step = anim.speed * deltaTime;
      const ratio = Math.min(step / distance, 1);

      anim.sprite.x += dx * ratio;
      anim.sprite.y += dy * ratio;

      return true; // Keep in queue
    });

    // Call custom update callback if set
    if (this.updateCallback) {
      this.updateCallback(deltaTime);
    }
  };

  /**
   * Setup FPS monitoring in development mode
   */
  private setupFPSMonitoring(): void {
    let lastTime = performance.now();
    let frameCount = 0;

    this.app.ticker.add(() => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        if (fps < 55) {
          console.warn(`Low FPS detected: ${fps}`);
        }
        frameCount = 0;
        lastTime = currentTime;
      }
    });
  }

  /**
   * Destroy the renderer and clean up resources
   */
  destroy(): void {
    // Remove update callback
    this.app.ticker.remove(this.update, this);

    // Remove all children from layers
    Object.values(this.layers).forEach((layer) => {
      layer.removeChildren();
    });

    // Clear layers reference
    (this.layers as any) = null;
  }
}
