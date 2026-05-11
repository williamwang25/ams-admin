<template>
  <dialog class="modal modal-open">
    <div class="modal-box max-w-md">
      <h3 class="text-base font-semibold">变更存放位置</h3>
      <p class="text-xs text-base-content/50 mt-1 font-mono">{{ asset.asset_no }}</p>

      <form class="space-y-3 mt-4" @submit.prevent="onSubmit">
        <div class="text-xs text-base-content/60 bg-base-200 p-2 rounded">
          当前位置：{{ asset.location_name || asset.location_code || "（未设置）" }}
        </div>

        <label class="form-control">
          <span class="label-text text-xs">新位置代码</span>
          <input
            v-model.trim="form.location_code"
            class="input input-bordered input-sm"
            placeholder="如 A-201"
          />
        </label>

        <label class="form-control">
          <span class="label-text text-xs">新位置名称</span>
          <input
            v-model.trim="form.location_name"
            class="input input-bordered input-sm"
            placeholder="如 实训楼 A 区 201"
          />
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

        <p class="text-xs text-base-content/50">
          位置代码与名称至少填一个；都为空将清除当前位置。
        </p>

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
import { changeAssetLocation } from "@/modules/asset/api";
import type { Asset } from "@/modules/asset/types";
import { CloudFunctionError } from "@/utils/http";

const props = defineProps<{ asset: Asset }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const form = reactive({
  location_code: props.asset.location_code ?? "",
  location_name: props.asset.location_name ?? "",
  remark: "",
});

const submitting = ref(false);
const error = ref<string | null>(null);

const onSubmit = async () => {
  if (submitting.value) return;
  submitting.value = true;
  error.value = null;
  try {
    await changeAssetLocation({
      id: props.asset._id,
      location_code: form.location_code,
      location_name: form.location_name,
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
