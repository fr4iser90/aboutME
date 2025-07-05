# Dynamic Layout System

## Overview

The dynamic layout system allows for flexible, page-based layouts with drag-and-drop editing capabilities.

## Architecture

### Database Schema

```sql
CREATE TABLE layouts (
    id SERIAL PRIMARY KEY,
    page VARCHAR(255) NOT NULL DEFAULT 'home',
    elements JSONB NOT NULL DEFAULT '[]',
    layout_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Core Components

#### Domain Models

**PageElement**
```python
class PageElement(BaseModel):
    id: str
    type: str  # navbar, hero, section, skills, projects, footer, etc.
    title: str
    visible: bool = True
    grid_props: Dict[str, Any] = Field(default_factory=dict)  # x, y, w, h for grid layout
    order: int
    settings: Dict[str, Any] = Field(default_factory=dict)  # element-specific settings
```

**Layout**
```python
class Layout(BaseModel):
    id: Optional[int] = None
    page: str = 'home'  # page identifier (home, about, projects, etc.)
    elements: List[PageElement] = Field(default_factory=list)
    layout_config: Dict[str, Any] = Field(default_factory=dict)  # grid config, breakpoints, etc.
    is_active: bool = False
    is_visible: bool = True
    is_public: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
```

## Dynamic Layout Creation

### Default Layout Generation

The system automatically creates layouts based on available sections in the database:

```python
def create_default_layout(self, page: str) -> Layout:
    # Get available sections from database
    sections = self._db.query(SectionModel).filter(
        SectionModel.is_visible == True,
        SectionModel.is_public == True
    ).order_by(SectionModel.display_order).all()

    # Create dynamic elements
    default_elements = []
    
    # Add navbar
    default_elements.append({
        "id": "navbar",
        "type": "navbar",
        "title": "Navigation",
        "visible": True,
        "grid_props": {"x": 0, "y": 0, "w": 12, "h": 1},
        "order": 1,
        "settings": {"sticky": True, "theme_switcher": True}
    })

    # Add sections dynamically
    for i, section in enumerate(sections):
        default_elements.append({
            "id": f"section_{section.name}",
            "type": "section",
            "title": section.title,
            "visible": True,
            "grid_props": {"x": 0, "y": i + 1, "w": 12, "h": 2},
            "order": i + 2,
            "settings": {"section_name": section.name}
        })

    # Add footer
    default_elements.append({
        "id": "footer",
        "type": "footer",
        "title": "Footer",
        "visible": True,
        "grid_props": {"x": 0, "y": len(sections) + 1, "w": 12, "h": 1},
        "order": len(sections) + 2,
        "settings": {"show_social_links": True, "show_copyright": True}
    })
```

## Key Features

1. **No Hardcoded Paths**: All sections are dynamically loaded from the database
2. **Flexible Structure**: New sections are automatically included in layouts
3. **Page-Based**: Each page can have its own layout configuration
4. **Grid System**: Uses CSS Grid for responsive layouts
5. **Element Types**: Supports navbar, sections, skills, projects, footer, etc.

## API Endpoints

**Admin Endpoints**
- `GET /api/admin/layout/{page}/full-page` - Get complete layout (admin only)
- `POST /api/admin/layout/{page}/full-page` - Save complete layout (admin only)
- `GET /api/admin/layout/{page}` - Get layout for specific page
- `POST /api/admin/layout/{page}/default` - Create default layout

**Public Endpoints**
- `GET /api/public/layout?page={page}` - Get public layout (only visible elements)

## Benefits

1. **Dynamic**: No hardcoded layouts, everything comes from database
2. **Flexible**: Easy to add new sections and element types
3. **Maintainable**: Clear separation of concerns
4. **Scalable**: Page-based approach supports multiple pages
5. **User-Friendly**: Drag-and-drop editing for admins
6. **Performance**: Efficient JSONB storage and retrieval

## Future Enhancements

1. **Grid Editor**: Full drag-and-drop interface
2. **Element Templates**: Predefined element configurations
3. **Layout History**: Version control for layouts
4. **Responsive Breakpoints**: Different layouts for different screen sizes
5. **Element Library**: Reusable element components 