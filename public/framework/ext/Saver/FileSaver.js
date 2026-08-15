import Socket from "/framework/dev/Socket/Socket.js";
import Saver from "./Saver.js";

export default class FileSaver extends Saver {

	// A missing document is `null`, not an error — the first save creates it.
	async load(){
		const response = await fetch(this.path);
		if (!response.ok) return null;

		try {
			return await response.json();
		} catch (error){
			console.warn(`FileSaver: ${this.path} did not parse as JSON — treating it as absent.`, error);
			return null;
		}
	}

	async write(item){
		const socket = Socket.singleton();
		if (socket.disabled) return this.read_only();

		const reply = await socket.async_rpc("write", this.path, JSON.stringify(item, null, "\t"));

		if (reply?.response === "write failed"){
			console.warn(`FileSaver: the server refused to write ${this.path}.`);
			return false;
		}

		return true;
	}

	// Fire and forget: `rm` has a reply nobody waits on, so `true` means sent.
	async delete(){
		const socket = Socket.singleton();
		if (socket.disabled) return this.read_only();

		socket.rpc("rm", this.path);
		return true;
	}

	// ⚠ Static hosting has no dev server. Warn ONCE — a save loop would otherwise
	// fill the console — and never throw: the page stays usable, read-only.
	read_only(){
		if (!FileSaver.warned){
			FileSaver.warned = true;
			console.warn("FileSaver: no dev socket, so nothing is being written. Mount a LocalStorageSaver to persist off localhost.");
		}
		return false;
	}
}

FileSaver.warned = false;
