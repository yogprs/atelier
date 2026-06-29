<script setup lang="ts">
import AppSidebar from "@/components/app/AppSidebar.vue";
</script>

<template>
  <div class="w-full h-screen bg-neutral-bg text-black overflow-hidden">
    <div class="flex h-full flex-row">
      <AppSidebar />
      <div class="flex-1 min-w-0">
        <router-view />
      </div>
    </div>
  </div>
</template>
