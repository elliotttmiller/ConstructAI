/**
 * Manual Test Script for Autonomous Workflow System
 * Run this after starting the server to verify autonomous workflow functionality
 */

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

console.log('🤖 Autonomous Workflow System - Manual Test Suite\n');
console.log('='.repeat(60));
console.log('Base URL:', baseUrl);
console.log('='.repeat(60));
console.log('');

async function testWorkflowAPI() {
  console.log('Test 1: Queue a document processing task');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${baseUrl}/api/autonomous-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taskType: 'document_process',
        action: 'analyze_document',
        data: {
          documentId: 'test-doc-123'
        },
        priority: 'high',
        agentType: 'document-processor'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Task queued successfully');
      console.log('Task ID:', data.taskId);
      console.log('Status:', data.status);
      return data.taskId;
    } else {
      console.log('❌ Failed to queue task');
      console.log('Status:', response.status);
      const error = await response.text();
      console.log('Error:', error);
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }
  
  console.log('');
}

async function testGetWorkflowStatus(taskId) {
  console.log('Test 2: Get workflow status');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${baseUrl}/api/autonomous-workflow${taskId ? `?taskId=${taskId}` : ''}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Status retrieved successfully');
      
      if (taskId) {
        console.log('Task:', data.task);
      } else {
        console.log('Total tasks:', data.total);
        console.log('By status:', data.byStatus);
        console.log('Recent tasks:', data.tasks.slice(0, 3).map(t => ({
          id: t.id,
          type: t.type,
          status: t.status,
          priority: t.priority
        })));
      }
    } else {
      console.log('❌ Failed to get status');
      console.log('Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }
  
  console.log('');
}

async function testMultipleTasks() {
  console.log('Test 3: Queue multiple tasks with different priorities');
  console.log('-'.repeat(60));
  
  const tasks = [
    { type: 'database_query', action: 'query', priority: 'low' },
    { type: 'task_create', action: 'create_task', priority: 'high' },
    { type: 'bim_analysis', action: 'analyze_model', priority: 'critical' },
    { type: 'document_process', action: 'analyze_document', priority: 'medium' }
  ];

  const queuedTasks = [];
  
  for (const task of tasks) {
    try {
      const response = await fetch(`${baseUrl}/api/autonomous-workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: task.type,
          action: task.action,
          data: { testData: 'test' },
          priority: task.priority,
          agentType: 'test-agent'
        })
      });

      if (response.ok) {
        const data = await response.json();
        queuedTasks.push(data.taskId);
        console.log(`✅ Queued ${task.type} with priority ${task.priority}: ${data.taskId}`);
      }
    } catch (error) {
      console.log(`❌ Failed to queue ${task.type}:`, error);
    }
  }

  console.log(`\n✅ Successfully queued ${queuedTasks.length}/${tasks.length} tasks`);
  console.log('');
  
  return queuedTasks;
}

async function testCancelTask(taskId) {
  console.log('Test 4: Cancel a pending task');
  console.log('-'.repeat(60));
  
  if (!taskId) {
    console.log('⚠️  No task ID provided, skipping cancel test');
    console.log('');
    return;
  }

  try {
    const response = await fetch(`${baseUrl}/api/autonomous-workflow?taskId=${taskId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Task cancelled:', data.message);
    } else {
      console.log('⚠️  Could not cancel task (might be already completed)');
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }
  
  console.log('');
}

async function testCleanup() {
  console.log('Test 5: Cleanup old completed tasks');
  console.log('-'.repeat(60));
  
  try {
    const response = await fetch(`${baseUrl}/api/autonomous-workflow`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cleanup',
        olderThanHours: 0 // Clean all completed tasks
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Cleanup successful:', data.message);
    } else {
      console.log('❌ Cleanup failed');
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }
  
  console.log('');
}

async function runAllTests() {
  console.log('Starting autonomous workflow tests...\n');
  
  // Test 1: Queue a task
  const taskId = await testWorkflowAPI();
  
  // Test 2: Get status
  await testGetWorkflowStatus(taskId);
  await testGetWorkflowStatus(); // Get all tasks
  
  // Test 3: Queue multiple tasks
  const queuedTasks = await testMultipleTasks();
  
  // Wait a bit for processing
  console.log('⏳ Waiting 3 seconds for task processing...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check status again
  await testGetWorkflowStatus();
  
  // Test 4: Cancel a task
  if (queuedTasks.length > 0) {
    await testCancelTask(queuedTasks[0]);
  }
  
  // Test 5: Cleanup
  await testCleanup();
  
  console.log('='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('1. Visit http://localhost:3000/autonomous-workflows to see the dashboard');
  console.log('2. Try the AI chat with commands like "analyze this document"');
  console.log('3. Upload a document to trigger automatic processing');
  console.log('4. Check the real-time workflow monitor for live updates');
}

// Run tests if this is the main module (Node.js environment)
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, testWorkflowAPI, testGetWorkflowStatus };
