---
layout: "@layouts/MarkdownPostLayout.astro"
title: 手摸手教你用 Taro + React 封装一个antv-f2
author: J10c
pubDate: 2023-03-07
tags: ["programming", "taro"]
---

~~备选标题：用这种方式给 Taro 封装知名可视化库，我一天能写100个~~

有需求要在小程序端展示图表，看了一圈好用的库就两个 echarts 和 antv-f2，echarts感觉是太老了，为了展示的多样性就选择了 antv

> 这里提一下，因为图表大多是 canvas 实现，所以微信小程序端选择的时候不会像组件库那样不自由

~~去搜了一下，antv有自己的小程序端兼容版，本文终结~~

[@antvis/wx-f2](https://github.com/antvis/wx-f2)，这个说实话，看更新日期就不想用了。他是 antv-f2 的一个分支，应该是做了兼容后就停止开发了。看项目介绍，有繁琐的小程序开发平台配置，和老掉牙的代码写法。考虑到选择 antv 的初衷，就放弃了这种方案

```ts
// wx-f2
// chart 实例通过调用方法进行配置，太落后啦
chart.source(data, {
  date: {
    range: [0, 1],
    type: 'timeCat',
    mask: 'MM-DD'
  },
  value: {
    max: 300,
    tickCount: 4
  }
});
chart.area().position('date*value').color('city').adjust('stack');
chart.line().position('date*value').color('city').adjust('stack');
chart.render();
```

```ts
// 官网的案例
const context = document.getElementById('container').getContext('2d');
const LineChart = (
  <Canvas context={context} pixelRatio={window.devicePixelRatio}>
    <Chart data={data}>
      <Axis
        field="date"
        tickCount={3}
        style={{
          label: { align: 'between' },
        }}
      />
      <Axis field="value" tickCount={5} />
      <Line x="date" y="value" />
      <Tooltip />
    </Chart>
  </Canvas>
);

const chart = new Canvas(LineChart.props);
chart.render();
```

开发小程序用的是 Taro + React，组件开发自然喜欢 jsx 多点，由官网示例可以看出，我们的图表结构完全是由 jsx 描述的，但实际上我们不会把 jsx 渲染出来，而是提取图表的结构信息，给到 chart instance，让他在 canvas 中渲染出来

但是这种写法有点不好
- 把图表结构当成一个变量了（虽然 antv 渲染图表就是要靠这个），我们习惯把 jsx 写在 return 中
- 浏览器提供的 canvas 和 图表 jsx 结构分离，看起来很难受

我想像平时写组件一样写 f2

```tsx
const MyChart = () => {
  return (
    <F2>
      { /** 折线图 */ }
      { /** 坐标轴 */ }
    </F2>
  )
}
```

于是，我就开始封装我的 f2 组件了

首先，照着官网示例，先拿到 canvas 的 context
```ts
import { Canvas } from "@tarojs/components";
```

```tsx
const staticConfig = useRef<ChartProps>();

useReady(() => {
  const query = Taro.createSelectorQuery();
  query.select(`#${chartId}`)
    .fields({node: true, size: true})
    .exec((res) => {
      const { node, width, height } = res[0];
      const pixelRatio = Taro.getSystemInfoSync().pixelRatio;
      node.width = width * pixelRatio;
      node.height = height * pixelRatio;
      staticConfig.current = {
        context: node.getContext("2d"),
        pixelRatio,
        height,
        width,
      };
    });
});

