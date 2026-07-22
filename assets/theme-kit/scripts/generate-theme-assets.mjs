#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const themeKit = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const themesPath = path.join(themeKit, "tokens/themes.json");
const layoutsPath = path.join(themeKit, "tokens/layouts.json");
const themes = JSON.parse(fs.readFileSync(themesPath, "utf8"));
const layouts = JSON.parse(fs.readFileSync(layoutsPath, "utf8"));
const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(themesPath)).digest("hex");
const check = process.argv.includes("--check");
const changed = [];

function output(relative, content) {
  const file = path.join(themeKit, relative);
  if (fs.existsSync(file) && fs.readFileSync(file, "utf8") === content) return;
  changed.push(relative);
  if (!check) fs.writeFileSync(file, content);
}

const cssNames = {
  canvas: "canvas",
  surface: "surface",
  surfaceMuted: "surface-muted",
  textPrimary: "text-primary",
  textSecondary: "text-secondary",
  emphasis: "emphasis",
  accent: "accent",
  accentStrong: "accent-strong",
  border: "border",
  ctaBackground: "cta-bg",
  ctaText: "cta-text",
  speakerSurface: "speaker-surface",
  speakerFigure: "speaker-figure",
  shadow: "shadow",
  glow: "glow",
};

const css = [
  `/* Generated from tokens/themes.json. Source SHA256: ${sourceHash}. Do not edit. */`,
  ":root {",
  `  --pt-width: ${themes.canvas.width}px;`,
  `  --pt-height: ${themes.canvas.height}px;`,
  `  --pt-font: ${themes.typography.fontFamily};`,
  `  --pt-radius-sm: ${themes.shape.radiusSmall}px;`,
  `  --pt-radius-md: ${themes.shape.radiusMedium}px;`,
  `  --pt-radius-lg: ${themes.shape.radiusLarge}px;`,
  "}",
  "",
  ...themes.themes.flatMap((theme) => [
    `[data-theme="${theme.id}"] {`,
    ...Object.entries(cssNames).map(([key, name]) => `  --pt-${name}: ${theme.semantic[key]};`),
    `  --pt-background-image: url("../${theme.backgroundAsset}");`,
    `  color-scheme: ${theme.mode};`,
    "}",
    "",
  ]),
].join("\n");
output("tokens/themes.css", css);

const themeIds = themes.themes.map((theme) => JSON.stringify(theme.id)).join(" | ");
const layoutIds = layouts.layouts.map((layout) => JSON.stringify(layout.id)).join(" | ");
const ts = `// Generated from tokens/themes.json. Source SHA256: ${sourceHash}. Do not edit.\n` +
  `export type PortraitThemeId = ${themeIds};\n` +
  `export type PortraitLayoutId = ${layoutIds};\n\n` +
  `export interface PortraitTheme {\n` +
  `  id: PortraitThemeId;\n  index: string;\n  name: string;\n  description: string;\n` +
  `  recommendedFor: readonly string[];\n  layout: PortraitLayoutId;\n  mode: "light" | "dark";\n` +
  `  sourcePalette: readonly { role: string; name: string; value: string }[];\n` +
  `  semantic: Readonly<Record<string, string>>;\n  gradient: string;\n  backgroundAsset: string;\n` +
  `  playbookAsset: string;\n  backgroundPng: string;\n}\n\n` +
  `export const portraitThemeKit = ${JSON.stringify(themes, null, 2)} as const;\n` +
  `export const portraitThemes = portraitThemeKit.themes;\n` +
  `export const portraitThemeById = Object.fromEntries(\n` +
  `  portraitThemes.map((theme) => [theme.id, theme]),\n` +
  `) as Record<PortraitThemeId, PortraitTheme>;\n`;
output("tokens/themes.ts", ts);

const runtimePath = path.join(themeKit, "components/portrait-talk-card.js");
let runtime = fs.readFileSync(runtimePath, "utf8");
const runtimeThemes = themes.themes.map(({id, name, description, layout, mode, sourcePalette, recommendedFor, playbookAsset}) => ({
  id, name, description, layout, mode, palette: sourcePalette.map((color) => color.value), recommendedFor, playbookAsset,
}));
runtime = runtime.replace(/  const THEMES = \[[\s\S]*?\];\n  const LAYOUTS = \[[\s\S]*?\];/, `  const THEMES = ${JSON.stringify(runtimeThemes)};\n  const LAYOUTS = ${JSON.stringify(layouts.layouts.map(({id, name}) => ({id, name})))};`);
output("components/portrait-talk-card.js", runtime);

const manifestPath = path.join(themeKit, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.version = themes.version;
manifest.themes = themes.themes.map(({id, name, layout, backgroundAsset, playbookAsset}) => ({id, name, layout, backgroundAsset, playbookAsset}));
output("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);

for (const theme of themes.themes) {
  const playbookPath = path.join(themeKit, theme.playbookAsset);
  let playbook = fs.readFileSync(playbookPath, "utf8");
  const palette = Object.fromEntries(Object.entries(theme.semantic).filter(([key]) => ["canvas", "surface", "surfaceMuted", "textPrimary", "textSecondary", "emphasis", "accent", "accentStrong", "border", "ctaBackground", "ctaText"].includes(key)));
  playbook = playbook.replace(/^playbookVersion: .*$/m, `playbookVersion: ${themes.version}`);
  playbook = playbook.replace(/^palette: .*$/m, `palette: ${JSON.stringify(palette)}`);
  output(theme.playbookAsset, playbook);
}

if (changed.length) {
  console.error(`${check ? "stale" : "generated"} theme assets: ${changed.join(", ")}`);
  if (check) process.exitCode = 1;
} else {
  console.log("theme assets are synchronized");
}
