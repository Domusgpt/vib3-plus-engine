/**
 * VIB34D Geometry Tab System
 * 9 Base Geometries + 3 Core Types = 27 Total Geometries
 *
 * Formula: geometry = coreIndex * 9 + baseIndex
 *
 * Core Types:
 * - Base (coreIndex = 0): Geometries 0-8
 * - Hypersphere Core (coreIndex = 1): Geometries 9-17
 * - Hypertetrahedron Core (coreIndex = 2): Geometries 18-26
 *
 * Base Geometries (baseIndex 0-8):
 * 0: Tetrahedron
 * 1: Hypercube
 * 2: Sphere
 * 3: Torus
 * 4: Klein Bottle
 * 5: Fractal
 * 6: Wave
 * 7: Crystal
 * 8: Hexacosichoron 🌟 (600-cell - Golden Ratio 4D Polytope)
 */

// State
let activeCoreIndex = 0; // 0 = base, 1 = hypersphere, 2 = hypertetra
let activeBaseIndex = 0; // 0-8
let activeGeometry = 0; // Combined index 0-26

// Core type definitions
const CORE_TYPES = {
    base: {
        index: 0,
        name: 'Base',
        icon: '🔷',
        color: '#00ffff',
        range: '0-8'
    },
    hypersphere: {
        index: 1,
        name: 'Hypersphere',
        icon: '🌀',
        color: '#ff00ff',
        range: '9-17'
    },
    hypertetra: {
        index: 2,
        name: 'Hypertetra',
        icon: '🔺',
        color: '#ff8800',
        range: '18-26'
    }
};

// Base geometry definitions
const BASE_GEOMETRIES = [
    { name: 'Tetrahedron', icon: '🔺' },
    { name: 'Hypercube', icon: '🟦' },
    { name: 'Sphere', icon: '🔮' },
    { name: 'Torus', icon: '🍩' },
    { name: 'Klein Bottle', icon: '🫙' },
    { name: 'Fractal', icon: '❄️' },
    { name: 'Wave', icon: '🌊' },
    { name: 'Crystal', icon: '💎' },
    { name: 'Hexacosichoron', icon: '🌟' } // 600-cell
];

/**
 * Initialize geometry tab system
 */
window.initGeometryTabs = function() {
    console.log('🎨 Initializing Geometry Tab System...');

    // Build UI
    buildCoreTabsUI();
    buildGeometryGridUI();

    // Set initial state
    switchCoreType('base');
    selectGeometryButton(0);

    console.log('✅ Geometry Tab System initialized');
    console.log(`📐 27 geometries available: 9 base × 3 core types (includes Hexacosichoron!)`);
};

/**
 * Build core type tabs UI
 */
function buildCoreTabsUI() {
    const container = document.getElementById('coreTabsContainer');
    if (!container) {
        console.warn('⚠️ Core tabs container not found');
        return;
    }

    container.className = 'core-tabs';
    container.innerHTML = Object.entries(CORE_TYPES).map(([key, core]) => `
        <button
            class="core-tab"
            data-core="${key}"
            onclick="switchCoreType('${key}')"
            title="${core.name} Core (Geometries ${core.range})"
        >
            <div class="core-tab-icon">${core.icon}</div>
            <div class="core-tab-name">${core.name}</div>
            <div class="core-tab-range">${core.range}</div>
        </button>
    `).join('');
}

/**
 * Build geometry buttons grid UI
 */
function buildGeometryGridUI() {
    const container = document.getElementById('geometryGrid');
    if (!container) {
        console.warn('⚠️ Geometry grid container not found');
        return;
    }

    container.className = 'geometry-grid';
    container.innerHTML = BASE_GEOMETRIES.map((geom, index) => `
        <button
            class="geom-btn"
            data-base-index="${index}"
            onclick="selectGeometryButton(${index})"
            title="${geom.name}"
        >
            <div class="geom-icon">${geom.icon}</div>
            <div class="geom-name">${geom.name}</div>
        </button>
    `).join('');
}

/**
 * Switch between core types (Base, Hypersphere, Hypertetra)
 */
