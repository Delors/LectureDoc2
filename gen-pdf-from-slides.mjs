#!/usr/bin/env node
/*
 * Converts a LectureDoc2 HTML document to PDF using headless Chrome.
 *
 * This is the counterpart of `gen-pdf-from-slides.applescript`, which drives
 * Safari's "Save as PDF..." through the UI. Both take the same input - a
 * document below a served root folder - and write the PDF next to it with
 * `.pdf` appended:
 *
 *     node gen-pdf-from-slides.mjs theo-algo-komplexitaet/folien.de.md.html
 *     -> theo-algo-komplexitaet/folien.de.md.html.pdf
 *
 * Unlike the AppleScript it needs no running web server and no visible
 * browser: a static server for the root folder is started on the fly, Chrome
 * is launched headless and driven over the DevTools Protocol. The document is
 * switched into the document view with `lectureDoc2.prepareForPrinting()`
 * before `Page.printToPDF` renders it with the print stylesheet.
 *
 * Requires: Node >= 22 (for the built-in WebSocket client) and an installed
 * Chrome, Chromium, Edge or Brave. No npm dependencies.
 *
 * Version: 1.0.0, 2026
 *          Michael Eichberg
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

/* ------------------------------------------------------------------------ */
/* Configuration                                                            */
/* ------------------------------------------------------------------------ */

const USAGE = `Usage: gen-pdf-from-slides.mjs [options] <document.html>

Converts a LectureDoc2 document to PDF with headless Chrome.

  <document.html>        The document, relative to the root folder.

Options:
  -o, --out <file>       Output file (default: <document.html>.pdf).
      --root <dir>       Root folder that is served (default: the current
                         directory). All relative asset paths resolve here.
      --port <n>         Port of the built-in server (default: a free one).
      --server <url>     Use an already running server instead of starting one.
      --chrome <path>    Browser binary (default: $CHROME_PATH, then the usual
                         Chrome/Chromium/Edge/Brave locations).
      --format <name>    A4 (default), A3, A5, Letter, Legal or Tabloid.
      --landscape        Landscape orientation.
      --margin <css>     Page margin, one value or "top right bottom left"
                         (default: 10mm). Units: mm, cm, in, pt, px.
      --scale <n>        Render scale, 0.1 - 2 (default: 1).
      --wait <ms>        Extra settle time before printing (default: 1500).
      --timeout <ms>     Overall timeout (default: 120000).
      --verbose          Also print browser console messages.
  -h, --help             Show this message.

Examples:
  node gen-pdf-from-slides.mjs lab-shell/folien.de.md.html
  node gen-pdf-from-slides.mjs --root ~/Sites/delors.github.io cv/folien.de.md.html
  node gen-pdf-from-slides.mjs --format A3 --landscape -o /tmp/out.pdf slides.html
`;

/** Paper sizes in inches, as `Page.printToPDF` expects them. */
const PAPER_FORMATS = {
    a3: [11.69, 16.54],
    a4: [8.27, 11.69],
    a5: [5.83, 8.27],
    letter: [8.5, 11],
    legal: [8.5, 14],
    tabloid: [11, 17],
};

/** Where Chrome usually lives, per platform. */
const CHROME_LOCATIONS = {
    darwin: [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
        "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    ],
    linux: [
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/microsoft-edge",
        "/usr/bin/brave-browser",
        "/snap/bin/chromium",
    ],
    win32: [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ],
};

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".pdf": "application/pdf",
    ".txt": "text/plain; charset=utf-8",
};

/* ------------------------------------------------------------------------ */
/* Helpers                                                                  */
/* ------------------------------------------------------------------------ */

const log = (...args) => console.log(...args);
const fail = (message) => {
    console.error(`[error] ${message}`);
    process.exit(1);
};

/** Converts a CSS length to inches; `Page.printToPDF` works in inches. */
export function toInches(value, fallback = 0) {
    if (value === undefined || value === null || value === "") return fallback;
    const match = /^(-?[\d.]+)\s*(mm|cm|in|pt|px)?$/.exec(String(value).trim());
    if (!match) throw new Error(`cannot parse the length "${value}"`);
    const n = Number.parseFloat(match[1]);
    switch (match[2] ?? "mm") {
        case "in":
            return n;
        case "cm":
            return n / 2.54;
        case "mm":
            return n / 25.4;
        case "pt":
            return n / 72;
        case "px":
            return n / 96;
        default:
            return n;
    }
}

