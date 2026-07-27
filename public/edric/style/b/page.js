import { p, a, app } from "/app.js";

app.$body.ac("theme-1");

export default {

    link(){
        return a.c("page-link", "/edric/style/b/").href("/edric/style/b/"); // abs path? !! MUST RETURN
    },

    render(){
        a.c("page-back", "Back").href("../");
        p("This is the rest of the content for b");
    }
}
