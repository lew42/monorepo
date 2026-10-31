import fs from "fs";
import path from "path";
import crypto from "crypto";
import Subpages from "../../../Servex/agents/Subpages.js";

const PUBLIC = path.resolve("public");

/* FILES — what the Files tab (core/Page/FilesTab.js) asks the dev server to do to a page's folder. Three messages on the dev socket:
 *
 *   page_add(folder_url, name, title)                          make a child page (Servex/agents/Subpages.js does the work)
 *   upload(folder_url, name, base64, {part, of})               save a file, sent in parts; the last part finishes it
 *   set_aside(folder_url, name)                                move a file or folder into <folder>/_removed/ (never deleted)
 *
 * Each answers `{ index, response }`, the response being `{ ok: true, … }` or `{ ok: false, reason: "a sentence" }`.
 * Nothing here tells other tabs: the files change on disk, PageFiles (Server/plugins/PageFiles.js) appends the list line,
 * and every open Files tab hears it through Tail. Only a local peer can send these (Socket.js refuses a LAN one).
 * What is stored where, and why this shape: core/Page/doc/files.md. */
export default class Files {

	static MAX_BYTES = 25 * 1024 * 1024;   // one upload; the doc's recommended cap (files.md, question 2)
	static RESERVED = new Set(["page.js", "page.jsonl", "files.jsonl", "_removed"]);   // set_aside refuses these (any capitals: NTFS and macOS do not tell them apart): they are the page itself
	static DEVICE = /^(con|prn|aux|nul|com\d|lpt\d)(\..*)?$/i;   // Windows device names, also with an extension (nul.txt): a file cannot be made under them

	static setup(socket){ new Files(socket); }

	// Stamp for a set-aside folder name, like Subpages.remove: 20261031-120000
	static stamp(){ return new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15); }

	uploads = new Map();   // "<folder>/<name>" -> { tmp, next, of, bytes }: the uploads this socket has under way

	constructor(socket){
		this.socket = socket;
		for (const verb of ["page_add", "upload", "set_aside"])
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

	// ---- the checks: every path comes from the browser, so each one proves it stays inside public/ ----

	// A url like "/notes/trip/" -> the absolute folder, which must exist, be a folder and really (symlinks resolved) sit inside public/.
	folder(url){
		const parts = String(url ?? "").split("/").filter(Boolean);
		if (!parts.length || parts.some(s => s === ".." || s === "." || s.startsWith(".") || s === "node_modules" || /[\\\0]/.test(s)))
			throw this.refuse(`${url} is not a page folder under public/`);
		const full = path.resolve(PUBLIC, ...parts);
		if (!full.startsWith(PUBLIC + path.sep)) throw this.refuse(`${url} is outside public/`);
		let real; try { real = fs.realpathSync(full); } catch { throw this.refuse(`there is no folder at ${url}`); }
		if (!real.startsWith(fs.realpathSync(PUBLIC) + path.sep)) throw this.refuse(`${url} leads outside public/`);
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
