<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    await authStore.fetchCurrentUser();
    router.replace("/");
  } catch (error) {
    console.error("Error al obtener el usuario de Google:", error);
    router.replace("/");
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <p>Iniciando sesión...</p>
  </div>
</template>
