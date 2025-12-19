// js/rules.js
// 输出：每条路径的 status + blockers（路径×角色×否定原因）
// status: OK / COND / NO
// blocker.type: HARD(硬否定) / SOFT(条件不足/待补充) / INFO(不相关/未触发)

export function evaluate(answers) {
  const f = buildFlags(answers);

  const paths = [
    pathLine1ZeroTariff(f),
    pathIslandFlow(f),
    pathSecondLine(f),
    pathProcessingValueAdd(f),
  ];

  const summary = buildSummary(paths);

  return { flags: f, paths, summary };
}

function mkBlock(role, type, reason) {
  return { role, type, reason };
}

function finalize(pathKey, title, blockers) {
  // 优先级：HARD -> NO；否则只要有 blocker -> COND；否则 OK
  let status = "OK";
  if (blockers.some(b => b.type === "HARD")) status = "NO";
  else if (blockers.length > 0) status = "COND";
  return { pathKey, title, status, blockers };
}

/* =========================
   路径 1：一线零关税进口路径
   依赖：R2, R1, R4, R5
========================= */
function pathLine1ZeroTariff(f) {
  const blockers = [];

  if (!f.importFromAbroad) {
    blockers.push(mkBlock("R2", "INFO", "未涉及境外货物进入海南（未触发一线规则）"));
  }
  if (f.noEntity) {
    blockers.push(mkBlock("R1", "HARD", "未设立海南独立法人主体（主体前置条件不足）"));
  }
  if (f.disqualify) {
    blockers.push(mkBlock("R1", "HARD", "主体存在经营异常/失信等排除性情形（政策排除）"));
  }
  if (f.rejectCompliance) {
    blockers.push(mkBlock("R4", "HARD", "明确拒绝申报/备案/接受监管（用户主动放弃制度路径）"));
  }
  if (f.hsUnknown) {
    blockers.push(mkBlock("R5", "SOFT", "货物税则/分类不明确，无法判断是否落入征税目录范围"));
  }

  return finalize("line1_zero_tariff", "一线零关税进口路径", blockers);
}

/* =========================
   路径 2：岛内流通路径
   依赖：R2（主）
========================= */
function pathIslandFlow(f) {
  const blockers = [];

  // 如果进入内地，则岛内流通需要与二线叠加看，给 INFO/COND 都可，这里用 INFO 表示“路径不作为主结论”
  if (f.enterMainland) {
    blockers.push(mkBlock("R2", "INFO", "存在海南→内地流向（需优先评估二线规则）"));
  }

  // 若不涉及境外进口，岛内流通对本工具主题相对弱，给 INFO（但不否定）
  if (!f.importFromAbroad) {
    blockers.push(mkBlock("R2", "INFO", "未涉及境外进口（岛内流通仍可能存在，但与零关税/二线主题弱相关）"));
  }

  return finalize("island_flow", "岛内流通路径", blockers);
}

/* =========================
   路径 3：二线进入内地一般路径
   依赖：R2, R5
========================= */
function pathSecondLine(f) {
  const blockers = [];

  if (!f.enterMainland) {
    blockers.push(mkBlock("R2", "INFO", "未进入内地（未触发二线规则）"));
  }
  if (f.enterMainland && f.hsUnknown) {
    blockers.push(mkBlock("R5", "SOFT", "税则/商品分类不明确，无法细化二线口径与补税链路"));
  }
  if (f.enterMainland && f.rejectCompliance) {
    // 二线一般也需要合规申报，这里是 SOFT/HARD 取决于你策略
    blockers.push(mkBlock("R4", "SOFT", "你不接受申报/备案/监管，将影响二线合规办理方式（需再评估）"));
  }

  return finalize("second_line", "二线进入内地路径（一般规则）", blockers);
}

/* =========================
   路径 4：加工增值≥30%免关税（专项）
   依赖：R2, R3, R4, R5
========================= */
function pathProcessingValueAdd(f) {
  const blockers = [];

  if (!f.enterMainland) {
    blockers.push(mkBlock("R2", "INFO", "未进入内地（专项路径通常针对二线进入内地）"));
  }

  if (f.processingNone) {
    blockers.push(mkBlock("R3", "HARD", "无加工行为（不满足加工增值基本前提）"));
  }
  if (f.processingMinor) {
    blockers.push(mkBlock("R3", "HARD", "属于微小加工（贴标/包装/分拆等），通常被政策排除"));
  }

  if (f.encouragedNo) {
    blockers.push(mkBlock("R3", "HARD", "不属于鼓励类产业（不满足产业前置条件）"));
  }
  if (f.encouragedMaybeOrUnknown) {
    // 不是否定，只是条件不足
    blockers.push(mkBlock("R3", "SOFT", "鼓励类产业属性不明确（需进一步判定）"));
  }

  if (f.rejectCompliance) {
    blockers.push(mkBlock("R4", "HARD", "明确拒绝备案/核算/征管等要求（用户放弃高监管路径）"));
  }

  if (f.valueAddNo) {
    blockers.push(mkBlock("R5", "HARD", "加工增值明显不足 30%（达不到专项阈值）"));
  } else if (f.valueAddUnknown) {
    blockers.push(mkBlock("R5", "SOFT", "无法核算增值比例（需补充成本结构/价格数据）"));
  } else if (f.valueAddMaybe) {
    blockers.push(mkBlock("R5", "SOFT", "增值可能接近阈值（需核算确认是否≥30%）"));
  }

  return finalize("processing_value_add", "加工增值≥30%免关税路径（专项）", blockers);
}

/* =========================
   汇总
========================= */
function buildSummary(paths) {
  const byStatus = {
    OK: paths.filter(p => p.status === "OK"),
    COND: paths.filter(p => p.status === "COND"),
    NO: paths.filter(p => p.status === "NO"),
  };

  return {
    byStatus,
    disclaimer:
      "说明：本工具仅做“政策路径可行性”结构化判断辅助，不输出收益/赚钱结论；最终判断与责任由用户自行承担。",
  };
}

/* =========================
   Flags（把答案转为“事实输入”）
========================= */
function buildFlags(a) {
  const v = (id) => a?.[id];

  const importFromAbroad = v("q2") !== "no";
  const enterMainland = v("q7") === "yes_major" || v("q7") === "yes_minor";

  const noEntity = v("q3") === "none";
  const disqualify = Array.isArray(v("q5")) && !v("q5").includes("none") && v("q5").length > 0;

  const rejectCompliance = v("q10") === "reject";

  const hsUnknown = v("q8") === "unknown";

  const processingNone = v("q11") === "none";
  const processingMinor = v("q11") === "minor";

  const encouragedNo = v("q12") === "no";
  const encouragedMaybeOrUnknown = v("q12") === "maybe" || v("q12") === "unknown";

  const valueAddNo = v("q13") === "no";
  const valueAddUnknown = v("q13") === "unknown";
  const valueAddMaybe = v("q13") === "maybe";

  return {
    importFromAbroad,
    enterMainland,
    noEntity,
    disqualify,
    rejectCompliance,
    hsUnknown,
    processingNone,
    processingMinor,
    encouragedNo,
    encouragedMaybeOrUnknown,
    valueAddNo,
    valueAddUnknown,
    valueAddMaybe,
  };
}
