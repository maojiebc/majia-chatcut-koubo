import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(here, "../tokens/layouts.json"), "utf8"));
const {width, height, safeArea} = data.canvas;
const bounds = {x: safeArea.left, y: safeArea.top, w: width - safeArea.left - safeArea.right, h: height - safeArea.top - safeArea.bottom};
const errors = [];

function inside(zone, container) {
  return zone.x >= container.x && zone.y >= container.y && zone.x + zone.w <= container.x + container.w && zone.y + zone.h <= container.y + container.h;
}

function overlap(a, b) {
  const width = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const height = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return width * height;
}

const ids = new Set();
for (const layout of data.layouts) {
  if (ids.has(layout.id)) errors.push(`${layout.id}: duplicate layout id`);
  ids.add(layout.id);
  for (const [name, zone] of Object.entries(layout.zones)) {
    if (!["x", "y", "w", "h"].every((key) => Number.isFinite(zone[key]))) errors.push(`${layout.id}.${name}: invalid rectangle`);
    if (!inside(zone, bounds)) errors.push(`${layout.id}.${name}: outside content safe area`);
  }
  const collision = overlap(layout.zones.speaker, layout.zones.subtitle);
  if (collision > 0) errors.push(`${layout.id}: speaker/subtitle overlap ${collision}px² is not declared`);
}

if (errors.length) {
  for (const error of errors) console.error(`FAIL ${error}`);
  process.exitCode = 1;
} else {
  console.log(`geometry passed: ${data.layouts.length} layouts inside safe area with no speaker/subtitle collisions`);
}
