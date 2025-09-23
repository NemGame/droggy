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

function ResizeIFrame() {
    iframe.style.height = height() + 10 + "px";
}

function height() {
    return document.querySelector("nav").clientHeight;
}

function Update() {
    if (mpos.y < 11) iframe.style.transform = "translate(0px," + 0 + "px)";
    if (mpos.y > height() + 5) iframe.style.transform = "translate(0px," + -height() + "px)";
    requestAnimationFrame(Update);
}

ResizeIFrame();
Update();