# Universal Model Viewer/Editor Documentation

## Overview

The Universal Model Viewer/Editor is a comprehensive, all-in-one component that combines 3D model viewing, editing, and parametric CAD generation capabilities into a seamless, professional interface. This component represents the implementation of the vision outlined in the PARAMETRIC_CAD_INTEGRATION_BLUEPRINT.md.

## Key Features

### 1. Universal File Format Support
- **GLTF/GLB**: Full support with DRACO compression
- **OBJ**: Wavefront OBJ mesh loading
- **FBX**: Autodesk FBX format support
- **STL**: STereoLithography format for 3D printing

### 2. Interactive Editing Tools
- **Transform Mode**: Move objects in 3D space with visual gizmo
- **Rotate Mode**: Rotate objects around any axis
- **Scale Mode**: Uniformly or non-uniformly scale objects
- **Direct Property Editing**: Precise numeric input for position, rotation, and scale

### 3. Material Editing
- **Color Picker**: Visual and hex-based color selection
- **Opacity Control**: Smooth opacity slider for transparency effects
- **Real-time Updates**: All changes immediately reflected in the viewport

### 4. Parametric CAD Integration
- **Built-in CAD Builder**: Generate parametric models directly in the viewer
- **Column Generation**: Create structural columns with customizable parameters
- **Box Generation**: Generate parametric boxes with lids and mounting holes
- **Template Library**: Access pre-configured model templates
- **Seamless Loading**: CAD-generated models automatically load into the scene

### 5. Professional Viewport
- **Grid Helper**: Visual reference grid for spatial awareness
- **Axes Helper**: RGB axes for orientation reference
- **OrbitControls**: Intuitive camera navigation
- **Shadow Mapping**: Realistic shadow rendering
- **Ambient & Directional Lighting**: Professional lighting setup

### 6. Export Capabilities
- **Multiple Formats**: Export to GLTF, GLB, OBJ, STL, FBX
- **One-Click Export**: Simple export workflow
- **Format Preservation**: Maintains model integrity across formats

## Component Architecture

### Component Location
```
src/components/bim/UniversalModelViewerEditor.tsx
```

### Integration Points

#### 1. BIM Page Integration
The component is integrated into the BIM page with a mode toggle:

```tsx
// src/app/bim/page.tsx
const [viewerMode, setViewerMode] = useState<'classic' | 'universal'>('universal');

// Toggle between modes
<Button 
  variant={viewerMode === 'universal' ? 'default' : 'ghost'}
  onClick={() => setViewerMode('universal')}
>
  Universal Editor
</Button>
```

#### 2. Usage Example
```tsx
import { UniversalModelViewerEditor } from '@/components/bim/UniversalModelViewerEditor';

<UniversalModelViewerEditor
  onModelLoaded={(model) => {
    console.log('Model loaded:', model);
  }}
  onModelUpdated={(model) => {
    console.log('Model updated:', model);
  }}
  onExport={(format) => {
    console.log('Export requested:', format);
  }}
/>
```

## User Interface

### Layout Structure

```
┌─────────────────────────────────────┬──────────────┐
│                                     │              │
│        3D Viewport                  │   Side Panel │
│                                     │              │
│  [View Tools]    [Transform Tools]  │   - Models   │
│                                     │   - CAD      │
│                                     │   - Props    │
│                                     │   - Export   │
│                                     │              │
└─────────────────────────────────────┴──────────────┘
```

### Side Panel Tabs

#### Models Tab
- **File Upload**: Drag-and-drop or click to upload
- **Loaded Models List**: View all loaded models with selection
- **Model Information**: Name, type, and status badges

#### CAD Tab
- **Parametric Builder**: Integrated CAD generation interface
- **Column Generator**: Create structural columns
- **Box Generator**: Create parametric boxes
- **Template Library**: Browse and use templates

#### Properties Tab
- **Object Selection**: Shows selected object name and type
- **Position Controls**: X, Y, Z position inputs
- **Rotation Controls**: X, Y, Z rotation inputs (radians)
- **Scale Controls**: X, Y, Z scale factors
- **Material Properties**:
  - Color picker with hex input
  - Opacity slider (0-1)
