"use client";

import React from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  Calendar,
  Building2,
  Lightbulb,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface DocumentAnalysis {
  document_type?: string;
  project_name?: string;
  classification?: {
    primary_type?: string;
    confidence?: number;
  };
  entities?: {
    organizations?: Array<{ name: string; type?: string }>;
    people?: Array<{ name: string; role?: string }>;
    dates?: Array<{ date: string; context?: string }>;
    costs?: Array<{ amount: string; description?: string }>;
    locations?: Array<{ name: string }>;
  };
  risks?: Array<{
    category?: string;
    description?: string;
    severity?: string;
    mitigation?: string;
  }>;
  requirements?: Array<{
    description?: string;
    category?: string;
    priority?: string;
  }>;
  recommendations?: Array<{
    title?: string;
    description?: string;
    priority?: string;
    impact?: string;
  }>;
  quality_score?: number;
  execution_time?: number;
  ai_decisions?: number;
}

interface AnalysisResultSummary {
  execution_time: number;
  quality_score: number;
  ai_decisions: number;
  recommendations: number;
  requirements: number;
  document_type: string;
  clauses_found?: number;
  divisions_detected?: number;
  entities_extracted?: number;
}

interface PostAnalysisDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  documentAnalysis: DocumentAnalysis | null;
  resultSummary: AnalysisResultSummary;
  insights?: Array<{
    type: string;
    value: number | string;
    message: string;
    timestamp: number;
  }>;
}

