"use-strict";

/**
 * A small helper library to make code more comprehensible.
 */
const lectureDoc2Library = function () {

    const create = function (element, { id = undefined, className = undefined }) {
        if (element === undefined) throw new Error("element must be defined");
        const div = document.createElement(element);
        if (id) div.id = id;
        if (className) div.className = className;
        return div;
    };

    const dialog = function ({ id = undefined, classList = undefined, children = undefined }) {
        const dialog = document.createElement('dialog');
        if (id) dialog.id = id;
        dialog.className = "ld-dialog";
        if (classList) dialog.classList.add(...classList);
        if (children) dialog.append(...children);
        return dialog;
    };

    const div = function ({ id = undefined, classes = undefined, parent = undefined, children = undefined }) {
        const div = document.createElement('div');
        if (id) div.id = id;
        if (classes) div.classList.add(...classes);
        if (parent) parent.appendChild(div);
        if (children) div.append(...children);
        return div;
    };


    return {
        create: create,
        dialog: dialog,
        div: div
    }

};
