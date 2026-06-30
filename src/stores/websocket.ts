import { defineStore } from "pinia";
import { appConfig } from "@/config";
import { useAuthStore } from "./auth";
import type {
  BroadcastMessage,
  WebSocketState,
  WsIncomingMessage,
} from "@/types/websocket";

const WS_BASE_URL = appConfig.API_URL.replace("https://", "wss://")
  .replace("http://", "ws://")
  .replace("/api", "");

export const useWebSocketStore = defineStore("websocket", {
  state: (): WebSocketState => ({
    socket: null,

    lastMessage: null,
    triggerUpdate: 0,

    isConnected: false,
  }),

  actions: {
    connect() {
      const auth = useAuthStore();

      if (!auth.accessToken) return;

      if (
        this.socket &&
        (this.socket.readyState === WebSocket.OPEN ||
          this.socket.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      this.socket = new WebSocket(
        `${WS_BASE_URL}/ws?token=${auth.accessToken}`,
      );

      this.socket.onopen = () => {
        this.isConnected = true;
      };

      this.socket.onmessage = (event) => {
        const parsed = JSON.parse(event.data) as WsIncomingMessage;

        const msg: BroadcastMessage = {
          room_id: parsed?.room_id,
          type: parsed?.message_type,
          title: parsed?.title,
          body: parsed?.content,
          sender_id: parsed?.sender_id,
          sender_name: parsed?.sender_name,
          message_id: parsed?.id,
          data: parsed,
          timestamp: parsed?.timestamp || Date.now(),
          attachments: parsed?.attachments || [],
        };

        console.log("-> Parsed: ", parsed);
        // this.lastMessage = JSON.parse(event.data);
        this.lastMessage = msg;
        this.triggerUpdate++;
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.socket = null;
      };

      this.socket.onerror = (err) => {
        console.error(err);
      };
    },

    disconnect() {
      this.socket?.close();
      this.socket = null;
      this.isConnected = false;
    },

    send(data: Omit<BroadcastMessage, "timestamp">) {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(data));
      }
    },

    setLastMessage(msg: BroadcastMessage | null) {
      this.lastMessage = msg;
    },
  },
});
