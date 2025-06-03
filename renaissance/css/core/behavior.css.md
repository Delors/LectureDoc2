# Sizing elements

In general, we assume that slides are designed with standard projectors in mind.
Therefore, the native resolution of a slide is expected to be 1920px ⨉ 1200px or something similar.

Therefore the standard font size should be around 48px. Assuming a line height of 48px ⨉ 1,5, it is possible to put roughly 16 lines of text on a slide. The font size on a slide should never be smaller than 30 pixels (0,625). Given a reduced line height of 30px ⨉ 1,3 it is then possible to have more than 30 lines of text on a slide which is in general already way to much.

However, in the document view, the standard font size should be around 12 to 14px with the smallest font size being 9px. The latter should only be used in rare cases.

To make it possible to use the same image in both modes, LectureDoc assumes that the standard font size used in the image will be 12 to 14px and therefore, will scale every image by 3 when put on a slide. In other words, the size of an original image should not be larger than 590px by 390px and should use font sizes in the range of 10-18 pixels with 12 to 14px being the primary font size.

The default font size for supplemental information on slides is 42px.

# Central (CSS) Classes and Custom Elements

## incremental

```css
.incremental
```

Elements marked with the class "incremental" are rendered one-step-after-another. By adding a number (e.g. `incremental-1`) it is possible to control the order.
It is possible to assign the same number to multiple elements to make them appear at the same time.


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
    <div class="ld-copy-to-clipboard-button">Copy</div> <!-- added by LectureDoc -->
    <pre><code>...</code></pre>
</div>
```

or

```html
<pre class="code copy-to-clipboard">
    <div class="ld-copy-to-clipboard-button">Copy</div> <!-- added by LectureDoc -->
    <code>...</code>
</pre>
```


## ld-deck and ld-card

LectureDoc has special support for creating layouts which consists of multiple
deck which replace or overlay each other on a slide.


## ld-scrollable

A part of a slide which can be scrolled. Intended to be used for content that does not easily fit on a slide. The scrollable element has to be the last element on a slide and has to appear at the top level.


## ld-story

Similar to a scrollable, but the content is unveiled in a step-by-step manner. Hence, the content has to be marked up using incremental. Scrolling is not possible.
