const CORE_SKILLS = Object.freeze([
  "chatcut-plugin-basics",
  "talking-head-guide",
  "verification",
]);

export function routeOfficialSkills({
  stage = "preflight",
  treatments = {},
  needsAssetImport = false,
  multicam = false,
  missingIntakeFields = 0,
  knownFailure = false,
  needsProductHelp = false,
  needsShader = false,
  needsVoice = false,
  exportAuthorized = false,
} = {}) {
  const required = new Set(CORE_SKILLS);
  if (["transcript_ready", "edit_plan_ready", "sample_ready", "full_aroll_applied", "captions_audio_ready", "verified", "review_ready"].includes(stage) || treatments.captions) {
    required.add("transcription");
  }
  if (needsAssetImport) required.add("asset-import");
  if (multicam) required.add("multicam-sync");
  if (knownFailure) required.add("known-errors");
  if (needsProductHelp) required.add("product-help");
  if (missingIntakeFields >= 2) required.add("widget-forms");
  if (treatments.music) required.add("music");
  if (treatments.motionGraphics) required.add("create-motion-graphics");
  if (needsShader) required.add("shader-gen");
  if (treatments.generatedMedia) required.add("video-gen");
  if (needsVoice) required.add("voice");
  if (exportAuthorized && treatments.export) required.add("export");
  return {
    required: [...required],
    liveContract: "current-mcp-schema",
    exportRouted: required.has("export"),
  };
}

export function stageMilestone(stage) {
  const messages = {
    project_ready: "已确认项目与处理策略",
    edit_plan_ready: "转写与口误候选已完成",
    sample_ready: "代表样片已做好，请播放确认",
    captions_audio_ready: "整片已按批准策略扩展",
    review_ready: "验证完成，时间线已可审阅",
  };
  return messages[stage] ?? null;
}
