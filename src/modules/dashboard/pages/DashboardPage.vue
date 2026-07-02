<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-base-content">看板</h1>
        <p class="text-xs text-base-content/50 mt-1">
          数据来自 <code>asset.summary</code> + <code>borrow.summary</code> + <code>notice.list</code>
        </p>
      </div>
      <button class="btn btn-ghost btn-sm" :disabled="loading" @click="fetchAll">
        <RefreshCw :size="14" :class="loading ? 'animate-spin' : ''" />
        刷新
      </button>
    </header>

    <div v-if="error" class="alert alert-error py-2 text-sm">
      <span>{{ error }}</span>
    </div>

    <!-- 核心指标 5 卡 -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <RouterLink
        v-for="card in summaryCards"
        :key="card.key"
        :to="card.to"
        class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card hover:border-primary transition-colors"
      >
        <div class="flex items-center justify-between text-sm text-base-content/60">
          <span>{{ card.label }}</span>
          <component :is="card.icon" :size="14" class="text-base-content/40" />
        </div>
        <div class="mt-2 text-2xl font-semibold text-base-content">
          <span v-if="loading && !summary" class="skeleton h-8 w-16 inline-block" />
          <template v-else>{{ card.value }}</template>
        </div>
        <div class="mt-1 text-xs text-base-content/40">{{ card.hint }}</div>
      </RouterLink>
    </div>

    <!-- 今日动态 + 大型资产快捷 -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
        <div class="text-sm text-base-content/60">今日借出申请</div>
        <div class="mt-2 text-xl font-semibold">
          <span v-if="loading && !borrowSummary" class="skeleton h-7 w-10 inline-block" />
          <template v-else>{{ borrowSummary?.today_borrow ?? 0 }}</template>
        </div>
      </div>
      <div class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
        <div class="text-sm text-base-content/60">今日归还</div>
        <div class="mt-2 text-xl font-semibold">
          <span v-if="loading && !borrowSummary" class="skeleton h-7 w-10 inline-block" />
          <template v-else>{{ borrowSummary?.today_return ?? 0 }}</template>
        </div>
      </div>
      <RouterLink
        to="/large-assets"
        class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card hover:border-primary transition-colors"
      >
        <div class="text-sm text-base-content/60">大型资产</div>
        <div class="mt-2 text-xl font-semibold">
          <span v-if="loading && !summary" class="skeleton h-7 w-10 inline-block" />
          <template v-else>{{ summary?.large_count ?? 0 }} 件</template>
        </div>
        <div class="mt-1 text-xs text-base-content/40">¥{{ formatMoney(summary?.large_value ?? 0) }}</div>
      </RouterLink>
      <RouterLink
        to="/large-assets"
        class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card hover:border-primary transition-colors"
      >
        <div class="text-sm text-base-content/60">大型资产借出中</div>
        <div class="mt-2 text-xl font-semibold">
          <span v-if="loading && !summary" class="skeleton h-7 w-10 inline-block" />
          <template v-else>{{ summary?.large_lent_count ?? 0 }}</template>
        </div>
      </RouterLink>
    </div>

    <!-- 出入仓统计 -->
    <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
      <h2 class="text-base font-medium text-base-content mb-3">出入仓统计</h2>
      <div v-if="loading && !borrowSummary" class="py-4">
        <span class="loading loading-spinner loading-sm" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>维度</th>
              <th class="text-right">借出笔数</th>
              <th class="text-right">归还笔数</th>
              <th class="text-right">借出金额</th>
              <th class="text-right">归还金额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in inoutRows" :key="row.label">
              <td>{{ row.label }}</td>
              <td class="text-right font-mono text-xs">{{ row.borrow_count }}</td>
              <td class="text-right font-mono text-xs">{{ row.return_count }}</td>
              <td class="text-right font-mono text-xs">¥{{ formatMoney(row.borrow_amount) }}</td>
              <td class="text-right font-mono text-xs">¥{{ formatMoney(row.return_amount) }}</td>
            </tr>
          </tbody>
        </table>
        <p class="mt-2 text-xs text-base-content/40">
          借出笔数按申请创建日统计；归还按 returned_at；金额为 items 单价×数量合计。
        </p>
      </div>
    </div>

    <!-- 总账 + 通知 -->
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <div class="flex items-baseline justify-between mb-3">
          <h2 class="text-base font-medium text-base-content">总账信息（部门 Top 10）</h2>
        </div>
        <div v-if="loading && !summary" class="py-6 text-center">
          <span class="loading loading-spinner loading-sm" />
        </div>
        <div v-else-if="!summary || summary.by_dept.length === 0" class="py-6 text-sm text-base-content/40 text-center">
          暂无数据
        </div>
        <div v-else class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>部门</th>
                <th class="text-right">资产数</th>
                <th class="text-right">总金额</th>
                <th class="text-right">借出中</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in summary.by_dept" :key="row.dept_name">
                <td class="truncate max-w-[8rem]">{{ row.dept_name }}</td>
                <td class="text-right font-mono text-xs">{{ row.count }}</td>
                <td class="text-right font-mono text-xs">¥{{ formatMoney(row.value) }}</td>
                <td class="text-right font-mono text-xs">{{ row.lent_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <div class="flex items-baseline justify-between mb-3">
          <h2 class="text-base font-medium text-base-content">通知公告</h2>
          <RouterLink to="/notices" class="text-xs text-primary hover:underline">管理</RouterLink>
        </div>
        <div v-if="noticeLoading" class="py-6 text-center">
          <span class="loading loading-spinner loading-sm" />
        </div>
        <div v-else-if="noticeError" class="text-sm text-error">{{ noticeError }}</div>
        <ul v-else-if="notices.length" class="space-y-2">
          <li v-for="n in notices" :key="n._id">
            <RouterLink to="/notices" class="block text-sm hover:text-primary">
              <span
                v-if="n.level === 'IMPORTANT'"
                class="badge badge-warning badge-xs mr-1"
              >重要</span>
              {{ n.title }}
            </RouterLink>
            <div class="text-xs text-base-content/40">{{ formatDateTime(n.published_at ?? n.updated_at) }}</div>
          </li>
        </ul>
        <p v-else class="py-6 text-sm text-base-content/40 text-center">暂无已发布通知</p>
      </div>
    </div>

    <!-- 四图区 -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 状态饼图 -->
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <div class="flex items-baseline justify-between mb-3">
          <h2 class="text-base font-medium text-base-content">按状态占比</h2>
          <span class="text-xs text-base-content/50">共 {{ summary?.total ?? 0 }} 条</span>
        </div>
        <div v-if="loading && !summary" class="py-6 text-center">
          <span class="loading loading-spinner loading-sm" />
        </div>
        <div v-else-if="statusPieSlices.length === 0" class="py-6 text-sm text-base-content/40 text-center">
          暂无数据
        </div>
        <div v-else class="flex flex-col md:flex-row items-center gap-4">
          <svg viewBox="0 0 100 100" class="w-36 h-36 shrink-0 -rotate-90">
            <circle
              v-for="slice in statusPieSlices"
              :key="slice.status"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              :stroke="slice.color"
              stroke-width="20"
              :stroke-dasharray="`${slice.dash} ${slice.gap}`"
              :stroke-dashoffset="slice.offset"
            />
          </svg>
          <ul class="flex-1 space-y-1 text-sm w-full">
            <li v-for="row in statusRows" :key="row.status" class="flex justify-between">
              <RouterLink
                :to="{ name: 'asset-list', query: { status: row.status } }"
                class="flex items-center gap-2 hover:text-primary"
              >
                <StatusTag type="asset" :status="row.status" />
              </RouterLink>
              <span class="font-mono text-xs">{{ row.percent }}%</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 部门柱状 -->
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <div class="flex items-baseline justify-between mb-3">
          <h2 class="text-base font-medium text-base-content">按部门资产分布</h2>
          <div class="join join-horizontal">
            <button
              type="button"
              class="btn btn-xs join-item"
              :class="deptMetric === 'count' ? 'btn-primary' : 'btn-ghost'"
              @click="deptMetric = 'count'"
            >
              数量
            </button>
            <button
              type="button"
              class="btn btn-xs join-item"
              :class="deptMetric === 'value' ? 'btn-primary' : 'btn-ghost'"
              @click="deptMetric = 'value'"
            >
              金额
            </button>
          </div>
        </div>
        <div v-if="loading && !summary" class="py-6 text-center">
          <span class="loading loading-spinner loading-sm" />
        </div>
        <ul v-else-if="deptRows.length" class="space-y-2">
          <li v-for="row in deptRows" :key="row.dept_name" class="text-sm">
            <div class="flex justify-between text-xs mb-1">
              <span class="truncate flex-1">{{ row.dept_name }}</span>
              <span class="font-mono ml-2">
                {{ deptMetric === "count" ? row.count + " 件" : "¥" + formatMoney(row.value) }}
              </span>
            </div>
            <div class="h-2 rounded-full bg-base-200 overflow-hidden">
              <div class="h-full rounded-full bg-primary" :style="{ width: row.percent + '%' }" />
            </div>
          </li>
        </ul>
        <p v-else class="py-6 text-sm text-base-content/40 text-center">暂无数据</p>
      </div>

      <!-- 出入仓数量折线（CSS） -->
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <div class="flex items-baseline justify-between mb-3">
          <h2 class="text-base font-medium text-base-content">出入仓数量曲线</h2>
          <div class="join join-horizontal">
            <button
              v-for="d in TREND_DAYS_OPTIONS"
              :key="d"
              type="button"
              class="btn btn-xs join-item"
              :class="trendDays === d ? 'btn-primary' : 'btn-ghost'"
              @click="changeTrendDays(d)"
            >
              {{ d }}天
            </button>
          </div>
        </div>
        <div v-if="trendLoading" class="py-6 text-center">
          <span class="loading loading-spinner loading-sm" />
        </div>
        <div v-else-if="trendRows.length === 0" class="py-6 text-sm text-base-content/40 text-center">
          暂无数据
        </div>
        <div v-else class="overflow-x-auto overscroll-x-contain">
          <div
            class="h-40 flex items-end gap-1 px-0.5"
            :style="{ width: trendQuantityChartWidth }"
          >
            <div
              v-for="row in trendRows"
              :key="row.date"
              class="w-7 shrink-0 flex flex-col items-center gap-0.5 h-full justify-end"
              :title="`${row.date} 借${row.borrow} 还${row.return}`"
            >
              <div class="w-full flex gap-px items-end h-32">
                <div
                  class="flex-1 bg-primary rounded-t-sm min-h-[2px]"
                  :style="{ height: row.borrowHeight + '%' }"
                />
                <div
                  class="flex-1 bg-success rounded-t-sm min-h-[2px]"
                  :style="{ height: row.returnHeight + '%' }"
                />
              </div>
              <span class="text-[10px] text-base-content/50 font-mono whitespace-nowrap">{{
                row.date.slice(5)
              }}</span>
            </div>
          </div>
        </div>
        <p class="mt-2 text-xs text-base-content/40 flex gap-3">
          <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-sm bg-primary" />借出</span>
          <span class="inline-flex items-center gap-1"><span class="w-2 h-2 rounded-sm bg-success" />归还</span>
        </p>
      </div>

      <!-- 出入仓金额折线 -->
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <div class="flex items-baseline justify-between mb-3">
          <h2 class="text-base font-medium text-base-content">出入仓金额曲线</h2>
          <span class="text-xs text-base-content/50">近 {{ trendDays }} 天</span>
        </div>
        <div v-if="trendLoading" class="py-6 text-center">
          <span class="loading loading-spinner loading-sm" />
        </div>
        <ul v-else-if="trendRows.length" class="space-y-1.5 max-h-48 overflow-y-auto">
          <li v-for="row in trendRows" :key="'amt-' + row.date" class="text-xs">
            <div class="flex justify-between font-mono text-base-content/60">
              <span>{{ row.date.slice(5) }}</span>
              <span>
                借 ¥{{ formatMoney(row.borrow_amount) }} · 还 ¥{{ formatMoney(row.return_amount) }}
              </span>
            </div>
            <div class="mt-1 flex h-1.5 gap-0.5 rounded-full bg-base-200 overflow-hidden">
              <div class="bg-primary" :style="{ width: row.borrowAmtPercent + '%' }" />
              <div class="bg-success" :style="{ width: row.returnAmtPercent + '%' }" />
            </div>
          </li>
        </ul>
        <p v-else class="py-6 text-sm text-base-content/40 text-center">暂无数据</p>
      </div>
    </div>

    <!-- 状态明细条（保留） -->
    <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
      <h2 class="text-base font-medium text-base-content mb-3">按状态分布明细</h2>
      <ul v-if="statusRows.length" class="space-y-2">
        <li v-for="row in statusRows" :key="'bar-' + row.status" class="text-sm">
          <div class="flex items-baseline justify-between">
            <RouterLink
              :to="{ name: 'asset-list', query: { status: row.status } }"
              class="hover:text-primary"
            >
              <StatusTag type="asset" :status="row.status" />
              <span class="ml-2 text-xs text-base-content/50">¥{{ formatMoney(row.value) }}</span>
            </RouterLink>
            <span class="font-mono text-xs">{{ row.count }} / {{ row.percent }}%</span>
          </div>
          <div class="mt-1 h-2 rounded-full bg-base-200 overflow-hidden">
            <div class="h-full rounded-full" :class="row.barClass" :style="{ width: row.percent + '%' }" />
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import {
  Package,
  Wallet,
  CheckCircle2,
  Send,
  AlertTriangle,
  RefreshCw,
} from "lucide-vue-next";
import { getAssetSummary } from "@/modules/asset/api";
import type { AssetSummary } from "@/modules/asset/types";
import { getBorrowSummary } from "@/modules/borrow/api";
import type { BorrowSummary } from "@/modules/borrow/types";
import { listNotices } from "@/modules/notice/api";
import type { Notice } from "@/modules/notice/types";
import StatusTag from "@/components/StatusTag.vue";
import { formatDateTime, formatMoney } from "@/utils/format";
import { CloudFunctionError } from "@/utils/http";
import {
  ASSET_STATUS_BADGE,
  ASSET_STATUS_LABEL,
  type AssetBusinessStatus,
} from "@/utils/status";

const TREND_DAYS_OPTIONS = [7, 30, 90] as const;
/** 数量曲线每列宽度（px），90 天时通过横向滚动浏览 */
const TREND_BAR_COLUMN_PX = 28;
const TREND_BAR_GAP_PX = 4;
type TrendDays = (typeof TREND_DAYS_OPTIONS)[number];

const summary = ref<AssetSummary | null>(null);
const borrowSummary = ref<BorrowSummary | null>(null);
const notices = ref<Notice[]>([]);
const loading = ref(false);
const trendLoading = ref(false);
const noticeLoading = ref(false);
const error = ref<string | null>(null);
const noticeError = ref<string | null>(null);
const trendDays = ref<TrendDays>(7);
const deptMetric = ref<"count" | "value">("count");

const PIE_COLORS: Record<AssetBusinessStatus, string> = {
  IDLE: "#9ca3af",
  IN_USE: "#38bdf8",
  LENT: "#0096C2",
  PENDING: "#f59e0b",
  MAINTAIN: "#f97316",
  SCRAPPED: "#ef4444",
};

const fetchBorrowSummary = async (days: TrendDays) => {
  trendLoading.value = true;
  try {
    borrowSummary.value = await getBorrowSummary({ days });
  } catch (err) {
    const msg = err instanceof CloudFunctionError ? err.message : "借用看板加载失败";
    error.value = error.value ? `${error.value}；${msg}` : msg;
  } finally {
    trendLoading.value = false;
  }
};

const fetchNotices = async () => {
  noticeLoading.value = true;
  noticeError.value = null;
  try {
    const res = await listNotices({ published_only: true, page: 1, pageSize: 5 });
    notices.value = res.list;
  } catch (err) {
    noticeError.value = err instanceof CloudFunctionError ? err.message : "通知加载失败";
    notices.value = [];
  } finally {
    noticeLoading.value = false;
  }
};

const fetchAll = async () => {
  loading.value = true;
  error.value = null;

  const [assetRes] = await Promise.allSettled([
    getAssetSummary(),
    fetchBorrowSummary(trendDays.value),
    fetchNotices(),
  ]);

  if (assetRes.status === "fulfilled") {
    summary.value = assetRes.value;
  } else {
    const e = assetRes.reason;
    error.value =
      e instanceof CloudFunctionError ? e.message : e instanceof Error ? e.message : "资产看板加载失败";
  }
  loading.value = false;
};

const changeTrendDays = async (days: TrendDays) => {
  if (trendDays.value === days) return;
  trendDays.value = days;
  await fetchBorrowSummary(days);
};

const summaryCards = computed(() => {
  const s = summary.value;
  const inUse = s?.by_status.IN_USE.count ?? 0;
  const lent = s?.by_status.LENT.count ?? 0;
  return [
    {
      key: "total",
      label: "资产总数",
      hint: "ams_asset 全部记录",
      value: String(s?.total ?? 0),
      icon: Package,
      to: { name: "asset-list" },
    },
    {
      key: "value",
      label: "资产总值",
      hint: "单价合计（元）",
      value: "¥" + formatMoney(s?.total_value ?? 0),
      icon: Wallet,
      to: { name: "asset-list" },
    },
    {
      key: "in_use",
      label: "使用中",
      hint: "business_status=IN_USE",
      value: String(inUse),
      icon: CheckCircle2,
      to: { name: "asset-list", query: { status: "IN_USE" } },
    },
    {
      key: "lent",
      label: "出借中",
      hint: "business_status=LENT",
      value: String(lent),
      icon: Send,
      to: { name: "asset-list", query: { status: "LENT" } },
    },
    {
      key: "pending",
      label: "待审批",
      hint: "borrow.summary.pending_count",
      value: String(borrowSummary.value?.pending_count ?? 0),
      icon: AlertTriangle,
      to: { name: "borrow-list", query: { status: "PENDING" } },
    },
  ];
});

const inoutRows = computed(() => {
  const stats = borrowSummary.value?.inout_stats;
  if (!stats) {
    return [
      { label: "今日", borrow_count: 0, return_count: 0, borrow_amount: 0, return_amount: 0 },
      { label: "本月", borrow_count: 0, return_count: 0, borrow_amount: 0, return_amount: 0 },
      { label: "累计", borrow_count: 0, return_count: 0, borrow_amount: 0, return_amount: 0 },
    ];
  }
  return [
    { label: "今日", ...stats.today },
    { label: "本月", ...stats.month },
    { label: "累计", ...stats.total },
  ];
});

const STATUS_ORDER: AssetBusinessStatus[] = [
  "IDLE",
  "IN_USE",
  "LENT",
  "PENDING",
  "MAINTAIN",
  "SCRAPPED",
];

const BADGE_TO_BG: Record<string, string> = {
  "badge-ghost": "bg-base-300",
  "badge-info": "bg-info",
  "badge-primary": "bg-primary",
  "badge-warning": "bg-warning",
  "badge-error": "bg-error",
  "badge-success": "bg-success",
};

const statusRows = computed(() => {
  const s = summary.value;
  if (!s || s.total === 0) return [];
  return STATUS_ORDER.map((status) => {
    const bucket = s.by_status[status] || { count: 0, value: 0 };
    const percent = s.total > 0 ? Math.round((bucket.count / s.total) * 1000) / 10 : 0;
    const badge = ASSET_STATUS_BADGE[status];
    return {
      status,
      label: ASSET_STATUS_LABEL[status],
      count: bucket.count,
      value: bucket.value,
      percent,
      barClass: BADGE_TO_BG[badge] || "bg-primary",
    };
  }).filter((r) => r.count > 0);
});

const statusPieSlices = computed(() => {
  const rows = statusRows.value;
  const total = rows.reduce((s, r) => s + r.count, 0);
  if (total === 0) return [];
  const circumference = 2 * Math.PI * 40;
  let offset = 0;
  return rows.map((row) => {
    const fraction = row.count / total;
    const dash = fraction * circumference;
    const slice = {
      status: row.status,
      color: PIE_COLORS[row.status],
      dash,
      gap: circumference - dash,
      offset: -offset,
    };
    offset += dash;
    return slice;
  });
});

const deptRows = computed(() => {
  const s = summary.value;
  if (!s || s.by_dept.length === 0) return [];
  const max =
    deptMetric.value === "count"
      ? s.by_dept[0]?.count || 1
      : s.by_dept.reduce((m, d) => Math.max(m, d.value), 1);
  return s.by_dept.map((d) => {
    const metric = deptMetric.value === "count" ? d.count : d.value;
    return {
      ...d,
      percent: Math.max(2, Math.round((metric / max) * 100)),
    };
  });
});

const trendRows = computed(() => {
  const t = borrowSummary.value?.trend ?? borrowSummary.value?.trend_7d ?? [];
  let maxCount = 1;
  let maxAmt = 1;
  for (const r of t) {
    maxCount = Math.max(maxCount, r.borrow, r.return);
    maxAmt = Math.max(maxAmt, r.borrow_amount ?? 0, r.return_amount ?? 0);
  }
  return t.map((r) => ({
    ...r,
    borrow_amount: r.borrow_amount ?? 0,
    return_amount: r.return_amount ?? 0,
    borrowHeight: Math.round((r.borrow / maxCount) * 100),
    returnHeight: Math.round((r.return / maxCount) * 100),
    borrowAmtPercent: Math.max(0, Math.round(((r.borrow_amount ?? 0) / maxAmt) * 50)),
    returnAmtPercent: Math.max(0, Math.round(((r.return_amount ?? 0) / maxAmt) * 50)),
  }));
});

/** 数量曲线：至少铺满容器，数据点多时扩展宽度以支持横向滚动 */
const trendQuantityChartWidth = computed(() => {
  const n = trendRows.value.length;
  if (n === 0) return "100%";
  const contentPx = n * TREND_BAR_COLUMN_PX + Math.max(0, n - 1) * TREND_BAR_GAP_PX;
  return `max(100%, ${contentPx}px)`;
});

onMounted(fetchAll);
</script>
