<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import api from "@/api/api";
import {
  Check,
  Clock3,
  ShieldCheck,
  UserRoundCog,
  Users,
  X,
  FileUser,
  Target,
} from "lucide-vue-next";

interface PendingGuide {
  id: number;
  name: string;
  lastName: string;
  phone: string;
  address: string;
  description: string;
  license: string;
  cv: string;
  languages: string[];
  guideStatus: string;
}

interface UserRecord {
  id: number;
  name: string;
  lastName: string;
  email: string;
  authProvider: string;
  roles: string[];
}

interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
}

const pendingGuides = ref<PendingGuide[]>([]);
const roleGroups = ref<Record<string, UserRecord[]>>({
  USER: [],
  GUIDE: [],
  ADMIN: [],
});
const activeRole = ref<"USER" | "GUIDE" | "ADMIN">("USER");
const isLoading = ref(true);
const isRefreshing = ref(false);

const statCards = computed(() => [
  {
    title: "Guías pendientes",
    value: pendingGuides.value.length,
    subtitle: "Esperando revisión",
    icon: Clock3,
    tone: "blue",
  },
  {
    title: "Usuarios",
    value: roleGroups.value.USER?.length ?? 0,
    subtitle: "Registrados en la app",
    icon: Users,
    tone: "violet",
  },
  {
    title: "Guías",
    value: roleGroups.value.GUIDE?.length ?? 0,
    subtitle: "Guías activos",
    icon: ShieldCheck,
    tone: "emerald",
  },
  {
    title: "Administradores",
    value: roleGroups.value.ADMIN?.length ?? 0,
    subtitle: "Acceso total",
    icon: UserRoundCog,
    tone: "amber",
  },
]);

const roleTabs = [
  { key: "USER", label: "Usuarios" },
  { key: "GUIDE", label: "Guías" },
  { key: "ADMIN", label: "Administradores" },
] as const;

const currentRoleUsers = computed(() => roleGroups.value[activeRole.value] ?? []);

async function fetchPendingGuides() {
  const { data } = await api.get<PageResult<PendingGuide>>("/admin/guides/pending", {
    params: { page: 0, size: 10 },
  });

  pendingGuides.value = data.content ?? [];
}

async function fetchUsersByRole(role: string) {
  const { data } = await api.get<PageResult<UserRecord>>("/admin/by-role", {
    params: { rol: role, page: 0, size: 20 },
  });

  roleGroups.value[role] = data.content ?? [];
}

async function loadAdminData() {
  isLoading.value = true;

  try {
    await Promise.all([
      fetchPendingGuides(),
      fetchUsersByRole("USER"),
      fetchUsersByRole("GUIDE"),
      fetchUsersByRole("ADMIN"),
    ]);
  } finally {
    isLoading.value = false;
  }
}

function viewCv(cv: string) {
  if (!cv) {
    alert("Este guía no tiene un CV cargado.");
    return;
  }
  window.open(cv, "_black", "noopener,noreferrer");
}

async function handleGuideAction(guideId: number, action: "approve" | "reject") {
  isRefreshing.value = true;

  try {
    await api.put(`/admin/guides/${guideId}/${action}`);
    await loadAdminData();
  } finally {
    isRefreshing.value = false;
  }
}

const formatRoles = (roles: string[]) => roles.map((role) => role.replace("ROLE_", "")).join(", ");

onMounted(() => {
  loadAdminData();
});
</script>

