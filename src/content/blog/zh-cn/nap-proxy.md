---
layout: "@layouts/MarkdownPostLayout.astro"
title: 用NAP访问无公网IP的树莓派
author: J10c
pubDate: 2020-02-03
tags: ["programming", "raspberry pi"]
---

你是否厌倦了puttty,Xshell的平庸外表，是否厌倦了在外地无法访问家中的树莓派，而运营商却死活不给固定IP，并且为树莓派买一个VPS大材小用而烦恼？本文提供了一种解决方案——使用较为经济的**nap**。

## 准备

### 安装ssh

Raspbian默认没有安装`openssh-service`，先用`putty`内网连接树莓派，使用`apt`安装`openssh-service`，完成后修改`sshd_config`

```sh
$ sudo vim /etc/ssh/sshd_config
#修改： #PasswordAuthentication yes 为： PasswordAuthentication yes
#修改： PermitRootLogin prohibit-password 为： PermitRootLogin yes
```

### 注册下载

先照着Napyy的[官方文档](https://napyy.com/blog/nap-tutorial/ "官方文档1")注册，下载arm客户端到树莓派，解压压缩包（本文解压到了根目录`/home/pi/nap_linux_arm`）

```sh
#结构目录
pi@raspberrypi:~ $ tree
.
└── nap_linux_arm
    ├── nap
    ├── nap.ini
    ├── nohup.out
    └── start.sh
```

## 尝试开启nap

```sh
$ ./nap
INFO[2020-01-19T21:44:48+08:00] login to server success
INFO[2020-01-19T21:44:48+08:00] proxy added: [tcp]
INFO[2020-01-19T21:44:48+08:00] start [tcp] proxy success
INFO[2020-01-19T21:44:48+08:00] forwarding napy.xyz:XXXXX -> 127.0.0.1:22
#如果出现上面这样的输出说明与主机连接成功
#下面检验是否成功穿透，当前终端让他运行着，打开另一个终端
$ ssh -oport={$REMOTE_PORT} pi@{$YOUR_HOST_ID}
#第一次连接会提示输入yes,接着输入密码就连接成功

```

## 配置启动脚本

在客户端目录下编写启动脚本`start.sh`

```sh
#!/bin/sh
cd /home/pi/nap_linux_arm #nap_linux_arm为客户端文件夹名
nohup ./nap & #使用nohup命令，使nap在后台运行
# 使用nohup命令，会在同级目录下创建nohup.out来打印命令输出
```

给`start.sh`添加权限

```sh
$ sudo chmod 777 start.sh
```

可以先运行脚本，如果后台无nap进程，请查看`nohup.out`分析错误原因。

将脚本文件添加到启动项中

```sh
$ sudo vim /etc/rc.local
#找到"exit 0"的上一行，插入:
/home/pi/nap_linux_arm/start.sh start
```

## 结束

重启树莓派，等一会儿（开机和启动nap要时间），终端输入`ssh -oport={$REMOTE_PORT} pi@{$YOUR_HOST_ID}`，根据提示输入密码即可成功连接，另外可以根据[官方文档](https://napyy.com/blog/nap-custom-domains/ "官方文档2")将`YOUR_HOST_ID`自定义为你自己的域名。

## 评语

个人使用nap连接有点延迟，如果在树莓派上码字就很不舒服（应该没人在这上面写代码）,别问我为什么要用nap，问就是包不起VPS。。
