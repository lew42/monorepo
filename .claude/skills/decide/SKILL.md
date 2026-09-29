---
name: decide
description: Run whenever a research round, a plan or a task reaches a decision — anything with options to choose between (which library, proxy or build, where it lives). The decision is written by Server/decide.mjs, a node tool that walks it step by step and refuses a missing part. The tool is the only way to write one; never hand-write a decision line.
---

# Decide

**A decision is written by `Server/decide.mjs`, never by hand.** The tool asks for each part in turn and refuses a decision with a part missing, so you don't have to remember the rules. Just follow what it prints as `next`.

## What a decision is

One simple, concrete question, with:
- a **rank** (1 = the most foundational; the owner decides those first),
- **two or more options**, each with at least one **caveat** (what it costs or risks),
- for each option, **the decisions that follow** if it is chosen: "choose A, then decide X and Y",
- a **recommended** option, a **confidence** from 0 to 1 (be honest: 0.6 means you're not sure), **why**, and **sources** (research ids or urls).

A decision that only matters when some option is chosen is created with `--depends-on <parent>:<option>`, **while the parent is still a draft**. A logged parent can't gain children. It is then drawn below its parent, under that option.

You recommend; you never decide. The owner decides by clicking an option on the card, which writes a `chose` line.

## The walk

```sh
node Server/decide.mjs create    --file <page.jsonl> --question "…?" --rank 1 [--depends-on d-x:option]
node Server/decide.mjs options   --file … --id d-… --option "…" --option "…"
node Server/decide.mjs caveats   --file … --id d-… --option <id> --caveat "…"
node Server/decide.mjs then      --file … --id d-… --option <id> [--child d-…]
node Server/decide.mjs recommend --file … --id d-… --option <id> --confidence 0.7 --why "…" --source <id>
```

Every call answers `{ok, next, missing}`. Keep going until you see `appended: true`. A refusal (`ok:false`) says what is wrong: fix that part and repeat the call. An unknown flag is refused too, with the list of flags that verb knows.

**Several at once is fine — pass JSON, never JSON-looking text:**
```sh
node Server/decide.mjs options --file … --id d-x --json '[{"id":"a","text":"Proxy it","caveats":["Unmeasured"],"then":[]},{"id":"b","text":"Build our own","caveats":["Costly"],"then":[]}]'
```
`--json` takes an array (the options, caveats or children of that verb) or an object with the flags' names as keys. `--options`, `--caveats` and `--then` also parse JSON (`--caveats '{"a":["…"],"b":["…"]}'`). Text that starts like JSON in `--option`, `--caveat` or `--why` is refused instead of being turned into an id.

**Where it goes:** the card's or task's `page.jsonl`. To show it, add one `{"place":{"module":"/framework/ux/Content/Decision/Decisions.js"}}` line.

Detail, the record's fields and the module API: [`Server/doc/decide.md`](/Server/doc/decide.md).
