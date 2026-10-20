"use strict";

/* ========== CÁC PHẦN TỬ HTML ========== */
const nameScreen = document.getElementById("name-screen");
const nameForm = document.getElementById("name-form");
const recipientInput = document.getElementById("recipient-input");
const inputError = document.getElementById("input-error");

const stage = document.getElementById("stage");
const l1 = document.getElementById("l1");
const l2 = document.getElementById("l2");
const decodeButton = document.getElementById("decode-button");

const cardScreen = document.getElementById("card-screen");
const nameElement = document.getElementById("name");
const messageElement = document.getElementById("message");
const moreHeartsButton = document.getElementById("more-hearts");
const backButton = document.getElementById("back-button");

const effectsLayer = document.getElementById("effects-layer");
const starLayer = document.getElementById("star-layer");

const screens = [nameScreen, stage, cardScreen];

/* ========== CẤU HÌNH ========== */
const isMobile = window.matchMedia("(max-width: 600px)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FIREWORK_COLORS = [
    "#ff4f91", "#ff85a1", "#ffd166", "#ff9f1c",
    "#c77dff", "#7bdff2", "#f15bb5", "#ffffff"
];
const HEART_COLORS = ["#ff5c96", "#ff8fab", "#f7a8d8", "#d98bff", "#ffb6c9"];

const MAX_FIREWORKS = isMobile ? 2 : 3;
const MAX_HEART_BUBBLES = isMobile ? 6 : 10;
const SCREEN_FADE_MS = 300;

let recipientName = "";
let cardShown = false;
let sessionId = 0;
let screenToken = 0;
let currentScreen = nameScreen;
let lastMoreHearts = 0;

const effectTimers = new Set();

/* ========== TIỆN ÍCH ========== */
function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}

function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function scheduleEffect(callback, delay, currentSession = sessionId) {
    const timer = setTimeout(() => {
        effectTimers.delete(timer);
        if (currentSession !== sessionId) return;
        callback();
    }, delay);

    effectTimers.add(timer);
    return timer;
}

function clearEffects() {
    sessionId++;
    effectTimers.forEach((timer) => clearTimeout(timer));
    effectTimers.clear();
    effectsLayer.replaceChildren();
}

// Tự xóa phần tử khi animation xong (kèm timer dự phòng)
function removeWhenDone(element, fallbackMs) {
    const remove = () => element.remove();
    element.addEventListener("animationend", remove, { once: true });
    scheduleEffect(remove, fallbackMs);
}

// Không sinh hiệu ứng khi đang ở tab khác
function canAnimate() {
    return cardShown && !reduceMotion && !document.hidden;
}

/* ========== CHUYỂN MÀN HÌNH MƯỢT ========== */
function showScreen(next) {
    const token = ++screenToken;
    const prev = currentScreen;
    currentScreen = next;

    if (prev !== next) prev.classList.add("leaving");

    const wait = reduceMotion ? 0 : SCREEN_FADE_MS;

    setTimeout(() => {
        if (token !== screenToken) return;

        screens.forEach((screen) => {
            if (screen !== next) {
                screen.classList.add("hidden");
                screen.classList.remove("leaving");
            }
        });

        next.classList.remove("hidden", "leaving");
    }, prev === next ? 0 : wait);
}

/* ========== SAO LẤP LÁNH ========== */
function createStars() {
    const fragment = document.createDocumentFragment();
    const starCount = isMobile ? 18 : 35;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement("span");
        star.className = "star";
        star.style.left = randomBetween(0, 100) + "%";
        star.style.top = randomBetween(0, 100) + "%";
        star.style.setProperty("--max-opacity", randomBetween(0.4, 0.9).toFixed(2));
        star.style.animationDelay = randomBetween(0, 3) + "s";
        star.style.animationDuration = randomBetween(2.5, 4.5) + "s";
        fragment.appendChild(star);
    }

    starLayer.appendChild(fragment);
}

/* ========== PHÁO HOA TRÒN VÀ TRÁI TIM ========== */
function createFirework(x, y, heartShape = false) {
    if (!canAnimate()) return;

    // Đủ số lượng thì bỏ qua, không xóa cái đang nổ cho khỏi giật
    if (effectsLayer.querySelectorAll(".firework").length >= MAX_FIREWORKS) return;

    const firework = document.createElement("div");
    firework.className = "firework";
    firework.style.left = x + "%";
    firework.style.top = y + "%";

    const particleCount = isMobile
        ? (heartShape ? 12 : 16)
        : (heartShape ? 20 : 26);
    const radius = isMobile ? 75 : 115;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("span");
        const angle = (Math.PI * 2 * i) / particleCount;
        let dx, dy;

        if (heartShape) {
            const hx = 16 * Math.pow(Math.sin(angle), 3);
            const hy = 13 * Math.cos(angle)
                     - 5 * Math.cos(2 * angle)
                     - 2 * Math.cos(3 * angle)
                     - Math.cos(4 * angle);
            dx = (hx / 16) * radius;
            dy = (-hy / 16) * radius;
            particle.className = "heart-firework-particle";
        } else {
            const distance = radius * randomBetween(0.55, 1);
            dx = Math.cos(angle) * distance;
            dy = Math.sin(angle) * distance;
            particle.className = "firework-particle";
        }

        particle.style.setProperty("--dx", dx.toFixed(1) + "px");
        particle.style.setProperty("--dy", dy.toFixed(1) + "px");
        particle.style.setProperty("--particle-color", pick(FIREWORK_COLORS));
        particle.style.animationDelay = randomBetween(0, 100) + "ms";
        fragment.appendChild(particle);
    }

    firework.appendChild(fragment);
    effectsLayer.appendChild(firework);

    scheduleEffect(() => firework.remove(), 1600);
}

