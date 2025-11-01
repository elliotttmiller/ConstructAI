"""
Comprehensive example demonstrating all ConstructAI features.

This example shows:
1. Document ingestion and parsing
2. MasterFormat classification
3. Clause extraction with NER
4. Ambiguity analysis
5. Graph database storage
6. Project auditing and optimization
"""

from pathlib import Path
from datetime import datetime, timedelta
import json

# Document processing
from constructai.document_processing import DocumentIngestor, DocumentParser, MasterFormatClassifier

# NLP and analysis
from constructai.nlp import ClauseExtractor, ConstructionNER, AmbiguityAnalyzer

# Graph database
from constructai.graph_db import ClauseGraphDB

# Core engine
from constructai.models.project import Project, Task, Resource, ResourceType
from constructai.engine.auditor import ProjectAuditor
from constructai.engine.optimizer import WorkflowOptimizer


def create_sample_specification():
    """Create a sample specification document."""
    spec_text = """
DIVISION 03 - CONCRETE
SECTION 03 30 00 - CAST-IN-PLACE CONCRETE

1.1 GENERAL
A. Work Included: This section includes cast-in-place concrete for the following:
   1. Building foundations
   2. Building slabs-on-grade
   3. Building structural walls

1.2 QUALITY ASSURANCE
A. Concrete shall have a minimum compressive strength of 5,000 psi at 28 days.
B. Concrete shall comply with ASTM C94 for ready-mixed concrete.
C. Use high-quality aggregate meeting ASTM C33 requirements.

1.3 SUBMITTALS
A. Submit shop drawings prior to fabrication.
B. Provide mix designs for approval before concrete placement.

2.1 MATERIALS
A. Cement: Portland cement conforming to ASTM C150, Type II.
B. Reinforcing Steel: Deformed bars conforming to ASTM A615, Grade 60.
C. Water: Clean and suitable for drinking.

2.2 EXECUTION
A. Install concrete as specified and per approved shop drawings.
B. Concrete shall be placed within ambient temperature range of 50°F to 90°F.
C. Provide adequate curing for minimum 7 days.
"""
    return spec_text


