/**
 * A small helper library (module) which defines common functionality related
 * to manipulating the DOM.
 * 
 * @license BSD-3-Clause
 * @author Michael Eichberg
 */

export function create(
    elementName,
    {
        id = undefined,
        classList = undefined,
        innerHTML = undefined,
        parent = undefined,
        children = undefined,
    }
) {
    if (elementName === undefined) throw new Error("element must be defined");
    const element = document.createElement(elementName);
    if (id) element.id = id;
    if (classList) element.classList.add(...classList);
    if (innerHTML) element.innerHTML = innerHTML;
    if (children) element.append(...children);
    if (parent) parent.appendChild(element);
    return element;
};

/**
 * Creates a dialog element with the specified properties.
 *
 * @param {Object} options - The properties of the dialog.
 * @param {string} [options.id] - The id of the dialog.
 * @param {string[]} [options.classes] - The classes to add to the dialog. 
 * @param {Node[]} [options.children] - The child nodes to append to the dialog.
 * @returns {HTMLDialogElement} The created dialog element.
 */
export function dialog({ id = undefined, classes = undefined, children = undefined }) {
    const dialog = document.createElement('dialog');
    if (id) dialog.id = id;
    if (classes) dialog.classList.add(...classes);
    if (children) dialog.append(...children);
    return dialog;
};

export function div(
    {
        id = undefined,
        classes = undefined,
        parent = undefined,
        children = undefined,
        innerHTML = undefined
    }
) {
    const div = document.createElement('div');
    if (id) div.id = id;
    if (classes) div.classList.add(...classes);
    if (innerHTML) div.innerHTML = innerHTML;
    if (parent) parent.appendChild(div);
    if (children) div.append(...children);
    return div;
};

/**
 * Generate (additional) cells for a row in a table with the given index.
 *
 * @callback generateCells
 * @param {number} index - The index of the row (0-based).
 * @return {HTMLTableCellElement[]} - The generated cells or undefined.
 */

/**
 * Converts a 2D array into an HTML table.
 * 
 * @param {Object[][]} data - The content of the cells. The first index 
 *                            identifies the row, the second the column. 
 *                            E.g., data[1][2] is the cell in the second row 
 *                            (1) and third column (2).
 * @param {generateCells} [rowExt] - The row will be extended by the
 *          cells (td elements) returned by the function. If the function is 
 *          defined and a list of cells is actually returned.
 * @returns {HTMLTableElement} - The generated table.
 */
export function convertToTable(data, rowExt) {
    console.log("convertToTable: " + JSON.stringify(data));
    const tbody = document.createElement('tbody');
    for (let i = 0; i < data.length; i++) {
        const row = document.createElement('tr');
        tbody.appendChild(row);
        for (let j = 0; j < data[i].length; j++) {
            const cell = document.createElement('td');
            cell.innerHTML = data[i][j];
            row.appendChild(cell);
        }
        if (rowExt) {
            const cells = rowExt(i);
            if (cells) {
                cells.forEach(cell => row.appendChild(cell));
            }
        }
    }
    return create('table', { children: [tbody] });
}

/**
 * Converts a string in CSS notation into a variable name as used by
 * JavaScript except that also the first character is capitalized.
 * 
 * @param {string} str a string in css notation; e.g., "light-table". 
 * @param {string} separator a string which identifies the individual segments (default: "-").
 * @returns The given string where each segment is capitalized. 
 *      Segments are assumed to be separated using a dash ("-").
 *      E.g., "light-table" => "LightTable"
 *          
 */
export function capitalizeCSSName(str, separator = "-") {
    return str.
        split(separator).
        map((e) => { return e[0].toUpperCase() + e.slice(1) }).
        join("")
}


/** @deprecated Use closest()! */
export function getParent(element, className) {
    if (!element) return null;
    return getParentOrThis(element.parentNode, className);
}

export function getParentOrThis(element, className) {
    if (!element) return null;

    const classList = element.classList;
    if (classList && classList.contains(className)) {
        return element;
    } else {
        return getParentOrThis(element.parentNode, className);
    }
}


export function isElementFullyVisibleInContainer(element, container) {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return (
        elementRect.top >= containerRect.top &&
        elementRect.left >= containerRect.left &&
        elementRect.bottom <= containerRect.bottom &&
        elementRect.right <= containerRect.right
    );
}

export function isElementFullyVisible(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= windowHeight &&
        rect.right <= windowWidth
    );
}


// Given that there is no standard method to get the height of an
// element including its margin, we have to query the element to get its
// margin...
export function getTopAndBottomMargin(e) {
    const style = window.getComputedStyle(e);
    return parseInt(style.marginTop) + parseInt(style.marginBottom);
}
export function getLeftAndRightMargin(e) {
    const style = window.getComputedStyle(e);
    return parseInt(style.marginLeft) + parseInt(style.marginRight);
}
export function getLeftAndRightPadding(e) {
    const style = window.getComputedStyle(e);
    return parseInt(style.paddingLeft) + parseInt(style.paddingRight);
}
export function getLeftAndRightMarginAndPadding(e) {
    return getLeftAndRightMargin(e) + getLeftAndRightPadding(e);
}

export function postMessage(channel, msg, data) {
    channel.postMessage([msg, data]);

}

export function addScrollingEventListener(channel, eventTitle, scrollableElement, id) {
    // We will relay a scroll event to a secondary window, when there was no
    // more scrolling for at least TIMEOUTms. Additionally, if there is already an
    // event handler scheduled, we will not schedule another one. 
    //
    // If we would directly relay the event, it may be possible that it will 
    // result in all kinds of strange behaviors, because we cannot easily 
    // distinguish between a programmatic and a user initiated scroll event. 
    // This could result in a nasty ping-pong effect where scrolling between
    // two different position would happen indefinitely.
    const TIMEOUT = 50;
    let lastEvent = undefined;
    let eventHandlerScheduled = false;
    scrollableElement.addEventListener("scroll", (event) => {
        lastEvent = new Date().getTime();
        function scheduleEventHandler(timeout) {
            setTimeout(() => {
                const currentTime = new Date().getTime();
                if (currentTime - lastEvent < TIMEOUT) {
                    scheduleEventHandler(TIMEOUT - (currentTime - lastEvent));
                    return;
                }
                postMessage(channel, eventTitle, [id, event.target.scrollTop]);
                console.log(eventTitle + " " + id + " " + event.target.scrollTop);
                eventHandlerScheduled = false;
            }, timeout);
        };
        if(!eventHandlerScheduled) {
            eventHandlerScheduled = true;
            scheduleEventHandler(TIMEOUT);
        }
    },{passive: true});
}

