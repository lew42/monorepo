# Minion brief: the new-page process (a tool + short skills) and page.jsonl size

Load the `minion` skill first, then `code`, `new-page`, `page`, `documentation`, `content`. Card dir (the owner's raw words): `public/framework/ai/2026/09/29/the-page-system-layout-navigation-new-pa/`.

## The owner's words (acceptance test — read all of `public/framework/ai/2026-09-29/page-system/owner-words.md`)

> "When we create a new page, what needs to happen? ... I don't know if that should be a skill or a MCP uh, tool. Or just like a local tool definition. ... How do we structure our system so that we can lean into programmatic, reliable, like uh, data structures ... creating a new page is definitely a process that we need to master. and uh, thinking through, well, if it's a child page, thinking through the parent page's layout and visual hierarchy is super important."

> "in the documentation skill, maybe we just say the README is the text-based version. The main page should generally read the README to figure out what to put where, or to, like how to design the, the actual page."

> "the page.json L is sort of the source of truth for that page. I don't know if we have a... system for monitoring the size of those files. I don't know if purging is uh, something I've talked about before. ... That should all be documented in the, um, you know, on the page page."

## The decision already made (don't re-open it)

**Both, split by kind:** the reliable mechanics are a TOOL (a node function, exposed as the Servex MCP tool `create_page`, which already exists in `Servex/pages.js`); the judgement (think through the parent's layout and visual hierarchy first) stays in the SKILL, in words. Alternative rejected: a skill-only process (agents already miss steps, e.g. the parent link) or a tool that tries to choose the layout (judgement a function can't make).

## Where you work

Worktree `C:\Code\lew42\worktrees\page-system-929` (branch `worktree/page-system-929`, server http://localhost:51061/). Edit ONLY there. Commit by exact path when it works. Another minion is building `core/Page/navigation/` in the same worktree — don't touch its files.

**Fence:**
- `Servex/pages.js` — only the `create_page` tool (and a small helper beside it).
- `Server/page-size.mjs` (new) — the size check.
- `public/framework/core/Page/doc/page-jsonl.md` (new) — page.jsonl as source of truth, its size, the check, the purge proposal.
- `.claude/skills/new-page/SKILL.md`, `.claude/skills/page/SKILL.md`, `.claude/skills/documentation/SKILL.md` — targeted edits only, each skill kept as short as it is now or shorter.

## Deliverables

1. **`create_page` does the whole mechanical job reliably.** Today it makes the folder + `page.jsonl` line 1 + the parent link. Add: a required `description` (one sentence) written into line 1; a `readme.md` stub written beside it (`# <title> — <description>` then the index shape headings the documentation skill names); an empty `doc/` is NOT created (a doc dir appears when there is a doc). Its return value adds **the parent's context** so the calling agent must look at it before filling the page: the parent's title, layout words (as `read_page` reads them), its sibling names, and the url of the parent's readme. Keep it one function, no new dependency. Don't break existing callers (a missing `description` → a clear error message naming the field, which is how the tool teaches). Test it: call the handler from a node script (in the session scratchpad, named `page-system-create-test.mjs`) against the WORKTREE root (`root` arg) under a throwaway parent, check the files, then delete the throwaway files and revert any parent edit. Paste the output in your reply.
2. **`Server/page-size.mjs`** — lists every `page.jsonl` under `public/` over a threshold (default 100 KB, `--kb N`), largest first, with line count; `--json` for machines; exit 0 always (a report, not a gate). Nothing is purged automatically. Run it on the MAIN tree (`--root C:\Code\lew42\monorepo`) and paste the result.
3. **`core/Page/doc/page-jsonl.md`** — one topic: page.jsonl is the page's source of truth (line 1 builds it, each later line calls one method; files and folders that appear under the page get a line); what exists for size today (the check above, nothing else); the numbers from deliverable 2; and a **purge proposal** marked as a proposal: e.g. when a file passes N KB, fold the old lines into a snapshot line (`{"snapshot": …}`) and move the raw lines to `page.<date>.jsonl` beside it — name the trade-off (history stays on disk, reading stays fast). Also name the friction the inventory found: live servers append `page.jsonl` lines that agents then sweep into unrelated commits (inventory C row "CMS page.jsonl visit-log"). Short, plain sentences.
4. **The skills, kept short:**
   - `new-page`: replace the hand steps with "call `create_page` (it makes the folder, page.jsonl, parent link and readme; read the parent context it returns)"; keep the traps that still apply to hand-made `page.js` pages, trimmed.
   - `page`: step 2 gets one line: **a child page starts from its parent** — read the parent's layout and visual hierarchy (what `create_page` returns) and decide where this page sits in it before choosing its own layout.
   - `documentation`: one short paragraph: **the README is the text version; the rendered page is the navigational, structured version (modules, clickable structure) and is designed FROM the README. Short-term duplication between them is acceptable.** Reference the readme-as-content example being built by task-mastermind-module-experts at `/framework/core/Page/make/readme-page/` (link it even if it lands later).
5. Log in the reply which traps you removed from `new-page` and why (one line each).

## Proof

- The test script output (deliverable 1) and the size report (deliverable 2), pasted.
- `node --check Servex/pages.js` and `node --check Server/page-size.mjs` pass.
- Every spawn sets `windowsHide: true`. Do NOT restart Servex; I do that at merge.
- Budget: about $3.

Reply with the commit hash and a checklist of deliverables 1–5, proof beside each. Then stop.
