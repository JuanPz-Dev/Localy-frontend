<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import api from "@/api/api";
import { Clock3, ShieldCheck, UserRoundCog, Users } from "lucide-vue-next";
import PendingGuidesPanel from "@/components/admin/PendingGuideCard.vue";
import UsersByRolePanel from "@/components/admin/UsersByRolePanel.vue";
import { useToastStore } from "@/stores/toast";
import type { PendingGuide, RoleKey, UserRecord } from "@/types/admin";

const PENDING_GUIDES_PAGE_SIZE = 10;
const USERS_PAGE_SIZE = 20;

interface PageResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
}

interface RolePagination {
  page: number;
  totalElements: number;
  hasMore: boolean;
  loading: boolean;
}

const pendingGuides = ref<PendingGuide[]>([]);
const pendingGuidesPage = ref(0);
const pendingGuidesTotal = ref(0);
const pendingGuidesHasMore = ref(true);
const pendingGuidesLoading = ref(false);
const roleGroups = ref<Record<RoleKey, UserRecord[]>>({
  USER: [],
  GUIDE: [],
  ADMIN: [],
});
const rolePagination = reactive<Record<RoleKey, RolePagination>>({
  USER: { page: 0, totalElements: 0, hasMore: true, loading: false },
  GUIDE: { page: 0, totalElements: 0, hasMore: true, loading: false },
  ADMIN: { page: 0, totalElements: 0, hasMore: true, loading: false },
});
const isLoading = ref(true);
const isRefreshing = ref(false);
const toast = useToastStore();

const statCards = computed(() => [
  {
    title: "Guías pendientes",
    value: pendingGuidesTotal.value,
    subtitle: "Esperando revisión",
    icon: Clock3,
    tone: "blue",
  },
  {
    title: "Usuarios",
    value: rolePagination.USER.totalElements,
    subtitle: "Registrados en la app",
    icon: Users,
    tone: "violet",
  },
  {
    title: "Guías",
    value: rolePagination.GUIDE.totalElements,
    subtitle: "Guías activos",
    icon: ShieldCheck,
    tone: "emerald",
  },
  {
    title: "Administradores",
    value: rolePagination.ADMIN.totalElements,
    subtitle: "Acceso total",
    icon: UserRoundCog,
    tone: "amber",
  },
]);

async function fetchPendingGuides(append = false) {
  if (pendingGuidesLoading.value || (append && !pendingGuidesHasMore.value)) return;

  const page = append ? pendingGuidesPage.value : 0;
  pendingGuidesLoading.value = true;
  try {
    const { data } = await api.get<PageResult<PendingGuide>>("/admin/guides/pending", {
      params: { page, size: PENDING_GUIDES_PAGE_SIZE },
    });

    pendingGuides.value = append
      ? [...pendingGuides.value, ...data.content]
      : data.content;
    pendingGuidesPage.value = data.page + 1;
    pendingGuidesTotal.value = data.totalElements;
    pendingGuidesHasMore.value =
      (data.page + 1) * data.size < data.totalElements;
  } finally {
    pendingGuidesLoading.value = false;
  }
}

async function fetchUsersByRole(role: RoleKey, append = false) {
  const pagination = rolePagination[role];
  if (pagination.loading || (append && !pagination.hasMore)) return;

  const page = append ? pagination.page : 0;
  pagination.loading = true;
  try {
    const { data } = await api.get<PageResult<UserRecord>>("/admin/by-role", {
      params: { rol: role, page, size: USERS_PAGE_SIZE },
    });

    roleGroups.value[role] = append
      ? [...roleGroups.value[role], ...data.content]
      : data.content;
    pagination.page = data.page + 1;
    pagination.totalElements = data.totalElements;
    pagination.hasMore = (data.page + 1) * data.size < data.totalElements;
  } finally {
    pagination.loading = false;
  }
}

async function loadAdminData() {
  isLoading.value = true;
  pendingGuides.value = [];
  pendingGuidesPage.value = 0;
  pendingGuidesTotal.value = 0;
  pendingGuidesHasMore.value = true;
  roleGroups.value = { USER: [], GUIDE: [], ADMIN: [] };
  for (const pagination of Object.values(rolePagination)) {
    pagination.page = 0;
    pagination.totalElements = 0;
    pagination.hasMore = true;
  }

  try {
    await Promise.all([
      fetchPendingGuides(),
      fetchUsersByRole("USER"),
      fetchUsersByRole("GUIDE"),
      fetchUsersByRole("ADMIN"),
    ]);
  } catch (error) {
    console.error("No se pudo cargar la información del panel administrativo.", error);
    toast.showToast("No se pudo cargar la información del panel administrativo.", "error");
  } finally {
    isLoading.value = false;
  }
}

async function loadMoreUsers(role: RoleKey) {
  try {
    await fetchUsersByRole(role, true);
  } catch (error) {
    console.error(`No se pudieron cargar más usuarios para el rol ${role}.`, error);
    toast.showToast("No se pudieron cargar más usuarios.", "error");
  }
}

async function loadMorePendingGuides() {
  try {
    await fetchPendingGuides(true);
  } catch (error) {
    console.error("No se pudieron cargar más solicitudes de guía.", error);
    toast.showToast("No se pudieron cargar más solicitudes de guía.", "error");
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

onMounted(() => {
  loadAdminData();
});
</script>

<template>
  <div class="space-y-6">
    <section
      class="rounded-3xl border border-slate-200 bg-linear-to-r bg-[#14B8A6] p-6 text-white shadow-sm"
    >
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-medium">Resumen del sistema</p>
          <h2 class="mt-1 text-3xl font-bold">Bienvenido al panel administrativo</h2>
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
      <PendingGuidesPanel
        :guides="pendingGuides"
        :total="pendingGuidesTotal"
        :has-more="pendingGuidesHasMore"
        :loading="pendingGuidesLoading"
        :busy="isRefreshing"
        @approve="handleGuideAction($event, 'approve')"
        @reject="handleGuideAction($event, 'reject')"
        @load-more="loadMorePendingGuides"
      />
      <UsersByRolePanel
        :groups="roleGroups"
        :totals="{
          USER: rolePagination.USER.totalElements,
          GUIDE: rolePagination.GUIDE.totalElements,
          ADMIN: rolePagination.ADMIN.totalElements,
        }"
        :has-more="{
          USER: rolePagination.USER.hasMore,
          GUIDE: rolePagination.GUIDE.hasMore,
          ADMIN: rolePagination.ADMIN.hasMore,
        }"
        :loading="{
          USER: rolePagination.USER.loading,
          GUIDE: rolePagination.GUIDE.loading,
          ADMIN: rolePagination.ADMIN.loading,
        }"
        @load-more="loadMoreUsers"
      />
    </section>
  </div>
</template>
