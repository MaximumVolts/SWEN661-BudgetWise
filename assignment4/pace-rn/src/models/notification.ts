export type NotificationKind = 'overdue' | 'overBudget' | 'nearLimit' | 'reminder';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  isNew: boolean;
  /** "Bill overdue" */
  metaLabel: string;
  title: string;
  body: string;
  /** If set, shows filled / outlined action buttons under the message. */
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

export interface NotificationsData {
  filterLabels: string[];
  selectedFilter: number;
  items: NotificationItem[];
}
