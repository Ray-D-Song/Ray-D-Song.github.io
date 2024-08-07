---
title: 'TailwindCSS 的价值'
date: '2023-10-11'
cover: ''
tag: ['CSS']
---
tailwind 一直饱受非议, 其中说的最多的大概就是「我为什么不直接写内联样式?」.
其实 tailwind 不仅是简写了样式名这么简单, 它是一系列便利的封装.
# 动画
举个简单的例子, `animate-spin` 属性用于添加旋转动画, 常用在 loading 中. 如果你用传统的 css/sass 编写, 那你至少需要以下代码.
```css
animation: spin 1s linear infinite;

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```
# 交互
如果你希望一个 button 在鼠标炫富时颜色变浅, 在 tailwind 中只需要简单的`hover:opacity-90`, 传统的 css 则需要:
```css
.btn:hover {
  background-color: rga(xxx,xxx,xxx, 0.9)
}
```
# 响应式设计
同时现代很多网页需要同时满足大屏设备和移动小屏设备的适配, 一般我们会用 css3 的 @media 来根据窗口尺寸编写不同的 css.
```css
@media (max-width: 768px) {
  body {
    width: 80%
  }
}
```
在 tailwind 上, 适配 768px 宽度的设备, 你只要在样式前加入 `md` 前缀即可.
```html
<body class="md:w-4/5">
```
# 利好无设计开发
个人或者小团队开发产品, 没有专业的设计师出图, 写组件相当痛苦.
例如 box-shadow 属性, button、card、modal, 每个都需要不一样的 shadow 样式. 在自己编写的时候经常要重复修改多次来达到一个比较好的效果, twc 提供了 7 个不同规格的选项, 都是泛用性非常高的选择.
现在你要写一个现代化外观的按钮只需要`class="shadow-md rounded-lg"`就行了.
# 新的组件模式
tailwind 还有个衍生品, Headless UI. 将组件的功能和样式彻底分离. 很多时候组件的功能是相同的 , 但是需要不同的样式, 有时候样子一样的组件却需要完全不同的 api. Headless 就是为了解决这个问题.

> NuxtLab UI 就是一个无头tailwind组件库, 闲得蛋疼可以看看, 代码很干净.

# class 也太特么长了
这是一个由 tailwind 编写的 checkbox, 做了动效和深色适配.
```html
<input type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
```
看到这个长度是不是蚌埠住了. 没关系 tailwind 有`@layer`和`@apply`, 你可以像组织传统 css 一样去组织 tailwind, 封装自己的样式组件.
```css
@layer components {
  .checkbox {
    @apply
    w-4
    h-4
    text-blue-600
    bg-gray-100
    border-gray-300
    rounded
    focus:ring-blue-500
    dark:focus:ring-blue-600
    dark:ring-offset-gray-800
    focus:ring-2
    dark:bg-gray-700
    dark:border-gray-600
  }
}
```
过长的样式导致的问题是无法避免的, 即便你直接写内联也是一样, 最终一定会回到封装样式组件的路上. 但之前所有的好处(抽象、减少代码量、响应式...)都还在.
这也是一种「不过早抽象」的价值. 一个小的 idea, 你可以一把梭抢先实现原型, 后期再抽离维护, tailwind 降低了这一操作的难度.

> 当然, 这种种好处的前提是, 要么你写风格多样化的 C 端界面, 要么需要创建属于自己团队的组件库. 然而很明显, 大多数公司还停留在`element antd`一把梭的阶段. 但这当然不是 tailwind 的问题.

> 实际上海外 `3T架构(Next tRPC Tailwind)` 已经火了有一阵了, 当然你也可以说这是前端瞎折腾, 但这确实是写出「现代、好看、交互强的界面」的捷径.
