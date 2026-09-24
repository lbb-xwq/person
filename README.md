# 前端开发工程师个人站

## 1. 运行

```bash
npm install
npm run dev        # http://localhost:3000/      （开发不带 basePath，直接开根路径）
npm run build      # 生产构建：静态导出到 out/，资源带 /person 前缀
npm run typecheck  # tsc --noEmit，当前 0 错误
npm run deploy     # 把 out/ 发到 GitHub Pages（+ /person 子路径）
```

关于路径，两个容易踩的坑：

- **本地地址是根路径 `/`，不是 `/person/`**。`lib/base-path.ts` 里
  `BASE_PATH` 只在 `NODE_ENV=production` 时取 `/person`（next.config.ts 的 basePath
  与 `assetPath()` 共用它）。所以 dev 直接开 http://localhost:3000/ ；
  生产产物（`out/`）部署在 GitHub Pages 的 `/person/` 子路径下。
- **`npm start` 用不了**。项目是 `output: 'export'` 纯静态导出，`.next` 里没有
  可启动的生产服务，`next start` 会报 “Could not find a production build”。
  要预览产物就用静态服务器，并把 `out/` 放在名为 `person` 的目录下：

```bash
mkdir -p /tmp/site/person && cp -r out/* /tmp/site/person/ && npx serve /tmp/site
# 然后访问 http://localhost:3000/person/
```

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

## 5. 移动端版式（≤767px 与横屏手机）

桌面版是按 1440×900 视口 1:1 还原的（分屏 50%、像素坐标、68.26% 偏移），
所以移动端不是「缩小」，而是另一套单列版式，集中在 `app/mobile.css`。

断点只有一处定义：`lib/viewport.ts` 的 `MOBILE_QUERY`
`(max-width: 767px), (pointer: coarse) and (max-height: 520px)` ——
后半条是横屏手机（宽 844px 却只有 390px 高，按宽度算会落进桌面版式并互相压叠）。
`mobile.css` 的媒体查询与它逐字一致，JS 侧（ScrollSmoother 是否创建、卡墙是否挂监听）
也读同一个常量。

为什么覆盖层必须用 `!important`：桌面版的定位全写在组件的 inline style 上，
优先级高于任何选择器，只有 `!important` 能改写它。这一层不是「补丁」，
而是被 inline 布局倒逼出来的唯一可行做法（组件里埋 `data-*` 钩子做挂点）。

各页处理：

- 全局：控件簇从「右下 420px 宽」改为右上角紧凑一排（声音 / 菜单 / 齿轮）；
  导航面板从右下胶囊展开改为一屏宽的底部 Sheet；设置面板铺满全宽；
  补 `viewport-fit=cover` 与 `env(safe-area-inset-*)`；关闭 iOS 文字膨胀。
- `/`：`100svh` 单屏绝对定位 → 可自然撑高的单列流（矮机型不裁内容）：
  跑马灯通栏置顶、标题 `clamp(2.25rem,12.5vw,3.25rem)`、开发者数据两列、页脚竖排。
  `clamp` 下限 72px 的桌面巨标题在 390px 下会横向溢出，必须整体下调一档。
- `/projects`：斜向双列卡墙 → 单列全宽卡片 + 原生滚动（`[data-pw-list]`）。
  两列卡墙在 390px 宽下每张卡只剩 ~180px、标题折三行；只有 3 个项目时卡墙也
  没有可滚动的余量，仪表盘会永远停在 000。移动端不挂 wheel / touch / keydown / rAF，
  由系统原生滚动接管。
- `/about`：右上角面包屑（差值混合）挪到左上角，避开控件簇；`≤1024px` 的帧序列
  本来就已经退回到正文流里。
- `/projects/[slug]`：hero 的 `padding-top` 从 10rem 收到 6.5rem；滚动进度条缩短并贴安全区；
  展示网格本来就是 `auto-fit`，窄屏自然落成一列。
- `/contact`、404：本来就是 clamp + 居中，只下调邮箱字号防换行。

滚动行为：移动端**不创建 ScrollSmoother**，退回原生滚动 —— 触屏上它只能带来
「延迟跟手」，代价却是所有 `position:fixed` 浮层要额外补反向位移。
`#smooth-wrapper` 的 `position:fixed;overflow:hidden` 由状态而非媒体查询控制，
否则拿掉 ScrollSmoother 后页面会卡在一个不能滚动的固定框里。

横屏手机（844×390）走同一套移动版式：单列流式布局会变成可滚动的，
而桌面版式在 390px 高的视口里 HUD / 页脚 / 控件簇会互相压叠。

## 6. 目录结构

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
lib/viewport.ts            MOBILE_QUERY（移动端判定的唯一来源）+ watchMobile 订阅助手
lib/data/content.ts        所有文案与数据（替换内容改这里）
lib/audio.ts               Web Audio 音轨 + 音效 + getLevel()
lib/tier.ts                性能档判定
lib/shaders/               GLSL（噪声网格、粒子）
app/fonts、public/images   自托管字体（构建时打包成带哈希产物）与照片占位图
app/mobile.css             移动端版式覆盖层（见第 5 节）
lib/base-path.ts           basePath 常量 + public 资源前缀 helper
