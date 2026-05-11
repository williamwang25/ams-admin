<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-base-content">借用申请 #{{ id }}</h1>
      <RouterLink to="/borrows" class="btn btn-ghost btn-sm">返回列表</RouterLink>
    </header>

    <div class="rounded-lg border border-base-300 bg-base-100 p-6 shadow-card text-sm text-base-content/60">
      待接入 <code>ams_borrow_request</code> 详情 + 签名预览 + 资产明细。操作按钮：通过 / 拒绝（拒绝需填原因），调
      <code>borrow.approve</code> / <code>borrow.reject</code>。
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();
const id = computed(() => String(route.params.id ?? ""));
</script>
