class Stuff {
    constructor(name="", tags=[], path="") {
        this.name = name;
        this.tags = typeof tags == "object" ? tags : [`${tags}`];
        this.path = path == "" ? Stuff.stuffify(name) : path;
    }
    static get null() {
        return new Stuff();
    }
    static file(path="") {
        let n = new Stuff("", [], path);
        n.content.then(x => {
            [...x.querySelectorAll("dets")].forEach(y => {
                if (y.localName == "name") this.name = y.textContent;
                else if (y.localName == "tags") this.tags = y.innerHTML.split("<br>");
            });
        })
        return n;
    }
    static stuffify(x="") {
        return x.toLowerCase().replaceAll("á", "a")
                .replaceAll("é", "e").replaceAll("í", "i")
                .replaceAll("ó", "o").replaceAll("ö", "o")
                .replaceAll("ő", "o").replaceAll("ú", "u")
                .replaceAll("ü", "u").replaceAll("ű", "u").replaceAll(" ", "_");
    }
    get content() {
        return fetch("./data/" + this.path + ".html").then(x => x.text()).then(x => {
            return QuickObjectify(x, "div", "class=stuff");
        })
    }
}

function QuickObjectify(content="", inbed="div", ...attributes) {
    let bed = document.createElement(inbed);
    bed.innerHTML = content;
    if (typeof attributes == "object")
        attributes.forEach(attr => {
            let data = attr.split("=")
            bed.setAttribute(data[0], data[1] || "")
        });
    return bed;
}

function LoadLanguage(div=HTMLDivElement, dict={}, currentLang="hu") {
    if (!currentLang in dict) {
        console.error("Language not found in dict: " + currentLang);
        return 1;
    }
    div.querySelectorAll("[text]").forEach(x => {
        let text = x.getAttribute("text").toLowerCase();
        if (text in dict[currentLang])
            x.innerHTML = dict[currentLang][text];
        else
            x.innerHTML = text;
    })
}

function GetDictFromLang(div=HTMLDivElement) {
    let lang = div.querySelector("langs");
    if (!lang) return {};
    let dict = {};
    [...lang.children].forEach(l => {
        dict[l.localName] = {};
        [...l.children].forEach(x => {
            dict[l.localName][x.localName] = x.innerHTML;
        });
    });
    return dict;
}

function ReloadWithLang(lang="") {
    let x = window.location.pathname;
    window.open(window.location.protocol + "//" + window.location.host + x + "?lang=" + lang, "_self");
}