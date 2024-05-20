---
layout: "@layouts/MarkdownPostLayout.astro"
title: 给文章页添加 vim 键位的滚动快捷键
author: J10c
pubDate: 2024-05-20
tags:
  - programming
  - vim
---

了解到知乎的回答页支持类似 vim 的按键操作之后，马上给博客复刻了一个。 这次的类 vim 按键机制的实现，不仅仅是只支持声明出来的特定按键，而是实现了一套状态机制，来兼容 vim 的按键逻辑。

文章从最简单的单按键逻辑开始，再到考虑按键的组合，一步步构造出类似 vim 的组合按键的管理体系。

## 单按键场景

编辑器里面最常用的场景就是控制光标上下行移动，在 vim 里面是用 `j` 和 `k` 来控制的。那么在我们博客的文章页中，我希望通过这两个按键来实现页面的上下滚动。不难写出这样的代码

```ts
let isScrolling = false; // 滚动状态标志
const scrollAmount = 12; // 每次滚动的像素值
const scrollInterval = 16;
let scrollTimer: number; // 定时器

// 按下按键开始滚动，支持长按
document.addEventListener("keydown", function(event) {
  if (event.key === "j" || event.key === "k") {
    if (!isScrolling) {
      isScrolling = true;
      scrollTimer = setInterval(() => {
        window.scrollBy(0, scrollAmount * (event.key === "j" ? 1 : -1));
      }, scrollInterval);
    }
  }
});

// 松掉按键
document.addEventListener('keyup', function(event) {
  if ((event.key === "j" || event.key === "k")&& isScrolling) {
    clearInterval(scrollTimer);
    isScrolling = false;
  }
});
```

这样子确实是实现了逻辑，但是如果要支持更多的按键，我们要声明更多的监听器？如果只声明一个监听器，那么 callback 中对每种按键都有一个特殊的判断，会让代码不可维护。更别说在这个控制滚动的例子中，为了支持长按，`keydown` 和 `keyup` 两个回调函数中的逻辑是耦合的。

我们得重新考虑，设计一套按键触发回调的系统。我第一个想到的是可以考虑用发布订阅模式来实现，这样能实现回调函数的逻辑解耦。但是我们的目标不仅于此，考虑到 vim 中还有按键组合触发的操作（顺序地按下多个按键之后才触发回调），如 `gg` 回到文件顶部，我们还得设计一套机制来控制 **按下了一个按键之后，是要触发回调，还是再等下一个按键按下后再执行回调**。

## 多按键命令式场景

以顺序按下 `gg` 回到页面顶部为例，我们开始进入的核心设计部分。

先提供一个操作顺序，来明确我们要实现的效果

1. 按下 `j` 页面向下滚动一段距离
2. 按下 `g` 无事发生
3. 再按下 `g` 页面滚动到顶部
4. 按下 `j` 页面向下滚动一段距离
5. 按下 `gjg` 无事发生 

逻辑不复杂，我们在消费侧声明我要支持的按键（组合），以及触发之后的回调，这些按键组合和回调在我们的控制系统中保存着。消费侧大概像这样子使用

```ts
const keyHandler = new VimModeKeyHandler();

keyHandler.subscribe("gg", handleLeapToTop);

// 加一个 hook 来支持长按结束后的回调
keyHandler.subscribe("j", handleScrollDown, {
  onKeyUp: handleStopScroll
});

keyHandler.start(); // 开始监听
```

控制系统维护一个栈，表示历史上**按下过，但是没有被触发**的按键。每当控制系统监听到有按键按下的时候，把栈里面的所有按键和新按键拼接起来，看看有没有匹配到业务方声明的按键组合。匹配的逻辑如下

- 匹配到前缀（例子中我们声明了 `gg` 两个按键连续按下才触发回调，匹配前缀的意思是我们监听到了第一个 `g` 被按下），我们就把新按键入栈，不触发回调，继续等待下一个按键按下。
- 完全匹配（举个例子，如果有声明 `gg` 和 `gga`，那么按下 `gg` 后会匹配到前者，后者会被忽略）

## 发布订阅的基础逻辑

初步先实现最简单的发布订阅。不考虑 vim 命令机制的细节，只做监听事件的挂载和销毁，以及兼容消费侧的调用方式。

这里定义订阅者的数据结构，还有事件处理函数

```ts
interface Listener {
  /** 命令 */
  cmd: string;
  /** 回调函数 */
  callback: string;
}

// 事件处理函数支持两种事件就够了
interface EventHandler {
  keydown: (e: KeyboardEvent) => void;
  keyup: (e: KeyboardEvent) => void;
}
```

接下来实现发布订阅模式的整体。设计上是执行了 `start()` 方法之后，才会开始监听键盘事件。

