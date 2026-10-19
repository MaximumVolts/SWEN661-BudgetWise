import type { TextStyle } from 'react-native';

/** One set of colors for the whole app. */
export interface Palette {
  bg: string;
  ink: string;
  muted: string;
  lime: string;
  olive: string;
  navPill: string;
  navBar: string;
  red: string;
  redBg: string;
  chip: string;
  line: string;
  outline: string;
  /** The "previous period" line in charts. */
  previous: string;
  /** Subtle panel fill (e.g. the cash flow breakdown). */
  panel: string;
  /** Card / field fill. */
  surface: string;
}

/** Pace design tokens, sampled from the design file. */
export const STANDARD: Palette = {
  bg: '#FBFAF6',
  ink: '#1A1A1A',
  muted: '#5B5A55',
  lime: '#E8F26B',
  olive: '#4A5400',
  navPill: '#22260A',
  navBar: '#F1F0EA',
  red: '#C0281E',
  redBg: '#FADCD8',
  chip: '#EBEAE4',
  line: '#D3D1C9',
  outline: '#8C8A84',
  previous: '#C9C7BF',
  panel: '#F3F2EC',
  surface: '#FFFFFF',
};

/**
 * High contrast: pure black text on white, darker secondary text, status colors and outlines, and
 * dividers / chart lines dark enough to see (text at least 4.5:1 on white, outlines at least 3:1).
 */
export const HIGH_CONTRAST: Palette = {
  bg: '#FFFFFF',
  ink: '#000000',
  muted: '#2E2D2A',
  lime: '#E8F26B',
  olive: '#2C3300',
  navPill: '#000000',
  navBar: '#E6E5DE',
  red: '#9A1810',
  redBg: '#FADCD8',
  chip: '#E2E0D8',
  line: '#5E5C57',
  outline: '#2E2D2A',
  previous: '#6B6963',
  panel: '#F1F0EA',
  surface: '#FFFFFF',
};

/**
 * Colorblind mode: olive (good / near) vs red (over) is hard to tell apart with red-green color
 * blindness, so the pair becomes blue vs orange (Okabe-Ito hues), darkened to keep text contrast.
 */
export function colorblindSafe(p: Palette): Palette {
  const hc = p === HIGH_CONTRAST;
  return { ...p, olive: hc ? '#003F7D' : '#0B5FA5', red: hc ? '#8A3300' : '#B34700', redBg: '#FBE3D0' };
}

/** The palette for the user's display preferences. */
export function paletteFor(opts: { highContrast: boolean; colorblindMode: boolean }): Palette {
  const base = opts.highContrast ? HIGH_CONTRAST : STANDARD;
  return opts.colorblindMode ? colorblindSafe(base) : base;
}

/** Text styles in a palette. */
export function typeScale(c: Palette) {
  return {
    display: { fontSize: 34, fontWeight: '700', lineHeight: 41, color: c.ink },
    h1: { fontSize: 28, fontWeight: '600', lineHeight: 34, color: c.ink },
    title: { fontSize: 22, fontWeight: '500', color: c.ink },
    appBar: { fontSize: 20, fontWeight: '500', color: c.ink },
    body: { fontSize: 16, lineHeight: 22, color: c.muted },
    row: { fontSize: 16, fontWeight: '500', color: c.ink },
    sub: { fontSize: 13, color: c.muted },
    amount: { fontSize: 16, fontWeight: '700', color: c.ink },
    label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.4, color: c.ink },
    link: { fontSize: 14, fontWeight: '700', color: c.olive },
    big: { fontSize: 44, fontWeight: '300', lineHeight: 50, color: c.ink },
  } satisfies Record<string, TextStyle>;
}

export type TypeScale = ReturnType<typeof typeScale>;
