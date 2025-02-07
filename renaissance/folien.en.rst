.. meta:: 
    :version: renaissance
    :lang: en
    :author: Michael Eichberg
    :keywords: Demo, Showcase
    :description lang=en: Demonstrates LectureDoc2 - Renaissance
    :id: LectureDoc2-Renaissance-Showcase
    :first-slide: last-viewed
    :exercises-master-password: Demo!

.. |html-source| source::
    :prefix: https://delors.github.io/
    :suffix: .html 



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



Supplemental Information and Presenter Notes\ [#]_
--------------------------------------------------------

You first have to enter the master password (press M and then enter Demo!) to see the presenter notes.

.. supplemental:: 
    
    This is additional information that is not shown in the main text.

.. presenter-note::

    This is a small presenter note. Which is displayed, when you hover over it.

Some more text.

.. presenter-note::

    This is another presenter note. Which is also displayed, when you hover over it.

.. supplemental:: 
    
    This is some more additional information that is not shown in the main text.

    .. presenter-note::

        This is a nested presenter note. Which is probably displayed, when you hover over it :-).

.. supplemental:: 

    Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled. Just a long text to demonstrate that the supplemental information is not immediately shown on the slide and that it can be scrolled.


.. [#] Supplemental information and presenter notes are not immediately shown on the slide.


Decks and Cards
--------------------------------------------------------

.. deck::

    .. card::
    
        A deck is a collection of cards.

    .. card::

        Where each card "replaces" the previous cards during the presentation belonging to the same deck.

    .. card::

        .. note:: 

            This is a simple note.

        This card contains a simple note. Where the height of the deck as a whole is determined by the tallest card.

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

                .. hint:: 

                    .. note:: 

                        This is another simple note.

                    This is the last meaningful card in the nested deck. The next two ones are a technical detail.


            .. card:: monospaced
            
                _------ ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------- ------_

            .. card:: overlay monospaced

                xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx xxxxxxx 

    .. card::

        .. hint:: 

            This is the last card in the top-level deck.



Scrollables
--------------------------------------------------------

A scrollable is a container whose content does not fit into the available space. The content can be scrolled by the presenter and scrolling is relayed in secondary windows.

.. scrollable:: 

    .. code:: javascript
        :class: very-light-gray-background
        :number-lines:

        /* A small library to encrypt and decrypt strings using AES-GCM and PBKDF2.
         *
         * Based on code found at: https://github.com/themikefuller/Web-Cryptography
         * 
         * License: BSD-3-Clause
         */
        export {
            decrypt as decryptAESGCMPBKDF,
            encrypt as encryptASEGCMPBKDF
        }

        async function encrypt(plaintext, password, iterations) {

            const encodedPlaintext = new TextEncoder().encode(plaintext);
            const encodedPassword = new TextEncoder().encode(password);

            const pass = await crypto.subtle.importKey(
                'raw',
                encodedPassword,
                { "name": "PBKDF2" },
                false,
                ['deriveBits']);

            const salt = crypto.getRandomValues(new Uint8Array(32));
            const iv = crypto.getRandomValues(new Uint8Array(12));

            const keyBits = await crypto.subtle.deriveBits(
                {
                    "name": "PBKDF2",
                    "salt": salt,
                    "iterations": iterations,
                    "hash": { "name": "SHA-256" }
                },
                pass,
                256);

            const key = await crypto.subtle.importKey(
                'raw',
                keyBits, { "name": "AES-GCM" },
                false,
                ['encrypt']);

            const enc = await crypto.subtle.encrypt(
                {
                    "name": "AES-GCM",
                    "iv": iv
                },
                key,
                encodedPlaintext);

            const iterationsB64 = btoa(rounds.toString());

            const saltB64 = btoa(Array.from(new Uint8Array(salt)).map(val => {
                return String.fromCharCode(val)
            }).join(''));

            const ivB64 = btoa(Array.from(new Uint8Array(iv)).map(val => {
                return String.fromCharCode(val)
            }).join(''));

            const encB64 = btoa(Array.from(new Uint8Array(enc)).map(val => {
                return String.fromCharCode(val)
            }).join(''));

            return iterationsB64 + ':' + saltB64 + ':' + ivB64 + ':' + encB64;
        };

        async function decrypt(encrypted, password) {

            const parts = encrypted.split(':');
            const rounds = parseInt(atob(parts[0]));

            const salt = new Uint8Array(atob(parts[1]).split('').map(val => {
                return val.charCodeAt(0);
            }));

            const iv = new Uint8Array(atob(parts[2]).split('').map(val => {
                return val.charCodeAt(0);
            }));

            const enc = new Uint8Array(atob(parts[3]).split('').map(val => {
                return val.charCodeAt(0);
            }));

            const encodedPassword = new TextEncoder().encode(password);
            const pass = await crypto.subtle.importKey(
                'raw',
                encodedPassword,
                { "name": "PBKDF2" },
                false,
                ['deriveBits']);

            const keyBits = await crypto.subtle.deriveBits(
                {
                    "name": "PBKDF2",
                    "salt": salt,
                    "iterations": rounds,
                    "hash": {
                        "name": "SHA-256"
                    }
                },
                pass,
                256);

            let key = await crypto.subtle.importKey(
                'raw',
                keyBits, { "name": "AES-GCM" },
                false,
                ['decrypt']);

            let dec = await crypto.subtle.decrypt(
                {
                    "name": "AES-GCM",
                    "iv": iv
                },
                key,
                enc);

            return (new TextDecoder().decode(dec));
        };


