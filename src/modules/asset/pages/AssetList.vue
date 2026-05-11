<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-base-content">资产列表</h1>
      <RouterLink to="/assets/new" class="btn btn-primary btn-sm">
        <Plus :size="16" />
        新增入库
      </RouterLink>
    </header>

    <div class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
      <div class="grid gap-3 md:grid-cols-5">
        <input class="input input-bordered input-sm" placeholder="关键字（名称/编号/品牌）" disabled />
        <select class="select select-bordered select-sm" disabled>
          <option>全部部门</option>
        </select>
        <select class="select select-bordered select-sm" disabled>
          <option>全部状态</option>
        </select>
        <select class="select select-bordered select-sm" disabled>
          <option>是否大型</option>
        </select>
        <input class="input input-bordered input-sm" type="date" disabled />
      </div>
    </div>

    <div class="rounded-lg border border-base-300 bg-base-100 shadow-card overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>资产编号</th>
            <th>名称</th>
            <th>品牌/型号</th>
            <th>部门</th>
            <th>使用人</th>
            <th>位置</th>
            <th>状态</th>
            <th class="text-right">单价</th>
            <th class="text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="9" class="text-center text-sm text-base-content/40 py-10">
              待接入 ams_asset SDK 直连查询
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Plus } from "lucide-vue-next";
</script>
