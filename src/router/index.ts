import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/store/auth";

import authRoutes from "@/modules/auth/routes";
import dashboardRoutes from "@/modules/dashboard/routes";
import assetRoutes from "@/modules/asset/routes";
import borrowRoutes from "@/modules/borrow/routes";
import largeAssetRoutes from "@/modules/large-asset/routes";
import noticeRoutes from "@/modules/notice/routes";
import userRoutes from "@/modules/user/routes";
import reportRoutes from "@/modules/report/routes";
import shareRoutes from "@/modules/share/routes";

import AppLayout from "@/components/AppLayout.vue";

/**
 * 路由聚合：每个模块在 modules/<m>/routes.ts 暴露 RouteRecordRaw[]，在此聚合到全局 layout。
 *
 * meta 字段约定：
 *   - requiresAuth: true 时，未登录会跳 /login（默认所有受保护路由都开启）。
 *   - requiresSuperAdmin: true 时，仅 SUPER_ADMIN 可进入（如 /admins）。
 */

const protectedRoutes: RouteRecordRaw[] = [
  ...dashboardRoutes,
  ...assetRoutes,
  ...borrowRoutes,
  ...largeAssetRoutes,
  ...noticeRoutes,
  ...userRoutes,
  ...reportRoutes,
  ...shareRoutes,
];

const routes: RouteRecordRaw[] = [
  ...authRoutes,
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: protectedRoutes,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  if (to.meta.requiresSuperAdmin && !auth.isSuperAdmin) {
    return { path: "/" };
  }

  if (to.path === "/login" && auth.isLoggedIn) {
    return { path: "/" };
  }

  return true;
});

export default router;
