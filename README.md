# Gallery Portfolio

摄影师个人作品集网站 - 自研全栈方案

## 技术栈

- **前端**: Next.js 14 + Tailwind CSS + Framer Motion
- **后端**: Next.js API Routes + Prisma ORM
- **数据库**: SQLite
- **认证**: NextAuth.js
- **图片处理**: Sharp
- **部署**: Docker + nginx + certbot

## 快速开始

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma migrate dev --name init

# 开发服务器
npm run dev

# 打开 http://localhost:3000
```

## 文档

- [架构设计](docs/ARCHITECTURE.md) - 完整的技术架构和数据模型
- [部署指南](docs/DEPLOYMENT.md) - 服务器部署配置

## 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── page.tsx         # 首页
│   ├── series/          # 系列页面
│   ├── admin/           # 后台管理
│   └── api/             # API 路由
├── lib/
│   ├── prisma.ts        # 数据库客户端
│   ├── auth.ts          # 认证配置
│   └── image.ts         # 图片处理
└── components/          # 共享组件

prisma/
└── schema.prisma        # 数据模型

docs/
└── ARCHITECTURE.md      # 架构文档

uploads/                 # 图片存储（gitignore）
data/                    # 数据库（gitignore）
```

## 环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
DATABASE_URL="file:./data/gallery.db"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 开发状态

🚧 开发中 - 基础架构已搭建，正在实现核心功能

## 许可

MIT
