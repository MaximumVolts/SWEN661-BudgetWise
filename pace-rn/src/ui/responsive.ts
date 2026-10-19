import { useWindowDimensions } from 'react-native';

/** Windows at least this wide (in dp) get the tablet layout: iPads, Android tablets, phones in landscape. */
export const TABLET_MIN_WIDTH = 768;
/** Widest a single column of content gets on a tablet, so lines and rows stay readable. */
export const CONTENT_MAX_WIDTH = 720;
/** Widest a two-column screen (e.g. the dashboard) gets on a tablet. */
export const WIDE_CONTENT_MAX_WIDTH = 1100;

export interface Layout {
  isTablet: boolean;
  /** How many columns screens that support them should use. */
  columns: 1 | 2;
  /** Max width for screen content, or undefined to fill the window. */
  maxWidth?: number;
}

/** The layout for a window [width] dp wide; [wide] screens may use two columns on tablets. */
export function layoutFor(width: number, wide = false): Layout {
  const isTablet = width >= TABLET_MIN_WIDTH;
  if (!isTablet) return { isTablet, columns: 1 };
  return { isTablet, columns: wide ? 2 : 1, maxWidth: wide ? WIDE_CONTENT_MAX_WIDTH : CONTENT_MAX_WIDTH };
}

/** The current window's layout, updated on rotation and window resizes. */
export function useResponsive(wide = false): Layout {
  const { width } = useWindowDimensions();
  return layoutFor(width, wide);
}
