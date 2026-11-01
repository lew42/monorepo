// The check helper for node tests (X.test.mjs). Portable: no DOM, no node imports. Design: tasks/test-system/plan.md
/**
 * test("name", fn) — one test, the same file in node and on a page. `fn(t)` gets a Test to check with and may be async.
 *   test("a verb is saved once", t => { const task = new Task(); t.view(task); t.eq(task.state, "new"); })
 *   test.optional("edge: a refused verb", fn)   still runs; the page shows it collapsed as an "edge case"
 *   test.node("reads the file", fn)             needs node (fs, the server): the page lists it but does not run it
 * In node the test runs now, in order, and prints PASS/FAIL. On a page `Test.stage` (TestBlocks.js) is set first and
 * takes the test instead: it draws a block per test and every view `fn` makes. Caveats: core/Test/doc/test-fn.md.
 */
export function test(name, fn, flags = {}){
	const entry = { name, fn, optional: false, node: false, ...flags };
	return Test.stage ? Test.stage.run(entry) : Test.run(entry);
}
test.optional = (name, fn) => test(name, fn, { optional: true });
test.node = (name, fn) => test(name, fn, { node: true });

export default class Test {
	static stage = null;   // set by the page (TestBlocks): { run(entry), show(t, thing, label) }
	static last = Promise.resolve();   // tests run one after another
	checks = 0;
	failures = [];
	log = [];   // every check in order: { ok, msg }, for a page to draw

	constructor(name){ this.name = name; }

	ok(cond, msg = "ok"){
		this.checks++;
		this.log.push({ ok: !!cond, msg });
		if (!cond) this.failures.push(msg);
		return !!cond;
	}

	eq(a, b, msg = "equal"){
		return this.ok(Test.same(a, b), `${msg} (got ${Test.show(a)}, wanted ${Test.show(b)})`);
	}

	// fn must throw (or reject); `re` is tested against the message when given.
	async throws(fn, re, msg = "throws"){
		let err;
		try { await fn(); } catch (e){ err = e; }
		return this.ok(err !== undefined && (!re || re.test(String(err?.message ?? err))), `${msg} (${err === undefined ? "did not throw" : "threw " + Test.show(err?.message ?? err)})`);
	}

	// Prints the verdict; in node a failure also sets the exit code the runner reads.
	done(){
		const failed = this.failures.length;
		if (failed) {
			console.log(`FAIL ${this.name}: ${this.failures.join("; ")}`);
			if (globalThis.process) process.exitCode = 1;
		} else console.log(`PASS ${this.name} (${this.checks} checks)`);
		return { name: this.name, passed: this.checks - failed, failed, failures: this.failures, log: this.log };
	}

	// Hand a thing to the page to draw in this test's block (its own view, else the default inspector). In node: nothing to draw, you get it back.
	view(thing, label){ Test.stage?.show(this, thing, label); return thing; }

	// Run one entry {name, fn, optional, node} here, in order after the one before it. A throw is a failure, never a crash.
	static run(entry){
		return Test.last = Test.last.then(async () => {
			const t = new Test(entry.name);
			try { await entry.fn(t); } catch (e){ t.failures.push(`threw ${e?.message ?? e}`); }
			return { ...t.done(), optional: entry.optional, node: entry.node };
		});
	}

	static show(x){ try { return JSON.stringify(x) ?? String(x); } catch { return String(x); } }

	static same(a, b){
		if (Object.is(a, b)) return true;
		if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
		if (Array.isArray(a) !== Array.isArray(b)) return false;
		const ka = Object.keys(a), kb = Object.keys(b);
		return ka.length === kb.length && ka.every(k => Test.same(a[k], b[k]));
	}
}
