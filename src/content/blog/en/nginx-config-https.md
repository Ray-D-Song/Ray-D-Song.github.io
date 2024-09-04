---
title: 'nginx Configuration for HTTPS'
date: '2024-09-03'
cover: ''
tag: ['nginx', 'self-host']
---

A series of self-host articles, explaining how to set up services on your own.

## What is HTTPS
HTTPS is the secure version of HTTP, which encrypts communication content to prevent [man-in-the-middle attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack), ensuring the security of data transmission.

> A man-in-the-middle attack can be simply understood as someone tampering with the data sent from the server to you or from you to the server.

HTTPS is conventionally used on port 443 and communicates via the SSL/TLS protocol.

The most common deployment method is to use Nginx as a reverse proxy server, listening on port 443, forwarding requests to the port where the service is located. Nginx is responsible for the encryption and decryption work of SSL/TLS.

## Generating Certificates
To configure HTTPS, you first need to generate certificates. Certificates are issued by a CA organization to prove that your website is secure.
[Cloudflare SSL](https://www.cloudflare.com/application-services/products/ssl/)

If your domain is on Cloudflare, you can directly apply for a free certificate on Cloudflare.

Go to the Cloudflare dashboard, select `Websites` on the left -> `Select your domain`
![cloudflare](https://r2.ray-d-song.com/2024/09/77608d3883b8b5263435d270e1da4164.png)

Then select `SSL/TLS` on the left sidebar -> `Origin Server` -> `Create Certificate`
![cloudflare](https://r2.ray-d-song.com/2024/09/2ff28057f28f36229fafb74566405b49.png)

You don't need to modify any options, just click `Create` to create it.
Cloudflare will generate a certificate and private key. The certificate is used to prove that your website is secure, and the private key is used for encrypting and decrypting communication content.
Remember to save your private key as you won't be able to see it again after leaving the creation page.

> You can also use [Let's Encrypt](https://letsencrypt.org/) to get free certificates.

Assuming your certificate and key are as follows:

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

Save the certificate as `xxx.crt` and the private key as `xxx.key`.
Remember the paths to your certificate and private key for configuring Nginx.

## Configuring Nginx
After installing Nginx, open the Nginx configuration file, usually located at `/etc/nginx/nginx.conf` or `/usr/local/nginx/conf/nginx.conf`.
You can also use the `nginx -t` command to view the path of the Nginx configuration file.

Newer versions of Nginx split the configuration file into multiple files, usually under the `/etc/nginx/conf.d/` directory.
Create a new file named `your_domain.com.conf`.

The corresponding Nginx configuration is as follows:
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
Pay attention to the highlighted lines:
- Replace `your_domain.com` with your domain
- Replace `/path/to/your_certificate.crt` with your certificate path
- Replace `/path/to/your_private_key.key` with your private key path
- Replace `http://localhost:8080` with your service address

If you want users to access a path other than `your_domain.com`, you can replace the `/` on line 11 with the desired path.

After saving the configuration file, restart the Nginx service.
```bash
sudo systemctl restart nginx
```

If you are not using systemd to manage the Nginx service, you can use the following command to restart the Nginx service.
```bash
sudo nginx -s reload
```

## Configuring DNS
In the Cloudflare dashboard, select `Websites` on the left -> `Select your domain` -> `DNS`
Click `Add record` to add an A record. Set `Type` to `A`, `Name` to your domain, and `IPv4 address` to your server's IP.
Click save and wait for DNS propagation. Then access your domain, and you're all set.  


## Configure HTTP Redirect to HTTPS

If you want users to be automatically redirected to HTTPS when accessing HTTP, you can add the following configuration to the settings file.  
```nginx
server {
    listen 80;
    server_name your_domain.com; # [!code highlight]
    return 301 https://$host$request_uri;
}
```

For Cloudflare users, you can enable the "Always Use HTTPS" option in the Cloudflare dashboard under `SSL/TLS` -> `Edge Certificates` to enforce HTTPS.  
