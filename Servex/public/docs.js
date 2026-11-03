import { div, a, p, h1, h2, pre, code, style } from "/framework/core/View/View.js";
import md from "/framework/ext/markdown/md.js";

/* THE DOCS TAB — every module under Servex/ and Server/ that has a readme.md,
 * browsable at /docs/<path>/. A list on the left (fetched once from
 * /api/docs), the picked module's readme + doc/*.md + demo.js on the right
 * (fetched from /api/docs/file). No App, no Router here — same reasoning as
 * servex.js: this tool is not part of the site. `servex.js` owns the actual
 * URL routing (pushState/popstate) and just tells this view which module path
 * is current, through the `.select(path)` method attached below. */

style(`
.servex-docs { display: flex; flex-wrap: wrap; gap: 1.2em; align-items: flex-start; padding: 1em 1.4em 3em; }
.servex-docs-list { flex: 1 1 14rem; min-width: 0; display: flex; flex-direction: column; gap: 0.15em; }
.servex-docs-item { color: #9ecbff; text-decoration: none; padding: 0.3em 0.5em; border-radius: 4px; font-size: 0.82em; word-break: break-all; }
.servex-docs-item:hover { background: #1b1f27; }
.servex-docs-item.on { background: #1b1f27; color: #e6edf3; font-weight: 600; }
.servex-docs-body { flex: 3 1 40rem; min-width: 0; color: #c9d1d9; }
.servex-docs-body h1 { margin-top: 0; }
.servex-docs-h2 { margin: 1.4em 0 0.4em; font-size: 0.8em; color: #8b93a1; text-transform: uppercase; letter-spacing: 0.05em; }
.servex-docs-empty, .servex-docs-error { color: #8b93a1; }
.servex-docs-demo { background: #14171d; border: 1px solid #2b313c; border-radius: 8px; padding: 0.7em 0.8em; overflow: auto; font-size: 0.78em; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
`);

// `navigate` is servex.js's own pushState helper — passed in rather than
// imported, so this file never imports the file that imports it.
export function Docs(navigate){
	let modules = null, current = null;
	let $list, $body;

	const view = div.c("servex-docs", () => {
		$list = div.c("servex-docs-list");
		$body = div.c("servex-docs-body");
	});

	async function ensure_modules(){
		if (modules) return modules;

		$list.empty(() => p.c("servex-docs-empty", "Loading modules…"));
		try {
			const resp = await fetch("/api/docs");
			modules = resp.ok ? await resp.json() : [];
		} catch {
			modules = [];
		}
		return modules;
	}

	function render_list(){
		$list.empty(() => {
			if (!modules.length){
				p.c("servex-docs-empty", "No documented modules found.");
				return;
			}
			modules.forEach(mod => {
				a.c("servex-docs-item" + (mod.path === current ? " on" : ""), mod.path)
					.href(`/docs/${mod.path}/`)
					.click(e => { e.preventDefault(); navigate(`/docs/${mod.path}/`); });
			});
		});
	}

	// One fetch, one shape: {ok, status, error, text}. Every render below reads
	// this instead of touching `fetch` directly.
	async function fetch_file(mod_path, file){
		try {
			const resp = await fetch(`/api/docs/file?path=${encodeURIComponent(mod_path)}&file=${encodeURIComponent(file)}`);
			if (!resp.ok){
				const body = await resp.json().catch(() => ({}));
				return { ok: false, status: resp.status, error: body.error || `${resp.status}` };
			}
			return { ok: true, text: await resp.text() };
		} catch (error) {
			return { ok: false, status: 0, error: error.message };
		}
	}

	// Same tone as md.file()'s own fallback: a 404 reads as "nobody wrote this
	// yet", not as a broken page.
	async function append_doc(mod_path, file, label){
		const result = await fetch_file(mod_path, file);
		$body.append(() => {
			if (result.ok) md(result.text);
			else p.c("servex-docs-error", result.status === 404
				? `Not written yet — ${label}`
				: `Error loading ${label}: ${result.error}`);
		});
	}

	// Shown as read-only source, never executed: Servex has no App/Router to
	// host a live demo in, and building one is bigger than this tab.
	async function append_demo(mod_path){
		h2.c("servex-docs-h2", "Demo source").append_to($body);
		const result = await fetch_file(mod_path, "demo.js");

		$body.append(() => {
			if (result.ok) pre.c("servex-docs-demo", () => { code(result.text); });
			else p.c("servex-docs-error", result.status === 404
				? "Not written yet — demo.js"
				: `Error loading demo.js: ${result.error}`);
		});
	}

	async function render_body(mod_path){
		if (!mod_path){
			$body.empty(() => p.c("servex-docs-empty", "Pick a module on the left."));
			return;
		}

		const mod = modules.find(m => m.path === mod_path);
		if (!mod){
			$body.empty(() => p.c("servex-docs-error", `Unknown module: ${mod_path}`));
			return;
		}

		$body.empty(() => { h1(mod.path); });

		if (mod.readme) await append_doc(mod_path, "readme.md", "readme.md");
		for (const name of mod.docs || []){
			h2.c("servex-docs-h2", name.replace(/\.md$/, "")).append_to($body);
			await append_doc(mod_path, `doc/${name}`, `doc/${name}`);
		}
		if (mod.demo) await append_demo(mod_path);
	}

	// The one thing servex.js's route() calls: "show this path now" — on first
	// load, on a click, and on Back/Forward alike, so all three land the same.
	view.select = async function(mod_path){
		current = mod_path || "";
		await ensure_modules();
		render_list();
		await render_body(current);
	};

	return view;
}
