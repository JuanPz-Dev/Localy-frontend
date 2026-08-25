<script setup lang="ts">
import google from "../assets/logos/google.svg";
</script>

<template>
  <div class="flex items-center my-6">
    <div class="flex-grow border-t border-gray-300"></div>
    <span class="px-4 text-gray-500 text-sm">o</span>
    <div class="flex-grow border-t border-gray-300"></div>
  </div>
  <button
    class="py-2 border rounded-sm border-gray-200 w-full flex flex-row items-center justify-center"
  >
    <img :src="google" alt="Google" class="w-6 h-6" />
    Continuar con Google
  </button>
</template>
