// js/result.js
import { evaluate } from "./rules.js";

const ROLE_LABEL = {
  R1: "经营主体视角",
  R2: "货物与贸易视角",
  R3: "加工与产业视角",
  R4: "合规与监管视角",
  R5: "信息充分性视角",
};
const ROLE_DESC = {
  R1: "政策是否接受你这个主体（是否需要海南主体、是否被政策排除）",
  R2: "你的货从哪来、到哪去，决定是否触发一线、二线或岛内流通",
  R3: "你是否在海南从事被政策认可的实质经营活动",
  R4: "你是否愿意进入政策要求的申报、备案和监管流程",
  R5: "当前信息是否足够让系统继续判断",
};

const ROLE_ORDER = ["R1", "R2", "R3", "R4", "R5"];

const STATUS_LABEL = {
  OK: "✓ 可进入判断/路径成立",
  COND: "⚠ 条件成立（需补充/满足条件）",
  NO: "✕ 明确不成立",
};

export function renderResult(appEl, state, { onReset, onBackToLast }) {
  const result = evaluate(state.answers);
  let currentRole = "R1";

  function render() {
    const statusCounts = {
      OK: result.summary.byStatus.OK.length,
      COND: result.summary.byStatus.COND.length,
      NO: result.summary.byStatus.NO.length,
    };

    appEl.innerHTML = `
      <div class="row">
        <div class="pill">已完成 · 输出“政策路径判断结果”</div>
        <button id="resetBtn" class="btn small ghost" style="max-width:120px;">重新开始</button>
      </div>

      <div class="qtitle">你的政策路径判断结果</div>

      <div>
        ${statusCounts.OK ? `<span class="tag good">${esc(STATUS_LABEL.OK)} · ${statusCounts.OK}</span>` : ""}
        ${statusCounts.COND ? `<span class="tag warn">${esc(STATUS_LABEL.COND)} · ${statusCounts.COND}</span>` : ""}
        ${statusCounts.NO ? `<span class="tag bad">${esc(STATUS_LABEL.NO)} · ${statusCounts.NO}</span>` : ""}
      </div>

      <div class="divider"></div>

      <div class="section-title">政策角色视角解读</div>
      <div class="role-tabs">
        ${ROLE_ORDER.map(r => `
          <button class="role-btn ${r === currentRole ? "active" : ""}" data-role="${r}">
            ${esc(ROLE_LABEL[r])}
          </button>
        `).join("")}
      </div>
      ${renderRoleView(result.paths, currentRole)}

      <div class="divider"></div>

      <div class="section-title">路径总览（按路径状态）</div>
      ${renderStatusSection(result, "OK", "good")}
      ${renderStatusSection(result, "COND", "warn")}
      ${renderStatusSection(result, "NO", "bad")}

      <div class="divider"></div>

      <div class="note">${esc(result.summary.disclaimer)}</div>

      <div class="footer">
        <button id="backBtn" class="btn small ghost">回到上一题</button>
        <button id="copyBtn" class="btn small">复制结果摘要</button>
      </div>
    `;

    appEl.querySelectorAll(".role-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentRole = btn.dataset.role;
        render();
      });
    });

    document.getElementById("resetBtn").addEventListener("click", onReset);
    document.getElementById("backBtn").addEventListener("click", onBackToLast);
    document.getElementById("copyBtn").addEventListener("click", () => {
      const text = buildCopyText(result);
      navigator.clipboard?.writeText(text);
      alert("已复制到剪贴板");
    });
  }

  render();
}

function renderRoleView(paths, role) {
  const cards = paths
    .map(p => {
      const rel = p.blockers.filter(b => b.role === role);
      if (!rel.length) return "";
      return `
        <div class="path-card">
          <h3>${esc(p.title)}
            <span class="badge">${esc(p.status)}</span>
          </h3>
          <ul class="list">
            ${rel.map(b => `<li>${iconFor(b.type)} ${esc(b.reason)}</li>`).join("")}
          </ul>
        </div>
      `;
    })
    .filter(Boolean);

  if (!cards.length) {
    return `<div class="note">在该视角下，没有触发需要解释的否定/条件项。</div>`;
  }
  return cards.join("");
}

function renderStatusSection(result, status, cls) {
  const items = result.summary.byStatus[status] || [];
  if (!items.length) return "";

  const title = STATUS_LABEL[status];
  return `
    <div class="section-title">${esc(title)}</div>
    ${items.map(p => `
      <div class="note" style="margin-bottom:10px;">
        <div style="font-weight:900; margin-bottom:6px;">${esc(p.title)}</div>
        ${p.blockers.length ? `
          <ul class="list">
            ${p.blockers.map(b => `
              <li>
                <span class="tag ${cls}" style="margin:0 6px 0 0; padding:3px 8px;">${esc(b.role)}</span>
                ${iconFor(b.type)} ${esc(b.reason)}
              </li>
            `).join("")}
          </ul>
        ` : `<div class="mini">无阻碍项（当前输入下该路径可进入判断）。</div>`}
      </div>
    `).join("")}
  `;
}

function iconFor(type) {
  if (type === "HARD") return "❌";
  if (type === "SOFT") return "⚠️";
  return "ℹ️";
}

function buildCopyText(result) {
  const lines = [];
  lines.push("海南自贸港判断器｜政策路径判断结果");
  lines.push("");

  const order = [
    ["OK", "✓ 可进入判断/路径成立"],
    ["COND", "⚠ 条件成立（需补充/满足条件）"],
    ["NO", "✕ 明确不成立"],
  ];

  for (const [status, label] of order) {
    const items = result.summary.byStatus[status] || [];
    if (!items.length) continue;
    lines.push(label);
    items.forEach(p => {
      lines.push(`- ${p.title}`);
      if (p.blockers?.length) {
        p.blockers.forEach(b => lines.push(`  • [${b.role}/${b.type}] ${b.reason}`));
      } else {
        lines.push(`  • 无阻碍项`);
      }
    });
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
