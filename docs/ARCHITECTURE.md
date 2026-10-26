# Gallery Portfolio - 摄影师个人作品集网站

## 项目概述

自研摄影师个人作品集网站，参考 chuweimin.com 的沉浸式体验，包含前端作品集展示和完整的后端管理系统。

## 技术架构

| 层 | 技术 | 职责 |
|----|------|------|
| 前端 | Next.js 14 + Tailwind CSS + Framer Motion | 作品集展示、动画、响应式 |
| 后端 | Next.js API Routes | REST API |
| 数据库 | SQLite + Prisma ORM | 内容存储、类型安全 |
| 认证 | NextAuth (Credentials) | 后台登录 |
| 图片处理 | Sharp | 多尺寸缩略图生成 |
| 部署 | Docker + nginx + certbot | 标准部署流程 |

## 目录结构

```
gallery-portfolio/
├── prisma/
│   └── schema.prisma          # 数据模型
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # 首页
│   │   ├── series/[slug]/     # 系列详情页
│   │   ├── admin/             # 后台管理
│   │   └── api/               # API 路由
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # NextAuth 配置
│   │   └── image.ts           # Sharp 图片处理
│   └── components/            # 共享组件
├── uploads/                   # 图片存储
│   ├── originals/             # 原图
│   ├── thumbnails/            # 缩略图 (400px)
│   ├── medium/                # 中图 (1200px)
│   └── large/                 # 大图 (2400px)
├── data/
│   └── gallery.db             # SQLite 数据库
└── docs/
    └── ARCHITECTURE.md        # 本文档
```

## 数据模型

### Photo
- `id`: string (cuid)
- `title`: string
- `description`: string?
- `location`: string?
- `dateTaken`: DateTime?
- `camera`: string?
- `lens`: string?
- `settings`: string? (如 "f/2.8 1/250s ISO100")
- `originalPath`: string (相对 uploads/)
- `thumbnailPath`: string?
- `mediumPath`: string?
- `largePath`: string?
- `width`: int
- `height`: int
- `fileSize`: int
- `format`: string (jpg, png, etc.)
- `order`: int (排序)
- `isPublished`: boolean
- `seriesId`: string? (外键)
- `createdAt`, `updatedAt`: DateTime

### Series
- `id`: string (cuid)
- `slug`: string (唯一, URL 友好)
- `title`: string
- `subtitle`: string?
- `description`: string?
- `coverPhotoId`: string?
- `order`: int
- `isPublished`: boolean
- `photos`: Photo[] (关系)

### Page
- `id`: string (cuid)
- `slug`: string (唯一, 如 "about", "contact")
- `title`: string
- `content`: string (Markdown)
- `isPublished`: boolean
- `order`: int

### Post
- `id`: string (cuid)
- `slug`: string (唯一)
- `title`: string
- `excerpt`: string?
- `content`: string (Markdown)
- `coverImageId`: string?
- `tags`: string? (逗号分隔)
- `isPublished`: boolean
- `publishedAt`: DateTime?

### Award
- `id`: string (cuid)
- `title`: string
- `year`: int
- `organization`: string?
- `level`: string? (global/asia/national/regional)
- `order`: int

### SiteConfig
- `id`: string (固定 "site")
- `siteName`: string
- `authorName`: string
- `bio`: string?
- `avatarPath`: string?
- `socialLinks`: string? (JSON)
- `seoTitle`, `seoDesc`, `seoKeywords`: string?

### User
- `id`: string (cuid)
- `email`: string (唯一)
- `name`: string?
- `password`: string (bcrypt 哈希)

## 页面结构

### 前端 (公开)
| 路由 | 说明 |
|------|------|
| `/` | 首页 (全屏 Hero + 系列入口) |
| `/series` | 所有系列列表 |
| `/series/[slug]` | 单个系列 (照片网格 + 灯箱) |
| `/about` | 关于我 |
| `/awards` | 获奖列表 |
| `/posts` | 博客/教程列表 |
| `/posts/[slug]` | 文章详情 |
| `/contact` | 联系 |

### 后端 (需登录)
| 路由 | 说明 |
|------|------|
| `/admin/login` | 登录页 |
| `/admin/dashboard` | 仪表盘 |
| `/admin/photos` | 照片管理 (CRUD + 拖拽排序 + 批量上传) |
| `/admin/series` | 系列管理 |
| `/admin/pages` | 页面管理 |
| `/admin/posts` | 文章管理 |
| `/admin/awards` | 奖项管理 |
| `/admin/settings` | 站点设置 |

