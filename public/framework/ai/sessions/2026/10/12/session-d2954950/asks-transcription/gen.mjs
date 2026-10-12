// Builds ux/Dictate/doc/asks.md from all-tags.jsonl + the clusters below (ids = candidate ids in candidates.jsonl). Rerunnable.
import fs from "fs";
const d = import.meta.dirname, root = d + "/../../../../..";
const tags = fs.readFileSync(d + "/all-tags.jsonl", "utf8").trim().split("\n").map(l => JSON.parse(l));
const by = new Map(); for (const t of tags) by.set(t.id, t);
const sid = s => (s || "").replace(/^claude-session:/, "").slice(0, 8);
const B = "`";
// [status, name, ask, ids, state, next]
const C = [
["open", "voice-model-policy", "Voice assistants (fast and smart) must not run on Anthropic models; use the best non-Anthropic model for the smart one.", [460, 461, 484],
 "`Servex/agents/roles.js` maps `session-fast`, `session-smart` and `assistant` to `model(\"fast\")`, which is Sonnet (a comment says: saving credits); no OpenRouter route for voice roles.",
 "Pick an OpenRouter model via `Servex/ext/openrouter/`, change the role rows; needs a Servex restart."],
["open", "prompt-to-board-cards", "A refined prompt's cards become board cards and `asks.jsonl` lines (approve or improve), and the board creates tasks while you dictate.", [5, 6, 366, 368, 375],
 "Stages, cards, tags and a `TagRouter` note on the module page stream to the session page; the route that turns one card into an ask line plus a board card is not built ([refine-asks STATE](/framework/ai/2026-10-12/refine-asks/STATE.md)).",
 "A Servex route `card -> asks.jsonl + board card`; one restart."],
["open", "vscode-voice-path", "The VS Code app path (Echo) should feed the same five-stage flow as the Refine page: one dictation system, one widget.", [386, 387, 489, 490, 526, 171],
 "Only the Refine page streams to `/api/voice`; the VS Code path is not wired ([voice-to-page.md](/framework/ext/Refine/stages/doc/voice-to-page.md), \"Open\"). `VoiceStrip` is already shared by Refine and the demo.",
 "Wire Echo's output to `VoicePage`; Echo is off by default for cost (`SERVEX_ECHO`)."],
["open", "real-phone-mic", "Use it on a phone: the mic must work on the LAN address.", [131, 146, 165, 481],
 "A phone on plain `http` hides the mic (browser rule); typing or the keyboard's dictation button works. Walks used a Chromium flag as a stand-in ([https-lan.md](/framework/ux/Dictate/doc/https-lan.md) lists three ways).",
 "The owner picks one https option; then one real-phone walk."],
["open", "whisper-status-stream", "Whisper restarts should show the moment they happen, not by polling.", [476, 161],
 "The page asks `GET /api/whisper` every 5 s only while the mic is open and every 2 s while Whisper is down ([try-it.md](/framework/ux/Dictate/doc/try-it.md)).",
 "A Servex status SSE; one restart."],
["open", "per-sentence-model-clean", "The live clean text should be model-cleaned per sentence, cheap in tokens, with a cost shown per message.", [249, 389, 541, 545],
 "A mechanical per-sentence clean is live; the model clean runs once per Refine (about 3 s). Clarity score and refined cost show on the cards. A per-sentence model call costs more than the whole prompt.",
 "A `clean_live` flag in `Servex/ext/refine/run.js` for one opt-in session ([refine-asks STATE](/framework/ai/2026-10-12/refine-asks/STATE.md))."],
["open", "curated-bubbles", "Dictated text becomes structure (lists, headings, sections citing the raw pieces) replacing the raw bubble in place.", [259, 152, 359],
 "Structure and refined stages exist on the session page; an agent-driven `amend_bubble` that swaps a raw bubble for cited sections is open ([handover](/framework/ux/Dictate/doc/handover.md)).",
 "Decide whether the box keeps raw while chat shows cleaned; then build the tool."],
["partly", "prompt-review-and-durability", "Every prompt is logged raw-first, durable, reviewable and reprocessable without losing data when sessions move.", [360, 361, 362, 364, 390, 332],
 "Raw-first `prompts.jsonl` per session (`PromptLog`) and `/api/refine` reruns exist; a failure log for dictation and an unattended review of yesterday's prompts are not built.",
 "A node script that reads `prompts.jsonl` and lists unrefined or failed prompts."],
["partly", "streaming-hierarchy", "Voice chat, tool calls and cards stream into the page through one generalised JSONL hierarchy (deep path updates).", [336, 337, 339, 342, 370, 371],
 "Page parts stream through the page tools and `VoiceFlow.follow` (SSE). The generalised deep-path serialization is the page-parts system, not a Dictate feature.",
 "Tracked in [core/Page asks](/framework/core/Page/doc/asks.md); nothing to build here."],
["partly", "duplicate-bubbles", "Duplicate messages in voice chat must stop.", [472, 522],
 "Fixed once only one mic could run ([duplicate-bubbles.md](/framework/ext/Chat/doc/duplicate-bubbles.md), proofs `prove-dup-*.mjs`); not re-run after tonight's changes.",
 "Rerun the two proofs."],
["partly", "idle-whisper-crash", "A Whisper crash while the page sits idle should be noticed before the mic is pressed.", [476],
 "Built tonight: `VoiceStrip` checks Whisper at page load and again whenever the tab becomes visible, and starts the recovery line if it is down.",
 "The always-on version is whisper-status-stream."],
["partly", "long-prompt-refine", "Refining a very long prompt should work.", [359, 368],
 "Built tonight: the Refine button sends the most recent 19,000 characters (`AISessionConversation.fit`) instead of failing at 20,000.",
 "Tell the reader on the button that the start was cut."],
["done", "whisper-working-live", "Local Whisper works, streams words in real time, continuous until stopped, with the 'Thank you' silence bug fixed.", [14, 40, 42, 45, 47, 50, 140, 154, 155],
 "`audio/Whisper`, `ux/Dictate`, [silence.md](/framework/ux/Dictate/doc/silence.md); Servex restarts Whisper itself in about 2 s ([voice-verify](/framework/ai/2026-10-12/voice-verify/STATE.md))."],
["done", "mic-ui", "Switch microphones, test them, mic feedback and a level meter, stop after silence, a recording workspace.", [8, 43, 49, 53],
 "`audio/MicPicker`, `LevelMeter`, `Recorder`, the Dictate `Widget`."],
["done", "dictate-extraction", "A framework `audio/` separate from dictation, a Whisper class, a whisper log class, Dictate as an extension.", [44, 147, 543],
 "`public/framework/audio/{Whisper,Transcriber,Voice}`, `ux/Dictate/WhisperLog.js`."],
["done", "cards-from-words", "Transcription shows as cards immediately, grouped, with author and confirmation.", [25, 26, 51, 52, 55],
 "The AI board and the session page stages (`ext/Refine/stages`)."],
["done", "voice-on-session-page", "Raw, clean, structure, refined and cards stream onto the session page live, on desktop and phone.", [17, 18, 19],
 "[voice-to-session-page](/framework/ai/2026-10-12/voice-to-session-page/STATE.md), [voice-verify](/framework/ai/2026-10-12/voice-verify/STATE.md): raw at the first words, the rest about 6.4 s after Refine."],
["done", "refine-button-things", "A Refine button on one prompt, cards with importance and confidence, named modules shown as link cards while you speak.", [360],
 "[refine-asks](/framework/ai/2026-10-12/refine-asks/STATE.md)."],
["done", "chat-layout-fixes", "Dictate page layout, the 3440 version, flicker, the 'go on' filler, the abort error, the mobile rail.", [297, 325, 329, 343, 348],
 "[decisions.md](/framework/ux/Dictate/doc/decisions.md), [widget.md](/framework/ux/Dictate/doc/widget.md)."],
];
const rows = C.map(([status, name, ask, ids, state, next]) => {
  const g = ids.map(i => by.get(i)).filter(Boolean);
  const srcs = [...new Set(g.map(t => sid(t.src)))], dates = g.map(t => t.at).sort();
  return { status, name, ask, n: new Set(g.map(t => t.id)).size, first: dates[0]?.slice(0, 10), last: dates.at(-1)?.slice(0, 10), srcs, state, next };
});
const line = r => `- **${r.name}** (${r.n}x, ${r.first} to ${r.last}): ${r.ask}\n  - Now: ${r.state}${r.next ? `\n  - Next: ${r.next}` : ""}\n  - Sources: ${r.srcs.slice(0, 5).map(s => B + s + B).join(" ")}${r.srcs.length > 5 ? " +" + (r.srcs.length - 5) : ""}`;
const sect = (st, h) => `## ${h}\n\n` + rows.filter(r => r.status === st).sort((a, b) => b.n - a.n).map(line).join("\n") + "\n";
const md = `# Transcription asks, merged (2026-10-12)

What the owner asked about the voice pipeline (Whisper, clean transcript, structure, refined prompt, cards on the session page, phone use), repeats folded together. Open first, most-asked first. Generated by ${B}ai/2026-10-12/asks-transcription/gen.mjs${B} from ${new Set(tags.map(t => t.id)).size} tagged prompts (578 candidates; scripts reused from [asks-by-module](/framework/ai/2026-10-12/asks-by-module/STATE.md)). Status was checked against readmes, role tables and file listings, not every line of code. Sources are the first 8 characters of a session id. Only 45 of ${tags.length} Haiku quotes were found verbatim, so counts are a floor.

Walk through it yourself: [try-it.md](try-it.md).

${sect("open", "Open")}
${sect("partly", "Partly done")}
${sect("done", "Done (short)")}`;
fs.writeFileSync(root + "/public/framework/ux/Dictate/doc/asks.md", md);
console.log("clusters", rows.length);
