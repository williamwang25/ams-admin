<template>
  <div class="flex min-h-screen bg-base-200 text-base-content">
    <AppSidebar class="hidden md:flex md:w-60 md:flex-shrink-0" />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppTopbar />
      <main class="min-w-0 flex-1 overflow-x-auto px-6 py-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import AppSidebar from "@/components/AppSidebar.vue";
import AppTopbar from "@/components/AppTopbar.vue";
</script>
