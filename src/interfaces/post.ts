import type { Languages } from "@interfaces/i18n";
import type { CollectionEntry } from "astro:content";

export interface LanguageCollection {
  /** Post file name */
  name: string;
  /** Post all language version */
  posts: {
    [key in Languages]?: Post;
  }
}

export interface Post {
  meta: Meta;
  language: Languages;
  url: string;
  entry: CollectionEntry<"blog">;
  content: string;
}

export interface Meta {
  title: string;
  pubDate: Date;
  author: string;
  tags?: string[];
  description?: string;
}
