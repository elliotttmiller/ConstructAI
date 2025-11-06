/**
 * Enterprise Dashboard
 * Comprehensive team management and project collaboration interface
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Building,
  TrendingUp,
  Calendar,
  FileText,
  Settings,
  Plus,
  MoreVertical,
  Crown,
  Shield,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  MapPin,
  DollarSign,
  Target
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'project_manager' | 'architect' | 'engineer' | 'contractor' | 'viewer';
  status: 'active' | 'away' | 'offline';
  avatar?: string;
  lastActive: Date;
  projectsCount: number;
  completedTasks: number;
  permissions: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  progress: number;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  teamMembers: string[];
  blueprintsCount: number;
  tasksCount: number;
  location: string;
  projectManager: string;
}

interface Activity {
  id: string;
  userId: string;
  type: 'blueprint_upload' | 'analysis_complete' | 'project_update' | 'team_join' | 'task_complete';
  description: string;
  timestamp: Date;
  projectId?: string;
  metadata?: Record<string, any>;
}

interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  totalTeamMembers: number;
  blueprintsAnalyzed: number;
  tasksCompleted: number;
  totalBudget: number;
  avgProjectProgress: number;
  recentActivity: Activity[];
}

export default function EnterpriseDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);

      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      const mockTeamMembers: TeamMember[] = [
        {
          id: '1',
          name: 'Alex Morgan',
          email: 'admin@constructai.demo',
          role: 'admin',
          status: 'active',
          lastActive: new Date(),
          projectsCount: 8,
          completedTasks: 45,
          permissions: ['all']
        },
        {
          id: '2',
          name: 'Jordan Chen',
          email: 'manager@constructai.demo',
          role: 'project_manager',
          status: 'active',
          lastActive: new Date(Date.now() - 30 * 60 * 1000),
          projectsCount: 4,
          completedTasks: 31,
          permissions: ['projects.all', 'team.read', 'reports.read']
        },
        {
          id: '3',
          name: 'Taylor Davis',
          email: 'architect@constructai.demo',
          role: 'architect',
          status: 'away',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          projectsCount: 3,
          completedTasks: 28,
          permissions: ['projects.read', 'blueprints.all', 'analysis.read']
        },
        {
          id: '4',
          name: 'Sam Rivera',
          email: 'engineer@constructai.demo',
          role: 'engineer',
          status: 'offline',
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
          projectsCount: 2,
          completedTasks: 15,
          permissions: ['projects.read', 'blueprints.read', 'analysis.all']
        }
      ];

      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'Downtown Office Complex',
          description: '25-story mixed-use development',
          status: 'active',
          progress: 68,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-12-31'),
          budget: 15000000,
          spent: 8200000,
          teamMembers: ['1', '2', '3'],
          blueprintsCount: 45,
          tasksCount: 128,
          location: 'New York, NY',
          projectManager: '3'
        },
        {
          id: '2',
          name: 'Residential Tower A',
          description: '40-floor luxury residential building',
          status: 'active',
          progress: 34,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2025-02-28'),
          budget: 22000000,
          spent: 5100000,
          teamMembers: ['1', '2', '4'],
          blueprintsCount: 67,
          tasksCount: 89,
          location: 'San Francisco, CA',
          projectManager: '1'
        },
        {
          id: '3',
          name: 'Industrial Warehouse',
          description: 'Manufacturing and distribution facility',
          status: 'planning',
          progress: 12,
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-11-30'),
          budget: 8500000,
          spent: 650000,
          teamMembers: ['3', '4'],
          blueprintsCount: 23,
          tasksCount: 45,
          location: 'Chicago, IL',
          projectManager: '3'
        }
      ];

      const mockMetrics: DashboardMetrics = {
        totalProjects: 12,
        activeProjects: 8,
        totalTeamMembers: 24,
        blueprintsAnalyzed: 346,
        tasksCompleted: 1247,
        totalBudget: 45500000,
        avgProjectProgress: 58,
        recentActivity: [
          {
            id: '1',
            userId: '2',
            type: 'blueprint_upload',
            description: 'Uploaded floor plan revision for Level 15',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            projectId: '1'
          },
          {
            id: '2',
            userId: '3',
            type: 'project_update',
            description: 'Updated project timeline and milestones',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            projectId: '2'
          },
          {
            id: '3',
            userId: '4',
            type: 'analysis_complete',
            description: 'Completed structural analysis for basement levels',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            projectId: '1'
          }
        ]
      };

      setTeamMembers(mockTeamMembers);
      setProjects(mockProjects);
      setMetrics(mockMetrics);
      setIsLoading(false);
    };

    initializeDashboard();
  }, []);

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'project_manager': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'architect': return <Building className="h-4 w-4 text-purple-500" />;
      case 'engineer': return <Settings className="h-4 w-4 text-green-500" />;
      case 'contractor': return <UserCheck className="h-4 w-4 text-orange-500" />;
      case 'viewer': return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      case 'planning': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-sm text-muted-foreground">Loading enterprise dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Dashboard</h1>
          <p className="text-muted-foreground">Manage teams, projects, and collaboration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                    <p className="text-3xl font-bold">{metrics?.totalProjects}</p>
                  </div>
                  <Building className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">+12%</span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                    <p className="text-3xl font-bold">{metrics?.totalTeamMembers}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">+3</span>
                  <span className="text-muted-foreground ml-1">new this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Blueprints Analyzed</p>
                    <p className="text-3xl font-bold">{metrics?.blueprintsAnalyzed}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-500" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">+28%</span>
                  <span className="text-muted-foreground ml-1">this quarter</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                    <p className="text-3xl font-bold">{formatCurrency(metrics?.totalBudget || 0)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-500" />
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Target className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-blue-500">68%</span>
                  <span className="text-muted-foreground ml-1">utilized</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Active Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.recentActivity.map((activity) => {
                    const member = teamMembers.find(m => m.id === activity.userId);
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {member?.name.split(' ').map(n => n[0]).join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{member?.name}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Active Projects Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Active Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.filter(p => p.status === 'active').slice(0, 3).map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{project.name}</div>
                        <Badge variant="outline">{project.progress}%</Badge>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project.teamMembers.length} members
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Projects</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                    <span className="text-sm capitalize">{project.status.replace('_', ' ')}</span>
                    <Badge variant="outline" className="ml-auto">
                      {project.progress}%
                    </Badge>
                  </div>

                  <Progress value={project.progress} className="h-2" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span>{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span>{formatCurrency(project.spent)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Team</span>
                      <span>{project.teamMembers.length} members</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{project.blueprintsCount} blueprints</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{project.tasksCount} tasks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Team Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                      </div>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      <span className="text-sm capitalize">{member.role.replace('_', ' ')}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Projects</p>
                        <p className="text-lg font-semibold">{member.projectsCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tasks</p>
                        <p className="text-lg font-semibold">{member.completedTasks}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Last active</p>
                      <p className="text-sm">{formatRelativeTime(member.lastActive)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-2xl font-bold">Analytics & Reports</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Project Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Average Progress</span>
                    <span className="font-semibold">{metrics?.avgProjectProgress}%</span>
                  </div>
                  <Progress value={metrics?.avgProjectProgress} className="h-3" />

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{metrics?.activeProjects}</p>
                      <p className="text-sm text-muted-foreground">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{(metrics?.totalProjects || 0) - (metrics?.activeProjects || 0)}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Team Productivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Tasks Completed</span>
                    <span className="font-semibold">{metrics?.tasksCompleted}</span>
                  </div>

                  <div className="space-y-2">
                    {teamMembers.slice(0, 3).map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <span className="text-sm">{member.name}</span>
                        <span className="text-sm font-medium">{member.completedTasks}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              Advanced analytics and custom reports will be available in the full enterprise version.
              Contact our sales team for detailed reporting capabilities.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
