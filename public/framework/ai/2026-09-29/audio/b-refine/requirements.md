# Minion B: refinement at levels, wired into the real dictate path, plus visibility into Whisper

Load the `minion` skill first, then `code`, `page`, `new-page`, `css` before CSS.

**Read first, in full:** the owner's words, `public/framework/ai/2026-09-29/audio/owner-words.md`, and the task brief beside it, `../requirements.md` (asks 2 (refinement), 4 and 5). Those words are the acceptance test.

## Where you work

- Worktree `C:/Code/lew42/worktrees/qf-6` (branch `worktree/qf-6`), its server `http://127.0.0.1:54527/`. Write code ONLY there; commit there by exact path. Don't merge.
- Your log: `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\audio\b-refine\task.jsonl` in the MAIN tree. Append with `node C:\Code\lew42\monorepo\.claude\hooks\append.mjs <file> <lines.json>`. Screenshots in `...\audio\b-refine\shots\` in the main tree.

## Your fence (write nothing else)

- `public/framework/ux/Refine/**` (new), and `ux` page.js `children:` (add `Refine` only)
- `Servex/agents/tidy.js` (extend; the default call must behave exactly as today)
- `public/framework/ux/Dictate/Dictate.js` (the `refine` option only), `ux/Dictate/playground/**`
- The callers you wire (deliverable 3): `ai2/compose.js`, `ext/drawer/tabs/ai.js`, `ext/drawer/rail.js`: only the line that constructs Dictate/Mic, to pass a level.

Minion A is building `framework/audio/` in the same worktree; don't touch it. Minion C is editing the chat widget in `ext/Chat/` and `ext/drawer/`; touch only the one constructor line named above in drawer files, and commit it quickly.

## Deliverables

1. **`ux/Refine`** (class `Refine`): text in, refined text out, at a LEVEL. Three levels to start, each a `{label, prompt, model}` that a caller can swap or add to: **clean** (near-raw: fillers, typos, punctuation only; this is today's `/api/tidy` prompt), **edit** (light: tightened sentences, same voice and informality), **summary** (heavy: summarized and organized into sections or points). Usable for prompts AND for writing (a blog post from rambling): show both on its page. Default view per the item-ui pattern (`static View`), `readme.md`, `page.js` with a live demo: paste or pick sample rambling, pick a level, see the result beside the source.
2. **Servex side:** `/api/tidy` (Servex/agents/tidy.js) accepts an optional `level` (or an explicit `system` prompt) and `model`; no level = today's behavior, byte for byte. Servex changes go live only after a Servex restart, which the task mastermind does at merge: until then prove it by importing `tidy()` in a node script with a real (cheap) call, or a fake `run_query`. The page must say plainly when Servex isn't answering.
3. **Wire it into the real dictate path** (ask 5): Dictate takes `refine: "clean" | "edit" | "summary" | false` (default false, so nothing changes for callers who don't ask). The raw text is always kept alongside the refined text (`on_text(text, {raw, level})` or similar; say which in the readme). Then pick the callers where it belongs (the AI 2 composer, the drawer's AI tab, the mobile sheet) and pass a level; log each choice as a `decision`.
4. **Visibility into transcription** (ask 4): extend the existing dictation playground (`ux/Dictate/playground/`; don't rebuild it) with (a) a **Chunks** view: each Whisper resend as a row: time, segment, how long Whisper took, and the text each revision returned, so you see the guess improving; and (b) **raw vs refined side by side**, with a level picker. Use the ▶ Sample session so it works with no mic. Each new view gets its own URL hash, as the tabs do now.
5. v1 stays reachable: `ux/Dictate/variants/v1` must still load unchanged.

## Done means

- Zero console errors and failed requests on `/framework/ux/Refine/`, `/framework/ux/Dictate/`, `/framework/ux/Dictate/playground/`, `/framework/ux/Dictate/variants/v1/`, `/framework/ai2/` on `http://127.0.0.1:54527`.
- Screenshots at 1920 and 400 of the Refine page and the playground's two new views.
- Every process spawn sets `windowsHide: true`. Stop every server you start.
- Land your task.jsonl with an `outcome` checklist of deliverables 1–5, each with its proof, then end your turn.

Budget: about $4. Sonnet.

## ⚠ Sibling work in flight (added by the task mastermind)

`worktree/mobile-nav` (unmerged) also edits `ux/Dictate/Dictate.js` (about 17 lines) and `playground/Playground.js` (3 lines), and the drawer files. Keep your Dictate.js change small and additive (a new option, a new method), don't reformat, and leave the drawer wiring (deliverable 3's drawer callers) for LAST: before it, `git merge michael/dev` into qf-6; if `git diff --stat michael/dev...worktree/mobile-nav -- public/framework/ext/drawer` is still non-empty, wire only `ai2/compose.js` and tell your parent the drawer lines are waiting.

## Update (18:23): HOLD on Dictate.js and the drawer

mobile-nav lands in michael/dev in about 30–45 minutes; until your parent says "go", don't edit `ux/Dictate/Dictate.js`, `ext/drawer/**`, `ai2/card.js` or `Server/plugins/Whisper.js`. Order: ux/Refine and tidy.js first, then the playground views, then (after the go and a `git merge michael/dev` into qf-6) the Dictate `refine` option and the callers. If you finish the first parts before the go, land what you have with the rest unticked and end your turn; I'll send you the go.
