# Asset exports

Public assets are exposed through `@/lib/assets`.

```tsx
import { assets } from "@/lib/assets";
```

Current approved exports:

- `eyeIllustration`: `/assets/images/eye.png`
- `ophthalmologyIllustration`: `/assets/illustrations/ophthalmology-learning.svg`

Add new assets to their matching public folders, then expose them in `index.ts` so screens do not repeat public paths.
