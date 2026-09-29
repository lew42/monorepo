# Design the `Source` class for the site's source library: one web page an agent found (documentation, source code on GitHub, an article), already converted to markdown and saved once under public/framework/sources/<topic>/, listed in an index.jsonl there, so any other agent can read it quickly and cite it. It needs at least: the url, what kind of page it is, how authoritative it is, and the path of its markdown file. House style: plain ES classes, assign-based constructors (`constructor(o){ Object.assign(this, o) }`), small methods, parts as static subclasses. Read public/framework/ai/2026/09/28/agent-work-on-every-page-sanity-checks-c/design.md (the 'Added' section) for where it fits.

**Winner:** haiku-c — `public/framework/ai/2026-09-28/collab-rounds/design/collab/haiku-c/4-cross-review.md`
**Rule:** most votes
**Run cost:** $1.5648

## Votes
- haiku-c: 1 vote(s), $0.5319

## Caveats
- haiku-a: haiku-c's Authority.guess domain allowlist is brittle and will silently default to 0.50 for most unknown docs sites; should switch to a domain-pattern approach like haiku-a's (includes + tier adjustments) to be extensible
