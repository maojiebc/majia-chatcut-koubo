# CHANGELOG · majia-chatcut-koubo

## Unreleased

**视觉决策与规则吸收**

- 新增 Visual Decision Contract v0：每个语义段声明单一主视觉任务，B-roll 候选按语义、真实性、时机、清晰度、版权与重复度六维计分；总分与分项必须一致，低于 7 分只能转人工复核。
- 自动视觉选择新增来源、版权与预览批准门；生成视觉不得替代 evidence/data，固定间隔切镜、无关 B-roll、句句特效等反模式会阻断自动执行。
- Rule Registry 从 14 条扩展为 18 条 runtime rule，registry contract 升为 1.1.0 以阻断旧 override 冒充当前规则集，并为新增规则补齐 tighten/weakening fixtures；新 schema、匿名 plan fixture、CLI 和 8 项回归测试进入 `npm run verify`。
- 新增 AI 口播经验规则吸收记录：复用已有字幕/IR/审批/恢复/QA 能力，明确数值经验只作为 Style Profile 候选基线，不创建不可解释的单一“爆款分数”，也不写入私有知识库路径或原文全文。

## V1.4.0（2026-07-24）— 可验证生产系统

**规划与治理**

- 新增 [公开工程路线图](docs/roadmap.md)：以 V1.3.1 为已交付基线，明确 Rule Registry、Creator OS IR/SRT、预览审批、可恢复执行、证据链、媒体 QA、平台交付与反馈治理的顺序和 Definition of Done。
- README、迁移指南与版本漂移门禁同步接入路线图；路线图不承诺日期或未经 live canary 验证的 ChatCut runtime 能力。
- 交付 Rule Registry foundation：新增六域 14 条 stable rule、registry/override Schema、来源与 policy pointer 对账、`deny`/`tighten-only` 覆盖审计、每条规则的 pass/fail fixture 证明和 `npm run validate:rules` release gate。现有字幕规则标为 runtime-enforced，尚未接入 Creator OS IR 的跨域规则明确标为 registry-contract，不虚报宿主执行能力。
- 交付 Rational Time + Creator OS IR v0：新增显式时间域/有理速率/半开区间运算，以及 project、transcript、edit、state、owner、caption、evidence 七类计划文档和 bundle Schema；跨文档 validator 会核对 revision、source、evidence、时间线完整覆盖、唯一视觉 owner、正交隐私 owner 与批准状态，并以匿名完整 fixture 接入 `npm run verify`。
- 交付 SRT bridge：标准 SRT 与 sidecar 双向审阅协议保留 cue/page/word identity、exact rational range、revision 和毫秒量化残差；cue 重编号不影响匹配，sidecar 漂移和歧义匹配 fail closed，纠字/改时/隐藏/删除/合并/拆分/重排仅生成候选决策而不直接改计划。
- 交付 Preview approval gate：确定性选择首 60 秒、复杂状态、全部隐私风险段和片尾窗口；批准事件绑定 actor、完整 window scope、plan hash、style fingerprint、timeline revision 与失效字段，缺少/拒绝/撤销/部分批准或任一指纹变化都会关闭执行门。
- 交付 Recoverable executor + evidence foundation：新增 execution plan / operation journal Schema、动态 logical→host ID 唯一绑定、idempotency、revision lock、read-after-write、scene transaction 补偿、checkpoint/resume 与证据依赖失效传播；fake adapter 覆盖写前/写后超时、partial write、host ID 变化和 revision drift，不连接真实 ChatCut。
- 交付 Local Media QA + export authorization gate：release report 对最终文件 hash、codec/timebase/尺寸/音轨/颜色/时长、loudness/true-peak/silence、black/freeze、critical privacy coverage 和确定性风险抽帧做离线审计；导出批准必须精确绑定 artifact hash 与 plan hash，仓库不实际导出或发布媒体。
- 交付 Distribution pack foundation：平台 profile 强制记录来源、观测日、可信度与过期日；过期 hard rule 自动降级为 advisory，每个视频/封面/字幕/包装交付物绑定母片 hash、timeline revision 与 content truth hash，`publishAction` 固定为 `none`。
- 交付 Feedback governance foundation：匿名事件 Schema 默认不允许字幕正文、帧图、音频、用户路径或私有词表；suggested update queue 以重复样本、证据、反例、owner、人工 reviewer、版本升级与回滚记录阻断在线自动改规则，诊断数据默认 `not-authorized` 外发。
- 交付 Explainable planner foundation：从 transcript/edit IR 确定性重建 opening density、evidence coverage、低置信/风险词与破坏性编辑等结构信号；Hook→SoftCTA 只建立引用既有 segment/word 的待审候选，不生成文案、不输出黑箱爆款分数，revision 或 scorecard 漂移即阻断。
- 交付 Capability profile + live route gate：profile 绑定 ChatCut build、tool schema hash、TTL、五类 mandatory capability、probe evidence、非阻断脱敏 canary 与逐能力 fallback；缺少 current canary 时审计保持成功但 live route 明确关闭，过期/失败/证据不全时请求 live 会 fail closed。

