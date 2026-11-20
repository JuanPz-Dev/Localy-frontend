<script setup lang="ts">
import logo from "../assets/logos/logo.svg";
import { User } from "lucide-vue-next";
import { ref, onMounted, onUnmounted } from "vue";
import LoginModal from "../components/auth/LoginModal.vue";
import RegisterModal from "../components/auth/RegisterModal.vue";
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

const profileView = () => {
  menuOpen.value = false;
  router.push("/me");
};

const myReservations = () => {
  menuOpen.value = false;
  router.push("/reservations");
};

const guideReservations = () => {
  menuOpen.value = false;
  router.push("/guide/reservations");
};

const myTours = () => {
  menuOpen.value = false;
  router.push("/guide/my-tours");
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
      <div class="profile-menu relative">
        <button
          @click="toggleMenu"
          class="flex flex-col items-center justify-center rounded-xl px-3 py-1 transition hover:bg-gray-100 cursor-pointer"
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
        <div
          v-if="menuOpen"
          class="absolute right-0 top-full mt-3 w-52 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
        >
          <template v-if="!authStore.isAuthenticated">
            <button
              @click="openLogin"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
            >
              Iniciar sesión
            </button>
            <button
              @click="openRegister"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
            >
              Registrarse
            </button>
          </template>
          <template v-else>
            <button
              @click="profileView"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
            >
              Mi perfil
            </button>
            <button
              @click="myReservations"
              v-if="authStore.isUser"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
            >
              Mis reservas
            </button>
            <button
              @click="guideReservations"
              v-if="authStore.isGuide"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
            >
              Reservas recibidas
            </button>
            <button
              @click="goToGuideApplication"
              v-if="authStore.isUser && !authStore.isGuide"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
            >
              Solicitar ser Guia
            </button>
            <button
              @click="goToCreateTour"
              v-if="authStore.isGuide"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
            >
              Publicar Servicio
            </button>
            <button
              @click="myTours"
              v-if="authStore.isGuide"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 cursor-pointer"
            >
              Mis servicios
            </button>
            <button
              @click="logout"
              class="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 cursor-pointer"
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
