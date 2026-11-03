import { Page, md } from "/app.js";

/* Container: a COLUMN in /imagine/'s columns host (the mastermind wires this in via the
   hub's `children:`). Size: `width: "large"` (28–64em) — two small tables need the room.
   Own layout: prose + two `md()` tables, `.ac("wide")` so they compress instead of
   overflowing the column's measure cap. Regions: one. Preview: the default card.
   frozen-helix and lew42com are outside this repo — quoted as code spans, never linked. */

export default new Page({
	meta: import.meta,
	title: "Prior Cloudflare",
	description: "Prior Cloudflare work — none of it ever shipped.",
	icon: "history",
	width: "large",

	content(){
		md(`Scouted across three projects: \`frozen-helix\`, \`lew42com\`, and this repo — the
first two read-only, outside the repo.`);

		this.built();
		this.decided();
		this.reuse();
		this.verdict();
	},

	built(){
		md(`## What was built

| project | deploy shape | what's there |
|---|---|---|
| \`frozen-helix\` | \`wrangler.jsonc\`: \`assets\` only, no \`main\` | a full D1 / Durable Object / R2 / KV **Saver** backend design (\`persistence.md\`, \`persistence2.md\`, \`persistence-review.md\` — \`SqliteSaver\` → \`D1Saver\` → \`DOSaver\` → \`R2Saver\`), never implemented in code; a Ctrl+K command-palette prototype (\`scripts/command-palette.png\`) |
| \`lew42com\` | \`wrangler.toml\`: \`assets\` only, no \`main\` | nothing Cloudflare-specific at all — zero real product mentions in code or docs. \`Server\` / \`Server2\` / \`Serverble\` are Node dev-server naming churn, not deploy variants (\`Server2\` is what \`server.js\` actually imports; \`Serverble\` is an abandoned, unrelated mixin stub) |
| this repo | \`wrangler.jsonc\`: \`assets\` only, no \`main\` — live at [monorepo.lew42.workers.dev](https://monorepo.lew42.workers.dev), branch previews auto-built | the fly/blog **trailing-slash hybrid** (a real \`index.html\` bypasses the SPA shell for a full-canvas page or real crawler meta tags) · a full [CMS think-through](/imagine/cms/thinking/) landing on an adapter seam · a [mock services UI](/imagine/cms/services/) for D1/DO/KV/R2 · a fully-cited [Durable Object design](/imagine/stream/doc/durable-objects.md) for \`/imagine/stream/\`, doc only |`).ac("wide");
	},

	decided(){
		md(`## What was decided

- **The CMS data-layer verdict** — [\`/imagine/cms/thinking/\`](/imagine/cms/thinking/): git files
  (md/json/jsonl) stay the default; add \`node:sqlite\` only for a dev-only query layer; reach
  for **D1 only when a visitor must write** — a browser can't hold a D1 token safely, so D1
  always implies a Worker in front of it; Durable Objects are **not yet**, earned only by live
  collaboration, a lock, or rate-limiting; **KV is ruled out** for CMS content (1,000 writes/day
  on the free tier); **R2** is the one service with an obvious job the moment images arrive.
  Start new Cloudflare projects on Workers, not Pages.
- **Production must stay static** — [\`dev/Socket/doc/localhost.md\`](/framework/dev/Socket/doc/localhost.md):
  the dev socket is gated *inside* the \`Socket\` class, never at a call site or behind a build
  flag, because "production here is pure static hosting… widening the gate is a production
  change, whatever it is dressed as."
- **A looping \`_redirects\` rule was replaced with the SPA fallback** — \`frozen-helix\` git log,
  \`b2080c4 Fix Cloudflare deploy: use SPA fallback instead of _redirects loop\`; its
  \`public/_redirects\` is present and now empty.
- **A committed \`index.html\` per post, not server rendering** — [\`/blog/doc/meta-tags.md\`](/blog/doc/meta-tags.md):
  crawlers need real bytes, SSR is off the table on static Workers assets, so each post gets a
  hand-stamped \`index.html\` whose last line still boots the SPA — proven in both dev and prod.
- **The stream's durability model** — [\`stream/doc/decisions.md\`](/imagine/stream/doc/decisions.md) /
  [\`doc/durable-objects.md\`](/imagine/stream/doc/durable-objects.md): one Durable Object per page
  url, single-threaded so it — not the client — is the only orderer; a DO makes last-write-wins
  *correct* rather than arbitrary, it still does not merge two edits.`);
	},

	reuse(){
		md(`## Reuse · do not copy

- **Reuse** — the adapter-seam pattern: one \`Saver\`-shaped interface (\`load\`/\`save\`/\`list\`/\`append\`),
  git files behind it today, a backend swap is one line, never a rewrite.
- **Reuse** — the trailing-slash real-file trick: a page that needs to bypass the SPA shell (a
  full-canvas app) or carry real \`<meta>\` tags is a committed \`index.html\`, linked with the
  slash, and nothing else changes.
- **Reuse** — mock-first, MCP-second for any Cloudflare management screen: every control prints
  the \`npx wrangler\` line it stands for until the official Cloudflare MCP is actually connected.
- **Do not copy** — \`frozen-helix\`'s D1/DO/R2/KV Saver design wholesale: it is a plan with open
  questions (op vocabulary, conflict resolution) never resolved, and zero lines of it were ever
  built.
- **Do not copy** — \`lew42com\`'s three-Server layout: dead naming churn from iterating in place,
  not an intentional pattern worth repeating.`);
	},

	verdict(){
		md(`## Has anything ever shipped with a Worker \`main\`?

**No.** Every \`wrangler.jsonc\` / \`wrangler.toml\` across all three projects declares \`assets\`
only — no \`main\` key exists in any of them, in any commit read. All three deploy static assets
with \`not_found_handling: "single-page-application"\` and nothing else. The closest anything
gets is \`/imagine/cms/services/\`: a page that prints \`npx wrangler d1 create …\` commands and
never runs them, by design.

| | code hits | doc hits |
|---|---|---|
| raw \`rg -il "durable object\\|workers\\|D1\\|KV\\|R2\\|queues\\|wrangler"\`, 3 projects | 45 files | 40 files |
| filtered to real Cloudflare-product mentions | 13 files | 25 files |

Most of the raw count is noise the regex can't tell apart from the real thing: minified vendor
JS (\`three.js\` variable names), this repo's own proposal-numbering convention (\`R1\`…\`R11\`,
\`D1\` as "depth 1"), the English verb "queues", and "workers" meaning Claude agent minions. The
filtered 13/25 is every file read by hand — all 13 real code hits and 22 of the 25 real doc hits
are in this repo (\`imagine/cms\`, \`imagine/stream\`, \`notes/auth\`, this repo's own \`readme.md\`);
the other 3 doc hits are \`frozen-helix\`'s three persistence docs. \`lew42com\` has none.`).ac("wide");
	},
});
