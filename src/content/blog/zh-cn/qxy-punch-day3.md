---
layout: "@layouts/MarkdownPostLayout.astro"
title: 青训营 | React 实现简单的搜索结果渲染
author: J10c
pubDate: 2022-06-16
tags: ["react"]
---

这是我参与「第三届青训营 -后端场」笔记创作活动的的第3篇笔记

搜索引擎项目有个需求就是渲染搜索结果条目，为了让条目更加美观，我参考了 Google 的设计，顶部为 url 渲染，主体是关键词和详细结果展示。

使用 React 框架，组件库用到了 antd

## 结果展示

- Google 中的结果条目截图
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e4af0515d934f128babb9f2d3b35630~tplv-k3u1fbpfcp-watermark.image?)

- 我实现的结果条目截图
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eb89f9732c3e420c9d50a91fba115c14~tplv-k3u1fbpfcp-watermark.image?)

## 后端返回数据样例

后端的搜索数据是爬取的人民日报文章数据，其中Content是整篇文章的内容（返回的内容过长，有删改

```json
{
    "ID": 1729,
    "URL": "http://paper.people.com.cn/rmrb/html/2021-10/06/nw.D110000renmrb_20211006_5-01.htm",
    "Title": "有了社区食堂，真暖心（奋斗百年路 启航新征程·同心奔小康）",
    "Content": "　　中午时分，年过八旬的郑州市金水区甲院社区居民张玉玲和几位老姐妹相继走进社区食堂。"
}
```

## 需求分析

1. URL 根据层级切片，域名和路径分不同颜色渲染
2. 对于较长的 Content ，前端要提取摘要，该摘要需要包含关键词
2. 卡片中需要处理溢出内容，在结尾添加省略号
3. 关键词高亮

## 提取摘要
因为 Content 过长，如果直接存在状态中，后续处理数据将会影响性能，所以选择在接受请求的时候就做好预处理

1. 保留关键字
2. 第一个关键字所在的句子的完整性
3. 在上面两条前提下尽量缩短长度

先找到第一个关键词，然后向前寻找第一个标点符号，从标点符号后面的内容即是要保留的内容。数了一下，页面显示两行摘要大概是 80 个字符，所以我们保留 100 个字符，这样就获得摘要啦

```tsx
const pos = item.content.indexOf(keyWord);
const reg = /[^A-Za-z0-9\u4e00-\u9fa5+]/g;
let i = pos;
for (i = pos; i > 0; i--) {
  if (reg.test(item.content[i])) break;
}
const content = item.content.slice(
  i + 1,
  i + 100 <= item.content.length ? pos + 100 : item.content.length
);
```

## URL 渲染
首先要区分颜色，先分出 `baseURL`，我使用正则
```tsx
const pattern: RegExp = /^(http:\/\/|https:\/\/)[^/]+\//;
const baseURL = pattern
  .exec(url)![0]
  .slice(0, pattern.exec(url)![0].length - 1);
```

然后把后面的路径中的`/`替换成其他符号，我这里选择了`>`，当然也可以用 emoji 连接😁

```tsx
let s: string = "";
url
  .split(baseURL + "/")[1]
  .split("/")
  .forEach((item: string) => {
    s += " > " + item;
  });
```

最后渲染出来

```tsx
// 对于链接过长溢出，我使用了 antd 的 Typography 来处理
return (
  <Text ellipsis className="fit-width">
    <a href={url} style={{ fontFamily: "monospace" }}>
      <span style={{ color: "black" }}>{baseURL}</span>
      <span style={{ color: "gray" }}>{s}</span>
    </a>
  </Text>
);
```

## 关键词高亮
对于较短的摘要和结果标题，先切片再拼接将内容和关键词独立出来

```tsx
export default function RichText(props: any) {
  const { plainText, keyWord } = props;
  const tmp = plainText.split(keyWord);

  return tmp.map((item: string, index: number) => {
    return (
      <span key={index}>
        {item}
        {index !== tmp.length - 1 ? <Text type="danger">{keyWord}</Text> : null}
      </span>
    );
  });
}
```

最后再像这样渲染出来就行啦
```tsx
function RETitle(props: any) {
  const { title, url, keyWord } = props;
  
  return (
    <Text ellipsis>
      <a href={url}>
        <RichText plainText={title} keyWord={keyWord} />
      </a>
    </Text>
  );
}
```
