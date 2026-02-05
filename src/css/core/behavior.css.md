# Sizing elements

In general, we assume that slides are designed with standard projectors in mind.
Therefore, the native resolution of a slide is expected to be 1920px ⨉ 1200px or something similar.

Hence, the standard font size should be around 48px. Assuming a line height of 48px ⨉ 1,5, it is possible to put roughly 16 lines of text on a slide. The font size on a slide should never be smaller than 30 pixels (0,625). Given a reduced line height of 30px ⨉ 1,3 ≈ 38 it is then possible to have more than 30 lines of text on a slide which is in general already way to much.

However, in the document view, the standard font size should be around 12 to 14px with the smallest font size being 9px. The latter should only be used in rare cases.

Images are expected to be designed with the slides in mind and will be scaled down automatically in the document view. For SVGs it is generally recommended to have them font-size dependent right from the start.

# Central (CSS) Classes and Custom Elements

## incremental

```css
.incremental
```

Elements marked with the class "incremental" are rendered one-step-after-another. By adding a number (e.g. `incremental-1`) it is possible to control the order.
It is possible to assign the same number to multiple elements to make them appear at the same time.

When you want to animate the rows of a table use incremental-table-rows and for lists use incremental-lists.

## copy-to-clipboard

```css
.code.copy-to-clipboard div.ld-copy-to-clipboard-button
```

LectureDoc has special support for enabling copy to clipboard functionality.
If a code block (i.e., a DIV or PRE element with the class "code" and also
"copy-to-clipboard") is found, LectureDoc will add a copy "button" to the code
block by means of a div with the class ld-copy-to-clipboard-button.

Example:

```html
<div class="code copy-to-clipboard">
    <!-- Will be added by LectureDoc: -->
    <div class="ld-copy-to-clipboard-button">Copy</div>
    <pre><code>...</code></pre>
</div>
```

or

```html
<pre class="code copy-to-clipboard">
    <!-- Will be added by LectureDoc: -->
    <div class="ld-copy-to-clipboard-button">Copy</div> 
    <code>...</code>
</pre>
```

## ld-deck and ld-card

LectureDoc has special support for creating layouts which consist of multiple
cards belonging to one deck, where each subsequent card replaces or overlays
the previous card(s).

## ld-scrollable

A part of a slide which can be scrolled. Intended to be used for content that does not easily fit on a slide. The scrollable element has to be the last element on a slide and has to appear at the top level.

## ld-story

Similar to a scrollable, but the content is unveiled in a step-by-step manner. Hence, the content has to be marked up using incremental. Scrolling is not possible.
