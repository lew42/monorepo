# decide.mjs — a decision, walked step by step

`Server/decide.mjs` builds one decision a step at a time, so a decision can't be written with a part missing. The AI does not have to remember the rules, because the tool checks them.

## The walk

| Step | Command | What it asks for |
|---|---|---|
| 1 | `create` | the question (one plain sentence, ending in `?`), the rank (1 = most foundational), and `--depends-on parent:option` if this decision only matters when that option is chosen |
| 2 | `options` | at least two options. You can give them all at once. |
| 3 | `caveats` | at least one caveat for every option: what it costs or risks |
| 4 | `then` | for every option, the decisions that follow from it, or none (an empty list) |
| 5 | `recommend` | the recommended option, a confidence from 0 to 1, why, and at least one source |

Each call prints `{ok, id, next, missing}`, where `next` is the exact command for the next missing part. When a call fills the last part, the decision is checked and appended to the log as one `{"decision":{…}}` line (`appended: true`). Until then it waits as a draft in `decide-drafts.json`, next to the log. That file is deleted once no drafts are left.

A bad part is refused with a reason, `{ok:false, refused:"…"}`, and exit code 1. Examples: a question that is two sentences, a rank of 0, a confidence of 1.5, an option with no caveat, a `then` that names a decision that doesn't exist, or a `depends_on` that names a missing option.

```sh
F=public/framework/ai/2026/09/29/<card>/page.jsonl
node Server/decide.mjs create    --file $F --id d-host --question "Where should it run?" --rank 1
node Server/decide.mjs options   --file $F --id d-host --option "On this machine" --option "On a rented server"
node Server/decide.mjs create    --file $F --id d-port --question "Which port?" --rank 2 --depends-on d-host:on-this-machine
node Server/decide.mjs caveats   --file $F --json '{"id":"d-host","caveats":{"on-this-machine":["Only at home."],"on-a-rented":["A monthly bill."]}}'
node Server/decide.mjs then      --file $F --id d-host --option on-a-rented        # no --child: nothing follows it
node Server/decide.mjs recommend --file $F --id d-host --option on-this-machine --confidence 0.7 --why "…" --source r-123
node Server/decide.mjs list      --file $F          # ranked, nested tree, drafts marked
node Server/decide.mjs show d-host --file $F        # status <id> = just what's missing; drop <id> = discard a draft
```

- **Option ids** are the first three words of the text, slugged (`"On a rented server"` → `on-a-rented`). You can also pass your own `id`.
- **A child finds its parent.** Creating a decision with `--depends-on` adds it to that option's `then` while the parent is still a draft.
- **Several parts at once.** `--json` takes the same fields as the flags. `options` can carry `caveats` and `then` inside each option.

## The record

`id, question, rank, options:[{id, text, caveats, then}], recommended, confidence, why, sources, depends_on, status, decided_by, by, at`, plus `ask` (= question) and each option's `say` (= text) and `caveat` (= caveats joined). Those three extra fields let the older `Decision` view and collab's decision shape read the record without changes.

## As a module

```js
import * as decide from "../../Server/decide.mjs";
decide.verbs.create(file, { question, rank });   // every verb is (file, args) → {ok, …}; refusal throws DecideError
```

The `then` verb is the function `follow`. A module that exports a function called `then` counts as a promise, and `import()` would call it. `public/framework/ai/2026-09-29/decide-tool/seed-openrouter.mjs` is a complete example.

## Showing it

Add `{"place":{"module":"/framework/ux/Content/Decision/Decisions.js"}}` to a card's page.jsonl. It draws every decision in rank order, with each child inside the option that leads to it. On an AI 2 card with `{"layout":"tabs"}`, this becomes a **Decisions** tab.

**Not a Servex tool yet.** Adding one would mean changing Servex/, and Servex has to restart to pick that up. The CLI and the module are enough for now.
