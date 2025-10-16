/**
 * VIB3+ Collection Manager
 * Auto-discovery system for JSON collections across all 3 visualization systems
 * Supports 24 geometries per system with full 6D rotation parameters
 */

export class CollectionManager {
    constructor() {
        this.collections = new Map();
        this.baseCollectionPath = './collections/';
        this.loadingPromises = new Map();
    }

    /**
     * Auto-discover and load all JSON collections from collections/ folder
     */
    async autoDiscoverCollections() {
        console.log('🔍 Auto-discovering VIB3+ collections...');

        // List of known collection files to try loading
        const knownCollections = [
            'base-variations.json',
            'quantum-experiments.json',
            'faceted-patterns.json',
            'holographic-gemstones.json',
            'geometric-dreams.json',
            'hypersphere-core-variants.json',
            'hypertetrahedron-variants.json',
            'custom-variations.json',
            'community-favorites.json',
            'experimental-forms.json'
        ];

        const loadPromises = knownCollections.map(filename =>
            this.loadCollection(filename).catch(err => {
                // Silently fail for missing files
                console.log(`📁 Collection not found: ${filename}`);
                return null;
            })
        );

        // Also try to load any user-custom files with date pattern
        for (let i = 0; i < 10; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const filename = `vib3plus-custom-${dateStr}.json`;
            loadPromises.push(
                this.loadCollection(filename).catch(() => null)
            );
        }

        const results = await Promise.allSettled(loadPromises);
        const loadedCount = results.filter(r => r.status === 'fulfilled' && r.value).length;

        console.log(`✅ Auto-discovery complete: ${loadedCount} collections loaded`);
        return Array.from(this.collections.values());
    }

    /**
     * Load a specific collection from the collections/ folder
     */
    async loadCollection(filename) {
        const fullPath = this.baseCollectionPath + filename;

        // Avoid duplicate loading
        if (this.loadingPromises.has(filename)) {
            return this.loadingPromises.get(filename);
        }

        const loadPromise = this.fetchCollectionFile(fullPath, filename);
        this.loadingPromises.set(filename, loadPromise);

        try {
            const collection = await loadPromise;
            this.collections.set(filename, collection);
            console.log(`📋 Loaded collection: ${collection.name} (${collection.variations.length} variations)`);
            return collection;
        } catch (error) {
            console.warn(`❌ Failed to load collection ${filename}:`, error.message);
            this.loadingPromises.delete(filename);
            throw error;
        }
    }

