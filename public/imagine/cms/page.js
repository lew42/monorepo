import { Page, md } from "/app.js";

/* Container: /imagine/'s columns row — one more column in it. Size: default track
   (16-40em), because this page is prose and a card wall. Own layout: `.flow` + one
   `previews()`. Regions: one. Preview: the default card.

   THE POINT: every "CMS" this repo needs already exists as two seams that were built
   for other reasons. `welcome.md` is a plain markdown file beside this page.js, and
   `Page.file()` turns it into /imagine/cms/welcome/ with no code at all. `edit/` writes
   that same file through the dev socket's `rpc:write`. The content is a file in git —
   so "publish" is `git commit`, and there is nothing to lock in to. */

export default new Page({
	meta: import.meta,
	title: "CMS",
	description: "A CMS out of two seams that already existed: a markdown file is a page, and the dev socket writes files.",
	icon: "edit_document",

	children: "thinking welcome edit services json",

	// My content already draws them as a previews() wall — without this, core adds a
	// second list of the same four names underneath it.
	index: true,

	content(){
		md(`A **content management system** is three things: content that lives somewhere, a
screen to change it, and a way to publish. This repo already had all three and did not
notice — [\`welcome\`](/imagine/cms/welcome/) is a plain \`welcome.md\` file sitting beside
this \`page.js\`, and core turns any such file into a page ([\`Page.file()\`](/framework/core/Page/doc/declaring/)).
[\`edit\`](/imagine/cms/edit/) writes that file back over the dev socket. Publishing is \`git commit\`.

**No backend was added.** The think-through weighs the ones that were on the table —
git JSON/JSONL, \`node:sqlite\`, Cloudflare D1, Durable Objects, KV, R2 — and lands on a
seam instead of a service.`);

		this.previews();

		md(`Start with [**Thinking**](/imagine/cms/thinking/) — five minutes, and it is the part that
decides anything. [**Services**](/imagine/cms/services/) is a mock on purpose: it composes the
\`npx wrangler\` line for each screen and hands it to you rather than holding a token.

How it is built, and the four traps found on the way: [\`readme\`](/imagine/cms/readme/).`);
	},
});
