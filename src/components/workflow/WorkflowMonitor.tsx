'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  FileText,
  Building,
  Calculator,
  Shield,
  Users,
  RefreshCw,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import socketService from '@/lib/socket';

interface WorkflowEvent {
  workflowType: string;
  entityId: string;
  agentType: string;
  status: 'started' | 'completed' | 'error';
  timestamp: Date;
  result?: any;
  error?: string;
}

interface WorkflowDefinition {
  type: string;
  name: string;
  description: string;
  agentType: string;
  status: string;
}

const AGENT_ICONS: Record<string, any> = {
  'document-processor': FileText,
  'bim-analyzer': Building,
  'pm-bot': Calculator,
  'compliance-checker': Shield,
  'team-coordinator': Users,
  'suna': Zap
};

export default function WorkflowMonitor() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [recentEvents, setRecentEvents] = useState<WorkflowEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
    setupEventListeners();

    return () => {
      cleanupEventListeners();
    };
  }, []);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai-workflow');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupEventListeners = () => {
    socketService.on('workflow_started', handleWorkflowStarted);
    socketService.on('workflow_completed', handleWorkflowCompleted);
    socketService.on('workflow_error', handleWorkflowError);
  };

  const cleanupEventListeners = () => {
    socketService.off('workflow_started', handleWorkflowStarted);
    socketService.off('workflow_completed', handleWorkflowCompleted);
    socketService.off('workflow_error', handleWorkflowError);
  };

  const handleWorkflowStarted = (data: any) => {
    const event: WorkflowEvent = {
      ...data,
      status: 'started',
      timestamp: new Date(data.timestamp)
    };
    setRecentEvents(prev => [event, ...prev].slice(0, 10));
  };

  const handleWorkflowCompleted = (data: any) => {
    const event: WorkflowEvent = {
      ...data,
      status: 'completed',
      timestamp: new Date(data.timestamp)
    };
    setRecentEvents(prev => [event, ...prev].slice(0, 10));
  };

  const handleWorkflowError = (data: any) => {
    const event: WorkflowEvent = {
      ...data,
      status: 'error',
      timestamp: new Date(data.timestamp)
    };
    setRecentEvents(prev => [event, ...prev].slice(0, 10));
  };

  const triggerWorkflow = async (workflowType: string) => {
    try {
      // This would need additional context in a real implementation
      console.log(`Triggering workflow: ${workflowType}`);
      // In a real app, would show a dialog to collect entity_id and other context
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'started':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'started':
        return <Badge className="bg-blue-500">Running</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'available':
        return <Badge variant="outline">Available</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getAgentIcon = (agentType: string) => {
    const IconComponent = AGENT_ICONS[agentType] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                AI Workflow Monitor
              </CardTitle>
              <CardDescription>
                Monitor and manage AI-powered workflows across the platform
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadWorkflows}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => {
              const IconComponent = AGENT_ICONS[workflow.agentType] || Activity;
              return (
                <Card
                  key={workflow.type}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedWorkflow === workflow.type ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedWorkflow(workflow.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm">{workflow.name}</h3>
                          {getStatusBadge(workflow.status)}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {workflow.description}
                        </p>
                        <div className="mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerWorkflow(workflow.type);
                            }}
                          >
                            <PlayCircle className="h-3 w-3 mr-2" />
                            Trigger Workflow
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Workflow Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Workflow Activity
          </CardTitle>
          <CardDescription>
            Live updates of workflow executions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No recent workflow activity</p>
              <p className="text-sm">Workflow events will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event, index) => (
                <div
                  key={`${event.workflowType}-${event.entityId}-${index}`}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getAgentIcon(event.agentType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(event.status)}
                      <h4 className="font-medium text-sm">
                        {event.workflowType.split('_').map(w => 
                          w.charAt(0).toUpperCase() + w.slice(1)
                        ).join(' ')}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.status === 'error' && event.error 
                        ? `Error: ${event.error}`
                        : event.status === 'completed'
                        ? 'Workflow completed successfully'
                        : 'Workflow is running...'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.timestamp.toLocaleTimeString()} • Entity: {event.entityId.substring(0, 8)}...
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(event.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Workflow Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Total Workflows</span>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{workflows.length}</div>
              <p className="text-xs text-muted-foreground">Available workflows</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Active Now</span>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">
                {recentEvents.filter(e => e.status === 'started').length}
              </div>
              <p className="text-xs text-muted-foreground">Running workflows</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Success Rate</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold">
                {recentEvents.length > 0
                  ? Math.round((recentEvents.filter(e => e.status === 'completed').length / recentEvents.length) * 100)
                  : 100}%
              </div>
              <p className="text-xs text-muted-foreground">Workflow completion</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
