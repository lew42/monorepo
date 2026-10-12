# readme-chain proof

Run at 2026-09-29T20:35:00.600Z, private Servex on port 8196 (proxy 8195, internal 8194), scratch `C:\Users\mike\AppData\Local\Temp\readme-chain-proof-CC6Nqp`.

**PASS** — the test agent (`minion`, spawned with `page: "/framework/ux/Dictate/"` — a page-bound spawn, chosen over `task: {dir}` so nothing is written into the live module; both are read by the same `directory_of()`) received its readme chain, in order: root -> public/framework/ -> public/framework/ux/ -> public/framework/ux/Dictate/.

## What was expected, from disk

- root: found at character 75
- public/framework/: found at character 2266
- public/framework/ux/: found at character 4813
- public/framework/ux/Dictate/: found at character 7625

## The agent's actual first message

```
Where you are: readmes from the root down to public/framework/ux/Dictate/

readme.md (truncated — read the rest at this path)
# Lew42.com Framework Site

`npm install`, then `node Servex/sustain.mjs` and open `http://monorepo.localhost/` —
Servex holds port 80 and starts the site the first time you visit it (`Servex/readme.md`).

- Maintain static compatibility (server is just for local dev)
- No bundler or build (pure static hosting)
- Native ESM `imports`
- Simple `div()` view system with capturing
- No new npm dependencies (`chokidar`, `express`, `ws` are the dev server); `npx` and globally-installed tools are fine

## Cloudflare Previews

The current `main` branch is deployed at: https://monorepo.lew42.workers.dev/

Branches will be deployed at https://branch-name-monorepo.lew42.workers.dev/

