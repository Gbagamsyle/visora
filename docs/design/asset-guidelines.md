# Visora Asset Guidelines

## Naming

Use lowercase, kebab-case filenames:

- `visora-mark.svg`
- `ophthalmology-hero.jpg`
- `icon-home.svg`
- `community-event.jpg`

Avoid version suffixes such as `final2` or `new-image`.

## Formats

- SVG: logos, line illustrations, interface icons
- WebP: photographs and detailed raster artwork
- JPG: fallback photographic assets
- PNG: assets requiring transparency, favicons, or app-store-like exports

## Sizing

- Brand mark: 32px or 64px source minimum
- UI icons: 24px viewBox
- Hero illustrations: export at least 2× displayed width
- Profile media: square source preferred
- Post media: preserve a controlled aspect ratio

## React usage

Prefer Next.js `Image` for raster assets and inline React icon components for interface controls.

```tsx
import Image from "next/image";
import { assets } from "@/lib/assets";

<Image src={assets.eyeIllustration} width={640} height={640} alt="Ophthalmology illustration" />
```

## Performance

- Do not load decorative assets above their rendered dimensions
- Prefer SVG or WebP over large PNG/JPG files
- Mark decorative imagery with `aria-hidden`
- Provide meaningful alt text for informative imagery
- Use `priority` only for the largest above-the-fold image

## Fallback behavior

Raster assets must have a valid public path and should not be embedded as external remote URLs until a production storage system is configured.