/** `"10mm"` or `"10mm 12mm 10mm 12mm"` -> the four CDP margin values. */
export function parseMargins(value) {
    const parts = String(value).trim().split(/\s+/);
    const [top, right, bottom, left] =
        parts.length === 1
            ? [parts[0], parts[0], parts[0], parts[0]]
            : parts.length === 2
              ? [parts[0], parts[1], parts[0], parts[1]]
              : parts.length === 3
                ? [parts[0], parts[1], parts[2], parts[1]]
                : parts;
    return {
        marginTop: toInches(top),
        marginRight: toInches(right),
        marginBottom: toInches(bottom),
        marginLeft: toInches(left),
    };
}

/** The default output name: the source with `.pdf` appended. */
export function outputNameFor(document) {
    return `${document}.pdf`;
}

function findChrome(explicit) {
    const candidates = [
        explicit,
        process.env.CHROME_PATH,
        ...(CHROME_LOCATIONS[process.platform] ?? []),
    ].filter(Boolean);
    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) return candidate;
    }
    throw new Error(
        "no Chrome/Chromium found - pass --chrome <path> or set CHROME_PATH",
    );
}

/* ------------------------------------------------------------------------ */
/* Static server                                                            */
/* ------------------------------------------------------------------------ */

/**
 * Serves `root` read-only on localhost. LectureDoc2 loads `ld.js` as an ES
 * module and uses `crypto.subtle`, neither of which works from `file://`.
 */
export async function startServer(root, port = 0) {
    const server = http.createServer(async (request, response) => {
        const urlPath = decodeURIComponent((request.url ?? "/").split("?")[0]);
        const target = path.resolve(root, "." + path.posix.normalize(urlPath));
        if (target !== root && !target.startsWith(root + path.sep)) {
            response.writeHead(403).end("403 Forbidden");
            return;
        }
        try {
            const stats = await fsp.stat(target);
            const file = stats.isDirectory()
                ? path.join(target, "index.html")
                : target;
            response.writeHead(200, {
                "Content-Type":
                    MIME_TYPES[path.extname(file).toLowerCase()] ??
                    "application/octet-stream",
                "Cache-Control": "no-store",
            });
            fs.createReadStream(file).pipe(response);
        } catch {
            response.writeHead(404).end(`404 Not Found: ${urlPath}`);
        }
    });
    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, "127.0.0.1", resolve);
    });
    return {
        url: `http://127.0.0.1:${server.address().port}`,
        close: () => new Promise((resolve) => server.close(resolve)),
    };
}

/* ------------------------------------------------------------------------ */
/* Chrome + DevTools Protocol                                               */
/* ------------------------------------------------------------------------ */

async function launchChrome(binary, { timeout }) {
    const profile = await fsp.mkdtemp(path.join(os.tmpdir(), "ld2-pdf-"));
    const child = spawn(
        binary,
        [
            "--headless=new",
            "--remote-debugging-port=0",
            `--user-data-dir=${profile}`,

            /*
             * Chrome encrypts the cookie/password store of its profile with a
             * key kept in the login keychain ("Chrome Safe Storage") and asks
             * for the password to unlock it - even for a throwaway profile
             * that never stores a credential. Both flags together keep it out
             * of the keychain: `basic` selects the plaintext store, and the
             * mock keychain makes the macOS backend a no-op.
             */
            "--password-store=basic",
            "--use-mock-keychain",

            // Nothing here should reach the network or another Chrome instance.
            "--disable-background-networking",
            "--disable-component-update",
            "--disable-client-side-phishing-detection",
            "--disable-domain-reliability",
            "--disable-sync",
            "--no-pings",
            "--no-service-autorun",
            "--metrics-recording-only",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-default-apps",
            "--disable-extensions",

            "--disable-gpu",
            "--hide-scrollbars",
            "--mute-audio",
            "--force-color-profile=srgb",
            // Chrome throttles timers in background pages; the scrolling done
            // by `prepareForPrinting` relies on them.
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "about:blank",
        ],
        { stdio: ["ignore", "ignore", "pipe"] },
    );
    child.stderr.on("data", () => {}); // keep the pipe drained

    // Chrome writes the chosen port into DevToolsActivePort once it is ready.
    const portFile = path.join(profile, "DevToolsActivePort");
    const deadline = Date.now() + timeout;
    let endpoint;
    while (Date.now() < deadline) {
        if (child.exitCode !== null) {
            throw new Error(`Chrome exited with code ${child.exitCode}`);
        }
        try {
            const [port, target] = (
                await fsp.readFile(portFile, "utf-8")
            ).split("\n");
            if (port && target) {
                endpoint = `ws://127.0.0.1:${port.trim()}${target.trim()}`;
                break;
            }
        } catch {
            /* not there yet */
        }
        await new Promise((r) => setTimeout(r, 50));
    }
    if (!endpoint) throw new Error("Chrome did not report a debugging port");

    return {
        endpoint,
        async close() {
            child.kill();
            await new Promise((r) => setTimeout(r, 100));
            await fsp.rm(profile, { recursive: true, force: true });
        },
    };
}