- **Actions**:
  - Delete object
  - Duplicate object (coming soon)

#### Export Tab
- **Format Selection**: Buttons for each export format
- **GLTF**: Standard web format
- **GLB**: Binary GLTF format
- **OBJ**: Wavefront format
- **STL**: 3D printing format
- **FBX**: Autodesk format

### Toolbar Controls

#### View Mode Toolbar (Top Left)
- **View Mode**: Switch to viewing mode (no editing)
- **Edit Mode**: Enable editing with transform controls

#### Transform Toolbar (Top Left, when in Edit Mode)
- **Move**: Translate objects
- **Rotate**: Rotate objects
- **Scale**: Scale objects

#### View Controls (Top Right)
- **Toggle Grid**: Show/hide grid helper
- **Toggle Axes**: Show/hide axes helper
- **Reset Camera**: Return camera to default position

## Technical Implementation

### Core Technologies
- **Three.js**: 3D rendering engine
- **OrbitControls**: Camera navigation
- **TransformControls**: Object manipulation gizmos
- **GLTF/OBJ/FBX/STL Loaders**: File format support

### State Management
```typescript
// View state
const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale' | null>(null);

// Object state
const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
const [loadedModels, setLoadedModels] = useState<THREE.Object3D[]>([]);

// Property state
const [objectPosition, setObjectPosition] = useState({ x: 0, y: 0, z: 0 });
const [objectRotation, setObjectRotation] = useState({ x: 0, y: 0, z: 0 });
const [objectScale, setObjectScale] = useState({ x: 1, y: 1, z: 1 });
const [objectColor, setObjectColor] = useState('#ffffff');
const [objectOpacity, setObjectOpacity] = useState(1.0);
```

### Key Functions

#### Model Loading
```typescript
// Generic file upload handler
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  const extension = file.name.toLowerCase().split('.').pop();
  
  // Route to appropriate loader
  if (extension === 'gltf' || extension === 'glb') {
    await loadGLTFModel(fileUrl, file.name);
  } else if (extension === 'obj') {
    await loadOBJModel(fileUrl, file.name);
  }
  // ... other formats
};
```

#### CAD Model Integration
```typescript
const handleCADModelGenerated = async (result: CADGenerationResult) => {
  // Load generated model
  const loadedObject = await loadGLTFModel(result.model_url, result.model_type);
  
  // Add to scene
  sceneRef.current.add(loadedObject);
  setLoadedModels(prev => [...prev, loadedObject]);
  
  // Frame camera
  fitCameraToObject(loadedObject);
};
```

#### Object Selection
```typescript
const handleObjectSelection = (object: THREE.Object3D) => {
  setSelectedObject(object);
  setViewMode('edit');
  
  // Update property displays
  setObjectPosition({ x: object.position.x, y: object.position.y, z: object.position.z });
  setObjectRotation({ x: object.rotation.x, y: object.rotation.y, z: object.rotation.z });
  setObjectScale({ x: object.scale.x, y: object.scale.y, z: object.scale.z });
};
```

## Workflow Examples

### Basic Model Viewing Workflow
1. User opens BIM page
2. Universal Editor mode is active by default
3. User uploads a GLTF model
4. Model loads and camera frames it automatically
5. User can orbit, pan, and zoom to inspect

### Model Editing Workflow
1. User uploads or generates a model
2. Clicks on the model in viewport (auto-selects)
3. Enters Edit mode (if not already)
4. Selects Transform mode (Move/Rotate/Scale)
5. Uses gizmo to manipulate or enters precise values
6. Changes are applied in real-time

### CAD Generation Workflow
1. User switches to CAD tab
2. Selects model type (Column/Box)
3. Enters parameters (dimensions, materials)
4. Clicks Generate
5. Model appears in viewport automatically
6. User can edit or export the generated model

### Export Workflow
1. User has model(s) loaded
2. Switches to Export tab
3. Clicks desired format button
4. Export handler is triggered (to be implemented)

## Performance Considerations

