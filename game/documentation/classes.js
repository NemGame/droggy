class Stuff {
    constructor(title="", tags=[], path="") {
        this.title = title;
        this.tags = typeof tags == "object" ? tags : [`${tags}`];
        this.path = path == "" ? Stuff.stuffify(title) : path;
        this.content = this.load;
        this.shit = null;
        this.loaded = true;
    }
    static get null() {
        return new Stuff();
    }
    static file(path="") {
        let n = new Stuff("", [], path);
        n.loaded = false;
        n.content.then(x => {
            [...x.querySelectorAll("dets")].map(z => [...z.children]).forEach(y => {
                y.forEach(y => {
                    if (y.localName == "name") {
                        n.title = y.innerText;
                        y.addEventListener("change", () => {

                        });
                    }
                    else if (y.localName == "tags") n.tags = y.innerHTML.split("\n").map(x => x.trim()).filter(x => x);
                })
            });
            if (n.shit) {
                n.shit.querySelector("p").textContent = n.title;
            }
            Search(sb.value);
            n.loaded = true;
        }).catch(fuck => console.error(fuck));
        return n;
    }
    static stuffify(x="") {
        return x.toLowerCase().replaceAll("á", "a")
                .replaceAll("é", "e").replaceAll("í", "i")
                .replaceAll("ó", "o").replaceAll("ö", "o")
                .replaceAll("ő", "o").replaceAll("ú", "u")
                .replaceAll("ü", "u").replaceAll("ű", "u").replaceAll(" ", "_");
    }
    get load() {
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
        if (!dict[currentLang]) {
            console.log(`Language not found for ${div.querySelector("[name]")?.textContent}: ${currentLang}`);
            return 1;
        }
        if (text in dict[currentLang])
            x.innerHTML = dict[currentLang][text];
        else
            x.innerHTML = text;
    });
    return 0;
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