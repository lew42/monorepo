import View, { div, pre, code } from "../../core/View/View.js";
import grip from "../grip/grip.js";
import FsFile from "../filesystem/FsFile.js";
import Dir from "../filesystem/Dir.js";
import { context_menu } from "../filesystem/menu.js";

View.stylesheet(import.meta, "files.css");

// API and options: doc/files-notes.md
export default function files(meta, names, { about, route = "file", fill, open = Infinity, select, lines } = {}){
	const paths = names.trim().split(/\s+/).filter(Boolean);
	const cut = common_dir(paths);
	const state = { path: (select && paths.includes(select)) ? select : paths[0] };
	const me = { born: Date.now() };

	const short = path => path.slice(cut);
	const full = name => paths.find(path => short(path) === name);

	const owns = () => {
		if (!route) return false;
		const held = claim.me;
		if (held?.el?.isConnected) held.seen = true;
		const stale = !held || (!held.el?.isConnected && (held.seen || Date.now() - held.born > 3000));
		if (held === me || stale) claim.me = me;
		return claim.me === me;
	};

	const read = () => { state.path = full(new URLSearchParams(location.search).get(route)) ?? state.path; };

	const write = () => {
		if (!owns()) return;
		const q = new URLSearchParams(location.search);
		const value = state.path === paths[0] ? "" : short(state.path);
		value ? q.set(route, value) : q.delete(route);
		const url = location.pathname + (q.size ? "?" + q : "") + location.hash;
		if (url !== location.pathname + location.search + location.hash) history.pushState(history.state, "", url);
	};

	if (owns()) read();

	let $tree, $source, $about;

	// Warn: mark updates without redraw to preserve scroll position of clicked row.
	const mark = () => $tree.el.isConnected && $tree.el.querySelectorAll(".file-name")
		.forEach(row => row.classList.toggle("selected", row.dataset.path === state.path));

	const draw_source = () => {
		const drawn = source(meta, state.path, lines);
		$source.empty(() => drawn);
		if (about) $about.empty(() => about(state.path));
		if (lines) Promise.resolve(drawn).then(() => requestAnimationFrame(() => mark_lines($source)));
		if (lines) watch_lines($source);
	};

	const show = path => {
		state.path = path;
		write();
		mark();
		draw_source();
	};

	const $box = div.c("files", () => {
		div.c("files-row", () => {
			div.c("files-col files-col-tree", $col => {
				$tree = tree(paths, cut, state.path, open);
				grip({ from: "start", write: px => { $col.style("--files-col-w", px + "px"); return px; } });
			}).on("click", e => {
				const row = e.target.closest(".file-name");
				if (row) show(row.dataset.path);
			}).on("contextmenu", e => {
				const row = e.target.closest(".file-name");
				if (!row) return;
				e.preventDefault();
				const root_path = new URL(row.dataset.path, meta.url).pathname.replace(/^\/+/, "");
				context_menu(root_path, e.clientX, e.clientY);
			});

			if (about) div.c("files-col files-col-about", $col => {
				$about = div.c("file-about", () => about(state.path));
				grip({ from: "start", write: px => { $col.style("--files-col-w", px + "px"); return px; } });
			});

			div.c("files-col files-col-source", () => {
				$source = div.c("file-source", () => source(meta, state.path));
			});
		});
	}).ac(fill && "files-fill");

	me.el = $box.el;
	window.addEventListener("popstate", () => {
		if (!$box.el.isConnected || !owns()) return;
		read();
		mark();
		draw_source();
	});

	return $box;
}

export const tree = (paths, cut, selected, open = Infinity) => {
	const to = selected ? selected.slice(cut) : null;
	return div.c("file-tree", () => rows(nest(paths, cut), selected, to, 0, open, ""));
};

// Warn: nest() shape must stay plain `{ name, path }` for ext/Doc's note_tree() compatibility.
function rows(node, selected, to, depth, open, prefix){
	for (const [name, child] of Object.entries(node)){
		if (typeof child === "string"){
			new FsFile({ name, path: child }).render().ac(child === selected && "selected");
			continue;
		}

		const path = prefix + name + "/";
		const opened = depth < open || (to && to.startsWith(path));
		let built = false;
		let $body;

		div.c("file-dir" + (opened ? " open" : ""), $dir => {
			new Dir({ name, path }).render()
				.on("click", () => {
					if ($dir.tc("open").hc("open") && !built){
						built = true;
						$body.append(() => rows(child, selected, to, depth + 1, open, path));
					}
				});

			$body = div.c("file-dir-body");
			if (opened){
				built = true;
				$body.append(() => rows(child, selected, to, depth + 1, open, path));
			}
		});
	}
}

export function source(meta, path, lines){
	if (code.file)
		return code.file(meta, path, { lines });

	return pre.c("code-block", () => code().append(
		fetch(new URL(path, meta.url).href)
			.then(resp => resp.ok ? resp.text() : `Error loading ${path}: ${resp.status} ${resp.statusText}`)));
}

export function mark_lines($host){
	$host.el.querySelectorAll(".code-line.line-hit").forEach(el => el.classList.remove("line-hit"));

	const m = location.hash.match(/^#L(\d+)(?:-L?(\d+))?$/);
	if (!m) return;

	const from = Number(m[1]);
	const to = m[2] ? Math.max(Number(m[2]), from) : from;
	let $first;

	for (let n = from; n <= to; n++){
		const el = $host.el.querySelector(`.code-line[data-line="${n}"]`);
		if (el){ el.classList.add("line-hit"); $first ??= el; }
	}

	$first?.scrollIntoView({ block: "center" });
}

const hosts = new Set();
let wired = false;

export function watch_lines($host){
	hosts.add($host);
	if (wired) return;
	wired = true;

	window.addEventListener("hashchange", () => {
		for (const $h of hosts){
			// Warn: isConnected != visible; checkVisibility() reads CSS, not just DOM tree.
			if (!$h.el.isConnected) hosts.delete($h);
			else if ($h.el.checkVisibility ? $h.el.checkVisibility() : $h.el.offsetParent !== null) mark_lines($h);
		}
	});
}

export function common_dir(paths){
	const dirs = paths.map(path => path.split("/").slice(0, -1));
	let shared = 0;

	while (dirs.length && dirs.every(dir => dir[shared] && dir[shared] === dirs[0][shared]))
		shared++;

	return (dirs[0] ?? []).slice(0, shared).reduce((n, seg) => n + seg.length + 1, 0);
}

export function nest(paths, cut){
	const root = {};

	paths.forEach(path => {
		let sub = path.slice(cut);
		if (sub.includes("..")){
			const parts = sub.split("/");
			const resolved = [];
			for (const p of parts){
				if (p === "..") resolved.pop();
				else if (p && p !== ".") resolved.push(p);
			}
			sub = resolved.join("/");
		}
		const segments = sub.split("/");
		const file = segments.pop();
		let node = root;

		segments.filter(Boolean).forEach(dir => node = node[dir] ??= {});

		if (file) node[file] = path;
	});

	return root;
}

const claim = {};

export { files };