<template>
  <div class="space-y-6">
    <section
      class="rounded-3xl border border-slate-200 bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm"
    >
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-medium text-blue-100">Resumen del sistema</p>
          <h2 class="mt-1 text-3xl font-bold">Bienvenido al panel administrativo</h2>
        </div>

        <div class="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          <p class="text-xs uppercase tracking-[0.24em] text-blue-100">Estado</p>
          <p class="mt-1 text-lg font-semibold">Sistema operativo</p>
        </div>
      </div>
    </section>

    <section v-if="isLoading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="n in 4"
        :key="n"
        class="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
      />
    </section>

    <section v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in statCards"
        :key="card.title"
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-500">{{ card.title }}</p>
            <p class="mt-2 text-3xl font-bold text-slate-900">{{ card.value }}</p>
          </div>

          <div
            :class="[
              card.tone === 'blue'
                ? 'bg-blue-100 text-blue-600'
                : card.tone === 'violet'
                  ? 'bg-violet-100 text-violet-600'
                  : card.tone === 'emerald'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600',
              'flex h-11 w-11 items-center justify-center rounded-xl',
            ]"
          >
            <component :is="card.icon" class="h-5 w-5" />
          </div>
        </div>

        <p class="mt-3 text-sm text-slate-500">{{ card.subtitle }}</p>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-sm text-slate-500">Revisión</p>
            <h3 class="text-xl font-semibold text-slate-900">Guías pendientes</h3>
          </div>

          <span class="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {{ pendingGuides.length }} pendientes
          </span>
        </div>

        <div v-if="pendingGuides.length" class="space-y-4">
          <div
            v-for="guide in pendingGuides"
            :key="guide.id"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-sm font-semibold text-blue-700"
                  >
                    {{ guide.name.charAt(0).toUpperCase()
                    }}{{ guide.lastName.charAt(0).toUpperCase() }}
                  </div>

                  <div>
                    <p class="text-base font-semibold text-slate-900">
                      {{ guide.name }} {{ guide.lastName }}
                    </p>
                    <p class="text-sm text-slate-500">
                      {{ guide.phone || "Sin teléfono disponible" }}
                    </p>
                  </div>
                </div>

                <div class="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                  <p>
                    <span class="font-medium text-slate-700">Teléfono:</span>
                    {{ guide.phone || "No disponible" }}
                  </p>
                  <p>
                    <span class="font-medium text-slate-700">Dirección:</span>
                    {{ guide.address || "No disponible" }}
                  </p>
                </div>

                <p class="mt-3 text-sm text-slate-600">
                  <span class="font-medium text-slate-700">Descripción:</span>
                  {{ guide.description || "Sin descripción disponible" }}
                </p>

                <div class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="language in guide.languages"
                    :key="language"
                    class="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {{ language }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-2 md:items-end">
                <span
                  class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"
                >
                  {{ guide.guideStatus }}
                </span>

                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="viewCv(guide.cv)"
                    :disable="!guide.cv"
                    class="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileUser class="h-4 w-4" />
                    Cv
                  </button>

                  <button
                    type="button"
                    @click="handleGuideAction(guide.id, 'approve')"
                    :disabled="isRefreshing"
                    class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Check class="h-4 w-4" />
                    Aprobar
                  </button>

                  <button
                    type="button"
                    @click="handleGuideAction(guide.id, 'reject')"
                    :disabled="isRefreshing"
                    class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    <X class="h-4 w-4" />
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"
        >
          <p class="text-lg font-semibold text-slate-700">No hay guías pendientes</p>
          <p class="mt-2 text-sm text-slate-500">Todo está actualizado en este momento.</p>
        </div>
      </article>

      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4">
          <p class="text-sm text-slate-500">Usuarios</p>
          <h3 class="text-xl font-semibold text-slate-900">Usuarios por rol</h3>
        </div>

        <div class="mb-4 flex flex-wrap gap-2">
          <button
            v-for="tab in roleTabs"
            :key="tab.key"
            type="button"
            @click="activeRole = tab.key"
            :class="[
              activeRole === tab.key
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              'rounded-full px-3 py-1.5 text-sm font-medium transition',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <div v-if="currentRoleUsers.length" class="space-y-3">
          <div
            v-for="user in currentRoleUsers"
            :key="user.id"
            class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <div>
              <p class="font-medium text-slate-800">{{ user.name }} {{ user.lastName }}</p>
              <p class="text-sm text-slate-500">{{ user.email }}</p>
            </div>

            <div class="text-right">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Rol</p>
              <p class="text-sm font-medium text-slate-700">
                {{ formatRoles(user.roles) || "Sin rol" }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"
        >
          <p class="text-sm text-slate-500">No hay registros para este rol.</p>
        </div>
      </article>
    </section>
  </div>
</template>
