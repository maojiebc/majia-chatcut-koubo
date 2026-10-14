#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {execFileSync} from "node:child_process";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function officialPath(checkout, relative) {
  const root = fs.realpathSync(checkout);
  const real = fs.realpathSync(path.join(root, relative));
  const within = path.relative(root, real);
  if (within === ".." || within.startsWith(`..${path.sep}`) || path.isAbsolute(within)) throw new Error("OFFICIAL_PATH_OUTSIDE_CHECKOUT");
  return real;
}
function readOfficial(checkout, relative) {
  const real = officialPath(checkout, relative);
  const stat = fs.statSync(real);
  if (!stat.isFile() || stat.size > 2 * 1024 * 1024) throw new Error("OFFICIAL_FILE_TYPE_INVALID");
  return fs.readFileSync(real);
}
export function collectOfficialFiles(checkout) {
  const root = fs.realpathSync(checkout);
  const files = [];
  function visit(relative, ancestors = new Set()) {
    const real = officialPath(root, relative);
    const stat = fs.statSync(real);
    if (stat.isDirectory()) {
      if (ancestors.has(real) || ancestors.size > 30) throw new Error("OFFICIAL_PATH_CYCLE");
      for (const name of fs.readdirSync(real).sort()) visit(`${relative}/${name}`, new Set([...ancestors, real]));
    } else if (stat.isFile()) {
      if (stat.size > 2 * 1024 * 1024 || files.length >= 1500) throw new Error("OFFICIAL_WATCH_LIMIT");
      files.push({path: relative, sha256: crypto.createHash("sha256").update(fs.readFileSync(real)).digest("hex")});
    } else throw new Error("OFFICIAL_FILE_TYPE_INVALID");
  }
  if (fs.existsSync(path.join(root, "codex"))) visit("codex");
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export function auditOfficialSnapshot(snapshot, {checkout = null} = {}) {
  const findings = [];
  const add = (code, file = null) => findings.push({code, file});
  const validFiles = (files) => Array.isArray(files) && files.length > 0
    && new Set(files.map((item) => item?.path)).size === files.length
    && files.every((item) => /^(?:codex|chatcut-desktop-codex-plugin)\/[a-zA-Z0-9._/-]+$/u.test(item.path ?? "") && !item.path.split("/").includes("..") && /^[a-f0-9]{64}$/u.test(item.sha256 ?? ""));
  const valid = snapshot?.repository === "https://github.com/ChatCut-Inc/agent-plugin"
    && /^[a-f0-9]{40}$/u.test(snapshot.commit ?? "")
    && Number.isFinite(Date.parse(snapshot.observedAt))
    && /^\d+\.\d+\.\d+$/u.test(snapshot.hostedPluginVersion ?? "")
    && /^\d+\.\d+\.\d+$/u.test(snapshot.desktopConnectorVersion ?? "")
    && Array.isArray(snapshot.hostedSkills) && snapshot.hostedSkills.length > 0
    && new Set(snapshot.hostedSkills).size === snapshot.hostedSkills.length
    && snapshot.hostedSkills.every((name) => /^[a-z][a-z0-9-]{0,79}$/u.test(name))
    && validFiles(snapshot.reviewedFiles)
    && (snapshot.watchedFiles === undefined || validFiles(snapshot.watchedFiles))
    && snapshot.verificationScope === "official-source-review"
    && snapshot.liveToolsObserved === false && snapshot.mediaVerified === false;
  if (!valid) add("OFFICIAL_SNAPSHOT_INVALID");
  let observedCommit = null;
  if (valid && checkout) {
    try {
      observedCommit = execFileSync("git", ["rev-parse", "HEAD"], {cwd: checkout, encoding: "utf8", timeout: 5000, stdio: ["ignore", "pipe", "ignore"]}).trim();
      if (observedCommit !== snapshot.commit) add("OFFICIAL_COMMIT_DRIFT");
      for (const item of snapshot.reviewedFiles) {
        const bytes = readOfficial(checkout, item.path);
        if (crypto.createHash("sha256").update(bytes).digest("hex") !== item.sha256) add("OFFICIAL_CONTENT_DRIFT", item.path);
      }
      if (snapshot.watchedFiles) {
        const previous = new Map(snapshot.watchedFiles.map((file) => [file.path, file.sha256]));
        const current = new Map(collectOfficialFiles(checkout).map((file) => [file.path, file.sha256]));
        for (const [file, hash] of previous) {
          if (!current.has(file)) add("OFFICIAL_WATCH_FILE_REMOVED", file);
          else if (current.get(file) !== hash) add("OFFICIAL_WATCH_CONTENT_DRIFT", file);
        }
        for (const file of current.keys()) if (!previous.has(file)) add("OFFICIAL_WATCH_FILE_ADDED", file);
      }
      const skills = fs.readdirSync(officialPath(checkout, "codex/skills"))
        .filter((name) => fs.existsSync(path.join(checkout, "codex/skills", name, "SKILL.md"))).sort();
      if (JSON.stringify(skills) !== JSON.stringify([...snapshot.hostedSkills].sort())) add("OFFICIAL_SKILL_INVENTORY_DRIFT");
      for (const [file, version] of [["codex/.codex-plugin/plugin.json", snapshot.hostedPluginVersion], ["chatcut-desktop-codex-plugin/.codex-plugin/plugin.json", snapshot.desktopConnectorVersion]]) {
        if (JSON.parse(readOfficial(checkout, file).toString("utf8")).version !== version) add("OFFICIAL_VERSION_DRIFT", file);
      }
    } catch (error) {
      add(["OFFICIAL_PATH_OUTSIDE_CHECKOUT", "OFFICIAL_PATH_CYCLE", "OFFICIAL_WATCH_LIMIT", "OFFICIAL_FILE_TYPE_INVALID"].includes(error.message) ? error.message : "OFFICIAL_CHECKOUT_UNAVAILABLE");
    }
  }
  return {ok: findings.length === 0, findings, upstreamChecked: Boolean(checkout), observedCommit, watchCoverage: snapshot?.watchedFiles ? "hosted-package" : "reviewed-files-only", verificationScope: checkout ? "supplied-official-checkout" : "recorded-official-snapshot", mediaVerified: false};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    let checkout = null;
    let json = false;
    for (let index = 2; index < process.argv.length; index += 1) {
      const flag = process.argv[index];
      if (flag === "--json" && !json) json = true;
      else if (flag === "--checkout" && !checkout && process.argv[index + 1] && !process.argv[index + 1].startsWith("--")) checkout = path.resolve(process.argv[++index]);
      else throw new Error("usage");
    }
    const snapshot = JSON.parse(fs.readFileSync(path.join(ROOT, "reports/official-source-current.json"), "utf8"));
    const report = auditOfficialSnapshot(snapshot, {checkout});
    if (json) process.stdout.write(`${JSON.stringify(report)}\n`);
    else process.stdout.write(`official source: ${report.ok ? "PASS" : "DRIFT"}, scope=${report.verificationScope}\n${report.findings.map((item) => item.code).join("\n")}\n`);
    if (!report.ok) process.exitCode = 1;
  } catch {
    process.stderr.write("OFFICIAL_AUDIT_UNAVAILABLE: use --checkout <official-checkout> [--json]\n");
    process.exitCode = 2;
  }
}
