// -------------------- FIREBASE --------------------
const firebaseConfig = {
    apiKey: "AIzaSyDu2ioUgqEKB63EkiMrQ6w4NDbkFtoYuWk",
    authDomain: "aizana.firebaseapp.com",
    projectId: "aizana",
    storageBucket: "aizana.firebasestorage.app",
    messagingSenderId: "943216648093",
    appId: "1:943216648093:web:024cb57c57d15aef735974",
    measurementId: "G-Q0G5PPWBD8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// -------------------- ИГРОВОЙ СТАТУС --------------------
let level = 1;
let points = 0;
let attempts = 0;
let wrongStreak = 0;


// -------------------- УРОВНИ (Firebase sync) --------------------
let levelsData = [];

// загрузка уровней с Firebase
db.ref("levels").on("value", snap => {
    if (snap.val()) {
        levelsData = Object.values(snap.val());
    }
});


// -------------------- РЕГИСТРАЦИЯ / ВХОД --------------------
function saveUser(username, password) {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find(u => u.username === username)) {
        alert("❌ Такой пользователь уже зарегистрирован!");
        return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("✅ Регистрация успешна!");
    window.location.href = "index.html";
}

function loginUser(username, password) {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (username === "admin" && password === "1234") {
        window.location.href = "admin.html";
        return;
    }

    let user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem("currentUser", username);
        startNewGame();
    } else {
        alert("❌ Неверный логин или пароль!");
    }
}


// -------------------- НОВАЯ ИГРА --------------------
function startNewGame() {
    level = 1;
    points = 0;
    attempts = 0;
    wrongStreak = 0;

    window.location.href = "game.html";
}


// -------------------- ЛОГИ (FIREBASE) --------------------
function saveLog(answer, correct) {
    let username = localStorage.getItem("currentUser") || "guest";

    db.ref("logs").push({
        user: username,
        level,
        answer,
        correct,
        time: new Date().toLocaleString()
    });
}


// -------------------- ЯЗЫК --------------------
let currentLang = localStorage.getItem("lang") || "ru";

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    showTask();
}


// -------------------- ПОКАЗ ЗАДАЧ --------------------
function showTask() {
    if (level - 1 < levelsData.length) {

        document.getElementById("task").innerText =
            levelsData[level - 1].task;

        document.getElementById("story").innerText =
            currentLang === "kz"
                ? levelsData[level - 1].storyKZ
                : levelsData[level - 1].storyRU;

        document.getElementById("answer").value = "";
        document.getElementById("points").innerText = points;
        document.getElementById("wrongStreak").innerText = wrongStreak;

    } else {
        window.location.href = "victory.html";
    }
}


// -------------------- ОТВЕТ --------------------
function submitAnswer() {
    let userAnswer = Number(document.getElementById("answer").value);

    attempts++;

    if (userAnswer === levelsData[level - 1].answer) {
        points += 400;
        wrongStreak = 0;

        saveLog(userAnswer, true);

        level++;

        alert("✅ Правильно!");
    } else {
        points = Math.max(0, points - 100);
        wrongStreak++;

        saveLog(userAnswer, false);

        alert("❌ Неверно!");

        if (wrongStreak >= 3) {
            window.location.href = "defeat.html";
        }
    }

    showTask();
}


// -------------------- АДМИН: ЛОГИ --------------------
function loadAdmin() {
    let container = document.getElementById("logs");

    db.ref("logs").on("value", snap => {
        container.innerHTML = "";

        let data = snap.val();
        for (let key in data) {
            let l = data[key];

            container.innerHTML += `
                <div class="card">
                    👤 ${l.user}<br>
                    🎯 ${l.level}<br>
                    ✏️ ${l.answer}<br>
                    ${l.correct ? "✅" : "❌"}<br>
                    🕒 ${l.time}
                </div>
            `;
        }
    });
}


// -------------------- АДМИН: УРОВНИ (ОБНОВЛЕНИЕ) --------------------
function addLevel(task, answer, storyRU, storyKZ) {
    db.ref("levels").push({
        task,
        answer: Number(answer),
        storyRU,
        storyKZ
    });
}

function updateLevel(key, data) {
    db.ref("levels/" + key).set(data);
}

function deleteLevel(key) {
    db.ref("levels/" + key).remove();
}


// -------------------- ЗАПУСК --------------------
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("task")) showTask();
    if (document.getElementById("logs")) loadAdmin();
});


// -------------------- МУЗЫКА --------------------
document.addEventListener("DOMContentLoaded", function () {
    let music = document.getElementById("bg-music");
    let btn = document.getElementById("music-btn");

    if (!music || !btn) return;

    let state = localStorage.getItem("musicState") || "on";

    if (state === "on") {
        music.play().catch(() => {});
        btn.innerText = "🔊 ON";
    } else {
        btn.innerText = "🔇 OFF";
    }

    window.toggleMusic = function () {
        if (music.paused) {
            music.play();
            btn.innerText = "🔊 ON";
            localStorage.setItem("musicState", "on");
        } else {
            music.pause();
            btn.innerText = "🔇 OFF";
            localStorage.setItem("musicState", "off");
        }
    };
});
