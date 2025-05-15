/**
 * This JavaScript module implements advanced functionality related to tables.
 *
 * In particular, selective highlighting of...
 * - rows (highlight-row-on-hover)
 * - identical cells (highlight-identical-cells-on-hover)
 * - a cell and the corresponding cell in the first row/column (highlight-on-hover)
 *
 * The highlighting is also relayed to secondary windows.
 */
import lectureDoc2 from "./../ld.js";

console.log("loading ld-tables.js");

/**
 * This method is called before the DOM is manipulated by LectureDoc.
 *
 * At this point in time the DOM is still in the original state. I.e.,
 * the slide templates are not yet copied to the respective views.
 */
function beforeLDDOMManipulations() {
    /*
    console.log("performing ld-components.beforeLDDOMManipulations");
    */
    // empty for now
}

function afterLDDOMManipulations() {
    /*
    console.log("performing ld-components.afterLDDOMManipulations");

    */
    // empty for now
}

const tables = [];

/**
 * This function is called after all listener registrations related
 * to the core functionality of LectureDoc have been done.
 *
 * Use this method to register additional listeners.
 */
function afterLDListenerRegistrations() {
    console.log("performing ld-tables.afterLDListenerRegistrations");

    document.querySelectorAll("#ld-slides-pane table").forEach((table, i) => {
        table.dataset.ldTablesId = i;
        tables.push(table);
    });

    // See
    //      https://html.spec.whatwg.org/#tables
    //      https://html.spec.whatwg.org/#dom-tr-rowindex
    //      https://html.spec.whatwg.org/#dom-tr-sectionrowindex
    //      https://html.spec.whatwg.org/#dom-tdth-cellindex
    // for the precise definition of cellIndex, rowIndex, and sectionRowIndex

    // Keep Windows in Sync ----------------------------------------------------
    // If a document channel exits, we will listen to scrolling events and
    // send them to the other windows. Additionally, we will listen to the
    // "scrollableScrolled" event and update the scrollable element accordingly.
    const ephemeral = lectureDoc2.getEphemeral();
    if (
        ephemeral.ldPerDocumentChannel /* recall: no document id - no channel */
    ) {
        const channel = ephemeral.ldPerDocumentChannel;

        // listen for highlighting based events
        // ...
    }

    function addHoverState(hoveredTableElement, ...hoverRelatedTableElements) {
        if (hoveredTableElement) {
            hoveredTableElement.classList.add(":hover");
        }
        hoverRelatedTableElements.forEach((td) => {
            td.classList.add(":hover-related");
        });
    }

    function removeHoverState(
        hoveredTableElement,
        ...hoverRelatedTableElements
    ) {
        if (hoveredTableElement) {
            hoveredTableElement.classList.remove(":hover");
        }
        hoverRelatedTableElements.forEach((td) => {
            td.classList.remove(":hover-related");
        });
    }

    tables.forEach((table) => {
        const tbody = table.querySelector(":scope tbody");

        if (table.classList.contains("highlight-cell-on-hover")) {
            tbody.querySelectorAll(":scope td").forEach((td) => {
                td.addEventListener("mouseenter", () => addHoverState(td));
                td.addEventListener("mouseleave", () => removeHoverState(td));
            });
        }

        if (table.classList.contains("highlight-row-on-hover")) {
            tbody.querySelectorAll(":scope tr").forEach((tr) => {
                tr.addEventListener("mouseenter", () =>
                    addHoverState(undefined, tr),
                );
                tr.addEventListener("mouseleave", () =>
                    removeHoverState(undefined, tr),
                );
            });
        }

        /**
         * We highlight the current element and the element in the first row
         * with the same column and in the first column with the same row.
         */
        if (table.classList.contains("table.highlight-on-hover")) {
            function highlight(cell, hovered) {
                const cellIndex = cell.cellIndex; // <=> columnIndex
                const rowIndex = cell.parentElement.rowIndex;
                const hoverRelatedCells = [];
                //table.rows[rowIndex].cells[cellIndex].classList.add(":hover");
                if (rowIndex !== 0)
                    hoverRelatedCells.push(table.rows[0].cells[cellIndex]);
                if (cellIndex !== 0)
                    hoverRelatedCells.push(table.rows[rowIndex].cells[0]);
                if (hovered) {
                    addHoverState(cell, ...hoverRelatedCells);
                } else {
                    removeHoverState(cell, ...hoverRelatedCells);
                }
            }

            // th.stub is used by rst to mark up data cells in columns that
            // serve as row headers
            tbody.querySelectorAll(":scope td").forEach((td) => {
                td.addEventListener("mouseenter", () => highlight(td, true));
                td.addEventListener("mouseleave", () => highlight(td, false));
            });
        }

        if (table.classList.contains("tablehighlight-cell-and-row-on-hover")) {
            function highlight(cell, hovered) {
                let relatedCells = new Set(cell.parentElement.cells);
                relatedCells.delete(cell);
                if (hovered) {
                    addHoverState(cell, ...relatedCells);
                } else {
                    removeHoverState(cell, ...relatedCells);
                }
            }

            tbody.querySelectorAll(":scope td").forEach((td) => {
                td.addEventListener("mouseenter", () => highlight(td, true));
                td.addEventListener("mouseleave", () => highlight(td, false));
            });
        }

        if (table.classList.contains("highlight-identical-cells-on-hover")) {
            /* TODO Clarify if we want to do the matching based on the text    or the structure!

            function eq(nl1, nl2) {
                return (
                    nl1.length === nl2.length &&
                    Array.from(nl1).every((v, i) => v.isEqualNode(nl2[i]))
                );
            }
            */
            function highlight(cell, hovered) {
                let hoverRelatedCells = [];
                const textContent = cell.textContent;
                tbody.querySelectorAll(":scope td").forEach((otherCell) => {
                    //if (eq(cell.childNodes, otherCell.childNodes)) {
                    if (
                        cell !== otherCell &&
                        textContent === otherCell.textContent
                    ) {
                        hoverRelatedCells.push(otherCell);
                    }
                });

                if (hovered) {
                    addHoverState(cell, ...hoverRelatedCells);
                } else {
                    removeHoverState(cell, ...hoverRelatedCells);
                }
            }

            tbody.querySelectorAll(":scope td").forEach((td) => {
                td.addEventListener("mouseenter", () => highlight(td, true));
                td.addEventListener("mouseleave", () => highlight(td, false));
            });
        }
    });

    /*
        document
            .querySelectorAll("#ld-slides-pane table.highlight-cell-on-hover")
            .forEach((table) => {
                const tbody = table.querySelector(":scope tbody");
                // th.stub is used by rst to identify cells in columns that
                // serve as row headers
                tbody.querySelectorAll(":scope td").forEach((td) => {
                    td.addEventListener("mouseenter", () => addHoverState(td));
                    td.addEventListener("mouseleave", () => removeHoverState(td));
                });
            });

        document
            .querySelectorAll("#ld-slides-pane table.highlight-row-on-hover")
            .forEach((table) => {
                table.querySelectorAll(":scope tbody tr").forEach((tr) => {
                    tr.addEventListener("mouseenter", () => addHoverState(tr));
                    tr.addEventListener("mouseleave", () => removeHoverState(tr));
                });
            });
         */

    /**
         * The following highlights the current element and the element in
         * the first row with the same column and in the first column with the
         * same row.

        document
            .querySelectorAll("#ld-slides-pane table.highlight-on-hover")
            .forEach((table) => {
                function highlight(cell, hovered) {
                    const cellIndex = cell.cellIndex; // <=> columnIndex
                    const rowIndex = cell.parentElement.rowIndex;
                    const hoverRelatedCells = [];
                    //table.rows[rowIndex].cells[cellIndex].classList.add(":hover");
                    if (rowIndex !== 0)
                        hoverRelatedCells.push(table.rows[0].cells[cellIndex]);
                    if (cellIndex !== 0)
                        hoverRelatedCells.push(table.rows[rowIndex].cells[0]);
                    if (hovered) addHoverState(cell, ...hoverRelatedCells);
                    else removeHoverState(cell, ...hoverRelatedCells);
                }

                const tbody = table.querySelector(":scope tbody");
                // th.stub is used by rst to mark up data cells in columns that
                // serve as row headers
                tbody.querySelectorAll(":scope td").forEach((td) => {
                    td.addEventListener("mouseenter", () => highlight(td, true));
                    td.addEventListener("mouseleave", () => highlight(td, false));
                });
            });
            */
    /*
    document
        .querySelectorAll(
            "#ld-slides-pane table.highlight-identical-cells-on-hover",
        )
        .forEach((table) => {
            const tbody = table.querySelector(":scope tbody");
            function eq(nl1, nl2) {
                return (
                    nl1.length === nl2.length &&
                    Array.from(nl1).every((v, i) => v.isEqualNode(nl2[i]))
                );
            }
            function highlightValue(baseTD) {
                console.log(
                    baseTD.cellIndex +
                        " " +
                        baseTD.parentNode.rowIndex +
                        " " +
                        baseTD.parentNode.sectionRowIndex,
                );
                baseTD.classList.add(":hover");
                tbody.querySelectorAll(":scope td").forEach((td) => {
                    //if (eq(baseTD.childNodes, td.childNodes)) {
                    if (baseTD.textContent === td.textContent) {
                        td.classList.add(":hover-related");
                    }
                });
            }
            function dehighlightValue(baseTD) {
                tbody.querySelectorAll(":scope td").forEach((td) => {
                    // if (eq(baseTD.childNodes, td.childNodes)) {
                    if (baseTD.textContent === td.textContent) {
                        td.classList.remove(":hover-related");
                    }
                });
                baseTD.classList.remove(":hover");
            }

            tbody.querySelectorAll(":scope td").forEach((td) => {
                td.addEventListener("mouseenter", () => highlightValue(td));
                td.addEventListener("mouseleave", () => dehighlightValue(td));
            });
        });
*/
    /*
        document
            .querySelectorAll(
                "#ld-slides-pane table.highlight-cell-and-row-on-hover",
            )
            .forEach((table) => {
                function highlightRow(baseTD) {
                    baseTD.classList.add(":hover");
                    const tr = baseTD.parentNode;
                    const tds = Array.from(tr.cells);
                    tds.forEach((td) => {
                        if (baseTD !== td) td.classList.add(":hover-related");
                    });
                }
                function dehighlightRow(baseTD) {
                    Array.from(baseTD.parentNode.cells).forEach((td) => {
                        td.classList.remove(":hover-related");
                    });
                    baseTD.classList.remove(":hover");
                }

                table.querySelectorAll(":scope td").forEach((td) => {
                    td.addEventListener("mouseenter", () => highlightRow(td));
                    td.addEventListener("mouseleave", () => dehighlightRow(td));
                });
            });
        */
}

const ldEvents = lectureDoc2.ldEvents;
ldEvents.addEventListener(
    "afterLDListenerRegistrations",
    afterLDListenerRegistrations,
);
