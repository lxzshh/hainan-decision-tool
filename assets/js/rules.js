// js/rules.js
// 输出“政策路径可行性状态”，不输出收益/赚钱结论，不考政策阅读测验。

/**
 * @typedef {"ok"|"no"|"cond"|"info"} Status
 * ok   = 可进入判断/路径成立（不代表免税或收益）
 * no   = 明确不成立（政策前置条件不满足 or 用户事实排除）
 * cond = 条件成立（需满足关键前置条件/补充信息）
 * info = 信息不足/不相关（路径不进入判断范围或判断精度受限）
 */

export function evaluate(answers) {
  const flags = deriveFlags(answers);

  const paths = [
    evalLine1ZeroTariff(flags),
    evalIslandCirculation(flags),
    evalSecondLineGeneral(flags),
    evalProcessingValueAdd(flags),
  ];

  const summary = buildSummary(paths, flags);

  return { flags, paths, summary };
}

function deriveFlags(a) {
  const get = (id) => a?.[id];
  const eq = (id, v) => get(id) === v;
  const hasAny = (id, arr) => Array.isArray(get(id)) && arr.some(x => get(id).includes(x));

  const hasLegalEntity = eq("q3", "have");
  const planLegalEntity = eq("q3", "plan");
  const noLegalEntity = eq("q3", "none");

  const disqualify =
    hasAny("q5", ["abnormal", "customs_dishonest", "serious_dishonest"]) &&
    !hasAny("q5", ["none"]);

  const importFromAbroad = !eq("q2", "no");
  const enterMainland = eq("q7", "yes_major") || eq("q7", "yes_minor");

  const hsInfo = get("q8"); // hs_known / category_known / unknown
  const acceptCompliance = get("q10"); // accept / evaluate / reject
  const wantsZeroTariff = get("q9"); // yes / heard / no

  const processingType = get("q11"); // substantial / minor / none
  const isEncouraged = get("q12"); // yes / maybe / no / unknown
  const valueAdd = get("q13"); // likely / maybe / no / unknown

  return {
    hasLegalEntity, planLegalEntity, noLegalEntity, disqualify,
    importFromAbroad, enterMainland,
    hsInfo, acceptCompliance, wantsZeroTariff,
    processingType, isEncouraged, valueAdd,
  };
}

function mkPath(key, status, title, reasons) {
  return { key, status, title, reasons };
}

/** 路径1：一线“零关税进口”路径 */
function evalLine1ZeroTariff(f) {
  if (!f.importFromAbroad) {
    return mkPath("line1_zero_tariff", "info", "不涉及境外货物进入海南，路径不相关", [
      "你选择不涉及境外货物进入海南，因此“一线零关税进口”路径不进入判断范围。",
    ]);
  }

  if (f.noLegalEntity) {
    return mkPath("line1_zero_tariff", "no", "主体条件不满足", [
      "当前不存在海南独立法人主体，通常无法进入“享惠主体”相关路径。",
      "如后续注册独立法人，可重新评估。",
    ]);
  }

  if (f.disqualify) {
    return mkPath("line1_zero_tariff", "no", "存在排除性情形", [
      "你勾选了经营异常/海关失信/严重违法失信等情形，可能触发享惠主体认定的排除条件。",
      "建议先恢复合规状态后再评估。",
    ]);
  }

  if (f.acceptCompliance === "reject") {
    return mkPath("line1_zero_tariff", "no", "用户事实排除：不接受申报/备案/监管", [
      "该路径通常伴随申报、备案、动态管理等制度要求；你明确无法接受，因此该路径对你不成立。",
    ]);
  }

  if (f.hsInfo === "unknown") {
    return mkPath("line1_zero_tariff", "cond", "需要补充货物信息以判断目录/税则", [
      "该路径还需判断：货物是否落入“进口征税商品目录”等范围。",
      "你目前无法提供税则/类别信息，因此只能给出“条件成立（需补充信息）”。",
    ]);
  }

  const notes = [
    "你涉及境外货物进入海南，且主体条件未见明确排除。",
    "后续仍需：享惠主体认定（如需）、货物是否在征税目录、以及货物流向（二线/岛内）等进一步判断。",
  ];

  if (f.wantsZeroTariff === "no") {
    notes.push("你表示未考虑“零关税”资格：系统不会替你建议，但该路径并非必须。");
  } else if (f.wantsZeroTariff === "heard") {
    notes.push("你表示听说过但不了解：后续可把“是否进入享惠主体流程”作为一个决策点。");
  }

  return mkPath("line1_zero_tariff", "ok", "可进入“一线零关税进口”路径判断", notes);
}

/** 路径2：岛内流通路径 */
function evalIslandCirculation(f) {
  if (!f.importFromAbroad) {
    return mkPath("island_circulation", "info", "未涉及境外进口，岛内流通与本工具主题弱相关", [
      "你不涉及境外货物进口；本工具围绕“一线/二线/零关税/加工增值”设计。",
    ]);
  }
  if (f.enterMainland) {
    return mkPath("island_circulation", "cond", "存在海南→内地流向，需同时评估二线规则", [
      "你计划让货物或制成品进入内地，会触发“二线”判断；岛内流通的结论需与二线规则一起看。",
    ]);
  }
  return mkPath("island_circulation", "ok", "主要岛内流通/使用（不进入内地）", [
    "你选择货物/制成品不进入内地，核心判断会围绕“岛内流通”规则展开。",
    "若未来改变流向（进入内地），需重新评估二线规则。",
  ]);
}

