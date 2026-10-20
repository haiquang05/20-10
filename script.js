
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
    "#ff1744",
    "#ff4081",
    "#ff80ab",
    "#e040fb",
    "#ea80fc",
    "#ffd740",
    "#ff9100",
    "#ffffff"
];

const FIREWORK_COLORS = [
    "#ff1744",
    "#ff4081",
    "#ff80ab",
    "#ff9100",
    "#ffea00",
    "#76ff03",
    "#00e5ff",
    "#2979ff",
    "#7c4dff",
    "#ffffff",
    "#ff6d00",
    "#f500ff"
];


/* THAY TEN TRONG CAC LOI CHUC */
function personalizeCard(name) {
    recipientName.textContent = name;

    const elements = cardScreen.querySelectorAll("[data-template]");

    elements.forEach((element) => {
        element.textContent = element.dataset.template.replace(
            /\{\{ten\}\}/g,
            name
        );
    });
}


/* QUAN LY HIEU UNG */
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


/* TAO SAO */
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


/* NHAP TEN NGUOI NHAN */
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
    line2.textContent = `${CFG.line2.replace("bạn", enteredName)}`;

    nameScreen.classList.add("hidden");
    cardScreen.classList.add("hidden");
    stage.classList.remove("hidden");

    cardShown = false;
});


/* MO LOI CHUC */
decodeButton.addEventListener("click", () => {
    if (cardShown) return;

    cardShown = true;

    stage.classList.add("hidden");
    cardScreen.classList.remove("hidden");

    createHeartBurst(isMobile ? 6 : 9);

    // Tao mot dot phao hoa khi mo thiep
    launchFireworks();
});


/* TAO TRAI TIM BAY */
function createHeart() {
    if (!effectsLayer || !cardShown || reduceMotion) return;
    if (activeHearts >= CFG.maxHearts) return;

    activeHearts++;

    const heart = document.createElement("span");

    heart.className = "floating-heart";
    heart.textContent = Math.random() > 0.2 ? "♥" : "♡";
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


/* TAO DOT TRAI TIM */
function createHeartBurst(count = 8) {
    if (!cardShown || reduceMotion) return;

    const now = Date.now();

    if (now - lastBurstTime < 1000) return;

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


/* TAO PHAO HOA */
function createFirework(x, y, heartShape = false) {
    if (!effectsLayer || !cardShown || reduceMotion) return;

    const existing = effectsLayer.querySelectorAll(".firework");

    // Gioi han so cum phao hoa de tranh lag
    if (existing.length >= MAX_FIREWORKS) {
        existing[0].remove();
    }

    const firework = document.createElement("div");
    firework.className = "firework";
    firework.style.left = `${x}%`;
    firework.style.top = `${y}%`;

    const fragment = document.createDocumentFragment();

    const particleCount = isMobile
        ? (heartShape ? 32 : 42)
        : (heartShape ? 48 : 60);

    const radius = isMobile ? 95 : 140;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("span");

        const color =
            FIREWORK_COLORS[
                Math.floor(Math.random() * FIREWORK_COLORS.length)
            ];

        particle.style.setProperty("--particle-color", color);
        particle.style.setProperty(
            "--particle-duration",
            `${1.2 + Math.random() * 0.65}s`
        );

        if (heartShape) {
            particle.className = "heart-firework-particle";
            particle.textContent = "♥";

            // Cong thuc toa do tao hinh trai tim
            const t = (Math.PI * 2 * i) / particleCount;

            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy =
                13 * Math.cos(t) -
                5 * Math.cos(2 * t) -
                2 * Math.cos(3 * t) -
                Math.cos(4 * t);

            const scale = radius / 18;

            particle.style.setProperty("--dx", `${hx * scale}px`);
            particle.style.setProperty("--dy", `${-hy * scale}px`);
            particle.style.setProperty(
                "--particle-size",
                `${isMobile ? 10 : 13}px`
            );
        } else {
            particle.className = "firework-particle";

            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = radius * (0.55 + Math.random() * 0.65);

            particle.style.setProperty(
                "--dx",
                `${Math.cos(angle) * distance}px`
            );

            particle.style.setProperty(
                "--dy",
                `${Math.sin(angle) * distance}px`
            );

            particle.style.setProperty(
                "--particle-size",
                `${isMobile ? 4 : 5}px`
            );
        }

        fragment.appendChild(particle);
    }

    firework.appendChild(fragment);
    effectsLayer.appendChild(firework);

    const currentSession = sessionId;

    scheduleEffect(() => {
        firework.remove();
    }, 2200, currentSession);
}


/* BAN PHAO HOA NHIEU MAU VA PHAO HOA TRAI TIM */

function launchFireworks() {
    if (!cardShown || reduceMotion) return;

    const currentSession = sessionId;

    // So dot phao hoa trong moi dot bam
    const total = isMobile ? 5 : 8;

    function launchRandomFirework(index) {
        if (!cardShown || currentSession !== sessionId) return;

        // Vi tri ngau nhien, tranh sat mep man hinh
        const x = 10 + Math.random() * 80;
        const y = 12 + Math.random() * 48;

        // Chon ngau nhien phao hoa tron hoac hinh trai tim
        const heartShape = Math.random() < 0.4;

        createFirework(x, y, heartShape);

        // Khoang cach giua cac lan no khong co dinh
        if (index + 1 < total) {
            const delay = 250 + Math.random() * 750;

            scheduleEffect(() => {
                launchRandomFirework(index + 1);
            }, delay, currentSession);
        }
    }

    // Khong no ngay lap tuc tat ca, ma lan luot bat dau
    scheduleEffect(() => {
        launchRandomFirework(0);
    }, 100 + Math.random() * 500, currentSession);
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
    }, 2500, currentSession);
});


/* DOI TEN NGUOI NHAN */
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
