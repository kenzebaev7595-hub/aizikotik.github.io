// -------------------- ИГРОВОЙ СТАТУС --------------------
let level = 1;          // при новой игре уровень всегда 1
let points = 0;         // при новой игре очки 0
let attempts = 0;       // всего попыток
let wrongStreak = 0;    // подряд неправильных ответов

// -------------------- РЕГИСТРАЦИЯ --------------------
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

// -------------------- ВХОД --------------------
function loginUser(username, password) {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // вход администратора
    if (username === "admin" && password === "1234") {
        window.location.href = "admin.html";
        return;
    }

    let user = users.find(
        u => u.username === username && u.password === password
    );

    if (user) {
        localStorage.setItem("currentUser", username);
        startNewGame();
    } else {
        alert("❌ Неверный логин или пароль!");
    }
}

// -------------------- НАЧАЛО НОВОЙ ИГРЫ --------------------
function startNewGame() {
    level = 1;
    points = 0;
    attempts = 0;
    wrongStreak = 0;

    localStorage.setItem("level", level);
    localStorage.setItem("points", points);
    localStorage.setItem("attempts", attempts);

    window.location.href = "game.html";
}

// -------------------- ЛОГИ --------------------
function saveLog(answer, correct) {
    let username = localStorage.getItem("currentUser") || "guest";
    let logs = JSON.parse(localStorage.getItem("logs")) || [];

    logs.push({
        user: username,
        level: level,
        answer: answer,
        correct: correct,
        time: new Date().toLocaleString()
    });

    localStorage.setItem("logs", JSON.stringify(logs));
}

// -------------------- УРОВНИ И ПРЕДЫСТОРИЯ --------------------
const levelsData = [
    {
        task: "На месте преступления детектив нашёл записку: (x + 120) × 3 − 450 = 150. Найдите x — это номер шкафчика, где спрятана первая улика.",
        answer: 80,
        storyKZ: "Мистер Виллидің алтын рецептін ұрлаған адамды табу үшін алдымен жасырылған дәлелді табу керек. Шкаф нөмірін есептеңіз.",
        storyRU: "Чтобы раскрыть кражу золотого рецепта мистера Вилли, нужно сначала найти спрятанную улику. Решите уравнение и узнайте номер шкафчика."
    },

    {
        task: "Два подозреваемых одновременно вышли навстречу друг другу из разных точек города. Первый двигался со скоростью 12 км/ч, второй — 15 км/ч. Через 3 часа они встретились. Какое расстояние было между ними изначально?",
        answer: 81,
        storyKZ: "Куәгерлер екі күдіктінің қозғалысын байқады. Олардың бастапқы арақашықтығын есептеп, кездескен орынды анықтаңыз.",
        storyRU: "Свидетели заметили движение двух подозреваемых. Рассчитайте расстояние между ними, чтобы определить место встречи."
    },

    {
        task: "В антикварном магазине украли редкую книгу. Её цена была 2500 тг. Сначала на неё сделали скидку 20%, а затем ещё 10%. Найдите итоговую стоимость — именно за эту сумму её продали на чёрном рынке.",
        answer: 1800,
        storyKZ: "Ұрланған сирек кітаптың нақты сатылған бағасын анықтау керек. Жеңілдіктерді есептеп, соңғы ізге шығыңыз.",
        storyRU: "Нужно выяснить реальную стоимость украденной редкой книги. Рассчитайте скидки и найдите последнюю зацепку в расследовании."
    }
];

let currentLang = localStorage.getItem("lang") || "ru";

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("lang", lang);
    showTask();
}

// -------------------- ПОКАЗ ЗАДАЧИ --------------------
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
        localStorage.setItem("points", points);
        localStorage.setItem("attempts", attempts);
        window.location.href = "victory.html";
    }
}

// -------------------- ОТВЕТ ПОЛЬЗОВАТЕЛЯ --------------------
function submitAnswer() {
    let answerInput = document.getElementById("answer");
    let userAnswer = Number(answerInput.value);

    attempts++;

    if (userAnswer === levelsData[level - 1].answer) {
        points += 400;
        wrongStreak = 0;

        saveLog(userAnswer, true);

        level++;

        alert("✅ Правильно! +400 очков, переход на следующий уровень");

    } else {
        if (points > 0) {
            points = 0;
        } else {
            points -= 100;
        }

        wrongStreak++;

        saveLog(userAnswer, false);

        alert(
            `❌ Неверно! ${
                points < 0
                    ? "-100 очков"
                    : "Очки сброшены до 0"
            }`
        );

        if (wrongStreak >= 3) {
            localStorage.setItem("points", points);
            localStorage.setItem("attempts", attempts);
            window.location.href = "defeat.html";
            return;
        }
    }

    showTask();
}

// -------------------- АДМИН --------------------
function loadAdmin() {
    let logs = JSON.parse(localStorage.getItem("logs")) || [];
    let container = document.getElementById("logs");

    container.innerHTML = "";

    logs.forEach(l => {
        container.innerHTML += `
            <div class="card">
                👤 Пользователь: ${l.user}<br>
                🎯 Уровень: ${l.level}<br>
                ✏️ Ответ: ${l.answer}<br>
                📊 ${l.correct ? "✅ Правильно" : "❌ Неправильно"}<br>
                🕒 Время: ${l.time}
            </div>
        `;
    });
}

function clearLogs() {
    localStorage.removeItem("logs");
    location.reload();
}

// -------------------- МУЗЫКА --------------------
document.addEventListener("DOMContentLoaded", function () {
    let music = document.getElementById("bg-music");
    let musicBtn = document.getElementById("music-btn");

    if (!music || !musicBtn) return;

    let state = localStorage.getItem("musicState") || "on";

    if (state === "on") {
        music.play().catch(() => {});
        musicBtn.innerText = "🔊 ON";
    } else {
        music.pause();
        musicBtn.innerText = "🔇 OFF";
    }

    window.toggleMusic = function () {
        if (music.paused) {
            music.play();
            musicBtn.innerText = "🔊 ON";
            localStorage.setItem("musicState", "on");
        } else {
            music.pause();
            musicBtn.innerText = "🔇 OFF";
            localStorage.setItem("musicState", "off");
        }
    };
});

// -------------------- ЗАПУСК --------------------
document.addEventListener("DOMContentLoaded", showTask);