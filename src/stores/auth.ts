import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api";
import router from "@/router";

interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  profilePhoto: string | null;
  roles: string[];
  authProvider: string;
}

export const useAuthStore = defineStore("auth", () => {
  const savedUser = localStorage.getItem("user");
  const savedToken = localStorage.getItem("accessToken");

  const user = ref<User | null>(savedUser ? JSON.parse(savedUser) : null);
  const accessToken = ref<string | null>(savedToken);

  const isAuthenticated = computed(() => {
    return !!user.value;
  });

  const isUser = computed(() => {
    return user.value?.roles.includes("USER") ?? false;
  });

  const isGuide = computed(() => {
    return user.value?.roles.includes("GUIDE") ?? false;
  });

  const isAdmin = computed(() => {
    return user.value?.roles.includes("ADMIN") ?? false;
  });

  function login(loginData: {
    accessToken: string;
    id: number;
    name: string;
    lastName: string;
    email: string;
    profilePhoto: string | null;
    roles: string[];
    authProvider: string;
  }) {
    accessToken.value = loginData.accessToken;
    user.value = {
      id: loginData.id,
      name: loginData.name,
      lastName: loginData.lastName,
      email: loginData.email,
      profilePhoto: loginData.profilePhoto,
      roles: loginData.roles,
      authProvider: loginData.authProvider,
    };
    localStorage.setItem("user", JSON.stringify(user.value));
    localStorage.setItem("accessToken", loginData.accessToken);
  }

  async function fetchCurrentUser() {
    const response = await api.get("/auth/me", {
      withCredentials: true,
    });

    const userData = response.data;
    const normalizedUser: User = {
      id: userData.id,
      name: userData.name,
      lastName: userData.lastName,
      email: userData.email,
      profilePhoto: userData.profilePhoto ?? null,
      roles: userData.roles?.map((role: string) => role.replace("ROLE_", "")) ?? [],
      authProvider: userData.authProvider,
    };

    user.value = normalizedUser;
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    return normalizedUser;
  }

  function setUser(userData: User) {
    user.value = userData;
    localStorage.setItem("user", JSON.stringify(userData));
  }

  function logout() {
    user.value = null;
    accessToken.value = null;
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    router.replace("/");
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isUser,
    isGuide,
    isAdmin,
    login,
    fetchCurrentUser,
    setUser,
    logout,
  };
});
