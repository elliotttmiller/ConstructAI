'use client';

import React, { useState } from 'react';
import EnterpriseDashboard from '@/components/enterprise/EnterpriseDashboard';
import BatchBlueprintProcessor from '@/components/bim/BatchBlueprintProcessor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building,
  Users,
  FileText,
  Shield,
  Zap,
  Crown,
  CheckCircle,
  Star,
  ArrowRight,
  Globe,
  Database,
  Cog
} from 'lucide-react';

export default function EnterprisePage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const enterpriseFeatures = [
    {
      id: 'visual-overlays',
      title: 'Visual Blueprint Overlays',
      description: 'Interactive overlays showing detected elements directly on original blueprints',
      icon: Building,
      color: 'bg-blue-500',
      status: 'live',
      features: [
        'Real-time element detection visualization',
        'Interactive element selection and editing',
        'Multiple color schemes and opacity controls',
        'Export annotated blueprints'
      ]
    },
    {
      id: 'batch-processing',
      title: 'Batch Blueprint Processing',
      description: 'Simultaneous analysis of multiple blueprint files with progress tracking',
      icon: FileText,
      color: 'bg-green-500',
      status: 'live',
      features: [
        'Concurrent processing of up to 10 files',
        'Real-time progress tracking',
        'Batch export and reporting',
        'Error handling and retry mechanisms'
      ]
    },
    {
      id: 'team-management',
      title: 'Enterprise Team Management',
      description: 'Comprehensive team collaboration and project management dashboard',
      icon: Users,
      color: 'bg-purple-500',
      status: 'live',
      features: [
        'Role-based access control',
        'Project collaboration tools',
        'Team performance analytics',
        'Real-time activity tracking'
      ]
    },
    {
      id: 'cad-integration',
      title: 'CAD Software Integration',
      description: 'Direct import from AutoCAD, Revit, and other professional CAD software',
      icon: Cog,
      color: 'bg-orange-500',
      status: 'beta',
      features: [
        'AutoCAD DWG/DXF import via Forge API',
        'Revit BIM data extraction',
        'IFC file processing',
        'Multi-format export capabilities'
      ]
    },
    {
      id: 'building-codes',
      title: 'Building Code Compliance',
      description: 'Real-time regulatory database integration and compliance checking',
      icon: Shield,
      color: 'bg-red-500',
      status: 'beta',
      features: [
        'IBC, IFC, and ADA standards checking',
        'Local jurisdiction code integration',
        'Automated violation detection',
        'Compliance cost estimation'
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Live</Badge>;
      case 'beta':
        return <Badge variant="outline"><Star className="h-3 w-3 mr-1" />Beta</Badge>;
      default:
        return <Badge variant="secondary">Coming Soon</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Enterprise Features</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced capabilities for professional construction teams and enterprise deployments
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge variant="outline" className="text-sm">
            <Globe className="h-4 w-4 mr-1" />
            Production Ready
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Database className="h-4 w-4 mr-1" />
            Real AI Integration
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Zap className="h-4 w-4 mr-1" />
            Enterprise Scale
          </Badge>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enterpriseFeatures.map((feature) => (
          <Card key={feature.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${feature.color} bg-opacity-10`}>
                    <feature.icon className={`h-6 w-6 ${feature.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </div>
                {getStatusBadge(feature.status)}
              </div>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feature.features.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              {feature.status === 'live' && (
                <Button
                  className="w-full mt-4"
                  onClick={() => setActiveDemo(feature.id)}
                >
                  Try Demo <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Demos */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Team Dashboard</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              <strong>Enterprise Team Management Dashboard</strong> - Real-time collaboration,
              project tracking, and team analytics for construction professionals.
            </AlertDescription>
          </Alert>
          <EnterpriseDashboard />
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong>Batch Blueprint Processor</strong> - Analyze multiple blueprints
              simultaneously with concurrent processing and real-time progress tracking.
            </AlertDescription>
          </Alert>
          <BatchBlueprintProcessor />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Alert>
            <Cog className="h-4 w-4" />
            <AlertDescription>
              <strong>Professional Integrations</strong> - Connect with industry-standard
              CAD software and regulatory databases for seamless workflows.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  CAD Software Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">AutoCAD Integration</span>
                    <Badge variant="outline">Via Forge API</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Direct import of DWG/DXF files with layer structure preservation and metadata extraction.
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Revit Integration</span>
                    <Badge variant="outline">BIM Data</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Extract BIM data from Revit files including families, parameters, and schedules.
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">IFC Support</span>
                    <Badge variant="outline">Industry Standard</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Industry Foundation Classes support for interoperability between BIM software.
                  </div>
                </div>

                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    CAD integration requires Autodesk Forge API credentials.
                    Contact our enterprise team for setup assistance.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Building Code Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">International Building Code</span>
                    <Badge className="bg-green-500">2021 Edition</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Comprehensive IBC compliance checking with automated violation detection.
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">ADA Standards</span>
                    <Badge className="bg-blue-500">2010 Standards</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Accessibility compliance verification with detailed remediation guidance.
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Local Jurisdictions</span>
                    <Badge variant="outline">Expanding</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Integration with local building departments and regulatory databases.
                  </div>
                </div>

                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    Building code compliance includes cost estimation and timeline
                    planning for remediation work.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enterprise Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Enterprise Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">10x</div>
              <div className="text-sm text-muted-foreground">Faster Blueprint Analysis</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">95%</div>
              <div className="text-sm text-muted-foreground">Compliance Accuracy</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-600">50%</div>
              <div className="text-sm text-muted-foreground">Time Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold">Ready for Enterprise Deployment?</h3>
          <p className="text-lg opacity-90">
            Contact our team to discuss enterprise licensing, custom integrations, and deployment options.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="secondary" size="lg">
              Schedule Demo
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Contact Sales
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
