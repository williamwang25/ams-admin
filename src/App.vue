<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import { checkEnvironment } from "@/utils/cloudbase";

// 启动时检查环境变量；缺失会在 console 给出指引（详见 utils/cloudbase.ts）。
checkEnvironment();
</script>
