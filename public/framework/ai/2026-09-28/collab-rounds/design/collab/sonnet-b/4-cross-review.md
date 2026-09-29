# Cross-review: haiku-c and haiku-a against mine

Both implementations are **functionally the same as mine** — same class shape, same nine stored
properties, same method set with the same signatures, same transient-field trick for carrying
fetched markdown from `fetch()` to `save()`, same "return false/0/null instead of throwing" choice
for `exists()`/`sizeOf()`/`load()`. All three would drop in as the same class from the outside.
The differences are in the corners, not the shape.

## haiku-c

Functionally the same. Two things it does better:

- **Real `_htmlToMarkdown()`** — it actually converts headings, paragraphs, links, bold/italic and
  list items into markdown syntax, not just tag-stripping. Mine left `Source.Markdown.from()` as a
  literal pass-through of the raw HTML with a comment saying "real conversion belongs elsewhere" —
  true in the long run, but haiku-c's stub is closer to something that would produce a readable
  `.md` file today if no shared util exists yet.
- **`sizeOf()` and `exists()` both swallow errors safely** — same as mine, but it's consistent
  with `load()`/`list()` also checking `err.code !== "ENOENT"` and rethrowing anything else, so a
  permissions error or a disk problem doesn't get silently treated the same as "file not there
  yet." Mine swallows everything in a bare `catch {}`, which would also hide a real I/O error.

One thing it does worse: `Authority.guess()` hardcodes a long allowlist of specific domains
(nodejs.org, mdn.org, css-tricks.com, etc.) with a multi-line regex — more brittle than mine's
kind-first, domain-second approach, and it will silently return the 0.50 default for any docs site
not on the list (which is most of them).

## haiku-a

Also functionally the same. Two things it does better:

- **`extractTitle()` falls back through three sources** — `<title>`, then `<h1>`, then an
  `og:title` meta tag, before giving up with `"Untitled"`. Mine only tries `<title>` and falls back
  to the raw URL as the title, which is a worse citation (`cite()` would print the URL twice).
- **`Authority.guess()` composes a base domain score with a kind-based adjustment** (`+0.15` for
  docs, `+0.20` for spec, `-0.15` for forum, clamped to 0–1) rather than my approach of returning a
  flat number per kind that ignores the domain entirely once a kind is known. Its version can tell
  apart "spec on an unknown domain" from "spec on a doc site," which mine can't.

One thing it does worse: `mdPath` is `${domain}-${Date.now()}.md`, so fetching the same URL twice
produces two different files instead of overwriting or being detected as a duplicate — mine's
`slugFor(url)` is stable, so re-fetching the same URL lands on the same path and a second `save()`
at least overwrites cleanly rather than littering the topic folder with timestamped duplicates of
the same page.
