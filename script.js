
"use strict";

/* CAU HINH */
const CFG = {
    sender: "Quang Hải",
    line1: "Có một điều nhỏ bé",
    line2: "muốn gửi đến bạn...",
    maxHearts: 18
};

/* CAC PHAN TU HTML */
const nameScreen = document.getElementById("name-screen");
const nameForm = document.getElementById("name-form");
const recipientInput = document.getElementById("recipient-input");

const stage = document.getElementById("stage");
const line1 = document.getElementById("l1");
const line2 = document.getElementById("l2");
const decodeButton = document.getElementById("decode-button");

const cardScreen = document.getElementById("card-screen");
const recipientName = document.getElementById("name");

const moreHeartsButton = document.getElementById("more-hearts");
const backButton = document.getElementById("back-button");

const effectsLayer = document.getElementById("effects-layer");
const starLayer = document.getElementById("star-layer");

/* TRANG THAI */
let cardShown = false;
let activeHearts = 0;
let sessionId = 0;
let effectTimers = [];
let lastBurstTime = 0;

const isMobile = window.matchMedia("(max-width: 600px)").matches;
const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

const MAX_FIREWORKS = isMobile ? 2 : 3;

const HEART_COLORS = [
    "#ff8fbd",
    "#ffc1dd",
    "#ffe3f0",
    "#ff6fae",
    "#e8a6ff",
    "#ffd166"
];

const FIREWORK_COLORS = [
    "#ff8fbd",
    "#ffd166",
    "#ffffff",
    "#ff5da2",
    "#c9a0ff",
    "#ffb3c6"
];


/* THAY TEN NGUOI NHAN TRONG CAC LOI CHUC */
function personalizeCard(name) {
    recipientName.textContent = name;

    const templateElements = cardScreen.querySelectorAll("[data-template]");

    templateElements.forEach((element) => {
        const template = element.dataset.template;

        element.textContent = template.replace(/\{\{ten\}\}/g, name);
    });
}


/* QUAN LY CAC HIEU UNG DE TRANH TON TAI NGUYEN */
function scheduleEffect(callback, delay, currentSession = sessionId) {
    const timer = window.setTimeout(() => {
        effectTimers = effectTimers.filter((id) => id !== timer);

        if (currentSession !== sessionId) return;

        callback();
    }, delay);

    effectTimers.push(timer);
    return timer;
}


function clearEffects() {
    sessionId++;

    effectTimers.forEach((timer) => {
        window.clearTimeout(timer);
    });

    effectTimers = [];
    activeHearts = 0;
    lastBurstTime = 0;

    if (effectsLayer) {
        effectsLayer.replaceChildren();
    }

    moreHeartsButton.disabled = false;
    moreHeartsButton.textContent = "Thêm yêu thương ♥";
}


/* TAO CAC NGÔI SAO NHO */
function createStars() {
    if (!starLayer || reduceMotion) return;

    const fragment = document.createDocumentFragment();
    const starCount = isMobile ? 10 : 18;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement("span");

        star.className = "star";
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;

        fragment.appendChild(star);
    }

    starLayer.replaceChildren(fragment);
}


/* NHAP TEN VA MO MAN HINH THIEP */
nameForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const enteredName = recipientInput.value.trim();

    if (!enteredName) {
        recipientInput.focus();
        return;
    }

    clearEffects();

    personalizeCard(enteredName);

    line1.textContent = CFG.line1;
    line2.textContent = CFG.line2;

    nameScreen.classList.add("hidden");
    cardScreen.classList.add("hidden");
    stage.classList.remove("hidden");

    cardShown = false;
});


/* MO NOI DUNG LOI CHUC */
decodeButton.addEventListener("click", () => {
    if (cardShown) return;

    cardShown = true;

    stage.classList.add("hidden");
    cardScreen.classList.remove("hidden");

    createHeartBurst(isMobile ? 6 : 9);
});


