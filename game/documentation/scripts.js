document.addEventListener("DOMContentLoaded", LateLoad);

const astuff = [
    Stuff.file("lore"),
    Stuff.file("controls"),
    Stuff.file("items"),
    Stuff.file("log")
]
AssignIDs(astuff);

let params = new URLSearchParams(window.location.search);
let autoreload = false;

const sb = document.getElementById("sb");

sb.value = params.get("search") || "";

function LateLoad() {
    Search();
    let shit = Number(params.get("open") || "");
    if (shit != NaN) {
        DoWhenAllIsLoaded(() => {
            Search("");
            OpenTh(shit);
            Search(sb.value);
        });
    }

    window.history.pushState("", "", BuildURL());

    Update(2);
}

function DoWhenAllIsLoaded(func) {
    if (astuff.every(x => x.loaded)) {
        func();
    } else {
        requestAnimationFrame(() => DoWhenAllIsLoaded(func));
    }
}

function Update(x=0) {
    if (x == 1) LanguageManager.listen(ReloadOpen);
    if (x == 2) requestAnimationFrame(() => { Update(1); });
    else requestAnimationFrame(Update);
}

function LoadStuff(stuff=Stuff.null) {
    const holder = document.querySelector(".stuffholder");
    holder.innerHTML = "";
    stuff.content.then(x => {
        let dict = GetDictFromLang(x);
        LoadLanguage(x, dict, currentLanguage);
        holder.appendChild(x);
    });
}

let lastSet = null;

function ReloadFinder(fuck=astuff) {
    const finder = document.getElementById("stuffs");
    finder.innerHTML = "";
    let base = QuickObjectify("<p name></p>", "div", "class=finderStuff");
    fuck.forEach((x, i) => {
        let c = base.cloneNode(true);
        x.shit = c;
        if (lastSet != null && x.title == lastSet.querySelector("[name]").textContent) c.classList.add("current");
        c.querySelector("[name]").textContent = x.title;
        c.setAttribute("bound", i);
        c.addEventListener("click", () => {
            [...document.querySelectorAll(".current")].forEach(x => x.classList.remove("current"));
            lastSet = c;
            let y = astuff.indexOf(x);
            params.set("open", y);
            window.history.pushState("", "", BuildURL());
            c.classList.add("current");
            LoadStuff(astuff[y]);
        })
        finder.appendChild(c);
    });
}

function Search(text="") {
    text = Stuff.stuffify(text);
    params.set("search", text);
    window.history.pushState("", "", BuildURL());
    ReloadFinder(astuff.filter(x => Stuff.stuffify(x.title).includes(text)));
}

function AssignIDs(array=[]) {
    array.forEach((x, i) => {
        x.id = i;
    })
}

function OpenFirst() {
    document.getElementById("stuffs").firstChild?.click();
}

function BuildURL() {
    let x = params.entries();
    return "?" + [...x].map(x => `${x[0]}=${encodeURI(x[1]).replace("&", "%26")}`).join("&");
}

function OpenTh(n=1) {
    document.getElementById("stuffs").querySelector(":nth-child(" + (n + 1) + ")")?.click();
}

function ReloadOpen() {
    if (!lastSet) return 1;
    LoadStuff(astuff[Number(lastSet.getAttribute("bound"))]);
    return 0;
}