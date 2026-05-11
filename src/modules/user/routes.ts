import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "admins",
    name: "admin-list",
    component: () => import("@/modules/user/pages/AdminList.vue"),
    meta: { title: "用户管理", requiresAuth: true, requiresSuperAdmin: true },
  },
];

export default routes;
