<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Badge } from "@/components/ui/badge";
import type { RoleKey, UserRecord } from "@/types/admin";

const props = defineProps<{
  groups: Record<RoleKey, UserRecord[]>;
  totals: Record<RoleKey, number>;
  hasMore: Record<RoleKey, boolean>;
  loading: Record<RoleKey, boolean>;
}>();

const emit = defineEmits<{
  loadMore: [role: RoleKey];
}>();

const tabs: { key: RoleKey; label: string }[] = [
  { key: "USER", label: "Usuarios" },
  { key: "GUIDE", label: "Guías" },
  { key: "ADMIN", label: "Administradores" },
];

const roleStyles: Record<string, { label: string; class: string }> = {
  USER: { label: "Usuario", class: "bg-violet-100 text-violet-700 hover:bg-violet-100" },
  GUIDE: { label: "Guía", class: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  ADMIN: { label: "Admin", class: "bg-amber-100 text-amber-700 hover:bg-amber-100" },
};

const activeRole = ref<RoleKey>("USER");
const users = computed(() => props.groups[activeRole.value] ?? []);
const scrollContainer = ref<HTMLDivElement | null>(null);
const loadMoreTarget = ref<HTMLDivElement | null>(null);
let observer: IntersectionObserver | undefined;

const normalizeRole = (role: string) => role.replace("ROLE_", "");

const roleBadge = (role: string) =>
  roleStyles[normalizeRole(role)] ?? {
    label: normalizeRole(role),
    class: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  };

const initials = (user: UserRecord) =>
  `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      const role = activeRole.value;
      if (entry?.isIntersecting && props.hasMore[role] && !props.loading[role]) {
        emit("loadMore", role);
      }
    },
    { root: scrollContainer.value, rootMargin: "0px 0px 120px 0px" },
  );
});

watch(
  () => [activeRole.value, users.value.length] as const,
  async () => {
    await nextTick();
    if (loadMoreTarget.value) observer?.observe(loadMoreTarget.value);
  },
  { flush: "post" },
);

onBeforeUnmount(() => observer?.disconnect());
</script>
<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <header class="mb-4">
      <p class="text-sm text-slate-500">Usuarios</p>
      <h3 class="text-xl font-semibold text-slate-900">Usuarios por rol</h3>
    </header>

    <!-- Pestañas fijas (fuera del scroll) -->
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        class="cursor-pointer"
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        :class="[
          activeRole === tab.key
            ? 'bg-[#14B8A6] text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
          'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition',
        ]"
        @click="activeRole = tab.key"
      >
        {{ tab.label }}
        <span
          :class="[
            activeRole === tab.key ? 'bg-white/20 text-white' : 'bg-white text-slate-500',
            'rounded-full px-1.5 text-xs',
          ]"
        >
          {{ totals[tab.key] ?? groups[tab.key]?.length ?? 0 }}
        </span>
      </button>
    </div>
    <div ref="scrollContainer" class="h-90 overflow-y-auto">
      <div
        v-if="!users.length"
        class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"
      >
        <p class="text-sm text-slate-500">No hay registros para este rol.</p>
      </div>
      <div v-else class="space-y-3 pr-3">
        <div
          v-for="user in users"
          :key="user.id"
          class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-700"
            >
              {{ initials(user) }}
            </div>
            <div class="min-w-0">
              <p class="truncate font-medium text-slate-800">{{ user.name }} {{ user.lastName }}</p>
              <p class="truncate text-sm text-slate-500">{{ user.email }}</p>
            </div>
          </div>

          <div class="flex shrink-0 flex-wrap justify-end gap-1">
            <Badge
              v-for="role in user.roles"
              :key="role"
              :class="['border-transparent', roleBadge(role).class]"
            >
              {{ roleBadge(role).label }}
            </Badge>
            <span v-if="!user.roles.length" class="text-sm text-slate-400">Sin rol</span>
          </div>
        </div>
        <div ref="loadMoreTarget" class="py-2 text-center text-sm text-slate-500">
          <span v-if="loading[activeRole]">Cargando más usuarios...</span>
          <span v-else-if="!hasMore[activeRole]">
            Mostrando {{ users.length }} de {{ totals[activeRole] }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
