# 「高维 BLEND ART」可复用 Prompt 工程系统与四部曲企划

本文件沉淀一套可直接用于 **Gemini Imagen / Midjourney / Flux / SDXL** 的结构化提示词公式，并提供首批 **「跨维度四部曲（Tetralogy of the Unseen）」** 完整创作脚本。

---

## 一、通用大师级 Prompt 结构公式（6 段锁死法）

为防止 AI 模型在面对“高维/宇宙/建筑”题材时跑偏到 3D 科幻或自动补全外轮廓，请严格按以下 6 段结构组装 Prompt：

```text
[1. 风格与媒介锚定]
Flat 2D mid-century editorial art poster illustration in the Coles Phillips "fadeaway" negative-space figure-ground merge style, Wes Anderson symmetrical composition, matte gouache flat color fills with uniform fine vintage print paper grain texture.

[2. 纯色基底与零对比主体声明]
The entire background is a completely flat, solid, unshaded [主底色 + 色值描述]. Centered in the frame is a colossal invisible [高维主体名称] whose main body and outer surfaces are 100% the EXACT SAME flat [主底色] as the background, with ZERO outer contour lines, ZERO edge outlines, ZERO tonal separation, and ZERO gradient shading—causing the giant form to completely dissolve into the backdrop.

[3. 唯一可见的 2–3 个格式塔锚点（核心灵魂）]
The colossal hidden silhouette is revealed ONLY through three surgical visual cues drawn in deep burnt-tea espresso brown (#2C1914) and warm ivory cream (#F5EBD6):
(1) [锚点 A：例如背景图纹/星图遮断或水面倒影]
(2) [锚点 B：例如透视窗列/行星环前穿后隐/折痕刻度]
(3) [锚点 C：例如焦茶色硬边投影或极微尺度飞鸟/孤舟]

[4. 严格色板锁定]
Strict limited vintage color palette: [主底色], deep burnt-tea espresso brown ink for all dark lines and hard shadows (strictly NO pure black), warm ivory cream for highlights (strictly NO pure white), and minimal [点缀色] accents.

[5. 构图与呼吸感]
Generous empty negative space around the centered monumental subject, calm surreal philosophical grandeur, museum-quality graphic design poster, 3:4 vertical aspect ratio.

[6. 绝对负向约束]
NO closed outer outline around the main [主体], NO human figures, NO people, NO anime characters, NO 3D rendering, NO photorealism, NO glowing neon, NO bloom, NO soft gradients, NO airbrush shading, NO pure black (#000000), NO pure white (#FFFFFF).
```

---

## 二、首批「跨维度四部曲」完整画面企划与 Prompt

### 作品 01｜维度 A：高维拓扑与时空几何
- **作品名**：《第四维度的折痕 / THE FOLD OF DIMENSION IV》
- **文件**：`images/01_tesseract_fold.jpg`（实测底色 `#EEB241`）
- **主底色**：芥末暖黄 `#F6C365`
- **锚点组合**：背景坐标格与巨字 `DIMENSION IV` 精准遮断 + 右侧焦茶色硬边超立方体投影 + 紧裹隐形棱角的暖奶油色立体折带与内折刻度线
- **3 秒脑补路径**：第 1 秒看到飘在黄纸上的奶油色折纸带、刻度与暗影；第 2 秒注意到斜向浅黄网格与字母在画面中央被整齐“切空”；第 3 秒一座悬浮在虚空中的巨大四维超立方体赫然浮现。

