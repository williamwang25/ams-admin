<template>
  <aside class="flex flex-col border-r border-base-300 bg-base-100">
    <div class="flex h-14 items-center gap-2 border-b border-base-300 px-5">
      <div class="h-7 w-7 rounded-md bg-primary text-primary-content flex items-center justify-center">
        <Boxes :size="18" />
      </div>
      <div class="text-sm font-semibold tracking-wide text-base-content">AMS 管理端</div>
    </div>
    <nav class="flex-1 overflow-y-auto px-2 py-3">
      <ul class="space-y-1">
        <li v-for="item in visibleNav" :key="item.path">
          <RouterLink
            :to="item.path"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-base-content/80 hover:bg-base-200 hover:text-primary"
            active-class="bg-primary/10 text-primary font-medium"
          >
            <component :is="item.icon" :size="18" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
    <div class="border-t border-base-300 px-4 py-3 text-xs text-base-content/60">
      <div>{{ profile?.name ?? "未登录" }}</div>
      <div class="mt-0.5">{{ roleLabel }}</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import {
  Boxes,
  LayoutDashboard,
  Package,
  ClipboardList,
  Crown,
  Megaphone,
  UsersRound,
  BarChart3,
  Share2,
} from "lucide-vue-next";
import { useAuthStore } from "@/store/auth";

interface NavItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  superAdminOnly?: boolean;
}

const NAV: NavItem[] = [
  { path: "/", label: "看板", icon: LayoutDashboard },
  { path: "/assets", label: "资产", icon: Package },
  { path: "/borrows", label: "借用审批", icon: ClipboardList },
  { path: "/large-assets", label: "大型资产", icon: Crown },
  { path: "/notices", label: "通知公告", icon: Megaphone },
  { path: "/admins", label: "用户管理", icon: UsersRound, superAdminOnly: true },
  { path: "/reports", label: "报表（预留）", icon: BarChart3 },
  { path: "/share", label: "闲置共享（预留）", icon: Share2 },
];

const auth = useAuthStore();
const profile = computed(() => auth.profile);
const roleLabel = computed(() => {
  if (!auth.profile) return "";
  return auth.profile.role === "SUPER_ADMIN" ? "超级管理员" : "管理员";
});

const visibleNav = computed(() => NAV.filter((n) => !n.superAdminOnly || auth.isSuperAdmin));
</script>
