# ConstructAI API Documentation

## Python API

### Basic Usage

```python
from constructai import Project, Task, Resource, ResourceType
from constructai import ProjectAuditor, WorkflowOptimizer
from constructai.engine.compliance import ComplianceChecker

# Create a project
project = Project(
    id="proj-001",
    name="My Construction Project",
    description="Project description",
    budget=1000000.0
)

# Add tasks
project.add_task(Task(
    id="T001",
    name="Site Preparation",
    duration_days=10,
    resources=[
        Resource("R001", "Crew", ResourceType.LABOR, 5, "workers", 800)
    ]
))

# Run audit
auditor = ProjectAuditor()
audit_result = auditor.audit(project)
print(f"Score: {audit_result.overall_score}/100")

# Optimize
optimizer = WorkflowOptimizer()
opt_result = optimizer.optimize(project)
print(f"Savings: ${opt_result.metrics_comparison['improvements']['cost_savings']}")
```

### Data Import/Export

```python
from constructai.utils.data_io import ProjectDataHandler, MSProjectExporter

# Export to JSON
ProjectDataHandler.export_to_json(project, "project.json")

# Import from JSON
project = ProjectDataHandler.import_from_json("project.json")

# Export to YAML
ProjectDataHandler.export_to_yaml(project, "project.yaml")

# Export to MS Project CSV
MSProjectExporter.export_to_csv(project, "project.csv")
```

### REST API (Python)

```python
from constructai.api import ConstructAIAPI

api = ConstructAIAPI()

# Audit project
result = api.audit_project(project_data_dict)

# Optimize project
result = api.optimize_project(project_data_dict)

# Check compliance
result = api.check_compliance(project_data_dict)

# Full analysis
result = api.full_analysis(project_data_dict)
```

## REST API Endpoints (Flask)

### Starting the Server

```python
from constructai.api import create_flask_app

app = create_flask_app()
app.run(host='0.0.0.0', port=5000)
```

### Endpoints

#### POST /api/v1/audit
Audit a construction project.

**Request Body:**
```json
{
  "id": "proj-001",
  "name": "Office Building",
  "description": "5-story office building",
  "budget": 5000000,
  "tasks": [
    {
      "id": "T001",
      "name": "Foundation",
      "duration_days": 30,
      "dependencies": [],
      "resources": []
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "overall_score": 85.5,
    "summary": {
      "total_risks": 3,
      "compliance_issues": 1,
      "bottlenecks": 2
    },
    "risks": [...],
    "recommendations": [...]
  }
}
```

#### POST /api/v1/optimize
Optimize project workflow.

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "metrics": {
        "improvements": {
          "duration_reduction_days": 15.5,
          "duration_reduction_percent": 12.3,
          "cost_savings": 125000,
          "cost_savings_percent": 2.5
        }
      }
    },
    "optimized_project": {...}
  }
}
```

#### POST /api/v1/compliance
Check project compliance.

**Response:**
```json
{
  "status": "success",
  "data": {
    "standards_checked": ["ISO 19650", "OSHA", "PMI PMBOK"],
    "summary": {
      "total_issues": 5,
      "high_severity": 2
    },
    "issues": [...]
  }
}
```

#### POST /api/v1/analyze
Run full analysis (audit + optimize + compliance).

**Response:**
```json
{
  "status": "success",
  "data": {
    "audit": {...},
    "optimization": {...},
    "compliance": {...},
    "optimized_project": {...}
  }
}
```

#### GET /api/v1/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "service": "ConstructAI"
}
```

## CLI Commands

### Audit
```bash
constructai audit [-o output.json]
```

### Optimize
```bash
constructai optimize [-o output.json]
```

### Compliance Check
```bash
constructai compliance [-o output.json]
```

### Full Analysis
```bash
constructai full [-o output.json]
```

## Project Data Schema

### Project
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "start_date": "ISO-8601 datetime",
  "target_end_date": "ISO-8601 datetime",
  "budget": "number",
  "metadata": {},
  "tasks": [...]
}
```

### Task
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "duration_days": "number",
  "dependencies": ["task_ids"],
  "status": "planned|in_progress|completed|blocked|delayed",
  "priority": "1-5",
  "start_date": "ISO-8601 datetime",
  "end_date": "ISO-8601 datetime",
  "compliance_requirements": ["strings"],
  "risk_level": "0.0-1.0",
  "resources": [...]
}
```

### Resource
```json
{
  "id": "string",
  "name": "string",
  "type": "labor|equipment|material|budget",
  "quantity": "number",
  "unit": "string",
  "cost_per_unit": "number",
  "availability": "0.0-1.0"
}
```

## Industry Standards

ConstructAI validates against:

- **ISO 19650**: BIM information management
- **PMI PMBOK**: Project management best practices
- **OSHA**: Occupational safety standards
- **RICS**: Cost management guidelines

## Error Handling

API responses include status field:
- `"success"`: Operation completed successfully
- `"error"`: Operation failed, see `message` field

```json
{
  "status": "error",
  "message": "Error description"
}
```
