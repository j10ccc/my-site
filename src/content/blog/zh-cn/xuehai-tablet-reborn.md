---
layout: "@layouts/MarkdownPostLayout.astro"
title: 毕业之后关于学海平板的处置
author: J10c
pubDate: 2021-06-21
tags: ["android"]
---

高中毕业学海终于给平板解 MDM 了，备份好以前的课件和照片后，马上准备双清然后 root （这Android9 动画bug太多了。。

> A：为什么要 ROOT ？
> 
> B：这 3G RAM 的平板日常怎么用？！

本文应该是全网首发，嘿嘿~

## 开始前注意

1.  本文参考[XDA前辈的文档](https://forum.xda-developers.com/t/samsung-galaxy-tab-a-8-0-2019-with-s-pen-lte-sm-p205-root-achieved-howto.3971209/)，并结合网络上各类教程做了大量改动
    
2.  刷机前请备份好重要资料，可以下个S换机助手备份
    
3.  学海解锁后，国行系统ota更新不更新随意
    
4.  想好刷什么系统，国行最新 Android9 ，港版 Android11（下图），~~国行原味省电，港版卡的一🖊（虽然优化后还过得去，UI比较现代化）~~
    
5.  港版 Android11 **无法降级**，所以选择 ROM 时请谨慎
    
6.  解锁 Bootloader 后每次开机会出现警告，强迫症介意请别 ROOT
    
    ![6bbp2S.png](https://cdn.j10ccc.xyz/static/blog/6bbp2S.png)
    

## 准备&约定

1.  SM-P200设备一台，系统 Android9
2.  [晨钟酱三星工具箱](https://jamcz.com/sambox.html)
3.  [固件下载器hadesFirm 0.3.6.1](https://m.samsungmembers.cn/thread-1030503-4-473.html?ivk_sa=1024320u)

## 开始

### 下载固件

开 hadesFirm，型号 SM-P200 ，国行区域CHN（港版TGY），检测更新，如图设置，点击下载（下得挺快的，比某mobile快多了

![G7Jo8Q.png](https://cdn.j10ccc.xyz/static/blog/G7Jo8Q.png)

下好之后解压，有 AP，BL，CSC，HOME_CSC开头的4个文件

### 刷机前准备

1.  平板解锁开发者选项，打开**USB调试**
    
2.  USBA连接电脑（不要Type-C连电脑！）打开晨钟工具箱，被检测到进入软件页面后，就算连接成功了
    
    ![MRQxLo.png](https://cdn.j10ccc.xyz/static/blog/MRQxLo.png)
    
3.  点击**下载端口驱动**，解压安装就行了
    

### 开始刷机

1.  点击**打开Odin刷机工具**，根据弹出提示清除所有账户（如果有），如果驱动安装成功的话中间一排小格（可能不是第一格）显示蓝色（如果不是，请重启电脑）并且 Log 中输出`Added!`，这样表示平板被Odin检测到了
    
    ![5ai4M5.png](https://cdn.j10ccc.xyz/static/blog/5ai4M5.png)
    
2.  Odin中选项切换到 Opinions ，取消选择 Auto Reboot
    
3.  其他不用更改，如图导入文件(BL导入BL开头文件，AP导入AP开头文件，CSC导入CSC开头文件，HOME_CSC文件暂时用不到)
    
    ![Z7kbwL.png](https://cdn.j10ccc.xyz/static/blog/Z7kbwL.png)
    
4.  保持连接电脑，重启平板，在黑屏的时候按住 **音量+** 和 **音量-**，进入 Download Mode，根据提示短按音量上进入刷机模式（看到这界面突然发怵不敢刷的，可以长按 **音量-** 和 **关机键** 重启回系统）
    
5.  点击 Start 开始刷机，如果中途出现失败（Odin 中 Log 中出现`Fail`），点击 Restart 重刷，或者换线、换电脑另一个USB插口重刷（失败后虽然不能进入系统，但是平板连接电脑依然能被Odin检测到），成功之后会显示一个绿色的大大的 **PASS**
    

### 准备ROOT

只想体验港版 Android11（ OneUI 3.1 ）的小伙伴到这里就可以结束了，国行 Android9 或者 港版 Android11 想 root 的接着看

1.  设置向导随便弄点，到时候还要清空数据，设备连接互联网（应该不用科学上网，最近移动宽带放的有点开，说不准要不要翻墙）
2.  下载并安装 [Magisk Manager最新版](https://github.com/topjohnwu/Magisk/releases)，导入刚才的AP开头的文件到平板文件目录任意位置
3.  打开 Magisk Manager ，在 `Magisk` 那块点击安装，接着选项栏里`安装到Recovery`不要勾，点击下一步，方式选择`选择并修补一个文件`，然后选择导入的AP开头文件，等他修补完成，会在设备根目录下的 Download 文件夹下生成 patched文件，重命名为`magisk_patched.tar`，导入到 PC电脑

### 解锁Bootloader

1.  设备打开开发者选项中的**OEM解锁**，重启至 Download Mode ，根据设备提示，长按 **音量+** 进入解锁界面，然后短按解锁 Bootloader
2.  解锁后设备自动重置，正经地完成设置向导，进入系统先重新安装 Magisk Manager
3.  打开设置，解锁开发者选项，保证OEM解锁选项还存在，如果发现OEM解锁不见了（至少在 Android11 上是这样的），请下载**crom1.08**，Android11 打开闪退，然后重启，即可看见OEM是开着的，并且是灰色的（这里感谢 酷安网友@EdwardW 的实测，不然我也不确定这个是不是巧合）

### 开始ROOT

1.  从晨钟工具箱中打开 Odin ，跟之前一样关闭 Auto Reboot ，BL选择BL开头的文件，**AP选择刚才修补的`Magisk_patched.tar`** ， **CSC选择HOME_CSC开头的文件**，点击 Start，刷好之后进入系统即是 ROOT 状态
2.  打开 Magisk Manager ，会显示修复Magisk，点击修复即可

## 尾声

至此学海平板 SM-P200 的 ROOT 教程到此结束，ROOT后干嘛不用我多说，~~Scene，LSPosed跑起来！！~~，ROOT给的权限卸载系统应用能让系统更加省电，流畅。

有几个遗憾：Scene因处理器冷门无调度方案，充电详细信息无法读取，优化后内存平均占用2.1G（比 Android9 多了0.4G，别说我不会优化！从 Moto 到 Pixel 玩机经验还是很足的），每次通知栏下拉会卡 600ms（可能动画就这样 ~~每看到这个血压马上上来了~~）

精简One UI，给这台~~高价低配的~~平板一个清楚的定位——Notebook，用户应用仅留下三星笔记（Spen延迟极低，不知道 Android9 延迟怎么样），Autodesk SketchBook，WPS Office，via浏览器（实测一点都不卡）。

也许，当今社会下，被性能制约的平板才是真正的生产力工具！
