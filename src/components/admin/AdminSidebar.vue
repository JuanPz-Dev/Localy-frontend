<script setup lang="ts">
import { BellDot, LayoutDashboard, LogOut, ShieldCheck, Users } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth.ts";

interface Props {
  isOpen?: boolean;
}

const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
};

withDefaults(defineProps<Props>(), {
  isOpen: true,
});

const navItems = [
  { label: "Panel de administración", icon: LayoutDashboard, active: true },
  { label: "Guías pendientes", icon: ShieldCheck, active: false },
  { label: "Usuarios por rol", icon: Users, active: false },
  { label: "Notificaciones", icon: BellDot, active: false },
];
</script>

<template>
  <aside
    :class="[
      isOpen ? 'translate-x-0' : '-translate-x-full',
      'fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 md:static md:translate-x-0',
    ]"
  >
    <div class="flex h-16 items-center border-b border-slate-200 px-4">
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white"
      >
        L
      </div>

      <div class="ml-3">
        <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Localy</p>
        <p class="text-base font-semibold text-slate-900">Admin</p>
      </div>
    </div>

    <nav class="flex h-[calc(100%-4rem)] flex-col justify-between p-4">
      <div>
        <p class="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Principal
        </p>

        <ul class="space-y-2">
          <li v-for="item in navItems" :key="item.label">
            <button
              type="button"
              :class="[
                item.active
                  ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
              ]"
            >
              <component :is="item.icon" class="h-4 w-4" />
              <span>{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </div>

      <button
        @click="logout"
        type="button"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <LogOut class="h-4 w-4" />
        <span>Cerrar sesión</span>
      </button>
    </nav>
  </aside>
</template>
