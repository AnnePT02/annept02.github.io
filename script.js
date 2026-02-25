const tone = document.getElementById("tone");
const lengthSel = document.getElementById("length");
const purpose = document.getElementById("purpose");
const outputStyle = document.getElementById("outputStyle");
const keepMeaning = document.getElementById("keepMeaning");
const fixGrammar = document.getElementById("fixGrammar");
const reduceRobotic = document.getElementById("reduceRobotic");
const inputText = document.getElementById("inputText");
const promptText = document.getElementById("promptText");
const btnHumanise = document.getElementById("btnHumanise");
const btnCopyPrompt = document.getElementById("btnCopyPrompt");
const status = document.getElementById("status");
const year = document.getElementById("year");

year.textContent = new Date().getFullYear();

function buildPrompt() {
  if (!inputText.value.trim()) {
    status.textContent = "Paste text first.";
    return;
  }

  const constraints = [];
  if (keepMeaning.checked) constraints.push("Preserve original meaning exactly.");
  if (fixGrammar.checked) constraints.push("Fix grammar and punctuation.");
  if (reduceRobotic.checked) constraints.push("Make it sound natural and human.");

  const prompt = `
You are a professional writing editor.

Rewrite the following text with:

Tone: ${tone.value}
Length: ${lengthSel.value}
Purpose: ${purpose.value}

Rules:
- ${constraints.join("\n- ")}

Output format: ${outputStyle.value}

Text:
"""${inputText.value}"""
`;

  promptText.value = prompt.trim();
  status.textContent = "Prompt generated.";
}

btnHumanise.addEventListener("click", buildPrompt);

btnCopyPrompt.addEventListener("click", async () => {
  if (!promptText.value) return;
  await navigator.clipboard.writeText(promptText.value);
  status.textContent = "Prompt copied.";
});
