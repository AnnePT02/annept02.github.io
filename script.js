const tone=document.getElementById("tone");
const lengthSel=document.getElementById("length");
const purpose=document.getElementById("purpose");
const outputStyle=document.getElementById("outputStyle");
const keepMeaning=document.getElementById("keepMeaning");
const fixGrammar=document.getElementById("fixGrammar");
const reduceRobotic=document.getElementById("reduceRobotic");
const inputText=document.getElementById("inputText");
const promptText=document.getElementById("promptText");
const btnHumanise=document.getElementById("btnHumanise");
const btnAutoCopy=document.getElementById("btnAutoCopy");
const btnCopyPrompt=document.getElementById("btnCopyPrompt");
const btnDetect=document.getElementById("btnDetect");
const status=document.getElementById("status");
const year=document.getElementById("year");
const aiScore=document.getElementById("aiScore");
const aiFill=document.getElementById("aiFill");
const aiNote=document.getElementById("aiNote");

year.textContent=new Date().getFullYear();

function buildPrompt(){
if(!inputText.value.trim()){status.textContent="Paste text first.";return;}
const constraints=[];
if(keepMeaning.checked)constraints.push("Preserve original meaning exactly.");
if(fixGrammar.checked)constraints.push("Fix grammar and punctuation.");
if(reduceRobotic.checked)constraints.push("Make it sound natural and human.");

promptText.value=`You are a professional writing editor.

Rewrite the following text with:

Tone: ${tone.value}
Length: ${lengthSel.value}
Purpose: ${purpose.value}

Rules:
- ${constraints.join("\n- ")}

Output format: ${outputStyle.value}

Text:
"""${inputText.value}"""`;

status.textContent="Prompt generated.";
}

btnHumanise.addEventListener("click",buildPrompt);

btnAutoCopy.addEventListener("click",async()=>{
buildPrompt();
await navigator.clipboard.writeText(promptText.value);
status.textContent="Prompt generated + copied.";
});

btnCopyPrompt.addEventListener("click",async()=>{
await navigator.clipboard.writeText(promptText.value);
status.textContent="Prompt copied.";
});

btnDetect.addEventListener("click",()=>{
const text=inputText.value;
if(text.length<80){aiScore.textContent="--";aiFill.style.width="0%";aiNote.textContent="Add more text for estimate.";return;}
let score=Math.min(95,Math.max(10,Math.floor(text.length/5)));
aiScore.textContent=score;
aiFill.style.width=score+"%";
aiNote.textContent="Experimental estimate only.";
});