/** 路径3：二线一般规则（海南→内地） */
function evalSecondLineGeneral(f) {
  if (!f.enterMainland) {
    return mkPath("second_line_general", "info", "未进入内地，二线路径不相关", [
      "你选择不将货物/制成品从海南进入内地，因此“二线”路径不进入判断范围。",
    ]);
  }
  if (f.hsInfo === "unknown") {
    return mkPath("second_line_general", "cond", "需要补充货物信息以判断二线口径", [
      "你计划进入内地，但尚不清楚税则/类别信息，系统无法进一步细化二线口径判断。",
      "补充 HS 编码或明确商品类别后可提高判断精度。",
    ]);
  }
  return mkPath("second_line_general", "ok", "进入内地（二线）的一般规则路径成立", [
    "你计划从海南进入内地，因此需要按“二线”相关规则评估可能的补税与口径。",
    "如同时满足专项条件，可能另有“加工增值”路径（见下）。",
  ]);
}

/** 路径4：加工增值≥30%免关税（专项） */
function evalProcessingValueAdd(f) {
  if (!f.enterMainland) {
    return mkPath("processing_value_add", "info", "不进入内地，专项路径不相关", [
      "加工增值免关税通常针对“从海南进入内地”的情形；你未选择进入内地，因此该路径不进入判断范围。",
    ]);
  }

  if (f.processingType === "none") {
    return mkPath("processing_value_add", "no", "无加工行为，专项路径不成立", [
      "你选择不涉及加工生产，无法满足“加工增值”基本前提。",
    ]);
  }
  if (f.processingType === "minor") {
    return mkPath("processing_value_add", "no", "加工类型为微小加工，专项路径不成立", [
      "你选择仅贴标/包装/分拆/简单处理等类型，通常属于“微小加工”排除情形，无法适用专项路径。",
    ]);
  }

  if (f.isEncouraged === "no") {
    return mkPath("processing_value_add", "no", "不属于鼓励类产业，专项路径不成立", [
      "专项路径通常要求“鼓励类产业企业”等前提；你明确不属于鼓励类产业，因此该路径不成立。",
    ]);
  }

  if (f.acceptCompliance === "reject") {
    return mkPath("processing_value_add", "no", "用户事实排除：不接受申报/备案/监管", [
      "该专项路径通常伴随更强征管要求（核算、申报、监管）；你明确无法接受，因此该路径不成立。",
    ]);
  }

  if (f.valueAdd === "no") {
    return mkPath("processing_value_add", "no", "增值明显无法达到阈值，专项路径不成立", [
      "你明确表示加工增值明显达不到阈值，因此专项路径不成立。",
    ]);
  }

  if (f.isEncouraged === "unknown" || f.isEncouraged === "maybe") {
    return mkPath("processing_value_add", "cond", "可能成立：需先明确是否鼓励类产业，并满足核算/征管要求", [
      "你对“是否属于鼓励类产业”不确定/可能属于：该项是专项路径关键前置条件。",
      "你还需要具备或建立成本核算/申报基础，以支持增值口径判断。",
    ]);
  }

  if (f.valueAdd === "unknown") {
    return mkPath("processing_value_add", "cond", "可能成立：需补充增值核算信息", [
      "你不确定能否达到增值阈值：系统需要补充成本结构与核算信息后才能进一步判断。",
    ]);
  }

  if (f.valueAdd === "maybe") {
    return mkPath("processing_value_add", "cond", "可能成立：增值接近阈值，需核算确认", [
      "你表示可能接近阈值：需要用真实成本与价格数据进行核算确认。",
      "同时需满足备案、征管等制度要求。",
    ]);
  }

  return mkPath("processing_value_add", "ok", "可进入“加工增值”专项路径判断", [
    "你具备实质加工、可能属于鼓励类产业且增值可能达到阈值：专项路径可进入进一步判断。",
    "后续仍需：明确鼓励类产业属性、完成备案与满足征管/核算要求。",
  ]);
}

function buildSummary(paths, flags) {
  const byStatus = {
    ok: paths.filter(p => p.status === "ok"),
    cond: paths.filter(p => p.status === "cond"),
    no: paths.filter(p => p.status === "no"),
    info: paths.filter(p => p.status === "info"),
  };

  const notes = [];
  if (flags.hsInfo === "unknown") {
    notes.push("你未提供税则/类别信息：涉及“征税目录/商品范围”的判断会显示为“条件成立/需补充信息”。");
  }
  if (flags.noLegalEntity) {
    notes.push("你当前无海南独立法人：涉及“享惠主体”的路径会被判为不成立（这是资格前置条件）。");
  } else if (flags.planLegalEntity) {
    notes.push("你计划注册海南独立法人：部分路径可能“条件成立”，后续可在主体完成后复评。");
  }
  if (flags.disqualify) {
    notes.push("你选择了经营异常/失信等情形：可能触发资格排除条件；建议先处理合规状态再评估。");
  }

  return {
    byStatus,
    notes,
    disclaimer: "说明：本工具仅做“政策路径可行性”结构化判断辅助，不输出收益/赚钱结论；最终判断与责任由用户自行承担。",
  };
}
