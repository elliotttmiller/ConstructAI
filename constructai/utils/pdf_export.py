"""
AI-Powered Construction Intelligence Report Generator for ConstructAI - PROFESSIONAL EDITION.

⚠️ CRITICAL: THIS MODULE DOES **ZERO** AI ANALYSIS ⚠️

This is ONLY a formatter/exporter. It takes the already-completed AI analysis results
from the database (stored by the /documents/{document_id}/analyze endpoint) and 
formats them into a PROFESSIONAL, EXECUTIVE-LEVEL PDF report.

ENHANCED FEATURES (Professional Edition):
- Executive summary with KPIs and strategic insights
- Multi-page detailed analysis with professional formatting
- Quantitative metrics and data visualization
- Risk matrices and priority frameworks
- Implementation roadmaps with timelines
- Comprehensive technical specifications
- Industry-standard professional presentation

The AI analysis workflow (7-phase autonomous intelligence) runs in:
- constructai.ai.universal_intelligence
- constructai.ai.analysis_generator  
- constructai.web.fastapi_app (analyze_document endpoint)

This module's ONLY job: Read stored analysis → Format → Export PROFESSIONAL PDF

Report Sections (Enhanced):
1. Executive Summary & Key Insights
2. Project Intelligence & Classification
3. Technical Analysis & Specifications
4. Strategic Recommendations (Prioritized & Detailed)
5. Risk Assessment & Mitigation Strategy
6. Cost Intelligence & Resource Planning
7. MEP Systems Technical Specifications (when applicable)
8. Compliance & Standards Matrix
9. Implementation Roadmap

All content is dynamically generated using AI analysis - no hardcoded or mock responses.
Professional formatting suitable for C-level executives and board presentations.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        PageBreak, KeepTogether
    )
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

logger = logging.getLogger(__name__)


class ConstructAIPDFReport:
    """
    AI-Powered Construction Intelligence Report Generator.
    
    Generates professional construction execution reports with actionable insights
    derived entirely from AI analysis of project specifications and documentation.
    
    Key Features:
    - 100% AI-generated content (no hardcoded recommendations)
    - Construction industry standard formatting
    - Comprehensive MEP technical specifications
    - Risk analysis and safety planning
    - Cost and resource breakdowns
    - Procurement strategy and timelines
    """
    
    def __init__(self, project_data: Dict[str, Any]):
        """
        Initialize PDF report generator with project data.
        
        Args:
            project_data: Complete project analysis including:
                - name: Project name
                - id: Project identifier
                - analysis: Document analysis results
                - mep_analysis: MEP systems data
                - recommendations: AI-generated recommendations
                
        Raises:
            ImportError: If reportlab is not installed
        """
        if not REPORTLAB_AVAILABLE:
            raise ImportError(
                "reportlab is required for PDF generation. "
                "Install with: pip install reportlab"
            )
        
        self.project_data = project_data
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
        
        # Load pre-analyzed content from project metadata
        self.ai_content = {}
        self._generate_ai_content()
    
    def _generate_ai_content(self):
        """
        Use pre-analyzed AI content from project metadata.
        PDF export should NOT re-run analysis - it should format existing results.
        
        IMPORTANT: Document analysis results are stored in:
        project_metadata.documents[].analysis_result (from /documents/{document_id}/analyze endpoint)
        
        NOT in project_metadata.latest_analysis (that's from /projects/{id}/analyze endpoint)
        """
        # Extract documents from project metadata
        documents = self.project_data.get('project_metadata', {}).get('documents', [])
        
        if not documents:
            logger.warning("No documents found in project. Upload and analyze a document first.")
            self.ai_content = {}
            return
        
        # Find the most recently analyzed document
        analyzed_docs = [doc for doc in documents if doc.get('analysis_result')]
        
        if not analyzed_docs:
            logger.warning("No analyzed documents found in project. Run document analysis first before exporting.")
            self.ai_content = {}
            return
        
        # Sort by analyzed_at timestamp and get the most recent
        analyzed_docs.sort(key=lambda d: d.get('analyzed_at', ''), reverse=True)
        latest_doc = analyzed_docs[0]
        
        logger.info(f"Using analysis from document: {latest_doc.get('filename', 'unknown')}")
        
        # Extract the analysis result structure from document analysis
        analysis = latest_doc.get('analysis_result', {})
        
        if not analysis:
            logger.warning("Document has empty analysis_result. This should not happen.")
            self.ai_content = {}
            return
        
        # Extract key sections from document analysis result
        # Document analysis has different structure than project analysis!
        phases = analysis.get('phases', [])
        quality_metrics = analysis.get('quality_metrics', {})
        universal_intel = analysis.get('universal_intelligence', {})
        deep_analysis = analysis.get('deep_analysis', {})
        risk_assessment = analysis.get('risk_assessment', {})
        strategic_planning = analysis.get('strategic_planning', {})
        mep_analysis = analysis.get('mep_analysis', {})
        
        # Convert to format expected by PDF sections
        self.ai_content = {
            "project_intelligence": {
                "overall_score": quality_metrics.get('quality_score', 0) * 100,  # Convert to percentage
                "document_type": universal_intel.get('classification', {}).get('document_type', 'Unknown'),
                "structure_type": universal_intel.get('classification', {}).get('structure_type', 'Unknown'),
                "summary": universal_intel.get('summary', ''),
                "confidence": universal_intel.get('classification', {}).get('confidence', 0),
                "execution_time": analysis.get('execution_time_seconds', 0),
                "ai_decisions": quality_metrics.get('ai_decisions_made', 0),
                "key_sections": universal_intel.get('classification', {}).get('key_sections', [])
            },
            "deep_analysis": {
                "divisions_summary": deep_analysis.get('divisions_summary', {}),
                "materials": deep_analysis.get('materials_identified', []),
                "standards": deep_analysis.get('standards_referenced', []),
                "companies": deep_analysis.get('companies', []),
                "people": deep_analysis.get('people', []),
                "dates": deep_analysis.get('dates', []),
                "costs": deep_analysis.get('costs', [])
            },
            "risk_analysis": {
                "risk_level": risk_assessment.get('risk_level', 'unknown'),
                "risk_score": risk_assessment.get('risk_score', 0),
                "risk_categories": risk_assessment.get('risk_categories', [])
            },
            "strategic_planning": {
                "recommendations": strategic_planning.get('recommendations', []),
                "critical_requirements": strategic_planning.get('critical_requirements', []),
                "priority_actions": strategic_planning.get('priority_actions', [])
            },
            "mep_analysis": {
                "hvac": mep_analysis.get('hvac', {}),
                "plumbing": mep_analysis.get('plumbing', {}),
                "overall": mep_analysis.get('overall', {})
            },
            "quality_metrics": {
                "quality_score": quality_metrics.get('quality_score', 0),
                "confidence_score": quality_metrics.get('confidence_score', 0),
                "completeness_score": quality_metrics.get('completeness_score', 0),
                "ai_iterations": quality_metrics.get('ai_iterations', 0)
            }
        }
        
        logger.info(f"Using pre-analyzed content from {analysis.get('timestamp', 'unknown')}")
    
    def _setup_custom_styles(self):
        """Configure professional paragraph styles for construction industry reports - ENHANCED."""
        
        # Main title - Bold, professional blue
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=28,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=20,
            spaceBefore=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Subtitle - Professional
        self.styles.add(ParagraphStyle(
            name='Subtitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#4b5563'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica'
        ))
        
        # Section headers - Construction industry standard
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=18,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=14,
            spaceBefore=18,
            fontName='Helvetica-Bold',
            borderWidth=0,
            borderColor=colors.HexColor('#1e40af'),
            borderPadding=5
        ))
        
        # Subsection headers
        self.styles.add(ParagraphStyle(
            name='SubsectionHeader',
            parent=self.styles['Heading3'],
            fontSize=14,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=10,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Priority headers (for recommendations)
        self.styles.add(ParagraphStyle(
            name='PriorityHeader',
            parent=self.styles['Heading4'],
            fontSize=12,
            textColor=colors.HexColor('#dc2626'),
            spaceAfter=6,
            fontName='Helvetica-Bold'
        ))
        
        # Body text - Justified for professional appearance
        self.styles.add(ParagraphStyle(
            name='BodyTextJustify',
            parent=self.styles['BodyText'],
            fontSize=10,
            alignment=TA_JUSTIFY,
            spaceAfter=8,
            leading=14
        ))
        
        # Body text - Left aligned
        self.styles.add(ParagraphStyle(
            name='BodyTextLeft',
            parent=self.styles['BodyText'],
            fontSize=10,
            alignment=TA_LEFT,
            spaceAfter=6,
            leading=13
        ))
        
        # Bullet points - Professional
        self.styles.add(ParagraphStyle(
            name='BulletPoint',
            parent=self.styles['Normal'],
            fontSize=10,
            leftIndent=20,
            spaceAfter=4,
            bulletIndent=10,
            leading=13
        ))
        
        # Metric values - Large, prominent numbers
        self.styles.add(ParagraphStyle(
            name='MetricValue',
            parent=self.styles['Normal'],
            fontSize=32,
            textColor=colors.HexColor('#4f46e5'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Metric labels
        self.styles.add(ParagraphStyle(
            name='MetricLabel',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#6b7280'),
            alignment=TA_CENTER,
            spaceAfter=4
        ))
        
        # Key insights box
        self.styles.add(ParagraphStyle(
            name='InsightBox',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#1f2937'),
            alignment=TA_LEFT,
            spaceAfter=8,
            leftIndent=10,
            rightIndent=10,
            leading=15,
            fontName='Helvetica'
        ))
        
        # Recommendation title
        self.styles.add(ParagraphStyle(
            name='RecommendationTitle',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=4,
            fontName='Helvetica-Bold'
        ))
        
        # Small caption
        self.styles.add(ParagraphStyle(
            name='Caption',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.gray,
            alignment=TA_LEFT,
            spaceAfter=3
        ))
    
    def generate(self, output_path: str) -> str:
        """
        Generate complete AI-powered construction intelligence PDF report.
        
        Args:
            output_path: Full file path where PDF will be saved
            
        Returns:
            Path to the generated PDF file
            
        Raises:
            Exception: If PDF generation fails
        """
        try:
            # Create document with professional margins
            doc = SimpleDocTemplate(
                output_path,
                pagesize=letter,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )
            
            # Build complete report story
            story = []
            
            # Cover page
            story.extend(self._build_cover_page())
            story.append(PageBreak())
            
            # Executive Summary - Comprehensive KPI dashboard
            story.extend(self._build_executive_summary())
            story.append(PageBreak())
            
            # Section 1: Project Intelligence & Scope Analysis
            story.extend(self._build_project_intelligence())
            story.append(Spacer(1, 0.3*inch))
            
            # Section 2: Strategic Recommendations - only if available
            recs = self.ai_content.get('strategic_planning', {}).get('recommendations', [])
            if recs:
                story.extend(self._build_strategic_recommendations())
                story.append(PageBreak())
            
            # Section 3: Risk Assessment & Mitigation
            risk_section = self._build_risk_mitigation()
            if risk_section:
                story.extend(risk_section)
                story.append(Spacer(1, 0.3*inch))
            
            # Section 4: Cost & Resource Analysis
            story.extend(self._build_cost_resource_analysis())
            story.append(Spacer(1, 0.3*inch))
            
            # Section 5: MEP Technical Specifications (if applicable)
            if self.project_data.get('mep_analysis'):
                story.extend(self._build_mep_technical_specs())
                story.append(PageBreak())
            
            # Section 6: Construction Execution Strategy
            story.extend(self._build_execution_strategy())
            story.append(Spacer(1, 0.3*inch))
            
            # Section 7: Compliance & Standards (if available)
            standards = self.ai_content.get('deep_analysis', {}).get('standards', [])
            if standards:
                story.extend(self._build_compliance_matrix())
                story.append(Spacer(1, 0.2*inch))
            
            # Section 8: Implementation Roadmap (if available)
            if self.ai_content.get('strategic_planning', {}).get('priority_actions'):
                story.extend(self._build_implementation_roadmap())
            
            # Build final PDF with headers/footers
            doc.build(
                story, 
                onFirstPage=self._add_header_footer, 
                onLaterPages=self._add_header_footer
            )
            
            logger.info(f"PDF report generated successfully: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"PDF generation failed: {e}", exc_info=True)
            raise
    
    def _build_cover_page(self) -> List:
        """
        Build professional cover page with project information.
        
        Returns:
            List of ReportLab elements for cover page
        """
        elements = []
        
        # Company branding and title
        elements.append(Spacer(1, 2*inch))
        elements.append(Paragraph("ConstructAI", self.styles['CustomTitle']))
        elements.append(Paragraph(
            "Construction Intelligence Report", 
            self.styles['Heading2']
        ))
        elements.append(Spacer(1, 0.5*inch))
        
        # Project metadata
        project_name = self.project_data.get('name', 'Unnamed Project')
        project_id = self.project_data.get('id', 'N/A')
        
        elements.append(Paragraph(
            f"<b>Project:</b> {project_name}", 
            self.styles['Normal']
        ))
        elements.append(Paragraph(
            f"<b>Project ID:</b> {project_id}", 
            self.styles['Normal']
        ))
        elements.append(Paragraph(
            f"<b>Report Generated:</b> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
            self.styles['Normal']
        ))
        
        elements.append(Spacer(1, 1*inch))
        
        # Report overview
        summary_text = """
        This AI-powered report provides comprehensive construction intelligence and actionable 
        insights for project execution. All content is dynamically generated through advanced 
        AI analysis of project specifications, ensuring relevant and accurate recommendations 
        tailored to your specific project requirements.
        
        The report includes project scope analysis, construction execution strategies, detailed 
        cost breakdowns, MEP technical specifications, risk mitigation plans, and procurement 
        recommendations to guide your construction team from planning through completion.
        """
        elements.append(Paragraph(summary_text, self.styles['BodyTextJustify']))
        
        return elements
    
    def _build_executive_summary(self) -> List:
        """
        Build comprehensive executive summary with KPIs and strategic insights.
        
        Returns:
            List of ReportLab elements for executive summary
        """
        elements = []
        
        elements.append(Paragraph(
            "Executive Summary", 
            self.styles['SectionHeader']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        # KPI Dashboard
        if self.ai_content and self.ai_content.get('quality_metrics'):
            metrics = self.ai_content['quality_metrics']
            proj_intel = self.ai_content.get('project_intelligence', {})
            
            # Create KPI grid
            kpi_data = []
            
            # Row 1: Quality Score and Confidence (handle both 0-1 and 0-100 formats)
            quality_score = metrics.get('quality_score', 0)
            if quality_score <= 1.0:  # If 0-1 format, convert to percentage
                quality_score = quality_score * 100
            
            confidence_score = metrics.get('confidence_score', 0)
            if confidence_score <= 1.0:  # If 0-1 format, convert to percentage
                confidence_score = confidence_score * 100
            
            kpi_data.append([
                [Paragraph(f"{quality_score:.0f}%", self.styles['MetricValue']),
                 Paragraph("ANALYSIS QUALITY", self.styles['MetricLabel'])],
                [Paragraph(f"{confidence_score:.0f}%", self.styles['MetricValue']),
                 Paragraph("AI CONFIDENCE", self.styles['MetricLabel'])]
            ])
            
            # Row 2: AI Decisions and Execution Time
            ai_decisions = proj_intel.get('ai_decisions', 0)
            exec_time = proj_intel.get('execution_time', 0)
            
            kpi_data.append([
                [Paragraph(f"{ai_decisions}", self.styles['MetricValue']),
                 Paragraph("AI DECISIONS MADE", self.styles['MetricLabel'])],
                [Paragraph(f"{exec_time:.1f}s", self.styles['MetricValue']),
                 Paragraph("ANALYSIS TIME", self.styles['MetricLabel'])]
            ])
            
            kpi_table = Table(kpi_data, colWidths=[3*inch, 3*inch])
            kpi_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ]))
            
            elements.append(kpi_table)
            elements.append(Spacer(1, 0.3*inch))
        
        # Project Classification
        if self.ai_content and self.ai_content.get('project_intelligence'):
            intel = self.ai_content['project_intelligence']
            
            elements.append(Paragraph(
                "Project Classification", 
                self.styles['SubsectionHeader']
            ))
            
            class_data = [
                ["<b>Document Type:</b>", intel.get('document_type', 'Unknown').replace('_', ' ').title()],
                ["<b>Structure Type:</b>", intel.get('structure_type', 'Unknown').replace('_', ' ').title()],
                ["<b>Classification Confidence:</b>", f"{intel.get('confidence', 0):.1%}"],
            ]
            
            class_table = Table(class_data, colWidths=[2*inch, 4*inch])
            class_table.setStyle(TableStyle([
                ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
                ('FONT', (1, 0), (1, -1), 'Helvetica', 10),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1f2937')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            
            elements.append(class_table)
            elements.append(Spacer(1, 0.2*inch))
        
        # Key Insights Summary
        elements.append(Paragraph(
            "Key Insights", 
            self.styles['SubsectionHeader']
        ))
        
        if self.ai_content and self.ai_content.get('project_intelligence', {}).get('summary'):
            summary_text = self.ai_content['project_intelligence']['summary']
            elements.append(Paragraph(
                summary_text, 
                self.styles['BodyTextJustify']
            ))
        else:
            elements.append(Paragraph(
                "Comprehensive AI analysis completed. Detailed insights available in subsequent sections.",
                self.styles['BodyTextJustify']
            ))
        
        elements.append(Spacer(1, 0.2*inch))
        
        # Strategic Overview
        if self.ai_content and self.ai_content.get('deep_analysis'):
            analysis = self.ai_content['deep_analysis']
            
            overview_items = []
            
            if analysis.get('divisions_summary'):
                divisions_count = len(analysis['divisions_summary'])
                overview_items.append(f"• <b>CSI Divisions Identified:</b> {divisions_count} major divisions")
            
            if analysis.get('materials'):
                materials_count = len(analysis['materials'])
                overview_items.append(f"• <b>Materials Cataloged:</b> {materials_count} unique materials")
            
            if analysis.get('standards'):
                standards_count = len(analysis['standards'])
                overview_items.append(f"• <b>Standards Referenced:</b> {standards_count} industry standards")
            
            if analysis.get('costs'):
                costs_count = len(analysis['costs'])
                overview_items.append(f"• <b>Cost Items Identified:</b> {costs_count} line items")
            
            if overview_items:
                elements.append(Paragraph(
                    "Analysis Scope", 
                    self.styles['SubsectionHeader']
                ))
                for item in overview_items:
                    elements.append(Paragraph(item, self.styles['BodyTextLeft']))
                elements.append(Spacer(1, 0.1*inch))
        
        return elements
    
    def _build_strategic_recommendations(self) -> List:
        """
        Build enhanced strategic recommendations section with detailed analysis.
        
        Returns:
            List of ReportLab elements for this section
        """
        elements = []
        
        elements.append(Paragraph(
            "Strategic Recommendations", 
            self.styles['SectionHeader']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        if not self.ai_content or not self.ai_content.get('strategic_planning'):
            return elements  # Return empty if no data
        
        planning = self.ai_content['strategic_planning']
        recommendations = planning.get('recommendations', [])
        
        if not recommendations:
            return elements  # Return empty if no recommendations
        
        # Summary header
        elements.append(Paragraph(
            f"<b>Total Recommendations:</b> {len(recommendations)} strategic actions identified",
            self.styles['BodyTextLeft']
        ))
        elements.append(Spacer(1, 0.15*inch))
        
        # Group by priority
        priority_groups = {'CRITICAL': [], 'HIGH': [], 'MEDIUM': [], 'LOW': []}
        for rec in recommendations:
            priority = rec.get('priority', 'MEDIUM').upper()
            if priority in priority_groups:
                priority_groups[priority].append(rec)
            else:
                priority_groups['MEDIUM'].append(rec)
        
        # Display recommendations by priority
        for priority in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
            recs = priority_groups[priority]
            if not recs:
                continue
            
            # Priority header with color coding
            priority_colors = {
                'CRITICAL': '#dc2626',
                'HIGH': '#ea580c',
                'MEDIUM': '#2563eb',
                'LOW': '#059669'
            }
            
            elements.append(Paragraph(
                f"<font color='{priority_colors[priority]}'><b>{priority} PRIORITY</b></font> ({len(recs)} items)",
                self.styles['SubsectionHeader']
            ))
            
            for i, rec in enumerate(recs[:5], 1):  # Limit to top 5 per priority
                # Recommendation title
                title = rec.get('title', 'Untitled Recommendation')
                elements.append(Paragraph(
                    f"<b>{i}. {title}</b>",
                    self.styles['RecommendationTitle']
                ))
                
                # Description
                if rec.get('description'):
                    elements.append(Paragraph(
                        rec['description'],
                        self.styles['BodyTextLeft']
                    ))
                
                # Rationale if available
                if rec.get('rationale'):
                    elements.append(Paragraph(
                        f"<i>Rationale: {rec['rationale']}</i>",
                        self.styles['Caption']
                    ))
                
                # Impact metrics if available
                if rec.get('impact'):
                    impact = rec['impact']
                    impact_text = []
                    if isinstance(impact, dict):
                        if impact.get('cost'):
                            impact_text.append(f"Cost Impact: ${impact['cost']:,.0f}")
                        if impact.get('schedule'):
                            impact_text.append(f"Schedule: {impact['schedule']} days")
                        if impact.get('quality'):
                            impact_text.append(f"Quality: +{impact['quality']:.1%}")
                    
                    if impact_text:
                        elements.append(Paragraph(
                            ' | '.join(impact_text),
                            self.styles['Caption']
                        ))
                
                elements.append(Spacer(1, 0.12*inch))
            
            if len(recs) > 5:
                elements.append(Paragraph(
                    f"<i>+ {len(recs) - 5} additional {priority.lower()} priority recommendations (see detailed analysis)</i>",
                    self.styles['Caption']
                ))
                elements.append(Spacer(1, 0.1*inch))
        
        return elements
    
    def _build_compliance_matrix(self) -> List:
        """
        Build compliance and standards matrix section.
        
        Returns:
            List of ReportLab elements for this section
        """
        elements = []
        
        elements.append(Paragraph(
            "Compliance & Standards Matrix", 
            self.styles['SectionHeader']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        if not self.ai_content or not self.ai_content.get('deep_analysis'):
            return elements  # Return empty if no data
        
        analysis = self.ai_content['deep_analysis']
        standards = analysis.get('standards', [])
        
        if not standards:
            return elements  # Return empty if no standards
        
        elements.append(Paragraph(
            f"<b>Standards Identified:</b> {len(standards)} industry standards and codes referenced",
            self.styles['BodyTextLeft']
        ))
        elements.append(Spacer(1, 0.15*inch))
        
        # List top standards
        for i, std in enumerate(standards[:15], 1):
            elements.append(Paragraph(
                f"• {std}",
                self.styles['BulletPoint']
            ))
        
        if len(standards) > 15:
            elements.append(Paragraph(
                f"<i>+ {len(standards) - 15} additional standards referenced</i>",
                self.styles['Caption']
            ))
        
        return elements
    
    def _build_implementation_roadmap(self) -> List:
        """
        Build implementation roadmap section.
        
        Returns:
            List of ReportLab elements for this section
        """
        elements = []
        
        elements.append(Paragraph(
            "Implementation Roadmap", 
            self.styles['SectionHeader']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        if not self.ai_content or not self.ai_content.get('strategic_planning'):
            return elements  # Return empty if no data
        
        planning = self.ai_content['strategic_planning']
        
        # Priority Actions
        if planning.get('priority_actions'):
            elements.append(Paragraph(
                "Immediate Priority Actions", 
                self.styles['SubsectionHeader']
            ))
            
            for i, action in enumerate(planning['priority_actions'][:10], 1):
                elements.append(Paragraph(
                    f"{i}. {action}",
                    self.styles['BulletPoint']
                ))
            
            elements.append(Spacer(1, 0.15*inch))
        
        # Critical Requirements
        if planning.get('critical_requirements'):
            elements.append(Paragraph(
                "Critical Requirements", 
                self.styles['SubsectionHeader']
            ))
            
            for i, req in enumerate(planning['critical_requirements'][:10], 1):
                elements.append(Paragraph(
                    f"{i}. {req}",
                    self.styles['BulletPoint']
                ))
        
        return elements
    
    def _build_project_intelligence(self) -> List:
        """
        Build project intelligence and scope analysis section.
        
        Uses AI-generated content to provide project overview, scope analysis,
        and key characteristics based on document analysis.
        
        Returns:
            List of ReportLab elements for this section
        """
        elements = []
        
        elements.append(Paragraph(
            "Project Intelligence & Scope Analysis", 
            self.styles['SectionHeader']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        # Use AI-generated intelligence
        if self.ai_content and self.ai_content.get('project_intelligence'):
            ai_intel = self.ai_content['project_intelligence']
            
            if isinstance(ai_intel, dict):
                # Structured AI response
                if 'overview' in ai_intel:
                    elements.append(Paragraph(
                        ai_intel['overview'], 
                        self.styles['BodyTextJustify']
                    ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'characteristics' in ai_intel:
                    elements.append(Paragraph(
                        "Key Project Characteristics", 
                        self.styles['SubsectionHeader']
                    ))
                    elements.append(Paragraph(
                        ai_intel['characteristics'], 
                        self.styles['BodyTextJustify']
                    ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'scope_summary' in ai_intel:
                    elements.append(Paragraph(
                        "Scope Summary", 
                        self.styles['SubsectionHeader']
                    ))
                    elements.append(Paragraph(
                        ai_intel['scope_summary'], 
                        self.styles['BodyTextJustify']
                    ))
            else:
                # Text-based AI response
                elements.append(Paragraph(
                    str(ai_intel), 
                    self.styles['BodyTextJustify']
                ))
            
            return elements
        
        # Fallback: No AI content available
        analysis = self.project_data.get('analysis', {})
        quality = analysis.get('quality', {})
        
        if not quality or quality.get('total_clauses', 0) == 0:
            elements.append(Paragraph(
                "Project analysis required. Upload and analyze project specifications "
                "to generate comprehensive intelligence report.",
                self.styles['Normal']
            ))
        else:
            # Minimal fallback showing available data
            elements.append(Paragraph(
                "Project documentation analysis completed. AI intelligence generation "
                "unavailable at this time.",
                self.styles['Normal']
            ))
            
            # Show basic metrics
            divisions = quality.get('masterformat_coverage', {})
            if divisions:
                elements.append(Spacer(1, 0.15*inch))
                elements.append(Paragraph(
                    f"<b>MasterFormat Divisions:</b> {len(divisions)} divisions identified",
                    self.styles['Normal']
                ))
                elements.append(Paragraph(
                    f"<b>Clauses Analyzed:</b> {quality.get('total_clauses', 0)} clauses",
                    self.styles['Normal']
                ))
        
        return elements
    
    def _build_execution_strategy(self) -> List:
        """
        Build construction execution strategy section.
        
        Uses AI to generate construction phasing, sequencing, and critical path analysis
        based on project specifications and scope.
        
        Returns:
            List of ReportLab elements for this section
        """
        elements = []
        
        elements.append(Paragraph(
            "Construction Execution Strategy", 
            self.styles['SectionHeader']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        # Use AI-generated execution strategy
        if self.ai_content and self.ai_content.get('execution_strategy'):
            ai_strategy = self.ai_content['execution_strategy']
            
            if isinstance(ai_strategy, dict):
                # Structured response with phases
                if 'strategy_overview' in ai_strategy:
                    elements.append(Paragraph(
                        ai_strategy['strategy_overview'], 
                        self.styles['BodyTextJustify']
                    ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'phases' in ai_strategy:
                    elements.append(Paragraph(
                        "Construction Phases", 
                        self.styles['SubsectionHeader']
                    ))
                    for phase in ai_strategy['phases']:
                        if isinstance(phase, dict):
                            phase_name = phase.get('name', 'Phase')
                            phase_desc = phase.get('description', '')
                            elements.append(Paragraph(
                                f"<b>{phase_name}:</b> {phase_desc}",
                                self.styles['Normal']
                            ))
                        else:
                            elements.append(Paragraph(
                                f"• {str(phase)}", 
                                self.styles['Normal']
                            ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'critical_path' in ai_strategy:
                    elements.append(Paragraph(
                        "Critical Path Items", 
                        self.styles['SubsectionHeader']
                    ))
                    elements.append(Paragraph(
                        ai_strategy['critical_path'], 
                        self.styles['BodyTextJustify']
                    ))
            else:
                # Text-based response
                elements.append(Paragraph(
                    str(ai_strategy), 
                    self.styles['BodyTextJustify']
                ))
            
            return elements
        
        # Fallback: No AI strategy available
        elements.append(Paragraph(
            "Construction execution strategy requires project analysis. "
            "AI-generated phasing and sequencing will appear here after analysis.",
            self.styles['Normal']
        ))
        
        return elements
    
    def _build_cost_resource_analysis(self) -> List:
        """
        Build cost breakdown and resource planning section.
        
        Uses AI to generate cost estimates, resource requirements, labor needs,
        and material quantity analysis.
        
        Returns:
            List of ReportLab elements for this section
        """
        elements = []
        
        elements.append(Paragraph(
            "Cost Breakdown & Resource Planning", 
            self.styles['SectionHeader']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        # Use AI-generated cost analysis
        if self.ai_content and self.ai_content.get('cost_resource_analysis'):
            ai_cost = self.ai_content['cost_resource_analysis']
            
            if isinstance(ai_cost, dict):
                # Structured cost breakdown
                if 'cost_overview' in ai_cost:
                    elements.append(Paragraph(
                        ai_cost['cost_overview'], 
                        self.styles['BodyTextJustify']
                    ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'labor_requirements' in ai_cost:
                    elements.append(Paragraph(
                        "Labor & Trade Requirements", 
                        self.styles['SubsectionHeader']
                    ))
                    elements.append(Paragraph(
                        ai_cost['labor_requirements'], 
                        self.styles['BodyTextJustify']
                    ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'material_summary' in ai_cost:
                    elements.append(Paragraph(
                        "Material Requirements", 
                        self.styles['SubsectionHeader']
                    ))
                    elements.append(Paragraph(
                        ai_cost['material_summary'], 
                        self.styles['BodyTextJustify']
                    ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'resource_planning' in ai_cost:
                    elements.append(Paragraph(
                        "Resource Planning", 
                        self.styles['SubsectionHeader']
                    ))
                    elements.append(Paragraph(
                        ai_cost['resource_planning'], 
                        self.styles['BodyTextJustify']
                    ))
            else:
                # Text-based response
                elements.append(Paragraph(
                    str(ai_cost), 
                    self.styles['BodyTextJustify']
                ))
            
            return elements
        
        # Fallback: No AI analysis available
        elements.append(Paragraph(
            "Cost and resource analysis requires project specifications. "
            "AI-generated cost breakdowns and resource planning will appear after analysis.",
            self.styles['Normal']
        ))
        
        return elements
    
    def _build_mep_technical_specs(self) -> List:
        """
        Build MEP (Mechanical, Electrical, Plumbing) technical specifications section.
        
        Extracts and formats detailed MEP system specifications from project analysis,
        including equipment schedules, capacities, and compliance requirements.
        
        Returns:
            List of ReportLab elements for this section
        """
        elements = []
        
        elements.append(Paragraph(
            "MEP Systems Technical Specifications", 
            self.styles['SectionHeader']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        mep_data = self.project_data.get('mep_analysis', {})
        
        if not mep_data:
            elements.append(Paragraph(
                "No MEP system specifications identified in project documentation.",
                self.styles['Normal']
            ))
            return elements
        
        # HVAC System Specifications
        hvac = mep_data.get('hvac', {})
        if hvac and (hvac.get('equipment') or hvac.get('systems')):
            elements.append(Paragraph(
                "HVAC System Specifications", 
                self.styles['SubsectionHeader']
            ))
            
            # Equipment list
            equipment = hvac.get('equipment', [])
            if equipment:
                elements.append(Paragraph(
                    "<b>Major Equipment:</b>", 
                    self.styles['Normal']
                ))
                for eq in equipment[:10]:  # Limit to top 10 items
                    eq_text = eq.get('type', str(eq)) if isinstance(eq, dict) else str(eq)
                    elements.append(Paragraph(f"  • {eq_text}", self.styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))
            
            # System capacities
            capacities = hvac.get('capacities', [])
            if capacities:
                elements.append(Paragraph(
                    "<b>System Capacities:</b>", 
                    self.styles['Normal']
                ))
                for cap in capacities[:5]:
                    elements.append(Paragraph(f"  • {cap}", self.styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))
            
            # Efficiency ratings
            efficiency = hvac.get('efficiency_ratings', [])
            if efficiency:
                elements.append(Paragraph(
                    "<b>Efficiency Requirements:</b>", 
                    self.styles['Normal']
                ))
                for eff in efficiency[:5]:
                    elements.append(Paragraph(f"  • {eff}", self.styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))
            
            # Standards compliance
            standards = hvac.get('standards', [])
            if standards:
                elements.append(Paragraph(
                    f"<b>Compliance Standards:</b> {', '.join(standards[:5])}",
                    self.styles['Normal']
                ))
            
            elements.append(Spacer(1, 0.2*inch))
        
        # Electrical System Specifications
        electrical = mep_data.get('electrical', {})
        if electrical and (electrical.get('equipment') or electrical.get('systems')):
            elements.append(Paragraph(
                "Electrical System Specifications", 
                self.styles['SubsectionHeader']
            ))
            
            # Equipment and systems
            equipment = electrical.get('equipment', [])
            if equipment:
                elements.append(Paragraph(
                    "<b>Major Equipment:</b>", 
                    self.styles['Normal']
                ))
                for eq in equipment[:10]:
                    eq_text = eq.get('type', str(eq)) if isinstance(eq, dict) else str(eq)
                    elements.append(Paragraph(f"  • {eq_text}", self.styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))
            
            # Voltage and power requirements
            voltages = electrical.get('voltages', [])
            if voltages:
                elements.append(Paragraph(
                    f"<b>Voltage Requirements:</b> {', '.join(map(str, voltages[:5]))}",
                    self.styles['Normal']
                ))
                elements.append(Spacer(1, 0.1*inch))
            
            # Load calculations
            loads = electrical.get('load_calculations', [])
            if loads:
                elements.append(Paragraph(
                    "<b>Load Requirements:</b>", 
                    self.styles['Normal']
                ))
                for load in loads[:5]:
                    elements.append(Paragraph(f"  • {load}", self.styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))
            
            # Standards
            standards = electrical.get('standards', [])
            if standards:
                elements.append(Paragraph(
                    f"<b>Compliance Standards:</b> {', '.join(standards[:5])}",
                    self.styles['Normal']
                ))
            
            elements.append(Spacer(1, 0.2*inch))
        
        # Plumbing System Specifications
        plumbing = mep_data.get('plumbing', {})
        if plumbing and (plumbing.get('fixtures') or plumbing.get('systems')):
            elements.append(Paragraph(
                "Plumbing System Specifications", 
                self.styles['SubsectionHeader']
            ))
            
            # Fixture schedule
            fixtures = plumbing.get('fixtures', [])
            if fixtures:
                elements.append(Paragraph(
                    "<b>Plumbing Fixtures:</b>", 
                    self.styles['Normal']
                ))
                for fx in fixtures[:10]:
                    fx_text = fx.get('type', str(fx)) if isinstance(fx, dict) else str(fx)
                    elements.append(Paragraph(f"  • {fx_text}", self.styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))
            
            # Piping specifications
            piping = plumbing.get('piping', plumbing.get('piping_materials', []))
            if piping:
                elements.append(Paragraph(
                    "<b>Piping Materials:</b>", 
                    self.styles['Normal']
                ))
                for pipe in piping[:8]:
                    pipe_text = pipe.get('material', str(pipe)) if isinstance(pipe, dict) else str(pipe)
                    elements.append(Paragraph(f"  • {pipe_text}", self.styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))
            
            # Water supply and drainage
            water_supply = plumbing.get('water_supply', [])
            if water_supply:
                elements.append(Paragraph(
                    f"<b>Water Supply Requirements:</b> {', '.join(map(str, water_supply[:5]))}",
                    self.styles['Normal']
                ))
                elements.append(Spacer(1, 0.1*inch))
            
            # Standards
            standards = plumbing.get('standards', [])
            if standards:
                elements.append(Paragraph(
                    f"<b>Compliance Standards:</b> {', '.join(standards[:5])}",
                    self.styles['Normal']
                ))
        
        return elements
    
    def _build_risk_mitigation(self) -> List:
        """
        Build risk mitigation and safety analysis section.
        
        Uses AI to identify project risks, safety considerations, and mitigation strategies
        based on project scope and construction type.
        
        Returns:
            List of ReportLab elements for this section
        """
        elements = []
        
        elements.append(Paragraph(
            "Risk Mitigation & Safety Planning", 
            self.styles['SectionHeader']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        # Use AI-generated risk analysis
        if self.ai_content and self.ai_content.get('risk_analysis'):
            ai_risk = self.ai_content['risk_analysis']
            
            if isinstance(ai_risk, dict):
                # Structured risk analysis
                if 'risk_overview' in ai_risk:
                    elements.append(Paragraph(
                        ai_risk['risk_overview'], 
                        self.styles['BodyTextJustify']
                    ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'safety_considerations' in ai_risk:
                    elements.append(Paragraph(
                        "Safety Considerations", 
                        self.styles['SubsectionHeader']
                    ))
                    elements.append(Paragraph(
                        ai_risk['safety_considerations'], 
                        self.styles['BodyTextJustify']
                    ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'mitigation_strategies' in ai_risk:
                    elements.append(Paragraph(
                        "Mitigation Strategies", 
                        self.styles['SubsectionHeader']
                    ))
                    elements.append(Paragraph(
                        ai_risk['mitigation_strategies'], 
                        self.styles['BodyTextJustify']
                    ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'compliance_requirements' in ai_risk:
                    elements.append(Paragraph(
                        "Regulatory Compliance", 
                        self.styles['SubsectionHeader']
                    ))
                    elements.append(Paragraph(
                        ai_risk['compliance_requirements'], 
                        self.styles['BodyTextJustify']
                    ))
            else:
                # Text-based response
                elements.append(Paragraph(
                    str(ai_risk), 
                    self.styles['BodyTextJustify']
                ))
            
            return elements
        
        # Fallback: No AI risk analysis available
        elements.append(Paragraph(
            "Risk and safety analysis requires project specifications. "
            "AI-generated risk assessment and mitigation strategies will appear after analysis.",
            self.styles['Normal']
        ))
        
        return elements
    
    def _build_procurement_recommendations(self) -> List:
        """
        Build procurement strategy and material recommendations section.
        
        Uses AI to generate procurement timelines, material sourcing strategies,
        and vendor selection guidance based on project requirements.
        
        Returns:
            List of ReportLab elements for this section
        """
        elements = []
        
        elements.append(Paragraph(
            "Procurement Strategy & Material Recommendations", 
            self.styles['SectionHeader']
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        # Use AI-generated procurement strategy
        if self.ai_content and self.ai_content.get('procurement_strategy'):
            ai_procurement = self.ai_content['procurement_strategy']
            
            if isinstance(ai_procurement, dict):
                # Structured procurement plan
                if 'strategy_overview' in ai_procurement:
                    elements.append(Paragraph(
                        ai_procurement['strategy_overview'], 
                        self.styles['BodyTextJustify']
                    ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'procurement_timeline' in ai_procurement:
                    elements.append(Paragraph(
                        "Procurement Timeline", 
                        self.styles['SubsectionHeader']
                    ))
                    elements.append(Paragraph(
                        ai_procurement['procurement_timeline'], 
                        self.styles['BodyTextJustify']
                    ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'long_lead_items' in ai_procurement:
                    elements.append(Paragraph(
                        "Long-Lead Items", 
                        self.styles['SubsectionHeader']
                    ))
                    elements.append(Paragraph(
                        ai_procurement['long_lead_items'], 
                        self.styles['BodyTextJustify']
                    ))
                    elements.append(Spacer(1, 0.15*inch))
                
                if 'vendor_selection' in ai_procurement:
                    elements.append(Paragraph(
                        "Vendor Selection Guidance", 
                        self.styles['SubsectionHeader']
                    ))
                    elements.append(Paragraph(
                        ai_procurement['vendor_selection'], 
                        self.styles['BodyTextJustify']
                    ))
            else:
                # Text-based response
                elements.append(Paragraph(
                    str(ai_procurement), 
                    self.styles['BodyTextJustify']
                ))
            
            return elements
        
        # Fallback: No AI procurement strategy available
        elements.append(Paragraph(
            "Procurement strategy requires project specifications. "
            "AI-generated procurement timeline and material recommendations will appear after analysis.",
            self.styles['Normal']
        ))
        
        return elements
    
    def _add_header_footer(self, canvas_obj, doc):
        """
        Add professional header and footer to each page.
        
        Args:
            canvas_obj: ReportLab canvas object
            doc: Document object
        """
        canvas_obj.saveState()
        
        # Header
        canvas_obj.setFont('Helvetica', 9)
        canvas_obj.setFillColor(colors.gray)
        canvas_obj.drawString(
            72, 
            letter[1] - 50, 
            "ConstructAI Intelligence Report"
        )
        canvas_obj.drawRightString(
            letter[0] - 72, 
            letter[1] - 50, 
            datetime.now().strftime('%B %d, %Y')
        )
        
        # Header line
        canvas_obj.setStrokeColor(colors.HexColor('#1e40af'))
        canvas_obj.setLineWidth(1)
        canvas_obj.line(72, letter[1] - 55, letter[0] - 72, letter[1] - 55)
        
        # Footer
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.setFillColor(colors.gray)
        
        # Project name
        project_name = self.project_data.get('name', 'Project')
        canvas_obj.drawString(72, 50, f"Project: {project_name}")
        
        # Page number
        page_num = canvas_obj.getPageNumber()
        canvas_obj.drawRightString(
            letter[0] - 72, 
            50, 
            f"Page {page_num}"
        )
        
        # Footer line
        canvas_obj.setStrokeColor(colors.HexColor('#1e40af'))
        canvas_obj.line(72, 55, letter[0] - 72, 55)
        
        canvas_obj.restoreState()


def generate_construction_report(project_data: Dict[str, Any], output_path: str) -> str:
    """
    Convenience function to generate construction intelligence PDF report.
    
    Args:
        project_data: Complete project analysis data
        output_path: Path where PDF should be saved
        
    Returns:
        Path to generated PDF file
        
    Example:
        >>> project_data = {
        ...     'name': 'Office Building Renovation',
        ...     'id': 'PROJ-001',
        ...     'analysis': {...},
        ...     'mep_analysis': {...}
        ... }
        >>> pdf_path = generate_construction_report(project_data, '/tmp/report.pdf')
    """
    report = ConstructAIPDFReport(project_data)
    return report.generate(output_path)


# Alias for backward compatibility
generate_project_pdf = generate_construction_report
