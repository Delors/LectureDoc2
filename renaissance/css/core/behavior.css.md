# Central CSS Classes 

# incremental

```css
.incremental
```

Elements marked with the class "incremental" are rendered one-step-after-another.


# copy-to-clipboard

```css
.code.copy-to-clipboard div.ld-copy-to-clipboard-button 
```

LectureDoc has special support for enabling copy to clipboard functionality. 
If a code block (i.e., a DIV or PRE element with the class "code" and also 
"copy-to-clipboard") is found, LectureDoc will add a copy "button" to the code
block by means of a div with the class ld-copy-to-clipboard-button.

Example:
<div class="code copy-to-clipboard">
    <div class="ld-copy-to-clipboard-button">Copy</div> <!-- added by LectureDoc -->
    <pre><code>...</code></pre>
</div>

or

<pre class="code copy-to-clipboard">
    <div class="ld-copy-to-clipboard-button">Copy</div> <!-- added by LectureDoc -->
    <code>...</code>
</pre>


# paragraph

(previously .stack and .layer (.overlay)) 

LectureDoc has special support for creating layouts which consists of multiple 
paragraphs which replace each other on a slide.



