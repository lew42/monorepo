import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Git branch names",
	icon: "account_tree",
	description: "Short-lived branches, named <yourname>/<branch>, and the preview url each one gets.",
	content(){
		this.crumbs();   // a dead-end leaf otherwise (audit 2026-08-30)

		md("```bash\ngit switch main && git pull      # always start here\ngit switch -c michael/new-page   # <yourname>/<branch-name>\n```");

		md("Short-lived branches: get the code merged, then repeat — switch to `main`, pull, new branch. Delete an old one with `git branch -D michael/new-page` if you want to reuse the name.");

		md("## The preview url");

		md("The `/` becomes a `-`, so `michael/new-page` deploys to:\n\n[https://michael-new-page-monorepo.lew42.workers.dev](https://michael-new-page-monorepo.lew42.workers.dev)\n\n| | |\n| --- | --- |\n| `michael/new-page` | the **git branch name** |\n| `michael-new-page-monorepo.lew42.workers.dev` | the **Cloudflare preview** |");

		md("## Why `<name>/<branch>`?");

		md("GitHub groups branches by `/`, so pushing several groups them together.\n\nThe earlier idea was one long-lived branch per person with a permanent preview. That works, but long-lived branches collect merge conflicts. This way every branch is temporary and you start fresh after `git switch main && git pull`.");
	}
});
