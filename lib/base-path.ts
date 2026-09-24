/**
 * 站点部署的子路径。
 *
 * 必须和 next.config.ts 里的 basePath 保持一致（那边直接 import 这个常量）。
 *
 * 为什么需要这个模块：basePath 只会重写 Next 自己管理的资源 —— _next/* 静态产物、
 * next/link 生成的路由。代码里手写的绝对路径（例如 public/ 下图片的 '/images/xxx.png'）
 * 不会被自动加前缀，部署到子路径后就会 404。
 *
 * 注意 CSS 里的 url() 走的是另一条路：那些字体文件放在 app/fonts/ 下用相对路径引用，
 * 由 Next 打包成带哈希的构建产物并自动加 basePath 前缀，所以不需要这个 helper。
 *
 * 为什么加 isProduction 判断：
 * GitHub Pages 项目站部署在 /person/ 下，生产构建必须带前缀；但开发时带前缀只会添乱 ——
 * `npm run dev` 打开 http://localhost:3000/ 会得到一个 404（真正的页面在 /person/），
 * 而 next/link 生成的链接又都指向 /person/…，本地看什么都像坏了。
 * 所以：生产（next build，NODE_ENV=production）用 '/person'，开发用 ''。
 * next.config.ts 与 assetPath() 共用这一个常量，两边不会跑偏。
 */
export const BASE_PATH = process.env.NODE_ENV === 'production' ? '/person' : '';

/** 给 public/ 下的静态资源路径加上 basePath 前缀 */
export function assetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
