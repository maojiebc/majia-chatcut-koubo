---
id: FR-2026-07-24-AI-HERO-001
date: 2026-07-24
status: verified
privacy: public-sanitized
skill_version: 1.4.0
chatcut_build: unknown
hyperframes_cli: 0.7.70
tags:
  - chatcut-editor
  - cloud-render
  - shared-motion-graphic
  - hyperframes
  - captions
  - source-offset
  - export-60fps
chatcut_surfaces:
  - editor-preview
  - project-state
  - cloud-timeline-frame
  - durable-export
failure_signatures:
  - live-editor-old-black/cloud-frame-sea-salt/shared-mg
  - sync-interrupted-after-reload
  - artifact-identity-mismatch/chatcut-mg-vs-hyperframes-video
  - proof-times-show-motif-not-title
---

# AI Hero 母片精修实录：编辑器黑底、云端帧正常与真实 Hyperframes 替换

## 给谁看

- Skill 维护者：下一轮迭代前读取失败链，避免把同一个坑重新踩一遍。
- ChatCut 产品经理和开发：这里把用户可见问题拆成可复现的 expected / actual / impact / workaround。
- 视频代理开发者：理解“代码层写入成功”“编辑器看见”“云端成片正确”是三个不同命题。

## 一句话结论

一次约 15 分钟的 ChatCut 母片精修中，代理把后续章节卡的共享 ChatCut Motion Graphic 改成浅青样式，项目状态与云端合成帧都显示新样式，但用户的编辑器仍看到第一幕正常、后续章节黑底。更关键的是，用户要求的是“Hyperframes 精修成片”，而代理最初交付的是“ChatCut MG 代码改色”，artifact identity 本身就错了。

最终修复不是继续刷新共享 MG，而是：

1. 用 Hyperframes 生成一支 10.5 秒、315 帧、1920×1080 的真实视频母合成；
2. 导入 ChatCut 为普通无音轨视频资产；
3. 在 V6 原位删除 6 个共享 MG 实例；
4. 用同一视频资产的 6 个独立时间线实例替换，source offset 依次为 `0 / 1.5 / 3 / 4.5 / 6 / 7.5s`；
5. 结构回读和云端逐幕抽帧确认无黑场；
6. 用户追加授权后导出 1080P、60fps、H.264 文件，并用 `ffprobe` 验证实际参数。

## 范围与冻结条件

- 不大改结构，不重剪口播。
- 保留第一幕已获用户认可的 H 视觉语言。
- 第 2–6 幕和 GitHub 片尾补齐同一风格。
- 尖叫、非语言音段、无有效口播不显示字幕。
- 字幕以用户精校稿、原声和上下文为真相源。
- 十分钟后重点检查口播、人物和录屏是否同一时间轴、同一件事。
- 不覆盖或删除旧导出文件。
- 未获明确授权前不导出；获授权后才提交完整成片导出。

公开版已移除真实项目 ID、资产 ID、签名链接、本机路径和业务敏感数字。

## 事实时间线

### 1. 接力与审计

任务从另一段 AI 对话接力，已有：

- ChatCut 项目和目标时间线；
- 约 14 分 56 秒的母片；
- 第一幕 H 风格过渡；
- 用户精校字幕目录；
- 用户明确的“精修，不大改结构或重剪”授权。

代理先做全片审计，而不是直接全量写入：

- 字幕分页全量扫描约 391 页；
- 检查一分钟以后气口和断句；
- 清除或隐藏非语言/无有效口播字幕；
- 搜索阿拉伯数字和 ASR 吞位模式；
- 修复一个“`N+` 被识别成连接词/另一数字”的数字语义错误；
- 检查十分钟后人物、录屏和口播对应关系；
- 修复人物从窗口“呼吸”到全屏时的纵横比形变；
- 抽查后续章节过渡和片尾。

证据：

- 结构和字幕回读：`E1`。
- 云端合成帧和最终导出：`E3`。
- 用户对编辑器黑底的观察：`E2`，但当时未保存编辑器像素截图。

### 2. 第一次错误修复：把共享 ChatCut MG 当成 Hyperframes 成片

V6 中第一幕是已导入的视频资产，后续 5 张章节卡和片尾共用一个 ChatCut MG 资产，仅通过 `propertyOverrides.title` 改标题。

代理做了：

