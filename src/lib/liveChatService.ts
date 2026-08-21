import { createClient } from "@/utils/supabase/client";

export interface LiveChatSession {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  mode: "bot" | "human";
  unread_count: number;
  last_message: string;
  last_message_at: string;
  avatar_bg?: string;
  avatar_text?: string;
}

export interface LiveChatMessage {
  id: string;
  session_id: string;
  sender_type: "customer" | "bot" | "admin";
  sender_name: string;
  message: string;
  created_at: string;
}

// Initial Mock Sessions for Demo / Local Test
const INITIAL_SESSIONS: LiveChatSession[] = [
  {
    id: "session-binh",
    customer_name: "Phạm Thái Bình",
    customer_email: "binhpham.1512202@gmail.com",
    customer_phone: "0988123456",
    mode: "bot",
    unread_count: 1,
    last_message: "Tư vấn sofa vải cao cấp phòng khách giúp em",
    last_message_at: "Vừa xong",
    avatar_bg: "#2e7d32",
    avatar_text: "TB",
  },
  {
    id: "session-lan",
    customer_name: "Nguyễn Hương Lan",
    customer_email: "lan.nguyen@gmail.com",
    customer_phone: "0909112233",
    mode: "human",
    unread_count: 0,
    last_message: "Shop cho mình hỏi bộ bàn ăn gỗ sồi có hỗ trợ phí ship về Bình Dương không?",
    last_message_at: "10 phút trước",
    avatar_bg: "#d97706",
    avatar_text: "HL",
  },
];

const INITIAL_MESSAGES: Record<string, LiveChatMessage[]> = {
  "session-binh": [
    {
      id: "m-1",
      session_id: "session-binh",
      sender_type: "customer",
      sender_name: "Phạm Thái Bình",
      message: "Tư vấn sofa vải cao cấp phòng khách giúp em",
      created_at: "17:35",
    },
    {
      id: "m-2",
      session_id: "session-binh",
      sender_type: "bot",
      sender_name: "Trợ Lý MINI SHOP",
      message: "🛋️ Dưới đây là các mẫu Ghế Sofa nổi bật được chọn mua nhiều nhất...",
      created_at: "17:35",
    },
  ],
  "session-lan": [
    {
      id: "m-3",
      session_id: "session-lan",
      sender_type: "customer",
      sender_name: "Nguyễn Hương Lan",
      message: "Shop cho mình hỏi bộ bàn ăn gỗ sồi có hỗ trợ phí ship về Bình Dương không?",
      created_at: "17:25",
    },
    {
      id: "m-4",
      session_id: "session-lan",
      sender_type: "admin",
      sender_name: "Admin MINI SHOP",
      message: "Dạ em chào chị Lan ạ! MINI SHOP hỗ trợ MIỄN PHÍ VẬN CHUYỂN cho bộ bàn ăn gỗ sồi về Bình Dương luôn chị nhé!",
      created_at: "17:27",
    },
  ],
};

const STORAGE_SESSIONS_KEY = "minishop_live_chat_sessions";
const STORAGE_MESSAGES_KEY = "minishop_live_chat_messages";

export function getLocalSessions(): LiveChatSession[] {
  if (typeof window === "undefined") return INITIAL_SESSIONS;
  const data = localStorage.getItem(STORAGE_SESSIONS_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
    return INITIAL_SESSIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SESSIONS;
  }
}

export function saveLocalSessions(sessions: LiveChatSession[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
  }
}

export function getLocalMessages(sessionId: string): LiveChatMessage[] {
  if (typeof window === "undefined") return INITIAL_MESSAGES[sessionId] || [];
  const data = localStorage.getItem(`${STORAGE_MESSAGES_KEY}_${sessionId}`);
  if (!data) {
    const initMsg = INITIAL_MESSAGES[sessionId] || [];
    localStorage.setItem(`${STORAGE_MESSAGES_KEY}_${sessionId}`, JSON.stringify(initMsg));
    return initMsg;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MESSAGES[sessionId] || [];
  }
}

export function saveLocalMessages(sessionId: string, messages: LiveChatMessage[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`${STORAGE_MESSAGES_KEY}_${sessionId}`, JSON.stringify(messages));
  }
}
