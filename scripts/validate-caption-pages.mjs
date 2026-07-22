#!/usr/bin/env node
import fs from "node:fs";

const args = process.argv.slice(2);
const get = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const profilePath = get("--profile");
const inputPath = get("--input");
if (!profilePath || !inputPath) {
  console.error("Usage: node scripts/validate-caption-pages.mjs --profile <profile.json> --input <read_captions.txt>");
  process.exit(2);
}

const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
const input = fs.readFileSync(inputPath, "utf8");
const captions = profile.captions;
const hard = profile.hardInvariants;
const short = captions.shortCardPolicy;
const errors = [];
const warnings = [];

const config = input.match(/pagination density: maxLines=(\d+) maxCharactersPerLine=(\d+)/);
if (!config) errors.push("missing pagination density config");
else {
  const maxLines = Number(config[1]);
  const maxChars = Number(config[2]);
  if (maxLines !== hard.maxLines) errors.push(`config maxLines=${maxLines}; expected ${hard.maxLines}`);
  if (maxChars > captions.maxCharactersPerLine) errors.push(`config maxCharactersPerLine=${maxChars}; profile cap ${captions.maxCharactersPerLine}`);
}

const pageRe = /^\[P(\d+)\].*?frame=(\d+)-(\d+) text="([^"]*)" lines=(\d+) words=(\d+)/gm;
const pages = [];
let match;
while ((match = pageRe.exec(input))) {
  const page = {index:Number(match[1]), start:Number(match[2]), end:Number(match[3]), text:match[4], lines:Number(match[5]), words:Number(match[6])};
  const key = `${page.start}:${page.end}:${page.text}`;
  if (!pages.some((p) => p.key === key)) pages.push({...page, key});
}
if (!pages.length) errors.push("no viewer-facing pages parsed");

const charCount = (text) => Array.from(text.replace(/\s+/g, "")).length;
const approvedPatterns = (short.approved14To23FramePatterns || []).map((s) => new RegExp(s, "i"));
for (const page of pages) {
  const duration = page.end - page.start;
  const chars = charCount(page.text);
  const label = `P${page.index} ${page.start}-${page.end} \"${page.text}\"`;
  if (page.lines !== hard.maxLines || page.text.includes(" / ")) errors.push(`${label}: multiline (${page.lines})`);
  if (chars > captions.maxCharactersPerLine) errors.push(`${label}: ${chars} chars > ${captions.maxCharactersPerLine}`);
  if (chars === 1) errors.push(`${label}: single-character page`);
  if (duration < short.hardMinFrames) errors.push(`${label}: ${duration}f < hard minimum ${short.hardMinFrames}f`);
  else if (duration < short.minFrames) {
    const approved = approvedPatterns.some((re) => re.test(page.text)) && chars > 1;
    if (!approved) errors.push(`${label}: ${duration}f short page is not profile-approved`);
    else warnings.push(`${label}: approved short terminology card; still requires pixel/readability evidence`);
  }
}

const overridePolicy = captions.displayOverridePolicy || {};
const wordRe = /^\s+- key=\S+ text="([^"]*)" frame=(\d+)-(\d+)(.*)$/gm;
let wordCount = 0;
while ((match = wordRe.exec(input))) {
  wordCount += 1;
  const text = match[1];
  const duration = Number(match[3]) - Number(match[2]);
  const flags = match[4];
  const chars = charCount(text);
  const approvedTerm = approvedPatterns.some((re) => re.test(text));
  if (flags.includes("edited") && chars > overridePolicy.maxReplacementCharacters) {
    errors.push(`word override \"${text}\": ${chars} chars exceeds lexical replacement cap ${overridePolicy.maxReplacementCharacters}`);
  }
  if (flags.includes("edited") && duration < short.hardMinFrames && chars > 4 && !approvedTerm) {
    errors.push(`word override \"${text}\": sentence-like text on a ${duration}f word key`);
  }
}
if (overridePolicy.requireWordLevelAudit && wordCount === 0) {
  errors.push("word-level audit missing; rerun read_captions with words=true");
}

const viewerText = pages.map((page) => page.text).join("\n");
const caseSensitiveWrongForms = new Set(["bi", "etl"]);
for (const [correct, wrongs] of Object.entries(profile.terminology || {})) {
  for (const wrong of wrongs) {
    const found = caseSensitiveWrongForms.has(wrong)
      ? viewerText.includes(wrong)
      : viewerText.toLowerCase().includes(wrong.toLowerCase());
    if (found) errors.push(`terminology: found \"${wrong}\"; expected \"${correct}\"`);
  }
}

for (const line of warnings) console.warn(`WARN ${line}`);
if (errors.length) {
  for (const line of errors) console.error(`FAIL ${line}`);
  console.error(`caption audit failed: ${errors.length} error(s), ${warnings.length} warning(s), ${pages.length} page(s)`);
  process.exit(1);
}
console.log(`caption audit passed: ${pages.length} page(s), ${warnings.length} approved warning(s)`);
