---
title: '在使用ionic后, 我觉得flutter才是客户端跨平台唯一解'
date: '2024-8-15'
cover: ''
tag: ['frontend', 'App', 'cross platform']
---

公司有一个 PDA app, 之前是采购然后做一些定制. 很难用, 安卓、PDA 终端、IOS 上都有坑.  
最难受的是源码是早期版本的 uniapp, 坑多不好改, 没办法只能另起炉灶.

## 简介

## 和 RN 的区别
ionic 使用一个叫 capacitor 的 runtime

## 问题
### 过度商业化
现在的 ionic 依旧非常不成熟, 但版本号推的很快(现在是 v8)
### 内存泄露

### 奇怪的技术架构

### 潜在的风险
Apple 对跨平台框架应用的审查一直是一个讨论点, 我个人倾向于认为, 在给微信开了个后门之后, Apple 在国内会对 hybrid 更宽容.  

但最近 Apple 对微信非常不满, 因为小游戏带来了巨大的收益, 其支付结构又不需要交苹果税. 也许未来某一天 Apple 会对新上架的 APP 封死 web hybrid 结构也说不准.  

## 为什么 flutter 更好
pda 软件有个非常常见的需求, 就是连续自动聚焦.  
HTML 有个原生属性 autofocus, uniapp 一直在自动聚焦上一直有 bug.
我期望 ionic 作为更浅的封装, 可以像在浏览器里一样正确处理聚焦行为, 但ionic 和 uniapp 一样选择提供了一个额外的 api setFocus, 

* 设置焦点之前需要用户交互(例如让用户点一下屏幕)
* 

这种方式非常不 Vue. 就像 RN 中很多东西也非常不 React.  
其结果就是这些 Hybrid 技术只是很浅层的使用了这些 web 框架的`写法`, 而不是
```vue
<template>
  <ion-modal @didPresent="onDidPresent">
    <ion-input ref="input"></ion-input>
  </ion-modal>
</template>

<script setup lang="ts">
  import { IonInput, IonModal } from '@ionic/vue';
  import { ref } from 'vue';

  const input = ref();

  function onDidPresent() {
    input.value.$el.setFocus();
  }
</script>
```
说到底, 大家想要的就是一个mobile electron, 全屏浏览器加上调用原生功能接口的能力, 而不是