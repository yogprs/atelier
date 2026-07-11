<script setup lang="ts">
import ChatHeader from "@/components/app/ChatHeader.vue";
import ChatMessage from "@/components/app/ChatMessage.vue";
import DialogNewChat from "@/components/app/DialogNewChat.vue";
import GroupDetail from "@/components/chat/GroupDetail.vue";
import UserDetail from "@/components/chat/UserDetail.vue";
import apiClient from "@/lib/apiClient";
import { useRoomStore } from "@/stores/room";
import { useWebSocketStore } from "@/stores/websocket";
import type { ApiResponse } from "@/types/general";
import type { ApiRoom, RoomMember, RoomType } from "@/types/room";
import type { User } from "@/types/user";
import { formatDate } from "@/utils/dateFormat";
import { toTitleCase } from "@/utils/stringFormat";
import { Icon } from "@iconify/vue";
import { Button, Image } from "primevue";
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";

const websocket = useWebSocketStore();
const roomStore = useRoomStore();

const scrollChat = ref<any>(null);

const rooms = ref<ApiRoom[]>();
const loading = ref<boolean>();

const selectedRoom = ref<Pick<
  ApiRoom,
  "id" | "target_user_id" | "room_type"
> | null>();
const selectedRoomId = ref<string | null>();
const selectedTargetUserId = ref<string | null>();
// const roomDetail = ref<RoomDetail | null>();
const userDetail = ref<User | null>();
const showDialog = ref(false);
const showDetail = ref(false);

const lastProcessedTriggerRef = ref<number>(-1);

onMounted(() => {
  getRooms();
});

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === "Escape") {
    if (selectedRoom.value) {
      selectedRoom.value = null;
      selectedRoomId.value = null;
      selectedTargetUserId.value = null;
    }
  }
};

const toggleShowDialog = () => {
  showDialog.value = true;
};

const scrollToTop = async () => {
  await nextTick();

  const el = scrollChat.value;
  el.scrollTop = 0;
};

const selectRoom = (idRoom: string, idUser: string, roomType: RoomType) => {
  selectedRoom.value = {
    id: idRoom,
    target_user_id: idUser ?? null,
    room_type: roomType,
  };
};

const getRooms = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get<ApiResponse<ApiRoom[]>>("/room/");
    rooms.value = response.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// const getRoomDetail = async () => {
//   if (!selectedRoom.value?.id) return;
//   try {
//     const response = await apiClient.get<ApiResponse<RoomDetail>>(
//       `/room/${selectedRoom.value?.id}`,
//     );

//     roomDetail.value = response.data;
//   } catch (error) {
//     console.error(error);
//   }
// };

