let storedWordsRaw = localStorage.getItem("storedWords");
let storedWords = storedWordsRaw ? storedWordsRaw.split(",") : [];

function setRandomFormVisibility() {
    const randomWordForm = document.getElementById("randomWord");
    const randomizeButton = document.getElementById("randomizeButton");
    if (storedWords.length === 0) {
        randomWordForm.style.opacity = "0.5";
        randomizeButton.disabled = true;
    } else {
        randomWordForm.style.opacity = "1";
        randomizeButton.disabled = false;
    }
}

function getSettings() {
    const raw = localStorage.getItem('leksikasSettings');
    if (!raw) {
        return {
            letterFilter: '',
            includeOnly: false,
            wordLength: 5
        };
    }
    try {
        const parsed = JSON.parse(raw);
        return {
            letterFilter: parsed.letterFilter || '',
            includeOnly: !!parsed.includeOnly,
            wordLength: parseInt(parsed.wordLength, 10) || 5
        };
    } catch {
        return {
            letterFilter: '',
            includeOnly: false,
            wordLength: 5
        };
    }
}
function setSettings(settings) {
    localStorage.setItem('leksikasSettings', JSON.stringify(settings));
}

function prefillSettingsForm() {
    const settings = getSettings();
    document.getElementById('letterFilter').value = settings.letterFilter;
    document.getElementById('includeOnly').checked = settings.includeOnly;
    document.getElementById('wordLength').value = settings.wordLength;
}

document.addEventListener("DOMContentLoaded", function () {
    prefillSettingsForm();
    setRandomFormVisibility();
    document.getElementById('letterFilter').addEventListener('input', function (e) {
        const settings = getSettings();
        settings.letterFilter = e.target.value;
        setSettings(settings);
    });
    document.getElementById('includeOnly').addEventListener('change', function (e) {
        const settings = getSettings();
        settings.includeOnly = e.target.checked;
        setSettings(settings);
    });
    document.getElementById('wordLength').addEventListener('input', function (e) {
        const settings = getSettings();
        settings.wordLength = e.target.value;
        setSettings(settings);
    });
    const formCard = document.getElementById('formCard');
    const configToggleBtn = document.getElementById('configToggleBtn');
    function setFormCardInitial() {
        if (window.innerWidth <= 900) {
            formCard.classList.add('hide');
        } else {
            formCard.classList.remove('hide');
        }
    }
    setFormCardInitial();
    window.addEventListener('resize', setFormCardInitial);
    configToggleBtn.addEventListener('click', () => {
        formCard.classList.toggle('hide');
    });
});

function updateCount() {
    document.getElementById("submitButton").value = "Load Words"
    document.getElementById("submitButton").disabled = false
    localStorage.setItem("storedWords", JSON.stringify(storedWords))
    setRandomFormVisibility();
    document.getElementById("count").textContent = `Words found and stored: ${storedWords.length}`;
    updateRandomResult([]);
}

let lastSettings = getSettings();

document.getElementById("loadForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const currentSettings = {
        letterFilter: document.getElementById('letterFilter').value,
        includeOnly: document.getElementById('includeOnly').checked,
        wordLength: parseInt(document.getElementById('wordLength').value, 10)
    };
    if (
        lastSettings.letterFilter === currentSettings.letterFilter &&
        lastSettings.includeOnly === currentSettings.includeOnly &&
        lastSettings.wordLength === currentSettings.wordLength &&
        storedWords.length > 0
    ) {
        updateCount();
        return;
    }
    lastSettings = { ...currentSettings };
    setSettings(currentSettings);

    const submitBtn = document.getElementById("submitButton");
    submitBtn.value = "Loading...";
    submitBtn.disabled = true;
    try {
        const response = await fetch("/et_EE_sõnastik.txt");

        let letters = document.getElementById("letterFilter").value;
        let mustInclude = document.getElementById("includeOnly").checked;
        let length = parseInt(document.getElementById("wordLength").value, 10);

        if (!response.ok) throw new Error("File could not be loaded!");

        const text = await response.text();
        const lines = text.split(/\r?\n/);

        localStorage.removeItem("storedWords")
        storedWords = [];

        for (const wordRaw of lines) {
            const word = wordRaw.trim().toLowerCase();
            if (word.length != length) continue;

            if (!letters) {
                storedWords.push(word);
                continue;
            }

            const matchesAll = letters.split("").every(char => word.includes(char));
            const matchesAny = letters.split("").some(char => word.includes(char));

            if ((mustInclude && matchesAll) || (!mustInclude && matchesAny)) {
                storedWords.push(word);
            }
        }

        updateCount();
    } catch (err) {
        console.error("Error loading file: ", err);
        alert("Failed to load dictionary file.");
    } finally {
        submitBtn.value = "Load Words";
        submitBtn.disabled = false;
    }
});

function updateRandomResult(selectedWords) {
    const gridContainer = document.getElementById("randomGrid");
    let wordsHtml = "";
    if (selectedWords && selectedWords.length > 0) {
        wordsHtml = `<div class='random-grid'>${selectedWords.map(w => `<div>${w.replace(/[\\\[\]"]/g, '')}</div>`).join("")}</div>`;
    }
    gridContainer.innerHTML = wordsHtml;
}

document.getElementById("randomWord").addEventListener("submit", function (e) {
    e.preventDefault();
    const count = parseInt(document.getElementById("wordCount").value, 10)
    if (storedWords.length == 0) {
        alert("No words stored. Please load words first.");
        return;
    }
    const selected = [];
    const copy = [...storedWords]
    for (let i = 0; i < count && copy.length > 0; i++) {
        const index = Math.floor(Math.random() * copy.length);
        selected.push(copy.splice(index, 1)[0]);
    }
    updateRandomResult(selected);
})