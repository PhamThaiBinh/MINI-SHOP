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

    return data.map((row: any) => ({
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
      readTime: String(row.read_time || row.readTime),
      content: String(row.content),
    };
  } catch (err) {
    console.error(`Error fetching blog ${id} from Supabase:`, err);
    return BLOG_ARTICLES.find((b) => b.id === id) || null;
  }
};
