<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import Toast from "../components/Toast.vue";
import Chatbot from "@/components/chatbot/floatingButton.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
</script>
<template>
  <Navbar />
  <div class="pt-26">
    <main>
      <RouterView />
    </main>
    <ConfirmDialog />
    <Toast />
    <Chatbot />
  </div>
</template>