## V1.3.1（2026-07-24）— 契约止血 + 可复现发布地基

按本轮审查路线图的前五个 PR 切片完成第一轮工程化止血；保留旧字幕 CLI 与 `profile.schema.json` 兼容入口，不引入 ChatCut 写入执行器。

**工程基线与 CI**

- Node 固定为 24.18.0，补 `engines`、`package-lock.json` 与 GitHub Actions；CI 使用 `npm ci` 后执行 release gate 和依赖审计。
- 引入 Ajv 2020 + formats 的离线 Schema registry。`validate-all-json.mjs` 强制分类仓库内全部 JSON，校验 Schema 本体、本地/远程 `$id` 映射与负例错误签名；release 模式不接受 baseline 债务。
- `npm run verify` 统一执行全仓 Schema、回归测试、主题对比度、资产引用/几何与版本漂移检查。

**Profile source/resolved 契约**

- 拆出 `profile.source.schema.json` 与 `profile.resolved.schema.json`；旧 `profile.schema.json` 保留为 source 兼容 shim。
- 新增 profile resolver 与 `resolve-profile` CLI：数组替换、对象递归合并；每层相对路径按声明文件归一；拒绝 prototype-pollution 键、继承循环和非法叶状态。
- `status` / `provenance` 不继承，必须由叶 profile 自有；输出 merge trace 和字段来源。默认报告对仓库外绝对路径做稳定匿名化，落盘 resolved profile 使用可移植相对路径。

**字幕 P0**

- 保留小数点、负号、百分号、日期分隔符和单位分隔符的数值语义，兼容 NFKC 与跨 word 边界比较。
- word key 升为全文唯一；页/词帧要求非负安全整数，词区间单调且不重叠。
- 中文短卡不能再由 profile/词表白名单绕过；仅符合 policy 形态的英文/数字完整卡可进入窄例外。
- `maxReplacementCharacters` 由 hard policy 接管，profile 只能收紧或设 0 禁用；新增 `--strict` / `--strict-warnings`。
- hard policy 因新增短卡形态/长度与 replacement 上限由 1.0.0 升为 1.1.0；旧 profile 仅可走非严格迁移 warning，发布态必须显式升级。
- 结构化字幕 provenance 采用 all-or-none 的 `projectId`、`timelineId`、`timelineRevision`、`sourceAssetId`、`sourceRevision`；发布严格模式下缺失即阻断，项目/时间线/源资产及 revision 须精确绑定 resolved profile。
- 词表加载错误只输出安全错误码与相对/匿名路径，不泄露用户绝对路径。

**主题、资产与文档一致性**

- 对比度门槛与文档统一：正文/次级/CTA 7:1，标题强调 4.5:1；8 套主题全绿。
- 新增 composition、theme/layout/manifest/demo schemas，以及引用、必需文件、画布/圆形几何检查。
- 新增版本漂移 gate，修正英文 README 的 seven-state 描述；package、lockfile、SKILL、README 与 CHANGELOG 同步为 1.3.1。
- 新增契约基线与 [V1.3.1 迁移指南](docs/migration-v1.3.1.md)。本地个人 profile/词表继续留在 `~/.config/majia-chatcut-koubo/`，没有进入公开 fixture。

