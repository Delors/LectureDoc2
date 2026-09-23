LectureDoc2 is an authoring system for lecture material.

See https://delors.github.io/LectureDoc2/src/readme.en.rst.html for further technical details.

See https://delors.github.io/LectureDoc2/src/folien.en.rst.html for a slide set which demonstrates some features of LectureDoc2.

Go to http://www.michael-eichberg.de/teaching.html for a large collection of freely available lectures that are authored using LectureDoc2.

## Scope of this repository

This repository is the **browser runtime**: the CSS and the ES modules a
finished deck loads, plus the fonts, icons and third-party assets under `ext/`. Its files are
_assets_ — they are copied to the website next to the generated decks.

For authoring slides, we recommend 
[LectureDoc2Author](https://github.com/Delors/LectureDoc2Author).

## Diagrams

[SVGs.md](SVGs.md) describes how an SVG has to be written so that it follows
the slide's theme (`currentColor` / `--color`), how shared
`<defs>` in `<ld-globals>` avoid id collisions once several drawings are
inlined into one document, and why only an inlined SVG can do either. 

How a drawing gets into a MyST deck (`{include-svg}`, the shared `ld-` markers and
classes) is documented in LectureDoc2Author's
[docs-svgs.md](https://github.com/Delors/LectureDoc2Author/blob/main/docs-svgs.md).

Instructions for AI coding agents are in [AGENTS.md](AGENTS.md); task-specific
skills (e.g. writing SVGs for LectureDoc2) are in [`skills/`](skills/).

## Generating PDFs

See LectureDoc2Author's
`src/pdf/render.js` which uses headless Chrome to generate the PDFs. It switches the document into the document view with
`lectureDoc2.prepareForPrinting()`, writing
the PDF next to the source with `.pdf` appended. A whole batch shares one server
and one browser instance.
