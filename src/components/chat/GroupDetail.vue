<script setup lang="ts">
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/stores/auth";
import { useRoomStore } from "@/stores/room";
import type { ApiResponse } from "@/types/general";
import type { RoomMember } from "@/types/room";
import type { User } from "@/types/user";
import { Icon } from "@iconify/vue";
import dayjs from "dayjs";
import { Button, InputText, useToast } from "primevue";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import ImageCropper from "@/components/app/ImageCropper.vue";
import DialogSearchMember from "../app/DialogSearchMember.vue";

const MENU_WIDTH = 240;
const MENU_HEIGHT = 180;

const props = defineProps<{
  group: {
    id: string;
  };
}>();

const emit = defineEmits(["close"]);

const toast = useToast();

const auth = useAuthStore();
const roomStore = useRoomStore();

const router = useRouter();

// const groupDetail = ref<RoomDetail>();
const creatorGroup = ref<User>();
const showEditName = ref<boolean>(false);
const nameModel = ref<string>();
const descriptionModel = ref<string>();
const showEditDescription = ref<boolean>(false);
const fileInput = ref<HTMLInputElement | null>(null);

const selectedFile = ref<File | null>(null);

const previewImage = ref<string | null>();

const showCropper = ref<boolean>(false);
const cropImage = ref<string>("");
const showSearchMember = ref<boolean>(false);
const visibleMenu = ref<boolean>(false);

const menuPosition = ref({
  x: 0,
  y: 0,
});

const items = ref<
  {
    label: string;
    icon?: string;
    action?: () => void;
  }[]
>();

