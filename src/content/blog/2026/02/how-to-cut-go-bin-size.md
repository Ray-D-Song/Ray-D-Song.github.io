---
title: 'Go 可执行文件体积分析与裁剪'
date: '2026-2-19'
tag: ['Golang']
cover: ''
description: '这篇文章分享了如何对 Go 的编译产物进行分析以及如何裁剪产物体积'
---

### 为什么要裁剪？

Go 相较于 Java、Python 等托管语言和脚本语言的一大优势，就是原生支持编译成可执行文件，这一特性在云原生、容器、CLI 工具等场景下极具吸引力。

但不管是容器镜像，还是 CLI 工具，都对产物体积较为敏感，因此对 Go 可执行文件进行裁剪，就是一个值得研究的工程问题。

### 如何分析产物

最简单的分析方法就是使用 go-size-analyzer 库，它会分析可执行文件内容，并以可视化图表的形式展示出来。

使用方式也非常简单：

```bash
# 安装
go install github.com/Zxilly/go-size-analyzer/cmd/gsa@latest
# 编译产物
go build -o app
# 分析产物
gsa --web app
```

通过图表我们可以直观看出哪些包占用了较多的体积。

![image](https://sy.ray-d-song.com/assets/image-20260219231404-8fsuzom.png)

接下来我们可以通过 go mod why 命令确认为什么需要这个库。

```go
go mod why github.com/goccy/go-yaml
```

我们以一个 Go Gin  框架的 Web 项目为例，Gin 的 binding 包导入了 YAML、TOML、XML 等格式支持，并提供了 `c.TOML`​、`c.XML`​ 等渲染方法。同时提供了绑定方法 `c.BindTOML`​、`c.BindXML` 等。即使你不调用，它们也会被链接进二进制。

例如 YAML 包占用了 571.14kb。但大多数 Http Web 项目并不需要支持这些格式。

替换为更轻量的框架（例如 0 依赖的 chi）体积会减少非常多。

‍

### 反射对产物体积的影响

最后我们要谈谈反射。

现代编译器都包含一种名为 Dead-code elimination（DCE，死代码删除）的技术，顾名思义就是将源码中没用到的部分剔除，不出现在可执行文件中。

在 Go 中，大规模死码删除主要发生在链接期（linker），因此最好的观察方式就是检查二进制中是否存在该符号。

```bash
go build -o app
go tool nm app | grep YourFunc
```

而反射会严重影响 Go 编译器的死代码消除。最极端的例子就是匿名导入 + 反射，导致整个包无法 DCE

```go
package main

import (
	_ "example.com/hugepkg"
	"reflect"
)

func main() {
	var x any
	reflect.TypeOf(x)
}
```

解决方案就是采用`go generate` + 自定义生成器，接口 + 显式注册，泛型等工具来替代反射。
