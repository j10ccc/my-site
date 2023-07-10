import type { Post } from "@types/post";

const getTags = (allPosts: Post[]) => {
  const postsWithTag = allPosts.filter(post =>
    post.meta.tags
  );

  const uniqueTags = [...new Set(postsWithTag.map(post => {
    return post.meta.tags!
  }).flat())];

  return uniqueTags;
}

export default getTags;
