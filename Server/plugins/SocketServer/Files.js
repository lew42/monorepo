import fs from "fs";
import path from "path";
import crypto from "crypto";
import Subpages from "../../../Servex/agents/Subpages.js";
import ModuleMove from "../../ModuleMove.mjs";
import PageFiles from "../PageFiles.js";
import Tail from "./Tail.js";

const PUBLIC = path.resolve("public");

/* FILES — what the Files tab (core/Page/FilesTab.js) asks the dev server to do to a page's folder. Three messages on the dev socket:
 *
 *   page_add(folder_url, name, title)                          make a child page (Servex/agents/Subpages.js does the work)
 *   upload(folder_url, name, base64, {part, of})               save a file, sent in parts; the last part finishes it
 *   set_aside(folder_url, name)                                move a file or folder into <folder>/_removed/ (never deleted)
 *   move_plan(folder_url, name, to_folder_url, to_name)        a dry run of a rename or move: what moves, how many links in other files change; writes nothing
 *   move_apply(folder_url, name, to_folder_url, to_name)       do it, write a manifest in Server/moves/, answer with its name
 *   move_undo(manifest)                                        replay a manifest backwards
 *   list_folders(folder_url)                                   the folders inside one folder (for the "Move to…" picker); "/" is allowed here
 *
 * A rename is a move inside the same folder. A file is renamed with a plain rename. A folder (a page or not) goes through
 * Server/ModuleMove.mjs, which rewrites every link into it, in every file it scans, and keeps the manifest that undoes it.
 *
 * Each answers `{ index, response }`, the response being `{ ok: true, … }` or `{ ok: false, reason: "a sentence" }`.
 * Nothing here tells other tabs: the files change on disk, PageFiles (Server/plugins/PageFiles.js) appends the list line,
 * and every open Files tab hears it through Tail. Only a local peer can send these (Socket.js refuses a LAN one).
 * What is stored where, and why this shape: core/Page/doc/files.md. */
export default class Files {

	static MAX_BYTES = 25 * 1024 * 1024;   // one upload; the doc's recommended cap (files.md, question 2)
	static RESERVED = new Set(["page.js", "page.jsonl", "files.jsonl", "_removed"]);   // set_aside refuses these (any capitals: NTFS and macOS do not tell them apart): they are the page itself
	static MOVES = path.join(path.dirname(PUBLIC), "Server", "moves");   // one JSON manifest per move: the undo. Committed on purpose (files.md, question 4). Tests point this at a temp folder.
	static FOLDER_NAME = /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/;   // a folder is a url: letters, digits, - _ and . only (a file name may be freer)
	static DEVICE = /^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i;   // Windows device names, also with an extension (nul.txt): a file cannot be made under them

	static setup(socket){ new Files(socket); }

