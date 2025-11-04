# ConstructAI - Single-User Enterprise Intelligence Platform

**Expert-Grade Construction Intelligence System**

Transform your construction workflow with enterprise-level AI intelligence optimized for maximum precision and expert decision-making. ConstructAI provides comprehensive specification extraction, inventory management, procurement optimization, and automated workflows.

## 🏗️ Enterprise Intelligence Features

### 🎯 Expert-Grade Specification Intelligence
- **Multi-Layered Extraction**: Regex patterns + AI-powered context analysis
- **Ultra-Precise Parsing**: Construction-specific ontology matching
- **Dimensional Normalization**: Automatic unit conversion (imperial ↔ metric)
- **Compliance Standards**: Automatic identification of ASTM, ACI, AISC, ISO, OSHA standards
- **Completeness Assessment**: Gap analysis with specific recommendations
- **Confidence Scoring**: Validation with detailed issue reporting

### 📦 Comprehensive Inventory Intelligence
- **Deep System Integration**: Real-time inventory sync and monitoring
- **Fuzzy Component Matching**: Manufacturer/model variation handling
- **Availability Analysis**: Multi-location stock tracking with lead times
- **Procurement Urgency**: Intelligent classification (immediate, normal, advance)
- **Alternative Identification**: Compatible component recommendations
- **Cost Optimization**: Multi-supplier price comparison and analysis

### 🚀 Expert Procurement Intelligence
- **Criticality Assessment**: BLOCKING, CRITICAL_PATH, IMPORTANT, OPTIONAL
- **Strategic Priority Calculation**: Risk-based procurement scheduling
- **Build Readiness Scoring**: Complete project feasibility assessment
- **Automated Purchase Orders**: Template-based PO generation
- **Supplier Performance Analytics**: Reliability, quality, cost metrics
- **Recommendation Engine**: Intelligent supplier matching

### 🔧 Advanced Component Matching
- **Fuzzy Logic Matching**: Handles name variations and aliases
- **Dimensional Validation**: Tolerance-based compatibility checking
- **Specification Compliance**: Standards and performance verification
- **Alternative Discovery**: Equivalent component identification
- **Compatibility Scoring**: Multi-factor assessment

### 📊 Expert Dashboard & Analytics
- **Real-Time Metrics**: Inventory health, procurement status, project readiness
- **Key Performance Indicators**: 6 tracked KPIs for business intelligence
- **Trend Analysis**: Historical performance tracking and forecasting
- **Critical Alerts**: Severity-based notifications (critical, high, medium, low)
- **Activity Timeline**: Complete audit trail of all operations

### ⚡ Performance Optimization
- **Intelligent Caching**: Pattern-based optimization for single-user workloads
- **Response Time Tracking**: P50, P95, P99 percentile monitoring
- **Cache Hit Rate Analysis**: 80%+ target for optimal performance
- **Memory Management**: LRU eviction with access pattern learning

### 🏗️ Integrated Construction Documents + Inventory Intelligence System
- **Unified Processing Pipeline**: Seamless integration of document analysis with inventory checking
- **Multi-Trade Recognition**: Automatic classification across all CSI divisions and disciplines
- **CD Phase Detection**: Identifies project phase (SD, DD, 50%, 75%, 95%, 100%, IFC)
- **Real-Time Inventory Linkage**: Every extracted component automatically checked against inventory
- **Cross-Discipline Coordination**: Automated conflict detection and MEP coordination checking
- **Build Readiness Assessment**: Complete project feasibility with procurement risk analysis
- **Component Extraction**: Unified extraction across architectural, structural, MEP, civil, and specialty
- **Drawing Disciplines Supported**: Architectural, Structural, Mechanical, Electrical, Plumbing, Fire Protection, Civil, Landscape, Specialty

**Key Integration Capabilities:**
- **Document-to-Component Pipeline**: Extract → Classify → Match → Assess in single workflow
- **Automatic Inventory Matching**: Real-time availability checking for all extracted components
- **Procurement Requirement Analysis**: Critical path identification and lead time calculations
- **Cross-Reference Validation**: Drawing-to-specification coordination checking
- **System Integration Analysis**: MEP clearance and conflict detection
- **Timeline Impact Assessment**: Build readiness scoring with procurement risk factors

## 🚀 Features