- 修改共享 MG 的背景、文字、强调色和字体默认值；
- 修改 MG 代码，使其接近主题 `sea-salt-cyan` 的 H 风格；
- 回读 asset defaults，确认新颜色已存在；
- 用云端 `view_timeline_frames` 抽取后续章节中点帧，看到浅青画面。

当时的错误结论：

> 云端帧已变浅青，因此后续章节卡已经修好。

这个结论同时犯了两个错误：

1. **证据面混淆**：云端帧正确，不代表用户编辑器同一时刻已经刷新到同一 revision。
2. **artifact identity 错误**：用户说“Hyperframes 精修”，交付却仍是 ChatCut MG，只是代码和配色变了。

### 3. 用户反馈：第一幕正常，其他仍黑底

用户直接指出：

> Hyperframes 没看到精修进去，V6 除了第一幕正常，其他都是黑底。

这条反馈是本案的关键 canary。它证明：

- 用户区分了第一幕的真实视频资产与后续共享 MG；
- 代理不能用“后端代码已更新”替代“编辑器里实际可见”；
- 代理此前的完成声明无效，必须撤回并重新定义交付物。

### 4. 编辑器重连时观察到的 ChatCut 产品现象

重新接管编辑器并刷新后，DOM/通知出现：

```text
Sync connection interrupted. Reconnecting…
如果等待时间过长，可以尝试刷新网页
```

还观察到：

- 刷新后项目库弹层出现；
- 时间码回到 `00:00.00`；
- 素材区出现“素材加载中...”；
- 一次刷新后短暂恢复，数秒后再次进入同步中断；
- 项目结构和媒体池仍能从连接器读取；
- 云端帧仍能渲染新浅青样式；
- 用户编辑器此前仍显示旧黑底样式。

这组证据不足以断言单一根因是“缓存”，更准确的分类是：

> 编辑器实时同步/缓存失效与共享 MG 更新传播之间存在不一致；项目状态、云端 renderer 和 live editor 没有被证明处于同一个 revision。

### 5. 正确修复：真实 Hyperframes 视频资产

新建独立 Hyperframes 工程，设计目标：

- 1920×1080，30fps；
- 5 个章节卡各 1.5 秒；
- GitHub 片尾 3 秒；
- 总时长 10.5 秒 / 315 帧；
- `sea-salt-cyan` 主题底、深青中文、小号章节标记、大留白；
- H 作为统一连接构形；
- 每段第 0 帧和末帧都由浅青背景兜底，绝不出现黑帧；
- 本地嵌入 Smiley Sans，避免字体网络漂移；
- 无旁白、无音轨。

#### Hyperframes 构建中实际出现的错误

第一次 `lint` 报错：

```text
missing_timeline_registry
host_missing_composition_id
gsap_css_transform_conflict
invalid_parent_traversal_in_asset_path
```

对应修复：

- 根 host 增加正确 `data-composition-id`；
- 无 timeline 的根合成标记 `data-no-timeline`；
- 字体路径从 `../assets/...` 改为项目根解析的 `assets/...`；
- 移除 CSS `transform: translate(-50%, -50%)`；
- 在 GSAP `fromTo` 中显式使用 `xPercent/yPercent: -50`。

对比度检查最初发现浅色强调字和页脚不达标：

- 大字阈值未达到 3:1；
- 小字阈值未达到 4.5:1。

修复方式：

- 强调色调深；
- 次要文字从浅青灰调整为更深的灰绿；
- 新增更深的 `accent-strong` 供小号英文标签使用。

最终检查：

- Runtime：0 errors；
- Layout：0 issues；
- Motion：0 errors；
- Contrast：21/21 通过 WCAG AA；
- 仍保留“单文件较大/单轨 6 scene 较密”的结构警告，不影响渲染。

#### 证明时间选择也踩了一次坑

第一次快照时间选在每幕开始约 0.3 秒，只拍到了 H 构形，没有拍到标题稳定态。检查虽然成功，但不证明标题内容正确。

第二次把 proof times 移到每幕约 0.8 秒的 hold 区，才同时看见：

- 第 2–6 幕标题；
- 第 3 幕问题短句；
- GitHub 名称；
- 浅青背景和 H 水印；
- 片尾收束。

经验：

> proof time 必须覆盖 opening、signature move、title hold 和 ending。只拍“有动画”不等于证明“信息正确”。

### 6. 导入 ChatCut：一个母资产，六个独立实例

Hyperframes 高质量渲染得到：

- 10.5 秒；
- 315 帧；
- 1920×1080；
- MP4；
- 无音轨。

