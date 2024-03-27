---
layout: "@layouts/MarkdownPostLayout.astro"
title: 从函数注释看 TypeScript 和 JSDoc
author: J10c
pubDate: 2024-03-27
tags: ["programming"]
---

前阵子 Svelte 宣布放弃 TypeScript，拥抱 JSDoc，这事整个社区都在讨论。不谈 TS 对构建的影响，当时聊的比较多的方向就是他们两个功能的交集 —— 类型。

我从个人爱好看，更喜欢 TS 一点，论类型 JSDoc 的表现力肯定是不如 TS 的类型体操的。而且后者声明类型还比较麻烦。

```js 
/**
 * @param a {number} variable a
 * @param b {number} variable b
 */
function sum(a, b) {
  return a + b;
}
```

好，当时看完社区里面的文章我是这样想的，谁还用 JSDoc 啊？转头回去写代码，却自然而然写出这样子的

```ts
interface Person {
  /** 名字 */
  name: string;
  /** 年龄 */
  age: number;
  /** 身份 */
  role: string;
}
```

有啥不对的吗？我不自觉地在 TS 中使用了 JSDoc 来写注释， 编辑器则按照 JSDoc 的规范来解析我的注释，渲染到代码提示里面（hover 鼠标到属性上出现注释）

我一直没意识到这样的注释就是 JSDoc，直到前几天有群友在问

> TS 定义函数类型，要给参数列表写注释怎么写？

接着他贴出了这样一段代码，又问到，你们都是写这么复杂的吗？

```ts
interface Fn {
  /**
   * @param {number} arg1 第一个参数
   */
  (arg1: number): void
}
```

一开始我没看懂他的意思，后来尝试了一下用 `type` 类型定义函数，是没办法给参数添加注释的。

```ts
type Fn = (arg1: number) => void;
```

但是他的写法太抽象了，他居然 JSDoc 和 TS 混着用！~~绝对是重大政治错误！~~

我尝试写他的 Demo 后才发现，他是想要复用这个注释，如果有变量的类型是这个 interface，那么自动会被编辑器解析出参数的 JSDoc。注释写在声明 interface 的地方，只写一次就行了。但是 type 做不到，要做到的话只能在声明函数的地方写一份 JSDoc。

![在函数定义的时候才写注释](https://cdn.j10ccc.xyz/static/blog/vDEYmd.png)

> 此时我才意识到，TS 压根不带注释的功能，编辑器解析注释完全是靠 JSDoc 的。

再回看这个群友的问题，他认为写 interface 这样不够优雅（我也觉得不对），但是要在类型上**复用注释**，就只能这样写。 既然 type 不支持写注释，那么问题就确定在该不该一起写 TS 和 JSDoc。

> 有些开发者认为，变量名含义到位了就不需要注释，我认为编辑器对类型和注释两者的支持必须兼得，自己爱用啥用啥。

后来找到个合适的答案, [Reuse TS @param comments](https://www.reddit.com/r/typescript/comments/ya73vi/comment/itapxpg/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button)

> That’s not necessarily true. **The type tells the what, but you may also want to give a description of the why for a param or a return value.** I agree that including the type in the jsdoc is unnecessary and is more prone to becoming outdated than the actual TS type, but jsdoc definitely still has a place alongside TS.

加粗的文字解释得很清楚了，类型只是来定义一个东西是什么，如果想具体描述这个东西才用 JSDoc。**声明类型的时候我只知道这个函数必要组成，声明函数的时候我才知道这个函数用来干啥**，类型只不过是函数的形状。也就是说，**复用注释**这个想法在理论上是不对的。

所以 JSDoc 应该写在声明函数的时候，而不是声明类型的时候。JSDoc 可以用来作为 TS 对注释不支持的补充。这样来看，他们两个是在定位上不同。

```ts
/**
 * 
 * @param a variable a
 * @param b variable b
 */
const sum: Fn = (a, b) => {
  return a + b;
}
```

注意这里没有用 JSDoc 来声明类型，函数类型显式地被声明。JSDoc 和 TS 各司其职。

回看 JSDoc 和 TS 的争议，他们两者仅仅是有类型这一交集。大部分 TS 开发完全可以用 JSDoc 来补充注释支持的短板，没有用了哪个就不能用哪个的说法。
