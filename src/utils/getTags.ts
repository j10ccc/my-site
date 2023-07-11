import type { Post } from "@interfaces/post";

/**
 * Get all unique tags.
 * 
 * @param allPosts 
 * @returns uppercase tags
 */
const getTags = (allPosts: Post[]) => {
  const postsWithTag = allPosts.filter(post =>
    post.meta.tags
  );

  const uniqueTags = [...new Set(postsWithTag.map(post => {
    return post.meta.tags!.map(item => item.toUpperCase());
  }).flat())];

  return uniqueTags;
}

export default getTags;
