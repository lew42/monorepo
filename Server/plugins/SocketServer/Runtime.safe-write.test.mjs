// Runtime.safe_write (F4, design/fixes.md): write tmp, fsync, rename. `node Server/plugins/SocketServer/Runtime.safe-write.test.mjs`
// The research probe killed a real child process mid-`fs.writeFileSync` (5 of 5 runs: a 0-byte file, because writeFileSync
// truncates before it writes a byte). Simulating that with a real SIGKILL would be slow and timing-flaky; the same gap is
// exercised deterministically here by making the write itself throw partway through — from the file's point of view, a
// throw after the truncate and a kill after the truncate look identical: neither finishes writing the new bytes.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Test from "../../../public/framework/core/Test/Test.js";
import Runtime from "./Runtime.js";

const t = new Test("Runtime.safe_write (F4)");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "safe-write-"));
const file = path.join(dir, "doc.json");
const OLD = JSON.stringify({ old: true, n: "x".repeat(1000) });
const real_writeSync = fs.writeSync;

try {
	// The OLD way (writeFileSync): "w" truncates the real file immediately, then a crash before the new bytes land.
	fs.writeFileSync(file, OLD);
	let threw = false;
	try {
		const fd = fs.openSync(file, "w");   // the real file, truncated to 0 right here — same as writeFileSync's own open
		try { throw new Error("simulated crash"); } finally { fs.closeSync(fd); }
	} catch { threw = true; }
	t.ok(threw, "setup: the simulated crash happened");
	t.eq(fs.statSync(file).size, 0, "OLD behaviour (writeFileSync's own truncate-then-write): a crash before the write leaves a 0-byte file");

	// The NEW way (Runtime.safe_write): a crash mid-write must never touch the real file at all.
	fs.writeFileSync(file, OLD);
	fs.writeSync = (fd, data) => { fs.writeSync = real_writeSync; throw new Error("simulated crash"); };
	let threw2 = false;
	try { Runtime.safe_write(file, JSON.stringify({ neu: true })); } catch { threw2 = true; } finally { fs.writeSync = real_writeSync; }
	t.ok(threw2, "setup: the crash hit the new path too, before the rename");
	t.eq(fs.readFileSync(file, "utf8"), OLD, "NEW behaviour: a crash mid-write leaves the OLD file completely untouched (the real path is never opened for writing)");
	t.ok(JSON.parse(fs.readFileSync(file, "utf8")).old === true, "the untouched old file still parses");

	// No crash: the real write still lands, and a clean write leaves no NEW tmp file behind (the earlier crash's own tmp,
	// asserted above as an allowed leftover, may still be in the dir — F4's own "today" note).
	const before_tmps = fs.readdirSync(dir).filter(f => f.includes(".tmp-")).length;
	Runtime.safe_write(file, JSON.stringify({ neu: true }));
	t.eq(JSON.parse(fs.readFileSync(file, "utf8")).neu, true, "a normal write lands the new content");
	t.eq(fs.readdirSync(dir).filter(f => f.includes(".tmp-")).length, before_tmps, "no NEW leftover tmp file after a clean write");
} finally {
	fs.writeSync = real_writeSync;
	fs.rmSync(dir, { recursive: true, force: true });
}
t.done();
