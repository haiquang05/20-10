
"use strict";

/* =========================
   CAU HINH NOI DUNG THIEP
========================= */

const CFG = {
    name: "",
    sender: "Người luôn mong em vui",
    line1: "Có một điều nhỏ bé",
    line2: "muốn gửi đến em...",
    maxHearts: 60
};

/* =========================
   LAY CAC THANH PHAN HTML
========================= */

const nameScreen = document.getElementById("name-screen");
const nameForm = document.getElementById("name-form");
const recipientInput = document.getElementById("recipient-input");

const stage = document.getElementById("stage");
const line1 = document.getElementById("l1");
const line2 = document.getElementById("l2");
const decodeButton = document.getElementById("decode-button");

const cardScreen = document.getElementById("card-screen");
const recipientName = document.getElementById("name");
const signature = document.getElementById("sign");

const moreHeartsButton = document.getElementById("more-hearts");
const backButton = document.getElementById("back-button");

const effectsLayer = document.getElementById("effects-layer");
const starLayer = document.getElementById("star-layer");

/* =========================
   TRANG THAI UNG DUNG
========================= */

let cardShown = false;
let activeHearts = 0;
let effectTimers = [];
let sessionId = 0;

const MAX_FIREWORKS = 5;

const HEART_COLORS = [
    "#ff8fbd",
    "#ffc1dd",
    "#ffe3f0",
    "#ff6fae",
    "#e8a6ff",
    "#ffd166",
    "#ffffff"
];

const FIREWORK_COLORS = [
    "#ff8fbd",
    "#ffd166",
    "#ffffff",
    "#ff5da2",
    "#c9a0ff",
    "#ffb3c6",
    "#a7f3ff"
];

/* =========================
   QUAN LY TIMER HIEU UNG
========================= */

function scheduleEffect(callback, delay, currentSession = sessionId) {
    const timer = window.setTimeout(() => {
        effectTimers = effectTimers.filter(id => id !== timer);

        if (currentSession !== sessionId) return;
        callback();
    }, delay);

    effectTimers.push(timer);
    return timer;
}

function clearEffects() {
    sessionId++;

    effectTimers.forEach(timer => window.clearTimeout(timer));
    effectTimers = [];

    if (effectsLayer) {
        effectsLayer.replaceChildren();
    }

    activeHearts = 0;
}

/* =========================
   TAO CAC NGON SAO NEN
========================= */

function createStars() {
    if (!starLayer) return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 35; i++) {
        const star = document.createElement("span");

        star.className = "star";
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.animationDuration = `${2 + Math.random() * 3}s`;

        fragment.appendChild(star);
    }

    starLayer.replaceChildren(fragment);
}

/* =========================
   NHAP TEN NGUOI NHAN
========================= */

nameForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const enteredName = recipientInput.value.trim();

    if (!enteredName) {
        recipientInput.focus();
        return;
    }

    clearEffects();

    CFG.name = enteredName;

    recipientName.textContent = CFG.name;
    signature.textContent = CFG.sender;
    line1.textContent = CFG.line1;
    line2.textContent = CFG.line2;

    nameScreen.classList.add("hidden");
    cardScreen.classList.add("hidden");
    stage.classList.remove("hidden");

    cardShown = false;
});

/* =========================
   MO NOI DUNG THIEP
========================= */

decodeButton.addEventListener("click", function () {
    if (cardShown) return;

    cardShown = true;

    stage.classList.add("hidden");
    cardScreen.classList.remove("hidden");

    createHeartBurst(12);
});

/* =========================
   TAO MOT TRAI TIM BAY
========================= */

function createHeart() {
    if (!effectsLayer || !cardShown) return;

    if (activeHearts >= CFG.maxHearts) return;

    activeHearts++;

    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = Math.random() > 0.22 ? "♥" : "♡";
    heart.setAttribute("aria-hidden", "true");

    const size = 25 + Math.random() * 28;
    const duration = 3 + Math.random() * 2;
    const drift = -100 + Math.random() * 200;
    const rotation = -70 + Math.random() * 140;

    const color =
        HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];

    heart.style.setProperty("--x", `${Math.random() * 94 + 3}%`);
    heart.style.setProperty("--heart-size", `${size}px`);
    heart.style.setProperty("--duration", `${duration}s`);
    heart.style.setProperty("--drift", `${drift}px`);
    heart.style.setProperty("--rotation", `${rotation}deg`);
    heart.style.setProperty("--heart-color", color);

    const currentSession = sessionId;

    function removeHeart() {
        if (!heart.isConnected) return;

        heart.remove();

        if (currentSession === sessionId) {
            activeHearts = Math.max(0, activeHearts - 1);
        }
    }

    heart.addEventListener("animationend", removeHeart, { once: true });

    effectsLayer.appendChild(heart);

    // Du phong don dep neu animation khong ket thuc
    scheduleEffect(removeHeart, (duration + 1) * 1000, currentSession);
}

