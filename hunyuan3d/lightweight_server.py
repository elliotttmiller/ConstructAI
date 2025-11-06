#!/usr/bin/env python3
"""
Lightweight Hunyuan3D Server - Geometry Only with AI Analysis
Uses OpenAI API for AI analysis, generates 3D geometry without textures
NO torch/transformers/diffusers required!
"""

import os
import sys
import uuid
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime
from io import BytesIO

import numpy as np
from PIL import Image
import cv2
import trimesh

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Load environment variables
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env.local")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
OUTPUT_DIR = Path("./outputs")
TEMP_DIR = Path("./temp")
OUTPUT_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

# OpenAI API (optional - for enhanced analysis)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# FastAPI app
app = FastAPI(
    title="Lightweight Hunyuan3D Service",
    description="AI-powered blueprint analysis with procedural 3D geometry generation",
    version="2.0.0-lightweight"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://*.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Job tracking
job_status: Dict[str, Dict[str, Any]] = {}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Lightweight Hunyuan3D Server",
        "version": "2.0.0-lightweight",
        "status": "running",
        "mode": "geometry-only (no textures)",
        "ai_provider": "OpenAI API" if OPENAI_API_KEY else "Basic CV",
        "features": {
            "blueprint_analysis": True,
            "geometry_generation": True,
            "texture_generation": False,
            "requires_gpu": False,
            "requires_torch": False
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "lightweight",
        "openai_configured": bool(OPENAI_API_KEY)
    }

@app.post("/analyze")
async def analyze_blueprint(
    image: UploadFile = File(...),
    use_ai: bool = Form(True)
):
    """Analyze blueprint using CV and optionally OpenAI"""
    try:
        # Read image
        contents = await image.read()
        img = Image.open(BytesIO(contents)).convert('RGB')
        img_array = np.array(img)
        
        # Basic computer vision analysis
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Edge detection
        edges = cv2.Canny(gray, 50, 150)
        edge_count = np.count_nonzero(edges)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Calculate complexity
        complexity = "low"
        if len(contours) > 100:
            complexity = "high"
        elif len(contours) > 50:
            complexity = "medium"
        
        # Estimate dimensions
        height, width = img_array.shape[:2]
        
        analysis = {
            "image_dimensions": {"width": width, "height": height},
            "detected_features": {
                "edge_pixels": int(edge_count),
                "contours": len(contours),
                "complexity": complexity
            },
            "estimated_building": {
                "rooms": max(4, len(contours) // 20),
                "doors": max(2, len(contours) // 50),
                "windows": max(4, len(contours) // 30),
                "floors": 1 if height < 1000 else 2
            },
            "ai_enhanced": False
        }
        
        # Use OpenAI for enhanced analysis if available
        if use_ai and OPENAI_API_KEY:
            try:
                import openai
                openai.api_key = OPENAI_API_KEY
                
                # Save temp image for analysis
                temp_path = TEMP_DIR / f"temp_{uuid.uuid4()}.png"
                img.save(temp_path)
                
                # Use OpenAI Vision API
                with open(temp_path, "rb") as image_file:
                    import base64
                    base64_image = base64.b64encode(image_file.read()).decode()
                
                response = openai.ChatCompletion.create(
                    model="gpt-4-vision-preview",
                    messages=[{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Analyze this architectural blueprint and provide: number of rooms, doors, windows, floors, building type, and complexity level."},
                            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
                        ]
                    }],
                    max_tokens=500
                )
                
                ai_analysis = response.choices[0].message.content
                analysis["ai_analysis"] = ai_analysis
                analysis["ai_enhanced"] = True
                
                # Cleanup
                temp_path.unlink()
                
            except Exception as e:
                logger.warning(f"OpenAI analysis failed: {e}")
        
        return analysis
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate")
async def generate_3d_model(
    background_tasks: BackgroundTasks,
    image: UploadFile = File(...),
    prompt: str = Form("A detailed 3D building model"),
    style: str = Form("architectural"),
    quality: str = Form("standard"),
    max_face_count: int = Form(10000),
    seed: int = Form(1234)
):
    """Generate 3D model from 2D blueprint using procedural generation"""
    try:
        # Create job ID
        job_id = str(uuid.uuid4())
        
        # Initialize job status
        job_status[job_id] = {
            "status": "queued",
            "progress": 0,
            "message": "Job queued for processing",
            "created_at": datetime.now().isoformat()
        }
        
        # Start background processing
        background_tasks.add_task(
            process_3d_generation,
            job_id, image, prompt, style, quality, max_face_count, seed
        )
        
        return {
            "success": True,
            "job_id": job_id,
            "status": "queued",
            "message": "Lightweight geometry generation started",
            "estimated_time": "10-30 seconds"
        }
        
    except Exception as e:
        logger.error(f"Generation request failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_3d_generation(
    job_id: str,
    image: UploadFile,
    prompt: str,
    style: str,
    quality: str,
    max_face_count: int,
    seed: int
):
    """Process 3D generation in background"""
    try:
        job_status[job_id]["status"] = "processing"
        job_status[job_id]["progress"] = 10
        job_status[job_id]["message"] = "Analyzing blueprint..."
        
        # Read and analyze image
        contents = await image.read()
        img = Image.open(BytesIO(contents)).convert('RGB')
        img_array = np.array(img)
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        job_status[job_id]["progress"] = 30
        job_status[job_id]["message"] = "Detecting features..."
        
        # Detect features
        edges = cv2.Canny(gray, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Estimate building parameters
        room_count = max(4, len(contours) // 20)
        door_count = max(2, len(contours) // 50)
        window_count = max(4, len(contours) // 30)
        
        job_status[job_id]["progress"] = 50
        job_status[job_id]["message"] = "Generating 3D geometry..."
        
        # Generate procedural 3D model
        mesh = generate_procedural_building(
            room_count, door_count, window_count, max_face_count, seed
        )
        
        job_status[job_id]["progress"] = 80
        job_status[job_id]["message"] = "Saving model files..."
        
        # Save model
        output_dir = OUTPUT_DIR / job_id
        output_dir.mkdir(exist_ok=True)
        
        # Save as OBJ
        obj_path = output_dir / f"{job_id}.obj"
        mesh.export(str(obj_path))
        
        # Save as GLB
        glb_path = output_dir / f"{job_id}.glb"
        mesh.export(str(glb_path))
        
        # Save preview image
        img_path = output_dir / f"{job_id}.png"
        img.save(img_path)
        
        job_status[job_id]["status"] = "completed"
        job_status[job_id]["progress"] = 100
        job_status[job_id]["message"] = "Generation complete!"
        job_status[job_id]["completed_at"] = datetime.now().isoformat()
        job_status[job_id]["result"] = {
            "model_obj_path": str(obj_path),
            "model_glb_path": str(glb_path),
            "image_path": str(img_path),
            "obj_url": f"/download/{job_id}/model_obj",
            "glb_url": f"/download/{job_id}/model_glb",
            "image_url": f"/download/{job_id}/image",
            "stats": {
                "rooms": room_count,
                "doors": door_count,
                "windows": window_count,
                "faces": len(mesh.faces),
                "vertices": len(mesh.vertices)
            }
        }
        
    except Exception as e:
        logger.error(f"Generation failed for job {job_id}: {e}")
        job_status[job_id]["status"] = "failed"
        job_status[job_id]["message"] = str(e)

def generate_procedural_building(
    room_count: int,
    door_count: int,
    window_count: int,
    max_faces: int,
    seed: int
) -> trimesh.Trimesh:
    """Generate procedural 3D building geometry"""
    np.random.seed(seed)
    
    # Building dimensions based on room count
    width = 10 + room_count * 2
    depth = 8 + room_count * 1.5
    height = 6 + room_count * 0.5
    
    # Create main building box
    main_box = trimesh.creation.box(extents=[width, height, depth])
    main_box.apply_translation([0, height/2, 0])
    
    # Create roof (pyramid)
    roof = trimesh.creation.cone(radius=width*0.6, height=4, sections=4)
    roof.apply_translation([0, height + 2, 0])
    
    # Combine meshes
    meshes = [main_box, roof]
    
    # Add windows
    for i in range(min(window_count, 8)):
        window = trimesh.creation.box(extents=[1.5, 2, 0.2])
        angle = (i / max(window_count, 1)) * 2 * np.pi
        x = np.cos(angle) * (width * 0.48)
        z = np.sin(angle) * (depth * 0.48)
        y = height * 0.4 + (i % 3) * 2
        window.apply_translation([x, y, z])
        meshes.append(window)
    
    # Combine all meshes
    combined = trimesh.util.concatenate(meshes)
    
    # Simplify if needed
    if len(combined.faces) > max_faces:
        combined = combined.simplify_quadric_decimation(max_faces)
    
    return combined

@app.get("/status/{job_id}")
async def get_job_status(job_id: str):
    """Get job status"""
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    return job_status[job_id]

@app.get("/result/{job_id}")
async def get_job_result(job_id: str):
    """Get job result"""
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    status = job_status[job_id]
    if status["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    return status.get("result", {})

@app.get("/download/{job_id}/{file_type}")
async def download_result(job_id: str, file_type: str):
    """Download generated files"""
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    status = job_status[job_id]
    if status["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    result = status.get("result", {})
    file_path = result.get(f"{file_type}_path")
    
    if not file_path or not Path(file_path).exists():
        raise HTTPException(status_code=404, detail=f"{file_type} file not found")
    
    return FileResponse(file_path, filename=f"{job_id}_{file_type}")

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Lightweight Hunyuan3D Server")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Server host")
    parser.add_argument("--port", type=int, default=8000, help="Server port")
    args = parser.parse_args()
    
    print("🚀 Starting Lightweight Hunyuan3D Server...")
    print(f"📱 Mode: Geometry-only (No textures, No GPU required)")
    print(f"🤖 AI: {'OpenAI API' if OPENAI_API_KEY else 'Basic CV only'}")
    print(f"💾 Storage: {OUTPUT_DIR.absolute()}")
    print("")
    
    # Run server
    uvicorn.run(
        app,
        host=args.host,
        port=args.port,
        log_level="info"
    )

if __name__ == "__main__":
    main()
