import { Page, md, div, pre, span, label, select, option, input } from "/app.js";

/* Container: /imagine/'s columns row. Size: `large` (28-64em) — four service cards and a
   two-column command table do not fit the 40em default. Own layout: `.grid.auto` at
   `--column: 17em` for the cards, `.flex.gap` for the one form, `md()` tables for the rest.
   Regions: one. Preview: the default card.

   A MOCK, ON PURPOSE. Nothing on this page calls Cloudflare. Every control prints the
   `npx wrangler` command it stands for, because that is the honest version of a management
   UI for a tool whose whole API is already a CLI — and because credentials are the owner's
   move, not an agent's. The real screens would run these same lines. */

const SERVICES = {
	D1: {
		what: "Serverless SQLite. The relational one — pages, posts, users, anything you would query.",
		free: "500 MB per database, 10 databases, 5M rows read + 100k written per day.",
		local: ".wrangler/state/v3/d1/ — a real SQLite file, no account, no network.",
		create: name => `npx wrangler d1 create ${name}`,
		list: "npx wrangler d1 list --json",
		drop: name => `npx wrangler d1 delete ${name}`,
	},
	"Durable Object": {
		what: "One named, single-threaded actor with its own storage. Coordination, not content.",
		free: "Free plan, SQLite-backed only: 100k requests + 13,000 GB-s per day.",
		local: ".wrangler/state/v3/do/ — always local in dev; it cannot be pointed at the cloud.",
		create: name => `# no CLI: a DO is a class in your Worker\n# wrangler.jsonc:\n#   "durable_objects": { "bindings": [{ "name": "${name.toUpperCase()}", "class_name": "${name}" }] }\nnpx wrangler deploy`,
		list: "# no list command — DOs are declared in wrangler.jsonc, not created",
		drop: "# delete the binding + a migration with deleted_classes",
	},
	KV: {
		what: "Read-heavy key/value at the edge. Config and caches, eventually consistent (~60s).",
		free: "100,000 reads but only 1,000 writes per day, 1 GB. The write cap is the catch.",
		local: ".wrangler/state/v3/kv/",
		create: name => `npx wrangler kv namespace create ${name}`,
		list: "npx wrangler kv namespace list",
		drop: name => `npx wrangler kv namespace delete --binding ${name}`,
	},
	R2: {
		what: "S3-compatible object storage. Images, video, uploads — the media library.",
		free: "10 GB-month, 1M writes, 10M reads. Egress is free, which is the whole point.",
		local: ".wrangler/state/v3/r2/",
		create: name => `npx wrangler r2 bucket create ${name}`,
		list: "npx wrangler r2 bucket list",
		drop: name => `npx wrangler r2 bucket delete ${name}`,
	},
};

