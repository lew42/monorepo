import { Page } from "/app.js";
import { numbered } from "../number.js";

/* 1.* — see `../number.js`: the related scroll of every 1-column distribution, and
   one full-screen page under it per entry. */
export default new Page(numbered({ meta: import.meta, n: 1 }));
