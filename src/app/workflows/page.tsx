import { Metadata } from 'next';
import WorkflowMonitor from '@/components/workflow/WorkflowMonitor';

export const metadata: Metadata = {
  title: 'AI Workflows | ConstructAI',
  description: 'Monitor and manage AI-powered workflows'
};

export default function WorkflowsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Workflow Orchestration</h1>
        <p className="text-muted-foreground mt-2">
          Monitor, manage, and trigger AI-powered workflows across your construction projects
        </p>
      </div>
      <WorkflowMonitor />
    </div>
  );
}
