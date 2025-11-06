#!/usr/bin/env python3
"""
Build123d CAD Microservice for ConstructAI Platform
Provides parametric CAD modeling and professional CAD export capabilities.

This service enables:
- Parametric model generation from user parameters
- Professional CAD export (STEP, IGES, BREP)
- Advanced geometry operations (fillets, chamfers, booleans)
- Batch processing and async operations
"""

import os
import sys
import uuid
import asyncio
import logging
import tempfile
import shutil
from typing import Optional, Dict, Any, List
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, validator, Field

# Check if build123d is available
try:
    from build123d import *
    BUILD123D_AVAILABLE = True
except ImportError:
    BUILD123D_AVAILABLE = False
    print("⚠️  build123d not installed - running in demo mode")
    print("   Install with: pip install build123d")

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="Build123d CAD Service",
    description="Parametric CAD modeling and professional export service using build123d",
    version="1.0.0"
)

# Enable CORS for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://*.netlify.app",
        "https://*.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
cad_jobs: Dict[str, Dict[str, Any]] = {}
output_dir = Path(tempfile.gettempdir()) / "build123d_output"
output_dir.mkdir(exist_ok=True)


# ============================================================================
# Pydantic Models
# ============================================================================

class Dimensions3D(BaseModel):
    """3D dimensions for CAD models"""
    width: float = Field(..., gt=0, description="Width in mm")
    height: float = Field(..., gt=0, description="Height in mm")
    depth: float = Field(..., gt=0, description="Depth in mm")


class ColumnParameters(BaseModel):
    """Parameters for structural column generation"""
    height: float = Field(..., gt=0, description="Column height in mm")
    shaft_diameter: float = Field(..., gt=0, description="Shaft diameter in mm")
    base_size: float = Field(..., gt=0, description="Base plate size in mm")
    hole_count: int = Field(4, ge=3, le=12, description="Number of bolt holes")
    hole_diameter: float = Field(20, gt=0, description="Bolt hole diameter in mm")
    material: str = Field("steel", description="Material type")
    add_capital: bool = Field(True, description="Add capital (top plate)")


class BoxParameters(BaseModel):
    """Parameters for box/enclosure generation"""
    dimensions: Dimensions3D
    wall_thickness: float = Field(5, gt=0, description="Wall thickness in mm")
    has_lid: bool = Field(True, description="Include lid")
    corner_radius: Optional[float] = Field(None, ge=0, description="Corner radius for fillets")
    mounting_holes: bool = Field(False, description="Add mounting holes")


class CADOperation(BaseModel):
    """Generic CAD operation"""
    operation: str = Field(..., description="Operation type: fillet, chamfer, shell, etc.")
    parameters: Dict[str, Any] = Field(..., description="Operation-specific parameters")


class JobStatus(BaseModel):
    """Status of a CAD generation job"""
    job_id: str
    status: str = Field(..., description="pending, processing, completed, failed")
    progress: float = Field(0, ge=0, le=100)
    message: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None


class ExportRequest(BaseModel):
    """Request to export a model in specific format"""
    model_id: str
    format: str = Field(..., description="step, iges, stl, gltf, brep, dxf")
    options: Optional[Dict[str, Any]] = Field(None, description="Format-specific options")


# ============================================================================
# Helper Functions
# ============================================================================

def check_build123d_available():
    """Check if build123d is properly installed"""
    if not BUILD123D_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="build123d is not installed. Install with: pip install build123d"
        )


