/* Servex/closeout.fixture.mjs — the child processes closeout.test.mjs starts under a task: `node closeout.fixture.mjs server|browser <tag>`.
 * server: a tiny http server registered through track(); browser: a real Playwright Chromium through Server/Browser.mjs.
 * Prints "READY <own pid> [<chrome pid>]" once its lifecycle start line is written, then idles until it is stopped. */
const [mode, tag] = process.argv.slice(2);
const { track } = await import("./Lifecycle.js");
const wait = ms => new Promise(r => setTimeout(r, ms));

if (mode === "server") {
	const http = await import("node:http");
	const s = http.createServer((q, r) => r.end("ok")).listen(0, "127.0.0.1", async () => {
		track("server", `closeout-test-${tag}-${process.cwd().replace(/.*[\\/]/, "")}`, { port: s.address().port });
		await wait(700);
		console.log(`READY ${process.pid}`);
	});
} else if (mode === "browser") {
	const { default: Browser } = await import("../Server/Browser.mjs");
	await Browser.browser();
	for (let i = 0; i < 100 && !Browser.pid(); i++) await wait(100);
	await wait(900);   // the start line and the watchdog are written just after the pid is known
	console.log(`READY ${process.pid} ${Browser.pid()}`);
	setInterval(() => {}, 1 << 30);
} else if (mode === "orphan") {
	// chrome started detached with no watchdog: it outlives its launcher, like the orphans a script that crashed once left behind
	const { default: Browser } = await import("../Server/Browser.mjs");
	const { spawn } = await import("node:child_process");
	const { mkdtempSync } = await import("node:fs");
	const { tmpdir } = await import("node:os");
	const { join } = await import("node:path");
	const chromium = await Browser.get_chromium();
	const c = spawn(chromium.executablePath(), ["--headless", "--remote-debugging-port=0", `--user-data-dir=${mkdtempSync(join(tmpdir(), "closeout-orphan-"))}`, "about:blank"], { detached: true, stdio: "ignore", windowsHide: true });
	c.unref();
	const { record, owner_task } = await import("./Lifecycle.js");
	await record({ kind: "browser", id: `browser:${c.pid}`, pid: c.pid, launcher: process.pid, path: process.cwd(), owner_task: owner_task(), owner_agent: process.env.LEW_AGENT || null, script: "closeout.fixture", event: "start" });
	await wait(900);
	console.log(`READY ${process.pid} ${c.pid}`);
	setInterval(() => {}, 1 << 30);
}