    /**
     * Fetch and parse a collection file
     */
    async fetchCollectionFile(fullPath, filename) {
        const response = await fetch(fullPath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Validate collection format (support both old and new formats)
        if (!data.type || (data.type !== 'vib3plus-collection' && data.type !== 'holographic-collection')) {
            throw new Error('Invalid collection format: missing or wrong type');
        }

        if (!data.variations || !Array.isArray(data.variations)) {
            throw new Error('Invalid collection format: missing variations array');
        }

        // Migrate old holographic collections to VIB3+ format
        if (data.type === 'holographic-collection') {
            data.type = 'vib3plus-collection';
            data.variations = data.variations.map(v => this.migrateVariation(v));
        }

        // Add metadata
        data.filename = filename;
        data.loadedAt = new Date().toISOString();

        return data;
    }

    /**
     * Migrate old holographic variation to VIB3+ format
     */
    migrateVariation(oldVariation) {
        return {
            name: oldVariation.name || 'Migrated Variation',
            system: 'holographic', // Default to holographic for old variations
            parameters: {
                geometry: oldVariation.parameters?.geometryType || 0,
                rot4dXY: 0,
                rot4dXZ: 0,
                rot4dYZ: 0,
                rot4dXW: oldVariation.parameters?.rot4dXW || 0,
                rot4dYW: oldVariation.parameters?.rot4dYW || 0,
                rot4dZW: oldVariation.parameters?.rot4dZW || 0,
                gridDensity: oldVariation.parameters?.density || 15,
                morphFactor: oldVariation.parameters?.morph || 1.0,
                chaos: oldVariation.parameters?.chaos || 0.2,
                speed: oldVariation.parameters?.speed || 1.0,
                hue: oldVariation.parameters?.hue || 200,
                intensity: oldVariation.parameters?.intensity || 0.5,
                saturation: oldVariation.parameters?.saturation || 0.8,
                dimension: 3.5
            }
        };
    }

    /**
     * Get all loaded collections
     */
    getAllCollections() {
        return Array.from(this.collections.values());
    }

    /**
     * Get a specific collection by filename
     */
    getCollection(filename) {
        return this.collections.get(filename);
    }

    /**
     * Get all variations from all collections (flattened)
     */
    getAllVariations() {
        const allVariations = [];
        let currentId = 0;

        for (const collection of this.collections.values()) {
            for (const variation of collection.variations) {
                allVariations.push({
                    ...variation,
                    id: currentId++,
                    collectionName: collection.name,
                    collectionFilename: collection.filename,
                    isFromCollection: true
                });
            }
        }

        return allVariations;
    }

    /**
     * Get variations filtered by system
     */
    getVariationsBySystem(systemName) {
        return this.getAllVariations().filter(v => v.system === systemName);
    }

    /**
     * Get variations filtered by geometry type
     */
    getVariationsByGeometry(geometryIndex) {
        return this.getAllVariations().filter(v => v.parameters.geometry === geometryIndex);
    }

    /**
     * Save a new collection to the collections/ folder
     */
    async saveCollection(collection, filename) {
        // Validate filename
        if (!filename.endsWith('.json')) {
            filename += '.json';
        }

        // Ensure proper collection format
        const formattedCollection = {
            name: collection.name || 'Unnamed Collection',
            description: collection.description || '',
            version: '1.0',
            type: 'vib3plus-collection',
            profileName: collection.profileName || 'VIB3+ Unified Systems',
            systems: ['quantum', 'faceted', 'holographic'],
            totalVariations: collection.variations.length,
            created: new Date().toISOString(),
            variations: collection.variations.map(v => ({
                name: v.name || 'Unnamed Variation',
                system: v.system || 'quantum',
                parameters: {
                    geometry: v.parameters.geometry || 0,
                    rot4dXY: v.parameters.rot4dXY || 0,
                    rot4dXZ: v.parameters.rot4dXZ || 0,
                    rot4dYZ: v.parameters.rot4dYZ || 0,
                    rot4dXW: v.parameters.rot4dXW || 0,
                    rot4dYW: v.parameters.rot4dYW || 0,
                    rot4dZW: v.parameters.rot4dZW || 0,
                    gridDensity: v.parameters.gridDensity || 15,
                    morphFactor: v.parameters.morphFactor || 1.0,
                    chaos: v.parameters.chaos || 0.2,
                    speed: v.parameters.speed || 1.0,
                    hue: v.parameters.hue || 200,
                    intensity: v.parameters.intensity || 0.5,
                    saturation: v.parameters.saturation || 0.8,
                    dimension: v.parameters.dimension || 3.5
                }
            }))
        };

        // Convert to JSON
        const jsonData = JSON.stringify(formattedCollection, null, 2);

        // Create download (since we can't write directly to collections/)
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`💾 Collection saved: ${filename}`);
        console.log(`📁 To use: Move ${filename} to collections/ folder and refresh`);

        return formattedCollection;
    }

    /**
     * Create a collection from custom variations
     */
    createCustomCollection(customVariations, name, description) {
        const collection = {
            name: name || `VIB3+ Custom Collection ${new Date().toLocaleDateString()}`,
            description: description || 'User-created custom variations across all 3 systems',
            version: '1.0',
            type: 'vib3plus-collection',
            profileName: 'VIB3+ Unified Systems',
            systems: ['quantum', 'faceted', 'holographic'],
            totalVariations: customVariations.length,
            created: new Date().toISOString(),
            variations: customVariations
        };

        return collection;
    }

