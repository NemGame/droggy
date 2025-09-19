class LanguageManager {
    static setLang(lang="") {
        if (lang in langs) currentLanguage = lang;
        else {
            console.error("Language not found: " + lang);
            return 1;
        }
        LanguageManager.reloadLanguage();
        return 0;
    }
    static reloadLanguage() {
        let lang = langs[currentLanguage];
        if (lang == undefined) return;
        document.querySelectorAll("[text]").forEach(x => {
            let y = x.getAttribute("text");
            if (y in lang) x.textContent = lang[y];
            else console.error(`'${y}' not found in '${currentLanguage}'`);
        });
    }
}

let currentLanguage = "hu";

const langs = {
    "hu": {
        "nope": "Nem",
        "ye": "Aha",
        "download": "Letöltöd?"
    },
    "en": {
        "nope": "Nah",
        "ye": "Yup",
        "download": "Download?"
    }
}