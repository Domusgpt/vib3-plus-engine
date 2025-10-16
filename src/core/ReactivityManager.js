/**
 * VIB3+ Modular Reactivity Manager
 * Handles mouse/click/scroll reactivity for 3 systems (Quantum, Faceted, Holographic)
 * Adapted from VIB34D reference system
 */

export class ReactivityManager {
    constructor() {
        console.log('⚡ Initializing VIB3+ Reactivity Manager');

        // Global reactivity state
        this.enabled = true;

        // Individual category toggles
        this.mouseEnabled = true;
        this.clickEnabled = true;
        this.scrollEnabled = true;

        // Current active system
        this.activeSystem = null;
        this.activeSystemName = 'quantum';

        // Mode objects
        this.mouseModes = {};
        this.clickModes = {};
        this.scrollModes = {};

        // Current selected modes
        this.currentMouseMode = 'rotations';
        this.currentClickMode = 'ripple';
        this.currentScrollMode = 'cycle';

        // Initialize modes
        setTimeout(() => this.initializeModes(), 0);

        this.setupGlobalListeners();
    }

    /**
     * Initialize mode instances
     */
    initializeModes() {
        try {
            this.mouseModes = {
                'rotations': new RotationMode(),      // Faceted/Quantum style
                'velocity': new VelocityMode(),       // Quantum style
                'distance': new DistanceMode(),       // Holographic style
                'mixed': new MixedMouseMode()         // Mixed mode
            };

            this.clickModes = {
                'burst': new BurstMode(),             // Visual burst
                'blast': new BlastMode(),             // Parameter blast
                'ripple': new RippleMode(),           // Morph ripple
                'mixed': new MixedClickMode()         // Mixed effects
            };

            this.scrollModes = {
                'cycle': new CycleMode(),             // Density/hue cycling
                'wave': new WaveMode(),               // Morph waves
                'sweep': new SweepMode(),             // Parameter sweeping
                'mixed': new MixedScrollMode()        // Mixed scroll
            };

            console.log('⚡ ReactivityManager modes initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize ReactivityManager modes:', error);
        }
    }

    /**
     * Set the active system
     */
    setActiveSystem(systemName, systemInstance) {
        console.log(`⚡ Reactivity switching to: ${systemName}`);
        this.activeSystemName = systemName;
        this.activeSystem = systemInstance;

        this.autoSelectDefaults(systemName);
    }

    /**
     * Auto-select appropriate modes for each system
     */
    autoSelectDefaults(systemName) {
        const defaults = {
            'faceted': { mouse: 'rotations', click: 'ripple', scroll: 'cycle' },
            'quantum': { mouse: 'velocity', click: 'blast', scroll: 'wave' },
            'holographic': { mouse: 'distance', click: 'burst', scroll: 'sweep' }
        };

        if (defaults[systemName]) {
            this.currentMouseMode = defaults[systemName].mouse;
            this.currentClickMode = defaults[systemName].click;
            this.currentScrollMode = defaults[systemName].scroll;

            console.log(`⚡ Auto-selected modes for ${systemName}: ${this.currentMouseMode}, ${this.currentClickMode}, ${this.currentScrollMode}`);
        }
    }

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        console.log('⚡ Setting up global reactivity listeners');

