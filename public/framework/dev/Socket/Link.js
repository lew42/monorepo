/* THE ONE "is the site's connection down?" state, and how it shows: a quiet dot, or a banner at the top when it matters.
 * Two wires feed it: the dev socket ("dev", dev/Socket/Socket.js) and the live wire to Servex ("servex", ux/Dictate/chat.js).
 * A source reports { why, since, retry, urgent } while it is down and null when it is back. Nothing shows until a source
 * has been down GRACE_MS, so a blip (a tunnel reconnect, a sleeping phone) never flashes it. Then:
 *   - a small amber dot on the rail's AI button (or in the top corner when there is no rail); hover says why, a press retries;
 *   - the full banner with a Reconnect button only while a source's `urgent()` is true (the Servex wire: the mic is live or a
 *     sentence is still sending, so a voice session depends on it). The owner, 2026-11-06: "a subtle status dot, prominent
 *     only while a voice session depends on Servex". Doc: dev/Socket/readme.md. */
const GRACE_MS = 8000;
const sources = new Map();   // name -> { why, since, retry, urgent }
let banner = null, words = null, dot = null, check = null, tick = null, trying_until = 0;

const STYLE = `.dev-wire { position: fixed; inset-block-start: 0; inset-inline: 0; z-index: 1000; display: flex; align-items: center; gap: 0.6em; padding: 0.35em 0.75em; font: 0.85rem system-ui, sans-serif; color: #78350f; background: #fef3c7; border-block-end: 1px solid #f59e0b; }
.dev-wire[hidden], .dev-wire-dot[hidden] { display: none; }
.dev-wire-why { flex: 1; min-inline-size: 0; }
.dev-wire-go { flex: none; font: inherit; font-weight: 600; padding: 0.3em 0.8em; min-block-size: 2rem; color: #fff; background: #1f2937; border: 0; border-radius: 999px; cursor: pointer; }
.dev-wire-dot { position: absolute; inset-block-end: -0.1em; inset-inline-start: -0.15em; inline-size: 0.45em; block-size: 0.45em; border-radius: 50%; background: #f59e0b; box-shadow: 0 0 0 2px var(--bg, #fff); cursor: pointer; }
.dev-wire-dot.dev-wire-corner { position: fixed; inset-block-start: 0.5rem; inset-inline-end: 0.5rem; inset-block-end: auto; inset-inline-start: auto; z-index: 1000; inline-size: 0.6rem; block-size: 0.6rem; }`;

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

	// Does a down source matter right now? A throwing `urgent` counts as not urgent: the dot still shows.
	static urgent(due = Link.due()){
		return due.some(([, s]) => { try { return !!s.urgent?.(); } catch { return false; } });
	}

	static draw(){
		if (typeof document === "undefined") return;
		clearTimeout(check); clearInterval(tick);
		const due = Link.due();
		if (!due.length){
			if (banner) banner.hidden = true;
			if (dot) dot.hidden = true;
			const next = [...sources.values()].map(s => s.since + GRACE_MS).sort((a, b) => a - b)[0];
			if (next) check = setTimeout(() => Link.draw(), Math.max(0, next - Date.now()) + 20);
			return;
		}
		Link.mount();
		if (!banner) return;
		Link.show(due);
		// Each second: the seconds count, and the look (the mic can open or close while a wire is down).
		tick = setInterval(() => sources.size ? Link.show(Link.due()) : clearInterval(tick), 1000);
	}

	// Banner when it matters, dot otherwise. The dot re-mounts if the rail redrew without it.
	static show(due){
		if (!due.length) return;
		const loud = Link.urgent(due);
		banner.hidden = !loud;
		if (!loud) Link.place_dot();
		if (dot) dot.hidden = loud;
		Link.words(due[0]);
	}

	static words([name, s] = []){
		if (!s || !words) return;
		const text = Date.now() < trying_until ? "trying now…" : `${name === "servex" ? "Servex" : "Site"} link down ${Math.round((Date.now() - s.since) / 1000)} s: ${s.why}`;
		words.textContent = text;
		banner.title = `${text}. It retries by itself; press to try now.`;
		if (dot) dot.title = banner.title;
	}

	static mount(){
		if (banner || !document.body) return;
		const style = document.createElement("style");
		style.dataset.devWire = "";
		style.textContent = STYLE;
		document.head.append(style);
		banner = document.createElement("div");
		banner.className = "dev-wire";
		banner.setAttribute("role", "status");
		banner.hidden = true;
		words = document.createElement("span");
		words.className = "dev-wire-why";
		const go = document.createElement("button");
		go.type = "button"; go.className = "dev-wire-go"; go.textContent = "Reconnect";
		go.addEventListener("click", () => Link.retry());
		banner.append(words, go);
		document.body.prepend(banner);
		dot = document.createElement("span");
		dot.className = "dev-wire-dot";
		dot.setAttribute("role", "status");
		dot.hidden = true;
		// Inside the rail's AI button: a press retries and does not also open the sheet.
		dot.addEventListener("click", e => { e.stopPropagation(); e.preventDefault(); Link.retry(); });
	}

	// On the rail's AI button when the page has one (ext/drawer/Sheet.js) and it can be seen, else the top corner of the page.
	// "Seen" is a hit test: on a phone the open sheet covers the rail, and a dot under it tells nobody anything.
	static place_dot(){
		if (!dot) return;
		let icon = document.querySelector(".drawer-rail-ai-icon");
		const r = icon?.getBoundingClientRect();
		if (icon && !(r.width && document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest(".drawer-rail-ai"))) icon = null;
		const home = icon ?? document.body;
		if (dot.parentNode !== home) home.append(dot);
		dot.classList.toggle("dev-wire-corner", !icon);
	}

	// Reconnect (the banner's button or the dot): every down source tries now. A press must never break the page.
	static retry(){
		trying_until = Date.now() + 1500;
		for (const s of sources.values()) try { s.retry?.(); } catch (e){ console.error("Link retry:", e); }
		Link.words(Link.due()[0]);
	}
}
