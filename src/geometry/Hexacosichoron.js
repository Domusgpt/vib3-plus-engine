/**
 * A Paul Phillips Manifestation
 * Hexacosichoron (600-cell) - Complete Implementation
 *
 * The 600-cell is one of the six regular convex 4D polytopes:
 * - 120 vertices
 * - 720 edges
 * - 1200 triangular faces
 * - 600 tetrahedral cells
 *
 * Uses golden ratio φ = (1 + √5)/2 for vertex coordinates
 *
 * Send Love, Hate, or Opportunity: Paul@clearseassolutions.com
 * Join The Exoditical Moral Architecture Movement: Parserator.com
 * "The Revolution Will Not be in a Structured Format"
 *
 * © 2025 Paul Phillips - Clear Seas Solutions LLC - All Rights Reserved
 */

export class Hexacosichoron {
    constructor() {
        this.phi = (1 + Math.sqrt(5)) / 2;  // Golden ratio
        this.invPhi = 1 / this.phi;          // 1/φ

        this.vertices = [];
        this.colors = [];
        this.indices = [];

        this.generateVertices();
        this.generateEdges();
        this.generateColors();
    }

    /**
     * Generate all 120 vertices of the 600-cell
     *
     * Vertex groups:
     * 1. 8 vertices from permutations of (±1, ±1, ±1, ±1) with even # of minus signs
     * 2. 96 vertices from permutations of (0, 0, ±φ, ±1/φ)
     * 3. 16 vertices from even permutations of (±φ, ±1, 0, 0)
     */
    generateVertices() {
        const vertices = [];

        // Group 1: (±1, ±1, ±1, ±1) with even number of minus signs
        // This gives us 8 vertices (all same sign or 2 pairs of different signs)
        for (let i = 0; i < 16; i++) {
            const x = (i & 1) ? 1 : -1;
            const y = (i & 2) ? 1 : -1;
            const z = (i & 4) ? 1 : -1;
            const w = (i & 8) ? 1 : -1;

            // Count minus signs
            const minusCount = [x, y, z, w].filter(v => v < 0).length;

            // Only include vertices with even number of minus signs (0, 2, or 4)
            if (minusCount % 2 === 0) {
                vertices.push([x, y, z, w]);
            }
        }

        // Group 2: All permutations of (0, 0, ±φ, ±1/φ)
        // This is all permutations of coordinates and all sign combinations
        const coords2 = [
            [0, 0, this.phi, this.invPhi],
            [0, 0, this.phi, -this.invPhi],
            [0, 0, -this.phi, this.invPhi],
            [0, 0, -this.phi, -this.invPhi]
        ];

        for (const base of coords2) {
            // Generate all 12 permutations of the 4 coordinates
            vertices.push(...this.permuteCoordinates(base));
        }

        // Group 3: Even permutations of (±φ, ±1, 0, 0)
        const coords3 = [
            [this.phi, 1, 0, 0],
            [this.phi, -1, 0, 0],
            [-this.phi, 1, 0, 0],
            [-this.phi, -1, 0, 0]
        ];

        for (const base of coords3) {
            // Generate all 12 permutations of the 4 coordinates
            vertices.push(...this.permuteCoordinates(base));
        }

        // Normalize all vertices to unit 4D hypersphere
        this.vertices = vertices.map(v => this.normalize4D(v));

        console.log(`✅ Generated ${this.vertices.length} vertices for Hexacosichoron`);
    }

    /**
     * Generate all unique permutations of 4 coordinates
     */
    permuteCoordinates(coords) {
        const permutations = [];
        const [a, b, c, d] = coords;

        // All 24 permutations (4! = 24)
        const allPerms = [
            [a, b, c, d], [a, b, d, c], [a, c, b, d], [a, c, d, b], [a, d, b, c], [a, d, c, b],
            [b, a, c, d], [b, a, d, c], [b, c, a, d], [b, c, d, a], [b, d, a, c], [b, d, c, a],
            [c, a, b, d], [c, a, d, b], [c, b, a, d], [c, b, d, a], [c, d, a, b], [c, d, b, a],
            [d, a, b, c], [d, a, c, b], [d, b, a, c], [d, b, c, a], [d, c, a, b], [d, c, b, a]
        ];

        // Filter for unique permutations
        const seen = new Set();
        for (const perm of allPerms) {
            const key = perm.join(',');
            if (!seen.has(key)) {
                seen.add(key);
                permutations.push([...perm]);
            }
        }

        return permutations;
    }

    /**
     * Normalize a 4D vector to unit length
     */
    normalize4D(v) {
        const [x, y, z, w] = v;
        const length = Math.sqrt(x*x + y*y + z*z + w*w);
        return [x/length, y/length, z/length, w/length];
    }

