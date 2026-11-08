import { Platform, useWindowDimensions } from 'react-native';

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

/** Windows at least this wide get the desktop layout (sidebar, tables) in the desktop app. */
export const DESKTOP_MIN_WIDTH = 1024;

/** The desktop layout: the desktop (Electron / web) build in a window at least DESKTOP_MIN_WIDTH wide. Narrower windows use the tablet / phone layout. */
export const isDesktop = (platform: string, width: number) => platform === 'web' && width >= DESKTOP_MIN_WIDTH;

/** Whether to show the desktop layout now (updates as the window is resized). */
export function useDesktop(): boolean {
  const { width } = useWindowDimensions();
  return isDesktop(Platform.OS, width);
}
