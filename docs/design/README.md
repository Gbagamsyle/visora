# Visora Design Documentation

Use these documents before creating or changing UI:

- `design-system.md`: visual language, layout, component behavior, and accessibility baseline
- `asset-guidelines.md`: file formats, sizing, naming, usage, and performance rules

Implementation references:

- `apps/web/lib/design/tokens.ts`: typed product tokens
- `apps/web/lib/assets/index.ts`: approved public asset paths
- `apps/web/components/icons`: reusable interface icon exports

Do not introduce ad hoc colours, icon implementations, or public asset paths in individual screens. Extend the shared tokens and exports first.
