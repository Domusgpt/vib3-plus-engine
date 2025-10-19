/**
 * VIB34D Audio Engine Module
 * Mobile-safe audio reactivity system with global window integration
 * Extracted from monolithic index.html for clean architecture
 */

// Global audio state flags - CRITICAL for system integration
window.audioEnabled = false; // Global audio flag (will auto-enable on interaction)

/**
 * Provides real-time audio analysis for all visualization systems.
 * This class is mobile-safe and integrates with the global window object.
 */
export class SimpleAudioEngine {
    /**
     * Initializes the audio engine with default values.
     */
    constructor() {
        this.context = null;
        this.analyser = null;
        this.dataArray = null;
        this.isActive = false;
        
        // Mobile-safe: Initialize with defaults
        window.audioReactive = {
            bass: 0,
            mid: 0, 
            high: 0,
            energy: 0
        };
        
        console.log('🎵 Audio Engine: Initialized with default values');
    }
    
    /**
     * Initializes the audio context and starts processing audio data.
     * @returns {Promise<boolean>} A promise that resolves to true if audio is successfully initialized, and false otherwise.
     */
    async init() {
        if (this.isActive) return true;
        
        try {
            console.log('🎵 Simple Audio Engine: Starting...');
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }
            
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            
            const source = this.context.createMediaStreamSource(stream);
            source.connect(this.analyser);
            
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.isActive = true;
            
            // CRITICAL FIX: Enable global audio flag so visualizers will use the data
            window.audioEnabled = true;
            
            this.startProcessing();
            console.log('✅ Audio Engine: Active - window.audioEnabled = true');
            return true;
            
        } catch (error) {
            console.log('⚠️ Audio denied - silent mode');
            window.audioEnabled = false; // Keep audio disabled if permission denied
            return false;
        }
    }
    
    /**
     * Starts processing audio data and calculating audio reactive values.
     */
    startProcessing() {
        const process = () => {
            if (!this.isActive || !this.analyser) {
                requestAnimationFrame(process);
                return;
            }
            
            this.analyser.getByteFrequencyData(this.dataArray);
            
            // Simple frequency analysis
            const len = this.dataArray.length;
            const bassRange = Math.floor(len * 0.1);
            const midRange = Math.floor(len * 0.3);
            
            let bass = 0, mid = 0, high = 0;
            
            for (let i = 0; i < bassRange; i++) bass += this.dataArray[i];
            for (let i = bassRange; i < midRange; i++) mid += this.dataArray[i];
            for (let i = midRange; i < len; i++) high += this.dataArray[i];
            
            bass = (bass / bassRange) / 255;
            mid = (mid / (midRange - bassRange)) / 255;
            high = (high / (len - midRange)) / 255;
            
            const smoothing = 0.7;
            window.audioReactive.bass = bass * smoothing + window.audioReactive.bass * (1 - smoothing);
            window.audioReactive.mid = mid * smoothing + window.audioReactive.mid * (1 - smoothing);
            window.audioReactive.high = high * smoothing + window.audioReactive.high * (1 - smoothing);
            window.audioReactive.energy = (window.audioReactive.bass + window.audioReactive.mid + window.audioReactive.high) / 3;
            
            // Debug logging every 5 seconds to verify audio processing
            if (Date.now() % 5000 < 16) {
                console.log(`🎵 Audio levels: Bass=${window.audioReactive.bass.toFixed(2)} Mid=${window.audioReactive.mid.toFixed(2)} High=${window.audioReactive.high.toFixed(2)} Energy=${window.audioReactive.energy.toFixed(2)}`);
            }
            
            requestAnimationFrame(process);
        };
        
        process();
    }
    
    /**
     * Checks if audio is currently active and processing.
     * @returns {boolean} True if audio is active, false otherwise.
     */
    isAudioActive() {
        return this.isActive && window.audioEnabled;
    }
    
    /**
     * Gets the current audio reactive values.
     * @returns {object} An object containing the current bass, mid, high, and energy values.
     */
    getAudioLevels() {
        return window.audioReactive;
    }
    
    /**
     * Stops audio processing and cleans up resources.
     */
    stop() {
        this.isActive = false;
        window.audioEnabled = false;
        
        if (this.context) {
            this.context.close();
            this.context = null;
        }
        
        console.log('🎵 Audio Engine: Stopped');
    }
}

/**
 * Sets up the global audio toggle function.
 * This function is responsible for toggling audio reactivity and updating the UI state.
 */
export function setupAudioToggle() {
    window.toggleAudio = function() {
        const audioBtn = document.querySelector('[onclick="toggleAudio()"]');
        
        if (!window.audioEngine.isActive) {
            // Try to start audio
            window.audioEngine.init().then(success => {
                if (success) {
                    if (audioBtn) {
                        audioBtn.style.background = 'linear-gradient(45deg, rgba(0, 255, 0, 0.3), rgba(0, 255, 0, 0.6))';
                        audioBtn.style.borderColor = '#00ff00';
                        audioBtn.title = 'Audio Reactivity: ON';
                    }
                    console.log('🎵 Audio Reactivity: ON');
                } else {
                    console.log('⚠️ Audio permission denied or not available');
                }
            });
        } else {
            // Toggle audio processing
            let audioEnabled = !window.audioEnabled;
            window.audioEnabled = audioEnabled; // Update global flag
            
            if (audioBtn) {
                // Update button visual state
                audioBtn.style.background = audioEnabled ? 
                    'linear-gradient(45deg, rgba(0, 255, 0, 0.3), rgba(0, 255, 0, 0.6))' : 
                    'linear-gradient(45deg, rgba(255, 0, 255, 0.1), rgba(255, 0, 255, 0.3))';
                audioBtn.style.borderColor = audioEnabled ? '#00ff00' : 'rgba(255, 0, 255, 0.3)';
                audioBtn.title = `Audio Reactivity: ${audioEnabled ? 'ON' : 'OFF'}`;
            }
            
            // Audio permission check for mobile
            if (audioEnabled) {
                navigator.mediaDevices.getUserMedia({ audio: true }).catch(e => {
                    audioEnabled = false;
                    window.audioEnabled = false;
                    console.log('⚠️ Audio permission denied:', e.message);
                });
            }
            
            console.log(`🎵 Audio Reactivity: ${audioEnabled ? 'ON' : 'OFF'}`);
        }
    };
}

// Create and initialize the global audio engine instance
const audioEngine = new SimpleAudioEngine();
window.audioEngine = audioEngine;

// Set up global audio toggle function
setupAudioToggle();

console.log('🎵 Audio Engine Module: Loaded');