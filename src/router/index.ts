import { createRouter, createWebHistory } from "vue-router";
import OAuthCallback from "@/views/OAuthCallback.vue";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") ?? "null");
  } catch {
    return null;
  }
};

const hasRole = (role: string) => {
  const user = getStoredUser();
  return Array.isArray(user?.roles) && user.roles.includes(role);
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/admin",
      name: "admin",
      component: () => import("../layouts/AdminLayout.vue"),
      meta: { requiresAuth: true, requiresAdminRole: true },
      children: [
        {
          path: "",
          name: "admin-dashboard",
          component: () => import("../views/AdminDashboardView.vue"),
        },
      ],
    },
    {
      path: "/",
      component: () => import("../layouts/UserLayout.vue"),
      children: [
        {
          path: "",
          name: "home",
          component: () => import("../views/user/HomeView.vue"),
        },
        {
          path: "/solicited-guide",
          name: "solicited-guide",
          component: () => import("../views/GuideApplicationView.vue"),
          meta: { requiresAuth: true, requiresUserRole: true },
        },
        {
          path: "/create-service",
          name: "create-service",
          component: () => import("../views/guide/CreateTourView.vue"),
          meta: { requiresAuth: true, requiresGuideRole: true },
        },
      ],
    },
    {
      path: "/oauth/callback",
      component: OAuthCallback,
    },
  ],
});

router.beforeEach((to, from, next) => {
  const user = getStoredUser();

  if (to.meta.requiresAuth && !user) {
    next({ name: "home" });
    return;
  }

  if (to.meta.requiresAdminRole && !hasRole("ADMIN")) {
    next({ name: "home" });
    return;
  }

  if (to.meta.requiresGuideRole && !hasRole("GUIDE")) {
    next({ name: "home" });
    return;
  }

  if (to.meta.requiresUserRole && !hasRole("USER")) {
    next({ name: "home" });
    return;
  }

  next();
});

export default router;
