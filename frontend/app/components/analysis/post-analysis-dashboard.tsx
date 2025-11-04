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
  requirements_list?: Array<{
    description?: string;
    category?: string;
    priority?: string;
    severity?: string;
  }>;
  recommendations_list?: Array<{
    id?: string;
    title?: string;
    description?: string;
    priority?: string;
    impact?: string;
    confidence?: number;
    category?: string;
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
  const [showFullView, setShowFullView] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const exportMenuRef = React.useRef<HTMLDivElement>(null);
  
  // Close export menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);
  
  if (!isOpen || !documentAnalysis) return null;

  // Debug logging to see data structure
  console.log('PostAnalysisDashboard - documentAnalysis:', documentAnalysis);
  console.log('PostAnalysisDashboard - recommendations:', documentAnalysis.recommendations_list);
  console.log('PostAnalysisDashboard - risks:', documentAnalysis.risks);

  const qualityColor = resultSummary.quality_score >= 90 ? 'text-green-500' : 
                       resultSummary.quality_score >= 70 ? 'text-yellow-500' : 'text-red-500';

  // Export analysis as JSON file
  const handleExportJSON = () => {
    const exportData = {
      metadata: {
        exported_at: new Date().toISOString(),
        execution_time: resultSummary.execution_time,
        quality_score: resultSummary.quality_score,
        document_type: resultSummary.document_type
      },
      analysis: documentAnalysis,
      summary: resultSummary,
      insights: insights
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export analysis as professional HTML report
  const handleExportPDF = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });

    // Calculate quality score percentage
    const qualityPercentage = Math.round(resultSummary.quality_score * 100);
    
    // Get quality color and label
    const getQualityColor = (score: number) => {
      if (score >= 80) return '#10b981'; // green
      if (score >= 60) return '#f59e0b'; // yellow
      return '#ef4444'; // red
    };
    
    const getQualityLabel = (score: number) => {
      if (score >= 80) return 'Excellent';
      if (score >= 60) return 'Good';
      return 'Needs Review';
    };

    // Generate professional HTML report
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>ConstructAI - Construction Intelligence Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #1f2937;
            line-height: 1.6;
            background: #ffffff;
          }
          
          .page {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.75in;
            background: white;
          }
          
          /* Cover Page */
          .cover-page {
            text-align: center;
            padding-top: 2.5in;
            page-break-after: always;
          }
          
          .brand {
            font-size: 48px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 0.25in;
            letter-spacing: -1px;
          }
          
          .report-type {
            font-size: 20px;
            color: #6b7280;
            margin-bottom: 1in;
            font-weight: 500;
          }
          
          .cover-metadata {
            text-align: left;
            max-width: 500px;
            margin: 0 auto;
            padding: 30px;
            background: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid #1e40af;
          }
          
          .cover-metadata p {
            margin: 12px 0;
            font-size: 14px;
            color: #4b5563;
          }
          
          .cover-metadata strong {
            color: #1f2937;
            font-weight: 600;
          }
          
          .cover-summary {
            margin-top: 1in;
            text-align: justify;
            line-height: 1.8;
            color: #4b5563;
            font-size: 13px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
          
          /* Header & Footer */
          .header {
            border-bottom: 2px solid #1e40af;
            padding-bottom: 12px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #1e40af;
            font-size: 24px;
            font-weight: bold;
          }
          
          .header .subtitle {
            color: #6b7280;
            font-size: 12px;
            margin-top: 4px;
          }
          
          /* Section Styling */
          .section {
            margin: 40px 0;
            page-break-inside: avoid;
          }
          
          .section-header {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 20px;
          }
          
          .subsection-header {
            font-size: 15px;
            font-weight: 600;
            color: #2563eb;
            margin-top: 25px;
            margin-bottom: 12px;
          }
          
          .body-text {
            text-align: justify;
            margin-bottom: 15px;
            color: #4b5563;
            font-size: 11px;
            line-height: 1.7;
          }
          
          /* Metrics Grid */
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          
          .metric-card {
            background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          
          .metric-value {
            font-size: 36px;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 8px;
          }
          
          .metric-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
          }
          
          /* Quality Score Special Card */
          .quality-score-card {
            grid-column: span 4;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
          }
          
          .quality-score-value {
            font-size: 56px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .quality-score-label {
            font-size: 14px;
            opacity: 0.9;
            font-weight: 500;
          }
          
          /* Content Box */
          .content-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
          }
          
          /* List Items */
          .item-list {
            margin: 15px 0;
          }
          
          .list-item {
            background: white;
            border: 1px solid #e5e7eb;
            border-left: 4px solid #2563eb;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          
          .item-header {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
          }
          
          .item-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-right: 12px;
          }
          
          .badge-critical {
            background: #fee2e2;
            color: #991b1b;
          }
          
          .badge-high {
            background: #fef3c7;
            color: #92400e;
          }
          
          .badge-medium {
            background: #dbeafe;
            color: #1e40af;
          }
          
          .badge-low {
            background: #d1fae5;
            color: #065f46;
          }
          
          .item-title {
            font-size: 13px;
            font-weight: 600;
            color: #1f2937;
            flex: 1;
          }
          
          .item-description {
            font-size: 11px;
            color: #4b5563;
            line-height: 1.6;
            margin-top: 6px;
          }
          
          /* Table Styling */
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 11px;
          }
          
          thead {
            background: #1e40af;
            color: white;
          }
          
          th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
            color: #4b5563;
          }
          
          tbody tr:hover {
            background: #f9fafb;
          }
          
          /* Footer */
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
          }
          
          @media print {
            .page { padding: 0.5in; }
            .cover-page { padding-top: 2in; }
          }
        </style>
      </head>
      <body>
        <!-- COVER PAGE -->
        <div class="page cover-page">
          <div class="brand">ConstructAI</div>
          <div class="report-type">Construction Intelligence Report</div>
          
          <div class="cover-metadata">
            <p><strong>Project:</strong> ${documentAnalysis.document_type || 'Construction Project'}</p>
            <p><strong>Report ID:</strong> ${(resultSummary as unknown as Record<string, unknown>).analysis_id || 'N/A'}</p>
            <p><strong>Generated:</strong> ${formattedDate} at ${formattedTime}</p>
            <p><strong>Analysis Status:</strong> <span style="color: ${getQualityColor(qualityPercentage)}; font-weight: 600;">${getQualityLabel(qualityPercentage)}</span></p>
          </div>
          
          <div class="cover-summary">
            This AI-powered report provides comprehensive construction intelligence and actionable 
            insights for project execution. All content is dynamically generated through advanced 
            AI analysis of project specifications, ensuring relevant and accurate recommendations 
            tailored to your specific project requirements.
            <br><br>
            The report includes document analysis, risk assessment, compliance recommendations, 
            and strategic insights to guide your construction team from planning through completion.
          </div>
        </div>
        
        <!-- MAIN CONTENT PAGES -->
        <div class="page">
          <div class="header">
            <h1>📊 Executive Summary</h1>
            <div class="subtitle">Key Performance Indicators &amp; Analysis Overview</div>
          </div>
          
          <!-- Quality Score Feature -->
          <div class="metrics-grid">
            <div class="quality-score-card" style="background: linear-gradient(135deg, ${getQualityColor(qualityPercentage)}, ${getQualityColor(qualityPercentage)}dd);">
              <div class="quality-score-value">${qualityPercentage}%</div>
              <div class="quality-score-label">Overall Quality Score - ${getQualityLabel(qualityPercentage)}</div>
            </div>
          </div>
          
          <!-- Key Metrics -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${resultSummary.ai_decisions}</div>
              <div class="metric-label">AI Decisions</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${resultSummary.recommendations}</div>
              <div class="metric-label">Recommendations</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${resultSummary.requirements}</div>
              <div class="metric-label">Requirements</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${resultSummary.execution_time.toFixed(1)}s</div>
              <div class="metric-label">Execution Time</div>
            </div>
          </div>
          
          ${documentAnalysis.classification ? `
          <div class="section">
            <div class="section-header">📄 Document Classification</div>
            <div class="content-box">
              <p class="body-text"><strong>Primary Type:</strong> ${documentAnalysis.classification.primary_type || resultSummary.document_type || 'Unknown'}</p>
              ${documentAnalysis.classification.confidence ? `<p class="body-text"><strong>Classification Confidence:</strong> ${(documentAnalysis.classification.confidence * 100).toFixed(1)}%</p>` : ''}
              ${resultSummary.divisions_detected !== undefined ? `<p class="body-text"><strong>MasterFormat Divisions Detected:</strong> ${resultSummary.divisions_detected}</p>` : ''}
              ${resultSummary.clauses_found !== undefined ? `<p class="body-text"><strong>Clauses Extracted:</strong> ${resultSummary.clauses_found}</p>` : ''}
              ${resultSummary.entities_extracted !== undefined ? `<p class="body-text"><strong>Entities Identified:</strong> ${resultSummary.entities_extracted}</p>` : ''}
            </div>
          </div>
          ` : ''}
        </div>
        
        ${documentAnalysis.recommendations_list && documentAnalysis.recommendations_list.length > 0 ? `
        <div class="page">
          <div class="header">
            <h1>💡 Strategic Recommendations</h1>
            <div class="subtitle">AI-Generated Insights &amp; Action Items</div>
          </div>
          
          <div class="section">
            <div class="section-header">Priority Recommendations</div>
            <p class="body-text">
              Based on comprehensive analysis of your project documentation, our AI has identified 
              ${documentAnalysis.recommendations_list.length} strategic recommendations to enhance 
              project execution, ensure compliance, and mitigate potential risks.
            </p>
            
            <div class="item-list">
              ${documentAnalysis.recommendations_list.map((rec, idx) => {
                const priority = rec.priority || 'medium';
                const title = typeof rec.title === 'string' ? rec.title : 
                             (typeof rec === 'string' ? rec : `Recommendation ${idx + 1}`);
                const description = typeof rec.description === 'string' ? rec.description : 
                                  (typeof rec.impact === 'string' ? rec.impact : '');
                const category = rec.category || 'General';
                
                return `
                <div class="list-item">
                  <div class="item-header">
                    <span class="item-badge badge-${priority}">${priority}</span>
                    <span class="item-title">${title}</span>
                  </div>
                  ${description ? `<p class="item-description">${description}</p>` : ''}
                  <p class="item-description" style="margin-top: 8px; color: #6b7280;">
                    <strong>Category:</strong> ${category}
                  </p>
                </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
        ` : ''}
        
        ${documentAnalysis.risks && documentAnalysis.risks.length > 0 ? `
        <div class="page">
          <div class="header">
            <h1>⚠️ Risk Assessment &amp; Mitigation</h1>
            <div class="subtitle">Identified Risks &amp; Recommended Actions</div>
          </div>
          
          <div class="section">
            <div class="section-header">Risk Analysis</div>
            <p class="body-text">
              Our AI has identified ${documentAnalysis.risks.length} potential risk factors that require 
              attention during project execution. Each risk has been categorized by severity and includes 
              recommended mitigation strategies.
            </p>
            
            <div class="item-list">
              ${documentAnalysis.risks.map((risk, idx) => {
                const severity = risk.severity || 'medium';
                const riskData = risk as unknown as Record<string, unknown>;
                const category = risk.category || riskData.type || `Risk Factor ${idx + 1}`;
                const description = risk.description || riskData.text || '';
                const location = riskData.location || '';
                
                return `
                <div class="list-item">
                  <div class="item-header">
                    <span class="item-badge badge-${severity}">${severity} risk</span>
                    <span class="item-title">${category}</span>
                  </div>
                  ${description ? `<p class="item-description">${description}</p>` : ''}
                  ${location ? `<p class="item-description" style="margin-top: 6px; color: #6b7280;"><strong>Location:</strong> ${location}</p>` : ''}
                </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
        ` : ''}
        
        ${documentAnalysis.entities && (
          (documentAnalysis.entities.organizations && documentAnalysis.entities.organizations.length > 0) ||
          (documentAnalysis.entities.people && documentAnalysis.entities.people.length > 0) ||
          (documentAnalysis.entities.costs && documentAnalysis.entities.costs.length > 0) ||
          (documentAnalysis.entities.dates && documentAnalysis.entities.dates.length > 0)
        ) ? `
        <div class="page">
          <div class="header">
            <h1>🔍 Document Intelligence</h1>
            <div class="subtitle">Extracted Entities &amp; Key Information</div>
          </div>
          
          <div class="section">
            <div class="section-header">Identified Entities</div>
            <p class="body-text">
              Through advanced natural language processing, our AI has extracted and categorized 
              key entities from your project documentation. This intelligence provides quick reference 
              to critical project stakeholders, costs, and timeline information.
            </p>
            
            ${documentAnalysis.entities.organizations && documentAnalysis.entities.organizations.length > 0 ? `
            <div class="subsection-header">Organizations (${documentAnalysis.entities.organizations.length})</div>
            <table>
              <thead>
                <tr>
                  <th>Organization Name</th>
                  <th>Role</th>
                  <th>References</th>
                </tr>
              </thead>
              <tbody>
                ${documentAnalysis.entities.organizations.slice(0, 20).map(org => {
                  const orgData = org as unknown as Record<string, unknown>;
                  return `
                  <tr>
                    <td>${org.name}</td>
                    <td>${orgData.role || org.type || 'N/A'}</td>
                    <td>${orgData.count || 1}</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
            ` : ''}
            
            ${documentAnalysis.entities.people && documentAnalysis.entities.people.length > 0 ? `
            <div class="subsection-header">Key Personnel (${documentAnalysis.entities.people.length})</div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Title/Role</th>
                  <th>Context</th>
                </tr>
              </thead>
              <tbody>
                ${documentAnalysis.entities.people.slice(0, 15).map(person => {
                  const personData = person as unknown as Record<string, unknown>;
                  return `
                  <tr>
                    <td>${person.name}</td>
                    <td>${personData.title || person.role || 'N/A'}</td>
                    <td>${personData.context || 'Mentioned in documentation'}</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
            ` : ''}
            
            ${documentAnalysis.entities.costs && documentAnalysis.entities.costs.length > 0 ? `
            <div class="subsection-header">Cost Items (${documentAnalysis.entities.costs.length})</div>
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${documentAnalysis.entities.costs.slice(0, 15).map(cost => {
                  const costData = cost as unknown as Record<string, unknown>;
                  return `
                  <tr>
                    <td style="font-weight: 600; color: #1e40af;">${cost.amount}</td>
                    <td>${costData.category || 'General'}</td>
                    <td>${cost.description || costData.context || 'N/A'}</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
            ` : ''}
            
            ${documentAnalysis.entities.dates && documentAnalysis.entities.dates.length > 0 ? `
            <div class="subsection-header">Key Dates (${documentAnalysis.entities.dates.length})</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event/Milestone</th>
                </tr>
              </thead>
              <tbody>
                ${documentAnalysis.entities.dates.slice(0, 10).map(date => {
                  const dateData = date as unknown as Record<string, unknown>;
                  return `
                  <tr>
                    <td style="font-weight: 600;">${date.date}</td>
                    <td>${dateData.description || date.context || 'Referenced in documentation'}</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        <!-- FOOTER PAGE -->
        <div class="page">
          <div class="footer">
            <p><strong>ConstructAI™</strong> - Construction Intelligence Platform</p>
            <p>Report generated on ${formattedDate} at ${formattedTime}</p>
            <p style="margin-top: 15px; font-size: 9px;">
              This report contains AI-generated insights based on analysis of your project documentation. 
              Recommendations should be reviewed by qualified professionals before implementation.
            </p>
          </div>
        </div>
        
        <hr style="margin: 40px 0;">
        <p style="text-align: center; color: #6b7280; font-size: 12px;">
          Generated by ConstructAI - AI-Powered Construction Document Analysis
        </p>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analysis-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Toggle full view to show all items instead of just top 5
  const handleViewFullAnalysis = () => {
    setShowFullView(!showFullView);
    const contentDiv = document.querySelector('.post-analysis-content');
    if (contentDiv && !showFullView) {
      contentDiv.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 relative">
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] post-analysis-content">
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
                            className="h-full bg-linear-to-r from-blue-500 to-purple-500"
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
                        {documentAnalysis.entities.organizations.slice(0, showFullView ? undefined : 5).map((org, idx) => (
                          <Badge key={idx} variant="outline" className="border-blue-500/30 text-blue-300">
                            {org.name}
                          </Badge>
                        ))}
                        {!showFullView && documentAnalysis.entities.organizations.length > 5 && (
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
                    {documentAnalysis.risks.slice(0, showFullView ? undefined : 5).map((risk, idx) => {
                      // Safely extract properties
                      const severity = typeof risk.severity === 'string' ? risk.severity : String(risk.severity || 'Unknown');
                      const category = typeof risk.category === 'string' ? risk.category : 'Risk';
                      const description = typeof risk.description === 'string' ? risk.description : '';
                      
                      return (
                      <div key={idx} className="p-3 bg-slate-900/50 rounded-lg border border-orange-500/20">
                        <div className="flex items-start gap-2">
                          <Badge 
                            variant="outline" 
                            className={`
                              ${severity === 'high' ? 'border-red-500/50 text-red-400' : 
                                severity === 'medium' ? 'border-orange-500/50 text-orange-400' : 
                                'border-yellow-500/50 text-yellow-400'}
                            `}
                          >
                            {severity}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{category}</p>
                            {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
                          </div>
                        </div>
                      </div>
                    );})}
                    {!showFullView && documentAnalysis.risks.length > 5 && (
                      <p className="text-xs text-slate-400 text-center">
                        +{documentAnalysis.risks.length - 5} more risks
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Recommendations */}
            {documentAnalysis.recommendations_list && documentAnalysis.recommendations_list.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-400" />
                    Top Recommendations
                  </CardTitle>
                  <CardDescription>
                    {documentAnalysis.recommendations_list.length} AI-generated recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {documentAnalysis.recommendations_list.slice(0, showFullView ? undefined : 5).map((rec, idx) => {
                      // Safely extract properties, handling both string and object values
                      const priority = typeof rec.priority === 'string' ? rec.priority : String(rec.priority || 'Normal');
                      const title = typeof rec.title === 'string' ? rec.title : (typeof rec === 'string' ? rec : 'Recommendation');
                      const description = typeof rec.description === 'string' ? rec.description : '';
                      
                      return (
                      <div key={idx} className="p-3 bg-slate-900/50 rounded-lg border border-blue-500/20">
                        <div className="flex items-start gap-2">
                          <Badge 
                            variant="outline" 
                            className={`
                              ${priority === 'high' ? 'border-purple-500/50 text-purple-400' : 
                                priority === 'medium' ? 'border-blue-500/50 text-blue-400' : 
                                'border-slate-500/50 text-slate-400'}
                            `}
                          >
                            {priority}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{title}</p>
                            {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
                          </div>
                        </div>
                      </div>
                    );})}
                    {!showFullView && documentAnalysis.recommendations_list.length > 5 && (
                      <p className="text-xs text-slate-400 text-center">
                        +{documentAnalysis.recommendations_list.length - 5} more recommendations
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
            {/* Export Menu */}
            <div className="relative" ref={exportMenuRef}>
              <Button
                variant="ghost"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="hover:bg-slate-700/50 p-2 border-0"
                title="Export Report"
              >
                <Download className="w-5 h-5 text-white" />
              </Button>
              
              {/* Export Dropdown */}
              {showExportMenu && (
                <div className="absolute bottom-full mb-2 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50 min-w-40">
                  <button
                    onClick={handleExportJSON}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Export as JSON
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Export as HTML/PDF
                  </button>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              onClick={handleViewFullAnalysis}
              className="hover:bg-blue-600/50 p-2 border-0"
              title={showFullView ? 'Show Summary' : 'View Full Analysis'}
            >
              <Eye className="w-5 h-5 text-white" />
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
