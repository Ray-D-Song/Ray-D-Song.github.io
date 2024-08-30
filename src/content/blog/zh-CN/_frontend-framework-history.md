---
title: '前端框架发展史'
date: '2024-8-28'
cover: ''
tag: ['frontend', 'JavaScript', 'TypeScript']
---

世界上有两种前端, 一种会为了 React 和 Vue 谁更好吵得面红耳赤, 另一种开一个项目就要纠结到底是用 React/Vue/Solid/Svelte/Angular/Lit 中的哪个.  

让我们回归本质, 忘掉hooks、vdom, 服务端渲染. 倒回那个 Promise 还需要用 polyfill 的年代, 一起看看前端框架的发展史.  

## 0.1.0 DOM 操作时代

### jQuery
大名鼎鼎的 [jQuery](https://jquery.com/), 用它来操作 DOM 是前端开发者的必备技能, jQuery 就是前端, 前端就是 jQuery.  

由于不存在 Vite、Webpack 等 bundle 技术. 当时引入一个库的方式就是在index.html的`<head>`中引入一个`<script>`标签.  
```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js">
```

jQuery 本质是一个的 DOM 操作库.  
在当时, 并不区分前端和后端, 大多数情况下也不是通过 json 传输数据, 而是通过 form 表单提交. 后端返回的 html 直接插入到页面中.  
```js
```
有不少人以为 jQuery 是 DOM 界的 [lodash](https://www.lodashjs.com/).  
实际上 jQuery 支持[插件](https://plugins.jquery.com/), 有着活跃而庞大的社区.

### 其他库


## 1.0.0 MVC/MVVM时代
这个时代的代表作是 backbone, angular.js, vue(1.x).  

## 2.0.0 组件化时代