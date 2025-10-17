/**
 * VIB34D Integrated Holographic Visualizer
 * WebGL-based renderer for individual holographic layers
 */

import { GeometryLibrary } from '../geometry/GeometryLibrary.js';

export class IntegratedHolographicVisualizer {
    constructor(canvasId, role, reactivity, variant) {
        this.canvas = document.getElementById(canvasId);
        this.role = role;
        this.reactivity = reactivity;
        this.variant = variant;
        
        if (!this.canvas) {
            console.error(`Canvas ${canvasId} not found`);
            return;
        }
        let rect = this.canvas.getBoundingClientRect();
        const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
        
        // Store context options for later use
        this.contextOptions = {
            alpha: true,
            depth: true,
            stencil: false,
            antialias: false,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false
        };
        
        // CRITICAL FIX: Ensure canvas is properly sized BEFORE creating WebGL context
        this.ensureCanvasSizedThenInitWebGL(rect, devicePixelRatio);
        
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.mouseIntensity = 0.0;
        this.clickIntensity = 0.0;
        this.startTime = Date.now();
        
        // Default parameters
        this.params = {
            geometry: 0,
            gridDensity: 15,
            morphFactor: 1.0,
            chaos: 0.2,
            speed: 1.0,
            hue: 200,
            intensity: 0.5,
            saturation: 0.8,
            dimension: 3.5,
            rot4dXY: 0.0,
            rot4dXZ: 0.0,
            rot4dYZ: 0.0,
            rot4dXW: 0.0,
            rot4dYW: 0.0,
            rot4dZW: 0.0
        };
        
        // Initialization now happens in ensureCanvasSizedThenInitWebGL after sizing
        // this.init(); // MOVED
    }
    
    /**
     * CRITICAL FIX: Ensure canvas is properly sized before creating WebGL context
     */
    async ensureCanvasSizedThenInitWebGL(rect, devicePixelRatio) {
        // If canvas has no dimensions, wait for layout or use viewport
        if (rect.width === 0 || rect.height === 0) {
            // Wait for layout with promise
            await new Promise(resolve => {
                setTimeout(() => {
                    rect = this.canvas.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) {
                        // Use viewport dimensions as fallback
                        const viewWidth = window.innerWidth;
                        const viewHeight = window.innerHeight;
                        this.canvas.width = viewWidth * devicePixelRatio;
                        this.canvas.height = viewHeight * devicePixelRatio;
                        
                        if (window.mobileDebug) {
                            window.mobileDebug.log(`📐 Canvas ${this.canvas.id}: Using viewport fallback ${this.canvas.width}x${this.canvas.height}`);
                        }
                    } else {
                        this.canvas.width = rect.width * devicePixelRatio;
                        this.canvas.height = rect.height * devicePixelRatio;
                        
                        if (window.mobileDebug) {
                            window.mobileDebug.log(`📐 Canvas ${this.canvas.id}: Layout ready ${this.canvas.width}x${this.canvas.height}`);
                        }
                    }
                    resolve();
                }, 100);
            });
        } else {
            this.canvas.width = rect.width * devicePixelRatio;
            this.canvas.height = rect.height * devicePixelRatio;
            
            if (window.mobileDebug) {
                window.mobileDebug.log(`📐 Canvas ${this.canvas.id}: ${this.canvas.width}x${this.canvas.height} (DPR: ${devicePixelRatio})`);
            }
        }
        
        // NOW create WebGL context with properly sized canvas
        this.createWebGLContext();
        
