/* The real dev server — every plugin, wired up. This used to be the whole of
 * `server.js` at the repo root; it moved here so `server.js` could become the
 * supervisor (below) without the plugin wiring living two places. Nothing in
 * this file changed except the import paths, now relative to Server/ instead
 * of the repo root. `NO_SUPERVISE=1 node server.js` runs this file directly,
 * in-process, exactly as `node server.js` always has. */
import Server from "./Server.js";
import Directory from "./plugins/Directory.js";
import DevSocket from "./plugins/DevSocket/DevSocket.js";
import Runtime from "./plugins/SocketServer/Runtime.js";
import AILogs from "./plugins/AILogs.js";
import Ask from "./plugins/Ask.js";
import CardAnswer from "./plugins/CardAnswer.js";
import MCP from "./plugins/MCP.js";
import Research from "./plugins/Research.js";
import Screenshots from "./plugins/Screenshots.js";
import Start from "./plugins/Start.js";
import Whisper from "./plugins/Whisper.js";
import Tab from "./plugins/SocketServer/Tab.js";
import Tail from "./plugins/SocketServer/Tail.js";
import Append from "./plugins/SocketServer/Append.js";

DevSocket.Socket.use(Runtime);
DevSocket.Socket.use(Ask);
DevSocket.Socket.use(CardAnswer);
DevSocket.Socket.use(Start);
DevSocket.Socket.use(Tab);
DevSocket.Socket.use(Tail);
DevSocket.Socket.use(Append);
Server.use(DevSocket);
Server.use(Directory);
Server.use(AILogs);
Server.use(MCP);
Server.use(Research);   // registers its tools on MCP — after it
Server.use(Screenshots);
Server.use(Whisper);    // starts whisper-server for ux/Dictate — Server/plugins/Whisper.js

new Server();
