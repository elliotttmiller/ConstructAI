"""
Professional PDF Report Generation for ConstructAI.

Generates comprehensive, industry-standard construction project analysis reports
with proper formatting, charts, and professional layouts.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import io
import os

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        PageBreak, Image, KeepTogether
    )
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class ConstructAIPDFReport:
    """
    Professional PDF report generator for construction project analysis.
    
    Creates comprehensive reports with:
    - Executive summary
    - Document quality metrics
    - MEP systems analysis
    - Industry standards compliance
    - Critical requirements
    - Recommendations
    """
    
    def __init__(self, project_data: Dict[str, Any]):
        """
        Initialize PDF report generator.
        
        Args:
            project_data: Complete project analysis data including metadata,
                         analysis results, MEP data, and recommendations
        """
        if not REPORTLAB_AVAILABLE:
            raise ImportError("reportlab is required for PDF generation. Install with: pip install reportlab")
        
        self.project_data = project_data
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Configure custom paragraph styles for professional formatting."""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Section header
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Subsection header
        self.styles.add(ParagraphStyle(
            name='SubsectionHeader',
            parent=self.styles['Heading3'],
            fontSize=14,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=10,
            fontName='Helvetica-Bold'
        ))
        
        # Body text
        self.styles.add(ParagraphStyle(
            name='BodyTextJustify',
            parent=self.styles['BodyText'],
            fontSize=10,
            alignment=TA_JUSTIFY,
            spaceAfter=6
        ))
        
        # Metric value (large numbers)
        self.styles.add(ParagraphStyle(
            name='MetricValue',
            parent=self.styles['Normal'],
            fontSize=36,
            textColor=colors.HexColor('#4f46e5'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Metric label
        self.styles.add(ParagraphStyle(
            name='MetricLabel',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.gray,
            alignment=TA_CENTER
        ))
    
    def generate(self, output_path: str) -> str:
        """
        Generate complete PDF report.
        
        Args:
            output_path: File path where PDF will be saved
            
        Returns:
            Path to generated PDF file
        """
        # Create document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        # Build content
        story = []
        
        # Cover page
        story.extend(self._build_cover_page())
        story.append(PageBreak())
        
        # Executive summary
        story.extend(self._build_executive_summary())
        story.append(PageBreak())
        
        # Document quality analysis
        story.extend(self._build_quality_analysis())
        story.append(Spacer(1, 0.3*inch))
        
        # MEP systems analysis
        if self.project_data.get('mep_analysis'):
            story.extend(self._build_mep_analysis())
            story.append(Spacer(1, 0.3*inch))
        
        # Industry standards & compliance
        story.extend(self._build_standards_section())
        story.append(PageBreak())
        
        # Critical requirements
        story.extend(self._build_critical_requirements())
        story.append(Spacer(1, 0.3*inch))
        
        # Recommendations
        story.extend(self._build_recommendations())
        
        # Build PDF
        doc.build(story, onFirstPage=self._add_header_footer, onLaterPages=self._add_header_footer)
        
        return output_path
    
    def _build_cover_page(self) -> List:
        """Build cover page elements."""
        elements = []
        
        # Title
        elements.append(Spacer(1, 2*inch))
        elements.append(Paragraph("ConstructAI", self.styles['CustomTitle']))
        elements.append(Paragraph("Project Analysis Report", self.styles['Heading2']))
        elements.append(Spacer(1, 0.5*inch))
        
        # Project info
        project_name = self.project_data.get('name', 'Unnamed Project')
        project_id = self.project_data.get('id', 'N/A')
        
        elements.append(Paragraph(f"<b>Project:</b> {project_name}", self.styles['Normal']))
        elements.append(Paragraph(f"<b>Project ID:</b> {project_id}", self.styles['Normal']))
        elements.append(Paragraph(
            f"<b>Report Generated:</b> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
            self.styles['Normal']
        ))
        
        elements.append(Spacer(1, 1*inch))
        
        # Summary box
        summary_text = """
        This report provides a comprehensive analysis of your construction project documentation,
        including document quality metrics, MEP systems analysis, industry standards compliance,
        and actionable recommendations for project optimization.
        """
        elements.append(Paragraph(summary_text, self.styles['BodyTextJustify']))
        
        return elements
    
    def _build_executive_summary(self) -> List:
        """Build executive summary section."""
        elements = []
        
        elements.append(Paragraph("Executive Summary", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        analysis = self.project_data.get('analysis', {})
        quality = analysis.get('quality', {})
        
        # Key metrics table
        data = [
            ['Metric', 'Value'],
            ['Completeness Score', f"{quality.get('completeness_score', 0)}%"],
            ['Sections Analyzed', str(quality.get('sections_count', 0))],
            ['Clauses Extracted', str(quality.get('total_clauses', 0))],
            ['MasterFormat Divisions', str(quality.get('masterformat_divisions', 0))],
            ['Industry Standards Found', str(len(analysis.get('standards_found', [])))],
        ]
        
        table = Table(data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')])
        ]))
        
        elements.append(table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Overall assessment
        completeness = quality.get('completeness_score', 0)
        if completeness >= 90:
            assessment = "Excellent - Documentation is comprehensive and well-structured."
        elif completeness >= 75:
            assessment = "Good - Documentation is adequate with minor gaps."
        elif completeness >= 60:
            assessment = "Fair - Some important sections may be missing or incomplete."
        else:
            assessment = "Needs Improvement - Significant gaps in documentation detected."
        
        elements.append(Paragraph(f"<b>Overall Assessment:</b> {assessment}", self.styles['BodyTextJustify']))
        
        return elements
    
    def _build_quality_analysis(self) -> List:
        """Build document quality analysis section."""
        elements = []
        
        elements.append(Paragraph("Document Quality Analysis", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        analysis = self.project_data.get('analysis', {})
        quality = analysis.get('quality', {})
        
        # MasterFormat coverage
        elements.append(Paragraph("MasterFormat Coverage", self.styles['SubsectionHeader']))
        
        masterformat_coverage = quality.get('masterformat_coverage', {})
        if masterformat_coverage:
            coverage_data = [['Division', 'Section Count']]
            for division, count in sorted(masterformat_coverage.items()):
                coverage_data.append([f"Division {division}", str(count)])
            
            if len(coverage_data) > 1:
                table = Table(coverage_data, colWidths=[2*inch, 1.5*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')])
                ]))
                elements.append(table)
            else:
                elements.append(Paragraph("No MasterFormat coverage data available.", self.styles['Normal']))
        else:
            elements.append(Paragraph("No MasterFormat divisions detected in this document.", self.styles['Normal']))
        
        elements.append(Spacer(1, 0.2*inch))
        
        # Key materials
        materials = analysis.get('key_materials', [])
        if materials:
            elements.append(Paragraph("Key Materials Identified", self.styles['SubsectionHeader']))
            materials_text = ", ".join(materials[:15])  # Limit to first 15
            elements.append(Paragraph(materials_text, self.styles['Normal']))
        else:
            elements.append(Paragraph("Key Materials Identified", self.styles['SubsectionHeader']))
            elements.append(Paragraph("No materials data available. Upload and analyze documents to see material specifications.", self.styles['Normal']))
        
        return elements
    
    def _build_mep_analysis(self) -> List:
        """Build MEP systems analysis section."""
        elements = []
        
        elements.append(Paragraph("MEP Systems Analysis", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        mep_data = self.project_data.get('mep_analysis', {})
        
        # HVAC Systems
        hvac = mep_data.get('hvac', {})
        if hvac and hvac.get('equipment'):
            elements.append(Paragraph("HVAC Systems", self.styles['SubsectionHeader']))
            
            # Extract equipment names from dicts or use strings directly
            equipment_list = hvac.get('equipment', [])
            equipment_names = [
                eq.get('type', str(eq)) if isinstance(eq, dict) else str(eq)
                for eq in equipment_list
            ]
            
            hvac_text = f"<b>Completion:</b> {hvac.get('completion_percentage', 0)}%<br/>"
            hvac_text += f"<b>Equipment:</b> {', '.join(equipment_names)}<br/>"
            
            # Use 'standards' instead of 'standards_compliance'
            standards = hvac.get('standards', hvac.get('standards_compliance', []))
            if standards:
                hvac_text += f"<b>Standards:</b> {', '.join(standards)}"
            
            elements.append(Paragraph(hvac_text, self.styles['Normal']))
            elements.append(Spacer(1, 0.15*inch))
        
        # Plumbing Systems
        plumbing = mep_data.get('plumbing', {})
        if plumbing and plumbing.get('fixtures'):
            elements.append(Paragraph("Plumbing Systems", self.styles['SubsectionHeader']))
            
            # Extract fixture names from dicts or use strings directly
            fixtures_list = plumbing.get('fixtures', [])
            fixture_names = [
                fx.get('type', str(fx)) if isinstance(fx, dict) else str(fx)
                for fx in fixtures_list
            ]
            
            plumbing_text = f"<b>Completion:</b> {plumbing.get('completion_percentage', 0)}%<br/>"
            plumbing_text += f"<b>Fixtures:</b> {', '.join(fixture_names)}<br/>"
            
            # Extract piping materials (could be dicts or strings)
            piping = plumbing.get('piping', plumbing.get('piping_materials', []))
            if piping:
                piping_names = [
                    p.get('material', str(p)) if isinstance(p, dict) else str(p)
                    for p in piping
                ]
                plumbing_text += f"<b>Piping:</b> {', '.join(piping_names)}<br/>"
            
            # Use 'standards' instead of 'standards_compliance'
            standards = plumbing.get('standards', plumbing.get('standards_compliance', []))
            if standards:
                plumbing_text += f"<b>Standards:</b> {', '.join(standards)}"
            
            elements.append(Paragraph(plumbing_text, self.styles['Normal']))
        
        return elements
    
    def _build_standards_section(self) -> List:
        """Build industry standards and compliance section."""
        elements = []
        
        elements.append(Paragraph("Industry Standards & Compliance", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        analysis = self.project_data.get('analysis', {})
        standards = analysis.get('standards_found', [])
        
        if standards:
            elements.append(Paragraph(
                f"The following industry standards were referenced in the project documentation:",
                self.styles['Normal']
            ))
            elements.append(Spacer(1, 0.1*inch))
            
            for standard in standards:
                elements.append(Paragraph(f"• {standard}", self.styles['Normal']))
            
            elements.append(Spacer(1, 0.2*inch))
            elements.append(Paragraph(
                "<b>Compliance Assessment:</b> Document references appropriate industry standards. "
                "Ensure all specifications align with latest code versions.",
                self.styles['BodyTextJustify']
            ))
        else:
            elements.append(Paragraph(
                "No specific industry standards were explicitly referenced in the analyzed documentation. "
                "Consider adding standard references (ASTM, ASHRAE, IBC, etc.) to ensure compliance.",
                self.styles['BodyTextJustify']
            ))
        
        return elements
    
    def _build_critical_requirements(self) -> List:
        """Build critical requirements section."""
        elements = []
        
        elements.append(Paragraph("Critical Requirements", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        analysis = self.project_data.get('analysis', {})
        critical_items = analysis.get('critical_requirements', [])
        
        if critical_items:
            for i, item in enumerate(critical_items, 1):
                severity = item.get('severity', 'MEDIUM')
                color = colors.HexColor('#dc2626') if severity == 'HIGH' else colors.HexColor('#f59e0b')
                
                item_text = f"<b>{i}. [{severity}]</b> {item.get('description', '')}"
                elements.append(Paragraph(item_text, self.styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))
        else:
            elements.append(Paragraph(
                "No critical requirements were flagged in this analysis. Standard project requirements apply.",
                self.styles['Normal']
            ))
        
        return elements
    
    def _build_recommendations(self) -> List:
        """Build recommendations section."""
        elements = []
        
        elements.append(Paragraph("Recommendations", self.styles['SectionHeader']))
        elements.append(Spacer(1, 0.2*inch))
        
        analysis = self.project_data.get('analysis', {})
        recommendations = analysis.get('recommendations', [])
        
        if recommendations:
            for i, rec in enumerate(recommendations, 1):
                priority = rec.get('priority', 'LOW')
                category = rec.get('category', 'General')
                description = rec.get('description', '')
                
                rec_text = f"<b>{i}. [{priority}] {category}</b><br/>{description}"
                elements.append(Paragraph(rec_text, self.styles['Normal']))
                elements.append(Spacer(1, 0.15*inch))
        else:
            elements.append(Paragraph(
                "Documentation appears comprehensive. Continue with standard project execution procedures.",
                self.styles['Normal']
            ))
        
        return elements
    
    def _add_header_footer(self, canvas_obj, doc):
        """Add header and footer to each page."""
        canvas_obj.saveState()
        
        # Header
        canvas_obj.setFont('Helvetica', 9)
        canvas_obj.setFillColor(colors.gray)
        canvas_obj.drawString(72, letter[1] - 50, "ConstructAI Project Analysis Report")
        canvas_obj.drawRightString(letter[0] - 72, letter[1] - 50, 
                                   datetime.now().strftime('%B %d, %Y'))
        
        # Header line
        canvas_obj.setStrokeColor(colors.HexColor('#1e40af'))
        canvas_obj.setLineWidth(2)
        canvas_obj.line(72, letter[1] - 55, letter[0] - 72, letter[1] - 55)
        
        # Footer
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.drawCentredString(letter[0] / 2, 50, f"Page {doc.page}")
        canvas_obj.drawString(72, 35, "Generated by ConstructAI")
        canvas_obj.drawRightString(letter[0] - 72, 35, "www.constructai.com")
        
        canvas_obj.restoreState()


def generate_project_pdf(project_data: Dict[str, Any], output_path: str) -> str:
    """
    Generate a comprehensive PDF report for a construction project.
    
    Args:
        project_data: Complete project analysis data
        output_path: Path where PDF will be saved
        
    Returns:
        Path to generated PDF file
        
    Raises:
        ImportError: If reportlab is not installed
        ValueError: If project_data is invalid
    """
    if not REPORTLAB_AVAILABLE:
        raise ImportError("reportlab package required. Install with: pip install reportlab")
    
    if not project_data:
        raise ValueError("project_data cannot be empty")
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Generate report
    report = ConstructAIPDFReport(project_data)
    return report.generate(output_path)
