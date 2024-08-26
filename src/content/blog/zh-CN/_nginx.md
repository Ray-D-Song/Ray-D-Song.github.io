`nginx -t`命令会检查配置文件是否正确, 并返回当前使用的配置文件路径.  
同时新版的 nginx 自动生成了一个 nginx.conf.default 作为备份.  

删除多余注释的默认配置如下:  
```conf
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;

    keepalive_timeout  65;

    server {
        listen       8080;
        server_name  localhost;

        location / {
            root   html;
            index  index.html index.htm;
        }

    }

    include servers/*;
}
```
重启命令:  
nginx -s reload

## 代理
新建一个新的 server 块实现代理功能.  
将/base 路径的请求转发到 5525 端口, 将/custom 路径的请求转发到 4416 端口  
```
server {
    listen       7749;
    server_name  localhost;

    location /base {
        proxy_pass http://localhost:5525;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /custom {
        proxy_pass http://localhost:4416;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```