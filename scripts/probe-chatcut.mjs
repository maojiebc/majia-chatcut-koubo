#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {probeChatCut, validateProbeConfig} from "../src/live/probe.mjs";

try {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== "--config" || !args[1]) throw new Error("USAGE: npm run live:probe -- --config <private-mcporter.json>");
  const configPath = path.resolve(args[1]);
  let config;
  try { config = JSON.parse(fs.readFileSync(configPath, "utf8")); } catch { throw new Error("CHATCUT_CONFIG_UNAVAILABLE"); }
  if (!validateProbeConfig(config)) throw new Error("CHATCUT_OFFICIAL_HOSTED_CONFIG_REQUIRED");
  const report = {...probeChatCut(configPath), observedAt: new Date().toISOString()};
  process.stdout.write(`${JSON.stringify(report)}\n`);
  if (!report.ok) process.exitCode = 1;
} catch (error) {
  const allowed = /^(?:USAGE:|CHATCUT_[A-Z_]+$)/;
  process.stderr.write(`${allowed.test(error.message) ? error.message : "CHATCUT_PROBE_FAILED"}\n`);
  process.exitCode = 2;
}
