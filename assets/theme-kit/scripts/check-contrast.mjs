import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(here, "../tokens/themes.json"), "utf8"));

function channels(color) {
  if (color.startsWith("#")) {
    const value = color.slice(1);
    return [...[0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16)), 1];
  }
  const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (!match) throw new Error(`unsupported color: ${color}`);
  return [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])];
}

function composite(foreground, background) {
  const [fr, fg, fb, alpha] = channels(foreground);
  const [br, bg, bb] = channels(background);
  const value = [fr, fg, fb].map((channel, index) => Math.round(channel * alpha + [br, bg, bb][index] * (1 - alpha)));
  return `#${value.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function withOpacity(color, alpha) {
  const [r, g, b] = channels(color);
  return `rgba(${r},${g},${b},${alpha})`;
}

function luminance(color) {
  return channels(color).slice(0, 3).map((channel) => channel / 255)
    .map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(a, b) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

let failed = false;
for (const theme of data.themes) {
  const semantic = theme.semantic;
  const mutedSurface = composite(semantic.surfaceMuted, semantic.canvas);
  const subtitleSurface = composite(withOpacity(semantic.surface, 0.82), semantic.canvas);
  const footerBackground = theme.id === "earth-brown" ? semantic.surface : semantic.canvas;
  const checks = [
    ["主标题", semantic.textPrimary, semantic.canvas, 4.5],
    ["引导正文", semantic.textSecondary, semantic.canvas, 7],
    ["大号强调", semantic.emphasis, semantic.canvas, 4.5],
    ["栏目标签", semantic.textPrimary, mutedSurface, 7],
    ["行动引导", semantic.ctaText, semantic.ctaBackground, 7],
    ["海报字幕", semantic.textPrimary, subtitleSurface, 7],
    ["页脚", semantic.textPrimary, footerBackground, 7],
    ["元信息", semantic.textSecondary, semantic.canvas, 7],
  ];
  console.log(`\n${theme.index} ${theme.name}`);
  for (const [label, foreground, background, minimum] of checks) {
    const ratio = contrast(foreground, background);
    const ok = ratio >= minimum;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label.padEnd(8)} ${ratio.toFixed(2)}:1 ≥ ${minimum}:1  ${foreground} / ${background}`);
    if (!ok) failed = true;
  }
}
if (failed) process.exitCode = 1;
