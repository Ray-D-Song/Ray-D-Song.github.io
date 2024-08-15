---
title: 'vscode 如何 debug 前端项目'
date: '2024-8-12'
cover: ''
tag: ['frontend', 'vite']
---

## 基础
vscode 的 debug 使用项目根目录下的`.vscode/launch.json`文件进行配置.  

首次运行 debug, vscode 会创建一个默认的配置文件.  

```json
{
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      // 调试器类型
      "type": "chrome",
      // 请求类型, launch 代表启动新的调试会话, 也可以选择 attach, 用于附加到已经运行的进程
      "request": "launch",
      "name": "Launch Chrome against localhost",
      // app 的 url, 端口需要和你的 vite 项目启动端口一致
      "url": "http://localhost:8080",
      // 指定项目根目录
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```
接下来只需要点击`Run and Debug`按钮, 点击`Start Debugging`, 只要端口一致, 程序集就会在你的断点处暂停.

## source map
source map 是源代码和编译产物之间的映射关系文件, 关于 source map, 具体可以看[阮一峰老师的这篇博客](https://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html).  
如果你的项目需要经过编译运行, 在没有 sourcemap 的情况下, vscode 断点会提示`Unbound breakpoint(断点未绑定)`, 因为实际运行的代码是编译后的结果, vscode 没法通过你源码中的断点定位到实际运行代码中的位置.  

vite 项目和常见插件都默认生成 map, 如果你的项目是纯 Typescript 编写, 那需要在 tsconfig.json 中增加:  
```json
{
  "compilerOptions": {
    "sourceMap": true,
  }
}
```