def save_model_exports(part, base_name: str, formats: List[str]) -> Dict[str, str]:
    """
    Export a build123d part to multiple formats
    
    Args:
        part: Build123d Part object
        base_name: Base filename without extension
        formats: List of formats to export (step, gltf, stl, etc.)
    
    Returns:
        Dictionary mapping format to file path
    """
    if not BUILD123D_AVAILABLE:
        return {"demo": "demo_mode"}
    
    exports = {}
    base_path = output_dir / base_name
    
    try:
        if "step" in formats:
            step_path = str(base_path.with_suffix(".step"))
            part.export_step(step_path)
            exports["step"] = step_path
            logger.info(f"Exported STEP: {step_path}")
        
        if "stl" in formats:
            stl_path = str(base_path.with_suffix(".stl"))
            part.export_stl(stl_path)
            exports["stl"] = stl_path
            logger.info(f"Exported STL: {stl_path}")
        
        if "gltf" in formats:
            gltf_path = str(base_path.with_suffix(".gltf"))
            part.export_gltf(gltf_path)
            exports["gltf"] = gltf_path
            logger.info(f"Exported GLTF: {gltf_path}")
        
        if "brep" in formats:
            brep_path = str(base_path.with_suffix(".brep"))
            part.export_brep(brep_path)
            exports["brep"] = brep_path
            logger.info(f"Exported BREP: {brep_path}")
    
    except Exception as e:
        logger.error(f"Export failed: {e}")
        raise
    
    return exports


def calculate_model_properties(part) -> Dict[str, Any]:
    """Calculate physical properties of a CAD model"""
    if not BUILD123D_AVAILABLE:
        return {
            "volume": 1000000,
            "surface_area": 10000,
            "bounding_box": {"x": 100, "y": 100, "z": 100},
            "center_of_mass": {"x": 0, "y": 0, "z": 0}
        }
    
    try:
        volume = part.volume
        surface_area = part.area
        bbox = part.bounding_box()
        com = part.center()
        
        return {
            "volume": volume,
            "surface_area": surface_area,
            "bounding_box": {
                "x": bbox.size.X,
                "y": bbox.size.Y,
                "z": bbox.size.Z
            },
            "center_of_mass": {
                "x": com.X,
                "y": com.Y,
                "z": com.Z
            }
        }
    except Exception as e:
        logger.error(f"Property calculation failed: {e}")
        return {}


# ============================================================================
# Demo Mode Functions (when build123d not installed)
# ============================================================================

