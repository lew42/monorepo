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
 * A rename is a move inside the same folder. A file and a folder (a page or not) both go through Server/ModuleMove.mjs, which rewrites every link
 * into it, in every file it scans, and keeps the manifest that undoes it. All or nothing: a move that fails puts every link back.
 * A move that worked but could not finish tidying (the parents' lists) still answers ok, with `warnings`, and the Undo stays.
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
		if (this.constructor.RESERVED.has(name.toLowerCase())) throw this.refuse(`${name} is part of the page, so a file cannot be uploaded under that name`);
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
		try { move.mover.check(); } catch (e){ throw this.refuse(`${e.message}, so nothing would be moved`); }   // the refusals apply would make, said now
		return { ok: true, kind: move.kind, from: move.from_url, to: move.to_url, ...move.mover.summary(), ...(move.note ? { note: move.note } : {}) };
	}

	// One scan of the repo (about a second or two, and the server does nothing else meanwhile), shared by the counts and the move.
	move_apply(...args){
		const move = this.work_out(...args);
		const manifest = this.manifest_name(move.name);
		const extra = { name: move.name, to_name: move.to_name, from_parent: this.repo_path(move.from_parent), to_parent: this.repo_path(move.to_parent), declared: move.declared };
		const changes = move.mover.plan(), counts = move.mover.summary(changes), warnings = [];
		let done;
		try { done = move.mover.apply(path.join(this.constructor.MOVES, manifest), extra, changes); }
		catch (e){ throw this.refuse(`could not move ${move.from_url}: ${e.message}`); }
		warnings.push(...(done.warnings ?? []));
		if (move.declared) this.tidy(warnings, "the parent pages' link lines", () => this.declare(move, true));
		this.catch_up(warnings, move.from_parent, move.to_parent);
		return { ok: true, kind: move.kind, from: move.from_url, to: move.to_url, manifest, files: counts.files, paths: counts.paths, links: counts.links, ...(warnings.length ? { warnings } : {}) };
	}

	move_undo(manifest){
		if (typeof manifest !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]*\.json$/.test(manifest)) throw this.refuse("that is not the name of a move record");
		const file = path.join(this.constructor.MOVES, manifest);
		if (!fs.existsSync(file)) throw this.refuse(`there is no move record named ${manifest}`);
		let m; try { m = JSON.parse(fs.readFileSync(file, "utf8")); } catch { throw this.refuse(`${manifest} cannot be read`); }
		if (m.status === "rolled_back") throw this.refuse("that move failed and was rolled back when it happened, so there is nothing to undo");
		const repo = path.dirname(PUBLIC), [from, to] = [m.from, m.to].map(p => this.inside_public(path.join(repo, String(p))));
		if (!from || !to) throw this.refuse(`${manifest} names a path outside public/, so it was not undone`);
		const parents = m.extra?.from_parent !== undefined && m.extra?.to_parent !== undefined ? [m.extra.from_parent, m.extra.to_parent].map(p => this.inside_public(path.join(repo, String(p)))) : [];
		if (parents.some(p => !p)) throw this.refuse(`${manifest} names a parent folder outside public/, so it was not undone`);
		const mover = new ModuleMove(repo, m.from, m.to);
		// Normally the new name is there and the old one is not. A move that stopped half-way (status "moving": links rewritten, folder not moved) is the other way round.
		if (!mover.named(m.to) && !(m.status === "moving" && mover.named(m.from))) throw this.refuse(`cannot undo: ${m.to} is no longer there (it may have been moved again or already undone)`);
		if (mover.named(m.to) && mover.named(m.from)) throw this.refuse(`cannot undo: something is now at ${m.from}`);
		const warnings = [];
		try { ModuleMove.undo(repo, file); }
		catch (e){ throw this.refuse(`could not undo: ${e.message}`); }
		if (m.extra?.declared) this.tidy(warnings, "the parent pages' link lines", () => this.declare({ from_parent: parents[0], to_parent: parents[1], name: m.extra.name, to_name: m.extra.to_name }, false));
		const url = p => m.kind === "file" ? this.url_of(p).slice(0, -1) : this.url_of(p);
		if (parents.length) this.catch_up(warnings, ...parents);
		return { ok: true, kind: m.kind === "file" ? "file" : "page", from: url(to), to: url(from), ...(warnings.length ? { warnings } : {}) };
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
		move.mover = new ModuleMove(path.dirname(PUBLIC), this.repo_path(from), this.repo_path(to));
		if (!is_dir) return move;

		// A parent's page.js can still name its children in a `children: "a b"` string or a `children: ["a", "b"]` list, which nothing rewrites. Refuse rather than leave it pointing nowhere.
		const old_names = this.children_list(from_parent), new_names = this.children_list(to_parent);
		if (old_names?.includes(name)) throw this.refuse(`${this.url_of(from_parent)}page.js names ${name} in its children list, which is not rewritten by a move. Remove ${name} from that list first (or move it by hand), then try again.`);
		if (new_names?.includes(to_name)) throw this.refuse(`${this.url_of(to_parent)}page.js already names ${to_name} in its children list. Remove it from that list first, then try again.`);
		if (new_names && !new_names.includes("auto")) move.note = `${this.url_of(to_parent)}page.js lists its children by name, so ${to_name} will not show in its menu until you add it there.`;

		move.declared = Subpages.listed(path.join(from_parent, "page.jsonl")).includes(name);
		return move;
	}

	// The two parents' file lists, up to date now, and every open tab told. The disk watcher would get there too, but not always (Linux can run out of
	// watches, Windows drops events in a burst), and a rename that does not show in the tab is a rename that looks like it failed. PageFiles compares first, so a
	// line is never doubled; Tail remembers how far each tab has read, so telling it twice sends nothing twice.
	// By now the move has worked, so this never throws: what goes wrong is added to `warnings` (and logged), one folder at a time.
	catch_up(warnings, ...folders){
		for (const dir of new Set(folders)) this.tidy(warnings, `the file list of ${this.url_of(dir)}`, () => {
			PageFiles.settle_folder(dir);
			for (const log of ["files.jsonl", "page.jsonl"]) if (fs.existsSync(path.join(dir, log))) Tail.changed(path.join(dir, log));
		});
	}

	// Run one after-the-move step; if it throws, say so in `warnings` instead of making the finished move look like a failure.
	tidy(warnings, what, step){
		try { step(); }
		catch (e){ console.error(`Files: ${what}:`, e); warnings.push(`The move worked, but ${what} could not be brought up to date (${e.message}). Reload the page; it catches up on the next change.`); }
	}

	// The words of a parent's `children: "a b c"` string or `children: ["a", "b"]` list in page.js (page/kid forms reduced to the folder name), or null.
	children_list(folder){
		let text; try { text = fs.readFileSync(path.join(folder, "page.js"), "utf8"); } catch { return null; }
		const m = /\bchildren\s*:\s*(?:(["'`])([^"'`]*)\1|\[([^\]]*)\])/.exec(text);
		if (!m) return null;
		const words = m[3] !== undefined ? [...m[3].matchAll(/(["'`])([^"'`]*)\1/g)].flatMap(w => w[2].trim().split(/\s+/)) : m[2].trim().split(/\s+/);
		return words.filter(Boolean).map(w => w.replace(/\/page\.(js|jsonl)$/, ""));
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