window.switchCoreType = function(coreKey) {
    console.log(`🔄 Switching core type to: ${coreKey}`);

    const coreData = CORE_TYPES[coreKey];
    if (!coreData) {
        console.error(`❌ Unknown core type: ${coreKey}`);
        return;
    }

    activeCoreIndex = coreData.index;

    // Update active core tab
    document.querySelectorAll('.core-tab').forEach(tab => {
        if (tab.dataset.core === coreKey) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update geometry container color scheme
    const geometryContainer = document.querySelector('.geometry-container');
    if (geometryContainer) {
        geometryContainer.dataset.activeCore = coreKey;
    }

    // Recalculate and apply geometry
    calculateAndApplyGeometry();

    console.log(`✅ Core type: ${coreData.name} (index ${activeCoreIndex})`);
    console.log(`📐 Geometry range: ${coreData.range}`);
};

/**
 * Select a geometry button (base geometry 0-7)
 */
window.selectGeometryButton = function(baseIndex) {
    if (baseIndex < 0 || baseIndex > 8) {
        console.error(`❌ Invalid base index: ${baseIndex} (must be 0-8)`);
        return;
    }

    console.log(`🎯 Selected base geometry: ${BASE_GEOMETRIES[baseIndex].name} (index ${baseIndex})`);

    activeBaseIndex = baseIndex;

    // Update active geometry button
    document.querySelectorAll('.geom-btn').forEach(btn => {
        if (parseInt(btn.dataset.baseIndex) === baseIndex) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Calculate and apply combined geometry
    calculateAndApplyGeometry();
};

/**
 * Calculate combined geometry index and apply to engine
 * Formula: geometry = coreIndex * 9 + baseIndex
 */
function calculateAndApplyGeometry() {
    // Calculate combined index
    activeGeometry = activeCoreIndex * 9 + activeBaseIndex;

    const coreName = Object.values(CORE_TYPES).find(c => c.index === activeCoreIndex)?.name;
    const baseName = BASE_GEOMETRIES[activeBaseIndex]?.name;

    console.log(`🧮 Calculated geometry index: ${activeGeometry}`);
    console.log(`   = ${coreName} (${activeCoreIndex}) × 9 + ${baseName} (${activeBaseIndex})`);
    console.log(`   = ${activeCoreIndex * 9} + ${activeBaseIndex} = ${activeGeometry}`);

    // Apply to engine
    if (window.selectGeometry) {
        window.selectGeometry(activeGeometry);
        console.log(`✅ Applied geometry ${activeGeometry} to engine`);
    } else {
        console.warn('⚠️ window.selectGeometry() not available yet');
    }

    // Update any geometry display elements
    updateGeometryDisplay();
}

/**
 * Update geometry display elements in UI
 */
function updateGeometryDisplay() {
    const coreName = Object.values(CORE_TYPES).find(c => c.index === activeCoreIndex)?.name;
    const baseName = BASE_GEOMETRIES[activeBaseIndex]?.name;
    const fullName = activeCoreIndex === 0 ? baseName : `${baseName} + ${coreName} Core`;

    // Update any display elements that show current geometry
    const displays = document.querySelectorAll('[data-geometry-display]');
    displays.forEach(display => {
        display.textContent = fullName;
        display.dataset.geometryIndex = activeGeometry;
    });
}

/**
 * Load geometry from index (0-23)
 * Used when loading from gallery or external sources
 */
window.loadGeometryFromIndex = function(geometryIndex) {
    if (geometryIndex < 0 || geometryIndex > 26) {
        console.error(`❌ Invalid geometry index: ${geometryIndex} (must be 0-26)`);
        return;
    }

    console.log(`📂 Loading geometry from index: ${geometryIndex}`);

    // Decode: coreIndex = floor(geometryIndex / 9), baseIndex = geometryIndex % 9
    const coreIndex = Math.floor(geometryIndex / 9);
    const baseIndex = geometryIndex % 9;

    console.log(`   Decoded: core=${coreIndex}, base=${baseIndex}`);

    // Find core type key
    const coreKey = Object.entries(CORE_TYPES).find(([_, core]) => core.index === coreIndex)?.[0];

    if (!coreKey) {
        console.error(`❌ Failed to decode core index: ${coreIndex}`);
        return;
    }

    // Switch to core type
    switchCoreType(coreKey);

    // Select base geometry
    selectGeometryButton(baseIndex);

    console.log(`✅ Loaded geometry ${geometryIndex}: ${BASE_GEOMETRIES[baseIndex].name} + ${CORE_TYPES[coreKey].name}`);
};

/**
 * Get current geometry info
 */
window.getGeometryInfo = function() {
    const coreName = Object.values(CORE_TYPES).find(c => c.index === activeCoreIndex)?.name;
    const baseName = BASE_GEOMETRIES[activeBaseIndex]?.name;

    return {
        index: activeGeometry,
        coreIndex: activeCoreIndex,
        baseIndex: activeBaseIndex,
        coreName: coreName,
        baseName: baseName,
        fullName: activeCoreIndex === 0 ? baseName : `${baseName} + ${coreName} Core`
    };
};

/**
 * Keyboard shortcuts for geometry selection
 */
document.addEventListener('keydown', (e) => {
    // Alt + 1-3: Switch core types
    if (e.altKey && e.key >= '1' && e.key <= '3') {
        e.preventDefault();
        const coreKeys = ['base', 'hypersphere', 'hypertetra'];
        const coreKey = coreKeys[parseInt(e.key) - 1];
        if (coreKey) {
            switchCoreType(coreKey);
        }
    }

    // Alt + Q,W,E,R,T,A,S,D,F: Select base geometries 0-8
    if (e.altKey) {
        const keyMap = {
            'q': 0, 'w': 1, 'e': 2, 'r': 3, 't': 4,
            'a': 5, 's': 6, 'd': 7, 'f': 8
        };
        const baseIndex = keyMap[e.key.toLowerCase()];
        if (baseIndex !== undefined) {
            e.preventDefault();
            selectGeometryButton(baseIndex);
        }
    }
});

/**
 * Initialize on load
 */
window.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure other systems are loaded
    setTimeout(() => {
        if (typeof initGeometryTabs === 'function') {
            initGeometryTabs();
        }
    }, 100);
});

console.log('📐 Geometry Tabs Module: Loaded');
console.log('⌨️ Keyboard Shortcuts:');
console.log('  - Alt + 1-3: Switch core types');
console.log('  - Alt + Q,W,E,R,T,A,S,D,F: Select geometries 0-8 (F = Hexacosichoron!)');
