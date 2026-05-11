<template>
  <section class="space-y-4">
    <header>
      <h1 class="text-xl font-semibold text-base-content">大型资产</h1>
    </header>

    <div class="grid gap-4 md:grid-cols-4">
      <div v-for="card in cards" :key="card.key" class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
        <div class="text-sm text-base-content/60">{{ card.label }}</div>
        <div class="mt-2 text-2xl font-semibold text-base-content">--</div>
      </div>
    </div>

    <div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-card text-sm text-base-content/60">
      列表 + 详情同 5.4，但详情额外展示「使用率」与「借出 Timeline」。
    </div>
  </section>
</template>

<script setup lang="ts">
const cards = [
  { key: "total", label: "大型资产总数" },
  { key: "value", label: "大型资产总值" },
  { key: "lent", label: "当前借出数" },
  { key: "borrow_total", label: "累计借出次数" },
];
</script>
