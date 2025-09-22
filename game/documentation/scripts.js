document.addEventListener("DOMContentLoaded", LateLoad);

const astuff = [
    new Stuff("Controls", "szupi-dupi cucc", "controls"),
    new Stuff("Default", "stuff", "default")
]
AssignIDs(astuff);

let params = new URLSearchParams(window.location.search);

let currentLanguage = params.get("lang") || "hu";

function LateLoad() {
    ReloadFinder();

    Update();
}

function Update() {
    
    requestAnimationFrame(Update);
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
        if (lastSet != null && x.name == lastSet.querySelector("[name]").textContent) c.classList.add("current");
        c.querySelector("[name]").textContent = x.name;
        c.setAttribute("bound", i);
        c.addEventListener("click", () => {
            if (lastSet != null) lastSet.classList.remove("current");
            lastSet = c;
            c.classList.add("current");
            LoadStuff(astuff[i]);
        })
        finder.appendChild(c);
    });
}

function Search(text="") {
    text = Stuff.stuffify(text);
    ReloadFinder(astuff.filter(x => Stuff.stuffify(x.name).includes(text)));
}

function AssignIDs(array=[]) {
    array.forEach((x, i) => {
        x.id = i;
    })
}