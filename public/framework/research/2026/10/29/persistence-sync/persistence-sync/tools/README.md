# Tool profiles: instructions for profile agents

Each tool gets one profile file, `tools/<id>.md`, plus ops in your own op log. Profiles hold the research, so it survives in files rather than in agent context. Ops carry the tags the app filters on.

Read first, in this order:

1. `../../COORDINATION.md`: who writes what, op format, code-citation rules, web rules.
2. `../taxonomy.md`: categories and subcategories, decision axes, feature tags, status values, and the id map (section 7).
3. `_TEMPLATE.md` (this folder): the profile layout. Copy it to `tools/<id>.md`.

## Before you start a tool

- Take the id from the taxonomy id map. If the tool is not there, choose a kebab-case id, check that no op file uses it yet (`grep -h '"id": *"<id>"' ../data/ops/*.jsonl`), and list it as a new id in your final report.
- If `tools/<id>.md` already exists, continue it. Do not start over, and do not edit a profile another agent is still writing.
- Write the file skeleton (title, the "What it is" line, empty headings) in your first minutes, then fill it section by section. The workspace can restart at any time.

## What to research

Answer these, in this order of priority:

1. **What it is**, in one or two plain sentences, and which category and subcategory it belongs to.
2. **How it works**: data model, the shape of one change, how it persists, the wire protocol, where the server part runs. Keep it to what matters for choosing it.
3. **Group-by positions**: its option on each decision axis listed for its category in taxonomy.md. Leave out an axis that does not apply, and say "unclear" with a reason rather than guessing.
4. **Pairs with / alternatives / avoid with**, each with a one-line why and a source. Alternatives are substitutes; avoid-with is only a genuine conflict (two owners of the same state, runtime mismatch, wrong data shape).
5. **Adopters**: named users and how they wire it (which server, which store, what glue they wrote). Primary sources only: their repo, their engineering blog, or the vendor's case study (say which).
6. **Status and license**: last release, maintenance signals, acquisitions or shutdowns, the actual license file when GitHub says NOASSERTION.
7. **Fit for lew42**: what the owner's framework (vanilla-JS `Item` / `List` / `Page` objects, get/set change events, append-only JSONL delta logs, WebSocket streaming, Cloudflare-leaning, no bundler) would gain, lose or have to adapt. One short paragraph, marked as inference.
8. **Lessons**: one to three concrete mechanisms worth copying (or avoiding), with code links.

Depth: about 80-200 lines per profile. Headings and short lists; no wide tables.

## Where to look

- Start with the notes: `grep -n "<Tool name>" ../notes/*.md`, then read the matching sections. `../notes/adoption_metrics.csv` has repo, stars, downloads, last release and flags. Do not re-research what the notes already cite; link to the note.
- Then primary sources: official docs, READMEs, release notes, the source code.
- Code: clone into the shared clones folder named in COORDINATION.md (`.../scratchpad/repos/<owner>_<repo>`), reusing an existing clone. Cite exact lines at a commit: `https://github.com/OWNER/REPO/blob/<sha>/path#L10-L42`.
- Web: use WebSearch freely. Use WebFetch only on a URL that appeared in a search result or on a page you already fetched. Never fetch a URL you typed or remembered; search for it instead, or record it as a gap.

## How to cite

- Every factual line ends with a link: a URL, a code link at a commit, or a notes path such as `notes/sync_engines_crdts.md`.
- Mark your own judgments as **Inference:**.
- Vendor claims stay labelled as vendor claims. Secondary blogs are flagged as secondary.
- Put what you could not verify under "Gaps".

## Ops to append

Append to `../data/ops/<your-agent-name>.jsonl`, one JSON object per line, never rewriting a line. Every factual op carries `src`. Use only tags defined in taxonomy.md; if you need one that is missing, propose it in your final report.

```
{"op":"set","id":"yjs","key":"summary","value":"Embeddable CRDT library for shared maps, arrays and rich text; pure JS, binary updates.","by":"<agent>","at":"2026-10-30T02:00:00Z","src":"notes/sync_engines_crdts.md"}
{"op":"set","id":"yjs","key":"category","value":"crdt","by":"<agent>","at":"...","src":"..."}
{"op":"set","id":"yjs","key":"subcategory","value":"crdt-core","by":"<agent>","at":"...","src":"..."}
{"op":"add","id":"yjs","key":"layers","value":"client-state","by":"<agent>","at":"...","src":"..."}
{"op":"add","id":"yjs","key":"strategies","value":"conflict: crdt","by":"<agent>","at":"...","src":"..."}
{"op":"add","id":"yjs","key":"features","value":"offline","by":"<agent>","at":"...","src":"..."}
{"op":"add","id":"yjs","key":"pairs_with","value":{"id":"hocuspocus","why":"standard Node room server with persistence hooks"},"by":"<agent>","at":"...","src":"..."}
{"op":"add","id":"yjs","key":"alternatives","value":{"id":"loro","why":"CRDT with native movable lists and trees"},"by":"<agent>","at":"...","src":"..."}
{"op":"add","id":"yjs","key":"avoid_with","value":{"id":"prisma","why":"ORM writes to fields the live Yjs doc also owns diverge"},"by":"<agent>","at":"...","src":"..."}
{"op":"add","id":"yjs","key":"adopters","value":{"name":"Outline","how":"Hocuspocus + y-prosemirror; state in a Postgres column","src":"https://github.com/outline/outline/..."},"by":"<agent>","at":"...","src":"..."}
{"op":"set","id":"yjs","key":"status","value":{"id":"active","date":"2026-09-23","note":"v14 in beta since 2022"},"by":"<agent>","at":"...","src":"..."}
{"op":"set","id":"yjs","key":"license","value":"MIT","by":"<agent>","at":"...","src":"..."}
{"op":"add","id":"yjs","key":"sources","value":"https://docs.yjs.dev/","by":"<agent>","at":"...","src":"https://docs.yjs.dev/"}
{"op":"set","id":"yjs","key":"profile","value":"tools/yjs.md","by":"<agent>","at":"...","src":"tools/yjs.md"}
```

Rules for ops:

- Required for each profiled tool: `summary`, `category`, `subcategory`, `kind`, `status`, `profile`. Add `layers`, `strategies`, `features`, `pairs_with`, `alternatives`, `avoid_with` and `adopters` wherever the profile supports them.
- `strategies` values are `"axis: option"` strings using axes listed for the tool's category.
- Relations point at ids from the id map. When the other tool has no id yet, create its record with `name`, `kind`, `category` and `subcategory`, and list it in your report.
- Pair records both ways only when you have read both sides. Otherwise add the link on the tool you profiled, and the build shows it there.
- Cloudflare: never add a "cloudflare" tag. Put the link in `pairs_with` (for example, from `cloudflare-durable-objects` to `tldraw-sync`), and add the feature `runs-on-cloudflare-workers` where it is true.
- Never set `metrics`; the build merges them from the CSV.
- Never edit another agent's op file. To correct something, append a new op to your own file.

## Final report

When you finish, report briefly: which profiles you wrote, new ids you created, tags you needed that taxonomy.md lacks, and the biggest gaps.
