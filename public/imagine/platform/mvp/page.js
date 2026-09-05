import { Page, md } from "/app.js";

/* Container: a COLUMN in /imagine/'s columns host (three levels up) — no page grid, so `wide`
   is meaningless and only `bleed` would reach an edge. Size: `large` (28-64em), the same word
   the program's other two report columns wear, so the row reads as one thing. Own layout:
   prose plus two markdown tables, each `.ac("wide")` so the table compresses inside the column
   instead of overflowing its measure cap. Regions: one. Preview: the default card.

   Every number here comes from a verdict and carries its link. Where two verdicts disagree the
   conflict table rules it once; the steps below carry the consequence and never re-argue it. */

const R = "/imagine/platform/research/";

/* The slice. `n` is the order, not a priority — 9 depends only on 1 and is last because
   nothing depends on IT. Costs are the verdicts' own numbers, never re-estimated here. */
const STEPS = [
	{
		n: 0, title: "Deploy first, not last",
		proves: "Nothing new — it already happened",
		depends: "nothing",
		costs: "$0, and static stays free at every user count",
		detail: `\`wrangler.jsonc\` has shipped assets-only for months, live with branch previews
([prior](/imagine/platform/prior/)). Every step below goes to a real url the day it is written,
which is the only reason the order can be honest about cost.`,
	},
	{
		n: 1, title: "One topic that is only pages",
		proves: "The abstraction holds on real pages, with no backend to hide behind",
		depends: "step 0",
		costs: "$0",
		detail: `\`is: "topic"\`, capabilities as child pages, subtopics as columns — and a
subtopic that graduates by adding one word. It is built: [open it](/imagine/platform/topic/),
[the record](/imagine/platform/decisions/topic-model/). This step is that demo, done once for
real.`,
	},
	{
		n: 2, title: "Progression with no server",
		proves: "Levels are believable before anybody can log in",
		depends: "step 1",
		costs: "$0 — `store()`, one browser",
		detail: `A 1-5 rubric, hand-written per rung, **derived** from an append-only action log
and gating nothing yet ([community](${R}community/)). ⚠ Its honest limit is that it is one
browser's: nothing is shared and nothing is proof. Finding out how much of the feel survives
that is the whole point of putting it before the line.`,
	},
	{
		n: 3, title: "The Omnibox over a static index",
		proves: "Discovery (§5, §6) with zero backend",
		depends: "step 1",
		costs: "$0",
		detail: `A generated \`/directory.json\` ([declaring](/framework/core/Page/doc/declaring/))
and one keyboard-first surface. This is a build, not a reuse — the scout found
\`ux/Filter\` as the nearest primitive and **nothing keyboard-first anywhere**
([existing](/imagine/platform/existing/)). Scoped to the static half only: [data](${R}data/)'s
own cut list defers D1 FTS5.`,
	},
	{
		n: 4, title: "← THE LINE. Identity.",
		proves: "A stranger can be known",
		depends: "step 0 — not on 2 or 3, which is exactly why it can be this late",
		costs: "Workers Paid **$5/month**; $0 at 100 users beyond that",
		detail: `The first Worker \`main\` this repo has ever had — no \`wrangler\` file in any of
the owner's three projects declares one ([prior](/imagine/platform/prior/)).
\`run_worker_first: ["/api/*"]\`, GitHub OAuth, a stateless HMAC cookie, DIY on Workers
extending [\`/notes/auth/\`](/notes/auth/) ([users](${R}users/)).

**The acceptance test, and it is not a slogan:** turn the Worker off, browse the site, and
every page still renders. That is the narrowing of CLAUDE.md's "no server at runtime" this
whole platform rests on — the static site is not allowed to need the API.`,
	},
	{
		n: 5, title: "One writable surface — the topic's space, text only",
		proves: "The write path, end to end, on the one shape the house already has",
		depends: "step 4",
		costs: "DO requests **$0.15/M**, duration **$12.50/M GB-s** — ~$0 at 100 users, ~$10/mo at 10k",
		detail: `One hibernating Durable Object per channel, keyed on the channel page's url. The
client change is **one line** — \`Socket.js\` swaps \`window.location.host\` for the object's
url — plus a row id where a byte offset is today, both already opaque values the client only
echoes ([realtime](${R}realtime/)). The JSONL stack that already syncs
[\`/imagine/stream/\`](/imagine/stream/) in ~9ms does not otherwise change.`,
	},
	{
		n: 6, title: "Reputation, and exactly one gated privilege",
		proves: "The community loop, without building moderation tooling first",
		depends: "step 5",
		costs: "~$1/month D1 at 10k users",
		detail: `Topic-scoped, derived live from the action log, gating **subtopic suggestion and
nothing else** ([community](${R}community/)). A suggested subtopic is a D1 row rendered by a
\`route()\`, never a directory — the one gap [the record](/imagine/platform/decisions/topic-model/)
names.

⚠ **D1 bills scanned rows, not returned rows** — a real bill hit 127.6B row reads on a 765k-row
table before indexes cut it 95% ([data](${R}data/)). Index the log by topic before the first
query, not after the first invoice. Personal data is mutable, hard-deletable rows; the event log
is for live ordering only.`,
	},
	{
		n: 7, title: "Moderation, before growth",
		proves: "The platform survives its first bad actor",
		depends: "step 6",
		costs: "near-zero — both mechanisms are already inline",
		detail: `Rate-limit plus mute/ban inside the Durable Object's message handler (free, and
[realtime](${R}realtime/)'s own cut list already puts AI moderation behind them), plus the KV
ban check now that there is something to ban — ~60s worst case, not instant
([users §33](${R}users/)). Governance: founder owns the topic, the platform owner overrides
anything, and every override is logged the same as a mod action. No voting — quorum needs a
crowd the MVP will not have.`,
	},
	{
		n: 8, title: "Membership",
		proves: "Somebody will pay",
		depends: "step 4",
		costs: "~**$0.66 per subscriber per month** on $10 — about 6.6%",
		detail: `Stripe Billing only: Payment Element plus the hosted Customer Portal, so the PCI
surface stays SAQ-A ([payments](${R}payments/)). No balance, no Connect, no tipping — see the
conflict table.`,
	},
	{
		n: 9, title: "Video — embed only",
		proves: `"Video is strong" for the price of nothing`,
		depends: "step 1 — it could land any time after that; it is last because nothing depends on it",
		costs: "$0",
		detail: `The \`youtube-nocookie\` IFrame Player API, already shipped twice in this repo
([youtube](/imagine/youtube/), [feeds](/imagine/feeds/video/)); public metadata read with no
auth at 1 quota unit; chapters parsed out of the description ourselves
([video](${R}video/)).`,
	},
];

