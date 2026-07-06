import { defineStore } from "pinia";

interface RoomState {
  // roomId: string | null;
  // userId: string | null;
  isUpdated: boolean;
}

export const useRoomStore = defineStore("room", {
  state: (): RoomState => ({
    // roomId: null,
    // userId: null,
    isUpdated: false,
  }),

  actions: {
    setUpdated(isUpdate: boolean) {
      this.isUpdated = isUpdate;
    },
    // getRoom() {
    //   ((this.roomId = "test"), (this.userId = "test"));
    // },
    // setRoom(roomId: string | null, userId: string | null) {
    //   this.roomId = roomId;
    //   this.userId = userId;
    // },
  },
});
