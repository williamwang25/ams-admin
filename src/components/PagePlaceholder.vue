<template>
  <section class="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed border-base-300 bg-base-100 p-10 text-center shadow-card">
    <component :is="icon" :size="40" class="text-base-content/30" />
    <h2 class="mt-4 text-lg font-semibold text-base-content">{{ title }}</h2>
    <p v-if="description" class="mt-2 max-w-md text-sm text-base-content/60">{{ description }}</p>
    <slot />
  </section>
</template>

<script setup lang="ts">
import { Construction } from "lucide-vue-next";

withDefaults(
  defineProps<{
    title: string;
    description?: string;
    icon?: typeof Construction;
  }>(),
  { icon: Construction }
);
</script>
