/**
 * VIB3+ State Management System
 * Comprehensive state save/load/restore with URL deep linking
 *
 * Features:
 * - Complete application state capture
 * - localStorage persistence
 * - URL parameter encoding/decoding
 * - State snapshots and history
 * - Undo/Redo functionality
 * - Share links generation
 * - Auto-save on change
 * - State validation and migration
 */

console.log('💾 State Manager Module: Loading...');

// State management configuration
let stateHistory = [];
let currentStateIndex = -1;
let maxHistorySize = 50;
let autoSaveEnabled = true;
let autoSaveDelay = 2000; // 2 seconds
let autoSaveTimeout = null;

// Current application state
let currentState = {
    version: '1.0',
    timestamp: Date.now(),
    system: 'faceted',
    geometry: 0,
    parameters: {},
    ui: {},
    performance: {},
    reactivity: {}
};

/**
 * Initializes the state manager.
 */
function initializeStateManager() {
    console.log('💾 Initializing State Manager...');

    // Try to restore from URL first
    const urlState = loadStateFromURL();
    if (urlState) {
        console.log('🔗 Restoring state from URL...');
        restoreState(urlState);
    } else {
        // Try to restore from localStorage
        const savedState = loadStateFromStorage();
        if (savedState) {
            console.log('📂 Restoring state from localStorage...');
            restoreState(savedState);
        } else {
            // Capture initial state
            captureCurrentState();
        }
    }

    // Set up auto-save
    if (autoSaveEnabled) {
        setupAutoSave();
    }

    // Set up keyboard shortcuts
    setupStateShortcuts();

    // Set up state change listeners
    setupStateListeners();

    console.log('✅ State Manager initialized');
}

/**
 * Captures the current application state.
 * @returns {object} The current application state.
 */
function captureCurrentState() {
    const state = {
        version: '1.0',
        timestamp: Date.now(),

        // System and geometry
        system: window.currentSystem || 'faceted',
        geometry: window.getGeometryInfo ? window.getGeometryInfo().index : 0,

        // All parameters
        parameters: captureParameters(),

        // UI state
        ui: {
            activeTab: getCurrentTab(),
            bezelCollapsed: isBezelCollapsed(),
            performanceStatsVisible: isPerformanceStatsVisible()
        },

        // Performance settings
        performance: {
            mode: window.performanceMode || 'auto'
        },

        // Reactivity settings
        reactivity: captureReactivityState()
    };

    currentState = state;
    return state;
}

/**
 * Captures all parameter values.
 * @returns {object} An object containing all parameter values.
 */
function captureParameters() {
    const params = {};

    // Rotation parameters
    const rotParams = ['rot4dXY', 'rot4dXZ', 'rot4dYZ', 'rot4dXW', 'rot4dYW', 'rot4dZW'];
    rotParams.forEach(param => {
        const slider = document.getElementById(param);
        if (slider) params[param] = parseFloat(slider.value);
    });

    // Visual parameters
    const visualParams = ['gridDensity', 'morphFactor', 'chaos', 'speed'];
    visualParams.forEach(param => {
        const slider = document.getElementById(param);
        if (slider) params[param] = parseFloat(slider.value);
    });

    // Color parameters
    const colorParams = ['hue', 'saturation', 'intensity'];
    colorParams.forEach(param => {
        const slider = document.getElementById(param);
        if (slider) params[param] = parseFloat(slider.value);
    });

    return params;
}

/**
 * Captures the reactivity state.
 * @returns {object} An object containing the reactivity state.
 */
function captureReactivityState() {
    const reactivity = {
        audio: window.audioEnabled || false,
        deviceTilt: window.deviceTiltHandler?.isEnabled || false,
        interactivity: window.interactivityEnabled !== false
    };

    // System reactivity checkboxes
    const systems = ['faceted', 'quantum', 'holographic'];
    const interactions = ['Mouse', 'Click', 'Scroll'];

    systems.forEach(system => {
        reactivity[system] = {};
        interactions.forEach(interaction => {
            const checkbox = document.getElementById(`${system}${interaction}`);
            if (checkbox) {
                reactivity[system][interaction.toLowerCase()] = checkbox.checked;
            }
        });
    });

    return reactivity;
}