## V1.3.0（2026-07-24）— 制度增量 + ChatCut 实测档案 + 本地个人层

私有实战版（v2.x，含一场约 15 分钟母片全片状态机重构会话的教训）向公开包的通用增量融合。全部案例匿名化，品牌词表实词与个人实测坐标不入公开包（走本地个人层机制）。

**SKILL.md 制度增量**

- 新增「确认闸门」节：**状态表先行硬闸**（画面结构批量落库前必须产出全片状态表——stateId｜[start,end)｜三层参数｜进出过渡｜隐私｜语义理由——请用户过目，无状态表禁止批量 `edit_item`；上下文压缩后不凭摘要续做画面结构）+ 高风险删除/字幕/视觉方向确认（视觉方向先出 2–4 个可选方案）+ 导出须用户开口 + 自动修复三轮止损。
- 工序 4 样片闸门升级：长片（>5 分钟）**60 秒预览闸**（开头 60 秒全层完成态请用户验收再推进）；批量中逐幕渲染抽查；**验收单元 = 完整成片体验**（画面+动画+字幕+隐私），字幕修正随幕完成，不设整片末尾统一校对。
- 工序 3 精校稿先行：开工扫素材目录找用户精校逐字稿，有则为字幕文本唯一真相源；ASR 三大高发（数字吞位/繁体/专名）禁止自行猜测修正——同句写进成片红线。
- 工序 6 下游增强：静态章节卡可由外部 MG 工具（如 hyperframes）产 MP4 后 `import_media` 替换；音效/BGM 走 ChatCut 素材库与生成工具，音量不夺 anchor。
- 工序 7 验收加双端预览路由指针（细则权威位在 chatcut-field-notes）。

**新册 references/chatcut-field-notes.md（ChatCut 宿主实测行为档案）**

- 几何与渲染：crop=框内裁显示区与反推公式、keepAspectRatio 校验/渲染两层不一致与两步提交、编辑器 vs 云端渲染差异（成片以云端帧为准）、borderRadius 作用域。
- 窗口动画：MG 媒体槽（video/image 属性）运行时失效实证 → 四档链 2/3 档跳过；正解 = 满屏 item + 窗口 reframe shader（归一化参数契约/track-bound per-item 挂载/过渡窗口摆位/圆窗换算示例）；框线与过渡单一 owner；shader beta 确认。
- S 态实现：endWin 收拢至圆心=人物退场；split 后 opacity=0（anchor 不断）；split 在气口造缝。
- 字幕分页引擎机器路径：`read_captions words:true` 拿词级 key → `forcePageBreak` 气口打断 → forced break 间 ≤22 显示字则引擎不再 length 切；源 item 边界自动强分页；**split_item 更换 item id → forcePageBreak 需按新前缀重设（纪律=结构 split 先做完再设断点）**；字体须 `search_fonts` 命中、样式改动必须走 `json` 参数。
- 音频层基线：trackId 省略自动建 A1/显式 alias 强制新轨、`library:sound:<id>`、whoosh -12dB/卡点 -10dB/BGM -24dB 实测起点（听感标 unverified）。
- 外部 MG 章节卡链路：对比度门（WCAG 大字 3:1）拦色、`data-duration` 锁总帧、渲染后 `import_media`。
- 隐私扫描 SOP：全源抽帧 contact sheet → 源区间求交 → 插叙段必查 → 源头平移优先于遮挡 → 渲染帧兜底。
- 工具面杂项 + 双端预览路由（Mac 客户端优先 → 提示可装一次 → 浏览器兜底；代理像素证据始终=云端渲染帧）。

**三本通用新册**