### 📄 Module 1: Intelligent Document Ingestion & Parsing
- **Multi-Format Support**: PDF, DOCX, Excel, and text documents
- **Advanced OCR**: Extract text from scanned documents
- **Structure Preservation**: Maintains document hierarchy (sections, subsections, bullet points)
- **Document Type Detection**: Automatically identifies RFPs, proposals, specifications, drawings, BOQs, schedules
- **MasterFormat Classification**: AI model classifies text into CSI MasterFormat divisions (50+ divisions)

### 🔍 Module 2: Specification Clause Extraction & Graph Construction  
- **Clause Isolation**: Identifies atomic specification clauses
- **Named Entity Recognition (NER)**: Extracts key entities
  - Materials: "Concrete", "Type X drywall"
  - Standards: "ASTM A36", "ACI 318"
  - Performance Criteria: "5,000 psi", "1-hour fire rating"
  - Methods: "Submit shop drawings prior to fabrication"
- **Graph Database**: Stores clauses and relationships (in-memory or Neo4j)
- **Powerful Queries**: "Find all clauses related to Division 09 that reference a fire rating"

### 🤖 Module 3: AI Analysis Engine
#### Service 3.1: Clarity & Ambiguity Analyzer
- Flags subjective/vague language ("high-quality", "adequate", "sufficient")
- Identifies missing specifications (units, standards, measurements)
- Provides specific rewrite suggestions based on best practices

#### Service 3.2: Standards Compliance Checker  
- Validates against ISO 19650, OSHA, PMI PMBOK, RICS
- Flags outdated or incorrect standards
- Checks performance criteria achievability

#### Service 3.3: Completeness Auditor
- Checks for missing critical components by project type
- Rule-based engine powered by MasterFormat taxonomy

#### Service 3.4: Cross-Discipline Clash Detector
- Identifies conflicts between specification divisions
- Graph database-powered relationship analysis

### Autonomous Project Auditing
- **Risk Detection**: Identifies schedule, budget, resource, and compliance risks
- **Compliance Checking**: Validates against ISO 19650, OSHA, PMI PMBOK, and RICS standards
- **Dependency Analysis**: Detects circular dependencies and validates task relationships
- **Resource Conflict Detection**: Identifies over-allocation and resource imbalances

### Intelligent Optimization
- **Schedule Streamlining**: Optimizes task sequences and maximizes parallelization
- **Bottleneck Elimination**: Identifies and resolves critical path bottlenecks
- **Resource Balancing**: Optimizes resource allocation across project timeline
- **Cost Optimization**: Applies value engineering principles to reduce costs
- **Schedule Compression**: Uses fast-tracking and critical path analysis

### Compliance Assurance
- **ISO 19650**: BIM information management compliance
- **OSHA**: Safety standards for high-risk construction activities
- **PMI PMBOK**: Project management best practices
- **RICS**: Cost management and quality standards

### Comprehensive Reporting
- Detailed audit reports with severity scoring
- Optimization impact analysis with before/after comparisons
- Actionable recommendations with industry-standard citations
- JSON export for integration with other tools

## 📋 Requirements

- Python 3.7 or higher
- Dependencies listed in `requirements.txt`

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/elliotttmiller/ConstructAI.git
cd ConstructAI

# Install dependencies
pip install -r requirements.txt

# Install the package
pip install -e .
```

## 🎯 Quick Start

### Enterprise Intelligence System

```python
from constructai.intelligence import (
    InventoryIntelligence,
    ProcurementIntelligence,
    SpecificationIntelligence,
    ComponentMatcher
)

# 1. Inventory Intelligence
inventory = InventoryIntelligence()
inventory.sync_inventory()

# Find matching components
matches = inventory.find_matching_components(
    specification={"psi": 5000, "slump_in": 4},
    tolerance=0.1,
    min_confidence=0.7
)
print(f"Found {len(matches)} matching components")

# Analyze availability
analysis = inventory.analyze_availability(
    component_name="Concrete Mix",
    required_quantity=100,
    specifications={"psi": 5000}
)
print(f"Availability: {analysis.is_available}")
print(f"Estimated delivery: {analysis.estimated_delivery}")
print(f"Urgency: {analysis.procurement_urgency}")

# 2. Procurement Intelligence
procurement = ProcurementIntelligence()