	// Stamp for a set-aside folder name, like Subpages.remove: 20261031-120000
	static stamp(){ return new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15); }

	uploads = new Map();   // "<folder>/<name>" -> { tmp, next, of, bytes }: the uploads this socket has under way

	constructor(socket){
		this.socket = socket;
		for (const verb of ["page_add", "upload", "set_aside", "move_plan", "move_apply", "move_undo", "list_folders"])
			socket.on(`rpc:${verb}`, (args = [], index) => {
				let response;
				try { response = this[verb](...args); }
				catch (e){ response = { ok: false, reason: e.reason ?? `${verb} failed: ${e.message}` }; if (!e.reason) console.error(`Files.${verb}:`, e); }
				socket.send({ index, response });
			});
		socket.on("closed", () => this.abandon_all());
	}

	// ---- the three messages ----

	page_add(folder_url, name, title){
		const folder = this.folder(folder_url);
		try { return Subpages.at(this.url_of(folder), { root: path.dirname(PUBLIC) }).add({ name, title: String(title || name) }); }
		catch (e){ throw this.refuse(e.message.replace(folder, this.url_of(folder))); }
	}

	upload(folder_url, name, base64, meta = {}){
		const folder = this.folder(folder_url);
		this.check_name(name);
		const { part, of } = meta;
		if (!Number.isInteger(part) || !Number.isInteger(of) || part < 0 || of < 1 || part >= of) throw this.refuse("upload needs {part, of}: whole numbers, part counted from 0");
		if (typeof base64 !== "string" || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) throw this.refuse("upload part is not base64");

		const key = path.join(folder, name);
		let state = this.uploads.get(key);
		if (part === 0){
			this.abandon(key);   // a fresh start replaces an unfinished try of the same file
			state = { tmp: path.join(folder, `.${name}.${crypto.randomBytes(4).toString("hex")}.part`), next: 0, of, bytes: 0 };
			this.uploads.set(key, state);
		}
		if (!state || state.next !== part || state.of !== of){
			this.abandon(key);
			throw this.refuse(`upload parts must arrive in order: expected part ${state ? state.next : 0}, got ${part}`);
		}

		const bytes = Buffer.from(base64, "base64");
		state.bytes += bytes.length;
		if (state.bytes > this.constructor.MAX_BYTES){
			this.abandon(key);
			throw this.refuse(`${name} is too big: the limit is ${Math.round(this.constructor.MAX_BYTES / 1024 / 1024)} MB`);
		}
		try { fs.appendFileSync(state.tmp, bytes); }   // part 0 creates it; a dot name, so PageFiles ignores it until it is renamed
		catch (e){ this.abandon(key); throw this.refuse(`could not write ${name}: ${e.message}`); }
		state.next++;
		if (state.next < of) return { ok: true, part };

		this.uploads.delete(key);
		const saved = this.finish(state.tmp, folder, name);
		return { ok: true, name: saved, kept_both: saved !== name, bytes: state.bytes };
	}

	set_aside(folder_url, name){
		const folder = this.folder(folder_url);
		this.check_name(name);
		if (this.constructor.RESERVED.has(name.toLowerCase())) throw this.refuse(`${name} is part of the page and cannot be set aside here`);
		const from = path.join(folder, name);
		if (!fs.existsSync(from)) throw this.refuse(`nothing named ${name} in this folder`);

		// A child page goes through Subpages.remove, which also writes its `gone` line (one implementation, not two).
		if (fs.existsSync(path.join(from, "page.jsonl")) && /^[a-z0-9-]+$/.test(name) && new Subpages(folder).kind){
			const done = new Subpages(folder).remove(name);
			return { ok: true, moved_to: done.moves[0].to.slice(folder.length + 1) };
		}
		const aside = this.free(path.join(folder, "_removed", `${name}-${this.constructor.stamp()}`));
		const to = fs.statSync(from).isDirectory() ? aside : path.join(aside, name);
		fs.mkdirSync(path.dirname(to), { recursive: true });
		fs.renameSync(from, to);
		return { ok: true, moved_to: path.relative(folder, to).split(path.sep).join("/") };
	}

	// ---- rename and move ----

	list_folders(folder_url){
		const folder = this.folder(folder_url, { root_ok: true });
		const folders = fs.readdirSync(folder, { withFileTypes: true })
			.filter(e => e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== "_removed")
			.map(e => ({ name: e.name, page: this.is_page(path.join(folder, e.name)) }))
			.sort((a, b) => b.page - a.page || a.name.localeCompare(b.name));
		return { ok: true, url: this.url_of(folder), page: this.is_page(folder), folders };
	}

	move_plan(...args){
		const move = this.work_out(...args);
		if (move.kind === "file") return { ok: true, kind: "file", from: move.from_url, to: move.to_url };
		return { ok: true, kind: move.kind, from: move.from_url, to: move.to_url, ...move.mover.summary(), ...(move.note ? { note: move.note } : {}) };
	}

	move_apply(...args){
		const move = this.work_out(...args);
		const manifest = this.manifest_name(move.name);
		const extra = { name: move.name, to_name: move.to_name, from_parent: this.repo_path(move.from_parent), to_parent: this.repo_path(move.to_parent), declared: move.declared };
		const file = path.join(this.constructor.MOVES, manifest);
		let counts = {};
		if (move.kind === "file"){
			fs.mkdirSync(this.constructor.MOVES, { recursive: true });
			const rel = { from: this.repo_path(move.from), to: this.repo_path(move.to) };
			fs.writeFileSync(file, JSON.stringify({ at: new Date().toISOString(), kind: "file", ...rel, extra }, null, "\t") + "\n");
			fs.renameSync(move.from, move.to);
		} else {
			counts = move.mover.summary();
			try { move.mover.apply(file, extra); }
			catch (e){ throw this.refuse(`could not move ${move.from_url}: ${e.message}`); }
			if (move.declared) this.declare(move, true);
		}
		this.catch_up(move.from_parent, move.to_parent);
		return { ok: true, kind: move.kind, from: move.from_url, to: move.to_url, manifest, ...(counts.paths === undefined ? {} : { files: counts.files, paths: counts.paths, links: counts.links }) };
	}

	move_undo(manifest){
		if (typeof manifest !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]*\.json$/.test(manifest)) throw this.refuse("that is not the name of a move record");
		const file = path.join(this.constructor.MOVES, manifest);
		if (!fs.existsSync(file)) throw this.refuse(`there is no move record named ${manifest}`);
		let m; try { m = JSON.parse(fs.readFileSync(file, "utf8")); } catch { throw this.refuse(`${manifest} cannot be read`); }
		const repo = path.dirname(PUBLIC), [from, to] = [m.from, m.to].map(p => this.inside_public(path.join(repo, String(p))));
		if (!from || !to) throw this.refuse(`${manifest} names a path outside public/, so it was not undone`);
		if (!fs.existsSync(to)) throw this.refuse(`cannot undo: ${m.to} is no longer there (it may have been moved again or already undone)`);
		if (fs.existsSync(from)) throw this.refuse(`cannot undo: something is now at ${m.from}`);
		try {
			if (m.kind === "file") fs.renameSync(to, from);
			else ModuleMove.undo(repo, file);
		} catch (e){ throw this.refuse(`could not undo: ${e.message}`); }
		if (m.extra?.declared) this.declare({ from_parent: path.join(repo, m.extra.from_parent), to_parent: path.join(repo, m.extra.to_parent), name: m.extra.name, to_name: m.extra.to_name }, false);
		const url = p => m.kind === "file" ? this.url_of(p).slice(0, -1) : this.url_of(p);
		if (m.extra) this.catch_up(path.join(repo, m.extra.from_parent), path.join(repo, m.extra.to_parent));
		return { ok: true, kind: m.kind === "file" ? "file" : "page", from: url(to), to: url(from) };
	}

	// Every check for one rename or move, in the order a person would hit them. Returns what the three verbs need; throws a sentence.
	work_out(folder_url, name, to_folder_url, to_name){
		to_name ??= name;
		const from_parent = this.folder(folder_url), to_parent = this.folder(to_folder_url);
		for (const n of [name, to_name]){
			this.check_name(n);
			if (this.constructor.RESERVED.has(n.toLowerCase())) throw this.refuse(`${n} is part of the page and cannot be renamed or moved here`);
		}
		const from = path.join(from_parent, name), to = path.join(to_parent, to_name);
		let stat; try { stat = fs.lstatSync(from); } catch { throw this.refuse(`nothing named ${name} in ${this.url_of(from_parent)}`); }
		if (stat.isSymbolicLink()) throw this.refuse(`${name} is a link to somewhere else, and links are not moved here`);
		const is_dir = stat.isDirectory(), kind = !is_dir ? "file" : this.is_page(from) ? "page" : "folder";

		if (is_dir && to_name !== name && !this.constructor.FOLDER_NAME.test(to_name))
			throw this.refuse(`"${to_name}" cannot be a folder name: use letters, digits, - and _ (a folder is part of a page's url)`);
		if (from === to) throw this.refuse(`${name} is already called that`);
		const real = fs.realpathSync(from), into = fs.realpathSync(to_parent);
		if (is_dir && (into === real || into.startsWith(real + path.sep))) throw this.refuse(`${name}/ cannot be moved into itself`);
		if (fs.readdirSync(to_parent).some(n => n.toLowerCase() === to_name.toLowerCase() && path.join(to_parent, n) !== from))
			throw this.refuse(`${to_name} already exists in ${this.url_of(to_parent)}, so nothing was moved. Rename one of them first.`);

		const move = { kind, name, to_name, from, to, from_parent, to_parent, from_url: this.url_of(from_parent) + name + (is_dir ? "/" : ""), to_url: this.url_of(to_parent) + to_name + (is_dir ? "/" : "") };
		if (!is_dir) return move;

		// A parent's page.js can still name its children in a `children: "a b"` string, which nothing rewrites. Refuse rather than leave it pointing nowhere.
		const old_names = this.children_string(from_parent), new_names = this.children_string(to_parent);
		if (old_names?.includes(name)) throw this.refuse(`${this.url_of(from_parent)}page.js names ${name} in its children: "…" list, which is not rewritten by a move. Remove ${name} from that list first (or move it by hand), then try again.`);
		if (new_names?.includes(to_name)) throw this.refuse(`${this.url_of(to_parent)}page.js already names ${to_name} in its children: "…" list. Remove it from that list first, then try again.`);
		if (new_names && !new_names.includes("auto")) move.note = `${this.url_of(to_parent)}page.js lists its children by name, so ${to_name} will not show in its menu until you add it there.`;

		move.declared = Subpages.listed(path.join(from_parent, "page.jsonl")).includes(name);
		move.mover = new ModuleMove(path.dirname(PUBLIC), this.repo_path(from), this.repo_path(to));
		return move;
	}

	// The two parents' file lists, up to date now, and every open tab told. The disk watcher would get there too, but not always (Linux can run out of
	// watches, Windows drops events in a burst), and a rename that does not show in the tab is a rename that looks like it failed. PageFiles compares first, so a
	// line is never doubled; Tail remembers how far each tab has read, so telling it twice sends nothing twice.
	catch_up(...folders){
		for (const dir of new Set(folders)){
			PageFiles.settle_folder(dir);
			for (const log of ["files.jsonl", "page.jsonl"]) if (fs.existsSync(path.join(dir, log))) Tail.changed(path.join(dir, log));
		}
	}

	// The words of a legacy `children: "a b c"` string in a folder's page.js (page/kid forms reduced to the folder name), or null.
	children_string(folder){
		let text; try { text = fs.readFileSync(path.join(folder, "page.js"), "utf8"); } catch { return null; }
		const m = /\bchildren\s*:\s*(["'`])([^"'`]*)\1/.exec(text);
		return m ? m[2].trim().split(/\s+/).filter(Boolean).map(w => w.replace(/\/page\.(js|jsonl)$/, "")) : null;
	}

	// The parents' link lines for a page that moves: the old parent forgets it, the new one lists it. Only for a page the old parent declared
	// with a {"file":"name/page.jsonl"} line (Subpages), and only into a parent that is a page. PageFiles writes its own list lines too; it compares first, so nothing doubles.
	declare({ from_parent, to_parent, name, to_name }, forward){
		const [leaving, arriving] = forward ? [from_parent, to_parent] : [to_parent, from_parent];
		const [leave_name, arrive_name] = forward ? [name, to_name] : [to_name, name];
		new Subpages(leaving).append({ file: `${leave_name}/page.jsonl`, gone: true });
		if (new Subpages(arriving).kind) new Subpages(arriving).append({ file: `${arrive_name}/page.jsonl` });
	}

	manifest_name(name){ return `${new Date().toISOString().replace(/[-:.]/g, "")}-${name.replace(/[^A-Za-z0-9_-]/g, "_")}-${crypto.randomBytes(2).toString("hex")}.json`; }
	is_page(dir){ return fs.existsSync(path.join(dir, "page.js")) || fs.existsSync(path.join(dir, "page.jsonl")); }
	repo_path(abs){ return path.relative(path.dirname(PUBLIC), abs).split(path.sep).join("/"); }
	inside_public(abs){ const r = path.resolve(abs); return r.startsWith(PUBLIC + path.sep) ? r : null; }

	// ---- the checks: every path comes from the browser, so each one proves it stays inside public/ ----

	// A url like "/notes/trip/" -> the absolute folder, which must exist, be a folder and really (symlinks resolved) sit inside public/.
	folder(url, { root_ok = false } = {}){
		const parts = String(url ?? "").split("/").filter(Boolean);
		if (!parts.length && root_ok && String(url) === "/") return PUBLIC;
		if (!parts.length || parts.some(s => s === ".." || s === "." || s.startsWith(".") || s === "node_modules" || /[\\\0]/.test(s)))
			throw this.refuse(`${url} is not a page folder under public/`);
		const full = path.resolve(PUBLIC, ...parts);
		if (full !== PUBLIC && !full.startsWith(PUBLIC + path.sep)) throw this.refuse(`${url} is outside public/`);
		let real; try { real = fs.realpathSync(full); } catch { throw this.refuse(`there is no folder at ${url}`); }
		if (real !== fs.realpathSync(PUBLIC) && !real.startsWith(fs.realpathSync(PUBLIC) + path.sep)) throw this.refuse(`${url} leads outside public/`);
		if (!fs.statSync(real).isDirectory()) throw this.refuse(`${url} is not a folder`);
		return full;
	}

	// One file name, never a path: no slashes, no leading dot (PageFiles ignores those), nothing Windows cannot save (no : * ? " < > |,
	// no trailing dot or space, no device names like CON or nul.txt).
	check_name(name){
		if (typeof name !== "string" || !name.trim() || name.length > 150) throw this.refuse("a file name is needed, up to 150 characters");
		if (/[\\/:*?"<>|\0-\x1f]/.test(name) || name.startsWith(".") || /[. ]$/.test(name)) throw this.refuse(`"${name}" cannot be a file name here: no slashes, no : * ? " < > |, and it cannot start with a dot or end with a dot or space`);
		if (this.constructor.DEVICE.test(name)) throw this.refuse(`"${name}" is a reserved Windows device name (CON, PRN, AUX, NUL, COM1-9, LPT1-9, with or without an extension) and cannot be a file name here`);
	}

	// ---- small helpers ----

	// The name to save as: `name`, else `name (2).ext`, `name (3).ext`. A hard link fails if the name exists, so a file is never overwritten.
	// A disk that cannot link (FAT, exFAT, some network drives) gets a copy that also fails if the name exists (COPYFILE_EXCL).
	finish(tmp, folder, name){
		const { name: stem, ext } = path.parse(name);
		for (let n = 1; ; n++){
			const candidate = n === 1 ? name : `${stem} (${n}).${ext.slice(1)}`.replace(/\.$/, "");
			try { fs.linkSync(tmp, path.join(folder, candidate)); fs.unlinkSync(tmp); return candidate; }
			catch (e){
				if (e.code === "EEXIST") continue;
				try { fs.copyFileSync(tmp, path.join(folder, candidate), fs.constants.COPYFILE_EXCL); this.drop(tmp); return candidate; }
				catch (c){ if (c.code !== "EEXIST") { this.drop(tmp); throw this.refuse(`could not save ${name}: ${c.message}`); } }
			}
		}
	}

	free(dest){ let out = dest; for (let n = 2; fs.existsSync(out); n++) out = `${dest}-${n}`; return out; }

	abandon(key){ const state = this.uploads.get(key); if (state) this.drop(state.tmp); this.uploads.delete(key); }
	abandon_all(){ for (const key of [...this.uploads.keys()]) this.abandon(key); }
	drop(tmp){ try { fs.unlinkSync(tmp); } catch {} }   // only ever our own half-written .part file

	url_of(folder){ return "/" + path.relative(PUBLIC, folder).split(path.sep).join("/") + "/"; }
	refuse(reason){ const e = new Error(reason); e.reason = reason; return e; }
}
