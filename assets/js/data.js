// js/data.js
// roles: R1经营主体 / R2货物与贸易 / R3加工与产业 / R4合规与监管 / R5信息充分性

export const QUESTIONS = [
  {
    id: "q1",
    layer: 1,
    roles: ["R2"],
    title: "你目前最关心在海南开展的业务类型是？",
    type: "single",
    options: [
      { value: "import_to_hainan", label: "进口货物到海南" },
      { value: "processing_in_hainan", label: "在海南进行加工/生产" },
      { value: "sell_to_mainland", label: "把海南的货物或产品卖到内地" },
      { value: "island_only", label: "主要在海南岛内销售或使用" },
      { value: "mixed_unsure", label: "还不确定/可能包含以上多种" },
    ],
  },
  {
    id: "q2",
    layer: 1,
    roles: ["R2"],
    title: "你是否计划让境外货物进入海南？",
    type: "single",
    options: [
      { value: "yes_longterm", label: "是，长期或多次进口" },
      { value: "yes_once", label: "是，但只是偶发或单次" },
      { value: "no", label: "否，不涉及境外货物" },
    ],
  },

  {
    id: "q3",
    layer: 2,
    roles: ["R1"],
    title: "你目前是否在海南拥有独立法人主体？",
    type: "single",
    options: [
      { value: "have", label: "已经有海南独立法人" },
      { value: "plan", label: "尚未有，但计划注册" },
      { value: "none", label: "没有，也暂无注册计划" },
    ],
  },
  {
    id: "q4",
    layer: 2,
    roles: ["R1"],
    title: "你的主体类型是？",
    type: "single",
    options: [
      { value: "enterprise", label: "企业法人" },
      { value: "institution", label: "事业单位" },
      { value: "social_org", label: "社会组织" },
      { value: "other", label: "其他/不清楚" },
    ],
  },
  {
    id: "q5",
    layer: 2,
    roles: ["R1"],
    title: "你的主体是否存在以下情形？（可多选）",
    type: "multi",
    options: [
      { value: "abnormal", label: "被列入经营异常名录" },
      { value: "customs_dishonest", label: "被列入海关失信企业名单" },
      { value: "serious_dishonest", label: "被列入严重违法失信名单" },
      { value: "none", label: "以上情况均不存在" },
    ],
  },

  {
    id: "q6",
    layer: 3,
    roles: ["R2"],
    title: "你计划进口到海南的货物，主要用途是？",
    type: "single",
    options: [
      { value: "for_processing", label: "用于生产加工" },
      { value: "for_trade", label: "用于贸易销售" },
      { value: "for_self", label: "自用/项目使用" },
      { value: "unknown", label: "尚未确定" },
    ],
  },
  {
    id: "q7",
    layer: 3,
    roles: ["R2"],
    title: "这些货物或制成品是否计划从海南进入内地？",
    type: "single",
    options: [
      { value: "yes_major", label: "是，作为主要市场" },
      { value: "yes_minor", label: "是，但只占少量" },
      { value: "no", label: "否，仅在岛内使用/销售" },
    ],
  },
  {
    id: "q8",
    layer: 3,
    roles: ["R5"],
    title: "你是否清楚这些货物的大致税则分类？",
    type: "single",
    options: [
      { value: "hs_known", label: "已有明确 HS 编码" },
      { value: "category_known", label: "大概知道商品类别" },
      { value: "unknown", label: "暂时不清楚" },
    ],
  },

  {
    id: "q9",
    layer: 4,
    roles: ["R4"],
    title: "你是否考虑过申请“零关税进口”的相关资格？",
    type: "single",
    options: [
      { value: "yes", label: "已明确考虑" },
      { value: "heard", label: "听说过，但不了解" },
      { value: "no", label: "没考虑过" },
    ],
  },
  {
    id: "q10",
    layer: 4,
    roles: ["R4"],
    title: "如果使用相关政策需要申报/备案/接受监管，你是否会照做？",
    type: "single",
    options: [
      { value: "accept", label: "可以接受" },
      { value: "evaluate", label: "需要评估成本" },
      { value: "reject", label: "无法接受" },
    ],
  },

  {
    id: "q11",
    layer: 5,
    roles: ["R3"],
    title: "你是否计划在海南对进口货物进行实质性加工？",
    type: "single",
    options: [
      { value: "substantial", label: "是，有明确生产加工环节" },
      { value: "minor", label: "仅贴标/包装/分拆/简单处理" },
      { value: "none", label: "不涉及加工" },
    ],
  },
  {
    id: "q12",
    layer: 5,
    roles: ["R3"],
    title: "你的业务是否可能属于“鼓励类产业”？",
    type: "single",
    options: [
      { value: "yes", label: "明确属于" },
      { value: "maybe", label: "可能属于" },
      { value: "no", label: "明确不属于" },
      { value: "unknown", label: "不清楚" },
    ],
  },
  {
    id: "q13",
    layer: 5,
    roles: ["R3", "R5"],
    title: "你的加工增值是否有可能达到 30%？",
    type: "single",
    options: [
      { value: "likely", label: "有核算基础，可能达到" },
      { value: "maybe", label: "可能接近，但不确定" },
      { value: "no", label: "明显达不到" },
      { value: "unknown", label: "暂无法判断" },
    ],
  },
];
