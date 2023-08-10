---
layout: "@layouts/MarkdownPostLayout.astro"
title: 武装到牙齿的 Vim - React配置篇
author: J10c
pubDate: 2022-06-21
tags: ["programming", "vim"]
---

![jrcBy4.png](https://cdn.j10ccc.xyz/static/blog/jrcBy4.png)
## Feature

- JSX / TSX 语法检测(TSServer/ESLint)，不亚于 VSCode 的补全体验
- 方便且全面快捷键操作，包括 Buffer, Tab, Window 切换，Tmux window 创建与切换
- 完整的文件管理方案
- Markdown 的深度适配
- 其他语言代码有基本的编辑器能力支持

## tmux

```sh
# set -g default-terminal "xterm-256color"
# set -ga terminal-overrides ",*256col*:Tc"
# set -ga terminal-overrides ",xterm-256color:Tc"
# action key
**
unbind C-b
set-option -g prefix C-t
set-option -g repeat-time 0

# vim-like pane switching
bind -r k select-pane -U
bind -r j select-pane -D
bind -r h select-pane -L
bind -r l select-pane -R

# 
```

- `C-T` + `P(N)` switch previous (next) window
- `C-S-Left(Right)` move window in status bar
- `C-T` + `C`  create window
- `C-T` + `H(JKL)` swich focus
