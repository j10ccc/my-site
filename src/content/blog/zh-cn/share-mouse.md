---
layout: "@layouts/MarkdownPostLayout.astro"
title: Windows和Linux共享蓝牙鼠标
author: J10c
pubDate: 2020-01-16
tags: ["linux"]
---

## 前言

当一台电脑同时安装了Windows&Linux双系统（本文以Deepin15.11为例）时，每当切换到另一个操作系统，蓝牙鼠标便需重新配对，十分不方便。

这是因为蓝牙设备有一个配对密钥，计算机必须有这个密钥，才能与蓝牙鼠标配对。而两个操作系统上保存的配对密钥不同，因此每次切换系统都需要重新配对。

我们要做的便是设法令两个操作系统对蓝牙鼠标存有相同的配对密钥。

## 流程

1.  在Linux中删除已配对的蓝牙鼠标并找到获取连接密钥
2.  在Windows中修改原密钥并配对蓝牙鼠标
3.  重启至Linux

### 1. 在Linux中配对

这一步前提是在Windows下，蓝牙鼠标可以正常使用。

重启至Linux，在系统设置中连接蓝牙鼠标`设置-- 蓝牙--开启--扫描设备--连接`

完成后，蓝牙鼠标在Linux系统中应该可以正常使用了。无论重启/待机，配对都不会丢失——除非再次按下了配对按钮。

### 2.获取Linux中的配对密钥

Linux将蓝牙设备的配对信息存放在 `/var/lib/bluetooth/{计算机的蓝牙MAC}/{蓝牙设备的MAC}/info`中，需切换到root用户访问`/var/lib/bluetooth`。

```sh
$ su #切换到root用户，如果你是第一次使用root账户，那首先要重设置root用户的密码
$ cd /var/lib/bluetooth/{计算机的蓝牙MAC}/{蓝牙鼠标的MAC}
$ cat info
```

找到以`Key=`开头的一行，后面的便是配对密钥。将其记录下来。

如果`/{计算机的蓝牙MAC}/`下有多个蓝牙设备MAC目录，可根据每个目录中info文件中的Name=开头一行判断哪个是蓝牙鼠标。

### 3.修改Windows中的配对密钥

重启至Windows，Windows系统将蓝牙设备的配对密钥存放于注册表的`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\BTHPORT\Parameters\Keys\{本机的MAC}`，但这个路径无法直接用`regedit.exe`查看或编辑，下面有一种解决方法：

1.  通过此链接下载PsTools
    
2.  解压后，将其中的PsExec.exe扔到`C://Windows//System32`
    
3.  在有管理员权限的Powershell中，运行注册表编辑器:

```fallback
PsExec.exe -s -i regedit.exe
```

4.  手动进入`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\BTHPORT\Parameters\Keys\{蓝牙鼠标的MAC}`，找到右侧名称与蓝牙鼠标MAC一致的项目，将其数值改成之前记录下的配对密钥。
5.  开关一次飞行模式，或将蓝牙关闭再打开，便可正常与蓝牙鼠标配对。

## 结语

至此，如无意外，只要不再次按下配对按钮，蓝牙鼠标与两个操作系统的配对都不会丢失——无论重启/待机/切换系统，蓝牙鼠标都能在启动后直接使用。
