<script setup lang="ts">
import { useRoomStore } from "@/stores/room";
import type { RoomMember } from "@/types/room";
import type { User } from "@/types/user";
import { Icon } from "@iconify/vue";
import { Form } from "@primevue/forms";
import { Button, Image, InputGroup, InputText } from "primevue";
import { computed, ref, watch } from "vue";
import UsersBadge from "./UsersBadge.vue";

interface Props {
  roomId: string;
  persistent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  persistent: false,
});

const visible = defineModel<boolean>("visible", {
  default: false,
});

const roomStore = useRoomStore();

const searchModel = ref<string>();
const selectedUsers = ref<Pick<User, "id" | "avatar" | "username">[]>([]);

const groupedUsers = computed(() => {
  if (!roomStore.roomDetail?.members) return [];

  const sorted = [...roomStore.roomDetail?.members].sort((a, b) =>
    a.username.localeCompare(b.username),
  );
  return sorted;
});

const close = () => {
  visible.value = false;
};

const onBackdropClick = () => {
  if (!props.persistent) {
    close();
  }
};

const toggleUser = (user: RoomMember) => {
  if (selectedUsers.value?.find((data) => data.id === user.user_id)) return;
  selectedUsers.value?.push({
    id: user.user_id,
    avatar: user.avatar_url,
    username: user.username,
  });
};

const removeSelectedUser = (id: string) => {
  selectedUsers.value = selectedUsers.value?.filter((user) => user.id !== id);
};

const addMember = async () => {};

watch(
  () => visible.value,
  () => {
    if (!visible.value) return;
    roomStore.getRoomDetail(props.roomId);
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-black"
        @click.self="onBackdropClick"
      >
        <div
          class="w-full max-w-lg max-h-150 rounded-xl bg-neutral-bg shadow-xl"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header -->
          <div class="flex items-center px-8 pt-4">
            <button
              class="p-2 hover:bg-neutral-border/50 rounded-full cursor-pointer"
              @click="close"
            >
              <span>
                <Icon icon="material-symbols:close" />
              </span>
            </button>

            <div class="flex items-center justify-between p-4">
              <h2 class="text-lg font-semibold">Add member</h2>
            </div>
          </div>

          <div class="pt-5">
            <Form @submit="console.log('masuk')" class="h-12.5 px-8">
              <InputGroup
                class="bg-neutral-inputBg! border border-neutral-300 text-neutral-400! rounded-xl h-12 overflow-hidden px-2 items-center shadow"
              >
                <Button
                  unstyled
                  class="flex gap-4 p-2 my-1 items-center rounded-xl"
                >
                  <template #icon>
                    <span>
                      <Icon icon="material-symbols:search" class="size-6" />
                    </span>
                  </template>
                </Button>

                <InputText
                  v-model="searchModel"
                  name="search"
                  type="text"
                  fluid
                  placeholder="Search Contacts..."
                  size="small"
                  class="flex-1 bg-transparent border-0 shadow-none text-black/70! placeholder:text-black/50!"
                  :pt="{
                    root: {
                      class:
                        '!bg-transparent !border-0 !shadow-none focus:!ring-0 px-3',
                    },
                  }"
                />
              </InputGroup>
            </Form>
          </div>

          <div class="overflow-hidden max-h-100">
            <div
              v-if="selectedUsers && selectedUsers.length > 0"
              class="px-2 pb-2"
            >
              <UsersBadge
                @remove="removeSelectedUser"
                :data="selectedUsers"
                :use-search="false"
              />
            </div>

            <div class="overflow-hidden pt-5 pb-1 rounded-b-xl mx-8">
              <div
                class="scroll-user bg-neutral-inputBg min-h-84 max-h-92 overflow-y-auto"
              >
                <div
                  :key="member.user_id"
                  v-for="member in groupedUsers"
                  class="px-0"
                >
                  <Button
                    @click="toggleUser(member)"
                    unstyled
                    class="w-full rounded-xl hover:bg-neutral-border/50 transition-colors cursor-pointer"
                  >
                    <div class="relative flex items-center gap-3 px-4 py-3">
                      <div
                        class="size-10 rounded-full bg-primary-lighter text-white flex items-center justify-center overflow-hidden"
                      >
                        <!-- <Icon icon="ion:people" class="size-6" /> -->
                        <Image
                          :src="member.avatar_url"
                          :alt="`avatar-${member.username}`"
                        />
                      </div>

                      <div class="flex flex-col items-start min-w-0">
                        <p class="text-sm font-medium truncate">
                          {{ member.username }}
                        </p>
                        <p class="text-xs truncate">{{ member.email }}</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div class="w-full">
            <Button
              @click="addMember"
              unstyled
              class="flex gap-4 p-2 my-1 items-center rounded-xl cursor-pointer"
            >
              <template #default>
                <div class="flex gap-2">
                  <span>Add Member</span>
                </div>
              </template>
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