没有用本地 ffmpeg 拆成 6 个重复文件。正确做法是：

1. 使用 ChatCut 官方 `import_media create_session`；
2. 用官方 `upload-media.mjs` 上传一支母合成；
3. 在 V6 做原子 `delete + add`；
4. 先 `validateOnly:true`；
5. 验证通过后提交同一批操作；
6. 六个视频实例使用精确 source offset。

| 角色 | 时间线时长 | source offset |
| --- | ---: | ---: |
| 第 2 幕 | 45 帧 / 1.5s | 0s |
| 第 3 幕 | 45 帧 / 1.5s | 1.5s |
| 第 4 幕 | 45 帧 / 1.5s | 3s |
| 第 5 幕 | 45 帧 / 1.5s | 4.5s |
| 第 6 幕 | 45 帧 / 1.5s | 6s |
| GitHub 片尾 | 90 帧 / 3s | 7.5s |

这个方案比 6 份独立文件更稳：

- 一份编码和上传；
- 时间线仍保留 6 个可独立移动/修剪的实例；
- 不再依赖共享 MG 代码运行时和缓存；
- source offset 可结构回读；
- 无嵌入音频，不影响人物 anchor。

### 7. ChatCut 最终验证

结构回读确认：

- V6 旧共享 MG 实例已全部消失；
- 新实例类型为 `video`；
- 1920×1080、全屏、`keepAspectRatio=true`；
- `fadeIn=0`、`fadeOut=0`；
- source offset 与计划一致；
- 无嵌入音轨。

云端合成帧取样：

- 第一张卡：首帧、中间标题帧、最后可见帧；
- 第 3–6 幕：各一个标题 hold 帧；
- GitHub 片尾：名称 hold 帧、最后可见帧。

结果：

- 首尾均为 `sea-salt-cyan` 主题背景；
- 中段标题正确；
- H 水印比例正常；
- GitHub 名称正确；
- 未见黑场；
- 未见人物拉伸；
- 未改变原口播结构。

### 8. 1080P 60fps 导出

用户在替换完成后明确追加：

> 导出 1080P 60 帧视频文件。

执行：

- ChatCut durable export；
- H.264；
- 1920×1080；
- 60fps；
- 完整时间线。

导出进度在较长时间里约停留在 20%，随后完成。不要用短时间内的进度增量判断卡死；按 `checkBackAfterSeconds` 读取，不忙轮询。

最终文件只记录脱敏媒体指标：

- 约 14:56；
- 1920×1080；
- H.264；
- 60fps；
- 约 188 MiB。

下载后用 `ffprobe` 验证实际文件，而不是相信文件名：

- codec = h264；
- width/height = 1920×1080；
- `r_frame_rate = 60/1`；
- duration 与时间线一致。

## ChatCut 产品问题清单

以下条目可直接分享给 ChatCut 产品经理和开发。严重度是生产影响评估，不代表官方优先级。

### CC-PROD-001 · 编辑器预览与云端合成帧不一致

- severity: `P1`
- evidence: `E2 用户观察 + E1 项目/DOM + E3 云端帧`
- expected:
  - 同一项目 revision、同一时间线帧，live editor 与云端 renderer 显示同一 MG 结果。
- actual:
  - 项目 asset defaults/code 已是浅青；
  - 云端同帧显示浅青；
  - 用户编辑器仍看到旧黑底。
- impact:
  - 用户无法相信编辑器；
  - 代理可能根据云端帧误报“已经修好”；
  - PM/开发难判断是代码、缓存还是同步问题。
- workaround:
  - 记录 revision；
  - 编辑器强制刷新；
  - 同时做项目回读和云端帧；
  - 仍不一致时改用真实视频资产，绕开 live MG runtime。
- requested_fix:
  - 编辑器显示当前 revision / asset version；
  - MG 资产代码更新后主动失效所有实例缓存；
  - 提供“编辑器帧 vs 云端帧”一键对比与诊断信息。
- evidence_gap:
  - 未保留黑底状态的 live-editor 截图；
  - ChatCut build 未暴露，无法映射具体发布版本。

### CC-PROD-002 · 同步中断后刷新不能稳定恢复

- severity: `P1/P2`
- evidence: `E1 DOM 通知`
- actual_strings:

```text
Sync connection interrupted. Reconnecting…
如果等待时间过长，可以尝试刷新网页
```

