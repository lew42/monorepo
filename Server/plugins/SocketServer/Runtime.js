import fs from "fs";
import path from "path";
import { exec } from "child_process";

export default class Runtime {

    static setup(socket) {
        new Runtime(socket);
    }

    constructor(socket) {
		console.log("Runtime constructor");
        this.socket = socket;
		this.server = socket.server;
        this.initialize();
    }

    initialize() {
		console.log("Runtime initialized");
        this.socket.on("rpc:write", (args, index) => this.write(...args, index));
        this.socket.on("rpc:ls", (args, index) => this.ls(...args, index));
        this.socket.on("rpc:rm", (args, index) => this.rm(...args, index));
        this.socket.on("rpc:cmd", (args) => this.cmd(...args));
    }

    write(file, data, index) {
        const full_path = path.resolve("./public/", this.to_relative(file));
		try {
			fs.mkdirSync(path.dirname(full_path), { recursive: true });
			// A browser saving a watched file must not reload its own tab mid-edit —
			// the same mute Ask.js and Start.js already use (found by the CMS slice).
			this.socket.socket_server?.live_reload?.mute(full_path, this.socket);
			fs.writeFileSync(full_path, data);
			this.socket.send({ index, response: "write successful" });
		} catch (e) {
			console.error(e);
			this.socket.send({ index, response: "write failed" });
		}
    }

    ls(dir = "./", index) {
        const full_path = path.resolve("./public/", this.to_relative(dir));
        try {
            const files = this.server.directory.build_dir(full_path); // This is a bit messy, build_dir should maybe be in a util
            this.socket.send({ response: files, index });
        } catch (e) {
            if (e.code === "ENOENT") {
                fs.mkdirSync(full_path);
                this.ls(dir, index);
            }
        }
    }

    rm(dir, index) {
        const full_path = path.resolve("./public/", this.to_relative(dir));
        try {
            fs.rmSync(full_path, { recursive: true });
			this.socket.send({ index, response: "rm successful" });
        } catch (e) {
            console.error("Error removing directory:", e);
			this.socket.send({ index, response: "rm failed" });
        }
    }

    cmd(command) {
        exec(command, (error, stdout, stderr) => {
            this.socket.rpc("cmd", stdout || stderr);
        });
    }

    to_relative(filePath) {
        if (path.isAbsolute(filePath)) return `.${filePath}`;
        if (!filePath.startsWith('./') && !filePath.startsWith('../')) return `./${filePath}`;
        return filePath;
    }
}
