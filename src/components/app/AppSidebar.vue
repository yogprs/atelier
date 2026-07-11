<script setup lang="ts">
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/stores/auth";
import type { ApiResponse } from "@/types/general";
import type { User } from "@/types/user";
import { Icon } from "@iconify/vue";
import { Button, Image, Popover, ToggleSwitch, Divider } from "primevue";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const auth = useAuthStore();

const profile = ref<User>();
const currentRoute = computed(() => route.path);

const getProfile = async () => {
  const response = await apiClient.get<ApiResponse<User>>(
    `/users/${auth.session?.user?.user_id}`,
  );

  profile.value = response.data;
};

const menus = [
  {
    name: "Chats",
    icon: "ic:outline-chat",
    iconActive: "ic:baseline-chat",
    path: "/app/chats",
  },
  {
    name: "Calls",
    icon: "material-symbols:call-outline",
    iconActive: "material-symbols:call",
    path: "/app/calls",
  },
];

const op = ref();
const notificationsEnabled = ref(true);

const toggleProfileMenu = (event: Event) => {
  op.value.toggle(event);
};

const handleLogout = () => {
  auth.logout();
};

onMounted(() => {
  getProfile();
});
</script>

<template>
  <nav class="w-full max-w-20 h-full text-black bg-neutral-white shadow-xl">
    <div class="flex flex-col justify-between h-full items-center">
      <div class="flex flex-col gap-2 p-4">
        <div :key="index" v-for="(menu, index) in menus">
          <Button
            unstyled
            v-tooltip.right="{
              value: menu.name,
              pt: {
                arrow: {
                  style: {
                    borderBottomColor: 'var(--p-primary-color)',
                  },
                },
                text: 'bg-primary! text-primary-contrast! text-sm! font-regular!',
              },
            }"
            :class="`flex items-center justify-center p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-500 group hover:bg-[#F0F2FF] ${currentRoute.includes(menu.path) ? 'bg-[#F0F2FF]' : ''}`"
          >
            <template #icon>
              <div class="p-1">
                <Icon
                  :icon="
                    currentRoute.includes(menu.path)
                      ? menu.iconActive
                      : menu.icon
                  "
                  :class="`size-6 group-hover:text-primary-base ${
                    currentRoute.includes(menu.path)
                      ? 'text-primary-base'
                      : 'text-neutral-textMuted'
                  }`"
                />
              </div>
            </template>
          </Button>
        </div>
      </div>
      <div class="py-2">
        <Button
          unstyled
          @click="toggleProfileMenu"
          v-tooltip.right="{
            value: 'You',
            pt: {
              arrow: {
                style: {
                  borderBottomColor: 'var(--p-primary-color)',
                },
              },
              text: 'bg-primary! text-primary-contrast! text-sm! font-regular!',
            },
          }"
          :class="`flex items-center justify-center p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-500 group hover:bg-[#F0F2FF] overflow-hidden`"
        >
          <div class="overflow-hidden rounded-full size-8">
            <Image
              :src="profile?.avatar"
              :alt="`profile-${profile?.username}`"
              class="w-full h-full object-cover rounded-full"
            />
          </div>
        </Button>

        <Popover
          ref="op"
          :pt="{
            root: 'rounded-xl! shadow-xl! border border-neutral-100! bg-white!',
          }"
        >
          <div class="flex flex-col w-64 p-2 gap-1">
            <div class="px-2 py-3 mb-1">
              <p class="text-sm font-semibold text-neutral-800">
                {{ profile?.username || "User" }}
              </p>
              <p class="text-xs text-neutral-500">
                {{ profile?.email || "user@example.com" }}
              </p>
            </div>

            <div class="flex flex-col gap-1">
              <Button
                unstyled
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2FF] hover:text-primary-base transition-colors w-full text-left cursor-pointer group"
              >
                <Icon
                  icon="lucide:user-pen"
                  class="text-neutral-500 size-4 group-hover:text-primary-base"
                />
                <span
                  class="text-sm font-medium text-neutral-700 group-hover:text-primary-base"
                  >Edit Profile</span
                >
              </Button>
              <Button
                unstyled
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2FF] hover:text-primary-base transition-colors w-full text-left cursor-pointer group"
              >
                <Icon
                  icon="lucide:credit-card"
                  class="text-neutral-500 size-4 group-hover:text-primary-base"
                />
                <span
                  class="text-sm font-medium text-neutral-700 group-hover:text-primary-base"
                  >Manage Subscription</span
                >
              </Button>

              <div
                class="flex items-center justify-between p-2 rounded-lg hover:bg-[#F0F2FF] transition-colors w-full text-left group"
              >
                <div class="flex items-center gap-3">
                  <Icon
                    icon="lucide:bell"
                    class="text-neutral-500 size-4 group-hover:text-primary-base"
                  />
                  <span
                    class="text-sm font-medium text-neutral-700 group-hover:text-primary-base"
                    >Notifications</span
                  >
                </div>
                <ToggleSwitch
                  v-model="notificationsEnabled"
                  :pt="{ root: 'scale-75 origin-right' }"
                />
              </div>

              <Button
                unstyled
                class="flex items-center justify-between p-2 rounded-lg hover:bg-[#F0F2FF] hover:text-primary-base transition-colors w-full text-left cursor-pointer group"
              >
                <div class="flex items-center gap-3">
                  <Icon
                    icon="lucide:globe"
                    class="text-neutral-500 size-4 group-hover:text-primary-base"
                  />
                  <span
                    class="text-sm font-medium text-neutral-700 group-hover:text-primary-base"
                    >Language</span
                  >
                </div>
                <span class="text-xs font-semibold text-primary-base"
                  >English</span
                >
              </Button>

              <Button
                unstyled
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F2FF] hover:text-primary-base transition-colors w-full text-left cursor-pointer group"
              >
                <Icon
                  icon="lucide:history"
                  class="text-neutral-500 size-4 group-hover:text-primary-base"
                />
                <span
                  class="text-sm font-medium text-neutral-700 group-hover:text-primary-base"
                  >Transaction History</span
                >
              </Button>
            </div>

            <Divider class="my-1" />

            <div class="flex flex-col">
              <Button
                unstyled
                @click="handleLogout"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors w-full text-left cursor-pointer group"
              >
                <Icon icon="lucide:log-out" class="size-4" />
                <span class="text-sm font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </Popover>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.p-popover.p-popover-flipped::before,
.p-popover.p-popover-flipped::after {
  border-color: white !important;
}
</style>
