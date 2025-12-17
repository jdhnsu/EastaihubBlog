export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string; // HTML content
  featured_image?: string;
}

export interface ContentManifest {
  posts: Post[];
  tags: Record<string, string[]>; // tag -> list of slugs
}
