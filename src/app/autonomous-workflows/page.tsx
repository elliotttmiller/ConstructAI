import { Metadata } from 'next';
import { AutonomousWorkflowMonitor } from '@/components/autonomous/AutonomousWorkflowMonitor';

export const metadata: Metadata = {
  title: 'Autonomous Workflows | ConstructAI',
  description: 'Monitor and control autonomous AI workflow executions'
};

export default function AutonomousWorkflowsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Autonomous Workflows</h1>
          <p className="text-muted-foreground mt-2">
            Real-time monitoring and control of AI-powered autonomous task executions
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          🤖 About Autonomous Workflows
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          ConstructAI's autonomous AI agents don't just provide recommendations—they actually execute tasks. 
          Agents can autonomously upload and process documents, run BIM analysis, execute database queries, 
          create and assign tasks, and interact with other services. This dashboard provides real-time monitoring 
          of all autonomous executions happening across the platform.
        </p>
      </div>

      <AutonomousWorkflowMonitor />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Available Autonomous Actions</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">📄</span>
              <span><strong>Document Processing:</strong> Auto-upload, OCR extraction, AI analysis, classification</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🏗️</span>
              <span><strong>BIM Analysis:</strong> Model analysis, clash detection, structural validation, report generation</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">💾</span>
              <span><strong>Database Operations:</strong> Complex queries, aggregations, batch updates, data insights</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span><strong>Task Automation:</strong> Task creation, auto-assignment, status updates, checklist generation</span>
            </li>
          </ul>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">How to Trigger Autonomous Actions</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">💬</span>
              <span><strong>Via Chat:</strong> Use natural language commands like "analyze this document" or "create a task for..."</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔌</span>
              <span><strong>Via API:</strong> POST to /api/autonomous-workflow with task type and parameters</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">⚡</span>
              <span><strong>Auto-triggered:</strong> Many workflows trigger automatically (e.g., document upload triggers analysis)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔄</span>
              <span><strong>Scheduled:</strong> Set up recurring autonomous tasks to run on schedules</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
