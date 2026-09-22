import type { NextConfig } from 'next';

// 单一来源：basePath 与代码里给 public/ 资源加前缀用的是同一个常量
import { BASE_PATH } from './lib/base-path';

const nextConfig: NextConfig = {
  reactStrictMode: false, // 动画站点关掉严格模式的双次挂载，避免时间线被初始化两次
  eslint: { ignoreDuringBuilds: true },
  // 托管在 GitHub Pages 项目站点：https://lbb-xwq.github.io/person/
  // basePath 会把 _next/ 资源和 next/link 生成的路由都带上 /person 前缀
  basePath: BASE_PATH,
  // GitHub Pages 只托管静态文件，需要纯静态产物
  output: 'export',
  // 导出成 about/index.html 这类目录结构，Pages 上的无扩展名 URL 才会稳定命中
  trailingSlash: true,
  // 静态导出没有 Next 的图片优化服务，必须关掉
  images: { unoptimized: true },
};

export default nextConfig;