/* Eight disagreements, each ruled in one line. The steps above carry the consequence and never
   re-argue it — the page shows each thing once. */
const CONFLICTS = [
	[`[cloudflare](${R}cloudflare/): one Durable Object (DO — Cloudflare's per-object mini-server) per **topic** · [realtime](${R}realtime/): one per **channel**, and it calls the conflict unresolved`,
		`**Neither name — the url is the key.** The topic model makes a channel a page, and a page url is the only unique, stable key this site has: per channel where channels exist, per topic where they do not, and a topic growing its second room migrates nothing. Ruled in full by [\`data.md\`](/imagine/platform/decisions/data/)`],
	[`§31: Cloudflare deployment is step 10 · [prior](/imagine/platform/prior/): it shipped months ago`,
		`**Step 0.** §31 assumed a deploy is a milestone; here it is a \`git push\``],
	[`§31 never lists moderation at all · §8: "a serious subsystem rather than an afterthought"`,
		`**Step 7, before any growth.** The one step added to §31's list`],
	[`[users](${R}users/) headline: GitHub + Google + magic link · its own cut list: GitHub only`,
		`**GitHub only.** Take the cut list; a second provider is a conversion question, not an architecture one`],
	[`§24/§25: part of the $10 becomes a spendable tipping balance · [payments §33](${R}payments/): no held balance`,
		`**Membership only.** A user-to-user transferable balance is the fact pattern money-transmission law regulates, and Stripe's $0.50 floor kills a 1-cent tip anyway`],
	[`§20: voice, streaming, recording, transcription · [realtime](${R}realtime/): text only`,
		`**Text only.** The room shape is unproven, and recording carries an all-party-consent problem in about a dozen US states`],
	[`§21: users publish video through our interface · [video §33](${R}video/): private-only until audited`,
		`**Embed only.** Every early video would otherwise be invisible while a compliance audit runs`],
	[`§31 puts users at 5 of 10 · [data](${R}data/): ship static + git **alone** first`,
		`**Agreed, and named.** Steps 1-3 are free and static; step 4 is the line, and it is one row in this table rather than an assumption`],
];

export default new Page({
	meta: import.meta,
	title: "MVP",
	description: "The smallest slice: ten steps to a server.",
	icon: "linear_scale",
	width: "large",
	classes: "default",   // the column Platform arrives with - a row of one column and air is the 3440 failure

	content(){
		md(`**Ten steps, in the order that spends the least before it learns the most.** Steps 0-3
cost nothing and are live the day they are written. **Step 4 is the line** — the first Worker,
the first bill, and the first thing that can be down.

Built on eight verdicts ([research](/imagine/platform/research/)) and two scouts. Where they
disagree, the table rules it once.`);

		this.conflicts();
		this.steps();
		this.excluded();
	},

	conflicts(){
		md("## Where the verdicts disagree");

		md("| the conflict | ruled |\n|---|---|\n"
			+ CONFLICTS.map(([conflict, ruled]) => `| ${conflict} | ${ruled} |`).join("\n")).ac("wide table-equal");
	},

	steps(){
		md("## The slice");

		STEPS.forEach(step => md(`### ${step.n} · ${step.title}

**Proves** ${step.proves} · **Depends on** ${step.depends} · **Costs** ${step.costs}

${step.detail}`));
	},

	excluded(){
		md(`## Not in the slice at all

**AI, cut whole and not thinned** — every AI feature in the brief sits behind users, auth and
community in §31's own sequence, and a human-written topic page plus a manual report queue
proves the platform with no vendor key, no spend cap and no false-positive path to design
([ai](${R}ai/)). Then: tipping, creator payouts and the marketplace; voice, recording and
transcription; badges; following; 3D; anonymous participation and multiple profiles per user
(both on [users](${R}users/)' own cut list).

## What this slice does not answer

- **Does a non-cashable balance escape stored-value rules?** [payments](${R}payments/) closes
  saying this needs paid counsel, not more search. Until it is answered, §25 has no MVP.
- **Do \`wrangler dev\` and \`node server.js\` coexist?** Flagged unverified by
  [cloudflare](${R}cloudflare/); the local multi-user harness is
  [\`local-dev.md\`](/imagine/platform/decisions/local-dev/)'s to design and the next minion's
  to test.
- **The security verdict had not landed when this was written.** It is the skeptic pass over
  all eight others, and it is the one thing that could reorder steps 4-7.
- **How much of the feel survives step 2's single browser** — nobody knows, and step 2 exists
  to find out cheaply.`);
	},
});
