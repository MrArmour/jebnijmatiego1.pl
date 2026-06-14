// ============================
// 🔥 BOSS FIGHT MAX ENGINE
// ============================

// ---------- STATE ----------
let state = {
    coins: Number(localStorage.getItem("coins")) || 0,
    level: Number(localStorage.getItem("level")) || 1,
    xp: Number(localStorage.getItem("xp")) || 0,
    hits: Number(localStorage.getItem("hits")) || 0,
    kills: Number(localStorage.getItem("kills")) || 0,
    crits: Number(localStorage.getItem("crits")) || 0,
};

// ---------- BOSS ----------
let boss = {
    maxHp: 1000,
    hp: 1000,
    phase: 1
};

// ---------- COMBO ----------
let combo = 0;
let comboTimer;

// ---------- DOM ----------
const loginScreen = document.getElementById("loginScreen");
const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const shopScreen = document.getElementById("shopScreen");
const achievementScreen = document.getElementById("achievementScreen");
const statsScreen = document.getElementById("statsScreen");

const bossEl = document.getElementById("boss");
const bossHpBar = document.getElementById("bossHpBar");
const bossHpText = document.getElementById("bossHpText");

const coinsEl = document.getElementById("coins");
const levelEl = document.getElementById("level");
const xpEl = document.getElementById("xp");

// ---------- LOGIN ----------
document.getElementById("loginBtn").onclick = () => {
    const pass = document.getElementById("passwordInput").value;

    if(pass === "boss123"){
        loginScreen.classList.add("hidden");
        menuScreen.classList.remove("hidden");
    } else {
        shake(document.querySelector(".login-card"));
        showNotif("❌ Złe hasło!");
    }
};

// ---------- MENU ----------
document.getElementById("startGameBtn").onclick = () => {
    menuScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    initGame();
};

document.getElementById("shopBtn").onclick = () => openScreen(shopScreen);
document.getElementById("achievementsBtn").onclick = () => openScreen(achievementScreen);
document.getElementById("statsBtn").onclick = () => openScreen(statsScreen);

document.getElementById("backFromShop").onclick = () => openScreen(menuScreen);
document.getElementById("backAchievements").onclick = () => openScreen(menuScreen);
document.getElementById("backStats").onclick = () => openScreen(menuScreen);

// ---------- INIT ----------
function initGame(){
    updateUI();
    spawnBoss();
}

// ---------- BOSS ----------
function spawnBoss(){
    boss.maxHp = 1000 + state.level * 300;
    boss.hp = boss.maxHp;
    updateBossUI();

    bossMove();
}

function bossMove(){
    setInterval(() => {
        if(boss.hp <= 0) return;

        const x = Math.random() * 900;
        const y = Math.random() * 400;

        bossEl.style.left = x + "px";
        bossEl.style.top = y + "px";
    }, 1500);
}

// ---------- ATTACK ----------
document.querySelectorAll(".weapon").forEach(btn => {
    btn.onclick = () => attack(btn.dataset.weapon);
});

function attack(type){

    if(boss.hp <= 0) return;

    state.hits++;

    let dmg = getDamage(type);

    let isCrit = Math.random() < 0.15 + (state.crits * 0.001);

    if(isCrit){
        dmg *= 3;
        state.crits++;
        showNotif("💥 CRITICAL HIT!");
    }

    boss.hp -= dmg;

    combo++;
    resetComboTimer();

    gainXP(5 + dmg);
    gainCoins(Math.floor(dmg / 2));

    showDamage(dmg, isCrit);

    shakeArena();

    checkBoss();
    updateBossUI();
    updateUI();

    save();
}

// ---------- DAMAGE ----------
function getDamage(type){
    const base = {
        laser: 12,
        knife: 18,
        fire: 28,
        thunder: 35,
        water: 22,
        banana: 20,
        tornado: 55,
        bomb: 90,
        rocket: 140,
        meteor: 170,
        ice: 65,
        shark: 75,
        nuke: 320,
        orbital: 520,
        blackhole: 900
    };

    let dmg = base[type] || 10;

    if(combo > 5) dmg *= 1.5;
    if(combo > 10) dmg *= 2;

    return Math.floor(dmg);
}

// ---------- COMBO ----------
function resetComboTimer(){
    clearTimeout(comboTimer);

    document.getElementById("comboText").textContent = "COMBO x" + combo;

    comboTimer = setTimeout(() => {
        combo = 0;
        document.getElementById("comboText").textContent = "COMBO x0";
    }, 1500);
}

// ---------- XP ----------
function gainXP(amount){
    state.xp += amount;

    const need = state.level * 100;

    if(state.xp >= need){
        state.xp = 0;
        state.level++;
        showNotif("⭐ LEVEL UP!");
        document.getElementById("levelupSound").play();
    }
}

// ---------- COINS ----------
function gainCoins(amount){
    state.coins += amount;
}

