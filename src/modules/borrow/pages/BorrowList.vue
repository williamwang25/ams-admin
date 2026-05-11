<template>
  <section class="space-y-4">
    <header>
      <h1 class="text-xl font-semibold text-base-content">借用审批</h1>
    </header>

    <div role="tablist" class="tabs tabs-bordered">
      <a
        v-for="t in tabs"
        :key="t.value"
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === t.value }"
        @click="activeTab = t.value"
      >
        {{ t.label }}
      </a>
    </div>

    <div class="rounded-lg border border-base-300 bg-base-100 shadow-card overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>流水号</th>
            <th>教师</th>
            <th>申请时间</th>
            <th>资产数量</th>
            <th>用途</th>
            <th>拟归还</th>
            <th>状态</th>
            <th class="text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="8" class="text-center text-sm text-base-content/40 py-10">
              待接入 ams_borrow_request SDK 直连查询
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { BorrowStatus } from "@/utils/status";

type TabValue = BorrowStatus;
const tabs: { value: TabValue; label: string }[] = [
  { value: "PENDING", label: "待审批" },
  { value: "APPROVED", label: "已通过" },
  { value: "REJECTED", label: "已拒绝" },
  { value: "RETURNED", label: "已归还" },
];
const activeTab = ref<TabValue>("PENDING");
</script>
