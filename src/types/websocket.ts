export interface BroadcastMessage {
  room_id: string;
  type: string;
  title?: string;
  body?: string;
  sender_id?: string;
  sender_name?: string;
  message_id?: string;
  data?: any;
  timestamp?: number | string;
  attachments?: string[];
}

export interface WsIncomingMessage {
  id?: string; // `json:"id"` — from MessageResponse
  room_id: string; // `json:"room_id"`
  content?: string; // `json:"content"`
  message_type: "text" | "image" | "file"; // `json:"message_type"`
  sender_id?: string;
  sender_name?: string; // `json:"sender_name,omitempty"`
  reply_to?: string | null; // `json:"reply_to,omitempty"` (UUID as string)
  message_id?: string;
  type?: string;
  body?: string;
  title?: string;
  data?: WsIncomingMessage | string | null;
  timestamp?: number | string; // number for epoch, string for ISO (time.Time)
  attachments?: string[]; // `json:"attachments,omitempty"` — from MessageResponse
}

export interface WebSocketState {
  lastMessage: BroadcastMessage | null;
  triggerUpdate: number;
  isConnected: boolean;
  socket: WebSocket | null;
}
