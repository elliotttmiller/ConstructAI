import requests

API_URL = "http://127.0.0.1:8000/api/documents/upload"
PDF_PATH = "proposal_example.pdf"

with open(PDF_PATH, "rb") as f:
    files = {"file": (PDF_PATH, f, "application/pdf")}
    print(f"Uploading {PDF_PATH} to {API_URL}...")
    response = requests.post(API_URL, files=files)

print("Status Code:", response.status_code)
try:
    print("Response:", response.json())
except Exception:
    print("Raw Response:", response.text)
