---
layout: "@layouts/MarkdownPostLayout.astro"
title: 不可变的 JS 字符串，操作起来有这么暴力吗
author: J10c
pubDate: 2024-04-12
tags:
  - programming
---
你以为 JS 中的字符串是不可变的，对于 JS 语言的使用者来说确实是这样，每次对字符串操作后，总是会创建一个新的字符串，占用新的内存空间。但是 v8 在底层实现中，对字符串的操作做了优化，字符串的概念发生了一些微妙的变化。

## 拼接操作

我们先从拼接两个字符串入手，逐步了解 v8 对字符串操作的优化方向，以及分析这种黑箱优化对开发的性能影响。

```js
const a = "a";
const b = "b";
const ab = a + b;
```

对我们开发者来说，`ab` 是一个全新的字符串。然而当 `a` 和 `b` 都特别长的时候，如果直接暴力地给这个新字符串分配内存，会有很大的开销（算上原来的两个子字符串，总共占用了双倍的内存），V8 就对这个场景做了优化。参考 [`v8/src/objects` 中对 `ConString` 的注释](https://github.com/v8/v8/blob/6813d83b76b725aaaeace8d377c2b602c6fd3c19/src/objects/string.h#L915-L923)

> The ConsString class describes string values built by using the addition operator on strings. A ConsString is a pair where the first and second components are **pointers to other string values**. One or both components of a ConsString can be pointers to other ConsStrings, **creating a binary tree** of ConsStrings where the leaves are non-ConsString string values.

v8 不管字符串长不长，只要是用 `+` 运算符拼接的，都用 `ConString` 来表示新字符串。同时 `ConString` 不是一个新的字符串，他记录了参与运算的两个字符串的指针。`ConString` 也可以由小的 `ConString` 和非 `Constring` 组合而成，最终的结构是一棵二叉树。

> 再回过头来看，`a` 和 `b` 是最普通的字符串，他们不是 `ConString`，而 `ab` 是。这样字符串就出现了两个不同的种类（在底层的结构也不同）

这样是不是省下了不必要的内存开销？当然，拼接字符串也可以通过模板字符串来做，但是 v8 没有对这样的操作做类似的优化。可能未来会有。

## 切片操作

加法吃到的红利后，减法也想要引用原字符串来优化内存。现在讨论 `slice` 方法，如果也用引用来处理的话，我们可以保存原字符串，和切片的两端索引。访问子串的时候，只需要给出原字符串在切片范围内的内容就行了。v8 源码中关于 `SlicedString` 的解释在[这里](https://github.com/v8/v8/blob/6813d83b76b725aaaeace8d377c2b602c6fd3c19/src/objects/string.h#L1023-L1033)

> A Sliced String is described as a pointer to the parent,
the offset from the start of the parent string and the length.

看上去好像不错？实际上当我们对一个很长的字符串切片的时候，得到的是一个很小的字符串，我们保存了结果的引用。但是这个小字符串在底层还引用着大字符串，这样 GC 就无法正常回收占用大内存的原字符串。

```js
const longString = "#".repeat(10_000);
const subString = longString.slice(50, 60);
```

这个缺点在源码中也有提到

> Currently missing features are:
> 
> \- truncating sliced string to enable otherwise unneeded parent to be GC'ed.

到这里总结一下，如果底层的操作都基于“可变“的原则来编写，那么结果是有利有弊的，在缩小的操作中，我们需要直接创建一个新的字符串，而不是复用原字符串。

## 字符串操作的性能优化

我们对创建两种不同字符串的方法做个命名

```js
const a = "a";
const b = "b";

const NotConString = `${a}${b}`; // Mutation

const ConString = a + b; // Concatenation
```

Concatenation 就是引用原字符串的方法，Mutation 则是创建一个完全新的字符串。我们希望在拼接的时候使用 Concatenation（当然 v8 默认就是这样实现，只要我们使用 `+` 来拼接），在切片的时候使用 Mutation（当我们调用 String.slice() 的时候，默认是 Concatenation，我们需要额外处理这个）

小字符串操作无所谓，怎么方便怎么来。在大字符串操作的场景下，对于拼接，尽量使用 `+`，对于切片，使用了 `slice` 方法之后，我们需要额外的释放掉原字符串的内存。可以使用其他的 Mutation 方法，比如说 `replace`。

```js
const longString = "#".repeat(10_000);
let subString = longString.slice(50, 60);

// 替换掉一个完全不存在的子串
subString = subString.replace("*".repeat(subString.length + 1), "")
```

这样可以强行复制切片后的子串内容，删除掉对原字符串的引用。

## 参考

- https://ysx.cosine.ren/optimizing-javascript-translate
- https://github.com/v8/v8/blob/main/src/objects/string.h
