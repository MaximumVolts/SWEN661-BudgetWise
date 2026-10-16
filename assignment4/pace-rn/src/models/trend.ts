export type TrendDirection = 'rising' | 'steady' | 'falling';

export const TREND_DIRECTION_LABEL: Record<TrendDirection, string> = { rising: 'Rising', steady: 'Steady', falling: 'Falling' };

export interface TrendItem {
  id: string;
  direction: TrendDirection;
  title: string;
  body: string;
  actionLabel: string;
}

export interface TrendsData {
  headline: string;
  trends: TrendItem[];
  aboutText?: string;
}