        document.addEventListener('mousemove', (e) => this.handleGlobalMouseMove(e));
        document.addEventListener('click', (e) => this.handleGlobalClick(e));
        document.addEventListener('touchmove', (e) => this.handleGlobalTouchMove(e));
        document.addEventListener('touchend', (e) => this.handleGlobalTouchEnd(e));
        document.addEventListener('wheel', (e) => this.handleGlobalWheel(e), { passive: false });
    }

    /**
     * Global mouse move handler
     */
    handleGlobalMouseMove(e) {
        if (!this.enabled || !this.mouseEnabled || !this.isCanvasEvent(e)) return;

        const coords = this.getEventCoords(e);
        if (!coords) return;

        const mode = this.mouseModes && this.mouseModes[this.currentMouseMode];
        if (mode && mode.handleMouseMove) {
            mode.handleMouseMove(coords.x, coords.y, this.updateParameter.bind(this));
        }
    }

    /**
     * Global click handler
     */
    handleGlobalClick(e) {
        if (!this.enabled || !this.clickEnabled || !this.isCanvasEvent(e)) return;

        const coords = this.getEventCoords(e);
        if (!coords) return;

        const mode = this.clickModes && this.clickModes[this.currentClickMode];
        if (mode && mode.handleClick) {
            mode.handleClick(coords.x, coords.y, this.updateParameter.bind(this));
        }
    }

    /**
     * Global wheel handler
     */
    handleGlobalWheel(e) {
        if (!this.enabled || !this.scrollEnabled || !this.isCanvasEvent(e)) return;

        e.preventDefault();

        const mode = this.scrollModes && this.scrollModes[this.currentScrollMode];
        if (mode && mode.handleWheel) {
            mode.handleWheel(e.deltaY, this.updateParameter.bind(this));
        }
    }

    /**
     * Check if event happened on a canvas element
     */
    isCanvasEvent(e) {
        const target = e.target;
        return target.tagName === 'CANVAS' || target.closest('.canvas-container');
    }

    /**
     * Get normalized coordinates from event
     */
    getEventCoords(e) {
        const target = e.target.tagName === 'CANVAS' ? e.target : e.target.closest('.canvas-container')?.querySelector('canvas');
        if (!target) return null;

        const rect = target.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        return { x, y };
    }

    /**
     * Handle touch events
     */
    handleGlobalTouchMove(e) {
        if (!this.enabled || !this.mouseEnabled || e.touches.length === 0) return;

        e.preventDefault();
        const touch = e.touches[0];
        const coords = this.getEventCoords({ ...e, clientX: touch.clientX, clientY: touch.clientY });
        if (!coords) return;

        const mode = this.mouseModes && this.mouseModes[this.currentMouseMode];
        if (mode && mode.handleMouseMove) {
            mode.handleMouseMove(coords.x, coords.y, this.updateParameter.bind(this));
        }
    }

    handleGlobalTouchEnd(e) {
        if (!this.enabled || !this.clickEnabled || e.changedTouches.length === 0) return;

        const touch = e.changedTouches[0];
        const coords = this.getEventCoords({ ...e, clientX: touch.clientX, clientY: touch.clientY });
        if (!coords) return;

        const mode = this.clickModes && this.clickModes[this.currentClickMode];
        if (mode && mode.handleClick) {
            mode.handleClick(coords.x, coords.y, this.updateParameter.bind(this));
        }
    }

    /**
     * Update parameter on active system
     */
    updateParameter(param, value) {
        if (window.vib3Engine) {
            window.vib3Engine.setParameter(param, value);
        }

        console.log(`⚡ ${this.activeSystemName} reactivity: ${param} = ${value}`);
    }

    /**
     * Toggle methods for UI
     */
    toggleMouse(enabled) {
        this.mouseEnabled = enabled;
        console.log(`⚡ Mouse reactivity: ${enabled ? 'ON' : 'OFF'}`);
    }

    toggleClick(enabled) {
        this.clickEnabled = enabled;
        console.log(`⚡ Click reactivity: ${enabled ? 'ON' : 'OFF'}`);
    }

    toggleScroll(enabled) {
        this.scrollEnabled = enabled;
        console.log(`⚡ Scroll reactivity: ${enabled ? 'ON' : 'OFF'}`);
    }

    /**
     * Mode selection methods for UI
     */
    setMouseMode(mode) {
        if (this.mouseModes && this.mouseModes[mode]) {
            this.currentMouseMode = mode;
            console.log(`⚡ Mouse mode: ${mode}`);
        }
    }

    setClickMode(mode) {
        if (this.clickModes && this.clickModes[mode]) {
            this.currentClickMode = mode;
            console.log(`⚡ Click mode: ${mode}`);
        }
    }

    setScrollMode(mode) {
        if (this.scrollModes && this.scrollModes[mode]) {
            this.currentScrollMode = mode;
            console.log(`⚡ Scroll mode: ${mode}`);
        }
    }

    /**
     * Global enable/disable
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`⚡ Global reactivity: ${enabled ? 'ON' : 'OFF'}`);
    }
}

/**
 * MOUSE MODE CLASSES
 */

class RotationMode {
    constructor() {
        this.scrollHue = 200;
    }

