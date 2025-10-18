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
    console.log('🔧 Fixing system button display...');

    const systemButtons = document.querySelectorAll('.system-btn');

    systemButtons.forEach(btn => {
        const iconSpan = btn.querySelector('.system-icon');
        const textSpan = btn.querySelector('span:not(.system-icon)');

        // On mobile, just ensure proper display - don't mess with content
        if (layoutState.isMobile) {
            // Hide text on mobile (show icon only)
            if (textSpan && !textSpan.classList.contains('system-icon')) {
                textSpan.style.display = 'none';
            }
        } else {
            // Desktop: show both
            if (textSpan) textSpan.style.display = '';
        }
    });

    console.log('✅ System button display fixed (icons left as-is)');
}

/**
 * Setup icon loading fix with observer
 */
function setupIconLoadingFix() {
    // Let geometric-icons module handle icon loading
    // We just ensure layout is correct
    console.log('⏭️ Skipping icon loading checks - using HTML emojis/SVG as-is');
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

    // DON'T set fixed height on control panel - let CSS handle it
    // Just ensure positioning
    controlPanel.style.position = 'fixed';
    controlPanel.style.bottom = '0';
    controlPanel.style.left = '0';
    controlPanel.style.right = '0';

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
    // Wait for VIB3+ system to fully initialize (after loading screen)
    const waitForSystem = () => {
        if (window.isLoadingComplete && window.isLoadingComplete()) {
            console.log('🚀 System loaded, applying layout fixes...');
            detectMobile();
            calculateLayout();
            applyLayout();
            fixSystemButtonIcons();
            fixBezelTabsOnMobile();
            setupBezelToggleOverride();
        } else {
            setTimeout(waitForSystem, 500);
        }
    };

    // Start checking after a short delay
    setTimeout(waitForSystem, 1000);

    // Also listen for the vib3-loaded event
    window.addEventListener('vib3-loaded', () => {
        console.log('🔄 VIB3+ loaded event - applying layout fixes...');
        setTimeout(() => {
            detectMobile();
            fixSystemButtonIcons();
            calculateLayout();
            applyLayout();
        }, 200);
    });
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
