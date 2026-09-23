---
name: lecturedoc2-svg
description: Write, convert or review SVG drawings for LectureDoc2 slides - unitless viewBox-only SVGs themed with currentColor and LectureDoc2's theme variables (never light-dark() or context-stroke), shared definitions in <ld-globals> under prefixed ids, incremental reveal. Use whenever an SVG for a LectureDoc2 deck is created, exported, converted or fixed, even if the request only says "diagram for a slide".
---

# SVG drawings for LectureDoc2

LectureDoc2 is the browser runtime of the slides. A drawing is inlined into the
HTML document; it then inherits the slide's colour, font size and theme. This
skill covers what the **SVG file** must look like. How it is embedded in a MyST
deck (`{include-svg}`, frontmatter keys, the shared `ld-` markers and classes)
is the job of LectureDoc2Author's skill `lecturedoc2-myst-svg` — in a project
with both submodules: `LectureDoc2Author/skills/lecturedoc2-myst-svg/SKILL.md`.
Read both when adding a drawing to a deck.

Background and rationale for every rule: [`SVGs.md`](../../SVGs.md). Read the
relevant section there before deviating from a rule.

## Hard rules

1. **Inline only.** The drawing works only when inlined; through `<img>` the
   deck's CSS, `currentColor` and `<ld-globals>` do not reach it. (SVGs.md §1)
2. **File shape.** No XML declaration, no `<!DOCTYPE>`, no `width`/`height` on
   the root — a `viewBox` only. `xmlns="http://www.w3.org/2000/svg"` on the root.
3. **No units.** No `px` (or any unit) in the file. Coordinates, `stroke-width`,
   `font-size` are bare numbers.
4. **`font-size` on the root** = the size of a normal label (in user units);
   other text relative to it. Shared classes measure lengths in `em`. (§4)
5. **Colour from the theme.**
   - Structural ink (lines, plain arrows, labels): `currentColor`.
   - Shades: `fill-opacity` on `currentColor`, or `oklch(from currentColor …)`.
   - Text on a filled shape: `var(--background-color)`.
   - Emphasis: set `color` to `var(--accent-color)`, `var(--muted-color)`,
     `var(--danger-color)`, `var(--success-color)`, `var(--info-color)`,
     `var(--warning-color)` on the element or its `<g>`.
   - A fixed colour only where it carries meaning **and** reads on white and on
     black (saturated red, medium blue, deep purple).
   - Colours go into CSS classes, not presentation attributes
     (`fill="#…"`); `currentColor` in an attribute is fine. (§2)
6. **Never** `light-dark()` — it follows the OS only and ignores
   `[data-theme]`, admonitions, print and `.light-image`. **Never**
   `context-fill` / `context-stroke` — WebKit does not implement them; the
   marker disappears in Safari. (§2)
7. **No `<style>` in the SVG** — it would style the whole document.
8. **No `<defs>` in the drawing.** Markers, symbols, gradients go into a
   definitions file that is put into `<ld-globals>` once per document; ids get
   a prefix. `ld-` is reserved for the shared definitions
   (`ld-arrow`, …); a deck uses its own prefix (`aes-`). Rename exporter ids
   such as `FilledArrow_Marker`. (§3)
9. **Markers** are coloured at their definition site (inside `<ld-globals>`:
   the body's colours). Remove `color="…"` from exported `<marker>`s. A
   coloured variant sets `style="color: var(--…)"` on its `<marker>`. Put the
   tip at a known place with `refX`; prefer filled, unstroked heads. (§3)
10. **`<use>`/`<symbol>`**: style the `<use>` (inherited properties reach the
    shadow tree, selectors do not); give a `<symbol>` `overflow="visible"` if
    its border stroke must not be clipped. (§3)

## Structure and animation

- One reveal step = `<g class="incremental">…</g>`. The anchor element stays
  outside any group; a group holds a shape together with its arrow and labels.
  `incremental-1`, `incremental-2`, … fix the order / reveal things together.
- Group logically, with a short comment per step in the language of the deck
  (`<!-- Schritt 2: … -->`).
- Text: `text-anchor="middle"` on the `<text>` or `<g>` and the cell's centre
  coordinate; never `text-anchor` in a class that may land on a `<tspan>`.
  Multi-line text: `<tspan x="…" dy="1.2">`.
- Monospaced values: `var(--monospaced-font-family)` (or `KaTeX_Typewriter`
  to match `$\mathtt{…}$`; keep the digit height, see SVGs.md §4).
- Numbers: round to 1–2 decimals; use a grid (state it in a comment) for
  anything box-and-arrow; derive positions instead of eyeballing them.

## Workflow

1. **Clarify** what is depicted and — unless obvious — how it reveals step by
   step. A left-to-right pipeline is obvious; anything with cross-cutting
   annotations is not: ask.
2. **Classify** the elements into semantic groups (structure, emphasis,
   result, annotation) and map them to `currentColor`, the theme variables or a
   justified fixed colour. Ask before introducing a fixed colour.
3. **Reuse** before inventing: the shared `ld-` markers and classes (see the
   LectureDoc2Author skill), then the deck's own definitions. Propose any new
   deck-level class or marker (name + definition) instead of inventing it
   silently.
4. **Draft** following the hard rules. When converting an export: strip the
   file shape (rule 2), replace colour attributes by classes, move `<defs>` out
   and rename their ids, replace hand-positioned numbers by centred text, and
   check the size — replacing per-cell shapes by a `<symbol>` with grid lines
   can shrink a file by an order of magnitude.
5. **Check** in a light and a dark deck, inside an admonition if it will sit in
   one, and in the PDF. Chromium can be automated; Safari has to be checked by
   hand (it is where `context-stroke` and friends fail).
6. **Offer a second pass** for spacing and balance.

## Checklist

- [ ] no XML declaration / `<!DOCTYPE>` / root `width`/`height`; `viewBox`
- [ ] no units; `font-size` on the root
- [ ] colours: `currentColor` / theme variables via classes; fixed colours
      justified; no `light-dark()`, no `context-*`
- [ ] no `<style>`, no `<defs>` in the drawing; ids prefixed; no `color=` on
      markers
- [ ] reveal steps as `incremental` groups; labels in the deck's language
- [ ] looked at in light, dark (and admonition, PDF)
