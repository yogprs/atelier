<script setup lang="ts">
import type { User } from "@/types/user";
import { Icon } from "@iconify/vue";
import { Form } from "@primevue/forms";
import { Button, Image, InputText } from "primevue";
import { nextTick, ref, watch } from "vue";

interface UserBadgeProps {
  data: Pick<User, "id" | "avatar" | "username">[];
  useSearch: boolean;
}

const props = defineProps<UserBadgeProps>();

const emit = defineEmits<{
  (e: "remove", id: string): void;
}>();

const selectedUser = ref<string>();
const scrollMembers = ref<any>(null);
const showSearch = ref<boolean>(true);

// const users = computed(() => {
//   return props.data;
// });

const users = ref<Pick<User, "id" | "avatar" | "username">[]>();

const removeUser = (id: string) => {
  emit("remove", id);
};

const scrollToDown = async () => {
  await nextTick();

  if (!scrollMembers.value) return;

  scrollMembers.value.scrollTo({
    top: scrollMembers.value.scrollHeight,
    behavior: "smooth",
  });
};

watch(
  () => props.data,
  () => {
    users.value = props.data;
    if (props.useSearch === null || props.useSearch === undefined) return;
    showSearch.value = props.useSearch;
  },
  {
    immediate: true,
  },
);

watch(
  () => users.value,
  async () => {
    await scrollToDown();
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>

<template>
  <div
    ref="scrollMembers"
    class="w-full scroll-user overflow-x-hidden overflow-y-auto py-2"
  >
    <div class="flex flex-wrap gap-3 h-fit max-h-40 p-2">
      <div
        v-if="users && users?.length > 0"
        :key="user.id"
        v-for="user in users"
        class="flex items-center gap-3"
      >
        <div
          class="size-10 rounded-full bg-primary-lighter text-white flex items-center justify-center overflow-hidden"
        >
          <!-- <Icon icon="ion:people" class="size-6" /> -->
          <Image :src="user?.avatar" :alt="`avatar-${user?.username}`" />
        </div>
        <div class="flex items-center">
          <div class="overflow-hidden max-w-80">
            <span class="text-sm font-medium">{{ user?.username }}</span>
          </div>
          <Button
            @click="removeUser(user?.id)"
            unstyled
            class="flex gap-4 p-2 my-1 items-center rounded-xl cursor-pointer"
          >
            <template #icon>
              <span>
                <Icon icon="material-symbols:close" class="size-6" />
              </span>
            </template>
          </Button>
        </div>
      </div>
      <Form v-if="showSearch" class="w-full pb-4">
        <InputText
          v-model="selectedUser"
          name="user"
          type="text"
          fluid
          size="small"
          class="flex-1 bg-transparent! border-0 shadow-none text-black/70! placeholder:text-black/50!"
          :pt="{
            root: {
              class:
                '!bg-transparent !border-0 !shadow-none border-b! border-b-black! focus:!ring-0 px-3 rounded-none!',
            },
          }"
        />
      </Form>
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
