#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const themeKit = path.join(root, "assets/theme-kit");
const themes = JSON.parse(fs.readFileSync(path.join(themeKit, "tokens/themes.json"), "utf8"));
const layouts = JSON.parse(fs.readFileSync(path.join(themeKit, "tokens/layouts.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(themeKit, "manifest.json"), "utf8"));
const errors = [];

function unique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) errors.push(`duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

function exists(base, relative, label) {
  const file = path.resolve(base, relative);
  if (!fs.existsSync(file)) errors.push(`${label} does not exist: ${path.relative(root, file)}`);
}

unique(themes.themes.map((theme) => theme.id), "theme id");
unique(themes.themes.map((theme) => theme.index), "theme index");
unique(layouts.layouts.map((layout) => layout.id), "layout id");
const layoutIds = new Set(layouts.layouts.map((layout) => layout.id));
const manifestById = new Map(manifest.themes.map((theme) => [theme.id, theme]));

for (const theme of themes.themes) {
  if (!layoutIds.has(theme.layout)) errors.push(`${theme.id}: unknown layout ${theme.layout}`);
  exists(themeKit, theme.backgroundAsset, `${theme.id} backgroundAsset`);
  exists(themeKit, theme.playbookAsset, `${theme.id} playbookAsset`);
  const playbook = fs.readFileSync(path.join(themeKit, theme.playbookAsset), "utf8");
  if (!new RegExp(`^id:\\s*${theme.id}$`, "m").test(playbook)) errors.push(`${theme.id}: playbook frontmatter id mismatch`);
  const listed = manifestById.get(theme.id);
  if (!listed) errors.push(`${theme.id}: missing from manifest`);
  else for (const key of ["layout", "backgroundAsset", "playbookAsset"]) {
    if (listed[key] !== theme[key]) errors.push(`${theme.id}: manifest ${key} is stale`);
  }
}
if (manifestById.size !== themes.themes.length) errors.push("manifest theme count differs from token source");

const markdownFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith(".md")) markdownFiles.push(file);
  }
}
walk(root);
for (const file of markdownFiles) {
  const content = fs.readFileSync(file, "utf8");
  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = linkPattern.exec(content))) {
    const target = match[1].split("#")[0].trim();
    if (!target || /^(?:https?:|mailto:|#)/.test(target) || target.includes("<id>")) continue;
    exists(path.dirname(file), target, `${path.relative(root, file)} link`);
  }
}

if (errors.length) {
  for (const error of errors) console.error(`FAIL ${error}`);
  process.exitCode = 1;
} else {
  console.log(`references passed: ${themes.themes.length} themes, ${layouts.layouts.length} layouts, ${markdownFiles.length} Markdown files`);
}
