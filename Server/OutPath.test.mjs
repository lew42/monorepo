// node Server/OutPath.test.mjs — OutPath: a git-bash path, a relative path, and a path outside the repo.
import assert from "node:assert/strict";
import path from "node:path";
import OutPath from "./OutPath.mjs";

const root = OutPath.ROOT.replaceAll("\\", "/");
const bash = root.replace(/^([A-Za-z]):/, (_, d) => "/" + d.toLowerCase());
if (process.platform === "win32")
	assert.equal(OutPath.resolve(bash + "/public/x").replaceAll("\\", "/"), root + "/public/x", "git-bash path maps to the drive path");
assert.equal(OutPath.resolve("layout-check-out"), path.resolve("layout-check-out"), "relative path resolves from the cwd");
assert.throws(() => OutPath.resolve(path.join(path.parse(root).root, "stray-outside")), /refusing/, "a path outside the repo is refused");
assert.throws(() => OutPath.resolve("../../elsewhere"), /refusing/);
console.log("OutPath: 3 cases ok");
