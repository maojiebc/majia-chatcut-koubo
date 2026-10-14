import assert from "node:assert/strict";
import test from "node:test";

test("真实工具与账号回读只输出脱敏连接证据，不升级稳剪声明", async () => {
  const {summarizeLiveProbe} = await import("../src/live/probe.mjs");
  const manifest = {status: "ok", tools: [{name: "list_projects", inputSchema: {type: "object"}}, {name: "read_project", inputSchema: {type: "object"}}]};
  const projects = {projects: [{projectId: "private-id", name: "private-name", editorUrl: "https://example.invalid/private"}]};
  const result = summarizeLiveProbe(manifest, projects);
  assert.equal(result.authenticatedRead, true);
  assert.equal(result.projectCount, 1);
  assert.equal(result.toolCount, 2);
  assert.equal(result.mediaVerified, false);
  assert.equal(result.stableClaimEligible, false);
  assert.match(result.toolSchemaFingerprint, /^sha256:[a-f0-9]{64}$/);
  assert.doesNotMatch(JSON.stringify(result), /private-id|private-name|example.invalid/);
});

test("工具错误和缺失账号结果不得误报登录成功", async () => {
  const {summarizeLiveProbe} = await import("../src/live/probe.mjs");
  for (const manifest of [{status: "auth", tools: []}, {status: "ok", tools: []}, {status: "ok", tools: [{name: "read_project", inputSchema: {}}]}]) {
    assert.equal(summarizeLiveProbe(manifest, {projects: []}).authenticatedRead, false);
  }
  const manifest = {status: "ok", tools: [{name: "list_projects", inputSchema: {type: "object"}}]};
  for (const response of [{isError: true, projects: []}, {}, {projects: null}, {projects: [{name: "missing-id"}]}]) {
    assert.equal(summarizeLiveProbe(manifest, response).authenticatedRead, false);
  }
  assert.equal(summarizeLiveProbe(manifest, {structuredContent: {projects: []}}).authenticatedRead, true);
});

test("工具排序不改变指纹，参数或说明变化使旧合同失效", async () => {
  const {summarizeLiveProbe} = await import("../src/live/probe.mjs");
  const one = {name: "list_projects", description: "Read projects", inputSchema: {type: "object", properties: {limit: {type: "integer"}}}};
  const two = {name: "preview_timeline", inputSchema: {type: "object"}};
  const run = (tools) => summarizeLiveProbe({status: "ok", tools}, {projects: []}).toolSchemaFingerprint;
  assert.equal(run([one, two]), run([two, one]));
  assert.notEqual(run([one, two]), run([{...one, description: "Changed contract"}, two]));
  assert.notEqual(run([one, two]), run([{...one, inputSchema: {type: "object"}}, two]));
});

test("探针只接受官方 Hosted 服务，不跟随任意地址或导出凭据", async () => {
  const {validateProbeConfig} = await import("../src/live/probe.mjs");
  assert.equal(validateProbeConfig({mcpServers: {chatcut: {baseUrl: "https://api.chatcut.io/api/external-mcp/mcp", headers: {"x-chatcut-mcp-surface": "codex"}}}}), true);
  for (const config of [{}, {mcpServers: {chatcut: {baseUrl: "https://example.invalid/mcp"}}}, {mcpServers: {chatcut: {baseUrl: "https://api.chatcut.io/api/external-mcp/mcp"}}}]) {
    assert.equal(validateProbeConfig(config), false);
  }
});

test("过滤后的工具清单可以证明账号读取，但不得报为完整工具合同", async () => {
  const {summarizeLiveProbe, validateProbeConfig} = await import("../src/live/probe.mjs");
  const result = summarizeLiveProbe({status: "ok", tools: [{name: "list_projects", inputSchema: {type: "object"}}]}, {projects: []});
  assert.equal(result.authenticatedRead, true);
  assert.equal(result.ok, false);
  assert.equal(result.toolContractReady, false);
  assert.ok(result.missingRequiredTools.includes("apply_script"));
  for (const key of ["allowedTools", "blockedTools", "allowed_tools", "blocked_tools"]) {
    const server = {baseUrl: "https://api.chatcut.io/api/external-mcp/mcp", headers: {"x-chatcut-mcp-surface": "codex"}, [key]: ["list_projects"]};
    assert.equal(validateProbeConfig({mcpServers: {chatcut: server}}), false);
  }
});
