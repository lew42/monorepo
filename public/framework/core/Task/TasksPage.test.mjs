// TasksPage in a real (headless) browser: a module's tasks/ path mounts it; /tasks/ is a saved filter that forwards to the Inbox, and the index it reads still spans two modules or more.
// `node public/framework/core/Task/TasksPage.test.mjs [site url]` — default http://monorepo.localhost/
import assert from "node:assert";
import Browser from "../../../../Server/Browser.mjs";

const base = (process.argv[2] ?? "http://monorepo.localhost/").replace(/\/?$/, "/");
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok -", m); };

// What the page at `path` mounted: the class of the page holding .tasks-page, and its groups and rows.
async function mounted(tab, path){
	await tab.goto(base + path.replace(/^\//, ""));
	await tab.waitForFunction(() => { const box = document.querySelector(".tasks-page"); return box && !box.textContent.includes("Loading"); }, null, { timeout: 20000 });
	return tab.evaluate(async () => {
		const { Page } = await import("/app.js");
		const box = document.querySelector(".tasks-page");
		const groups = [...box.querySelectorAll(".tasks-group")].map(g => ({ module: g.querySelector(".tasks-group-head")?.textContent, rows: g.querySelectorAll(":scope > .task-row").length }));
		return { cls: Page.of(box)?.constructor.name, groups };
	});
}

const browser = await Browser.browser();
const tab = await browser.newPage();
try {
	const bare = await mounted(tab, "/framework/core/Task/page/tasks/");   // a tasks/ nothing else claims
	ok(bare.cls === "TasksPage", "a tasks/ path with no page of its own mounts TasksPage (got " + bare.cls + ")");

	const mod = await mounted(tab, "/framework/core/Task/tasks/");   // a Doc module: its Tasks tab draws the same view
	ok(mod.groups.length === 1 && mod.groups[0].rows > 0, "a module's Tasks tab shows its one group of rows");

	await tab.goto(base + "tasks/");   // /tasks/ is ai/tasks/SavedFilter.js: it forwards to the Inbox (one dashboard, 2026-10-19)
	await tab.waitForFunction(() => location.pathname.startsWith("/framework/ai/") && !location.pathname.startsWith("/framework/ai/tasks/"), null, { timeout: 20000 });
	ok(!(await tab.$(".tasks-page")), "/tasks/ forwards to the Inbox saved filter (" + new URL(tab.url()).pathname + "), not a TasksPage");

	const groups = await tab.evaluate(async () => {   // the index public/tasks/task.jsonl still holds every task home
		const { default: TasksPage } = await import("/framework/core/Task/TasksPage.js");
		return (await TasksPage.groups("/tasks/")).filter(g => g.tasks.length).map(g => g.module);
	});
	ok(groups.length >= 2, "the /tasks/ index lists tasks from two modules or more (" + groups.length + " modules)");
} finally {
	await tab.close();
	await Browser.close();
}
console.log(`TasksPage: ${n} checks passed`);
