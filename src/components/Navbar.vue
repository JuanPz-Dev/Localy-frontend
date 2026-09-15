<script setup lang="ts">
import logo from "../assets/images/logo.svg";
import { Search, User } from "lucide-vue-next";
import { ref, onMounted, onUnmounted } from "vue";
import LoginModal from "./LoginModal.vue";
import RegisterModal from "./RegisterModal.vue";
import { useAuthStore } from "@/stores/auth.ts";
import router from "@/router/index.ts";
import { useToastStore } from "@/stores/toast.ts";

const authStore = useAuthStore();
const toastStore = useToastStore();

const logout = () => {
  menuOpen.value = false;
  toastStore.showToast("Sesión cerrada correctamente", "error");
  authStore.logout();
};

const goToGuideApplication = () => {
  menuOpen.value = false;
  router.push("/solicited-guide");
};

const goToCreateTour = () => {
  menuOpen.value = false;
  router.push("/create-service");
};

const menuOpen = ref(false);
const showLogin = ref(false);
const showRegister = ref(false);

function openLogin() {
  menuOpen.value = false;
  showLogin.value = true;
}

function openRegister() {
  menuOpen.value = false;
  showRegister.value = true;
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function closeMenu(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest(".profile-menu")) {
    menuOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", closeMenu);
});
onUnmounted(() => {
  document.removeEventListener("click", closeMenu);
});
</script>

<template>
  <nav class="fixed z-50 w-full border-b border-gray-200 bg-white px-11.25 py-4">
    <div class="flex items-center justify-between px-8">
      <a href="/">
        <img :src="logo" alt="Localy" class="h-12.5 w-auto" />
      </a>
      <div class="relative w-80">
        <Search
          :size="20"
          class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
        />
        <input
          type="text"
          placeholder="Buscar experiencias"
          class="w-full rounded-full border border-gray-200 bg-neutral-100 py-2 pl-11 pr-4 outline-none transition focus:border-gray-400 focus:bg-white"
        />
      </div>
      <div class="profile-menu relative">
        <button
          @click="toggleMenu"
          class="flex flex-col items-center justify-center rounded-xl px-3 py-1 transition hover:bg-gray-100"
        >
          <img
            v-if="authStore.user?.profilePhoto"
            :src="authStore.user?.profilePhoto"
            alt="Foto de perfil"
            class="h-10 w-10 rounded-full object-cover"
          />
          <div v-else class="flex h-10 w-10 items-center justify-center rounded-full bg-[#00a3e0]">
            <User :size="20" class="text-white" />
          </div>
          <span class="mt-1 text-sm font-medium text-neutral-700"> Perfil </span>
        </button>
        <!-- MENU -->
        <div
          v-if="menuOpen"
          class="absolute right-0 top-full mt-3 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
        >
          <template v-if="!authStore.isAuthenticated">
            <button
              @click="openLogin"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Iniciar sesión
            </button>

            <button
              @click="openRegister"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Registrarse
            </button>
          </template>
          <template v-else>
            <button
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Mi perfil
            </button>
            <button
              v-if="authStore.isUser"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Mis reservas
            </button>
            <button
              @click="goToGuideApplication"
              v-if="authStore.isUser && !authStore.isGuide"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Solicitar ser Guia
            </button>
            <button
              @click="goToCreateTour"
              v-if="authStore.isGuide"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Publicar Servicio
            </button>
            <button
              v-if="authStore.isGuide"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Mis servicios
            </button>
            <button
              @click="logout"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
            >
              Cerrar Sesion
            </button>
          </template>
        </div>
      </div>
      <LoginModal v-if="showLogin" @close="showLogin = false" />
      <RegisterModal v-if="showRegister" @close="showRegister = false" />
    </div>
  </nav>
</template>
