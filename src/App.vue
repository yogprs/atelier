<script setup lang="ts">
import { Toast } from "primevue";
import { useAuthStore } from "./stores/auth";
import { onMounted } from "vue";

const auth = useAuthStore();

onMounted(async () => {
  await auth.init();
});
</script>

<template>
  <RouterView />
  <Toast />
</template>
