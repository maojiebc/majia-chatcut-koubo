import crypto from "node:crypto";
import {spawnSync} from "node:child_process";

const ENDPOINT = "https://api.chatcut.io/api/external-mcp/mcp";
const REQUIRED_TOOLS = ["list_projects", "read_project", "preview_timeline", "inspect_item", "browse_assets", "read_script", "apply_script", "read_captions", "edit_captions"];
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}

export function validateProbeConfig(config) {
  const server = config?.mcpServers?.chatcut;
  return server?.baseUrl === ENDPOINT && server?.headers?.["x-chatcut-mcp-surface"] === "codex"
    && ["allowedTools", "blockedTools", "allowed_tools", "blocked_tools"].every((key) => server[key] === undefined);
}

export function summarizeLiveProbe(manifest, response) {
  const tools = manifest?.tools;
  const valid = manifest?.status === "ok" && manifest?.isError !== true && Array.isArray(tools) && tools.length > 0
    && tools.every((tool) => typeof tool?.name === "string" && tool.inputSchema && typeof tool.inputSchema === "object")
    && new Set(tools.map((tool) => tool.name)).size === tools.length;
  const projects = response?.structuredContent?.projects ?? response?.projects;
  const authenticatedRead = valid && tools.some((tool) => tool.name === "list_projects")
    && response?.isError !== true && Array.isArray(projects)
    && projects.every((project) => typeof project?.projectId === "string" && project.projectId.length > 0);
  const contract = valid ? tools.map(({name, description, inputSchema}) => ({name, description: description ?? "", inputSchema})).sort((a, b) => a.name.localeCompare(b.name)) : null;
  const missingRequiredTools = REQUIRED_TOOLS.filter((name) => !valid || !tools.some((tool) => tool.name === name));
  const toolContractReady = valid && missingRequiredTools.length === 0;
  return {
    ok: Boolean(authenticatedRead && toolContractReady),
    verificationScope: "authenticated-project-discovery",
    authenticatedRead: Boolean(authenticatedRead),
    toolContractReady: Boolean(toolContractReady),
    missingRequiredTools,
    toolCount: valid ? tools.length : 0,
    projectCount: authenticatedRead ? projects.length : null,
    toolSchemaFingerprint: contract ? `sha256:${crypto.createHash("sha256").update(JSON.stringify(canonical(contract))).digest("hex")}` : null,
    mediaVerified: false,
    timelineWriteVerified: false,
    humanListeningVerified: false,
    stableClaimEligible: false,
  };
}

export function probeChatCut(configPath) {
  function invoke(args) {
    const result = spawnSync("mcporter", ["--config", configPath, ...args], {encoding: "utf8", timeout: 45000, maxBuffer: 8 * 1024 * 1024});
    if (result.status !== 0 || result.error) throw new Error("CHATCUT_CONNECTION_UNAVAILABLE");
    try { return JSON.parse(result.stdout); } catch { throw new Error("CHATCUT_RESPONSE_INVALID"); }
  }
  const manifest = invoke(["list", "chatcut", "--json", "--no-oauth", "--timeout", "30000"]);
  if (manifest.status !== "ok" || !manifest.tools?.some((tool) => tool.name === "list_projects")) return summarizeLiveProbe(manifest, null);
  const response = invoke(["call", "chatcut.list_projects", "--args", "{}", "--output", "json", "--no-oauth", "--timeout", "30000"]);
  return summarizeLiveProbe(manifest, response);
}
