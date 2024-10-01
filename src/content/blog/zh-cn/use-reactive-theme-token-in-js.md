---
layout: "@layouts/MarkdownPostLayout.astro"
title: 有多套 JS 主题色变量了？来看看如何优雅使用它们！
author: J10c
pubDate: 2024-06-30
tags:
  - programming
  - react
---
Web 开发中我们习惯了在浏览器中切换顶层 DOM 的 Class Name 来作为主题色的切换，这个方案依赖于 CSS 变量，更深入讲则依赖于浏览器实现的 CSS 规则。如果换个开发环境，换到了 React Native，或者其他不支持 CSS 的环境，那么主题色的切换就只能靠 JS 了。本文就是介绍如何使用 JS 实现一个优雅的主题色切换功能。

> [!Tip]
>  为了保证教程类文章的可读性，本文以“问题”来驱动思路的展现，先给出最终的实现效果，逆向推出实现思路。这也是阅读别人代码的正常方式。

## 如何定义优雅

在某个 React Native 仓库中我发现了这样的代码

```ts
// @filename: page.style.ts

import themeColor from "@my-charming-design/theme-color"
import StyleSheet from "@my-charming-design/style-sheet"

const createStyleSheet = () => StyleSheet.create({
  container: {
    backgroundColor: themeColor.Background
  },
  intro: {
    color: themeColor.Title
  }
})
```

```tsx
// @filename: page.tsx

function PageImpl() {
  const styleSheet = createStyleSheet();

  return (
    <View style={styleSheet.container}>
      <Text style={styleSheet.intro}>Hello word! (exactly)</Text>
    </View>
  );
}

export default function HelloWordPage() {
  return (
    <ThemeProvider>
      <PageImpl />
    </ThemeProvider>
  )
}
```

这段代码对应的两个样式(BackgroundColor & Color)，已经实现了 Light/Dark 主题的自适应。

乍一看就看到的简单之处

- 仅仅声明了一处 Context，消费了一处 `themeColor`。

而对比 RN 正常写法来细看

- 用了自己的 StyleSheet，并且没有在 FC 中直接消费，而是包了层函数，在 FC 中调用才得到实际的样式变量。

Context 用来共享 theme 状态可以理解，而声明样式的手段仅是写出对应的样式名称，样式代码只和样式名有关，和有多少套主题无关，这就非常简洁！整体的改动几乎没有。至此，这段 demo 就是本文讨论的优雅。

> [!Question] #1
> 为什么一个对象的属性，能代表出多种主题下的不同值？
> 
> 提示：例子中 `themeColor.Title` 的类型是 `string`，单独给 Title 拿出来能打印，能作为 inlineStyle。

## 统一多套样式到一处

第一道题的答案是对象的 getter 属性。

访问对象的一个属性，会触发 getter 函数，在里面判断出当前上下文是哪个主题，返回对应的样式就行。这里使用 Proxy 来实现。

```ts
// 这段代码为了展示清晰，改写了一些类型定义
const themeInstance = {
  mode: "light"
}

const dark = defineToken({
  Title: "#e4e4e4",
  Background: "#1f1f1f"
})

const light = defineToken({
  Title: "#101010",
  Background: "#ffffff"
})

const colors: Record<"light" | "dark", string> = {
  light,
  dark
}

const themeColor = new Proxy<ReturnType<typeof defineToken>> (colors[themeInstance.mode], {
    get: (_, key: any) => colors[themeInstance.mode][key]
})
```

从一个全局变量中 读取/修改 当前主题，之后访问 themeColor 的时候就能拿到最新的主题变量，主题色控制的部分差不多写完了，于是很轻松就写出了下面的最简 demo 来测试效果（`ThemeProvider` 和 `useColorMode` 的实现过于简单，就不详细展开了）。

