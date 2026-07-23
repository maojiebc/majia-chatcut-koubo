---
name: majia-chatcut-koubo
description: ChatCut 口播/录屏视频代理剪辑的通用技巧包——官方 ChatCut skill 之上的增量层。覆盖：双画面版式（横竖版 8 套坐标/七执行状态）、8 套主题配色与对比度档位、过渡动效工程（四档可靠性链/端点契约/fps 归一化）、人脸居中与内部取景（三层合成/reframe→mask 顺序/坐标系陷阱/overscan 公式）、中文气口字幕与可自维护词表模板、机器化字幕门禁（validator+不可放宽 policy）、逐片执行手册与八道硬闸、ChatCut 宿主实测行为档案、留存结构与四平台路由、故障恢复、本地个人层（~/.config 叠加个人 profile/词表）。触发：ChatCut 剪口播、直播切片、画中画/圆窗、主讲人过渡动画、竖版重构、字幕气口、术语纠错、主题配色。前置：需已装官方 ChatCut skill / MCP 工具。非目标：不处理非视频剪辑任务，不替代官方工具本身的用法（工具怎么用一律以官方为准），本包只补剪辑审美与实测护栏。
metadata:
  version: 1.3.0
---

# ChatCut口播 · 马甲实战版

ChatCut 口播剪辑的通用技巧包。把 ChatCut 当作最终可继续手工调整的非线性编辑器：所有剪辑交付留在项目和时间线上，以可见画面、可听声音和可读字幕为验收对象。

## 与官方 skill 的分工

ChatCut 插件自带官方 skill（plugin-basics / talking-head-guide / transcription / verification / known-errors / create-motion-graphics 等），**工具怎么用一律以官方为准**，参数以当前 MCP 工具实时描述为真相源。

本包只写官方没有的：**剪成什么样算好**（版式、配色、动效节奏、构图标准）、**实测踩坑护栏**（坐标系陷阱、fps 错位、验证方法）、**可复用资产**（8 版式坐标、8 主题色板、字幕校验脚本、词表模板）。与官方重复处以官方为准。

## 五条第一性原则

1. **内容真相**：成片的实际音频和当前时间线是唯一真相；装修不改写源区间、顺序、速度、主音频或字幕时序。
2. **单一合成所有权**：同一帧的录屏几何、人物几何和外框只由一个稳定态或一个转场 owner 接管；白块、重复人物、孤儿框、叠加溶解都是所有权冲突。
3. **时间原子性**：状态用半开区间 `[start,end)`；录屏、人物、框线同边界提交；媒体跨态先拆分，不按 item 起点猜状态。
4. **证据优先**：画面变化由「隐私 → 屏幕证据 → 人物强调 → 字幕负载 → 新鲜感」决定；时间只提醒复查，不驱动机械轮播。
5. **量化门禁**：工具成功不是完成。结构、字幕、音频、像素各有明确结果；无法看或听时标 `unverified`，不得用结构结果顶替试听或像素证据。

## 通用工序

