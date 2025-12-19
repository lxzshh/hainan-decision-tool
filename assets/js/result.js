function renderResult(output) {
  const box = document.getElementById("result");

  let title = "";
  let desc = "";

  if (output.result === "NOT_SUITABLE") {
    title = "🟥 当前不适合进入海南自贸港";
    desc = "存在关键性政策不匹配，继续推进风险较高。";
  } else if (output.result === "HIGH_RISK") {
    title = "🟨 存在可行路径，但整体风险较高";
    desc = "部分条件符合，但需高度关注合规与补税风险。";
  } else {
    title = "🟩 理论上具备政策适配可能";
    desc = "未发现明显硬性冲突，但仍需以实际备案和核查为准。";
  }

  box.innerHTML = `
    <div class="result-box">
      <div class="badge">${title}</div>
      <div>${desc}</div>
      <div class="risks">
        <strong>风险清单：</strong>
        <ul>
          ${output.risks.length ? output.risks.map(r => `<li>${r}</li>`).join("") : "<li>暂无明显风险项</li>"}
        </ul>
      </div>
    </div>
  `;
}
