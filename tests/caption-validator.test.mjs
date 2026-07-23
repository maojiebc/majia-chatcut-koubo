import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const validator = path.join(root, "scripts/validate-caption-pages.mjs");

function baseProfile(overrides = {}) {
  return {
    policyVersion: "1.0.0",
    status: "validated",
    provenance: {projectId: "project-1", validatedTimelineIds: ["timeline-1"]},
    timeline: {width: 1080, height: 1920, fps: 30},
    captions: {
      sourceVariant: "original",
      maxCharactersPerLine: 22,
      displayOverridePolicy: {maxReplacementCharacters: 4},
    },
    terminologyFile: "terminology.json",
    ...overrides,
  };
}

function baseTerminology() {
  return {
    version: "2.0.0",
    entries: [
      {correct: "500 家门店", wrong: ["50 家门店"], matchMode: "substring"},
      {correct: "数据分析师", wrong: ["数据分析"], matchMode: "substring"},
    ],
    shortCardWhitelist: {approved: ["AI", "BI"]},
  };
}

function page({text = "这是完整字幕", startFrame = 0, endFrame = 30, lines = 1, index = 1, words} = {}) {
  return {
    index,
    startFrame,
    endFrame,
    text,
    lines,
    words: words ?? [{key: `w-${index}`, text, startFrame, endFrame}],
  };
}

function captionDocument(pages, metadata = {}) {
  return {
    schemaVersion: "1.0.0",
    metadata: {
      sourceVariant: "original",
      timelineFps: 30,
      automaticWrapAllowed: false,
      pagination: {maxLines: 1, maxCharactersPerLine: 22},
      ...metadata,
    },
    pages,
  };
}

function run({profile = baseProfile(), parentProfile, terminology = baseTerminology(), localTerms, input}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "caption-validator-"));
  const profilePath = path.join(directory, "profile.json");
  const terminologyPath = path.join(directory, "terminology.json");
  const inputPath = path.join(directory, typeof input === "string" ? "captions.txt" : "captions.json");
  fs.writeFileSync(profilePath, JSON.stringify(profile));
  if (parentProfile) fs.writeFileSync(path.join(directory, "parent.json"), JSON.stringify(parentProfile));
  fs.writeFileSync(terminologyPath, JSON.stringify(terminology));
  fs.writeFileSync(inputPath, typeof input === "string" ? input : JSON.stringify(input));
  const args = [validator, "--profile", profilePath, "--input", inputPath];
  if (localTerms) {
    const localTermsPath = path.join(directory, "local-terms.json");
    fs.writeFileSync(localTermsPath, JSON.stringify(localTerms));
    args.push("--terms", localTermsPath);
  }
  const result = spawnSync(process.execPath, args, {encoding: "utf8"});
  fs.rmSync(directory, {recursive: true, force: true});
  return {...result, output: `${result.stdout}${result.stderr}`};
}

test("resolves profile inheritance before applying release gates", () => {
  const profile = {extends: "parent.json", status: "validated"};
  const result = run({profile, parentProfile: baseProfile(), input: captionDocument([page()])});
  assert.equal(result.status, 0, result.output);
});

test("accepts a valid structured caption document", () => {
  const result = run({input: captionDocument([page()])});
  assert.equal(result.status, 0, result.output);
});

test("loads terminologyFile and rejects known wrong forms", () => {
  const result = run({input: captionDocument([page({text: "共有 50 家门店"})])});
  assert.equal(result.status, 1);
  assert.match(result.output, /found "50 家门店"/);
});

test("does not report a wrong substring inside its correct term", () => {
  const result = run({input: captionDocument([page({text: "我是数据分析师"})])});
  assert.equal(result.status, 0, result.output);
});

test("single-line policy cannot be weakened by profile data", () => {
  const profile = baseProfile({hardInvariants: {maxLines: 2}});
  const result = run({profile, input: captionDocument([page({lines: 2})], {pagination: {maxLines: 2, maxCharactersPerLine: 22}})});
  assert.equal(result.status, 1);
  assert.match(result.output, /policy requires 1|multiline/);
});

test("short-card whitelist uses exact normalized terms", () => {
  const training = run({input: captionDocument([page({text: "TRAINING", endFrame: 15})])});
  const ai = run({input: captionDocument([page({text: "AI", endFrame: 15})])});
  assert.equal(training.status, 1);
  assert.match(training.output, /not terminology-approved/);
  assert.equal(ai.status, 0, ai.output);
});

test("rejects traditional Chinese characters", () => {
  const result = run({input: captionDocument([page({text: "資料分析"})])});
  assert.equal(result.status, 1);
  assert.match(result.output, /traditional Chinese/);
});

test("requires word-level evidence for every page", () => {
  const result = run({input: captionDocument([page({words: []})])});
  assert.equal(result.status, 1);
  assert.match(result.output, /word-level audit missing/);
});

test("uses milliseconds so 30fps and 60fps decisions are equivalent", () => {
  const at30 = run({input: captionDocument([page({text: "AI", endFrame: 15})])});
  const profile60 = baseProfile({timeline: {width: 1080, height: 1920, fps: 60}});
  const page60 = page({text: "AI", endFrame: 30, words: [{key: "w", text: "AI", startFrame: 0, endFrame: 30}]});
  const at60 = run({profile: profile60, input: captionDocument([page60], {timelineFps: 60})});
  assert.equal(at30.status, 0, at30.output);
  assert.equal(at60.status, 0, at60.output);
});

test("rejects a caption frame domain that disagrees with the profile", () => {
  const result = run({input: captionDocument([page()], {timelineFps: 60})});
  assert.equal(result.status, 1);
  assert.match(result.output, /caption timelineFps=60; profile timeline fps=30/);
});

test("viewer text must agree with word-level evidence", () => {
  const result = run({input: captionDocument([page({text: "真实字幕", words: [{key: "w", text: "另一句话", startFrame: 0, endFrame: 30}]})])});
  assert.equal(result.status, 1);
  assert.match(result.output, /does not match its word evidence/);
});

test("rejects untested profiles and missing validation provenance", () => {
  const profile = baseProfile({status: "untested-template", provenance: {projectId: "REPLACE", validatedTimelineIds: []}});
  const result = run({profile, input: captionDocument([page()])});
  assert.equal(result.status, 1);
  assert.match(result.output, /release requires validated/);
  assert.match(result.output, /no validatedTimelineIds/);
});

test("--terms overrides the profile terminology file (local personal layer)", () => {
  const localTerms = {
    version: "1.0.0",
    entries: [{correct: "正确品牌", wrong: ["错误品牌"], matchMode: "substring"}],
    shortCardWhitelist: {approved: ["AI"]},
  };
  const hit = run({localTerms, input: captionDocument([page({text: "这里写了错误品牌"})])});
  assert.equal(hit.status, 1);
  assert.match(hit.output, /found "错误品牌"/);
  const clean = run({localTerms, input: captionDocument([page({text: "这里写了正确品牌"})])});
  assert.equal(clean.status, 0, clean.output);
});

test("legacy parser handles escaped ASCII quotes without truncation", () => {
  const input = [
    "source variant: original",
    "timeline fps: 30",
    "automatic wrap allowed: false",
    "pagination density: maxLines=1 maxCharactersPerLine=22",
    String.raw`[P1] frame=0-30 text="他说这是 \"AI Native\"" lines=1 words=1`,
    String.raw`  - key=w1 text="他说这是 \"AI Native\"" frame=0-30`,
  ].join("\n");
  const result = run({input});
  assert.equal(result.status, 0, result.output);
});
