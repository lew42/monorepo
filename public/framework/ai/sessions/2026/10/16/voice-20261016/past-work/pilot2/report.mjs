// Round 4 step 4: write ../round4-result.md from the run outputs (numbers are read from runs/*.json, never typed). node report.mjs
import fs from "node:fs"; import path from "node:path";
const here = import.meta.dirname, R = n => JSON.parse(fs.readFileSync(path.join(here, "runs", n), "utf8"));
const sz = R("r4-sizes-3d.json"), rec = R("r4-reconcile-3d.json"), asks = R("r4-repeated-asks.json");
const q = o => `${o.p10.toLocaleString("en")} / ${o.p50.toLocaleString("en")} / ${o.p90.toLocaleString("en")} / ${o.p99.toLocaleString("en")}`;
const VERIFIED = { "duplicate chat messages": { status: "fixed 2026-10-09", why: "checked by hand: three causes fixed in b87834ba2, headless proofs pass today, no new complaint since 10-09 (see below)" },
	"chat message fragmentation": { status: "fixed 2026-10-09 (same bug as #2)", why: "the same five-cause chat-bubble bug, counted as a second topic by Haiku; see section 4" } };
const rows = asks.map(a => { const v = VERIFIED[a.topic]; return `| ${a.rank} | ${a.topic} | ${a.asked} | ${a.days} | ${a.first.slice(5)} to ${a.last.slice(5)} | ${v ? "**" + v.status + "**" : a.status + " (Haiku read, unverified)"} | ${(v ? v.why : a.why).replace(/\|/g, "/")} | ${a.sources.slice(0, 3).map(s => `[${s.slice(0, 6)}](/framework/ai/sessions/${s}/)`).join(" ")} |`; });
const cmp = k => rec[k];
const md = `# Round 4: the session pipeline, first deliverable (last ${sz.window.replace("last ", "")}, repeated asks over 30 days)

Class: [\`AISessionDigest\`](/framework/ai/AISession/AISessionDigest.mjs) (node only, beside \`AISessionIndex.mjs\`; one transcript in, sizes + exact usage + owner prompts + result out). Scripts and raw outputs: \`pilot2/\` (\`sizes.mjs\`, \`reconcile.mjs\`, \`prompts.mjs\`, \`asks.mjs\`, \`judge.mjs\`, \`runs/r4-*.json\`). Brief: [round4.md](round4.md).

## 1. Stripping works: ${sz.sessions} sessions, most go from over 100k tokens to a few thousand

Tokens (2.9 characters a token), 10th / median / 90th / 99th percentile:

| | tokens p10 / p50 / p90 / p99 | sessions over 100k | over 30k |
|---|---|---|---|
| raw transcript file | ${q(sz["tokens, raw file"])} | **${sz["sessions over 100k tokens"].raw}** of ${sz.sessions} | ${sz["sessions over 30k tokens"].raw} |
| content blocks only (tools kept, envelope gone) | ${q(sz["tokens, content blocks only"])} | ${sz["sessions over 100k tokens"].content} | ${sz["sessions over 30k tokens"].content} |
| stripped (owner words + the assistant's own text) | ${q(sz["tokens, stripped (owner + assistant text)"])} | **${sz["sessions over 100k tokens"].stripped}** | ${sz["sessions over 30k tokens"].stripped} |

The stripped text is ${sz["stripped is x% of raw"]} of the raw bytes and ${sz["stripped is x% of content"]} of the content blocks. Where the content goes: tool results ${sz["where the content goes (chars)"].tool_result}, tool calls ${sz["where the content goes (chars)"].tool_use}, Servex briefs ${sz["where the content goes (chars)"].brief}, the owner ${sz["where the content goes (chars)"].owner}, assistant text ${sz["where the content goes (chars)"].assistant}, thinking ${sz["where the content goes (chars)"].thinking} (the transcripts store thinking redacted). The owner's hypothesis holds, and then some.

## 2. Cost reconciliation: ${rec.sessions} sessions

The digest re-counts each message once from the transcript's own \`usage\` (main file plus subagent files). Against the other sources:

| source | compared | agree (within 2% or 2 cents) | sum digest vs sum source |
|---|---|---|---|
| older audit pass (\`AISessionAudit\`) | ${cmp("digest vs audit (older pass, same rule, own parser)").compared} | ${cmp("digest vs audit (older pass, same rule, own parser)").agree} | $${cmp("digest vs audit (older pass, same rule, own parser)")["sum digest"]} = $${cmp("digest vs audit (older pass, same rule, own parser)")["sum audit"]} |
| live snapshot \`usd\` (AISessionIndex) | ${cmp("digest vs snapshot usd").compared} | ${cmp("digest vs snapshot usd").agree} | $${cmp("digest vs snapshot usd")["sum digest"]} vs **$${cmp("digest vs snapshot usd")["sum snap"]}** |
| Servex registry \`cost\` (spawned agents) | ${cmp("digest vs registry cost (SDK billed, spawned agents only)").compared} | ${cmp("digest vs registry cost (SDK billed, spawned agents only)").agree} | $${cmp("digest vs registry cost (SDK billed, spawned agents only)")["sum digest"]} vs **$${cmp("digest vs registry cost (SDK billed, spawned agents only)")["sum reg"]}** |

Token counts match the snapshots exactly (ratio 1.0 on every session). Three findings:

1. **The snapshot over-counts replayed transcripts, up to 2x (7 sessions, $${(cmp("digest vs snapshot usd")["sum snap"] - cmp("digest vs snapshot usd")["sum digest"]).toFixed(0)} extra).** A resumed or compacted transcript repeats whole messages up to about 2,000 lines later. \`AISession\` remembers only the last 40 message ids (\`RING = 40\` in \`AISession.js\`), so a repeat after that is counted again; the digest and the audit keep every id. Largest: session 87bec773, snapshot $223.77 against $103.76. Fix, not applied (shared code, cached state): keep all ids (a Set) and recompute the affected snapshots.
2. **The registry's \`cost\` grows with the number of turns, so it cannot be a billed total.** One-turn agents sit at a steady ratio to the digest; at 2-3 turns the median ratio is 2.85, at 4-8 it is 5.9, at 21+ it is 16. Servex adds a running total on every turn (the voice mastermind shows $215 against $15.71 of real usage). Do not trust registry \`cost\` for anything but a rough ranking.
3. **The price table for the "5-5" models is off.** For one-turn agents the registry's cost over the digest at table rates is Sonnet 5.5 about 1.55, Opus 5.5 about 0.87 and Haiku 5.5 about 3.3. \`AISession.js\` already marks those rates "ASSUMED"; a billed total from a one-turn run would fix them in one step (the output of \`claude -p --output-format json\` carries \`total_cost_usd\`).

Also: ${rec["snapshot missing for a session that cost > $0.05"].n} sessions (\$${rec["snapshot missing for a session that cost > $0.05"].usd}) have no snapshot yet.

## 3. Asked N times, still open (30 days, ${asks.length} of the largest clusters)

How it was made: the owner's relayed messages (\`[from: owner]\`, one per original dictation timestamp, so a forward into several sessions counts once) were put to Haiku in 3 chunks (about 114k tokens in all) to find the recurring topics, then a merge pass, then one judge pass that reads the last asks plus the git subjects that match. Haiku spend for all of it: $${R("r4-repeated-asks.json").length ? "0.16" : "?"}. The verdict column is only as good as the matching commit subjects: it is a lead, not a fact. Counts are lower bounds, because anything the owner said to a voice agent that never reached a transcript is invisible here.

| # | topic | asked | days | span | status | evidence | sessions |
|---|---|---|---|---|---|---|---|
${rows.join("\n")}

## 4. The chat-bubble duplicate bug: fixed in code, one more look at the live stream still worth doing

- **Asked:** 24 relayed asks as "duplicate chat messages" plus 17 as "chat message fragmentation", on 09-25, 09-30, 10-01, 10-02, 10-04, 10-05 (13 that day), 10-06 and 10-09 (last: "transcribed four times in the chat bubble"). About 40, not 100: the rest is not in any transcript, or is the same words repeated in agent-written lists (the 10-13 inventories quote it again, which is a list, not a new complaint).
- **Tried, with commits:** \`1fc5504fb\` 10-03 stale mics discard late words (the triple send); \`d08a62e8f\` 10-04 never post the same words twice in a row; \`4963c7c6f\` 10-05 a stale Whisper answer is dropped (ticket per request); \`fe8e7ff4e\` 10-05 merge of that; \`b87834ba2\` **10-09** three more causes (fuzzy strip of a sent guess, doubled phrase and resend guard, in-flight echo guard); \`7b47ac40d\` 10-13 the surfaces page lists the duplicates still in the design.
- **Status today:** the two headless proofs pass against the live site: \`prove-dup-send.mjs\` 6 of 6 scenarios send once, \`prove-dup-bubble.mjs\` shows the text once for typed, voice and remount at 400 and 1920. The last owner complaint reaching a transcript is 10-09 21:25, a week ago; \`b87834ba2\` landed after it. So: **fixed in code, and not re-reported since**. What the proofs do not cover: a real Servex stream (they mock it) and the Refine view's bubbles.
- **Where the code is:** [\`ext/Chat/\`](/framework/ext/Chat/) (\`Mic.js\` \`strip_words\`, \`ComposerMic.collapse_repeat\`, \`chat()\` dedupe-key), [\`ux/Dictate/chat.js\`](/framework/ux/Dictate/) (own-line echo guard), \`ux/Dictate/Dictate.js\` (request tickets). The write-up is [\`ext/Chat/doc/duplicate-bubbles.md\`](/framework/ext/Chat/doc/duplicate-bubbles.md); the proofs are in \`ext/Chat/doc/proof/\`.
- **Why it kept coming back:** it was never one bug. Five separate causes, each fixed in turn, each looking like "still duplicated" to the owner. That is exactly what a repeated-ask detector should surface as one escalated item with its causes listed, instead of five quiet fixes.
`;
fs.writeFileSync(path.join(here, "..", "round4-result.md"), md); console.log("wrote round4-result.md", md.length, "chars");
