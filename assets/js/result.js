// js/result.js
import { evaluate } from "./rules.js";

export function renderResult(appEl, state, questions, { onReset, onBackToLast }) {
  const result = evaluate(state.answers);

  const ok = result.summary.byStatus.ok;
  const cond = result.summary.byStatus.cond;
  const no = result.summary.byStatus.no;
  const info = result.summary.byStatus.info;

  appEl.innerHTML = `
    <div class="row">
      <div class="pill">已完成 · 输出“政策路径判断结果”</div>
      <button id="resetBtn" class="btn small ghost" style="max-width:120px;">重新开始</button>
    </div>

    <div class="qtitle">你的政策路径判断结果</div>
    <div class="qdesc">系统只负责把你的情况贴到政策路径上，不输出收益/赚钱结论。</div>

    ${renderTags(ok, "good", "✓ 可进入判断/路径成立")}
    ${renderTags(cond, "warn", "⚠ 条件成立（需补充/满足前置条件）")}
    ${renderTags(no, "bad", "✕ 明确不成立")}
    ${renderTags(info, "info", "ℹ 信息/路径不相关或精度受限")}

    <div class="divider"></div>

    ${renderPathSection("✓ 可进入判断/路径成立", ok)}
    ${renderPathSection("⚠ 条件成立（需补充/满足前置条件）", cond)}
    ${renderPathSection("✕ 明确不成立", no)}
    ${renderPathSection("ℹ 信息/路径不相关或精度受限", info)}

    <div class="divider"></div>

    <div class="section-title">系统提示</div>
    ${result.summary.notes.length
      ? `<ul class="list">${result.summary.notes.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`
      : `<div class="note">暂无额外提示。</div>`}

    <div class="divider"></div>
    <div class="note">${esc(result.summary.disclaimer)}</div>

    <div class="footer">
      <button id="backBtn" class="btn small ghost">回到上一题</button>
      <button id="copyBtn" class="btn small">复制结果摘要</button>
    </div>
  `;

  document.getElementById("resetBtn").addEventListener("click", onReset);
  document.getElementById("backBtn").addEventListener("click", onBackToLast);
  document.getElementById("copyBtn").addEventListener("click", () => {
    const text = buildCopyText(result);
    navigator.clipboard?.writeText(text);
    alert("已复制到剪贴板");
  });
}

function renderTags(items, cls, label) {
  if (!items.length) return "";
  return `
    <div style="margin:8px 0 2px;">
      <span class="tag ${cls}">${esc(label)} · ${items.length}</span>
    </div>
  `;
}

function renderPathSection(title, items) {
  if (!items.length) return "";
  return `
    <div class="section-title">${esc(title)}</div>
    ${items.map(p => `
      <div class="note" style="margin-bottom:10px;">
        <div style="font-weight:800; color:rgba(232,234,240,.95); margin-bottom:6px;">${esc(p.title)}</div>
        <ul class="list">
          ${p.reasons.map(r => `<li>${esc(r)}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  `;
}

function buildCopyText(result) {
  const lines = [];
  lines.push("海南自贸港判断器｜政策路径判断结果");
  lines.push("");

  const order = [
    ["✓ 可进入判断/路径成立", "ok"],
    ["⚠ 条件成立（需补充/满足前置条件）", "cond"],
    ["✕ 明确不成立", "no"],
    ["ℹ 信息/路径不相关或精度受限", "info"],
  ];

  for (const [label, key] of order) {
    const items = result.summary.byStatus[key] || [];
    if (!items.length) continue;
    lines.push(label);
    items.forEach((p) => {
      lines.push(`- ${p.title}`);
      p.reasons.forEach(r => lines.push(`  • ${r}`));
    });
    lines.push("");
  }

  if (result.summary.notes?.length) {
    lines.push("系统提示");
    result.summary.notes.forEach(n => lines.push(`- ${n}`));
    lines.push("");
  }

  lines.push(result.summary.disclaimer);
  return lines.join("\n");
}

function esc(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
