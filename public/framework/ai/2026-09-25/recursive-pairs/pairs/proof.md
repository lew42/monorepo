# Pairs: proof

Every page can now have its own fast assistant and manager. The assistant is made on the first
message, stopped after 5 quiet minutes, and resumed or started fresh on the next one. A fresh
assistant starts at about 11k tokens instead of 60k.

Branch `worktree/recursive-pairs`, commits `1b6c230c` (base: the main tree's uncommitted Layers
work, carried over), `f3e2db25`, `72ecd6af`, `6e40a82d`, `b84fe810`. Unit tests:
`node Servex/agents/layers.test.mjs` → **38 checks passed** (20 before). Runs on a private
Servex (port 8290, own `SERVEX_HOME`, own `SERVEX_LAYERS_FILE`): [`proof.txt`](proof.txt) (the full
run, 6 idle minutes) and [`proof-cap.txt`](proof-cap.txt) (the cap and a recycle, Bash off). Script:
[`proof.mjs`](proof.mjs). Doc: `Servex/agents/doc/page-pairs.md`.

## The deliverables

- [x] **1. A pair for any page.** `record()` takes a card id or a page path; `/` gives
  `assistant-root` / `manager-root`; each record stores `parent`, the parent page's manager (a card's is
  `manager-root`). An old card record keeps its ids and session and gains `parent` when read.
  Unit checks "a pair for any page…" and "an existing card record keeps its ids…". Live: `/notes/`
  gave `assistant-notes`, `/framework/ux/` gave `assistant-ux`.
- [x] **2. The drawer interface.** `POST /api/page-ai`, `GET /api/page-agents`, and
  `public<page>ai/chat.jsonl`. The route appends the prompt line; the assistant replies with a new
  `page_reply` tool (it also takes a card id). CORS preflight answers `204`, `allow-origin *`.
  proof.txt: six pages each got a `{"message":{"by":"assistant-…","text":"ok"}}` line; `GET` for `/`
  and `/notes/` returned the row shape; an unknown page answered `404`.
- [x] **3. Created on first use.** `GET /api/page-agents?page=/notes/` before any send → `[]`, 0 claude
  processes. The first send started one assistant.
- [x] **4. Stopped after 5 idle minutes, at most 4 live.** proof.txt: 3 assistants idle, 694 MB, at
  270 s; at 300 s all three `stopped`, **0 claude processes, 0 MB**, session ids kept.
  proof-cap.txt: five pages in a row → 4 live, `assistant-notes` (least recently used) stopped,
  1,113 MB at the cap. Managers stop at 15 minutes (unit check "idle: an assistant stops after its
  limit, a manager only after its own"). Env: `SERVEX_ASSISTANT_IDLE_MS`, `SERVEX_MANAGER_IDLE_MS`,
  `SERVEX_MAX_ASSISTANTS`.
- [x] **5. Resumed or fresh, measured.** Resume when under 30k tokens and used within the hour,
  else fresh from the page's log (unit checks for all three cases). proof.txt: the stopped
  `assistant-notes` was resumed (`start: resume` in the servex log). **Times, send → reply:
  warm 2.3 s, resume 3.1 s, fresh 3.1 to 3.6 s (Opus root 3.9 to 4.1 s).** In the doc.
- [x] **6. Fresh, not compacted.** Past 40k (assistant) or 150k (manager) Servex sends one
  checkpoint request, recycles the agent once that turn ends, and its next start reads the log from
  the checkpoint line. Reuses `card_summary`, `recycle()` and the summary-aware `transcript()`.
  Unit checks "past the fresh line…" and "…restarts fresh from its checkpoint line". Live: a
  compacted assistant wrote its line, was recycled, and restarted fresh.
- [x] **7. The root assistant runs on Opus.** proof.txt: `assistant-root claude-opus-5-5`.
- [x] **8. Assistants may quick-edit.** `take_worktree`, `return_worktree`, `list_claims` are in the
  assistant's allowed tools, with `Bash` (to commit, `node Server/smoke.mjs`, `node Server/merge.mjs`).
  Not exercised end to end: `Pool.js` (take_worktree) is uncommitted in the main tree, not on this branch.
- [x] **9. `SERVEX_LAYERS_FILE`.** Unit check "SERVEX_LAYERS_FILE moves the state file"; both proof
  runs wrote only the scratch file.

## The proof items

- [x] Process count and MB before/after, 3 contexts, 6 idle minutes: **0 → 3 claude processes, 694 MB → 0, 0 MB.**
- [x] Resume and fresh start times: above.
- [ ] **One recycled assistant whose context begins under 10k: 10,867 with Bash (FAIL), 6,508 with
  `SERVEX_ASSISTANT_BASH=0` (PASS).** Bash's own description is about 5k tokens, and quick edits
  need it. The default keeps Bash; the owner can pick with that one variable.
- [x] `/api/page-agents` and `/api/page-ai` for a plain page and for `/`: above.

## Found on the way

- **A fresh assistant began at 56–68k tokens.** The account's claude.ai connectors (Figma, Drive,
  Docs: about 40k tokens of tool descriptions) and the auto-memory file load even with no settings
  files. Assistants now start with `ENABLE_CLAUDEAI_MCP_SERVERS=false`,
  `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`, every unused Servex tool denied, and four built-in tools.
  Managers and every other agent still carry the 40k; worth the same fix where they don't use Figma.
- **Every recycle was silently undone.** `sync()` copied a stopped agent's session id back into
  layers.json on the next sweep. Fixed: only running agents are copied.
- **For the mastermind at merge:** the main tree has uncommitted edits to `Layers.js`,
  `layers.test.mjs`, `layers-proof.mjs`; this branch contains them (commit `1b6c230c`), so the
  branch's copy can be taken for those three files. `Servex/agents/doc/layers.md` still says
  "10 minutes" (lines 35, 94, 107): outside this fence; it should point at `doc/page-pairs.md`.
- The first full run lost its private Servex about 10 s in, silently (empty stderr). Its parent was a Bash `run_in_background` job, the likely cause (not proven);
  started with a hidden `Start-Process`, it ran the full 6.6 minutes.
