"""
AI-Powered Construction Intelligence Report Generator for ConstructAI.

This module generates comprehensive, actionable construction insights and execution strategies
using advanced AI analysis and construction industry best practices.

Report Sections:
- Project Intelligence & Scope Analysis
- Construction Execution Strategy
- Cost Breakdown & Resource Planning
- Risk Mitigation & Safety Analysis
- MEP Systems Technical Specifications
- Procurement & Material Recommendations

All content is dynamically generated using AI analysis - no hardcoded or mock responses.
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
        
        # Initialize AI-powered content generation
        self.ai_content = None
        self.ai_generator = None
        
        try:
            from ..ai.analysis_generator import ConstructionAnalysisGenerator
            self.ai_generator = ConstructionAnalysisGenerator()
            self._generate_ai_content()
            logger.info("AI content generator initialized successfully")
        except Exception as e:
            logger.warning(f"AI generator initialization failed: {e}", exc_info=True)
    
    def _generate_ai_content(self):
        """
        Generate all AI-powered content sections for the report.
        
        This method calls the AI generator for each report section to ensure
        all content is dynamically created based on actual project analysis.
        No hardcoded or mock content is used.
        """
        if not self.ai_generator:
            logger.warning("AI generator not available, content generation skipped")
            return
        
        try:
            analysis = self.project_data.get('analysis', {})
            quality = analysis.get('quality', {})
            
            # Prepare comprehensive analysis data for AI
            analysis_results = {
                "divisions_summary": quality.get('masterformat_coverage', {}),
                "materials": analysis.get('key_materials', []),
                "standards": analysis.get('standards_found', []),
                "clauses_count": quality.get('total_clauses', 0),
                "completeness_score": quality.get('completeness_score', 0),
                "sections_count": quality.get('sections_count', 0),
                "mep_analysis": self.project_data.get('mep_analysis', {})
            }
            
            # Generate all AI content sections
            self.ai_content = {
                "project_intelligence": self.ai_generator.generate_project_intelligence(
                    self.project_data, 
                    analysis_results
                ),
                "execution_strategy": self.ai_generator.generate_execution_strategy(
                    self.project_data, 
                    analysis_results
                ),
                "cost_resource_analysis": self.ai_generator.generate_cost_resource_analysis(
                    self.project_data, 
                    analysis_results
                ),
                "risk_analysis": self.ai_generator.generate_risk_analysis(
                    self.project_data, 
                    analysis_results
                ),
                "procurement_strategy": self.ai_generator.generate_procurement_strategy(
                    self.project_data, 
                    analysis_results
                )
            }
            
            logger.info("AI content generated successfully for all report sections")
            
        except Exception as e:
            logger.error(f"Failed to generate AI content: {e}", exc_info=True)
            self.ai_content = None
    
    def _setup_custom_styles(self):
        """Configure professional paragraph styles for construction industry reports."""
        
        # Main title - Bold, professional blue
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Section headers - Construction industry standard
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Subsection headers
        self.styles.add(ParagraphStyle(
            name='SubsectionHeader',
            parent=self.styles['Heading3'],
            fontSize=14,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=10,
            fontName='Helvetica-Bold'
        ))
        
        # Body text - Justified for professional appearance
        self.styles.add(ParagraphStyle(
            name='BodyTextJustify',
            parent=self.styles['BodyText'],
            fontSize=10,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
            leading=14
        ))
        
        # Metric values - Large, prominent numbers
        self.styles.add(ParagraphStyle(
            name='MetricValue',
            parent=self.styles['Normal'],
            fontSize=36,
            textColor=colors.HexColor('#4f46e5'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Metric labels
        self.styles.add(ParagraphStyle(
            name='MetricLabel',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.gray,
            alignment=TA_CENTER
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
            
            # Section 1: Project Intelligence & Scope Analysis
            story.extend(self._build_project_intelligence())
            story.append(Spacer(1, 0.3*inch))
            
            # Section 2: Construction Execution Strategy
            story.extend(self._build_execution_strategy())
            story.append(PageBreak())
            
            # Section 3: Cost & Resource Analysis
            story.extend(self._build_cost_resource_analysis())
            story.append(Spacer(1, 0.3*inch))
            
            # Section 4: MEP Technical Specifications (if applicable)
            if self.project_data.get('mep_analysis'):
                story.extend(self._build_mep_technical_specs())
                story.append(PageBreak())
            
            # Section 5: Risk Mitigation & Safety
            story.extend(self._build_risk_mitigation())
            story.append(Spacer(1, 0.3*inch))
            
            # Section 6: Procurement & Material Strategy
            story.extend(self._build_procurement_recommendations())
            
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