- observed:
  - 点击 Refresh 后一度恢复；
  - 数秒后再次进入同步中断；
  - 项目结构连接器仍可读取；
  - 编辑器素材加载和画布状态不稳定。
- impact:
  - 用户看到的画面可能不是最新 revision；
  - 刷新动作本身不能作为“已恢复”的证据。
- workaround:
  - 刷新后等待具体同步健康信号；
  - 不以素材池出现或时间码归零判断项目已就绪；
  - 关键视觉用云端合成帧兜底。
- requested_fix:
  - 显示连接状态、最后成功 revision、待同步操作数；
  - Refresh 后给出成功/失败的稳定终态，不进入无反馈循环；
  - 支持导出诊断包供 PM/开发定位。

### CC-PROD-003 · 刷新后项目库弹层和时间码归零干扰恢复

- severity: `P2`
- evidence: `E1 DOM`
- observed:
  - 刷新后出现项目库 dialog；
  - 时间码显示 `00:00.00`；
  - 需要再次关闭项目库才能观察编辑器。
- impact:
  - 用户容易以为项目被切换或时间线丢失；
  - 自动化恢复需要额外识别弹层。
- requested_fix:
  - 项目 URL 启动时不自动打开项目库；
  - 恢复最近 timeline/playhead；
  - 异常恢复态提供明确 skeleton，而不是正常可交互的 00:00 假象。

### CC-PROD-004 · 共享 MG 更新缺少实例传播与版本可见性

- severity: `P1`
- evidence: `E1 asset/item 回读 + E2 用户观察 + E3 云端帧`
- expected:
  - 更新一个 MG asset 后，所有引用实例使用同一明确版本。
- actual:
  - 项目层和云端渲染命中新版本；
  - live editor 疑似仍持有旧实例/旧 bundle。
- requested_fix:
  - asset 级 `version/hash/compiledAt`；
  - item 显示当前解析到的 asset version；
  - 更新后全实例 invalidation；
  - 可手动“重新编译/重载此 MG 的所有实例”。

### CC-PROD-005 · “代码写入成功”缺少画面一致性回执

- severity: `P1`
- expected:
  - 写入 MG code/defaults 后返回编译状态、实例刷新状态和 renderer parity。
- actual:
  - 工具可证明代码/默认值保存；
  - 不能证明 live editor 与 cloud renderer 已在同一版本。
- requested_fix:
  - 将 save、compile、instance refresh、preview ready、cloud ready 拆成可观察状态；
  - 最终回执带 asset hash 和 preview hash。

### CC-PROD-006 · 导出进度非线性且缺少阶段说明

- severity: `P3`
- evidence: `E1 durable export status + E3 final file`
- observed:
  - 进度在约 20% 长时间变化很小；
  - 后续正常完成，无错误。
- impact:
  - 用户和代理容易误判卡死并重复提交导出。
- workaround:
  - 只按 durable render ID 跟踪；
  - 遵守 `checkBackAfterSeconds`；
  - 非 terminal 不重复提交。
- requested_fix:
  - 显示阶段：排队/资产拉取/渲染/编码/上传；
  - 进度长时间不变时显示 heartbeat 和估计剩余时间。

### CC-PROD-007 · 缺少统一的三画面对账入口

- severity: `P2`
- problem:
  - 当前需要分别查看项目结构、编辑器 canvas、云端合成帧。
- requested_fix:
  - 在某一精确时间线帧展示：
    - timeline revision；
    - 可见 items / source offsets；
    - live editor screenshot；
    - cloud render screenshot；
    - 两图差异；
    - 相关 asset hashes。

这会显著降低“代码层面一个画面、编辑器另一个画面”的沟通成本。

## 代理/Skill 层踩坑

### 1. 完成标准必须包含 artifact identity

错误问题：

> 视觉样式是不是改了？

正确问题：

> 用户要求的交付物类型是不是已经存在并进入时间线？

本案中：

- ChatCut MG 改色 ≠ Hyperframes 成片；
- 媒体池有 Hyperframes MP4 ≠ V6 已放置视频实例；
- 云端帧变浅青 ≠ 用户编辑器同步健康。

建议新增门禁：

```text
requested_artifact_kind
produced_artifact_kind
placed_item_kind
verification_surface
```

四项不一致，禁止报完成。

### 2. 三证据面不能互相替代

