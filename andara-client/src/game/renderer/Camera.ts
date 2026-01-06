/**
 * Camera class for managing viewport and world-to-screen coordinate conversion
 */
export class Camera {
  private x: number = 0;
  private y: number = 0;
  private zoom: number = 1.0;
  private targetX: number = 0;
  private targetY: number = 0;
  private followSpeed: number = 0.1;
  private viewportWidth: number;
  private viewportHeight: number;
  private minZoom: number = 0.5;
  private maxZoom: number = 2.0;
  private followTarget: { x: number; y: number } | null = null;
  private deadZone: { width: number; height: number } = { width: 100, height: 100 };
  private worldBounds: { minX?: number; minY?: number; maxX?: number; maxY?: number } | null = null;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  /**
   * Update camera position (smooth follow)
   */
  update(deltaTime: number): void {
    // Smooth camera movement (lerp)
    // deltaTime is already normalized to 60 FPS by WorldRenderer
    const lerpFactor = this.followSpeed * deltaTime;
    this.x += (this.targetX - this.x) * lerpFactor;
    this.y += (this.targetY - this.y) * lerpFactor;

    // Apply world bounds constraints
    if (this.worldBounds) {
      const bounds = this.getWorldBounds();
      const halfWidth = bounds.width / 2;
      const halfHeight = bounds.height / 2;

      if (this.worldBounds.minX !== undefined) {
        this.x = Math.max(this.x, this.worldBounds.minX + halfWidth);
      }
      if (this.worldBounds.maxX !== undefined) {
        this.x = Math.min(this.x, this.worldBounds.maxX - halfWidth);
      }
      if (this.worldBounds.minY !== undefined) {
        this.y = Math.max(this.y, this.worldBounds.minY + halfHeight);
      }
      if (this.worldBounds.maxY !== undefined) {
        this.y = Math.min(this.y, this.worldBounds.maxY - halfHeight);
      }

      // Update target to match constrained position
      this.targetX = this.x;
      this.targetY = this.y;
    }

    // Handle follow target
    if (this.followTarget) {
      const dx = this.followTarget.x - this.x;
      const dy = this.followTarget.y - this.y;
      const deadZoneX = this.deadZone.width / 2;
      const deadZoneY = this.deadZone.height / 2;

      // Only move if target is outside dead zone
      if (Math.abs(dx) > deadZoneX || Math.abs(dy) > deadZoneY) {
        this.targetX = this.followTarget.x;
        this.targetY = this.followTarget.y;
      }
    }
  }

  /**
   * Set camera position immediately
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Pan camera relative to current position
   */
  pan(dx: number, dy: number): void {
    this.targetX += dx;
    this.targetY += dy;
  }

  /**
   * Set zoom level (clamped between min and max)
   */
  setZoom(level: number): void {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, level));
  }

  /**
   * Get current zoom level
   */
  getZoom(): number {
    return this.zoom;
  }

  /**
   * Zoom in/out by a factor
   */
  zoomBy(factor: number): void {
    this.setZoom(this.zoom * factor);
  }

  /**
   * Get current camera position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Calculate visible world bounds based on camera position and zoom
   */
  getWorldBounds(): { x: number; y: number; width: number; height: number } {
    const width = this.viewportWidth / this.zoom;
    const height = this.viewportHeight / this.zoom;
    return {
      x: this.x - width / 2,
      y: this.y - height / 2,
      width,
      height,
    };
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const bounds = this.getWorldBounds();
    return {
      x: bounds.x + (screenX / this.viewportWidth) * bounds.width,
      y: bounds.y + (screenY / this.viewportHeight) * bounds.height,
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const bounds = this.getWorldBounds();
    return {
      x: ((worldX - bounds.x) / bounds.width) * this.viewportWidth,
      y: ((worldY - bounds.y) / bounds.height) * this.viewportHeight,
    };
  }

  /**
   * Set entity to follow
   */
  followEntity(entity: { x: number; y: number } | null): void {
    this.followTarget = entity;
    if (entity) {
      this.targetX = entity.x;
      this.targetY = entity.y;
    }
  }

  /**
   * Set world bounds for camera constraints
   */
  setWorldBounds(bounds: {
    minX?: number;
    minY?: number;
    maxX?: number;
    maxY?: number;
  } | null): void {
    this.worldBounds = bounds;
  }

  /**
   * Set dead zone size for follow target
   */
  setDeadZone(width: number, height: number): void {
    this.deadZone = { width, height };
  }

  /**
   * Set follow speed (0-1)
   */
  setFollowSpeed(speed: number): void {
    this.followSpeed = Math.max(0, Math.min(1, speed));
  }

  /**
   * Resize viewport
   */
  resize(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  /**
   * Apply camera transform to a PixiJS container
   */
  applyToContainer(container: { position: { set: (x: number, y: number) => void }; scale: { set: (x: number, y: number) => void }; pivot: { set: (x: number, y: number) => void } }): void {
    container.position.set(this.viewportWidth / 2, this.viewportHeight / 2);
    container.scale.set(this.zoom, this.zoom);
    container.pivot.set(this.x, this.y);
  }
}
