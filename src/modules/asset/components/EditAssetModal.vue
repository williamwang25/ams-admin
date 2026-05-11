<template>
  <dialog class="modal modal-open">
    <div class="modal-box max-w-3xl">
      <h3 class="text-base font-semibold">编辑资产基础信息</h3>
      <p class="text-xs text-base-content/50 mt-1 font-mono">{{ asset.asset_no }}</p>
      <p class="text-xs text-base-content/50 mt-1">
        归属 / 位置 / 使用人请用专用变更按钮；状态请用「变更状态」入口。
      </p>

      <form class="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2" @submit.prevent="onSubmit">
        <!-- 基础 -->
        <fieldset class="rounded border border-base-300 p-3">
          <legend class="px-2 text-xs font-semibold">基础</legend>
          <div class="grid gap-2 md:grid-cols-2">
            <label class="form-control">
              <span class="label-text text-xs">资产名称</span>
              <input v-model.trim="form.name" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">建账单号</span>
              <input v-model.trim="form.voucher_no" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">品牌</span>
              <input v-model.trim="form.brand" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">规格型号</span>
              <input v-model.trim="form.spec" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">国标分类</span>
              <input v-model.trim="form.category_national" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">行业分类</span>
              <input v-model.trim="form.category_industry" class="input input-bordered input-sm" />
            </label>
          </div>
        </fieldset>

        <!-- 数量与财务 -->
        <fieldset class="rounded border border-base-300 p-3">
          <legend class="px-2 text-xs font-semibold">数量与财务</legend>
          <div class="grid gap-2 md:grid-cols-3">
            <label class="form-control">
              <span class="label-text text-xs">单价（元）</span>
              <input v-model.number="form.unit_price" type="number" step="0.01" min="0" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">数量</span>
              <input v-model.number="form.quantity" type="number" min="0" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">计量单位</span>
              <input v-model.trim="form.unit" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">资产原值</span>
              <input v-model.number="form.original_value" type="number" step="0.01" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">累计折旧</span>
              <input v-model.number="form.accumulated_depreciation" type="number" step="0.01" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">净值</span>
              <input v-model.number="form.net_value" type="number" step="0.01" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">记账日期</span>
              <input v-model="form.book_date" type="date" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">折旧年限</span>
              <input v-model.number="form.depreciation_years" type="number" min="0" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">已提折旧月数</span>
              <input v-model.number="form.depreciated_months" type="number" min="0" class="input input-bordered input-sm" />
            </label>
          </div>
        </fieldset>

        <!-- 取得 -->
        <fieldset class="rounded border border-base-300 p-3">
          <legend class="px-2 text-xs font-semibold">取得</legend>
          <div class="grid gap-2 md:grid-cols-3">
            <label class="form-control">
              <span class="label-text text-xs">取得方式</span>
              <input v-model.trim="form.purchase_mode" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">取得日期</span>
              <input v-model="form.acquire_date" type="date" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">入账日期</span>
              <input v-model="form.book_in_date" type="date" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">供货商</span>
              <input v-model.trim="form.supplier" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">厂家</span>
              <input v-model.trim="form.manufacturer" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">发票号</span>
              <input v-model.trim="form.invoice_no" class="input input-bordered input-sm" />
            </label>
            <label class="form-control md:col-span-3">
              <span class="label-text text-xs">合同号</span>
              <input v-model.trim="form.contract_no" class="input input-bordered input-sm" />
            </label>
          </div>
        </fieldset>

        <!-- 业务 -->
        <fieldset class="rounded border border-base-300 p-3">
          <legend class="px-2 text-xs font-semibold">业务</legend>
          <div class="grid gap-2 md:grid-cols-3">
            <label class="form-control">
              <span class="label-text text-xs">资产用途</span>
              <select v-model="form.usage" class="select select-bordered select-sm">
                <option value="">未选择</option>
                <option v-for="u in USAGE_OPTIONS" :key="u" :value="u">{{ u }}</option>
              </select>
            </label>
            <label class="form-control">
              <span class="label-text text-xs">教育方向</span>
              <input v-model.trim="form.edu_direction" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">项目名称</span>
              <input v-model.trim="form.project_name" class="input input-bordered input-sm" />
            </label>
            <label class="form-control">
              <span class="label-text text-xs">车牌号</span>
              <input v-model.trim="form.vehicle_no" class="input input-bordered input-sm" />
            </label>
            <label class="form-control md:col-span-3">
              <span class="label-text text-xs">备注</span>
              <textarea v-model="form.remark" class="textarea textarea-bordered textarea-sm" rows="2" />
            </label>
          </div>
        </fieldset>
      </form>

      <div v-if="error" class="alert alert-error py-2 text-xs mt-3">
        <span>{{ error }}</span>
      </div>

      <div class="modal-action mt-4">
        <button type="button" class="btn btn-ghost btn-sm" @click="$emit('close')">取消</button>
        <button type="button" class="btn btn-primary btn-sm" :disabled="submitting" @click="onSubmit">
          <span v-if="submitting" class="loading loading-spinner loading-sm" />
          保存
        </button>
      </div>
    </div>
    <div class="modal-backdrop" @click="$emit('close')"></div>
  </dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { updateAsset } from "@/modules/asset/api";
