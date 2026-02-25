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
const btnDetect = document.getElementById("btnDetect");
const aiScoreEl = document.getElementById("aiScore");
const aiFillEl = document.getElementById("aiFill");
const aiNoteEl = document.getElementById("aiNote");

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function aiLikenessEstimate(text){
  const t = (text || "").trim();
  if (t.length < 80) return { score: null, note: "Add more text (80+ chars) for a better estimate." };

  // Basic features (simple + explainable)
  const words = t.toLowerCase().match(/[a-z']+/g) || [];
  const wordCount = words.length;

  const sentences = t.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  const sentLens = sentences.map(s => (s.match(/[a-zA-Z']+/g) || []).length).filter(n => n > 0);

  // Repetition
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const top = [...freq.values()].sort((a,b)=>b-a).slice(0,10);
  const topShare = top.reduce((a,b)=>a+b,0) / Math.max(1, wordCount); // higher => more repetitive

  // Sentence-length uniformity (lower variance can look "too even")
  const mean = sentLens.reduce((a,b)=>a+b,0) / Math.max(1, sentLens.length);
  const variance = sentLens.reduce((a,b)=>a+(b-mean)*(b-mean),0) / Math.max(1, sentLens.length);
  const std = Math.sqrt(variance);
  const uniformity = std / Math.max(1, mean); // lower => more uniform

  // Punctuation / structure signals
  const bulletLike = (t.match(/^\s*[-•*]\s+/gm) || []).length;
  const semicolons = (t.match(/;/g) || []).length;
  const exclaims = (t.match(/!/g) || []).length;

  // Heuristic scoring (0–100 AI-likeness)
  // These weights are intentionally mild; it’s an estimate, not a verdict.
  let score = 0;

  // repetition (0–1) scaled
  score += clamp((topShare - 0.12) * 220, 0, 35);     // heavy repetition pushes score up

  // uniformity: if std/mean is very low, can feel model-like
  score += clamp((0.22 - uniformity) * 160, 0, 25);

  // lots of bullets / overly structured text can look templated
  score += clamp(bulletLike * 4, 0, 12);

  // a tiny nudge if text is extremely “formal-clean”
  score += clamp(semicolons * 2, 0, 6);

  // human-y punctuation reduces score a bit (not always)
  score -= clamp(exclaims * 2, 0, 8);

  // length stabilization
  if (wordCount > 220) score += 6;

  score = clamp(Math.round(score), 1, 99);

  let note = "Estimate only — not proof.";
  if (score >= 70) note = "High AI-likeness signal (still not proof).";
  else if (score >= 45) note = "Mixed signal (could be either).";
  else note = "More human-like signal (still not proof).";

  return { score, note };
}

function runDetect(){
  const text = (outputText.value || "").trim() || (inputText.value || "").trim();
  const res = aiLikenessEstimate(text);

  if (res.score === null){
    aiScoreEl.textContent = "--";
    aiFillEl.style.width = "0%";
    aiNoteEl.textContent = res.note;
    return;
  }

  aiScoreEl.textContent = res.score;
  aiFillEl.style.width = `${res.score}%`;
  aiNoteEl.textContent = res.note;
}

btnDetect?.addEventListener("click", runDetect);

// Optional: auto-update when user types/pastes
inputText.addEventListener("input", () => { /* runDetect(); */ });
outputText.addEventListener("input", () => { /* runDetect(); */ });
