import app, { el, div, p, h1, h2, a, code } from "/app.js";

// app.$body.ac("theme-1");


div.c("page", () => {

    app.nav();
    
    h1("Hello World");
    
    p("The GitHub repo: ", a("https://github.com/lew42/monorepo").href("https://github.com/lew42/monorepo"))
    
    p("The Cloudflare URL: ", a("https://monorepo.lew42.workers.dev").href("https://monorepo.lew42.workers.dev"));
    
    
    h2("Next Task");
    
    p("All pages have been merged into main.  Make sure to `git switch main` and `git pull` before re-branching.")
    
    p("For this next project, you can use your 5 hours for the week, but please try to make it worthwhile!");
    
    p("Inside your `/<name>/` directories, you should make `/<name>/framework/` and `/<name>/styles/` to start documenting the basic framework usage (basically just `class View` and `class App`), and basic styles (html, forms, flex, grid.  See the `framework.css` and see if you can build something with these styles).  You can make note of any framework improvements you would suggest, as you go.  Try to focus on the new user experience, what are the basic things they need to know to use this framework?");
    
    p("My goal has always been for this framework to be the simplest, easiest way to get started with web development, and I think we're pretty close.  However, as you have seen, just getting basic pages and navigation to work is a bit tricky.  Let's focus on the new-user experience here.  If we want more users (newbies and pros) to contribute, how do we make this look and feel better?  Simpler, cleaner, better.")
    
    p("Your directory is your place to build.  Don't modify files outside of your directory.  Notice I added `app.$body.ac('theme-1')` to all pages and sub pages.  This is so, by default, there are only `framework.css` styles, and everything is opt-in.  I like this minimalism approach.  You can create your own stylesheets, and import them with `app.stylesheet('/<name>/styles.css')`.  You can create your own classes and either extend View or just create a class with a `.render()` method.");
    
    p("If you're feeling ambitious, you could try to create a `class Page`.  I've tried a few times, but it's tricky.  Right now, we can just put `p()` inside a `page.js`, but that means you can't import that `page.js` without it auto-rendering.  Creating a `history.pushState()` router is another goal, but figuring out how/when to activate and load pages dynamically is another trick. Anyway, I gtg, good luck!")
    
    h2("Notes");
    
    a("Git Branch Names").href("/notes/git-branch-names");
});