import Server from "./Server/Server.js";
import Directory from "./Server/plugins/Directory.js";
import DevSocket from "./Server/plugins/DevSocket/DevSocket.js";
import Runtime from "./Server/plugins/SocketServer/Runtime.js";
import AILogs from "./Server/plugins/AILogs.js";
import Ask from "./Server/plugins/Ask.js";
import MCP from "./Server/plugins/MCP.js";
import Research from "./Server/plugins/Research.js";
import Screenshots from "./Server/plugins/Screenshots.js";
import Start from "./Server/plugins/Start.js";
import Tab from "./Server/plugins/SocketServer/Tab.js";
import Tail from "./Server/plugins/SocketServer/Tail.js";
import Append from "./Server/plugins/SocketServer/Append.js";

DevSocket.Socket.use(Runtime);
DevSocket.Socket.use(Ask);
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

new Server();
