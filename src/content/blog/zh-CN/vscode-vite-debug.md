---
title: 'vscode debug vite 前端项目'
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
