---
layout: "@layouts/MarkdownPostLayout.astro"
title: Fiddler | 抓取学习平板上的作业答案
author: J10c
pubDate: 2020-03-13
tags: ["programming", "fiddler"]
---

> 本文所有涉及个人隐私内容均已打码，如有观看不便，敬请谅解。

## 背景

~~这一切得从一只蝙蝠说起。~~ 学校上学期发了一个三星学习平板，装载着与 **知名教育公司[学海](https://baike.baidu.com/item/%E5%AD%A6%E6%B5%B7%E6%95%99%E8%82%B2/5666012?fr=aladdin)** 深度定 (p) 制 (y) 的 [”智通云系统“](https://www.zjxhedu.com/) ，网课作业都在这上面布置，并且还在这上面举办大型考试， ~~这让我这天天上课摸鱼的烂头怎么活？~~ 当第一次考试失利后，我突然想到可以用 Fiddler 去获取电子试卷的题目，说不定连答案也可以抓到！抱着尝试的心态，我点开了 考场APP**云作业** …

## 准备

Fiddler 4，学习平板一台

## 环境配置

1.  打开Fiddler，设置代理端口。 ![8usH54.png](https://cdn.j10ccc.xyz/static/blog/8usH54.png)
    
2.  依次点开开学习平板`设置-连接-WLAN-当前网络-高级设置-代理服务器-无—>手动` 代理主机名填运行 Fiddler 的电脑的内网IP，端口填`8888`，点击保存。 这时候在平板上随便打开一个APP，刷新两下看看Fiddler里面有没有请求或者响应信息出现。
    

## 开始抓包

1.  平板HOME 界面长按 云作业APP ，点击**清除数据**，清除完成后，打开云作业，同时密切关注 Fiddler 的请求列表。
    
2.  当云作业首页加载得差不多的时候，一次双击点开 Fiddler 中各个数据包，选择右侧窗口的 `TextView` 查看每个数据包的详细内容，如果发现有一个数据包的内容特别长（由滚动条可以看出）那么它就是我们要找的那个包，点击右下角的`View in Notepad`，保存这条数据信息。
    
    ![8usLG9.png](https://cdn.j10ccc.xyz/static/blog/8usLG9.png)

## 分析数据

对这条数据仔细分析一下，不难发现里面有很多已经出现在云作业APP中的作业名称，而且几乎每个作业信息的格式都是一样的。

```json
   {
     "workId": "${WORKID}",
     "studentWorkId": "${STUDENTWORDID}",
     "teacherId": "${TEACHERID}",
     "haveSeen": 0,
     "name": "${NAME}", //作业名称
     "postscript": "${POSTSCRIPT}",
     "createTime": "${CREATEIME}", //单位:ms
     "updateTime": "${UPDATETIME}",
     "uptoTime": "${UPTOTIME}",
     "subject": 1,
     "schedule": 1,
     "period": 103,
     "score": 0.0,
     "selfScore": 0.0,
     "emendNum": 0,
     "contentUrl": "http://xhfs2.oss-cn-hangzhou.aliyuncs.com${ADRESS}.txt",
     //此处省略多行
     "inputAssociate": 1,
     "preDownloadUrls": null,
     "publishTime": 0
   }
```

我抓的明明是作业的信息，可是为什么一个题目都没有显示？

令人好奇的是，每条作业信息中`contentUrl`属性值为一个 URL ，指向的是一个 TXT 文件，我下载来一看

![8usxr6.jpg](https://cdn.j10ccc.xyz/static/blog/8usxr6.jpg)

**入眼的是满满的答案啊！**

```json
   {
     "isCustomScore": false,
     "lectureInfoList": [],
     "questionAnswers": [
       {
         "answerContent": "A",  //答案
         "answerContentType": 2,
         "index": 0,  //此值可以为1,2,3...表示同一题的多个答案
         "inputType": 1,
         "keyboardType": "",
         "optionNum": 4,
         "orgIndex": -1,
         "questionId": "${QUESTIONID}",
         "score": 20000  //分数，单位:10^-4分
       }
       
       //此处省略多行
     ],
     "questionPoolContentInfos": [
    	{
         "bookId": "${BOOKID}",
         "catalogId": "${CATALOGID}",
         "checkType": 0,
         "deleteType": 0,
         "difficulty": 0,
         "drawingUrl": "",
         "errorRate": 0,
         "explainContent": "${EXPLAINCONTENT}", //题目答案解析
         "explainContentType": 0,
         "isAllDoFlag": 1,
         "isEncrypt": 0,
         "isTitle": 0,
         "isWrongQuestion": 0,
         "listeningUrl": "",
         "lockInputType": 0,
         "parentQuestionId": "${PARENTQUESTIONID}",
         "questionId": "${QUESTIONID}",
         "questionLayoutType": 1,
         "questionSystemType": 6,
         "questionUserType": 6,
         "stemContent": "${STEMCONTENT}", //题面
         "stemContentType": 0,
         "subject": 2,
         "totalScores": 40000, 
         "verifyStatus": 0,
         "workRollVersion": 0
       }
       //省略多行
      ]
   }
```

不仅有答案，还有题目和题目解析，看来这个月的作业和考试都不愁了，哈哈哈哈哈

## 导出答案

我写了一个 Python3 脚本 :

```python
# -*- coding: utf-8 -*-

'''
    运行环境：
    Linux Ubuntu18.04 WSL，需要安装wget
    代码有BUG，多选题答案的各个答案会被当做多道单选题的答案
'''
import re
import sys
import os,glob

ans = []
subjectlist = ['语文','数学','英语','物理','政治','技术']
def save_to_file(ans):
    filename = "[ANS] " + fn
    f = open(filename,"w")
    f.writelines(ans)
    f.close()
    print("Finished creating ANSWER!")
	
def process(filename):
    n = 0
    file = open (filename,"r")
    for eachline in file.readlines():
        if eachline[:22] == '      "answerContent":':
            n = n + 1
            mystr = eachline[23:]
            #mylist = eachline.split(':')
            '''			
            if "image/png;base64,"  in mystr:
            		mystr = "data:" + mystr
            '''
            if n <= 9:
                everyans = "0" + str(n) + ".  " + mystr
            else:
                everyans = str(n) + ".  " + mystr

            global ans
            ans.append(everyans)

        if eachline[:31] == '  "questionPoolContentInfos": [':
            save_to_file(ans)
            break

if __name__ == "__main__":
    dataurl = input("Please input downloadURL: ")
    os.system("wget " + dataurl)
    list1 = dataurl.split('/')
    global fn
    fn = list1[-1].strip()
    print("1.语文 2.数学 3.英语 4.物理 5.政治 6.技术")
    global subject
    subject = int(input("Please input subjectnum: "))
    fn = "[" + subjectlist[subject-1] + "] "+ fn[:4] + "..." + fn[-8:]
    print("---------" + fn + "---------")
    os.rename(list1[-1].strip(),fn)
    process(fn)

```

此脚本会下载答案文件，并自动提取答案

### 使用方法

1.  输入答案下载链接（形如`http://xhfs2.oss-cn-hangzhou.aliyuncs.com/${ADRESS}.txt`）
    
2.  下载完毕后，输入答案相应的学科编号，答案即刻生成。
    
    ![8usO2R.png](https://cdn.j10ccc.xyz/static/blog/8usO2R.png)

```sh
$ ls
'[ANS] [政治] 1234...abcd.txt'  '[政治] 1234...abcd.txt'
# [政治] 1234...abcd.txt 是答案源文件
# [ANS] [政治] 1234...abcd.txt 是自动生成的答案
$ cat '[ANS] [政治] 1234...abcd.txt'
01.  "A",
02.  "D",
03.  "D",
04.  "A",
05.  "D",
06.  "D",
07.  "B",
08.  "D",
### 省略若干行，不止能生成选择题！

```

## 结尾

我得赶紧写作业去了。~~毕竟开学考是逃不过的。。~~
