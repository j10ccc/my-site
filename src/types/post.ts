export interface Post {
  meta: Meta;
  url: string;
}

export interface Meta {
  title: string;
  pubDate: Date;
  author: string;
  tags?: string[];
}