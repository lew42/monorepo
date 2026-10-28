# Shape: how legacy gets marked, guided and removed

One page. The census behind it is [notes.md](notes.md); the worked example is [migration-children-to-pages.md](migration-children-to-pages.md). The rule is `doc/rules.md` (ask 30): legacy that lingers is marked deprecated, gets a migration guide, and is then removed.

## The life of a legacy piece

1. **Mark.** One comment line on the definition, the same wording everywhere, so a search finds them all:
   `// DEPRECATED (YYYY-MM-DD): use <replacement>. Guide: <path>. Remove when: <condition>.`
2. **Guide.** A short markdown beside the seat or the module: old call, new call, the trap in the difference, a count of call sites, and whether a script can do the rewrite.
3. **Migrate.** A node script with a dry run and a manifest (CLAUDE.md "moves are scripted"), run in a worktree, one commit.
4. **Remove.** Only when the removal condition holds: zero live callers, docs no longer teach it, and no log in the repo still needs the reader.

A reader of an old **log line shape** (not an API) follows a fourth path: mark it, collect it into one named replay shim per class, and keep it until a scripted migration has moved the logs. Logs are history and are not rewritten by hand.

## The table

| Legacy piece | Defined at | Replacement | Mark today | Guide | Removal condition |
|---|---|---|---|---|---|
| `page.children` (Map shim) and `set children` | `core/Page/Children.js`, `Page.class.js:130-141` | `page.pages` (List), stub guard | none | [migration-children-to-pages.md](migration-children-to-pages.md) | 0 live callers (233 now); 38 doc lines rewritten |
| config key `children:` | `Page#declare`, `Page.class.js:271-308` | undecided (keep the word, or `pages:`) | none | guide section 6 | the word is decided, 471 uses migrated by script |
| `Item#locate`, the `at` routing key | `Item.js:128-137`, `190-206` | nested delta | "Compat only" | none needed | ~1,810 history lines migrated by script, then delete |
| `Store.address()` | `Store.js:236` | structured `from` on `move` | "Compat only" | none | `move` verb moved to structured paths |
| `ext/Saver`, `item.saver`, `Item.open(saver)`, `item.save()` | `Item.js:260-261, 359-363`, `ext/Saver/*` | `item.store` for logs; whole-document storage needs its own decision | none | to write | 24 importing files moved or the Saver is renamed as the whole-document store |
| Session pseudo-property lines (`chat`, `place`, `sent`, ...) | fall-through to `put` in `Session.js:125` | list deltas (`chat.add`) | none | `core/Session/doc/one-replay-plan.md` | the plan is built and history replayed through a shim |
| Task old fields and `replay_legacy` | `Task.js:536-545, 601-606` | per-field deltas | comments | readme `core/Task/readme.md:87` | 0 history logs need the state inference (not true today) |
| `Task#finish`, `finish` verb | `Task.js:442-443`, `32-33` | `complete` | "Old name, kept" | none needed | the 81 history lines migrated |
| `{"file":x}` | `Jsonl.js:61`, `Listing.js:20-30` | list deltas (folder rule) | none | to write once decided | the files-list shape is decided; current format until then |
| `List#each`, `List#children` | `List.js:67-70` | `forEach`, `items` | "Back-compat" | none | callers found by a typed search |

## What to do first (cheapest, no risk)

1. Add the one-line mark to the first five rows (comments only).
2. Add the log-reader clause to `doc/rules.md`.
3. Fix the readme lines that teach `page.children` and correct ask 12 in `requirements.md`.
4. Only then run the `children` codemod.
