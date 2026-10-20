/* The real dev server — every plugin, wired up. This used to be the whole of
 * `server.js` at the repo root; it moved here so `server.js` could become the
 * supervisor (below) without the plugin wiring living two places. Nothing in
 * this file changed except the import paths, now relative to Server/ instead
 * of the repo root. `NO_SUPERVISE=1 node server.js` runs this file directly,
 * in-process, exactly as `node server.js` always has. */
import Server from "./Server.js";
import Directory from "./plugins/Directory.js";
import MentionSync from "./plugins/MentionSync.js";   // auto-syncs ext/Mention/maps/refs.js's icon — Server/plugins/MentionSync.js
import PageFiles from "./plugins/PageFiles.js";
import DevSource from "./plugins/DevSource.js";   // read-only Servex/Server browsing — Server/plugins/DevSource.js
import DevSocket from "./plugins/DevSocket/DevSocket.js";
import Runtime from "./plugins/SocketServer/Runtime.js";
import AILogs from "./plugins/AILogs.js";
import QueryServer from "../public/framework/ext/Query/QueryServer.mjs";
import "./SessionIndex.mjs";   // registers the "tasks" query source (Server/doc/session-index.md)
import AISessionTailer, { AISessionSub } from "../public/framework/ai/AISession/AISessionTailer.mjs";
import Ask, { AskRoute } from "./plugins/Ask.js";
import CardAnswer from "./plugins/CardAnswer.js";
import MCP from "./plugins/MCP.js";
import Recordings from "./plugins/Recordings.js";
import Research from "./plugins/Research.js";
import Screenshots from "./plugins/Screenshots.js";
import ServexProxy from "./plugins/ServexProxy.js";
import Start from "./plugins/Start.js";
import Push from "./plugins/Push.js";   // Web Push for the notifications lab � Server/plugins/Push.js
import Whisper from "./plugins/Whisper.js";
import HttpsLan from "./plugins/HttpsLan.js";   // https beside http for the phone mic - Server/plugins/HttpsLan.js
import Tab from "./plugins/SocketServer/Tab.js";
import Tail from "./plugins/SocketServer/Tail.js";
import Append from "./plugins/SocketServer/Append.js";
import DatedFiles from "./DatedFiles.mjs";

DevSocket.Socket.use(Runtime);
DevSocket.Socket.use(Ask);
DevSocket.Socket.use(CardAnswer);
DevSocket.Socket.use(Start);
DevSocket.Socket.use(Tab);
DevSocket.Socket.use(AISessionSub);   // pushes changed session snapshots - ai/AISession/AISessionTailer.mjs
DevSocket.Socket.use(QueryServer);   // rpc:query over in-memory sources - ext/Query
DevSocket.Socket.use(Tail);
DevSocket.Socket.use(Append);
DevSocket.Socket.use(DatedFiles);   // rpc:dated_create / dated_move / dated_query - Server/DatedFiles.mjs
Server.use(DevSocket);
Server.use(Directory);
Server.use(MentionSync);
Server.use(PageFiles);   // appends {"file"} lines to page.jsonl — Server/plugins/PageFiles.js
Server.use(DevSource);   // /devsource.json + /devsource/<path> — Servex/Server source, read-only
Server.use(AILogs);
Server.use(AISessionTailer);   // follows transcripts, writes index.json files - ai/AISession/AISessionIndex.mjs
Server.use(MCP);
Server.use(Recordings);
Server.use(Research);   // registers its tools on MCP — after it
Server.use(Screenshots);
Server.use(Push);
Server.use(Whisper);    // starts whisper-server for ux/Dictate — Server/plugins/Whisper.js
Server.use(HttpsLan);
Server.use(ServexProxy);   // /servex/* → Servex, for a phone on the LAN — Server/plugins/ServexProxy.js
Server.use(AskRoute);   // POST /ask/turn — the AI drawer's one Claude turn, for a phone on the LAN — Server/plugins/Ask.js

new Server();

// The creation log (lifecycle, 2026-09-29): this child's own start and end, beside its
// server.js wrapper's. Never blocks or fails the boot. Servex/Lifecycle.js.
import("../Servex/Lifecycle.js").then(m => m.track("server", `run.js:${process.pid}`, { port: Number(process.env.PORT) || null })).catch(() => {});
