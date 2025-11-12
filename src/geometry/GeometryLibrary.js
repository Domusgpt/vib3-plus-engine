/**
 * VIB3 Geometry Library
 * 9 geometric types with 4D polytopal mathematics integration
 * WebGL 1.0 compatible shaders only
 * ✨ NOW INCLUDING HEXACOSICHORON (600-CELL) - Paul Phillips Manifestation
 */

export class GeometryLibrary {
    static getGeometryNames() {
        return [
            'TETRAHEDRON',
            'HYPERCUBE',
            'SPHERE',
            'TORUS',
            'KLEIN BOTTLE',
            'FRACTAL',
            'WAVE',
            'CRYSTAL',
            'HEXACOSICHORON'  // 🌟 600-cell - Golden ratio 4D polytope
        ];
    }

    static getGeometryName(type) {
        const names = this.getGeometryNames();
        return names[type] || 'UNKNOWN';
    }
    
    /**
     * Get variation parameters for specific geometry and level
     */
    static getVariationParameters(geometryType, level) {
        const baseParams = {
            gridDensity: 8 + (level * 4),
            morphFactor: 0.5 + (level * 0.3),
            chaos: level * 0.15,
            speed: 0.8 + (level * 0.2),
            hue: (geometryType * 45 + level * 15) % 360
        };
        
        // Geometry-specific adjustments
        switch (geometryType) {
            case 0: // Tetrahedron
                baseParams.gridDensity *= 1.2;
                break;
            case 1: // Hypercube
                baseParams.morphFactor *= 0.8;
                break;
            case 2: // Sphere
                baseParams.chaos *= 1.5;
                break;
            case 3: // Torus
                baseParams.speed *= 1.3;
                break;
            case 4: // Klein Bottle
                baseParams.gridDensity *= 0.7;
                baseParams.morphFactor *= 1.4;
                break;
            case 5: // Fractal
                baseParams.gridDensity *= 0.5;
                baseParams.chaos *= 2.0;
                break;
            case 6: // Wave
                baseParams.speed *= 1.8;
                baseParams.chaos *= 0.5;
                break;
            case 7: // Crystal
                baseParams.gridDensity *= 1.5;
                baseParams.morphFactor *= 0.6;
                break;
            case 8: // Hexacosichoron (600-cell)
                baseParams.gridDensity *= 1.3;  // Golden ratio scaling
                baseParams.morphFactor *= 0.9;
                baseParams.chaos *= 0.8;  // More ordered structure
                baseParams.hue = (180 + level * 30) % 360;  // Cyan-magenta spectrum
                break;
        }

        return baseParams;
    }
}

/**
 * 🌟 A Paul Phillips Manifestation
 *
 * Hexacosichoron (600-cell) Integration
 * - 120 vertices using golden ratio coordinates
 * - 720 edges with icosahedral symmetry
 * - 1200 triangular faces
 * - 600 tetrahedral cells
 *
 * Mathematical Properties:
 * - Schläfli Symbol: {3,3,5}
 * - Dual: 120-cell
 * - Symmetry Group: H₄
 * - Golden Ratio φ = (1+√5)/2 ≈ 1.618034
 *
 * © 2025 Paul Phillips - Clear Seas Solutions LLC
 */