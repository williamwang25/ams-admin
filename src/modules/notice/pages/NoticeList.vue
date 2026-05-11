<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-base-content">通知公告</h1>
      <button type="button" class="btn btn-primary btn-sm" disabled>
        <Plus :size="16" />
        新建通知
      </button>
    </header>

    <div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-card text-sm text-base-content/60">
      列表 + 富文本 / Markdown 编辑器；字段：标题 / 内容 / 级别（普通 / 重要） / 发布开关。
      调用 <code>notice.create / update / publish / delete</code>。
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus } from "lucide-vue-next";
</script>