- `references/operating-manual.md`：一片一闭环（冻结盘点→状态表→原子改画面→精修字幕→音频→门禁）、四大门禁 + **八道硬闸**、A-roll 删减增量（删前保后/风险分级）、批量流水线与回归矩阵、多代理调度编制、生成资产纪律（成本合并报价/参考图先行/两段式/三轮降级）、验证方法学、导出与帧率、止损与汇报。
- `references/retention-structure.md`：开头重构决策流（删铺垫/钩子三公式/爆点前置扫描）、钩子-兑现成对、注意力时钟与开环句保护、自然结尾、**四平台条件路由表**（抖音/小红书/视频号/B站，含可信度标注）、数据复盘口径。
- `references/recovery.md`：502/403/工具面固化处置、续接手册协议（事实层 vs 动态 ID 层）、打开既有项目标准流（connected≠持久化）、转写故障绕行、素材上传、上下文压缩后恢复。

**既有册融合增量**

- `dual-frame-layouts.md`：五状态 → **七执行状态**（S/P 升为正式行）；P 态语义修正为「独立不透明全区间 redaction owner，人物窗/裁切只承担构图」；新增**状态落地原子契约**（半开区间三层同边界提交/区间相交审计/owner 台账/逻辑事务/outroStart）与**双素材呼吸感**条款（人物升 A、录屏升 S 交替；长片每幕评估一次 S 态机会）；竖版补充加两套文字体系不混用、按镜头任务切换裁切。
- `motion-transitions.md`：四档链加 **ChatCut 宿主快速路由**（2/3 档跳过、推荐 reframe shader、降级直切需确认）；新增「已验收动效的指纹守恒」。
- `face-reframe.md`：效果栈补第三层（描边/阴影沿最终蒙版边界）；uvMapped RGB/Alpha 采样错位特征故障；兼容探针契约（`templates/compatibility.template.json`）与探针残留=P0。
- `captions-terminology.md`：精校逐字稿真相源节、剪后重建五步、ASR 准备与缓存、短卡门槛改毫秒制（450/800ms，30/60fps 等价）、validator 用法更新（结构化 JSON/`--terms`）、分页引擎指针。
- `graphics-blocks.md`：新增**画面任务路由**表（真实素材 vs 信息块；一段一个视觉任务）。
- `theme-palettes.md`：token v1.1 对比度修正说明；新增色板简报（palette brief）、感知均匀色阶与色域、图表与数据色板三节。

**机器门禁与资产**

- 新增 `rules/policy.json`：不可由 profile 放宽的字幕发布策略（单行/禁自动换行/原文源/词级审计/450–800ms 毫秒短卡/繁体零容忍）。
- 新增 `schemas/`：policy / profile / captions / terminology / compatibility 五份 JSON Schema。
- `scripts/validate-caption-pages.mjs` 全量升级：递归 profile 继承（extends）、policy 硬校验（profile 无法放宽）、结构化字幕 JSON（旧文本仅迁移兼容）、毫秒短卡、繁体检测、页/词区间与文本一致性、外部词表文件、**新增 `--terms` 旗标**（本地个人层词表覆盖 profile.terminologyFile）。
- 新增 `tests/caption-validator.test.mjs`（14 项回归，含 --terms 用例）与根 `package.json`（`npm test` / `npm run verify`）。
- `assets/compositions.json` v2.1：`protect` 拆分为 `mustRemainVisible` / `mustBeRedacted`（隐私项不再与保护可见项同数组）。
- `templates/`：operating-profile 模板升级为 schema 2.0（policyVersion/timeline/毫秒 releaseGates）；terminology 模板升级为 entries 结构（带证据要求与风险分级字段）；新增 `compatibility.template.json`；新增 **`local-config-example/`**（本地个人层四件套带注释模板：profile / terminology / aesthetics / local-notes）。
- 主题 token v1.1（json/css/ts 三处同步 + 4 份 playbook 升 1.2.0）：海盐青正文 `#0B5F58→#07554F`（7.67:1 达标）、次级文字与 ctaText 加深；暖灰橙/极简黑白次级文字加深；大地棕 ctaBackground `#8B5E34→#6B3F1F`（配白字 8.9:1）。`check-contrast.mjs` 全绿。

**本地个人层机制（千人千面）**

