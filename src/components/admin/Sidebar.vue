<script setup lang="ts">
import type { Component } from "vue";
import { useRoute } from "vue-router";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LogOut, LayoutDashboard, ChartNoAxesCombined } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth.ts";
import logo from "@/assets/logos/admin/logo_64px.png";

interface NavItem {
  label: string;
  icon: Component;
  to: string;
  exact?: boolean;
}

const route = useRoute();
const authStore = useAuthStore();

const navItems: NavItem[] = [
  { label: "Panel de administración", icon: LayoutDashboard, to: "/admin", exact: true },
  { label: "Analítica", icon: ChartNoAxesCombined, to: "/admin/analitica" },
];

const isActive = (item: NavItem) =>
  item.exact ? route.path === item.to : route.path.startsWith(item.to);
</script>

<template>
  <Sidebar>
    <SidebarHeader class="h-16 justify-center border-b border-slate-200 px-4">
      <div class="flex items-center gap-2 px-2">
        <img :src="logo" alt="Localy" class="h-9 w-auto" />
        <div>
          <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Localy</p>
          <p class="text-base font-semibold leading-tight text-slate-900">Admin</p>
        </div>
      </div>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu class="gap-2">
          <SidebarMenuItem v-for="item in navItems" :key="item.label">
            <SidebarMenuButton
              as-child
              :is-active="isActive(item)"
              class="h-11 gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:ring-1 data-[active=true]:ring-blue-200"
            >
              <RouterLink :to="item.to">
                <component :is="item.icon" />
                <span>{{ item.label }}</span>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 cursor-pointer"
            @click="authStore.logout()"
          >
            <LogOut />
            <span>Cerrar sesión</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>
