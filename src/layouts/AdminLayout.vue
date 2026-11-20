<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import Sidebar from "@/components/admin/Sidebar.vue";
const title = computed(() => (route.meta.title as string) ?? "Panel");
const section = computed(() => (route.meta.section as string) ?? "Admin");
</script>

<template>
  <SidebarProvider>
    <Sidebar />
    <SidebarInset class="min-w-0 bg-slate-100">
      <header
        class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <SidebarTrigger class="cursor-pointer" />
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {{ section }}
            </p>
            <h1 class="text-lg font-semibold text-slate-900">{{ title }}</h1>
          </div>
        </div>
      </header>
      <main class="p-6">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
