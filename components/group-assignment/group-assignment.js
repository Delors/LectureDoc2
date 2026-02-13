/*
   Copyright 2026

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
*/
import {
    LD_GROUP_ASSIGNMENT_TRANSLATIONS,
    getDocumentLanguage,
} from "./group-assignment.i18n.js";

class LDGroupAssignment extends HTMLElement {
    static get observedAttributes() {
        return ["default-group-size", "default-number-of-students"];
    }

    #state = {
        groupSize: 4,
        numberOfStudents: 20,
        result: null,
    };

    constructor() {
        super();
    }

    connectedCallback() {
        const style = getComputedStyle(this);
        if (style.display === "inline") this.style.display = "block";

        this.#initializeStateFromAttributes();
        this.#render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (name === "default-group-size") {
            const parsed = this.#parsePositiveInt(newValue);
            if (parsed !== null) this.#state.groupSize = parsed;
        } else if (name === "default-number-of-students") {
            const parsed = this.#parsePositiveInt(newValue);
            if (parsed !== null) this.#state.numberOfStudents = parsed;
        }

        if (this.isConnected) this.#render();
    }

    #initializeStateFromAttributes() {
        const defaultGroupSize = this.#parsePositiveInt(
            this.getAttribute("default-group-size"),
        );
        if (defaultGroupSize !== null) this.#state.groupSize = defaultGroupSize;

        const defaultStudents = this.#parsePositiveInt(
            this.getAttribute("default-number-of-students"),
        );
        if (defaultStudents !== null)
            this.#state.numberOfStudents = defaultStudents;
    }

    #parsePositiveInt(value) {
        // also handles "0" correctly!
        if (!value) return null;
        const n = Number.parseInt(String(value), 10);
        if (!Number.isFinite(n) || n <= 0) return null;
        return n;
    }

    #t() {
        const lang = getDocumentLanguage();
        return (
            LD_GROUP_ASSIGNMENT_TRANSLATIONS[lang] ||
            LD_GROUP_ASSIGNMENT_TRANSLATIONS.en
        );
    }

    #shuffle(array) {
        for (let i = array.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    #computeDistribution(numberOfStudents, groupSize) {
        const baseGroupCount = Math.floor(numberOfStudents / groupSize);

        if (baseGroupCount === 0) {
            const students = this.#shuffle(
                Array.from({ length: numberOfStudents }, (_, i) => i + 1),
            );
            return {
                totalGroups: 1,
                students: numberOfStudents,
                requestedGroupSize: groupSize,
                regularGroupSize: numberOfStudents,
                regularGroups: 1,
                largerGroupSize: numberOfStudents,
                largerGroups: 0,
                groups: [students],
            };
        }

        const remainder = numberOfStudents % groupSize;
        const regularGroups = baseGroupCount - remainder;
        const largerGroups = remainder;

        const groupSizes = Array.from(
            { length: baseGroupCount },
            () => groupSize,
        );
        for (let i = 0; i < remainder; i += 1) {
            groupSizes[i] += 1;
        }

        const shuffledStudents = this.#shuffle(
            Array.from({ length: numberOfStudents }, (_, i) => i + 1),
        );

        const groups = [];
        let index = 0;
        for (const size of groupSizes) {
            groups.push(shuffledStudents.slice(index, index + size));
            index += size;
        }

        return {
            totalGroups: baseGroupCount,
            students: numberOfStudents,
            requestedGroupSize: groupSize,
            regularGroupSize: groupSize,
            regularGroups,
            largerGroupSize: groupSize + 1,
            largerGroups,
            groups,
        };
    }

    #escapeHTML(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    #onSubmit(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);

        const numberOfStudents = this.#parsePositiveInt(
            formData.get("students"),
        );
        const groupSize = this.#parsePositiveInt(formData.get("group-size"));

        if (numberOfStudents === null || groupSize === null) {
            return;
        }

        this.#state.numberOfStudents = numberOfStudents;
        this.#state.groupSize = groupSize;
        this.#state.result = this.#computeDistribution(
            numberOfStudents,
            groupSize,
        );

        this.#render();
    }

    #resetToInput() {
        this.#state.result = null;
        this.#render();
    }

    #renderInput() {
        const t = this.#t();
        return `
            <form part="form" class="ld-group-assignment__form">
                <p part="heading"><strong>${t.heading}</strong></p>

                <label part="label">
                    ${t.numberOfStudents}
                    <input
                        part="input students-input"
                        class="ld-group-assignment__input"
                        type="number"
                        name="students"
                        min="1"
                        step="1"
                        required
                        value="${this.#escapeHTML(this.#state.numberOfStudents)}"
                    >
                </label>

                <label part="label">
                    ${t.desiredGroupSize}
                    <input
                        part="input group-size-input"
                        class="ld-group-assignment__input"
                        type="number"
                        name="group-size"
                        min="1"
                        step="1"
                        required
                        value="${this.#escapeHTML(this.#state.groupSize)}"
                    >
                </label>

                <button part="button compute-button" type="submit">${t.compute}</button>
            </form>
        `;
    }

    #renderGroups(result) {
        const t = this.#t();
        const groupsMarkup = result.groups
            .map((group, index) => {
                const members = group.join(", ");
                return `<li part="group-item"><strong>${t.groupLabel} ${index + 1}:</strong> ${members}</li>`;
            })
            .join("");
        return `
            <div part="assignments" class="ld-group-assignment__assignments">
                <p part="assignments-heading"><strong>${t.assignmentsHeading}</strong></p>
                <ol part="group-list" class="ld-group-assignment__group-list">
                    ${groupsMarkup}
                </ol>
            </div>
        `;
    }

    #renderResultTable(result) {
        const t = this.#t();
        return `
            <div part="result" class="ld-group-assignment__result">
                <table part="table" class="ld-group-assignment__table">
                    <caption part="caption">${t.distributionResult}</caption>
                    <tbody>
                        <tr><th part="cell header">${t.students}</th><td part="cell">${result.students}</td></tr>
                        <tr><th part="cell header">${t.requestedGroupSize}</th><td part="cell">${result.requestedGroupSize}</td></tr>
                        <tr><th part="cell header">${t.totalGroups}</th><td part="cell">${result.totalGroups}</td></tr>
                        <tr><th part="cell header">${t.groupsWithMembers(result.regularGroupSize)}</th><td part="cell">${result.regularGroups}</td></tr>
                        <tr><th part="cell header">${t.groupsWithMembers(result.largerGroupSize)}</th><td part="cell">${result.largerGroups}</td></tr>
                    </tbody>
                </table>
                ${this.#renderGroups(result)}
                <button part="button back-button" type="button">${t.changeValues}</button>
            </div>
        `;
    }

    #render() {
        const result = this.#state.result;
        this.innerHTML = result
            ? this.#renderResultTable(result)
            : this.#renderInput();

        if (!result) {
            const form = this.querySelector("form");
            if (form)
                form.addEventListener("submit", (event) =>
                    this.#onSubmit(event),
                );
        } else {
            const backButton = this.querySelector("button[type='button']");
            if (backButton)
                backButton.addEventListener("click", () =>
                    this.#resetToInput(),
                );
        }
    }
}

customElements.define("ld-group-assignment", LDGroupAssignment);