const groupMembers = computed(() => {
  const userId = auth.session?.user?.user_id;
  const members = roomStore.roomDetail?.members
    ? [...roomStore.roomDetail.members].slice(0, 10).sort((a, b) => {
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

const groupAdmin = computed(() => {
  return roomStore.roomDetail?.members?.filter(
    (member) => member.role === "admin",
  );
});

const isSessionAdmin = computed(() => {
  return (
    groupAdmin.value?.find(
      (member) => member.user_id === auth.session?.user?.user_id,
    )?.role === "admin"
  );
});

const getUsername = (user: { id: string; username: string }) => {
  return user?.id === auth.session?.user?.user_id ? "you" : user?.username;
};

const toggleContextMember = (event: MouseEvent, member: RoomMember) => {
  event.preventDefault();
  event.stopPropagation();
  if (member.user_id === auth.session?.user?.user_id) return;

  if (!isSessionAdmin.value) return;

  const isOwner =
    roomStore.roomDetail?.created_by === auth.session?.user?.user_id;

  let menuItems = [] as {
    label: string;
    icon?: string;
    action?: () => void;
  }[];

  if (isOwner) {
    menuItems = [
      {
        label: "Promote to owner group",
        icon: "material-symbols:crown-outline",
      },
      {
        label:
          member.role === "admin" ? "Demote to member" : "Promote to admin",
        icon:
          member.role === "admin"
            ? "mdi:user-remove-outline"
            : "mdi:user-check-outline",
        action: async () => {
          if (member.role === "admin") {
            await demote(member.user_id);
            return;
          }
          promote(member.user_id);
          return;
        },
      },
      {
        label: "Remove from group",
        icon: "material-symbols:remove",
        action: async () => {
          await removeMemberGroup(member.user_id);
        },
      },
    ];
  } else {
    menuItems = [
      {
        label:
          member.role === "admin" ? "Demote to member" : "Promote to admin",
        icon:
          member.role === "admin"
            ? "mdi:user-remove-outline"
            : "mdi:user-check-outline",
        action: async () => {
          if (member.role === "admin") {
            await demote(member.user_id);
            return;
          }
          promote(member.user_id);
          return;
        },
      },
      {
        label: "Remove from group",
        icon: "material-symbols:remove",
        action: async () => {
          await removeMemberGroup(member.user_id);
        },
      },
    ];
  }

  items.value = menuItems;

  let x = event.clientX;
  let y = event.clientY;

  if (x + MENU_WIDTH > window.innerWidth) {
    x = window.innerWidth - MENU_WIDTH - 8;
  }

  if (y + MENU_HEIGHT > window.innerHeight) {
    y = window.innerHeight - MENU_HEIGHT - 8;
  }

  menuPosition.value = { x, y };

  visibleMenu.value = true;
};

const openFilePicker = () => {
  fileInput.value?.click();
};

const setShowSearchMember = () => {
  showSearchMember.value = true;
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

const toggleContactInfo = (id: string) => {
  router.push(`/user/${id}`);
};

const setSaveInput = async (type: "desc" | "name") => {
  if (type === "name") {
    showEditName.value = false;
    if (nameModel.value === roomStore.roomDetail?.name) return;
    updateGroup({
      name: nameModel.value,
    });
    return;
  }
  showEditDescription.value = false;
  if (descriptionModel.value === roomStore.roomDetail?.description) return;
  await updateGroup({
    description: descriptionModel.value,
  });
};

// const getRoomDetail = async () => {
//   if (!props.group?.id) return;
//   try {
//     const response = await apiClient.get<ApiResponse<RoomDetail>>(
//       `/room/${props.group?.id}`,
//     );

//     roomStore.roomDetail = response.data;
//     descriptionModel.value = response.data?.description;
//     nameModel.value = response.data?.name;
//     previewImage.value = response.data?.avatar;
//   } catch (error) {
//     console.error(error);
//   }
// };

const promote = async (memberId: string) => {
  try {
    if (!memberId) return;
    const body = {
      target_user_id: memberId,
    };
    await apiClient.patch(`/members/promote/${roomStore.roomDetail?.id}`, body);
    roomStore.getRoomDetail(roomStore.roomDetail?.id as string);
    getUser();
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Failed to promote to admin on group.",
    });
  }
};

const demote = async (memberId: string) => {
  try {
    if (!memberId) return;
    const body = {
      target_user_id: memberId,
    };
    await apiClient.patch(`/members/demote/${roomStore.roomDetail?.id}`, body);
    roomStore.getRoomDetail(roomStore.roomDetail?.id as string);
    getUser();
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Failed to demote to member on group.",
    });
  }
};

const getUser = async () => {
  try {
    const response = await apiClient.get<ApiResponse<User>>(
      `/users/${roomStore.roomDetail?.created_by}`,
    );

    creatorGroup.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

const removeMemberGroup = async (memberId: string) => {
  try {
    console.log(memberId);
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Failed to leave group.",
    });
  }
};

const uploadAvatar = async (file: File) => {
  try {
    const formData = new FormData();

    formData.append("avatar", file);

    const response = await apiClient.patch<ApiResponse>(
      `/room/avatar/${roomStore.roomDetail?.id}`,
      formData,
    );

    previewImage.value = response.data as string;

    showCropper.value = false;

    roomStore.getRoomDetail(roomStore.roomDetail?.id as string);
    roomStore.setUpdated(true, "update");
  } catch (err) {
    console.log(err);
  }
};

const updateGroup = async (body: { name?: string; description?: string }) => {
  try {
    await apiClient.patch(`/room/${roomStore.roomDetail?.id}`, body);
    roomStore.getRoomDetail(roomStore.roomDetail?.id as string);
    getUser();
    roomStore.setUpdated(true, "update");
  } catch (error) {
    console.error(error);
  }
};

const leaveGroup = async () => {
  try {
    await apiClient.del(`/members/${roomStore.roomDetail?.id}/leave`);
    roomStore.setUpdated(true, "leave");
  } catch (error) {
    console.error(error);
    toast.add({
      severity: "error",
      summary: "Failed to leave group.",
    });
  }
};

// onMounted(() => {
//   roomStore.getRoomDetail(roomStore.roomDetail?.id as string);
// });

watch(
  () => props.group?.id,
  () => {
    roomStore.getRoomDetail(roomStore.roomDetail?.id as string);
    nameModel.value = roomStore.roomDetail?.name;
    descriptionModel.value = roomStore.roomDetail?.description;
    previewImage.value = roomStore.roomDetail?.avatar;
  },
  {
    immediate: true,
  },
);

watch(
  () => roomStore.roomDetail,
  () => {
    if (!roomStore.roomDetail?.id) return;
    getUser();
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <div
    class="flex flex-col h-full bg-neutral-bg w-full max-w-md border-l border-neutral-border/50 overflow-hidden overflow-y-auto relative"
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
              name="nameGroup"
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
            {{ roomStore.roomDetail?.name }}
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
        Group · {{ roomStore.roomDetail?.member_count }} participants
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
          :class="`text-sm mb-1 truncate ${!roomStore.roomDetail?.description ? 'cursor-pointer' : 'cursor-default'}`"
        >
          {{
            roomStore.roomDetail?.description
              ? roomStore.roomDetail?.description
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
      <div class="px-6 py-2 flex items-center justify-between">
        <span class="text-sm"
          >{{ roomStore.roomDetail?.member_count }} participants</span
        >
        <Button
          @click="setShowSearchMember"
          unstyled
          class="flex gap-4 p-2 rounded-full cursor-pointer hover:scale-110 transition-all duration-500 hover:bg-[#F0F2FF]"
        >
          <template #icon>
            <Icon icon="carbon:search" class="text-xl cursor-pointer" />
          </template>
        </Button>
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
          @click="toggleContactInfo(member.user_id)"
          @contextmenu.prevent="toggleContextMember($event, member)"
          class="hover:bg-neutral-border/50 w-full flex items-center gap-4 justify-between cursor-pointer transition-colors rounded-lg px-6 py-3 group"
        >
          <div class="w-full overflow-hidden flex item-centar gap-4">
            <div
              class="w-10 h-10 rounded-full overflow-hidden bg-neutral-bg shrink-0"
            >
              <img
                v-if="member.avatar_url"
                :src="member.avatar_url"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
              >
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
              </div>
              <p
                v-if="member.user_id !== auth.session?.user?.user_id"
                class="text-sm truncate"
              >
                {{ member.email }}
              </p>
            </div>
          </div>
          <div
            :class="`flex flex-col w-30 transition-all ${member.role === 'admin' ? 'items-start' : 'items-end'}`"
          >
            <div v-if="member.role === 'admin'" class="w-full">
              <span class="text-xs border rounded px-1.5 py-0.5"
                >Group Admin</span
              >
            </div>
            <span
              v-if="
                member.user_id !== auth.session?.user?.user_id && isSessionAdmin
              "
              @click.stop="toggleContextMember($event, member)"
              class="hidden group-hover:block transition-all"
            >
              <Icon
                icon="material-symbols:keyboard-arrow-down-rounded"
                class="size-6"
              />
            </span>
          </div>
        </button>
      </div>
      <div
        v-if="(roomStore.roomDetail?.member_count ?? 0) > 10"
        class="w-full flex items-center py-2"
      >
        <Button
          @click="setShowSearchMember"
          unstyled
          class="w-full! flex! flex-col! gap-4 py-3! p-2 cursor-pointer transition-all duration-500 hover:bg-neutral-border/50"
        >
          <template #default>
            <span class="text-primary-base">{{
              `View All (${roomStore.roomDetail?.member_count ? roomStore.roomDetail?.member_count - 10 : 0} more)`
            }}</span>
          </template>
        </Button>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="flex flex-col mb-2 shadow-sm">
      <button
        @click="leaveGroup"
        class="px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors text-red-500 hover:bg-red-500/10"
      >
        <Icon icon="carbon:exit" class="text-xl" />
        <span class="text-base">Exit group</span>
      </button>
      <button
        class="px-6 py-4 flex items-center gap-4 cursor-pointer transition-colors text-red-500 hover:bg-red-500/10"
      >
        <Icon icon="carbon:warning-alt" class="text-xl" />
        <span class="text-base">Report group</span>
      </button>
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
          roomStore.roomDetail?.created_at
            ? `on ${dayjs(roomStore.roomDetail?.created_at).format("DD/MM/YYYY [at] h:mm a")}`
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
  <DialogSearchMember
    v-model:visible="showSearchMember"
    :room-id="roomStore.roomDetail?.id as string"
  />

  <div
    v-if="visibleMenu"
    class="fixed inset-0 z-999"
    @click="visibleMenu = false"
  >
    <div
      class="absolute bg-white rounded-lg shadow-xl border py-1 min-w-56"
      :style="{
        left: `${menuPosition.x}px`,
        top: `${menuPosition.y}px`,
      }"
      @click.stop
    >
      <button
        v-for="item in items"
        :key="item.label"
        @click="
          item.action?.();
          visibleMenu = false;
        "
        class="w-full px-4 py-2 flex items-center gap-3 hover:bg-neutral-100 text-left cursor-pointer"
      >
        <Icon v-if="item.icon" :icon="item.icon" class="text-lg" />

        <span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>