    handleMouseMove(x, y, updateParam) {
        const rotationRange = 6.28 * 2;
        const rot4dXY = (x - 0.5) * rotationRange * 0.5;
        const rot4dXZ = (y - 0.5) * rotationRange * 0.3;
        const rot4dYZ = ((x + y) / 2 - 0.5) * rotationRange * 0.2;
        const rot4dXW = (x - 0.5) * rotationRange;
        const rot4dYW = (x - 0.5) * rotationRange * 0.7;
        const rot4dZW = (y - 0.5) * rotationRange;

        const hueOffset = (x - 0.5) * 30;
        const mouseHue = (this.scrollHue + hueOffset) % 360;

        updateParam('rot4dXY', rot4dXY.toFixed(2));
        updateParam('rot4dXZ', rot4dXZ.toFixed(2));
        updateParam('rot4dYZ', rot4dYZ.toFixed(2));
        updateParam('rot4dXW', rot4dXW.toFixed(2));
        updateParam('rot4dYW', rot4dYW.toFixed(2));
        updateParam('rot4dZW', rot4dZW.toFixed(2));
        updateParam('hue', Math.round(mouseHue));
    }
}

class VelocityMode {
    constructor() {
        this.lastPosition = { x: 0.5, y: 0.5 };
        this.velocityHistory = [];
    }

    handleMouseMove(x, y, updateParam) {
        const deltaX = x - this.lastPosition.x;
        const deltaY = y - this.lastPosition.y;
        const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        this.velocityHistory.push(velocity);
        if (this.velocityHistory.length > 5) {
            this.velocityHistory.shift();
        }

        const avgVelocity = this.velocityHistory.reduce((sum, v) => sum + v, 0) / this.velocityHistory.length;

        const chaos = Math.min(1.0, avgVelocity * 30);
        const speed = 0.5 + Math.min(2.5, avgVelocity * 15);
        const gridDensity = 10 + (y * 90);
        const intensity = 0.4 + (x * 0.6);
        const hue = (280 + avgVelocity * 80) % 360;

        updateParam('chaos', chaos.toFixed(2));
        updateParam('speed', speed.toFixed(2));
        updateParam('gridDensity', Math.round(gridDensity));
        updateParam('intensity', intensity.toFixed(2));
        updateParam('hue', Math.round(hue));

        this.lastPosition = { x, y };
    }
}

class DistanceMode {
    handleMouseMove(x, y, updateParam) {
        const centerX = 0.5, centerY = 0.5;
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const normalizedDistance = Math.min(distanceFromCenter / 0.707, 1.0);

        const gridDensity = 5 + (95 * normalizedDistance);
        const intensity = 0.2 + (0.8 * (1.0 - normalizedDistance));
        const saturation = 0.4 + (0.6 * (1.0 - normalizedDistance));
        const hue = (320 + normalizedDistance * 40) % 360;

        updateParam('gridDensity', Math.round(gridDensity));
        updateParam('intensity', intensity.toFixed(2));
        updateParam('saturation', saturation.toFixed(2));
        updateParam('hue', Math.round(hue));
    }
}

class MixedMouseMode {
    constructor() {
        this.scrollHue = 240;
    }

    handleMouseMove(x, y, updateParam) {
        const rotationRange = 6.28 * 1.5;
        const rot4dXW = (x - 0.5) * rotationRange;
        const rot4dYW = (x - 0.5) * rotationRange * 0.7;
        const rot4dZW = (y - 0.5) * rotationRange;

        const centerX = 0.5, centerY = 0.5;
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const normalizedDistance = Math.min(distanceFromCenter / 0.707, 1.0);

        const gridDensity = 15 + (70 * normalizedDistance);
        const intensity = 0.3 + (0.7 * (1.0 - normalizedDistance));
        const hue = (300 + normalizedDistance * 60) % 360;

        updateParam('rot4dXW', rot4dXW.toFixed(2));
        updateParam('rot4dYW', rot4dYW.toFixed(2));
        updateParam('rot4dZW', rot4dZW.toFixed(2));
        updateParam('gridDensity', Math.round(gridDensity));
        updateParam('intensity', intensity.toFixed(2));
        updateParam('hue', Math.round(hue));
    }
}

/**
 * CLICK MODE CLASSES
 */

class BurstMode {
    constructor() {
        this.isAnimating = false;
        this.effects = {};
    }

