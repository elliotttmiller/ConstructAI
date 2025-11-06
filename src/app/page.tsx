"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Bot,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Activity,
  Zap,
  MessageSquare,
  Upload,
  Hammer,
  Loader2,
} from "lucide-react";

interface Analytics {
  overview: {
    activeProjects: number;
    documentsProcessed: number;
    documentsToday: number;
    complianceScore: number;
    teamMembers: number;
    tasksCompleted: number;
    tasksPending: number;
  };
  recentActivity: Array<{
    id: string;
    description: string;
    timestamp: string;
    agent: string;
  }>;
  recentDocuments: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    uploadDate: Date;
  }>;
  agentStatus: Array<{
    name: string;
    status: string;
    tasks: number;
  }>;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        setAnalytics(data.analytics);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Please sign in to view dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your AI-powered construction management platform
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.activeProjects || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Agents Active</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.agentStatus.filter(a => a.status === 'active').length || 0}/8</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.documentsProcessed || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.overview.documentsToday || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.overview.complianceScore || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Task completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Status</TabsTrigger>
          <TabsTrigger value="projects">Recent Projects</TabsTrigger>
          <TabsTrigger value="tasks">Task Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Project Activity */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates from your construction projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity) => {
                    const colors = ['green-500', 'blue-500', 'orange-500', 'purple-500'];
                    const colorIndex = Math.abs(activity.id.charCodeAt(0) % colors.length);
                    return (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className={`w-2 h-2 bg-${colors[colorIndex]} rounded-full`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="secondary">{activity.agent}</Badge>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Frequently used features and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/documents')}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/bim')}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  View 3D Models
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/projects')}
                >
                  <Hammer className="mr-2 h-4 w-4" />
                  Create New Project
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Online</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Processing 3 conversations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Upload Bot</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Online</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Processing 2 files
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">PM Bot</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Online</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Managing 8 projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Design Converter</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Busy</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Converting CAD to 3D
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>
                Your current construction projects and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Downtown Office Complex</h3>
                    <p className="text-sm text-muted-foreground">Phase: Foundation & Structure</p>
                  </div>
                  <div className="text-right">
                    <Badge className="mb-2">85% Complete</Badge>
                    <p className="text-xs text-muted-foreground">Due: Jan 15, 2024</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Residential Tower Alpha</h3>
                    <p className="text-sm text-muted-foreground">Phase: Design Development</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="mb-2">45% Complete</Badge>
                    <p className="text-xs text-muted-foreground">Due: Mar 20, 2024</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Shopping Mall Renovation</h3>
                    <p className="text-sm text-muted-foreground">Phase: Planning</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">15% Complete</Badge>
                    <p className="text-xs text-muted-foreground">Due: Jun 30, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Task Queue</CardTitle>
              <CardDescription>
                Current tasks being processed by AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Processing architectural drawings</p>
                    <p className="text-xs text-muted-foreground">OCR extraction in progress...</p>
                  </div>
                  <Badge variant="secondary">Running</Badge>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">3D model clash detection</p>
                    <p className="text-xs text-muted-foreground">Queued for processing...</p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Building code compliance check</p>
                    <p className="text-xs text-muted-foreground">Completed successfully</p>
                  </div>
                  <Badge className="bg-green-500">Complete</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
