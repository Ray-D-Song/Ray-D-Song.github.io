---
title: 'Using Docker Containers for Frontend Development'
date: '2024-08-26'
cover: ''
tag: ['Docker', 'frontend']
---

I need to work on an old project recently, which uses vue2 and node.js14.  
Currently, I manage runtime versions with [asdf](https://asdf-vm.com/), and on macOS, installing node.js v14 involves building from source.  
The disaster began when compiling node.js 12 required python 2.7 or 3.9, but macOS only had python version 3.12.  
So, I tried compiling python 2.7.18 using asdf. Just when I thought everything was going well, the compilation failed!  

![build fail](https://r2.ray-d-song.com/2024/08/c0f4875873e59539cbe39404361ee244.png)

Okay, I admit I couldn't understand this error.  
Of course, I could download precompiled files and manually manage them with asdf. But by that time, I had lost my patience.  

## Dev Container
A Dev Container uses a container as the development environment, and editors like vscode or neovim can be used to interact with the container as the backend.  
This approach has two advantages:  
* Dev Containers are stateless, can be destroyed after use, and do not incur additional overhead.
* It standardizes the development environment for team members, eliminating the need for extra configuration time. Distributing a Dockerfile is sufficient.

However, there are also issues. On Mac and Windows, Docker runs in a virtual machine, causing cross-file system read/write operations during code writing and compilation, leading to decreased I/O efficiency. Subjectively, webpack projects have only about 50% of the compilation efficiency compared to native development.

## Dockerfile
To use a Dev Container, you need to package an image containing development tools.  

There are two methods for creating images: one involves creating a new system container, installing necessary tools inside the container, and then packaging the container into an image.  

However, the drawback of this approach is that distribution must be done at the image level. The compressed size of a debian nodejs14 image can reach 300M.  

Therefore, I choose to use a `Dockerfile` here. Docker automatically builds images by reading instructions in the Dockerfile.  

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

Several Dockerfile instructions are used here, with the following meanings:  
* FROM: Specifies the base image, using the latest debian here
* RUN: Executes commands, akin to shell commands executed in the container
* ARG: Defines variables that can be passed during the build and can have default values
* ENV: Defines environment variables, here adding the nodejs bin directory to PATH
* WORKDIR: Specifies the working directory, the default directory when the container starts

An important point to note is that Dockerfile has the concept of "layers," where each RUN instruction creates a new layer.  
This is why the `ARG` is defined before fetching the nodejs file command, as variables are only valid within the current layer.  
Placing `ARG` at the beginning would result in an error.  

## Usage
Save the above Dockerfile as `Dockerfile`, then execute `docker build -t nodejs14 --build-arg VER=14 .` in the same directory as the Dockerfile.  
This will build an image named `nodejs14`.  

To run the container, use the following command:  
```bash
docker run -d \
-v=/Users/ray/workbase:/usr/src/app \
--name=nodejs14 \
-p=9981:9981 \
nodejs14 \
sleep infinity
```
Here, the -v parameter maps a local directory to the container, allowing access to local files without losing progress.  
The --name parameter specifies the container name, and the -p parameter maps the container port to a local port.  
Finally, `sleep infinity` is used to keep the container running.  