1. **同步与规格**：多机位 `multicam_sync`；只留一个主音轨（讲解人 anchor，重复轨优先 mute/disable，宿主不支持才 -60dB 降级）；冻结画幅、fps、采样率。
2. **A-roll 内容**：按官方 talking-head-guide，删减增量见 `references/operating-manual.md`；一句话原则——**删声音比删意思安全，错删信息的代价高于漏留口癖**。
3. **剪后转写与字幕**：删除/重排/变速后必须刷新剪后转写；字幕见 `references/captions-terminology.md`——第一步永远是查字幕源绑定（挂在翻译变体轨上=P0，先切回原文源）。开工先扫素材目录找用户精校逐字稿：有则它是字幕文本唯一真相源，禁止在 ASR 错词上自行猜测修正（数字吞位/繁体/专名是 ASR 三大高发）。
4. **样片闸门（渐进交付）**：横版先做开头约 18–23 秒、竖版 20–30 秒样片，确认后才批量；**长片（>5 分钟）升级为 60 秒预览闸——先把开头 60 秒做成全层完成态（剪辑+状态机+过渡+字幕+包装+隐私），请用户播放验收，通过后才向后推进**；批量中每完成一幕渲染抽查帧，不整片铺完才验。**验收单元 = 完整成片体验（画面+动画+字幕+隐私），字幕修正随幕完成，不设整片末尾统一校对环节。**任何一项失败先修样片，不批量复制错误。
5. **画面结构**：双画面版式与七执行状态见 `references/dual-frame-layouts.md`；人脸取景见 `references/face-reframe.md`；批量切片与逐片精修先读 `references/operating-manual.md`。
6. **动效与包装**：字幕锁定后才做过渡、B-roll、MG；过渡工程见 `references/motion-transitions.md`；配色见 `references/theme-palettes.md`。静态章节卡单调时，可由外部 MG 工具（如 hyperframes）产 MP4 后 `import_media` 替换；音效/BGM 走 ChatCut 素材库与生成工具，音量不夺 anchor。
7. **验收**：结构回读 + 合成像素 + 实际试听三证齐才算完成；帧率以 ffprobe 读实际导出文件为准。请用户播放验收时按 `references/chatcut-field-notes.md` 双端预览路由：本地 ChatCut Mac 客户端优先 → 未装提示一次可下载（不强推）→ 浏览器兜底（明示网页端可能卡顿）；代理自己的像素证据始终 = 云端渲染帧。

## 成片红线

- 字幕：简体、始终单行、来自真实语音转写、按完整气口分卡；用户提供精校逐字稿时，精校稿是文本唯一真相源，禁止在 ASR 错词上自行猜测修正；行尾逗号不显示，句末标点保留；发布硬规则以 `rules/policy.json` 为准（profile 只能校准不能放宽），跑 `scripts/validate-caption-pages.mjs`，退出码非 0 = 未完成。
- 内容：重说默认删前保后；重排只搬完整语义单位，不拼出说话人没说过的话；默认自然结束，不加模板片尾。
- 画面：PiP 不拉伸；正圆以裁后可见区判定（`visibleWidth = width × (1−cropLeft−cropRight)`），改外框时保留旧 crop = 二次裁切事故；人物层保留完整源画幅，效果顺序 reframe → mask；任一精确帧露黑边即撤销整段动态取景；框线不穿人物；二维码等隐私信息全时间范围不可见，部分遮挡=失败。
- 工程：30fps 时间线可能 60fps 导出，MG 一律按秒或归一化帧率计时；写入宣称成功≠落盘（回读 FX 实例）；素材池有资产≠时间线有实例。
- 协作：用户已验收的设计是受保护基线，删除、降级、明显改变必须先问——连续兜底失败也不例外；同一可见缺陷第二次出现=停止逐片补丁，修共享根因并全量回归。

## 确认闸门

- **状态表先行（硬闸）**：画面结构批量落库前，必须先产出全片状态表（stateId｜[start,end)｜三层参数｜进出过渡｜隐私｜语义理由）并请用户过目；无状态表禁止批量 `edit_item`。上下文压缩后不凭摘要续做画面结构——先回读状态表与命中分册再动手。
- 高风险删除：批量前确认代表性切点。字幕：样片窗口确认后扩展。视觉方向/配色/包装风格：先出 2–4 个可选方案让用户点选，不给单方案硬推，不代替用户拍板审美。
- 导出：用户开口才导出；短导出授权按本轮措辞记录范围，不外扩、不跨任务。
- 自动修复最多连续三轮，每轮要有新证据；仍失败就停，保留最近可用版本，产出带证据帧的交接文档可请外部 AI 复核。

## 按需加载路由表

