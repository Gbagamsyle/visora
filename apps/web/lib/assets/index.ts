export const assets = {
  eyeIllustration: "/assets/images/eye.png",
  ophthalmologyIllustration: "/assets/illustrations/ophthalmology-learning.svg",
} as const;

export type AssetKey = keyof typeof assets;
