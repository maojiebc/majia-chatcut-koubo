import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "assets/theme-kit/components/portrait-talk-card.js"), "utf8");
const context = {window: {}};
vm.runInNewContext(source, context);
const kit = context.window.PortraitTalkThemeKit;

test("action and internal metadata are absent by default", () => {
  assert.equal(kit.DEFAULT_COPY.cta, "");
  assert.equal(kit.DEFAULT_COPY.meta, "");
  const markup = kit.cardMarkup();
  assert.match(markup, /class="talk-card__cta" hidden/);
  assert.match(markup, /class="talk-card__meta" hidden/);
});

test("string false is parsed as false", () => {
  assert.equal(kit.parseBoolean("false"), false);
  assert.equal(kit.parseBoolean("true"), true);
});

test("every runtime theme declares a stable playbook asset", () => {
  for (const theme of kit.THEMES) assert.equal(theme.playbookAsset, `playbooks/${theme.id}.md`);
});
