# Minion brief: write one module's doc/architecture.md

Load the `minion` skill first. Work in the worktree `C:\Code\lew42\worktrees\architecture-md-2` (never the main tree). Your module is named in your prompt. The owner's ask: "an architecture.md for each module… the conclusive decisions and why… alternatives and trade-offs… not 'the decision was reversed three times'… keeping context to a minimum for new agents: just tell them what they need to know" (task dir: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/architecture-md/`, requirements-2.md ask 4 one level up).

Read, in this order, and nothing else beyond what the code check needs:
1. `.claude/skills/documentation/architecture-template.md` (the shape and rules; follow it exactly).
2. The module's `readme.md` (Server: `Server/README.md`), its `doc/decisions.md` if present, and its other `doc/*.md` titles.
3. `node Server/ArchitectureCensus.mjs --decisions <module key>` run from the worktree: the `decision` lines from task logs that name the module (some may be off-topic; ignore those).
4. The module's main source file(s): **verify every decision against the code.** If the code does not do what a decision says, write what the code does and add a one-line `⚠` under that entry. Never copy a stale claim.

Write `<module dir>/doc/architecture.md` (under 80 lines; entries only for decisions that hold today; present tense; no dates, no "the owner said", no reversal history; each entry: Decided / Why / Instead / Detail link). Link targets use absolute site paths (`/framework/...`) or relative `./` paths for `.md` files. Then add `[`doc/architecture.md`](./doc/architecture.md) (decisions and why)` to the readme's `## More` line (create the line if none; keep the readme's other lines untouched). If the module has a `page.js` Doc with a `notes:` list, add `architecture` to it. If an architecture.md already exists, bring it to the shape only if it is off; never shrink a good one.

Fence: that module's `doc/architecture.md`, its readme `More` line, its page.js `notes:` entry. Nothing else. Do not touch ux/Dictate, core/Page/ext/Inbox, or the catalog page. Never delete or rewrite `doc/decisions.md`. Commit your files by exact path (`git add <paths>; git commit`, ending the message with `Co-Authored-By: Claude Code <noreply@anthropic.com>`) in the worktree when done, then end with a 3-line report: file, line count, any `⚠` code mismatches. Every Node spawn sets `windowsHide: true`.
