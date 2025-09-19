.. meta::
    :lang: en
    :author: Michael Eichberg



LectureDoc2
=============

LectureDoc2 is an authoring system for lecture material which makes use of modern HTML, CSS and JavaScript. LectureDoc is also very well suited to create normal presentations; its main target is however the creation of lecture material.

LectureDoc makes it trivial to embed math and source code by relying on established projects (e.g. MathJax and HighlightJS).



Using LectureDoc
-------------------

LectureDoc documents have to be served by a web server, because it makes use of modern JavaScript features which are not available when opening the document directly in a browser due to security reasons.

Starting a simple webserver, which is sufficient for most use cases, can be done using Python 3:

.. code:: bash

    python3 -m http.server -d <PATH TO ROOT FOLDER>

Alternatively, the node.js
`http-server <https://www.npmjs.com/package/http-server>`__ (from npm) can be used:

.. code:: bash

    http-server -p 8888 -c-1 -g --cors="Access-Control-Allow-Origin:*" --no-dotfiles  <PATH/TO/ROOT/FOLDER>



How To
---------------------

.. scrollable::

    A LectureDoc document is basically a plain HTML5 document with a very simple structure. All functionality is enabled using CSS and JavaScript. The most basic presentation would be:

    .. include:: docs/minimal-example.html
        :code: html

    As seen in the above example, a stylesheet related to the rendering of the controls need to be imported along with some JavaScript files which enable the base functionality. Support for math equations and syntax highlighting of code needs additional imports. See the advanced example for that.

    The body of the HTML document should have only one template element with topics as child elements. The slides and the document view is created based on the ld-topic elements. When LectureDoc is initialized, the user-interface related elements will automatically be created.

    In general, we highly recommend to author your slides in reStructuredText and use ``rst2ld`` to create your slide set. ``rst2ld`` offers a wide range of features that makes using LectureDoc fun to use.



Controlling the initial appearance
-------------------------------------------------------

- When you want to show the light table directly when opening the presentation add the following meta tag to the head of the document.

  .. code:: html

     <meta name="ld-show-light-table" content="true">

- To start the presentation with a different slide than the first one, use the following meta tag.

  .. code:: html

     <meta name="first-slide" content="5">

  .. container::

    - if content is an int value then the corresponding slide will be shown. (The first slide has the value 1).
    - if content is "`last`" the last slide will be shown.
    - if content is "`last-viewed`" the last viewed slide will be shown. Uses the browser's local storage for storing the slide number; may not work in all situations. Requires that the document has a unique id. The id can be set using: :code:`<meta name="id" content="(unique id)">`.



Slide Design
--------------------------------

In general, no hard restrictions have to be followed regarding the design of your slides.
However, the width, height, position, display and scale properties of slides (``div.ld-slide``) are used by LectureDoc and must not be "styled" in custom style sheets.



Non-Goals
---------

Broad compatibility
___________________

LectureDoc does not strive for maximum compatibility with all (past) browsers. I.e., as of 2024, it is only regularly tested on the most modern versions of Chrome, Safari and Firefox. In general, LectureDoc will not use features not fully supported by one of these browsers. Hence, in practice only mature features are going to be used. However, feel free to open a pull-request if something can be improved without introducing strong dependencies on specific browsers or adding compatibility layers with old browsers.
