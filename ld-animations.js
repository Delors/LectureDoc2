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
const lectureDoc2Animations = function() {

    /**
     * In the following we highlight the current element and the element in 
     * the first row with the same column and in the first column with the same
     * row.
     * 
     * Note that, highlighting the row is trivially done in CSS, highlighting 
     * a column is not yet easily possible and requires either a too ugly css
     * solution or some JavaScript.
     */
    // TODO add support to handle colspan and rowspan...
    // TODO add support to handle header rows (and header columns?)
    document.querySelectorAll("table.highlight-on-hover").forEach((table) => {
        const tbody = table.querySelector(":scope tbody")
        function highlight(row,column) {
            const headerRowTD = tbody.querySelector(`:scope tr td:nth-of-type(${column+1})`)
            headerRowTD.classList.add("highlight")
            const headerColumnTD = tbody.querySelector(`:scope tr:nth-of-type(${row+1}) td`)
            headerColumnTD.classList.add("highlight")
        };
        function dehighlight(row,column) {
            const headerRowTD = tbody.querySelector(`:scope tr td:nth-of-type(${column+1})`)
            headerRowTD.classList.remove("highlight")
            const headerColumnTD = tbody.querySelector(`:scope tr:nth-of-type(${row+1}) td`)
            headerColumnTD.classList.remove("highlight")
        };

        table.querySelectorAll(":scope tr").forEach((tr,r) => {
            tr.querySelectorAll(":scope td").forEach((td,c) => {
                td.addEventListener("mouseover",() => {
                    highlight(r,c)
                    td.classList.add("highlight");
                });
                td.addEventListener("mouseleave",() => {
                    dehighlight(r,c)
                    td.classList.remove("highlight");
                });
            });
        });
    });
};