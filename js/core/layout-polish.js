/**
 * VIB3+ Layout Polish & Deep Fixes Module
 * Comprehensive layout fixes for all screen sizes and orientations
 *
 * Fixes:
 * 1. System button icons not showing on mobile
 * 2. Bottom bezel positioning (gap/overlap issues)
 * 3. Canvas resize across all layouts
 * 4. Mobile responsiveness improvements
 * 5. Dynamic layout calculations
 */

console.log('🎨 Layout Polish Module: Loading...');

// State tracking
let layoutState = {
    topBarHeight: 0,
    bezelHeight: 0,
    canvasTop: 0,
    canvasBottom: 0,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    isMobile: false,
    isLandscape: false
};

/**
 * Initialize layout polish system
 */
function initializeLayoutPolish() {
    console.log('🎨 Initializing Layout Polish System...');

    // Detect mobile
    detectMobile();

    // Fix system button icons immediately
    fixSystemButtonIcons();

    // Calculate and apply proper layout
    calculateLayout();
    applyLayout();

    // Set up dynamic resize observer
    setupDynamicResize();

    // Fix icon loading timing issue
    setupIconLoadingFix();

    // Add mobile-specific improvements
    if (layoutState.isMobile) {
        applyMobileImprovements();
    }

    console.log('✅ Layout Polish System initialized');
}

/**
 * Detect if we're on mobile
 */
function detectMobile() {
    layoutState.isMobile = window.innerWidth <= 768;
    layoutState.isLandscape = window.innerWidth > window.innerHeight;

    if (layoutState.isMobile) {
        document.body.classList.add('mobile-layout');
    } else {
        document.body.classList.remove('mobile-layout');
    }

    if (layoutState.isLandscape) {
        document.body.classList.add('landscape-layout');
    } else {
        document.body.classList.remove('landscape-layout');
    }

    console.log(`📱 Layout mode: ${layoutState.isMobile ? 'Mobile' : 'Desktop'}, ${layoutState.isLandscape ? 'Landscape' : 'Portrait'}`);
}

/**
 * Fix system button icons not showing
 */
function fixSystemButtonIcons() {
    console.log('🔧 Fixing system button icons...');

    const systemButtons = document.querySelectorAll('.system-btn');

    systemButtons.forEach(btn => {
        const iconSpan = btn.querySelector('.system-icon');
        const textSpan = btn.querySelector('span:not(.system-icon)');

        // On mobile, ensure icon is visible even if SVG hasn't loaded
        if (layoutState.isMobile) {
            if (iconSpan) {
                // Ensure icon span is displayed
                iconSpan.style.display = 'inline-flex';
                iconSpan.style.minWidth = '24px';
                iconSpan.style.minHeight = '24px';
                iconSpan.style.alignItems = 'center';
                iconSpan.style.justifyContent = 'center';

                // If icon is empty (SVG not loaded), add fallback text
                if (!iconSpan.innerHTML || iconSpan.innerHTML.trim() === '') {
                    const systemName = btn.dataset.system;
                    const fallbackIcons = {
                        'faceted': '◆',
                        'quantum': '◉',
                        'holographic': '✦',
                        'polychora': '⬡'
                    };
                    iconSpan.textContent = fallbackIcons[systemName] || '●';
                    iconSpan.style.fontSize = '1.2rem';
                }
            }

            // Hide text on mobile
            if (textSpan && !textSpan.classList.contains('system-icon')) {
                textSpan.style.display = 'none';
            }
        } else {
            // Desktop: show both
            if (iconSpan) iconSpan.style.display = '';
            if (textSpan) textSpan.style.display = '';
        }
    });

    console.log('✅ System button icons fixed');
}

/**
 * Setup icon loading fix with observer
 */
function setupIconLoadingFix() {
    // Re-check icons when geometric-icons module loads
    let iconCheckAttempts = 0;
    const maxAttempts = 10;

    const checkIcons = setInterval(() => {
        iconCheckAttempts++;

        // Check if geometric icons have loaded
        const iconSpans = document.querySelectorAll('.system-icon');
        let iconsLoaded = false;

        iconSpans.forEach(span => {
            if (span.querySelector('svg')) {
                iconsLoaded = true;
            }
        });

        if (iconsLoaded || iconCheckAttempts >= maxAttempts) {
            clearInterval(checkIcons);
            console.log(`✅ Icons ${iconsLoaded ? 'loaded' : 'using fallback'} after ${iconCheckAttempts} attempts`);
            fixSystemButtonIcons(); // Re-fix with actual icons
        }
    }, 500);
}