```ts
export default class VimModeKeyHandler {
  private listeners: Array<Listeners>;
  private eventHandler: EventHandler;

  constructor() {
    this.listeners = [];
    this.eventHandler = {
      // 注意这里箭头函数内部的 this 指向
      keydown: () => { /** TODO */ },
      keyup: () => { /** TODO */ },
    };
  }

  public start() {
    document.addEventListener("keydown", this.eventHandler.keydown);
    document.addEventListener("keyup", this.eventHandler.keyup);
  }

  public destroy() {
    document.removeEventListener("keydown", this.eventHandler.keydown);
    document.removeEventListener("keyup", this.eventHandler.keyup);
  }

  public subscribe(
    cmd: string,
    callback: () => void,
    options: {
      onKeyUp?: () => void
    } = {},
  ) {
    this.listeners.push({ cmd, callback, ...options });
  }
}
```

这里单独把 `eventHandler` 声明出来，保存回调函数，而不是直接把回调函数写在 `addEventListener` 中，是为了方便后续销毁事件。

`eventHandler` 的实现中，还有一点实现要注意。就是事件回调函数内部的 `this` 指向。

```ts
this.eventHandler = {
  [someEventName]: () => { /** TODO */ },
}
```

`eventHandler` 的每个事件回调函数中，我们预期会使用 class 中的一些属性，比方说我们保存每个历史按键的栈（尽管现在还没实现）。在 `start` 函数中，`eventHandler.[eventCallback]` 会被作为回调函数，传给 `addEventListener`。如果回调函数的 `this` 没确定下来，那么将无法访问类中的变量了。所以这里用了剪头函数来声明，函数中的 `this` 指向类本身。

当然你会想到用 function 来声明回调函数，然后 `addEventListener` 的时候用 `bind` 来修改 `this` 指向。但是别忘了，这样会生成一个新的函数作用域的函数，会给销毁函数 `destory` 的实现增加难度。

```ts
// 不推荐的写法
class VimModeKeyHandler {
  constructor() {
    this.eventHandler = {
      keydown: function () { /** TODO */ },
    };
  }

  public start() {
    // 创建了一个新的函数
    document.addEventListener("keydown", this.eventHandler.keydown.bind(this));
  }
}
```

## `keydown` 中的逻辑

这部分是机制的核心实现。这部分逻辑概括着来说就是，实现历史按键序列，和已声明的命令匹配的逻辑。

先给类加上个 `stack` 属性，用来保存历史按键记录。

```ts
class VimModeKeyHandler {
  // ...
  private stack: string[];

  constructor() {
    // ...
    this.stack = [];
  }
}
```

 实现匹配逻辑，有三种匹配结果。

| 匹配状态 | 描述                       | 触发逻辑<br>                             |
| ---- | ------------------------ | ------------------------------------ |
| 完全匹配 | 有条命令和输入序列一模一样。           | 执行订阅者的回调函数，然后退出寻找匹配的循环。清空历史输入序列。<br> |
| 前缀匹配 | 当前历史输入序列是某个命令的前缀。        | 设置个标记，标记存在这样的命令，继续循环，尝试寻找完全匹配。       |
| 匹配失败 | 表示历史输入序列是非法的，连一个前缀匹配都没有。 | 清空历史输入序列。                            |

```ts
this.eventHandler = {
  keydown: (e) => {
    this.stack.push(e.key);
    const toMatch = this.stack.join("");

    let hasMatchedPrefix = false;
    for (const listener of this.listeners) {
      if (listener.cmd.startsWith(toMatch)) {
        hasMatchedPrefix = true;
        if (listener.cmd === toMatch) {
          listener.callback();
          this.stack = [];
          break;
        }
      }
    }
    if (!hasMatchedPrefix) this.stack = [];
  },
};
```

在录入按键的时候，我们是把按键作为文本放进历史输入序列中。这里还可以做些操作来兼容组合键的输入，例如区分大写字母 A `shift+a`，或者其他的组合键。你可以把他们标记上特殊的符号，同时修改匹配函数，这样就能兼容更多样的输入组合。

到这里我们实现了最基本的 `keydown` 功能。

## `keyup` 中的逻辑

需要用到 `keyup` 的情况很少，上面提到了要兼容按键长按。

> 我猜测 vim 中应该是没有处理长按的逻辑的。长按应该也是被按照键入阈值来分割成多个按下事件。

我们可以粗暴地比较 `event.key` 和 声明的命令，把 `keyup` 事件给到订阅者，不再处理历史序列的匹配（因为长按是一次单键，或者是一次组合键，没有序列的概念了）。

```ts
this.eventHandler = {
  keyup: (e) => {
    for (const listener of this.listeners) {
      if (typeof listener.onKeyUp === "function" && e.key === listener.cmd) {
        listener.onKeyUp(e);
      }
    }
  }
};
```

```ts
function handleStopScroll() {
  if (isScrolling) {
    clearInterval(scrollTimer);
    isScrolling = false;
  }
}

keyHandler.subscribe("j", () => handleScroll("down"), {
  onKeyUp: handleStopScroll
});
```

到这里我们基本实现了 vim 的按键机制，我博客中的实现在这里

[Github - @j10ccc/my-site/src/scripts/vim-mode/key-handler.ts](https://github.com/j10ccc/my-site/blob/main/src/scripts/vim-mode/key-handler.ts)
