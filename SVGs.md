# SVGs in LectureDoc2

How a hand-made or exported SVG has to be written so that it follows the
slide's theme, survives being inlined next to other SVGs, and scales with the
slide. The short version is in the checklist at the end.

Authoring-side directives (`{include-svg}`, `ld.include-styles`,
`ld.include-globals`) are implemented in
[LectureDoc2Author](https://github.com/Delors/LectureDoc2Author); this document
describes what the **browser runtime** in this repository does with the result.

## 1. Inline the SVG — `{include-svg}`, not `{image}`

```markdown
:::{include-svg} drawings/round.svg
:width: 62ch
:height: 49.75ch
:class: center-content
:::
```

`{image}` renders an `<img src="…">`, and an SVG loaded through `<img>` is an
**independent document**: the deck's stylesheet does not reach it, `currentColor`
has nothing to inherit from, and `<ld-globals>` definitions are invisible to it.
Everything below applies only to SVGs that are inlined.

`{include-svg}` copies the file **verbatim**, so the file must not carry an XML
declaration, a `<!DOCTYPE>` or a root `width`/`height`; the directive's `:width:`
and `:height:` (in `ch` or `lh`) size the element, the `viewBox` does the scaling.

Two ways an inlined SVG is still wrong in a deck:

- A `<style>` inside the SVG applies to the **whole document**, not just to that
  SVG. Put deck CSS into `ld.include-styles` instead.
- `id`s inside the SVG land in the document's id space — see §3.

`{image}` remains right for photographs and other raster material. A raster
image that only reads on white can be given `.light-image`
(`themes/LD/common.css`), which forces `color-scheme: only light` and paints a
white plate behind it in a dark deck. That is a workaround for pixels; a vector
drawing should be themed properly instead.

## 2. Colour: what to use, and what silently fails

### The runtime's colour model

`theme.css` does not theme with `light-dark()`. It carries three custom
properties, redefined per `[data-theme]` value:

```css
:root, [data-theme] {
    color: var(--color);
    background-color: var(--background-color);
}
```

`--color`, `--background-color` and `--accent-color` are set by `:root`, by
`[data-theme="light"]`, `[data-theme="dark"]`, by every admonition theme
(`definition`, `warning`, `example`, …), and — only for the `<light-dark>`
variant — by a `@media (prefers-color-scheme: dark)` block. `<body>` carries
`data-theme="<light-dark>"` by default.

### Use `currentColor`

Inside a slide this is the right handle for anything structural — strokes,
plain arrows, body text:

```css
.diagram .grid      { fill: none; stroke: currentColor; }
.diagram .connector { fill: none; stroke: currentColor; stroke-width: 2; }
.diagram .label     { fill: currentColor; }
```

Because `[data-theme]` sets `color`, `currentColor` follows not only light/dark
but also the surrounding admonition: the same drawing inside a `{definition}`
picks up that theme without a second rule.

Derived shades come from the same source and stay in step:

```css
.diagram .cell  { fill: currentColor; fill-opacity: 0.3; }
.diagram .panel { fill: currentColor; fill-opacity: 0.1; }
.diagram .muted { stroke: oklch(from currentColor 0.8 c h); }
```

For text that has to sit **on** a filled shape, `var(--background-color)` is the
counterpart:

```css
.diagram .badge       { fill: currentColor; fill-opacity: 0.55; }
.diagram .badge-label { fill: var(--background-color); }
```

Fixed colours are fine where a colour carries meaning and reads on both white
and black — a saturated red, a deep purple, a medium blue. Everything that is
merely "the drawing's ink" belongs to `currentColor`.

### Do not use `light-dark()`

It parses, it resolves — `theme.css` sets `color-scheme: light dark` on `:root`
— and it is still wrong here. `light-dark()` follows **`prefers-color-scheme`
alone**, i.e. the operating system. It therefore ignores:

- an explicit `[data-theme="light"]` / `[data-theme="dark"]`,
- every admonition theme,
- `@media print { :root { color-scheme: only light } }` in `core/behavior.css`,
  which is what the PDF renderer sees,
- `.light-image`, which switches a subtree to `color-scheme: only light`.

The failure is quiet: the colour is plausible in the common case and wrong
everywhere else. Note also the argument order — `light-dark(A, B)` is *A in
light, B in dark*; getting it backwards makes a shape invisible in **both**
themes, which is a confusing way to discover the rule.

Use `var(--color)` / `var(--background-color)` if you want to name the theme
colour explicitly, and `currentColor` otherwise.

### Do not use `context-fill` / `context-stroke`

SVG 2 defines them for exactly the marker case — the arrowhead takes the colour
of the line it sits on. Firefox shipped them in 111, Chromium in 124. **WebKit
has not implemented them**; the standards-position request
([WebKit/standards-positions#331](https://github.com/WebKit/standards-positions/issues/331),
opened March 2024) is still open. In Safari the paint stays unresolved and the
marker does not appear.

Colour a shared marker from the theme instead (§3).

## 3. Shared definitions belong in `<ld-globals>`

Every drawing is inlined multiple times into the final document and they will share the id space. Hence, keep definitions in one file, reference them with a prefixed id, otherwise your browser may have problems rendering the SVG as intended (in particular Firefox/Safari) as the document as a whole will not be standard-conform.

```yaml
# deck frontmatter
ld:
    include-styles:
        - drawings/diagrams.css
    include-globals:
        - drawings/defs.svg
```

```xml
<!-- drawings/defs.svg -->
<svg xmlns="http://www.w3.org/2000/svg">
<defs>
    <marker id="aes-arrow" orient="auto" markerUnits="strokeWidth"
            viewBox="-1 -3 7 6" markerWidth="7" markerHeight="6">
        <path d="M 4.8 0 L 0 -1.8 L 0 1.8 Z" stroke-width="1" />
    </marker>
</defs>
</svg>
```

```css
/* drawings/diagrams.css — the marker's colour, see below */
#aes-arrow path { fill: var(--color); stroke: var(--color); }
```

`include-globals` inserts the file verbatim into `<ld-globals>` in the body.
`core/behavior.css` hides that element with `position: fixed; width: 0;
height: 0; overflow: hidden` — deliberately **not** `display: none`, which would
stop referenced `<defs>` from rendering at all.

### Colouring a marker

A marker is painted in the context of its **definition site**, not of the shape
that references it. Inside `<ld-globals>` that site inherits from `<body>`,
which carries `[data-theme]` and therefore `color: var(--color)` — so both
`currentColor` and `var(--color)` give the theme's foreground colour. Measured
in Chromium, `#aes-arrow path` computes to `rgb(26,26,26)` in a light deck and
`rgb(255,255,255)` in a dark one, identical to the lines it terminates.

The remaining limitation is honest to state: a marker coloured this way takes
the **body's** colour, so an arrow drawn inside an admonition with its own
`[data-theme]` will not match that admonition. `context-stroke` is the construct
that would fix it, and it is the one Safari lacks. If a diagram really needs
per-context arrowheads, define a second marker and select it by class.

An exporter may leave `color="black"` on the `<marker>` element itself — that
pins `currentColor` inside the marker to black. Remove it.

## 4. Size, units and fonts

- `viewBox` only, no root `width`/`height`; the directive sizes the element in
  `ch` so the drawing scales with the slide's font size.
- No `px` anywhere. Coordinates, `stroke-width` and `font-size` are unitless
  numbers.
- `font-size="1"` on the root and relative sizes below it keep labels in
  proportion when the drawing is scaled.
- Monospaced values (hex bytes, code) use the theme's stack:
  `font-family: var(--monospaced-font-family)` — the same one
  `.table-data-monospaced` and `<pre>` use, so a drawing and the surrounding
  slide agree.
- Centre numbers in a cell with `text-anchor: middle` and the cell's centre
  coordinate, not with a hand-measured `x` — the offset an exporter computes is
  only right for the glyph widths it measured.

### Matching KaTeX

A deck that renders maths links `katex.min.css`, which declares KaTeX's faces
with `@font-face`. `@font-face` is document-scoped and the drawing is inlined,
so those families are available to SVG text without any further setup — a
drawing can set its hex constants in the very font `\mathtt{…}` uses:

```css
.hex { font-family: KaTeX_Typewriter, var(--monospaced-font-family); }
```

Same-family is not same-size. The metrics differ enough to matter, so pick a
`font-size` that keeps the **digit height** of whatever the element used
before:

| | advance per glyph | digit height |
| --- | --- | --- |
| `KaTeX_Typewriter` | 0.525 em | 0.631 em |
| `Monospace` (LectureDoc2) | 0.600 em | 0.565 em |
| `Noto Sans Display` | 0.537 em | 0.735 em |

Coming from `Monospace`, multiply the font-size by ≈ 0.90; coming from
`Noto Sans Display`, by ≈ 1.16. Horizontal position needs no work as long as
the text is centred with `text-anchor`.

Do **not** put `text-anchor` into such a class. On a `<tspan>` in the middle of
a line, `text-anchor: middle` re-anchors that chunk at its own position and
tears the line apart. Centre on the `<text>` or on the surrounding `<g>`.

`font-display: block` means the glyphs stay invisible until the face has
loaded. Check the generated PDF for a deck whose only user of a KaTeX face is
an SVG.

## 5. Step-by-step reveal

`<g class="incremental">…</g>` makes one reveal step. The anchor element stays
outside any such group so that it is visible immediately; each later group can
hold a shape, its arrow and its labels together.

## 6. Checklist

- [ ] embedded with `{include-svg}`, not `{image}`
- [ ] no XML declaration, no `<!DOCTYPE>`, no root `width`/`height`
- [ ] no `<style>` inside the SVG — deck CSS goes to `ld.include-styles`
- [ ] no colours in presentation attributes; classes instead, coloured from
      `currentColor` / `var(--color)` / `var(--background-color)`
- [ ] no `light-dark()`, no `context-fill` / `context-stroke`
- [ ] shared `<defs>` in `ld.include-globals`, ids prefixed per deck
- [ ] no `color="…"` left on a `<marker>`
- [ ] no `px`; `viewBox` only
- [ ] monospaced text uses `var(--monospaced-font-family)`
- [ ] checked in a light **and** a dark deck, and in the generated PDF

## Worked example

`sec-aes` in the lecture repository: `drawings/input_for_a_single_aes_round.svg`
(an OmniGraffle export converted to classes), `drawings/aes-diagrams.css` and
`drawings/aes-defs.svg`.
