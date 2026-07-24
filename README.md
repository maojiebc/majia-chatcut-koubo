# ChatCut口播 · 马甲实战版

![Skill Version](https://img.shields.io/badge/skill-v1.4.1-blue)
[![skills.sh](https://skills.sh/b/maojiebc/majia-chatcut-koubo)](https://skills.sh/maojiebc/majia-chatcut-koubo)

> **ChatCut口播 · 马甲实战版** — 安装标识（slug）仍为 `majia-chatcut-koubo`，安装命令保持不变。

**从剪辑经验包升级为可验证生产系统** —— 在官方 ChatCut skill 之上，把版式/配色/动效/人脸取景与规则、IR/SRT、审批、可恢复执行、证据、媒体 QA、交付和反馈治理串成一条 fail-closed 生产链。

## 如果你是维护者，先看这里

不需要从代码目录开始读。仓库最上方的四个中文目录就是维护入口：

| 你要做的事 | 入口 |
| --- | --- |
| 第一次打开，不知道维护哪里 | [01-从这里开始](01-从这里开始/README.md) |
| 查字幕、转场、双画面、人脸取景方法 | [02-剪辑方法手册](02-剪辑方法手册/README.md) |
| 记录真实任务的新坑和 ChatCut 产品问题 | [03-实操迭代与踩坑](03-实操迭代与踩坑/README.md) |
| 看系统架构、路线图和迁移说明 | [04-项目设计与路线图](04-项目设计与路线图/README.md) |

`src / scripts / schemas / fixtures / tests` 是技术内核，普通经验维护通常不用碰。完整的“我该改哪个文件”对照表在 [维护地图](01-从这里开始/README.md)。

<img src="https://raw.githubusercontent.com/maojiebc/majia-chatcut-koubo/main/04-项目设计与路线图/系统架构.png" alt="v1.4.1 可验证生产系统：Rule Registry → Creator OS IR/SRT → Explainable/Visual Decision Planning → Preview Approval → Recoverable Executor/Evidence → Media QA → Distribution Pack → Field Reports/Feedback Governance，并由 Capability Profile 阻断无证据 live route" width="100%">

<img src="https://raw.githubusercontent.com/maojiebc/majia-chatcut-koubo/main/04-项目设计与路线图/主题预览.png" alt="v1.4.1 · 8 套口播主题配色总览(每套含代理 playbook):深空蓝/墨绿金/暖灰橙/午夜紫/极简黑白/海盐青/大地棕/活力青柠" width="100%">

## 这个包解决什么

用 AI 代理(Codex / WorkBuddy / TRAE 等 ChatCut 宿主)剪口播视频时,官方 skill 教了「工具怎么用」,但没人告诉代理「剪成什么样算好」。结果是:画中画被裁成叶片形、过渡生硬得像 PPT、字幕两行挤压、导出后动画凭空消失 0.2 秒、黑边反复修不掉。

本包把这些坑的**根因和数学**写成代理可执行的规范，并把“做完”升级为可追溯的生产状态：

- **双画面版式系统** — 横竖版 8 套具名版式带精确坐标(`assets/compositions.json`),七执行状态语义决策器 + 状态落地原子契约:什么时候人物全屏、什么时候圆窗、什么时候纯录屏,由证据决定不由时间轮播
- **主题配色系统** — 8 套实测主题(token + SVG 底图 + 可运行 HTML 组件),**每套自带代理 playbook**:token 语义档位、信息块偏好、字幕底板硬规则、可直接嵌进生成指令的调用 crib
- **过渡动效工程** — 端点契约、`N-1` 归一化公式、分层缓动、四档可靠性链(含 ChatCut 宿主快速路由)、fps 归一化(30fps 时间线 60fps 导出的经典坑)
- **人脸取景与三层合成** — reframe→mask 硬顺序、GL UV 坐标陷阱(Y 轴底部原点/radius 实为直径)、overscan 黑边数学、「居中≠贴脸」构图标准
- **字幕与词表** — 气口分卡判例、单行机器门禁(validator + 不可放宽的 `rules/policy.json`)、译文轨 P0 陷阱、精校逐字稿真相源、可自维护词表模板
- **Rule Registry** — 18 条规则覆盖内容真相、字幕、隐私、时间线、执行安全与导出授权六域；stable ID、来源、覆盖权限、runtime/contract 执行级别和 pass/fail fixture 全部机器校验
- **Creator OS IR v0** — 显式时间域的有理时间与半开区间；project、transcript、edit、state、owner、caption、evidence 七类计划文档由 bundle 串联，revision、证据、时间线 coverage、唯一视觉 owner、隐私 owner 和批准状态统一离线校验
- **SRT 文本桥** — 标准 SRT 供人工审阅，sidecar 保留 cue/page/word identity、exact range、revision 与量化残差；重编号无损，纠字/改时/隐藏/删除/合并/拆分/重排只生成可审计候选
- **可解释内容规划** — 只计算 opening density、evidence coverage、低置信/风险词和破坏性编辑等可复算信号；Hook→SoftCTA 候选只引用已有 segment/word，保持人工待审，不生成文案或“爆款概率”
- **视觉决策合同** — 每段只声明一个主视觉任务；B-roll 候选按语义、真实性、时机、清晰度、版权与重复度六维计分，低于 7 分转人工，生成图不得冒充证据，反模式与审批缺失会关闭执行门
- **预览审批门** — 自动覆盖首 60 秒、复杂状态、全部隐私风险段与片尾；批准绑定 actor、完整窗口 scope、plan/style/timeline 指纹，缺失、撤销或任一漂移即关闭执行
- **可恢复执行与证据底座** — 离线 fake adapter 证明 logical ID 唯一绑定、幂等写、revision lock、写后回读、scene 补偿、checkpoint/resume 与证据失效传播；尚不宣称真实 ChatCut adapter 已验证
- **Capability profile 与 live route 闸门** — ChatCut build、tool schema hash、TTL、mandatory probes、脱敏 canary 与 fallback 统一审计；仓库默认 fixture 明确为 `unverified`，没有 current canary 时只走 fake/manual/blocked 路线
- **本地 Media QA 与导出授权** — 对最终文件 hash、codec/timebase/尺寸/颜色/音轨/时长、loudness/true-peak/silence、black/freeze、隐私覆盖和确定性抽帧表做报告审计；只验证输入报告，不自动导出或发布
- **多平台交付包底座** — 平台规则带来源/观测日/过期日/可信度，过期 hard rule 自动降级 advisory；交付物绑定母片 hash、timeline revision 与 content truth hash，manifest 禁止自动发布
- **反馈治理底座** — 事件仅保存匿名 hash、稳定错误签名与计数指标，不接收字幕正文/帧图/音频/用户路径/私有词表；规则建议需重复样本、证据、反例、owner、人工审核和回滚记录，永不在线自动应用
- **逐片执行手册 + 八道硬闸** — 一片一闭环、批量流水线、验证方法学、历史事故的回归闸门;60 秒预览闸与状态表先行确认闸
- **ChatCut 宿主实测行为档案** — crop 语义、编辑器/云端渲染差异、MG 媒体槽失效与窗口 reframe shader 正解、字幕分页引擎机器路径、隐私扫描 SOP、双端预览路由
- **实战经验库** — `03-实操迭代与踩坑/` 追加保存真实任务的完整失败链、ChatCut 产品问题、证据等级与绕行方案；迭代前必读、读后留痕，积累成批后再晋升正式规则和版本
- **留存结构 + 四平台路由** — 开头钩子决策流、钩子-兑现成对、注意力时钟、抖音/小红书/视频号/B站条件路由
- **本地个人层** — `~/.config/majia-chatcut-koubo/` 叠加个人 profile/词表/审美基线;品牌词与实测数字留在本地,公开包保持通用

> **真实环境边界**：当前仓库验证的是离线 Schema、匿名 fixtures、fake adapter、报告审计与 fail-closed 路由。真实 ChatCut adapter、真实媒体探针/渲染与平台发布尚未验证，也不会被自动执行。

## 安装

```bash
# GitHub CLI
gh skill install maojiebc/majia-chatcut-koubo

# 或 skills.sh
npx skills add maojiebc/majia-chatcut-koubo

# 或 ClawHub
npx clawhub install majia-chatcut-koubo
```

## 开发与发布验证

```bash
npm ci
npm run verify

# 单独审计 Rule Registry；本地 override 只能保持或收紧 hard policy
npm run validate:rules
node scripts/validate-rule-registry.mjs \
  --overrides fixtures/rules/overrides.valid.json

# 校验匿名 Creator OS 完整计划包
npm run validate:plans

# 重建并审计可解释 scorecard、叙事候选与 decision queue
npm run validate:planner

# 审计视觉候选评分、来源/版权、反模式与批准状态
npm run validate:visual

# 校验标准 SRT 与 sidecar 的稳定往返
npm run validate:srt

# 校验代表预览的批准 scope 与当前 plan/style/timeline 指纹
npm run validate:preview

# 跑写前/写后超时、partial write、ID 变化与 revision drift 场景
npm run validate:recovery

# 审计 ChatCut 能力证据；默认 fixture 应保持 live=false/unverified
npm run validate:capabilities

# 审计匿名最终媒体 probe、隐私覆盖、抽帧计划与导出授权
npm run validate:media

# 审计平台 profile 新鲜度、母片绑定与 no-publish 交付 manifest
npm run validate:distribution

# 审计匿名反馈事件与人工发布建议队列
npm run validate:feedback

# 把可继承的 source profile 解析为无 extends、可追溯的 resolved profile
node src/cli/resolve-profile.mjs \
  --profile <profile.source.json> \
  --root <profile-config-root> \
  --strict \
  --out <profile-config-root>/generated/profile.resolved.json \
  --trace <profile-config-root>/generated/profile.merge-trace.json

# 发布态字幕校验；warning 也会阻断
node scripts/validate-caption-pages.mjs \
  --strict \
  --profile <profile.source.json> \
  --root <profile-config-root> \
  --input <captions.json>
```

`npm run verify` 会执行离线全仓 Schema、Rule Registry 与 override 覆盖审计、Creator OS plan bundle 跨文件审计、全量回归测试、主题对比度、资产几何/引用、公开内容安全扫描和版本漂移门禁；安全扫描只报告相对路径/规则/行号，本地可用 `.ota-deny-list.txt` 与 `.ota-allow-list.txt` 管理精确禁用词和公开豁免（allow 仅抵消本地 deny，不能绕过内置路径/密钥规则）。Profile 新文件应使用 `schemas/profile.source.schema.json`；旧 `profile.schema.json` 只保留为兼容 shim。Resolver 与计划产物可能含项目级标识，只能写在显式 `--root` 内，默认已由 `.gitignore` 排除。升级说明见 [V1.3.1 迁移指南](04-项目设计与路线图/V1.3.1迁移指南.md)，后续工程顺序与验收边界见 [公开工程路线图](04-项目设计与路线图/公开路线图.md)。

## 让它变成你的(本地个人层)

包里的数字(22 字/行、330px 圆窗、`magnification≈0.30`)是作者素材上的实测起点。正式机制:把 `templates/local-config-example/` 复制为 `~/.config/majia-chatcut-koubo/`,装进你的个人 profile(实测版式数字)、词表(validator `--terms` 直读)、审美基线与补充护栏——skill 开工探测该目录,存在即叠加。品牌实词与真实业务数字只进本地层,永不进 git;本地 profile 只能校准参数,不能放宽 `rules/policy.json` 的发布硬规则。数字变了就升版本存新文件,不覆盖旧版。

## 结构

### 人类维护区

```text
01-从这里开始/              维护地图：我应该读哪里、改哪里
02-剪辑方法手册/            已复验的字幕、画面、转场、留存与恢复方法
03-实操迭代与踩坑/          真实案例、失败链、产品问题与迭代记录
04-项目设计与路线图/        架构、主题预览、迁移说明和公开路线图
SKILL.md                     安装后 Agent 实际读取的总入口
CHANGELOG.md                 正式版本变更记录
```

### 技术内核

```text
assets/                      版式、主题 token、SVG 与可运行组件
templates/                   词表、参数、兼容性与本地个人层模板
rules/                       不可随意放宽的机器硬规则
schemas/                     JSON 数据合同
fixtures/                    匿名测试样例和正反例
src/                         核心程序实现
scripts/                     校验与命令行工具
tests/                       自动化回归测试
```

日常积累剪辑经验时，通常只需要修改 `03-实操迭代与踩坑/`；不要从 `src/` 或 `schemas/` 开始找。

## 📋 版本记录

**V1.4.1（2026-07-24）** — 新增 Visual Decision Contract 与 4 条视觉决策规则：每段单一主视觉任务、六维透明评分、低分转人工、生成图不得冒充证据；同时新增追加式 `03-实操迭代与踩坑/` 实战经验库、迭代前必读与读后留痕协议，首个公开脱敏案例记录 AI Hero 母片精修失败链、三证据面和 7 条 ChatCut 产品问题。

**V1.4.0（2026-07-24）** — 从技巧包升级为可验证生产系统：Rule Registry、Creator OS IR/Rational Time、SRT/可解释规划、预览审批、可恢复执行与证据链、Media QA/导出授权、受治理交付包、反馈治理和 capability live gate 全部进入离线 release gates；真实 ChatCut adapter、真实媒体探针/渲染与平台发布继续保持 `unverified` 且不自动执行。

**V1.3.1(2026-07-24)** — 契约止血与发布地基：Node/lockfile/CI 可复现安装；Ajv 离线验证全仓 JSON；source/resolved profile 契约、继承路径修复、合并来源追踪与安全 CLI；字幕数值语义、词 key/区间、短卡类型、override 上限、严格 warning 与项目/时间线 provenance 绑定；主题对比度、composition 几何、资产引用和文档/版本漂移全部进入 release gate。旧字幕 JSON 仍可非严格迁移，发布态须补齐 provenance。

完整变更历史见 [CHANGELOG.md](./CHANGELOG.md) 或 [GitHub Releases](https://github.com/maojiebc/majia-chatcut-koubo/releases)。

## 方法来源

规则主体来自作者的 ChatCut 实战复盘。部分方法论参考了以下开源项目(未复制代码实现):`Agentchengfeng/chengfeng-videocut-skills`(删前保后/风险分层)、`lcbuaaliu/ai-jian-koubo`(确定性预选+语义判断)、`WyattBlue/auto-editor`(反向审查将删内容)、`radix-ui/colors`、`material-foundation/material-color-utilities`、`adobe/leonardo`(语义色阶与对比度优先)、`d3/d3-scale-chromatic`(数据色板)、`pireel/pireel`(AGPL-3.0;仅吸收「主题=数据+代理 playbook」与逐主题调用 crib 的组织方法,未复制其任何主题内容、文本或代码)、`yoqu/lingji-cut`(Apache-2.0;仅吸收「进场/出场/循环强调」三轴动效枚举的组织方法,枚举取舍与全部文本为本包自定)。

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

> 这份 skill 是 14 年用户运营 + 内容矩阵实战沉淀出来的，问题/合作随时聊。
