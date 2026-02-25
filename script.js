const els = {
  tone: document.getElementById("tone"),
  length: document.getElementById("length"),
  purpose: document.getElementById("purpose"),
  outputStyle: document.getElementById("outputStyle"),
  keepMeaning: document.getElementById("keepMeaning"),
  fixGrammar: document.getElementById("fixGrammar"),
  reduceRobotic: document.getElementById("reduceRobotic"),
  inputText: document.getElementById("inputText"),
  promptText: document.getElementById("promptText"),
  outputText: document.getElementById("outputText"),
  btnHumanise: document.getElementById("btnHumanise"),
  btnClear: document.getElementById("btnClear"),
  btnCopyPrompt: document.getElementById("btnCopyPrompt"),
  btnCopyOutput: document.getElementById("btnCopyOutput"),
  btnTrySample: document.getElementById("btnTrySample"),
  status: document.getElementById("status"),
  inputCount: document.getElementById("inputCount"),
  promptCount: document.getElementById("promptCount"),
  outputCount: document.getElementById("outputCount"),
  year: document.getElementById("year"),
};

const STORAGE_KEY = "humaniser_settings_v2";

function setStatus(msg) {
  els.status.textContent = msg || "";
  if (msg) setTimeout(() => (els.status.textContent = ""), 2200);
}

function countChars() {
  els.inputCount.textContent = (els.inputText.value || "").length;
  els.promptCount.textContent = (els.promptText.value || "").length;
  els.outputCount.textContent = (els.outputText.value || "").length;
}

function saveSettings() {
  const data = {
    tone: els.tone.value,
    length: els.length.value,
    purpose: els.purpose.value,
    outputStyle: els.outputStyle.value,
    keepMeaning: els.keepMeaning.checked,
    fixGrammar: els.fixGrammar.checked,
    reduceRobotic: els.reduceRobotic.checked,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);

    if (d.tone) els.tone.value = d.tone;
    if (d.length) els.length.value = d.length;
    if (d.purpose) els.purpose.value = d.purpose;
    if (d.outputStyle) els.outputStyle.value = d.outputStyle;

    if (typeof d.keepMeaning === "boolean") els.keepMeaning.checked = d.keepMeaning;
    if (typeof d.fixGrammar === "boolean") els.fixGrammar.checked = d.fixGrammar;
    if (typeof d.reduceRobotic === "boolean") els.reduceRobotic.checked = d.reduceRobotic;
  } catch (_) {}
}

function lengthGuidance(length) {
  if (length === "Short") return "Keep it concise (roughly 30–60% of the original if possible).";
  if (length === "Long") return "Add clarity and detail without changing meaning (up to ~130–160% if useful).";
  return "Keep a balanced length similar to the original (roughly ±20%).";
}

function purposeGuidance(purpose) {
  const map = {
    "General rewrite": "Use natural, human wording and clean paragraphs.",
    "Email": "Format as an email with subject + greeting + short paragraphs + polite closing.",
    "Chat reply": "Conversational. Short sentences are fine. No email structure.",
    "Academic": "Formal academic tone, clear logic, neutral language. No slang.",
    "Resume / CV": "Bullet-style where suitable, strong action verbs, no first-person.",
    "Cover letter": "Persuasive professional. 3–5 short paragraphs. Show fit and value.",
    "Social post": "Engaging and skimmable; optional light emojis if appropriate.",
    "Customer support": "Calm, helpful, step-by-step. Confirm issue and provide next actions.",
  };
  return map[purpose] || map["General rewrite"];
}

function outputGuidance(style) {
  if (style === "Rewrite + improvements list") {
    return `Return TWO sections:
1) "Humanised Version"
2) "Improvements Made" (bullet list)`;
  }
  if (style === "Two options") {
    return `Return TWO versions:
- Option A: slightly more formal
- Option B: slightly more friendly`;
  }
  if (style === "Bullet points") {
    return `Return the final answer as bullet points (use headings if helpful).`;
  }
  return `Return ONLY the rewritten text.`;
}

function buildPrompt() {
  const input = (els.inputText.value || "").trim();
  const tone = els.tone.value;
  const length = els.length.value;
  const purpose = els.purpose.value;
  const outputStyle = els.outputStyle.value;

  const constraints = [];
  if (els.keepMeaning.checked) constraints.push("Do not add new facts. Preserve the original meaning exactly.");
  if (els.fixGrammar.checked) constraints.push("Fix grammar, punctuation, and awkward phrasing.");
  if (els.reduceRobotic.checked) constraints.push("Reduce robotic wording. Prefer natural, human phrasing.");
  constraints.push("English only.");

  const prompt =
`You are a writing editor. Rewrite the text below with these requirements:

TONE: ${tone}
LENGTH: ${length} — ${lengthGuidance(length)}
PURPOSE: ${purpose} — ${purposeGuidance(purpose)}

CONSTRAINTS:
- ${constraints.join("\n- ")}

OUTPUT FORMAT:
- ${outputGuidance(outputStyle)}

TEXT TO REWRITE:
"""${input}"""`;

  els.promptText.value = prompt;
  countChars();
  saveSettings();
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

els.btnHumanise.addEventListener("click", () => {
  if (!els.inputText.value.trim()) return setStatus("Paste some text first.");
  buildPrompt();
  setStatus("Prompt generated. Copy it into ChatGPT.");
});

els.btnClear.addEventListener("click", () => {
  els.inputText.value = "";
  els.promptText.value = "";
  els.outputText.value = "";
  countChars();
  setStatus("Cleared.");
});

els.btnCopyPrompt.addEventListener("click", async () => {
  const text = (els.promptText.value || "").trim();
  if (!text) return setStatus("No prompt to copy.");
  const ok = await copyToClipboard(text);
  setStatus(ok ? "Prompt copied." : "Copy failed—select and copy manually.");
});

els.btnCopyOutput.addEventListener("click", async () => {
  const text = (els.outputText.value || "").trim();
  if (!text) return setStatus("No output to copy.");
  const ok = await copyToClipboard(text);
  setStatus(ok ? "Output copied." : "Copy failed—select and copy manually.");
});

els.btnTrySample?.addEventListener("click", () => {
  els.inputText.value =
`Hi sir,
Im just following up about my request. Can you please send it today because i really need it. Thanks.`;
  buildPrompt();
  setStatus("Sample added.");
});

["inputText", "promptText", "outputText"].forEach((id) => {
  document.getElementById(id).addEventListener("input", countChars);
});

["tone","length","purpose","outputStyle","keepMeaning","fixGrammar","reduceRobotic"].forEach((id) => {
  document.getElementById(id).addEventListener("change", () => {
    if (els.inputText.value.trim()) buildPrompt();
    else saveSettings();
  });
});

els.year.textContent = new Date().getFullYear();
loadSettings();
countChars();