export default new Page({
	meta: import.meta,
	title: "Services",
	description: "What a create-and-manage screen for D1, Durable Objects, KV and R2 would be — each button labelled with the wrangler command behind it.",
	icon: "cloud",
	width: "large",

	content(){
		md(`**Nothing here talks to Cloudflare.** This is the shape of the management UI, with the
command behind every control written on it. That is deliberate twice over: an account and a
token are the owner's to create, and a service whose entire API is already a CLI does not need
a second API — it needs a screen that composes the right line and hands it to you.`);

		this.form();
		this.cards();
		this.mcpNote();

		md(`## What each screen would be

| screen | does | the line behind it |
|---|---|---|
| **Services** | every binding in \`wrangler.jsonc\`, live or local | \`npx wrangler d1 list --json\`, \`kv namespace list\`, \`r2 bucket list\` |
| **New** | name it, pick a kind, get the command | \`d1 create\` · \`kv namespace create\` · \`r2 bucket create\` |
| **Console** | run SQL against one database, local or remote | \`npx wrangler d1 execute DB --local --command "…"\` |
| **Schema** | apply and list migrations | \`npx wrangler d1 migrations apply DB --local\` |
| **Backup** | export a database to a \`.sql\` file in the repo | \`npx wrangler d1 export DB --output=./data/db.sql\` |
| **Restore** | point-in-time, last 7 days on free | \`npx wrangler d1 time-travel restore DB --timestamp=…\` |
| **Deploy** | one push ships static files *and* the Worker | \`npx wrangler deploy\` (Workers Builds runs it from git) |

There is no \`wrangler d1 import\`: importing is \`d1 execute --file=./seed.sql\`, and an existing
SQLite file becomes one with \`sqlite3 db.sqlite .dump\`.

## What activating this would take

1. **A Cloudflare account and \`npx wrangler login\`.** Yours to run; an agent has no business
   holding a token that can edit every database on the account.
2. **A \`wrangler.jsonc\`** at the repo root: \`assets.directory: "./public"\` plus whichever
   bindings you want. No build command — Workers Builds treats it as optional.
3. **One Worker file**, a plain ES module, deployed with \`--no-bundle\` so the no-build law holds
   at the edge too. It exists for exactly one reason: **a browser cannot safely reach D1
   directly.** The REST API authenticates with an account-scoped token, so shipping one to the
   page hands every visitor full edit rights over every database you own.
4. **Connect the repo** in Workers Builds — then a \`git push\` deploys the files and the Worker
   in one operation, which is the git-only deploy you wanted.

Steps 1–4 are the moment this framework stops being static. [The think-through](/imagine/cms/thinking/)
argues you should take them late, and only for the features that actually need a server.`);
	},

	// The one interactive thing: it composes a command and refuses to run it.
	form(){
		div.c("surface pad flex v gap", () => {
			div.c("flex gap wrap v-center", () => {
				label("Kind", () => {
					this.$kind = select(() => Object.keys(SERVICES).forEach(k => option(k)))
						.on("change", () => this.draw());
				});
				label("Name", () => {
					this.$name = input().attr("placeholder", "site-content").on("input", () => this.draw());
				});
			});
			this.$command = pre();
			span.c("muted").text("Copy it. This page will not run it — see the activation steps below.");
		});

		this.draw();
	},

	draw(){
		const kind = this.$kind.el.value;
		const name = this.$name.el.value.trim() || "site-content";
		this.$command.text(SERVICES[kind].create(name));
	},

	cards(){
		div.c("grid auto gap").style("--column", "22em").append(() =>
			Object.entries(SERVICES).forEach(([name, s]) => {
				div.c("surface pad flow", () => {
					md(`### ${name}\n\n${s.what}\n\n**Free tier** — ${s.free}\n\n**Local** — \`${s.local}\``);
				});
			}));
	},

	// Answers "is there an MCP for this" — researched 2026-08-30, see ai/2026-08-30/cloudflare-mcp/.
	mcpNote(){
		md(`## Claude can do this — the setup

An official Cloudflare MCP exists, hosted — nothing to install. Four steps:

1. **Confirm the Cloudflare account.** Sign in (or sign up) at Cloudflare's dashboard —
   nothing below works without one. [setup guide](https://developers.cloudflare.com/agent-setup/claude-code/)
2. **Connect it** — from the repo root: \`claude mcp add cloudflare --transport http https://mcp.cloudflare.com/mcp\`
   for the full API, plus \`claude mcp add cloudflare-bindings --transport http https://bindings.mcp.cloudflare.com/mcp\`
   for D1/KV/R2 creation specifically. [server list](https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/)
3. **Authorize.** The first tool call opens a browser OAuth prompt — sign in, grant account
   access, once per server. (A scoped API token works instead for non-interactive setups.)
   [setup guide](https://developers.cloudflare.com/agent-setup/claude-code/)
4. **Ask the mastermind** — once connected: *"create the D1 database and wire the CMS
   adapter"* (same phrasing for KV, R2). [workers-bindings server](https://github.com/cloudflare/mcp-server-cloudflare/tree/main/apps/workers-bindings)

Check it landed with \`claude mcp list\`.

**Mock → real, plainly:** **New** and **Services** above go real first — create/list D1, KV,
R2 are confirmed tools on the bindings server. **Console / Schema / Backup / Restore** ride
D1's REST API, reachable through the general \`cloudflare\` server's Code Mode — likely real,
not yet tool-tested here. **Durable Object create stays a mock on purpose** — there is no
create API for a DO, only a code change (declare the binding, \`wrangler deploy\`), which needs
no MCP at all — that one you can already ask for today.

Neither server creates the account or picks a plan. Step 1 is always yours.`);
	},
});