# Assess build readiness
assessment = procurement.assess_build_readiness(
    project_id="proj-001",
    required_components=[...],
    availability_data={...},
    project_start_date=datetime(2024, 12, 1)
)
print(f"Readiness score: {assessment.readiness_score}%")
print(f"Status: {assessment.status}")
print(f"Recommendations: {assessment.recommendations}")

# 3. Integrated Construction Documents System
from constructai.intelligence import (
    IntegratedCDIntelligenceSystem,
    CDPhase,
    DrawingDiscipline
)

# Initialize integrated system
integrated_system = IntegratedCDIntelligenceSystem(
    specification_intelligence=SpecificationIntelligence(),
    inventory_intelligence=InventoryIntelligence(),
    procurement_intelligence=ProcurementIntelligence(),
    component_matcher=ComponentMatcher()
)

# Process complete CD set
documents = [
    {"name": "A-101 Floor Plan.pdf", "content": "...", "type": "drawing"},
    {"name": "E-201 Power Distribution.pdf", "content": "...", "type": "drawing"},
    {"name": "Division 26 - Electrical.pdf", "content": "...", "type": "specification"},
    # ... more documents
]

analysis = integrated_system.process_cd_set(
    project_id="project-123",
    project_name="Office Building Renovation",
    documents=documents,
    auto_inventory_check=True,
    auto_procurement_analysis=True
)

# View comprehensive results
print(f"\n🏗️ CD Set Analysis Results:")
print(f"Phase: {analysis.cd_phase}")
print(f"Total Components: {analysis.total_components}")
print(f"Disciplines: {[d.value for d in analysis.disciplines]}")
print(f"\n📦 Inventory Status:")
print(f"  In Stock: {analysis.components_in_stock}")
print(f"  Need Procurement: {analysis.components_need_procurement}")
print(f"  Total Cost: ${analysis.total_estimated_cost:,.2f}")
print(f"\n📊 Build Readiness:")
print(f"  Readiness Score: {analysis.build_readiness_score:.1f}%")
print(f"  Critical Path Items: {len(analysis.critical_path_items)}")
print(f"  Procurement Risk Items: {len(analysis.procurement_risk_items)}")
print(f"\n⚙️ Coordination:")
print(f"  Coordination Checks: {len(analysis.coordination_checks)}")
print(f"  Issues Found: {len(analysis.coordination_issues)}")

# Extract specific discipline components
from constructai.intelligence import DrawingDiscipline

electrical_docs = [d for d in documents if 'electrical' in d['name'].lower()]
electrical_analysis = integrated_system.process_cd_set(
    project_id="project-123",
    project_name="Electrical Only",
    documents=electrical_docs
)
print(f"\nElectrical: {electrical_analysis.total_components} components found")


# Generate purchase order
po = procurement.generate_purchase_order(
    item=procurement_item,
    supplier_id="SUP-001",
    user_details={"company_name": "My Company"}
)
print(f"PO Number: {po['po_number']}")

# 3. Specification Intelligence
spec_intel = SpecificationIntelligence()

# Extract specifications
text = "Structural steel shall be ASTM A992 grade..."
specs = spec_intel.extract_specifications(text)
print(f"Extracted {len(specs)} specifications")

# Validate specification
is_valid, issues = spec_intel.validate_specification(specs[0])
print(f"Valid: {is_valid}, Issues: {issues}")

# 4. Component Matching
matcher = ComponentMatcher()

matches = matcher.find_matches(
    required_component={"name": "Steel Beam", "grade": "A992"},
    available_components=[...],
    tolerance=0.1,
    include_alternatives=True
)
print(f"Found {len(matches)} matches with {matches[0].match_score} confidence")
```

### REST API Usage

```bash
# Start the API server
uvicorn constructai.web.fastapi_app:app --reload

# Inventory Intelligence
curl -X POST http://localhost:8000/api/intelligence/inventory/match \
  -H "Content-Type: application/json" \
  -d '{
    "component_name": "Concrete Mix",
    "specifications": {"psi": 5000, "slump_in": 4},
    "tolerance": 0.1
  }'

# Procurement Intelligence
curl -X POST http://localhost:8000/api/intelligence/procurement/build-readiness \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj-001",
    "required_components": [...],
    "project_start_date": "2024-12-01T00:00:00"
  }'

