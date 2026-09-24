import type { DayPlan } from './dayPlan';

export interface ShareSheetBudget {
  budget: number;
  spent: number;
  remaining: number;
  currency: string;
}

export interface ShareSheet {
  id: string;
  trip_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  days: DayPlan[];
  budget: ShareSheetBudget;
  published_at: string;
  fingerprint: string;
}
