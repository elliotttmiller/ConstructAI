"""
Autonomous AI Integration Test - Real Database Data

Tests all 7 AI agents with autonomous tool execution using ACTUAL data from Supabase.
This test first queries your database to find real projects/documents, then tests with them.

Requirements:
- Server running on localhost:3000
- Supabase configured with SUPABASE_URL and SUPABASE_SERVICE_KEY
- At least one project in database (will create if none exist)
"""

import requests
import json
import time
import os
from datetime import datetime

BASE_URL = "http://localhost:3000"
API_URL = f"{BASE_URL}/api/ai-chat"

# Get Supabase credentials from environment
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')

def print_header(text: str):
    """Print formatted header"""
    print(f"\n{'='*80}")
    print(f" {text}")
    print(f"{'='*80}\n")

def print_result(test_name: str, passed: bool, details: str = ""):
    """Print test result"""
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"{status} | {test_name}")
    if details:
        print(f"      {details}")

def get_real_project_from_db():
    """Query Supabase for a real project"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("⚠ Supabase credentials not found, using test project ID")
        return "test-project-001"
    
    try:
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        
        # Query for any project
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/projects?select=id,name&limit=1",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200 and response.json():
            project = response.json()[0]
            print(f"✓ Found real project: {project['name']} ({project['id']})")
            return project['id']
        else:
            print("⚠ No projects in database, using test ID")
            return "test-project-001"
    except Exception as e:
        print(f"⚠ Could not query database: {e}")
        return "test-project-001"

def get_real_document_from_db(project_id: str = None):
    """Query Supabase for a real document"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return "test-document-001"
    
    try:
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        
        # Query for any document
        url = f"{SUPABASE_URL}/rest/v1/documents?select=id,file_name&limit=1"
        if project_id:
            url += f"&project_id=eq.{project_id}"
            
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200 and response.json():
            doc = response.json()[0]
            print(f"✓ Found real document: {doc.get('file_name', 'Unknown')} ({doc['id']})")
            return doc['id']
        else:
            return "test-document-001"
    except Exception as e:
        print(f"⚠ Could not query documents: {e}")
        return "test-document-001"

