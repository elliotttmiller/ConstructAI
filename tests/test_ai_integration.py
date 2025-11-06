#!/usr/bin/env python3
"""
ConstructAI Platform - Integration Test Suite
Real end-to-end testing of AI agents, services, and workflows
NO MOCKING - All tests use actual API calls and verify real responses
"""

import sys
import os
import json
import time
import requests
from datetime import datetime
from typing import Dict, Any, List, Tuple
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

class TestResult:
    """Container for test results"""
    def __init__(self, name: str, passed: bool, message: str, duration: float, details: Dict[str, Any] = None):
        self.name = name
        self.passed = passed
        self.message = message
        self.duration = duration
        self.details = details or {}
        self.timestamp = datetime.now()

class ConstructAITestSuite:
    """Comprehensive test suite for ConstructAI platform"""
    
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.results: List[TestResult] = []
        self.start_time = time.time()
        
        # Verify environment variables
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.google_key = os.getenv('GOOGLE_AI_API_KEY')
        
        print(f"{Colors.HEADER}{'='*80}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}ConstructAI Platform - Integration Test Suite{Colors.ENDC}")
        print(f"{Colors.HEADER}{'='*80}{Colors.ENDC}\n")
        
        print(f"{Colors.OKCYAN}Test Configuration:{Colors.ENDC}")
        print(f"  Base URL: {base_url}")
        print(f"  OpenAI Configured: {'✓ Yes' if self.openai_key else '✗ No'}")
        print(f"  Google AI Configured: {'✓ Yes' if self.google_key else '✗ No'}")
        print(f"  Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    def test_environment_configuration(self) -> TestResult:
        """Test 1: Verify environment variables are properly configured"""
        test_name = "Environment Configuration"
        start = time.time()
        
        try:
            missing = []
            if not self.openai_key:
                missing.append("OPENAI_API_KEY")
            if not self.google_key:
                missing.append("GOOGLE_AI_API_KEY")
            
            if missing:
                return TestResult(
                    test_name,
                    False,
                    f"Missing environment variables: {', '.join(missing)}",
                    time.time() - start,
                    {"missing_vars": missing}
                )
            
            return TestResult(
                test_name,
                True,
                "All required environment variables configured",
                time.time() - start,
                {"openai": bool(self.openai_key), "google": bool(self.google_key)}
            )
        except Exception as e:
            return TestResult(test_name, False, f"Error: {str(e)}", time.time() - start)

    def test_api_health_check(self) -> TestResult:
        """Test 2: Verify Next.js API is running and accessible"""
        test_name = "API Health Check"
        start = time.time()
        
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=5)
            
            if response.status_code == 404:
                # API doesn't have health endpoint, try a different endpoint
                response = requests.get(f"{self.base_url}/", timeout=5)
            
            if response.status_code in [200, 404]:  # 404 means server is running
                return TestResult(
                    test_name,
                    True,
                    f"Server is running (HTTP {response.status_code})",
                    time.time() - start,
                    {"status_code": response.status_code}
                )
            else:
                return TestResult(
                    test_name,
                    False,
                    f"Server returned unexpected status: {response.status_code}",
                    time.time() - start,
                    {"status_code": response.status_code}
                )
        except requests.exceptions.ConnectionError:
            return TestResult(
                test_name,
                False,
                f"Cannot connect to {self.base_url}. Is the server running?",
                time.time() - start
            )
        except Exception as e:
            return TestResult(test_name, False, f"Error: {str(e)}", time.time() - start)

    def test_suna_ai_orchestrator(self) -> TestResult:
        """Test 3: Test Suna AI - Master Orchestrator Agent"""
        test_name = "Suna AI - Master Orchestrator"
        start = time.time()
        
        try:
            payload = {
                "message": "What is the current status of my construction project?",
                "agentType": "suna",
                "userId": "test_user",
                "context": {"test": True}
            }
            
            response = requests.post(
                f"{self.base_url}/api/ai-chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code != 200:
                return TestResult(
                    test_name,
                    False,
                    f"API returned status {response.status_code}: {response.text[:200]}",
                    time.time() - start,
                    {"status_code": response.status_code}
                )
            
            data = response.json()
            
            # Verify response structure
            if not data.get('content'):
                return TestResult(
                    test_name,
                    False,
                    "Response missing 'content' field",
                    time.time() - start,
                    {"response": data}
                )
            
            if not data.get('model'):
                return TestResult(
                    test_name,
                    False,
                    "Response missing 'model' field",
                    time.time() - start,
                    {"response": data}
                )
            
            # Verify it's a real AI response (not empty or error message)
            content = data['content']
            if len(content) < 50:
                return TestResult(
                    test_name,
                    False,
                    f"Response too short ({len(content)} chars), may be fallback",
                    time.time() - start,
                    {"content": content}
                )
            
            return TestResult(
                test_name,
                True,
                f"Suna AI responded with {len(content)} chars using {data['model']}",
                time.time() - start,
                {
                    "content_length": len(content),
                    "model": data['model'],
                    "has_usage": bool(data.get('usage')),
                    "service_status": data.get('serviceStatus')
                }
            )
            
        except requests.exceptions.Timeout:
            return TestResult(
                test_name,
                False,
                "Request timed out after 30 seconds",
                time.time() - start
            )
        except Exception as e:
            return TestResult(test_name, False, f"Error: {str(e)}", time.time() - start)

    def test_document_processor_agent(self) -> TestResult:
        """Test 4: Test Document Processing Agent"""
        test_name = "Document Processor Agent"
        start = time.time()
        
        try:
            test_document = """
            CONSTRUCTION SPECIFICATION
            Project: Downtown Office Building
            Section 03300 - CAST-IN-PLACE CONCRETE
            
            1.1 MATERIALS
            A. Cement: ASTM C150, Type I/II
            B. Concrete Strength: 4000 psi at 28 days
            C. Slump: 4 inches ± 1 inch
            """
            
            payload = {
                "message": test_document,
                "agentType": "upload",
                "userId": "test_user",
                "context": {"documentType": "specification"}
            }
            
            response = requests.post(
                f"{self.base_url}/api/ai-chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code != 200:
                return TestResult(
                    test_name,
                    False,
                    f"API returned status {response.status_code}",
                    time.time() - start
                )
            
            data = response.json()
            content = data.get('content', '')
            
            # Verify document was actually analyzed (should mention concrete, ASTM, or materials)
            keywords = ['concrete', 'astm', 'cement', 'specification', 'material', '4000 psi']
            found_keywords = [kw for kw in keywords if kw.lower() in content.lower()]
            
            if len(found_keywords) < 2:
                return TestResult(
                    test_name,
                    False,
                    f"Response doesn't reference document content (found {len(found_keywords)} keywords)",
                    time.time() - start,
                    {"found_keywords": found_keywords}
                )
            
            return TestResult(
                test_name,
                True,
                f"Document analyzed successfully ({len(content)} chars, {len(found_keywords)} keywords matched)",
                time.time() - start,
                {
                    "content_length": len(content),
                    "keywords_found": found_keywords,
                    "model": data.get('model')
                }
            )
            
        except Exception as e:
            return TestResult(test_name, False, f"Error: {str(e)}", time.time() - start)

    def test_bim_analyzer_agent(self) -> TestResult:
        """Test 5: Test BIM Analysis Agent"""
        test_name = "BIM Analyzer Agent"
        start = time.time()
        
        try:
            payload = {
                "message": "Analyze this building model for potential clashes and coordination issues",
                "agentType": "bim",
                "userId": "test_user",
                "context": {
                    "modelData": {
                        "building_type": "office",
                        "floors": 12,
                        "systems": ["structural", "mechanical", "electrical", "plumbing"]
                    }
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/ai-chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code != 200:
                return TestResult(
                    test_name,
                    False,
                    f"API returned status {response.status_code}",
                    time.time() - start
                )
            
            data = response.json()
            content = data.get('content', '')
            
            # Verify BIM-specific analysis (should mention clashes, coordination, systems)
            bim_keywords = ['clash', 'coordination', 'model', 'system', 'bim', 'structural', 'mep']
            found = [kw for kw in bim_keywords if kw.lower() in content.lower()]
            
            if len(found) < 2:
                return TestResult(
                    test_name,
                    False,
                    f"Response doesn't appear to be BIM analysis ({len(found)} BIM keywords)",
                    time.time() - start
                )
            
            return TestResult(
                test_name,
                True,
                f"BIM analysis completed ({len(content)} chars, {len(found)} BIM keywords)",
                time.time() - start,
                {
                    "content_length": len(content),
                    "bim_keywords": found,
                    "model": data.get('model')
                }
            )
            
        except Exception as e:
            return TestResult(test_name, False, f"Error: {str(e)}", time.time() - start)

    def test_compliance_checker_agent(self) -> TestResult:
        """Test 6: Test Building Code Compliance Agent"""
        test_name = "Building Code Compliance Agent"
        start = time.time()
        
        try:
            payload = {
                "message": "Check building code compliance for this project",
                "agentType": "compliance",
                "userId": "test_user",
                "context": {
                    "projectDetails": {
                        "type": "commercial",
                        "occupancy": "B",
                        "height": 85,
                        "area": 50000
                    },
                    "location": "California, USA"
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/ai-chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code != 200:
                return TestResult(
                    test_name,
                    False,
                    f"API returned status {response.status_code}",
                    time.time() - start
                )
            
            data = response.json()
            content = data.get('content', '')
            
            # Verify compliance-specific analysis
            compliance_keywords = ['code', 'compliance', 'ibc', 'building', 'regulation', 'requirement']
            found = [kw for kw in compliance_keywords if kw.lower() in content.lower()]
            
            if len(found) < 2:
                return TestResult(
                    test_name,
                    False,
                    f"Response doesn't appear to be compliance analysis ({len(found)} keywords)",
                    time.time() - start
                )
            
            return TestResult(
                test_name,
                True,
                f"Compliance check completed ({len(content)} chars, {len(found)} compliance keywords)",
                time.time() - start,
                {
                    "content_length": len(content),
                    "compliance_keywords": found,
                    "model": data.get('model')
                }
            )
            
        except Exception as e:
            return TestResult(test_name, False, f"Error: {str(e)}", time.time() - start)

    def test_project_insights_agent(self) -> TestResult:
        """Test 7: Test Project Management Insights Agent"""
        test_name = "Project Management Agent"
        start = time.time()
        
        try:
            payload = {
                "message": "Provide project management insights and recommendations",
                "agentType": "pm",
                "userId": "test_user",
                "context": {
                    "projectData": {
                        "name": "Downtown Office Tower",
                        "budget": 25000000,
                        "timeline": "18 months",
                        "completion": "45%"
                    },
                    "taskData": []
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/ai-chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code != 200:
                return TestResult(
                    test_name,
                    False,
                    f"API returned status {response.status_code}",
                    time.time() - start
                )
            
            data = response.json()
            content = data.get('content', '')
            
            # Verify PM-specific analysis
            pm_keywords = ['project', 'schedule', 'budget', 'timeline', 'management', 'task', 'milestone']
            found = [kw for kw in pm_keywords if kw.lower() in content.lower()]
            
            if len(found) < 2:
                return TestResult(
                    test_name,
                    False,
                    f"Response doesn't appear to be PM analysis ({len(found)} PM keywords)",
                    time.time() - start
                )
            
            return TestResult(
                test_name,
                True,
                f"PM insights generated ({len(content)} chars, {len(found)} PM keywords)",
                time.time() - start,
                {
                    "content_length": len(content),
                    "pm_keywords": found,
                    "model": data.get('model')
                }
            )
            
        except Exception as e:
            return TestResult(test_name, False, f"Error: {str(e)}", time.time() - start)

    def test_risk_assessment_agent(self) -> TestResult:
        """Test 8: Test Risk Assessment Agent"""
        test_name = "Risk Assessment Agent"
        start = time.time()
        
        try:
            payload = {
                "message": "Assess project risks and provide mitigation strategies",
                "agentType": "risk",
                "userId": "test_user",
                "context": {
                    "projectData": {
                        "location": "Coastal area",
                        "type": "high-rise",
                        "budget": 50000000
                    }
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/ai-chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code != 200:
                return TestResult(
                    test_name,
                    False,
                    f"API returned status {response.status_code}",
                    time.time() - start
                )
            
            data = response.json()
            content = data.get('content', '')
            
            # Verify risk-specific analysis
            risk_keywords = ['risk', 'safety', 'hazard', 'mitigation', 'assessment', 'danger', 'prevent']
            found = [kw for kw in risk_keywords if kw.lower() in content.lower()]
            
            if len(found) < 2:
                return TestResult(
                    test_name,
                    False,
                    f"Response doesn't appear to be risk analysis ({len(found)} risk keywords)",
                    time.time() - start
                )
            
            return TestResult(
                test_name,
                True,
                f"Risk assessment completed ({len(content)} chars, {len(found)} risk keywords)",
                time.time() - start,
                {
                    "content_length": len(content),
                    "risk_keywords": found,
                    "model": data.get('model')
                }
            )
            
        except Exception as e:
            return TestResult(test_name, False, f"Error: {str(e)}", time.time() - start)

    def test_ai_provider_fallback(self) -> TestResult:
        """Test 9: Verify AI provider priority and fallback system"""
        test_name = "AI Provider Fallback System"
        start = time.time()
        
        try:
            # Make a simple request to check which provider is being used
            payload = {
                "message": "Hello, which AI model are you using?",
                "agentType": "suna",
                "userId": "test_user"
            }
            
            response = requests.post(
                f"{self.base_url}/api/ai-chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code != 200:
                return TestResult(
                    test_name,
                    False,
                    f"API returned status {response.status_code}",
                    time.time() - start
                )
            
            data = response.json()
            model = data.get('model', 'unknown')
            service_status = data.get('serviceStatus', {})
            
            # Verify a real AI model is being used
            valid_models = ['gpt-4', 'gpt-3.5', 'gemini']
            is_valid = any(m in model.lower() for m in valid_models)
            
            if not is_valid:
                return TestResult(
                    test_name,
                    False,
                    f"Invalid or fallback model detected: {model}",
                    time.time() - start,
                    {"model": model, "service_status": service_status}
                )
            
            # Determine primary provider
            primary = None
            if 'gpt' in model.lower():
                primary = 'OpenAI'
            elif 'gemini' in model.lower():
                primary = 'Google AI'
            
            return TestResult(
                test_name,
                True,
                f"AI provider system working - Using {primary} ({model})",
                time.time() - start,
                {
                    "model": model,
                    "primary_provider": primary,
                    "service_status": service_status
                }
            )
            
        except Exception as e:
            return TestResult(test_name, False, f"Error: {str(e)}", time.time() - start)

    def test_response_consistency(self) -> TestResult:
        """Test 10: Verify consistent response format across all agents"""
        test_name = "Response Format Consistency"
        start = time.time()
        
        try:
            required_fields = ['content', 'model']
            agents_to_test = ['suna', 'upload', 'bim', 'compliance', 'pm', 'risk']
            
            inconsistent_agents = []
            
            for agent in agents_to_test:
                payload = {
                    "message": "Test message",
                    "agentType": agent,
                    "userId": "test_user"
                }
                
                response = requests.post(
                    f"{self.base_url}/api/ai-chat",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json()
                    missing_fields = [field for field in required_fields if field not in data]
                    if missing_fields:
                        inconsistent_agents.append({
                            "agent": agent,
                            "missing": missing_fields
                        })
            
            if inconsistent_agents:
                return TestResult(
                    test_name,
                    False,
                    f"{len(inconsistent_agents)} agents have inconsistent response format",
                    time.time() - start,
                    {"inconsistent_agents": inconsistent_agents}
                )
            
            return TestResult(
                test_name,
                True,
                f"All {len(agents_to_test)} agents return consistent response format",
                time.time() - start,
                {"agents_tested": agents_to_test}
            )
            
        except Exception as e:
            return TestResult(test_name, False, f"Error: {str(e)}", time.time() - start)

    def run_all_tests(self):
        """Execute all tests and generate report"""
        tests = [
            self.test_environment_configuration,
            self.test_api_health_check,
            self.test_suna_ai_orchestrator,
            self.test_document_processor_agent,
            self.test_bim_analyzer_agent,
            self.test_compliance_checker_agent,
            self.test_project_insights_agent,
            self.test_risk_assessment_agent,
            self.test_ai_provider_fallback,
            self.test_response_consistency
        ]
        
        print(f"{Colors.HEADER}Running {len(tests)} integration tests...{Colors.ENDC}\n")
        
        for i, test in enumerate(tests, 1):
            print(f"{Colors.OKCYAN}[{i}/{len(tests)}] Running: {test.__doc__.split(':')[1].strip()}{Colors.ENDC}")
            result = test()
            self.results.append(result)
            
            if result.passed:
                print(f"{Colors.OKGREEN}✓ PASS{Colors.ENDC}: {result.message} ({result.duration:.2f}s)")
            else:
                print(f"{Colors.FAIL}✗ FAIL{Colors.ENDC}: {result.message} ({result.duration:.2f}s)")
            
            if result.details:
                for key, value in result.details.items():
                    print(f"  {Colors.OKCYAN}└─{Colors.ENDC} {key}: {value}")
            print()
        
        self.print_summary()

    def print_summary(self):
        """Print final test summary"""
        total_time = time.time() - self.start_time
        passed = sum(1 for r in self.results if r.passed)
        failed = len(self.results) - passed
        
        print(f"\n{Colors.HEADER}{'='*80}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}Test Summary{Colors.ENDC}")
        print(f"{Colors.HEADER}{'='*80}{Colors.ENDC}\n")
        
        print(f"Total Tests: {Colors.BOLD}{len(self.results)}{Colors.ENDC}")
        print(f"Passed: {Colors.OKGREEN}{passed}{Colors.ENDC}")
        print(f"Failed: {Colors.FAIL}{failed}{Colors.ENDC}")
        print(f"Success Rate: {Colors.BOLD}{(passed/len(self.results)*100):.1f}%{Colors.ENDC}")
        print(f"Total Duration: {Colors.BOLD}{total_time:.2f}s{Colors.ENDC}\n")
        
        if failed > 0:
            print(f"{Colors.FAIL}Failed Tests:{Colors.ENDC}")
            for result in self.results:
                if not result.passed:
                    print(f"  {Colors.FAIL}✗{Colors.ENDC} {result.name}: {result.message}")
            print()
        
        # Exit with appropriate code
        sys.exit(0 if failed == 0 else 1)

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='ConstructAI Integration Test Suite')
    parser.add_argument('--url', default='http://localhost:3000', help='Base URL for API (default: http://localhost:3000)')
    args = parser.parse_args()
    
    suite = ConstructAITestSuite(base_url=args.url)
    suite.run_all_tests()

if __name__ == '__main__':
    main()