export function PostAnalysisDashboard({
  isOpen,
  onClose,
  documentAnalysis,
  resultSummary,
  insights = []
}: PostAnalysisDashboardProps) {
  if (!isOpen || !documentAnalysis) return null;

  const qualityColor = resultSummary.quality_score >= 90 ? 'text-green-500' : 
                       resultSummary.quality_score >= 70 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Analysis Complete</h2>
              <p className="text-blue-100">
                {resultSummary.document_type} • {resultSummary.execution_time.toFixed(1)}s execution time
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Quality Score</p>
                    <p className={`text-3xl font-bold ${qualityColor}`}>
                      {resultSummary.quality_score}%
                    </p>
                  </div>
                  <TrendingUp className={`w-8 h-8 ${qualityColor}`} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">AI Decisions</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {resultSummary.ai_decisions}
                    </p>
                  </div>
                  <Lightbulb className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Recommendations</p>
                    <p className="text-3xl font-bold text-purple-400">
                      {resultSummary.recommendations}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Requirements</p>
                    <p className="text-3xl font-bold text-green-400">
                      {resultSummary.requirements}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Classification */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Document Classification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400">Primary Type</p>
                    <Badge className="mt-1 bg-blue-600 text-white">
                      {documentAnalysis.classification?.primary_type || documentAnalysis.document_type || 'Unknown'}
                    </Badge>
                  </div>
                  {documentAnalysis.classification?.confidence && (
                    <div>
                      <p className="text-sm text-slate-400">Confidence</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{ width: `${documentAnalysis.classification.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm text-white font-medium">
                          {documentAnalysis.classification.confidence.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                  {resultSummary.divisions_detected !== undefined && (
                    <div>
                      <p className="text-sm text-slate-400">Divisions Detected</p>
                      <p className="text-lg font-semibold text-white">{resultSummary.divisions_detected}</p>
                    </div>
                  )}
                  {resultSummary.clauses_found !== undefined && (
                    <div>
                      <p className="text-sm text-slate-400">Clauses Found</p>
                      <p className="text-lg font-semibold text-white">{resultSummary.clauses_found}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Extracted Entities */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Extracted Entities
                </CardTitle>
                {resultSummary.entities_extracted !== undefined && (
                  <CardDescription>
                    {resultSummary.entities_extracted} total entities identified
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documentAnalysis.entities?.organizations && documentAnalysis.entities.organizations.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <p className="text-sm font-medium text-slate-300">Organizations ({documentAnalysis.entities.organizations.length})</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {documentAnalysis.entities.organizations.slice(0, 5).map((org, idx) => (
                          <Badge key={idx} variant="outline" className="border-blue-500/30 text-blue-300">
                            {org.name}
                          </Badge>
                        ))}
                        {documentAnalysis.entities.organizations.length > 5 && (
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            +{documentAnalysis.entities.organizations.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {documentAnalysis.entities?.people && documentAnalysis.entities.people.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <p className="text-sm font-medium text-slate-300">People ({documentAnalysis.entities.people.length})</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {documentAnalysis.entities.people.slice(0, 5).map((person, idx) => (
                          <Badge key={idx} variant="outline" className="border-purple-500/30 text-purple-300">
                            {person.name}
                          </Badge>
                        ))}
                        {documentAnalysis.entities.people.length > 5 && (
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            +{documentAnalysis.entities.people.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {documentAnalysis.entities?.costs && documentAnalysis.entities.costs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <p className="text-sm font-medium text-slate-300">Costs ({documentAnalysis.entities.costs.length})</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {documentAnalysis.entities.costs.slice(0, 3).map((cost, idx) => (
                          <Badge key={idx} variant="outline" className="border-green-500/30 text-green-300">
                            {cost.amount}
                          </Badge>
                        ))}
                        {documentAnalysis.entities.costs.length > 3 && (
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            +{documentAnalysis.entities.costs.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {documentAnalysis.entities?.dates && documentAnalysis.entities.dates.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-yellow-400" />
                        <p className="text-sm font-medium text-slate-300">Dates ({documentAnalysis.entities.dates.length})</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {documentAnalysis.entities.dates.slice(0, 3).map((date, idx) => (
                          <Badge key={idx} variant="outline" className="border-yellow-500/30 text-yellow-300">
                            {date.date}
                          </Badge>
                        ))}
                        {documentAnalysis.entities.dates.length > 3 && (
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            +{documentAnalysis.entities.dates.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Risks Identified */}
            {documentAnalysis.risks && documentAnalysis.risks.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    Risks Identified
                  </CardTitle>
                  <CardDescription>
                    {documentAnalysis.risks.length} potential risks detected
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {documentAnalysis.risks.slice(0, 5).map((risk, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/50 rounded-lg border border-orange-500/20">
                        <div className="flex items-start gap-2">
                          <Badge 
                            variant="outline" 
                            className={`
                              ${risk.severity === 'high' ? 'border-red-500/50 text-red-400' : 
                                risk.severity === 'medium' ? 'border-orange-500/50 text-orange-400' : 
                                'border-yellow-500/50 text-yellow-400'}
                            `}
                          >
                            {risk.severity || 'Unknown'}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{risk.category || 'Risk'}</p>
                            <p className="text-xs text-slate-400 mt-1">{risk.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {documentAnalysis.risks.length > 5 && (
                      <p className="text-xs text-slate-400 text-center">
                        +{documentAnalysis.risks.length - 5} more risks
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Recommendations */}
            {documentAnalysis.recommendations && documentAnalysis.recommendations.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-400" />
                    Top Recommendations
                  </CardTitle>
                  <CardDescription>
                    {documentAnalysis.recommendations.length} AI-generated recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {documentAnalysis.recommendations.slice(0, 5).map((rec, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/50 rounded-lg border border-blue-500/20">
                        <div className="flex items-start gap-2">
                          <Badge 
                            variant="outline" 
                            className={`
                              ${rec.priority === 'high' ? 'border-purple-500/50 text-purple-400' : 
                                rec.priority === 'medium' ? 'border-blue-500/50 text-blue-400' : 
                                'border-slate-500/50 text-slate-400'}
                            `}
                          >
                            {rec.priority || 'Normal'}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{rec.title || 'Recommendation'}</p>
                            <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {documentAnalysis.recommendations.length > 5 && (
                      <p className="text-xs text-slate-400 text-center">
                        +{documentAnalysis.recommendations.length - 5} more recommendations
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analysis Insights Timeline */}
          {insights.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Analysis Insights Timeline
                </CardTitle>
                <CardDescription>
                  Key discoveries during the analysis process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {insights.slice(0, 8).map((insight, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="text-slate-400">{insight.message}</span>
                      {typeof insight.value === 'number' && (
                        <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                          {insight.value}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-700 bg-slate-900/50 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            <Clock className="w-4 h-4 inline mr-2" />
            Completed in {resultSummary.execution_time.toFixed(2)}s
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: Implement export functionality
                console.log('Export analysis:', documentAnalysis);
              }}
              className="border-slate-600 hover:bg-slate-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button
              onClick={() => {
                // TODO: Navigate to detailed view
                console.log('View details:', documentAnalysis);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Full Analysis
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="hover:bg-slate-800"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
