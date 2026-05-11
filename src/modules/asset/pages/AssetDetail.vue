<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-base-content">
          <template v-if="asset">{{ asset.name || "（无名称）" }}</template>
          <template v-else>资产详情</template>
        </h1>
        <p v-if="asset" class="text-xs text-base-content/50 mt-1 font-mono">
          {{ asset.asset_no }}
          <StatusTag type="asset" :status="asset.business_status" class="ml-2" />
          <span v-if="asset.is_large" class="badge badge-warning badge-xs ml-1">大型</span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <template v-if="asset">
          <button class="btn btn-ghost btn-sm" :disabled="loading" @click="openModal = 'edit'">
            <Pencil :size="14" /> 编辑
          </button>
          <button class="btn btn-ghost btn-sm" :disabled="loading" @click="openModal = 'status'">
            变更状态
          </button>
          <button class="btn btn-ghost btn-sm" :disabled="loading" @click="openModal = 'location'">
            变更位置
          </button>
          <button class="btn btn-ghost btn-sm" :disabled="loading" @click="openModal = 'user'">
            变更使用人
          </button>
        </template>
        <RouterLink to="/assets" class="btn btn-ghost btn-sm">返回列表</RouterLink>
      </div>
    </header>

    <div role="tablist" class="tabs tabs-bordered">
      <a
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === 'detail' }"
        @click="activeTab = 'detail'"
      >详细字段</a>
      <a
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === 'timeline' }"
        @click="activeTab = 'timeline'"
      >生命周期 Timeline</a>
    </div>

    <div v-if="loading" class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-card text-sm text-base-content/60">
      <span class="loading loading-spinner loading-sm" /> 加载中...
    </div>

    <div v-else-if="error" class="alert alert-error py-2 text-sm">
      <span>{{ error }}</span>
    </div>

    <!-- 详细字段 tab -->
    <div
      v-else-if="asset && activeTab === 'detail'"
      class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-card space-y-4"
    >
      <div v-for="group in DETAIL_GROUPS" :key="group.title">
        <h3 class="text-sm font-semibold text-base-content mb-2">{{ group.title }}</h3>
        <dl class="grid gap-x-6 gap-y-2 md:grid-cols-2 text-sm">
          <div v-for="f in group.fields" :key="f.key" class="flex gap-2">
            <dt class="w-28 shrink-0 text-base-content/50">{{ f.label }}</dt>
            <dd class="flex-1 break-all">{{ renderField(asset, f) }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Timeline tab -->
    <div
      v-else-if="asset && activeTab === 'timeline'"
      class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-card"
    >
      <div v-if="timelineLoading" class="text-sm text-base-content/60">
        <span class="loading loading-spinner loading-sm" /> 加载中...
      </div>
      <div v-else-if="timeline.length === 0" class="text-sm text-base-content/40 text-center py-10">
        暂无变动记录
      </div>
      <ol v-else class="relative border-l border-base-300 ml-2 space-y-4">
        <li v-for="log in timeline" :key="log._id" class="ml-4">
          <span
            class="absolute -left-2 w-3 h-3 rounded-full"
            :class="opTypeColor(log.op_type)"
          ></span>
          <div class="flex items-baseline justify-between">
            <span class="text-sm font-semibold">{{ OP_TYPE_LABEL[log.op_type] || log.op_type }}</span>
            <time class="text-xs text-base-content/50 font-mono">{{ formatDateTime(log.created_at) }}</time>
          </div>
          <p class="text-xs text-base-content/60 mt-1">
            操作人：{{ log.operator_name || log.operator_id }}
            <span v-if="log.remark" class="ml-2">{{ log.remark }}</span>
          </p>
          <ul v-if="log.changes && log.changes.length" class="mt-2 text-xs space-y-0.5">
            <li v-for="(c, i) in log.changes" :key="i" class="font-mono">
              <span class="text-base-content/50">{{ c.field }}：</span>
              <span class="text-error">{{ renderChange(c.before) }}</span>
              <span class="mx-1">→</span>
              <span class="text-success">{{ renderChange(c.after) }}</span>
            </li>
          </ul>
        </li>
      </ol>
    </div>

    <EditAssetModal
      v-if="asset && openModal === 'edit'"
      :asset="asset"
      @close="openModal = null"
      @success="onMutationSuccess"
    />
    <ChangeStatusModal
      v-if="asset && openModal === 'status'"
      :asset="asset"
      @close="openModal = null"
      @success="onMutationSuccess"
    />
    <ChangeLocationModal
      v-if="asset && openModal === 'location'"
      :asset="asset"
      @close="openModal = null"
      @success="onMutationSuccess"
    />
    <ChangeUserModal
      v-if="asset && openModal === 'user'"
      :asset="asset"
      @close="openModal = null"
      @success="onMutationSuccess"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { Pencil } from "lucide-vue-next";
import { getAssetDetail, getAssetTimeline } from "@/modules/asset/api";
import type { Asset, AssetLog } from "@/modules/asset/types";
import StatusTag from "@/components/StatusTag.vue";
import EditAssetModal from "@/modules/asset/components/EditAssetModal.vue";
import ChangeStatusModal from "@/modules/asset/components/ChangeStatusModal.vue";
import ChangeLocationModal from "@/modules/asset/components/ChangeLocationModal.vue";
import ChangeUserModal from "@/modules/asset/components/ChangeUserModal.vue";
import { formatDateTime, formatDate, formatMoney } from "@/utils/format";
import { CloudFunctionError } from "@/utils/http";

type ModalKind = "edit" | "status" | "location" | "user";
const openModal = ref<ModalKind | null>(null);

const route = useRoute();
const id = computed(() => String(route.params.id ?? ""));

const asset = ref<Asset | null>(null);
const timeline = ref<AssetLog[]>([]);
const loading = ref(false);
const timelineLoading = ref(false);
const error = ref<string | null>(null);
const activeTab = ref<"detail" | "timeline">("detail");

type FieldType = "text" | "money" | "date" | "boolean";
interface FieldDef {
  key: keyof Asset;
  label: string;
  type?: FieldType;
}

const DETAIL_GROUPS: Array<{ title: string; fields: FieldDef[] }> = [
  {
    title: "基础",
    fields: [
      { key: "asset_no", label: "资产编号" },
      { key: "voucher_no", label: "建账单号" },
      { key: "brand", label: "品牌" },
      { key: "spec", label: "规格型号" },
      { key: "category_national", label: "国标分类" },
      { key: "category_industry", label: "行业分类" },
    ],
  },
  {
    title: "数量与财务",
    fields: [
      { key: "unit_price", label: "单价", type: "money" },
      { key: "quantity", label: "数量" },
      { key: "unit", label: "计量单位" },
      { key: "original_value", label: "资产原值", type: "money" },
      { key: "accumulated_depreciation", label: "累计折旧", type: "money" },
      { key: "net_value", label: "净值", type: "money" },
      { key: "book_date", label: "记账日期", type: "date" },
      { key: "depreciation_years", label: "折旧年限" },
      { key: "depreciated_months", label: "已提折旧月数" },
    ],
  },
  {
    title: "归属",
    fields: [
      { key: "dept_code", label: "部门代码" },
      { key: "dept_name", label: "使用部门" },
      { key: "user_name", label: "使用人" },
      { key: "location_code", label: "存放代码" },
      { key: "location_name", label: "存放地点" },
    ],
  },
  {
    title: "取得",
    fields: [
      { key: "purchase_mode", label: "取得方式" },
      { key: "acquire_date", label: "取得日期", type: "date" },
      { key: "book_in_date", label: "入账日期", type: "date" },
      { key: "supplier", label: "供货商" },
      { key: "manufacturer", label: "厂家" },
      { key: "invoice_no", label: "发票号" },
      { key: "contract_no", label: "合同号" },
    ],
  },
  {
    title: "业务",
    fields: [
      { key: "usage", label: "资产用途" },
      { key: "edu_direction", label: "教育方向" },
      { key: "project_name", label: "项目名称" },
      { key: "vehicle_no", label: "车牌号" },
      { key: "is_large", label: "是否大型", type: "boolean" },
      { key: "remark", label: "备注" },
    ],
  },
];

const OP_TYPE_LABEL: Record<string, string> = {
  CREATE: "入库",
  UPDATE: "编辑",
  STATUS_CHANGE: "状态变更",
  LOCATION_CHANGE: "位置变更",
  USER_CHANGE: "使用人变更",
  BORROW: "借出",
  RETURN: "归还",
  SCRAP: "报废",
};

const opTypeColor = (op: string) => {
  switch (op) {
    case "CREATE":
      return "bg-primary";
    case "BORROW":
      return "bg-warning";
    case "RETURN":
      return "bg-success";
    case "SCRAP":
      return "bg-error";
    default:
      return "bg-info";
  }
};

const renderField = (a: Asset, f: FieldDef): string => {
  const v = a[f.key];
  if (v == null || v === "") return "-";
  if (f.type === "money") return formatMoney(Number(v));
  if (f.type === "date") return formatDate(String(v));
  if (f.type === "boolean") return v ? "是" : "否";
  return String(v);
};

const renderChange = (v: unknown): string => {
  if (v == null || v === "") return "（空）";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

const fetchDetail = async () => {
  if (!id.value) return;
  loading.value = true;
  error.value = null;
  try {
    asset.value = await getAssetDetail({ id: id.value });
  } catch (err) {
    if (err instanceof CloudFunctionError) error.value = err.message;
    else if (err instanceof Error) error.value = err.message;
    else error.value = "加载失败";
    asset.value = null;
  } finally {
    loading.value = false;
  }
};

const fetchTimeline = async () => {
  if (!id.value || !asset.value) return;
  timelineLoading.value = true;
  try {
    const res = await getAssetTimeline({ asset_id: id.value });
    timeline.value = res.list;
  } catch (err) {
    console.error("[asset detail] timeline error:", err);
    timeline.value = [];
  } finally {
    timelineLoading.value = false;
  }
};

watch(activeTab, (tab) => {
  if (tab === "timeline" && timeline.value.length === 0) fetchTimeline();
});

/**
 * 任意变更 modal 成功后：关弹窗、重拉详情、清空 timeline 缓存。
 * 若当前在 Timeline tab，立即重新加载。
 */
const onMutationSuccess = async () => {
  openModal.value = null;
  timeline.value = [];
  await fetchDetail();
  if (activeTab.value === "timeline") fetchTimeline();
};

onMounted(fetchDetail);
</script>
