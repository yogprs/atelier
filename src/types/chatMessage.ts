import type { RoomDetail } from "./room";
import type { User } from "./user";

export interface ChatMessageProps {
  idRoom: string;
}

export type RoomDetailHeader = Pick<
  RoomDetail,
  "id" | "avatar" | "members" | "room_type" | "name" | "member_count"
>;

export type UserDetailHeader = Pick<User, "id" | "username" | "avatar">;

export interface ChatHeaderProps {
  data: RoomDetailHeader | UserDetailHeader;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  message_type: "system" | "text" | "image" | "file";
  timestamp: string;
  attachments?: string[];
}
