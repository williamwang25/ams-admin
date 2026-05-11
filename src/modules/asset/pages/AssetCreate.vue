<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-base-content">资产入库</h1>
      <RouterLink to="/assets" class="btn btn-ghost btn-sm">返回列表</RouterLink>
    </header>

    <div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-card">
      <p class="text-sm text-base-content/60">
        表单分组（基础 / 财务 / 归属 / 取得 / 业务）+ 图片上传，详见
        <code class="text-xs">docs/05-admin-features.md 5.4.2</code>。提交调用云函数 <code>asset.create</code>。
      </p>
      <p class="mt-3 text-xs text-base-content/40">
        资产编号默认置灰提示「系统将根据国标分类自动生成」，超管可手动覆盖。
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>
