import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  MessageSquare,
  Upload,
  Users,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Building2,
  Settings,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  Workflow
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'busy' | 'offline' | 'error';
  description: string;
  icon: React.ReactNode;
  tasksCompleted: number;
  tasksActive: number;
  uptime: string;
  lastActivity: string;
  performance: number;
}

const agents: Agent[] = [
  {
    id: 'suna-ai',
    name: 'AI Assistant',
    type: 'Master Orchestrator',
    status: 'online',
    description: 'Central conversational interface and agent coordinator',
    icon: <MessageSquare className="h-5 w-5" />,
    tasksCompleted: 142,
    tasksActive: 3,
    uptime: '99.8%',
    lastActivity: '2 minutes ago',
    performance: 98
  },
  {
    id: 'upload-bot',
    name: 'Data Upload Bot',
    type: 'Document Processor',
    status: 'busy',
    description: 'Smart processing and OCR for construction documents',
    icon: <Upload className="h-5 w-5" />,
    tasksCompleted: 89,
    tasksActive: 2,
    uptime: '97.5%',
    lastActivity: '30 seconds ago',
    performance: 94
  },
  {
    id: 'pm-bot',
    name: 'PM Bot',
    type: 'Project Manager',
    status: 'online',
    description: 'Task management and team coordination',
    icon: <Users className="h-5 w-5" />,
    tasksCompleted: 76,
    tasksActive: 5,
    uptime: '99.2%',
    lastActivity: '1 minute ago',
    performance: 96
  },
  {
    id: 'design-converter',
    name: 'Design Converter',
    type: '2D-to-3D Specialist',
    status: 'busy',
    description: 'CAD drawings to 3D model conversion and clash detection',
    icon: <Zap className="h-5 w-5" />,
    tasksCompleted: 34,
    tasksActive: 1,
    uptime: '95.8%',
    lastActivity: '5 minutes ago',
    performance: 91
  },
  {
    id: 'compliance-checker',
    name: 'Compliance Checker',
    type: 'Building Codes',
    status: 'online',
    description: 'Building codes compliance and regulatory checking',
    icon: <CheckCircle2 className="h-5 w-5" />,
    tasksCompleted: 56,
    tasksActive: 0,
    uptime: '98.9%',
    lastActivity: '3 minutes ago',
    performance: 99
  },
  {
    id: 'bim-analyzer',
    name: 'BIM Analyzer',
    type: '3D Model Expert',
    status: 'online',
    description: 'BIM data analysis and 3D visualization processing',
    icon: <Building2 className="h-5 w-5" />,
    tasksCompleted: 28,
    tasksActive: 1,
    uptime: '96.4%',
    lastActivity: '4 minutes ago',
    performance: 93
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'busy':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-gray-500';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'online':
      return <Badge className="bg-green-500">Online</Badge>;
    case 'busy':
      return <Badge className="bg-yellow-500">Busy</Badge>;
    case 'offline':
      return <Badge variant="secondary">Offline</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agents Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your construction AI agents
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/workflows">
            <Button variant="outline">
              <Workflow className="mr-2 h-4 w-4" />
              View Workflows
            </Button>
          </Link>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Agent Settings
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6/6</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks in Queue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Average wait: 2.3 min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">425</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.8%</div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {agent.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{agent.name}</CardTitle>
                        <CardDescription>{agent.type}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {getStatusBadge(agent.status)}
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {agent.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Completed</p>
                      <p className="text-muted-foreground">{agent.tasksCompleted}</p>
                    </div>
                    <div>
                      <p className="font-medium">Active</p>
                      <p className="text-muted-foreground">{agent.tasksActive}</p>
                    </div>
                    <div>
                      <p className="font-medium">Uptime</p>
                      <p className="text-muted-foreground">{agent.uptime}</p>
                    </div>
                    <div>
                      <p className="font-medium">Last Active</p>
                      <p className="text-muted-foreground">{agent.lastActivity}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance</span>
                      <span>{agent.performance}%</span>
                    </div>
                    <Progress value={agent.performance} className="h-2" />
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Play className="mr-1 h-3 w-3" />
                      Control
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="mr-1 h-3 w-3" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Metrics</CardTitle>
              <CardDescription>
                Detailed performance analysis for all AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {agent.icon}
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{agent.performance}%</p>
                        <p className="text-xs text-muted-foreground">Performance</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{agent.tasksCompleted}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{agent.uptime}</p>
                        <p className="text-xs text-muted-foreground">Uptime</p>
                      </div>
                      <Progress value={agent.performance} className="w-20 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions and events from all AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Upload className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data Upload Bot processed 3 CAD files</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago • OCR extraction completed</p>
                  </div>
                  <Badge variant="secondary">Processing</Badge>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Compliance Checker validated building codes</p>
                    <p className="text-xs text-muted-foreground">5 minutes ago • Project Alpha compliance: 98.5%</p>
                  </div>
                  <Badge className="bg-green-500">Complete</Badge>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Design Converter started 2D-to-3D conversion</p>
                    <p className="text-xs text-muted-foreground">8 minutes ago • Processing architectural drawings</p>
                  </div>
                  <Badge className="bg-yellow-500">Running</Badge>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Users className="h-4 w-4 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">PM Bot assigned tasks to team members</p>
                    <p className="text-xs text-muted-foreground">12 minutes ago • 8 tasks distributed across 4 team members</p>
                  </div>
                  <Badge variant="secondary">Complete</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
