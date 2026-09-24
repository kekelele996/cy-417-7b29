import type { DayPlanItem } from './dayPlan';

export interface ShareSheetItem {
  spot_id: string;
  spot_name: string;
  start_time: string;
  end_time: string;
  note: string;
  transport: DayPlanItem['transport'];
}

export interface ShareSheetDay {
  day_index: number;
  date: string;
  items: ShareSheetItem[];
}

export interface ShareSheetBudget {
  budget: number;
  currency: string;
  spent: number;
  remaining: number;
}

export interface ShareSheet {
  id: string;
  trip_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  version: number;
  published_at: string;
  days: ShareSheetDay[];
  budget: ShareSheetBudget;
  fingerprint: string;
}
