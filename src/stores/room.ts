import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types/general";
import type { RoomDetail, RoomType } from "@/types/room";
import { defineStore } from "pinia";

interface RoomState {
  isUpdated: boolean;
  updatedType: "create" | "update" | "leave" | null;
  roomDetail: RoomDetail | null;
  selectedRoom: {
    id: string | null;
    targetUserId: string | null;
    roomType: RoomType;
  } | null;
  selectedMembers: string[] | null;
}

export const useRoomStore = defineStore("room", {
  state: (): RoomState => ({
    isUpdated: false,
    updatedType: null,
    roomDetail: null,
    selectedRoom: null,
    selectedMembers: null,
  }),

  actions: {
    async getRoomDetail(id: string) {
      try {
        const response = await apiClient.get<ApiResponse<RoomDetail>>(
          `/room/${id}`,
        );

        this.roomDetail = response.data ?? null;
      } catch (error) {
        console.error(error);
      }
    },

    setSelectedRoom(
      selectedRoom: {
        id: string | null;
        targetUserId: string | null;
        roomType: RoomType;
      } | null,
    ) {
      this.selectedRoom = selectedRoom;
    },

    setSelectedMembers(members: string[] | null) {
      this.selectedMembers = members;
    },

    setUpdated(isUpdate: boolean, type: "create" | "update" | "leave" | null) {
      this.isUpdated = isUpdate;
      this.updatedType = type;
    },
  },
});
