// The check helper for node tests (X.test.mjs). Portable: no DOM, no node imports. Design: tasks/test-system/plan.md
export default class Test {
	checks = 0;
	failures = [];

	constructor(name){ this.name = name; }

	ok(cond, msg = "ok"){
		this.checks++;
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
		return { name: this.name, passed: this.checks - failed, failed, failures: this.failures };
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
