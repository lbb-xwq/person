import type { Metadata, Viewport } from 'next';

import './globals.css';
// 移动端版式单独成文件：globals.css 是「桌面还原」的冻结基线，
// 所有 ≤767px 的覆盖集中在 mobile.css，改版式不用在 900 行里翻找。
import './mobile.css';

import CustomCursor from '@/components/shell/CustomCursor';
import FpsMeter from '@/components/shell/FpsMeter';
import HeaderControls from '@/components/shell/HeaderControls';
import Hydrate from '@/components/shell/Hydrate';
import NavOverlay from '@/components/shell/NavOverlay';
import Preloader from '@/components/shell/Preloader';
import Providers from '@/components/shell/Providers';
import RouteTransition from '@/components/shell/RouteTransition';
import SettingsPanel from '@/components/shell/SettingsPanel';
import SmoothScroll from '@/components/shell/SmoothScroll';
import { meta } from '@/lib/data/content';

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  applicationName: meta.siteName,
  authors: [{ name: meta.copyright }],
};

/**
 * 视口声明。
 *  - width=device-width：不要用 980px 的虚拟视口去缩排版
 *  - viewportFit=cover：刘海屏/手势条区域交给 env(safe-area-inset-*) 处理（见 mobile.css）
 *  - themeColor：移动端浏览器地址栏与页面底色一致，不出现白条
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020202',
};

/**
 * 首帧前生效的主题/动效脚本。
 *
 * 为什么要内联而不是等 Hydrate：React 挂载要等 JS 下载执行完，
 * 那期间 <html> 上还没有 data-theme，浅色主题会先闪一帧黑（或反过来）。
 * 这段脚本与 Hydrate 读同一批 localStorage key（theme / motion），
 * 只是把生效时机提前到浏览器解析 HTML 时。CSP 拦掉了它也不会坏 —— Hydrate 有同样的兜底。
 */
const BOOT_SCRIPT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t='dark';}var m=localStorage.getItem('motion');if(m!=='full'&&m!=='reduced'){m=(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)?'reduced':'full';}d.setAttribute('data-theme',t);d.setAttribute('data-motion',m);if(m==='reduced'||!(window.matchMedia&&window.matchMedia('(hover: hover) and (pointer: fine)').matches)){d.removeAttribute('data-cursor');}else{d.setAttribute('data-cursor','custom');}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="dark" data-motion="full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        <Providers>
          <Hydrate />

          {/*
            ScrollSmoother 需要 wrapper/content 这一层固定结构；
            wrapper 的样式由 SmoothScroll 注入（减少动效时不注入，退回原生滚动）。
          */}
          <SmoothScroll>
            <div id="smooth-wrapper">
              <div id="smooth-content">{children}</div>
            </div>
          </SmoothScroll>

          <HeaderControls />
          <NavOverlay />
          <SettingsPanel />
          <CustomCursor />
          <FpsMeter />
          <RouteTransition />

          {/* 全屏遮罩层放在最后：即使 z-index 相同的极端情况它也压在内容之上 */}
          <Preloader />
        </Providers>
      </body>
    </html>
  );
}