/**
 * Calculate proper layout dimensions
 */
function calculateLayout() {
    // Get top bar height
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        layoutState.topBarHeight = topBar.offsetHeight;
    }

    // Get control panel/bezel
    const controlPanel = document.getElementById('controlPanel');
    if (controlPanel) {
        const isCollapsed = controlPanel.classList.contains('collapsed');

        if (layoutState.isMobile) {
            // Mobile layout
            if (isCollapsed) {
                layoutState.bezelHeight = 52; // Collapsed height
            } else {
                // Expanded: use percentage of viewport
                if (layoutState.isLandscape) {
                    layoutState.bezelHeight = window.innerHeight * 0.5; // 50% in landscape
                } else {
                    layoutState.bezelHeight = window.innerHeight * 0.6; // 60% in portrait
                }
            }
        } else {
            // Desktop layout
            if (isCollapsed) {
                layoutState.bezelHeight = 52;
            } else {
                layoutState.bezelHeight = Math.min(window.innerHeight * 0.65, 600); // Max 600px
            }
        }
    }

    // Calculate canvas dimensions
    layoutState.canvasTop = layoutState.topBarHeight;
    layoutState.canvasBottom = layoutState.bezelHeight;

    console.log('📐 Layout calculated:', {
        topBar: layoutState.topBarHeight,
        bezel: layoutState.bezelHeight,
        canvasTop: layoutState.canvasTop,
        canvasBottom: layoutState.canvasBottom
    });
}

/**
 * Apply layout to all elements
 */
function applyLayout() {
    const canvasContainer = document.getElementById('canvasContainer');
    const controlPanel = document.getElementById('controlPanel');

    if (!canvasContainer || !controlPanel) {
        console.warn('⚠️ Required elements not found');
        return;
    }

    // Apply canvas container positioning
    canvasContainer.style.position = 'fixed';
    canvasContainer.style.top = `${layoutState.canvasTop}px`;
    canvasContainer.style.bottom = `${layoutState.canvasBottom}px`;
    canvasContainer.style.left = '0';
    canvasContainer.style.right = '0';
    canvasContainer.style.overflow = 'hidden';

    // Apply control panel positioning
    controlPanel.style.position = 'fixed';
    controlPanel.style.bottom = '0';
    controlPanel.style.left = '0';
    controlPanel.style.right = '0';
    controlPanel.style.height = `${layoutState.bezelHeight}px`;

    // Force layout recalculation
    void canvasContainer.offsetHeight;

    // Get actual dimensions
    const rect = canvasContainer.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    console.log(`📐 Applied layout: Canvas ${width}x${height}px, Bezel ${layoutState.bezelHeight}px`);

    // Resize all canvases
    resizeAllCanvases(width, height);
}

/**
 * Resize all canvases to match container
 */
function resizeAllCanvases(width, height) {
    const canvasContainer = document.getElementById('canvasContainer');
    if (!canvasContainer) return;

    const allCanvases = canvasContainer.querySelectorAll('canvas');

    allCanvases.forEach(canvas => {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
    });

    // Trigger engine resize
    if (window.vib34dApp && window.vib34dApp.currentEngine) {
        setTimeout(() => {
            if (window.vib34dApp.currentEngine.handleResize) {
                window.vib34dApp.currentEngine.handleResize(width, height);
            }
            if (window.vib34dApp.currentEngine.render) {
                window.vib34dApp.currentEngine.render();
            }
        }, 50);
    }

    console.log(`🖼️ Resized ${allCanvases.length} canvases to ${width}x${height}px`);
}

/**
 * Setup dynamic resize observer
 */
