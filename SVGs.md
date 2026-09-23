# SVGs in LectureDoc2

How a hand-made or exported SVG has to be written so that it follows the
slide's theme, survives being inlined next to other SVGs, and scales with the
slide. The short version is in the checklist at the end.

This document describes what the **browser runtime** in this repository does
with an SVG. 

How a drawing gets into a deck — the `{include-svg}` directive,
the frontmatter keys for deck CSS and definitions, and the shared `ld-` markers
and classes — is documented in LectureDoc2Author:
[docs-svgs.md](https://github.com/Delors/LectureDoc2Author/blob/main/docs-svgs.md).

## 1. Only an inlined SVG belongs to the deck

An SVG loaded through `<img src="…">` (or `<object>`) is an **independent
document**: the deck's stylesheets do not reach it, `currentColor` has nothing
to inherit from, and definitions in `<ld-globals>` are invisible to it.
Everything below applies only to SVGs that are part of the HTML document
itself, i.e. inlined.

Because the file's content ends up verbatim in the HTML:

- it must not carry an XML declaration or a `<!DOCTYPE>`;
- the root has a `viewBox` but no `width`/`height` — the element around the SVG
  gives it its box (in `ch` or `lh`, so that it scales with the slide's font
  size) and the `viewBox` does the scaling;
- a `<style>` inside the SVG applies to the **whole document**, not just to
  that SVG — CSS for drawings belongs in the document's stylesheets;
- every `id` in the SVG lands in the document's id space — see §3.

For photographs and other raster material an `<img>` remains right. A raster
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
variant — by a `@media (prefers-color-scheme: dark)` block. Generated decks put
`data-theme="<light-dark>"` on `<body>`.

Derived from these, `theme.css` also defines semantic colours such as
`--muted-color`, `--info-color`, `--warning-color`, `--danger-color` and
`--success-color`; they follow the theme in the same way.

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

To colour a part of a drawing, set `color` (e.g. `color: var(--accent-color)`)
on it or on its group rather than `fill`/`stroke` on every shape — everything
painted with `currentColor` below it follows.

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
everywhere else. 

Use `var(--color)` / `var(--background-color)` if you want to name the theme
colour explicitly, and `currentColor` otherwise.

### Do not use `context-fill` / `context-stroke`

SVG 2 defines them for exactly the marker case — the arrowhead takes the colour
of the line it sits on. Firefox shipped them in 111, Chromium in 124. **WebKit
has not implemented them (August 2026)**; the standards-position request
([WebKit/standards-positions#331](https://github.com/WebKit/standards-positions/issues/331),
opened March 2024) is still open. In Safari the paint stays unresolved and the
marker does not appear.

Colour a shared marker from the theme instead (§3).

### Colours in presentation attributes

`fill="…"` / `stroke="…"` with a fixed colour cannot follow the theme, and a
presentation attribute cannot use `var()`. Give the shape a class and colour
the class in CSS. (`currentColor` in an attribute is fine; it is not a fixed
colour.)

## 3. Shared definitions belong in `<ld-globals>`

Every drawing is inlined into the same document — often more than once, since
the slide view, the document view and the light table each hold a copy of the
slides — and all of them share one id space. A `<marker>` or `<symbol>` defined
inside a drawing therefore exists several times under the same id; the document
is no longer valid, and Firefox and Safari in particular may resolve
`url(#id)` to the wrong copy or to none.

Hence: keep definitions that drawings reference in **one** place, the
`<ld-globals>` element, and give their ids a prefix.

`<ld-globals>` is a container in `<body>` for markup that belongs to the
document as a whole (how content gets there is up to the generator; see
LectureDoc2Author). `core/behavior.css` hides it with `position: fixed;
width: 0; height: 0; overflow: hidden` — deliberately **not** `display: none`,
which would stop referenced `<defs>` from rendering at all.

```xml
<!-- a definitions file, put into <ld-globals> -->
<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
    <marker id="mydeck-arrow" viewBox="-4.5 -2.5 6 5" refX="0" refY="0"
            markerWidth="6" markerHeight="5" markerUnits="strokeWidth"
            orient="auto-start-reverse">
        <path d="M -4.5 -2.5 L 1.5 0 L -4.5 2.5 Z" fill="currentColor" />
    </marker>
</defs>
</svg>
```

Id prefixes: `ld-` is taken by the shared definitions that LectureDoc2Author
provides (`ld-arrow`, …); a deck's own definitions use a prefix of their own
(`aes-`, `ds-`, …). Exporters invent generic ids (OmniGraffle:
`FilledArrow_Marker`, which also occurs in `themes/LD/dimensioning.svg`) — rename
them when converting a drawing.

### Colouring a marker

A marker is painted in the context of its **definition site**, not of the shape
that references it. Inside `<ld-globals>` that site inherits from `<body>`,
which carries `[data-theme]` and therefore `color: var(--color)` — so both
`currentColor` and `var(--color)` give the theme's foreground colour. Measured
in Chromium with the shared `#ld-arrow`, the marker's path computes to
`rgb(16, 16, 16)` in a light deck and `rgb(255, 255, 255)` in a dark one,
identical to the lines it terminates.

A marker coloured this way takes the **body's** colour, so an arrow drawn
inside an admonition with its own `[data-theme]` will not match that
admonition. `context-stroke` is the construct that would fix it, and it is the
one Safari lacks. If a diagram needs other arrowhead colours, define one marker
per colour and set `color` on the `<marker>` itself, e.g.
`style="color: var(--accent-color)"` (a `style` attribute, unlike a
presentation attribute, may use `var()`).

An exporter may leave `color="black"` on the `<marker>` element — that pins
`currentColor` inside the marker to black. Remove it.

### Marker geometry

`refX`/`refY` name the point of the marker that is placed on the line's end
point. Without them it is the marker's origin, and an arrowhead drawn from the
origin forwards overshoots the line by its full length. A stroked arrowhead
overshoots further: the mitre of an acute tip extends
`stroke-width / (2 · sin(half the tip angle))` beyond the geometric tip. A
filled, unstroked head and an explicit `refX` make the tip's position
predictable. The shared `ld-` markers put the tip exactly
1.5 × stroke-width beyond the end point — close enough that the line's own
end is hidden under the head.

### Symbols and `<use>`

- CSS selectors do not reach into the shadow tree of a `<use>`; inherited
  properties (`fill`, `stroke`, `fill-opacity`, `stroke-width`, …) do. Style the
  `<use>` element, and let the shapes in the `<symbol>` set only what must not
  be inherited (`fill="none"` on the grid lines, say).
- A `<symbol>` establishes its own viewport and clips to it; the outer half of
  a border stroke disappears unless the symbol has `overflow="visible"`.

## 4. Size, units and fonts

- `viewBox` only, no root `width`/`height`; the element around the SVG sizes it
  in `ch` or `lh`, so the drawing scales with the slide's font size.
- No `px` anywhere. Coordinates, `stroke-width` and `font-size` are unitless
  numbers.
- Set `font-size` on the root to the size of a normal label and size other
  text relative to it. Labels then stay in proportion when the drawing is
  scaled, and lengths given in `em` (as the shared `ld-` classes do for stroke
  widths and dash patterns) mean the same in every drawing.
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
hold a shape, its arrow and its labels together. As everywhere in LectureDoc2,
`incremental-1`, `incremental-2`, … fix the order and let independent elements
appear in the same step (see `src/css/core/README.md`).

## 6. Checklist

- [ ] inlined, not loaded through `<img>`
- [ ] no XML declaration, no `<!DOCTYPE>`, no root `width`/`height`
- [ ] no `<style>` inside the SVG
- [ ] no fixed colours in presentation attributes; classes instead, coloured
      from `currentColor` / `var(--color)` / `var(--background-color)` / the
      semantic theme colours
- [ ] no `light-dark()`, no `context-fill` / `context-stroke`
- [ ] no `<defs>` inside the drawing; shared definitions in `<ld-globals>`,
      ids prefixed (`ld-` is reserved for the shared ones)
- [ ] no `color="…"` left on a `<marker>`
- [ ] no `px`; `viewBox` only; `font-size` on the root
- [ ] monospaced text uses `var(--monospaced-font-family)`
- [ ] checked in a light **and** a dark deck, inside an admonition if it is
      used in one, and in the generated PDF

## Worked example

`sec-aes` in the lecture repository: `drawings/input_for_a_single_aes_round.svg`
(an OmniGraffle export converted to classes), `drawings/encryption_process.svg`
(rebuilt by hand, with `incremental` groups), `drawings/aes-diagrams.css` and
`drawings/aes-defs.svg` (deck specific definitions next to the shared `ld-`
ones).