```text
Flat 2D mid-century editorial art poster illustration using the Coles Phillips fadeaway negative-space figure-ground merge technique, Wes Anderson dead-center symmetrical composition, uniform fine matte vintage gouache paper grain texture across the entire canvas, 3:4 vertical poster.

The entire background is a completely flat, solid, unshaded warm retro mustard yellow (#F6C365). Floating monumentally in the center is a colossal invisible 4D hypercube (tesseract monolith) tilted in crisp isometric perspective. The entire body, faces, and outer boundaries of this giant cube are filled with the EXACT SAME flat matte mustard yellow (#F6C365) as the background—with ZERO outer contour lines, ZERO dark outlines around its silhouette, and ZERO shading or color difference between the cube and the backdrop.

The viewer's brain discovers the invisible 4D monolith ONLY through four precise graphic cues drawn strictly in deep burnt-tea espresso brown (#2C1914) and warm ivory cream (#F5EBD6):
1. Background occlusion: Across the flat mustard background run subtle, low-contrast pale-gold (#FCE09E) diagonal geometric coordinate ruling lines and huge faint diagonal sans-serif editorial lettering reading "DIMENSION IV", all of which stop abruptly and are cleanly masked out wherever they hit the invisible hexagonal/cubic silhouette of the hidden monolith.
2. Hard-edged cast shadow: Offset cleanly to the lower right of the invisible monolith is a crisp, flat, hard-edged deep espresso-brown (#2C1914) geometric cast shadow revealing the dramatic outer corner profile and nested inner core of the hypercube.
3. Wrapping slice anchor: A single tactile warm ivory cream (#F5EBD6) folded paper-like ribbon band wraps tightly diagonally across the invisible monolith's middle, making a crisp 90-degree crease right over the invisible front vertical edge—proving the solid invisible corner beneath it.
4. Internal precision ticks: A delicate vertical row of tiny espresso-brown astronomical tick-marks and minimal mitered corner hinge brackets floating in isometric space, plus two slender espresso-and-terracotta (#C86446) orbital rings piercing into one invisible face and emerging from the other.

Strict color discipline: ONLY warm mustard yellow, pale gold, deep burnt-tea espresso brown (NO pure black), warm ivory cream (NO pure white), and subtle muted terracotta. Completely flat 2D graphic poster aesthetic with fine analog print tooth. NO closed outline around the cube, NO human figures, NO characters, NO 3D render, NO metallic reflection, NO glowing neon, NO bloom, NO gradients, NO photorealism.
```

---

### 作品 02｜维度 B：超现实纪念碑建筑与阈限空间
- **作品名**：《虚空巴别塔 / THE UNSEEN CITADEL》
- **文件**：`images/02_invisible_babel.jpg`（实测底色 `#79A69D`）
- **主底色**：雾霭青绿 `#74ADA4`
- **锚点组合**：静水下方完整的深青色建筑扭曲倒影 + 沿隐形圆柱螺旋攀升的焦茶色拱窗列与悬空阶梯 + 塔顶迎风飘扬的焦茶色双旗 + 微小孤舟与飞鸟
- **3 秒脑补路径**：第 1 秒看到青绿虚空中悬浮着几排精巧小拱窗、悬空旋梯和顶端的旗帜；第 2 秒目光落到水面，赫然看见一座完整巍峨的巨塔与穹顶倒映在水中；第 3 秒视线回扫上方空白，整座通天巴别塔瞬间在虚空中拔地而起。

```text
Flat 2D mid-century editorial art poster illustration using the Coles Phillips fadeaway negative-space figure-ground merge technique, Wes Anderson dead-center symmetrical composition, uniform fine matte vintage lithograph paper grain texture across the entire canvas, 3:4 vertical poster.

The entire background sky and tranquil sea are a single completely flat, solid, unshaded muted vintage sage-teal (#74ADA4). Rising monumentally along the central vertical axis from the lower water surface is a colossal invisible cylindrical Babel tower topped by a grand classical dome. Every single exterior wall, column surface, and dome face of the massive tower is 100% the EXACT SAME flat matte sage-teal (#74ADA4) as the sky—with ZERO exterior wall outlines, ZERO silhouette lines, and ZERO sky-to-stone color separation.

The colossal invisible architecture is revealed ONLY through four poetic, razor-crisp graphic anchors drawn in deep burnt-tea espresso brown (#2A1713), warm ivory cream (#F6ECD7), and tiny warm ochre-terracotta (#D98A4E) accents:
1. Waterline reflection: The bottom quarter of the poster is calm water of the same sage-teal color, marked only by minimal stylized flat cream-and-teal ripple rings. Beneath the waterline stretches a full, unmistakable, gently rippling darker-teal (#4B817B) inverted silhouette reflection of the ENTIRE colossal cylindrical tower and grand dome.
2. Curved architectural anchors: Floating in exact cylindrical perspective across the empty sage-teal sky are ONLY small crisp dark espresso-brown recessed arched windows arranged in gentle upward-curving rows (narrowing subtly toward the invisible left and right cylinder edges), one bold espresso-brown arched sea-gate at the base waterline, and a delicate exterior spiraling staircase with dark railing climbing upward across empty space and cleanly vanishing behind the invisible right edge of the cylinder.
3. Summit crown & wind: High near the top center sits a tiny ornate espresso-and-cream cupola finial crowning the invisible dome, with two long slender dark espresso-brown banners fluttering crisply to the right in an unseen wind.
4. Monumental scale cues: Two minuscule warm ivory cream sailboats drifting calmly near the water's edge and five tiny espresso-brown birds circling high around the invisible upper spire.

Strict color discipline: flat sage-teal, deeper reflection teal, deep burnt-tea espresso brown (NO pure black), warm ivory cream (NO pure white), tiny ochre accents. Completely flat 2D graphic poster illustration with fine vintage paper grain. NO outer wall contour lines on the tower, NO sky gradients, NO clouds, NO human figures, NO 3D rendering, NO volumetric lighting, NO photorealism.
```

