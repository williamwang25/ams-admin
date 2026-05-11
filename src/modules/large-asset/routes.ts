import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "large-assets",
    name: "large-asset-list",
    component: () => import("@/modules/large-asset/pages/LargeAssetList.vue"),
    meta: { title: "大型资产", requiresAuth: true },
  },
];

export default routes;