    handleClick(x, y, updateParam) {
        this.effects = {
            chaosBoost: 0.8,
            speedBoost: 1.5
        };

        if (!this.isAnimating) {
            this.startAnimation(updateParam);
        }
    }

    startAnimation(updateParam) {
        this.isAnimating = true;

        const animate = () => {
            let hasEffects = false;

            if (this.effects.chaosBoost > 0.01) {
                hasEffects = true;
                updateParam('chaos', (0.2 + this.effects.chaosBoost).toFixed(2));
                this.effects.chaosBoost *= 0.92;
            }

            if (this.effects.speedBoost > 0.01) {
                hasEffects = true;
                updateParam('speed', (1.0 + this.effects.speedBoost).toFixed(2));
                this.effects.speedBoost *= 0.91;
            }

            if (hasEffects) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };

        animate();
    }
}

class BlastMode {
    constructor() {
        this.isAnimating = false;
        this.effects = {};
    }

    handleClick(x, y, updateParam) {
        this.effects = {
            chaosBlast: 0.7,
            speedWave: 2.0,
            hueShift: 60
        };

        if (!this.isAnimating) {
            this.startAnimation(updateParam);
        }
    }

    startAnimation(updateParam) {
        this.isAnimating = true;

        const animate = () => {
            let hasEffects = false;

            Object.keys(this.effects).forEach(key => {
                if (this.effects[key] > 0.01) {
                    hasEffects = true;

                    switch (key) {
                        case 'chaosBlast':
                            updateParam('chaos', Math.min(1.0, 0.3 + this.effects[key]).toFixed(2));
                            this.effects[key] *= 0.88;
                            break;
                        case 'speedWave':
                            updateParam('speed', Math.min(3.0, 1.0 + this.effects[key]).toFixed(2));
                            this.effects[key] *= 0.89;
                            break;
                        case 'hueShift':
                            updateParam('hue', Math.round((280 + this.effects[key]) % 360));
                            this.effects[key] *= 0.90;
                            break;
                    }
                }
            });

            if (hasEffects) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };

        animate();
    }
}

class RippleMode {
    constructor() {
        this.morphIntensity = 0;
        this.baseMorph = 1.0;
        this.isAnimating = false;
    }

    handleClick(x, y, updateParam) {
        const centerX = 0.5, centerY = 0.5;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const normalizedDistance = Math.min(distance / 0.707, 1.0);

        this.morphIntensity = 0.1 + (0.2 * (1.0 - normalizedDistance));

        if (!this.isAnimating) {
            this.startAnimation(updateParam);
        }
    }

    startAnimation(updateParam) {
        this.isAnimating = true;

        const animate = () => {
            if (this.morphIntensity > 0.01) {
                const currentMorph = this.baseMorph + this.morphIntensity;
                updateParam('morphFactor', currentMorph.toFixed(2));
                this.morphIntensity *= 0.9;
                requestAnimationFrame(animate);
            } else {
                updateParam('morphFactor', this.baseMorph.toFixed(2));
                this.isAnimating = false;
            }
        };

        animate();
    }
}

class MixedClickMode {
    constructor() {
        this.effects = {};
        this.isAnimating = false;
    }

    handleClick(x, y, updateParam) {
        const centerX = 0.5, centerY = 0.5;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const normalizedDistance = Math.min(distance / 0.707, 1.0);

        this.effects = {
            chaosBoost: 0.6,
            speedBoost: 1.3,
            hueShift: 45,
            morphIntensity: 0.15 + (0.15 * (1.0 - normalizedDistance))
        };

        if (!this.isAnimating) {
            this.startAnimation(updateParam);
        }
    }

    startAnimation(updateParam) {
        this.isAnimating = true;

        let frame = 0;
        const animate = () => {
            frame++;
            const progress = frame / 30;
            const decay = Math.exp(-progress * 3);

            if (progress < 1.0) {
                const currentChaos = 0.2 + (this.effects.chaosBoost * decay);
                const currentSpeed = 1.0 + (this.effects.speedBoost * decay);
                const currentMorph = this.effects.morphIntensity * decay;
                const currentHue = (240 + this.effects.hueShift * Math.sin(progress * Math.PI * 4)) % 360;

                updateParam('chaos', currentChaos.toFixed(2));
                updateParam('speed', currentSpeed.toFixed(2));
                updateParam('morphFactor', currentMorph.toFixed(2));
                updateParam('hue', Math.round(currentHue));

                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
            }
        };

        requestAnimationFrame(animate);
    }
}

