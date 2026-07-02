<script setup lang="ts">
import { Toast } from "primevue";
import { useAuthStore } from "./stores/auth";
import { onMounted } from "vue";
import { useWebSocketStore } from "./stores/websocket";
import gsap from "gsap";

const auth = useAuthStore();
const websocket = useWebSocketStore();

gsap.ticker.lagSmoothing(0);

onMounted(async () => {
  await auth.init();
});

onMounted(() => {
  if (auth.accessToken) {
    websocket.connect();
  }
});
</script>

<template>
  <RouterView />
  <Toast />
</template>
