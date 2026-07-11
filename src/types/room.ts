import type { Message } from "./chatMessage";

export type RoomType = "group" | "direct";

export interface ApiRoom {
  id: string;
  name: string;
  avatar: string;
  room_type: RoomType;
  is_private: boolean;
  created_at: string;
  target_user_id: string;
  target_username: string;
  target_avatar_url: string;
  last_message?: LastMessage | null;
}

export interface RoomMember {
  user_id: string;
  username: string;
  email: string;
  avatar_url: string;
  role: "admin" | "member";
  joined_at: string;
}

export interface RoomDetail {
  id: string;
  name: string;
  description?: string;
  room_type: "group" | "direct";
  avatar: string;
  is_private: boolean;
  created_at: string;
  created_by: string;
  member_count: number;
  members: RoomMember[];
}

export interface LastMessage {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  message_type: string;
  timestamp: string;
}

export type DirectRoomStore = {
  rooms: ApiRoom[];
  setRoom: (rooms: ApiRoom[]) => void;
  clearRoom: () => void;
};

export interface RoomMessage {
  messages: Message[];
  Has_more: boolean;
  next_cursor: string | null;
  has_more?: boolean;
  error?: string;
}