/**
 * A minimal DevTools Protocol client on Node's built-in WebSocket.
 *
 * `send` resolves with the command result; `on` registers an event listener.
 */
async function connect(endpoint) {
    const socket = new WebSocket(endpoint);
    await new Promise((resolve, reject) => {
        socket.addEventListener("open", resolve, { once: true });
        socket.addEventListener("error", reject, { once: true });
    });

    let nextId = 0;
    const pending = new Map();
    const listeners = new Map();

    socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);
        if (message.id !== undefined) {
            const entry = pending.get(message.id);
            if (!entry) return;
            pending.delete(message.id);
            if (message.error) {
                entry.reject(new Error(message.error.message));
            } else {
                entry.resolve(message.result);
            }
            return;
        }
        for (const listener of listeners.get(message.method) ?? []) {
            listener(message.params);
        }
    });

    return {
        send(method, params = {}, sessionId) {
            const id = ++nextId;
            return new Promise((resolve, reject) => {
                pending.set(id, { resolve, reject });
                socket.send(JSON.stringify({ id, method, params, sessionId }));
            });
        },
        on(method, listener) {
            if (!listeners.has(method)) listeners.set(method, []);
            listeners.get(method).push(listener);
        },
        once(method) {
            return new Promise((resolve) => {
                this.on(method, resolve);
            });
        },
        close: () => socket.close(),
    };
}

/* ------------------------------------------------------------------------ */
/* Conversion                                                               */
/* ------------------------------------------------------------------------ */

