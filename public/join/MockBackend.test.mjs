import { test } from "../framework/core/Test/Test.js";

const store = new Map();
globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { MockBackend } = await import("./MockBackend.js");

test("MockBackend walks sign-in, subscribe, sign-out and delete with no server", async t => {
	const b = new MockBackend();
	t.ok(b.mock && b.mode === "mock" && b.client_id === "", "it is the mock, with no Google client id");
	t.eq(await b.me(), { user: null, push: false }, "starts signed out");
	b.login({ name: "Demo", email: "d@e.com" });
	t.eq((await b.me()).user.name, "Demo", "login is remembered");
	await b.subscribe();
	t.eq((await b.me()).push, true, "subscribe sets push");
	await b.unsubscribe();
	t.eq((await b.me()).push, false, "unsubscribe clears it");
	await b.logout();
	t.eq((await b.me()).user, null, "logout signs out");
	b.login({ name: "Demo", email: "d@e.com" });
	t.eq((await b.delete_me()).email, "d@e.com", "delete answers the email, then forgets everything");
	t.eq(await b.me(), { user: null, push: false }, "nothing is left after delete");
});
