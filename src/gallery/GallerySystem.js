/**
 * VIB3+ Gallery System
 * Portfolio view with live previews for 3 visualization systems
 * Supports 24 geometries per system with full 6D rotation
 */

export class GallerySystem {
    constructor(engine) {
        this.engine = engine;
        this.galleryModal = null;
        this.previewCanvas = null;
        this.previewVisualizer = null;
        this.currentPreview = -1;
        this.previewTimeout = null;
        this.savedVariations = new Map(); // Store custom variations

        this.init();
    }

    /**
     * Initialize gallery system
     */
    init() {
        this.createGalleryModal();
        this.setupEventHandlers();
        this.loadSavedVariations();
    }

    /**
     * Create gallery modal HTML structure
     */
    createGalleryModal() {
        const modal = document.createElement('div');
        modal.id = 'galleryModal';
        modal.className = 'modal gallery-modal';

        modal.innerHTML = `
            <div class="modal-content gallery-content">
                <div class="gallery-header">
                    <h2>🌟 VIB3+ Variation Gallery</h2>
                    <div class="gallery-controls">
                        <button class="system-filter" data-filter="all" title="Show All Systems">
                            <span class="icon">🌐</span> All
                        </button>
                        <button class="system-filter" data-filter="quantum" title="Quantum Only">
                            <span class="icon">🌌</span> Quantum
                        </button>
                        <button class="system-filter" data-filter="faceted" title="Faceted Only">
                            <span class="icon">🔷</span> Faceted
                        </button>
                        <button class="system-filter" data-filter="holographic" title="Holographic Only">
                            <span class="icon">🌈</span> Holographic
                        </button>
                        <button class="preview-toggle" title="Toggle Live Preview">
                            <span class="icon">👁️</span> Preview
                        </button>
                        <button class="gallery-export" title="Export All Variations">
                            <span class="icon">📁</span> Export
                        </button>
                        <button class="close-btn" title="Close Gallery">×</button>
                    </div>
                </div>

                <div class="gallery-body">
                    <div class="gallery-sidebar">
                        <div class="preview-container">
                            <canvas id="galleryPreviewCanvas" width="300" height="300"></canvas>
                            <div class="preview-info">
                                <div class="preview-title">Hover to preview</div>
                                <div class="preview-system"></div>
                                <div class="preview-details"></div>
                            </div>
                        </div>

                        <div class="gallery-stats">
                            <div class="stat-item">
                                <span class="stat-label">Total Variations:</span>
                                <span class="stat-value" id="totalVariationsCount">100</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Default Variations:</span>
                                <span class="stat-value" id="defaultVariationsCount">30</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Custom Variations:</span>
                                <span class="stat-value" id="customVariationsCount">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Active System:</span>
                                <span class="stat-value" id="currentSystemDisplay">Quantum</span>
                            </div>
                        </div>
                    </div>

                    <div class="gallery-grid-container">
                        <div class="gallery-sections">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.galleryModal = modal;

        // Get preview canvas
        this.previewCanvas = document.getElementById('galleryPreviewCanvas');
        this.initPreviewSystem();
    }

    /**
     * Initialize preview system with simple 2D rendering
     */
    initPreviewSystem() {
        if (this.previewCanvas) {
            this.previewVisualizer = {
                canvas: this.previewCanvas,
                ctx: this.previewCanvas.getContext('2d'),
                params: {},

                updateParams(params) {
                    this.params = { ...params };
                },

                render() {
                    const ctx = this.ctx;
                    const canvas = this.canvas;

                    // Clear canvas
                    ctx.fillStyle = '#0a0a1a';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Simple geometric preview based on parameters
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const time = Date.now() * 0.001;

                    // Generate preview pattern based on geometry
                    const geometryType = this.params.geometry || 0;
                    const gridDensity = this.params.gridDensity || 15;

                    for (let i = 0; i < gridDensity * 8; i++) {
                        const angle = (i / (gridDensity * 8)) * Math.PI * 2;
                        const rotAngle = angle + time * (this.params.speed || 1);

                        // Apply 6D rotation influence
                        const rotX = (this.params.rot4dXY || 0) + (this.params.rot4dXW || 0);
                        const rotY = (this.params.rot4dYZ || 0) + (this.params.rot4dYW || 0);

                        const radius = 50 + Math.sin(rotAngle * (this.params.morphFactor || 1) + rotX) * 40;

                        const x = centerX + Math.cos(rotAngle + rotY) * radius;
                        const y = centerY + Math.sin(rotAngle + rotX) * radius;

                        const hue = ((this.params.hue || 200) + angle * 57.2958 + time * 20) % 360;
                        const alpha = 0.3 + Math.sin(time * 2 + angle) * 0.2;

                        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
                        ctx.beginPath();
                        ctx.arc(x, y, 2 + (this.params.chaos || 0.2) * 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            };

            // Start preview render loop
            const previewRender = () => {
                if (this.currentPreview >= 0) {
                    this.previewVisualizer.render();
                }
                requestAnimationFrame(previewRender);
            };
            previewRender();
        }
    }

    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Close button
        const closeBtn = this.galleryModal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => this.closeGallery());

        // Close on backdrop click
        this.galleryModal.addEventListener('click', (e) => {
            if (e.target === this.galleryModal) {
                this.closeGallery();
            }
        });

        // System filters
        this.galleryModal.querySelectorAll('.system-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBySystem(btn.dataset.filter);
                this.galleryModal.querySelectorAll('.system-filter').forEach(b =>
                    b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Preview toggle
        const previewToggle = this.galleryModal.querySelector('.preview-toggle');
        previewToggle.addEventListener('click', () => {
            this.togglePreview();
        });

        // Export all button
        const exportBtn = this.galleryModal.querySelector('.gallery-export');
        exportBtn.addEventListener('click', () => {
            this.exportAllVariations();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.galleryModal.classList.contains('active')) {
                switch (e.key) {
                    case 'Escape':
                        this.closeGallery();
                        break;
                    case 'ArrowLeft':
                        this.navigatePreview(-1);
                        break;
                    case 'ArrowRight':
                        this.navigatePreview(1);
                        break;
                }
            }
        });
    }

    /**
     * Open gallery modal
     */
    openGallery() {
        this.populateGallery();
        this.updateGalleryStats();
        this.galleryModal.classList.add('active');
    }

    /**
     * Close gallery modal
     */
    closeGallery() {
        this.galleryModal.classList.remove('active');
        this.currentPreview = -1;
        this.clearPreview();
    }

    /**
     * Populate gallery with variation thumbnails
     */
    populateGallery() {
        const sectionsContainer = this.galleryModal.querySelector('.gallery-sections');
        sectionsContainer.innerHTML = '';

        // Create section for each geometry category (24 geometries = 3 groups of 8)
        const geometryGroups = [
            {
                name: 'Base Geometries',
                range: [0, 7],
                geometries: ['Tetrahedron', 'Hypercube', 'Sphere', 'Torus',
                            'Klein Bottle', 'Fractal', 'Wave', 'Crystal']
            },
            {
                name: '🌀 Hypersphere Core Variants',
                range: [8, 15],
                geometries: ['Tetra-Core', 'Cube-Core', 'Sphere-Core', 'Torus-Core',
                            'Klein-Core', 'Fractal-Core', 'Wave-Core', 'Crystal-Core']
            },
            {
                name: '🔺 Hypertetrahedron Core Variants',
                range: [16, 23],
                geometries: ['Tetra-Hyper', 'Cube-Hyper', 'Sphere-Hyper', 'Torus-Hyper',
                            'Klein-Hyper', 'Fractal-Hyper', 'Wave-Hyper', 'Crystal-Hyper']
            }
        ];

        // Add default geometry sections (30 slots: 3 systems × 10 featured)
        geometryGroups.forEach((group, groupIdx) => {
            const section = this.createGeometryGroupSection(group, groupIdx);
            sectionsContainer.appendChild(section);
        });

        // Add custom variations section (70 slots)
        const customSection = this.createCustomGallerySection();
        sectionsContainer.appendChild(customSection);
    }

    /**
     * Create gallery section for geometry group
     */
    createGeometryGroupSection(group, groupIdx) {
        const section = document.createElement('div');
        section.className = 'gallery-section';

        const header = document.createElement('h3');
        header.textContent = group.name;
        header.className = 'geometry-header';

        const grid = document.createElement('div');
        grid.className = 'gallery-grid';

        // Show first 10 variations (mix of all 3 systems)
        for (let i = 0; i < 10; i++) {
            const variationIndex = groupIdx * 10 + i;
            if (variationIndex < 30) {
                const thumbnail = this.createVariationThumbnail(variationIndex, true);
                grid.appendChild(thumbnail);
            }
        }

        section.appendChild(header);
        section.appendChild(grid);

        return section;
    }

    /**
     * Create custom variations gallery section
     */
    createCustomGallerySection() {
        const section = document.createElement('div');
        section.className = 'gallery-section custom-section';

        const header = document.createElement('h3');
        header.textContent = '💎 Custom Variations';
        header.className = 'geometry-header custom';

        const grid = document.createElement('div');
        grid.className = 'gallery-grid custom-grid';

        // Show saved custom variations
        for (let i = 0; i < 70; i++) {
            const variationIndex = 30 + i;
            if (this.savedVariations.has(variationIndex)) {
                const thumbnail = this.createVariationThumbnail(variationIndex, false);
                grid.appendChild(thumbnail);
            } else {
                // Empty slot
                const emptySlot = this.createEmptySlot(variationIndex);
                grid.appendChild(emptySlot);
            }
        }

        section.appendChild(header);
        section.appendChild(grid);

        return section;
    }

    /**
     * Create individual variation thumbnail
     */
    createVariationThumbnail(index, isDefault) {
        const thumbnail = document.createElement('div');
        thumbnail.className = `gallery-thumbnail ${isDefault ? 'default' : 'custom'}`;
        thumbnail.dataset.variation = index;

        const variation = isDefault ? this.generateDefaultVariation(index) : this.savedVariations.get(index);
        const isCurrent = this.isCurrentVariation(variation);

        if (isCurrent) {
            thumbnail.classList.add('current');
        }

        // System badge
        const systemIcons = {
            quantum: '🌌',
            faceted: '🔷',
            holographic: '🌈'
        };
        const systemIcon = systemIcons[variation.system] || '🌐';

        thumbnail.innerHTML = `
            <div class="thumbnail-preview">
                <div class="variation-number">${index + 1}</div>
                <div class="system-badge">${systemIcon}</div>
                <div class="preview-placeholder"></div>
            </div>
            <div class="thumbnail-info">
                <div class="variation-name">${variation.name || `Variation ${index + 1}`}</div>
                <div class="variation-type">${isDefault ? 'Default' : 'Custom'}</div>
            </div>
        `;

        // Event handlers
        thumbnail.addEventListener('mouseenter', () => {
            this.showPreview(index, variation);
        });

        thumbnail.addEventListener('mouseleave', () => {
            this.clearPreview();
        });

        thumbnail.addEventListener('click', () => {
            this.selectVariation(variation);
        });

        return thumbnail;
    }

    /**
     * Create empty slot for custom variation
     */
    createEmptySlot(index) {
        const slot = document.createElement('div');
        slot.className = 'gallery-thumbnail empty-slot';
        slot.dataset.variation = index;

        slot.innerHTML = `
            <div class="thumbnail-preview">
                <div class="variation-number">${index + 1}</div>
                <div class="empty-indicator">+</div>
            </div>
            <div class="thumbnail-info">
                <div class="variation-name">Empty Slot</div>
                <div class="variation-type">Save Here</div>
            </div>
        `;

        slot.addEventListener('click', () => {
            this.saveCurrentToSlot(index);
        });

        return slot;
    }

    /**
     * Show preview for variation
     */
    showPreview(index, variation) {
        this.currentPreview = index;

        // Clear existing timeout
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }

        // Delay preview to avoid rapid changes
        this.previewTimeout = setTimeout(() => {
            if (this.currentPreview === index) {
                this.previewVisualizer.updateParams(variation.parameters);

                // Update preview info
                const title = this.galleryModal.querySelector('.preview-title');
                const systemDisplay = this.galleryModal.querySelector('.preview-system');
                const details = this.galleryModal.querySelector('.preview-details');

                const systemNames = {
                    quantum: '🌌 Quantum Engine',
                    faceted: '🔷 Faceted System',
                    holographic: '🌈 Holographic System'
                };

                title.textContent = variation.name || `Variation ${index + 1}`;
                systemDisplay.textContent = systemNames[variation.system];
                details.innerHTML = `
                    <div>Geometry: ${this.getGeometryName(variation.parameters.geometry)}</div>
                    <div>Grid Density: ${variation.parameters.gridDensity.toFixed(1)}</div>
                    <div>Hue: ${variation.parameters.hue}°</div>
                    <div>6D Rotation: XW=${variation.parameters.rot4dXW.toFixed(2)}</div>
                `;
            }
        }, 100);
    }

    /**
     * Clear preview
     */
    clearPreview() {
        this.currentPreview = -1;

        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }

        const title = this.galleryModal.querySelector('.preview-title');
        const systemDisplay = this.galleryModal.querySelector('.preview-system');
        const details = this.galleryModal.querySelector('.preview-details');

        title.textContent = 'Hover to preview';
        systemDisplay.textContent = '';
        details.innerHTML = '';
    }

    /**
     * Select variation and apply to engine
     */
    selectVariation(variation) {
        // Switch to correct system
        this.engine.switchSystem(variation.system);

        // Apply parameters
        this.engine.setParameters(variation.parameters);

        this.closeGallery();

        console.log(`✅ Applied variation: ${variation.name} (${variation.system})`);
    }

    /**
     * Save current state to custom slot
     */
    saveCurrentToSlot(index) {
        const currentState = this.engine.exportState();

        const variation = {
            name: `Custom ${index - 29}`,
            system: currentState.system,
            parameters: currentState.parameters,
            timestamp: currentState.timestamp
        };

        this.savedVariations.set(index, variation);
        this.saveVariationsToStorage();
        this.populateGallery();
        this.updateGalleryStats();

        console.log(`💾 Saved to slot ${index}: ${variation.name}`);
    }

    /**
     * Generate default variation
     */
    generateDefaultVariation(index) {
        const systems = ['quantum', 'faceted', 'holographic'];
        const systemIndex = index % 3;
        const geometryBase = Math.floor(index / 3);

        return {
            name: `Default ${index + 1}`,
            system: systems[systemIndex],
            parameters: {
                geometry: geometryBase,
                rot4dXY: 0,
                rot4dXZ: 0,
                rot4dYZ: 0,
                rot4dXW: (index * 0.3) % 6.28,
                rot4dYW: (index * 0.5) % 6.28,
                rot4dZW: (index * 0.7) % 6.28,
                gridDensity: 10 + (index % 20),
                morphFactor: 0.5 + (index % 10) * 0.1,
                chaos: (index % 5) * 0.2,
                speed: 0.8 + (index % 4) * 0.2,
                hue: (index * 37) % 360,
                intensity: 0.6 + (index % 3) * 0.1,
                saturation: 0.7,
                dimension: 3.2 + (index % 8) * 0.15
            }
        };
    }

    /**
     * Check if variation matches current state
     */
    isCurrentVariation(variation) {
        const current = this.engine.exportState();
        return current.system === variation.system &&
               current.parameters.geometry === variation.parameters.geometry;
    }

    /**
     * Get geometry name by index
     */
    getGeometryName(index) {
        const names = this.engine.getGeometryNames();
        return names[index] || 'Unknown';
    }

    /**
     * Filter gallery by system
     */
    filterBySystem(systemFilter) {
        const thumbnails = this.galleryModal.querySelectorAll('.gallery-thumbnail');

        thumbnails.forEach(thumb => {
            if (systemFilter === 'all') {
                thumb.style.display = '';
            } else {
                const index = parseInt(thumb.dataset.variation);
                const variation = index < 30 ?
                    this.generateDefaultVariation(index) :
                    this.savedVariations.get(index);

                if (variation && variation.system === systemFilter) {
                    thumb.style.display = '';
                } else {
                    thumb.style.display = 'none';
                }
            }
        });
    }

    /**
     * Navigate preview with keyboard
     */
    navigatePreview(direction) {
        let newIndex = this.currentPreview + direction;

        // Wrap around
        if (newIndex < 0) newIndex = 99;
        if (newIndex >= 100) newIndex = 0;

        const variation = newIndex < 30 ?
            this.generateDefaultVariation(newIndex) :
            this.savedVariations.get(newIndex);

        if (variation) {
            this.showPreview(newIndex, variation);

            // Scroll to thumbnail
            const thumbnail = this.galleryModal.querySelector(`[data-variation="${newIndex}"]`);
            if (thumbnail) {
                thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    /**
     * Update gallery statistics
     */
    updateGalleryStats() {
        const customCount = this.savedVariations.size;

        document.getElementById('totalVariationsCount').textContent = '100';
        document.getElementById('defaultVariationsCount').textContent = '30';
        document.getElementById('customVariationsCount').textContent = customCount;
        document.getElementById('currentSystemDisplay').textContent =
            this.engine.getCurrentSystem().charAt(0).toUpperCase() +
            this.engine.getCurrentSystem().slice(1);
    }

    /**
     * Toggle preview system
     */
    togglePreview() {
        const previewContainer = this.galleryModal.querySelector('.preview-container');
        previewContainer.classList.toggle('hidden');
    }

    /**
     * Export all variations as JSON
     */
    exportAllVariations() {
        const exportData = {
            type: 'vib3plus-collection',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            name: 'VIB3+ Variation Collection',
            variations: []
        };

        // Add all default variations
        for (let i = 0; i < 30; i++) {
            exportData.variations.push(this.generateDefaultVariation(i));
        }

        // Add custom variations
        this.savedVariations.forEach((variation, index) => {
            exportData.variations.push({ ...variation, slotIndex: index });
        });

        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vib3plus-variations-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('📁 Exported all variations');
    }

    /**
     * Load variations from localStorage
     */
    loadSavedVariations() {
        try {
            const saved = localStorage.getItem('vib3plus-custom-variations');
            if (saved) {
                const data = JSON.parse(saved);
                data.forEach(item => {
                    this.savedVariations.set(item.index, item.variation);
                });
                console.log(`📂 Loaded ${this.savedVariations.size} custom variations`);
            }
        } catch (error) {
            console.error('Failed to load saved variations:', error);
        }
    }

    /**
     * Save variations to localStorage
     */
    saveVariationsToStorage() {
        try {
            const data = [];
            this.savedVariations.forEach((variation, index) => {
                data.push({ index, variation });
            });
            localStorage.setItem('vib3plus-custom-variations', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save variations:', error);
        }
    }
}
