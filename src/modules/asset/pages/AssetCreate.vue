<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-base-content">资产入库</h1>
        <p class="text-xs text-base-content/50 mt-1">
          编号将由系统自动生成（<code class="text-xs">YQJJ + 年份 + 顺序号</code>）
        </p>
      </div>
      <RouterLink to="/assets" class="btn btn-ghost btn-sm">返回列表</RouterLink>
    </header>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <!-- 基础 -->
      <fieldset class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
        <legend class="px-2 text-sm font-semibold text-base-content">基础信息</legend>
        <div class="grid gap-3 md:grid-cols-2">
          <label class="form-control">
            <span class="label-text text-xs">资产名称 <span class="text-error">*</span></span>
            <input v-model.trim="form.name" required class="input input-bordered input-sm" />
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
          <label class="form-control">
            <span class="label-text text-xs">建账单号</span>
            <input v-model.trim="form.voucher_no" class="input input-bordered input-sm" placeholder="ZCJZ2026000xxx" />
          </label>
        </div>
      </fieldset>

      <!-- 数量 / 财务 -->
      <fieldset class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
        <legend class="px-2 text-sm font-semibold text-base-content">数量与财务</legend>
        <div class="grid gap-3 md:grid-cols-3">
          <label class="form-control">
            <span class="label-text text-xs">单价（元） <span class="text-error">*</span></span>
            <input
              v-model.number="form.unit_price"
              required
              type="number"
              step="0.01"
              min="0"
              class="input input-bordered input-sm"
            />
          </label>
          <label class="form-control">
            <span class="label-text text-xs">数量</span>
            <input v-model.number="form.quantity" type="number" min="0" class="input input-bordered input-sm" />
          </label>
          <label class="form-control">
            <span class="label-text text-xs">计量单位</span>
            <input v-model.trim="form.unit" class="input input-bordered input-sm" placeholder="台/件/套" />
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

      <!-- 归属 -->
      <fieldset class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
        <legend class="px-2 text-sm font-semibold text-base-content">归属</legend>
        <div class="grid gap-3 md:grid-cols-3">
          <label class="form-control">
            <span class="label-text text-xs">部门代码</span>
            <input v-model.trim="form.dept_code" class="input input-bordered input-sm" />
          </label>
          <label class="form-control">
            <span class="label-text text-xs">使用部门</span>
            <input v-model.trim="form.dept_name" class="input input-bordered input-sm" />
          </label>
          <label class="form-control">
            <span class="label-text text-xs">使用人</span>
            <input v-model.trim="form.user_name" class="input input-bordered input-sm" />
          </label>
          <label class="form-control">
            <span class="label-text text-xs">存放地点代码</span>
            <input v-model.trim="form.location_code" class="input input-bordered input-sm" />
          </label>
          <label class="form-control md:col-span-2">
            <span class="label-text text-xs">存放地点</span>
            <input v-model.trim="form.location_name" class="input input-bordered input-sm" />
          </label>
        </div>
      </fieldset>

      <!-- 取得 -->
      <fieldset class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
        <legend class="px-2 text-sm font-semibold text-base-content">取得</legend>
        <div class="grid gap-3 md:grid-cols-3">
          <label class="form-control">
            <span class="label-text text-xs">取得方式</span>
            <input v-model.trim="form.purchase_mode" class="input input-bordered input-sm" />
          </label>
          <label class="form-control">
            <span class="label-text text-xs">取得日期</span>
            <input v-model="form.acquire_date" type="date" class="input input-bordered input-sm" />
          </label>
          <label class="form-control">
            <span class="label-text text-xs">财务入账日期</span>
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
      <fieldset class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
        <legend class="px-2 text-sm font-semibold text-base-content">业务</legend>
        <div class="grid gap-3 md:grid-cols-3">
          <label class="form-control">
            <span class="label-text text-xs">资产用途</span>
            <select v-model="form.usage" class="select select-bordered select-sm">
              <option value="">未选择</option>
              <option v-for="u in USAGE_OPTIONS" :key="u" :value="u">{{ u }}</option>
            </select>
          </label>
          <label class="form-control">
            <span class="label-text text-xs">教育使用方向</span>
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

      <fieldset class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
        <AssetImageUploader v-model="imageFiles" :disabled="submitting" />
        <div v-if="uploadProgress" class="mt-3 text-xs text-base-content/60">
          正在上传：{{ uploadProgress.fileName }}（{{ uploadProgress.percent }}%）
        </div>
      </fieldset>

      <div v-if="error" class="alert alert-error py-2 text-sm">
        <span>{{ error }}</span>
      </div>

      <div class="flex items-center justify-end gap-2">
        <RouterLink to="/assets" class="btn btn-ghost btn-sm">取消</RouterLink>
        <button type="submit" class="btn btn-primary btn-sm" :disabled="submitting">
          <span v-if="submitting" class="loading loading-spinner loading-sm" />
          {{ submitting ? "提交中..." : "确认入库" }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { createAsset, updateAsset } from "@/modules/asset/api";
import type { AssetCreateInput, AssetCreateResult } from "@/modules/asset/types";
import AssetImageUploader from "@/modules/asset/components/AssetImageUploader.vue";
import { uploadAssetImages, type UploadAssetImageProgress } from "@/modules/asset/storage";
import { CloudFunctionError } from "@/utils/http";

const router = useRouter();

const USAGE_OPTIONS = ["专用", "通用", "教学", "科研", "后勤"];

const form = reactive<Partial<AssetCreateInput>>({
  name: "",
  unit_price: undefined,
  brand: "",
  spec: "",
  category_national: "",
  category_industry: "",
  voucher_no: "",
  quantity: undefined,
  unit: "",
  original_value: undefined,
  accumulated_depreciation: undefined,
  net_value: undefined,
  book_date: "",
  depreciation_years: undefined,
  depreciated_months: undefined,
  dept_code: "",
  dept_name: "",
  user_name: "",
  location_code: "",
  location_name: "",
  purchase_mode: "",
  acquire_date: "",
  book_in_date: "",
  supplier: "",
  manufacturer: "",
  invoice_no: "",
  contract_no: "",
  usage: "",
  edu_direction: "",
  vehicle_no: "",
  project_name: "",
  remark: "",
});

const submitting = ref(false);
const error = ref<string | null>(null);
const imageFiles = ref<File[]>([]);
const uploadProgress = ref<UploadAssetImageProgress | null>(null);
const createdAsset = ref<AssetCreateResult | null>(null);

const onSubmit = async () => {
  if (submitting.value) return;
  if (!form.name) {
    error.value = "请填写资产名称";
    return;
  }
  if (form.unit_price == null || Number.isNaN(form.unit_price)) {
    error.value = "请填写单价";
    return;
  }
  submitting.value = true;
  error.value = null;
  uploadProgress.value = null;
  try {
    // 过滤空字符串，避免覆盖云函数默认值
    if (!createdAsset.value) {
      const payload: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(form)) {
        if (v === "" || v === null || v === undefined) continue;
        payload[k] = v;
      }
      createdAsset.value = await createAsset(payload as unknown as AssetCreateInput);
    }

    if (imageFiles.value.length > 0) {
      const imageFileIDs = await uploadAssetImages(
        createdAsset.value.asset_no,
        imageFiles.value,
        (progress) => {
          uploadProgress.value = progress;
        }
      );
      await updateAsset({
        id: createdAsset.value._id,
        image_urls: imageFileIDs,
      });
    }

    router.replace({ name: "asset-detail", params: { id: createdAsset.value._id } });
  } catch (err) {
    const message =
      err instanceof CloudFunctionError
        ? err.message
        : err instanceof Error
          ? err.message
          : "提交失败";
    error.value = createdAsset.value
      ? `资产已入库（${createdAsset.value.asset_no}），但图片保存未完成：${message}。请修正后再次提交，系统会继续保存图片。`
      : message;
  } finally {
    submitting.value = false;
    uploadProgress.value = null;
  }
};
</script>
