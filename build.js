#!/usr/bin/env node
/**
 * Bundles LectureDoc2's browser code into `dist/`.
 *
 * Until now every file under `src/` and `components/` was both the source and
 * the thing a deck loaded, which is why LectureDoc2 could have no runtime
 * dependencies: a browser cannot resolve `@lecturedoc2/libcrypto`. Bundling
 * lifts that restriction, and with it the need to keep private copies of code
 * that already exists as a package -- `src/js/ld-crypto.js` was one, the quiz
 * component would have been the next.
 *
 * The output mirrors the input layout, so the deck-facing paths change in
 * exactly one place (`ld.path` and `ld.modules` in `myst.yml`):
 *
 *   dist/
 *   ├── src/ld.js, src/chunk-*.js   the runtime and its lazily loaded parts
 *   ├── src/ld.css, src/css/        stylesheets, copied and minified in place
 *   ├── src/js/ld-help.frag.html    non-module resources of the runtime
 *   ├── components/*.js             the optional modules a deck can pull in
 *   ├── components/timeline.css     see EXTRA_COPIES
 *   └── ext/, favicon/              third-party assets, copied verbatim
 *
 * Usage: node build.js [--watch] [--minify] [--clean]
 *
 * `--clean` removes `dist/` and stops - the build's own first step, exposed as
 * `pnpm run clean`.
 */

import * as esbuild from "esbuild";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, "dist");

const WATCH = process.argv.includes("--watch");
const CLEAN = process.argv.includes("--clean");
const MINIFY =
    process.argv.includes("--minify") || process.env.NODE_ENV === "production";

/**
 * Every module a deck may load with its own `<script>` tag.
 *
 * Listed rather than globbed, because being an entry point is a statement about
 * the public surface and not about where a file happens to sit:
 * `components/timeline/timeline.js` is a `.js` file under `components/` and is
 * emphatically not something a deck should load directly.
 */
const ENTRY_POINTS = [
    "src/ld.js",
    "src/css/themes/DHBW/animated-logo.js",
    "components/ld-embedded-iframe.js",
    "components/ld-group-assignment.js",
    "components/ld-lightweight-css-editor.js",
    "components/ld-quizzy.js",
    "components/ld-timeline.js",
].map((p) => join(ROOT, p));

/** Copied rather than bundled: `[source, destination]`. */
const COPIES = [
    ["src/css", "src/css"],
    ["src/ld.css", "src/ld.css"],
    ["src/js/ld-help.frag.html", "src/js/ld-help.frag.html"],
    ["ext", "ext"],
    ["favicon", "favicon"],
];

/**
 * `.js` under `src/css` is `animated-logo.js`, which is an entry point above;
 * `.graffle` bundles are the drawing sources for the icons and are of no use to
 * a website.
 */
const COPY_FILTER = (source) =>
    !source.endsWith(".js") && !source.includes(".graffle");

/**
 * `timeline.js` does `import.meta.resolve("./timeline.css")`.
 *
 * Bundling inlines it into `components/ld-timeline.js`, one directory above
 * where it was written, so that URL resolves to `components/timeline.css`. The
 * stylesheet is published under both names: the bundle finds it at the first,
 * and an unbundled checkout still finds it beside its own module at the second.
 */
const EXTRA_COPIES = [
    ["components/timeline/timeline.css", "components/timeline.css"],
    ["components/timeline/timeline.css", "components/timeline/timeline.css"],
];

async function copyAssets() {
    for (const [from, to] of [...COPIES, ...EXTRA_COPIES]) {
        await cp(join(ROOT, from), join(DIST, to), {
            recursive: true,
            filter: COPY_FILTER,
        });
    }
}

/** Every file below `dir` matching `predicate`, depth first. */
async function* walk(dir, predicate) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) yield* walk(path, predicate);
        else if (predicate(path)) yield path;
    }
}

/**
 * Minifies the copied stylesheets in place, leaving the `@import` graph alone.
 *
 * Flattening that graph is the obvious next step and is a mistake twice over.
 * `ld.css` is a chain of `@import`s carrying `layer()` annotations and a deck
 * selects its theme by importing one more of them into `layer(theme)`; inlining
 * them would hand an ordering the themes depend on to the bundler. And the
 * runtime resolves `./css/ui/icons/2025/` against its own module URL, so those
 * icons must keep a predictable path -- which rules out the asset hashing that
 * bundled CSS brings with it. Per-file minification buys the size with neither
 * risk: `transform` rewrites no `@import` and no `url()`.
 */
async function minifyStylesheets() {
    for await (const file of walk(DIST, (p) => p.endsWith(".css"))) {
        const source = await readFile(file, "utf8");
        const { code } = await esbuild.transform(source, {
            loader: "css",
            minify: true,
        });
        await writeFile(file, code, "utf8");
    }
}

const buildOptions = {
    entryPoints: ENTRY_POINTS,
    outdir: DIST,
    outbase: ROOT,
    bundle: true,
    /*
     * Code splitting is a correctness requirement here, not an optimisation.
     *
     * Every component does `import { ldEvents } from "../src/ld.js"`, and today
     * they share one instance only because a browser fetches a given URL once.
     * Bundle each entry point independently and each gets a *private* copy of
     * `ld.js`: the event bus fragments, `customElements.define` runs several
     * times, and nothing announces the problem. Splitting emits the shared
     * module as a chunk that every entry point imports, restoring exactly the
     * guarantee the URL used to provide.
     */
    splitting: true,
    /*
     * ... and those chunks must land in `src/`.
     *
     * `ld.js` locates the toolbar icons and the help fragment with
     * `import.meta.resolve("./css/ui/icons/2025/")`, which resolves against the
     * URL of whichever file the code ends up in. At the default chunk location
     * that file is `dist/chunk-*.js`, and every icon 404s -- silently, because
     * a missing `<img>` is not an error anyone notices before the lecture.
     * Keeping the chunks beside `dist/src/ld.js` keeps those relative URLs
     * pointing into the copied `src/css` and `src/js` trees.
     */
    chunkNames: "src/[name]-[hash]",
    format: "esm",
    platform: "browser",
    // Matches LectureDoc2's "modern browsers" support statement.
    target: ["chrome120", "firefox120", "safari17", "edge120"],
    sourcemap: true,
    minify: MINIFY,
    logLevel: "info",
};

await rm(DIST, { recursive: true, force: true });
/*  `--clean` is this same first step and nothing else: the build starts by
    wiping `dist/`, so removing the bundle needs no second implementation of
    "what did the build write". */
if (CLEAN) {
    console.log(`removed ${DIST}`);
    process.exit(0);
}
await mkdir(DIST, { recursive: true });

if (WATCH) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    await copyAssets();
    console.log("Watching for changes in the LectureDoc2 sources ...");
    console.log(
        "(CSS, fonts and icons are copied once; re-run to refresh them.)",
    );
} else {
    await esbuild.build(buildOptions);
    await copyAssets();
    if (MINIFY) await minifyStylesheets();
    console.log(`Build complete: ${DIST}${MINIFY ? " (minified)" : ""}`);
}
