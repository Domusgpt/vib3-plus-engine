# CLAUDE.md - VIB3+ Engine Development Track

**PROJECT**: VIB3+ Unified Visualization Engine
**LOCATION**: `/mnt/c/Users/millz/vib3-plus-engine/`
**BASE SOURCE**: GitHub branch `codex/15-34-32review-project-documents-and-provide-status-report2025-10-16`
**REFERENCE SYSTEM**: `/mnt/c/Users/millz/vib3+-engine/reference-system/`

---

## 🎯 Project Goal

Create a unified VIB3+ engine integrating **3 visualization systems** (Quantum, Faceted, Holographic) with **Gallery** and **Viewer** systems, supporting **full 6D rotation** and **24 geometries per system**.

### Core Systems:
1. **Quantum Engine** - 24 geometry variants (8 base + 8 Hypersphere + 8 Hypertetrahedron)
2. **Faceted System** - 24 geometry variants (clean 2D patterns with 4D rotation)
3. **Holographic System** - 24 geometry variants (5-layer audio-reactive)

### Integration Features:
- **Gallery System**: 100 variation slots (30 default + 70 custom)
- **Viewer Portal**: Immersive full-screen with device tilt and card bending
- **6D Rotation**: All 6 planes (XY, XZ, YZ, XW, YW, ZW)
- **Telemetry/CLI**: Event system for agentic control

---

## 📋 Development Plan

### **Phase 1: Foundation & Core Systems** ✅ IN PROGRESS

**Tasks**:
- [x] Create project directory and git repo
- [x] Copy core files from GitHub branch
- [ ] Update `Parameters.js` with 6D rotation (add XY, XZ, YZ)
- [ ] Create `FacetedSystem.js` with 24 geometry support
- [ ] Create `VIB3Engine.js` for unified system switching
- [ ] Update `GeometryLibrary.js` for 24 variant generation

**Files Being Created/Updated**:
- `src/core/Parameters.js` - Add rot4dXY, rot4dXZ, rot4dYZ
- `src/faceted/FacetedSystem.js` - NEW
- `src/core/VIB3Engine.js` - NEW (unified engine)
- `src/geometry/GeometryLibrary.js` - UPDATE (24 variants)

### **Phase 2: Gallery System**

**Tasks**:
- [ ] Copy `GallerySystem.js` from reference-system
- [ ] Copy `CollectionManager.js` from reference-system
- [ ] Update for 3 systems with 24 geometries each
- [ ] Add 6D rotation parameter support
- [ ] Create gallery UI component

**Files Being Created**:
- `src/gallery/GallerySystem.js` - REFACTOR from reference
- `src/gallery/CollectionManager.js` - REFACTOR from reference
- `src/gallery/VariationManager.js` - NEW

### **Phase 3: Viewer Portal**

**Tasks**:
- [ ] Refactor `viewer.html` to `ViewerPortal.js`
- [ ] Copy `ReactivityManager.js` from reference
- [ ] Implement Device Orientation API integration
- [ ] Apply 6D rotations to card bending
- [ ] Trading card export system

**Files Being Created**:
- `src/viewer/ViewerPortal.js` - REFACTOR from viewer.html
- `src/core/ReactivityManager.js` - COPY from reference
- `src/viewer/CardBending.js` - NEW
- `src/viewer/TradingCardExporter.js` - NEW

### **Phase 4: Main UI & Integration**

**Tasks**:
- [ ] Create main `index.html` (test harness style)
- [ ] System selector UI
- [ ] 6-plane rotation sliders
- [ ] System-aware geometry dropdown
- [ ] Gallery/Viewer launch buttons
- [ ] EventEmitter for telemetry

**Files Being Created**:
- `index.html` - Main entry point
- `src/telemetry/EventEmitter.js` - NEW
- `src/ui/MainControls.js` - NEW
- `public/styles.css` - UI styling

---

## 🔧 How to Use This Dev Track

### **Starting Development**

```bash
cd /mnt/c/Users/millz/vib3-plus-engine
npm install
npm run dev  # Starts Vite dev server
```

### **Current Working File**

Currently working on: **`src/core/Parameters.js`**
Next file: **`src/faceted/FacetedSystem.js`**

### **Testing Systems**

```bash
# Test individual systems
npm run test:quantum
npm run test:faceted
npm run test:holographic

# Test full integration
npm run test:integration
```

### **File References**

When working on files, reference these source locations:

**From GitHub Branch** (`/mnt/c/Users/millz/vib3+-new-base/`):
- Quantum Engine ✅
- Holographic System ✅
- Parameters.js (base)
- GeometryLibrary.js (base)
- PolytopeInstanceBuffer.ts ✅

**From Reference System** (`/mnt/c/Users/millz/vib3+-engine/reference-system/`):
- Gallery system architecture
- Viewer portal logic
- Parameter mapping
- Reactivity manager