import type { Asset, AssetUpdateInput } from "@/modules/asset/types";
import { CloudFunctionError } from "@/utils/http";

const props = defineProps<{ asset: Asset }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const USAGE_OPTIONS = ["专用", "通用", "教学", "科研", "后勤"];

const a = props.asset;
const form = reactive({
  name: a.name ?? "",
  voucher_no: a.voucher_no ?? "",
  brand: a.brand ?? "",
  spec: a.spec ?? "",
  category_national: a.category_national ?? "",
  category_industry: a.category_industry ?? "",
  unit_price: a.unit_price ?? undefined,
  quantity: a.quantity ?? undefined,
  unit: a.unit ?? "",
  original_value: a.original_value ?? undefined,
  accumulated_depreciation: a.accumulated_depreciation ?? undefined,
  net_value: a.net_value ?? undefined,
  book_date: a.book_date ?? "",
  depreciation_years: a.depreciation_years ?? undefined,
  depreciated_months: a.depreciated_months ?? undefined,
  purchase_mode: a.purchase_mode ?? "",
  acquire_date: a.acquire_date ?? "",
  book_in_date: a.book_in_date ?? "",
  supplier: a.supplier ?? "",
  manufacturer: a.manufacturer ?? "",
  invoice_no: a.invoice_no ?? "",
  contract_no: a.contract_no ?? "",
  usage: a.usage ?? "",
  edu_direction: a.edu_direction ?? "",
  project_name: a.project_name ?? "",
  vehicle_no: a.vehicle_no ?? "",
  remark: a.remark ?? "",
});

const submitting = ref(false);
const error = ref<string | null>(null);

const onSubmit = async () => {
  if (submitting.value) return;
  submitting.value = true;
  error.value = null;
  try {
    // 只提交「与原值不同」的字段，避免无意义的 UPDATE 日志
    const payload: Record<string, unknown> = { id: props.asset._id };
    for (const [k, v] of Object.entries(form)) {
      const before = (props.asset as unknown as Record<string, unknown>)[k];
      const normalized = v === "" ? undefined : v;
      const beforeNormalized = before === "" || before == null ? undefined : before;
      if (normalized !== beforeNormalized) {
        payload[k] = normalized;
      }
    }
    // 没有任何修改时直接关闭
    if (Object.keys(payload).length === 1) {
      emit("close");
      return;
    }
    await updateAsset(payload as unknown as AssetUpdateInput);
    emit("success");
  } catch (err) {
    if (err instanceof CloudFunctionError) error.value = err.message;
    else if (err instanceof Error) error.value = err.message;
    else error.value = "提交失败";
  } finally {
    submitting.value = false;
  }
};
</script>
