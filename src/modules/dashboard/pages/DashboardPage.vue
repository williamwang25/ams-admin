<template>
  <section class="space-y-6">
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-base-content">看板</h1>
      <span class="text-xs text-base-content/50">数据由云函数 dashboard.* 与 SDK 直连聚合</span>
    </header>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <div
        v-for="card in summaryCards"
        :key="card.key"
        class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card"
      >
        <div class="text-sm text-base-content/60">{{ card.label }}</div>
        <div class="mt-2 text-2xl font-semibold text-base-content">--</div>
        <div class="mt-1 text-xs text-base-content/40">{{ card.hint }}</div>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <h2 class="text-base font-medium text-base-content">通知公告</h2>
        <p class="mt-2 text-sm text-base-content/50">待接入 ams_notice（SDK 直连）</p>
      </div>
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <h2 class="text-base font-medium text-base-content">总账信息</h2>
        <p class="mt-2 text-sm text-base-content/50">按学院 / 部门聚合，dashboard.ledger</p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <h2 class="text-base font-medium text-base-content">出入仓数量曲线</h2>
        <p class="mt-2 text-sm text-base-content/50">dashboard.borrowTrend</p>
      </div>
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <h2 class="text-base font-medium text-base-content">出入仓金额曲线</h2>
        <p class="mt-2 text-sm text-base-content/50">dashboard.borrowAmountTrend</p>
      </div>
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <h2 class="text-base font-medium text-base-content">按部门资产分布</h2>
        <p class="mt-2 text-sm text-base-content/50">dashboard.byDepartment</p>
      </div>
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <h2 class="text-base font-medium text-base-content">按状态占比</h2>
        <p class="mt-2 text-sm text-base-content/50">dashboard.byStatus</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const summaryCards = [
  { key: "total", label: "资产总数", hint: "ams_asset 总条数" },
  { key: "value", label: "资产总值", hint: "unit_price 累加" },
  { key: "in_use", label: "使用中", hint: "business_status=IN_USE" },
  { key: "lent", label: "出借中", hint: "business_status=LENT" },
  { key: "pending", label: "待审批", hint: "ams_borrow_request.status=PENDING" },
];
</script>
