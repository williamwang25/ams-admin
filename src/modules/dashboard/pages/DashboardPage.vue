<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-base-content">看板</h1>
        <p class="text-xs text-base-content/50 mt-1">
          数据来自 <code>asset.summary</code> 一次性聚合查询
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

    <!-- 5 张指标卡 -->
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
          <span v-if="loading && !summary" class="loading loading-dots loading-sm" />
          <template v-else-if="card.disabled">--</template>
          <template v-else>{{ card.value }}</template>
        </div>
        <div class="mt-1 text-xs text-base-content/40">{{ card.hint }}</div>
      </RouterLink>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 按状态分布（饼/条） -->
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <div class="flex items-baseline justify-between mb-3">
          <h2 class="text-base font-medium text-base-content">按状态分布</h2>
          <span class="text-xs text-base-content/50">共 {{ summary?.total ?? 0 }} 条</span>
        </div>
        <div v-if="loading && !summary" class="py-6 text-sm text-base-content/40 text-center">
          <span class="loading loading-spinner loading-sm" />
        </div>
        <div v-else-if="!summary || summary.total === 0" class="py-6 text-sm text-base-content/40 text-center">
          暂无数据
        </div>
        <ul v-else class="space-y-2">
          <li v-for="row in statusRows" :key="row.status" class="text-sm">
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
              <div
                class="h-full rounded-full"
                :class="row.barClass"
                :style="{ width: row.percent + '%' }"
              />
            </div>
          </li>
        </ul>
      </div>

      <!-- 按部门 top 10 -->
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <div class="flex items-baseline justify-between mb-3">
          <h2 class="text-base font-medium text-base-content">部门资产 Top 10</h2>
          <span class="text-xs text-base-content/50">按资产数排序</span>
        </div>
        <div v-if="loading && !summary" class="py-6 text-sm text-base-content/40 text-center">
          <span class="loading loading-spinner loading-sm" />
        </div>
        <div v-else-if="!summary || summary.by_dept.length === 0" class="py-6 text-sm text-base-content/40 text-center">
          暂无数据
        </div>
        <ul v-else class="space-y-2">
          <li v-for="row in deptRows" :key="row.dept_name" class="text-sm">
            <div class="flex items-baseline justify-between">
              <span class="truncate flex-1">{{ row.dept_name }}</span>
              <span class="font-mono text-xs ml-2">
                {{ row.count }} 件 · ¥{{ formatMoney(row.value) }}
              </span>
            </div>
            <div class="mt-1 h-2 rounded-full bg-base-200 overflow-hidden">
              <div class="h-full rounded-full bg-primary" :style="{ width: row.percent + '%' }" />
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- 未上线模块占位 -->
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-lg border border-dashed border-base-300 bg-base-100 p-5 shadow-card">
        <h2 class="text-base font-medium text-base-content/50">通知公告</h2>
        <p class="mt-2 text-sm text-base-content/40">通知模块上线后启用（ams_notice）</p>
      </div>
      <div class="rounded-lg border border-dashed border-base-300 bg-base-100 p-5 shadow-card">
        <h2 class="text-base font-medium text-base-content/50">出入仓曲线</h2>
        <p class="mt-2 text-sm text-base-content/40">借用模块上线后启用（ams_borrow_request）</p>
      </div>
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
import StatusTag from "@/components/StatusTag.vue";
import { formatMoney } from "@/utils/format";
import { CloudFunctionError } from "@/utils/http";
import {
  ASSET_STATUS_BADGE,
  ASSET_STATUS_LABEL,
  type AssetBusinessStatus,
} from "@/utils/status";

const summary = ref<AssetSummary | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const fetchAll = async () => {
  loading.value = true;
  error.value = null;
  try {
    summary.value = await getAssetSummary();
  } catch (err) {
    if (err instanceof CloudFunctionError) error.value = err.message;
    else if (err instanceof Error) error.value = err.message;
    else error.value = "加载失败";
  } finally {
    loading.value = false;
  }
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
      disabled: false,
    },
    {
      key: "value",
      label: "资产总值",
      hint: "单价合计（元）",
      value: "¥" + formatMoney(s?.total_value ?? 0),
      icon: Wallet,
      to: { name: "asset-list" },
      disabled: false,
    },
    {
      key: "in_use",
      label: "使用中",
      hint: "business_status=IN_USE",
      value: String(inUse),
      icon: CheckCircle2,
      to: { name: "asset-list" },
      disabled: false,
    },
    {
      key: "lent",
      label: "出借中",
      hint: "business_status=LENT",
      value: String(lent),
      icon: Send,
      to: { name: "asset-list" },
      disabled: false,
    },
    {
      key: "pending",
      label: "待审批",
      hint: "借用模块上线后启用",
      value: "--",
      icon: AlertTriangle,
      to: { name: "asset-list" },
      disabled: true,
    },
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

// 把 badge-* 类转成等价的 bg-* 类用于进度条颜色
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
  return STATUS_ORDER
    .map((status) => {
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
    })
    .filter((r) => r.count > 0);
});

const deptRows = computed(() => {
  const s = summary.value;
  if (!s || s.by_dept.length === 0) return [];
  const max = s.by_dept[0]?.count || 1;
  return s.by_dept.map((d) => ({
    ...d,
    percent: Math.max(2, Math.round((d.count / max) * 100)),
  }));
});

onMounted(fetchAll);
</script>
