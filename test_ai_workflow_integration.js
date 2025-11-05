/**
 * Integration Test Script for AI Workflow Orchestration
 * Tests end-to-end integration of AI workflows across the platform
 */

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Test data
const testProject = {
  name: 'Test Construction Project',
  description: 'Integration test project for AI workflow orchestration',
  location: 'San Francisco, CA',
  phase: 'planning',
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  budget: 1000000,
  status: 'planning',
  progress: 0,
  spent: 0
};

const testTask = {
  title: 'Review architectural drawings',
  description: 'Initial review of architectural plans for compliance',
  priority: 'high',
  status: 'pending'
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (message) {
    console.log(`   ${message}`);
  }
  
  results.tests.push({ name, passed, message });
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
}

async function testWorkflowAPIs() {
  console.log('\n🧪 Testing AI Workflow APIs\n');

  try {
    // Test 1: Get available workflows
    console.log('\n📋 Test 1: Get Available Workflows');
    const workflowsResponse = await fetch(`${baseUrl}/api/ai-workflow`);
    const workflowsData = await workflowsResponse.json();
    
    if (workflowsData.workflows && Array.isArray(workflowsData.workflows)) {
      logTest('Get Available Workflows', true, `Found ${workflowsData.workflows.length} workflows`);
      console.log('   Available workflows:', workflowsData.workflows.map(w => w.name).join(', '));
    } else {
      logTest('Get Available Workflows', false, 'No workflows returned');
    }

    // Test 2: AI Service Configuration
    console.log('\n🔧 Test 2: AI Service Configuration');
    const aiChatResponse = await fetch(`${baseUrl}/api/ai-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'status check',
        agentType: 'suna'
      })
    });
    
    const aiChatData = await aiChatResponse.json();
    
    if (aiChatData.serviceStatus) {
      const configured = aiChatData.serviceStatus.openai || aiChatData.serviceStatus.google;
      logTest('AI Service Configuration', configured, 
        `OpenAI: ${aiChatData.serviceStatus.openai ? '✓' : '✗'}, Google: ${aiChatData.serviceStatus.google ? '✓' : '✗'}`);
      
      if (!configured) {
        console.log('   ⚠️  Warning: No AI services configured. Set OPENAI_API_KEY or GOOGLE_AI_API_KEY in .env.local');
      }
    } else {
      logTest('AI Service Configuration', false, 'Could not check service status');
    }

    console.log('\n📊 Integration Test Summary');
    console.log('─────────────────────────────');
    console.log(`Total Tests: ${results.tests.length}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log('─────────────────────────────\n');

    if (results.failed > 0) {
      console.log('❌ Some tests failed. Review the output above for details.\n');
      process.exit(1);
    } else {
      console.log('✅ All tests passed! AI workflow integration is working correctly.\n');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    console.error('   Make sure the development server is running on', baseUrl);
    process.exit(1);
  }
}

// Workflow validation tests
function validateWorkflowStructure() {
  console.log('\n🔍 Validating Workflow Implementation Structure\n');

  const requiredFiles = [
    'src/lib/ai-workflow-orchestrator.ts',
    'src/app/api/ai-workflow/route.ts',
    'src/app/api/compliance/route.ts',
    'src/components/workflow/WorkflowMonitor.tsx',
    'src/app/workflows/page.tsx'
  ];

  const fs = require('fs');
  const path = require('path');

  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    const exists = fs.existsSync(filePath);
    logTest(`File exists: ${file}`, exists);
  });
}

// Run all tests
async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   AI Workflow Orchestration Integration Tests           ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  validateWorkflowStructure();
  await testWorkflowAPIs();
}

runAllTests();
