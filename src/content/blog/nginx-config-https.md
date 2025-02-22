---
title: 'nginx 配置 https'
date: '2024-09-03'
cover: ''
tag: ['nginx', 'self-host']
---

self-host 系列文章, 讲述如何自己搭建服务.  

## 什么是 HTTPS
HTTPS 是 HTTP 的安全版本, 通过加密通信内容, 防止[中间人攻击](https://zh.wikipedia.org/wiki/%E4%B8%AD%E9%97%B4%E4%BA%BA%E6%94%BB%E5%87%BB), 保证数据传输的安全性.  

> 中间人攻击可以简单理解为, 有人篡改了服务端发送给你, 或者是你发送给服务端的数据.  

HTTPS 约定了使用 443 端口, 通过 SSL/TLS 协议进行通信.  

最常见的应用部署方法是使用 Nginx 作为反向代理服务器, 监听 443 端口, 将请求转发到服务所在的端口. 并且 Nginx 会负责 SSL/TLS 的加密解密工作.  

## 生成证书
配置 HTTPS 首先需要生成证书, 证书由 CA 机构颁发, 用来证明你的网站是安全的.  
https://www.cloudflare.com/application-services/products/ssl/

如果你的域名在 Cloudflare 上, 可以直接在 Cloudflare 上申请免费证书.  

进入 Cloudflare 控制台, 选择左侧的`Websites` -> `选择你的域名`  
![cloudflare](https://r2.ray-d-song.com/2024/09/77608d3883b8b5263435d270e1da4164.png)

然后再选择左侧边栏的`SSL/TLS` -> `Origin Server` -> `Create Certificate`
![cloudflare](https://r2.ray-d-song.com/2024/09/2ff28057f28f36229fafb74566405b49.png)

不需要修改任何选项, 直接点击`Create`创建即可.  
Cloudflare 会生成证书和私钥, 证书用于证明你的网站是安全的, 私钥用于加密解密通信内容.  
记得保存你的私钥, 离开创建页后就无法再看到了.  

> 你也可以使用 [Let's Encrypt](https://letsencrypt.org/) 获取免费证书.  

假设你的证书和密钥如下:

```txt
-----BEGIN CERTIFICATE-----
your_certificate
-----END CERTIFICATE-----
```

```txt
-----BEGIN PRIVATE KEY-----
your_private_key
-----END PRIVATE
```

将证书保存为 `xxx.crt`, 将私钥保存为 `xxx.key`.  
记住你的证书和私钥的路径, 用于配置 Nginx.  

## 配置 Nginx
安装好 Nginx 后, 打开 Nginx 配置文件, 一般在 `/etc/nginx/nginx.conf` 或者 `/usr/local/nginx/conf/nginx.conf`.  
也可以用 `nginx -t` 命令查看 Nginx 配置文件的路径.  

新版本的 Nginx 会将配置文件分为多个文件, 一般在 `/etc/nginx/conf.d/` 目录下.  
新建一个文件, 命名为 `your_domain.com.conf`.  

对应的 nginx 配置如下:  
```nginx
server {
    listen 443 ssl;
    # [!code highlight:5]
    server_name your_domain.com;

    ssl_certificate /path/to/your_certificate.crt;
    ssl_certificate_key /path/to/your_private_key.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:8080; # [!code highlight]
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
其中需要关注的高亮行:
- `your_domain.com` 替换为你的域名
- `/path/to/your_certificate.crt` 替换为你的证书路径
- `/path/to/your_private_key.key` 替换为你的私钥路径
- `http://localhost:8080` 替换为你的服务地址

如果你希望用户访问路径不是`your_domain.com`, 可以将 11 行的`/`替换为你想要的路径.  

保存配置文件后, 重启 Nginx 服务.  
```bash
sudo systemctl restart nginx
```

如果没有使用 systemd 管理 Nginx 服务, 可以使用以下命令重启 Nginx 服务.  
```bash
sudo nginx -s reload
```

## 配置 DNS
在 Cloudflare 控制台中, 选择左侧的`Websites` -> `选择你的域名` -> `DNS`  
点击`Add record`添加一条 A 记录, 将`Type`设置为`A`, `Name`设置为你的域名, `IPv4 address`设置为你的服务器 IP.  
点击保存, 等待 DNS 生效. 然后访问你的域名, 大功告成.   


## 配置 HTTP 跳转 HTTPS

如果你希望用户访问 HTTP 时自动跳转到 HTTPS, 可以在配置文件中添加以下配置.  
```nginx
server {
    listen 80;
    server_name your_domain.com; # [!code highlight]
    return 301 https://$host$request_uri;
}
```

对于 Cloudflare 用户, 可以在 Cloudflare 控制台中配置`SSL/TLS` -> `Edge Certificates` -> `Always Use HTTPS`开启强制 HTTPS.  