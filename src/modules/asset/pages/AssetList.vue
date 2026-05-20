<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-base-content">资产列表</h1>
        <p class="text-xs text-base-content/50 mt-1">共 {{ total }} 条</p>
      </div>
      <RouterLink to="/assets/new" class="btn btn-primary btn-sm">
        <Plus :size="16" />
        新增入库
      </RouterLink>
    </header>

    <div class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
      <form class="grid gap-3 md:grid-cols-5" @submit.prevent="applyFilter">
        <input
          v-model.trim="form.keyword"
          class="input input-bordered input-sm"
          placeholder="名称关键字"
        />
        <input
          v-model.trim="form.dept_code"
          class="input input-bordered input-sm"
          placeholder="部门代码"
        />
        <select v-model="form.business_status" class="select select-bordered select-sm">
          <option value="">全部状态</option>
          <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <select v-model="form.is_large" class="select select-bordered select-sm">
          <option value="">是否大型（全部）</option>
          <option value="true">仅大型资产</option>
          <option value="false">非大型资产</option>
        </select>
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
            <th>图片</th>
            <th>资产编号</th>
            <th>名称</th>
            <th>品牌/型号</th>
            <th>部门</th>
            <th>使用人</th>
            <th>位置</th>
            <th>状态</th>
            <th class="text-right">单价</th>
            <th class="text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="10" class="text-center text-sm text-base-content/40 py-10">
              <span class="loading loading-spinner loading-sm" /> 加载中
            </td>
          </tr>
          <tr v-else-if="list.length === 0">
            <td colspan="10" class="text-center text-sm text-base-content/40 py-10">
              暂无符合条件的资产
            </td>
          </tr>
          <tr v-for="item in list" :key="item._id" class="hover">
            <td>
              <img
                v-if="coverImageUrl(item)"
                :src="coverImageUrl(item)"
                class="h-10 w-14 rounded object-cover"
                alt="资产缩略图"
              />
              <div v-else class="flex h-10 w-14 items-center justify-center rounded bg-base-200 text-base-content/30">
                <ImageIcon :size="16" />
              </div>
            </td>
            <td class="font-mono text-xs">
              {{ item.asset_no }}
              <span v-if="item.is_large" class="badge badge-warning badge-xs ml-1">大型</span>
            </td>
            <td>{{ item.name || "-" }}</td>
            <td>
              <div class="text-sm">{{ item.brand || "-" }}</div>
              <div class="text-xs text-base-content/50">{{ item.spec || "" }}</div>
            </td>
            <td>{{ item.dept_name || item.dept_code || "-" }}</td>
            <td>{{ item.user_name || "-" }}</td>
            <td>{{ item.location_name || item.location_code || "-" }}</td>
            <td><StatusTag type="asset" :status="item.business_status" /></td>
            <td class="text-right font-mono">{{ formatMoney(item.unit_price) }}</td>
            <td class="text-right">
              <RouterLink
                :to="{ name: 'asset-detail', params: { id: item._id } }"
                class="btn btn-ghost btn-xs"
              >
                查看
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between text-sm">
      <div class="text-base-content/60">
        第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 条
      </div>
      <div class="join">
        <button class="join-item btn btn-sm" :disabled="page <= 1 || loading" @click="goPage(page - 1)">上一页</button>
        <button class="join-item btn btn-sm btn-disabled">{{ page }} / {{ totalPages }}</button>
        <button class="join-item btn btn-sm" :disabled="page >= totalPages || loading" @click="goPage(page + 1)">下一页</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { Image as ImageIcon, Plus } from "lucide-vue-next";
import { listAssets } from "@/modules/asset/api";
import type { Asset, AssetListFilter } from "@/modules/asset/types";
import { resolveAssetImageTempUrls } from "@/modules/asset/storage";
import StatusTag from "@/components/StatusTag.vue";
import { formatMoney } from "@/utils/format";
import { CloudFunctionError } from "@/utils/http";
import type { AssetBusinessStatus } from "@/utils/status";

