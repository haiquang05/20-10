
"use strict";

/* =====================================
   CAU HINH THIEP 20/10
===================================== */

const CFG = {
    name: "",
    sender: "Người luôn mong {{ten}} vui",
    line1: "Có một điều nhỏ bé",
    line2: "muốn gửi đến {{ten}}...",
    maxHearts: 24
};

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

let cardShown = false;
let activeHearts = 0;
let sessionId = 0;
let effectTimers = [];

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

/* =====================================
   THAY TEN TRONG TOAN BO LOI CHUC
===================================== */

function personalizeCard(name) {
    const textNodes = [];
    const walker = document.createTreeWalker(
        cardScreen,
        NodeFilter.SHOW_TEXT
    );

    let node;

    while ((node = walker.nextNode())) {
        textNodes.push(node);
    }

    textNodes.forEach(textNode => {
        /*
         * Luu mau goc mot lan de khi doi ten,
         * noi dung khong bi lap ten cu.
         */
        if (textNode.__originalTemplate === undefined) {
            textNode.__originalTemplate = textNode.textContent;
        }

        textNode.textContent = textNode.__originalTemplate.replace(
            /\{\{ten\}\}/g,
            name
        );
    });
}

/* =====================================
   QUAN LY TIMER VA HIEU UNG
===================================== */

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

    moreHeartsButton.disabled = false;
    moreHeartsButton.innerHTML = 'Thêm yêu thương <span>♥</span>';
}

/* =====================================
   TAO SAO NEN
===================================== */

function createStars() {
    if (!starLayer || reduceMotion) return;

    const fragment = document.createDocumentFragment();
    const starCount = isMobile ? 12 : 22;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement("span");

        star.className = "star";
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.animationDuration = `${3 + Math.random() * 2}s`;

        fragment.appendChild(star);
    }

    starLayer.replaceChildren(fragment);
}

/* =====================================
   NHAP TEN NGUOI NHAN
===================================== */

nameForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const enteredName = recipientInput.value.trim();

    if (!enteredName) {
        recipientInput.focus();
        return;
    }

    clearEffects();

    CFG.name = enteredName;

    /*
     * Cap nhat tat ca noi dung co {{ten}}.
     */
    personalizeCard(CFG.name);

    recipientName.textContent = CFG.name;

    signature.textContent = CFG.sender.replace(
        /\{\{ten\}\}/g,
        CFG.name
    );

    line1.textContent = CFG.line1.replace(
        /\{\{ten\}\}/g,
        CFG.name
    );

    line2.textContent = CFG.line2.replace(
        /\{\{ten\}\}/g,
        CFG.name
    );

    nameScreen.classList.add("hidden");
    cardScreen.classList.add("hidden");
    stage.classList.remove("hidden");

    cardShown = false;
});

/* =====================================
   MO THIEP
===================================== */

decodeButton.addEventListener("click", function () {
    if (cardShown) return;

    cardShown = true;

    stage.classList.add("hidden");
    cardScreen.classList.remove("hidden");

    createHeartBurst(isMobile ? 8 : 12);
});

/* =====================================
   TAO TRAI TIM BAY
===================================== */

function createHeart() {
    if (!effectsLayer || !cardShown || reduceMotion) return;
    if (activeHearts >= CFG.maxHearts) return;

    activeHearts++;

    const heart = document.createElement("span");

    heart.className = "floating-heart";
    heart.textContent = Math.random() > 0.22 ? "♥" : "♡";
    heart.setAttribute("aria-hidden", "true");

    const size = 18 + Math.random() * (isMobile ? 18 : 24);
    const duration = 4 + Math.random() * 2;
    const drift = -55 + Math.random() * 110;
    const rotation = -35 + Math.random() * 70;

    const color =
        HEART_COLORS[
            Math.floor(Math.random() * HEART_COLORS.length)
        ];

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

    heart.addEventListener("animationend", removeHeart, {
        once: true
    });

    effectsLayer.appendChild(heart);

    scheduleEffect(
        removeHeart,
        (duration + 1) * 1000,
        currentSession
    );
}

/* =====================================
   TAO DOT TRAI TIM
===================================== */

function createHeartBurst(count = 12) {
    if (!cardShown || reduceMotion) return;

    const currentSession = sessionId;
    const total = Math.min(count, isMobile ? 10 : 14);
    const interval = isMobile ? 140 : 90;

    for (let i = 0; i < total; i++) {
        scheduleEffect(() => {
            if (cardShown) createHeart();
        }, i * interval, currentSession);
    }
}

/* =====================================
   TAO PHAO HOA
===================================== */

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
    const particleCount = isMobile ? 14 : 22;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("span");

        particle.className = "firework-particle";

        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = isMobile
            ? 35 + Math.random() * 45
            : 45 + Math.random() * 70;

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
            `${0.8 + Math.random() * 0.35}s`
        );
        particle.style.setProperty(
            "--particle-size",
            `${2 + Math.random() * 2}px`
        );

        fragment.appendChild(particle);
    }

    const sparkCount = isMobile ? 0 : 6;

    for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement("span");

        spark.className = "firework-spark";

        const angle = (360 / sparkCount) * i;
        const distance = 30 + Math.random() * 35;

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
            `${0.8 + Math.random() * 0.3}s`
        );

        fragment.appendChild(spark);
    }

    firework.appendChild(fragment);
    effectsLayer.appendChild(firework);

    const currentSession = sessionId;

    scheduleEffect(() => {
        firework.remove();
    }, 1600, currentSession);
}

/* =====================================
   BAN PHAO HOA
===================================== */

function launchFireworks() {
    if (!cardShown || reduceMotion) return;

    const currentSession = sessionId;

    const positions = isMobile
        ? [
            { x: 20 + Math.random() * 12, y: 20 + Math.random() * 15 },
            { x: 68 + Math.random() * 10, y: 25 + Math.random() * 12 }
        ]
        : [
            { x: 17 + Math.random() * 14, y: 22 + Math.random() * 20 },
            { x: 68 + Math.random() * 14, y: 22 + Math.random() * 20 },
            { x: 38 + Math.random() * 24, y: 16 + Math.random() * 20 }
        ];

    positions.forEach((position, index) => {
        scheduleEffect(() => {
            if (cardShown) {
                createFirework(position.x, position.y);
            }
        }, index * 350, currentSession);
    });
}

/* =====================================
   THEM YEU THUONG
===================================== */

function launchLoveStorm() {
    if (!cardShown || reduceMotion) return;

    createHeartBurst(isMobile ? 12 : 18);
}

moreHeartsButton.addEventListener("click", function () {
    if (
        !cardShown ||
        cardScreen.classList.contains("hidden") ||
        moreHeartsButton.disabled
    ) {
        return;
    }

    moreHeartsButton.disabled = true;

    launchLoveStorm();
    launchFireworks();

    moreHeartsButton.textContent = "Yêu thương ngập tràn! 💖";

    const currentSession = sessionId;

    scheduleEffect(() => {
        if (moreHeartsButton.isConnected && cardShown) {
            moreHeartsButton.innerHTML =
                'Thêm yêu thương <span>♥</span>';

            moreHeartsButton.disabled = false;
        }
    }, 2000, currentSession);
});

/* =====================================
   QUAY LAI VA DOI TEN
===================================== */

backButton.addEventListener("click", function () {
    cardShown = false;

    clearEffects();

    cardScreen.classList.add("hidden");
    stage.classList.add("hidden");
    nameScreen.classList.remove("hidden");

    recipientInput.value = CFG.name;
    recipientInput.focus();
});

/* =====================================
   KHOI TAO
===================================== */

createStars();
