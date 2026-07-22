---
id: warm-gray-orange
name: 暖灰橙
mode: light
layout: centered-editorial
tokensSource: ../tokens/themes.json
playbookVersion: 1.0.0
palette: { canvas: "#F7F4F1", surface: "#FFFFFF", surfaceMuted: "rgba(255,255,255,0.76)", textPrimary: "#333333", textSecondary: "#6B625C", emphasis: "#C93411", accent: "#FF6A3D", accentStrong: "#C93411", border: "rgba(242,178,108,0.84)", ctaBackground: "#FF6A3D", ctaText: "#221A17" }
---

# 暖灰橙 · 主题 playbook

温暖亲和、行动力强。适合干货分享、门店培训、用户故事——像一份认真排过版的讲义。

## Token 语义与档位(实测)

- `textPrimary #333333` 对 canvas 11.5:1,正文/字幕直接可用
- `accent #FF6A3D` 亮橙为大标题级(配深字 #221A17 6.0:1):大号短文案/贴纸/图形,**禁配白字**(仅 2.8:1)
- `emphasis #C93411` 深橙红 4.8:1 大标题级,可做标题文字色
- `border` 橙调半透明为纯装饰线,不承担信息分隔

半透明角色(`surfaceMuted`/`speakerSurface`/`glow`)一律按五类背景(亮/暗/肤色/彩色 UI/高细节)的最终合成像素验收。色值以 `tokens/themes.json` 为唯一真相源,本文不一致时以 JSON 为准。

## 版式搭配

绑定布局 `centered-editorial`(坐标见 `tokens/layouts.json`);双画面版式从 `assets/compositions.json` 按语义选,主讲人窗描边、观点条、字幕底板一律从本主题语义 token 取色,不逐元素挑色。

## 信息块偏好

步骤清单、关键词强调条、标题卡、问答卡——教学与故事类块;强调条用亮橙底+深字。(块的进入信号与禁忌见 `references/graphics-blocks.md`。)

## 字幕底板

字幕深灰字配纯白/米白底板;橙色系一律不进字幕。

## 调用 crib(生成 MG/图形时直接嵌入指令)

> 暖灰橙讲义风:canvas #F7F4F1 暖灰底,卡片纯白 surface 圆角+轻阴影;正文深灰 #333333;亮橙 #FF6A3D 只做大号短文案与贴纸且必配深字,深橙红 #C93411 做标题;居中编辑排版、留白慷慨;动效入场淡入+轻上移 10–16 帧,贴纸可带极轻手写式旋转。
