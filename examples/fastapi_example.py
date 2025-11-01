"""
Example: Using ConstructAI FastAPI Web Service

Demonstrates how to start and use the web service for document analysis.
"""

import requests
import json
from pathlib import Path


def start_server_instructions():
    """Print instructions for starting the server."""
    print("="*80)
    print("CONSTRUCTAI FASTAPI WEB SERVICE")
    print("="*80)
    print("\nTo start the server, run:")
    print("  uvicorn constructai.web.fastapi_app:app --reload --port 8000")
    print("\nOr install with:")
    print("  pip install fastapi uvicorn")
    print("\n" + "="*80 + "\n")


def test_api_health(base_url="http://localhost:8000"):
    """Test API health endpoint."""
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            data = response.json()
            print("✓ API is healthy")
            print(f"  Service: {data['service']}")
            print(f"  Version: {data['version']}")
            print(f"  Status: {data['status']}")
            print(f"  Features: {len(data['features'])} available")
            return True
        else:
            print(f"✗ API returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to API. Is the server running?")
        print("  Start with: uvicorn constructai.web.fastapi_app:app --reload")
        return False


def analyze_document_via_api(file_path, base_url="http://localhost:8000"):
    """
    Upload and analyze a document via the API.
    
    Args:
        file_path: Path to document file
        base_url: API base URL
    """
    file_path = Path(file_path)
    
    if not file_path.exists():
        print(f"✗ File not found: {file_path}")
        return None
    
    print(f"\nUploading and analyzing: {file_path.name}")
    print("-" * 80)
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (file_path.name, f, 'application/octet-stream')}
            response = requests.post(
                f"{base_url}/api/v2/analyze/document",
                files=files,
                timeout=60
            )
        
        if response.status_code == 200:
            result = response.json()
            
            if result['status'] == 'success':
                print("✓ Analysis complete!")
                
                # Document info
                doc = result['document']
                print(f"\nDocument:")
                print(f"  Filename: {doc['filename']}")
                print(f"  Type: {doc['type']}")
                print(f"  Format: {doc['format']}")
                
                # Analysis results
                analysis = result['analysis']
                print(f"\nAnalysis Results:")
                print(f"  Sections: {analysis['sections']}")
                print(f"  Clauses Extracted: {analysis['clauses_extracted']}")
                
                # Divisions found
                divisions = analysis['divisions_found']
                print(f"\n  MasterFormat Divisions Found:")
                for div, count in sorted(divisions.items())[:5]:
                    print(f"    Division {div}: {count} sections")
                
                # Sample clauses
                if analysis['sample_clauses']:
                    print(f"\n  Sample Clauses:")
                    for i, clause in enumerate(analysis['sample_clauses'][:2], 1):
                        print(f"    {i}. [{clause['clause_type']}]")
                        print(f"       {clause['text'][:70]}...")
                
                # Ambiguity analysis
                amb = analysis['ambiguity_analysis']
                print(f"\n  Ambiguity Analysis:")
                print(f"    Total Analyzed: {amb['total_analyzed']}")
                if amb['issues']:
                    print(f"    Issues Found:")
                    for issue in amb['issues'][:2]:
                        print(f"      - Clarity Score: {issue['clarity_score']}/100")
                        print(f"        Issues: {issue['issue_count']}")
                
                return result
            else:
                print(f"✗ Analysis failed: {result.get('message', 'Unknown error')}")
                return None
        else:
            print(f"✗ API returned status {response.status_code}")
            print(f"  Response: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        print("✗ Request timed out. Document may be too large.")
        return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None


def create_sample_spec_file():
    """Create a sample specification file for testing."""
    import tempfile
    
    spec_content = """
DIVISION 03 - CONCRETE
SECTION 03 30 00 - CAST-IN-PLACE CONCRETE

1.1 GENERAL
A. Work Included: Cast-in-place concrete for foundations and slabs.

1.2 QUALITY ASSURANCE
A. Concrete shall have minimum compressive strength of 5,000 psi at 28 days.
B. Concrete shall comply with ASTM C94 for ready-mixed concrete.
C. Reinforcing steel shall conform to ASTM A615, Grade 60.

2.1 MATERIALS
A. Portland cement conforming to ASTM C150, Type II.
B. Aggregate meeting ASTM C33 requirements.

2.2 EXECUTION
A. Install concrete per approved shop drawings.
B. Cure concrete for minimum 7 days.
"""
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write(spec_content)
        return f.name


def main():
    """Main example function."""
    start_server_instructions()
    
    base_url = "http://localhost:8000"
    
    # Test API health
    print("Testing API health...")
    if not test_api_health(base_url):
        print("\n" + "="*80)
        print("Server is not running. Start it first, then run this script again.")
        print("="*80)
        return
    
    # Create sample file
    print("\nCreating sample specification file...")
    sample_file = create_sample_spec_file()
    print(f"✓ Created: {sample_file}")
    
    # Analyze document
    result = analyze_document_via_api(sample_file, base_url)
    
    if result:
        # Save full result to JSON
        output_file = "api_analysis_result.json"
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"\n✓ Full results saved to: {output_file}")
    
    # Clean up
    import os
    if os.path.exists(sample_file):
        os.unlink(sample_file)
    
    print("\n" + "="*80)
    print("API EXAMPLE COMPLETE")
    print("="*80)
    print("\nNext steps:")
    print("  1. Try with your own specification documents")
    print("  2. Integrate with your existing workflow")
    print("  3. Build a frontend with React/Vue/Angular")
    print("  4. Scale with Docker and Kubernetes")


if __name__ == "__main__":
    main()
