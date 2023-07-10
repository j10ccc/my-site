---
layout: "@layouts/MarkdownPostLayout.astro"
title: 用 Docker 高效部署前端应用
author: J10c
pubDate: 2022-08-21
tags: ["programming", "deploy", "docker"]
---

## 废话写在前头

之前写 [Brisk-Tab](https://github.com/SummersDays/brisk-tab) 的时候，就有把个人的页面部署到服务器上，并经常访问，当时的方案是 **宝塔 + Nginx** 。~~因为操作傻瓜才用的，而且当时也不太懂运维这块~~

宝塔里面的 Nginx 一言难尽，部署 Node 应用成功与否还要看运气。近期又有一些项目要部署，刚好一个 hxd 前段时间接触过 Nginx，于是我就把服务器格掉，让他来帮我部署。

**结果这老司机在我的服务器上翻车了😂**

好吧，我不装了，其实我之前一直在看前端工程化的案例，~~但是迟迟没有动手操作。~~
Docker 使用 Nginx 镜像，做到上线环境和本地环境分离，这样就没有一些奇奇怪怪的文件权限问题了（老司机跟我解释这个是失败原因）

于是昨天晚上到了一个项目的 ddl 的前一天晚上，我就滚去学了 Docker。

## 故事开始

### 先上教程
一上手我就去  Google 上一顿乱搜。

> Docker 中有几个概念：
> -   **镜像（Image）**：Docker 镜像（Image），就相当于是一个 root 文件系统。比如官方镜像 ubuntu:16.04 就包含了完整的一套 Ubuntu16.04 最小系统的 root 文件系统。
> -   **容器（Container）**：镜像（Image）和容器（Container）的关系，就像是面向对象程序设计中的类和实例一样，镜像是静态的定义，容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等。
> -   **仓库（Repository）**：仓库可看成一个代码控制中心，用来保存镜像。

1. 先在本地装个 Docker 啦（本文以 macos 演示）
```shell
# macos
brew install docker

sudo docker --version
```

记得每次在命令行中启动容器前，先要打开 Docker.app

顺便在要部署的服务器（Linux）上也装一个
	
```shell
# linux 不限发行版 
curl -fsSL get.docker.com -o get-docker.sh
sh get-docker.sh

sudo docker --version
```

2. 然后在 React 项目根目录写个 `nginx.conf`。这是 每个镜像中 Nginx 的配置
```nginx
server {
  listen 80;
  server_name localhost;

  access_log /var/log/nginx/host.access.log  main;
  error_log  /var/log/nginx/error.log  error;

  location / {
    root   /usr/share/nginx/html;
    index index.html index.htm
    try_files $uri $uri/ /index.html;
  }

  # error_page  404              /404.html;
  
  error_page   500 502 503 504  /50x.html;
  location = /50x.html {
    root   /usr/share/nginx/html;
  }
}

```

3. 接下来要让 Docker 生成我们想要的镜像。先编写个 `Dockerfile`，写前端镜像构建的指令
```dockerfile
FROM node:16 # 第一阶段
WORKDIR /app
COPY . /app
RUN yarn && yarn build

FROM nginx # 第二阶段
COPY --from=0 /app/dist /usr/share/nginx/html
COPY --from=0 /app/nginx.conf /etc/nginx/conf.d/default.conf
```

编写 Dockerfile 有几个要注意的点
- `FROM`表示从官方仓库中使用镜像，本项目要用到 node 和 nginx 镜像来确保应用生产环境的运行依赖
- `COPY` 指令将当前文件夹拷贝到镜像的 `/app` 下
- `RUN` 指令在 docker build 时运行，每条 RUN 指令都会在 docker 上新建一层，这样会导致镜像的体积过大，所以代码中将两条 yarn 语句合并成一条
- `COPY --from 0` 表示把第一阶段编译好后的文件和 nginx.conf 复制到镜像的 nginx目录下方便调用

4. 之后我们开始构建镜像
```shell
sudo docker build -t app-name-image .
```
- `-t` 用来制定镜像名称

5. 最后使用改镜像生成一个容器，并将**容器**的 80 端口（`nginx.conf`中监听的就是80端口）映射到本地的 一个端口，这样访问本地的端口就能直接访问到容器中的应用了
```shell
sudo docker run -itd -p 8081:80 --name app-name-container app-name-image
```
- `-itd` 使 docker 在后台运行
- `-p ${本地端口}kk:${容器端口}` 映射端口
- `--name` 制定容器名称

### 常用命令
除了上文提到的 `docker run` 、`docker build`，还有一些常用的命令
```shell
sudo docker ps
# 列出所有正在运行的容器
# 这里可以显示一个容器的ID

sudo docker images
# 列出本地所有的镜像
# 这里可以显示一个镜像的ID

sudo docker stop ${container-id}
# 停止运行一个容器

sudo docker rm ${images-id}
# 删除某个镜像，但在删除前需要停止一个容器
```

## 给服务配上域名

众所周知，通过域名访问 HTTP 服务是默认访问80端口，但是我们的服务对应的是本地的8081端口，这样要通过**域名+端口**的方式才能访问到服务。这里可以在本地的 Nginx 上做一次端口转发，将特定的域名转发到指定的端口。

```nginx
# 宿主机的 conf.d/default.conf
server {
  listen 80;
  server_name site.example.com;

  location / {
    proxy_pass http://127.0.0.1:8081;
  }
}
```

```nginx
# https 服务

# 宿主机的 conf.d/default.conf
server {
  listen 80;
  server_name site.example.com;
  # 运行在本地就是 localhost

  return 301 https://$server_name$request_uri;
  # 这行的变量是通过 访问地址 自动解析的，原封不动抄下来就好
}

server {
  listen 443 ssl;
  server_name site.example.com;

  ssl_certificate /etc/nginx/cert/ssl_file.pem;
  ssl_certificate_key /etc/nginx/cert/ssl_file.key;

  location / {
    proxy_pass http://127.0.0.1:8081;
  }
}
```

- 若有用户第一次不加协议访问域名（HTTP），则转发到 301 接口，自动使用 HTTPS 协议
- HTTPS 服务默认访问 443 端口，第二个 server 里面做相应的配置
- 记得给 监听 443 端口的 server 添加证书路径

## 解决的疑问

> 之前问老司机：
> 1. 为什么域名访问 80 端口，服务器能提供不同的服务？
> 2. 不同的服务都开在 80 端口，不会端口冲突吗？
> 
>  老司机： 为什么你要问这么可(sha)爱(bi)的问题？

之前用宝塔，接触的是虚假的运维，当然啥都不懂。现在接触了 原生的 Nginx 之后，有点明白了

- 域名访问的 80 端口，实际上是访问了 Nginx 服务，宿主机运行着一个 Nginx，这个Nginx 通过你编写的配置文件，监听着 80 端口，当一个特定的域名访问了 80 端口，Nginx 会根据配置文件转发到另外一个端口。
- 80 端口只开着一个Nginx，当然不会冲突，其他端口同理。
- Docker 容器映射的本地端口不能冲突

## 大佬的反问

> 当我搞定一切后，老司机还是不服气之前的翻车。
>
> “我上次给你配的 纯 Nginx 部署前端，不比你这个方便？你非要兜个圈子搞套 Docker 来配置？？？小🔥汁玩的挺花啊。。。“

我不紧不慢得回答道：

**你服务器的环境能保证每个项目都编译成功？**

**你是不是新部署个项目就要加一个 server 重新填路径？**

**你是不是修改一次配置就要重启 Nginx？**

**上次因为不明原因翻车的是谁？**

~~老司机没坑声，但是我知道他还是不服~~

## 参考
- https://juejin.cn/post/7122708049122459662
- https://github.com/shfshanyue/simple-deploy
- https://www.runoob.com/docker/docker-tutorial.html
