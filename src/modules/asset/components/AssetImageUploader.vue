<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-base-content">资产图片</h3>
        <p class="mt-1 text-xs text-base-content/50">
          支持 JPG / PNG / WebP，单张不超过 5MB，最多 {{ maxFiles }} 张。
        </p>
      </div>
      <label class="btn btn-outline btn-sm" :class="{ 'btn-disabled': disabled || isFull }">
        <UploadCloud :size="14" />
        选择图片
        <input
          type="file"
          class="hidden"
          multiple
          :accept="ASSET_IMAGE_ACCEPT"
          :disabled="disabled || isFull"
          @change="onFileChange"
        />
      </label>
    </div>

    <div v-if="error" class="alert alert-error py-2 text-xs">
      <span>{{ error }}</span>
    </div>

    <div v-if="totalCount === 0" class="rounded border border-dashed border-base-300 bg-base-200/60 p-6 text-center text-sm text-base-content/50">
      <ImageIcon :size="22" class="mx-auto mb-2 text-base-content/30" />
      暂未选择图片
    </div>

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <figure
        v-for="fileID in existingFileIds"
        :key="fileID"
        class="relative overflow-hidden rounded border border-base-300 bg-base-200"
      >
        <img
          v-if="existingPreviewUrls[fileID]"
          :src="existingPreviewUrls[fileID]"
          class="h-32 w-full object-cover"
          alt="资产图片"
        />
        <div v-else class="flex h-32 items-center justify-center text-xs text-base-content/40">
          预览加载中
        </div>
        <button
          type="button"
          class="btn btn-circle btn-ghost btn-xs absolute right-1 top-1 bg-base-100/80"
          :disabled="disabled"
          @click="removeExisting(fileID)"
        >
          <X :size="14" />
        </button>
      </figure>

      <figure
        v-for="item in selectedImages"
        :key="item.id"
        class="relative overflow-hidden rounded border border-base-300 bg-base-200"
      >
        <img :src="item.previewUrl" class="h-32 w-full object-cover" alt="待上传资产图片" />
        <figcaption class="truncate px-2 py-1 text-xs text-base-content/60">
          {{ item.file.name }}
        </figcaption>
        <button
          type="button"
          class="btn btn-circle btn-ghost btn-xs absolute right-1 top-1 bg-base-100/80"
          :disabled="disabled"
          @click="removeSelected(item.id)"
        >
          <X :size="14" />
        </button>
      </figure>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Image as ImageIcon, UploadCloud, X } from "lucide-vue-next";
import {
  ASSET_IMAGE_ACCEPT,
  ASSET_IMAGE_MAX_COUNT,
  resolveAssetImageTempUrls,
  validateAssetImageFiles,
} from "@/modules/asset/storage";

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: File[];
    existingFileIds?: string[];
    disabled?: boolean;
    maxFiles?: number;
  }>(),
  {
    modelValue: () => [],
    existingFileIds: () => [],
    disabled: false,
    maxFiles: ASSET_IMAGE_MAX_COUNT,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: File[]): void;
  (e: "update:existingFileIds", value: string[]): void;
}>();

const selectedImages = ref<SelectedImage[]>([]);
const existingPreviewUrls = ref<Record<string, string>>({});
const error = ref<string | null>(null);

const existingFileIds = computed(() => props.existingFileIds.filter(Boolean));
const totalCount = computed(() => existingFileIds.value.length + selectedImages.value.length);
const maxFiles = computed(() => props.maxFiles);
const isFull = computed(() => totalCount.value >= maxFiles.value);

const emitSelectedFiles = () => {
  emit(
    "update:modelValue",
    selectedImages.value.map((item) => item.file)
  );
};

const revokeAllObjectUrls = () => {
  for (const item of selectedImages.value) URL.revokeObjectURL(item.previewUrl);
};

const addSelectedFiles = (files: File[]) => {
  validateAssetImageFiles(files, totalCount.value);
  const next = files.map((file) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    file,
    previewUrl: URL.createObjectURL(file),
  }));
  selectedImages.value = [...selectedImages.value, ...next];
  emitSelectedFiles();
};

const onFileChange = (event: Event) => {
  error.value = null;
  const input = event.target instanceof HTMLInputElement ? event.target : null;
  const files = input?.files ? Array.from(input.files) : [];
  if (input) input.value = "";
  if (files.length === 0) return;

  try {
    addSelectedFiles(files);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "图片选择失败";
  }
};

const removeSelected = (id: string) => {
  const target = selectedImages.value.find((item) => item.id === id);
  if (target) URL.revokeObjectURL(target.previewUrl);
  selectedImages.value = selectedImages.value.filter((item) => item.id !== id);
  emitSelectedFiles();
};

const removeExisting = (fileID: string) => {
  emit(
    "update:existingFileIds",
    existingFileIds.value.filter((id) => id !== fileID)
  );
};

watch(
  () => props.existingFileIds,
  async (fileIDs) => {
    const ids = fileIDs.filter(Boolean);
    if (ids.length === 0) {
      existingPreviewUrls.value = {};
      return;
    }
    try {
      const urlMap = await resolveAssetImageTempUrls(ids);
      existingPreviewUrls.value = Object.fromEntries(urlMap);
    } catch {
      existingPreviewUrls.value = {};
    }
  },
  { immediate: true }
);

watch(
  () => props.modelValue.length,
  (length) => {
    if (length === selectedImages.value.length) return;
    if (length === 0) {
      revokeAllObjectUrls();
      selectedImages.value = [];
    }
  }
);

onBeforeUnmount(() => {
  revokeAllObjectUrls();
});
</script>
