import copy from "/join/copy.js";
import { Join } from "/join/Join.js";
import { Backend } from "/join/Backend.js";

const join = new Join(document.getElementById("join"), copy);
join.start(await Backend.detect());