/* TAO MOT TRAI TIM BAY */
function createHeart() {
    if (!effectsLayer || !cardShown || reduceMotion) return;

    if (activeHearts >= CFG.maxHearts) return;

    activeHearts++;

    const heart = document.createElement("span");

    heart.className = "floating-heart";
    heart.textContent = Math.random() > 0.22 ? "♥" : "♡";
    heart.setAttribute("aria-hidden", "true");

    const size = 18 + Math.random() * (isMobile ? 13 : 20);
    const duration = 4 + Math.random() * 1.5;
    const drift = -45 + Math.random() * 90;
    const rotation = -30 + Math.random() * 60;

    const color =
        HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];

    heart.style.setProperty("--x", `${Math.random() * 90 + 5}%`);
    heart.style.setProperty("--heart-size", `${size}px`);
    heart.style.setProperty("--duration", `${duration}s`);
    heart.style.setProperty("--drift", `${drift}px`);
    heart.style.setProperty("--rotation", `${rotation}deg`);
    heart.style.setProperty("--heart-color", color);

    const currentSession = sessionId;
    let removed = false;

    function removeHeart() {
        if (removed) return;

        removed = true;
        heart.remove();

        if (currentSession === sessionId) {
            activeHearts = Math.max(0, activeHearts - 1);
        }
    }

    heart.addEventListener("animationend", removeHeart, { once: true });

    effectsLayer.appendChild(heart);

    scheduleEffect(removeHeart, (duration + 1) * 1000, currentSession);
}


/* TAO MOT DOT TRAI TIM */
function createHeartBurst(count = 8) {
    if (!cardShown || reduceMotion) return;

    const now = Date.now();

    // Han che bam lien tuc de tranh lag
    if (now - lastBurstTime < 1200) return;

    lastBurstTime = now;

    const currentSession = sessionId;
    const total = Math.min(count, isMobile ? 7 : 10);
    const interval = isMobile ? 160 : 120;

    for (let i = 0; i < total; i++) {
        scheduleEffect(() => {
            if (cardShown) createHeart();
        }, i * interval, currentSession);
    }
}


/* TAO MOT PHÁO HOA NHO */
function createFirework(x, y) {
    if (!effectsLayer || !cardShown || reduceMotion) return;

    const existing = effectsLayer.querySelectorAll(".firework");

    if (existing.length >= MAX_FIREWORKS) {
        existing[0].remove();
    }

    const firework = document.createElement("div");
    firework.className = "firework";
    firework.style.left = `${x}%`;
    firework.style.top = `${y}%`;

    const fragment = document.createDocumentFragment();
    const particleCount = isMobile ? 12 : 18;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("span");

        particle.className = "firework-particle";

        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = isMobile
            ? 30 + Math.random() * 35
            : 40 + Math.random() * 50;

        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        const color =
            FIREWORK_COLORS[
                Math.floor(Math.random() * FIREWORK_COLORS.length)
            ];

        particle.style.setProperty("--dx", `${dx}px`);
        particle.style.setProperty("--dy", `${dy}px`);
        particle.style.setProperty("--particle-color", color);
        particle.style.setProperty(
            "--particle-duration",
            `${0.8 + Math.random() * 0.3}s`
        );

        fragment.appendChild(particle);
    }

    firework.appendChild(fragment);
    effectsLayer.appendChild(firework);

    const currentSession = sessionId;

    scheduleEffect(() => {
        firework.remove();
    }, 1400, currentSession);
}


/* BAN PHÁO HOA */
function launchFireworks() {
    if (!cardShown || reduceMotion) return;

    const currentSession = sessionId;

    const positions = isMobile
        ? [
            { x: 22 + Math.random() * 10, y: 22 + Math.random() * 12 },
            { x: 68 + Math.random() * 8, y: 28 + Math.random() * 10 }
        ]
        : [
            { x: 20 + Math.random() * 10, y: 24 + Math.random() * 15 },
            { x: 68 + Math.random() * 10, y: 22 + Math.random() * 15 },
            { x: 42 + Math.random() * 16, y: 16 + Math.random() * 12 }
        ];

    positions.forEach((position, index) => {
        scheduleEffect(() => {
            if (cardShown) {
                createFirework(position.x, position.y);
            }
        }, index * 300, currentSession);
    });
}


/* NUT THEM YEU THUONG */
moreHeartsButton.addEventListener("click", () => {
    if (!cardShown || cardScreen.classList.contains("hidden")) return;
    if (moreHeartsButton.disabled) return;

    moreHeartsButton.disabled = true;
    moreHeartsButton.textContent = "Yêu thương ngập tràn! 💖";

    createHeartBurst(isMobile ? 7 : 10);
    launchFireworks();

    const currentSession = sessionId;

    scheduleEffect(() => {
        if (cardShown && moreHeartsButton.isConnected) {
            moreHeartsButton.textContent = "Thêm yêu thương ♥";
            moreHeartsButton.disabled = false;
        }
    }, 2200, currentSession);
});


/* QUAY LAI DOI TEN NGUOI NHAN */
backButton.addEventListener("click", () => {
    cardShown = false;

    clearEffects();

    cardScreen.classList.add("hidden");
    stage.classList.add("hidden");
    nameScreen.classList.remove("hidden");

    recipientInput.focus();
});


/* KHOI TAO */
createStars();
