# 本地个人层模板（local-config-example）

把本目录整体复制为 `~/.config/majia-chatcut-koubo/`，装进你自己的数字与偏好。skill 开工时会探测该目录：**存在则叠加在本包的通用规则之上**；不存在就只用包内通用值。本地层**永不进 git**、永不进公开仓——品牌词、真实业务数字、个人实测坐标全部放这里。

```
~/.config/majia-chatcut-koubo/
  profile/            个人 operating profile(实测版式/字幕/音频数字);同名键覆盖包内
                      assets/compositions.json 与模板默认值;一版一文件,升版不覆盖旧版
  terminology.json    个人词表(机器读):validator 用 --terms 指向它
  terminology.md      个人词表(人读版,可选):维护心得、证据记录
  aesthetics.md       个人审美基线:过渡手感、构图偏好、保护基线清单
  local-notes.md      个人补充护栏:私有工作流衔接、平台账号惯例、个人路径
```

对应关系：

| 本地文件 | 覆盖/叠加的公开资产 | 用法 |
| --- | --- | --- |
| `profile/*.json` | `templates/operating-profile.template.json` 起模；同名键覆盖 `assets/compositions.json` 坐标 | 剪辑开工先读；`validate-caption-pages.mjs --profile` 指向它 |
| `terminology.json` | `templates/terminology.template.json` 起模 | `validate-caption-pages.mjs --terms` 指向它 |
| `aesthetics.md` | `SKILL.md` 红线之上的个人裁决面 | 审美分歧时代理先读它再问你 |
| `local-notes.md` | 无（纯个人层） | 写不适合进公开包的一切个人惯例 |

例子文件都带注释，替换成你的内容即可。
