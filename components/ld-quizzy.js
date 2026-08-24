/*
Small wrapper that is responsible for bridging the gap between LectureDoc and
the <ld-quiz> web component, which is independent of LectureDoc.

The component lives in `@lecturedoc2/quizzy` and is pulled in from npm;
importing it registers the `<ld-quiz>` custom element as a side effect. That
package ships source ESM with a bare dependency of its own, which is why this
file only resolves in a built LectureDoc2.
*/
import { ldEvents } from "../src/ld.js";
import "@lecturedoc2/quizzy"; // this makes the ld-quiz web component available

/**
 * A quiz is authored as a `{module}` directive whose body is a JSON object:
 *
 *     ```{module} ld-quiz
 *     {
 *         "server-url": "https://quiz.example.com",
 *         "presenter-name": "Michael Eichberg",
 *         "encrypted": true,
 *         "quiz": "NjAwMDAw:9Xk2...:pQ7f...:Lm4z..."
 *     }
 *     ```
 *
 * An envelope rather than the bare payload, because `<ld-module>` carries no
 * attributes a deck could configure - `name`, `scope` and `class` are all the
 * directive emits - which is the same reason `{module} timeline` takes a JSON
 * object too.
 *
 * The keys other than `quiz` are the component's own attributes, spelled the
 * same way and meaning the same thing, so that the envelope is a description of
 * the `<ld-quiz>` element it produces rather than a second vocabulary to learn.
 *
 * | key              | attribute        | meaning                              |
 * |------------------|------------------|--------------------------------------|
 * | `quiz`           | `quiz`           | the payload: an encrypted string, or the quiz object itself |
 * | `encrypted`      | `encrypted`      | `true` ⇒ `quiz` must be decrypted first |
 * | `server-url`     | `server-url`     | quiz server; defaults to the origin the deck came from |
 * | `presenter-name` | `presenter-name` | prefills the presenter name, beating `localStorage` |
 *
 * `encrypted` mirrors the attribute, so leaving it out means a plaintext quiz.
 * That is not a safety question: the flag says how to *read* the payload, and a
 * quiz is encrypted by `tools/encrypt-quiz.js` long before it reaches a deck.
 * Getting it wrong fails loudly at the first slide - a JSON parse error, or a
 * password prompt nothing will satisfy - and leaks nothing either way.
 */
const convertModuleBasedSpecificationToLDQuizElement = () => {
    const modules = document
        .querySelector("body > template")
        .content.querySelectorAll("ld-module[name='ld-quiz']");

    modules.forEach((moduleElement) => {
        try {
            const config = JSON.parse(moduleElement.textContent);

            /*
             * An encrypted quiz is a string; a plaintext one may be written as
             * a nested object, which spares the author from escaping a whole
             * quiz into a JSON string inside a JSON envelope.
             */
            const quiz =
                typeof config.quiz === "string"
                    ? config.quiz.trim()
                    : JSON.stringify(config.quiz ?? "");
            if (!quiz || quiz === '""') {
                throw new Error('the "quiz" key is missing or empty');
            }
            if (config.encrypted && typeof config.quiz !== "string") {
                throw new Error(
                    '"encrypted" is set, but "quiz" is not an encrypted string',
                );
            }

            const quizElement = document.createElement("ld-quiz");
            quizElement.setAttribute("quiz", quiz);
            if (config.encrypted) {
                quizElement.setAttribute("encrypted", "");
            }

            /*
             * These two are omitted rather than defaulted when absent. Without
             * `server-url` the component falls back to the origin the deck was
             * served from - right for a quiz server hosted alongside the
             * slides, and not something to guess at otherwise. And an empty
             * `presenter-name` would override the name remembered in
             * localStorage, which is precisely what that attribute is for.
             */
            for (const attribute of ["server-url", "presenter-name"]) {
                const value = config[attribute];
                if (value) quizElement.setAttribute(attribute, value);
            }

            moduleElement.replaceChildren(quizElement);
        } catch (error) {
            console.error(
                `processing ld-quiz failed: ${error} (${moduleElement.textContent})`,
            );
        }
    });
};

ldEvents.addEventListener(
    "beforeLDDOMManipulations",
    convertModuleBasedSpecificationToLDQuizElement,
);
