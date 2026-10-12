# Blog post: layout + page generators (verbatim contract)

Repo: c:\Code\lew42\monorepo. Laws: 1. Less is more — a post is a 3-5 minute read. 2.
Clarity is the one exception — a hiring engineer is the reader. 3. Prioritize. Final
report ≤10 lines. CLAUDE.md rules; read it. HARD RULES: never kill/restart the :80 dev
server; never drive owner tabs; never stash; never commit; NEVER write the owner's name —
first-person site voice, no bylines. Screenshots: scratchpad first; commit-worthy images
go IN the post dir.

TASK — write the blog post at `public/blog/systems/layout-generators/`.

CONTRACT (fixed; a sibling builds the shell in parallel): slug `systems/layout-generators`,
title "Generators: layouts and pages". Single-part post. Copy the Post page.js shape from
`public/blog/framework/how-this-blog-works/` (or the current `public/blog/posts.js` if
paths shifted mid-build); stamp index.html via `node public/blog/meta.mjs --write` at the
end (if it errors mid-build, note it).

THE POST — the two generators, shown not told: 1) `styles/layouts/space/` — a seeded
layout language (the string DSL, mulberry32 addresses, the Hunt search — one screenshot of
the wall, one of a single layout, link to the live pages); 2) `core/Page/generator/` —
pages generated without files (5 behavior words, in-place tabs, the spec-string controls
where every switched state is a url, the permutation wall — screenshot + links). The
through-line in one paragraph: a seed is a citation; edits must prove bit-identical
output; rules are data. Read `core/Page/generator/readme.md` + `doc/decisions.md` and
`styles/layouts/space/doc/` for grounding — link, don't restate. 2-3 tight screenshots
(<1MB total).

FENCE — `public/blog/systems/layout-generators/**` only.

TRAPS: trailing slash load-bearing in links; one backtick inside css(`…`) kills every
page; headless Playwright global:
`file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs`.

VERIFY: cold-load at 400/1920/3440, every link resolves (N/N), images render, zero
console errors. Keepers + `links`. Report: url, link count, image bytes, cuts.

## Steps

1. Read source modules (generator + space) for grounding
2. Screenshot the two generators (wall, single layout, permutation wall) via private
   dev server + headless Playwright — the shared :80 dev server was down
3. Write page.js + post.md in the fenced directory
4. Verify all outbound framework links resolve
5. Wait on sibling `blog-build` (owns posts.js/Post.js/section routing) to land
6. Cold-load verify at 400/1920/3440 once routing is live
7. Run `meta.mjs --write`
8. Land with finish-task
