# majia-chatcut-koubo

![Skill Version](https://img.shields.io/badge/skill-v1.0.0-blue)
[![skills.sh](https://skills.sh/b/maojiebc/majia-chatcut-koubo)](https://skills.sh/maojiebc/majia-chatcut-koubo)

**ChatCut 口播剪辑通用技巧包 · 马甲实战版** —— 官方 ChatCut skill 之上的增量层:双画面版式、主题配色、过渡动效、人脸取景四大件,外加可自维护的词表模板与机器化字幕门禁。全部规则来自真实批量剪片(11 支直播切片 × 多轮返工)踩出来的实测结论,不是理论汇编。

<img src="https://raw.githubusercontent.com/maojiebc/majia-chatcut-koubo/main/docs/theme-preview.png" alt="v1.0.0 · 8 套口播主题配色总览:深空蓝/墨绿金/暖灰橙/午夜紫/极简黑白/海盐青/大地棕/活力青柠" width="100%">

## 这个包解决什么

用 AI 代理(Codex / WorkBuddy / TRAE 等 ChatCut 宿主)剪口播视频时,官方 skill 教了「工具怎么用」,但没人告诉代理「剪成什么样算好」。结果是:画中画被裁成叶片形、过渡生硬得像 PPT、字幕两行挤压、导出后动画凭空消失 0.2 秒、黑边反复修不掉。

本包把这些坑的**根因和数学**写成代理可执行的规范:

- **双画面版式系统** — 横竖版 8 套具名版式带精确坐标(`assets/compositions.json`),五状态语义决策器:什么时候人物全屏、什么时候圆窗、什么时候分栏,由证据决定不由时间轮播
- **主题配色系统** — 8 套实测主题(token + SVG 底图 + 可运行 HTML 组件),每套带对比度档位限制:哪个色能压正文、哪个只能做大标题
- **过渡动效工程** — 端点契约、`N-1` 归一化公式、分层缓动、四档可靠性链、fps 归一化(30fps 时间线 60fps 导出的经典坑)
- **人脸取景与三层合成** — reframe→mask 硬顺序、GL UV 坐标陷阱(Y 轴底部原点/radius 实为直径)、overscan 黑边数学、「居中≠贴脸」构图标准
- **字幕与词表** — 气口分卡判例、单行机器门禁(`scripts/validate-caption-pages.mjs`)、译文轨 P0 陷阱、可自维护词表模板

## 安装

```bash
# GitHub CLI
gh skill install maojiebc/majia-chatcut-koubo

# 或 skills.sh
npx skills add maojiebc/majia-chatcut-koubo

# 或 ClawHub
npx clawhub install majia-chatcut-koubo
```

## 让它变成你的

包里的数字(22 字/行、330px 圆窗、`magnification≈0.30`)是作者素材上的实测起点。复制 `templates/` 下的词表模板和参数模板,在你的素材上做一个样片,把验证过的数字填进去——之后每次剪辑让代理先读你的 profile。数字变了就升版本存新文件,不覆盖旧版。

## 结构

```
SKILL.md                        主入口:五条第一性原则+通用工序+红线+路由表
references/
  dual-frame-layouts.md         双画面版式与五状态决策器
  theme-palettes.md             8 主题+对比度档位+按角色用色
  motion-transitions.md         过渡工程:端点契约/四档链/fps 归一化
  face-reframe.md               三层合成/坐标系陷阱/overscan 数学
  captions-terminology.md       气口分卡/单行门禁/词表机制
templates/
  terminology.template.json     词表模板(装你的品牌与误听)
  operating-profile.template.json  实测参数模板(装你的数字)
  examples.md                   气口/钩子/删减判例库
assets/
  compositions.json             8 版式坐标快照
  theme-kit/                    8 主题 token+SVG 底图+可运行组件
scripts/
  validate-caption-pages.mjs    字幕页机械校验(退出码非 0=未完成)
```

## 📋 版本记录

**V1.0.0(2026-07-22)** — 首发。从作者私有实战体系(11 天 99 场 ChatCut 代理剪辑会话)蒸馏出的通用层:四大件 references + 词表/参数/判例三模板 + 8 主题资产包 + 坐标快照 + 字幕校验脚本。

完整变更历史见 [CHANGELOG.md](CHANGELOG.md)。

## 方法来源

规则主体来自作者的 ChatCut 实战复盘。部分方法论参考了以下开源项目(未复制代码实现):`Agentchengfeng/chengfeng-videocut-skills`(删前保后/风险分层)、`lcbuaaliu/ai-jian-koubo`(确定性预选+语义判断)、`WyattBlue/auto-editor`(反向审查将删内容)、`radix-ui/colors`、`material-foundation/material-color-utilities`、`adobe/leonardo`(语义色阶与对比度优先)、`d3/d3-scale-chromatic`(数据色板)。

## 👤 作者 / 联系

**马甲(@maojiebc)** · 超级马甲

如果这份 skill 帮到你,欢迎在以下任意渠道找我交流踩坑实录、提需求、报 bug,也欢迎勾兑用户运营 / 数据中台 / BI 工程的实战经验:

| 渠道 | 链接 |
|---|---|
| 📧 Email | [m9224@163.com](mailto:m9224@163.com) |
| 🐙 GitHub | [github.com/maojiebc](https://github.com/maojiebc) |
| 🪝 ClawHub | [clawhub.ai/p/maojiebc](https://clawhub.ai/p/maojiebc) |
| 🐦 X | [@maojiebc](https://x.com/maojiebc) |
| 📕 小红书 | [超级马甲](https://xhslink.com/m/4fQMJeHHWKC) |
| 📰 微信公众号 | **超级马甲** |

> 这份 skill 是 14 年用户运营 + 内容矩阵实战沉淀出来的,问题/合作随时聊。
