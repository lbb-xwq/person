/**
 * 移动端版式的判定条件 —— 全站唯一来源。
 *
 * 两个条件取并集：
 *  1) `max-width: 767px`：竖屏手机 / 窄窗口，与 Tailwind 的 md 断点对齐；
 *  2) `pointer: coarse` + `max-height: 520px`：横屏手机。
 *     横屏手机宽度是 700–930px，按宽度算会落进桌面版式，而桌面版式在 390px 高的
 *     视口里 HUD、页脚、控件簇会互相压叠（分屏 50% + 固定坐标的前提是 16:9 宽屏）。
 *     加上 `pointer: coarse` 是为了不把「鼠标 + 矮窗口」的桌面环境也切过来。
 *
 * app/mobile.css 里的媒体查询必须与这个字符串逐字一致 —— 那边负责样式，
 * 这里负责 JS（ScrollSmoother 是否创建、卡墙是否挂监听、网格间距取哪档）。
 * 两边不同步就会出现「样式是移动版、行为是桌面版」的错配。
 */
export const MOBILE_QUERY = '(max-width: 767px), (pointer: coarse) and (max-height: 520px)';

/** 在浏览器里订阅该判定（SSR 阶段恒为 false） */
export function watchMobile(onChange: (mobile: boolean) => void): () => void {
  const mq = window.matchMedia(MOBILE_QUERY);
  const handler = () => onChange(mq.matches);
  handler();
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}