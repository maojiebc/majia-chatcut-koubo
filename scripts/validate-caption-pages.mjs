#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const get = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const profilePath = get("--profile");
const inputPath = get("--input");
if (!profilePath || !inputPath) {
  console.error("Usage: node scripts/validate-caption-pages.mjs --profile <profile.json> --input <captions.json|read_captions.txt>");
  process.exit(2);
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const profileAbsolute = path.resolve(profilePath);
const profile = readJson(profileAbsolute);
const policy = readJson(path.join(root, "rules/policy.json"));
const input = fs.readFileSync(path.resolve(inputPath), "utf8");
const errors = [];
const warnings = [];

function decodeQuoted(value) {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value;
  }
}

function parseLegacy(text) {
  const pagination = text.match(/pagination density:\s*maxLines=(\d+)\s+maxCharactersPerLine=(\d+)/i);
  const sourceVariant = text.match(/source variant:\s*([^\s]+)/i);
  const timelineFps = text.match(/timeline fps:\s*([\d.]+)/i);
  const automaticWrap = text.match(/automatic wrap allowed:\s*(true|false)/i);
  const pages = [];
  const pageRe = /^\[P(\d+)\].*?frame=(\d+)-(\d+)\s+text="((?:\\.|[^"\\])*)"\s+lines=(\d+)\s+words=(\d+)/gm;
  let match;
  while ((match = pageRe.exec(text))) {
    pages.push({
      index: Number(match[1]),
      startFrame: Number(match[2]),
      endFrame: Number(match[3]),
      text: decodeQuoted(match[4]),
      lines: Number(match[5]),
      declaredWordCount: Number(match[6]),
      words: [],
    });
  }

  const wordRe = /^\s+-\s+key=(\S+)\s+text="((?:\\.|[^"\\])*)"\s+frame=(\d+)-(\d+)(.*)$/gm;
  while ((match = wordRe.exec(text))) {
    const startFrame = Number(match[3]);
    const page = pages.find((candidate) => startFrame >= candidate.startFrame && startFrame < candidate.endFrame);
    if (!page) continue;
    page.words.push({
      key: match[1],
      text: decodeQuoted(match[2]),
      startFrame,
      endFrame: Number(match[4]),
      edited: /\bedited\b/.test(match[5]),
    });
  }

  return {
    schemaVersion: "legacy-read-captions",
    metadata: {
      sourceVariant: sourceVariant?.[1],
      timelineFps: timelineFps ? Number(timelineFps[1]) : undefined,
      automaticWrapAllowed: automaticWrap ? automaticWrap[1].toLowerCase() === "true" : undefined,
      pagination: pagination ? {
        maxLines: Number(pagination[1]),
        maxCharactersPerLine: Number(pagination[2]),
      } : undefined,
    },
    pages,
  };
}

