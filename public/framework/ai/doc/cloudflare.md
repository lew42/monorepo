# Cloudflare: what we would use, what it costs, what you give us

**The ask (2026-10-14, the owner):** "What would you need from me" to let the agents configure Cloudflare, without the risk of spending hundreds of dollars by accident when many minions are running.

## The short answer

Three things, in this order, and the first two cost nothing:

1. **Log wrangler back in** (one browser window): `npx wrangler login` in a terminal. Deploys already go through wrangler (`wrangler.jsonc`); the login expired and nothing here can refresh it without you.
2. **One scoped API token** for the node scripts, saved outside the repo at `%LOCALAPPDATA%\lew42\servex\cloudflare.token` (the same pattern as the OpenRouter key). Make it at dash.cloudflare.com → My Profile → API Tokens → Create, with only: Workers Scripts Edit, Workers R2 Storage Edit, D1 Edit, Cloudflare Tunnel Edit, Account Settings Read. Also paste the Account ID (dash home, right column) into `cloudflare.account`.
3. **Optional, the MCP route:** Cloudflare's own MCP servers use a browser login, no token: `claude mcp add --transport sse cloudflare https://bindings.mcp.cloudflare.com/sse`, then log in once when the tab opens. That lets an interactive session create R2 buckets and D1 databases by asking. The token above is what the unattended scripts (Servex, the archive script) use.

## Which boxes to tick (the owner asked, 2026-10-14: "hundreds and hundreds of these")

Don't pick from the long list. On the Create Token page choose the template **Edit Cloudflare Workers**. It already carries Workers Scripts, Workers KV, Workers R2 Storage, Workers Tail, Account Settings Read and User Details Read. Then add two rows with the "+ Add more" button: **Account · D1 · Edit** and **Account · Cloudflare Tunnel · Edit**. Under Account Resources pick your one account; leave zones alone until a tunnel needs a hostname. Set a TTL of a year. That is the whole token. If a script later needs something it lacks, the error names the missing permission and we add one row; too little is cheap to fix, too much is not.

## Who holds what: the tiers

There is only one tier today, and it is Servex, not any agent.

| Who | Holds | Can do |
|---|---|---|
| **Servex's node scripts** (deploy, the archive copy, the tunnel) | the token file, read at the moment of use, passed to the child process (`CLOUDFLARE_API_TOKEN`) and never into an agent's environment | everything the token allows, with a per-run op cap and a `--plan` count first |
| **A mastermind** | nothing | asks Servex through a tool (`archive_copy`, `deploy`, later `tunnel_up`); the tool checks the caller's role before acting |
| **A minion** | nothing | the same tools, read-only ones only; a write tool refuses a minion |

The tools are in-process node functions that know which agent is calling (the role is half the agent id), so "masterminds may administer, minions may not" is one `if` in the tool, not a second token. A second, read-only token comes only if an agent ever needs to call Cloudflare directly; nothing planned needs that. The keys of the castle stay in one file that only the always-on process reads.

## What stays free, and where the money starts

Every service here has a free plan that **throttles instead of billing**; a charge starts only when we opt into a paid plan.

| Service | What we would use it for | Free plan | After that |
|---|---|---|---|
| Workers static assets | the site, already deployed (`monorepo.lew42.workers.dev`) | 100k requests a day, 20,000 files | Workers Paid is $5 a month flat, then $0.30 per million requests |
| R2 | the second copy of archived session pictures (~1 GB a month) | 10 GB stored, 1M writes, 10M reads a month, egress free | $0.015 per GB a month; writes $4.50 per million; reads $0.36 per million |
| D1 | the page store (storage design) | 5 GB, 5M rows read a day, 100k rows written a day | needs Workers Paid; 25B reads and 50M writes a month included |
| Durable Objects | one object per page (the proposal) | 100k requests a day, 5 GB | needs Workers Paid; 1M requests included, then $0.15 per million |
| Tunnel | a connector the Claude app's voice mode can reach | free; a quick tunnel (`cloudflared tunnel --url`) needs no account at all | free |
| Access | a login wall in front of the tunnel | free for 50 users | free |

So the realistic bill is **$0 until we choose Workers Paid ($5 a month)**, and the archive at our volume is pennies.

## The runaway-minion guard

The one way to lose real money is a loop: R2 writes cost $4.50 per million, so a script writing 100 million objects would cost $450. Three rules keep that from happening:

- **Agents never hold the write token.** Only Servex's own node scripts (the single writer, as with the logs) read `cloudflare.token`; an agent that wants something in R2 asks Servex, which writes it. Agents get a read-only token at most.
- **Every script caps its own ops per run** (the archive script refuses more than 10,000 writes a run and logs the count), and `--plan` prints the count before `--apply`.
- **Billing alerts** in the dashboard (Notifications → Billing → usage-based billing) and a check of the Billing page in the weekly follow-up.

## What happens first once you do steps 1 and 2

The R2 second copy of the archived pictures (`ai/sessions/doc/picture-archive.md`), then the one-tool connector test (`ux/Dictate/doc/voice-bridge.md`) through a quick tunnel. D1 and Durable Objects wait for the storage design's go-ahead.