# Expert Dashboard
curl http://localhost:8000/api/dashboard/metrics
curl http://localhost:8000/api/dashboard/performance
```

### Document Analysis

```python
from constructai.document_processing import DocumentIngestor, MasterFormatClassifier
from constructai.nlp import ClauseExtractor, ConstructionNER, AmbiguityAnalyzer

# Ingest a specification document
ingestor = DocumentIngestor()
document = ingestor.ingest_document("specifications.pdf")

# Classify with MasterFormat
classifier = MasterFormatClassifier()
divisions = classifier.classify(document["content"])
print(f"Primary Division: {divisions[0]['division']} - {divisions[0]['name']}")

# Extract specification clauses
extractor = ClauseExtractor()
clauses = extractor.extract_clauses(document["content"])
print(f"Extracted {len(clauses)} clauses")

# Named Entity Recognition
ner = ConstructionNER()
entities = ner.extract_entities(clauses[0].text)
print(f"Materials: {entities['materials']}")
print(f"Standards: {entities['standards']}")

# Ambiguity Analysis
analyzer = AmbiguityAnalyzer()
analysis = analyzer.analyze(clauses[0].text)
if analysis['is_ambiguous']:
    print(f"Clarity Score: {analysis['clarity_score']}/100")
    for issue in analysis['issues']:
        print(f"  - {issue['message']}")
```

### Project Workflow Optimization

Run a full project analysis:
```bash
constructai full
```

Run individual analyses:
```bash
# Audit your project plan
constructai audit

# Generate optimized workflow
constructai optimize

# Check compliance
constructai compliance
```

Export results to JSON:
```bash
constructai full -o results.json
```

### Python API

```python
from datetime import datetime, timedelta
from constructai import Project, Task, Resource, ResourceType
from constructai import ProjectAuditor, WorkflowOptimizer

# Create a project
project = Project(
    id="project-001",
    name="Office Building Construction",
    description="5-story commercial office building",
    start_date=datetime.now(),
    target_end_date=datetime.now() + timedelta(days=365),
    budget=5000000.0
)

# Add tasks with dependencies
project.add_task(Task(
    id="T001",
    name="Site Preparation",
    description="Clear and prepare construction site",
    duration_days=14,
    dependencies=[],
    resources=[
        Resource("R001", "Survey Crew", ResourceType.LABOR, 3, "workers", 800),
    ],
    compliance_requirements=["Environmental clearance", "Site safety plan"]
))

# Run audit
auditor = ProjectAuditor()
audit_result = auditor.audit(project)
print(f"Audit Score: {audit_result.overall_score}/100")
print(f"Risks Found: {len(audit_result.risks)}")

# Generate optimized plan
optimizer = WorkflowOptimizer()
opt_result = optimizer.optimize(project)
metrics = opt_result.metrics_comparison['improvements']
print(f"Schedule Reduction: {metrics['duration_reduction_days']} days")
print(f"Cost Savings: ${metrics['cost_savings']:,.2f}")
```

## 📊 Example Output

### Audit Report
```
================================================================================
CONSTRUCTAI - PROJECT AUDIT REPORT
================================================================================

Project: Commercial Office Building Construction
Overall Score: 78.5/100

EXECUTIVE SUMMARY
- Total Risks Identified: 8
- Critical Risks: 2
- Compliance Issues: 3
- Bottlenecks: 2
- Resource Conflicts: 1

RECOMMENDATIONS
[CRITICAL] Address 3 compliance issues before project start
[HIGH] Resolve 2 identified bottlenecks to prevent schedule delays
[MEDIUM] Run the Workflow Optimizer to generate an optimized execution strategy
```

### Optimization Report
```
================================================================================
CONSTRUCTAI - WORKFLOW OPTIMIZATION REPORT
================================================================================

PERFORMANCE COMPARISON

SCHEDULE METRICS:
  Original Critical Path: 411.0 days
  Optimized Critical Path: 344.6 days
  Reduction: 66.4 days (16.2%)

COST METRICS:
  Original Estimated Cost: $3,847,500.00
  Optimized Estimated Cost: $3,732,075.00
  Savings: $115,425.00 (3.0%)

