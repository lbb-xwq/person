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
 */
export const BASE_PATH = '/person';

/** 给 public/ 下的静态资源路径加上 basePath 前缀 */
export function assetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
