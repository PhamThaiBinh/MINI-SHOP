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

const INITIAL_SESSIONS: LiveChatSession[] = [
  {
    id: "session-binh",
    customer_name: "Phạm Thái Bình",
    customer_email: "binhpham.1512202@gmail.com",
    customer_phone: "0988123456",
    mode: "human",
    unread_count: 0,
    last_message: "Xin chào shop!",
    last_message_at: "Vừa xong",
    avatar_bg: "#2e7d32",
    avatar_text: "TB",
  },
];

const STORAGE_SESSIONS_KEY = "minishop_live_chat_sessions";
const STORAGE_MESSAGES_KEY = "minishop_live_chat_messages";

// ---------------- LOCAL STORAGE CACHE HELPERS ----------------
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
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(`${STORAGE_MESSAGES_KEY}_${sessionId}`);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveLocalMessages(sessionId: string, messages: LiveChatMessage[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`${STORAGE_MESSAGES_KEY}_${sessionId}`, JSON.stringify(messages));
  }
}

// ---------------- SUPABASE REALTIME SYNC ENGINE ----------------
export async function fetchSupabaseSessions(): Promise<LiveChatSession[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("live_chat_sessions")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return getLocalSessions();
    }

    const formatted: LiveChatSession[] = data.map((s: any) => ({
      id: s.id,
      customer_name: s.customer_name,
      customer_email: s.customer_email,
      customer_phone: s.customer_phone || "",
      mode: s.mode === "human" ? "human" : "bot",
      unread_count: Number(s.unread_count || 0),
      last_message: s.last_message || "",
      last_message_at: s.last_message_at || "Vừa xong",
      avatar_bg: s.avatar_bg || "#2e7d32",
      avatar_text: s.avatar_text || "U",
    }));

    saveLocalSessions(formatted);
    return formatted;
  } catch (err) {
    console.warn("Supabase fetch sessions fallback to local:", err);
    return getLocalSessions();
  }
}

export async function fetchSupabaseMessages(sessionId: string): Promise<LiveChatMessage[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("live_chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("timestamp", { ascending: true });

    if (error || !data || data.length === 0) {
      return getLocalMessages(sessionId);
    }

    const formatted: LiveChatMessage[] = data.map((m: any) => ({
      id: m.id,
      session_id: m.session_id,
      sender_type: m.sender_type,
      sender_name: m.sender_name,
      message: m.message,
      created_at: m.created_at,
    }));

    saveLocalMessages(sessionId, formatted);
    return formatted;
  } catch (err) {
    console.warn("Supabase fetch messages fallback to local:", err);
    return getLocalMessages(sessionId);
  }
}

export async function syncInsertMessageToSupabase(msg: LiveChatMessage, sessionUpdate?: Partial<LiveChatSession>) {
  // Save local first
  const currentLocalMsgs = getLocalMessages(msg.session_id);
  if (!currentLocalMsgs.some((m) => m.id === msg.id)) {
    saveLocalMessages(msg.session_id, [...currentLocalMsgs, msg]);
  }

  try {
    const supabase = createClient();
    await supabase.from("live_chat_messages").insert({
      id: msg.id,
      session_id: msg.session_id,
      sender_type: msg.sender_type,
      sender_name: msg.sender_name,
      message: msg.message,
      created_at: msg.created_at,
    });

    if (sessionUpdate) {
      await supabase.from("live_chat_sessions").upsert({
        id: sessionUpdate.id || msg.session_id,
        customer_name: sessionUpdate.customer_name || "Khách Hàng",
        customer_email: sessionUpdate.customer_email || "khach@minishop.vn",
        customer_phone: sessionUpdate.customer_phone || "",
        avatar_bg: sessionUpdate.avatar_bg || "#2e7d32",
        avatar_text: sessionUpdate.avatar_text || "K",
        mode: sessionUpdate.mode || "bot",
        last_message: sessionUpdate.last_message || msg.message,
        last_message_at: sessionUpdate.last_message_at || msg.created_at,
        unread_count: sessionUpdate.unread_count ?? 0,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn("Supabase insert message notice:", err);
  }
}

export async function syncUpdateSessionModeInSupabase(sessionId: string, newMode: "bot" | "human") {
  try {
    const supabase = createClient();
    await supabase
      .from("live_chat_sessions")
      .update({ mode: newMode, updated_at: new Date().toISOString() })
      .eq("id", sessionId);
  } catch (err) {
    console.warn("Supabase update session mode notice:", err);
  }
}