async function convert(documentPath, options) {
    const root = path.resolve(options.root ?? process.cwd());
    const relative = path
        .relative(root, path.resolve(root, documentPath))
        .split(path.sep)
        .join("/");
    if (relative.startsWith("..")) {
        throw new Error(`${documentPath} is outside the root folder ${root}`);
    }
    if (!fs.existsSync(path.join(root, relative))) {
        throw new Error(`no such document: ${path.join(root, relative)}`);
    }

    const out = path.resolve(
        options.out ?? outputNameFor(path.join(root, relative)),
    );
    const [width, height] =
        PAPER_FORMATS[String(options.format ?? "A4").toLowerCase()] ??
        (() => {
            throw new Error(`unknown paper format "${options.format}"`);
        })();
    const timeout = Number.parseInt(options.timeout ?? "120000", 10);

    log(`Root folder:       ${root}`);
    log(`Document:          ${relative}`);
    log(`Output:            ${out}`);

    const server = options.server
        ? { url: options.server.replace(/\/$/, ""), close: async () => {} }
        : await startServer(root, Number.parseInt(options.port ?? "0", 10));
    const url = `${server.url}/${relative}`;
    log(`URL:               ${url}`);

    const chromeBinary = findChrome(options.chrome);
    log(`Chrome:            ${chromeBinary}`);
    const chrome = await launchChrome(chromeBinary, { timeout });

    let client;
    try {
        client = await connect(chrome.endpoint);

        const { targetId } = await client.send("Target.createTarget", {
            url: "about:blank",
        });
        const { sessionId } = await client.send("Target.attachToTarget", {
            targetId,
            flatten: true,
        });

        await client.send("Page.enable", {}, sessionId);
        await client.send("Runtime.enable", {}, sessionId);
        if (options.verbose) {
            client.on("Runtime.consoleAPICalled", ({ type, args }) => {
                const text = (args ?? [])
                    .map((a) => a.value ?? a.description ?? "")
                    .join(" ");
                log(`  [browser:${type}] ${text}`);
            });
        }
        client.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
            console.warn(
                `  [browser:error] ${exceptionDetails?.exception?.description ?? exceptionDetails?.text}`,
            );
        });

        const loaded = client.once("Page.loadEventFired");
        await client.send("Page.navigate", { url }, sessionId);
        await withTimeout(loaded, timeout, "the document did not load");

        // LectureDoc2 sets up asynchronously after `load`.
        await evaluate(
            client,
            sessionId,
            `new Promise((resolve) => {
                 const ready = () =>
                     window.lectureDoc2 && window.lectureDoc2.prepareForPrinting;
                 if (ready()) return resolve(true);
                 const started = Date.now();
                 const timer = setInterval(() => {
                     if (ready() || Date.now() - started > 15000) {
                         clearInterval(timer);
                         resolve(ready());
                     }
                 }, 50);
             })`,
            { awaitPromise: true },
        ).then((ok) => {
            if (!ok) {
                throw new Error(
                    "lectureDoc2.prepareForPrinting() is not available - " +
                        "is this a LectureDoc2 document?",
                );
            }
        });

        // Switches to the document view and scrolls every section into view so
        // that lazily laid out content is rendered; returns the section count.
        const sections = await evaluate(
            client,
            sessionId,
            "window.lectureDoc2.prepareForPrinting()",
        );
        log(`Number of slides:  ${sections}`);

        // `prepareForPrinting` walks the sections with a 100 ms timer.
        const settle =
            Number(sections) * 100 +
            Number.parseInt(options.wait ?? "1500", 10);
        await evaluate(
            client,
            sessionId,
            `new Promise((r) => setTimeout(r, ${settle}))`,
            { awaitPromise: true },
        );
        await evaluate(client, sessionId, "document.fonts.ready.then(() => true)", {
            awaitPromise: true,
        });

        const { data } = await client.send(
            "Page.printToPDF",
            {
                printBackground: true,
                preferCSSPageSize: true,
                landscape: !!options.landscape,
                scale: Number.parseFloat(options.scale ?? "1"),
                paperWidth: width,
                paperHeight: height,
                ...parseMargins(options.margin ?? "10mm"),
                transferMode: "ReturnAsBase64",
            },
            sessionId,
        );

        await fsp.mkdir(path.dirname(out), { recursive: true });
        await fsp.writeFile(out, Buffer.from(data, "base64"));
        const { size } = await fsp.stat(out);
        log(`Saved:             ${out} (${(size / 1024).toFixed(0)} KiB)`);
    } finally {
        client?.close();
        await chrome.close();
        await server.close();
    }
}

/** `Runtime.evaluate` that throws on a JavaScript exception. */
async function evaluate(client, sessionId, expression, extra = {}) {
    const { result, exceptionDetails } = await client.send(
        "Runtime.evaluate",
        { expression, returnByValue: true, ...extra },
        sessionId,
    );
    if (exceptionDetails) {
        throw new Error(
            exceptionDetails.exception?.description ?? exceptionDetails.text,
        );
    }
    return result?.value;
}

function withTimeout(promise, ms, message) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`timeout: ${message}`)), ms),
        ),
    ]);
}

/* ------------------------------------------------------------------------ */

async function main() {
    const { values, positionals } = parseArgs({
        allowPositionals: true,
        options: {
            "out": { type: "string", short: "o" },
            "root": { type: "string" },
            "port": { type: "string" },
            "server": { type: "string" },
            "chrome": { type: "string" },
            "format": { type: "string" },
            "landscape": { type: "boolean", default: false },
            "margin": { type: "string" },
            "scale": { type: "string" },
            "wait": { type: "string" },
            "timeout": { type: "string" },
            "verbose": { type: "boolean", default: false },
            "help": { type: "boolean", short: "h", default: false },
        },
    });

    if (values.help) {
        process.stdout.write(USAGE);
        return;
    }
    if (positionals.length !== 1) {
        process.stdout.write(USAGE);
        fail("exactly one document is required");
    }

    await convert(positionals[0], values);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
    main().catch((error) => fail(error.message));
}