function parseInput(text) {
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== "object" || !Array.isArray(value.pages)) {
      throw new Error("captions JSON must contain a pages array");
    }
    return value;
  } catch (error) {
    if (/^\s*[\[{]/.test(text)) throw error;
    warnings.push("legacy text input is deprecated; prefer structured captions JSON");
    return parseLegacy(text);
  }
}

let document;
try {
  document = parseInput(input);
} catch (error) {
  console.error(`FAIL invalid caption input: ${error.message}`);
  process.exit(1);
}

const captionPolicy = policy.caption;
const captions = profile.captions || {};
const metadata = document.metadata || {};
const pagination = metadata.pagination || {};
const timelineFps = Number(metadata.timelineFps ?? profile.timeline?.fps);

if (profile.policyVersion !== policy.version) errors.push(`profile policyVersion=${profile.policyVersion ?? "missing"}; expected ${policy.version}`);
if (profile.status !== "validated") errors.push(`profile status=${profile.status ?? "missing"}; release requires validated`);
if (!Array.isArray(profile.provenance?.validatedTimelineIds) || profile.provenance.validatedTimelineIds.length === 0) {
  errors.push("profile has no validatedTimelineIds");
}
if (!profile.provenance?.projectId || /REPLACE|your-/i.test(profile.provenance.projectId)) errors.push("profile projectId is missing or still a placeholder");
if (!Number.isFinite(timelineFps) || timelineFps <= 0) errors.push("timeline fps is missing or invalid");
if (Number.isFinite(Number(metadata.timelineFps)) && Number.isFinite(Number(profile.timeline?.fps)) && Number(metadata.timelineFps) !== Number(profile.timeline.fps)) {
  errors.push(`caption timelineFps=${metadata.timelineFps}; profile timeline fps=${profile.timeline.fps}`);
}
if (metadata.sourceVariant !== captions.sourceVariant || !captionPolicy.allowedSourceVariants.includes(metadata.sourceVariant)) {
  errors.push(`source variant=${metadata.sourceVariant ?? "missing"}; expected ${captions.sourceVariant ?? captionPolicy.allowedSourceVariants[0]}`);
}
if (metadata.automaticWrapAllowed !== captionPolicy.automaticWrapAllowed) {
  errors.push(`automaticWrapAllowed=${metadata.automaticWrapAllowed ?? "missing"}; policy requires ${captionPolicy.automaticWrapAllowed}`);
}
if (pagination.maxLines !== captionPolicy.maxLines) errors.push(`config maxLines=${pagination.maxLines ?? "missing"}; policy requires ${captionPolicy.maxLines}`);
if (pagination.maxCharactersPerLine !== captions.maxCharactersPerLine) {
  errors.push(`config maxCharactersPerLine=${pagination.maxCharactersPerLine ?? "missing"}; profile requires ${captions.maxCharactersPerLine ?? "missing"}`);
}

function loadTerminology() {
  if (profile.terminology && typeof profile.terminology === "object") return { terminology: profile.terminology };
  if (!profile.terminologyFile) {
    errors.push("terminologyFile is required");
    return {};
  }
  const file = path.resolve(path.dirname(profileAbsolute), profile.terminologyFile);
  try {
    return readJson(file);
  } catch (error) {
    errors.push(`cannot load terminologyFile ${file}: ${error.message}`);
    return {};
  }
}

const terminologyData = loadTerminology();
const normalize = (value) => String(value ?? "").normalize("NFKC").trim();
const charCount = (value) => Array.from(normalize(value).replace(/\s+/g, "")).length;
const lexicalText = (value) => normalize(value).replace(/[^\p{L}\p{N}]/gu, "").toLocaleLowerCase("zh-CN");
const approvedTerms = new Set([
  ...(captions.shortCardPolicy?.approvedTerms || []),
  ...(terminologyData.shortCardWhitelist?.approved || []),
].map((value) => normalize(value).toLocaleLowerCase("zh-CN")));

const pages = document.pages || [];
if (pages.length === 0) errors.push("no viewer-facing pages parsed");
const indexes = new Set();
let previous;
let wordCount = 0;

for (const page of pages) {
  const index = Number(page.index);
  const start = Number(page.startFrame);
  const end = Number(page.endFrame);
  const text = normalize(page.text);
  const lines = Number(page.lines);
  const words = Array.isArray(page.words) ? page.words : [];
  const label = `P${index} ${start}-${end} "${text}"`;

  if (!Number.isInteger(index) || index < 1) errors.push(`${label}: invalid page index`);
  if (indexes.has(index)) errors.push(`${label}: duplicate page index`);
  indexes.add(index);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) errors.push(`${label}: invalid frame interval`);
  if (previous && start < previous.startFrame) errors.push(`${label}: pages are not sorted by start frame`);
  if (previous && start < previous.endFrame) errors.push(`${label}: overlaps P${previous.index}`);
  previous = page;
  if (!text) errors.push(`${label}: empty page`);
  if (lines !== captionPolicy.maxLines || text.includes(" / ")) errors.push(`${label}: multiline (${lines})`);
  const chars = charCount(text);
  if (chars > captions.maxCharactersPerLine) errors.push(`${label}: ${chars} chars > ${captions.maxCharactersPerLine}`);
  if (chars === 1) errors.push(`${label}: single-character page`);

  if (Number.isFinite(timelineFps) && end > start) {
    const durationMs = ((end - start) / timelineFps) * 1000;
    if (durationMs < captionPolicy.hardMinDurationMs) {
      errors.push(`${label}: ${durationMs.toFixed(1)}ms < hard minimum ${captionPolicy.hardMinDurationMs}ms`);
    } else if (durationMs < captionPolicy.normalMinDurationMs) {
      const approved = approvedTerms.has(text.toLocaleLowerCase("zh-CN")) && chars > 1;
      if (!approved) errors.push(`${label}: ${durationMs.toFixed(1)}ms short page is not terminology-approved`);
      else warnings.push(`${label}: approved short terminology card; pixel/readability evidence is still required`);
    }
  }

  if (page.declaredWordCount !== undefined && Number(page.declaredWordCount) !== words.length) {
    errors.push(`${label}: declares ${page.declaredWordCount} words but parsed ${words.length}`);
  }
  if (captionPolicy.requireWordLevelAudit && words.length === 0) errors.push(`${label}: word-level audit missing`);
  if (words.length > 0 && lexicalText(words.map((word) => word.text).join("")) !== lexicalText(text)) {
    errors.push(`${label}: viewer text does not match its word evidence`);
  }
  wordCount += words.length;

  for (const word of words) {
    const wordText = normalize(word.text);
    const wordStart = Number(word.startFrame);
    const wordEnd = Number(word.endFrame);
    if (!word.key) errors.push(`${label}: word key missing`);
    if (!wordText) errors.push(`${label}: empty word text`);
    if (!Number.isFinite(wordStart) || !Number.isFinite(wordEnd) || wordEnd <= wordStart || wordStart < start || wordEnd > end) {
      errors.push(`${label}: word ${word.key ?? "<missing>"} interval is outside its page`);
    }
    const replacementLimit = captions.displayOverridePolicy?.maxReplacementCharacters ?? 4;
    if (word.edited && charCount(wordText) > replacementLimit) {
      errors.push(`${label}: word override "${wordText}" exceeds ${replacementLimit} characters`);
    }
  }
}

