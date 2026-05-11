import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "assets",
    name: "asset-list",
    component: () => import("@/modules/asset/pages/AssetList.vue"),
    meta: { title: "资产列表", requiresAuth: true },
  },
  {
    path: "assets/new",
    name: "asset-create",
    component: () => import("@/modules/asset/pages/AssetCreate.vue"),
    meta: { title: "资产入库", requiresAuth: true },
  },
  {
    path: "assets/:id",
    name: "asset-detail",
    component: () => import("@/modules/asset/pages/AssetDetail.vue"),
    meta: { title: "资产详情", requiresAuth: true },
  },
];

export default routes;
