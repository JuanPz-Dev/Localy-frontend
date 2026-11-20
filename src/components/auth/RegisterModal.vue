<script setup lang="ts">
import { ref } from "vue";
import GoogleLoginButton from "../GoogleLoginButton.vue";
import api from "@/api/api.ts";
import PasswordInput from "../common/PasswordInput.vue";
import { useToastStore } from "@/stores/toast.ts";

const emit = defineEmits(["close"]);

const name = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");

const toastStore = useToastStore();

async function handleRegister() {
  if (
    !name.value.trim() ||
    !lastName.value.trim() ||
    !email.value.trim() ||
    !password.value.trim()
  ) {
    toastStore.showToast("Todos los campos son obligatorios", "error");
    return;
  }
  try {
    const response = await api.post("/auth/register", {
      name: name.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
    });
    toastStore.showToast("Usuario registrado correctamente", "success");
    emit("close");
  } catch (error) {
    toastStore.showToast("Ocurrió un error al registrar el usuario", "error");
  }
}
</script>
<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-145 min-h-135 rounded-2xl bg-white p-10 shadow-2xl flex flex-col items-center gap-7"
    >
      <div class="text-2xl text-center">
        <h2>Registro</h2>
      </div>
      <button
        @click="emit('close')"
        class="absolute right-5 top-5 text-gray-500 hover:text-black transition"
      >
        ✕
      </button>
      <div class="w-full max-w-md">
        <form @submit.prevent="handleRegister" class="flex flex-col gap-5">
          <div class="flex flex-row gap-4">
            <div class="flex flex-col flex-1">
              <label for="name">Nombre</label>
              <input
                v-model="name"
                type="text"
                class="border border-gray-200 outline-none rounded-md px-3 py-2"
                placeholder="Nombre"
              />
            </div>
            <div class="flex flex-col flex-1">
              <label for="">Apellido</label>
              <input
                v-model="lastName"
                type="text"
                class="border border-gray-200 outline-none rounded-md px-3 py-2"
                placeholder="Apellido"
              />
            </div>
          </div>
          <div class="flex flex-col flex-1">
            <label for="">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="Email"
              class="border border-gray-200 outline-none rounded-md px-3 py-2"
            />
          </div>
          <div class="flex flex-col flex-1">
            <label for="password">Contraseña</label>
            <PasswordInput id="password" v-model="password" />
          </div>
          <button
            type="submit"
            class="py-2 w-full text-white rounded-lg bg-[#2196F3] hover:bg-[#1E88E6] transition cursor-pointer"
          >
            Registrarse
          </button>
        </form>
        <div class="my-4">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  </div>
</template>
