# Page doc audit recommendations

## decisions.md: archive

- why: A historical record marked "conclusive, not current guidance" (2026-08-17). Architecture.md explicitly names it as "older history" and supersedes it; the newer record is there. Still heavily linked as a reference, but its content is captured in architecture.md's Decisions section.
- replaced by: `public/framework/core/Page/doc/architecture.md`
- linked from: architecture.md, columns.md (2x), data-children.md, watch-out.md (4x), property/related.md, file/readme.md.md, expert.json
- stale: none found (all referenced decisions are still valid, they've just moved)

## page-jsonl.md: archive

- why: A stub file (3 lines) that says it moved to jsonl/doc/size.md in 2026-08-17. The real content lives in that location; this file is only a redirect. Streaming.md still points here, but the canonical home is clear.
- replaced by: `public/framework/core/Page/jsonl/doc/size.md`
- linked from: streaming.md (says "see page-jsonl.md" and also "jsonl.md")
- stale: none found

## navigation.md: keep

- why: Thin, current index of the children-and-routing topic. Mirrors the readme's Navigation section but with direct links to the detailed docs. Note: expert.json logged it as "too-much" (loaded but unused in a proof), but the file itself is already minimal and serves as a topic gateway.
- linked from: readme.md, expert.json, old/readme-v1.md
- stale: none found (all linked files exist)

## composition.md: keep

- why: Current, unique, and concise statement of the rule ("a thing has a page; it is not one"). Distinct from other docs; captures an important design constraint about reference vs. inheritance. Under 11 lines.
- linked from: readme.md
- stale: none found

## layout-overview.md: archive

- why: An older pointer page. The layout/readme.md is now the canonical index (marked "the rendered page is designed from this file: this is the text version"), with more detail and live structure. Expert.json logged this as "too-much" (loaded but unused). The five concepts it names are all explained in layout/readme.md's "Core concepts, top down" section.
- replaced by: `public/framework/core/Page/layout/readme.md`
- linked from: layout/readme.md (lists it as "class-side pointer page"), layout/doc/prior-work.md, old/readme-v1.md
- stale: none found (it's not wrong, just superseded by a more complete version)
