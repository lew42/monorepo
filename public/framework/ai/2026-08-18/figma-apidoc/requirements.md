# figma-apidoc — node `109-369`

The owner, verbatim: *"some of my favs… remind them to intelligently separate the whole thing into
smaller pieces, and then reassemble into the full thing, whenever it's appropriate."*

Governing docs: `../figma/minion.md` (the shared brief), `../figma/requirements.md` (the eight
standing rules), `CLAUDE.md` (rules all).

## What the node actually is

`109:369` = `Frame 14643`, 8400 x 1624 — **five** frames, not the four the survey listed:

| id | name | size |
| --- | --- | --- |
| `110:435` | `app-class-overview` | 1440 x 1316 |
| `110:566` | `app-class-api-reference` | 1440 x 1624 |
| `110:702` | `app-class-source-code` | 1440 x 1200 |
| `119:543` | `app-class-tabbed` | 1920 x 1336 |
| `121:434` | `app-class-tabbed` (same name, different frame) | 1920 x 1336 |

It is **this framework's own documentation site**, branded LEW 42, sidebar reading
*Framework: Overview / API Reference / Source Code* and *Core Classes: App / View / Component /
Router / Store*.

## Scope

Own only `public/framework/styles/layouts/apidoc/` and one word in the `Pages:` line of
`styles/layouts/page.js`. Never touch `framework.css`, `css-scopes.txt`, `ext/`,
`styles/elements/`, or another minion's dir (`wire anatomy home toc-studio set screens`).
