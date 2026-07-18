<script setup lang="ts">
import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types/general";
import type { User } from "@/types/user";
import { Button, Image } from "primevue";
import { computed, onMounted, ref } from "vue";
import UsersBadge from "./UsersBadge.vue";
import { Icon } from "@iconify/vue";
import { useRoomStore } from "@/stores/room.ts";

const emit = defineEmits<{
  (
    e: "continue",
    title: "direct" | "groupMember" | "group",
    users: string[],
  ): void;
}>();

const roomStore = useRoomStore();
// const selectedUsers = defineModel<Pick<User, "id" | "avatar" | "username">[]>();

const users = ref<User[]>();
const selectedUsers = ref<Pick<User, "id" | "avatar" | "username">[]>([]);

const groupedUsers = computed(() => {
  if (!users.value) return {};

  const sorted = [...users.value].sort((a, b) =>
    a.username.localeCompare(b.username),
  );

  return sorted.reduce(
    (groups, user) => {
      const letter = user.username.charAt(0).toUpperCase();

      if (!groups[letter]) {
        groups[letter] = [];
      }

      groups[letter].push(user);

      return groups;
    },
    {} as Record<string, User[]>,
  );
});

const toggleUser = (user: User) => {
  if (selectedUsers.value?.find((data) => data.id === user.id)) return;
  selectedUsers.value?.push({
    id: user.id,
    avatar: user.avatar,
    username: user.username,
  });
};

const removeSelectedUser = (id: string) => {
  selectedUsers.value = selectedUsers.value?.filter((user) => user.id !== id);
};

const getUsers = async () => {
  try {
    const response = await apiClient.get<ApiResponse<User[]>>("/users/");

    users.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

const continueAction = () => {
  const ids = selectedUsers.value
    ? selectedUsers.value?.map((data) => data.id)
    : [];
  roomStore.setSelectedMembers(ids);

  emit("continue", "group", ids);
};

onMounted(async () => {
  await getUsers();

  if (roomStore.selectedMembers && roomStore.selectedMembers.length) {
    selectedUsers.value = users
      .value!.filter((user) => roomStore.selectedMembers?.includes(user.id))
      .map((user) => ({
        id: user.id,
        avatar: user.avatar,
        username: user.username,
      }));
  }
});

// watch(
//   () => roomStore.selectedMembers,
//   () => {
//     if (roomStore.selectedMembers && roomStore.selectedMembers?.length > 0) {
//       const oldSelected = (users.value ?? []).filter((user) =>
//         roomStore.selectedMembers?.includes(user.id),
//       );

//       selectedUsers.value = oldSelected.map((data) => ({
//         id: data.id,
//         avatar: data.avatar,
//         username: data.username,
//       }));
//     }
//   },
//   {
//     immediate: true,
//   },
// );

// onMounted(() => {
//   scrollMembers.value?.addEventListener("scroll", handleScroll);
// });

// onUnmounted(() => {
//   scrollMembers.value?.removeEventListener("scroll", handleScroll);
// });
</script>

<template>
  <div class="px-6 py-5">
    <div class="px-2 pb-2">
      <UsersBadge
        @remove="removeSelectedUser"
        :data="selectedUsers"
        :use-search="true"
      />
    </div>

    <div class="px-2 overflow-hidden">
      <div
        class="scroll-user bg-neutral-inputBg shadow border border-neutral-300 rounded-xl mb-4 h-fit max-h-72 overflow-y-auto"
      >
        <div v-for="(group, letter) in groupedUsers" :key="letter">
          <!-- Header Huruf -->
          <div
            class="sticky top-0 z-10 bg-neutral-inputBg px-4 py-2 text-xs font-semibold text-neutral-500"
          >
            {{ letter }}
          </div>

          <!-- User -->
          <div v-for="user in group" :key="user.id">
            <Button
              @click="toggleUser(user)"
              unstyled
              class="w-full hover:bg-neutral-border/50 transition-colors cursor-pointer"
            >
              <div
                class="relative flex items-center gap-3 px-4 py-3 border-b border-neutral-300"
              >
                <div
                  class="size-10 rounded-full bg-primary-lighter text-white flex items-center justify-center overflow-hidden"
                >
                  <!-- <Icon icon="ion:people" class="size-6" /> -->
                  <Image :src="user.avatar" :alt="`avatar-${user.username}`" />
                </div>

                <div class="flex flex-col items-start min-w-0">
                  <p class="text-sm font-medium truncate">
                    {{ user.username }}
                  </p>
                  <p class="text-xs truncate">{{ user.email }}</p>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="selectedUsers && selectedUsers.length > 0"
      class="px-2 w-full flex justify-end"
    >
      <Button
        @click="continueAction"
        unstyled
        class="flex gap-4 p-2 my-1 items-center rounded-xl cursor-pointer"
      >
        <template #default>
          <div class="flex gap-2">
            <span>Continue</span>
            <span>
              <Icon icon="material-symbols:arrow-right-alt" class="size-6" />
            </span>
          </div>
        </template>
      </Button>
    </div>
  </div>
</template>

<style scoped>
.scroll-user::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scroll-user::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scroll-user::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scroll-user::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