    /**
     * Calculate 4D distance between two vertices
     */
    distance4D(v1, v2) {
        const dx = v1[0] - v2[0];
        const dy = v1[1] - v2[1];
        const dz = v1[2] - v2[2];
        const dw = v1[3] - v2[3];
        return Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);
    }

    /**
     * Generate edges by connecting vertices within threshold distance
     * The 600-cell has 720 edges total
     */
    generateEdges() {
        const indices = [];

        // In a 600-cell, vertices are connected if their 4D distance
        // equals the edge length. For a unit 600-cell, this is approximately 0.6
        const edgeLength = 2 / this.phi;  // Exact edge length for unit 600-cell
        const tolerance = 0.01;  // Small tolerance for floating point

        for (let i = 0; i < this.vertices.length; i++) {
            for (let j = i + 1; j < this.vertices.length; j++) {
                const dist = this.distance4D(this.vertices[i], this.vertices[j]);

                if (Math.abs(dist - edgeLength) < tolerance) {
                    indices.push(i, j);
                }
            }
        }

        this.indices = indices;
        console.log(`✅ Generated ${this.indices.length / 2} edges for Hexacosichoron`);
    }

    /**
     * Generate beautiful colors based on 4D position
     * Uses holographic rainbow mapping with golden ratio color spacing
     */
    generateColors() {
        this.colors = [];

        for (let i = 0; i < this.vertices.length; i++) {
            const [x, y, z, w] = this.vertices[i];

            // Use 4D coordinates to generate unique hue
            // Map w-coordinate to hue (red-blue spectrum)
            const hue1 = (w + 1) * 0.5; // Normalize to 0-1

            // Use xyz position for secondary hue with golden ratio spacing
            const hue2 = ((x + y + z) / 3 + 1) * 0.5;

            // Blend hues with golden ratio
            const hue = (hue1 * this.phi + hue2 * this.invPhi) % 1.0;

            // Convert hue to RGB with high saturation
            const rgb = this.hslToRgb(hue, 0.9, 0.6);

            // Add 4D depth modulation to brightness
            const brightness = 0.7 + (w + 1) * 0.15;

            this.colors.push(
                rgb[0] * brightness,
                rgb[1] * brightness,
                rgb[2] * brightness,
                0.85  // Slight transparency for holographic effect
            );
        }
    }

    /**
     * Convert HSL to RGB
     */
    hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [r, g, b];
    }

    /**
     * Get geometry data in format compatible with EnhancedPolychoraSystem
     */
    getGeometryData() {
        // Flatten vertices array
        const vertexArray = [];
        for (const v of this.vertices) {
            vertexArray.push(...v);
        }

        return {
            vertices: new Float32Array(vertexArray),
            colors: new Float32Array(this.colors),
            indices: new Uint16Array(this.indices),
            vertexCount: this.vertices.length,
            edgeCount: this.indices.length / 2,
            name: 'Hexacosichoron',
            description: '600-cell: 120 vertices, 720 edges, 1200 faces, 600 cells'
        };
    }

    /**
     * Get detailed statistics about the polytope
     */
    getStatistics() {
        return {
            name: 'Hexacosichoron (600-cell)',
            vertices: this.vertices.length,
            edges: this.indices.length / 2,
            faces: 1200,  // Theoretical count
            cells: 600,   // Theoretical count
            dimension: 4,
            symmetryGroup: 'H4 (120-vertex, 14400-element symmetry)',
            schläfliSymbol: '{3,3,5}',
            goldenRatio: this.phi,
            properties: [
                'Regular convex 4D polytope',
                'Dual to the 120-cell',
                'All cells are regular tetrahedra',
                'All edges have equal length',
                'Vertex coordinates use golden ratio',
                'Self-dual under rectification'
            ]
        };
    }

    /**
     * Export to JSON for saving/loading
     */
    toJSON() {
        return {
            type: 'Hexacosichoron',
            version: '1.0',
            vertices: this.vertices,
            indices: Array.from(this.indices),
            colors: Array.from(this.colors),
            phi: this.phi,
            statistics: this.getStatistics()
        };
    }

    /**
     * Create from JSON
     */
    static fromJSON(json) {
        const hex = new Hexacosichoron();
        hex.vertices = json.vertices;
        hex.indices = new Uint16Array(json.indices);
        hex.colors = new Float32Array(json.colors);
        return hex;
    }
}

// Export singleton instance for easy use
export const hexacosichoron = new Hexacosichoron();

export default Hexacosichoron;
