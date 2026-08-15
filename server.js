import Server from "./Server/Server.js";
import Directory from "./Server/plugins/Directory.js";
import DevSocket from "./Server/plugins/DevSocket/DevSocket.js";
import Runtime from "./Server/plugins/SocketServer/Runtime.js";
import AILogs from "./Server/plugins/AILogs.js";
import Ask from "./Server/plugins/Ask.js";
import Start from "./Server/plugins/Start.js";

DevSocket.Socket.use(Runtime);
DevSocket.Socket.use(Ask);
DevSocket.Socket.use(Start);
Server.use(DevSocket);
Server.use(Directory);
Server.use(AILogs);

new Server();