Git branch names will have `/` converted to `-` for preview URLs, which is important here.  I want git branch names to be of the form `<yourname>/<branch-name>`, such as `michael/fix-whatever`, which will translate to `michael-fix-whatever-monorepo.lew42.workers.dev` (whew, yea, it's long).

## New Dev Onboarding:

My team has been invited to this repo as Collaborators.  If you accept, you should be able to:

1. Clone this repo (no need to fork).
2. You **cannot** push to `main` branch.
3. **Always** `git switch main` and `git pull` before creating a new branch.
4. Make a branch (`git switch -c <yourname>/<branch-name>`), use your name, like `michael/fix-whatever`.
5. Make a change, add, commit, and `git push`.  You should have push privilege, so it should work.
6. Cloudflare will automatically build your branch, and convert the branch name from `michael/fix-whatever` to `michael-fix-whatever` (notice `/` becomes `-`) and publish it at `michael-fix-whatever-monorepo.lew42.workers.dev`

## Again:

For every new task, we make a new `<yourname>/<branch-name>` git branch.  But first, we:
- `git switch main`
- `git pull`
- `git switch -c <yourname>/<branch-name>` to create a new branch
- `git add .` and `git commit -m "whatever"` and `git push`
- Cloudflare auto-builds the preview URL based on the branch name, send me the link.

Note, you'll either need to `git push -u origin <yourname>/<branch-name>` the first time, or you can set this:

public/framework/readme.md (truncated — read the rest at this path)
# Framework — everything it offers is organized, visual, browsable: find any thing by clicking through previews, and every layout works from mobile to 3440

## Index

- [core](./core/) — the seven classes under every page (View, Page, Router, App, Sidebar, Item, List)
- [ext](./ext/) — opt-in addons; core never imports them
- [ui](./ui/) — the template tier: components, one page each
- [ux](./ux/) — the behavior tier: classes you can extend
- [styles](./styles/) — the CSS strategy: four layers, one vocabulary
- [web](/web/) — the guide tier, live (it lives at `public/web/`, not in this folder; no readme here)
- [start](./start/) — three files, no build step, a working site (no readme yet)
- [faq](./faq/) — short answers, code first (no readme yet)
- [versus](./versus/) — how this compares with other choices (no readme yet)
- [util](./util/) — small plain helper functions (no readme yet)
- [dev](./dev/) — local-only live reload and the dev bar
- [research](./research/) — research programs shown live (no readme yet)
- [ai](./ai/) — the daily working log and task board
- [ai2](./ai2/) — the dictation timeline: cards left, one card right
- [audit](./audit/) — the 2026-08-15 doc audit, a dated snapshot
- [doc](./doc/decisions.md) — framework-wide decisions and doc-system notes (docs only)

## Use
```js /path/page.js
import { p } from "/app.js";
p("Hello world.");
```

## Watch out
- Capturing is synchronous: a factory call textually after an `await` appends to the wrong captor — capture the container first, fill it in a callback: [`core/View/doc/capturing.md`](/framework/core/View/doc/capturing.md)
- Every stylesheet restates the full `@layer base, theme, site, util;` and every rule sits in a layer — one short list silently reorders the cascade: [`styles/doc/cascade.md`](/framework/styles/doc/cascade.md)
- `core/` and `core/new/` both ship — a typo'd import path resolves to a same-named *different* class; `instanceof` fails, nothing throws: [`doc/decisions.md`](./doc/decisions.md)
- A POJO page whose key collides with a `Page` method (`render`) shadows it and returns nothing — `content()` is the seam: [`doc/decisions.md`](./doc/decisions.md)
- `instantiate()` is unawaited in the App constructor — a throw outside `load()` is a silent unhandled rejection: [`doc/decisions.md`](./doc/decisions.md)
- Rename freely inside `framework/`, alias on the way out — the sandboxes' `lib/` are downstream packages: [`doc/decisions.md`](./doc/decisions.md)

public/framework/ux/readme.md (truncated — read the rest at this path)
# UX — the behavior tier: `ui/` hands you markup, `ux/` hands you a class you can extend

## Index

Every module here, and what you would use it for.

- [Auth](./Auth/) — login, signup, password reset and a social-login row, as one class you can extend.
- [Content](./Content/) — cards that read and append to a `.jsonl` log: Question, Decision, Quotation, Spend.
- [Course](./Course/) — chapters of lessons with a side rail, a reading column and a next-up card.
- [Dictate](./Dictate/) — a microphone button that always shows what is happening and what it heard.
- [Filter](./Filter/) — a segment row plus a search box that filters several regions at once.
- [Menu](./Menu/) — a dropdown menu that closes after a pick and on an outside click.
- [Pagination](./Pagination/) — a row of page buttons that remembers the current page and drives real content.
- [Popover](./Popover/) — one popup anchored to a trigger, in the browser's top layer so no z-index fights it.
- [Tags](./Tags/) — a chip row where you add and remove tags.
- [Tree](./Tree/) — nested rows you can open, drag and drill into, from an array or a `Page`'s children.
- [Wizard](./Wizard/) — the generic multi-step engine that lessons, courses and signup extend.
- [doc](./doc/) — the tier's written rules: [system.md](./doc/system/) and [decisions.md](./doc/decisions/) (a docs folder, no readme).

A **ux** is a *workflow* — signup, login, a wizard, a course, a game lobby — assembled from
`ui/` templates and responsive from a phone to 3440. It is a class so that the next case is
a subclass, not a fork. Eleven live today, each its own real page under `/framework/ux/` — the
index is a wall of cards, never a tab strip (2026-09-22).

|  | [`ui/`](/framework/ui/) | `ux/` |
|---|---|---|
| is | html + css templates | classes |
| has | no listener, no state, no lifecycle | all three |
| you get | markup, with a copy button | an instance, and every method is a seam |
| a variant is | a child page — a different **thing**, not a different value | a named subclass — `class CardHero extends Card` |
| today | 20 components | 11 — [Auth](/framework/ux/Auth/) · [Wizard](/framework/ux/Wizard/) · [Tree](/framework/ux/Tree/) · [Course](/framework/ux/Course/) · [Filter](/framework/ux/Filter/) · [Menu](/framework/ux/Menu/) · [Pagination](/framework/ux/Pagination/) · [Tags](/framework/ux/Tags/) · [Dictate](/framework/ux/Dictate/) · [Popover](/framework/ux/Popover/) · [Content](/framework/ux/Content/) |

## Use

The graduation rule, in one line: **a template graduates when something has to be remembered
between renders.**

```js
// ui/  — a template. A handler at the CALL SITE does not make it behavioral.
div.c("surface pad flex v gap", () => { h3("View"); p("…"); });

public/framework/ux/Dictate/readme.md (truncated — read the rest at this path)
# Dictate — a mic button that always shows what is happening

State = which engine is listening and what it has heard so far, remembered between
renders — the graduation rule `Filter` and `Tags` already followed, applied to a
microphone. Built 2026-09-19 to replace `ext/Ask/mic.js`'s button, whose failures were
silent: the owner pressed 🎤, the browser's own recording light came on, and nothing
ever appeared — no error, no clue why.

## Use

```js
import Dictate, { dictate } from "/framework/ux/Dictate/Dictate.js";

new Dictate({ $input: () => this.$box, on_error: e => this.say(e) });
// or the drop-in shape ext/Ask/mic.js's mic() used:
dictate(() => this.$box, { on_start: () => this.open() });

// no box at all — just the finished words, one segment/result at a time:
new Dictate({ on_text: text => … });
```

`$input` may be a function (the box may not exist yet when the button is built — a
control usually draws its buttons above its box) or the box itself. Whatever was
already typed stays put; dictation lands after it.

**`mode: "open"`** — the live open mic (`talk`, AI 2's composer): the mic stays on
indefinitely, `on_text` fires once per finished sentence with nothing ever written into
`$input`, and "stop after a pause" is hidden since nothing should stop it. See "Open mic"
in [`doc/decisions.md`](/framework/ux/Dictate/doc/decisions/).

## Voice → log

Every finished utterance also becomes a log entry, not just words on screen —
`{at, type: "prompt", by: "owner", text, via: "whisper"}` posted to Servex
(`http://127.0.0.1:8090/log/prompts`), falling back to the dev server's own append route
when Servex isn't up yet. See "Voice → log" in
[`doc/decisions.md`](/framework/ux/Dictate/doc/decisions/).

## Watch out

[You are Servex agent minion.]
Load the `minion` skill, then: Reply with the single word: done. Use no tools.
```
