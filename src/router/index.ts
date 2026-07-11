import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const routes: Readonly<RouteRecordRaw[]> = [
  {
    path: "/",
    name: "mainLayout",
    component: () => import("@/layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "homeView",
        component: () => import("@/views/HomeView.vue"),
      },
    ],
  },
  {
    path: "/auth",
    name: "authLayout",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [
      {
        path: "callback",
        name: "authCallbackView",
        component: () => import("@/views/auth/AuthCallbackView.vue"),
      },
      {
        path: "login",
        name: "loginView",
        component: () => import("@/views/auth/LoginView.vue"),
      },
      {
        path: "register",
        name: "registerView",
        component: () => import("@/views/auth/RegisterView.vue"),
      },
    ],
  },
  {
    path: "/app",
    name: "appLayout",
    component: () => import("@/layouts/AppLayout.vue"),
    children: [
      {
        path: "chats",
        name: "chatsView",
        component: () => import("@/views/app/ChatsView.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