---

### 作品 03｜维度 C：宇宙天文与不可见自然伟力
- **作品名**：《无形星体与引力潮汐 / GRAVITY OF THE VOID》
- **文件**：`images/03_silent_orbit.jpg`（实测底色 `#C45448`）
- **主底色**：陶土砖红 `#C95A57`
- **锚点组合**：被隐形球体彻底裁断的浅粉星图经纬网与斜向巨字 `GRAVITY` + 前穿后隐的焦茶与奶油色行星光环 + 曲面波点经纬阵 + 右下缘极细焦茶色日蚀月牙暗边
- **3 秒脑补路径**：第 1 秒看到一道斜穿陶红纸面的精致双色光环与星尘波点；第 2 秒发现光环在后半段凭空断折，且背景的古星图与 `GRAVITY` 字母被一个巨大正圆干净地切去；第 3 秒一颗沉重无比的隐形巨行星在画面中央产生了真实的引力压迫感。

```text
Flat 2D mid-century editorial art poster illustration using the Coles Phillips fadeaway negative-space figure-ground merge technique, Wes Anderson symmetrical centered composition, uniform fine matte vintage gouache print paper grain texture across the entire canvas, 3:4 vertical poster.

The entire background is a completely flat, solid, unshaded muted vintage terracotta-coral red (#C95A57). Suspended monumentally just above dead center is a colossal invisible celestial planet sphere. The entire spherical body of the planet is 100% the EXACT SAME flat matte terracotta red (#C95A57) as the background—with ZERO circular outline, ZERO rim light, ZERO atmospheric glow, and ZERO spherical shading.

The colossal invisible planet is revealed ONLY through four crisp, hypnotic graphic cues drawn in deep burnt-tea espresso brown (#2B1612), warm ivory cream (#F6ECD7), and low-contrast pale salmon-pink (#DE7A74):
1. Celestial chart & typography occlusion: Spanning the flat terracotta background is a subtle, low-contrast pale-salmon (#DE7A74) antique astronomical coordinate chart with fine straight celestial gridlines and huge faint diagonal retro sans-serif typography reading "GRAVITY". Wherever this background chart and lettering intersect the massive circular zone of the invisible planet, every single line and letter is cleanly, sharply cut off and masked out—carving a pure empty terracotta disc out of the chart.
2. Wrapping planetary rings: A razor-sharp, grand tilted planetary ring system rendered in flat concentric bands of deep espresso-brown (#2B1612) and warm ivory cream (#F6ECD7) sweeps boldly across the FRONT of the invisible planet, then abruptly terminates and vanishes cleanly BEHIND the invisible planet's hidden back edges, proving a solid massive sphere occupies the void.
3. Spherical surface dots & thin eclipse crescent: Scattered across the invisible planet's front face are sparse, tiny warm-cream (#F6ECD7) surface meridian dots that follow true spherical curvature (slightly denser and more foreshortened near the invisible edges), anchored by ONE single razor-thin, flat deep espresso-brown hard-edged crescent shadow tucked strictly along the lower-right rim curve.
4. Orbiting moons: Two tiny warm-cream and espresso-brown moons tracing delicate crisp elliptical ink arcs around the invisible giant.

Strict color discipline: muted terracotta red, pale salmon-pink, deep burnt-tea espresso brown (NO pure black), warm ivory cream (NO pure white). Pure flat 2D vintage print illustration with fine paper tooth. NO outer circle outline around the planet, NO dark black outer space, NO glowing stars, NO nebula, NO lens flare, NO 3D CGI render, NO soft gradients, NO human figures.
```

---

