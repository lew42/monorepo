# Now `ai/now/`

Everything running right now, at `/framework/ai/now/`: one card per session that is working and moved in the last hour, with who it is, what it is doing, a link to its folder, and what it has cost. It is a query, never written by an agent.

| Piece | Job |
|---|---|
| `AINow.js` (`AINow extends View`) | asks the `inflight` source, repaints on every pushed row |
| `AINow.css` | `an-` rules, one column at 400 px |
| `Server/InFlight.mjs` | registers the `inflight` query source over `DatedFiles.sessions.in_flight()` and adds `doing` (the newest line of the session's record) and `url` |

Data path: day `index.json` files (or the live index in memory) → `DatedFiles.sessions.snapshots()` → `in_flight()` → `InFlight` source → socket → `AINow`. Details: [Server/doc/dated-files.md](/Server/doc/dated-files.md) ("In flight").

## Watch out

- Needs the dev server (a static host has no socket); the page says so and links the day.
- A session only counts as running while its snapshot says `active` and its last activity is under an hour old.
- A change to `Server/InFlight.mjs` or `Socket.js` needs a dev-server restart.