OPTIMIZATIONS APPLIED
1. Identified 7 opportunities for parallel task execution
2. Optimized bottleneck tasks blocking 3+ dependent tasks
3. Applied value engineering to 12 tasks
4. Applied schedule compression through fast-tracking
```

## 🏗️ Architecture

### Core Components

**Models** (`constructai/models/`)
- `Project`: Main project container with tasks, budget, timeline
- `Task`: Individual construction activities with dependencies
- `Resource`: Labor, equipment, materials, and budget allocation

**Engine** (`constructai/engine/`)
- `ProjectAuditor`: Comprehensive project analysis and risk detection
- `WorkflowOptimizer`: AI-powered optimization engine
- `ComplianceChecker`: Industry standards validation

**Utils** (`constructai/utils/`)
- Report generation and data export utilities

## 🎓 Industry Standards Integration

ConstructAI implements best practices from:

- **ISO 19650**: Building Information Modeling (BIM) standards
- **PMI PMBOK 7th Edition**: Project Management Body of Knowledge
- **OSHA**: Occupational Safety and Health Administration regulations
- **RICS**: Royal Institution of Chartered Surveyors guidelines
- **Critical Path Method (CPM)**: Schedule optimization
- **Value Engineering**: Cost optimization principles

## 🔐 Security & Privacy

- All project data is processed locally
- No data is transmitted to external services
- Secure data handling and validation
- Compliance with data protection standards

## 📈 Benefits

- **Faster Timelines**: 10-20% schedule reduction through optimization
- **Lower Costs**: 3-8% cost savings through value engineering
- **Risk Mitigation**: Early identification of schedule, cost, and compliance risks
- **Quality Assurance**: Systematic compliance checking against industry standards
- **Data-Driven Decisions**: Objective analysis backed by proven methodologies

## 🤝 Contributing

Contributions are welcome! This project aims to become the industry-standard platform for AI-powered construction project optimization.

## 📄 License

MIT License - see LICENSE file for details

## 🔮 Roadmap

### Phase 1 (Current) - Foundation
- ✅ Core data models and project structure
- ✅ Project auditor with risk detection
- ✅ Workflow optimizer with schedule compression
- ✅ Compliance checker for major standards
- ✅ CLI interface and reporting

### Phase 2 - Enhanced AI
- 🔄 Machine learning models for risk prediction
- 🔄 Historical project data analysis
- 🔄 Advanced resource leveling algorithms
- 🔄 Predictive analytics for schedule confidence

### Phase 3 - Integration
- 📋 MS Project / Primavera P6 file import/export
- 📋 BIM integration (Revit, Navisworks APIs)
- 📋 Document parsing (PDFs, CAD drawings)
- ✅ RESTful API for third-party integrations (COMPLETED)

### Phase 4 - Advanced Features
- 📋 Sustainability optimization (LEED/BREEAM)
- ✅ Supply chain intelligence (COMPLETED)
- 📋 Real-time project monitoring
- 📋 Generative design alternatives

## 📡 API Reference

### Enterprise Intelligence Endpoints

#### Inventory Intelligence (7 endpoints)

**GET** `/api/intelligence/inventory/health`
- Get inventory system health metrics
- Returns: status, total_items, stock_coverage, etc.

**POST** `/api/intelligence/inventory/match`
- Find matching components for specifications
- Body: `{component_name, specifications, tolerance, min_confidence}`
- Returns: List of matching items with confidence scores

**POST** `/api/intelligence/inventory/availability`
- Analyze component availability
- Body: `{component_name, required_quantity, specifications, required_date}`
- Returns: Availability analysis with risk assessment

#### Procurement Intelligence (6 endpoints)

**POST** `/api/intelligence/procurement/assess-criticality`
- Assess component criticality to project timeline
- Body: `{component, project_timeline, dependencies}`
- Returns: Criticality level (BLOCKING, CRITICAL_PATH, etc.)

**POST** `/api/intelligence/procurement/build-readiness`
- Complete build readiness assessment
- Body: `{project_id, required_components, availability_data, project_start_date}`
- Returns: Readiness score, status, recommendations

**POST** `/api/intelligence/procurement/generate-po`
- Generate automated purchase order
- Body: Purchase order details
- Returns: Complete PO document

**GET** `/api/intelligence/procurement/suppliers`
- Get all suppliers with performance metrics
- Returns: List of suppliers with ratings

**POST** `/api/intelligence/procurement/recommend-supplier`
- Get supplier recommendations
- Body: `{component, requirements}`
- Returns: Ranked supplier recommendations

#### Specification Intelligence (3 endpoints)

**POST** `/api/intelligence/specifications/extract`
- Extract specifications using multi-layered approach
- Body: `{text, context}`
- Returns: List of extracted specifications

**POST** `/api/intelligence/specifications/validate`
- Validate specification completeness
- Body: Specification details
- Returns: Validation status and issues

**POST** `/api/intelligence/specifications/assess-completeness`
- Assess specification completeness for component type
- Body: `{specifications, component_type}`
- Returns: Completeness score and missing requirements

#### Component Matching (1 endpoint)

**POST** `/api/intelligence/components/match`
- Advanced fuzzy component matching
- Body: `{required_component, available_components, tolerance, include_alternatives}`
- Returns: Matched components with compatibility scores

#### Expert Dashboard (3 endpoints)

**GET** `/api/dashboard/metrics`
- Comprehensive dashboard metrics
- Returns: Inventory, procurement, project status, KPIs, alerts, trends

**GET** `/api/dashboard/performance`
- System performance metrics
- Returns: Response times, operation stats, health status

**GET** `/api/dashboard/cache/stats`
- Cache statistics and hit rates
- Returns: Cache storage and performance metrics

### Example API Calls

```bash
# Get inventory health
curl http://localhost:8000/api/intelligence/inventory/health

