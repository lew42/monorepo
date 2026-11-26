// GoogleButton: with no client id it is a mock that fires `signin` with a fake user and says so on screen.
// Node: `node public/framework/ux/Auth/GoogleButton.test.mjs`. Node has no DOM, so a tiny stand-in `document` is made below.
import { test } from "../../core/Test/Test.js";

class FakeEl {
	constructor(tag){ this.tag = tag; this.kids = []; this.parentNode = null; this._text = ""; this.style = {}; this.attrs = {}; this.handlers = {};
		const set = new Set(); this.classList = { add: (...c) => c.forEach(x => set.add(x)), remove: c => set.delete(c), contains: c => set.has(c), toString: () => [...set].join(" ") }; }
	get textContent(){ return this._text + this.kids.map(k => k.textContent).join(""); }
	set textContent(v){ this._text = String(v); this.kids = []; }
	appendChild(k){ k.parentNode = this; this.kids.push(k); return k; }
	append(...a){ a.forEach(x => x instanceof FakeEl ? this.appendChild(x) : (this._text += String(x))); }
	setAttribute(n, v){ this.attrs[n] = v; }
	getAttribute(n){ return this.attrs[n] ?? null; }
	addEventListener(type, fn){ (this.handlers[type] ??= []).push(fn); }
	dispatchEvent(e){ (this.handlers[e.type] ?? []).forEach(fn => fn(e)); return true; }
	set innerHTML(v){ this.kids = []; this._text = ""; }
	get innerHTML(){ return this._text; }
	get children(){ return this.kids; }
	click(){ this.dispatchEvent({ type: "click" }); }
	find(pred){ for (const k of this.kids){ if (pred(k)) return k; const hit = k.find?.(pred); if (hit) return hit; } return null; }
}
if (typeof document === "undefined") globalThis.document = { createElement: tag => new FakeEl(tag), head: new FakeEl("head") };

const { GoogleButton } = await import("./GoogleButton.js");

test("with client_id \"\" it is a mock: a press fires signin with the fake user and says so", t => {
	const btn = new GoogleButton({ client_id: "" });
	const seen = [];
	btn.el.addEventListener("signin", e => seen.push(e));
	t.ok(btn.el.classList.contains("ux-auth-google"), "it wears its class");
	t.ok(btn.el.classList.contains("ux-auth-google-light"), "light is the default theme");
	t.eq(btn.label, "Continue with Google", "the default wording is one Google allows");
	t.eq(btn.$note.text(), "", "no note before a press");
	btn.$button.el.click();
	t.eq(seen.length, 1, "one signin event fired");
	t.eq(seen[0].detail.mock, true, "it says the sign-in is a mock");
	t.eq(seen[0].detail.user, GoogleButton.fake_user, "the fake user came with it");
	t.ok(btn.$note.text().includes("no Google client id"), "the screen says why it is a mock");
	t.ok(!btn.real, "it never became the real button");
});

test("the dark theme and the three wordings are Google's own", t => {
	const btn = new GoogleButton({ client_id: "", theme: "dark", label: "Sign in with Google" });
	t.ok(btn.el.classList.contains("ux-auth-google-dark"), "dark wears the dark class");
	t.eq(GoogleButton.labels.length, 3, "exactly three wordings");
	t.ok(GoogleButton.labels.every(l => GoogleButton.gsi_text[l]), "each wording maps to a Google text value");
});

test("a failure is shown in the error colour, and the next message clears it", t => {
	const btn = new GoogleButton({ client_id: "" });
	btn.say("could not load Google sign-in", true);
	t.ok(btn.$note.el.classList.contains("ux-auth-google-bad"), "a failure wears the error class");
	btn.say("Signed in.");
	t.ok(!btn.$note.el.classList.contains("ux-auth-google-bad"), "a plain message drops it");
});
