export const colors = {
  brand: {
    950: "#123145",
    900: "#174C66",
    700: "#087E8B",
    600: "#149AA3",
    100: "#DFF4F2",
  },
  accent: "#DCA95B",
  ink: "#17242B",
  muted: "#65777F",
  canvas: "#F7FAFA",
  surface: "#FFFFFF",
  line: "#DDE7E8",
  success: "#17795C",
  warning: "#A66B1F",
  danger: "#B84242",
  information: "#2774A6",
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const typography = {
  display: { size: 68, lineHeight: 1 },
  pageTitle: { size: 34, lineHeight: 1.1 },
  sectionTitle: { size: 30, lineHeight: 1.14 },
  cardTitle: { size: 18, lineHeight: 1.25 },
  body: { size: 16, lineHeight: 1.68 },
  supporting: { size: 13, lineHeight: 1.55 },
  label: { size: 12, lineHeight: 1.4 },
} as const;