def generate_demo_response(model_type: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """Generate demo response when build123d is not available"""
    return {
        "success": True,
        "mode": "demo",
        "model_id": f"{model_type}_{uuid.uuid4().hex[:8]}",
        "message": "Demo mode - build123d not installed",
        "exports": {
            "step": f"/tmp/demo_{model_type}.step",
            "gltf": f"/tmp/demo_{model_type}.gltf",
            "stl": f"/tmp/demo_{model_type}.stl"
        },
        "properties": {
            "volume": 1000000.0,
            "surface_area": 10000.0,
            "bounding_box": {"x": 100, "y": 100, "z": 100},
            "center_of_mass": {"x": 0, "y": 0, "z": 0},
            "mass_estimate": 7850.0
        },
        "parameters": parameters
    }


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Service health check"""
    return {
        "service": "build123d-cad-service",
        "version": "1.0.0",
        "build123d_available": BUILD123D_AVAILABLE,
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "build123d_installed": BUILD123D_AVAILABLE,
        "active_jobs": len([j for j in cad_jobs.values() if j["status"] == "processing"]),
        "total_jobs": len(cad_jobs),
        "output_directory": str(output_dir),
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/cad/column/generate")
async def generate_column(params: ColumnParameters):
    """
    Generate a parametric structural column with base plate and optional capital
    
    This endpoint creates a professional-grade structural column CAD model with:
    - Cylindrical shaft
    - Base plate with bolt holes
    - Optional capital (top plate)
    - Accurate physical properties
    - Multiple export formats (STEP, GLTF, STL)
    """
    logger.info(f"Generating column with params: {params.model_dump()}")
    
    # Demo mode if build123d not available
    if not BUILD123D_AVAILABLE:
        logger.warning("Running in demo mode - returning mock data")
        return generate_demo_response("column", params.model_dump())
    
    try:
        # Create parametric model using build123d
        with BuildPart() as column:
            # Column shaft - vertical cylinder
            Cylinder(
                radius=params.shaft_diameter / 2,
                height=params.height,
                align=(Align.CENTER, Align.CENTER, Align.MIN)
            )
            
            # Base plate at bottom
            with BuildSketch(Plane.XY):
                Rectangle(params.base_size, params.base_size, align=Align.CENTER)
            extrude(amount=params.base_size / 10)
            
            # Bolt holes in base plate
            base_face = column.faces().sort_by(Axis.Z)[0]
            hole_pattern = PolarLocations(
                radius=params.base_size / 3,
                count=params.hole_count
            )
            for loc in hole_pattern:
                with Locations(base_face, loc):
                    Hole(radius=params.hole_diameter / 2, depth=params.base_size / 10)
            
            # Capital (top plate) if requested
            if params.add_capital:
                with BuildSketch(Plane.XY.offset(params.height)):
                    Rectangle(params.base_size, params.base_size, align=Align.CENTER)
                extrude(amount=params.base_size / 10)
                
                # Bolt holes in capital
                top_face = column.faces().sort_by(Axis.Z)[-1]
                for loc in hole_pattern:
                    with Locations(top_face, loc):
                        Hole(radius=params.hole_diameter / 2, depth=params.base_size / 10)
        
        # Generate unique model ID
        model_id = f"column_{uuid.uuid4().hex[:8]}"
        
        # Export to multiple formats
        exports = save_model_exports(
            column.part,
            model_id,
            formats=["step", "gltf", "stl"]
        )
        
        # Calculate properties
        properties = calculate_model_properties(column.part)
        
        # Estimate mass based on material
        material_densities = {
            "steel": 7850,      # kg/m³
            "aluminum": 2700,
            "concrete": 2400,
            "timber": 600
        }
        density = material_densities.get(params.material.lower(), 7850)
        mass_kg = (properties["volume"] / 1e9) * density  # mm³ to m³ conversion
        properties["mass_estimate"] = mass_kg
        
        logger.info(f"Successfully generated column {model_id}")
        
        return {
            "success": True,
            "model_id": model_id,
            "model_type": "structural_column",
            "exports": exports,
            "properties": properties,
            "parameters": params.model_dump(),
            "material": {
                "type": params.material,
                "density": density,
                "mass_kg": mass_kg
            }
        }
        
    except Exception as e:
        logger.error(f"Column generation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"CAD generation failed: {str(e)}"
        )


@app.post("/api/cad/box/generate")
async def generate_box(params: BoxParameters):
    """
    Generate a parametric box/enclosure with optional features
    
    Creates a box with:
    - Custom dimensions
    - Wall thickness (hollow)
    - Optional corner fillets
    - Optional lid
    - Optional mounting holes
    """
    logger.info(f"Generating box with params: {params.model_dump()}")
    
    if not BUILD123D_AVAILABLE:
        return generate_demo_response("box", params.model_dump())
    
    try:
        with BuildPart() as box:
            # Create outer box
            Box(
                params.dimensions.width,
                params.dimensions.depth,
                params.dimensions.height,
                align=(Align.CENTER, Align.CENTER, Align.MIN)
            )
            
            # Apply corner fillets if specified
            if params.corner_radius:
                edges_to_fillet = box.edges().filter_by(Axis.Z)
                fillet(edges_to_fillet, radius=params.corner_radius)
            
            # Create hollow interior by shelling
            top_face = box.faces().sort_by(Axis.Z)[-1]
            shell(
                faces_to_remove=[top_face] if params.has_lid else [],
                thickness=params.wall_thickness
            )
            
            # Add mounting holes if requested
            if params.mounting_holes:
                bottom_face = box.faces().sort_by(Axis.Z)[0]
                hole_positions = [
                    (params.dimensions.width / 3, params.dimensions.depth / 3),
                    (-params.dimensions.width / 3, params.dimensions.depth / 3),
                    (params.dimensions.width / 3, -params.dimensions.depth / 3),
                    (-params.dimensions.width / 3, -params.dimensions.depth / 3)
                ]
                for x, y in hole_positions:
                    with Locations((x, y, 0)):
                        Hole(radius=3, depth=params.wall_thickness)
        
        model_id = f"box_{uuid.uuid4().hex[:8]}"
        exports = save_model_exports(box.part, model_id, formats=["step", "gltf", "stl"])
        properties = calculate_model_properties(box.part)
        
        logger.info(f"Successfully generated box {model_id}")
        
        return {
            "success": True,
            "model_id": model_id,
            "model_type": "box_enclosure",
            "exports": exports,
            "properties": properties,
            "parameters": params.model_dump()
        }
        
    except Exception as e:
        logger.error(f"Box generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@app.post("/api/cad/primitive/{shape}")
async def generate_primitive(
    shape: str,
    width: float = 100,
    height: float = 100,
    depth: float = 100,
    radius: float = 50
):
    """
    Generate basic CAD primitives (box, cylinder, sphere, cone)
    
    Args:
        shape: box, cylinder, sphere, cone, torus
        width/height/depth: Dimensions for box
        radius: Radius for cylinder/sphere/cone/torus
    """
    if not BUILD123D_AVAILABLE:
        return generate_demo_response(shape, {"shape": shape, "radius": radius})
    
    try:
        with BuildPart() as part:
            if shape == "box":
                Box(width, depth, height)
            elif shape == "cylinder":
                Cylinder(radius=radius, height=height)
            elif shape == "sphere":
                Sphere(radius=radius)
            elif shape == "cone":
                Cone(bottom_radius=radius, top_radius=radius/2, height=height)
            elif shape == "torus":
                Torus(major_radius=radius, minor_radius=radius/3)
            else:
                raise HTTPException(status_code=400, detail=f"Unknown shape: {shape}")
        
        model_id = f"{shape}_{uuid.uuid4().hex[:8]}"
        exports = save_model_exports(part.part, model_id, formats=["step", "gltf", "stl"])
        properties = calculate_model_properties(part.part)
        
        return {
            "success": True,
            "model_id": model_id,
            "model_type": f"primitive_{shape}",
            "exports": exports,
            "properties": properties
        }
        
    except Exception as e:
        logger.error(f"Primitive generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/cad/operations/fillet")
async def apply_fillet(
    model_id: str,
    edge_indices: List[int],
    radius: float
):
    """Apply fillet operation to model edges"""
    check_build123d_available()
    
    # TODO: Implement model storage/retrieval
    raise HTTPException(
        status_code=501,
        detail="Operation not yet implemented - requires model storage system"
    )


@app.get("/api/cad/export/{model_id}/{format}")
async def export_model(model_id: str, format: str):
    """Download exported model file"""
    file_path = output_dir / f"{model_id}.{format}"
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Model file not found")
    
    return FileResponse(
        file_path,
        media_type="application/octet-stream",
        filename=f"{model_id}.{format}"
    )


@app.get("/api/cad/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get status of an async CAD generation job"""
    if job_id not in cad_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return cad_jobs[job_id]


@app.delete("/api/cad/cleanup/{model_id}")
async def cleanup_model(model_id: str):
    """Delete generated model files"""
    deleted = []
    for format in ["step", "stl", "gltf", "brep"]:
        file_path = output_dir / f"{model_id}.{format}"
        if file_path.exists():
            file_path.unlink()
            deleted.append(format)
    
    return {
        "success": True,
        "model_id": model_id,
        "deleted_formats": deleted
    }


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("CAD_SERVICE_PORT", 8001))
    
    logger.info("="*60)
    logger.info("Build123d CAD Service for ConstructAI")
    logger.info("="*60)
    logger.info(f"Build123d Available: {BUILD123D_AVAILABLE}")
    logger.info(f"Output Directory: {output_dir}")
    logger.info(f"Starting server on port {port}...")
    logger.info("="*60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
