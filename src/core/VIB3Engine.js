/**
 * VIB3+ Engine - Unified Visualization System
 * Coordinates Quantum, Faceted, and Holographic systems
 * Supports 24 geometries per system with full 6D rotation
 */

import { ParameterManager } from './Parameters.js';
import { QuantumEngine } from '../quantum/QuantumEngine.js';
import { FacetedSystem } from '../faceted/FacetedSystem.js';
import { RealHolographicSystem } from '../holograms/RealHolographicSystem.js';

export class VIB3Engine {
    constructor() {
        this.systems = {
            quantum: null,
            faceted: null,
            holographic: null
        };

        this.currentSystem = 'quantum';
        this.parameters = new ParameterManager();
        this.initialized = false;
        this.canvasContainer = null;
    }

    /**
     * Initialize the VIB3+ engine
     */
    async initialize(containerId = 'vib3-container') {
        console.log('🌟 Initializing VIB3+ Engine');

        this.canvasContainer = document.getElementById(containerId);
        if (!this.canvasContainer) {
            console.error('❌ Container not found:', containerId);
            return false;
        }

        // Create canvas structure
        this.setupCanvasStructure();

        // Initialize all 3 systems
        await this.initializeSystems();

        this.initialized = true;
        console.log('✅ VIB3+ Engine initialized');
        return true;
    }

    /**
     * Setup canvas structure for all 3 systems
     */
    setupCanvasStructure() {
        this.canvasContainer.innerHTML = '';

        // Quantum container (multi-layer)
        const quantumContainer = this.createSystemContainer('quantum', [
            'background', 'shadow', 'content', 'highlight', 'accent'
        ]);
        this.canvasContainer.appendChild(quantumContainer);

        // Faceted container (single canvas)
        const facetedContainer = this.createSystemContainer('faceted', ['canvas']);
        this.canvasContainer.appendChild(facetedContainer);

        // Holographic container (multi-layer)
        const holographicContainer = this.createSystemContainer('holographic', [
            'background', 'shadow', 'content', 'highlight', 'accent'
        ]);
        this.canvasContainer.appendChild(holographicContainer);

        console.log('✅ Canvas structure created');
    }

