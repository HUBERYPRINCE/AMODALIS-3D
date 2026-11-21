# 空象视觉 · AMODALIS 3D

> **空即是象，动而生界 — Where Absence Becomes Monument**  
> 19-World Higher-Dimensional Perceptual WebGL2 / GLSL Engine · Minimalist iOS Liquid Glass UI

- **在线实时 3D/4D 预览（Live Demo）**：https://huberyprince.github.io/AMODALIS-3D/
- **静态跨维度四部曲展厅**：https://huberyprince.github.io/AMODALIS-3D/gallery.html

---

## 核心美学与人类视觉系统（HVS）原理

**空象视觉（AMODALIS）** 融合 Coles Phillips 的 *Fadeaway* 负空间消融、东方「大象无形 / 间（Ma）」留白哲学、James Turrell 的 *Ganzfeld* 无界色场与 Syoyo 的焦茶/奶油复古印刷色律（严禁 `#000000` 纯黑与 `#FFFFFF` 纯白），并推演至 **实时 3D/4D 运动知觉**：

- **零色差深度遮罩（`ΔL = 0` Phantom Holdout Shader）**：隐形巨构主体与墙面逐像素同色，但完整写入深度缓冲，在镜头微动时持续产生 **运动遮挡纹理增删（Kinetic Accretion & Deletion）**，经背侧通路 MT/V5 反馈至初级视皮层 **V2 边界归属（Border Ownership）**。
- **非模态补全（Amodal Completion）× 运动恢复结构（SfM）**：拱窗、螺旋阶梯、行星环、4D 超立方体棱线与绕峰飞鹤在隐形实体背后自然隐没与重现，让人脑在 1–3 秒内凭空构筑宏大的三维/四维空间体量。
- **极简 iOS 液态玻璃交互**：
  - **左侧居中竖版液态玻璃胶囊**：X-Ray 深度壳揭秘（`X`）、3 秒顿悟导演模式（`E`）、动态节律切换（`Space`）、导出高清静帧 PNG。
  - **底部居中超薄透明白色参数条**：`‹ 01/19 作品名 ›`（点击呼出 19 境速览目录，支持左右拖动滑切）+ 实时视皮层微数值（`V2 · AMOD · MT · SfM`）+ 当前复古底色一键复制。
  - **零手势冲突**：单指/鼠标拖拽画布 360° 旋转 3D 视角；触控板双指横扫 / 横向滚轮 / 底部条拖动 / `←` `→` 方向键平滑滑切 19 境（0.45s Ganzfeld 无界色墙过渡）。

---

## 19 境高维空象全集

| # | 象限 | 中文名 / 英文名 | 复古矿物底色 |
| :-: | :--- | :--- | :-: |
| 01 | 神圣巨构 | 虚空巴别塔 · *The Unseen Citadel* | `#79A69D` |
| 02 | 高维拓扑 | 第四维度的折痕 · *The Fold of Dimension IV* | `#EEB241` |
| 03 | 相对论宇宙 | 无形星体与引力潮汐 · *Gravity of the Void* | `#C45448` |
| 04 | 东方宇宙观 | 大象无形 · 孤峰 · *The Formless Peak* | `#F8E9C9` |
| 05 | 高维拓扑 | 克莱因之环 · *Klein Void Manifold* | `#A47A96` |
| 06 | 高维拓扑 | 莫比乌斯悬梯圣殿 · *Möbius Ascent* | `#87AC92` |
| 07 | 高维拓扑 | 二十四胞体星笼 · *24-Cell Hypercage* | `#6F90A8` |
| 08 | 高维拓扑 | 卡拉比-丘弦论折面 · *Calabi-Yau Fold* | `#E58D8C` |
| 09 | 相对论宇宙 | 克尔事件视界 · *Kerr Horizon* | `#DF8952` |
| 10 | 相对论宇宙 | 戴森环穹阵列 · *Dyson Aperture* | `#687849` |
| 11 | 相对论宇宙 | 爱因斯坦-罗森虫洞井 · *Spacetime Throat* | `#7C9EA8` |
| 12 | 相对论宇宙 | 双星洛希潮汐锁 · *Roche Binary Lock* | `#9A6B84` |
| 13 | 神圣巨构 | 虚空万神殿 · *Unseen Pantheon* | `#C6A882` |
| 14 | 神圣巨构 | 逆重力无尽回廊 · *Escher Cloister* | `#CE8C7E` |
| 15 | 神圣巨构 | 荒漠日晷方尖碑 · *Meridian Obelisk* | `#C87653` |
| 16 | 神圣巨构 | 沉没凯旋门与深海巨鲸 · *Abyssal Arch* | `#5F8E94` |
| 17 | 东方宇宙观 | 太初隐形浑天仪 · *Primordial Armillary* | `#859A8B` |
| 18 | 东方宇宙观 | 无形大梵古钟 · *Bell of Silence* | `#B89C6D` |
| 19 | 东方宇宙观 | 天圆地方 · 玉琮祭坛 · *Cong Cosmogram* | `#EBE2CE` |

---

## 目录结构与 GitHub 自动部署说明

```text
.
├── index.html                  # 主入口：AMODALIS 3D 19 境液态玻璃动态引擎
├── gallery.html                # 静态跨维度四部曲无界展厅
├── engine/
│   ├── shaders.js              # ΔL=0 Phantom Holdout / 水平波纹水影 / 日蚀月牙 GLSL 着色器
│   ├── worlds.js               # 19 境总注册表（底色、相机、构图参数，修改此处即可调色或增删场景）
│   ├── worlds_core.js          # 01–04 境（巴别塔、4D 超立方体、引力巨星、孤峰）
│   ├── worlds_topology.js      # 05–08 境（克莱因瓶、莫比乌斯、二十四胞体、卡拉比-丘）
│   ├── worlds_cosmos.js        # 09–12 境（克尔视界、戴森球、虫洞井、双星洛希锁）
│   ├── worlds_architecture.js  # 13–16 境（万神殿、埃舍尔回廊、日晷方尖碑、沉没凯旋门）
│   ├── worlds_east.js          # 17–19 境（浑天仪、大梵古钟、玉琮祭坛）
│   └── app.js                  # 液态玻璃交互、手势滑切、0.45s 色场渐变与 HVS 遥测
├── vendor/                     # 内置离线 Three.js r160 ESM，零外网 CDN 依赖
├── images/                     # 静态四部曲高清成图
├── 01_BLEND_ART_Style_Bible.md
├── 02_HigherDim_Prompt_System.md
├── 03_AMODALIS_NeuroAesthetics_Manifesto.md
└── .github/workflows/deploy-pages.yml
```

### 后续修改与自动发布
本项目已配置 GitHub Actions 自动部署流水线（`.github/workflows/deploy-pages.yml`）：
- 无论是直接在 **GitHub 网页端** 修改 `index.html` / `engine/*.js`，还是在本地 `git push origin main`，都会在约 20 秒内自动重新构建并更新在线公共地址 `https://huberyprince.github.io/AMODALIS-3D/`。
- 本地离线开发：直接运行 `python3 -m http.server 8765` 或双击 `启动空象3D展厅.command` 即可预览。
