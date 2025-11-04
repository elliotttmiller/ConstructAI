import os
import requests

# Load API key and model from environment or .env.local
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
API_URL = "http://127.0.0.1:8000/api/ai/test"

if not OPENAI_API_KEY:
    print("OPENAI_API_KEY not set. Please check your .env.local or environment variables.")
    exit(1)

# Test prompt
prompt = "What are the top 3 risks in a construction project?"

payload = {
    "provider": "openai",
    "prompt": prompt
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {OPENAI_API_KEY}"
}

print(f"Testing OpenAI model '{OPENAI_MODEL}' with prompt: {prompt}")

response = requests.post(API_URL, json=payload, headers=headers)

print("Status Code:", response.status_code)
print("Response:", response.json())
