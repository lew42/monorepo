# Minion C: one chat widget, the same in the desktop drawer and the mobile sheet

Load the `minion` skill first, then `code`, `layout`, `css` before CSS.

**Read first, in full:** the owner's words, `public/framework/ai/2026-09-29/audio/owner-words.md` (the part starting "we need a, a consistent chat widget"), and the task brief `../requirements.md`, ask 6. The owner: "whether it's in a desktop sidebar or a mobile sheet … the height should be variable so that it could start small and grow to a maximum height and then be scrollable."

## Where you work

- Worktree `C:/Code/lew42/worktrees/qf-6` (branch `worktree/qf-6`), its server `http://127.0.0.1:54527/`. Write code ONLY there; commit by exact path. Don't merge.
- Your log: `C:\Code\lew42\monorepo\public\framework\ai\2026-09-29\audio\c-chat\task.jsonl` in the MAIN tree. Append with `node C:\Code\lew42\monorepo\.claude\hooks\append.mjs <file> <lines.json>`. Screenshots in `...\audio\c-chat\shots\` in the main tree.

## Your fence

- `public/framework/ext/Chat/**`
- `public/framework/ext/drawer/tabs/ai.js`, `ext/drawer/rail.js`, `ext/drawer/rail.css`, `ext/drawer/drawer.css`

Minion B will change ONE line in `tabs/ai.js` and `rail.js` (the line that builds the mic, to pass a refine level). Pull (`git log`) before you edit those two files and keep that line as B left it.

## What exists

- `ext/Chat/` has `chat()` (the scrolling log, smart scroll) and `Composer.js` (the input).
- The drawer's AI tab (`ext/drawer/tabs/ai.js`) builds its own chat from those. The mobile sheet (`ext/drawer/rail.js`, from task-mastermind-mobile-nav, landed today, see `public/framework/ai/2026-09-29/mobile-nav/`) builds its own: a live transcript plus "prompt item" cards.

## Deliverables

1. **One component**, `ext/Chat` exports it (name it with the `naming` skill, e.g. `ChatPanel`): the log plus the composer plus the mic, as one class with its view. The drawer's AI tab AND the mobile sheet both use it: same markup, same classes, same behavior.
2. **Variable height:** it starts small (just the composer and the last message or two), grows with its content up to a maximum (say 70vh in the sheet; the drawer's full height in the drawer), then scrolls inside, smart scroll kept. Pure CSS where possible (`max-height` + `overflow: auto`, no JS measuring).
3. **Keep v1 reachable:** the drawer tab's and the sheet's current builds stay available as their own variant class, and a page (`ext/Chat/` page.js children) shows v1 and the new one side by side.
4. The mobile sheet's existing features keep working (listening on open, prompt items, the drawer's tabs reachable from the rail).

## Done means

- Zero console errors and failed requests on `/framework/ext/Chat/`, `/framework/ai2/`, `/framework/`, and a page with the drawer open, on `http://127.0.0.1:54527`.
- Screenshots: the drawer at 1920 with 1 message and with 30 (proving small, then capped and scrolling); the sheet at 400, same two states. Headless Playwright only; never the owner's tabs.
- Every process spawn sets `windowsHide: true`. Stop every server you start.
- Land your task.jsonl with an `outcome` checklist of deliverables 1–4 with proof, then end your turn.

Budget: about $3. Sonnet.

## ⚠ Sibling work in flight (added by the task mastermind)

task-mastermind-mobile-nav still has UNMERGED commits on `worktree/mobile-nav` touching `ext/drawer/rail.js`, `rail.css`, `drawer.css`, `tabs.js`, `tabs/ai.js` (last one 18:16 today). So: build the component and its `ext/Chat/` page FIRST. Before you touch any drawer file, run `git fetch . ; git diff --stat michael/dev...worktree/mobile-nav -- public/framework/ext/drawer`. If it is empty (they merged), `git merge michael/dev` into qf-6 and wire the drawer. If not, message your parent (task-mastermind-audio) and wait for a go; don't edit around them.

## Update from mastermind-servex (18:23)

mobile-nav will merge after its one review and tell us; I'll pass the go to you. A later task (voice sessions) builds on your ext/Chat component and the rail, so keep the component's API small and write it down in `ext/Chat/readme.md` (constructor options, methods, events), one short block.
