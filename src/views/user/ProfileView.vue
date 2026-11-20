```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { User, Settings, Shield, Pencil, Mail, CheckCircle2, X, Save } from "lucide-vue-next";

import api from "@/api/api";
import { useToastStore } from "@/stores/toast";

const toastStore = useToastStore();

interface UserResponse {
  id: number;
  profilePhoto: string | null;
  name: string;
  lastName: string;
  email: string;
  authProvider: string;
  roles: string[];
}

interface UpdateUserRequest {
  name: string;
  lastName: string;
  email: string;
}
const user = ref<UserResponse | null>(null);

const loading = ref(true);
const savingProfile = ref(false);

const activeSection = ref("personal");
const isEditingProfile = ref(false);

const editForm = ref<UpdateUserRequest>({
  name: "",
  lastName: "",
  email: "",
});
async function getProfile() {
  try {
    const response = await api.get<UserResponse>("/auth/me");
    user.value = response.data;
  } catch (error) {
    toastStore.showToast("No se pudo obtener la información del usuario", "error");
  } finally {
    loading.value = false;
  }
}
function startEditingProfile() {
  if (!user.value) return;

  editForm.value = {
    name: user.value.name,
    lastName: user.value.lastName,
    email: user.value.email,
  };

  isEditingProfile.value = true;
}
function cancelEditingProfile() {
  if (!user.value) return;

  editForm.value = {
    name: user.value.name,
    lastName: user.value.lastName,
    email: user.value.email,
  };

  isEditingProfile.value = false;
}
async function updateUserProfile() {
  const name = editForm.value.name.trim();
  const lastName = editForm.value.lastName.trim();
  const email = editForm.value.email.trim();

  if (!name || !lastName || !email) {
    toastStore.showToast("Nombre, apellido y correo son obligatorios", "error");
    return;
  }

  try {
    savingProfile.value = true;

    const response = await api.put<UserResponse>("/users/update", {
      name,
      lastName,
      email,
    });

    user.value = response.data;

    isEditingProfile.value = false;

    toastStore.showToast("Cambios guardados correctamente", "success");
  } catch (error) {
    toastStore.showToast("No se pudo actualizar la información del usuario", "error");
  } finally {
    savingProfile.value = false;
  }
}

function getInitials() {
  if (!user.value) return "";

  return (user.value.name.charAt(0) + user.value.lastName.charAt(0)).toUpperCase();
}

function formatRole(role: string) {
  const roles: Record<string, string> = {
    USER: "Turista",
    GUIDE: "Guía",
    ADMIN: "Administrador",
  };

  return roles[role] ?? role;
}

function formatAuthProvider(provider: string) {
  if (provider === "GOOGLE") {
    return "Google";
  }

  return "Correo electrónico";
}

onMounted(() => {
  getProfile();
});
</script>

<template>
  <div class="min-h-screen bg-white px-6 py-10">
    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[300px_1fr]">
      <aside class="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="px-6 pb-6 pt-7 text-center">
          <div
            class="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-blue-600"
          >
            <img
              v-if="user?.profilePhoto"
              :src="user.profilePhoto"
              alt="Foto de perfil"
              class="h-full w-full object-cover"
            />
            <span v-else class="text-3xl font-semibold text-white">
              {{ getInitials() }}
            </span>
          </div>
          <h2 v-if="user" class="mt-4 text-xl font-semibold text-slate-900">
            {{ user.name }} {{ user.lastName }}
          </h2>
          <p v-if="user" class="mt-1 break-all text-sm text-slate-500">
            {{ user.email }}
          </p>
          <div v-if="user" class="mt-4 flex justify-center gap-2">
            <span
              v-for="role in user.roles"
              :key="role"
              class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
            >
              {{ formatRole(role) }}
            </span>
          </div>
        </div>
        <nav class="border-t border-slate-200 px-3 py-3">
          <button
            @click="activeSection = 'personal'"
            class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition"
            :class="
              activeSection === 'personal'
                ? 'bg-blue-50 font-medium text-blue-600'
                : 'text-slate-700 hover:bg-slate-50'
            "
          >
            <User :size="18" />
            <span> Información personal </span>
          </button>
          <button
            @click="activeSection = 'preferences'"
            class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <Settings :size="18" />
            <span> Preferencias </span>
          </button>
          <button
            @click="activeSection = 'security'"
            class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <Shield :size="18" />
            <span> Seguridad </span>
          </button>
        </nav>
      </aside>
      <main>
        <div v-if="loading" class="flex min-h-[300px] items-center justify-center">
          <div class="text-center">
            <div
              class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
            ></div>
            <p class="mt-4 text-sm text-slate-500">Cargando información...</p>
          </div>
        </div>
        <section v-else-if="activeSection === 'personal' && user">
          <div class="mb-8">
            <h1 class="text-3xl font-semibold tracking-tight text-slate-900">
              Información personal
            </h1>
            <p class="mt-2 text-sm text-slate-500">
              Administra la información asociada a tu cuenta de Localy.
            </p>
          </div>
          <div class="border-b border-slate-200 py-5">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-medium text-slate-900">Información de perfil</h3>
              <button
                v-if="!isEditingProfile"
                @click="startEditingProfile"
                class="flex items-center gap-1 text-sm text-slate-600 transition hover:text-blue-600"
              >
                Editar
                <Pencil :size="13" />
              </button>
            </div>
            <div v-if="!isEditingProfile" class="mt-5 space-y-5">
              <div>
                <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Nombre completo
                </p>
                <p class="mt-1 text-sm text-slate-700">{{ user.name }} {{ user.lastName }}</p>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Correo electrónico
                </p>
                <div class="mt-1 flex items-center gap-2 text-sm text-slate-700">
                  <Mail :size="17" class="text-slate-400" />
                  {{ user.email }}
                </div>
              </div>
            </div>
            <div v-else class="mt-6 space-y-5">
              <div>
                <label for="name" class="mb-2 block text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input
                  id="name"
                  v-model="editForm.name"
                  type="text"
                  autocomplete="given-name"
                  placeholder="Ingresa tu nombre"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label for="lastName" class="mb-2 block text-sm font-medium text-slate-700">
                  Apellido
                </label>
                <input
                  id="lastName"
                  v-model="editForm.lastName"
                  type="text"
                  autocomplete="family-name"
                  placeholder="Ingresa tu apellido"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label for="email" class="mb-2 block text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <div class="relative">
                  <Mail
                    :size="17"
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email"
                    v-model="editForm.email"
                    type="email"
                    autocomplete="email"
                    placeholder="correo@ejemplo.com"
                    class="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  @click="cancelEditingProfile"
                  :disabled="savingProfile"
                  class="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X :size="16" />
                  Cancelar
                </button>
                <button
                  type="button"
                  @click="updateUserProfile"
                  :disabled="savingProfile"
                  class="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save :size="16" />

                  <span v-if="!savingProfile"> Guardar cambios </span>

                  <span v-else> Guardando... </span>
                </button>
              </div>
            </div>
          </div>
          <div class="border-b border-slate-200 py-5">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-medium text-slate-900">Método de acceso</h3>
            </div>

            <div class="mt-4 flex items-center gap-2">
              <CheckCircle2 :size="18" class="text-emerald-500" />

              <span class="text-sm text-slate-700">
                {{ formatAuthProvider(user.authProvider) }}
              </span>
            </div>
          </div>
          <div class="border-b border-slate-200 py-5">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-medium text-slate-900">Tipo de cuenta</h3>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="role in user.roles"
                :key="role"
                class="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
              >
                {{ formatRole(role) }}
              </span>
            </div>
          </div>
        </section>
        <section v-else-if="activeSection === 'preferences'">
          <div class="mb-8">
            <h1 class="text-3xl font-semibold text-slate-900">Preferencias</h1>
            <p class="mt-2 text-sm text-slate-500">Personaliza tu experiencia en Localy.</p>
          </div>
          <div class="border-b border-slate-200 py-5">
            <h3 class="font-medium text-slate-900">Preferencias de experiencia</h3>
            <p class="mt-2 text-sm text-slate-500">Esta sección estará disponible próximamente.</p>
          </div>
        </section>
        <section v-else-if="activeSection === 'security'">
          <div class="mb-8">
            <h1 class="text-3xl font-semibold text-slate-900">Seguridad</h1>
            <p class="mt-2 text-sm text-slate-500">Revisa cómo está protegida tu cuenta.</p>
          </div>
          <div class="border-b border-slate-200 py-5">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-slate-900">Método de autenticación</h3>

                <p class="mt-2 text-sm text-slate-500">
                  {{
                    user?.authProvider === "GOOGLE"
                      ? "Tu cuenta utiliza Google para iniciar sesión."
                      : "Tu cuenta utiliza correo electrónico y contraseña."
                  }}
                </p>
              </div>
              <CheckCircle2 :size="22" class="text-emerald-500" />
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
