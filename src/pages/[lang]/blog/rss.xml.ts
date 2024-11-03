import rss from "@astrojs/rss";
import { Languages } from "@interfaces/i18n";
import { getLanguageCollections, getPostsWithLanguage } from "@utils/languageCollection";
import { defineMiddleware } from "astro:middleware";
import MarkdownIt from "markdown-it";

const parser = new MarkdownIt();

export async function getStaticPaths() {
  return [
    { params: { lang: "zh-cn" } },
    { params: { lang: "en" } }
  ];
}

export const GET = defineMiddleware(async (context) => {
  const data = await getLanguageCollections();
  const lang = context.params.lang as Languages;
  const posts = getPostsWithLanguage(data, Languages[lang]);
  const followMeta = {
    feedId: "62033118826866689",
    userId: "62125606033830912"
  };

  return rss({
    title: "J10c's Blog",
    description: "自己写的博客",
    site: context.site || "",
    items: posts.map(({ post }) => ({
      title: post.meta.title,
      pubDate: post.meta.pubDate,
      description: post.meta.description,
      content: parser.render(post.content),
      link: `${lang}/blog/${post.entry.slug.split("/").slice(1).join("")}-${lang}`
    })),
    customData: `
<follow_challenge>
    <feedId>${followMeta.feedId}</feedId>
    <userId>${followMeta.userId}</userId>
</follow_challenge>
`
  });
});
