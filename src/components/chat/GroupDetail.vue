<script setup lang="ts">
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/stores/auth";
import { useRoomStore } from "@/stores/room";
import type { ApiResponse } from "@/types/general";
import type { RoomDetail } from "@/types/room";
import type { User } from "@/types/user";
import { Icon } from "@iconify/vue";
import dayjs from "dayjs";
import { Button, InputText } from "primevue";
import { computed, onMounted, ref, watch } from "vue";
import ImageCropper from "@/components/app/ImageCropper.vue";

const props = defineProps<{
  group: {
    id: string;
  };
}>();

const emit = defineEmits(["close"]);

const auth = useAuthStore();

const roomStore = useRoomStore();

const groupDetail = ref<RoomDetail>();
const creatorGroup = ref<User>();
const showEditName = ref<boolean>(false);
const nameModel = ref<string>();
const showEditDescription = ref<boolean>(false);
const descriptionModel = ref<string>();
const fileInput = ref<HTMLInputElement | null>(null);

const selectedFile = ref<File | null>(null);

const previewImage = ref<string | null>();

const showCropper = ref<boolean>(false);
const cropImage = ref<string>("");

const groupMembers = computed(() => {
  const userId = auth.session?.user?.user_id;
  const members = groupDetail.value?.members
    ? [...groupDetail.value.members].slice(0, 10).sort((a, b) => {
        // 1. User login first
        if (a.user_id === userId && b.user_id !== userId) return -1;
        if (a.user_id !== userId && b.user_id === userId) return 1;

        // 2. Admin
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;

        // 3. Members
        return 0;
      })
    : [];

  return members;
});

const getUsername = (user: { id: string; username: string }) => {
  return user?.id === auth.session?.user?.user_id ? "you" : user?.username;
};

const openFilePicker = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (!input.files?.length) return;

  selectedFile.value = input.files[0];

  // console.log("selected", selectedFile.value.name);

  cropImage.value = URL.createObjectURL(selectedFile.value);

  showCropper.value = true;
};

const setShowInput = (type: "desc" | "name") => {
  if (type === "name") {
    showEditName.value = true;
    return;
  }
  showEditDescription.value = true;
};

const setSaveInput = async (type: "desc" | "name") => {
  if (type === "name") {
    showEditName.value = false;
    if (nameModel.value === groupDetail.value?.name) return;
    updateGroup({
      name: nameModel.value,
    });
    return;
  }
  showEditDescription.value = false;
  if (descriptionModel.value === groupDetail.value?.description) return;
  await updateGroup({
    description: descriptionModel.value,
  });
};

const getRoomDetail = async () => {
  if (!props.group?.id) return;
  try {
    const response = await apiClient.get<ApiResponse<RoomDetail>>(
      `/room/${props.group?.id}`,
    );

    groupDetail.value = response.data;
    descriptionModel.value = response.data?.description;
    nameModel.value = response.data?.name;
    previewImage.value = response.data?.avatar;
  } catch (error) {
    console.error(error);
  }
};

