// Session.watch() tails by byte range: new lines arrive once each, a half-written line waits, multi-byte text survives,
// an idle poll is a 1-byte 206, and a server that ignores Range still works. node watch.mjs <base>
import path from "path";
import { pathToFileURL } from "url";
const base = process.argv[2] ?? "http://monorepo.localhost";
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const { default: Browser } = await import(pathToFileURL(path.join(here, "../../../../../Server/Browser.mjs")).href);
const browser = await Browser.browser({});
const fail = [];

async function run(honour_range){
	const ctx = await browser.newContext();
	const page = await ctx.newPage();
	let file = Buffer.from(`{"n":1,"t":"héllo ✓"}\n{"n":2}\n`), served = [];
	await page.route("**/scratch-watch.jsonl", route => {
		const range = route.request().headers()["range"], m = /bytes=(\d+)-/.exec(range ?? "");
		if (!honour_range || !m) { served.push({ status: 200, bytes: file.length }); return route.fulfill({ status: 200, body: file }); }
		const start = +m[1];
		if (start >= file.length) { served.push({ status: 416 }); return route.fulfill({ status: 416, headers: { "content-range": `bytes */${file.length}` } }); }
		served.push({ status: 206, bytes: file.length - start });
		return route.fulfill({ status: 206, body: file.subarray(start), headers: { "content-range": `bytes ${start}-${file.length - 1}/${file.length}` } });
	});
	await page.goto(base + "/framework/ux/Dictate/", { waitUntil: "load" });
	await page.evaluate(async () => {
		const Session = await import("/framework/ext/Session/Session.js");
		window.$got = []; window.$status = [];
		window.$stop = Session.watch("/scratch-watch.jsonl", l => window.$got.push(l.n), { every: 100, on_status: (k, d) => window.$status.push(k) });
	});
	const got = () => page.evaluate(() => window.$got.join(","));
	const wait = ms => page.waitForTimeout(ms);
	await wait(400);
	const tag = honour_range ? "range" : "no-range";
	if (await got() !== "1,2") fail.push(`${tag}: first read got ${await got()}`);
	await wait(400);   // idle polls
	file = Buffer.concat([file, Buffer.from(`{"n":3,"t":"ü"}\n`)]); await wait(400);
	if (await got() !== "1,2,3") fail.push(`${tag}: appended line got ${await got()}`);
	file = Buffer.concat([file, Buffer.from(`{"n":4,"t":"half`)]); await wait(400);   // half-written
	if (await got() !== "1,2,3") fail.push(`${tag}: a half-written line was drawn: ${await got()}`);
	file = Buffer.concat([file, Buffer.from(`way"}\n{"n":5}\n`)]); await wait(400);
	if (await got() !== "1,2,3,4,5") fail.push(`${tag}: finished line got ${await got()}`);
	file = Buffer.concat([file, Buffer.from(`not json\n{"n":6}`)]); await wait(400);   // a bad line, then a last line with no newline
	if (await got() !== "1,2,3,4,5,6") fail.push(`${tag}: bad line / unterminated line got ${await got()}`);
	file = Buffer.concat([file, Buffer.from(`\n{"n":7}\n`)]); await wait(400);
	if (await got() !== "1,2,3,4,5,6,7") fail.push(`${tag}: after unterminated got ${await got()}`);
	const status = await page.evaluate(() => window.$status);
	if (status.filter(k => k === "bad_line").length !== 1) fail.push(`${tag}: bad_line heard ${status.filter(k => k === "bad_line").length} times`);
	if (status.includes("poll_failed")) fail.push(`${tag}: poll_failed heard`);
	if (honour_range){
		if (served.some(s => s.status === 416)) fail.push(`${tag}: an idle poll was a 416`);
		const small = served.slice(1).filter(s => s.bytes <= 1).length;
		if (!small) fail.push(`${tag}: no idle poll was a 1-byte 206 (${JSON.stringify(served.slice(-4))})`);
		if (served.slice(1).some(s => s.bytes > 60)) fail.push(`${tag}: a poll re-sent the file (${JSON.stringify(served.slice(1).filter(s => s.bytes > 60))})`);
	}
	await ctx.close();
	return served.length;
}
const a = await run(true), b = await run(false);
console.log(JSON.stringify({ polls_range: a, polls_no_range: b, fail }));
await Browser.close();
process.exit(fail.length ? 1 : 0);
