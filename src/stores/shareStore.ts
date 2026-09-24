import { defineStore } from 'pinia';
import type { Trip } from '../models/trip';
import type { DayPlan } from '../models/dayPlan';
import type { Spot } from '../models/spot';
import type { ShareSheet } from '../models/shareSheet';
import { shareApi } from '../api/shareApi';
import { buildShareSheet, shareFingerprint } from '../utils/shareSheet';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';

export const useShareStore = defineStore('share', {
  state: () => ({ sheets: shareApi.list() as ShareSheet[] }),
  getters: {
    byTripId: (state) => (tripId: string) => state.sheets.find((sheet) => sheet.trip_id === tripId),
  },
  actions: {
    publish(trip: Trip, dayPlans: DayPlan[], spots: Spot[]) {
      const sheet = buildShareSheet(trip, dayPlans, spots);
      const index = this.sheets.findIndex((item) => item.trip_id === trip.id);
      if (index >= 0) this.sheets.splice(index, 1, sheet);
      else this.sheets.unshift(sheet);
      shareApi.save(this.sheets);
      toast.ok(messages.sharePublished);
      return sheet.id;
    },
    hasUnpublishedChanges(trip: Trip, dayPlans: DayPlan[], spots: Spot[]) {
      const sheet = this.sheets.find((item) => item.trip_id === trip.id);
      if (!sheet) return false;
      return sheet.fingerprint !== shareFingerprint(trip, dayPlans, spots);
    },
  },
});
