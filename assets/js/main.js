const form = document.getElementById("quizForm");

QUESTIONS.forEach(q => {
  const div = document.createElement("div");
  div.className = "question";

  div.innerHTML = `
    <h3>${q.text}</h3>
    <div class="options">
      ${q.options.map(o => `
        <label>
          <input type="radio" name="${q.id}" value="${o.value}" required>
          ${o.label}
        </label>
      `).join("")}
    </div>
  `;

  form.appendChild(div);
});

document.getElementById("submitBtn").addEventListener("click", () => {
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const answers = {};
  new FormData(form).forEach((v, k) => answers[k] = v);

  const output = evaluateAnswers(answers);
  renderResult(output);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  form.reset();
  document.getElementById("result").innerHTML = "";
});
