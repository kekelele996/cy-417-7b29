import type { Trip } from '../models/trip';
import type { DayPlan } from '../models/dayPlan';
import type { Spot } from '../models/spot';
import type { ShareSheet } from '../models/shareSheet';
import { budgetStatus } from './budgetCalculator';

function tripDaysOf(trip: Trip, dayPlans: DayPlan[]) {
  return dayPlans.filter((day) => day.trip_id === trip.id).sort((a, b) => a.day_index - b.day_index);
}

export function shareFingerprint(trip: Trip, dayPlans: DayPlan[], spots: Spot[]): string {
  const spotMap = new Map(spots.map((spot) => [spot.id, spot]));
  const days = tripDaysOf(trip, dayPlans).map((day) => {
    const items = day.items.map((item) => {
      const spot = spotMap.get(item.spot_id);
      return [item.spot_id, spot?.name || '', spot?.price ?? 0, item.start_time, item.end_time, item.note, item.transport].join('~');
    });
    return [day.day_index, day.date, items.join('|')].join(',');
  });
  return [trip.title, trip.destination, trip.start_date, trip.end_date, trip.budget, trip.currency, days.join(';')].join('#');
}

export function buildShareSheet(trip: Trip, dayPlans: DayPlan[], spots: Spot[], version = 1): ShareSheet {
  const spotMap = new Map(spots.map((spot) => [spot.id, spot]));
  const days = tripDaysOf(trip, dayPlans);
  const status = budgetStatus(trip, days, spots);
  return {
    id: crypto.randomUUID(),
    trip_id: trip.id,
    title: trip.title,
    destination: trip.destination,
    start_date: trip.start_date,
    end_date: trip.end_date,
    version,
    published_at: new Date().toISOString(),
    days: days.map((day) => ({
      day_index: day.day_index,
      date: day.date,
      items: day.items.map((item) => ({
        spot_id: item.spot_id,
        spot_name: spotMap.get(item.spot_id)?.name || '未知景点',
        start_time: item.start_time,
        end_time: item.end_time,
        note: item.note,
        transport: item.transport,
      })),
    })),
    budget: { budget: trip.budget, currency: trip.currency, spent: status.spent, remaining: status.remaining },
    fingerprint: shareFingerprint(trip, dayPlans, spots),
  };
}
