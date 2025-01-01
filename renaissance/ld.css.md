# Styling in LectureDoc 2

## The Cascade

In LectureDoc2 the main css file is `ld.css`, this file defines the primary 
layers and imports the respective css files. 

The layers have the following priorities (starting with the lowest priority):

1. **normalize**

   The goal of this layer is to achieve (some) normalization across the 
   supported browsers (Firefox, Chrome and Safari) w.r.t. the generally 
   used HTML elements. The particular focus is on those elements that are 
   used by rst2LectureDoc.
   
   *The styles in this file are generally element based.* 
   *They don't use classes or ids or non-trivial css selectors.*

2. **common**

   Contains definitions that are commonly useful to achieve a consistent look
   across Browsers and Operating Systems.  

   *The styles in this file are generally element based.* 
   *They don't use classes or ids or non-trivial css selectors.*

2. **theme**

   The CSS rules in this layer are concerned with the look of your slides.

   1. **ld**
     
       Definitions related to theming slides and components on slides. 
       Definitions in this layer can be freely redefined by a custom theme.
   2. ***&lt;custom&gt;***
       
       You should put all your customizations in the layer: theme.*&lt;theme-name&gt;.<...>*

    *The CSS rules are generally class and id-based.*

3. **utilities**

    Definitions that enable a fine-grained control of the layout and optics of the elements. In general, it is best to avoid using them as they generally hinder easily changing a theme.

    **All definitions in this layer must be id or class based.** 
    This avoids interference with LectureDoc's UI. 
    Don't use the prefix `ld-` for your ids and classes as this prefix is used 
    by LectureDoc.

4. **ui**

   CSS related to LectureDoc's UI.

   1. **element.common**

      Primarily defines the shared layout; i. e., the size and positioning of 
      elements such as dialogs.
   2. **element**
      Defines the specific layout of the components of LectureDoc's UI.

   The CSS rules are generally class and id-based.

5. **behavior**

    This defines the foundational css-properties of those css classes that are predefined by LectureDoc and which are related to core functionality. For example, stacks and scrollable elements. This does not define the L&F - only properties relevant to the core behavior of LectureDoc.


## Customization
LectureDoc associates everything that is typically used on slides with a reasonable default, but it is easily possible to adapt those definitions.

To create your own theme you just have to specify the main css file of your theme and define all styling in the layer theme.*&lt;theme-name&gt;.<...>*. 

In general, a theme should not change properties starting with `ld-`. 


