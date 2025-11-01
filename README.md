# ConstructAI - AI-Powered Construction Workflow Optimization

Transform your construction workflow from start to finish with autonomous AI. ConstructAI audits your project plan and intelligently generates a professionally optimized, data-driven execution strategy.

## 🚀 Features

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

### Command Line Interface

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
- 📋 RESTful API for third-party integrations

### Phase 4 - Advanced Features
- 📋 Sustainability optimization (LEED/BREEAM)
- 📋 Supply chain intelligence
- 📋 Real-time project monitoring
- 📋 Generative design alternatives

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

**ConstructAI** - Achieve faster timelines and lower costs with an AI-powered expert partner.