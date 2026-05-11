import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "notices",
    name: "notice-list",
    component: () => import("@/modules/notice/pages/NoticeList.vue"),
    meta: { title: "通知公告", requiresAuth: true },
  },
];

export default routes;
