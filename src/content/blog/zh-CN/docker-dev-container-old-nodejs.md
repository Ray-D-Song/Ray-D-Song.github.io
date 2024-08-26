---
title: '使用 Docker 容器进行前端开发'
date: '2024-08-26'
cover: ''
tag: ['Docker', 'frontend']
---

最近要改一个老项目, vue2 和 node.js14.  
我现在使用的 runtime 版本管理器是[asdf](https://asdf-vm.com/), m2 macOS 安装 v14 的 node.js 是从源码构建.  
灾难开始了, 编译 node.js 12 需要 python2.7 或 3.9, macOS 系统自带的 python 版本是 3.12.  
然后我又去用 asdf 编译 2.7.18 的 python. 正当我满心欢喜觉得可以使用的时候, 编译失败了!  

![build fail](https://r2.ray-d-song.com/2024/08/c0f4875873e59539cbe39404361ee244.png)

好吧我承认我看不懂这个报错.  
当然我也可以自己下载编译好的文件然后手动让 asdf 接管. 但这时候我已经没耐心了.  

## Dev Container
Dev Container 就是使用容器作为开发环境, 再使用 vscode、neovim 之类的编辑器将容器作为后端.  
这样做有两个好处:  
* Dev Container 是无状态的, 用完就可以销毁, 不会产生额外占用
* 统一开发人员的环境, 不再需要额外花时间去配置, 分发一个 Dockerfile 就行.

当然也有问题, 在 Mac 和 windows 上, Docker 运行在虚拟机中, 代码编写和编译会触发跨文件系统读写, 导致 IO 效率降低. 体感上 webpack 项目只有本机开发 50% 左右的编译效率.

## Dockerfile
想使用 Dev Container 就要打包一个包含开发工具的镜像.  

制作镜像的方法有两种, 一种是创建新的系统容器, 进入容器安装必要工具后将容器打包成镜像.  

但这样的缺点是分发时必须以镜像作为单位. debian nodejs14 的镜像体积在压缩前能达到 300M.  

所以这里我选择使用`Dockerfile`, Docker 通过读取 Dockerfile 中的指令来自动构建镜像.  

```Dockerfile
# nodejs
# version: v14 -> v20

# Specify the source mirror to use
FROM debian:latest

# Operation command
RUN apt-get update && apt-get install -y \
  wget \
  git \
  xz-utils

RUN mkdir -p /usr/local/nodejs

# Define variables and default values
ARG VER=14
RUN if [ "$VER" = "14" ]; then \
      wget -O node.tar.xz https://nodejs.org/dist/v14.21.3/node-v14.21.3-linux-arm64.tar.xz; \
    elif [ "$VER" = "16" ]; then \
      wget -O node.tar.xz https://nodejs.org/dist/v16.20.2/node-v16.20.2-linux-arm64.tar.xz; \
    elif [ "$VER" = "18" ]; then \
      wget -O node.tar.xz https://nodejs.org/dist/v18.18.2/node-v18.18.2-linux-arm64.tar.xz; \
    elif [ "$VER" = "20" ]; then \
      wget -O node.tar.xz https://nodejs.org/dist/v20.12.0/node-v20.12.0-linux-arm64.tar.xz; \
    else \
      echo "Unsupported nodejs version: $VER"; exit 1; \
    fi

RUN tar -xJf node.tar.xz -C /usr/local/nodejs --strip-components=1 \
&& rm node.tar.xz

# Define environment variables
ENV PATH=/usr/local/nodejs/bin:$PATH

RUN mkdir -p /usr/src/app

# Designated working folder
WORKDIR /usr/src/app
```

这里用到了几个 Dockerfile 的指令, 其含义分别如下:  
* FROM: 指定源镜像, 这里使用最新的 debian
* RUN: 执行命令, 可以直接理解为在容器中执行的 shell 命令
* ARG: 定义变量, 可以在构建时传入, 还可以定义默认值
* ENV: 定义环境变量, 这里是将 nodejs 的 bin 目录加入到 PATH 中
* WORKDIR: 指定工作目录, 也就是容器启动时默认进入的目录

这里有一个注意点, Dockerfile 有「层」的概念, 每一个 RUN 指令都会产生一个新的层.  
这也是为什么`ARG`定义在获取 nodejs 文件命令之前的原因. 因为变量仅在当前层有效.  
如果将`ARG`放在最前面, 就会报错.  

## 使用
将上面的 Dockerfile 保存为`Dockerfile`, 然后在 Dockerfile 同级目录下执行`docker build -t nodejs14 --build-arg VER=14 .`  
这样就会构建一个名为`nodejs14`的镜像.  

使用以下命令运行容器:  
```bash
docker run -d \
-v=/Users/ray/workbase:/usr/src/app \
--name=nodejs14 \
-p=9981:9981 \
nodejs14 \
sleep infinity
```
其中 -v 参数是将本地目录映射到容器中, 这样就可以在容器中访问本地文件同时不会丢失进度.  
--name 参数是指定容器名, -p 参数是将容器端口映射到本地端口.  
最后的`sleep infinity`是为了让容器保持运行状态.  

