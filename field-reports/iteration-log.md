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
