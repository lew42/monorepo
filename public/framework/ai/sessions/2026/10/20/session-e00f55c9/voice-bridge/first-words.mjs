// time from prompt to the model's first text delta, with the say-first instruction (killed after the first sentence)
import { spawn } from "child_process";
const effort = process.argv[2] ?? "medium";
const q = `The owner asks by voice (question probe): "What landed in the repo today, and is anything waiting on me?"\nSAY FIRST: begin your reply with ONE plain sentence, before any tool call: the answer if you know it, else what you are doing and about how long. The voice agent hears it the moment you write it.\nThen, if more is needed, do it.`;
const t0 = Date.now();
const p = spawn(process.env.CLAUDE_BIN, ["-p", q, "--model", "claude-opus-5-5", "--effort", effort, "--output-format", "stream-json", "--include-partial-messages", "--verbose", "--permission-mode", "plan"], { cwd: "C:/Code/lew42/monorepo", windowsHide: true, shell: false });
let buf = "", init = null, text = "";
p.stdout.on("data", d => {
  buf += d; let i;
  while ((i = buf.indexOf("\n")) >= 0){
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    let j; try { j = JSON.parse(line); } catch { continue; }
    if (j.type === "system" && !init) init = Date.now() - t0;
    const ev = j.event;
    if (j.type === "stream_event" && ev?.type === "content_block_delta" && ev.delta?.type === "text_delta"){
      if (!text) console.log(JSON.stringify({ effort, init_ms: init, first_text_ms: Date.now() - t0 }));
      text += ev.delta.text;
      if (/[.!?]\s/.test(text) || text.length > 160){ console.log(JSON.stringify({ sentence_ms: Date.now() - t0, text: text.slice(0, 160) })); p.kill(); process.exit(0); }
    }
    if (j.type === "stream_event" && ev?.type === "content_block_start" && ev.content_block?.type === "tool_use" && !text){ console.log(JSON.stringify({ effort, tool_before_text_ms: Date.now() - t0, tool: ev.content_block.name })); }
  }
});
setTimeout(() => { console.log(JSON.stringify({ effort, timeout: true, text })); p.kill(); process.exit(0); }, 120000);
