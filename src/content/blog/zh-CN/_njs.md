---
title: 'njs 入门教程'
date: '2024-08-26'
cover: ''
tag: ['JavaScript', 'njs', 'nginx']
---

[njs](https://github.com/nginx/njs)全称是`Nginx JavaScript`, 是 JavaScript 的语言子集, 可用于配置和拓展[nginx](https://nginx.org/).  
njs 由 nginx 官方维护, 支持所有的 ES5 语法和部分 ES6 语法.  

比较神奇的是, njs 是一个没有 gc 的 JavaScript runtime. 而且针对每个请求, njs 会创建一个新的 vm 实例, 用于执行 JavaScript 代码.  

## 安装
如果你使用的是 Linux, 可以直接参照[github上的指引](https://github.com/nginx/njs?tab=readme-ov-file#downloading-and-installing), 如果你和我一样使用的是 macOS, 就只有自己 build 了.  
如果你使用的是 Apple Silicon Mac, 你可以使用我打包好的[njs](https://github.com/Ray-D-Song/njs/releases/download/build/njs-macos-aarch64)  
编译 njs 需要`make`和`gcc`, 在大多数 Mac 上都是自带的.  
同时还需要以下依赖库:
```txt
libprelude zlib-ng libsolv libxml2 libxslt libedit
```

接下来就是 clone 代码, 编译, 安装了:
```bash
git clone https://github.com/nginx/njs.git
&& cd njs
&& ./configure
&& make
```

不出意外的话你会看到`./build/njs`这个可执行文件.  

> 这里打包的 njs 是和 nodejs 一样的可执行 runtime, 而不是 nginx 环境.

可惜的是, njs 从 2018 开始在 Nginx Conf 亮相, 到现在也没有获得多少关注.  
大概是因为大家对于 nginx 的预期就是一个高性能的反向代理, 而不是作为一个全能服务器.  