// ---------- BOSS CHECK ----------
function checkBoss(){

    if(boss.hp <= 0){
        state.kills++;

        state.coins += 500;

        showNotif("👑 Boss pokonany!");

        document.getElementById("deathSound").play();

        setTimeout(() => {
            spawnBoss();
        }, 2000);
    }

    if(boss.hp < boss.maxHp * 0.3){
        bossEl.classList.add("rage");
    } else {
        bossEl.classList.remove("rage");
    }
}

// ---------- UI ----------
function updateBossUI(){
    let percent = (boss.hp / boss.maxHp) * 100;

    bossHpBar.style.width = percent + "%";

    bossHpText.textContent =
    Math.floor(boss.hp) + " / " + boss.maxHp;
}

function updateUI(){
    coinsEl.textContent = state.coins;
    levelEl.textContent = state.level;
    xpEl.textContent = state.xp;

    document.getElementById("statHits").textContent = state.hits;
    document.getElementById("statKills").textContent = state.kills;
    document.getElementById("statCrits").textContent = state.crits;
    document.getElementById("statXp").textContent = state.xp;
}

// ---------- EFFECTS ----------
function showDamage(dmg, crit){

    const el = document.createElement("div");

    el.className = "damageText";

    if(crit) el.classList.add("critical");

    el.textContent = "-" + dmg;

    el.style.left = (400 + Math.random()*200) + "px";
    el.style.top = (200 + Math.random()*200) + "px";

    document.getElementById("damageLayer").appendChild(el);

    setTimeout(() => el.remove(), 1000);
}

function shakeArena(){
    const arena = document.getElementById("arena");
    arena.classList.add("shake");

    setTimeout(() => arena.classList.remove("shake"), 300);
}

// ---------- NOTIFICATIONS ----------
function showNotif(text){

    const n = document.createElement("div");

    n.className = "notification";
    n.textContent = text;

    document.getElementById("notificationContainer").appendChild(n);

    setTimeout(() => n.remove(), 3000);
}

// ---------- SHOP ----------
document.querySelectorAll(".buy").forEach(btn => {
    btn.onclick = () => buy(btn.dataset.item);
});

function buy(item){

    const prices = {
        dmg1: 50,
        dmg2: 150,
        crit: 250,
        autofire: 500,
        nuke: 1000
    };

    if(state.coins < prices[item]){
        showNotif("❌ Za mało monet!");
        return;
    }

    state.coins -= prices[item];
    showNotif("✔ Kupiono ulepszenie: " + item);

    save();
    updateUI();
}

// ---------- SAVE ----------
function save(){
    localStorage.setItem("coins", state.coins);
    localStorage.setItem("level", state.level);
    localStorage.setItem("xp", state.xp);
    localStorage.setItem("hits", state.hits);
    localStorage.setItem("kills", state.kills);
    localStorage.setItem("crits", state.crits);
}

// ---------- SCREEN SWITCH ----------
function openScreen(screen){

    [menuScreen, shopScreen, achievementScreen, statsScreen]
    .forEach(s => s.classList.add("hidden"));

    screen.classList.remove("hidden");
}

// ---------- FULLSCREEN ----------
document.getElementById("fullscreenBtn").onclick = () => {
    document.documentElement.requestFullscreen();
};

document.getElementById("saveBtn").onclick = save;


// ============================
// 🏆 ACHIEVEMENTS SYSTEM
// ============================

const achievements = [
    { id:"first_hit", name:"Pierwszy cios", done:false, check: () => state.hits >= 1 },
    { id:"hundred_hits", name:"Maszyna", done:false, check: () => state.hits >= 100 },
    { id:"first_kill", name:"Zabójca Bossa", done:false, check: () => state.kills >= 1 },
    { id:"crit_master", name:"Krytyk", done:false, check: () => state.crits >= 20 },
    { id:"rich", name:"Bogacz", done:false, check: () => state.coins >= 5000 }
];

function updateAchievements(){

    const list = document.getElementById("achievementList");
    list.innerHTML = "";

    achievements.forEach(a => {

        if(!a.done && a.check()){
            a.done = true;
            showNotif("🏆 Osiągnięcie: " + a.name);
        }

        const div = document.createElement("div");
        div.className = "achievement";
        div.textContent = (a.done ? "✔ " : "❌ ") + a.name;

        list.appendChild(div);
    });
}

// ============================
// 🤖 AUTO FIRE
// ============================

let autoFire = false;

setInterval(() => {
    if(autoFire && boss.hp > 0){
        attack("laser");
    }
}, 600);

// ============================
// ☠️ ENEMY ATTACK
// ============================

function enemyAttack(){

    if(boss.hp <= 0) return;

    const dmg = Math.floor(Math.random()*20 + boss.phase*10);

    state.hits = Math.max(0, state.hits - Math.floor(dmg/10));

    showNotif("💀 Boss atakuje: -" + dmg);

    shakeArena();
}

// ============================
// 🔁 GAME LOOP
// ============================

setInterval(() => {

    if(gameScreen.classList.contains("hidden")) return;

    updateAchievements();

}, 1500);

// ============================
// 🚀 INIT MESSAGE
// ============================

showNotif("🔥 BOSS FIGHT MAX READY!");