function setupDynamicResize() {
    // Watch control panel for state changes
    const controlPanel = document.getElementById('controlPanel');
    if (controlPanel) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    console.log('🔄 Control panel state changed, recalculating layout...');
                    setTimeout(() => {
                        calculateLayout();
                        applyLayout();
                    }, 50);
                }
            });
        });

        observer.observe(controlPanel, {
            attributes: true,
            attributeFilter: ['class']
        });

        console.log('👀 Layout observer installed');
    }

    // Watch window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('↔️ Window resized, recalculating layout...');
            detectMobile();
            calculateLayout();
            applyLayout();
            fixSystemButtonIcons();
        }, 150);
    });

    // Watch orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            console.log('🔄 Orientation changed, recalculating layout...');
            detectMobile();
            calculateLayout();
            applyLayout();
            fixSystemButtonIcons();
        }, 300);
    });
}

/**
 * Apply mobile-specific improvements
 */
function applyMobileImprovements() {
    console.log('📱 Applying mobile improvements...');

    // Larger touch targets
    const touchTargets = document.querySelectorAll('.system-btn, .action-btn, .bezel-tab, .geom-btn');
    touchTargets.forEach(el => {
        el.style.minHeight = '44px';
        el.style.touchAction = 'manipulation';
    });

    // Optimize sliders for touch
    const sliders = document.querySelectorAll('.control-slider');
    sliders.forEach(slider => {
        slider.style.height = '8px';
        slider.style.cursor = 'pointer';
    });

    // Add mobile-specific classes
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
        topBar.classList.add('mobile-mode');
    }

    // Ensure bottom bezel doesn't overlap
    const controlPanel = document.getElementById('controlPanel');
    if (controlPanel) {
        controlPanel.style.maxHeight = '75vh';
        controlPanel.style.overflow = 'hidden';
    }

    console.log('✅ Mobile improvements applied');
}

/**
 * Override toggleBezelCollapse to trigger layout recalculation
 */
function setupBezelToggleOverride() {
    const originalToggleBezelCollapse = window.toggleBezelCollapse;

    if (originalToggleBezelCollapse) {
        window.toggleBezelCollapse = function() {
            // Call original
            originalToggleBezelCollapse();

            // Recalculate layout after toggle
            setTimeout(() => {
                calculateLayout();
                applyLayout();
            }, 100);
        };

        console.log('✅ Bezel toggle override installed');
    }
}

/**
 * Fix bezel tab visibility on mobile
 */
function fixBezelTabsOnMobile() {
    if (!layoutState.isMobile) return;

    const bezelTabs = document.querySelectorAll('.bezel-tab');
    bezelTabs.forEach(tab => {
        const icon = tab.querySelector('.tab-icon');
        const text = tab.querySelector('span:not(.tab-icon)');

        // On mobile, make tabs more compact
        if (icon) {
            icon.style.fontSize = '1rem';
        }
        if (text) {
            // Abbreviate text on very small screens
            if (window.innerWidth < 480) {
                const fullText = text.textContent;
                const shortTexts = {
                    'Controls': 'Ctrl',
                    'Color': 'Clr',
                    'Geometry': 'Geo',
                    'Reactivity': 'React',
                    'Export': 'Exp'
                };
                text.textContent = shortTexts[fullText] || fullText.substr(0, 4);
            }
        }

        // Ensure proper spacing
        tab.style.padding = '8px 10px';
        tab.style.fontSize = '0.7rem';
    });
}

/**
 * Force initial layout after DOM loads
 */
function forceInitialLayout() {
    // Wait for all modules to load
    setTimeout(() => {
        console.log('🚀 Forcing initial layout...');
        detectMobile();
        calculateLayout();
        applyLayout();
        fixSystemButtonIcons();
        fixBezelTabsOnMobile();
        setupBezelToggleOverride();
    }, 1000);

    // Second pass after geometric icons should have loaded
    setTimeout(() => {
        console.log('🔄 Second layout pass (post-icons)...');
        fixSystemButtonIcons();
    }, 2000);
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeLayoutPolish();
        forceInitialLayout();
    });
} else {
    initializeLayoutPolish();
    forceInitialLayout();
}

// Export functions
window.fixSystemButtonIcons = fixSystemButtonIcons;
window.calculateLayout = calculateLayout;
window.applyLayout = applyLayout;
window.layoutState = layoutState;

console.log('🎨 Layout Polish Module: Loaded');
console.log('📱 Mobile detection, icon fixes, and dynamic layout enabled');
