// ChatDefaults: the Make default store, with a fake fetch and a fake storage.
// Run: node public/framework/ux/Dictate/ChatDefaults.test.mjs
import { test } from "../../core/Test/Test.js";
import ChatDefaults from "./ChatDefaults.js";

const storage = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };
const reply = body => async () => ({ status: 200, json: async () => body });

test("set POSTs {plugins} to /api/session/defaults and keeps a copy in the browser", async t => {
	const calls = [], st = storage();
	const d = new ChatDefaults({ fetch: async (u, o) => { calls.push([u, o.method, JSON.parse(o.body)]); return { json: async () => ({ ok: true }) }; }, storage: st });
	const out = await d.set({ Interrupt: { config: { threshold: 0.8 } } });
	t.eq(calls, [["/api/session/defaults", "POST", { plugins: { Interrupt: { config: { threshold: 0.8 } } } }]], "one POST with the class values");
	t.eq([out.saved, d.local()], ["servex", { Interrupt: { config: { threshold: 0.8 } } }], "saved at Servex; the browser copy matches");
});

test("get reads Servex; when it cannot, the browser's own copy answers and says so", async t => {
	const st = storage();
	const ok = new ChatDefaults({ fetch: reply({ ok: true, plugins: { ThinkingCue: { enabled: false } } }), storage: st });
	t.eq(await ok.get(), { plugins: { ThinkingCue: { enabled: false } }, from: "servex" }, "from Servex");
	st.setItem(ChatDefaults.KEY, JSON.stringify({ Interrupt: { enabled: false } }));
	const down = new ChatDefaults({ fetch: async () => { throw new Error("offline"); }, storage: st });
	const got = await down.get();
	t.eq([got.from, got.plugins, got.error], ["browser", { Interrupt: { enabled: false } }, "offline"], "fallback, with the reason");
});

test("set with Servex down still keeps the browser copy and reports it", async t => {
	const st = storage();
	const d = new ChatDefaults({ fetch: async () => { throw new Error("offline"); }, storage: st });
	const out = await d.set({ SendAfter: { config: { after: "two" } } });
	t.eq([out.saved, out.error, d.local()], ["browser", "offline", { SendAfter: { config: { after: "two" } } }], "browser only, said plainly");
});
