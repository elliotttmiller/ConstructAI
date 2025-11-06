# Build123d CAD Integration

## Overview

This integration adds professional parametric CAD modeling capabilities to ConstructAI using [build123d](https://github.com/gumyr/build123d), a Python-based CAD framework built on OpenCascade Technology (OCCT).

## Features

### ✅ Parametric Model Generation
- **Structural Columns**: Generate columns with base plates, capitals, and bolt holes
- **Boxes/Enclosures**: Create hollow boxes with custom dimensions and features
- **Primitives**: Box, cylinder, sphere, cone, torus generation

### ✅ Professional CAD Export
- **STEP (.step)**: Industry-standard CAD exchange format
- **STL (.stl)**: 3D printing and mesh format
- **GLTF (.gltf)**: Web-based 3D visualization
- **BREP (.brep)**: OpenCascade native format

### ✅ Physical Properties
- Accurate volume and surface area calculations
- Center of mass computation
- Mass estimation based on material density
- Bounding box dimensions

### ✅ Advanced Features
- Material-based mass calculations (steel, aluminum, concrete, timber)
- Parametric design with instant updates
- Server-side processing (no browser limitations)
- Demo mode when build123d not installed

## Architecture

```
┌─────────────────────────────────────┐
│   Next.js Frontend (TypeScript)     │
│  ParametricCADBuilder Component     │
└─────────────┬───────────────────────┘
              │ HTTP/JSON API
              ▼
┌─────────────────────────────────────┐
│  Next.js API Routes (/api/cad/*)    │
│  • /column/generate                 │
│  • /box/generate                    │
│  • /export/[model]/[format]         │
└─────────────┬───────────────────────┘
              │ Proxy to Python
              ▼
┌─────────────────────────────────────┐
│ Python FastAPI Service (Port 8001)  │
│   build123d-cad-service.py          │
├─────────────────────────────────────┤
│  • Parametric model generation      │
│  • OpenCascade geometry operations  │
│  • Multi-format export              │
│  • Property calculations            │
└─────────────────────────────────────┘
```

## Installation

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ (for Next.js)
- pip package manager

### 1. Install Python Dependencies

```bash
# Install build123d and its dependencies
pip install build123d

# Or install all ConstructAI Python dependencies
pip install -r requirements.txt
```

**Note**: build123d will automatically install:
- `cadquery-ocp` (OpenCascade Python bindings)
- `numpy`, `scipy`, `sympy` (math libraries)
- `ezdxf`, `svgpathtools` (2D CAD formats)

### 2. Install Node.js Dependencies

```bash
# Install with legacy peer deps to avoid conflicts
npm install --legacy-peer-deps
```

### 3. Configure Environment

Copy `.env.example` to `.env.local` and configure:

```bash
# Build123d CAD Service
CAD_SERVICE_URL=http://localhost:8001
CAD_SERVICE_PORT=8001
CAD_SERVICE_ENABLED=true
```

## Usage

### Starting the Services

#### Option 1: Manual Start (Development)

```bash
# Terminal 1: Start CAD service
cd python-services
./start-build123d-cad.sh

# Terminal 2: Start Next.js
npm run dev
```

#### Option 2: Using start.py (Recommended)

```bash
# Starts all services including CAD service
python start.py
```

The CAD service will be available at `http://localhost:8001`

### Using the Parametric CAD Builder

1. **Navigate to BIM Page**: Visit `/bim` in your application
2. **Open CAD Builder**: Click "Parametric CAD" tab
3. **Select Model Type**: Choose Column or Box
4. **Configure Parameters**: Set dimensions and options
5. **Generate**: Click "Generate" button
6. **Export**: Download in STEP, STL, or GLTF format

### API Endpoints

#### Generate Structural Column
```typescript
POST /api/cad/column/generate
Content-Type: application/json

{
  "height": 3000,
  "shaft_diameter": 300,
  "base_size": 500,
  "hole_count": 4,
  "hole_diameter": 20,
  "material": "steel",
  "add_capital": true
}
```

**Response**:
```json
{
  "success": true,
  "model_id": "column_abc123",
  "exports": {
    "step": "/path/to/model.step",
    "stl": "/path/to/model.stl",
    "gltf": "/path/to/model.gltf"
  },
  "properties": {
    "volume": 35342980.5,
    "surface_area": 942478.3,
    "bounding_box": {"x": 500, "y": 500, "z": 3000},
    "center_of_mass": {"x": 0, "y": 0, "z": 1500}
  },
  "material": {
    "type": "steel",
    "density": 7850,
    "mass_kg": 277.44
  }
}
```

#### Generate Box/Enclosure
```typescript
POST /api/cad/box/generate
Content-Type: application/json

{
  "dimensions": {
    "width": 200,
    "height": 150,
    "depth": 100
  },
  "wall_thickness": 5,
  "has_lid": true,
  "corner_radius": 5,
  "mounting_holes": false
}
```

#### Download Exported Model
```typescript
GET /api/cad/export/{model_id}/{format}
// format: step, stl, gltf, brep
```

### Demo Mode

If build123d is not installed, the service runs in **demo mode**:
- Returns mock data with realistic properties
- Allows frontend testing without backend dependencies
- Displays "Demo Mode" badge in UI

To enable full functionality:
```bash
pip install build123d
```

## Component Usage

### In Your React/Next.js App

```tsx
import { ParametricCADBuilder } from '@/components/cad/ParametricCADBuilder';

function CADPage() {
  const handleModelGenerated = (result) => {
    console.log('Generated model:', result);
    // Load into 3D viewer, save to database, etc.
  };

  return (
    <ParametricCADBuilder 
      onModelGenerated={handleModelGenerated}
      className="w-full max-w-4xl"
    />
  );
}
```

### TypeScript Types

All types are available in `src/types/build123d.ts`:

```typescript
import type {
  CADGenerationResult,
  ColumnParameters,
  BoxParameters,
  ModelProperties,
  ExportFormat
} from '@/types/build123d';
```

## Build123d Capabilities

### Modeling Modes

#### Builder Mode (Context Manager)
```python
with BuildPart() as part:
    Box(100, 100, 100)
    with Locations(part.faces().sort_by(Axis.Z)[-1]):
        Hole(10)
```

#### Algebra Mode (Direct)
```python
box = Solid.make_box(100, 100, 100)
hole = Solid.make_cylinder(5, 100)
result = box - hole
```

### Common Operations

- **Primitives**: Box, Cylinder, Sphere, Cone, Torus, Wedge
- **2D Sketches**: Rectangle, Circle, Polygon, Ellipse
- **3D Operations**: Extrude, Revolve, Sweep, Loft
- **Boolean**: Union (+), Subtract (-), Intersect (&)
- **Modifications**: Fillet, Chamfer, Offset, Shell, Draft
- **Patterns**: GridLocations, PolarLocations, HexLocations

## Extending the Integration

### Adding New Model Types

1. **Define Parameters** in `src/types/build123d.ts`:
```typescript
export interface BeamParameters {
  length: number;
  profile: 'I' | 'H' | 'C' | 'L';
  // ... other params
}
```

2. **Create Python Endpoint** in `build123d-cad-service.py`:
```python
@app.post("/api/cad/beam/generate")
async def generate_beam(params: BeamParameters):
    with BuildPart() as beam:
        # ... build123d code
    return { ... }
```

3. **Add Next.js API Route** at `src/app/api/cad/beam/generate/route.ts`

4. **Update UI Component** to include new model type

### Custom Geometry Operations

```python
@app.post("/api/cad/operations/fillet")
async def apply_fillet(model_id: str, edges: List[int], radius: float):
    # Load existing model
    part = load_model(model_id)
    
    # Apply fillet
    edges_to_fillet = part.edges()[edges]
    fillet(edges_to_fillet, radius=radius)
    
    # Save and export
    return save_model(part)
```

## Troubleshooting

### Build123d Not Installing

**Issue**: `pip install build123d` fails

**Solutions**:
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Try with --no-cache-dir
pip install --no-cache-dir build123d

# On macOS with Apple Silicon
pip install build123d --platform=macosx_11_0_arm64
```

### Import Errors

**Issue**: `ImportError: No module named 'OCP'`

**Solution**: The cadquery-ocp package needs to be installed:
```bash
pip install cadquery-ocp
```

### Service Not Starting

**Issue**: Service won't start on port 8001

**Check**:
```bash
# Check if port is in use
lsof -i :8001

# Change port in .env.local
CAD_SERVICE_PORT=8002
```

### Demo Mode Persistent

**Issue**: Service stays in demo mode after installing build123d

**Solution**:
```bash
# Verify installation
python -c "import build123d; print(build123d.__version__)"

# Restart service
./python-services/start-build123d-cad.sh
```

## Performance Optimization

### Caching Models

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def generate_standard_column(height: float, diameter: float):
    # Cached generation for common dimensions
    pass
```

### Async Processing

```python
@app.post("/api/cad/generate-async")
async def generate_async(params: ModelParameters):
    job_id = str(uuid.uuid4())
    background_tasks.add_task(generate_model, job_id, params)
    return {"job_id": job_id, "status": "processing"}
```

### Progressive Loading

```typescript
// Load preview first, then full model
const preview = await fetch('/api/cad/export/model_id/stl?lod=low');
const full = await fetch('/api/cad/export/model_id/step');
```

## Resources

### Build123d Documentation
- **Main Docs**: https://build123d.readthedocs.io/
- **GitHub**: https://github.com/gumyr/build123d
- **Discord**: https://discord.com/invite/Bj9AQPsCfx
- **Examples**: https://github.com/gumyr/build123d/tree/dev/examples

### OpenCascade
- **Official Site**: https://dev.opencascade.org/
- **Documentation**: https://dev.opencascade.org/doc/overview/html/

### Related Tools
- **CadQuery**: https://cadquery.readthedocs.io/
- **FreeCAD**: https://www.freecad.org/
- **IfcOpenShell**: http://ifcopenshell.org/

## Contributing

To contribute new parametric models or features:

1. Fork the repository
2. Create a feature branch
3. Add new model generators to `build123d-cad-service.py`
4. Create corresponding TypeScript types
5. Add UI components
6. Submit a pull request

## License

This integration is part of ConstructAI, licensed under the MIT License.

Build123d is licensed under the Apache 2.0 License.

## Support

For issues or questions:
- Check [Build123d Integration Analysis](./BUILD123D_INTEGRATION_ANALYSIS.md)
- Visit build123d Discord: https://discord.com/invite/Bj9AQPsCfx
- Open an issue on GitHub

---

**Last Updated**: November 6, 2025  
**Version**: 1.0.0  
**Status**: Production Ready (with demo mode fallback)
