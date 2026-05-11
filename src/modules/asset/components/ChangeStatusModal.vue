<template>
  <dialog class="modal modal-open">
    <div class="modal-box max-w-md">
      <h3 class="text-base font-semibold">变更资产状态</h3>
      <p class="text-xs text-base-content/50 mt-1 font-mono">{{ asset.asset_no }}</p>

      <form class="space-y-3 mt-4" @submit.prevent="onSubmit">
        <label class="form-control">
          <span class="label-text text-xs">当前状态</span>
          <StatusTag type="asset" :status="asset.business_status" />
        </label>

        <label class="form-control">
          <span class="label-text text-xs">目标状态 <span class="text-error">*</span></span>
          <select v-model="form.status" required class="select select-bordered select-sm">
            <option value="" disabled>请选择</option>
            <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">
              {{ s.label }}
            </option>
          </select>
          <span class="label-text-alt text-xs text-base-content/50 mt-1">
            出借中 / 审批中由借还流程自动驱动，此处不可手动设置。
          </span>
        </label>

        <label class="form-control">
          <span class="label-text text-xs">备注</span>
          <textarea
            v-model.trim="form.remark"
            class="textarea textarea-bordered textarea-sm"
            rows="2"
            placeholder="选填，将记录在变动日志中"
          />
        </label>

        <div v-if="error" class="alert alert-error py-2 text-xs">
          <span>{{ error }}</span>
        </div>

        <div class="modal-action mt-4">
          <button type="button" class="btn btn-ghost btn-sm" @click="$emit('close')">
            取消
          </button>
          <button type="submit" class="btn btn-primary btn-sm" :disabled="submitting">
            <span v-if="submitting" class="loading loading-spinner loading-sm" />
            确认变更
          </button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop" @click="$emit('close')"></div>
  </dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { changeAssetStatus } from "@/modules/asset/api";
import type { Asset } from "@/modules/asset/types";
import StatusTag from "@/components/StatusTag.vue";
import { CloudFunctionError } from "@/utils/http";
import type { AssetBusinessStatus } from "@/utils/status";

const props = defineProps<{ asset: Asset }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

// LENT / PENDING 由借还流程自动驱动，管理员只能手动设置以下 4 种
const STATUS_OPTIONS: Array<{ value: AssetBusinessStatus; label: string }> = [
  { value: "IDLE", label: "闲置" },
  { value: "IN_USE", label: "使用中" },
  { value: "MAINTAIN", label: "维修中" },
  { value: "SCRAPPED", label: "已报废" },
];

const form = reactive<{ status: AssetBusinessStatus | ""; remark: string }>({
  status: "",
  remark: "",
});

const submitting = ref(false);
const error = ref<string | null>(null);

const onSubmit = async () => {
  if (submitting.value || !form.status) return;
  submitting.value = true;
  error.value = null;
  try {
    await changeAssetStatus({
      id: props.asset._id,
      status: form.status,
      remark: form.remark || undefined,
    });
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
