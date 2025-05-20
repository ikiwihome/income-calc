# 第一阶段：构建阶段
FROM node:20-alpine AS builder

# 安装pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 复制包管理文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖（包括devDependencies）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建生产版本
RUN pnpm run build

# 第二阶段：运行阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 从构建阶段复制构建输出和运行时依赖
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/node_modules /app/node_modules

# 设置环境变量
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 暴露端口
EXPOSE 3000

# 设置非root用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtuser && \
    chown -R nuxtuser:nodejs /app

USER nuxtuser

# 启动应用
CMD ["node", "/app/.output/server/index.mjs"]
