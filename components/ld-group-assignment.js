/*
Small wrapper that bridges LectureDoc module configuration and
the ld-group-assignment web component.
*/
import "./group-assignment/group-assignment.js";

const convertModuleBasedSpecificationToLDGroupAssignmentElement = () => {
    const modules = document
        .querySelector("body > template")
        .content.querySelectorAll(".module.group-assignment");

    modules.forEach((moduleElement) => {
        try {
            const raw = moduleElement.textContent.trim();
            const config = JSON.parse(raw);
            const defaultNumberOfStudents = config.defaultNumberOfStudents;
            const defaultGroupSize = config.defaultGroupSize;

            const groupAssignmentElement = document.createElement(
                "ld-group-assignment",
            );

            if (
                Number.isFinite(defaultNumberOfStudents) &&
                defaultNumberOfStudents > 0
            ) {
                groupAssignmentElement.setAttribute(
                    "default-number-of-students",
                    String(defaultNumberOfStudents),
                );
            }

            if (Number.isFinite(defaultGroupSize) && defaultGroupSize > 0) {
                groupAssignmentElement.setAttribute(
                    "default-group-size",
                    String(defaultGroupSize),
                );
            }

            moduleElement.replaceChildren(groupAssignmentElement);
            console.log("Group assignment element created");
        } catch (error) {
            console.error(
                `processing group-assignment failed: ${error} (${moduleElement.textContent})`,
            );
        }
    });
};

// lectureDoc2 is available globally in LectureDoc runtime
lectureDoc2.ldEvents.addEventListener(
    "beforeLDDOMManipulations",
    convertModuleBasedSpecificationToLDGroupAssignmentElement,
);
