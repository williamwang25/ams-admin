<template>
  <dialog class="modal modal-open">
    <div class="modal-box max-w-md">
      <h3 class="text-base font-semibold">变更使用人 / 部门</h3>
      <p class="text-xs text-base-content/50 mt-1 font-mono">{{ asset.asset_no }}</p>

      <form class="space-y-3 mt-4" @submit.prevent="onSubmit">
        <div class="text-xs text-base-content/60 bg-base-200 p-2 rounded space-y-0.5">
          <div>当前使用人：{{ asset.user_name || "（未设置）" }}</div>
          <div>当前部门：{{ asset.dept_name || asset.dept_code || "（未设置）" }}</div>
        </div>

        <label class="form-control">
          <span class="label-text text-xs">新使用人</span>
          <input
            v-model.trim="form.user_name"
            class="input input-bordered input-sm"
            placeholder="留空将清除"
          />
        </label>

        <div class="grid grid-cols-2 gap-2">
          <label class="form-control">
            <span class="label-text text-xs">部门代码</span>
            <input v-model.trim="form.dept_code" class="input input-bordered input-sm" />
          </label>
          <label class="form-control">
            <span class="label-text text-xs">部门名称</span>
            <input v-model.trim="form.dept_name" class="input input-bordered input-sm" />
          </label>
        </div>

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
import { changeAssetUser } from "@/modules/asset/api";
import type { Asset } from "@/modules/asset/types";
import { CloudFunctionError } from "@/utils/http";

const props = defineProps<{ asset: Asset }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const form = reactive({
  user_name: props.asset.user_name ?? "",
  dept_code: props.asset.dept_code ?? "",
  dept_name: props.asset.dept_name ?? "",
  remark: "",
});

const submitting = ref(false);
const error = ref<string | null>(null);

const onSubmit = async () => {
  if (submitting.value) return;
  submitting.value = true;
  error.value = null;
  try {
    await changeAssetUser({
      id: props.asset._id,
      user_name: form.user_name,
      dept_code: form.dept_code,
      dept_name: form.dept_name,
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