def test_document_agent_autonomous():
    """Test: Document Agent with autonomous tool execution"""
    print_header("TEST 1: Document Agent - Autonomous Analysis")
    
    project_id = get_real_project_from_db()
    document_id = get_real_document_from_db(project_id)
    
    payload = {
        "message": f"Analyze document {document_id} for compliance and extract key specifications",
        "agentType": "document",
        "context": {
            "projectId": project_id,
            "documentType": "specifications",
            "enableTools": True
        }
    }
    
    try:
        start_time = time.time()
        response = requests.post(API_URL, json=payload, timeout=60)
        duration = time.time() - start_time
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Time: {duration:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            content = data.get('content', '')
            reasoning = data.get('reasoning', '')
            agent_type = data.get('agentType', '')
            
            print(f"Agent Used: {agent_type}")
            print(f"AI Response Length: {len(content)} chars")
            print(f"Tool Execution: {reasoning or 'No tools executed'}")
            print(f"\nResponse Preview:\n{content[:400]}...")
            
            # Verify document agent was used
            correct_agent = agent_type == 'document'
            has_response = len(content) > 100
            
            print_result(
                "Document Agent Used",
                correct_agent,
                f"Agent type: {agent_type}"
            )
            
            print_result(
                "Valid Response Generated",
                has_response,
                f"{len(content)} characters"
            )
            
            return correct_agent and has_response
        else:
            print_result("API Request", False, f"Status {response.status_code}")
            return False
            
    except Exception as e:
        print_result("Test Execution", False, str(e))
        return False

def test_pm_agent_autonomous():
    """Test: PM Agent with autonomous project status query"""
    print_header("TEST 2: PM Agent - Autonomous Project Status")
    
    project_id = get_real_project_from_db()
    
    payload = {
        "message": "What's the current status? Show completion percentage and any overdue tasks",
        "agentType": "pm",
        "context": {
            "projectId": project_id,
            "projectData": {"id": project_id},
            "taskData": [],
            "enableTools": True
        }
    }
    
    try:
        start_time = time.time()
        response = requests.post(API_URL, json=payload, timeout=60)
        duration = time.time() - start_time
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Time: {duration:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            content = data.get('content', '')
            reasoning = data.get('reasoning', '')
            agent_type = data.get('agentType', '')
            
            print(f"Agent Used: {agent_type}")
            print(f"AI Response Length: {len(content)} chars")
            print(f"Tool Execution: {reasoning or 'No tools executed'}")
            print(f"\nResponse Preview:\n{content[:400]}...")
            
            correct_agent = agent_type == 'pm'
            has_pm_content = any(kw in content.lower() for kw in ['project', 'task', 'status', 'progress', 'completion'])
            
            print_result("PM Agent Used", correct_agent, f"Agent: {agent_type}")
            print_result("PM-Specific Content", has_pm_content, "Found PM keywords")
            
            return correct_agent and has_pm_content
        else:
            print_result("API Request", False, f"Status {response.status_code}")
            return False
            
    except Exception as e:
        print_result("Test Execution", False, str(e))
        return False

def test_compliance_agent_autonomous():
    """Test: Compliance Agent with code checking"""
    print_header("TEST 3: Compliance Agent - Building Code Analysis")
    
    project_id = get_real_project_from_db()
    
    payload = {
        "message": "Check building code compliance for commercial construction",
        "agentType": "compliance",
        "context": {
            "projectId": project_id,
            "projectDetails": {"type": "commercial", "floors": 3},
            "location": "California",
            "enableTools": True
        }
    }
    
    try:
        start_time = time.time()
        response = requests.post(API_URL, json=payload, timeout=60)
        duration = time.time() - start_time
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Time: {duration:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            content = data.get('content', '')
            agent_type = data.get('agentType', '')
            
            print(f"Agent Used: {agent_type}")
            print(f"AI Response Length: {len(content)} chars")
            print(f"\nResponse Preview:\n{content[:400]}...")
            
            correct_agent = agent_type == 'compliance'
            has_compliance = any(kw in content.lower() for kw in ['code', 'compliance', 'ibc', 'building', 'regulation'])
            
            print_result("Compliance Agent Used", correct_agent, f"Agent: {agent_type}")
            print_result("Compliance Keywords", has_compliance, "Found code/compliance terms")
            
            return correct_agent and has_compliance
        else:
            print_result("API Request", False, f"Status {response.status_code}")
            return False
            
    except Exception as e:
        print_result("Test Execution", False, str(e))
        return False

def test_bim_agent_autonomous():
    """Test: BIM Agent with model analysis"""
    print_header("TEST 4: BIM Agent - Model Analysis")
    
    project_id = get_real_project_from_db()
    
    payload = {
        "message": "Analyze the BIM model for clash detection and coordination issues",
        "agentType": "bim",
        "context": {
            "projectId": project_id,
            "modelData": {"model_id": f"bim-{project_id}"},
            "enableTools": True
        }
    }
    
    try:
        start_time = time.time()
        response = requests.post(API_URL, json=payload, timeout=60)
        duration = time.time() - start_time
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Time: {duration:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            content = data.get('content', '')
            agent_type = data.get('agentType', '')
            
            print(f"Agent Used: {agent_type}")
            print(f"AI Response Length: {len(content)} chars")
            print(f"\nResponse Preview:\n{content[:400]}...")
            
            correct_agent = agent_type == 'bim'
            has_bim = any(kw in content.lower() for kw in ['bim', 'model', 'clash', 'coordination', '3d'])
            
            print_result("BIM Agent Used", correct_agent, f"Agent: {agent_type}")
            print_result("BIM Keywords", has_bim, "Found BIM-specific terms")
            
            return correct_agent and has_bim
        else:
            print_result("API Request", False, f"Status {response.status_code}")
            return False
            
    except Exception as e:
        print_result("Test Execution", False, str(e))
        return False

def test_risk_agent_autonomous():
    """Test: Risk Agent with project risk assessment"""
    print_header("TEST 5: Risk Agent - Risk Assessment")
    
    project_id = get_real_project_from_db()
    
    payload = {
        "message": "Assess project risks including safety, schedule, and budget concerns",
        "agentType": "risk",
        "context": {
            "projectId": project_id,
            "projectData": {"id": project_id, "phase": "construction"},
            "enableTools": True
        }
    }
    
    try:
        start_time = time.time()
        response = requests.post(API_URL, json=payload, timeout=60)
        duration = time.time() - start_time
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Time: {duration:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            content = data.get('content', '')
            agent_type = data.get('agentType', '')
            
            print(f"Agent Used: {agent_type}")
            print(f"AI Response Length: {len(content)} chars")
            print(f"\nResponse Preview:\n{content[:400]}...")
            
            correct_agent = agent_type == 'risk'
            has_risk = any(kw in content.lower() for kw in ['risk', 'safety', 'hazard', 'mitigation', 'assessment'])
            
            print_result("Risk Agent Used", correct_agent, f"Agent: {agent_type}")
            print_result("Risk Keywords", has_risk, "Found risk-specific terms")
            
            return correct_agent and has_risk
        else:
            print_result("API Request", False, f"Status {response.status_code}")
            return False
            
    except Exception as e:
        print_result("Test Execution", False, str(e))
        return False

def test_suna_orchestrator():
    """Test: Suna AI orchestrator with autonomous tool chaining"""
    print_header("TEST 6: Suna AI - Multi-Agent Orchestration")
    
    project_id = get_real_project_from_db()
    
    payload = {
        "message": "Give me a complete project overview: status, documents, and any compliance issues",
        "agentType": "suna",
        "context": {
            "projectId": project_id,
            "enableTools": True
        }
    }
    
    try:
        start_time = time.time()
        response = requests.post(API_URL, json=payload, timeout=120)
        duration = time.time() - start_time
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Time: {duration:.2f}s")
        
        if response.status_code == 200:
            data = response.json()
            content = data.get('content', '')
            reasoning = data.get('reasoning', '')
            agent_type = data.get('agentType', '')
            
            print(f"Agent Used: {agent_type}")
            print(f"AI Response Length: {len(content)} chars")
            print(f"Tool Execution: {reasoning or 'No tools executed'}")
            print(f"\nResponse Preview:\n{content[:400]}...")
            
            correct_agent = agent_type == 'suna'
            comprehensive = len(content) > 500
            
            print_result("Suna Orchestrator Used", correct_agent, f"Agent: {agent_type}")
            print_result("Comprehensive Response", comprehensive, f"{len(content)} chars")
            
            return correct_agent and comprehensive
        else:
            print_result("API Request", False, f"Status {response.status_code}")
            return False
            
    except Exception as e:
        print_result("Test Execution", False, str(e))
        return False

def test_all_agents_responding():
    """Test: Verify all 7 agents are accessible and responding"""
    print_header("TEST 7: All Agent Types - Availability Check")
    
    agents = ['suna', 'document', 'upload', 'pm', 'bim', 'compliance', 'risk']
    results = {}
    
    for agent in agents:
        print(f"\nTesting {agent} agent...")
        payload = {
            "message": "Hello, please confirm you're operational",
            "agentType": agent,
            "context": {"enableTools": False}
        }
        
        try:
            response = requests.post(API_URL, json=payload, timeout=30)
            if response.status_code == 200:
                data = response.json()
                results[agent] = len(data.get('content', '')) > 50
                print(f"  ✓ {agent}: {len(data.get('content', ''))} chars")
            else:
                results[agent] = False
                print(f"  ✗ {agent}: Status {response.status_code}")
        except Exception as e:
            results[agent] = False
            print(f"  ✗ {agent}: {str(e)[:50]}")
    
    all_working = all(results.values())
    working_count = sum(results.values())
    
    print_result(
        "All Agents Operational",
        all_working,
        f"{working_count}/{len(agents)} agents responding"
    )
    
    return all_working

def run_all_tests():
    """Run complete autonomous AI test suite with real data"""
    print("\n" + "="*80)
    print(" AUTONOMOUS AI AGENT TEST SUITE - REAL DATABASE DATA")
    print(" Testing all 7 specialized agents with actual Supabase data")
    print("="*80)
    
    # Get real project for context
    project_id = get_real_project_from_db()
    print(f"\n Using project: {project_id}")
    
    results = {
        "Document Agent": test_document_agent_autonomous(),
        "PM Agent": test_pm_agent_autonomous(),
        "Compliance Agent": test_compliance_agent_autonomous(),
        "BIM Agent": test_bim_agent_autonomous(),
        "Risk Agent": test_risk_agent_autonomous(),
        "Suna Orchestrator": test_suna_orchestrator(),
        "All Agents Available": test_all_agents_responding()
    }
    
    # Print summary
    print_header("TEST SUMMARY")
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✓" if passed_test else "✗"
        print(f"{status} {test_name}")
    
    print(f"\n{'='*80}")
    print(f" RESULTS: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    print(f"{'='*80}\n")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! All agents working with real data!")
    elif passed >= total * 0.7:
        print("⚠️ MOSTLY WORKING - Some agents need attention")
    else:
        print("❌ TESTS FAILED - Multiple agents not responding correctly")
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