        // Initialize rendering pipeline
        if (this.gl) {
            this.init();
        }
    }
    
    /**
     * Create WebGL context after canvas is properly sized
     */
    createWebGLContext() {
        // CRITICAL FIX: Check if context already exists from CanvasManager
        let existingContext = this.canvas.getContext('webgl2') || 
                             this.canvas.getContext('webgl') || 
                             this.canvas.getContext('experimental-webgl');
        
        if (existingContext && !existingContext.isContextLost()) {
            console.log(`🔄 Reusing existing WebGL context for ${this.canvas.id}`);
            this.gl = existingContext;
            return;
        }
        
        // Try WebGL2 first (better mobile support), then WebGL1
        this.gl = this.canvas.getContext('webgl2', this.contextOptions) || 
                  this.canvas.getContext('webgl', this.contextOptions) ||
                  this.canvas.getContext('experimental-webgl', this.contextOptions);
        
        if (!this.gl) {
            console.error(`WebGL not supported for ${this.canvas.id}`);
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ WebGL context failed for ${this.canvas.id} (size: ${this.canvas.width}x${this.canvas.height})`);
            }
            // Show user-friendly error instead of white screen
            this.showWebGLError();
            return;
        } else {
            if (window.mobileDebug) {
                const version = this.gl.getParameter(this.gl.VERSION);
                window.mobileDebug.log(`✅ WebGL context created for ${this.canvas.id}: ${version} (size: ${this.canvas.width}x${this.canvas.height})`);
            }
        }
    }

    /**
     * Initialize WebGL rendering pipeline
     */
    init() {
        this.initShaders();
        this.initBuffers();
        this.resize();
    }
    
    /**
     * Initialize shaders with 4D mathematics
     */
    initShaders() {
        const vertexShaderSource = `attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;
        
        const fragmentShaderSource = `precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_geometry;
uniform float u_gridDensity;
uniform float u_morphFactor;
uniform float u_chaos;
uniform float u_speed;
uniform float u_hue;
uniform float u_intensity;
uniform float u_saturation;
uniform float u_dimension;
uniform float u_rot4dXY;
uniform float u_rot4dXZ;
uniform float u_rot4dYZ;
uniform float u_rot4dXW;
uniform float u_rot4dYW;
uniform float u_rot4dZW;
uniform float u_mouseIntensity;
uniform float u_clickIntensity;
uniform float u_roleIntensity;

// 6D rotation matrices - 3D space rotations (XY, XZ, YZ)
mat4 rotateXY(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0);
}

mat4 rotateXZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(c, 0.0, s, 0.0, 0.0, 1.0, 0.0, 0.0, -s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0);
}

mat4 rotateYZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0);
}

// 4D hyperspace rotations (XW, YW, ZW)
mat4 rotateXW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(c, 0.0, 0.0, -s, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, s, 0.0, 0.0, c);
}

mat4 rotateYW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
}

mat4 rotateZW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c);
}

vec3 project4Dto3D(vec4 p) {
    float w = 2.5 / (2.5 + p.w);
    return vec3(p.x * w, p.y * w, p.z * w);
}

// ========================================
// POLYTOPE CORE WARP FUNCTIONS (24 Geometries)
// ========================================
// Wraps geometry through 4D hypersphere (geometries 8-15)
vec3 warpHypersphereCore(vec3 p, int geometryIndex, vec2 mouseDelta) {
    float radius = length(p);
    float morphBlend = clamp(u_morphFactor * 0.6 + (u_dimension - 3.0) * 0.25, 0.0, 2.0);
    float w = sin(radius * (1.3 + float(geometryIndex) * 0.12) + u_time * 0.0008 * u_speed);
    w *= (0.4 + morphBlend * 0.45);

    vec4 p4d = vec4(p * (1.0 + morphBlend * 0.2), w);

    // Apply 6D rotation in 4D space
    p4d = rotateXY(u_rot4dXY) * p4d;
    p4d = rotateXZ(u_rot4dXZ) * p4d;
    p4d = rotateYZ(u_rot4dYZ) * p4d;
    p4d = rotateXW(u_rot4dXW) * p4d;
    p4d = rotateYW(u_rot4dYW) * p4d;
    p4d = rotateZW(u_rot4dZW) * p4d;

    vec3 projected = project4Dto3D(p4d);
    return mix(p, projected, clamp(0.45 + morphBlend * 0.35, 0.0, 1.0));
}

// Wraps geometry through 4D hypertetrahedron (geometries 16-23)
vec3 warpHypertetraCore(vec3 p, int geometryIndex, vec2 mouseDelta) {
    vec3 c1 = normalize(vec3(1.0, 1.0, 1.0));
    vec3 c2 = normalize(vec3(-1.0, -1.0, 1.0));
    vec3 c3 = normalize(vec3(-1.0, 1.0, -1.0));
    vec3 c4 = normalize(vec3(1.0, -1.0, -1.0));

    float morphBlend = clamp(u_morphFactor * 0.8 + (u_dimension - 3.0) * 0.2, 0.0, 2.0);
    float basisMix = dot(p, c1) * 0.14 + dot(p, c2) * 0.1 + dot(p, c3) * 0.08;
    float w = sin(basisMix * 5.5 + u_time * 0.0009 * u_speed);
    w *= cos(dot(p, c4) * 4.2 - u_time * 0.0007 * u_speed);
    w *= (0.5 + morphBlend * 0.4);

    vec3 offset = vec3(dot(p, c1), dot(p, c2), dot(p, c3)) * 0.1 * morphBlend;
    vec4 p4d = vec4(p + offset, w);

    // Apply 6D rotation in 4D space
    p4d = rotateXY(u_rot4dXY) * p4d;
    p4d = rotateXZ(u_rot4dXZ) * p4d;
    p4d = rotateYZ(u_rot4dYZ) * p4d;
    p4d = rotateXW(u_rot4dXW) * p4d;
    p4d = rotateYW(u_rot4dYW) * p4d;
    p4d = rotateZW(u_rot4dZW) * p4d;

    vec3 projected = project4Dto3D(p4d);

    float planeInfluence = min(min(abs(dot(p, c1)), abs(dot(p, c2))), min(abs(dot(p, c3)), abs(dot(p, c4))));
    vec3 blended = mix(p, projected, clamp(0.45 + morphBlend * 0.35, 0.0, 1.0));
    return mix(blended, blended * (1.0 - planeInfluence * 0.55), 0.2 + morphBlend * 0.2);
}

// Applies polytope core warp based on geometry index (0-23)
// 0-7: Base (no warp), 8-15: Hypersphere, 16-23: Hypertetrahedron
vec3 applyCoreWarp(vec3 p, float geometryType, vec2 mouseDelta) {
    float totalBase = 8.0;
    float coreFloat = floor(geometryType / totalBase);
    int coreIndex = int(clamp(coreFloat, 0.0, 2.0));
    float baseGeomFloat = mod(geometryType, totalBase);
    int geometryIndex = int(clamp(floor(baseGeomFloat + 0.5), 0.0, totalBase - 1.0));

    if (coreIndex == 1) {
        return warpHypersphereCore(p, geometryIndex, mouseDelta);
    }
    if (coreIndex == 2) {
        return warpHypertetraCore(p, geometryIndex, mouseDelta);
    }
    return p;
}
// ========================================

// Simplified geometry functions for WebGL 1.0 compatibility (ORIGINAL FACETED)
// NOW SUPPORTS 24 GEOMETRIES: Decodes geometry index to base geometry (0-7)
float geometryFunction(vec4 p) {
    // Decode geometry: base = geometry % 8
    float totalBase = 8.0;
    float baseGeomFloat = mod(u_geometry, totalBase);
    int geomType = int(clamp(floor(baseGeomFloat + 0.5), 0.0, totalBase - 1.0));
    
    if (geomType == 0) {
        // Tetrahedron lattice - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
    }
    else if (geomType == 1) {
        // Hypercube lattice - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        float minDist = min(min(dist.x, dist.y), min(dist.z, dist.w));
        return minDist * u_morphFactor;
    }
    else if (geomType == 2) {
        // Sphere lattice - UNIFORM GRID DENSITY
        float r = length(p);
        float density = u_gridDensity * 0.08;
        float spheres = abs(fract(r * density) - 0.5) * 2.0;
        float theta = atan(p.y, p.x);
        float harmonics = sin(theta * 3.0) * 0.2;
        return (spheres + harmonics) * u_morphFactor;
    }
    else if (geomType == 3) {
        // Torus lattice - UNIFORM GRID DENSITY
        float r1 = length(p.xy) - 2.0;
        float torus = length(vec2(r1, p.z)) - 0.8;
        float lattice = sin(p.x * u_gridDensity * 0.08) * sin(p.y * u_gridDensity * 0.08);
        return (torus + lattice * 0.3) * u_morphFactor;
    }
    else if (geomType == 4) {
        // Klein bottle lattice - UNIFORM GRID DENSITY
        float u = atan(p.y, p.x);
        float v = atan(p.w, p.z);
        float dist = length(p) - 2.0;
        float lattice = sin(u * u_gridDensity * 0.08) * sin(v * u_gridDensity * 0.08);
        return (dist + lattice * 0.4) * u_morphFactor;
    }
    else if (geomType == 5) {
        // Fractal lattice - NOW WITH UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        pos = abs(pos * 2.0 - 1.0);
        float dist = length(max(abs(pos) - 1.0, 0.0));
        return dist * u_morphFactor;
    }
    else if (geomType == 6) {
        // Wave lattice - UNIFORM GRID DENSITY
        float freq = u_gridDensity * 0.08;
        float time = u_time * 0.001 * u_speed;
        float wave1 = sin(p.x * freq + time);
        float wave2 = sin(p.y * freq + time * 1.3);
        float wave3 = sin(p.z * freq * 0.8 + time * 0.7); // Add Z-dimension waves
        float interference = wave1 * wave2 * wave3;
        return interference * u_morphFactor;
    }
    else if (geomType == 7) {
        // Crystal lattice - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08) - 0.5;
        float cube = max(max(abs(pos.x), abs(pos.y)), max(abs(pos.z), abs(pos.w)));
        return cube * u_morphFactor;
    }
    else {
        // Default hypercube - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
    }
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);

    // 4D position with mouse interaction - NOW USING SPEED PARAMETER
    float timeSpeed = u_time * 0.0001 * u_speed;
    vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
    pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;

    // Apply 6D rotations - 3D space rotations first, then 4D hyperspace
    pos = rotateXY(u_rot4dXY) * pos;
    pos = rotateXZ(u_rot4dXZ) * pos;
    pos = rotateYZ(u_rot4dYZ) * pos;
    pos = rotateXW(u_rot4dXW) * pos;
    pos = rotateYW(u_rot4dYW) * pos;
    pos = rotateZW(u_rot4dZW) * pos;

    // POLYTOPE WARP: Apply 4D polytope core transformation (24-geometry system)
    // Decode geometry: 0-7 Base, 8-15 Hypersphere, 16-23 Hypertetrahedron
    vec3 basePoint = project4Dto3D(pos);
    vec3 warpedPoint = applyCoreWarp(basePoint, u_geometry, u_mouse - 0.5);

    // Convert warped 3D back to 4D for geometry evaluation
    vec4 warpedPos = vec4(warpedPoint, pos.w);

    // Calculate geometry value using WARPED position
    float value = geometryFunction(warpedPos);
    
    // Apply chaos
    float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
    value += noise * u_chaos;
    
    // Color based on geometry value and hue with user-controlled intensity/saturation
    float geometryIntensity = 1.0 - clamp(abs(value), 0.0, 1.0);
    geometryIntensity += u_clickIntensity * 0.3;
    
    // Apply user intensity control
    float finalIntensity = geometryIntensity * u_intensity;
    
    float hue = u_hue / 360.0 + value * 0.1;
    
    // Create color with saturation control
    vec3 baseColor = vec3(
        sin(hue * 6.28318 + 0.0) * 0.5 + 0.5,
        sin(hue * 6.28318 + 2.0943) * 0.5 + 0.5,
        sin(hue * 6.28318 + 4.1887) * 0.5 + 0.5
    );
    
    // Apply saturation (mix with grayscale)
    float gray = (baseColor.r + baseColor.g + baseColor.b) / 3.0;
    vec3 color = mix(vec3(gray), baseColor, u_saturation) * finalIntensity;
    
    gl_FragColor = vec4(color, finalIntensity * u_roleIntensity);
}`;
        
        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
            geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
            gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
            morphFactor: this.gl.getUniformLocation(this.program, 'u_morphFactor'),
            chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
            speed: this.gl.getUniformLocation(this.program, 'u_speed'),
            hue: this.gl.getUniformLocation(this.program, 'u_hue'),
            intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
            saturation: this.gl.getUniformLocation(this.program, 'u_saturation'),
            dimension: this.gl.getUniformLocation(this.program, 'u_dimension'),
            rot4dXY: this.gl.getUniformLocation(this.program, 'u_rot4dXY'),
            rot4dXZ: this.gl.getUniformLocation(this.program, 'u_rot4dXZ'),
            rot4dYZ: this.gl.getUniformLocation(this.program, 'u_rot4dYZ'),
            rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
            rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
            rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW'),
            mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
            clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity'),
            roleIntensity: this.gl.getUniformLocation(this.program, 'u_roleIntensity')
        };
    }
    
    /**
     * Create WebGL program from shaders
     */
    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        if (!vertexShader || !fragmentShader) {
            return null;
        }
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking failed:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }
    
    /**
     * Create individual shader
     */
    createShader(type, source) {
        // CRITICAL FIX: Check WebGL context state before shader operations
        if (!this.gl) {
            console.error('❌ Cannot create shader: WebGL context is null');
            return null;
        }
        
        if (this.gl.isContextLost()) {
            console.error('❌ Cannot create shader: WebGL context is lost');
            return null;
        }
        
        try {
            const shader = this.gl.createShader(type);
            
            if (!shader) {
                console.error('❌ Failed to create shader object - WebGL context may be invalid');
                return null;
            }
            
            this.gl.shaderSource(shader, source);
            this.gl.compileShader(shader);
            
            if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                const error = this.gl.getShaderInfoLog(shader);
                const shaderType = type === this.gl.VERTEX_SHADER ? 'vertex' : 'fragment';
                
                // CRITICAL FIX: Show actual error instead of null
                if (error) {
                    console.error(`❌ ${shaderType} shader compilation failed:`, error);
                } else {
                    console.error(`❌ ${shaderType} shader compilation failed: WebGL returned no error info (context may be invalid)`);
                }
                
                console.error('Shader source:', source);
                this.gl.deleteShader(shader);
                return null;
            }
            
            return shader;
        } catch (error) {
            console.error('❌ Exception during shader creation:', error);
            return null;
        }
    }
    
    /**
     * Initialize vertex buffers
     */
    initBuffers() {
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        
        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }
    
    /**
     * Resize canvas and viewport
     */
    resize() {
        // Mobile-optimized canvas sizing
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for mobile performance
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        // Only resize if dimensions actually changed (mobile optimization)
        if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Show user-friendly WebGL error message
     */
    showWebGLError() {
        if (!this.canvas) return;
        
        // Try 2D canvas fallback
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            
            ctx.fillStyle = '#1a0033';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Mobile-friendly error display
            ctx.fillStyle = '#ff6b6b';
            ctx.font = `${Math.min(20, this.canvas.width / 15)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ WebGL Error', this.canvas.width / 2, this.canvas.height / 2 - 30);
            
            ctx.fillStyle = '#ffd93d';
            ctx.font = `${Math.min(14, this.canvas.width / 20)}px sans-serif`;
            
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
                ctx.fillText('Mobile device detected', this.canvas.width / 2, this.canvas.height / 2);
                ctx.fillText('Enable hardware acceleration', this.canvas.width / 2, this.canvas.height / 2 + 20);
                ctx.fillText('or try Chrome/Firefox', this.canvas.width / 2, this.canvas.height / 2 + 40);
            } else {
                ctx.fillText('Please enable WebGL', this.canvas.width / 2, this.canvas.height / 2);
                ctx.fillText('in your browser settings', this.canvas.width / 2, this.canvas.height / 2 + 20);
            }
            
            // Log to mobile debug
            if (window.mobileDebug) {
                window.mobileDebug.log(`📱 WebGL error fallback shown for canvas ${this.canvas.id}`);
            }
        } else {
            // Even 2D canvas failed - create HTML fallback
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: #1a0033;
                    color: #ff6b6b;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    font-family: sans-serif;
                    text-align: center;
                    padding: 20px;
                ">
                    <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                    <div style="font-size: 18px; margin-bottom: 10px;">Graphics Error</div>
                    <div style="font-size: 14px; color: #ffd93d;">
                        Your device doesn't support<br>
                        the required graphics features
                    </div>
                </div>
            `;
            this.canvas.parentNode.insertBefore(errorDiv, this.canvas.nextSibling);
        }
    }
    
    /**
     * Update visualization parameters
     */
    updateParameters(params) {
        this.params = { ...this.params, ...params };
    }
    
    /**
     * Update mouse interaction state
     */
    updateInteraction(x, y, intensity) {
        // Check if interactions are enabled globally
        if (window.interactivityEnabled === false) {
            // Reset to default when disabled
            this.mouseX = 0.5;
            this.mouseY = 0.5;
            this.mouseIntensity = 0.0;
            return;
        }
        
        this.mouseX = x;
        this.mouseY = y;
        this.mouseIntensity = intensity;
    }
    
    /**
     * Render frame
     */
    render() {
        if (!this.program) {
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ ${this.canvas?.id}: No WebGL program compiled`);
            }
            return;
        }
        
        if (!this.gl) {
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ ${this.canvas?.id}: No WebGL context`);
            }
            return;
        }
        
        try {
            this.resize();
            this.gl.useProgram(this.program);
            
            // CRITICAL FIX: Clear framebuffer before rendering
            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        } catch (error) {
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ ${this.canvas?.id}: WebGL render error: ${error.message}`);
            }
            return;
        }
        
        // Role-specific intensity (ORIGINAL FACETED VALUES)
        const roleIntensities = {
            'background': 0.3,
            'shadow': 0.5,
            'content': 0.8,
            'highlight': 1.0,
            'accent': 1.2
        };
        
        const time = Date.now() - this.startTime;
        
        // Set uniforms
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.time, time);
        this.gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);
        this.gl.uniform1f(this.uniforms.geometry, this.params.geometry);
        // 🎵 DIRECT AUDIO REACTIVITY - Simple and works
        let gridDensity = this.params.gridDensity;
        let hue = this.params.hue;
        let intensity = this.params.intensity;
        
        if (window.audioEnabled && window.audioReactive) {
            // Faceted audio mapping: Bass affects grid density, Mid affects hue, High affects intensity
            gridDensity += window.audioReactive.bass * 30;  // Bass makes patterns denser
            hue += window.audioReactive.mid * 60;           // Mid frequencies shift colors
            intensity += window.audioReactive.high * 0.4;   // High frequencies brighten
        }
        
        this.gl.uniform1f(this.uniforms.gridDensity, Math.min(100, gridDensity));
        this.gl.uniform1f(this.uniforms.morphFactor, this.params.morphFactor);
        this.gl.uniform1f(this.uniforms.chaos, this.params.chaos);
        this.gl.uniform1f(this.uniforms.speed, this.params.speed);
        this.gl.uniform1f(this.uniforms.hue, hue % 360);
        this.gl.uniform1f(this.uniforms.intensity, Math.min(1, intensity));
        this.gl.uniform1f(this.uniforms.saturation, this.params.saturation);
        this.gl.uniform1f(this.uniforms.dimension, this.params.dimension);
        this.gl.uniform1f(this.uniforms.rot4dXY, this.params.rot4dXY || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dXZ, this.params.rot4dXZ || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dYZ, this.params.rot4dYZ || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dXW, this.params.rot4dXW || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dYW, this.params.rot4dYW || 0.0);
        this.gl.uniform1f(this.uniforms.rot4dZW, this.params.rot4dZW || 0.0);
        this.gl.uniform1f(this.uniforms.mouseIntensity, this.mouseIntensity);
        this.gl.uniform1f(this.uniforms.clickIntensity, this.clickIntensity);
        this.gl.uniform1f(this.uniforms.roleIntensity, roleIntensities[this.role] || 1.0);
        
        try {
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            
            // Mobile success logging (only once per canvas)
            if (window.mobileDebug && !this._renderSuccessLogged) {
                window.mobileDebug.log(`✅ ${this.canvas?.id}: WebGL render successful`);
                this._renderSuccessLogged = true;
            }
        } catch (error) {
            if (window.mobileDebug) {
                window.mobileDebug.log(`❌ ${this.canvas?.id}: WebGL draw error: ${error.message}`);
            }
        }
    }
    
    /**
     * CRITICAL FIX: Reinitialize WebGL program after context recreation
     */
    reinitializeContext() {
        console.log(`🔄 Reinitializing WebGL context for ${this.canvas?.id}`);
        
        // Clear ALL old WebGL references
        this.program = null;
        this.buffer = null;
        this.uniforms = null;
        this.gl = null;
        
        // CRITICAL FIX: Don't create new context - CanvasManager already did this
        // Just get the existing context that CanvasManager created
        this.gl = this.canvas.getContext('webgl2') || 
                  this.canvas.getContext('webgl') ||
                  this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error(`❌ No WebGL context available for ${this.canvas?.id} - CanvasManager should have created one`);
            return false;
        }
        
        if (this.gl.isContextLost()) {
            console.error(`❌ WebGL context is lost for ${this.canvas?.id}`);
            return false;
        }
        
        // Reinitialize shaders and buffers if context is valid
        try {
            this.init();
            console.log(`✅ ${this.canvas?.id}: Context reinitialized successfully`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to reinitialize WebGL resources for ${this.canvas?.id}:`, error);
            return false;
        }
    }

    // Audio reactivity now handled directly in render() loop - no complex methods needed
    
    /**
     * Clean up WebGL resources
     */
    destroy() {
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
        if (this.gl && this.buffer) {
            this.gl.deleteBuffer(this.buffer);
        }
    }
}