if (captionPolicy.requireWordLevelAudit && wordCount === 0 && pages.length > 0) errors.push("word-level audit missing; request words=true");

const viewerText = pages.map((page) => normalize(page.text)).join("\n");
const traditionalCharacters = new RegExp(`[${policy.caption.traditionalCharacters}]`, "gu");
const traditionalHits = viewerText.match(traditionalCharacters) || [];
if (traditionalHits.length > captionPolicy.maxTraditionalChineseHits) {
  errors.push(`traditional Chinese: found ${traditionalHits.length} hit(s): ${[...new Set(traditionalHits)].join(" ")}`);
}

function terminologyEntries(data) {
  if (Array.isArray(data.entries)) return data.entries;
  return Object.entries(data.terminology || {}).map(([correct, wrong]) => ({ correct, wrong, matchMode: "substring" }));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

for (const entry of terminologyEntries(terminologyData)) {
  const correct = normalize(entry.correct);
  const wrongs = Array.isArray(entry.wrong) ? entry.wrong : entry.wrongs || [];
  const caseSensitive = entry.caseSensitive === true;
  const flags = caseSensitive ? "gu" : "giu";
  let searchable = viewerText;
  if (correct) searchable = searchable.replace(new RegExp(escapeRegExp(correct), flags), " ".repeat(correct.length));
  for (const rawWrong of wrongs) {
    const wrong = normalize(rawWrong);
    if (!wrong || wrong === correct) continue;
    const pattern = entry.matchMode === "exact" ? `(?:^|\\n)\\s*${escapeRegExp(wrong)}\\s*(?:$|\\n)` : escapeRegExp(wrong);
    if (new RegExp(pattern, flags).test(searchable)) errors.push(`terminology: found "${wrong}"; expected "${correct}"`);
  }
}

for (const line of warnings) console.warn(`WARN ${line}`);
if (errors.length) {
  for (const line of [...new Set(errors)]) console.error(`FAIL ${line}`);
  console.error(`caption audit failed: ${new Set(errors).size} error(s), ${warnings.length} warning(s), ${pages.length} page(s)`);
  process.exit(1);
}
console.log(`caption audit passed: ${pages.length} page(s), ${wordCount} word(s), ${warnings.length} approved warning(s)`);
