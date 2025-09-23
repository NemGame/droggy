let iframe = parent.window.document.querySelector("iframe");
if (!iframe) iframe = document.querySelector("nav");
const cons = parent.window.console || window.console;

function SetupIFrame() {
    iframe.style.transition = "transform 0.25s ease";
    iframe.style.width = "100%";
    iframe.style.position = "fixed";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.zIndex = "999";
}

SetupIFrame();
