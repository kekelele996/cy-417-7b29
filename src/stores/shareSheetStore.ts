import { defineStore } from 'pinia';
import type { ShareSheet } from '../models/shareSheet';
import type { Trip } from '../models/trip';
import type { DayPlan } from '../models/dayPlan';
import type { Spot } from '../models/spot';
import { shareSheetApi } from '../api/shareSheetApi';
import { buildShareSheet } from '../utils/shareSheetBuilder';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';

export const useShareSheetStore = defineStore('shareSheet', {
  state: () => ({ sheets: shareSheetApi.list() as ShareSheet[] }),
  getters: {
    sheetOf: (state) => (tripId: string) => state.sheets.find((sheet) => sheet.trip_id === tripId),
  },
  actions: {
    publish(trip: Trip, dayPlans: DayPlan[], spots: Spot[]) {
      const prev = this.sheets.find((sheet) => sheet.trip_id === trip.id);
      const sheet = buildShareSheet(trip, dayPlans, spots, (prev?.version || 0) + 1);
      this.sheets = [...this.sheets.filter((item) => item.trip_id !== trip.id), sheet];
      shareSheetApi.save(this.sheets);
      toast.ok(messages.sharePublished);
      return sheet;
    },
  },
});
