import * as ld from "../../ld-lib.js";
import lectureDoc2 from "../../ld-core.js";

const logoTemplate = `
    <style>

    .dhbw-logo {
        width: 200px;
        height: 200px;
        position: relative;
        /*overflow: visible;*/

        perspective: 2500px;
        transform: rotateX(-30deg);
        transform-style: preserve-3d;

        .side {
            position: absolute;
            width: 98px;
            height: 98px;
            border-radius: 6px;
        }

        .left {
            background-color: rgba(226, 0, 26);
            transform: translateY(51px) translateX(0px) translateZ(2px);
        }

        .back {
            background-color: rgba(226, 0, 26);
            transform: translateY(51px) translateX(52px) rotateY(65deg) translateX(52px);
        }

        .front {
            background-color: rgba(51, 65, 73, 0.56);
            transform: translateY(51px) translateX(52px) rotateY(-115deg) translateZ(2px) translateX(52px);
        }

        .right {
            background-color: rgba(51, 65, 73, 0.56);
            transform: translateY(51px) translateX(102px) translateZ(-2px);
        }

        animation: 30s infinite alternate move-across;
    }

    @keyframes move-across {
        0% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(15deg) translate3d(-1500px,-800px,-100px) scale(4) ;
        }
        50%, 100% {
            transform: rotateX(-30deg) rotateY(360deg) translateX(425px) translateY(412px) scale(1.05);
        }
    }

    .blur-it {
        position: absolute;
        width: 100%;
        height: 100%;

        display: flex;
        justify-content: center;
        align-items: center;

        animation: blur-it 30s infinite alternate;
    }

    @keyframes blur-it {
        0% {
            filter: blur(10px) opacity(0.1);
        }
        10% {
            filter: blur(0px) opacity(0.8);
        }
        50%, 100% {
            filter: blur(0px);
        }
    }

    </style>

    <div class="blur-it" style="mix-blend-mode: multiply;z-index:-1">
    <div class="dhbw-logo">
        <div class="side left"></div>
        <div class="side front"></div>
        <div class="side back"></div>
        <div class="side right"></div>
    </div>
    </div>
    `


function afterLDDOMManipulations() {
    const template = ld.create("template", {});
    template.innerHTML = logoTemplate;
    const slide = document.querySelector("#ld-main-pane .ld-slide:has(h1).animated-symbol")
    const logoElement = template.content.cloneNode(true);
    // There will always be at most one h1 element per slide set.
    // Hence, we can simply add the content.
    //const shadow = slide.attachShadow({ mode: "open" });
    //shadow.appendChild(logoElement);
    slide.prepend(logoElement);
}


/**
 * Register with LectureDoc's basic events.
 */
const ldEvents =  lectureDoc2.ldEvents
ldEvents.addEventListener("afterLDDOMManipulations", afterLDDOMManipulations);
