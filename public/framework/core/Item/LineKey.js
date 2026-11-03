// LineKey: the marks on a saved line's keys (D13), taken off. `start()` is `start`, `#c3` is `c3`. No imports, so a server script,
// a browser view and Item itself all share it. Doc: doc/line-format.md
export default class LineKey {

	// One key, bare: "start()" -> "start", "#c3" -> "c3". Any other key comes back as it is.
	static bare(key){
		if (key.length > 2 && key.endsWith("()")) return key.slice(0, -2);
		if (key.length > 1 && key.charCodeAt(0) === 35) return key.slice(1);
		return key;
	}

	// The line's own keys, bare (one level). A bare key already in the line wins over a marked one. The same object when nothing is marked.
	static unmark(line){
		if (!LineKey.plain(line)) return line;
		let out = null;
		for (const key of Object.keys(line)){
			const bare = LineKey.bare(key);
			if (bare === key) continue;
			out ??= { ...line };
			delete out[key];
			if (!(bare in out)) out[bare] = line[key];
		}
		return out ?? line;
	}

	// Every level bare, through objects and arrays: for a reader that looks things up by bare name at any depth. The same value when nothing is marked.
	static deep(value){
		if (Array.isArray(value)){
			let out = null;
			value.forEach((v, i) => { const d = LineKey.deep(v); if (d !== v){ out ??= [...value]; out[i] = d; } });
			return out ?? value;
		}
		if (!LineKey.plain(value)) return value;
		const top = LineKey.unmark(value);
		let out = top === value ? null : top;
		for (const key of Object.keys(top)){
			const d = LineKey.deep(top[key]);
			if (d !== top[key]){ out ??= { ...top }; out[key] = d; }
		}
		return out ?? value;
	}

	static plain(value){ return !!value && typeof value === "object" && value.constructor === Object; }
}
