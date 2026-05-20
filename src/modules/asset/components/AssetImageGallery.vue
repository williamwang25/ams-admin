<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-base-content">资产图片</h3>
      <span class="text-xs text-base-content/50">{{ fileIds.length }} 张</span>
    </div>

    <div v-if="fileIds.length === 0" class="rounded border border-dashed border-base-300 bg-base-200/60 p-6 text-center text-sm text-base-content/50">
      <ImageIcon :size="22" class="mx-auto mb-2 text-base-content/30" />
      暂无资产图片
    </div>

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <a
        v-for="fileID in fileIds"
        :key="fileID"
        :href="previewUrls[fileID] || undefined"
        target="_blank"
        rel="noreferrer"
        class="overflow-hidden rounded border border-base-300 bg-base-200"
      >
        <img
          v-if="previewUrls[fileID]"
          :src="previewUrls[fileID]"
          class="h-36 w-full object-cover"
          alt="资产图片"
        />
        <div v-else class="flex h-36 items-center justify-center text-xs text-base-content/40">
          预览加载中
        </div>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Image as ImageIcon } from "lucide-vue-next";
import { resolveAssetImageTempUrls } from "@/modules/asset/storage";

const props = defineProps<{ fileIds: string[] }>();
const previewUrls = ref<Record<string, string>>({});

watch(
  () => props.fileIds,
  async (fileIds) => {
    const ids = fileIds.filter(Boolean);
    if (ids.length === 0) {
      previewUrls.value = {};
      return;
    }
    try {
      const urlMap = await resolveAssetImageTempUrls(ids);
      previewUrls.value = Object.fromEntries(urlMap);
    } catch {
      previewUrls.value = {};
    }
  },
  { immediate: true }
);
</script>
