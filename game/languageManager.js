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
    static load() {
        currentLanguage = localStorage.getItem("currentLanguage") || "hu";
        LanguageManager.setLang(currentLanguage);
        console.log("currentLanguage: " + currentLanguage);
    }
    static save(lang="") {
        console.log("saving language: " + currentLanguage);
        localStorage.setItem("currentLanguage", lang);
    }
    static reloadLanguage() {
        if (typeof langs == "undefined") {
            console.error("langs not defined");
            return 1;
        }
        let lang = langs[currentLanguage];
        if (lang == undefined) return;
        document.querySelectorAll("[text]").forEach(x => {
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

let currentLanguage = "balu";

let listensToLanguageChange = [];

LanguageManager.load();