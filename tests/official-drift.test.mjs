import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import test from "node:test";
import {execFileSync} from "node:child_process";
import {auditOfficialSnapshot, ROOT} from "../scripts/check-official-drift.mjs";

test("来源快照检查不会伪造上游连接或真实媒体验证", () => {
  const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, "reports/official-source-current.json")));
  const result = auditOfficialSnapshot(snapshot);
  assert.equal(result.ok, true);
  assert.equal(result.upstreamChecked, false);
  assert.equal(result.mediaVerified, false);
  assert.equal(auditOfficialSnapshot({...snapshot, mediaVerified: true}).ok, false);
  assert.equal(auditOfficialSnapshot({...snapshot, reviewedFiles: [{path: "codex/../private", sha256: "a".repeat(64)}]}).ok, false);
});

test("参数文档变化、插件版本变化和新增 Skill 都需重新审查", async (t) => {
  const checkout = fs.mkdtempSync(path.join(os.tmpdir(), "koubo-official-drift-"));
  t.after(() => fs.rmSync(checkout, {recursive: true, force: true}));
  const files = {"codex/.codex-plugin/plugin.json": '{"version":"1.0.0"}', "chatcut-desktop-codex-plugin/.codex-plugin/plugin.json": '{"version":"1.0.0"}', "codex/skills/example/SKILL.md": "# Synthetic skill\n"};
  for (const [file, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(checkout, file)), {recursive: true});
    fs.writeFileSync(path.join(checkout, file), body);
  }
  execFileSync("git", ["init", "-q"], {cwd: checkout});
  execFileSync("git", ["add", "."], {cwd: checkout});
  execFileSync("git", ["-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-qm", "fixture"], {cwd: checkout});
  const commit = execFileSync("git", ["rev-parse", "HEAD"], {cwd: checkout, encoding: "utf8"}).trim();
  const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, "reports/official-source-current.json")));
  const snapshot = {...baseline, commit, watchedFiles: undefined, hostedPluginVersion: "1.0.0", desktopConnectorVersion: "1.0.0", hostedSkills: ["example"], reviewedFiles: Object.entries(files).map(([file, body]) => ({path: file, sha256: crypto.createHash("sha256").update(body).digest("hex")}))};
  assert.equal(auditOfficialSnapshot(snapshot, {checkout}).ok, true);
  const {collectOfficialFiles} = await import("../scripts/check-official-drift.mjs");
  const watchedSnapshot = {...snapshot, watchedFiles: collectOfficialFiles(checkout)};
  fs.mkdirSync(path.join(checkout, "codex/hooks"));
  fs.writeFileSync(path.join(checkout, "codex/hooks/helper.mjs"), "new hook");
  assert.ok(auditOfficialSnapshot(watchedSnapshot, {checkout}).findings.some((finding) => finding.code === "OFFICIAL_WATCH_FILE_ADDED" && finding.file === "codex/hooks/helper.mjs"));
  const outside = path.join(os.tmpdir(), `koubo-reviewed-outside-${process.pid}.md`);
  fs.writeFileSync(outside, "not part of upstream");
  t.after(() => fs.rmSync(outside, {force: true}));
  const linked = "codex/skills/example/outside.md";
  fs.symlinkSync(outside, path.join(checkout, linked));
  const linkReport = auditOfficialSnapshot({...snapshot, reviewedFiles: [...snapshot.reviewedFiles, {path: linked, sha256: "a".repeat(64)}]}, {checkout});
  assert.ok(linkReport.findings.some((finding) => finding.code === "OFFICIAL_PATH_OUTSIDE_CHECKOUT"));
  fs.rmSync(path.join(checkout, linked));
  assert.ok(auditOfficialSnapshot({...snapshot, commit: "0".repeat(40)}, {checkout}).findings.some((finding) => finding.code === "OFFICIAL_COMMIT_DRIFT"));
  fs.writeFileSync(path.join(checkout, "codex/skills/example/SKILL.md"), "# Changed synthetic instruction\n");
  fs.writeFileSync(path.join(checkout, "codex/.codex-plugin/plugin.json"), '{"version":"2.0.0"}');
  fs.mkdirSync(path.join(checkout, "codex/skills/new-skill"));
  fs.writeFileSync(path.join(checkout, "codex/skills/new-skill/SKILL.md"), "# New synthetic skill\n");
  const result = auditOfficialSnapshot(snapshot, {checkout});
  const codes = result.findings.map((item) => item.code);
  for (const code of ["OFFICIAL_CONTENT_DRIFT", "OFFICIAL_VERSION_DRIFT", "OFFICIAL_SKILL_INVENTORY_DRIFT"]) assert.ok(codes.includes(code), code);
  assert.equal(result.ok, false);
});

test("未列入已审查文件的导入 helper 新增、删除和变化也会被监测", async (t) => {
  const {collectOfficialFiles} = await import("../scripts/check-official-drift.mjs");
  const checkout = fs.mkdtempSync(path.join(os.tmpdir(), "koubo-watch-"));
  t.after(() => fs.rmSync(checkout, {recursive: true, force: true}));
  const skill = path.join(checkout, "codex/skills/import");
  fs.mkdirSync(skill, {recursive: true});
  fs.writeFileSync(path.join(skill, "SKILL.md"), "# Import\n");
  fs.writeFileSync(path.join(skill, "helper.mjs"), "original");
  const before = collectOfficialFiles(checkout);
  fs.writeFileSync(path.join(skill, "helper.mjs"), "changed");
  fs.writeFileSync(path.join(skill, "added.mjs"), "new");
  fs.rmSync(path.join(skill, "SKILL.md"));
  const after = collectOfficialFiles(checkout);
  assert.equal(before.some((file) => file.path === "codex/skills/import/helper.mjs"), true);
  assert.notEqual(before.find((file) => file.path.endsWith("helper.mjs")).sha256, after.find((file) => file.path.endsWith("helper.mjs")).sha256);
  assert.equal(after.some((file) => file.path.endsWith("SKILL.md")), false);
  assert.equal(after.some((file) => file.path.endsWith("added.mjs")), true);
});

test("官方目录软链可以指向仓内共享 Skill，不能读取仓外文件", async (t) => {
  const {collectOfficialFiles} = await import("../scripts/check-official-drift.mjs");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "koubo-watch-links-"));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const checkout = path.join(root, "official");
  fs.mkdirSync(path.join(checkout, "codex/skills"), {recursive: true});
  fs.mkdirSync(path.join(checkout, "shared"));
  fs.writeFileSync(path.join(checkout, "shared/SKILL.md"), "# Shared\n");
  fs.symlinkSync("../../shared", path.join(checkout, "codex/skills/shared"));
  assert.equal(collectOfficialFiles(checkout).length, 1);
  fs.writeFileSync(path.join(root, "private.md"), "must not read");
  fs.symlinkSync(path.join(root, "private.md"), path.join(checkout, "codex/skills/private"));
  assert.throws(() => collectOfficialFiles(checkout), /OFFICIAL_PATH_OUTSIDE_CHECKOUT/);
});
