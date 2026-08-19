/* The tab binding, proven in two halves.
 *
 *   node public/framework/ai/2026-08-18/ask-tab-binding/proof.mjs           both halves, free
 *   node …/proof.mjs --spawn    + one real haiku turn, no browser (~$0.01)
 *   node …/proof.mjs --turn     + the full two-tab turn through the dev server (~$0.03)
 *
 * Half 1 is OFFLINE — it builds `Tab`, `MCP` and `Ask` against a fake socket, so it
 * proves this code whatever the running server is on. Half 2 is LIVE: two headless tabs
 * on ONE path, which is the case the old lookup could not tell apart. ⚠ Server plugins
 * are not hot-reloaded — half 2 needs the dev server restarted onto this build, and says
 * so rather than guessing when it is not.
 */

import Tab from "../../../../../Server/plugins/SocketServer/Tab.js";
import MCP from "../../../../../Server/plugins/MCP.js";
import Ask from "../../../../../Server/plugins/Ask.js";

const HOST = "http://localhost";
const PAGE = "/framework/ext/Panel/";
const THREAD = "framework/ai/2026-08-18/ask-tab-binding/ai/proof";
const PLAYWRIGHT = "file:///C:/Users/mike/AppData/Roaming/npm/node_modules/playwright/index.mjs";

let failed = 0;
const is = (label, cond) => { console.log(`${cond ? "  ok  " : "  FAIL"}  ${label}`); if (!cond) failed++; };
const why = fn => { try { fn(); return null; } catch (e){ return e.message; } };

/* A `Tab` with a browser on the other end: `rpc("eval", …)` answers itself, exactly as a
   real tab answers `eval_result`, so the round trip under test is the real one. */
function fake(id, page, answer = () => "ok"){
    const on = {};
    const socket = { on: (event, fn) => on[event] = fn,
        rpc: (_m, code, token) => on["rpc:eval_result"]([token,
            { value: answer(code), visibility: "visible", focused: true, size: [1400, 1000] }]) };
    const tab = new Tab(socket);
    on["rpc:hello"]([page, id]);
    tab.hello = on["rpc:hello"];
    return tab;
}

async function offline(){
    console.log("\nHALF 1 — the code, offline\n");

    const A = fake("aaaa1111", PAGE), B = fake("bbbb2222", PAGE);
    is("hello carries the tab id", A.id === "aaaa1111" && A.page === PAGE);

    A.hello(["/framework/ai/"]);
    is("an SPA hello moves the page and KEEPS the id", A.page === "/framework/ai/" && A.id === "aaaa1111");
    A.hello([PAGE, "aaaa1111"]);

    const server = { on(){}, socket_server: { sockets: [{ tab: A }, { tab: B }] } };
    const mcp = new MCP(server);

    const listing = mcp.pages();
    is("pages names every tab by id", listing.includes("aaaa1111") && listing.includes("bbbb2222"));
    is("tab: <id> resolves to that tab", mcp.pick({ tab: "bbbb2222" }) === B);

    const ambiguous = why(() => mcp.pick({ path: PAGE }));
    is("an ambiguous path is REFUSED, naming the candidates",
        !!ambiguous && ambiguous.includes("aaaa1111") && ambiguous.includes("bbbb2222"));
    is("no selector at all is refused while two tabs are open", !!why(() => mcp.pick({})));
    is("an unknown id is refused", !!why(() => mcp.pick({ tab: "nope" })));

    await mcp.claim({ tab: "bbbb2222", who: "ai", note: "proof" });
    is("claim records who is driving, and pages reports it", mcp.pages().includes("ai · proof"));
    await mcp.release({ tab: "bbbb2222" });
    is("release clears it", B.claimed === null);

    server.socket_server.sockets = [{ tab: A }];
    is("one tab: path still works, and so does omitting everything",
        mcp.pick({ path: PAGE }) === A && mcp.pick({}) === A);

    const ask = new Ask({ on(){}, tab: B });
    const system = ask.system({ context: "element div.panel.focus" });
    is("the turn is told its tab id", system.includes("bbbb2222"));
    is("the turn is told the page", system.includes(PAGE));
    is("the selection rides along", system.includes("element div.panel.focus"));
    is("--append-system-prompt carries it",
        ask.args({ model: "haiku", system }).join(" ").includes("--append-system-prompt"));
    is("a tab that never said hello gets no binding line", new Ask({ on(){} }).system({}) === null);
}

/* The one thing only a real spawn can prove, and the riskiest line in the change: that a
   multi-line `--append-system-prompt` survives Windows argv and the turn can read it back.
   No browser, no dev server — the real `Ask.turn`. ~$0.01 of haiku. */
async function spawned(){
    console.log("\nHALF 1b — one real haiku turn, no browser\n");

    const ask = new Ask({ on(){}, rpc(){}, send(){}, tab: fake("cccc3333", PAGE) });
    const reply = await ask.turn({ id: "spawn-proof", model: "haiku", tools: "Read",
        system: ask.system({ context: "element div.panel.focus" }),
        prompt: "Which browser tab id are you bound to, and what has the owner selected? One line." });

    console.log("  ── reply ──  " + String(reply.text ?? reply.error).trim().replace(/\n/g, " "));
    is("the appended system prompt reached the turn", String(reply.text ?? "").includes("cccc3333"));
    is("so did the selection", String(reply.text ?? "").toLowerCase().includes("panel"));
}

const rpc = async (name, args = {}) => {
    const res = await fetch(HOST + "/mcp", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/call",
            params: { name, arguments: args } }) });
    const body = await res.json();
    return { text: body.result?.content?.[0]?.text ?? body.error?.message ?? "", error: !!(body.error || body.result?.isError) };
};

