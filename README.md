LectureDoc2 is an authoring system for lecture material.

See https://delors.github.io/LectureDoc2/src/readme.en.rst.html for further technical details.

See https://delors.github.io/LectureDoc2/src/folien.en.rst.html for a slide set which demonstrates some features of LectureDoc2.

Go to http://www.michael-eichberg.de/teaching.html for a large collection of freely available lectures that are authored using LectureDoc2.

## Scope of this repository

This repository is the **browser runtime**: the CSS and the ES modules a
finished deck loads, plus the fonts, icons and third-party assets under `ext/`.
It contains no Node code and has no runtime dependencies. Its files are
*assets* — they are copied to the website next to the generated decks.

Everything that runs in Node at authoring time — the MyST converter, the PDF
renderer, the dev server and the publishing tool — lives in
[LectureDoc2Author](https://github.com/Delors/LectureDoc2Author) and is driven
by a single command, `ld2`.

## Generating PDFs
See LectureDoc2Author's 
`src/pdf/render.js` which uses headless Chrome to generate the PDFs. It switches the document into the document view with
`lectureDoc2.prepareForPrinting()`, writing
the PDF next to the source with `.pdf` appended. A whole batch shares one server
and one browser instance.
