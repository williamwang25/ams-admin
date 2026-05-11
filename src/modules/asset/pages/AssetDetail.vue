<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-base-content">资产详情 #{{ id }}</h1>
      <RouterLink to="/assets" class="btn btn-ghost btn-sm">返回列表</RouterLink>
    </header>

    <div role="tablist" class="tabs tabs-bordered">
      <a role="tab" class="tab tab-active">详细字段</a>
      <a role="tab" class="tab">生命周期 Timeline</a>
      <a role="tab" class="tab">借用记录</a>
    </div>

    <div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-card text-sm text-base-content/60">
      待接入 <code>asset.getDetail</code> + <code>asset.getTimeline</code>（详见 docs/04-api-spec.md 4.2.2 / 5.4.3）。
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();
const id = computed(() => String(route.params.id ?? ""));
</script>