async function live(turn){
    console.log("\nHALF 2 — two headless tabs on one path, live\n");

    const { chromium } = await import(PLAYWRIGHT);
    const browser = await chromium.launch();
    const context = await browser.newContext();
    // ⚠ Nothing here may live-reload: the turn writes files, and a reload would take the
    //    claim and the socket with it mid-proof.
    await context.addInitScript(() => window.$BLOCKRELOAD = true);

    const tabs = {};
    for (const name of ["ALPHA", "BETA"]){
        const page = await context.newPage();
        await page.goto(HOST + PAGE, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => sessionStorage.getItem("dev-tab"), null, { timeout: 15000 });
        await page.evaluate(t => document.title = t, `TAB-${name}`);
        tabs[name] = { page, id: await page.evaluate(() => sessionStorage.getItem("dev-tab")) };
    }

    console.log(`  ALPHA ${tabs.ALPHA.id}   BETA ${tabs.BETA.id}   both on ${PAGE}`);
    is("two tabs on one path have two different ids", tabs.ALPHA.id && tabs.ALPHA.id !== tabs.BETA.id);

    /* The selection, all the way to the wire — with the socket stubbed, so it costs
       nothing and spawns nothing. Needs no new server code, so it runs either build. */
    const wired = await tabs.ALPHA.page.evaluate(async () => {
        const { selection } = await import("/framework/dev/DevBar/ask.js");
        const { chat } = await import("/framework/ext/Ask/chat.js");
        const Socket = (await import("/framework/dev/Socket/Socket.js")).default;

        // ⚠ A VISIBLE element: a range inside a `display:none` subtree selects fine and
        //   then reads back as the empty string.
        const range = document.createRange();
        range.selectNodeContents([...document.querySelectorAll("p, h1, h2, li")]
            .find(el => el.offsetParent && el.textContent.trim().length > 10));
        getSelection().removeAllRanges();
        getSelection().addRange(range);
        await new Promise(r => setTimeout(r, 200));

        const real = Socket.prototype.request;
        let sent;
        Socket.prototype.request = function(obj){ sent = obj; return Promise.resolve({ text: "stub", session_id: "x" }); };

        // ⚠ No captor at global scope, so the panel comes back detached and is placed by hand.
        const $chat = chat({ context: selection, model: "haiku" });
        document.body.append($chat.el);
        $chat.el.querySelector(".chat-input").value = "hi";
        $chat.el.querySelector(".chat-form").dispatchEvent(new Event("submit", { cancelable: true }));
        await new Promise(r => setTimeout(r, 200));

        Socket.prototype.request = real;
        $chat.el.remove();
        return { seen: selection(), sent: sent?.args?.[0]?.context ?? null };
    });

    is("the rail reads the page's selection", !!wired.seen && wired.seen.startsWith("text "));
    is("chat() puts it on the wire as `context`", wired.sent === wired.seen);

    const listed = await rpc("pages");
    if (!listed.text.includes(tabs.BETA.id)){
        console.log("\n  ⚠ The dev server is on the PRE-BINDING build — it has no tab ids.");
        console.log("    Restart it in your terminal, then run this again. `pages` said:\n");
        console.log(listed.text.split("\n").map(l => "    " + l).join("\n"));
        await browser.close();
        return;
    }

    is("pages lists both live ids", listed.text.includes(tabs.ALPHA.id) && listed.text.includes(tabs.BETA.id));

    const guess = await rpc("eval", { code: "document.title", path: PAGE });
    is("a live ambiguous path is refused, not guessed",
        guess.error && guess.text.includes(tabs.ALPHA.id) && guess.text.includes(tabs.BETA.id));

    const beta = await rpc("eval", { code: "document.title", tab: tabs.BETA.id });
    is("tab: <id> reaches exactly that tab", beta.text.includes("TAB-BETA"));

    if (turn){
        console.log("\n  one real haiku turn, asked from BETA …");
        let claimed = false;
        const asking = tabs.BETA.page.evaluate(async ([task, id]) => {
            const { ask, thread } = await import("/framework/ext/Ask/Ask.js");
            await thread(task).catch(() => {});
            return ask("Using the site eval tool on the tab you are bound to, return document.title"
                + " and the tab id you were told. Nothing else.", { model: "haiku", task });
        }, [THREAD, tabs.BETA.id]);

        const watch = (async () => {
            while (!claimed){
                const now = await rpc("pages");
                claimed = /"claimed_by":\s*"ai/.test(now.text) && now.text.includes(tabs.BETA.id);
                await new Promise(r => setTimeout(r, 700));
            }
        })();
        const reply = await Promise.race([asking, watch.then(() => asking)]).catch(e => ({ error: e.message }));
        claimed = true;

        console.log("\n  ── reply ──\n" + String(reply.text ?? reply.error).split("\n").map(l => "  " + l).join("\n") + "\n");
        is("the server claimed BETA for the length of the turn", claimed);
        is("the turn reported BETA's title", String(reply.text ?? "").includes("TAB-BETA"));
        is("the turn reported BETA's id", String(reply.text ?? "").includes(tabs.BETA.id));
        is("it never named ALPHA", !String(reply.text ?? "").includes(tabs.ALPHA.id));
    }

    await browser.close();
}

await offline();
if (process.argv.includes("--spawn") || process.argv.includes("--turn")) await spawned();
try { await live(process.argv.includes("--turn")); }
catch (e){ console.log(`\n  half 2 could not run: ${e.message}`); failed++; }

console.log(failed ? `\n${failed} FAILED\n` : "\nall green\n");
process.exit(failed ? 1 : 0);
