"""Quick database check script."""
from constructai.db.database import SessionLocal
from constructai.db.models import ProjectDB
import json

db = SessionLocal()
project = db.query(ProjectDB).filter(ProjectDB.id == 'c9250551-19ca-4a40-8a49-3c2a55cf584a').first()

if not project:
    print("❌ Project not found!")
else:
    print(f"✅ Project: {project.name}")
    print(f"   Created: {project.created_at}")
    print(f"   Updated: {project.updated_at}")
    
    metadata = project.project_metadata or {}
    docs = metadata.get('documents', [])
    
    print(f"\n📄 Documents: {len(docs)}")
    
    for i, doc in enumerate(docs):
        print(f"\n  Document {i+1}:")
        print(f"    Filename: {doc.get('filename', 'unknown')}")
        print(f"    Status: {doc.get('analysis_status', 'unknown')}")
        print(f"    Has analysis_result: {'analysis_result' in doc}")
        
        if 'analysis_result' in doc:
            analysis = doc['analysis_result']
            print(f"    Analysis timestamp: {analysis.get('timestamp', 'unknown')}")
            print(f"    Execution time: {analysis.get('execution_time_seconds', 0)}s")
            print(f"    Quality score: {analysis.get('quality_metrics', {}).get('quality_score', 0)}")
            print(f"    AI decisions: {analysis.get('quality_metrics', {}).get('ai_decisions_made', 0)}")

db.close()
