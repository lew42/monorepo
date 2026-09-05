import { Page, md } from "/app.js";

/* Container: a COLUMN in /imagine/'s columns host (the mastermind wires this in via the
   hub's `children:`). Size: `width: "large"` (28–64em) — a table needs the room. Own
   layout: prose + one markdown table, `.ac("wide")` so the table compresses instead of
   overflowing the column's measure cap. Regions: one. Preview: the default card. */

export default new Page({
	meta: import.meta,
	title: "Existing framework",
	description: "What the framework already has, per concern.",
	icon: "inventory_2",
	width: "large",

	content(){
		md(`Scouted against [the platform brief](/framework/ai/2026-09-04/mastermind-platform/) —
one row per concern, what already exists (linked), and whether it is a straight reuse, worth
extending, or not built at all.`).ac("wide");

		md(`| concern | what exists | verdict | note |
|---|---|---|---|
| **Topic model** | \`is: "topic"\` role + \`nearest()\` ([roles](/framework/core/Page/doc/roles/)) · \`children:\` composition ([children](/framework/core/Page/doc/property/children/)) · \`store()\` ([store](/framework/core/Page/doc/method/store/)) | **reuse** | \`roles.md\` already argued this exact question and rejected a subclass and a flag — see the recommendation below |
| **Subtopics / spaces** | \`columns()\` — six width words, a default column, drag-resize ([columns](/framework/core/Page/doc/columns/)) · a live world at [/imagine/](/imagine/) | **reuse** | subtopic-as-column already works; [\`ext/Panel\`](/framework/ext/Panel/) is chrome for wireframing arrangements, not a fit for user-created channels |
| **Omnibox / search** | [\`ux/Filter\`](/framework/ux/Filter/) — segment + search → a predicate, the nearest primitive · [\`ux/Menu\`](/framework/ux/Menu/) · [\`ext/Dropdown\`](/framework/ext/Dropdown/) | **missing** | nothing keyboard-first or command-palette-shaped exists; \`keydown\` handling is ad hoc in five different modules with no shared layer |
| **Community / chat / writes** | [\`/imagine/stream/\`](/imagine/stream/) — live multi-window JSONL sync, ~9ms · [\`/imagine/cms/\`](/imagine/cms/) — a working edit-and-publish pipeline | **extend** | both are proven, but write only over the loopback dev socket — nothing writes from a deployed static site yet |
| **Users / auth** | [\`/notes/auth/\`](/notes/auth/) — a full unbuilt design record (GitHub OAuth, signed cookie, D1 schema) · [\`ux/Auth\`](/framework/ux/Auth/) — a login/signup UI shell | **missing** | the one *working* auth code (\`Server/plugins/Auth.js\`) is a dev-only Express session on a hardcoded secret — not deployable as-is |
| **Storage** | [\`ext/Saver\`](/framework/ext/Saver/) — save/load/delete queue · [\`ext/JSONL\`](/framework/ext/JSONL/) — append-only replay · [\`core/Item\`](/framework/core/Item/) / [\`List\`](/framework/core/List/) | **reuse** | solid primitives, but every writer today goes through the loopback dev socket — no multi-writer backend past it |
| **Real-time** | the full wire protocol — one MCP HTTP hop, one WebSocket, jsonl-tail streaming ([wire](/framework/dev/Socket/doc/wire/)) | **extend** | the *design* (append, tail, replay) is the model to imitate in production; it is loopback-gated today, on purpose — an RCE was once closed on that exact gate |
| **Video** | [\`/imagine/youtube/\`](/imagine/youtube/) — a Player wrapper + a Cues timeline engine · [\`/imagine/feeds/video/\`](/imagine/feeds/video/) — lazy embed | **reuse** | playback/embedding is strong and already shared by the 3D pager's tour; upload, auth and transcripts are untouched |
| **AI** | [\`ext/Ask\`](/framework/ext/Ask/) — browser-to-Claude bridge · [\`ext/Research\`](/framework/ext/Research/) — append-only, credence-graded, claim/vote/verdict | **extend** | Research's shape is directly reusable for AI-assisted topic/wiki creation; fal.ai has zero references anywhere in the framework |
| **Levels / badges / progression** | none as a system — [\`/imagine/game/\`](/imagine/game/) and [\`/imagine/team/\`](/imagine/team/) both build progress from \`is: "topic"\` + \`store()\` | **missing** | that role + store combo is exactly the primitive a levels system would extend; no badge, XP or certification concept exists |
| **Publishing / deploy** | \`wrangler.jsonc\` — Cloudflare Workers assets + SPA fallback, already live · \`meta.mjs\` — manifest → committed static derivatives ([/blog/](/blog/)) | **extend** | the static half is done and proven; zero Worker, D1, Durable Object, KV or R2 code exists anywhere in the repo |`).ac("wide");

		md(`## Topic abstraction: \`is: "topic"\`, not a subclass or plain config

[\`core/Page/doc/roles.md\`](/framework/core/Page/doc/roles/) already argued and settled this
exact question (2026-08-27), against the same two alternatives the brief names. A
\`TopicPage\` **subclass** forces a file per role and shadows the very accessor it would
define — its own \`this.topic()\` would just be itself. A \`topic: true\` **flag** shadows
\`this.topic()\` on the page that claims it. \`is: "topic"\` + \`nearest(role)\` finds the role
at any depth, through columns or panels, with no registry and no import either way.
**"Plain config" is not really a third option** — a topic's extra fields (\`store()\`, levels,
subtopics) are already just fields on the page literal; \`is:\` is what turns that config into
a relationship other pages can discover without importing it.

**Two counts, from the brief's own greps:**
- \`extends Page\`: **24** hits — 14 live classes (\`Section\`, \`ErrorPage\`, \`Doc\`, \`Post\`,
  \`AITask\`, \`Research\`, \`Program\`, \`Shell\`, \`Screen\`, \`Deck\`, \`Scene\`, \`Article\`,
  \`BlogxSwapPart\`, \`Blog\`), 7 inside \`core/new/1/\` — a dead, non-live snapshot per
  \`core/readme.md\` — and 3 quoted mentions inside doc strings, not real classes.
- \`is: "…"\` role: **6** hits — \`topic\` ×5 (\`game\`, \`team\`, columns \`refs\`, \`uses/inbox\`,
  \`uses/split\`) and \`document\` ×1 (columns \`refs\`).`).ac("wide");
	},
});