## API 设计

### 认证
- `POST /api/auth/signin` - 登录
- `POST /api/auth/signout` - 登出
- `GET /api/auth/session` - 获取会话

### 照片
- `GET /api/photos` - 列表 (需认证)
- `POST /api/photos` - 上传 (multipart/form-data)
- `GET /api/photos/[id]` - 详情
- `PUT /api/photos/[id]` - 更新
- `DELETE /api/photos/[id]` - 删除 (同时删除文件)
- `POST /api/photos/reorder` - 批量排序

### 系列
- `GET /api/series` - 列表
- `POST /api/series` - 创建
- `GET /api/series/[id]` - 详情
- `PUT /api/series/[id]` - 更新
- `DELETE /api/series/[id]` - 删除

### 页面/文章/奖项
- 类似 RESTful CRUD

### 文件服务
- `GET /api/files/[...path]` - 提供图片文件 (带缓存头)

## 图片处理流程

```
用户上传 → Sharp 处理 → 生成 4 种尺寸 → 保存到 uploads/
              ↓
         400px thumbnail (WebP)
         1200px medium (WebP)
         2400px large (WebP)
         原图保留 (原格式)
```

## 存储策略

| 内容 | 位置 | 说明 |
|------|------|------|
| 原始照片 | Mac mini SSD `~/Gallery-Photos/` | 主存储，1.6TB |
| Web 用图 | 服务器 `~/gallery-portfolio/uploads/` | 52GB，快速访问 |
| 数据库 | 服务器 `~/gallery-portfolio/data/gallery.db` | 轻量 |
| 备份 | 每月打包 `uploads/` + `data/` → Mac SSD | 增量备份 |

## 部署方案

### 服务器配置
- 域名: `gallery.yxp268.top`
- 服务器: `yxp268.top` (43.159.62.50)
- 部署路径: `~/gallery-portfolio/`
- 端口: 容器内 3000，nginx 反代 443

### nginx 配置
```nginx
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

    client_max_body_size 100M;  # 支持大文件上传

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
```

### Docker Compose (生产)
```yaml
version: "3"
services:
  gallery:
    build: .
    container_name: gallery-portfolio
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    volumes:
      - ./uploads:/app/uploads
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./data/gallery.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=https://gallery.yxp268.top
```

## 开发计划

| 阶段 | 内容 | 预计耗时 |
|------|------|----------|
| 1 | 基础设施：Prisma + Auth + Sharp 工具函数 | 2h |
| 2 | 后端 API：照片/系列/页面/文章/奖项 CRUD | 4h |
| 3 | 后台管理 UI：登录 + Layout + 各模块管理页 | 6h |
| 4 | 前端作品集：首页/系列/灯箱/关于/博客 | 6h |
| 5 | 部署 + nginx + HTTPS + 导航页 | 1h |
| 6 | 优化：动画/SEO/性能/移动端适配 | 4h |

## 已知问题与解决方案

| 问题 | 解决方案 |
|------|----------|
| Next.js 16 与 Prisma 5 兼容性 | 锁定 Next 14 + Prisma 5 |
| next-auth 类型错误 | 使用 `@ts-ignore` 或升级 to Auth.js v5 |
| 图片上传大小限制 | nginx `client_max_body_size 100M` |
| Sharp 内存占用 | 限制并发上传，使用流式处理 |
| 数据库备份 | 定时 `sqlite3 .backup` + rsync |

## 环境变量

```env
# 数据库
DATABASE_URL="file:./data/gallery.db"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# 上传目录
UPLOAD_DIR="./uploads"

# 初始管理员 (首次启动时创建)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="changeme123"
```

## 开发命令

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma migrate dev --name init

# 开发服务器
npm run dev

# 构建
npm run build

# 生产运行
npm start

# 数据库管理
npx prisma studio
```

## 参考项目

- [chuweimin.com](https://chuweimin.com) - 参考对象，React SPA + 复杂 PhotoBridge 工具
- [Piwigo](https://piwigo.org/) - 成熟的开源相册方案
- [PicPeak](https://github.com/PicPeak/picpeak) - 现代摄影师作品集方案

## 许可

MIT License - 可自由使用、修改、分发
