# The readme / documentation system: status check (2026-10-08)

Four places describe it. This page says what is true in each, checked against the code (`Servex/agents/readme-chain.js`, run on `public/framework/ai/2026-10-08/ai-system-docs`).

## What actually happens
- **Chain:** root `readme.md`, then every level down to the agent's directory that has one (`readme_chain(dir)`). A level with no readme is skipped. `CLAUDE.md` is not in it.
- **Cut:** each readme is cut to its first 40 lines, or up to its `## More` heading, whichever is first. So an agent never sees the rest of a long readme unless it opens the file.
- **Cap:** about 3,000 tokens in all. Over the cap the **middle** levels go first, then the root; the leaf stays. (Measured: root + `framework` + `ai` = about 2,300 tokens.)
- **Who gets it:** `Agents.spawn` for a fresh agent with a `task.dir` or a `page` (`Agents.js:173`), the card assistant and manager (`Layers.js`), `directory.js`, experts. **Not** Dispatcher-spawned task masterminds (no directory at spawn) and not plain minions; they rely on `load_module` and their brief.
- **It works.** Nothing is broken; the gaps below are about size and wording.

## Where the sources disagree (and what changed)
| Claim | Where | Truth |
|---|---|---|
| A readme is about 150 words, 20 to 30 lines | `documentation` skill | CLAUDE.md says under about 100 lines. The chain injects only 40. Skill now says so. |
| Over the cap, the most general readme goes first | docstring in `readme-chain.js`, `Servex/doc/readme-chain.md` | Code drops the middle levels first. The Readmes concept page was already right. Doc and comment fixed. |
| Every readme is read whole | iceberg rule, CLAUDE.md | Only the first 40 lines are injected. The root (73 lines) and `ai/readme.md` (95) lose their tails. Put the index first and the "when to load" line early. |
| Masterminds keep readmes fresh | skills | `mastermind` and `sub-mastermind` mentioned loading the chain, not keeping it fresh. A short section now sits in `mastermind`, `sub-mastermind`, `servex-mastermind` and `master-assistant`, linking [Readmes](/framework/ai/readmes/) and the `documentation` skill. Minions need not. |

## One source, with links
The chain code is the truth for what agents see; [Readmes](/framework/ai/readmes/) shows it live; the `documentation` skill says how to write them; CLAUDE.md holds the rule. Each now links the others. The System page lists "Readmes" and the "Documentation skill" in its second section.

## Open, not changed
- **Dispatcher spawns get no chain.** Fix belongs to the Servex owner: give them a directory when `task-placement` does.
- **40 lines vs the 100-line rule.** Either raise `FIRST_SCREEN_LINES` or write readmes index-first. The default taken here: index-first (no code change).

## Where each kind of file is shown on the site
Counted by searching `public/framework/**/*.js` for the file name. Zero or one hit means a blind spot.
| File | Shown on | Note |
|---|---|---|
| `task.jsonl`, `page.jsonl`, `requirements.md` | AI board, task pages, `ai/AITask` | well covered |
| `log.jsonl` (per module `ai/`), `v-*.jsonl` | Dictate and Session pages | [../design/module-ai-dirs.md](../design/module-ai-dirs.md) |
| `asks.jsonl`, `cards.jsonl`, `prompts.jsonl`, `usage.json` | `ai2` inbox and dashboard | few readers each |
| `spawns.jsonl` (a mastermind's list of what it spawned) | **nowhere** | blind spot: no page reads it |
| `heartbeat.jsonl` | **nowhere** by that name | blind spot: Servex writes it, the dashboard shows the heartbeat card only |
| `.summary.json` (voice session summary) | one reader | thin |
| `handover.md`, `findings.md` | linked from readmes only | reachable by link, not by a view |
Fix, small: link `spawns.jsonl` and `heartbeat.jsonl` from the System page's "Running now" section when a page for them exists; until then they are read by `curl` or the file tree.
