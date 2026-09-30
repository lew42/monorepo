# decide.mjs — a decision, walked step by step

`Server/decide.mjs` builds one decision a step at a time, so a decision can't be written with a part missing. The AI does not have to remember the rules, because the tool checks them.

## The walk

| Step | Command | What it asks for |
|---|---|---|
| 1 | `create` | the question (one plain sentence, ending in `?`), the rank (1 = most foundational), `--depends-on parent:option` if this decision only matters when that option is chosen, and `--owner-only "<reason>"` if only the owner may pick (a key, money, something destructive) |
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
- **One truth for nesting: `depends_on`.** Creating a child with `--depends-on parent:option` adds it to that option's `then` while the parent is still a draft. A parent that is already logged is never rewritten, so a new child for it is **refused** ("create children while the parent is a draft, or drop and redo"). A `then` that names a child whose `depends_on` points somewhere else is refused too. So `then` can only repeat `depends_on`, never disagree with it. (The alternative was re-appending the parent with an updated `then`. It was rejected because it puts two versions of one decision in the log.)
- **Several parts at once.** `--json` takes an object with the same fields as the flags, or an array: for `options` the options, for `caveats` and `then` a list of `{"option":"a","caveats":[…]}` / `{"option":"a","then":[…]}`. `--options`, `--caveats` and `--then` parse JSON too; caveats and then also take an object keyed by option id. Each option can carry its own `caveats` and `then`.
- **Refused, not guessed.** An unknown flag is refused with the flags that verb knows. Text that starts like JSON (`[` or `{`) in `--option`, `--caveat` or `--why` is refused instead of being slugged into an id (that once made `[{"id":"a",…}]` one option called `idatextaidbtextb`). A refused call changes nothing.
- **Self-test:** `node public/framework/ai/2026-09-29/decide-tool/decide-selftest.mjs` drives the CLI against a throwaway log (17 checks).

## The record

`id, question, rank, options:[{id, text, caveats, then}], recommended, confidence, why, sources, depends_on, status, decided_by, owner_only, by, at`, plus `ask` (= question) and each option's `say` (= text) and `caveat` (= caveats joined). Those three extra fields let the older `Decision` view and collab's decision shape read the record without changes.

**Decided by default (the owner, 2026-09-29).** Nothing waits on the owner unless the decision is truly theirs — a key, money, something destructive. A finished decision is written `status: "decided"`, `decided_by: "system"`: the recommended option is the one the system already chose, and its siblings are the alternatives it considered, sitting right there with their caveats — "we did X; alternatives: Y, Z; if X fails, try Y" is the shape, not a separate field. Build the recommended path the same cycle; don't stop and wait for the card to be clicked.

Flag the rare decision that really is the owner's alone with `--owner-only "<reason>"` on `create` or `recommend` (e.g. `--owner-only "key"`). That one is written `status: "open"`, `decided_by: null`, `owner_only: "key"`, and stays open until a real `chose` line picks an option.

**A `chose` line always wins, either way.** `{"chose":{"decision","option","at","by"}}`, written when someone clicks an option on the card — the system's own default is just what shows before anyone has. The view treats the latest `chose` line for a decision as the decision and shows "Decided by <by>" — an owner's click reads as "Decided by owner", overriding the system's default the same way it overrides an open, owner-only one. `recommend` has no `--status` or `--decided-by` flag, so the same choice can't be recorded in two places that might disagree.

## As a module

```js
import * as decide from "../../Server/decide.mjs";
decide.verbs.create(file, { question, rank });   // every verb is (file, args) → {ok, …}; refusal throws DecideError
```

The `then` verb is the function `follow`. A module that exports a function called `then` counts as a promise, and `import()` would call it. `public/framework/ai/2026-09-29/decide-tool/seed-openrouter.mjs` is a complete example.

## Showing it

Add `{"place":{"module":"/framework/ux/Content/Decision/Decisions.js"}}` to a card's page.jsonl. It draws every decision in rank order. Below each decision's row of options, every option that leads to more decisions gets a full-width block labelled "If <option> → then decide:", holding its children. On an AI 2 card with `{"layout":"tabs"}`, this becomes a **Decisions** tab.

**Not a Servex tool yet.** Adding one would mean changing Servex/, and Servex has to restart to pick that up. The CLI and the module are enough for now.
