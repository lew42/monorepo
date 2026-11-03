import { AITask, md, h2 } from "/app.js";

export default new AITask({
	meta: import.meta,

	extra(){
		md("**Production is a static site on Cloudflare today. A login-plus-database Worker is designed and runs on this PC, but was never deployed.** The first step is one sign-in and one like, live; it waits only on your Cloudflare login.");

		h2("What exists");
		md([
			"| | |",
			"|---|---|",
			"| Live | static site at monorepo.lew42.workers.dev (assets only, no server code) |",
			"| Decided | [identity, data, security](/imagine/platform/decisions/identity.md): cookie login, GitHub/Google, D1, one Durable Object per room |",
			"| Built, local only | `worker/` (about 520 lines) and the [slice recipe](/framework/ai/sessions/2026/09/06/platform-slice/run.md): a like stored in real SQLite |",
			"| Never wired | deploy, OAuth apps, secrets, payments (nothing built), the tunnel for remote use |",
		].join("\n"));

		h2("Which systems break in production");
		md([
			"| System | Cheapest path |",
			"|---|---|",
			"| Pages, docs, demos | works as is (static) |",
			"| Task board, logs, usage (JSONL streams) | static snapshot; live only locally |",
			"| Servex, agents, Refine, Ask | owner only, local; reach it through a Cloudflare Tunnel plus Access |",
			"| Whisper dictation | owner only, local (a cloud API later) |",
			"| Page editors and CMS (file writes) | author locally, commit, push |",
			"| Likes, comments, rooms, login | Worker + D1 (+ Durable Object) |",
			"| Payments | a Stripe Checkout link first |",
		].join("\n"));

		h2("First slice, not built");
		md("**Sign in with GitHub and press one like, live on a Cloudflare preview URL.** It is the slice that already runs locally; it needs a production `wrangler.jsonc` on a branch and the OAuth callback route, which does not exist yet. Cost: $0.");

		h2("Your blockers");
		md("1. `npx wrangler login`, then create the D1 database. 2. A GitHub OAuth app (id and secret). 3. `wrangler secret put SESSION_SECRET`. 4. For remote use: install `cloudflared` and set up Access. Payments need a Stripe account, later.");

		md("Detail: [inventory](doc/inventory.md).");
	},
});
