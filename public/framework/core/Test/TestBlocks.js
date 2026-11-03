import View, { div, span, code, details, summary, p } from "../View/View.js";
import { DefaultView } from "../../ux/Content/Object/DefaultView.js";
import Test from "./Test.js";

View.stylesheet(import.meta, "TestBlocks.css");

/**
 * class TestBlocks extends View — a test file run on a page: one block per `test("name", fn)`.
 *
 *   new TestBlocks({ file: "/framework/core/Item/act.test.mjs" })
 *
 * Sets `Test.stage` to itself, imports the file, and its `test()` calls land here. Each block shows the name,
 * every check as a green or red line, and every view `fn` made while it ran (captured, as in a demo). What `fn`
 * returns, and anything given to `t.view(thing, label)`, is drawn in the DefaultView inspector (even when the class has its own View), so each instance opens to its properties. Edge cases (`test.optional`) are closed and
 * labelled; `test.node` ones are listed but not run. Node runs the same file with no page: core/Test/readme.md.
 */
export default class TestBlocks extends View {

	render(){
		this.ac("core-test-blocks");
		this.tally = { tests: 0, checks: 0, failed: 0, edge: 0, skipped: 0 };
		this.$tally = p.c("core-test-blocks-tally", "Running…");
		this.$list = div.c("core-test-blocks-list flex v gap");
		this.run_file();
	}

	async run_file(){
		const prev = Test.stage;
		Test.stage = this;
		try { await import(this.file); await Test.last; }
		catch (e){ this.$list.append(() => div.c("core-test-block is-fail", () => p(`The file did not load: ${e.message}`))); this.tally.failed++; }
		finally { Test.stage = prev ?? null; }
		this.draw_tally(true);
	}

	// Test.stage: the page takes the test. Its block is made now (so blocks keep file order), then it runs in Test's own queue.
	run(entry){
		const block = this.block(entry);
		if (entry.node && !globalThis.process) { block.skip(); this.count(block, null); return Promise.resolve({ ...entry, skipped: true, passed: 0, failed: 0, failures: [], log: [] }); }
		const wrapped = { ...entry, fn: async t => {
			t.block = block;
			View.set_captor(block.$views);   // views made while fn runs (before its first await) land in this block
			let out;
			try { out = entry.fn(t); } finally { View.restore_captor(); }
			out = await out;
			if (out !== undefined && out !== null) this.show(t, out, "returned");
		} };
		return Test.run(wrapped).then(result => { block.finish(result); this.count(block, result); return result; });
	}

	// Test.stage: t.view(thing, label) draws a thing in the test's block.
	show(t, thing, label){
		if ((t.block.shown ??= new Set()).has(thing)) return;   // returned what t.view already drew: once is enough
		t.block.shown.add(thing);
		t.block.$views.append(() => div.c("core-test-block-thing", () => {
			label && span.c("core-test-block-label", label);
			typeof thing === "object" && thing !== null ? new DefaultView({ subject: thing, open: 1 }) : code(String(thing));   // DefaultView even when the class has its own View (Task.View), like TestView
		}));
	}

	block(entry){ let b; this.$list.append(() => { b = new TestBlock({ entry }); }); return b; }

	count(block, result){
		const t = this.tally;
		t.tests++;
		if (!result) t.skipped++;
		else { t.checks += result.passed + result.failed; t.failed += result.failed; }
		if (block.entry.optional) t.edge++;
		this.draw_tally();
	}

	draw_tally(done){
		const t = this.tally;
		this.$tally.empty(() => [
			span.c(t.failed ? "is-fail" : "is-pass", `${t.failed ? "✗" : "✓"} ${t.tests} tests, ${t.checks} checks, ${t.failed} failed`),
			span(` (${t.edge} edge ${t.edge === 1 ? "case" : "cases"}${t.skipped ? `, ${t.skipped} need node` : ""}). `),
			span(done ? "Node runs this same file: " : "Running… "), code(`node public/framework${this.file.replace(/^\/framework/, "")}`),
		]);
	}
}

/**
 * class TestBlock extends View — one test's block: a `<details>` whose summary is the name and verdict, whose body
 * holds the check lines (`$checks`) and the views (`$views`). Edge cases start closed; a failure opens its block.
 */
export class TestBlock extends View {
	render(){
		const e = this.entry;
		this.ac("core-test-block");
		e.optional && this.ac("is-edge");
		this.el.open = !e.optional;
		this.$head = summary.c("core-test-block-head", () => {
			this.$mark = span.c("core-test-block-mark", "…");
			span.c("core-test-block-name", e.name);
			e.optional && span.c("core-test-block-tag", "edge case");
			e.node && span.c("core-test-block-tag", "node only");
			this.$count = span.c("core-test-block-count");
		});
		this.$checks = div.c("core-test-block-checks");
		this.$views = div.c("core-test-block-views flex v gap");
	}

	skip(){
		this.ac("is-skip");
		this.$mark.text("–");
		this.$checks.append(() => p.c("muted", "Needs node (files, the server), so the page does not run it. Run the file in node."));
	}

	finish({ passed, failed, log }){
		this.ac(failed ? "is-fail" : "is-pass");
		this.$mark.text(failed ? "✗" : "✓");
		this.$count.text(`${passed}/${passed + failed}`);
		if (failed) this.el.open = true;
		this.$checks.empty(() => log.forEach(({ ok, msg }) => div.c(ok ? "core-test-block-check is-pass" : "core-test-block-check is-fail", `${ok ? "✓" : "✗"} ${msg}`)));
	}
}

TestBlock.prototype.tag = "details";   // a class field would arrive after the element is made
