function evaluateAnswers(answers) {
  const risks = [];
  let result = "THEORETICALLY_FEASIBLE";

  if (answers.q1_entity === "no") {
    return {
      result: "NOT_SUITABLE",
      risks: ["未具备海南自贸港要求的法人主体资格（高风险）"]
    };
  }

  if (answers.q2_zero_tax === "reject") {
    return {
      result: "NOT_SUITABLE",
      risks: ["对零关税存在根本性误解（高风险）"]
    };
  }

  if (answers.q3_supervision === "reject") {
    result = "HIGH_RISK";
    risks.push("无法接受电子账册与海关稽查（高风险）");
  }

  if (answers.q4_processing === "yes") {
    result = "HIGH_RISK";
    risks.push("将微小加工误认为加工增值（高风险）");
  }

  if (answers.q5_mainland === "yes") {
    risks.push("产品计划进入内地，存在二线补税风险（中风险）");
  }

  return { result, risks };
}