return (
  { /** 这个 Canvas 是小程序（Taro）的，不是 antv 的 */ }
  <Canvas
    type="2d"
    canvasId={chartId}
    id={chartId}
    style={{ width: "100%", height: "100%" }}
  />
);
```

这段代码还是很多坑的，首先拿 dom 要在 `Taro.useReady` 生命周期中拿，Taro 的 canvas 组件需要传入`id`，`canvasId`倒是可以不用（不知道为什么Taro文档没说`id`是必要的，我以为他把`canvasId`编译成`id`了，导致我后面一直拿不到 dom），保险起见我们两个都写。考虑到一个页面有多个图表，我们希望上层组件由用户传入一个`id`，来保证 `id` 唯一（其实可以用 uuid 实现）

可以看到 antv 官方示例中 给 canvas instance 传入的是 jsx 对象，其中包含 canvas context，我们这边已经拿到了 context 和其他的 canvas dom 信息，就直接保存到 `staticConfig`中，方便以后使用这些静态配置 

有 canvas 配置了，我们就可以去获取图表配置了

我们希望以这种形式使用 F2

```tsx
export default () => {
  return (
    <F2 chartId="mychart-01">
      <Canvas>
        <Chart data={data} scale={scale} >
          <Axis
            field="label"
            style={{ label: { align: "between" } }}
          />
          <Axis field="sum" />
          <Line x="label" y="sum" lineWidth="4px" shape="smooth" style={{ stroke: "#29cf74"}}/>
          <Point x="label" y="sum" color="#009c50" />
        </Chart>
      </Canvas>
    </F2>
  )
}
```

那我们就从`props.children`中拿表的配置`dynamicConfig`

```ts
const { props: dynamicConfig } = props.children;
```

至此我们图表的所有配置都拿到了，现在就是渲染了，先创建一个 chart 实例，给他存到 ref 中，因为以后更新图表还要用到它，这里要注意⚠️，更新表单要用 update，而创建图表用 render，以 ref 为空来判断状态

```ts
import { Canvas as AntVCanvas } from "@antv/f2";
```

```tsx
const chartRef = useRef<AntVCanvas>();

const renderChart = (config: ChartProps) => {
  if (chartRef.current) {
    chartRef.current.update(config);
  } else {
    chartRef.current = new AntVCanvas(config);
    chartRef.current.render();
  } 
};
```

我们希望图表在挂载时渲染一次，之后 children 更新后都是 update

```tsx
const [isReady, setIsReady] = useState(false);

useEffect(() => {   
  if (!isReady) return;
  const { props: dynamicConfig } = children;
  renderChart({ ...dynamicConfig, ...staticConfig.current});
}, [children, isReady]);
```

同时我们注意到，如果 context 没找到，即 `config` 中没有 context（`onReady` 在 `useEffect`后执行），我们一尝试渲染必报错，于是我们在找到 dom 后 `setIsReady`，同时将 `isReady` 给到 dep list，就能解决问题了

到此封装结束，亮出代码✨

```tsx
import { Canvas } from "@tarojs/components";
import Taro, { useReady } from "@tarojs/taro";
import { useState, useEffect, useRef } from "react";
import { Canvas as AntVCanvas } from "@antv/f2";
import { ChartProps } from "@antv/f2/es/canvas";

type PropsType = {
  chartId: string;
  children: JSX.Element;
}

const F2 = (props: PropsType) => {
  const staticConfig = useRef<ChartProps>();
  const chartRef = useRef<AntVCanvas>();
  const [isReady, setIsReady] = useState(false);
  const { children, chartId } = props;

  useReady(() => {
    const query = Taro.createSelectorQuery();
    query.select(`#${chartId}`)
      .fields({node: true, size: true})
      .exec((res) => {
        const { node, width, height } = res[0];
        const pixelRatio = Taro.getSystemInfoSync().pixelRatio;
        node.width = width * pixelRatio;
        node.height = height * pixelRatio;
        staticConfig.current = {
          context: node.getContext("2d"),
          pixelRatio,
          height,
          width,
        };
        setIsReady(true);
      });
  });

  const renderChart = (config: ChartProps) => {
    if (chartRef.current) {
      chartRef.current.update(config);
    } else {
      chartRef.current = new AntVCanvas(config);
      chartRef.current.render();
    }
  };

  useEffect(() => {
    if (!isReady) return;
    const { props: dynamicConfig } = children;
    renderChart({ ...dynamicConfig, ...staticConfig.current});
  }, [children, isReady]);

  return (
    <Canvas
      type="2d"
      canvasId={chartId}
      id={chartId}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default F2;
```

由于小程序的 context 不是标准的（有些功能不被 antv 兼容），可以用[官方的案例](https://github.com/antvis/f2-context)来给 canvas context 抹平差异

最后吐槽一下 antv 的示例页面，cpu占用很高，电脑烫手了我才反应过来，体验很差😭
