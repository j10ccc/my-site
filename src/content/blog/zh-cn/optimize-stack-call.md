---
layout: "@layouts/MarkdownPostLayout.astro"
title: 一道调用堆栈的性能优化题
author: J10c
pubDate: 2022-11-04
tags: ["programming"]
---

昨天参加了一场性能优化的比赛，题目很简单，优化思路是优化堆栈调用，但是第一次写这种题目，没发挥出来😵

赛后我想了一下，在我代码的基础上，大概有两种不同程度的优化方案，但是这篇文章写着写着，发现堆栈调用是一个很大的坑

顺便提一下，ACE的耗时是我（第五）的一半

## 原题

有删改，但是题意不变

```cpp
struct vec {
  int *data;
  int length;
};

void get_vec_element(vec *v, int index, int *data) {
  int value;
  value = v->data[index];
  *data = value;
}

int get_vec_length(vec *v) { return v->length; }

/*
  v->data = {1, 2, 3, 4, 5}
  sum = 1 + 2 + 3 + 4 + 5 = 15
*/
void combine(vec *v, int *dest) {
  // code here
  int i;

  *dest = 0;
  for (i = 0; i < get_vec_length(v); i++) {
    int val;
    get_vec_element(v, i, &val);
    *dest = *dest + val;
  }
}

int main() {
  vec v;
  v.data = new int[5]{1, 2, 3, 4, 5};
  v.length = 5;
  int sum = 0;

  for (int i = 0; i < 100000000; i++) {
	// 放大差异
    sum = 0;
    combine(&v, &sum);
  }

  delete[] v.data;

  return 0;
}
```

## 约定

我在原题的基础上，在for循环的上下写了定时器，测出for循环结束的耗时，从而比较性能

### 运行环境

```
Compiler: clang++@13.1.6
Build Tool: cmake@3.24.3
CPU: Apple M2
OS: macOS 12.4 21F2081 arm64
```

## 分析

- `data`是一个指针，指向堆区的一个数组
- `get_vec_length()`间接访问**一次**
- `get_vec_element()`这个函数开销太大了，获取数组一个元素，访问堆区，又通过指针访问栈区的内存，一共**两次**间接访问
- `combine`这个函数中还有一个累加语句，**两次**间接访问
- 算下来一次循环需要**五次**间接访问（循环外的不计算在内）

## 答案

### Case1

赛场的时候想出来的，当时看提升幅度挺大的就直接交了

`for`的**每一次循环**都会计算终止条件，即调用`get_vec_length()`

> 两次间接访问 + 一次函数调用开销

```cpp
// 109ms
void combine(vec *v, int *dest) {
  int i;

  int sum = 0;
  for (i = 0; i < get_vec_length(v); i++) {
    sum += v->data[i];
  }

  *dest = sum;
}
```

### Case2

朋友的答案，优化了一个函数调用

累加全在栈区操作，一次`for`循环内访问一次堆区，最后一步把数值赋给堆区

```cpp
// 78ms
void combine2(vec *v, int *dest) {
  int i;
  int len = get_vec_length(v);

  int sum = 0;
  for (i = 0; i < len; i++) {
    sum += v->data[i];
  }

  *dest = sum;
}
```

### Case3

累加都在堆区操作，效率最高，但是不讲武德，把原数组改了

```cpp
// 69ms
void combine3_0(vec *v, int *dest) {
  int i;
  int len = get_vec_length(v);

  for (i = 1; i < len; i++) {
    v->data[i] += v->data[i - 1];
  }

  *dest = v->data[i - 1];
}
```

下面有一个很奇怪的例子，我把累加换了一种写法

```cpp
// 80ms
void combine3_1(vec *v, int *dest) {
  int i;
  int len = get_vec_length(v);

  for (i = 1; i < len; i++) {
    v->data[i] = v->data[i] + v->data[i - 1];
  }

  *dest = v->data[i - 1];
}
```

可以发现两种累加写法实际上的调用是不一样的，仅在此情况下（多访问了一次堆内存）

```cpp
sum += v->data[i];
sum = sum + v->data[i]; // equivalent

v->data[i] += v->data[i - 1]; // 69ms
v->data[i] = v->data[i] + v->data[i - 1]; // 79ms
// time-consumed
```

## 总结

大佬的写法没去问，现场是比 case2 要快，可能比 case3 要快，自己也写不出来，摆烂了

研究过程头很大，`operator+=`出现不等价的结果，我想了好久，没想出来为什么。这个深究也没什么意义，实际使用中产生的性能差异微乎其微。

## 分享

减少堆栈调用这个优化方案在递归的时候也能用上，递归不断保留作用域内的变量，可能导致栈内存溢出，尾递归就能很好地解决问题

```cpp
int f(int n) { 
  // 函数不回立即返回
  // 每次调用的 n 都存在栈中
  return (n == 1) ? 1 : n + f(n - 1); 
}
```

```cpp
int f_tail(int n, int res = 0) {
	// 参数在结束函数返回的时候就被释放
	// 没有任何变量留在栈内
  return (n == 0) ? res : f_tail(n - 1, res + n);
}
```

