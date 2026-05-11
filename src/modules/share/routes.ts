import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "share",
    name: "share-placeholder",
    component: () => import("@/modules/share/pages/SharePlaceholder.vue"),
    meta: { title: "闲置共享（预留）", requiresAuth: true },
  },
];

export default routes;
