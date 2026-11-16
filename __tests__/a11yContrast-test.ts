// Colour contrast (WCAG 2.2 SC 1.4.3 and 1.4.11), checked on every palette the app can show:
// standard, high contrast, and each of those in colorblind mode. The ratios are worked out with the
// WCAG relative-luminance formula, so a design-token change that drops below AA fails here.
import { DEFAULT_PREFERENCES } from '@/models/userPreferences';
import { colorblindSafe, HIGH_CONTRAST, type Palette, paletteFor, STANDARD, typeScale } from '@/ui/theme';

/** WCAG relative luminance of a #RRGGBB colour. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours (1 to 21). */
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;

const PALETTES: [string, Palette][] = [
  ['standard', STANDARD],
  ['high contrast', HIGH_CONTRAST],
  ['standard, colorblind', colorblindSafe(STANDARD)],
  ['high contrast, colorblind', colorblindSafe(HIGH_CONTRAST)],
];

/** Text colours, and the fills text is drawn on. */
const TEXT = ['ink', 'muted', 'olive', 'red'] as const;
const FILLS = ['bg', 'surface', 'panel', 'chip', 'navBar'] as const;

describe('the contrast formula', () => {
  test('matches the WCAG reference values', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrast('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    // Order does not matter.
    expect(contrast('#767676', '#FFFFFF')).toBeCloseTo(contrast('#FFFFFF', '#767676'), 10);
    // #767676 on white is the well-known lightest grey that passes AA.
    expect(contrast('#767676', '#FFFFFF')).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast('#777777', '#FFFFFF')).toBeLessThan(AA_TEXT);
  });
});

describe.each(PALETTES)('%s palette', (_name, p) => {
  test.each(TEXT.flatMap((fg) => FILLS.map((bg) => [fg, bg] as const)))('%s text on %s is at least 4.5:1', (fg, bg) => {
    expect(contrast(p[fg], p[bg])).toBeGreaterThanOrEqual(AA_TEXT);
  });

  test('danger badge: red text on its pale red fill is at least 4.5:1', () => {
    expect(contrast(p.red, p.redBg)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  test('accent: dark text on lime, and olive links on lime, are at least 4.5:1', () => {
    expect(contrast('#1A1A1A', p.lime)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(p.ink, p.lime)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(p.olive, p.lime)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  test('inverted: white on ink (avatars, dark badges) and lime on the nav pill are at least 4.5:1', () => {
    expect(contrast('#FFFFFF', p.ink)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast(p.lime, p.navPill)).toBeGreaterThanOrEqual(AA_TEXT);
    expect(contrast('#FFFFFF', p.navPill)).toBeGreaterThanOrEqual(AA_TEXT);
  });

  test('field borders, chip outlines and the off switch track are at least 3:1 (1.4.11)', () => {
    for (const bg of ['bg', 'surface', 'panel'] as const) expect(contrast(p.outline, p[bg])).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  test("the chart's previous-period line is at least 3:1 on the card it is drawn on", () => {
    expect(contrast(p.previous, p.surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  test('the focus ring (ink) is at least 3:1 on every fill', () => {
    for (const bg of FILLS) expect(contrast(p.ink, p[bg])).toBeGreaterThanOrEqual(AA_NON_TEXT);
    expect(contrast(p.ink, p.lime)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  test('every text style in the type scale uses a colour that passes AA on the page', () => {
    for (const style of Object.values(typeScale(p))) expect(contrast(style.color, p.bg)).toBeGreaterThanOrEqual(AA_TEXT);
  });
});

describe('high contrast', () => {
  test('is at least as strong as standard for every text pair', () => {
    for (const fg of TEXT)
      for (const bg of FILLS) expect(contrast(HIGH_CONTRAST[fg], HIGH_CONTRAST[bg])).toBeGreaterThanOrEqual(contrast(STANDARD[fg], STANDARD[bg]) - 0.01);
  });

  test('makes dividers visible (3:1), which standard leaves decorative', () => {
    expect(contrast(HIGH_CONTRAST.line, HIGH_CONTRAST.surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
  });

  test('body text reaches AAA (7:1)', () => {
    expect(contrast(HIGH_CONTRAST.ink, HIGH_CONTRAST.bg)).toBeGreaterThanOrEqual(7);
    expect(contrast(HIGH_CONTRAST.muted, HIGH_CONTRAST.bg)).toBeGreaterThanOrEqual(7);
  });
});

describe('colorblind mode', () => {
  test('swaps olive / red for blue / orange, which red-green colour blindness can tell apart', () => {
    for (const base of [STANDARD, HIGH_CONTRAST]) {
      const cb = colorblindSafe(base);
      expect(cb.olive).not.toBe(base.olive);
      expect(cb.red).not.toBe(base.red);
      // Blue has more blue than red; orange the other way round.
      const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
      expect(rgb(cb.olive)[2]).toBeGreaterThan(rgb(cb.olive)[0]);
      expect(rgb(cb.red)[0]).toBeGreaterThan(rgb(cb.red)[2]);
    }
  });

  test('the good / bad pair also differs in lightness, not only hue', () => {
    for (const base of [STANDARD, HIGH_CONTRAST]) {
      const cb = colorblindSafe(base);
      expect(contrast(cb.olive, cb.red)).toBeGreaterThan(1.05);
    }
  });

  test('paletteFor picks the palette for the preferences', () => {
    expect(paletteFor(DEFAULT_PREFERENCES)).toBe(STANDARD);
    expect(paletteFor({ highContrast: true, colorblindMode: false })).toBe(HIGH_CONTRAST);
    expect(paletteFor({ highContrast: true, colorblindMode: true })).toEqual(colorblindSafe(HIGH_CONTRAST));
  });
});
