<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-base-content">用户管理</h1>
      <button type="button" class="btn btn-primary btn-sm" disabled>
        <Plus :size="16" />
        新增管理员
      </button>
    </header>

    <div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-card text-sm text-base-content/60">
      仅超管可见：管理员 CRUD + 重置密码（生成临时密码 + 强制改密）；教师账号只读查看。
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus } from "lucide-vue-next";
</script>
