import { createClient } from "@/utils/supabase/client";
import { BLOG_ARTICLES, BlogArticle } from "@/data/blogs";
export type { BlogArticle };

export const fetchBlogsFromSupabase = async (): Promise<BlogArticle[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("Supabase fetch blogs error or empty, using fallback:", error?.message);
      return BLOG_ARTICLES;
    }

    const fetched: BlogArticle[] = data.map((row: any) => ({
      id: Number(row.id),
      title: String(row.title),
      category: String(row.category),
      date: String(row.date),
      excerpt: String(row.excerpt),
      img: String(row.img),
      author: String(row.author),
      readTime: String(row.read_time || row.readTime),
      content: String(row.content),
    }));

    if (fetched.length < 4) {
      const existingIds = new Set(fetched.map((b) => b.id));
      const needed = BLOG_ARTICLES.filter((b) => !existingIds.has(b.id));
      return [...fetched, ...needed];
    }

    return fetched;
  } catch (err) {
    console.error("Error fetching blogs from Supabase:", err);
    return BLOG_ARTICLES;
  }
};

export const fetchBlogByIdFromSupabase = async (id: number): Promise<BlogArticle | null> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", id)
      .limit(1);

    if (error || !data || data.length === 0) {
      return BLOG_ARTICLES.find((b) => b.id === id) || null;
    }

    const row = data[0];
    return {
      id: Number(row.original_id || row.id),
      title: String(row.title),
      category: String(row.category),
      date: String(row.date),
      excerpt: String(row.excerpt),
      img: String(row.img),
      author: String(row.author),
      readTime: String(row.read_time || row.readTime || "5 phút đọc"),
      content: String(row.content || row.excerpt),
    };
  } catch (err) {
    console.error(`Error fetching blog ${id} from Supabase:`, err);
    return BLOG_ARTICLES.find((b) => b.id === id) || null;
  }
};

export const saveBlogToSupabase = async (blog: Partial<BlogArticle>): Promise<boolean> => {
  try {
    const supabase = createClient();
    const blogCode = `B${String(blog.id || Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")}`;

    const payload = {
      blog_code: blogCode,
      title: blog.title,
      category: blog.category,
      date: blog.date || new Date().toLocaleDateString("vi-VN"),
      excerpt: blog.excerpt,
      img: blog.img,
      author: blog.author || "Admin",
      read_time: blog.readTime || "5 phút đọc",
      content: blog.content || blog.excerpt,
    };

    if (blog.id) {
      const { error } = await supabase.from("blogs").update(payload).eq("id", blog.id);
      return !error;
    } else {
      const { error } = await supabase.from("blogs").insert(payload);
      return !error;
    }
  } catch (err) {
    console.error("Error saving blog to Supabase:", err);
    return false;
  }
};

export const deleteBlogFromSupabase = async (id: number): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    return !error;
  } catch (err) {
    console.error(`Error deleting blog ${id} from Supabase:`, err);
    return false;
  }
};