/* ========== BẮN PHÁO HOA NGẪU NHIÊN ========== */
function launchFireworks() {
    if (!cardShown || reduceMotion) return;

    const currentSession = sessionId;
    const total = isMobile ? 5 : 8;

    function launchOne(index) {
        if (!cardShown || currentSession !== sessionId) return;

        createFirework(
            randomBetween(10, 90),
            randomBetween(12, 55),
            Math.random() < 0.4
        );

        if (index + 1 < total) {
            scheduleEffect(
                () => launchOne(index + 1),
                randomBetween(250, 750),
                currentSession
            );
        }
    }

    scheduleEffect(() => launchOne(0), randomBetween(100, 400), currentSession);
}

/* ========== PHÁO HOA THƯỜNG TỰ ĐỘNG ========== */
function startRandomFireworks() {
    if (!cardShown || reduceMotion) return;

    const currentSession = sessionId;

    scheduleEffect(() => {
        if (!cardShown || currentSession !== sessionId) return;

        createFirework(
            randomBetween(10, 90),
            randomBetween(12, 52),
            Math.random() < 0.4
        );

        startRandomFireworks();
    }, randomBetween(1200, 2300), currentSession);
}

/* ========== ĐỢT TRÁI TIM PHÁO HOA ========== */
function createHeartBurst(total) {
    if (!cardShown || reduceMotion) return;

    const currentSession = sessionId;

    for (let i = 0; i < total; i++) {
        scheduleEffect(() => {
            createFirework(randomBetween(15, 85), randomBetween(20, 70), true);
        }, i * 200, currentSession);
    }
}

/* ========== BÓNG BÓNG TRÁI TIM BAY LÊN ========== */
function createHeartBubble() {
    if (!canAnimate()) return;

    if (effectsLayer.querySelectorAll(".heart-bubble").length >= MAX_HEART_BUBBLES) return;

    const bubble = document.createElement("span");
    const duration = randomBetween(6, 10);

    bubble.className = "heart-bubble";
    bubble.textContent = Math.random() < 0.5 ? "♥" : "♡";
    bubble.setAttribute("aria-hidden", "true");

    bubble.style.left = randomBetween(3, 95) + "%";
    bubble.style.fontSize = randomBetween(
        isMobile ? 17 : 22,
        isMobile ? 30 : 42
    ) + "px";
    bubble.style.color = pick(HEART_COLORS);
    bubble.style.setProperty("--duration", duration + "s");

    effectsLayer.appendChild(bubble);
    removeWhenDone(bubble, (duration + 0.5) * 1000);
}

/* ========== TẠO BÓNG BÓNG LIÊN TỤC ========== */
function startHeartBubbles() {
    if (!cardShown || reduceMotion) return;

    const currentSession = sessionId;

    scheduleEffect(() => {
        if (!cardShown || currentSession !== sessionId) return;

        createHeartBubble();
        startHeartBubbles();
    }, randomBetween(isMobile ? 800 : 450, isMobile ? 1500 : 950), currentSession);
}

/* ========== CÁ NHÂN HÓA LỜI CHÚC ========== */
function updatePersonalizedText(name) {
    nameElement.textContent = name;
    l1.textContent = name;

    l2.textContent = "Món quà nhỏ này được gửi riêng đến " + name + " 💗";

    messageElement.textContent =
        "Chúc " + name +
        " có một ngày 20/10 thật vui vẻ, luôn được yêu thương, trân trọng và gặp thật nhiều điều tốt đẹp.";

    document.querySelectorAll("[data-template]").forEach((element) => {
        element.textContent = element.dataset.template.replace(/\{\{ten\}\}/g, name);
    });
}

/* ========== NHẬP TÊN NGƯỜI NHẬN ========== */
nameForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const enteredName = recipientInput.value.trim();

    if (!enteredName) {
        inputError.textContent = "Bạn hãy nhập tên người nhận nhé!";
        recipientInput.focus();
        return;
    }

    inputError.textContent = "";
    recipientName = enteredName;

    updatePersonalizedText(recipientName);

    clearEffects();
    cardShown = false;

    showScreen(stage);
});

/* ========== MỞ THIỆP VÀ KHỞI ĐỘNG HIỆU ỨNG ========== */
decodeButton.addEventListener("click", () => {
    if (cardShown) return;

    clearEffects();
    cardShown = true;

    showScreen(cardScreen);

    // Chờ thiệp hiện ra rồi mới bắn hiệu ứng cho mượt
    const startDelay = reduceMotion ? 0 : SCREEN_FADE_MS + 150;

    scheduleEffect(() => {
        createHeartBurst(isMobile ? 4 : 6);
        launchFireworks();
        startRandomFireworks();
        startHeartBubbles();
    }, startDelay);
});

/* ========== NÚT THÊM YÊU THƯƠNG ========== */
moreHeartsButton.addEventListener("click", () => {
    if (!cardShown) return;

    // Chống bấm liên tục gây lag
    const now = performance.now();
    if (now - lastMoreHearts < 700) return;
    lastMoreHearts = now;

    const total = isMobile ? 2 : 3;

    for (let i = 0; i < total; i++) {
        scheduleEffect(createHeartBubble, i * 180);
    }

    createFirework(randomBetween(20, 80), randomBetween(25, 55), true);
});

/* ========== QUAY LẠI MÀN HÌNH NHẬP TÊN ========== */
backButton.addEventListener("click", () => {
    cardShown = false;
    clearEffects();
    showScreen(nameScreen);

    setTimeout(() => recipientInput.focus({ preventScroll: true }), SCREEN_FADE_MS + 50);
});

/* ========== KHỞI TẠO TRANG ========== */
createStars();