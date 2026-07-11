import type { RoomDetail } from "./room";
import type { User } from "./user";

export interface ChatMessageProps {
  idRoom: string;
  idUser: string | null;
}

export type RoomDetailHeader = Pick<
  RoomDetail,
  "id" | "avatar" | "members" | "room_type" | "name" | "member_count"
>;

export type UserDetailHeader = Pick<User, "id" | "username" | "avatar">;

export type MessageType = "system" | "text" | "image" | "file";

export interface ChatHeaderProps {
  data: RoomDetailHeader | UserDetailHeader;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  message_type: MessageType;
  timestamp: string;
  attachments?: string[];
}

export interface PendingMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message_type: "image";
  content: string;
  attachments: string[];
  files: File[];
  timestamp: string;
  status: "pending" | "failed" | "sent";
}