const getUser = async () => {
  try {
    const response = await apiClient.get<ApiResponse<User>>(
      `/users/${groupDetail.value?.created_by}`,
    );

    creatorGroup.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

const uploadAvatar = async (file: File) => {
  try {
    const formData = new FormData();

    formData.append("avatar", file);

    const response = await apiClient.patch<ApiResponse>(
      `/room/avatar/${groupDetail.value?.id}`,
      formData,
    );

    previewImage.value = response.data as string;

    showCropper.value = false;

    getRoomDetail();
    roomStore.setUpdated(true);
  } catch (err) {
    console.log(err);
  }
};

const updateGroup = async (body: { name?: string; description?: string }) => {
  try {
    await apiClient.patch(`/room/${groupDetail.value?.id}`, body);
    getRoomDetail();
    getUser();
    roomStore.setUpdated(true);
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  getRoomDetail();
});

watch(
  () => groupDetail.value,
  () => {
    if (!groupDetail.value?.id) return;
    getUser();
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <div
    class="flex flex-col h-full bg-neutral-bg w-full max-w-md border-l border-neutral-border/50 overflow-hidden overflow-y-auto font-sans relative"
  >
    <!-- Header -->
    <div
      class="flex items-center gap-6 px-6 py-4 sticky top-0 z-20 shadow-sm bg-neutral-white"
    >
      <button
        @click="emit('close')"
        class="p-2 -ml-2 hover:bg-neutral-border/50 rounded-full cursor-pointer transition-colors flex items-center justify-center"
      >
        <Icon icon="carbon:close" class="text-xl" />
      </button>
      <h2 class="text-base font-medium">Group info</h2>
    </div>

    <!-- Group Info -->
    <div class="flex flex-col items-center py-6 px-4 mb-2 shadow-sm">
      <div
        @click="openFilePicker"
        class="w-48 h-48 rounded-full overflow-hidden mb-5 bg-neutral-bg shrink-0 relative group cursor-pointer"
      >
        <img
          v-if="previewImage"
          :src="previewImage"
          alt="Group Avatar"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <Icon icon="carbon:group" class="text-7xl" />
        </div>
        <div
          class="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all"
        >
          <div class="flex flex-col items-center text-white">
            <Icon icon="carbon:camera" class="text-xl mb-1" />
            <span class="text-xs uppercase">Change</span>
          </div>
        </div>
        <!-- Hidden Input -->
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept="image/*"
          @change="handleFileChange"
        />
      </div>
      <div class="w-full flex flex-row justify-between">
        <div class="justify-center w-full">
          <div v-if="showEditName" class="w-full mb-2">
            <InputText
              v-model="nameModel"
              name="description"
              placeholder="Description group"
              class="flex-1 bg-transparent border-0 shadow-none text-black/70! placeholder:text-black/50!"
              size="large"
              fluid
              :pt="{
                root: {
                  class:
                    'bg-neutral-bg! border-t-transparent! border-x-transparent! border-b! border-b-neutral-300! text-black/70! placeholder:text-black/50! ',
                },
              }"
            />
          </div>
          <h1 v-else class="text-2xl font-normal mb-1 ml-10 text-center">
            {{ groupDetail?.name }}
          </h1>
        </div>
        <div class="flex items-center pl-2">
          <Button
            v-if="showEditName"
            @click="setSaveInput('name')"
            v-tooltip.bottom="{
              value: 'Edit group name',
              pt: {
                arrow: {
                  style: {
                    borderBottomColor: 'var(--p-primary-color)',
                  },
                },
                text: 'bg-primary! text-primary-contrast! text-sm! font-regular!',
              },
            }"
            unstyled
            class="flex gap-4 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-500 hover:bg-[#F0F2FF]"
          >
            <template #icon>
              <Icon icon="material-symbols:check" class="size-5" />
            </template>
          </Button>
          <Button
            v-else
            @click="setShowInput('name')"
            v-tooltip.bottom="{
              value: 'Click to save group name',
              pt: {
                arrow: {
                  style: {
                    borderBottomColor: 'var(--p-primary-color)',
                  },
                },
                text: 'bg-primary! text-primary-contrast! text-sm! font-regular!',
              },
            }"
            unstyled
            class="flex gap-4 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-500 hover:bg-[#F0F2FF]"
          >
            <template #icon>
              <Icon icon="material-symbols:edit-outline" class="size-5" />
            </template>
          </Button>
        </div>
      </div>
      <p class="text-sm">
        Group · {{ groupDetail?.member_count }} participants
      </p>

      <!-- Action Buttons -->
      <div class="flex items-center justify-center gap-4 mt-6 w-full">
        <button
          class="flex flex-col items-center justify-center gap-1 w-20 py-2 rounded-xl transition-colors bg-black/5 hover:bg-neutral-border/80 cursor-pointer"
        >
          <Icon icon="carbon:phone" class="text-2xl mb-1" />
          <span class="text-sm">Audio</span>
        </button>
        <button
          class="flex flex-col items-center justify-center gap-1 w-20 py-2 rounded-xl transition-colors bg-black/5 hover:bg-neutral-border/80 cursor-pointer"
        >
          <Icon icon="carbon:video" class="text-2xl mb-1" />
          <span class="text-sm">Video</span>
        </button>
        <button
          class="flex flex-col items-center justify-center gap-1 w-20 py-2 rounded-xl transition-colors bg-black/5 hover:bg-neutral-border/80 cursor-pointer"
        >
          <Icon icon="carbon:search" class="text-2xl mb-1" />
          <span class="text-sm">Search</span>
        </button>
      </div>
    </div>

    <!-- Description -->
    <div class="px-6 py-4 mb-2 shadow-sm transition-colors">
      <div class="flex justify-between min-w-0">
        <div v-if="showEditDescription" class="w-full">
          <InputText
            v-model="descriptionModel"
            name="description"
            placeholder="Description group"
            class="flex-1 bg-transparent border-0 shadow-none text-black/70! placeholder:text-black/50!"
            size="small"
            fluid
            :pt="{
              root: {
                class:
                  'bg-neutral-bg! border-t-transparent! border-x-transparent! border-b! border-b-neutral-300! text-black/70! placeholder:text-black/50! ',
              },
            }"
          />
        </div>
        <p
          v-else
          :class="`text-sm mb-1 truncate ${!groupDetail?.description ? 'cursor-pointer' : 'cursor-default'}`"
        >
          {{
            groupDetail?.description
              ? groupDetail?.description
              : " Add group description"
          }}
        </p>

        <div class="flex items-center pl-2">
          <Button
            v-if="showEditDescription"
            @click="setSaveInput('desc')"
            v-tooltip.bottom="{
              value: 'Edit group description',
              pt: {
                arrow: {
                  style: {
                    borderBottomColor: 'var(--p-primary-color)',
                  },
                },
                text: 'bg-primary! text-primary-contrast! text-sm! font-regular!',
              },
            }"
            unstyled
            class="flex gap-4 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-500 hover:bg-[#F0F2FF]"
          >
            <template #icon>
              <Icon icon="material-symbols:check" class="size-5" />
            </template>
          </Button>
          <Button
            v-else
            @click="setShowInput('desc')"
            v-tooltip.bottom="{
              value: 'Click to save group description',
              pt: {
                arrow: {
                  style: {
                    borderBottomColor: 'var(--p-primary-color)',
                  },
                },
                text: 'bg-primary! text-primary-contrast! text-sm! font-regular!',
              },
            }"
            unstyled
            class="flex gap-4 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-500 hover:bg-[#F0F2FF]"
          >
            <template #icon>
              <Icon icon="material-symbols:edit-outline" class="size-5" />
            </template>
          </Button>
        </div>
      </div>
    </div>

    <!-- Media, Links, Docs -->
    <div
      class="px-6 py-4 mb-2 shadow-sm flex items-center justify-between cursor-pointer transition-colors"
    >
      <span class="text-base">Media, links, and docs</span>
      <div class="flex items-center gap-1">
        <span class="text-sm">None</span>
        <Icon icon="carbon:chevron-right" class="text-xl" />
      </div>
    </div>

    <!-- Settings -->
    <div class="flex flex-col mb-2 shadow-sm">
      <div
        class="px-6 py-4 flex items-center justify-between cursor-pointer transition-colors"
      >
        <span class="text-base">Mute notifications</span>
        <div
          class="w-10 h-5 bg-neutral-border rounded-full flex items-center p-1 cursor-pointer"
        >
          <div class="w-4 h-4 rounded-full shadow-sm"></div>
        </div>
      </div>
      <div
        class="px-6 py-4 flex items-center justify-between cursor-pointer transition-colors"
      >
        <span class="text-base">Custom notifications</span>
      </div>
      <div
        class="px-6 py-4 flex items-center justify-between cursor-pointer transition-colors"
      >
        <span class="text-base">Media visibility</span>
      </div>
    </div>

    <!-- Group Settings -->
    <div class="flex flex-col mb-2 shadow-sm">
      <div class="px-6 py-4 flex flex-col cursor-pointer transition-colors">
        <div class="flex items-center gap-3 mb-1">
          <Icon icon="carbon:locked" class="text-xl" />
          <span class="text-base">Encryption</span>
        </div>
        <span class="text-sm ml-8"
          >Messages and calls are end-to-end encrypted. Tap to verify.</span
        >
      </div>
      <div
        class="px-6 py-4 flex items-center justify-between cursor-pointer transition-colors"
      >
        <div class="flex items-center gap-3">
          <Icon icon="carbon:time" class="text-xl" />
          <span class="text-base">Disappearing messages</span>
        </div>
        <span class="text-sm">Off</span>
      </div>
      <div
        class="px-6 py-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-neutral-border/50"
      >
        <Icon icon="carbon:settings" class="text-xl" />
        <span class="text-base">Group settings</span>
      </div>
    </div>

    <!-- Participants -->
    <div class="flex flex-col mb-2 shadow-sm pb-2">
      <div class="px-6 py-4 flex items-center justify-between">
        <span class="text-sm"
          >{{ groupDetail?.member_count }} participants</span
        >
        <Icon icon="carbon:search" class="text-xl cursor-pointer" />
      </div>

      <!-- Add participant button -->
      <button
        class="px-6 py-3 flex items-center gap-4 cursor-pointer transition-colors hover:bg-neutral-border/50"
      >
        <div class="w-10 h-10 rounded-full flex items-center justify-center">
          <Icon icon="carbon:user-follow" class="text-xl" />
        </div>
        <span class="text-base">Add participant</span>
      </button>

      <!-- Invite via link -->
      <button
        class="px-6 py-3 flex items-center gap-4 cursor-pointer transition-colors mb-2 hover:bg-neutral-border/50"
      >
        <div class="w-10 h-10 rounded-full flex items-center justify-center">
          <Icon icon="carbon:link" class="text-xl" />
        </div>
        <span class="text-base">Invite to group via link</span>
      </button>

      <!-- Member List -->
      <div v-for="member in groupMembers" :key="member.user_id">
        <button
          class="hover:bg-neutral-border/50 w-full flex items-center gap-4 cursor-pointer transition-colors rounded-lg px-6 py-3"
        >
          <div
            class="w-10 h-10 rounded-full overflow-hidden bg-neutral-bg shrink-0"
          >
            <img
              v-if="member.avatar_url"
              :src="member.avatar_url"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Icon icon="carbon:user-avatar-filled" class="text-2xl" />
            </div>
          </div>
          <div class="flex-1 min-w-0 flex flex-col items-start">
            <div
              class="min-w-0 w-full flex justify-between items-center mb-0.5"
            >
              <p class="text-base truncate">
                {{
                  member.user_id === auth.session?.user?.user_id
                    ? "You"
                    : member.username
                }}
              </p>
              <span
                v-if="member.role === 'admin'"
                class="text-xs border rounded px-1.5 py-0.5"
                >Group Admin</span
              >
            </div>
            <p
              v-if="member.user_id !== auth.session?.user?.user_id"
              class="text-sm truncate"
            >
              {{ member.email }}
            </p>
          </div>
        </button>
      </div>
      <div
        v-if="(groupDetail?.member_count ?? 0) > 10"
        class="w-full flex items-center py-2"
      >
        <Button
          unstyled
          class="w-full! flex! flex-col! gap-4 py-3! p-2 cursor-pointer transition-all duration-500 hover:bg-neutral-border/50"
        >
          <template #default>
            <span class="text-primary-base">{{
              `View All (${groupDetail?.member_count ? groupDetail?.member_count - 10 : 0} more)`
            }}</span>
          </template>
        </Button>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="flex flex-col mb-2 shadow-sm">
      <div
        class="px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors text-red-500 hover:bg-red-500/10"
      >
        <Icon icon="carbon:exit" class="text-xl" />
        <span class="text-base">Exit group</span>
      </div>
      <div
        class="px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors text-red-500 hover:bg-red-500/10"
      >
        <Icon icon="carbon:warning-alt" class="text-xl" />
        <span class="text-base">Report group</span>
      </div>
    </div>
    <!-- Creator -->
    <div class="px-6 mb-8">
      <p v-if="creatorGroup?.id" class="text-sm font-normal mt-1">
        Created by
        {{
          creatorGroup?.username
            ? getUsername({
                id: creatorGroup.id,
                username: creatorGroup.username,
              })
            : ""
        }},
        {{
          groupDetail?.created_at
            ? `on ${dayjs(groupDetail?.created_at).format("DD/MM/YYYY [at] h:mm a")}`
            : ""
        }}
      </p>
    </div>
  </div>
  <ImageCropper
    :visible="showCropper"
    :image="cropImage"
    :image-name="selectedFile?.name ?? ''"
    @close="showCropper = false"
    @save="uploadAvatar"
  />
</template>