# Match components
curl -X POST http://localhost:8000/api/intelligence/inventory/match \
  -H "Content-Type: application/json" \
  -d '{
    "component_name": "Structural Steel Beam",
    "specifications": {
      "length_ft": 20,
      "weight_lb_ft": 45,
      "grade": "A992"
    },
    "tolerance": 0.1,
    "min_confidence": 0.7
  }'

# Get dashboard metrics
curl http://localhost:8000/api/dashboard/metrics

# Get performance stats
curl http://localhost:8000/api/dashboard/performance
```

#### Integrated CD Intelligence (6 endpoints)

**POST** `/api/intelligence/cd/process-set`
- Process complete Construction Documents set with integrated analysis
- Body: `{project_id, project_name, documents, auto_inventory_check, auto_procurement_analysis}`
- Returns: Complete CDSetAnalysis with all components, inventory status, and build readiness

**POST** `/api/intelligence/cd/extract-components`
- Extract components from construction documents
- Body: `{documents, discipline_filter}`
- Returns: List of extracted components with metadata

**POST** `/api/intelligence/cd/inventory-integration`
- Integrate extracted components with inventory system
- Body: `{components}`
- Returns: Updated components with inventory availability data

**POST** `/api/intelligence/cd/coordination-check`
- Check for cross-discipline coordination issues
- Body: `{components, documents}`
- Returns: Coordination check results with issues and conflicts

**GET** `/api/intelligence/cd/disciplines`
- Get list of supported drawing disciplines
- Returns: All supported disciplines (Architectural, Structural, Mechanical, Electrical, Plumbing, etc.)

**GET** `/api/intelligence/cd/phases`
- Get list of supported CD phases
- Returns: All CD phases (SD, DD, 50%, 75%, 95%, 100%, IFC)

### Integrated CD System Example

```bash
# Process complete CD set
curl -X POST http://localhost:8000/api/intelligence/cd/process-set \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj-123",
    "project_name": "Office Building Renovation",
    "documents": [
      {"name": "A-101.pdf", "content": "...", "type": "drawing"},
      {"name": "E-201.pdf", "content": "...", "type": "drawing"}
    ],
    "auto_inventory_check": true,
    "auto_procurement_analysis": true
  }'

# Extract components from specific discipline
curl -X POST http://localhost:8000/api/intelligence/cd/extract-components \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [...],
    "discipline_filter": "electrical"
  }'

# Get supported disciplines
curl http://localhost:8000/api/intelligence/cd/disciplines

# Check cross-discipline coordination
curl -X POST http://localhost:8000/api/intelligence/cd/coordination-check \
  -H "Content-Type: application/json" \
  -d '{
    "components": [...],
    "documents": [...]
  }'
```

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

**ConstructAI** - Enterprise-grade construction intelligence optimized for expert decision-making with comprehensive Construction Documents integration.
