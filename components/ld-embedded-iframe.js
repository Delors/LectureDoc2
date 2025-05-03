/*
This module provides very basic support for embedding iframes into a LectureDoc document. The primary feature that is provided is setting the html element's font size based on the context in which the iframe is embedded. I.e., an iframe that is shown in the document view will get the same font size as the surrounding text and an iframe that is shown in the slide view will get the font size used by slides unless the font sizes are explicitly clamped to the range [MIN_BASE_FONT_SIZE, MAX_BASE_FONT_SIZE].

The current context's font size is read from LectureDoc's current-base-font-size variable and then simply "copied" into the iframe.

After setting the font size, the iframe is resized to fit its content.

A minimal example is shown next:

    .. module:: embedded-iframe

        <iframe
                width="100%"
                srcdoc='
            <head>{{ld-embedded-iframe.head.frag.html}}</head>
            <body>
                SOME TEXT
            </body>
            '>

            iframes are not supported
        </iframe>

Requirements:

- the content of the srcdoc attribute must be put between single quote: '

  (The standard quotation marks " are used by the injected content.)
- the height is automatically adjusted to fit the content, but the width is not and has to be set explicitly.

- the document has to have a head element and in that head element the template string {{ld-embedded-iframe.head.frag.html}} has to be included.

*/

const MIN_BASE_FONT_SIZE = 14;
const MAX_BASE_FONT_SIZE = 36;

// TODO Determine if we really need the message from the iframe to the parent that the font size has been applied.


const IFRAME_HEAD_FRAG = `
    <style>
        :root {
            --min-base-font-size: ${MIN_BASE_FONT_SIZE}px;
            --base-font-size: 16px;
            --max-base-font-size: ${MAX_BASE_FONT_SIZE}px;
            font-size: clamp(
                var(--min-base-font-size),
                var(--base-font-size),
                var(--max-base-font-size)
            );
        }
    </style>
    <script>
        window.addEventListener("message", (event) => {
            if (event.data["ld-effective-font-size"]) {
                document.documentElement.style.setProperty(
                    "--base-font-size",
                    event.data["ld-effective-font-size"],
                );

                // we have to wait for the new font size to be applied
                setTimeout(() => {
                    window.parent.postMessage(
                        { "ld-iframe-applied-font-size": event.data["ld-iframe-id"] },
                        "*",
                    );
                }, 0);
            }
        });
    </script>
    `;

const embeddIntoHTML = () => {
    const embeddedIFrames = document
        .querySelector("body > template")
        .content.querySelectorAll(".module.embedded-iframe");

    embeddedIFrames.forEach((eif) => {
        let iframe = eif.textContent;
        iframe = iframe.replace(
            "{{ld-embedded-iframe.head.frag.html}}",
            IFRAME_HEAD_FRAG,
        );
        //console.log("embedding iframe:", iframe);
        eif.innerHTML = iframe;
    });
};

lectureDoc2.ldEvents.addEventListener(
    "beforeLDDOMManipulations",
    embeddIntoHTML,
);

/**
 * Associates each embedded iframe with its (unique) ID which is later used in 
 * the back- and forth communication to identify it.
 */
const embeddedIFrames = {};

/**
 * Adapts the height of the iframe to fit its content.
 * 
 * @param {number} i - the id of the iframe 
 * @param {*} reason - the reason for the height change [optional]
 */
const adaptEmbeddedIFrameHeight = (iframeId, reason) => {
    const iframe = embeddedIFrames[iframeId];
    if (iframe) {
        const htmlElement = iframe.contentWindow.document.documentElement;
        const newHeight = htmlElement.getBoundingClientRect().height + "px";
        console.log(
            `scaling iframe ${iframeId}: ${iframe.dataset.title}; reason = ${reason}; new height = ${newHeight}`,
        );
        iframe.style.height = newHeight;
    } else {
        console.error(`iframe ${iframeId} not found`);
    }
};

/**
 * Listens for changes to the iframe's content and adapts the height accordingly.
 */
window.addEventListener("message", (event) => {
    const iframeId = event.data["ld-iframe-applied-font-size"];
    if (iframeId) {
        setTimeout(() => {
            adaptEmbeddedIFrameHeight(iframeId, "iframe changed base font size");
        }, 0);
    } else {
        console.error(`iframe ${iframeId} not found`);
    }
});

function configureEmbeddedIFrames() {
    document
        .querySelectorAll(
            "iframe.embedded-iframe, div.embedded-iframe > iframe",
        )
        .forEach((iframe, i) => {
            const iframeId = i + 1;
            embeddedIFrames[iframeId] = iframe;

            const effectiveFontSize = getComputedStyle(iframe).getPropertyValue(
                "--current-base-font-size",
            );

            // required to enable us to set the height based on the content!
            iframe.style.boxSizing = "content-box"; 
            iframe.addEventListener("load", () => {
                iframe.contentWindow.postMessage(
                    {
                        "ld-iframe-id": iframeId,
                        "ld-effective-font-size": effectiveFontSize,
                    },
                    "*",
                );

                setTimeout(() =>
                    new IntersectionObserver((entries, observer) => {
                        entries.forEach((entry) => {
                            // console.log(`iframe ${iframeId} observer:`, entry);
                            if (entry.isIntersecting) {
                                adaptEmbeddedIFrameHeight(
                                    iframeId,
                                    "intersection",
                                );
                                observer.disconnect();
                            }
                        });
                    }).observe(iframe),
                );
            });
        });
}

lectureDoc2.ldEvents.addEventListener(
    "afterLDDOMManipulations",
    configureEmbeddedIFrames,
);
