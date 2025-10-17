/**
 * CanvasManager - Smart WebGL Context & Canvas Lifecycle Management
 * A Paul Phillips Manifestation
 *
 * Handles proper canvas creation/destruction to avoid WebGL context limits.
 * Destroys active system before initializing new system.
 */

export class CanvasManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container not found: ${containerId}`);
        }

        this.activeSystem = null;
        this.activeCanvases = new Map(); // Track canvases by layer name
        this.activeContexts = new Map(); // Track WebGL contexts

        console.log('🎨 CanvasManager initialized');
    }

    /**
     * Destroy all active canvases and WebGL contexts
     */
    destroyActiveSystem() {
        if (!this.activeSystem) {
            return; // Nothing to destroy
        }

        console.log(`🗑️ Destroying ${this.activeSystem} system...`);

        // Lose all WebGL contexts first (critical for cleanup)
        this.activeContexts.forEach((gl, canvasId) => {
            if (gl) {
                const loseContext = gl.getExtension('WEBGL_lose_context');
                if (loseContext) {
                    loseContext.loseContext();
                    console.log(`  ✓ Lost WebGL context: ${canvasId}`);
                }
            }
        });

        // Clear context tracking
        this.activeContexts.clear();

        // Remove all canvases from DOM
        this.activeCanvases.forEach((canvas, layerId) => {
            if (canvas && canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
                console.log(`  ✓ Removed canvas: ${layerId}`);
            }
        });

        // Clear canvas tracking
        this.activeCanvases.clear();

        // Clear container
        this.container.innerHTML = '';

        console.log(`✅ ${this.activeSystem} system destroyed`);
        this.activeSystem = null;
    }

    /**
     * Get canvas IDs for a specific system (matches reference architecture)
     * Faceted: 'background-canvas', 'shadow-canvas', etc.
     * Quantum: 'quantum-background-canvas', 'quantum-shadow-canvas', etc.
     * Holographic: 'holo-background-canvas', 'holo-shadow-canvas', etc.
     */
    getCanvasIdsForSystem(systemName) {
        const baseIds = ['background-canvas', 'shadow-canvas', 'content-canvas', 'highlight-canvas', 'accent-canvas'];

        switch (systemName) {
            case 'faceted':
                return baseIds; // Direct IDs for faceted
            case 'quantum':
                return baseIds.map(id => `quantum-${id}`);
            case 'holographic':
                return baseIds.map(id => `holo-${id}`);
            default:
                return baseIds;
        }
    }

    /**
     * Create canvases for a new system
     * CRITICAL: Engines find these canvases by ID, not passed as parameters!
     * @param {string} systemName - 'quantum', 'faceted', or 'holographic'
     * @returns {string[]} - Array of canvas IDs created
     */
    createSystemCanvases(systemName) {
        console.log(`🎨 Creating canvases for ${systemName} system...`);

        // Destroy any active system first
        if (this.activeSystem) {
            this.destroyActiveSystem();
        }

        // Get container dimensions
        const rect = this.container.getBoundingClientRect();
        const width = rect.width || window.innerWidth;
        const height = rect.height || window.innerHeight;

        // Create container for this system's layers
        const systemContainer = document.createElement('div');
        systemContainer.id = systemName === 'faceted' ? 'vib34dLayers' : `${systemName}Layers`;
        systemContainer.className = 'system-container';
        systemContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
        `;

        // Get canvas IDs for this system
        const canvasIds = this.getCanvasIdsForSystem(systemName);

        // Create each canvas with specific ID that engines expect
        canvasIds.forEach((canvasId, index) => {
            const canvas = document.createElement('canvas');

            canvas.id = canvasId; // CRITICAL: Exact ID that engine will search for
            canvas.className = 'visualization-canvas layer-canvas';
            canvas.width = width;
            canvas.height = height;
            canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: ${index};
                pointer-events: ${canvasId.includes('content') ? 'auto' : 'none'};
            `;

            systemContainer.appendChild(canvas);
            this.activeCanvases.set(canvasId, canvas);

            console.log(`  ✓ Created canvas: ${canvasId} (${width}x${height})`);
        });

        // Add container to DOM
        this.container.appendChild(systemContainer);

        this.activeSystem = systemName;
        console.log(`✅ ${systemName} canvases ready (engines will find by ID)`);

        return canvasIds; // Return IDs, not canvas objects
    }

    /**
     * Register a WebGL context for tracking (for proper cleanup)
     * @param {string} layerName - Name of the layer this context belongs to
     * @param {WebGLRenderingContext} gl - The WebGL context
     */
    registerContext(layerName, gl) {
        const canvasId = `${this.activeSystem}-${layerName}-canvas`;
        this.activeContexts.set(canvasId, gl);
        console.log(`📋 Registered WebGL context: ${canvasId}`);
    }

    /**
     * Get a canvas by layer name
     * @param {string} layerName - Layer name (e.g., 'content', 'background')
     * @returns {HTMLCanvasElement|null}
     */
    getCanvas(layerName) {
        return this.activeCanvases.get(layerName) || null;
    }

    /**
     * Get all active canvases
     * @returns {Map<string, HTMLCanvasElement>}
     */
    getAllCanvases() {
        return this.activeCanvases;
    }

    /**
     * Resize all active canvases
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resizeCanvases(width, height) {
        this.activeCanvases.forEach((canvas, layerName) => {
            canvas.width = width;
            canvas.height = height;
            console.log(`  ✓ Resized ${layerName}: ${width}x${height}`);
        });
        console.log(`🔄 Resized ${this.activeCanvases.size} canvases to ${width}x${height}`);
    }

    /**
     * Get current active system name
     * @returns {string|null}
     */
    getActiveSystem() {
        return this.activeSystem;
    }

    /**
     * Check if a system is currently active
     * @param {string} systemName
     * @returns {boolean}
     */
    isSystemActive(systemName) {
        return this.activeSystem === systemName;
    }

    /**
     * Complete cleanup - destroy everything
     */
    destroy() {
        this.destroyActiveSystem();
        this.container.innerHTML = '';
        console.log('🗑️ CanvasManager destroyed');
    }
}

/**
 * A Paul Phillips Manifestation
 * "The Revolution Will Not be in a Structured Format"
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */
