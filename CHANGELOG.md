# CHANGELOG · majia-chatcut-koubo

## V1.1.0（2026-07-22）— 主题 playbook 化

- 8 套主题各配一份代理 playbook（`assets/theme-kit/playbooks/<id>.md`）：frontmatter 注入 themes.json 语义 token + token 档位实测结论 + 绑定版式 + 信息块偏好 + 字幕底板硬规则 + 一段可直接嵌进 MG 生成指令的「调用 crib」。主题包从「色板+底图」升级为「代理可执行的设计系统」。
- 新增 `references/graphics-blocks.md`：十类信息块 × 何时用（证据信号驱动、与钩子三公式对应）；行动引导块默认不加为红线。
- `theme-palettes.md` 增加标准用法流：选主题 → 读 playbook → 生成时嵌 crib。
- 方法来源新增 `pireel/pireel`（AGPL-3.0）：仅吸收「主题=数据+代理 playbook」与逐主题 crib 的组织方法，未复制其主题内容、文本或代码。

## V1.0.0（2026-07-22）— 首发

从作者私有实战体系（11 天 99 场 ChatCut 代理剪辑会话、11 支直播切片多轮返工）蒸馏出的通用技巧层：

- 五条第一性原则 + 通用工序 + 成片红线（SKILL.md）
- 双画面版式系统：横竖版 8 套具名版式坐标快照 + 五状态语义决策器 + 小窗腾挪规则
- 主题配色系统：8 套实测主题（token/SVG 底图/可运行组件）+ 对比度档位限制 + 按角色用色
- 过渡动效工程：端点契约、N-1 归一化、分层缓动、四档可靠性链、fps 归一化
- 人脸取景与三层合成：reframe→mask 顺序、GL UV 坐标陷阱、焦点保持换算、overscan 黑边数学、二次裁切判定公式
- 字幕与词表：气口分卡判例、单行机器门禁、译文轨 P0 陷阱、词表机制
- 三个自维护模板：词表 / 实测参数 profile / 例句判例库
- 字幕页机械校验脚本 `validate-caption-pages.mjs`（配 profile releaseGates 使用）

与作者私有完整版的关系：私有版含个人审美裁决面、项目惯例与多代理调度编制，随日常生产持续迭代；本公开包是其中**通用可迁移部分**的稳定快照,按稳定版节奏更新。
