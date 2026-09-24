'use client';

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollSmoother from 'gsap/ScrollSmoother';

import { useStore, sel } from '@/lib/store';
import { MOBILE_QUERY, watchMobile } from '@/lib/viewport';

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

/**
 * ScrollSmoother 需要的结构样式。
 * globals.css 是冻结文件，所以由组件在启用平滑滚动时注入：
 * wrapper 变成固定视口，content 在里面被 translate —— 这就是"整页跟着鼠标滚轮缓动"的原理。
 *
 * 用组件状态而不是媒体查询控制这条样式是否注入：
 * wrapper 一旦是 `position:fixed + overflow:hidden`，页面就再也不能滚动；
 * 而移动端（包括横屏手机：宽 844px 但只有 390px 高）是不创建 ScrollSmoother 的，
 * 这时必须连这条样式一起拿掉。媒体查询很难表达「非 MOBILE_QUERY」这个条件
 * （要 MQ Level 4 的 not (...)），直接用同一个 narrow 状态最稳。
 */
const SMOOTHER_CSS = `
#smooth-wrapper {
  overflow: hidden;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
}
#smooth-content {
  overflow: visible;
  width: 100%;
}
`;

export type SmoothScrollProps = { children: React.ReactNode };

/**
 * 平滑滚动容器。
 *
 * 三个关键决定：
 *  1) motion === 'reduced' 时根本不创建 ScrollSmoother —— 减少动效的用户要的是"滚动立刻跟手"，
 *     而 ScrollSmoother 的本质就是延迟跟手，这两件事无法共存；
 *  2) 窄屏（≤767px 与横屏手机）同样不创建，改用原生滚动。移动端启用它只有两个后果：
 *     触屏滚动被延迟跟手（smoothTouch）而不跟手，以及所有 position:fixed 浮层
 *     要额外补反向位移；而收益（滚轮缓动）在触屏上根本用不到。
 *     用 state 而不是创建时读一次宽度：旋屏后能从原生滚动切回缓动；
 *  3) 用 requestAnimationFrame 延后一帧创建：ScrollSmoother 通过测量 wrapper/content 的尺寸
 *     来建立滚动高度，必须等字体与首屏布局落地后再量，否则高度算错（页面底部会拉不到）。
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  const motion = useStore(sel.motion);
  /** 窄屏判定；旋屏时要能切换，所以是 state 而不是创建时读一次 */
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    return watchMobile(setNarrow);
  }, []);

  useEffect(() => {
    if (motion === 'reduced' || narrow) return;

    let smoother: ScrollSmoother | null = null;
    const rafId = window.requestAnimationFrame(() => {
      const wrapper = document.getElementById('smooth-wrapper');
      const content = document.getElementById('smooth-content');
      // 已经有实例就不再创建：ScrollSmoother 全局只允许一个
      if (!wrapper || !content || ScrollSmoother.get()) return;
      // 双保险：watchMobile 的状态更新可能晚于这一帧，那时再创建就会立刻被 kill
      if (window.matchMedia(MOBILE_QUERY).matches) return;

      smoother = ScrollSmoother.create({
        wrapper,
        content,
        smooth: 1,
        effects: true,
        normalizeScroll: true,
        smoothTouch: 0.1,
      });

      // 首屏尺寸确定后再刷一次，保证 ScrollTrigger 的起点/终点正确
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      // kill 会把 wrapper/content 的内联样式还原，切到 reduced motion 时能回退成原生滚动
      smoother?.kill();
    };
  }, [motion, narrow]);

  return (
    <>
      {motion === 'reduced' || narrow ? null : (
        <style dangerouslySetInnerHTML={{ __html: SMOOTHER_CSS }} />
      )}
      {children}
    </>
  );
}
