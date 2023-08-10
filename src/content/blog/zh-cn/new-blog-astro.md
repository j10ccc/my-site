---
layout: "@layouts/MarkdownPostLayout.astro"
title: 博客站点翻新了
author: J10c
pubDate: 2023-08-10
tags: ["programming"]
---

这几个星期把博客翻新了。从原来的 Hugo + 第三方主题换成了 Astro + 全自定义主题。

这套主题我命名为 **Stone**，颜色选取参考了身边一些建筑的颜色。目前没有计划将主题抽离出来做定制化配置。

Astro 官方文档有一篇完整的构建博客教程，按照教程一步步来构建，对有前端基础的应该不难。这也是我用 Astro 的理由之一。

## 为什么选择 Astro?

- Astro 基于 Vite 构建、并且在 NPM 生态圈内，开发体验好。
- Astro 可编程性高，支持 TS、文件路由、静态路由生成、周边插件等。
- 模板语言为 JSX，上手很快，看文档了解 Astro 的一些工作原理后，碰到的问题基本上能自己解决
- 文档全面，社区活跃。

我选择的是 SSG 构建，当然 Astro 也支持 SSR。得益于静态路由映射，全站包括文章页，首页的性能都很好，Lighthouse 的 Performance 和 SEO 分数都能打满。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/19b748178c274357ba3ea3b84e8750cb~tplv-k3u1fbpfcp-watermark.image?)

## 提一嘴

博客的主题我换过好几次，Hexo 时期用过三个，Hugo 用过一个，这次手写全站样式，应该是最后一个了。

现在有很多博客生成方案，有用 Nextjs 搭建 Notion 知识库站点的，Umijs 官方也有个博客搭建教程。很多方案的文章数据都从现有站点的 API 获取，或者托管在 CMS 上，当然 Astro 也可以做到这个。而我更偏向于在本地存放，不说数据安全的问题，起码数据迁移成本更低。

很多人现在也不会去搭建博客。飞书文档、语雀等文档（知识库）应用都足够好用，比 Markdown 有更丰富的展现形式。搭建博客更多还是个人的意愿，类似求职加分之类的理由。

博客的初衷：分享知识，记录经历。在实现这两点之前有很多道坎。对很多人来说博客本身没什么意义，搭建的过程可能更有意义一些吧。
