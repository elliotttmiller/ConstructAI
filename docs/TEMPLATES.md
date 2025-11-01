# Project Templates

Example project templates for different construction types.

## Small Residential Project Template

```yaml
id: "residential-small"
name: "Small Residential Construction"
description: "Template for single-family home construction"
budget: 350000
metadata:
  type: "residential"
  size: "small"
  sqft: 2500

tasks:
  - id: "T001"
    name: "Site Preparation"
    description: "Clear and prepare construction site"
    duration_days: 5
    dependencies: []
    priority: 5
    resources:
      - id: "R001"
        name: "Site Crew"
        type: "labor"
        quantity: 4
        unit: "workers"
        cost_per_unit: 600
    
  - id: "T002"
    name: "Foundation"
    description: "Excavate and pour foundation"
    duration_days: 15
    dependencies: ["T001"]
    priority: 5
    compliance_requirements:
      - "Foundation inspection"
      - "Concrete testing"
    resources:
      - id: "R002"
        name: "Foundation Crew"
        type: "labor"
        quantity: 6
        unit: "workers"
        cost_per_unit: 800
      - id: "R003"
        name: "Concrete"
        type: "material"
        quantity: 80
        unit: "cubic yards"
        cost_per_unit: 120

  # Add more tasks...
```

## Commercial Office Building Template

```yaml
id: "commercial-office"
name: "Commercial Office Building"
description: "Multi-story office building construction"
budget: 5000000
metadata:
  type: "commercial"
  floors: 5
  sqft: 50000

tasks:
  - id: "T001"
    name: "Site Survey and Preparation"
    duration_days: 14
    priority: 5
    
  - id: "T002"
    name: "Excavation"
    duration_days: 21
    dependencies: ["T001"]
    priority: 5
    risk_level: 0.6
    compliance_requirements:
      - "OSHA excavation safety"
      - "Shoring plan approval"
    
  - id: "T003"
    name: "Foundation and Underground Structure"
    duration_days: 45
    dependencies: ["T002"]
    priority: 5
    
  - id: "T004"
    name: "Steel Structure Erection"
    duration_days: 60
    dependencies: ["T003"]
    priority: 5
    risk_level: 0.8
    compliance_requirements:
      - "OSHA steel erection"
      - "Fall protection plan"
      - "Crane safety certification"

  # Add more tasks...
```

## Industrial Facility Template

```yaml
id: "industrial-facility"
name: "Industrial Manufacturing Facility"
description: "Industrial facility with specialized equipment"
budget: 10000000
metadata:
  type: "industrial"
  facility_type: "manufacturing"
  sqft: 100000

tasks:
  - id: "T001"
    name: "Environmental Assessment"
    duration_days: 30
    priority: 5
    compliance_requirements:
      - "Environmental impact study"
      - "EPA approval"
    
  - id: "T002"
    name: "Site Development"
    duration_days: 45
    dependencies: ["T001"]
    priority: 5
    
  - id: "T003"
    name: "Foundation and Structural Steel"
    duration_days: 90
    dependencies: ["T002"]
    priority: 5
    risk_level: 0.7

  # Add more tasks...
```

## Infrastructure Project Template

```yaml
id: "infrastructure-road"
name: "Highway Infrastructure Project"
description: "Highway construction and improvement"
budget: 25000000
metadata:
  type: "infrastructure"
  subtype: "highway"
  length_miles: 10

tasks:
  - id: "T001"
    name: "Environmental and Permits"
    duration_days: 60
    priority: 5
    compliance_requirements:
      - "Environmental permits"
      - "DOT approvals"
      - "Utility coordination"
    
  - id: "T002"
    name: "Right-of-Way Acquisition"
    duration_days: 120
    dependencies: ["T001"]
    priority: 5
    
  - id: "T003"
    name: "Earthwork and Grading"
    duration_days: 90
    dependencies: ["T002"]
    priority: 5
    risk_level: 0.5

  # Add more tasks...
```

## Using Templates

### Python API
```python
from constructai.utils.data_io import ProjectDataHandler

# Load template
project = ProjectDataHandler.import_from_yaml("template.yaml")

# Customize
project.name = "My Specific Project"
project.budget = 400000

# Add more tasks or modify existing ones
# ...

# Save customized project
ProjectDataHandler.export_to_json(project, "my_project.json")
```

### CLI
```bash
# Run analysis on template
constructai full < template.yaml

# Or save template first
constructai audit -o analysis.json < my_project.yaml
```

## Template Best Practices

1. **Start with a template** that matches your project type
2. **Customize durations** based on your specific scope
3. **Add project-specific tasks** as needed
4. **Update resource costs** to reflect your market
5. **Include compliance requirements** for your jurisdiction
6. **Set risk levels** for high-risk activities
7. **Define dependencies** accurately
8. **Add metadata** for better categorization

## Creating Custom Templates

When creating custom templates:

1. Include all major phases and milestones
2. Set realistic duration estimates
3. Define clear task dependencies
4. Include industry-standard compliance requirements
5. Add resource estimates (labor, equipment, materials)
6. Set appropriate priority levels (1-5)
7. Identify high-risk tasks (risk_level > 0.7)
8. Include metadata for project categorization
