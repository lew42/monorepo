/* THE ONE "is the site's connection down?" state, and its one banner at the top of the page.
 * Two wires feed it: the dev socket ("dev", dev/Socket/Socket.js) and the live wire to Servex ("servex", ux/Dictate/chat.js).
 * A source reports { why, since, retry } while it is down and null when it is back. The banner shows only once a source
 * has been down GRACE_MS, so a blip (a tunnel reconnect, a sleeping phone) never flashes it. Doc: dev/Socket/readme.md. */
const GRACE_MS = 8000;
const sources = new Map();   // name -> { why, since, retry }
let banner = null, words = null, check = null, tick = null, trying_until = 0;

const STYLE = `.dev-link { position: fixed; inset-block-start: 0; inset-inline: 0; z-index: 1000; display: flex; align-items: center; gap: 0.6em; padding: 0.35em 0.75em; font: 0.85rem system-ui, sans-serif; color: #78350f; background: #fef3c7; border-block-end: 1px solid #f59e0b; }
.dev-link[hidden] { display: none; }
.dev-link-why { flex: 1; min-inline-size: 0; }
.dev-link-go { flex: none; font: inherit; font-weight: 600; padding: 0.3em 0.8em; min-block-size: 2rem; color: #fff; background: #1f2937; border: 0; border-radius: 999px; cursor: pointer; }`;

export default class Link {
	static GRACE_MS = GRACE_MS;

	// A source says it is down (state) or back (null). A source already down keeps its first `since`.
	static report(name, state){
		const old = sources.get(name);
		if (state) sources.set(name, { ...state, since: old?.since ?? state.since ?? Date.now() });
		else sources.delete(name);
		Link.draw();
	}

	// The sources down long enough to count, longest first.
	static due(){
		return [...sources].filter(([, s]) => Date.now() - s.since >= GRACE_MS).sort((a, b) => a[1].since - b[1].since);
	}

	static draw(){
		if (typeof document === "undefined") return;
		clearTimeout(check); clearInterval(tick);
		const due = Link.due();
		if (!due.length){
			if (banner) banner.hidden = true;
			const next = [...sources.values()].map(s => s.since + GRACE_MS).sort((a, b) => a - b)[0];
			if (next) check = setTimeout(() => Link.draw(), Math.max(0, next - Date.now()) + 20);
			return;
		}
		Link.mount();
		if (!banner) return;
		banner.hidden = false;
		Link.words(due[0]);
		tick = setInterval(() => sources.size ? Link.words(Link.due()[0]) : clearInterval(tick), 1000);
	}

	static words([name, s] = []){
		if (!s || !words) return;
		const text = Date.now() < trying_until ? "trying now…" : `${name === "servex" ? "Servex" : "Site"} link down ${Math.round((Date.now() - s.since) / 1000)} s: ${s.why}`;
		words.textContent = text;
		banner.title = `${text}. It retries by itself; press to try now.`;
	}

	static mount(){
		if (banner || !document.body) return;
		const style = document.createElement("style");
		style.dataset.devLink = "";
		style.textContent = STYLE;
		document.head.append(style);
		banner = document.createElement("div");
		banner.className = "dev-link";
		banner.setAttribute("role", "status");
		words = document.createElement("span");
		words.className = "dev-link-why";
		const go = document.createElement("button");
		go.type = "button"; go.className = "dev-link-go"; go.textContent = "Reconnect";
		go.addEventListener("click", () => Link.retry());
		banner.append(words, go);
		document.body.prepend(banner);
	}

	// The Reconnect button: every down source tries now. A press must never break the page.
	static retry(){
		trying_until = Date.now() + 1500;
		for (const s of sources.values()) try { s.retry?.(); } catch (e){ console.error("Link retry:", e); }
		Link.words(Link.due()[0]);
	}
}