### 作品 04｜维度 D：东方哲思与器物文明（大象无形）
- **作品名**：《大象无形·孤峰 / THE FORMLESS PEAK》
- **文件**：`images/04_formless_peak.jpg`（实测底色 `#F8E9C9`）
- **主底色**：暖奶油宣纸 `#F5ECD5`
- **锚点组合**：仅生长在隐形山体廓形内的焦茶/苔绿古松与微型朱砂亭阁（呼应 Syoyo 花卉风衣） + 被隐形山脊裁切一半的扁平朱砂红日 + 山脚静潭暗影倒影 + 盘旋飞鹤
- **3 秒脑补路径**：第 1 秒看到暖米色纸面上错落点缀着清雅古松、几缕金缮般的岩脊暗线与半轮红日；第 2 秒意识到红日左侧被一条看不见的斜线干净切开，水面下倒映着完整的尖峰；第 3 秒一座顶天立地的东方隐形圣山在留白中巍然矗立——真正实现“大象无形”。

```text
Flat 2D mid-century editorial art poster illustration fusing the Coles Phillips and Syoyo BLEND ART fadeaway negative-space technique with Eastern "Formless Greatness" (大象无形) Zen minimalism, Wes Anderson symmetrical composition, uniform fine warm Japanese print paper grain texture across the entire canvas, 3:4 vertical poster.

The entire background is a completely flat, solid, unshaded warm vintage ivory cream (#F5ECD5). Rising symmetrically and majestically in the center of the poster is a colossal invisible sacred mountain peak. The entire rocky mass, slopes, and outer ridge contours of the mountain are 100% the EXACT SAME flat warm ivory cream (#F5ECD5) as the background—with ZERO outer mountain outline, ZERO ink wash gradients, and ZERO tonal separation from the sky.

The towering invisible mountain peak is revealed ONLY through four exquisite flat graphic anchors drawn in deep burnt-tea espresso brown (#2B1811), muted olive-moss green (#5C6B3F), muted vermilion-rust red (#C6543A), and antique ochre gold (#C99746):
1. Botanical & temple surface field: Distributed strictly within the invisible triangular faceted silhouette of the mountain are delicate, crisp, flat hand-drawn dark-espresso and olive-moss pine trees, two tiny muted-vermilion traditional pavilion roofs perched on invisible cliff ledges, and a few sparse razor-fine antique ochre-gold kintsugi-like geological ridge fracture lines that stop cleanly along the invisible slopes.
2. Eclipsed vermilion sun disc: Positioned behind the upper-right slope of the invisible peak is a flat, unshaded muted vermilion-red (#C6543A) sun circle, half-cut cleanly along a crisp diagonal line where the invisible mountain ridge blocks it from view.
3. Hard faceted ridge shadow & calm lake reflection: Along one narrow right-facing rock facet sits a crisp, angular flat olive-espresso cast shadow. At the bottom of the mountain, a bold dark-espresso shoreline edge meets a tranquil cream lake containing a flat, subtly rippling olive-tinted reflection of the full triangular mountain silhouette.
4. Scale & stillness: A graceful tiny arc of seven microscopic dark-espresso cranes gliding across the open cream air near the upper peak, plus one tiny delicate muted-vermilion square artist seal tucked discreetly near the upper-left corner.

Strict color discipline: warm vintage ivory cream (NO pure white), deep burnt-tea espresso brown (NO pure black), muted olive-moss green, muted vermilion red, antique ochre gold. Crisp flat 2D editorial illustration with fine paper grain. NO closed black outline tracing the mountain, NO wet watercolor bleeding, NO misty fog, NO 3D render, NO photorealism, NO human figures.
```

---

## 三、视觉质检（QA）5 项硬指标

每生成一张图像后，必须对照以下 5 项标准复核；任一不达标即定向调优 Prompt 重绘：

1. **零外轮廓融合度**：主体是否真的“消失”进背景？有无出现多余的闭合外框线或边缘色差？
2. **3 秒格式塔闭合度**：不看文字说明，盯着画面 3 秒内是否能清晰、准确地脑补出宏大的三维/高维实体？
3. **色律纯净度**：是否 100% 杜绝了纯黑 `#000000`、纯白 `#FFFFFF` 与赛博霓虹高饱和色？
4. **扁平纸纹印刷感**：是否彻底规避了 3D 体积光、镜面反射、渐变天空与空气雾气，保持纯正 2D 复古胶版画质感？
5. **高维层级气场**：是否成功剥离了二次元人物感，呈现出“纪念碑式、静谧、哲思、高维”的艺术格局？
