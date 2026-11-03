# <Tool name>

`id: <id>` · category: `<category>` / `<subcategory>` · kind: `<tool|platform|protocol|pattern>` · status: `<status>` (<date>) · license: <SPDX>

Profile by <agent-name>, <YYYY-MM-DD>. Sources are linked inline; **Inference:** marks judgment.

## What it is

One or two plain sentences: what it does, and for whom. Then one line on what makes it different from the others in its subcategory.

## How it works

Keep only what matters for choosing it. Short lists.

- Data model: ...
- One change looks like: ...
- Persistence: where and how state is stored, snapshots and compaction.
- Transport: the wire protocol and who talks to whom.
- Runtime: where the server part runs (Node, Workers/Durable Objects, Go binary, hosted only).
- Client use from plain JS: ESM or script tag without a bundler? Framework bindings required?

## Group-by positions

The axes listed for this category in taxonomy.md, one line each: option, then why, then the source. Skip axes that do not apply; write "unclear" with a reason rather than guessing.

- authority: `<option>` (why, source)
- conflict: `<option>` (...)
- change-format: `<option>` (...)
- ...

Features (tags from taxonomy.md section 6): `realtime`, `offline`, ...

## Pairs with

- `<id>`: why (source)

## Alternatives

Substitutes: you would pick one of these instead.

- `<id>`: how it differs, and when you would choose it (source)

## Avoid with

Genuine conflicts only: two owners of the same state, a runtime mismatch, or the wrong data shape.

- `<id>`: the reason (source)

## Adopters

- **<Name>**: how they wire it (server, store, glue they wrote). (source; say if it is a vendor case study)

## Status

- Latest release, date, cadence; maintainers or company; acquisitions, shutdowns, successor (sources).
- License, from the LICENSE file when GitHub says NOASSERTION (source).

## Fit for lew42

**Inference:** one short paragraph. What the owner's framework (vanilla-JS Item/List/Page objects, get/set change events, append-only JSONL delta logs, WebSocket streaming, Cloudflare-leaning, no bundler) would gain by adopting it, what it would lose or need to adapt, and whether to adopt it, borrow its ideas, or skip it.

## Lessons

One to three mechanisms worth copying or avoiding, each with a code link at a commit.

- **<mechanism>**: what it does and why it matters ([file#Lx-Ly](https://github.com/OWNER/REPO/blob/<sha>/path#Lx-Ly))

## Gaps

- What could not be verified, and why.

## Sources

- Every URL used above, one per line.
