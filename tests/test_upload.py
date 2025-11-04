"""Test document upload endpoint directly"""
import requests

url = "http://localhost:8000/api/documents/upload"
file_path = "proposal_example.pdf"

print(f"Testing upload of: {file_path}")
print(f"Endpoint: {url}\n")

try:
    with open(file_path, 'rb') as f:
        files = {"file": (file_path, f, "application/pdf")}
        response = requests.post(url, files=files)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Text:\n{response.text}\n")
    
    if response.status_code == 200:
        print("✓ Success!")
        import json
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"✗ Error {response.status_code}")
        try:
            import json
            print(json.dumps(response.json(), indent=2))
        except:
            pass
            
except Exception as e:
    print(f"Exception: {e}")
    import traceback
    traceback.print_exc()
