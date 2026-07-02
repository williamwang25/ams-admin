<template>
  <section class="space-y-4">
    <header>
      <h1 class="text-xl font-semibold text-base-content">大型资产</h1>
      <p class="mt-1 text-xs text-base-content/50">
        单价 ≥ 50,000 元判定为大型资产（与 docs/03 默认阈值一致）
      </p>
    </header>

    <div v-if="summaryError" class="alert alert-error py-2 text-sm">
      <span>{{ summaryError }}</span>
    </div>

    <div class="grid gap-4 md:grid-cols-4">
      <div
        v-for="card in metricCards"
        :key="card.key"
        class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card"
      >
        <div class="text-sm text-base-content/60">{{ card.label }}</div>
        <div class="mt-2 text-2xl font-semibold text-base-content">
          <span v-if="summaryLoading" class="loading loading-dots loading-sm" />
          <template v-else>{{ card.value }}</template>
        </div>
        <div class="mt-1 text-xs text-base-content/40">{{ card.hint }}</div>
      </div>
    </div>

    <div class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
      <form class="grid gap-3 md:grid-cols-4" @submit.prevent="applyFilter">
        <input
          v-model.trim="form.keyword"
          class="input input-bordered input-sm"
          placeholder="名称 / 编号关键字"
        />
        <select v-model="form.business_status" class="select select-bordered select-sm">
          <option value="">全部状态</option>
          <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <input
          v-model.trim="form.dept_code"
          class="input input-bordered input-sm"
          placeholder="部门代码"
        />
        <div class="flex gap-2">
          <button type="submit" class="btn btn-primary btn-sm flex-1">筛选</button>
          <button type="button" class="btn btn-ghost btn-sm" @click="resetFilter">重置</button>
        </div>
      </form>
    </div>

    <div v-if="listError" class="alert alert-error py-2 text-sm">
      <span>{{ listError }}</span>
    </div>

    <div class="rounded-lg border border-base-300 bg-base-100 shadow-card overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>资产编号</th>
            <th>名称</th>
            <th>部门</th>
            <th>状态</th>
            <th class="text-right">单价</th>
            <th class="text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="py-10 text-center text-sm text-base-content/40">
              <span class="loading loading-spinner loading-sm" /> 加载中
            </td>
          </tr>
          <tr v-else-if="list.length === 0">
            <td colspan="6" class="py-10 text-center text-sm text-base-content/40">暂无大型资产</td>
          </tr>
          <tr v-for="item in list" :key="item._id" class="hover">
            <td class="font-mono text-xs">{{ item.asset_no }}</td>
            <td>{{ item.name || "-" }}</td>
            <td>{{ item.dept_name || "-" }}</td>
            <td><StatusTag type="asset" :status="item.business_status" /></td>
            <td class="text-right font-mono text-xs">¥{{ formatMoney(item.unit_price ?? 0) }}</td>
            <td class="text-right">
              <RouterLink
                :to="{ name: 'asset-detail', params: { id: item._id } }"
                class="btn btn-ghost btn-xs"
              >
                详情
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <span class="text-xs text-base-content/50">第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 条</span>
      <div class="join">
        <button class="btn btn-sm join-item" :disabled="page <= 1" @click="goPage(page - 1)">上一页</button>
        <button class="btn btn-sm join-item" :disabled="page >= totalPages" @click="goPage(page + 1)">下一页</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { getAssetSummary, listAssets } from "@/modules/asset/api";
import type { Asset, AssetListFilter, AssetSummary } from "@/modules/asset/types";
import StatusTag from "@/components/StatusTag.vue";
import { formatMoney } from "@/utils/format";
import { CloudFunctionError } from "@/utils/http";
import type { AssetBusinessStatus } from "@/utils/status";

const STATUS_OPTIONS: Array<{ value: AssetBusinessStatus; label: string }> = [
  { value: "IDLE", label: "闲置" },
  { value: "IN_USE", label: "使用中" },
  { value: "LENT", label: "出借中" },
  { value: "PENDING", label: "审批中" },
  { value: "MAINTAIN", label: "维修中" },
  { value: "SCRAPPED", label: "已报废" },
];

const PAGE_SIZE = 20;

const summary = ref<AssetSummary | null>(null);
const summaryLoading = ref(false);
const summaryError = ref<string | null>(null);

const form = reactive({
  keyword: "",
  dept_code: "",
  business_status: "" as AssetBusinessStatus | "",
});

const list = ref<Asset[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const listError = ref<string | null>(null);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));

const usageRate = computed(() => {
  const s = summary.value;
  if (!s || s.large_count === 0) return "0%";
  return `${Math.round((s.large_lent_count / s.large_count) * 1000) / 10}%`;
});

const metricCards = computed(() => {
  const s = summary.value;
  return [
    {
      key: "total",
      label: "大型资产总数",
      value: String(s?.large_count ?? 0),
      hint: "is_large=true",
    },
    {
      key: "value",
      label: "大型资产总值",
      value: "¥" + formatMoney(s?.large_value ?? 0),
      hint: "单价合计",
    },
    {
      key: "lent",
      label: "当前借出数",
      value: String(s?.large_lent_count ?? 0),
      hint: "business_status=LENT",
    },
    {
      key: "usage",
      label: "当前借出占比",
      value: usageRate.value,
      hint: "借出数 / 大型资产总数",
    },
  ];
});

const fetchSummary = async () => {
  summaryLoading.value = true;
  summaryError.value = null;
  try {
    summary.value = await getAssetSummary();
  } catch (err) {
    summaryError.value = err instanceof CloudFunctionError ? err.message : "指标加载失败";
  } finally {
    summaryLoading.value = false;
  }
};

const fetchPage = async () => {
  loading.value = true;
  listError.value = null;
  try {
    const filter: AssetListFilter = { is_large: true };
    if (form.keyword) filter.keyword = form.keyword;
    if (form.dept_code) filter.dept_code = form.dept_code;
    if (form.business_status) filter.business_status = form.business_status;

    const res = await listAssets({
      page: page.value,
      pageSize: PAGE_SIZE,
      filter,
      sort: { field: "unit_price", order: "desc" },
    });
    list.value = res.list;
    total.value = res.total;
  } catch (err) {
    listError.value = err instanceof CloudFunctionError ? err.message : "列表加载失败";
    list.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const applyFilter = () => {
  page.value = 1;
  fetchPage();
};

const resetFilter = () => {
  form.keyword = "";
  form.dept_code = "";
  form.business_status = "";
  applyFilter();
};

const goPage = (n: number) => {
  page.value = n;
  fetchPage();
};

onMounted(() => {
  fetchSummary();
  fetchPage();
});
</script>