- SKILL.md「让它变成你自己的」升格为正式契约：`~/.config/majia-chatcut-koubo/` 开工探测、存在即叠加（profile 覆盖同名键 / terminology 走 `--terms` / aesthetics 审美裁决 / local-notes 个人护栏）；品牌实词、真实业务数字、个人路径只进本地层，永不进 git；本地 profile 不能放宽 policy。

**脱敏说明**：本版所有新增内容不含真实雇主/品牌词表实词/个人路径；案例一律匿名化（「某 15 分钟母片重构会话」）；`templates/examples.md` 原有一处品牌词判例同步替换为通用词。

- **供应链修复**：`assets/theme-kit/requirements.txt` 将 `CairoSVG>=2.7` 固定为 `CairoSVG==2.9.0`，消除 **CVE-2026-31899**（CairoSVG 2.7 递归 `<use>` 元素放大导致的指数级 DoS）暴露。该依赖仅被可选脚本 `assets/theme-kit/scripts/render-backgrounds.py`（SVG→PNG）使用，pin 到 PyPI 最新稳定版不影响功能。
- **trigger 收窄**：SKILL.md `description` 追加「前置（需官方 ChatCut skill/MCP）」与「非目标（不做非视频剪辑任务、不替代官方工具用法）」，回应 ClawHub skillspector 的 SQP-1（activation 过宽）。
- 触发本次修复的背景：v1.2.2 发布后 ClawHub skillspector 因上述未固定 CVE 依赖判 `suspicious/CAUTION`（clawscan AI 审查判 `benign`），版本被扣在审核未转公开；本版清除该 HIGH 项以求干净过审。
- 规则本体（references/templates/scripts 逻辑）零改动。

## V1.2.2（2026-07-23）— 中文品牌名

- 展示名定为「**ChatCut口播 · 马甲实战版**」，同步五处品牌面：SKILL.md H1、README.md H1、README.en.md 副标题注记、GitHub About 简介、ClawHub `--name`；架构图标题与 footer 一并更新。
- **安装标识（slug）`majia-chatcut-koubo`、SKILL frontmatter `name:`、`gh skill install` / `npx skills add` / `clawhub install` 命令一律不变** —— 仅人读展示名变更，机器标识与安装路径零改动。
- 规则本体（SKILL/references/templates/scripts）零改动。

## V1.2.1（2026-07-23）— 框架图 + README 装修

- 新增 `docs/architecture.svg`：增量层全景框架图 —— 官方 ChatCut 底座 → 双画面版式 / 主题配色 / 过渡动效工程 / 人脸取景 四大件（各标所治痛点）→ 词表模板 + 字幕门禁 → 可见画面 / 可听声音 / 可读字幕 验收三象；配套 `docs/architecture.png`（raw.githubusercontent 渲染用，`.svg` 在包页不内联）。
- README.md / README.en.md 首图改为该框架图（绝对 raw URL），原 8 主题配色总览下移为第二张图；「结构」段补 `docs/`。
- 版本记录段收敛为最近 3 条（V1.2.1 / V1.2.0 / V1.1.0），更早版本移交 CHANGELOG。
- 纯文档增强，SKILL/references/templates/scripts 规则本体零改动。

## V1.2.0（2026-07-22）— 块级动效词汇表

- `references/graphics-blocks.md` 新增「块级动效词汇表」：进场/出场/循环强调三轴受限枚举（弹入默认禁——「不弹跳」是全包基线；闪烁禁；漂浮几乎不用；打字机仅文字块且需逐字有语义）、时长基线（进场 10–16 帧 @30fps、出场 8–12 帧，一律按秒或归一化帧率写）、块×动效推荐表、「一致性>花样」与同屏错帧规则。
- 8 份主题 playbook 各增「动效档」：逐主题准许/慎用/禁用集（极简黑白收到最窄仅淡入+上移；活力青柠为弹入唯一豁免主题且仍需用户点头）；playbookVersion 1.0.0 → 1.1.0。
- 方法来源新增 `yoqu/lingji-cut`（Apache-2.0）：仅吸收三轴动效枚举的组织方法，枚举取舍与全部文本为本包自定。

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
