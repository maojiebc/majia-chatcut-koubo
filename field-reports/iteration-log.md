# 实战经验读取与迭代记录

追加式记录。每次 Skill 迭代或命中案例标签的真实任务，先读案例，再在此记录读后决策。

## 记录模板

```markdown
## YYYY-MM-DD · <iteration-or-task>

- skill_version_before:
- actor:
- task_tags:
- cases_read:
  - <case-id>
- adopted:
  - <采用的结论及落点>
- rejected_or_deferred:
  - <未采用的结论、原因、需要的证据>
- new_canaries:
  - <失败签名 + 代表时间/语义边界>
- promoted:
  - <case → references/rules，或 none>
- files_changed:
  - <path>
- verification:
  - <command/evidence>
```

## 2026-07-24 · AI Hero 案例首次入库

- skill_version_before: `1.4.0`
- actor: `Codex + 用户复核`
- task_tags:
  - `chatcut-editor`
  - `cloud-render`
  - `motion-graphic`
  - `hyperframes`
  - `captions`
  - `export-60fps`
- cases_read:
  - `FR-2026-07-24-AI-HERO-001`
- adopted:
  - 新增案例库读写硬闸；迭代前完整读取命中案例，读后必须留痕。
  - 把“真实 Hyperframes 成片”与“修改 ChatCut MG 代码”定义为不同 artifact identity。
  - 把编辑器预览、项目结构和云端合成帧定义为三个不同证据面。
- rejected_or_deferred:
  - 未把一次编辑器缓存事故直接晋升为全局 hard policy；需要更多 ChatCut build/浏览器/资产类型样本。
  - 未断言黑底一定由单一缓存层引起；现有证据同时包含同步中断和共享 MG 更新传播异常。
- new_canaries:
  - `live-editor-old-black/cloud-frame-sea-salt/shared-mg`
  - `sync-interrupted-after-reload`
  - `external-mg-proof-times-show-motif-not-title`
- promoted:
  - `none`；先进入案例库，重复复验后再更新 `references/chatcut-field-notes.md`。
- files_changed:
  - `field-reports/README.md`
  - `field-reports/iteration-log.md`
  - `field-reports/cases/2026-07-24-ai-hero-master-refinement.md`
  - `SKILL.md`
  - `README.md`
- verification:
  - Markdown 链接检查；
  - `npm run verify`。

## 2026-07-24 · AI Hero 字幕语义分页与过渡返修

- skill_version_before: `1.4.1`
- actor: `Codex + 用户复核`
- task_tags:
  - `captions`
  - `semantic-pagination`
  - `hyperframes`
  - `audio-seam`
- cases_read:
  - `FR-2026-07-24-AI-HERO-001`
- adopted:
  - 字幕源只绑定最终人物口播轨，章节卡、音乐和音效不得参与字幕源集合。
  - 删除“单行 + 约 19 字自动硬切”作为分段逻辑；字符预算仅保留为最终像素门禁。
  - 发布上限从强制单行改为默认单行、最多两行；同一语义事件内部允许视觉换行，但换行不得制造新的字幕出现/消失。
  - 分页顺序固定为“完整语义事件 → 阅读时长 → 实际排版”，并保护谓词组、数量单位和并列分项。
  - 复用已验收 Hyperframes 母资产，只调整时间线播放速度、淡入淡出和音频接缝。
- rejected_or_deferred:
  - 不重新生成章节卡；用户已确认视觉内容无误，问题只在节奏与衔接。
  - 不用“字符数合格”替代语义审计；该指标无法发现短语被拆。
- new_canaries:
  - `caption-splits-parallel-predicate-at-03:47`：不得拆开“还是人工太高了”。
  - `hyperframes-card-hard-cut-no-transition`：章节卡不得硬入硬出。
  - `audio-click-at-card-boundary`：切口不得出现爆破/点击声。
- promoted:
  - `case → references/captions-terminology.md`
  - `case → references/chatcut-field-notes.md`
- verification:
  - 当前片回读为 `maxLines=2`、`pacing=auto`；字符容量只用于承载已确定的语义事件。
  - 用户点名的并列谓词 canary 已回读为三个完整字幕事件，并完成云端像素抽帧。
  - 全片仍有 8 个宿主 `break=length` 标记：2 个文本自身语义完整，6 个位于 1–7 帧词槽断层；后者即使已有 `merge-prev` 且提高卡容量仍不合并，登记为 ChatCut host canary，不用文本转移伪修。
  - 章节卡抽帧确认已有进入、稳定和退出阶段；现有资产未重新生成。
  - `npm run verify` 通过，字幕策略新增“允许两行但不放宽逐行预算”的正反测试。
- files_changed:
  - `references/captions-terminology.md`
  - `references/chatcut-field-notes.md`
  - `field-reports/iteration-log.md`
  - `field-reports/cases/2026-07-24-ai-hero-master-refinement.md`
- verification:
  - 进行中：全片字幕回读、`break=length` 扫描、3:47 canary、章节卡边界抽帧和音频接缝复核。
