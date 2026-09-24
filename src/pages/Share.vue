<template>
  <main class="page">
    <template v-if="sheet">
      <el-alert v-if="stale" type="warning" :closable="false" :title="messages.shareStale" show-icon />
      <TripHeader :trip="snapshotTrip" />
      <p class="muted">分享单第 {{ sheet.version }} 版 · 发布于 {{ formatDateTime(sheet.published_at) }}</p>
      <section class="grid">
        <BudgetChart :spent="sheet.budget.spent" :remaining="sheet.budget.remaining" />
        <div class="band">
          <strong>预算</strong>
          <p>总预算 {{ formatCurrency(sheet.budget.budget, sheet.budget.currency) }} · 已计划 {{ formatCurrency(sheet.budget.spent, sheet.budget.currency) }}</p>
          <p class="muted">剩余 {{ formatCurrency(sheet.budget.remaining, sheet.budget.currency) }}</p>
        </div>
      </section>
      <DayTimeline v-for="day in snapshotDays" :key="day.id" :day="day" :spots="snapshotSpots" />
      <el-button type="primary" @click="copyText">复制行程文本</el-button>
    </template>
    <EmptyState v-else :title="messages.emptyShare" />
  </main>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import { useShareSheetStore } from '../stores/shareSheetStore';
import { shareFingerprint } from '../utils/shareSheetBuilder';
import { formatCurrency, formatDateTime, transportText } from '../utils/formatters';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';
import { TripStatus } from '../constants/trip';
import type { Trip } from '../models/trip';
import type { DayPlan } from '../models/dayPlan';
import type { Spot } from '../models/spot';
import TripHeader from '../components/common/TripHeader.vue';
import DayTimeline from '../components/common/DayTimeline.vue';
import BudgetChart from '../components/common/BudgetChart.vue';
import EmptyState from '../components/common/EmptyState.vue';
const route = useRoute();
const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
const shareSheetStore = useShareSheetStore();
const sheet = computed(() => {
  const tripId = String(route.params.tripId || '');
  return (tripId && shareSheetStore.sheetOf(tripId)) || shareSheetStore.sheets[0];
});
const trip = computed(() => tripStore.trips.find((item) => item.id === sheet.value?.trip_id));
const stale = computed(() => !!sheet.value && !!trip.value && sheet.value.fingerprint !== shareFingerprint(trip.value, dayPlanStore.dayPlans, spotStore.spots));
const snapshotTrip = computed<Trip>(() => ({
  id: sheet.value!.trip_id,
  title: sheet.value!.title,
  destination: sheet.value!.destination,
  start_date: sheet.value!.start_date,
  end_date: sheet.value!.end_date,
  budget: sheet.value!.budget.budget,
  currency: sheet.value!.budget.currency,
  members: [],
  status: TripStatus.PLANNING,
  created_at: sheet.value!.published_at,
}));
const snapshotDays = computed<DayPlan[]>(() => !sheet.value ? [] : sheet.value.days.map((day) => ({
  id: sheet.value!.id + '-' + day.day_index,
  trip_id: sheet.value!.trip_id,
  day_index: day.day_index,
  date: day.date,
  items: day.items.map((item) => ({ spot_id: item.spot_id, start_time: item.start_time, end_time: item.end_time, note: item.note, transport: item.transport })),
})));
const snapshotSpots = computed<Spot[]>(() => !sheet.value ? [] : sheet.value.days.flatMap((day) => day.items.map((item) => ({ id: item.spot_id, name: item.spot_name }) as Spot)));
function copyText() {
  if (!sheet.value) return;
  const current = sheet.value;
  const lines = [
    `TripWeaver 行程单：${current.title}（第 ${current.version} 版 · 发布于 ${formatDateTime(current.published_at)}）`,
    ...current.days.flatMap((day) => [
      `第 ${day.day_index} 天 · ${day.date}`,
      ...day.items.map((item) => `  ${item.start_time}-${item.end_time} ${item.spot_name}（${transportText[item.transport]}）${item.note}`),
    ]),
    `预算 ${formatCurrency(current.budget.budget, current.budget.currency)} · 已计划 ${formatCurrency(current.budget.spent, current.budget.currency)} · 剩余 ${formatCurrency(current.budget.remaining, current.budget.currency)}`,
  ];
  if (stale.value) lines.push('※ 行程已有未发布改动，本行程单为旧版本');
  navigator.clipboard?.writeText(lines.join('\n'));
  toast.ok(messages.shareCopied);
}
</script>
