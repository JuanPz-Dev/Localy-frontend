<script setup lang="ts">
import { RouterLink } from "vue-router";
import logo from "../assets/logos/logo.svg";
import { Instagram, Mail } from "lucide-vue-next";
const currentYear = new Date().getFullYear();
</script>
<template>
  <footer class="bg-[#0a0a0a] text-white">
    <div class="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div class="lg:col-span-2">
          <RouterLink
            to="/"
            class="inline-flex items-center gap-2"
            aria-label="Localy, ir al inicio"
          >
            <img :src="logo" alt="Localy" class="h-12.5 w-auto" />
          </RouterLink>
          <p class="mt-4 max-w-md text-sm leading-7 text-gray-300">
            Conecta con lo auténtico. Descubre experiencias únicas y conoce los destinos de la mano
            de guías locales.
          </p>
          <p class="mt-3 text-sm font-medium text-[#14B8A6]">
            Vive cada destino de una manera diferente.
          </p>
        </div>
        <div>
          <h3 class="text-sm font-semibold tracking-wide">Explora</h3>

          <ul class="mt-4 space-y-3 text-sm text-gray-300">
            <li>
              <RouterLink to="/" class="transition hover:text-[#14B8A6]">
                Descubrir experiencias
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/" class="transition hover:text-[#14B8A6]"> Inicio </RouterLink>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-sm font-semibold tracking-wide">Comunidad</h3>
          <ul class="mt-4 space-y-3 text-sm text-gray-300">
            <li>
              <a
                href="mailto:contacto@localy.com"
                class="inline-flex items-center gap-2 transition hover:text-[#14B8A6]"
              >
                <Mail :size="15" />
                Contacto
              </a>
            </li>
            <li>
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 transition hover:text-[#14B8A6]"
              >
                <Instagram :size="15" />
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div
        class="mt-10 flex flex-col gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-xs text-gray-400">
          © {{ currentYear }} Localy. Todos los derechos reservados.
        </p>
        <p class="text-xs text-gray-400">Conecta con lo auténtico.</p>
      </div>
    </div>
  </footer>
</template>