```tsx
export default function ThemeProvider(props: { children: ReactNode }) {
  const { children } = props;
  const [mode, setMode] = useState("light");

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

```ts
function useColorMode() {
  const themeContext = useContext(ThemeContext);

  /**
   * 修改 context 中的 state，保证子组件重新渲染
   * 同事修改全局状态，保证 themeColor 能拿到最新值
   */
  function setColorMode(mode: string) {
    themeInstance.mode = mode
    themeContext.setMode?.(mode)
  }

  return {
    mode: themeContext.mode,
    setColorMode
  }
}
```

```tsx
function InlineStyleContainer() {
  const { mode, setColorMode } = useColorMode()

  function handleToggleColorMode() {
    if (mode === "light") setColorMode("dark")
    else setColorMode("light")
  }

  return (
    <>
      <section style={{ height: "100px", backgroundColor: themeColor.Background }}>
        <h1 style={{ color: themeColor.Title }}>Title: InlineStyle</h1>
      </section>
      <button onClick={handleToggleColorMode}>Toggle Color Mode</button>
      <div>Current color mode: {mode}</div>
    </>
  )
}
```

> [!Question] #2
> 真的成了吗？
> 
> 提示：组件已经包裹 ThemeProvider。ThemeProvider 中维护了一个 state，useColorMode 透传state 能力，并完成对全局主题变量的更新。

文章还要写下去，那第二道题的答案显而易见了。到底哪里不对？梳理一下，`themeColor` 取值的变化是因为组件重新渲染，重新渲染是因为 `ThemeProvider` 中触发了 state。子组件的主题样式更新，必须由顶层组件的更新触发，换句话讲，子组件没有能力感知主题状态的变化。

这下问题大了，子组件一旦包裹在 `React.memo` 中，并且 props 不包含主题变量，那这个组件的样式就不是自适应的了。

## 完成 真-响应式

拍脑袋一想，之前观察 demo 代码的两个点，有一个实现漏了。那就是 demo 自己实现了一个`StyleSheet`，在 FC 中还包裹着一层函数，调用后消费。

> [!Question] #3
> 为什么要在 FC 中消费，直接在 FC 外调用拿到值，或者干脆不包函数，在 FC 中直接消费值不行吗？
> 
> 提示：什么函数必须在 FC 中调用？

先猜测吧。hook 必须在 FC 中调用，猜测包了层函数只为在 FC 中调用 hook。回去看看[代码](#如何定义优雅)，`StyleSheet.create` 就是 hook，而上文的实现中和 hook 有关的只有个 `useColorMode` ，先思考仅用这个能不能解决问题。

先搭个架子

```tsx
function useThemeStyle<T>(style: T): T {
  useColorMode();
  // TODO: Question#4 答题占位
}

const StyleSheet = {
  create: useThemeStyle
}

export default StyleSheet;
```

> [!Question] #4
> 在 TODO 注释补完代码
> 
> 提示：把这个函数补完就能在 React.memo 中实现组件级别的响应式样式了

## 最后一百米

第四题答案很简单。先来梳理一下，这个 hook 就是 `create` 函数，返回值得是主题样式对象。函数的入参就是我们要返回的对象，似乎对入参做些处理就能返回了。

再来回顾问题，我们希望在主题变量 `mode` 变化后重新渲染一下 FC。create 是 hook，hook 中的 useColorMode 在主题变化的时候会触发 FC 渲染，hook 中只要调用了 `useColorMode` 就已经实现功能了。所以直接返回 `style` 就行了。

```diff
function useThemeStyle<T>(style: T): T {
  useColorMode();

+  return style;
}
```

眼见的同学发现了一个**加分项**，可以给 `mode` 拿出来，判断外层是不是包了 `ThemeProvider`，这样在独立的组件中直接使用 `StyleSheet.create` 就会有提示出现。

```diff
function useThemeStyle<T>(style: T): T {
  const { mode } = useColorMode();

+  if (!mode) {
+    console.warn("Please use theme in ThemeProvider.")
+  }
  
  return style;
}
```

到这里就实现完成了，具体的代码在我的仓库中能看到，[j10ccc/theme-token-demo-react](https://github.com/j10ccc/theme-token-demo-react)，里面有文中对应场景的 demo 可以调试观察。