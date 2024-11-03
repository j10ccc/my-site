import { getCollection } from "astro:content";
import type { Post } from "@interfaces/post";
import type { Languages } from "@interfaces/i18n";
import type { LanguageCollection } from "@interfaces/post";

export const getLanguageCollections = async (): Promise<LanguageCollection[]> => {
  const raw = await getCollection("blog");
  const temp: any = {};
  raw.forEach(item => {
    const [language, ...slug] = item.slug.split("/");
    const post: Post = {
      meta: item.data,
      url: `${slug.join("/")}-${language}`,
      language: language as Languages,
      entry: item,
      content: item.body
    };
    const filename = slug.slice(-1)[0];
    if (!temp[filename]) temp[filename] = {};
    temp[filename][language] = post;
  });

  const res = Object.keys(temp)
    .map((key): LanguageCollection => {
      return {
        name: key,
        posts: temp[key]
      };
    });

  return res;
};

export const parseCollection = (collection: LanguageCollection, lang?: Languages) => {
  let post: Post;
  if (!lang || !collection.posts[lang]) {
    post = Object.entries(collection.posts)[0][1];
  } else {
    post = collection.posts[lang]!;
  }

  const languages: [lang: Languages, url: string][] = Object.entries(collection.posts)
    .map(item => [
      item[0] as Languages,
      item[1].url
    ]);

  return { post, languages };
};

export const getPostsWithLanguage = (collections: LanguageCollection[], lang?: Languages) => {
  const withLanguage = collections.map(collection => {
    return parseCollection(collection, lang);
  });
  return withLanguage;
};
