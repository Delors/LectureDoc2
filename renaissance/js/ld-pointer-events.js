/**
 * Implements support for pointer events/for supporting tablets.
 */
import {
    ldEvents,
    ensureLectureDocIsVisible,
    retrogressPresentation,
    advancePresentation,
} from "./../ld.js";

console.log("loading ld-pointer-events.js");

/**
 * Some initial support for swipe gestures.
 */
function handleGesturesInSlideView() {
    let xDown = null;
    let yDown = null;

    const sv = document.getElementById("ld-slides-pane");
    sv.addEventListener(
        "touchstart",
        function (evt) {
            ensureLectureDocIsVisible();
            xDown = evt.changedTouches[0].clientX;
            yDown = evt.changedTouches[0].clientY;
        },
        false,
    );

    sv.addEventListener(
        "touchend",
        function (evt) {
            let xUp = evt.changedTouches[0].clientX;
            let yUp = evt.changedTouches[0].clientY;

            let xDiff = xDown - xUp;
            let yDiff = yDown - yUp;
            console.log("touch event (x,y): ", xDiff, yDiff);
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (xDiff < -10) {
                    retrogressPresentation();
                } else if (xDiff > 10) {
                    advancePresentation();
                }
            } else {
                if (yDiff < -10) {
                    retrogressPresentation();
                } else if (yDiff > 10) {
                    advancePresentation();
                }
            }
            xDown = null;
            yDown = null;
        },
        false,
    );

    // Implement pinch functionality for slide view
    //
    sv.querySelectorAll(":scope ld-slide").forEach((slide) => {
        slide.addEventListener("pointermove", (event) => {
            console.log("currentScale:", window.visualViewport.scale);
        });
    });
}

function handlePinchAndZoomInDocumentView() {
    console.log(
        "performing ld-pointer-events.handlePinchAndZoomInDocumentView",
    );

    // Implement pinch and zoom functionality for document view
    const evCache = [];
    let prevDiff = -1;

    function pointerdownHandler(ev) {
        evCache.push(ev);
        if (evCache.length === 2) {
            prevDiff = Math.abs(evCache[0].clientX - evCache[1].clientX);
        }
    }

    function pointermoveHandler(ev) {
        console.log("pointermoveHandler called", ev);
        if (evCache.length === 2) {
            const currentDiff = Math.abs(
                evCache[0].clientX - evCache[1].clientX,
            );
            const delta = currentDiff - prevDiff;
            if (delta > 10) {
                console.log("zoom in on ", ev.target);
            }
            prevDiff = currentDiff;
        }
    }

    function pointerupHandler(ev) {
        const index = evCache.findIndex((e) => e.pointerId === ev.pointerId);
        if (index !== -1) {
            evCache.splice(index, 1);
        }
    }

    for (const section of document.querySelectorAll(
        "#ld-document-view ld-section",
    )) {
        section.onpointerdown = pointerdownHandler;
        section.onpointermove = pointermoveHandler;

        section.onpointerup = pointerupHandler;
        section.onpointercancel = pointerupHandler;
        section.onpointerout = pointerupHandler;
        section.onpointerleave = pointerupHandler;
    }
}

ldEvents.addEventListener(
    "afterLDListenerRegistrations",
    handlePinchAndZoomInDocumentView,
);
ldEvents.addEventListener(
    "afterLDListenerRegistrations",
    handleGesturesInSlideView,
);
