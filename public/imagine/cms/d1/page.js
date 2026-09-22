import { Page, p } from "/app.js";

/* Container: /imagine/cms/'s `children:` — a plain page in that column, opened beside its
   siblings (thinking/, json/, …). Size: default (nothing said) — three short children, no
   wide content. Own layout: `.flow`, nothing else. Regions: one.

   THE POINT — copy /imagine/cms/json/page.js's seam exactly. `children` is a function that
   fetches its own list (core's own doc/data-children.md), except this fetch goes to a real
   Cloudflare Worker route (worker/pages.js) — GET /api/pages?under= — which reads three rows
   out of a real SQLite table in D1 instead of a page.json file sitting beside this one. Core
   does not know the difference between a file and a database row; nothing else about this
   page differs from json/page.js's.

   ⚠ NO API AT THIS ORIGIN IS NOT AN ERROR. The site's static half (node server.js) and the
     worker that answers /api/* are two different local servers (dev.mjs, two ports) — open
     this page on the static one alone and the fetch below fails. It says so in one line
     instead of throwing, the same rule /imagine/platform/like.js already follows for the
     like button: every fetch gets a `.catch`, never a bare await.

   Proof + numbers: ai/2026-09-17/pages-in-d1/, doc/decisions.md beside this file. */

const API = "/api/pages?under=/imagine/cms/d1/";

function name_of(path){ return path.replace(/\/$/, "").split("/").pop(); }

export default new Page({
	meta: import.meta,
	title: "D1 pages",
	description: "Three pages that are rows in Cloudflare D1 (SQLite), read over one API route.",
	icon: "storage",

	// No `index: true` — that field means "my OWN content already draws my children",
	// which this page's content() does not do. Leaving it unset is what makes core draw
	// the default child list itself (Page.class.js's `if (!this.index) …a.c("page-column-item")…`),
	// the exact same list /imagine/cms/json/'s page.js relies on for its own six children.

	// One fetch per visit, memoised — children() and content()'s status line both ask, and
	// only the first one pays. A rejected fetch (wrong origin, or the worker not running)
	// resolves to `null` instead of throwing, so a page with no API still renders empty
	// rather than dying.
	ready(){
		return this.fetching ??= fetch(API)
			.then(r => r.ok ? r.json() : Promise.reject(r.status))
			.catch(() => null);
	},

	// MY CHILDREN ARE ROWS IN A REAL DATABASE. Each row is {path, title, description, icon} —
	// worker/pages.js's shape — turned into the same POJO form /imagine/cms/json/'s config()
	// already uses: an explicit `name` plus whatever Page.declare() reads off the rest.
	children(){
		return this.ready().then(rows => (rows ?? []).map(row => ({
			name: name_of(row.path),
			title: row.title,
			description: row.description,
			icon: row.icon,
			content(){ p(`This page is one row in D1: \`${row.path}\`.`); },
		})));
	},

	content(){
		// Captured now, filled in a callback — the "no DOM after an await" rule (code skill §1).
		p.c("muted", $status => {
			$status.text("Reading /api/pages …");
			this.ready().then(rows => $status.text(rows
				? `These three children are rows in the local D1, read over GET ${API}.`
				: "Database unreachable — the page renders anyway, which is the point."));
		});
	},
});
