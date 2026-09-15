<script setup lang="ts">
import { ref } from "vue";
import AdminSidebar from "@/components/admin/AdminSidebar.vue";
import { Bell, Menu } from "lucide-vue-next";

const isSidebarOpen = ref(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
  <div class="flex min-h-screen bg-slate-100">
    <AdminSidebar :is-open="isSidebarOpen" />

    <div class="flex-1 min-w-0">
      <header
        class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="toggleSidebar"
            class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu class="h-4 w-4" />
          </button>

          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Panel</p>
            <h1 class="text-lg font-semibold text-slate-900">Panel de administración</h1>
          </div>
        </div>

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
          aria-label="Notificaciones"
        >
          <Bell class="h-4 w-4" />
        </button>
      </header>

      <main class="p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
