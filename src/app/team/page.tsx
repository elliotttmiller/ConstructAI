'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDataFetch } from "@/lib/data-fetching-hooks";
import { PageSkeleton } from "@/components/ui/loading-skeletons";
import { CACHE_TTL } from "@/lib/cache-config";
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  UserCheck,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Star,
  Loader2
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'busy' | 'offline';
  joinDate: Date;
  location: string;
  projects: string[];
  avatar?: string;
  permissions: string[];
  lastActive: Date;
  tasksCompleted: number;
  rating: number;
}

// Team members will be fetched from API

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-500">Active</Badge>;
    case 'busy':
      return <Badge className="bg-yellow-500">Busy</Badge>;
    case 'offline':
      return <Badge variant="secondary">Offline</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

const getStatusIndicator = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'busy':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

const getRoleIcon = (role: string) => {
  if (role.includes('Manager')) return <Shield className="h-4 w-4" />;
  if (role.includes('Architect')) return <Building2 className="h-4 w-4" />;
  return <Users className="h-4 w-4" />;
};

export default function TeamPage() {
  const { data: session } = useSession();

  // Use optimized data fetching with caching
  const { data: teamData, loading, error } = useDataFetch<{ users: any[] }>(
    session?.user ? '/api/team' : null,
    {
      cacheTTL: CACHE_TTL.LONG, // Team data is relatively stable
      onError: (err) => console.error('Error fetching team members:', err),
    }
  );

  // Transform API data to component format
  const teamMembers: TeamMember[] = teamData?.users?.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    role: u.role,
    department: u.department,
    status: u.status || 'active',
    joinDate: new Date(u.created_at),
    location: u.location || '',
    projects: [],
    permissions: u.permissions || [],
    lastActive: new Date(u.updated_at || u.created_at),
    tasksCompleted: u.tasksCompleted || 0,
    rating: 4.5,
    avatar: u.avatar,
  })) || [];

  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const avgRating = teamMembers.length > 0 ? teamMembers.reduce((sum, m) => sum + m.rating, 0) / teamMembers.length : 0;
  const totalTasks = teamMembers.reduce((sum, m) => sum + m.tasksCompleted, 0);

  if (loading) {
    return <PageSkeleton />;
  }

  if (!session?.user) {
    return (
      <Alert>
        <AlertDescription>
          Please sign in to view team members.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading team members: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Directory</h1>
          <p className="text-muted-foreground">
            Manage team members, roles, and project assignments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              {activeMembers} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {((activeMembers / totalMembers) * 100).toFixed(0)}% availability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Team performance score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Management */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member: TeamMember) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusIndicator(member.status)}`}></div>
                      </div>
                      <div>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(member.status)}
                    <Badge variant="outline">{member.department}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Joined {member.joinDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-muted-foreground">Projects</span>
                      <span className="font-medium">{member.projects.length}</span>
                    </div>
                    <div className="space-y-1">
                      {member.projects.slice(0, 2).map((project: string, index: number) => (
                        <div key={index} className="text-xs text-muted-foreground truncate">
                          • {project}
                        </div>
                      ))}
                      {member.projects.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{member.projects.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2 border-t">
                    <div>
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="font-medium ml-1">{member.rating}/5.0</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tasks:</span>
                      <span className="font-medium ml-1">{member.tasksCompleted}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="mr-1 h-3 w-3" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Manage user roles and permission levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Project Manager', 'Senior Architect', 'Structural Engineer', 'Site Coordinator', 'General Contractor'].map((role) => (
                  <div key={role} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getRoleIcon(role)}
                      </div>
                      <div>
                        <h3 className="font-medium">{role}</h3>
                        <p className="text-sm text-muted-foreground">
                          {teamMembers.filter(m => m.role === role).length} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {teamMembers.find(m => m.role === role)?.permissions.length || 0} permissions
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {['Project Management', 'Design', 'Engineering', 'Operations', 'Construction'].map((dept) => (
              <Card key={dept}>
                <CardHeader>
                  <CardTitle className="text-base">{dept}</CardTitle>
                  <CardDescription>
                    {teamMembers.filter(m => m.department === dept).length} team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamMembers
                      .filter(m => m.department === dept)
                      .map((member) => (
                        <div key={member.id} className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${getStatusIndicator(member.status)}`}></div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Team Activity</CardTitle>
              <CardDescription>
                Latest actions and updates from team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last active {member.lastActive.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.tasksCompleted} tasks</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    {getStatusBadge(member.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
