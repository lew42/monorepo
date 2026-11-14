// The documents pages: the list, and one live document (a textarea over a DocItem, DocStore.js).
import { div, h2, h3, p, span, a, button, input, textarea } from "/framework/core/View/View.js";
import { DocItem } from "/DocStore.js";

const median = list => { const s = [...list].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };

export function docs_page(app, api){
	const list = div(p.c("muted", "Loading…"));
	const title = input.c("title-input").attr("placeholder", "New document title");
	const draw = docs => list.empty(docs.length ? docs.map(d => div.c("card",
		a.c("doc-link", h3(d.title)).href("/doc/" + d.id).on("click", e => { e.preventDefault(); app.go("/doc/" + d.id); }),
		span.c("muted", "by " + d.owner))) : p.c("muted", "No documents yet."));
	const load = () => api("/docs").then(({ docs }) => draw(docs)).catch(e => list.empty(p.c("error", e.message)));
	load();
	const make = div.c("row", title, button.c("primary", "Create").click(async () => {
		const { doc } = await api("/docs", { title: title.el.value });
		app.go("/doc/" + doc.id);
	}));
	return div(h2("Documents"), p.c("muted", "Open one on two phones to see edits arrive live. One person edits at a time."), make, list);
}

export function doc_page(app, api, id){
	const root = div(h2("Document"), p.c("muted", "Opening…"));
	const me = app.state.user;
	api("/docs").then(({ docs }) => docs.find(d => d.id === id)).then(meta => {
		if (!meta) return root.empty(h2("Document"), p.c("error", "No such document."));
		open_doc(root, app, api, meta, me);
	}).catch(e => root.empty(p.c("error", e.message)));
	return root;
}

async function open_doc(root, app, api, meta, me){
	DocItem.Store.for("doc:" + meta.id).me = me.id;
	let doc;
	try { doc = await DocItem.open("doc:" + meta.id); }
	catch (err){ return root.empty(h2(meta.title), p.c("error", err.message)); }
	const store = doc.store;
	window.live_doc = doc;   // a handle for scripts/live.test.mjs
	const area = textarea.c("doc-text").attr("rows", "14").attr("placeholder", "Start editing, then type here.");
	const bar = div.c("row");
	const stats = div.c("stats muted");
	const status = p.c("muted", "");

	const mine = () => store.can_edit;
	const holder = () => store.lock && store.lock.expires > Date.now() ? store.lock : null;
	const paint = () => {
		const h = holder();
		status.text(!store.connected ? "Reconnecting…" : mine() ? "You are editing. Others see your changes live." : h ? `${h.name} is editing. You are watching live.` : "Nobody is editing.");
		bar.empty(mine()
			? button("Done editing").click(() => { store.release_lock(); })
			: button.c("primary", "Start editing").click(() => store.request_lock()).attr(!store.connected || h ? "disabled" : "data-ok", "1"));
		area.el.readOnly = !mine();
		if (document.activeElement !== area.el || !mine()) area.el.value = doc.get_one("text") ?? "";
		const rtt = median(store.rtts);
		stats.text(`round trip ${store.rtt ?? "–"} ms (median ${rtt ?? "–"}) · last edit from someone else arrived ${store.remote_ms ?? "–"} ms after they sent it · lines saved ${store.seq}`);
	};

	area.on("input", () => { if (mine()) doc.set({ text: area.el.value }); });
	store.on_state(paint);
	doc.on("read", paint);
	const pinger = setInterval(() => { if (!root.el.isConnected) { clearInterval(pinger); return; } store.ping(); }, 2000);
	paint();
	root.empty(h2(meta.title), status, bar, area, stats);
}
