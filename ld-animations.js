"use strict";

/**
 * Functionality related to animations on slides which need some JavaScript
 * to get it done.
 *
 * This is not considered to be core functionality of LectureDoc.
 * 
 * All functionality is defined in the `lectureDoc2Animations` module to avoid
 * conflicts with other JavaScript libraries. This module will be called after 
 * all DOM manipulations and listener registrations to the original document.
 * I.e., at the end of LectureDoc's `window.onLoad` listener.
 */
const lectureDoc2Animations = function () {

    /* -------------------------------------------------------------------------
        Private methods.
    */

    /**
     * Handles the rendering of a stack layout in the continuous view.
     */
    function adaptHeightOfSlideToStack(stack) {

        // Given that there is no standard method to get the height of an
        // element including its margin, we have to query the element to get its
        // margin...
        function getTopAndBottomMargin(layer) {
            const style = window.getComputedStyle(layer);
            return parseInt(style.marginTop) + parseInt(style.marginBottom);
        }

        // 1. query all layers to compute the necessary heights
        var overallHeight = 0;
        var maxOuterHeight = 0;
        var topOffset = 0;

        var maxGroupedLayersOuterHeight = 0;
        var groupedLayers = [];

        function processLastGroupedLayers() {
            overallHeight += maxGroupedLayersOuterHeight  ;
            groupedLayers.forEach((layer, i) => {
                const marginHeight = getTopAndBottomMargin(layer)
                layer.style.height = (maxGroupedLayersOuterHeight - marginHeight) + "px";
                // Adapt top parameter according to the new height
                // of the base element.
                if (i >= 1) {
                    topOffset -= (maxGroupedLayersOuterHeight);
                }
                layer.style.top = topOffset + "px";
            });
            console.log("overallHeight: " + overallHeight);
        }

        stack.querySelectorAll(":scope >.layer").forEach((layer, i) => {
            const layerOffsetHeight = layer.offsetHeight
            const layerOuterHeight = layerOffsetHeight + getTopAndBottomMargin(layer);
            maxOuterHeight = Math.max(maxOuterHeight, layerOuterHeight);

            if (!layer.classList.contains("overlay")) {
                processLastGroupedLayers();
                groupedLayers = [layer]; // a non-overlay layer and all its overlay layers
                maxGroupedLayersOuterHeight = layerOuterHeight;
            } else {
                groupedLayers.push(layer);
                // In case of an overlay layer, we set the height of the 
                // reference layer (lastNonOverlayLayer), which has to have
                // position: relative, to the maximum height required by itself 
                // or any of the stacked overlay layers.
                maxGroupedLayersOuterHeight = Math.max(maxGroupedLayersOuterHeight, layerOuterHeight);
            }
            console.log("layerOuterHeight: " + layerOuterHeight + " maxGrouped: "+ maxGroupedLayersOuterHeight+" maxOuterHeight: " + maxOuterHeight);
        });
        processLastGroupedLayers();

        // 2. set the height of the stack to the sum of the heights of all 
        //    non-overlay layers (after adapting the heights of them if necessary)
        stack.style.height = stack.style.maxHeight = overallHeight + "px";

        // 3. adapt the height of the slide to accommodate the unfolded stack
        const root = getComputedStyle(document.querySelector(":root"));
        const zoomFactor = root.getPropertyValue("--ld-continuous-view-zoom-level");
        const extraHeight = overallHeight - maxOuterHeight;

        const slide = document.evaluate(
            `*/ancestor::*[contains(@class,'ld-slide')]`,
            stack,
            null,
            XPathResult.ANY_TYPE,
            null).iterateNext()
        const oldSlideHeight = slide.offsetHeight
        const slidePaneHeight = (oldSlideHeight + extraHeight)
        slide.style.height = slidePaneHeight + "px";

        const slidePane = document.evaluate(
            `*/ancestor::*[contains(@class,'ld-continuous-view-slide-pane')]`,
            stack,
            null,
            XPathResult.ANY_TYPE,
            null).iterateNext().style;
        slidePane.height = slidePane.maxHeight = (slidePaneHeight * zoomFactor) + "px";
    }

    /**
     *  In pure CSS it is not possible to adapt the height of an element to 
     * the height of its tallest child when all children are positioned 
     * absolutely. 
     * 
     * Hence, we have to observe each ".stack" element and, when one 
     * intersects with the viewport, we stop observing it and set the 
     * height of the stack and all its ".layer" children to the height of 
     * the tallest layer. 
     */
    function adaptHeightOfLayersAndStack(stack) {
        // 1. query all layers for the necessary height
        var maxHeight = 0
        stack.querySelectorAll(":scope >.layer").forEach((layer, i) => {
            maxHeight = Math.max(maxHeight, layer.offsetHeight);
        });
        // 2. set the height of all layers and the stack to maxHeight
        stack.querySelectorAll(":scope >.layer").forEach((layer, i) => {
            layer.style.height = maxHeight + "px";
        });
        stack.style.height = maxHeight + "px";
    }


    /* -------------------------------------------------------------------------

       The following functions are called by LectureDoc at different points in 
       time.

    */

    /**
     * This method is called before the DOM is manipulated by LectureDoc.
     * 
     * At this point in time the DOM is still in the original state. I.e., 
     * the slide templates are not yet copied to the respective views.
     */
    function beforeLDDOMManipulations() {
        /* empty for now */
    }


    function afterLDDOMManipulations() {
        /* empty for now */
    }

    /**
     * This function is called after all listener registrations related 
     * to the core functionality of LectureDoc have been done.
     * 
     * User this method to register additional listeners.
     */
    function afterLDListenerRegistrations() {

        /**
         * Elements which are not visible because 
         * their parent has a display:none property will not be layed out and 
         * have no size. Hence, to compute the size of a .stack we have to wait
         * until it is visible.
         */
        const observer = new IntersectionObserver((events) => {
            events.forEach((event) => {
                if (event.isIntersecting) {
                    const stack = event.target;
                    observer.unobserve(stack);

                    if (document.evaluate(
                        `*/ancestor::*[@id='ld-continuous-view-pane']`,
                        stack,
                        null,
                        XPathResult.ANY_TYPE,
                        null).iterateNext()) {
                        adaptHeightOfSlideToStack(stack);
                    } else {
                        adaptHeightOfLayersAndStack(stack);
                    }
                }
            });
        });
        document.querySelectorAll(":is(#ld-main-pane, #ld-light-table-dialog, #ld-continuous-view-pane) .ld-slide .stack").forEach((stack) => {
            observer.observe(stack);
        });


        /**
         * The following highlights the current element and the element in 
         * the first row with the same column and in the first column with the same
         * row.
         * 
         * Note that, highlighting the row is trivially done in CSS, highlighting 
         * a column is not yet easily possible and requires either a too ugly css
         * solution or some JavaScript as shown here.
         * 
         * Currently, we only support most basic table without cells which span multiple columns or rows. Also tables which have a header row are not yet supported.
         */
        // TODO add support to handle colspan and rowspan...
        // TODO add support to handle header rows (and header columns?)
        document.querySelectorAll("table.highlight-on-hover").forEach((table) => {
            const tbody = table.querySelector(":scope tbody")
            function highlight(row, column) {
                const headerRowTD = tbody.querySelector(`:scope tr td:nth-of-type(${column + 1})`)
                headerRowTD.classList.add("highlight")
                const headerColumnTD = tbody.querySelector(`:scope tr:nth-of-type(${row + 1}) td`)
                headerColumnTD.classList.add("highlight")
            };
            function dehighlight(row, column) {
                const headerRowTD = tbody.querySelector(`:scope tr td:nth-of-type(${column + 1})`)
                headerRowTD.classList.remove("highlight")
                const headerColumnTD = tbody.querySelector(`:scope tr:nth-of-type(${row + 1}) td`)
                headerColumnTD.classList.remove("highlight")
            };

            table.querySelectorAll(":scope tr").forEach((tr, r) => {
                tr.querySelectorAll(":scope td").forEach((td, c) => {
                    td.addEventListener("mouseover", () => {
                        highlight(r, c)
                        td.classList.add("highlight");
                    });
                    td.addEventListener("mouseleave", () => {
                        dehighlight(r, c)
                        td.classList.remove("highlight");
                    });
                });
            });
        });
    }

    return {
        "beforeLDDOMManipulations": beforeLDDOMManipulations,
        "afterLDDOMManipulations": afterLDDOMManipulations,
        "afterLDListenerRegistrations": afterLDListenerRegistrations
    };
}();