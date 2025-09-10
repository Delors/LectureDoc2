import lectureDoc2 from "./../ld.js";

console.log("loading ld-images.js");

function scaleImageOnLoad(img, scalingFactor) {
    if (scalingFactor) {
        img.addEventListener("load", () => {
            const targetWidth = img.naturalWidth * scalingFactor;
            const targetHeight = img.naturalHeight * scalingFactor;

            console.log(
                `scaling image (${img.naturalWidth} x ${img.naturalHeight}) by ${scalingFactor}`,
                img,
                targetWidth,
                targetHeight,
            );

            img.style.width = targetWidth + "px";
            img.style.height = targetHeight + "px";
        });
    }
}

function scaleDocumentImagesAndVideos() {
    const slideToDocumentScalingFactor =
        parseInt(
            window.getComputedStyle(document.getElementById("ld-document-view"))
                .minWidth,
        ) / lectureDoc2.presentation.slide.width;

    console.log(
        `slide to document scaling factor: ${slideToDocumentScalingFactor}`,
    );

    document.querySelectorAll("ld-section img").forEach((img) => {
        if (img.style.width || img.style.height) return;
        const classList = img.classList;

        let scalingFactor = undefined;

        /* see scaleSlideImages for documentation */
        for (const clazz of img.classList) {
            if (clazz.startsWith("scale-")) {
                const factor = parseInt(clazz.slice(6)) / 100;
                if (!isNaN(factor)) {
                    scaleImageOnLoad(
                        img,
                        factor * slideToDocumentScalingFactor,
                    );
                }
                break;
            }
        }

        // TODO get rid of it
        if (classList.contains("highdpi")) scalingFactor = 0.4;

        scaleImageOnLoad(img, scalingFactor);
    });

    document
        .querySelectorAll("ld-section video:not(.no-scaling)")
        .forEach((video) => {
            if (!video.height || !video.width) {
                console.warn(
                    "cannot adapt size of video for document view: missing size information:",
                    video,
                );
                return;
            }
            const newHeight = video.height / 3;
            const newWidth = video.width / 3;
            console.log(
                `adapting size of video (height: ${video.height} -> ${newHeight}; width: (${video.width} -> ${newWidth}):`,
                video,
            );
            video.height = newHeight;
            video.width = newWidth;
        });
}

function scaleSlideImages() {
    const imgs = document.querySelectorAll("ld-slide img");
    for (const img of imgs) {
        if (img.style.width || img.style.height)
            // if we have explicit sizing of the image, we don't want to change it
            continue;
        if (img.complete) {
            console.error(
                "image " +
                    img.src +
                    " is already loaded: " +
                    img.naturalWidth +
                    "x" +
                    img.naturalHeight,
            );
            // TODO Implement when required.
        } else {
            /*  The user specifies the scaling factor such that the user gets
                the desired size of the image on the slide.
                In the continuous view, the scaling factor is adapted to reflect
                the difference between the size of slides and the maximum
                width of the document view.

                I.e., let's assume an image has 5000*2000 Pixels and we want
                it on the slide. Let's further assume that a slide has a nominal
                resolution of 1920x1080 Pixel. In this case, the scaling factor
                (specified by the user) has to be (at most) = 0.384.

                If the maximum width of the document view is, however, just
                600 Pixel, the 0.384 will be multiplied by 0.3125 (600/1920) to
                get the final scaling factor of 0.12 for the document view.

                For technical reasons the user specified the scaling in percent!
             */
            let isScaled = false;
            for (const clazz of img.classList) {
                if (clazz.startsWith("scale-")) {
                    const factor = parseInt(clazz.slice(6)) / 100;
                    if (!isNaN(factor)) {
                        scaleImageOnLoad(img, factor);
                    } else {
                        console.error(
                            "img with invalid scaling factor:",
                            img,
                            factor,
                        );
                    }
                    isScaled = true;
                    break;
                } else if (clazz === "highdpi") {
                    isScaled = true;
                    break;
                }
            }
            if (!isScaled) {
                // FIXME The images are made for the document view... get rid of it
                scaleImageOnLoad(img, 3);
            }
        }
    }

    const objects = document.querySelectorAll(
        "ld-slide object[role='img'][type='image/svg+xml']",
    );
    for (const obj of objects) {
        const loadListener = () => {
            if (obj.width) {
                console.info(
                    obj.data +
                        " has an explicit width: " +
                        obj.width +
                        "; no scaling performed",
                );
                return;
            }
            const svg = obj.contentDocument.querySelector("svg");
            svg.style.overflow = "visible";
            // const width = svg.scrollWidth; <== doesn't work with Firefox
            // const height = svg.scrollHeight; <== doesn't work with Firefox
            const width = svg.width.baseVal.value;
            const height = svg.height.baseVal.value;
            console.info(
                "svg " + obj.data + " has been loaded: " + width + "x" + height,
            );
            obj.style.width = width * 3 + "px";
            obj.style.height = height * 3 + "px";
            obj.removeEventListener("load", loadListener);
        };
        if (obj.contentDocument) {
            console.log("svg " + obj.data + " is already loaded");
            loadListener();
        } else {
            console.info("waiting for svg " + obj.data + " to load");

            obj.addEventListener("load", loadListener);
        }
    }
}

const ldEvents = lectureDoc2.ldEvents;
ldEvents.addEventListener("afterLDDOMManipulations", scaleSlideImages);
ldEvents.addEventListener(
    "afterLDDOMManipulations",
    scaleDocumentImagesAndVideos,
);
