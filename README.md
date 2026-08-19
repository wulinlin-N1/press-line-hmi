# web-HMI

印刷生产线 Web 人机界面（HMI）前端原型。设计分辨率 **1920×1080**，按工控屏触控规范实现整机浏览、走料示意、套色偏差和锁定色标等画面。

当前数据来自前端模拟器（`setInterval` 刷新），**未对接控制器**。画面绑定的是机台状态，模拟器只负责造数，便于无真机时开发界面。

## 功能

### 整机浏览

- 顶栏：工单号、料宽、联动状态、车速、运行指示
- 收放卷直径、收料长度、摆臂位置
- SVG 整线走料图：放卷 → 10 个印刷色组 → 收卷
- 色组状态：运行 / 停止 / 报警；点击色组打开详情
- 套色偏差条（2～10 号色组）
- 开机 / 停机（二次确认）

### 锁定色标

底部导航「套色偏差」打开模态框：

- 选择印刷单元（PU2～PU10）
- 首色 / 前色 / 本色标记
- Canvas 观察窗口：点击放置三色标框，波形按 `exp(−t⁴)` notch 模拟
- 窗口位置、版辊微调
- 本色 / 前色 / 首色的纵横向色标表

### 尚未实现

底部导航中的锁定色标、张力设定、生产统计、报警监控，以及主区「准备参数」「配方操作」，目前为占位。

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 语言 | TypeScript |
| 构建 | Vite 5 |
| 质量 | ESLint、Prettier、`vue-tsc` |

无路由、无 UI 组件库、无后端。状态通过 `provide` / `inject` 下发。

## 架构

```
控制器 / 网关          ← 尚未接入
        ↓
通信层（适配器）        ← 目前为 useLineSimulator 定时造数
        ↓
机台状态（车速、色组、张力、套色偏差、报警计数）
        ↓
Vue 画面
```

- **设计画布**：`MainContainer` 按 1920×1080 缩放，适配不同窗口
- **状态入口**：`views/Index.vue` 调用 `useLineSimulator()` 并 `provide`
- **模拟周期**：整机数据 1s 刷新；色标波形约 500ms 重绘（动画时钟，不是工艺扫描周期）

真机对接时，用 WebSocket / MQTT 等适配器替换模拟器，画面仍绑定同一份状态即可。

## 目录

```
src/
├── App.vue                          # 1920×1080 容器
├── main.ts
├── types/index.ts                   # 机台、色标、InjectionKey
├── composables/
│   └── useLineSimulator.ts          # 整机模拟数据
├── views/
│   └── Index.vue                    # 顶栏、底栏、主区、色标弹层
├── components/
│   ├── container/Index.vue          # 大屏等比缩放
│   ├── mainPanel/                   # 整机浏览
│   │   ├── Index.vue
│   │   ├── MachineOverview.vue      # 收放卷 / 摆臂 / 摘要
│   │   ├── MaterialFlowDiagram.vue
│   │   └── line/                    # SVG 走料线、色组、套色条
│   └── markLock/                    # 锁定色标
└── utils/
    ├── buildWebPath.ts              # 整线穿料 SVG path
    ├── calcMarkBoxLines.ts          # 三色标框位置
    └── common.ts                    # debounce
```

## 快速开始

需要 Node.js 18+。

```bash
npm install
npm run dev
```

浏览器打开终端提示的本地地址（默认 `http://localhost:5173`）。建议窗口接近 16:9，以便缩放后接近工控屏效果。

```bash
npm run build        # 类型检查 + 生产构建
npm run preview      # 预览 dist
npm run type-check   # 仅类型检查
npm run lint         # ESLint
npm run format       # Prettier
```

## 交互说明

| 操作 | 行为 |
| --- | --- |
| 整机状态栏「停机 / 开机」 | 二次确认后切换运行；停机后色组停止走料动画 |
| 点击色组 | 打开单元详情（状态、油墨、套色偏差等） |
| Esc | 关闭详情或锁定色标弹层 |
| 底部「套色偏差」 | 打开锁定色标 |
| 观察窗口单击 | 按本色 / 前色 / 首色间距放置三框（拖动超过 8px 不放置） |

## HMI 约定

- 设计稿 1920×1080，`transform: scale` 铺满视口
- 按钮最小点击区域 **60×60px**（`--btn-size`）
- 深色工业风，数值使用等宽数字（`tabular-nums`）
- `touch-action: manipulation`，避免触控双击缩放

## 许可证

私有项目，未声明开源许可。
