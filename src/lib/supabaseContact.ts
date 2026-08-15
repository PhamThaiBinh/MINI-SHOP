import { createClient } from "@/utils/supabase/client";

export interface ContactMessageData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const sendContactMessageToSupabase = async (
  data: ContactMessageData
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      message: data.message,
    });

    if (error) {
      console.error("Error inserting contact message:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error sending contact message:", err);
    return false;
  }
};
