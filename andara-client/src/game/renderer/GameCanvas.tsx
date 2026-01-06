import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { WorldRenderer } from './WorldRenderer';
import { Camera } from './Camera';
import './GameCanvas.css';

interface GameCanvasProps {
  onRendererReady?: (renderer: WorldRenderer) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onRendererReady }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WorldRenderer | null>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  // Store callback in ref to avoid dependency issues
  const onRendererReadyRef = useRef(onRendererReady);
  // Track if component is mounted to prevent async callbacks after cleanup
  const isMountedRef = useRef(true);

  // Update callback ref when it changes
  useEffect(() => {
    onRendererReadyRef.current = onRendererReady;
  }, [onRendererReady]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Mark as mounted
    isMountedRef.current = true;

    // Initialize PixiJS Application
    const app = new PIXI.Application();
    appRef.current = app;

    app.init({
      width,
      height,
      backgroundColor: 0x0a0e14, // Deep Void from style guide
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    }).then(() => {
      // Check if component is still mounted and container is still in DOM before proceeding
      if (!isMountedRef.current || !container || !container.isConnected || !app.canvas) {
        // Component was unmounted or container detached, clean up
        app.destroy(true, { children: true, texture: true });
        return;
      }

      // Append canvas to container
      container.appendChild(app.canvas);

      // Initialize renderer
      const renderer = new WorldRenderer(app);
      rendererRef.current = renderer;

      // Initialize camera and set it on the renderer
      const camera = new Camera(width, height);
      renderer.setCamera(camera);

      // Notify parent component (use ref to get latest callback)
      if (onRendererReadyRef.current) {
        onRendererReadyRef.current(renderer);
      }
    }).catch((error: unknown) => {
      // Only log error if component is still mounted
      if (isMountedRef.current) {
        console.error('Failed to initialize PixiJS:', error);
      }
      // Clean up the failed app instance to prevent resource leaks
      if (appRef.current) {
        try {
          appRef.current.destroy(true, { children: true, texture: true });
        } catch (destroyError) {
          // Ignore errors during cleanup
          console.warn('Error during PixiJS app cleanup:', destroyError);
        }
        appRef.current = null;
      }
    });

    // Handle resize
    const handleResize = () => {
      if (isMountedRef.current && container && app.canvas) {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        app.renderer.resize(newWidth, newHeight);
        rendererRef.current?.handleResize(newWidth, newHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      // Mark as unmounted to prevent async callbacks
      isMountedRef.current = false;

      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  return <div ref={canvasRef} className="game-canvas" />;
};
