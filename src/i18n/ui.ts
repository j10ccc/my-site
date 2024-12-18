import { Languages } from "@interfaces/i18n";

export const languages: { [key in Languages]: string } = {
  [Languages["zh-cn"]]: "中文",
  [Languages["en"]]: "English"
};

export const defaultLang = Languages["zh-cn"];

export const ui: { [key in Languages]: { [key: string]: string } } = {
  [Languages["zh-cn"]]: {
    "identify.name": "J10c",
    "identify.introduction": "前端开发",
    "identify.occupation": "在杭大学生",
    "identify.hobby": "热爱新事物",
    "social.juejin": "稀土掘金",
    "social.github": "Github",
    "blog.slogan": "记录值得思考的创意。",
    "blog.friends": "还没看过瘾？看看朋友们的分享吧！"
  },
  [Languages["en"]]: {
    "identify.name": "J10c",
    "identify.introduction": "Front-end Developer.",
    "identify.occupation": "A University Student in Hangzhou.",
    "identify.hobby": "I'm fond of new things.",
    "social.juejin": "Juejin",
    "social.github": "Github",
    "blog.slogan": "Keep more, keep in mind.",
    "blog.friends": "Take a look at the shares from my friends!"
  }
};
