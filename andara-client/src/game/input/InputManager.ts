import { Camera } from '../renderer/Camera';

/**
 * InputManager handles user input for camera controls
 */
export class InputManager {
  private camera: Camera;
  private canvas: HTMLElement;
  private isDragging: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;
  private panSpeed: number = 10;
  private zoomSpeed: number = 0.1;
  private keyStates: Set<string> = new Set();
  private doubleClickTimer: number | null = null;
  private onDoubleClickCallback?: (x: number, y: number) => void;
  private contextMenuHandler?: (e: Event) => void;
  
  // Store bound handlers to ensure same reference for add/removeEventListener
  private boundHandlers: {
    handleWheel: (e: WheelEvent) => void;
    handleMouseDown: (e: MouseEvent) => void;
    handleMouseMove: (e: MouseEvent) => void;
    handleMouseUp: (e: MouseEvent) => void;
    handleMouseLeave: () => void;
    handleClick: (e: MouseEvent) => void;
    handleKeyDown: (e: KeyboardEvent) => void;
    handleKeyUp: (e: KeyboardEvent) => void;
  };

  constructor(camera: Camera, canvas: HTMLElement) {
    this.camera = camera;
    this.canvas = canvas;
    
    // Bind handlers once to ensure same reference for add/removeEventListener
    this.boundHandlers = {
      handleWheel: this.handleWheel.bind(this),
      handleMouseDown: this.handleMouseDown.bind(this),
      handleMouseMove: this.handleMouseMove.bind(this),
      handleMouseUp: this.handleMouseUp.bind(this),
      handleMouseLeave: this.handleMouseLeave.bind(this),
      handleClick: this.handleClick.bind(this),
      handleKeyDown: this.handleKeyDown.bind(this),
      handleKeyUp: this.handleKeyUp.bind(this),
    };
    
    this.setupEventListeners();
  }

  /**
   * Set callback for double-click events
   */
  onDoubleClick(callback: (x: number, y: number) => void): void {
    this.onDoubleClickCallback = callback;
  }

  /**
   * Set pan speed
   */
  setPanSpeed(speed: number): void {
    this.panSpeed = speed;
  }

  /**
   * Set zoom speed
   */
  setZoomSpeed(speed: number): void {
    this.zoomSpeed = speed;
  }

  /**
   * Setup all event listeners
   */
  private setupEventListeners(): void {
    // Mouse wheel zoom
    this.canvas.addEventListener('wheel', this.boundHandlers.handleWheel, { passive: false });

    // Mouse drag (middle button)
    // mousedown and mousemove on canvas, but mouseup on window to capture releases outside canvas
    this.canvas.addEventListener('mousedown', this.boundHandlers.handleMouseDown);
    this.canvas.addEventListener('mousemove', this.boundHandlers.handleMouseMove);
    window.addEventListener('mouseup', this.boundHandlers.handleMouseUp); // Fixed: attach to window
    this.canvas.addEventListener('mouseleave', this.boundHandlers.handleMouseLeave);

    // Double-click to recenter
    this.canvas.addEventListener('click', this.boundHandlers.handleClick);

    // Arrow key panning
    window.addEventListener('keydown', this.boundHandlers.handleKeyDown);
    window.addEventListener('keyup', this.boundHandlers.handleKeyUp);

    // Prevent context menu on right click (optional)
    this.contextMenuHandler = (e: Event) => {
      e.preventDefault();
    };
    this.canvas.addEventListener('contextmenu', this.contextMenuHandler);
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.canvas.removeEventListener('wheel', this.boundHandlers.handleWheel);
    this.canvas.removeEventListener('mousedown', this.boundHandlers.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.boundHandlers.handleMouseMove);
    window.removeEventListener('mouseup', this.boundHandlers.handleMouseUp); // Fixed: remove from window
    this.canvas.removeEventListener('mouseleave', this.boundHandlers.handleMouseLeave);
    this.canvas.removeEventListener('click', this.boundHandlers.handleClick);
    if (this.contextMenuHandler) {
      this.canvas.removeEventListener('contextmenu', this.contextMenuHandler);
    }
    window.removeEventListener('keydown', this.boundHandlers.handleKeyDown);
    window.removeEventListener('keyup', this.boundHandlers.handleKeyUp);
  }

