# Minion brief: the three core voice bugs (the owner's 20:41–20:44 test)

Load the `minion` skill first. Your parent is **task-mastermind-one-dictation**. Work only in your served worktree, `C:/Code/lew42/worktrees/dictate-core`, which has its own server (the port is in `.worktrees.json` in the main repo, under `dictate-core`). These three bugs come first; nothing else goes in this merge.

**The evidence** is the owner's own session, read it first: `public/framework/ai/2026/10/01/remote-access-install-tailscale-on-pc-an/ai/v-pl3m2ih.jsonl` (68 lines). The owner was on a phone (host `10.0.0.135:8137`), mostly on `/framework/ux/Dictate/` with the ✦ sheet open.

## 1. No assistant replies (the smart assistant went silent for 8 minutes)
**What happened:** the smart assistant answered at 20:40:16 and 20:40:42. From 20:41:13 it spent ONE turn of 8 minutes (its transcript is `C:/Users/mike/.claude/projects/C--Code-lew42-monorepo/b58e7543-c665-44a6-8932-1b6bce68947f.jsonl`). It called `list_agents` (1.8 million characters, over the limit), grepped, then fought `dir_log`'s format twice. Its reply landed at 20:49:28. Everything the owner said in between waited behind it.
**The cause** is `Servex/agents/session-smart.md` rule 1: "Before you start any work, look at what is already running: the Servex tool `list_agents`…".
**Do:**
- Rewrite rule 1 so the smart assistant **answers first**: its reply to the owner is the first thing in every turn. It looks up in-flight work only when the owner's words are about work, and then from a small source (`public/framework/ai/asks.jsonl`'s last lines, or the newest `task.jsonl` line 1s), **never `list_agents`**.
- Give `dir_log` the right shape in the prompt (its error said "a log.jsonl line is ONE of session, task, decision"; the call that worked used `line: {decision: {...}}`), so it never takes three tries.
- Keep it short; the file is a prompt, so every line costs time.
**Prove:** quote the changed lines in your report. Prompt changes reach only NEW sessions; say so. Don't restart Servex.

## 2. "PAR" shown as a bubble
**What happened:** the fast assistant's new-paragraph marker is written as an invisible `{"para": {at, re}}` line (`Servex/agents/Sessions.js` around line 815). `ext/Session/Session.js`'s `entry()` passes it through as `{type: "para"}`, and `ux/Dictate/Widget.js`'s `Thread.draw()` splits a bubble on it. The owner still saw a bubble reading just "PAR".
**Do:** find the surface that draws it. Candidates: the ✦ sheet, the ☰ drawer's AI tab, a card's own chat on its `/framework/ai2/…` page, `ext/Chat/Chat.js`'s `draw()`, and `split_paragraph()` leaving an empty or label-only bubble behind. Fix it in the one shared place, so `para` never draws on any surface.
**Prove:** replay this exact session file, headless, through a stubbed Servex stream (see the scratchpad pattern below). Shoot the ✦ sheet at 400×800. No "PAR" or "para" text appears anywhere in the DOM.

## 3. The owner's lines DUPLICATED ("All right, I'm just gonna keep talking…" ×3)
**What happened:** look at 20:42:10–20:42:13 and 20:42:32–20:42:43. Each duplicate is the same text sent again `via: "text"`, from a DIFFERENT path (`/framework/ai2/2026/09/24/servex/`, `/framework/ai2/2026/09/24/prompt-mechanics-2/`). A `nav` line comes in the same millisecond, before each one. So a second `chat()` mount, whose `path` is another page, sends the owner's dictated words again as typed text. The likely mount is the ☰ drawer's own chat, which follows `drawer.page()` (`ext/drawer/rail.js`), or another composer whose box receives the same dictation and then sends it.
**Do:** find which mount re-sends, and why its box gets the words. Fix it so a dictated sentence is sent ONCE, by the mount whose mic is on.
**Prove:** headless at 400×800: the Dictate page, the ✦ sheet open, the ☰ drawer opened onto an ai2 page, and the mic on (fake device, stubbed Whisper). Count the `say` POSTs: each sentence is sent exactly once.

## 4. The sheet closed by itself while the mic kept listening
**What happened:** at 20:42:32 the owner asked "Why did it close?". The mic was still on (20:42:42: "Seems like the microphone's still listening"). The `nav` lines around it jump between `/framework/ux/Dictate/` and ai2 pages.
**Do:** find what closes the sheet: a nav from another mount, a route change, the drawer re-rendering, or `sheet-close-keep-mic`'s change in `ext/drawer/rail.js` (commit 1d85bd9b). Fix it so only the owner closes the sheet (✕, a drag down, the phone's back button).
**Prove:** headless at 400×800: open the sheet, start the mic, and dictate three sentences while the drawer moves between two pages. The sheet stays open throughout. Take shots.

## How to prove (headless only, never the owner's tabs, never `say()` into a real session)
Playwright: `import { chromium } from "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs"`, launched with `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream --autoplay-policy=no-user-gesture-required`. Stub Whisper with `page.route(/127\.0\.0\.1:8178|\/whisper\//)`. Stub Servex with `page.route(/127\.0\.0\.1:8090|servex\.localhost/)`: `api/sessions?` → `{ok, sessions: []}`; `api/session/(new|resume)` → `{ok, session, home, file}`; `api/session/say` → record the body and return `{ok, at}`; `/stream` → an event stream you feed with this session's lines. The parent's working example is `C:/Users/mike/AppData/Local/Temp/claude/C--Code-lew42-monorepo/dd951941-2d05-4031-ba90-41f089d9fb27/scratchpad/repro/repro.mjs`. Put the proof in `minion-core/proof.mjs` and the shots in `minion-core/shots/`, **400 wide only** (the mobile UI).

## Rules
- Commit by exact path; never commit `.jsonl` files. Don't merge to michael/dev; your parent reviews, smoke-tests and merges.
- End your turn with the commit hash, the `say` counts, and the shot paths.

