---
layout: "@layouts/MarkdownPostLayout.astro"
title: 青训营 | Git-进化-团队协作开发
author: J10c
pubDate: 2022-06-15
tags: ["git"]
---

这是我参与「第三届青训营 -后端场」笔记创作活动的的第2篇笔记

# git 的作用

版本控制，简单的四个字却需要很多操作来实现它

原理是你修改代码并上传的时候，git 会找出 (diff) 修改后代码相较于上一个版本的修改内容，你实际上是在提交代码的修改。

通过记录每次修改，从而实现版本回退，版本合并等操作，同时能让每一次修改都有迹可循

# git 经常出现的几个概念

| 概念 | 解释 | 备注 |
| --- | --- | --- |
| 仓库 repo | 一个文件夹，存放代码的地方 | 有本地库和和远程库之分，一个本地库，可以关联到多个远程库 | 
| 代码托管平台 | 里面有千千万万个远程仓库 | 例如 Github, Gitlab |
| 远程 remote | 远程仓库的标识 | 默认的远程名是`origin`，可以随便取名，用于区分不同仓库 |
| 分支 branch | 文件夹的一个属性 | 默认为`master`，分支发生改变，文件夹中的文件也会改变 |
| 暂存区 | 在上传的代码的整个过程中，会先存到这里 | 这里的修改可以撤回，可以覆盖 |
| 提交 commit | 提交暂存区中的修改到本地库，并附上一小段话概括你干了啥 | 提交了就记为一个新版本，不允许修改了嗷 |

# 常见的命令

0. 创建本地 git 环境
    有两种方法，第一种是去下载已经存在的仓库的代码，第二种是先本地开个库然后绑定到远程库
    
    - 克隆远程仓库
    ```bash
    git clone $ssh_link
    ```
    
    此时的本地库会被创建，同时绑定到一个远程库，远程库名字默认为 `origin`
    > ssh link 就是以 .git 结尾的那个链接，在此之前你需要在代码托管平台认证你本地上传代码的设备的 ssh key，也就是认证这台设备是属于你的账号的
    
    > 不用纠结克隆特定分支要加什么参数，因为 clone 操作会获取远程库中所有的分支信息，之后再切换到想要的分支即可
    
    - 初始化仓库 / 添加远程库

    ```bash
    git init # 将该文件夹变成一个本地仓库(添加了 .git 文件夹)
    git remote add $remote_repo_name $repo_ssh_link
    ```
	
    添加远程可以添加多个，名字随便取，但是后期将本地库代码上传到远程的时候，要以名字指定上传到哪个远程库
    
1. 添加修改文件到暂存区

    ```bash
    # 添加指定文件
    git add ${filename}
    # 添加所有修改过的文件（git知道哪些文件发生了修改）
    git add -A
    ```

2. 查看暂存区中的内容
    ```bash
    git status
    ```
    
3. 提交暂存区所有内容到本地库

    ```bash
    git commit -m "$commit_info"
   ```
   commit 附加的信息是用自己的话来描述你此次提交修改干了啥，虽然是自己输入，但在团队开发中最好要有个[规范](https://www.jianshu.com/p/201bd81e7dc9)
    > commit 无结尾引号时，在结尾输入换行符会到下一行继续输入 commit，直到输入结尾引号再回车就能完成 commit

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f2402785d94145cc996b5027c112f38f~tplv-k3u1fbpfcp-watermark.image?)

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81a9afe01a5143669c2f1c6e18dcd3ad~tplv-k3u1fbpfcp-watermark.image?)
    
    
4. 查看 / 添加 / 切换分支

    ```bash
    git branch
    git checkout -b $new_branch_name
    git checkout $existed_branch_name
    ```
	通常地，项目的主分支是 `master`，同时也会添加一个开发分支`dev`，以及一些`feat-something`分支，一般的开发都会在在开发分支中提交修改，`feat`分支用于不同成员开发不同的功能
    
    
5. 查看当前分支下的所有 commit 

    ```bash
    git log
    ```
	
6. 合并分支
当一个功能基本上完善了之后，需要合并`fix`提交并

## 进阶操作

### 修改默认编辑器

在 Linux 上编辑器一般都是 nano，如果要改成 vim，则需要在`.git/config`添加

```config
[core]
    editor=vim
```

### 将当前分支的 commit 推送到远程库

要推送到 origin 库的**同名分支**下，push 后面不加任何参数，默认推送到 origin 库的同名分支下

```bash
# now in branch dev
git push origin dev

git push
```
### 拉取远程库最新的提交

如果远程库的当前分支的提交记录被更新了，但是本地却还是旧的版本，可以使用 pull 命令来更新（不是同步，本地库独有的提交记录不会被覆盖）提交，注意如果本地库有未完成的提交，需要先完成提交再进行 pull 操作
```bash
git pull
```

### 发起分支合并

在 feat 分支下完成了功能的开发可以将其合并到 master 分支

```bash
# now in branch feat
git checkout master
git merge feat
```

### 修改提交信息

打开编辑器，修改最近一次提交信息

```bash
git commit --amend
```

### 添加版本信息

前端项目可以结合 `child_process` 在 runtime 自动获取 git 提交版本信息，渲染到页面上

```bash
git tag $version_string
```

### 清理提交信息

`git rebase` 的作用是**清理、整合** commit 列表，在合作开发中有很重要的作用

> 这个操作非常危险，他能合并多条 commit 成一条，并且此操作时不可逆的，即无法查看每条 commit 到底修改了什么，各条 commit 信息都合在一起了，只能看到合并的这堆 commit 修改了什么。
	
下面列举了两个常见的场景：
1. 开发到一半，有换设备同步开发的需求，需要临时上传代码到远程库，这个时候 commit 信息就可以随便写点，到开发完了将无用的临时 commit 合并，正经写一次提交信息
2. 一个 feature 的开发需要多次 commit，但是将这么多的 commit 合并到主分支时显得有点繁琐，在主分支下可以合并多次的提交信息为一条 commit，当然 feat 分支仍然保存着每次 commit 的具体内容
3. 将没用的 merge commit 隐藏掉

[![jym56J.png](https://s1.ax1x.com/2022/07/10/jym56J.png)](https://imgtu.com/i/jym56J)
如图所示，我想要将`d576d7b` ~ `36f5e7e`这几次 commit 合并成一条 commit，则需要选择`36f5e7e`的前一条 commit `cb759ee`
> 注意，这些 commit 按照提交时间顺序排序，选择的那条 commit 一定是这几条中提交时间最早的

```bash
git rebase -i cb759ee
```
然后会打开 git 默认的编辑器，保持最早的 commit 前为`pick`，其他的都是`s`就行了，保存之后会引导编辑合并后的 commit 信息，将默认保留的提交信息注释掉，重新写即可

# 推荐

VSCode 上有 [Git graph](https://github.com/mhutchie/vscode-git-graph) 插件，可以直观的检查该项目的所有提交记录，分支信息，远程库，Tags等

[![jyEg2j.png](https://s1.ax1x.com/2022/07/10/jyEg2j.png)](https://imgtu.com/i/jyEg2j)