interface FilterForm {
  keyword: string;
  dept_code: string;
  business_status: AssetBusinessStatus | "";
  is_large: "" | "true" | "false";
}

const STATUS_OPTIONS: Array<{ value: AssetBusinessStatus; label: string }> = [
  { value: "IDLE", label: "闲置" },
  { value: "IN_USE", label: "使用中" },
  { value: "LENT", label: "出借中" },
  { value: "PENDING", label: "审批中" },
  { value: "MAINTAIN", label: "维修中" },
  { value: "SCRAPPED", label: "已报废" },
];

const PAGE_SIZE = 20;

const form = reactive<FilterForm>({
  keyword: "",
  dept_code: "",
  business_status: "",
  is_large: "",
});

const list = ref<Asset[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const error = ref<string | null>(null);
const thumbnailUrls = ref<Record<string, string>>({});

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));

const buildFilter = (): AssetListFilter => {
  const f: AssetListFilter = {};
  if (form.keyword) f.keyword = form.keyword;
  if (form.dept_code) f.dept_code = form.dept_code;
  if (form.business_status) f.business_status = form.business_status;
  if (form.is_large === "true") f.is_large = true;
  if (form.is_large === "false") f.is_large = false;
  return f;
};

const fetchPage = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await listAssets({
      page: page.value,
      pageSize: PAGE_SIZE,
      filter: buildFilter(),
      sort: { field: "created_at", order: "desc" },
    });
    list.value = res.list;
    total.value = res.total;
    await loadThumbnails(res.list);
  } catch (err) {
    if (err instanceof CloudFunctionError) error.value = err.message;
    else if (err instanceof Error) error.value = err.message;
    else error.value = "加载失败";
    list.value = [];
    total.value = 0;
    thumbnailUrls.value = {};
  } finally {
    loading.value = false;
  }
};

const coverImageId = (asset: Asset): string | undefined => asset.image_urls?.[0];

const coverImageUrl = (asset: Asset): string | undefined => {
  const fileID = coverImageId(asset);
  return fileID ? thumbnailUrls.value[fileID] : undefined;
};

const loadThumbnails = async (assets: Asset[]) => {
  const coverIDs = assets.map(coverImageId).filter((id): id is string => Boolean(id));
  if (coverIDs.length === 0) {
    thumbnailUrls.value = {};
    return;
  }
  try {
    const urlMap = await resolveAssetImageTempUrls(coverIDs);
    thumbnailUrls.value = Object.fromEntries(urlMap);
  } catch {
    thumbnailUrls.value = {};
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
  form.is_large = "";
  applyFilter();
};

const goPage = (n: number) => {
  if (n < 1 || n > totalPages.value) return;
  page.value = n;
  fetchPage();
};

const route = useRoute();
const STATUS_SET = new Set<AssetBusinessStatus>([
  "IDLE", "IN_USE", "LENT", "PENDING", "MAINTAIN", "SCRAPPED",
]);

// 从 URL query 同步筛选条件（支持从 Dashboard 等页面带参数跳入）
const syncFromQuery = () => {
  const q = route.query;
  const status = String(q.status || "");
  form.business_status = (STATUS_SET as Set<string>).has(status)
    ? (status as AssetBusinessStatus)
    : "";
  const large = String(q.large || "");
  form.is_large = large === "true" ? "true" : large === "false" ? "false" : "";
  form.keyword = typeof q.keyword === "string" ? q.keyword : "";
  form.dept_code = typeof q.dept_code === "string" ? q.dept_code : "";
};

watch(
  () => [route.query.status, route.query.large, route.query.keyword, route.query.dept_code],
  () => {
    syncFromQuery();
    page.value = 1;
    fetchPage();
  }
);

onMounted(() => {
  syncFromQuery();
  fetchPage();
});
</script>