| 任务信号 | 完整读取 |
| --- | --- |
| 批量切片、逐片精修、验收门禁、八道硬闸、A-roll 删减细则、多代理调度、生成资产纪律 | [逐片执行手册](references/operating-manual.md) |
| 双画面构图、版式选型、七执行状态、状态原子契约、圆窗/分栏/上下屏、小窗腾挪 | [双画面版式系统](references/dual-frame-layouts.md) |
| 主题配色、字幕底板、对比度、按角色用色、图表色板 | [主题配色系统](references/theme-palettes.md) + 选定主题的 `assets/theme-kit/playbooks/<id>.md` |
| MG/设计图形加不加、加哪种、画面任务路由 | [信息块类型与选用](references/graphics-blocks.md) |
| 过渡动画、状态切换、闪烁/黑块排查、fps 归一化 | [过渡动效工程](references/motion-transitions.md) |
| 人脸居中、内部取景漂移、蒙版参数、黑边排查 | [人脸取景与三层合成](references/face-reframe.md) |
| 字幕气口、术语纠错、词表维护、字幕门禁 | [字幕与词表](references/captions-terminology.md) |
| 信息流切片开头钩子、完播、中段节奏、结尾、四平台路由 | [留存结构剪辑](references/retention-structure.md) |
| ChatCut 宿主实测坑：crop 语义、两步提交、编辑器/云端渲染差异、MG 媒体槽失效、窗口 reframe shader、字幕分页引擎、音频层基线、隐私扫描 SOP、双端预览路由 | [ChatCut 宿主实测行为档案](references/chatcut-field-notes.md) |
| 连接报错、OAuth 失效、打开既有项目、转写挂死、上下文压缩恢复 | [故障恢复手册](references/recovery.md) |

可复用资产：`assets/compositions.json`（8 版式坐标快照）、`assets/theme-kit/`（8 主题 token+SVG 底图+可运行组件）、`templates/`（词表/实测参数/宿主兼容契约模板 + 本地个人层模板，装进你自己的数字）、`rules/policy.json`（不可由 profile 放宽的字幕发布策略）、`schemas/`（profile/字幕/词表/兼容契约结构）、`scripts/validate-caption-pages.mjs`（字幕机械校验，`npm test` 跑回归）。

## 让它变成你自己的（本地个人层契约）

本包的数字（22 字/行、330px 圆窗、`magnification≈0.30`）是作者素材上的实测起点，不是跨素材真理。个人化的正式机制是**本地个人层** `~/.config/majia-chatcut-koubo/`：

1. **探测与叠加**：每次开工先探测该目录；存在则把其中内容叠加在本包通用规则之上——`profile/*.json`（个人版式与字幕实测数字，覆盖 `assets/compositions.json` 与模板同名键）、`terminology.json`（个人词表，validator 用 `--terms` 指向它）、`aesthetics.md`（个人审美基线，审美分歧时先读）、`local-notes.md`（个人补充护栏）。目录不存在就只用包内通用值，不报错。
2. **起模**：把 `templates/local-config-example/` 整体复制为 `~/.config/majia-chatcut-koubo/`，在你的素材上做样片，把验证过的数字、品牌词表和审美偏好填进去。
3. **边界**：品牌实词、真实业务数字、个人路径只进本地层，永不进 git、永不进公开仓；本地 profile 只能校准参数，不能放宽 `rules/policy.json` 的发布硬规则。数字变了就升版本存新文件，不覆盖旧版。

版本记录见 [CHANGELOG.md](CHANGELOG.md)。

## 👤 作者 / 联系

**马甲（@maojiebc）** · 超级马甲

如果这份 skill 帮到你，欢迎在以下任意渠道找我交流踩坑实录、提需求、报 bug，也欢迎勾兑用户运营 / 数据中台 / BI 工程的实战经验：

| 渠道 | 链接 |
|---|---|
| 📧 Email | [m9224@163.com](mailto:m9224@163.com) |
| 🐙 GitHub | [github.com/maojiebc](https://github.com/maojiebc) |
| 🪝 ClawHub | [clawhub.ai/p/maojiebc](https://clawhub.ai/p/maojiebc) |
| 🐦 X | [@maojiebc](https://x.com/maojiebc) |
| 📕 小红书 | [超级马甲](https://xhslink.com/m/4fQMJeHHWKC) |
| 📰 微信公众号 | [超级马甲](https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzY5NzIzODk2NA==#wechat_redirect) |

> 这份 skill 是 14 年用户运营 + 数据中台 + BI 工程实战沉淀出来的，问题/合作随时聊。
