# Visora Design System

## 1. Product principles

- Academic clarity before decoration
- Generous whitespace and strong content hierarchy
- Premium but approachable
- Consistent behavior across public, student, and admin experiences
- Accessible contrast and keyboard usability
- Desktop-first, with deliberate responsive layouts

## 2. Brand

### Wordmark

Use **Visora** with the circular **V** brand mark. The mark must remain recognizable at favicon, navigation, and promotional sizes.

### Brand colours

- Primary: `#8B53CA`
- Primary deep: `#70558B`
- Primary soft: `#EFE7F7`
- Ink: `#201D29`
- Muted: `#747181`
- Canvas: `#FCFBFE`
- Surface: `#FFFFFF`
- Line: `#ECEAF2`

## 3. Semantic colours

- Success: `#17795C`
- Warning: `#A66B1F`
- Danger: `#B84242`
- Information: `#4C72C3`

Do not use semantic colours purely for decoration.

## 4. Typography

The initial system uses a system sans-serif stack for reliability:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system,
  BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### Recommended scale

- Display: 68px / 1.00
- Page title: 34px / 1.10
- Section title: 30px / 1.14
- Card title: 18px / 1.25
- Body: 16px / 1.68
- Supporting: 13px / 1.55
- Label: 12px / 1.40

## 5. Spacing

Use a 4px-based scale:

- `4`, `8`, `12`, `16`, `20`, `24`, `32`, `48`, `64`, `80`, `96`

## 6. Layout

- Public content width: 1280px
- Standard application width: 1180px
- Desktop sidebar: 224px
- Header: 72–74px
- Mobile navigation: bottom navigation
- Page horizontal gutter: 32px desktop, 24px tablet, 16px mobile

## 7. Radii

- Small: 8px
- Medium: 12px
- Large: 18px
- Full: pill or circle

## 8. Elevation

Use subtle shadows only. Prefer borders for content separation and reserve elevation for overlays and floating context.

- Small: `0 1px 2px rgba(23,20,78,.04)`
- Medium: `0 10px 28px rgba(23,20,78,.08)`
- Floating: `0 14px 32px rgba(48,35,67,.10)`

## 9. Components

### Buttons

- Primary: strong brand fill, white text
- Secondary: white surface, neutral border
- Outline: border emphasized, transparent surface
- Ghost: text or icon emphasis without a container

States:

- Default
- Hover
- Focus visible
- Active
- Disabled
- Loading

### Cards

Use cards for grouped, independently meaningful content. Avoid stacking cards when a section with structured rows would be clearer.

### Forms

- 46px control height
- 8px radius
- Visible labels
- Inline helper text
- Validation icon and message
- Never rely on colour alone

### Navigation

- Desktop: left sidebar or public header
- Mobile: compact top navigation and bottom student navigation
- Active route must have background, text, and icon state

### Feedback

- Toast: short status confirmation
- Modal: focused destructive or multi-step action
- Alert: persistent validation or platform notice
- Skeleton: content-aware loading
- Empty state: explain why the view is empty and provide an action

## 10. Iconography

Use a consistent 20px or 24px icon grid. SVG icons must support:

- `size`
- `strokeWidth`
- `className`
- `aria-hidden`
- `currentColor`

Icons should have a 1.8px stroke for standard 24px UI icons.

## 11. Asset structure

```text
public/assets/
  brand/
  illustrations/
  icons/
  images/
```

- `brand`: logos, wordmarks, app icons
- `illustrations`: large original decorative artwork
- `icons`: SVG files used with image loading
- `images`: photographs and raster content