    /**
     * Import collection from JSON file
     */
    async importCollectionFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Validate and migrate if needed
                    if (data.type === 'holographic-collection') {
                        data.type = 'vib3plus-collection';
                        data.variations = data.variations.map(v => this.migrateVariation(v));
                    }

                    if (data.type !== 'vib3plus-collection') {
                        throw new Error('Invalid collection type');
                    }

                    // Add to collections
                    const filename = file.name;
                    data.filename = filename;
                    data.loadedAt = new Date().toISOString();

                    this.collections.set(filename, data);
                    console.log(`📥 Imported collection: ${data.name}`);

                    resolve(data);
                } catch (error) {
                    reject(new Error(`Failed to parse collection: ${error.message}`));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Get collection statistics
     */
    getStatistics() {
        const collections = Array.from(this.collections.values());
        const allVariations = this.getAllVariations();

        const stats = {
            totalCollections: collections.length,
            totalVariations: allVariations.length,
            systemBreakdown: {
                quantum: allVariations.filter(v => v.system === 'quantum').length,
                faceted: allVariations.filter(v => v.system === 'faceted').length,
                holographic: allVariations.filter(v => v.system === 'holographic').length
            },
            geometryBreakdown: {},
            collections: collections.map(c => ({
                name: c.name,
                filename: c.filename,
                variationCount: c.variations.length,
                created: c.created
            }))
        };

        // Count variations by geometry type (0-23)
        for (let i = 0; i < 24; i++) {
            stats.geometryBreakdown[i] = allVariations.filter(
                v => v.parameters.geometry === i
            ).length;
        }

        return stats;
    }

    /**
     * Search variations by name or description
     */
    searchVariations(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllVariations().filter(v =>
            v.name?.toLowerCase().includes(lowerQuery) ||
            v.system?.toLowerCase().includes(lowerQuery) ||
            v.collectionName?.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get featured variations (highly rated or curated)
     */
    getFeaturedVariations() {
        const baseCollection = this.getCollection('base-variations.json');
        if (baseCollection) {
            return baseCollection.variations.slice(0, 12);
        }
        return this.getAllVariations().slice(0, 12);
    }

    /**
     * Clear all collections
     */
    clearCollections() {
        this.collections.clear();
        this.loadingPromises.clear();
        console.log('🗑️ All collections cleared');
    }

    /**
     * Validate collection format
     */
    validateCollection(collection) {
        if (!collection.type || collection.type !== 'vib3plus-collection') {
            return { valid: false, error: 'Invalid collection type' };
        }

        if (!collection.variations || !Array.isArray(collection.variations)) {
            return { valid: false, error: 'Missing variations array' };
        }

        // Validate each variation
        for (const variation of collection.variations) {
            if (!variation.system || !['quantum', 'faceted', 'holographic'].includes(variation.system)) {
                return { valid: false, error: `Invalid system: ${variation.system}` };
            }

            if (!variation.parameters) {
                return { valid: false, error: 'Missing parameters object' };
            }

            const params = variation.parameters;
            if (params.geometry < 0 || params.geometry > 23) {
                return { valid: false, error: `Invalid geometry index: ${params.geometry}` };
            }

            // Validate 6D rotation parameters
            const rotParams = ['rot4dXY', 'rot4dXZ', 'rot4dYZ', 'rot4dXW', 'rot4dYW', 'rot4dZW'];
            for (const rotParam of rotParams) {
                if (params[rotParam] !== undefined && (params[rotParam] < 0 || params[rotParam] > 6.28)) {
                    return { valid: false, error: `Invalid rotation parameter: ${rotParam}` };
                }
            }
        }

        return { valid: true };
    }
}