| 证据面 | 能证明 | 不能证明 |
| --- | --- | --- |
| `read_project` / asset 回读 | 数据已写入、实例和 offset 存在 | 像素正确、用户已看到 |
| live editor | 用户此刻看见什么 | 云端导出一定相同 |
| cloud timeline frames | 导出式合成像素 | live editor 已刷新 |

### 3. 外部 MG 应优先落为文件资产

当用户明确点名 Hyperframes、Remotion 或其他外部生成器时：

- 必须有真实 render artifact；
- 必须通过官方 import helper 进入 ChatCut；
- 必须验证时间线 item type；
- 不能用“在 ChatCut 里重写一个相似 MG”替代，除非用户同意。

### 4. 共享实现改动触发全量回归

共享 MG 修改会影响全部引用实例。一次改动后：

- 每个引用场景至少一个 hold 帧；
- 边界场景要看首/末帧；
- 任一 live/cloud 不一致，全部证据标 stale。

### 5. 浏览器恢复不是产品状态证据

标签页接管成功、URL 正确、DOM 可读，只证明页面连接；不证明：

- sync healthy；
- media ready；
- canvas 使用最新 asset；
- playhead 对准目标帧。

### 6. 导出必须最后用媒体文件验证

文件名中的 `1080p60` 不是证据。最终至少核对：

- codec；
- width/height；
- frame rate；
- duration；
- file size；
- 必要时首尾内容。

## 下一轮 Skill 候选

以下条目先保持 candidate，不立即全部升级 hard policy：

1. `artifact-identity-gate`：点名外部生成器时必须验证真实文件资产和时间线 item kind。
2. `renderer-parity-check`：live/editor/cloud 不一致时禁止完成声明。
3. `sync-health-precondition`：编辑器显示同步中断时，live 画面只能作为 incident evidence，不能作为最新状态。
4. `proof-time-coverage`：外部 MG 快照必须覆盖 opening/motif/hold/end。
5. `external-mg-master-offset`：短卡可用一支母视频 + 多 source offset 实例，避免重复上传。
6. `shared-asset-regression-matrix`：共享 MG/code 更新后所有引用实例证据失效。
7. `durable-export-no-resubmit`：同一 render ID 非 terminal 时不重复提交。

## 建议 ChatCut 团队采集的诊断字段

```json
{
  "projectRevision": "<opaque>",
  "timelineRevision": "<opaque>",
  "assetId": "<redacted>",
  "assetVersionHash": "<hash>",
  "itemResolvedAssetHash": "<hash>",
  "editorBundleHash": "<hash>",
  "cloudBundleHash": "<hash>",
  "syncState": "healthy|reconnecting|stale",
  "lastSyncedAt": "<timestamp>",
  "pendingOperationCount": 0,
  "playheadFrame": 0,
  "renderer": "editor-webgl|cloud",
  "chatcutBuild": "<semver-or-sha>"
}
```

## 修订记录

- 2026-07-24：首次公开脱敏入库。事实来自完整任务过程、项目结构回读、Hyperframes 检查/快照、ChatCut 云端合成帧和最终导出文件。
- 2026-07-24：用户复核发现字幕虽满足单行和长度预算，仍存在并列谓词组被拆开的语义错误；代表 canary 为“还是人工｜太高了”。根因不是 SRT 难以理解，而是把宿主约 19 字的长度硬切误当成了分页策略。纠正为“语义事件优先、时长其次、像素宽度最后”：默认一行，必要时同一事件可排两行；`break=length` 若制造新的时间事件或拆开短语则失败，纯视觉换行不再误判。
- 2026-07-24：用户确认章节卡视觉本身无需重做；返修只复用现有 Hyperframes 母资产，放慢播放并补淡入淡出。人物口播和背景音乐切口另做短交叉淡化，避免轻微爆破/点击声。
- 2026-07-24：进一步实测确认 ChatCut 把时间卡容量和视觉换行耦合在 `maxCharactersPerLine`：降低容量会产生新的先后字幕卡，提高容量会把同一事件拉成长单行，缩小 layout width 也未必约束云端字幕背景。最终采用“显式语义事件 + 默认一行/最多两行 + 项目级容量标定”，不再维护全局固定字数切分规则。
- 2026-07-24：全片回读仍有少量 `break=length` host canary；其中语义错误项集中在极短词槽断层。`keepWithPrevious` 已落盘但渲染器仍拒绝合并，提升容量无效。为避免把整句转移到短词 key 造成闪帧，按三轮上限停止伪修并列为 ChatCut 产品问题。
