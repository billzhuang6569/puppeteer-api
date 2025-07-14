# Puppeteer API 部署指南

## 系统要求

- Ubuntu 18.04 或更高版本
- Node.js 18.0.0 或更高版本
- npm 或 yarn

## 部署步骤

### 1. 准备服务器环境

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Chrome/Chromium 依赖
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

### 2. 部署应用

```bash
# 创建应用目录
sudo mkdir -p /opt/puppeteer-api
sudo chown ubuntu:ubuntu /opt/puppeteer-api

# 克隆项目
cd /opt/puppeteer-api
git clone https://github.com/billzhuang6569/puppeteer-api.git .

# 或者上传项目文件
# 如果是手动上传，确保所有文件都在 /opt/puppeteer-api 目录下

# 安装依赖
npm install --production

# 测试运行
npm start
```

### 3. 配置 systemd 服务

```bash
# 复制 service 文件
sudo cp puppeteer-api.service /etc/systemd/system/

# 重新加载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start puppeteer-api

# 设置开机自启
sudo systemctl enable puppeteer-api

# 检查服务状态
sudo systemctl status puppeteer-api
```

### 4. 配置防火墙（可选）

```bash
# 如果使用 ufw
sudo ufw allow 8000

# 或者使用 iptables
sudo iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
```

### 5. 配置反向代理（推荐）

使用 Nginx 作为反向代理：

```bash
# 安装 Nginx
sudo apt install nginx

# 创建配置文件
sudo tee /etc/nginx/sites-available/puppeteer-api << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# 启用站点
sudo ln -s /etc/nginx/sites-available/puppeteer-api /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 使用方法

### POST 请求

```bash
curl -X POST http://your-server:8000/v1/download_pic_from_url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/image.jpg"}' \
  --output image.jpg
```

### GET 请求

```bash
curl "http://your-server:8000/v1/download_pic_from_url?url=https://example.com/image.jpg" \
  --output image.jpg
```

### 健康检查

```bash
curl http://your-server:8000/health
```

## 常用命令

```bash
# 查看服务状态
sudo systemctl status puppeteer-api

# 查看日志
sudo journalctl -u puppeteer-api -f

# 重启服务
sudo systemctl restart puppeteer-api

# 停止服务
sudo systemctl stop puppeteer-api

# 更新应用
cd /opt/puppeteer-api
git pull
npm install --production
sudo systemctl restart puppeteer-api
```

## 故障排除

### 常见问题

1. **Chrome 无法启动**
   - 确保安装了所有 Chrome 依赖
   - 检查 `/tmp` 目录权限

2. **服务无法启动**
   - 检查 Node.js 版本
   - 查看系统日志: `sudo journalctl -u puppeteer-api`

3. **内存不足**
   - 增加服务器内存
   - 或者在 app.js 中调整 Puppeteer 启动参数

### 性能优化

- 使用 PM2 进行进程管理
- 配置负载均衡
- 设置适当的缓存策略
- 监控内存使用情况

## 安全建议

- 使用 HTTPS
- 配置适当的防火墙规则
- 定期更新依赖包
- 监控系统资源使用情况