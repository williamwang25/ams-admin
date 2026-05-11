import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "reports",
    name: "report-placeholder",
    component: () => import("@/modules/report/pages/ReportPlaceholder.vue"),
    meta: { title: "报表（预留）", requiresAuth: true },
  },
];

export default routes;