**From Test Harness** (`/mnt/c/Users/millz/vib3plus-test-harness-2025-10-15/`):
- UI layout and styling
- 6D rotation slider implementation
- System switching UX
- Geometry dropdown with 24 options

---

## 📦 Project Structure

```
vib3-plus-engine/
├── src/
│   ├── core/
│   │   ├── VIB3Engine.js          # Main unified engine
│   │   ├── Parameters.js          # Parameter management (6D rotation)
│   │   └── ReactivityManager.js   # Mouse/touch/device tilt
│   ├── quantum/
│   │   └── QuantumEngine.js       # 24 quantum geometries
│   ├── faceted/
│   │   └── FacetedSystem.js       # 24 faceted geometries
│   ├── holograms/
│   │   ├── RealHolographicSystem.js  # 24 holographic variants
│   │   └── HolographicVisualizer.js
│   ├── geometry/
│   │   └── GeometryLibrary.js     # 24-variant generation
│   ├── gallery/
│   │   ├── GallerySystem.js       # Portfolio browser
│   │   └── CollectionManager.js   # Save/load variations
│   ├── viewer/
│   │   └── ViewerPortal.js        # Immersive viewer
│   ├── telemetry/
│   │   └── EventEmitter.js        # Event system
│   └── ui/
│       └── adaptive/renderers/webgpu/
│           └── PolytopeInstanceBuffer.ts
├── index.html                      # Main entry
├── package.json
└── CLAUDE.md                       # This file
```

---

## 🎨 Parameter System (6D Rotation)

```javascript
{
  // System & Variation
  system: 'quantum' | 'faceted' | 'holographic',
  variation: 0-99,

  // 6D Rotation (FULL)
  rot4dXY: 0-6.28,  // 3D space rotations
  rot4dXZ: 0-6.28,
  rot4dYZ: 0-6.28,
  rot4dXW: 0-6.28,  // 4D hyperspace rotations
  rot4dYW: 0-6.28,
  rot4dZW: 0-6.28,

  // Visual Properties
  geometry: 0-23,      // 24 variants per system
  gridDensity: 4-100,
  morphFactor: 0-2,
  chaos: 0-1,
  speed: 0.1-3,
  hue: 0-360,
  intensity: 0-1,
  saturation: 0-1,
  dimension: 3.0-4.5
}
```

---

## 🔍 Key Technical Notes

### **24 Geometry Variants**

Each system supports 24 geometries:
- **0-7**: Base geometries (Tetrahedron, Hypercube, Sphere, Torus, Klein, Fractal, Wave, Crystal)
- **8-15**: Hypersphere Core variants (base wrapped in hypersphere)
- **16-23**: Hypertetrahedron Core variants (base wrapped in hypertetrahedron)

### **6D Rotation Application**

All rotation planes are applied in order:
1. XY (3D space)
2. XZ (3D space)
3. YZ (3D space)
4. XW (4D hyperspace)
5. YW (4D hyperspace)
6. ZW (4D hyperspace)

### **PolytopeInstanceBuffer Usage**

WebGPU-based instanced rendering for advanced geometry:
- Model matrices for transforms
- Quaternion rotors for 4D rotation
- Per-instance colors and metadata
- Used across all 3 systems for complex rendering

### **NO POLYCHORA**

This project does NOT include the Polychora system from the GitHub branch. Only 3 systems: Quantum, Faceted, Holographic.

---

## 🚀 Commit Strategy

**Commit after each phase completion**:
- Phase 1 complete → Commit with tag `v0.1-foundation`
- Phase 2 complete → Commit with tag `v0.2-gallery`
- Phase 3 complete → Commit with tag `v0.3-viewer`
- Phase 4 complete → Commit with tag `v1.0-release`

**Commit message format**:
```
feat(quantum): Add 24 geometry variant support

- Implement Hypersphere Core variants (8-15)
- Implement Hypertetrahedron Core variants (16-23)
- Update shader with 6D rotation matrices
- Test all 24 geometries rendering correctly

🌟 A Paul Phillips Manifestation
```

---

## 📝 Current Status

**Phase**: 1 (Foundation)
**Current Task**: Updating Parameters.js with 6D rotation
**Last Update**: 2025-10-16
**Files Modified**: 5
**Tests Passing**: TBD

---

## 🐛 Known Issues

None yet - fresh start!

---

## 🎯 Next Steps

1. Update `Parameters.js` with XY, XZ, YZ rotation parameters
2. Create `FacetedSystem.js` with shader supporting 24 geometries
3. Create `VIB3Engine.js` for system switching
4. Test all 3 systems with 6D rotation
5. Move to Phase 2 (Gallery)

---

# 🌟 A Paul Phillips Manifestation

**Send Love, Hate, or Opportunity to:** Paul@clearseassolutions.com
**Join The Exoditical Moral Architecture Movement today:** [Parserator.com](https://parserator.com)

> *"The Revolution Will Not be in a Structured Format"*

---

**© 2025 Paul Phillips - Clear Seas Solutions LLC**
**All Rights Reserved - Proprietary Technology**