/**
 * SCROLL MODE CLASSES
 */

class CycleMode {
    constructor() {
        this.scrollDensity = 15;
        this.scrollHue = 200;
    }

    handleWheel(deltaY, updateParam) {
        const direction = deltaY > 0 ? 1 : -1;

        this.scrollDensity += direction * 0.8;
        this.scrollDensity = Math.max(5, Math.min(100, this.scrollDensity));

        this.scrollHue += direction * 3;
        this.scrollHue = ((this.scrollHue % 360) + 360) % 360;

        updateParam('gridDensity', Math.round(this.scrollDensity));
        updateParam('hue', Math.round(this.scrollHue));
    }
}

class WaveMode {
    constructor() {
        this.scrollMorph = 1.0;
    }

    handleWheel(deltaY, updateParam) {
        const direction = deltaY > 0 ? 1 : -1;

        this.scrollMorph += direction * 0.02;
        this.scrollMorph = Math.max(0.2, Math.min(2.0, this.scrollMorph));

        updateParam('morphFactor', this.scrollMorph.toFixed(2));
    }
}

class SweepMode {
    constructor() {
        this.sweepParameter = 0;
        this.sweepValues = [200, 0.5, 0.8, 0.2, 1.0];
    }

    handleWheel(deltaY, updateParam) {
        const direction = deltaY > 0 ? 1 : -1;
        const params = ['hue', 'intensity', 'saturation', 'chaos', 'speed'];
        const ranges = [
            [0, 360],
            [0.1, 1.0],
            [0.1, 1.0],
            [0, 1.0],
            [0.1, 3.0]
        ];

        const currentParam = this.sweepParameter;
        const [min, max] = ranges[currentParam];
        const step = (max - min) * 0.02;

        this.sweepValues[currentParam] += direction * step;
        this.sweepValues[currentParam] = Math.max(min, Math.min(max, this.sweepValues[currentParam]));

        updateParam(params[currentParam], this.sweepValues[currentParam].toFixed(2));

        if (Math.random() < 0.1) {
            this.sweepParameter = (this.sweepParameter + 1) % params.length;
        }
    }
}

class MixedScrollMode {
    constructor() {
        this.cycleGeometry = 0;
        this.waveValues = { chaos: 0.5, speed: 1.0 };
        this.sweepValues = [240, 0.5, 0.5, 0.5, 1.0];
        this.sweepParameter = 0;
    }

    handleWheel(deltaY, updateParam) {
        const direction = deltaY > 0 ? 1 : -1;

        if (Math.random() < 0.3) {
            this.cycleGeometry = (this.cycleGeometry + direction + 24) % 24;
            updateParam('geometry', this.cycleGeometry);
        }

        if (Math.random() < 0.4) {
            this.waveValues.chaos += direction * 0.05;
            this.waveValues.speed += direction * 0.1;

            this.waveValues.chaos = Math.max(0, Math.min(1, this.waveValues.chaos));
            this.waveValues.speed = Math.max(0.1, Math.min(3, this.waveValues.speed));

            updateParam('chaos', this.waveValues.chaos.toFixed(2));
            updateParam('speed', this.waveValues.speed.toFixed(2));
        }

        if (Math.random() < 0.5) {
            const params = ['hue', 'intensity', 'saturation', 'gridDensity', 'morphFactor'];
            const ranges = [
                [0, 360],
                [0.1, 1.0],
                [0.1, 1.0],
                [10, 90],
                [0, 1.5]
            ];

            const currentParam = this.sweepParameter;
            const [min, max] = ranges[currentParam];
            const step = (max - min) * 0.03;

            this.sweepValues[currentParam] += direction * step;
            this.sweepValues[currentParam] = Math.max(min, Math.min(max, this.sweepValues[currentParam]));

            updateParam(params[currentParam], this.sweepValues[currentParam].toFixed(2));

            if (Math.random() < 0.15) {
                this.sweepParameter = (this.sweepParameter + 1) % params.length;
            }
        }
    }
}
