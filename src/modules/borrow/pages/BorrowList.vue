<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-base-content">借用审批</h1>
        <p class="text-xs text-base-content/50 mt-1">
          数据来自 <code>borrow.adminList</code>，共 {{ total }} 条
        </p>
      </div>
      <button class="btn btn-ghost btn-sm" :disabled="loading" @click="fetchPage">
        <RefreshCw :size="14" :class="loading ? 'animate-spin' : ''" />
        刷新
      </button>
    </header>

    <div role="tablist" class="tabs tabs-bordered">
      <a
        v-for="t in TABS"
        :key="t.value ?? 'all'"
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === t.value }"
        @click="onTabChange(t.value)"
      >
        {{ t.label }}
      </a>
    </div>

    <div class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
      <form class="grid gap-3 md:grid-cols-4" @submit.prevent="applyFilter">
        <input
          v-model.trim="form.keyword"
          class="input input-bordered input-sm"
          placeholder="流水号 / 教师姓名 / 资产编号"
        />
        <input
          v-model="form.date_from"
          type="date"
          class="input input-bordered input-sm"
          aria-label="起始日期"
        />
        <input
          v-model="form.date_to"
          type="date"
          class="input input-bordered input-sm"
          aria-label="截止日期"
        />
        <div class="flex gap-2">
          <button type="submit" class="btn btn-primary btn-sm flex-1">筛选</button>
          <button type="button" class="btn btn-ghost btn-sm" @click="resetFilter">重置</button>
        </div>
      </form>
    </div>

    <div v-if="error" class="alert alert-error py-2 text-sm">
      <span>{{ error }}</span>
    </div>

    <div class="rounded-lg border border-base-300 bg-base-100 shadow-card overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>流水号</th>
            <th>教师</th>
            <th>申请时间</th>
            <th class="text-right">资产数</th>
            <th>用途</th>
            <th>最早拟归还</th>
            <th>状态</th>
            <th class="text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center text-sm text-base-content/40 py-10">
              <span class="loading loading-spinner loading-sm" /> 加载中
            </td>
          </tr>
          <tr v-else-if="list.length === 0">
            <td colspan="8" class="text-center text-sm text-base-content/40 py-10">
              暂无符合条件的借用申请
            </td>
          </tr>
          <tr v-for="row in list" :key="row._id" class="hover">
            <td class="font-mono text-xs">{{ row.serial_no }}</td>
            <td>
              <div class="text-sm">{{ row.teacher_name || "-" }}</div>
              <div class="text-xs text-base-content/50">{{ row.teacher_phone || "" }}</div>
            </td>
            <td class="text-xs">{{ formatDateTime(row.created_at) }}</td>
            <td class="text-right">{{ row.items.length }}</td>
            <td class="max-w-xs">
              <div class="truncate text-xs" :title="usageDigest(row)">{{ usageDigest(row) }}</div>
            </td>
            <td class="text-xs">{{ earliestReturn(row) }}</td>
            <td>
              <StatusTag type="borrow" :status="row.status" />
            </td>
            <td class="text-right">
              <RouterLink
                :to="{ name: 'borrow-detail', params: { id: row._id } }"
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
      <span class="text-xs text-base-content/50">
        第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 条
      </span>
      <div class="join">
        <button class="btn btn-sm join-item" :disabled="page <= 1" @click="goPage(page - 1)">
          上一页
        </button>
        <button class="btn btn-sm join-item" :disabled="page >= totalPages" @click="goPage(page + 1)">
          下一页
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { RefreshCw } from "lucide-vue-next";
import { adminListBorrows } from "@/modules/borrow/api";
import type { AdminListInput, BorrowAdminListItem } from "@/modules/borrow/types";
import StatusTag from "@/components/StatusTag.vue";
import { formatDateTime, formatDate } from "@/utils/format";
import { CloudFunctionError } from "@/utils/http";
import type { BorrowStatus } from "@/utils/status";

interface FilterForm {
  keyword: string;
  date_from: string;
  date_to: string;
}

type TabValue = BorrowStatus | "";

const TABS: Array<{ value: TabValue; label: string }> = [
  { value: "", label: "全部" },
  { value: "PENDING", label: "待审批" },
  { value: "APPROVED", label: "已通过" },
  { value: "RETURNED", label: "已归还" },
  { value: "REJECTED", label: "已拒绝" },
  { value: "CANCELLED", label: "已撤回" },
];

const PAGE_SIZE = 20;

const activeTab = ref<TabValue>("PENDING");
const form = reactive<FilterForm>({ keyword: "", date_from: "", date_to: "" });
const list = ref<BorrowAdminListItem[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const error = ref<string | null>(null);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));

const buildInput = (): AdminListInput => {
  const input: AdminListInput = { page: page.value, pageSize: PAGE_SIZE };
  if (activeTab.value) input.status = activeTab.value;
  if (form.keyword) input.keyword = form.keyword;
  if (form.date_from) input.date_from = form.date_from;
  if (form.date_to) input.date_to = form.date_to;
  return input;
};

const fetchPage = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await adminListBorrows(buildInput());
    list.value = res.list;
    total.value = res.total;
  } catch (err) {
    if (err instanceof CloudFunctionError) error.value = err.message;
    else if (err instanceof Error) error.value = err.message;
    else error.value = "加载失败";
    list.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const onTabChange = (value: TabValue) => {
  if (activeTab.value === value) return;
  activeTab.value = value;
  page.value = 1;
  fetchPage();
};

const applyFilter = () => {
  page.value = 1;
  fetchPage();
};

const resetFilter = () => {
  form.keyword = "";
  form.date_from = "";
  form.date_to = "";
  applyFilter();
};

const goPage = (n: number) => {
  if (n < 1 || n > totalPages.value) return;
  page.value = n;
  fetchPage();
};

/** 把 items[].usage 去重并以「，」连成摘要 */
const usageDigest = (row: BorrowAdminListItem): string => {
  const set = new Set<string>();
  for (const it of row.items) if (it.usage) set.add(it.usage);
  if (set.size === 0) return "-";
  return Array.from(set).join("，");
};

/** 取 items[].expected_return_date 的最小值（最早归还） */
const earliestReturn = (row: BorrowAdminListItem): string => {
  let min: string | null = null;
  for (const it of row.items) {
    if (!it.expected_return_date) continue;
    if (!min || it.expected_return_date < min) min = it.expected_return_date;
  }
  return min ? formatDate(min) : "-";
};

onMounted(() => {
  fetchPage();
});
</script>
