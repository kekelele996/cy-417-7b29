<template>
  <main class="page" v-if="trip">
    <TripHeader :trip="trip" />
    <div class="toolbar">
      <el-button type="primary" @click="router.push('/spots')">添加景点</el-button>
      <el-button @click="router.push('/planner/' + trip.id + '/1')">编排第 1 天</el-button>
      <el-button type="success" @click="publishShare">发布分享单</el-button>
      <el-button @click="router.push('/share/' + trip.id)">分享预览</el-button>
    </div>
    <p class="muted" v-if="shareSheet">
      分享单第 {{ shareSheet.version }} 版 · 发布于 {{ formatDateTime(shareSheet.published_at) }}
      <span v-if="hasUnpublishedChanges" class="stale">行程有未发布改动，重新发布后同伴才能看到</span>
    </p>
    <p class="muted" v-else>尚未发布分享单，发布后同伴才能看到固定版本。</p>
    <section class="grid">
      <BudgetChart :spent="stats.value.budget.spent" :remaining="stats.value.budget.remaining" />
      <div class="band"><strong>统计</strong><p>天数 {{ stats.value.days }} · 景点 {{ stats.value.spotCount }}</p><p class="muted">{{ stats.value.budget.warning }}</p></div>
    </section>
    <DayTimeline v-for="day in tripDays" :key="day.id" :day="day" :spots="spotStore.spots" />
  </main>
  <main v-else class="page"><EmptyState title="旅行不存在" /></main>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import { useShareSheetStore } from '../stores/shareSheetStore';
import { useTripStats } from '../hooks/useTripStats';
import { shareFingerprint } from '../utils/shareSheetBuilder';
import { formatDateTime } from '../utils/formatters';
import TripHeader from '../components/common/TripHeader.vue';
import DayTimeline from '../components/common/DayTimeline.vue';
import BudgetChart from '../components/common/BudgetChart.vue';
import EmptyState from '../components/common/EmptyState.vue';
const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
const shareSheetStore = useShareSheetStore();
const trip = computed(() => tripStore.trips.find((item) => item.id === route.params.id));
const tripDays = computed(() => dayPlanStore.dayPlans.filter((day) => day.trip_id === route.params.id));
const stats = computed(() => trip.value ? useTripStats(trip.value, dayPlanStore.dayPlans, spotStore.spots) : { value: { days: 0, spotCount: 0, budget: { spent: 0, remaining: 0, warning: '' } } });
const shareSheet = computed(() => trip.value ? shareSheetStore.sheetOf(trip.value.id) : undefined);
const hasUnpublishedChanges = computed(() => !!trip.value && !!shareSheet.value && shareSheet.value.fingerprint !== shareFingerprint(trip.value, dayPlanStore.dayPlans, spotStore.spots));
function publishShare() { if (trip.value) shareSheetStore.publish(trip.value, dayPlanStore.dayPlans, spotStore.spots); }
</script>
<style scoped>.stale { color: #b26a00; margin-left: 8px; }</style>
