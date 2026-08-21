import { createClient } from "@/utils/supabase/client";

/**
 * Uploads a product image file directly to the Supabase Storage bucket 'products'.
 * Returns the public URL of the uploaded image file or null if upload failed.
 */
export async function uploadProductImage(file: File): Promise<string | null> {
  try {
    const supabase = createClient();
    
    // Clean and generate a unique file name
    const fileExt = file.name.split(".").pop() || "png";
    const sanitizedExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
    const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${sanitizedExt}`;
    const filePath = `images/${fileName}`;

    // Upload file to Supabase Storage bucket 'products'
    const { data, error } = await supabase.storage
      .from("products")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "image/png",
      });

    if (error) {
      console.error("Error uploading image to Supabase Storage:", error);
      return null;
    }

    // Retrieve public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Unexpected error during image upload:", err);
    return null;
  }
}
