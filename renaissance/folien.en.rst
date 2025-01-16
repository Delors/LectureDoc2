.. meta:: 
    :version: renaissance
    :lang: en
    :author: Michael Eichberg
    :keywords: Demo, Showcase
    :description lang=en: Demonstrates LectureDoc2 - Renaissance
    :id: LectureDoc2-Renaissance-Showcase
    :first-slide: last-viewed

.. |html-source| source::
    :prefix: https://delors.github.io/
    :suffix: .html 


.. class .. :: animated-symbol 

LectureDoc2 Renaissance
======================================================

----

:Autor: `Prof. Dr. Michael Eichberg <https://delors.github.io/cv/folien.de.rst.html>`__
:Kontakt: michael.eichberg@dhbw.de, Raum 149B

.. supplemental::

    :Folien: 
        
        |html-source| 

    :Fehler melden:
        https://github.com/Delors/delors.github.io/issues



.. class:: new-section transition-move-to-top

Introduction
--------------------------------------------------------


Text and Supplementation information [#]_
--------------------------------------------------------

Some text.

.. supplemental:: 
    
    This is additional information that is not shown in the main text.

Some more text.

.. supplemental:: 
    
    This is some more additional information that is not shown in the main text.

.. [#] Supplemental information is not immediately shown on the slide, but always shown in the document view.


Decks and Cards
--------------------------------------------------------

.. deck::

    .. card::
    
        A deck is a collection of cards.

    .. card::

        Where each card replaces the previous cards belonging to the same deck.

    .. card::

        .. note:: 

            This is a simple note.

        And This is a simple note.where the height of the deck as a whole is determined by the tallest card.

    .. card::

        .. epigraph::

            **The Tallest One**

            Above the crowd, I stand so high,
            A bridge between the ground and sky.
            I see the world in a broader frame,
            Yet hear the jokes—they’re all the same.

            -- Jan. 2025 ChatGPT (Prompt: I need a short poem about being the tallest one.)

    .. card::

        Decks can be nested and can overlay each other!

        However, a card with a nested deck is not allowed to also use floating elements (e.g. notes). In general, the use of floating elements in combination with overlays is discouraged.

        .. deck::

            .. card::
            
                ::

                    The first sentence of the first card in the nested deck.



                    The last sentence of the first card in the nested deck.

            .. card:: overlay

                ::

                    T

                    A sentence in between.

                    T

            .. card::

                .. note:: 

                    This is another simple note.

                .. hint:: 

                    This is the last meaningful card in the nested deck. The next two ones are a technical detail.


            .. card::
            
                #------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ----

            .. card:: overlay

                xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx 

    .. card::

        .. hint:: 

            This is the last card nested in the top-level deck.

