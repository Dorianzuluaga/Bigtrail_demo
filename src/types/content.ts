export interface ContentItem {
  id: number | string;
  title: string;
  type: "video" | "photo" | "article" | "story" | String;
  status?: "published" | "draft" | "pending" | string;
  views?: number;
  likes?: number;
  comments?: number;
  earnings?: number;
  date: string; // ISO date string
  description?: string;
  mediaUrl?: string;
  content?: string;
  content_id?: string;
  [key: string]: any; // Para propiedades adicionales dinámicas
}
