import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/modules/auth/pages/LoginPage.vue"),
    meta: { title: "登录", requiresAuth: false },
  },
];

export default routes;
