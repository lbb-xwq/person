# 前端开发工程师个人站

## 1. 运行

npm install
npm run dev        # http://localhost:3000
npm run build      # 生产构建
npm run typecheck  # tsc --noEmit，当前 0 错误
进入页面先看到开机序列，点 CLICK TO ENTER 揭幕（这一步同时获得用户手势权限，用于启动音频引擎）。

## 2. 技术栈（与参考站对齐）

- Next 15.5.4 App Router + React 19.2.8（参考站是 Next + React 19）
- gsap 3.15.0，含 ScrollTrigger / ScrollSmoother / Observer / ScrambleTextPlugin（与参考站版本号一致）
- three 0.180.0 + @react-three/fiber 9.7.0（与参考站版本号一致）
- zustand 5 状态、Tailwind 3.4.19 样式；平滑滚动用 ScrollSmoother（smooth 1、effects、normalizeScroll、smoothTouch 0.1）
- React 锁在 19.2.8：@react-three/fiber 9.7 的 peer 要求是 >=19 且 <19.3

## 3. 界面清单

全局浮层与组件：

- Preloader：4x4 共 16 块面板（列 repeat(2,1fr) repeat(2,1fr)、行 repeat(4,1fr)，1px 缝隙）+ INITIALIZING_ENGINE 百分比 + 逐条启动日志；点击后 16 块斜向错开上滑揭幕（0-150ms 错开、0.78s、cubic-bezier(.83,0,.17,1)），4 秒兜底不会卡住
- HeaderControls 固定顶栏（品牌 + MENU / SOUND / SYS）；NavOverlay 编号导航 01-04，hover 用 SVG pathLength 与 stroke-dashoffset 画线
- SettingsPanel（System / Global_Config）：[01] 主题 Dark/Light、[02] 音频开关 + 3 条程序化合成音轨、[03] 性能档 High/Medium/Saver，三项都真实生效并写入 localStorage
- CustomCursor：canvas 拖尾（最近 400ms 折线、末端 1.8px 圆点）+ 32x32 十字准星；静止即停止 rAF
- SmoothScroll 接管滚动；RouteTransition 路由切换做 blur(24px) 入场并回到顶部；FpsMeter 每 800ms 写入实测 FPS 与 DPR

路由：

- / 单屏 100svh：噪声网格背景 + 左半屏毛玻璃面板（内含粒子场与 3:4 照片画框）+ 1px 扫描线 + 中央两行巨标题（clamp(2.5rem,11vw,4.5rem)、line-height .84、扫光 sync-scan）+ INFO_LOG + 右上跑马灯栈 6 行 + 右 75% 处 Developer Stats HUD（进度条、数字滚动、终端块，含真实 tier / FPS / DPR）+ 底部「想聊聊？/ Local Time + 实时时钟」
- /about：右上固定大标题（mix-blend-difference）+ 上下渐变遮罩 + 右侧固定 402x600 canvas 的 40 帧序列（ScrollTrigger start top top、end +=1600、scrub 0.5，实时显示帧号）+ 6 个 sector 长文块 + 结尾 CTA
- /projects：单屏不滚动，wheel 与触摸事件累积位移 + 惯性平滑驱动斜向卡墙（约 -8 度、两列错开），左侧高度计指针 00-100；卡片 hover 出现扫描线与 ARCHIVE_REF 角标；键盘上下 / 翻页 / Home / End 可浏览
- /projects/[slug]：6 个静态详情页，hero（左文案 / 右 dossier）→ 右上标题滚动缩放 → 左下滚动进度 00-100 → 2 列 16:9 展示网格（点击开对话框，Esc 关闭 + 焦点归还）→ 图片跑马灯带 → 下一项目大卡
- /contact 单屏居中；404 页超大 404 字 + 扫描线 + 返回首页胶囊

## 4. 无障碍与性能

- 键盘：导航浮层编号跳转、Esc 关闭所有浮层、项目墙用上下 / 翻页 / Home / End、对话框焦点归还、focus-visible 可见轮廓
- prefers-reduced-motion 与面板里的 Motion: Reduced 都生效：开机动画、扫描线、光标拖尾、惯性滚动、滚动揭示、粒子与噪声 canvas 全部关闭或退化为静态
- 性能档 Saver：不创建 WebGL canvas（改用纯 CSS 网格背景）、降低粒子数、关闭滚动擦洗（只画第 1 帧）
- 页面隐藏时停止 FPS 采样与 WebGL 渲染循环；光标静止时停止 rAF；所有监听 / rAF / GSAP 时间线 / ScrollTrigger / three 资源在卸载时清理

## 5. 目录结构

app/                       路由（layout / page / about / projects / projects/[slug] / contact / not-found / icon.svg）
components/shell/          全局外壳：Preloader、HeaderControls、NavOverlay、SettingsPanel、CustomCursor、
SmoothScroll、RouteTransition、FpsMeter、Hydrate、Providers
components/home/           首页：Hero、HeroPanel（毛玻璃 + 照片）、HeroCenter（巨标题 / INFO_LOG）、HeroHud
components/about/          关于页：FrameSequence（40 帧）、FixedTitle、SectorList、ViewportLayer、AboutClient
components/projects/       项目墙：ProjectWall、ProjectCard、AltitudeGauge、ProjectArt
components/project/        详情页：ProjectDetail、ShowcaseGrid、ScrollTitle、ScrollProgress、MarqueeRow、
NextProjectLink、useFixedPin
components/canvas/         NoiseGridBackground、HeroParticles
components/ui/             ScrambleText、Marquee、Reveal
lib/store.ts               zustand 状态（entered/menu/settings/audio/track/theme/motion/tier/fps/dpr）
lib/data/content.ts        所有文案与数据（替换内容改这里）
lib/audio.ts               Web Audio 音轨 + 音效 + getLevel()
lib/tier.ts                性能档判定
lib/shaders/               GLSL（噪声网格、粒子）
app/fonts、public/images   自托管字体（构建时打包成带哈希产物）与照片占位图
lib/base-path.ts           basePath 常量 + public 资源前缀 helper
