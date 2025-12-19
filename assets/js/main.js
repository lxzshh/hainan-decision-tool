const form = document.getElementById("quizForm");
const submitBtn = document.getElementById("submitBtn");

let currentIndex = 0;           // 当前题目索引
const answers = {};             // 用户答案缓存

// ===== 渲染当前题目 =====
function renderCurrentQuestion() {
  form.innerHTML = ""; // 清空

  const q = QUESTIONS[currentIndex];

  const div = document.createElement("div");
  div.className = "question";

  div.innerHTML = `
    <h3>(${currentIndex + 1}/${QUESTIONS.length}) ${q.text}</h3>
    <div class="options">
      ${q.options.map(o => `
        <label>
          <input type="radio" name="${q.id}" value="${o.value}">
          ${o.label}
        </label>
      `).join("")}
    </div>
  `;

  form.appendChild(div);

  // 如果用户之前答过这题，回显
  if (answers[q.id]) {
    const checked = form.querySelector(
      `input[value="${answers[q.id]}"]`
    );
    if (checked) checked.checked = true;
  }

  // 最后一题时，按钮文字变为“生成结果”
  if (currentIndex === QUESTIONS.length - 1) {
    submitBtn.textContent = "生成结果";
  } else {
    submitBtn.textContent = "下一题";
  }
}

// ===== 点击“下一题 / 生成结果” =====
submitBtn.addEventListener("click", () => {
  const q = QUESTIONS[currentIndex];
  const checked = form.querySelector("input:checked");

  // 必答校验
  if (!checked) {
    alert("请选择一个选项");
    return;
  }

  // 保存答案
  answers[q.id] = checked.value;

  // 如果不是最后一题，进入下一题
  if (currentIndex < QUESTIONS.length - 1) {
    currentIndex++;
    renderCurrentQuestion();
    return;
  }

  // ===== 最后一题：生成结果 =====
  const output = evaluateAnswers(answers);
  renderResult(output);

  // 滚动到结果
  document.getElementById("result").scrollIntoView({
    behavior: "smooth"
  });
});

// ===== 重置 =====
document.getElementById("resetBtn").addEventListener("click", () => {
  currentIndex = 0;
  for (const k in answers) delete answers[k];
  document.getElementById("result").innerHTML = "";
  renderCurrentQuestion();
});

// ===== 初始化 =====
renderCurrentQuestion();
