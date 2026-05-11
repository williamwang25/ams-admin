<template>
  <header class="flex h-14 items-center justify-between border-b border-base-300 bg-base-100 px-6">
    <div class="text-sm font-medium text-base-content/70">{{ pageTitle }}</div>
    <div class="flex items-center gap-3">
      <span class="text-sm text-base-content/70">{{ auth.profile?.name ?? "" }}</span>
      <button
        type="button"
        class="btn btn-ghost btn-sm gap-1"
        @click="onLogout"
      >
        <LogOut :size="16" />
        退出
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LogOut } from "lucide-vue-next";
import { useAuthStore } from "@/store/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const pageTitle = computed(() => {
  const title = route.meta?.title;
  return typeof title === "string" ? title : "";
});

const onLogout = () => {
  auth.clearSession();
  router.replace("/login");
};
</script>
