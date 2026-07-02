import { defineStore } from "pinia";

interface RoomState {
  roomId: string | null;
  userId: string | null;
}

export const useRoomStore = defineStore("room", {
  state: (): RoomState => ({
    roomId: null,
    userId: null,
  }),

  actions: {
    setRoom(roomId: string | null, userId: string | null) {
      this.roomId = roomId;
      this.userId = userId;
    },
  },
});
