class LanguageManager {
    static setLang(lang="", fallback="") {
        if (typeof langs == "undefined") {
            console.error("langs not defined");
            return 1;
        }
        console.log("setting language to " + lang);
        if (lang in langs) currentLanguage = lang;
        else {
            console.error("Language not found: " + lang);
            if (fallback in langs) {
                currentLanguage = fallback;
                console.warn("Fallen back to " + fallback);
            }
            else return 1;
        }
        console.log("currentLanguage is " + currentLanguage);
        LanguageManager.save(currentLanguage);
        if (!(typeof autoreload == "boolean" && !autoreload)) LanguageManager.reloadLanguage();
        listensToLanguageChange.forEach(x => x());
        return 0;
    }
    static get(text="") {
        let lang = langs[currentLanguage];
        if (lang == undefined) return;
        if (text in lang) return lang[text];
        else {
            console.error(`'${text}' not found in '${currentLanguage}'`);
            return text;
        }
    }
    static load() {
        currentLanguage = localStorage.getItem("currentLanguage") || "hu";
        LanguageManager.setLang(currentLanguage);
        console.log("currentLanguage: " + currentLanguage);
    }
    static save(lang="") {
        console.log("saving language: " + currentLanguage);
        localStorage.setItem("currentLanguage", lang);
    }
    static reloadLanguage(shit=null, dict=langs) {
        if (typeof dict == "undefined") {
            console.error("langs not defined");
            return 1;
        }
        let lang = dict[currentLanguage];
        if (lang == undefined) return;
        let x = shit == null ? document.querySelectorAll("[text]") : shit;
        x.forEach(x => {
            let y = x.getAttribute("text");
            if (y in lang) x.textContent = lang[y];
            else {
                console.error(`'${y}' not found in '${currentLanguage}'`);
                x.textContent = y;
            }
        });
    }
    static listen(x) {
        listensToLanguageChange.push(x);
    }
}

function setLang(lang) {
    LanguageManager.setLang(lang);
}

let currentLanguage = "balu";

let listensToLanguageChange = [];

LanguageManager.listen(() => {
    let frames = document.querySelectorAll("iframe");
    frames.forEach(frame => {
        frame.contentWindow.postMessage(
            { type: "langChange", lang: currentLanguage },
            "*"
        );
    });
});

LanguageManager.load();

window.addEventListener("message", (event) => {
    if (event.data?.type === "langChange") {
        LanguageManager.reloadLanguage();
        console.log("caught")
    }
});
