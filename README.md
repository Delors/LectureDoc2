LectureDoc2 is an authoring system for lecture material.

See https://delors.github.io/LectureDoc2/src/readme.en.rst.html for further technical details.

See https://delors.github.io/LectureDoc2/src/folien.en.rst.html for a slide set which demonstrates some features of LectureDoc2.

Go to http://www.michael-eichberg.de/teaching.html for a large collection of freely available lectures that are authored using LectureDoc2.

## Generating PDFs

Two scripts convert a document to PDF; both switch it into the document view
with `lectureDoc2.prepareForPrinting()` first and write the PDF next to the
source with `.pdf` appended.

```sh
# Safari, driven through its "Save as PDF..." dialog.
# Needs a web server for the root folder on http://localhost:8888.
osascript gen-pdf-from-slides.applescript lab-shell/folien.de.md.html

# Headless Chrome, driven over the DevTools Protocol.
# Starts its own server; needs Node >= 22 and no npm dependencies.
node gen-pdf-from-slides.mjs lab-shell/folien.de.md.html
node gen-pdf-from-slides.mjs --force lab-shell/folien.de.md.html   # replace
node gen-pdf-from-slides.mjs --help
```

The Chrome variant additionally takes `--out`, `--root`, `--format`,
`--landscape`, `--margin`, `--scale` and `--chrome`, runs unattended (useful in
a build) and prints backgrounds by default. It refuses to replace an existing
PDF unless `--force` (`-f`) is given, whereas the AppleScript always replaces.
