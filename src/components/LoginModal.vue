<script setup lang="ts">
import { ref } from "vue";
import GoogleLoginButto from "./GoogleLoginButton.vue";
import api from "@/api/api.ts";
const emit = defineEmits(["close"]);
import { useToastStore } from "@/stores/toast.ts";

const toastStore = useToastStore();

const email = ref("");
const password = ref("");

async function handleLogin() {
  try {
    const response = await api.post("/auth/login", {
      email: email.value,
      password: password.value,
    });
    console.log("exito el login: ", response.data);
    toastStore.showToast("Inicio de sesión exitoso", "success");
    emit("close");
  } catch (error) {
    console.log("error al login: ", error);
    toastStore.showToast("Correo electrónico o contraseña incorrectos", "error");
  }
}
</script>

<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-[580px] min-h-[540px] rounded-2xl bg-white p-10 shadow-2xl flex flex-col items-center gap-7"
    >
      <div class="text-2xl text-center">
        <h2>Inicia sesión</h2>
      </div>
      <button
        @click="emit('close')"
        class="absolute right-5 top-5 text-gray-500 hover:text-black transition"
      >
        ✕
      </button>
      <div class="w-full max-w-md">
        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <div class="">
            <label for="email">Correo electrónico</label>
            <input
              v-model="email"
              type="text"
              placeholder="Correo electrónico"
              class="py-2 px-3 rounded-md border border-gray-200 w-full outline-none"
            />
          </div>
          <div class="item-center justify-around">
            <label for="password">Contraseña</label>
            <input
              v-model="password"
              type="password"
              placeholder="Contraseña"
              class="py-2 px-3 border border-gray-200 rounded-md w-full outline-none"
            />
          </div>
          <button
            type="submit"
            class="py-2 w-full text-white rounded-lg bg-[#2196F3] hover:bg-[#1E88E5] transition"
          >
            Ingresar
          </button>
        </form>
        <div class="my-4">
          <GoogleLoginButto />
        </div>
      </div>
    </div>
  </div>
</template>
