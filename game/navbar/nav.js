let mpos = Vector.grid(100);

parent.window.addEventListener("resize", ResizeIFrame);
parent.window.addEventListener("mousemove", (e) => mpos = Vector.as(e.clientX, e.clientY));
window.addEventListener("mousemove", (e) => mpos = Vector.as(e.clientX, e.clientY - height()));
window.addEventListener("message", (event) => {
    if (event.data?.type === "langChange") {
        Reload();
        cons.log("Navbar reloaded");
    }
});

let iframe = parent.window.document.querySelector("iframe");
if (!iframe) iframe = document.querySelector("nav");
const cons = parent.window.console || window.console;

function Reload() {
    if (typeof langs== "undefined") {
        console.error("langs not defined");
        return 1;
    }
    let lang = langs[localStorage.getItem("currentLanguage") || "hu"];
    if (lang == undefined) return;
    document.querySelectorAll("[text]").forEach(x => {
        let y = x.getAttribute("text");
        parent.window.console.log(lang[y]);
        if (y in lang) x.textContent = lang[y];
        else {
            console.error(`'${y}' not found in '${currentLanguage}'`);
            x.textContent = y;
        }
    });
}

function height() {
    return document.querySelector("nav").clientHeight;
}

function ResizeIFrame() {
    iframe.style.height = height() + 10 + "px";
}

function Update() {
    if (mpos.y < 11) iframe.style.transform = "translate(0px," + 0 + "px)";
    if (mpos.y > height() + 5) iframe.style.transform = "translate(0px," + -height() + "px)";
    requestAnimationFrame(Update);
}

function SetupIFrame() {
    iframe.style.transition = "transform 0.25s ease";
    iframe.style.width = "100%";
    iframe.style.position = "fixed";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.zIndex = "999";
}

SetupIFrame();
ResizeIFrame();
Update();