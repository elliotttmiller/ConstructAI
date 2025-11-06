'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AutonomousTask {
  id: string;
  type: string;
  priority: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  payload: any;
  context: any;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: any;
}

export function AutonomousWorkflowMonitor() {
  const [tasks, setTasks] = useState<AutonomousTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/autonomous-workflow');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
        setStats(data.byStatus || stats);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/autonomous-workflow?taskId=${taskId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to cancel task:', error);
    }
  };

  const cleanupTasks = async () => {
    try {
      const response = await fetch('/api/autonomous-workflow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup', olderThanHours: 24 })
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to cleanup tasks:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <Pause className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      running: 'default',
      completed: 'success',
      failed: 'destructive',
      cancelled: 'outline'
    };
    return variants[status] || 'default';
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Autonomous Workflow Monitor</CardTitle>
          <CardDescription>Loading workflow status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Autonomous Tasks</CardTitle>
              <CardDescription>Real-time view of all autonomous workflow executions</CardDescription>
            </div>
            <Button onClick={cleanupTasks} variant="outline" size="sm">
              Cleanup Old Tasks
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No autonomous tasks found. Tasks will appear here when agents execute actions.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 20).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div>{getStatusIcon(task.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{task.type}</h4>
                        <Badge variant={getStatusBadge(task.status) as any}>{task.status}</Badge>
                        <div className={`w-2 h-2 rounded-full ${getPriorityBadge(task.priority)}`} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Task ID: {task.id}
                      </p>
                      {task.error && (
                        <p className="text-xs text-red-500 mt-1">Error: {task.error}</p>
                      )}
                      {task.result && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Result available
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-muted-foreground text-right">
                      <div>Created: {new Date(task.createdAt).toLocaleTimeString()}</div>
                      {task.completedAt && (
                        <div>Completed: {new Date(task.completedAt).toLocaleTimeString()}</div>
                      )}
                    </div>
                    {(task.status === 'pending' || task.status === 'running') && (
                      <Button
                        onClick={() => cancelTask(task.id)}
                        variant="ghost"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
