# generator-export — export a generated tree as real page.js files

## The ask, verbatim

TASK — the generator roadmap's endgame: **export a generated tree as real page.js files**.
The generator (`/framework/core/Page/generator/` — read readme + doc/decisions.md, waves 1-7)
builds an in-memory Page tree from a spec string. Build the bridge: an Export control that
writes the current tree to disk as a real module directory — one dir per page, each with a
minimal `page.js` (imports from /app.js, `children:` naming its subdirs, the width/behavior
words the spec gave it), the root importable and browsable like any hand-written module.

DESIGN CONSTRAINTS (decide the rest yourself, document in decisions.md):
- Write path: the dev server's `rpc:write` (Runtime.write — read
  `Server/plugins/SocketServer/Runtime.js` to learn the contract; the mute line in it only
  matters after a restart, irrelevant here). This is a DEV-ONLY feature by design (production
  is static) — the control disappears or disables gracefully when no socket answers; prove
  that state too.
- Target: default under `public/imagine/generated/<name>/` (the lab world), name from the
  saved-spec title or the seed; NEVER overwrite an existing dir — refuse with a quiet message
  instead.
- The exported code must read like a person wrote it: real imports, the module shape every
  other page.js has (meta, title, children, content), no generator runtime imports, no
  serialized JSON blobs. Show, don't tell — the file IS the deliverable.
- Wire the seam: `/imagine/generated/` needs a tiny index page whose children: names exported
  dirs — decide how it learns them (a manifest the export appends via rpc:append is fine — it
  exists as of today) — and `/imagine/page.js` gets `"generated"` in its children (ONE line
  edit there, fence exception granted for exactly that line).

VERIFY — the round trip is the proof: export a spec on the private port → load
`/imagine/generated/<name>/` as a real page → compare its rendered column/child structure
against the generator's live render of the same spec (counts + names must match; paste both).
Re-export same name → refused. No-socket state screenshot. 6-seed sha proof. Zero console
errors, 400/1920/3440 on the exported page.

FENCE — `core/Page/generator/**`, `public/imagine/generated/**`, + the one children line in
`public/imagine/page.js`.

## Hard rules

- Never kill/restart the :80 dev server. Private server only: `$env:PORT='8097'; node server.js`,
  torn down after.
- Never drive owner tabs. Never stash. Never commit. `Server/` is READ-ONLY.
- SEEDED GENERATOR LAW: sha-identical draws on 6 seeds before/after; export must not touch the
  draw path.