/**
 * Gets the current active tab.
 * @returns {string} The current active tab.
 */
function getCurrentTab() {
    const activeTab = document.querySelector('.bezel-tab.active');
    return activeTab ? activeTab.dataset.tab : 'controls';
}

/**
 * Checks if the bezel is collapsed.
 * @returns {boolean} True if the bezel is collapsed, false otherwise.
 */
function isBezelCollapsed() {
    const panel = document.getElementById('controlPanel');
    return panel ? panel.classList.contains('collapsed') : false;
}

/**
 * Checks if the performance stats are visible.
 * @returns {boolean} True if the performance stats are visible, false otherwise.
 */
function isPerformanceStatsVisible() {
    const stats = document.getElementById('performance-stats');
    return stats ? stats.style.display !== 'none' : false;
}

/**
 * Restores the application state.
 * @param {object} state - The state to restore.
 * @returns {boolean} True if the state was restored successfully, false otherwise.
 */
function restoreState(state) {
    if (!state || !state.version) {
        console.error('❌ Invalid state object');
        return false;
    }

    console.log('📂 Restoring state:', state);

    try {
        // Restore system
        if (state.system && window.switchSystem) {
            window.switchSystem(state.system);
        }

        // Restore geometry
        if (state.geometry !== undefined) {
            setTimeout(() => {
                if (window.loadGeometryFromIndex) {
                    window.loadGeometryFromIndex(state.geometry);
                }
            }, 300);
        }

        // Restore parameters
        if (state.parameters) {
            Object.entries(state.parameters).forEach(([param, value]) => {
                setTimeout(() => {
                    if (window.updateParameter) {
                        window.updateParameter(param, value);
                    }
                }, 500);
            });
        }

        // Restore UI state
        if (state.ui) {
            setTimeout(() => {
                if (state.ui.activeTab && window.switchBezelTab) {
                    window.switchBezelTab(state.ui.activeTab);
                }
                if (state.ui.bezelCollapsed && window.toggleBezelCollapse) {
                    const panel = document.getElementById('controlPanel');
                    if (panel && !panel.classList.contains('collapsed')) {
                        window.toggleBezelCollapse();
                    }
                }
            }, 700);
        }

        // Restore performance mode
        if (state.performance && state.performance.mode && window.setPerformanceMode) {
            window.setPerformanceMode(state.performance.mode);
        }

        // Restore reactivity settings
        if (state.reactivity) {
            setTimeout(() => {
                restoreReactivityState(state.reactivity);
            }, 1000);
        }

        currentState = state;
        console.log('✅ State restored successfully');
        return true;

    } catch (error) {
        console.error('❌ Failed to restore state:', error);
        return false;
    }
}

/**
 * Restores the reactivity state.
 * @param {object} reactivity - The reactivity state to restore.
 */