/* =========================
   TAO MOT LOAT TRAI TIM
========================= */

function createHeartBurst(count = 24) {
    if (!cardShown) return;

    const currentSession = sessionId;
    const total = Math.min(count, 45);

    for (let i = 0; i < total; i++) {
        scheduleEffect(() => {
            if (cardShown) createHeart();
        }, i * 55, currentSession);
    }
}

/* =========================
   TAO PHAO HOA
========================= */

function createFirework(x, y, particleCount = 42) {
    if (!effectsLayer || !cardShown) return;

    // Gioi han so chum phao hoa dang hien
    const existingFireworks = effectsLayer.querySelectorAll(".firework");

    if (existingFireworks.length >= MAX_FIREWORKS) {
        existingFireworks[0].remove();
    }

    const firework = document.createElement("div");
    firework.className = "firework";
    firework.style.left = `${x}%`;
    firework.style.top = `${y}%`;

    const fragment = document.createDocumentFragment();

    // Cac hat sang toa ra theo hinh tron
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("span");
        particle.className = "firework-particle";

        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = 65 + Math.random() * 115;

        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        const color =
            FIREWORK_COLORS[
                Math.floor(Math.random() * FIREWORK_COLORS.length)
            ];

        const duration = 1.1 + Math.random() * 0.65;
        const size = 4 + Math.random() * 5;

        particle.style.setProperty("--dx", `${dx}px`);
        particle.style.setProperty("--dy", `${dy}px`);
        particle.style.setProperty("--particle-color", color);
        particle.style.setProperty("--particle-duration", `${duration}s`);
        particle.style.setProperty("--particle-size", `${size}px`);

        fragment.appendChild(particle);
    }

    // Them cac tia sang
    for (let i = 0; i < 16; i++) {
        const spark = document.createElement("span");
        spark.className = "firework-spark";

        const angle = (360 / 16) * i;
        const distance = 45 + Math.random() * 70;

        spark.style.setProperty("--angle", `${angle}deg`);
        spark.style.setProperty("--distance", `${distance}px`);
        spark.style.setProperty(
            "--particle-color",
            FIREWORK_COLORS[
                Math.floor(Math.random() * FIREWORK_COLORS.length)
            ]
        );
        spark.style.setProperty(
            "--particle-duration",
            `${1 + Math.random() * 0.5}s`
        );

        fragment.appendChild(spark);
    }

    firework.appendChild(fragment);
    effectsLayer.appendChild(firework);

    const currentSession = sessionId;

    scheduleEffect(() => {
        firework.remove();
    }, 2400, currentSession);
}

/* =========================
   BAN PHAO HOA NHIEU VI TRI
========================= */

function launchFireworks() {
    if (!cardShown) return;

    const currentSession = sessionId;

    const positions = [
        { x: 17 + Math.random() * 14, y: 22 + Math.random() * 20 },
        { x: 68 + Math.random() * 14, y: 22 + Math.random() * 20 },
        { x: 38 + Math.random() * 24, y: 16 + Math.random() * 20 }
    ];

    positions.forEach((position, index) => {
        scheduleEffect(() => {
            if (!cardShown) return;

            createFirework(position.x, position.y, 42);
        }, index * 280, currentSession);
    });
}

/* =========================
   BAO TRAI TIM
========================= */

function launchLoveStorm() {
    if (!cardShown) return;

    createHeartBurst(45);
}

/* =========================
   NUT THEM YEU THUONG
========================= */

moreHeartsButton.addEventListener("click", function () {
    if (!cardShown || cardScreen.classList.contains("hidden")) {
        return;
    }

    launchLoveStorm();
    launchFireworks();

    moreHeartsButton.innerHTML = "Yêu thương ngập tràn! 💖";

    const currentSession = sessionId;

    scheduleEffect(() => {
        if (moreHeartsButton.isConnected && cardShown) {
            moreHeartsButton.innerHTML =
                'Thêm yêu thương <span>♥</span>';
        }
    }, 1500, currentSession);
});

/* =========================
   QUAY LAI NHAP TEN
========================= */

backButton.addEventListener("click", function () {
    cardShown = false;

    clearEffects();

    cardScreen.classList.add("hidden");
    stage.classList.add("hidden");
    nameScreen.classList.remove("hidden");

    recipientInput.value = CFG.name;
    recipientInput.focus();
});

/* =========================
   KHOI TAO
========================= */

createStars();
