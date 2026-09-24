import type { Trip } from '../models/trip';
import type { DayPlan } from '../models/dayPlan';
import type { Spot } from '../models/spot';
import type { ShareSheet } from '../models/shareSheet';
import { budgetStatus } from './budgetCalculator';

export function shareFingerprint(trip: Trip, dayPlans: DayPlan[], spots: Spot[]) {
  const days = dayPlans.filter((day) => day.trip_id === trip.id);
  const budget = budgetStatus(trip, days, spots);
  return JSON.stringify({
    title: trip.title,
    budget: trip.budget,
    spent: budget.spent,
    days: days.map((day) => ({ day_index: day.day_index, date: day.date, items: day.items })),
  });
}

export function buildShareSheet(trip: Trip, dayPlans: DayPlan[], spots: Spot[]): ShareSheet {
  const days = dayPlans
    .filter((day) => day.trip_id === trip.id)
    .map((day) => JSON.parse(JSON.stringify(day)) as DayPlan);
  const budget = budgetStatus(trip, days, spots);
  return {
    id: crypto.randomUUID(),
    trip_id: trip.id,
    title: trip.title,
    destination: trip.destination,
    start_date: trip.start_date,
    end_date: trip.end_date,
    days,
    budget: { budget: trip.budget, spent: budget.spent, remaining: budget.remaining, currency: trip.currency },
    published_at: new Date().toISOString(),
    fingerprint: shareFingerprint(trip, dayPlans, spots),
  };
}
