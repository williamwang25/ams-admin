import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "borrows",
    name: "borrow-list",
    component: () => import("@/modules/borrow/pages/BorrowList.vue"),
    meta: { title: "借用审批", requiresAuth: true },
  },
  {
    path: "borrows/:id",
    name: "borrow-detail",
    component: () => import("@/modules/borrow/pages/BorrowDetail.vue"),
    meta: { title: "借用详情", requiresAuth: true },
  },
];

export default routes;