    /**
     * Create container for a system
     */
    createSystemContainer(systemName, layers) {
        const container = document.createElement('div');
        container.id = `${systemName}Layers`;
        container.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: ${systemName === this.currentSystem ? 'block' : 'none'};
        `;

        const rect = this.canvasContainer.getBoundingClientRect();
        const width = rect.width || 800;
        const height = rect.height || 600;

        layers.forEach(layer => {
            const canvas = document.createElement('canvas');
            canvas.id = `${systemName}-${layer}-canvas`;
            canvas.width = width;
            canvas.height = height;
            canvas.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            `;
            container.appendChild(canvas);
        });

        return container;
    }

    /**
     * Initialize all visualization systems
     */
    async initializeSystems() {
        console.log('🔧 Initializing visualization systems...');

        // Initialize Quantum Engine
        try {
            this.systems.quantum = new QuantumEngine();
            this.systems.quantum.setActive(false);
            console.log('✅ Quantum Engine ready');
        } catch (error) {
            console.error('❌ Quantum Engine initialization failed:', error);
        }

        // Initialize Faceted System
        try {
            this.systems.faceted = new FacetedSystem();
            this.systems.faceted.initialize();
            this.systems.faceted.setActive(false);
            console.log('✅ Faceted System ready');
        } catch (error) {
            console.error('❌ Faceted System initialization failed:', error);
        }

        // Initialize Holographic System
        try {
            this.systems.holographic = new RealHolographicSystem();
            this.systems.holographic.initialize();
            this.systems.holographic.setActive(false);
            console.log('✅ Holographic System ready');
        } catch (error) {
            console.error('❌ Holographic System initialization failed:', error);
        }

        // Activate default system
        await this.switchSystem(this.currentSystem);
    }

    /**
     * Switch between visualization systems
     */
    async switchSystem(systemName) {
        if (!this.systems[systemName]) {
            console.error('❌ Unknown system:', systemName);
            return false;
        }

        console.log(`🔄 Switching to ${systemName} system`);

        // Deactivate current system
        if (this.systems[this.currentSystem]) {
            this.systems[this.currentSystem].setActive(false);
            const currentContainer = document.getElementById(`${this.currentSystem}Layers`);
            if (currentContainer) {
                currentContainer.style.display = 'none';
            }
        }

        // Activate new system
        this.currentSystem = systemName;
        this.systems[systemName].setActive(true);

        const newContainer = document.getElementById(`${systemName}Layers`);
        if (newContainer) {
            newContainer.style.display = 'block';
        }

        // Apply current parameters to new system
        this.updateCurrentSystemParameters();

        console.log(`✅ ${systemName} system activated`);
        return true;
    }

    /**
     * Update parameters for current system
     */
    updateCurrentSystemParameters() {
        const params = this.parameters.getAllParameters();

        if (this.systems[this.currentSystem]) {
            this.systems[this.currentSystem].updateParameters(params);
        }
    }

    /**
     * Update a single parameter
     */
    setParameter(name, value) {
        this.parameters.setParameter(name, value);
        this.updateCurrentSystemParameters();
    }

    /**
     * Update multiple parameters
     */
    setParameters(params) {
        this.parameters.setParameters(params);
        this.updateCurrentSystemParameters();
    }

    /**
     * Get current parameter value
     */
    getParameter(name) {
        return this.parameters.getParameter(name);
    }

    /**
     * Get all parameters
     */
    getAllParameters() {
        return this.parameters.getAllParameters();
    }

    /**
     * Randomize all parameters
     */
    randomizeAll() {
        this.parameters.randomizeAll();
        this.updateCurrentSystemParameters();
    }

    /**
     * Reset to defaults
     */
    resetAll() {
        this.parameters.resetToDefaults();
        this.updateCurrentSystemParameters();
    }

    /**
     * Get current system name
     */
    getCurrentSystem() {
        return this.currentSystem;
    }

    /**
     * Get system instance
     */
    getSystem(systemName) {
        return this.systems[systemName];
    }

    /**
     * Get geometry names for current system
     */
    getGeometryNames() {
        // All systems support 24 geometries
        return [
            // Base geometries (0-7)
            'Tetrahedron',
            'Hypercube',
            'Sphere',
            'Torus',
            'Klein Bottle',
            'Fractal',
            'Wave',
            'Crystal',
            // Hypersphere Core (8-15)
            '🌀 Hypersphere Core (Tetrahedron)',
            '🌀 Hypersphere Core (Hypercube)',
            '🌀 Hypersphere Core (Sphere)',
            '🌀 Hypersphere Core (Torus)',
            '🌀 Hypersphere Core (Klein)',
            '🌀 Hypersphere Core (Fractal)',
            '🌀 Hypersphere Core (Wave)',
            '🌀 Hypersphere Core (Crystal)',
            // Hypertetrahedron Core (16-23)
            '🔺 Hypertetrahedron Core (Tetrahedron)',
            '🔺 Hypertetrahedron Core (Hypercube)',
            '🔺 Hypertetrahedron Core (Sphere)',
            '🔺 Hypertetrahedron Core (Torus)',
            '🔺 Hypertetrahedron Core (Klein)',
            '🔺 Hypertetrahedron Core (Fractal)',
            '🔺 Hypertetrahedron Core (Wave)',
            '🔺 Hypertetrahedron Core (Crystal)'
        ];
    }

    /**
     * Export current state
     */
    exportState() {
        return {
            system: this.currentSystem,
            parameters: this.parameters.getAllParameters(),
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * Import state
     */
    importState(state) {
        if (state.system) {
            this.switchSystem(state.system);
        }
        if (state.parameters) {
            this.parameters.setParameters(state.parameters);
            this.updateCurrentSystemParameters();
        }
    }

    /**
     * Destroy engine and clean up
     */
    destroy() {
        Object.values(this.systems).forEach(system => {
            if (system && system.destroy) {
                system.destroy();
            }
        });
        this.systems = {};
        this.initialized = false;
        console.log('🗑️ VIB3+ Engine destroyed');
    }
}
