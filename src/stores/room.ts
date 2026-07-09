import apiClient from "@/lib/apiClient";
import type { ApiResponse } from "@/types/general";
import type { RoomDetail } from "@/types/room";
import { defineStore } from "pinia";

interface RoomState {
  isUpdated: boolean;
  updatedType: "update" | "leave" | null;
  roomDetail: RoomDetail | null;
}

export const useRoomStore = defineStore("room", {
  state: (): RoomState => ({
    isUpdated: false,
    updatedType: null,
    roomDetail: null,
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

    setUpdated(isUpdate: boolean, type: "update" | "leave" | null) {
      this.isUpdated = isUpdate;
      this.updatedType = type;
    },
  },
});
