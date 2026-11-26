// A tiny stand-in `document` so the Form classes run under node (the pattern of core/View/bind.test.mjs).
// It is only what View needs: elements with children, attributes, classes, listeners that tests can fire.
class FakeEl {
	constructor(tag){
		this.tag = tag; this.kids = []; this.parentNode = null; this.attrs = {}; this.listeners = {};
		this._text = ""; this.value = ""; this.checked = false;
		const set = new Set();
		this.classList = { add: c => set.add(c), remove: c => set.delete(c), contains: c => set.has(c), toString: () => [...set].join(" ") };
		const css = {};
		this.style = new Proxy(css, { get: (o, k) => k === "setProperty" ? (n, v) => { o[n] = v; } : k === "getPropertyValue" ? n => o[n] ?? "" : o[k], set: (o, k, v) => { o[k] = v; return true; } });
	}
	get textContent(){ return this._text + this.kids.map(k => k.textContent).join(""); }
	set textContent(v){ this._text = String(v); this.kids.forEach(k => { k.parentNode = null; }); this.kids = []; }
	get innerHTML(){ return this.textContent; }
	set innerHTML(v){ this.textContent = ""; }
	appendChild(k){ if (k.parentNode) k.parentNode.removeChild(k); k.parentNode = this; this.kids.push(k); return k; }
	append(...a){ a.forEach(x => x instanceof FakeEl ? this.appendChild(x) : (this._text += String(x))); }
	removeChild(k){ this.kids = this.kids.filter(x => x !== k); k.parentNode = null; }
	setAttribute(n, v){ this.attrs[n] = String(v); }
	getAttribute(n){ return this.attrs[n] ?? null; }
	addEventListener(type, fn){ (this.listeners[type] ??= []).push(fn); }
	fire(type){ (this.listeners[type] ?? []).forEach(fn => fn({ target: this })); }
	find(pred, out = []){ if (pred(this)) out.push(this); this.kids.forEach(k => k.find(pred, out)); return out; }
}

export function install(){
	if (typeof document === "undefined") globalThis.document = { createElement: tag => new FakeEl(tag), head: new FakeEl("head") };
}

// A user's click on a radio or checkbox: set it, then fire change.
export function choose(inputEl, checked = true){
	inputEl.checked = checked;
	inputEl.fire("change");
}

// A user typing into a field, or dragging a range.
export function type(el, text){
	el.value = String(text);
	el.fire("input");
}

export { FakeEl };
