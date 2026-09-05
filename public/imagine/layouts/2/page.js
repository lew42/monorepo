import { Page } from "/app.js";
import { numbered } from "../number.js";

/* 2.* — see `../number.js`: the related scroll of every 2-column distribution, and
   one full-screen page under it per entry. */
export default new Page(numbered({ meta: import.meta, n: 2 }));
