/**
 * Implements scrollable containers.
 */
import lectureDoc2 from "./../ld.js";
import * as ld from './ld-lib.js';


console.log("loading ld-scrollables.js");


/**
 * Handles the rendering of a "scrollable" element on a slide.
 * 
 * Currently, we only support scrollables that are direct child
 * elements of elements with a fixed height such as the "ld-slide" 
 * elements.
 */
function adaptHeightOfScrollableToRemainingSpace(scrollable) {
    const parentNodeStyle = window.getComputedStyle(scrollable.parentNode)
    const parentHeight = parseInt(parentNodeStyle.height, 10);
    const parentPaddingBottom = parseInt(parentNodeStyle.paddingBottom, 10);
    const offsetTop = scrollable.offsetTop
    scrollable.style.height = 
        (parentHeight - offsetTop - parentPaddingBottom) + "px";
}



/**
 * Called when a scrollable element in a different, but connected window (i.e., 
 * a secondary window), has been scrolled.
 * 
 * @param {*} scrollableId 
 * @param {*} scrollTop 
 */
function localScrollScrollable(scrollableId, scrollTop) {
    const scrollable = document.querySelector(
        `#ld-slides-pane ld-scrollable[data-scrollable-id="${scrollableId}"]`);
    
    if (scrollable.scrollTop !== scrollTop) {
        scrollable.scrollTo({top:scrollTop, scrollTop, behavior:"smooth"});
    }
}


/**
 * This function is called after all listener registrations related 
 * to the core functionality of LectureDoc have been done.
 * 
 * Use this method to register additional listeners.
 */
function afterLDListenerRegistrations() {
    console.log("performing ld-scrollables.afterLDListenerRegistrations");

    const ephemeral = lectureDoc2.getEphemeral() 

    if (ephemeral.ldPerDocumentChannel /* no document id - no channel */) {
        const channel = ephemeral.ldPerDocumentChannel
        channel.addEventListener("message", (event) => {
            const [msg, data] = event.data;
            switch (msg) {
                case "scrollableScrolled": {
                    const [scrollableId, scrollTop] = data;
                    localScrollScrollable(scrollableId, scrollTop);
                    event.stopImmediatePropagation();
                }
            }
        });
    

    let scrollableId = 1;
    document.querySelectorAll("#ld-slides-pane ld-scrollable").forEach((scrollable) => {
        const id = scrollableId++;
        scrollable.dataset.scrollableId = id;
        // We want to collapse multiple events into one, but ensure that we
        // never miss the "final" event.
        ld.addScrollingEventListener(channel,"scrollableScrolled",scrollable, id);
    });
}

    const scrollableObserver = new IntersectionObserver((events) => {
        events.forEach((event) => {
            if (event.isIntersecting) {
                const scrollable = event.target;
                scrollableObserver.unobserve(scrollable);
                // console.log("intersection with scrollable: " + scrollable);
                setTimeout(() => adaptHeightOfScrollableToRemainingSpace(scrollable));
            }
        });
    });
    document.querySelectorAll(":is(#ld-slides-pane, #ld-light-table-dialog) ld-scrollable").forEach((scrollable) => {
        scrollableObserver.observe(scrollable);
    });

}



lectureDoc2.ldEvents.addEventListener(
    "afterLDListenerRegistrations", 
    afterLDListenerRegistrations);
