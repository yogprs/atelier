<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const authStore = useAuthStore();

onMounted(() => {
  const params = new URLSearchParams(window.location.search);

  const token = params.get("token");
  const refreshToken = params.get("refresh_token");
  const error = params.get("error");

  if (error) {
    alert(error);
    router.replace("/auth/login");
    return;
  }

  if (token) {
    // localStorage.setItem("token", token);

    // if (refreshToken) {
    //   localStorage.setItem("refresh_token", refreshToken);
    // }

    authStore.login(token, refreshToken as string);

    router.replace("/");
    return;
  }

  router.replace("/auth/login");
});
</script>

<template>
  <div>Signing in...</div>
</template>