def main():
    """Run comprehensive demonstration."""
    print("\n" + "="*80)
    print("CONSTRUCTAI - COMPREHENSIVE FEATURE DEMONSTRATION")
    print("="*80 + "\n")
    
    # Create sample specification
    spec_text = create_sample_specification()
    
    # Save to temporary file
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write(spec_text)
        spec_file = f.name
    
    try:
        # ===== MODULE 1: Document Ingestion =====
        print("MODULE 1: DOCUMENT INGESTION & PARSING")
        print("-" * 80)
        
        ingestor = DocumentIngestor()
        ingested_doc = ingestor.ingest_document(spec_file)
        print(f"✓ Document ingested: {ingested_doc['file_name']}")
        print(f"  Type: {ingested_doc['document_type']}")
        print(f"  Format: {ingested_doc['format']}")
        print(f"  Size: {ingested_doc['metadata']['size_bytes']} bytes")
        
        # Parse document structure
        parser = DocumentParser()
        parsed_doc = parser.parse(ingested_doc['content'])
        print(f"\n✓ Document parsed:")
        print(f"  Sections: {parsed_doc['total_sections']}")
        print(f"  Lines: {parsed_doc['line_count']}")
        
        # MasterFormat classification
        masterformat = MasterFormatClassifier()
        classification = masterformat.classify(ingested_doc['content'])
        print(f"\n✓ MasterFormat Classification:")
        for cls in classification[:2]:
            print(f"  Division {cls['division']}: {cls['name']} ({cls['confidence']:.0%})")
        
        # ===== MODULE 2: Clause Extraction & NER =====
        print("\n\nMODULE 2: CLAUSE EXTRACTION & NER")
        print("-" * 80)
        
        extractor = ClauseExtractor()
        clauses = extractor.extract_clauses(ingested_doc['content'])
        print(f"✓ Extracted {len(clauses)} specification clauses")
        
        # Show sample clauses
        print(f"\nSample clauses:")
        for i, clause in enumerate(clauses[:3], 1):
            print(f"\n  {i}. [{clause.clause_type}]")
            print(f"     {clause.text[:80]}...")
        
        # NER Analysis
        ner = ConstructionNER()
        print(f"\n✓ Named Entity Recognition:")
        
        sample_clause = clauses[0] if clauses else None
        if sample_clause:
            entities = ner.extract_entities(sample_clause.text)
            print(f"  Materials: {len(entities['materials'])}")
            print(f"  Standards: {len(entities['standards'])}")
            print(f"  Performance: {len(entities['performance'])}")
            
            if entities['standards']:
                print(f"\n  Sample standards found:")
                for std in entities['standards'][:3]:
                    print(f"    - {std.text}")
        
        # ===== MODULE 3: Ambiguity Analysis =====
        print("\n\nMODULE 3: CLARITY & AMBIGUITY ANALYSIS")
        print("-" * 80)
        
        analyzer = AmbiguityAnalyzer()
        ambiguous_count = 0
        
        for clause in clauses[:5]:
            analysis = analyzer.analyze(clause.text)
            if analysis['is_ambiguous']:
                ambiguous_count += 1
                print(f"\n✗ Ambiguous clause found:")
                print(f"  Clarity Score: {analysis['clarity_score']}/100")
                print(f"  Issues: {analysis['issue_count']}")
                for issue in analysis['issues'][:2]:
                    print(f"    - {issue['message']}")
        
        if ambiguous_count == 0:
            print("✓ No ambiguous clauses found in sample")
        
        # ===== MODULE 4: Graph Database =====
        print("\n\nMODULE 4: GRAPH DATABASE")
        print("-" * 80)
        
        graph_db = ClauseGraphDB(use_neo4j=False)  # Using in-memory storage
        print("✓ Graph database initialized (in-memory mode)")
        
        # Add clauses to graph
        for clause in clauses[:10]:
            graph_db.add_clause(clause.clause_id, clause.to_dict())
        
        print(f"✓ Added {min(10, len(clauses))} clauses to graph database")
        
        # Add sample relationships
        if len(clauses) >= 2:
            graph_db.add_relationship(
                clauses[0].clause_id,
                clauses[1].clause_id,
                "references",
                {"description": "Quality assurance reference"}
            )
            print(f"✓ Added sample relationship between clauses")
        
        # ===== INTEGRATION: Project Auditing & Optimization =====
        print("\n\nINTEGRATION: PROJECT AUDITING & OPTIMIZATION")
        print("-" * 80)
        
        # Create project from specifications
        project = Project(
            id="integrated-001",
            name="Building Construction from Specifications",
            description="Project created from parsed specifications",
            budget=2000000,
            start_date=datetime.now(),
            target_end_date=datetime.now() + timedelta(days=180)
        )
        
        # Add tasks based on specification sections
        project.add_task(Task(
            id="T001",
            name="Concrete Foundation",
            description="Cast-in-place concrete foundation per ASTM C94",
            duration_days=15,
            resources=[
                Resource("R001", "Concrete Crew", ResourceType.LABOR, 8, "workers", 950),
                Resource("R002", "Concrete 5000psi", ResourceType.MATERIAL, 100, "cubic yards", 150),
            ],
            compliance_requirements=["ASTM C94", "ASTM C150", "Quality testing"]
        ))
        
        project.add_task(Task(
            id="T002",
            name="Structural Walls",
            description="Cast-in-place structural walls",
            duration_days=20,
            dependencies=["T001"],
            resources=[
                Resource("R003", "Concrete Crew", ResourceType.LABOR, 10, "workers", 950),
                Resource("R004", "Rebar ASTM A615", ResourceType.MATERIAL, 5000, "lbs", 0.85),
            ]
        ))
        
        print(f"✓ Created project: {project.name}")
        print(f"  Tasks: {len(project.tasks)}")
        print(f"  Budget: ${project.budget:,.2f}")
        
        # Run audit
        print("\n✓ Running project audit...")
        auditor = ProjectAuditor()
        audit_result = auditor.audit(project)
        print(f"  Audit Score: {audit_result.overall_score}/100")
        print(f"  Risks: {len(audit_result.risks)}")
        print(f"  Compliance Issues: {len(audit_result.compliance_issues)}")
        
        # Run optimization
        print("\n✓ Running workflow optimization...")
        optimizer = WorkflowOptimizer()
        opt_result = optimizer.optimize(project)
        metrics = opt_result.metrics_comparison
        print(f"  Duration Reduction: {metrics['improvements']['duration_reduction_days']:.1f} days")
        print(f"  Cost Savings: ${metrics['improvements']['cost_savings']:,.2f}")
        
        # ===== SUMMARY =====
        print("\n\n" + "="*80)
        print("ANALYSIS COMPLETE - SUMMARY")
        print("="*80)
        
        summary = {
            "document_analysis": {
                "sections": parsed_doc['total_sections'],
                "clauses": len(clauses),
                "divisions_classified": len(classification),
                "ambiguous_clauses": ambiguous_count
            },
            "entity_extraction": {
                "total_entities": sum(len(v) for entities in [ner.extract_entities(c.text) for c in clauses[:5]] for v in entities.values()),
                "standards_referenced": sum(len(ner.extract_entities(c.text)['standards']) for c in clauses[:5])
            },
            "project_integration": {
                "audit_score": audit_result.overall_score,
                "optimization_savings": metrics['improvements']['cost_savings'],
                "schedule_improvement": metrics['improvements']['duration_reduction_days']
            }
        }
        
        print("\n📊 Document Analysis:")
        print(f"   • {summary['document_analysis']['sections']} sections parsed")
        print(f"   • {summary['document_analysis']['clauses']} specification clauses extracted")
        print(f"   • {summary['document_analysis']['ambiguous_clauses']} ambiguous clauses flagged")
        
        print("\n🔍 Entity Extraction:")
        print(f"   • {summary['entity_extraction']['total_entities']} construction entities identified")
        print(f"   • {summary['entity_extraction']['standards_referenced']} industry standards referenced")
        
        print("\n🎯 Project Integration:")
        print(f"   • Audit Score: {summary['project_integration']['audit_score']}/100")
        print(f"   • Cost Savings: ${summary['project_integration']['optimization_savings']:,.2f}")
        print(f"   • Schedule Improvement: {summary['project_integration']['schedule_improvement']:.1f} days")
        
        print("\n✅ All modules successfully integrated and demonstrated!")
        
    finally:
        # Clean up
        import os
        if os.path.exists(spec_file):
            os.unlink(spec_file)
        graph_db.close()


if __name__ == "__main__":
    main()
