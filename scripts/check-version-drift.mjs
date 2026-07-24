#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const args = process.argv.slice(2);
let root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (args.length > 0) {
  if (args.length !== 2 || args[0] !== "--root" || !args[1]) {
    console.error("Usage: node scripts/check-version-drift.mjs [--root <repository-root>]");
    process.exit(2);
  }
  root = path.resolve(args[1]);
}
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const errors = [];

try {
const packageManifest = JSON.parse(read("package.json"));
const packageVersion = packageManifest.version;
const packageLock = JSON.parse(read("package-lock.json"));
const nodeVersion = read(".node-version").trim();
const nodeVersionMatch = /^(\d+)\.(\d+)\.(\d+)$/.exec(nodeVersion);
const nodeMajor = nodeVersionMatch ? Number(nodeVersionMatch[1]) : null;
const expectedNodeEngine = nodeMajor !== null
  ? `>=${nodeVersion} <${nodeMajor + 1}`
  : null;
const ciWorkflow = read(".github/workflows/ci.yml");
const policyVersion = JSON.parse(read("rules/policy.json")).version;
const ruleRegistry = JSON.parse(read("rules/registry.json"));
const themeKitVersions = [
  "assets/theme-kit/package.json",
  "assets/theme-kit/manifest.json",
  "assets/theme-kit/tokens/themes.json",
].map((relativePath) => ({
  relativePath,
  version: JSON.parse(read(relativePath)).version,
}));
const currentProfilePolicyVersions = [
  "fixtures/profiles/local/profile.source.json",
  "templates/operating-profile.template.json",
  "templates/local-config-example/profile/landscape.example.json",
].map((relativePath) => ({
  relativePath,
  version: JSON.parse(read(relativePath)).policyVersion,
}));
const skill = read("SKILL.md");
const readme = read("README.md");
const readmeEnglish = read("README.en.md");
const changelog = read("CHANGELOG.md");
const architectureSvg = read("docs/architecture.svg");
const migrationGuide = read("docs/migration-v1.3.1.md");
const roadmap = read("docs/roadmap.md");
const captionReference = read("references/captions-terminology.md");

const skillVersion = skill.match(/^metadata:\s*\n\s+version:\s*([^\s]+)\s*$/m)?.[1];
const changelogVersion = changelog.match(/^## V(\d+\.\d+\.\d+)\b/m)?.[1];

if (skillVersion !== packageVersion) {
  errors.push(`SKILL metadata version ${skillVersion ?? "<missing>"} != package ${packageVersion}`);
}
if (changelogVersion !== packageVersion) {
  errors.push(`latest CHANGELOG version ${changelogVersion ?? "<missing>"} != package ${packageVersion}`);
}
if (packageLock.version !== packageVersion) {
  errors.push(`package-lock version ${packageLock.version ?? "<missing>"} != package ${packageVersion}`);
}
if (packageLock.packages?.[""]?.version !== packageVersion) {
  errors.push(`package-lock root version ${packageLock.packages?.[""]?.version ?? "<missing>"} != package ${packageVersion}`);
}
if (!expectedNodeEngine) {
  errors.push(`.node-version: invalid semantic version ${nodeVersion || "<missing>"}`);
} else {
  if (packageManifest.engines?.node !== expectedNodeEngine) {
    errors.push(`package engines.node ${packageManifest.engines?.node ?? "<missing>"} != ${expectedNodeEngine}`);
  }
  if (packageLock.packages?.[""]?.engines?.node !== expectedNodeEngine) {
    errors.push(`package-lock engines.node ${packageLock.packages?.[""]?.engines?.node ?? "<missing>"} != ${expectedNodeEngine}`);
  }
}
if (!ciWorkflow.includes("node-version-file: .node-version")) {
  errors.push(".github/workflows/ci.yml: Node setup must use .node-version");
}
if (packageManifest.scripts?.["validate:rules"] !== "node scripts/validate-rule-registry.mjs") {
  errors.push("package.json: validate:rules must invoke the Rule Registry gate");
}
if (!packageManifest.scripts?.verify?.includes("npm run validate:rules")) {
  errors.push("package.json: verify must include the Rule Registry gate");
}
if (packageManifest.scripts?.["validate:plans"] !== "node scripts/validate-plan-bundle.mjs --bundle fixtures/plan-bundles/valid/bundle.json") {
  errors.push("package.json: validate:plans must invoke the canonical plan bundle gate");
}
if (!packageManifest.scripts?.verify?.includes("npm run validate:plans")) {
  errors.push("package.json: verify must include the plan bundle gate");
}
if (packageManifest.scripts?.["validate:srt"] !== "node scripts/srt-bridge.mjs diff --srt fixtures/srt/valid/captions.srt --sidecar fixtures/srt/valid/captions.sidecar.json") {
  errors.push("package.json: validate:srt must diff the canonical SRT fixture");
}
if (!packageManifest.scripts?.verify?.includes("npm run validate:srt")) {
  errors.push("package.json: verify must include the SRT bridge gate");
}
if (!packageManifest.scripts?.["validate:preview"]?.startsWith("node scripts/validate-preview-approval.mjs --preview fixtures/preview/valid/preview-bundle.json")) {
  errors.push("package.json: validate:preview must invoke the canonical preview fixture");
}
if (!packageManifest.scripts?.verify?.includes("npm run validate:preview")) {
  errors.push("package.json: verify must include the preview approval gate");
}
if (ruleRegistry.policyVersion !== policyVersion) {
  errors.push(`rules/registry.json: policyVersion ${ruleRegistry.policyVersion ?? "<missing>"} != hard policy ${policyVersion}`);
}
if (!architectureSvg.includes(`· v${packageVersion} ·`)) {
  errors.push(`docs/architecture.svg: footer version does not match ${packageVersion}`);
}
for (const profile of currentProfilePolicyVersions) {
  if (profile.version !== policyVersion) {
    errors.push(`${profile.relativePath}: policyVersion ${profile.version ?? "<missing>"} != hard policy ${policyVersion}`);
  }
}
const canonicalThemeKitVersion = themeKitVersions[0].version;
for (const asset of themeKitVersions.slice(1)) {
  if (asset.version !== canonicalThemeKitVersion) {
    errors.push(`${asset.relativePath}: version ${asset.version ?? "<missing>"} != theme kit package ${canonicalThemeKitVersion}`);
  }
}
for (const [name, document] of [["README.md", readme], ["README.en.md", readmeEnglish]]) {
  if (!document.includes(`skill-v${packageVersion}-blue`)) {
    errors.push(`${name}: version badge does not match ${packageVersion}`);
  }
  if (!document.includes(`**V${packageVersion}`)) {
    errors.push(`${name}: latest version history does not mention V${packageVersion}`);
  }
}
if (!readme.includes("七执行状态")) errors.push("README.md: missing seven-state capability wording");
if (!readmeEnglish.includes("seven-state")) errors.push("README.en.md: missing seven-state capability wording");
if (readmeEnglish.includes("five-state")) errors.push("README.en.md: stale five-state capability wording");
for (const [name, document] of [["README.md", readme], ["README.en.md", readmeEnglish]]) {
  if (!document.includes("docs/roadmap.md")) {
    errors.push(`${name}: missing public roadmap link`);
  }
}
for (const marker of [
  "V1.3.1",
  "Rule Registry",
  "Creator OS IR",
  "live capability canary",
  "不是发布时间或版本承诺",
  "Rule Registry foundation — SHIPPED",
  "Rational Time + Creator OS IR v0 — SHIPPED",
  "SRT bridge — SHIPPED",
  "Preview approval gate — SHIPPED",
]) {
  if (!roadmap.includes(marker)) {
    errors.push(`docs/roadmap.md: missing governance marker ${marker}`);
  }
}
for (const [name, document] of [
  ["README.md", readme],
  ["README.en.md", readmeEnglish],
  ["docs/migration-v1.3.1.md", migrationGuide],
  ["references/captions-terminology.md", captionReference],
]) {
  if (!document.includes("--root <profile-config-root>")
    && !document.includes("--root <profile 配置根目录>")) {
    errors.push(`${name}: caption validation example must declare its profile root`);
  }
}
for (const marker of [
  "validatedTimelineRevisions",
  "validatedSourceRevisions",
  "sourceAssetId",
  "sourceWordKey",
  "sourceText",
  "correction",
  "shortCardEvidence",
]) {
  if (!migrationGuide.includes(marker)) {
    errors.push(`docs/migration-v1.3.1.md: missing caption contract marker ${marker}`);
  }
  if (!captionReference.includes(marker)) {
    errors.push(`references/captions-terminology.md: missing caption contract marker ${marker}`);
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`FAIL ${error}`);
  console.error(`version drift audit failed: ${errors.length} error(s)`);
  process.exitCode = 1;
} else {
  console.log(`version drift audit passed: repository surfaces agree on v${packageVersion}`);
}
} catch (error) {
  const code = error instanceof SyntaxError
    ? "INVALID_JSON"
    : error?.code ?? "READ_FAILED";
  console.error(`version drift audit unavailable: ${code}`);
  process.exitCode = 2;
}