  /**
   * Handle mouse wheel for zooming
   */
  private handleWheel(e: WheelEvent): void {
    e.preventDefault();

    const zoomDelta = e.deltaY > 0 ? 1 - this.zoomSpeed : 1 + this.zoomSpeed;
    const newZoom = this.camera.getZoom() * zoomDelta;

    // Zoom towards mouse position
    const worldPos = this.camera.screenToWorld(e.offsetX, e.offsetY);
    this.camera.setZoom(newZoom);

    // Adjust camera position to keep world position under cursor
    const newWorldPos = this.camera.screenToWorld(e.offsetX, e.offsetY);
    const dx = worldPos.x - newWorldPos.x;
    const dy = worldPos.y - newWorldPos.y;
    this.camera.pan(dx, dy);
  };

  /**
   * Handle mouse down
   */
  private handleMouseDown(e: MouseEvent): void {
    if (e.button === 1) {
      // Middle button
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      e.preventDefault();
    }
  };

  /**
   * Handle mouse move
   */
  private handleMouseMove(e: MouseEvent): void {
    if (this.isDragging) {
      const dx = (e.clientX - this.lastX) / this.camera.getZoom();
      const dy = (e.clientY - this.lastY) / this.camera.getZoom();
      this.camera.pan(-dx, -dy);
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    }
  };

  /**
   * Handle mouse up
   */
  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 1) {
      this.isDragging = false;
    }
  };

  /**
   * Handle mouse leave
   */
  private handleMouseLeave(): void {
    this.isDragging = false;
  };

  /**
   * Handle click (for double-click detection)
   */
  private handleClick(e: MouseEvent): void {
    if (e.button === 0) {
      // Left button
      if (this.doubleClickTimer) {
        // Double click detected
        clearTimeout(this.doubleClickTimer);
        this.doubleClickTimer = null;

        if (this.onDoubleClickCallback) {
          const worldPos = this.camera.screenToWorld(e.offsetX, e.offsetY);
          this.onDoubleClickCallback(worldPos.x, worldPos.y);
        }
      } else {
        // Start double-click timer
        this.doubleClickTimer = window.setTimeout(() => {
          this.doubleClickTimer = null;
        }, 300);
      }
    }
  };

  /**
   * Handle key down
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.keyStates.has(e.key)) {
      this.keyStates.add(e.key);
      this.updatePanFromKeys();
    }
  };

  /**
   * Handle key up
   */
  private handleKeyUp(e: KeyboardEvent): void {
    this.keyStates.delete(e.key);
  };

  /**
   * Update camera pan based on pressed keys
   */
  private updatePanFromKeys(): void {
    // This will be called continuously via requestAnimationFrame or game loop
    // For now, we'll handle it in the game loop
  }

  /**
   * Update input (called from game loop)
   * Note: deltaTime is already normalized to 60 FPS by the caller
   */
  update(deltaTime: number): void {
    // Handle continuous key presses
    // deltaTime is already normalized, so use it directly without multiplying by 60
    if (this.keyStates.has('ArrowLeft')) {
      this.camera.pan(-this.panSpeed * deltaTime, 0);
    }
    if (this.keyStates.has('ArrowRight')) {
      this.camera.pan(this.panSpeed * deltaTime, 0);
    }
    if (this.keyStates.has('ArrowUp')) {
      this.camera.pan(0, -this.panSpeed * deltaTime);
    }
    if (this.keyStates.has('ArrowDown')) {
      this.camera.pan(0, this.panSpeed * deltaTime);
    }
  }
}
