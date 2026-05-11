import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "",
    name: "dashboard",
    component: () => import("@/modules/dashboard/pages/DashboardPage.vue"),
    meta: { title: "看板", requiresAuth: true },
  },
];

export default routes;
