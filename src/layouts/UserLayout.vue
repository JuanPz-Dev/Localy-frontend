<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import Toast from "../components/Toast.vue";
import CreateTourView from "@/views/guide/CreateTourView.vue";
</script>
<template>
  <Navbar />
  <Toast />
  <main>
    <RouterView />
  </main>
</template>
