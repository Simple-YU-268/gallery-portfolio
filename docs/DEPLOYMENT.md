# Deployment Guide - Gallery Portfolio

## 服务器部署到 gallery.yxp268.top

### 1. 服务器准备

```bash
# SSH 到服务器
ssh -i /Volumes/Mac_mini_ssd/.keys/yxp268_key.pem ubuntu@yxp268.top

# 创建项目目录
mkdir -p ~/gallery-portfolio
cd ~/gallery-portfolio
```

### 2. 代码同步

```bash
# 从本地同步代码（在本地执行）
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude 'uploads' --exclude 'data' \
  -e "ssh -i /Volumes/Mac_mini_ssd/.keys/yxp268_key.pem" \
  ~/gallery-portfolio/ ubuntu@yxp268.top:~/gallery-portfolio/
```

### 3. 服务器端构建

```bash
# 在服务器上执行
cd ~/gallery-portfolio

# 安装依赖
npm install

# 初始化数据库
npx prisma migrate deploy

# 构建
npm run build

# 创建管理员用户（首次）
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hashed = await bcrypt.hash('your-admin-password', 10);
  await prisma.user.create({
    data: { email: 'admin@example.com', password: hashed, name: 'Admin' }
  });
  console.log('Admin created');
}
main().finally(() => prisma.\$disconnect());
"
```

### 4. 启动服务

```bash
# 开发模式（测试）
npm start

# 生产模式（PM2）
npm install -g pm2
pm2 start npm --name gallery -- start
pm2 save
pm2 startup
```

### 5. nginx 配置

```bash
sudo tee /etc/nginx/sites-available/gallery.yxp268.top << 'EOF'
server {
    listen 80;
    server_name gallery.yxp268.top;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gallery.yxp268.top;

    ssl_certificate /etc/letsencrypt/live/gallery.yxp268.top/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gallery.yxp268.top/privkey.pem;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/files/ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/gallery.yxp268.top /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL 证书

```bash
sudo certbot --nginx -d gallery.yxp268.top \
  --non-interactive --agree-tos -m yxp020608@126.com
```

### 7. Docker 部署（可选）

```bash
# 创建 Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动
CMD ["npm", "start"]
EOF

# 构建镜像
docker build -t gallery-portfolio .

# 运行容器
docker run -d \
  --name gallery \
  --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/data:/app/data \
  -e NODE_ENV=production \
  -e DATABASE_URL=file:./data/gallery.db \
  gallery-portfolio
```

### 8. 备份策略

```bash
# 备份脚本
cat > ~/backup-gallery.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups/gallery
mkdir -p $BACKUP_DIR

# 备份数据库
sqlite3 ~/gallery-portfolio/data/gallery.db ".backup $BACKUP_DIR/gallery_$DATE.db"

# 打包上传图片
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C ~/gallery-portfolio uploads/

# 保留最近 7 天
find $BACKUP_DIR -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x ~/backup-gallery.sh

# 定时任务
crontab -e
# 添加: 0 3 * * * ~/backup-gallery.sh
```

### 9. 监控

```bash
# 检查服务状态
pm2 status

# 查看日志
pm2 logs gallery

# 检查端口
ss -tlnp | grep 3000

# 检查 nginx
sudo nginx -t
```

## 故障排查

| 问题 | 解决 |
|------|------|
| 上传失败 | 检查 nginx `client_max_body_size` |
| 数据库锁定 | `fuser data/gallery.db` 查看占用进程 |
| 图片不显示 | 检查 `/api/files/` 路由和文件权限 |
| 登录失败 | 检查 `NEXTAUTH_SECRET` 和数据库 |
| 构建失败 | 删除 `.next` 和 `node_modules` 重新安装 |

## 更新部署

```bash
# 本地开发 → 推送到服务器
rsync -avz --exclude 'node_modules' --exclude '.next' \
  -e "ssh -i /Volumes/Mac_mini_ssd/.keys/yxp268_key.pem" \
  ~/gallery-portfolio/ ubuntu@yxp268.top:~/gallery-portfolio/

# 服务器端更新
ssh -i /Volumes/Mac_mini_ssd/.keys/yxp268_key.pem ubuntu@yxp268.top "
  cd ~/gallery-portfolio
  npm install
  npx prisma migrate deploy
  npm run build
  pm2 restart gallery
"
```
