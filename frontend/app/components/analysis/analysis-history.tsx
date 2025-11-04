"use client";

import React, { useEffect, useState } from 'react';
import { Clock, TrendingUp, FileText, Eye, X, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface AnalysisResult {
  analysis_id: string;
  execution_time: number;
  quality_score: number;
  ai_decisions: number;
  recommendations: number;
  requirements: number;
  recommendations_list?: unknown[];
  requirements_list?: unknown[];
  document_type: string;
  clauses_found?: number;
  divisions_detected?: number;
  entities_extracted?: number;
  classification?: unknown;
  risks?: unknown[];
  entities?: unknown[];
}

interface AnalysisStatistics {
  total_analyses: number;
  last_analysis: string;
  average_quality_score: number;
  total_recommendations: number;
  total_requirements: number;
}

interface AnalysisHistoryEntry {
  analysis_id: string;
  document_id: string;
  document_name: string;
  timestamp: string;
  execution_time: number;
  quality_score: number;
  ai_decisions: number;
  recommendations_count: number;
  requirements_count: number;
  document_type: string;
  clauses_found?: number;
  divisions_detected?: number;
  entities_extracted?: number;
  full_result?: AnalysisResult;
}

interface AnalysisHistoryProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectAnalysis: (analysis: AnalysisHistoryEntry) => void;
}

export function AnalysisHistory({ projectId, isOpen, onClose, onSelectAnalysis }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [statistics, setStatistics] = useState<AnalysisStatistics>({
    total_analyses: 0,
    last_analysis: '',
    average_quality_score: 0,
    total_recommendations: 0,
    total_requirements: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && projectId) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, projectId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}/analysis-history`);
      const data = await response.json();
      setHistory(data.history || []);
      setStatistics(data.statistics || {});
    } catch (error) {
      console.error('Failed to load analysis history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-500 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-500 bg-red-50 border-red-200';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Analysis History</h2>
              <p className="text-blue-100">
                {history.length} analysis run{history.length !== 1 ? 's' : ''} completed
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Bar */}
        {statistics.total_analyses > 0 && (
          <div className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{statistics.total_analyses}</p>
                <p className="text-xs text-slate-600">Total Analyses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{statistics.average_quality_score}%</p>
                <p className="text-xs text-slate-600">Avg Quality</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{statistics.total_recommendations}</p>
                <p className="text-xs text-slate-600">Recommendations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{statistics.total_requirements}</p>
                <p className="text-xs text-slate-600">Requirements</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No analysis runs yet</p>
              <p className="text-sm text-slate-400 mt-2">Run your first analysis to see results here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.slice().reverse().map((entry) => (
                <Card key={entry.analysis_id} className="hover:shadow-lg transition-shadow border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          {entry.document_name}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(entry.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {entry.execution_time.toFixed(1)}s
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectAnalysis(entry)}
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className={`p-3 rounded-lg border ${getQualityColor(entry.quality_score)}`}>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          <div>
                            <p className="text-xs opacity-75">Quality</p>
                            <p className="text-lg font-bold">{entry.quality_score}%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-xs text-blue-600">AI Decisions</p>
                            <p className="text-lg font-bold text-blue-900">{entry.ai_decisions}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="text-xs text-purple-600">Recommendations</p>
                            <p className="text-lg font-bold text-purple-900">{entry.recommendations_count}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-xs text-green-600">Requirements</p>
                            <p className="text-lg font-bold text-green-900">{entry.requirements_count}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Badge variant="outline" className="border-slate-300 text-slate-700">
                        {entry.document_type}
                      </Badge>
                      {entry.clauses_found !== undefined && (
                        <Badge variant="outline" className="border-blue-300 text-blue-700">
                          {entry.clauses_found} clauses
                        </Badge>
                      )}
                      {entry.divisions_detected !== undefined && (
                        <Badge variant="outline" className="border-purple-300 text-purple-700">
                          {entry.divisions_detected} divisions
                        </Badge>
                      )}
                      {entry.entities_extracted !== undefined && (
                        <Badge variant="outline" className="border-green-300 text-green-700">
                          {entry.entities_extracted} entities
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
