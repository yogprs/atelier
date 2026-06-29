<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

onMounted(() => {
  if (auth.isAuthenticated) {
    return router.replace("/app/chats");
  }
});
</script>

<template>
  <div class="w-full h-full bg-neutral-bg overflow-hidden">
    <router-view />
  </div>
</template>