const getUser = async () => {
  if (!selectedRoom.value?.target_user_id) return;
  try {
    const response = await apiClient.get<ApiResponse<User>>(
      `/users/${selectedRoom.value?.target_user_id}`,
    );

    userDetail.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

watch(
  () => selectedRoom.value,
  () => {
    if (selectedRoom.value?.id === selectedRoomId.value) return;
    selectedRoomId.value = selectedRoom.value?.id;
    selectedTargetUserId.value = selectedRoom.value?.target_user_id;
    showDetail.value = false;
    if (selectedRoom.value?.room_type === "group") {
      userDetail.value = null;
      roomStore.getRoomDetail(selectedRoom.value?.id);
    } else {
      roomStore.roomDetail = null;
      getUser();
    }
  },
  {
    immediate: true,
  },
);

watch(
  () => websocket.triggerUpdate,
  () => {
    if (websocket.triggerUpdate === lastProcessedTriggerRef.value) return;

    lastProcessedTriggerRef.value = websocket.triggerUpdate;

    const msg = websocket.lastMessage;

    if (!msg || !msg.room_id) return;

    if (msg.type === "new_room" && msg.data) {
      const roomData = msg.data as ApiRoom;

      const index = rooms.value?.findIndex((room) => room.id === roomData.id);

      if (index === -1) {
        rooms.value = [roomData, ...(rooms.value as ApiRoom[])];
      } else {
        rooms.value = rooms.value?.map((room) =>
          room.id === roomData.id ? roomData : room,
        );
      }
    }

    const isChatMessage = [
      "text",
      "image",
      "file",
      "message",
      "message_group",
    ].includes(msg.type);

    if (!isChatMessage) return;

    rooms.value = (rooms.value as ApiRoom[]).map((room) => {
      if (room.id !== msg.room_id) return room;

      return {
        ...room,
        last_message: {
          id: msg.message_id ?? `temp-${Date.now()}`,
          content: msg.body ?? "",
          user_id: msg.sender_id ?? "",
          user_name: msg.sender_name ?? "",
          message_type: msg.type ?? "text",
          timestamp: new Date(msg.timestamp ?? Date.now()).toISOString(),
        },
      };
    });

    const index = (rooms.value as ApiRoom[]).findIndex(
      (room) => room.id === msg.room_id,
    );

    if (index !== undefined && index > 0) {
      const [room] = (rooms.value as ApiRoom[]).splice(index, 1) as ApiRoom[];
      rooms.value?.unshift(room);
    }
  },
  {
    immediate: true,
  },
);

watch(
  () => websocket.lastMessage,
  async () => {
    await getRooms();
    scrollToTop();
    websocket.setLastMessage(null);
  },
  {
    immediate: true,
  },
);

watch(
  () => roomStore.isUpdated,
  () => {
    if (!roomStore.isUpdated) return;

    getRooms();

    if (roomStore.updatedType === "update") {
      roomStore.getRoomDetail(selectedRoom.value?.id as string);
    } else if (roomStore.updatedType === "leave") {
      selectedRoom.value = null;
      selectedRoomId.value = null;
      showDetail.value = false;
    }

    roomStore.setUpdated(false, null);
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <main class="w-full h-full">
    <div class="w-full h-full flex flex-row">
      <div
        class="w-full max-w-100 h-full shrink-0 rounded-tl-xl overflow-hidden flex flex-col pb-px"
      >
        <div class="flex justify-between p-4">
          <h1 class="font-semibold text-2xl">Chats</h1>
          <div class="flex gap-4">
            <Button
              @click="toggleShowDialog"
              v-tooltip.bottom="{
                value: 'New Chat',
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
                <Icon icon="bx:message-add" class="size-6 text-primary-base" />
              </template>
            </Button>
            <Button
              v-tooltip.bottom="{
                value: 'Menu',
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
                <Icon
                  icon="material-symbols:more-vert"
                  class="size-6 text-primary-base"
                />
              </template>
            </Button>
          </div>
        </div>
        <div ref="scrollChat" class="w-full h-full overflow-y-auto scroll-chat">
          <div class="flex flex-col gap-2 px-4">
            <div :key="room.id" v-for="room in rooms" class="w-full">
              <div
                @click="
                  selectRoom(room.id, room?.target_user_id, room.room_type)
                "
                :class="`flex flex-row gap-2 p-2 rounded-xl group items-center hover:bg-neutral-border/40 ${selectedRoom?.id === room?.id ? 'bg-neutral-border/40' : ''} transition-all duration-500 cursor-pointer`"
              >
                <div class="relative size-12">
                  <div
                    class="size-12 overflow-hidden rounded-full border-2 border-slate-200"
                  >
                    <Image
                      :src="room?.avatar ?? room?.target_avatar_url"
                      :alt="`avatar-${room?.avatar ?? room?.target_username}`"
                      class="size-12 object-cover"
                    />
                  </div>
                  <!-- Status Online Indicator -->
                  <!-- <span
                    class="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"
                  ></span> -->
                </div>

                <div class="w-full flex justify-between overflow-hidden">
                  <div class="flex flex-col gap-1 flex-1 min-w-0">
                    <span class="text-sm font-medium text-primary-base">{{
                      room?.name?.length > 0
                        ? room?.name
                        : room?.target_username
                    }}</span>
                    <p class="text-xs font-normal text-slate-800 truncate">
                      <span v-if="room?.last_message" class="font-medium">
                        {{
                          `${room?.last_message?.user_name ? `${room?.last_message?.user_name}:` : ""}`
                        }}
                      </span>
                      {{ room?.last_message?.content }}
                    </p>
                  </div>
                  <div v-if="room?.last_message" class="flex flex-col gap-1">
                    <span class="text-xs font-normal text-slate-800">{{
                      toTitleCase(
                        formatDate(
                          room?.last_message?.timestamp as string,
                          true,
                        ),
                      )
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 h-full min-w-0 flex relative overflow-hidden">
        <div
          class="flex flex-col w-full h-full min-w-0 bg-neutral-white shadow-xl relative flex-1"
        >
          <div v-if="selectedRoom" class="w-full h-full flex flex-col min-h-0">
            <ChatHeader
              @open-detail="showDetail = !showDetail"
              :data="{
                id:
                  (roomStore.roomDetail?.id as string) ??
                  (userDetail?.id as string),
                name: roomStore.roomDetail?.name as string,
                username: userDetail?.username as string,
                room_type: roomStore.roomDetail?.room_type as RoomType,
                avatar:
                  (roomStore.roomDetail?.avatar as string) ??
                  userDetail?.avatar,
                member_count: roomStore.roomDetail?.member_count as number,
                members: roomStore.roomDetail?.members as RoomMember[],
              }"
            />

            <ChatMessage
              class="flex-1 min-h-0"
              :id-user="selectedTargetUserId as string"
              :id-room="selectedRoomId as string"
            />
          </div>
        </div>

        <!-- Right Sidebar (Detail) Overlay -->
        <Transition name="slide-right">
          <div
            v-if="showDetail && selectedRoom"
            class="absolute right-0 top-0 h-full w-full max-w-md z-50 bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]"
          >
            <UserDetail
              v-if="selectedRoom?.room_type === 'direct' && userDetail"
              :user="{
                name: userDetail.username,
                phone: userDetail.email,
                about: userDetail.about || '',
                avatarUrl: userDetail.avatar,
              }"
              @close="showDetail = false"
            />
            <GroupDetail
              v-if="selectedRoom?.room_type === 'group' && roomStore.roomDetail"
              :group="{
                id: roomStore.roomDetail.id,
              }"
              @close="showDetail = false"
            />
          </div>
        </Transition>
      </div>
    </div>

    <DialogNewChat v-model:visible="showDialog" />
  </main>
</template>

<style scoped>
.scroll-chat::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scroll-chat::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scroll-chat::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scroll-chat::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