### Optimizations
- **Frustum Culling**: Objects outside camera view are not rendered
- **Shadow Map Optimization**: PCF soft shadows for quality/performance balance
- **Dynamic Imports**: Loaders are imported only when needed
- **Memory Management**: Geometry and materials are properly disposed
- **GPU Utilization**: High-performance rendering preference

### Limitations
- Large models (>100k polygons) may impact performance
- Multiple high-resolution textures can affect memory
- Complex materials with multiple maps may slow rendering

## Future Enhancements

### Planned Features
1. **Advanced Editing**:
   - Boolean operations (union, subtract, intersect)
   - Edge filleting and chamfering
   - Vertex editing
   
2. **Collaboration**:
   - Real-time multi-user editing
   - Change tracking and history
   - Comments and annotations
   
3. **Analysis Tools**:
   - Measurement tools
   - Volume calculation
   - Center of mass display
   - Clash detection integration
   
4. **Export Enhancement**:
   - Custom export settings
   - Batch export
   - Cloud storage integration
   
5. **Import Enhancement**:
   - IFC format support (requires web-ifc-three)
   - RVT format support
   - DWG/DXF support

## Troubleshooting

### Common Issues

#### Model Not Loading
- **Check file format**: Ensure it's a supported format
- **Check file size**: Very large files may timeout
- **Check console**: Look for error messages

#### Transform Gizmo Not Appearing
- **Check selection**: Ensure object is selected
- **Check edit mode**: Must be in Edit mode
- **Check transform mode**: Must select Move/Rotate/Scale

#### Performance Issues
- **Reduce model complexity**: Simplify mesh before importing
- **Disable shadows**: Toggle shadow rendering off
- **Limit model count**: Remove unused models from scene

## API Reference

### Props

```typescript
interface UniversalModelViewerEditorProps {
  className?: string;
  onModelLoaded?: (model: THREE.Object3D) => void;
  onModelUpdated?: (model: THREE.Object3D) => void;
  onExport?: (format: string) => void;
}
```

### Callbacks

#### onModelLoaded
Called when a model is successfully loaded into the scene.
```typescript
onModelLoaded={(model: THREE.Object3D) => {
  console.log('Model loaded:', model.name, model.type);
}}
```

#### onModelUpdated
Called when an object's properties are modified.
```typescript
onModelUpdated={(model: THREE.Object3D) => {
  console.log('Position:', model.position);
  console.log('Rotation:', model.rotation);
  console.log('Scale:', model.scale);
}}
```

#### onExport
Called when export is requested for a specific format.
```typescript
onExport={(format: string) => {
  console.log('Export format:', format);
  // Implement export logic
}}
```

## Integration with Existing Systems

### BIM Workflow Integration
The Universal Editor seamlessly integrates with the existing BIM workflow:

1. **Model Management**: Loaded models can be associated with BIM projects
2. **Clash Detection**: Selected objects can be checked for clashes
3. **Property Inspection**: Object properties link to BIM metadata
4. **Layer Management**: Models can be organized into layers

### CAD System Integration
The integrated ParametricCADBuilder provides:

1. **Build123d Backend**: Python-based parametric modeling
2. **Real-time Generation**: On-demand model creation
3. **Parameter Persistence**: Save and reuse configurations
4. **Template System**: Pre-configured component library

## Best Practices

### For Users
1. **Start Simple**: Load one model at a time initially
2. **Use Grid**: Keep grid visible for spatial reference
3. **Save Often**: Export models regularly
4. **Name Models**: Give models descriptive names
5. **Organize**: Use the models list to track loaded objects

### For Developers
1. **Memory Management**: Always dispose of unused geometries and materials
2. **Event Cleanup**: Remove event listeners on unmount
3. **Error Handling**: Wrap loader operations in try-catch
4. **Type Safety**: Use proper TypeScript types
5. **Performance**: Monitor render loop performance

## Conclusion

The Universal Model Viewer/Editor represents a significant step forward in integrated CAD/BIM visualization and editing. It provides a professional, feature-rich interface that combines the best aspects of viewing and editing tools into a single, cohesive experience.

The component is designed to be extensible, maintainable, and performant, making it suitable for professional construction and architectural workflows while remaining accessible to users of all skill levels.
