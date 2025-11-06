#!/usr/bin/env node

/**
 * End-to-End Integration Test for ConstructAI Platform
 * Tests the complete blueprint upload and AI conversion workflow
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const config = {
  frontendUrl: 'http://localhost:3000',
  hunyuan3dUrl: 'http://localhost:8000',
  testTimeout: 30000
};

// Test utilities
class IntegrationTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logMessage);

    this.results.push({
      timestamp,
      type,
      message,
      elapsed: Date.now() - this.startTime
    });
  }

  async test(name, testFn) {
    this.log(`Starting test: ${name}`, 'test');
    try {
      await testFn();
      this.log(`✅ Test passed: ${name}`, 'pass');
      return true;
    } catch (error) {
      this.log(`❌ Test failed: ${name} - ${error.message}`, 'fail');
      return false;
    }
  }

  async fetch(url, options = {}) {
    const fetch = (await import('node-fetch')).default;
    return fetch(url, options);
  }

  generateReport() {
    const totalTests = this.results.filter(r => r.type === 'test').length;
    const passedTests = this.results.filter(r => r.type === 'pass').length;
    const failedTests = this.results.filter(r => r.type === 'fail').length;

    console.log('\n' + '='.repeat(80));
    console.log('INTEGRATION TEST REPORT');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Total Time: ${((Date.now() - this.startTime) / 1000).toFixed(2)}s`);
    console.log('='.repeat(80));

    return { totalTests, passedTests, failedTests };
  }
}

// Test implementations
async function testHealthChecks(tester) {
  // Test Hunyuan3D service health
  await tester.test('Hunyuan3D Service Health Check', async () => {
    const response = await tester.fetch(`${config.hunyuan3dUrl}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.model_loaded) {
      throw new Error('AI models not loaded');
    }

    tester.log(`Service status: ${data.status}, Device: ${data.device}`);
  });

  // Test frontend API health
  await tester.test('Frontend API Health Check', async () => {
    const response = await tester.fetch(`${config.frontendUrl}/api/hunyuan3d/convert?action=health`);

    if (!response.ok) {
      throw new Error(`Frontend API health check failed: ${response.statusText}`);
    }

    tester.log('Frontend API is responsive');
  });
}

async function testBlueprintAnalysis(tester) {
  await tester.test('Blueprint Analysis Workflow', async () => {
    // Create a test image file
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAG+', 'base64');

    const formData = new FormData();
    formData.append('file', testImageData, {
      filename: 'test-blueprint.png',
      contentType: 'image/png'
    });

    const response = await tester.fetch(`${config.hunyuan3dUrl}/analyze`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.analysis) {
      throw new Error('Analysis response invalid');
    }

    tester.log(`Analysis completed: ${data.analysis.detected_features.estimated_rooms} rooms detected`);
  });
}

async function test3DGeneration(tester) {
  await tester.test('3D Model Generation Workflow', async () => {
    // Create a test image file
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAG+', 'base64');

    const formData = new FormData();
    formData.append('image', testImageData, {
      filename: 'test-blueprint.png',
      contentType: 'image/png'
    });
    formData.append('prompt', 'A detailed 3D architectural building model');
    formData.append('style', 'architectural');
    formData.append('quality', 'standard');
    formData.append('include_textures', 'true');

    // Start generation
    const response = await tester.fetch(`${config.hunyuan3dUrl}/generate3d`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Generation failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.job_id) {
      throw new Error('Generation response invalid');
    }

    tester.log(`Generation started: Job ID ${data.job_id}`);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const statusResponse = await tester.fetch(`${config.hunyuan3dUrl}/status/${data.job_id}`);

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.statusText}`);
      }

      const statusData = await statusResponse.json();

      tester.log(`Generation progress: ${statusData.progress}% - ${statusData.message}`);

      if (statusData.status === 'completed') {
        if (!statusData.result || !statusData.result.model_url) {
          throw new Error('Generation completed but no model URL provided');
        }

        tester.log(`Generation completed: Model available at ${statusData.result.model_url}`);
        return;
      }

      if (statusData.status === 'failed') {
        throw new Error(`Generation failed: ${statusData.message}`);
      }

      attempts++;
    }

    throw new Error('Generation timeout');
  });
}

async function testModelDownload(tester) {
  await tester.test('Model Download and File Access', async () => {
    // Test downloading a mock model file
    const response = await tester.fetch(`${config.hunyuan3dUrl}/download/test-model.glb`);

    // We expect 404 for a non-existent file, but service should be responding
    if (response.status !== 404) {
      throw new Error(`Unexpected response status: ${response.status}`);
    }

    tester.log('Download endpoint is accessible');
  });
}

async function testFrontendIntegration(tester) {
  await tester.test('Frontend Service Integration', async () => {
    // Test if the frontend can communicate with Hunyuan3D service
    const response = await tester.fetch(`${config.frontendUrl}/api/hunyuan3d/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'test'
      })
    });

    // We expect some response (even if it's an error about missing file)
    tester.log(`Frontend integration responsive: ${response.status}`);
  });
}

async function testErrorHandling(tester) {
  await tester.test('Error Handling and Recovery', async () => {
    // Test invalid request to ensure proper error handling
    const response = await tester.fetch(`${config.hunyuan3dUrl}/generate3d`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ invalid: 'data' })
    });

    // Should return a proper error response, not crash
    if (response.status === 500) {
      // Check if it's a proper error response
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          tester.log('Error handling working correctly');
          return;
        }
      } catch (e) {
        // JSON parsing failed, that's also an error
      }
    }

    if (response.status === 422) {
      tester.log('Validation error handled correctly');
      return;
    }

    throw new Error(`Unexpected error response: ${response.status}`);
  });
}

// Main test runner
async function runIntegrationTests() {
  const tester = new IntegrationTester();

  tester.log('Starting ConstructAI Platform Integration Tests');
  tester.log(`Frontend URL: ${config.frontendUrl}`);
  tester.log(`Hunyuan3D URL: ${config.hunyuan3dUrl}`);

  try {
    // Core service tests
    await testHealthChecks(tester);

    // AI workflow tests
    await testBlueprintAnalysis(tester);
    await test3DGeneration(tester);

    // File handling tests
    await testModelDownload(tester);

    // Integration tests
    await testFrontendIntegration(tester);

    // Error handling tests
    await testErrorHandling(tester);

  } catch (error) {
    tester.log(`Critical test failure: ${error.message}`, 'error');
  }

  // Generate final report
  const report = tester.generateReport();

  // Write detailed log to file
  const logContent = tester.results.map(r =>
    `[${r.timestamp}] [${r.type.toUpperCase()}] ${r.message}`
  ).join('\n');

  fs.writeFileSync('integration-test-results.log', logContent);
  tester.log('Detailed log written to integration-test-results.log');

  // Exit with appropriate code
  process.exit(report.failedTests === 0 ? 0 : 1);
}

// Check if required services are running
async function checkPrerequisites() {
  const tester = new IntegrationTester();

  try {
    // Check if Hunyuan3D service is running
    await tester.fetch(`${config.hunyuan3dUrl}/health`);
    console.log('✅ Hunyuan3D service is running');
  } catch (error) {
    console.log('❌ Hunyuan3D service is not running. Please start it first:');
    console.log('   cd construction-ai-platform/hunyuan3d');
    console.log('   source hunyuan3d_env/bin/activate');
    console.log('   python test_server.py');
    process.exit(1);
  }

  try {
    // Check if frontend is running
    await tester.fetch(`${config.frontendUrl}/api/hunyuan3d/convert?action=health`);
    console.log('✅ Frontend service is running');
  } catch (error) {
    console.log('❌ Frontend service is not running. Please start it first:');
    console.log('   cd construction-ai-platform');
    console.log('   bun dev');
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  console.log('🧪 ConstructAI Platform Integration Test Suite');
  console.log('='.repeat(50));

  checkPrerequisites()
    .then(() => runIntegrationTests())
    .catch(error => {
      console.error('Test suite failed to start:', error.message);
      process.exit(1);
    });
}

module.exports = { IntegrationTester, runIntegrationTests };
