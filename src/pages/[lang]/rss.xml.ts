import rss from "@astrojs/rss";
import { Languages } from "@interfaces/i18n";
import { getLanguageCollections, getPostsWithLanguage } from "@utils/languageCollection";
import { defineMiddleware } from "astro:middleware";

export async function getStaticPaths() {
  return [
    { params: { lang: "zh-cn" } },
    { params: { lang: "en" } }
  ]
}

export const GET = defineMiddleware(async (context) => {
  const data = await getLanguageCollections();
  const lang = context.params.lang as Languages;
  const posts = getPostsWithLanguage(data, Languages[lang]);

  return rss({
    title: "J10c's Blog",
    description: "自己写的博客",
    site: context.site || "",
    items: posts.map(({ post }) => ({
      title: post.meta.title,
      pubDate: post.meta.pubDate,
      description: post.meta.description,
      link: `${lang}/blog/${post.entry.slug.split("/").slice(1).join("")}-${lang}`
    })),
  })
})