function restoreReactivityState(reactivity) {
    if (!reactivity) return;

    // Restore feature toggles
    if (reactivity.audio !== undefined && reactivity.audio !== window.audioEnabled) {
        if (window.toggleAudio) window.toggleAudio();
    }

    // Restore system reactivity
    const systems = ['faceted', 'quantum', 'holographic'];
    const interactions = ['mouse', 'click', 'scroll'];

    systems.forEach(system => {
        if (reactivity[system]) {
            interactions.forEach(interaction => {
                const checkbox = document.getElementById(`${system}${interaction.charAt(0).toUpperCase() + interaction.slice(1)}`);
                if (checkbox && reactivity[system][interaction] !== undefined) {
                    checkbox.checked = reactivity[system][interaction];
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        }
    });
}

/**
 * Saves the state to the history for undo/redo functionality.
 * @param {object} state - The state to save.
 */
function saveToHistory(state = null) {
    const stateToSave = state || captureCurrentState();

    // Remove any states after current index (when undoing then making new changes)
    if (currentStateIndex < stateHistory.length - 1) {
        stateHistory = stateHistory.slice(0, currentStateIndex + 1);
    }

    // Add new state
    stateHistory.push(JSON.parse(JSON.stringify(stateToSave)));
    currentStateIndex = stateHistory.length - 1;

    // Limit history size
    if (stateHistory.length > maxHistorySize) {
        stateHistory.shift();
        currentStateIndex--;
    }

    console.log(`📚 State saved to history (${currentStateIndex + 1}/${stateHistory.length})`);
}

/**
 * Undoes to the previous state.
 * @returns {boolean} True if the undo was successful, false otherwise.
 */
function undo() {
    if (currentStateIndex <= 0) {
        console.log('⚠️ No more states to undo');
        return false;
    }

    currentStateIndex--;
    const previousState = stateHistory[currentStateIndex];
    restoreState(previousState);

    console.log(`↶ Undo to state ${currentStateIndex + 1}/${stateHistory.length}`);
    showNotification('Undo', `Step ${currentStateIndex + 1}/${stateHistory.length}`, 'info');
    return true;
}

/**
 * Redoes to the next state.
 * @returns {boolean} True if the redo was successful, false otherwise.
 */
function redo() {
    if (currentStateIndex >= stateHistory.length - 1) {
        console.log('⚠️ No more states to redo');
        return false;
    }

    currentStateIndex++;
    const nextState = stateHistory[currentStateIndex];
    restoreState(nextState);

    console.log(`↷ Redo to state ${currentStateIndex + 1}/${stateHistory.length}`);
    showNotification('Redo', `Step ${currentStateIndex + 1}/${stateHistory.length}`, 'info');
    return true;
}

/**
 * Saves the state to localStorage.
 * @param {string} key - The key to use for saving the state.
 * @returns {boolean} True if the state was saved successfully, false otherwise.
 */
function saveStateToStorage(key = 'vib3-plus-app-state') {
    const state = captureCurrentState();

    try {
        localStorage.setItem(key, JSON.stringify(state));
        console.log(`💾 State saved to localStorage: ${key}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to save state to localStorage:', error);
        return false;
    }
}

/**
 * Loads the state from localStorage.
 * @param {string} key - The key to use for loading the state.
 * @returns {object} The loaded state, or null if no state was found.
 */
function loadStateFromStorage(key = 'vib3-plus-app-state') {
    try {
        const saved = localStorage.getItem(key);
        if (!saved) return null;

        const state = JSON.parse(saved);
        console.log(`📂 State loaded from localStorage: ${key}`);
        return state;
    } catch (error) {
        console.error('❌ Failed to load state from localStorage:', error);
        return null;
    }
}

/**
 * Encodes the state to a URL-safe string.
 * @param {object} state - The state to encode.
 * @returns {string} The encoded state, or null if an error occurred.
 */
function encodeStateToURL(state = null) {
    const stateToEncode = state || captureCurrentState();

    try {
        // Create compressed state representation
        const compressed = {
            v: stateToEncode.version,
            s: stateToEncode.system,
            g: stateToEncode.geometry,
            p: stateToEncode.parameters
        };

        // Encode to base64
        const json = JSON.stringify(compressed);
        const encoded = btoa(json);

        return encoded;
    } catch (error) {
        console.error('❌ Failed to encode state:', error);
        return null;
    }
}

/**
 * Loads the state from the URL.
 * @returns {object} The loaded state, or null if no state was found in the URL.
 */
function loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('state');

    if (!encoded) return null;

    try {
        // Decode from base64
        const json = atob(encoded);
        const compressed = JSON.parse(json);

        // Expand to full state
        const state = {
            version: compressed.v || '1.0',
            timestamp: Date.now(),
            system: compressed.s || 'faceted',
            geometry: compressed.g || 0,
            parameters: compressed.p || {},
            ui: {},
            performance: {},
            reactivity: {}
        };

        console.log('🔗 State decoded from URL');
        return state;
    } catch (error) {
        console.error('❌ Failed to decode state from URL:', error);
        return null;
    }
}

/**
 * Generates a shareable link containing the current state.
 * @returns {string} The shareable link, or null if an error occurred.
 */
function generateShareLink() {
    const encoded = encodeStateToURL();
    if (!encoded) return null;

    const baseURL = window.location.origin + window.location.pathname;
    const shareURL = `${baseURL}?state=${encoded}`;

    console.log('🔗 Share link generated:', shareURL);
    return shareURL;
}

/**
 * Copies the shareable link to the clipboard.
 * @returns {Promise<boolean>} A promise that resolves to true if the link was copied successfully, and false otherwise.
 */
async function copyShareLinkToClipboard() {
    const shareURL = generateShareLink();
    if (!shareURL) {
        showNotification('Error', 'Failed to generate share link', 'error');
        return false;
    }

    try {
        await navigator.clipboard.writeText(shareURL);
        showNotification('Share Link Copied!', 'Link copied to clipboard', 'success');
        console.log('✅ Share link copied to clipboard');
        return true;
    } catch (error) {
        console.error('❌ Failed to copy to clipboard:', error);
        showNotification('Copy Failed', 'Could not copy to clipboard', 'error');
        return false;
    }
}

/**
 * Sets up auto-save functionality.
 */
function setupAutoSave() {
    // Save on parameter changes
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('control-slider')) {
            scheduleAutoSave();
        }
    });

    // Save on significant actions
    ['switchSystem', 'selectGeometry', 'switchBezelTab'].forEach(funcName => {
        if (window[funcName]) {
            const original = window[funcName];
            window[funcName] = function(...args) {
                const result = original.apply(this, args);
                scheduleAutoSave();
                return result;
            };
        }
    });

    console.log('⏰ Auto-save enabled (delay: ${autoSaveDelay}ms)');
}

/**
 * Schedules an auto-save with debouncing.
 */
function scheduleAutoSave() {
    if (!autoSaveEnabled) return;

    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        saveStateToStorage();
        console.log('💾 Auto-saved');
    }, autoSaveDelay);
}

/**
 * Sets up keyboard shortcuts for state management.
 */
function setupStateShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Z: Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }

        // Ctrl+Y or Ctrl+Shift+Z: Redo
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            redo();
        }

        // Ctrl+L: Copy share link
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            copyShareLinkToClipboard();
        }
    });

    console.log('⌨️ State management shortcuts enabled');
    console.log('  - Ctrl+Z: Undo');
    console.log('  - Ctrl+Y or Ctrl+Shift+Z: Redo');
    console.log('  - Ctrl+L: Copy share link');
}

/**
 * Sets up state change listeners.
 */
function setupStateListeners() {
    // Capture initial state after everything loads
    setTimeout(() => {
        saveToHistory();
    }, 2000);
}

/**
 * Shows a notification.
 * @param {string} title - The title of the notification.
 * @param {string} message - The message of the notification.
 * @param {string} type - The type of the notification.
 */
function showNotification(title, message, type = 'info') {
    // Reuse notification system if available
    if (window.showSaveNotification) {
        window.showSaveNotification(`${title}: ${message}`, type === 'success' ? 'success' : 'error');
    } else {
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    }
}

// Export functions
window.captureCurrentState = captureCurrentState;
window.restoreState = restoreState;
window.saveToHistory = saveToHistory;
window.undo = undo;
window.redo = redo;
window.saveStateToStorage = saveStateToStorage;
window.loadStateFromStorage = loadStateFromStorage;
window.generateShareLink = generateShareLink;
window.copyShareLinkToClipboard = copyShareLinkToClipboard;

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStateManager);
} else {
    setTimeout(initializeStateManager, 1000);
}

console.log('💾 State Manager Module: Loaded');
console.log('⌨️ Ctrl+Z: Undo, Ctrl+Y: Redo, Ctrl+L: Copy share link');
