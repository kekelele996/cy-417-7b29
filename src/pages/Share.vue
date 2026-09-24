<template>
  <main class="page" v-if="sheet">
    <el-alert v-if="outdated" type="warning" :title="messages.shareOutdated" show-icon :closable="false" />
    <TripHeader :trip="headerTrip" />
    <p class="muted">发布于 {{ formatDateTime(sheet.published_at) }}<template v-if="outdated"> · 行程后续有改动，重新发布后同伴才能看到</template></p>
    <div class="band">
      <strong>预算</strong>
      <p>预算 {{ formatCurrency(sheet.budget.budget, sheet.budget.currency) }} · 已花 {{ formatCurrency(sheet.budget.spent, sheet.budget.currency) }} · 剩余 {{ formatCurrency(sheet.budget.remaining, sheet.budget.currency) }}</p>
    </div>
    <DayTimeline v-for="day in sheet.days" :key="day.id" :day="day" :spots="spotStore.spots" />
    <el-button type="primary" @click="copyText">复制行程文本</el-button>
  </main>
  <main v-else class="page"><EmptyState :title="messages.shareEmpty" /></main>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import { useShareStore } from '../stores/shareStore';
import { TripStatus } from '../constants/trip';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';
import { formatCurrency, formatDateTime, transportText } from '../utils/formatters';
import type { Trip } from '../models/trip';
import TripHeader from '../components/common/TripHeader.vue';
import DayTimeline from '../components/common/DayTimeline.vue';
import EmptyState from '../components/common/EmptyState.vue';
const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
const shareStore = useShareStore();
const trip = computed(() => tripStore.trips[0]);
const sheet = computed(() => trip.value ? shareStore.byTripId(trip.value.id) : undefined);
const outdated = computed(() => trip.value ? shareStore.hasUnpublishedChanges(trip.value, dayPlanStore.dayPlans, spotStore.spots) : false);
const headerTrip = computed<Trip>(() => ({
  id: sheet.value?.trip_id || '',
  title: sheet.value?.title || '',
  destination: sheet.value?.destination || '',
  start_date: sheet.value?.start_date || '',
  end_date: sheet.value?.end_date || '',
  budget: sheet.value?.budget.budget || 0,
  currency: sheet.value?.budget.currency || 'CNY',
  members: trip.value?.members || [],
  status: trip.value?.status || TripStatus.PLANNING,
  created_at: sheet.value?.published_at || '',
}));
function copyText() {
  if (!sheet.value) return;
  const spotName = (id: string) => spotStore.spots.find((spot) => spot.id === id)?.name || '未知景点';
  const lines = sheet.value.days.map((day) => {
    const items = day.items.map((item) => `${item.start_time}-${item.end_time} ${spotName(item.spot_id)}（${transportText[item.transport]}）`).join(' → ');
    return `第${day.day_index}天 ${day.date}：${items || '暂无安排'}`;
  });
  const text = [`TripWeaver 行程单：${sheet.value.title}`, `发布于 ${formatDateTime(sheet.value.published_at)}`, ...lines].join('\n');
  navigator.clipboard?.writeText(text);
  toast.ok(messages.shareCopied);
}
</script>
