// js/main.js
import { QUESTIONS } from "./data.js";
import { renderResult } from "./result.js";

const STORAGE_KEY = "hainan_decision_tool_state_v12";
const app = document.getElementById("app");

const state = loadState() || {
  idx: 0,
  answers: {}, // { qid: value | [values] }
};

render();

function render() {
  const q = QUESTIONS[state.idx];
  if (!q) return renderResultPage();

  const progress = Math.round((state.idx / QUESTIONS.length) * 100);
  const current = state.answers[q.id];

  app.innerHTML = `
    <div class="row">
      <div class="pill">第 ${state.idx + 1} / ${QUESTIONS.length} 题 · L${q.layer} · ${esc(q.roles?.join(", ") || "")}</div>
      <button id="resetBtn" class="btn small ghost" style="max-width:120px;">重置</button>
    </div>

    <div class="qtitle">${esc(q.title)}</div>
    ${q.desc ? `<div class="qdesc">${esc(q.desc)}</div>` : ""}

    <div class="options" id="options"></div>

    <div class="progress" aria-label="progress">
      <div class="bar" style="width:${progress}%;"></div>
    </div>

    <div class="footer">
      <button id="backBtn" class="btn small ghost" ${state.idx === 0 ? "disabled" : ""}>上一步</button>
      <button id="skipBtn" class="btn small">跳过</button>
    </div>
  `;

  document.getElementById("resetBtn").addEventListener("click", onReset);
  document.getElementById("backBtn").addEventListener("click", onBack);
  document.getElementById("skipBtn").addEventListener("click", onSkip);

  renderOptions(q, current);
  saveState(state);
}

function renderOptions(q, current) {
  const box = document.getElementById("options");

  if (q.type === "single") {
    q.options.forEach(opt => {
      const selected = current === opt.value;
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.innerHTML = `${selected ? "✅ " : ""}${esc(opt.label)}`;
      btn.addEventListener("click", () => {
        state.answers[q.id] = opt.value;
        state.idx += 1;
        render();
      });
      box.appendChild(btn);
    });
    return;
  }

  if (q.type === "multi") {
    const selectedSet = new Set(Array.isArray(current) ? current : []);

    q.options.forEach(opt => {
      const isSelected = selectedSet.has(opt.value);
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.innerHTML = `${isSelected ? "✅ " : "⬜ "}${esc(opt.label)}`;
      btn.addEventListener("click", () => {
        // “none” 与其他互斥
        if (opt.value === "none") {
          selectedSet.clear();
          selectedSet.add("none");
        } else {
          selectedSet.delete("none");
          if (selectedSet.has(opt.value)) selectedSet.delete(opt.value);
          else selectedSet.add(opt.value);
        }
        state.answers[q.id] = Array.from(selectedSet);
        render(); // 更新勾选态
      });
      box.appendChild(btn);
    });

    const go = document.createElement("button");
    go.className = "btn small";
    go.style.marginTop = "4px";
    go.textContent = "继续";
    go.addEventListener("click", () => {
      state.answers[q.id] = Array.isArray(state.answers[q.id]) ? state.answers[q.id] : [];
      state.idx += 1;
      render();
    });
    box.appendChild(go);
    return;
  }

  const tip = document.createElement("div");
  tip.className = "note";
  tip.textContent = "题目配置错误：未知题型";
  box.appendChild(tip);
}

function renderResultPage() {
  renderResult(app, state, {
    onReset,
    onBackToLast: () => {
      state.idx = Math.max(QUESTIONS.length - 1, 0);
      render();
    },
  });
  saveState(state);
}

function onBack() {
  if (state.idx > 0) {
    state.idx -= 1;
    render();
  }
}

function onSkip() {
  state.idx += 1;
  render();
}

function onReset() {
  if (!confirm("确定要清空本机保存的进度与答案吗？")) return;
  localStorage.removeItem(STORAGE_KEY);
  state.idx = 0;
  state.answers = {};
  render();
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function esc(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
