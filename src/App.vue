<script setup lang="ts">
import { Toast } from "primevue";
import { useAuthStore } from "./stores/auth";
import { onMounted } from "vue";
import { useWebSocketStore } from "./stores/websocket";

const auth = useAuthStore();
const websocket = useWebSocketStore();

onMounted(async () => {
  await auth.init();
});

onMounted(() => {
  if (auth.accessToken) {
    websocket.connect();
  }
});

// watch(
//   () => auth.accessToken,
//   (token) => {
//     if (token) {
//       ws.connect();
//     } else {
//       ws.disconnect();
//     }
//   },
//   { immediate: true },
// );
</script>

<template>
  <RouterView />
  <Toast />
</template>
