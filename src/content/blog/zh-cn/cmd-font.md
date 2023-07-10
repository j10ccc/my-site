---
layout: "@layouts/MarkdownPostLayout.astro"
title: 对Windows终端的新宋体说拜拜
author: J10c
pubDate: 2020-02-06
tags: ["programming"]
---

## 背景

这几天因为疫情，学校在网上开课，但我又刚买了2只舵机，得在树莓派上先搭建好环境，于是就一边上课一边搭建，因为网课限制Windows平台，所以使用`git`连到了树莓派，但是我发现了一个严重的问题——cmd的字体不是等宽的！

[![](https://s2.ax1x.com/2020/02/16/39VeL6.png)](https://s2.ax1x.com/2020/02/16/39VeL6.png)

默认的新宋体

不得不承认的是，在中文环境下，PowerShell 默认 的「新宋体」确实很（zhen）不（ta）耐（ma）看（chou）。然而由于默认 PowerShell 终端是一个非常底层的应用，其界面甚至没有使用通用 UI 渲染框架来实现，而是直接调用底层 Windows API 来实现，因此其字体要求非常严格。这也是我们不能将任意一个等宽字体替换上去的原因。

> The fonts must meet the following criteria to be available in a command session window:
> 
> -   The font must be a fixed-pitch font.
> -   The font cannot be an italic font.
> -   The font cannot have a negative A or C space.
> -   If it is a TrueType font, it must be FF_MODERN.
> -   If it is not a TrueType font, it must be OEM_CHARSET. Additional criteria for Asian installations:
> -   If it is not a TrueType font, the face name must be “Terminal.”
> -   If it is an Asian TrueType font, it must also be an Asian character set.

微软对 cmd / Powershell 字体的限制

## 两种字体

虽然要求很严格，但仍然有一两款比较好的字体能兼容 Powershell / cmd ：

1.  [Microsoft YaHei Mono](https://github.com/yakumioto/YaHei-Consolas-Hybrid-1.12)
2.  [更纱黑体](https://github.com/be5invis/Sarasa-Gothic/releases)

Microsoft YaHei Mono 是微软为 [Ubuntu on Windows](https://www.microsoft.com/zh-cn/p/ubuntu/9nblggh4msv6?activetab=pivot:overviewtab#) 设计的一款等宽字体，正好可以拿来给自家的Powershell用，但是它渲染的汉字却有些奇怪。

[![](https://s2.ax1x.com/2020/02/16/39VneK.png)](https://s2.ax1x.com/2020/02/16/39VneK.png)

Microsoft YaHei Mono

更纱黑体较圆润的 Microsoft YaHei Mono，更为修长。

[![](https://s2.ax1x.com/2020/02/16/39VudO.png)](https://s2.ax1x.com/2020/02/16/39VudO.png)

更纱黑体

[![](https://s2.ax1x.com/2020/02/16/39VZsx.png)](https://s2.ax1x.com/2020/02/16/39VZsx.png)

两种字体在同字号（28）下渲染汉字对比

仔细看可以发现 Microsoft YaHei Mono 因为渲染的字符相对较大，所以显示得更清晰，而更纱黑体却有些发虚（1080P截图），但对汉字的结构尺寸方面更纱黑体控制得更好，Microsoft YaHei Mono 渲染的汉字笔画粗细不均。

## 评语

个人更喜欢更纱黑体，不喜欢 Microsoft YaHei Mono 对汉字的渲染。

如果有觉得Windows下字体发虚想修改系统的全局字体（微软雅黑）的，建议屏幕**2K分辨率以上**的使用 MacType。~~1080P的就省省吧，越改越发虚~~

最后讲个笑话，微软自己出的 Windows Terminal，应用商店的软件截图中，Terminal 使用的字体是 FiraCode 。。
