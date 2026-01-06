const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- CÀI ĐẶT ---
const mapImg = new Image(); mapImg.src = 'map.png';
const realms = [
    { name: "Luyện Khí", need: 100, absorb: 2, color: "#3498db", atk: 40 },
    { name: "Trúc Cơ", need: 800, absorb: 5, color: "#2ecc71", atk: 100 },
    { name: "Kim Đan", need: 5000, absorb: 15, color: "#f1c40f", atk: 250 }
];

let p = {
    x: 1000, y: 1000, speed: 300, 
    linhKhi: 0, realm: 0, hp: 100, maxHp: 100,
    mode: "BE_QUAN" // Mặc định ban đầu
};

let bullets = [];
let mobs = [];
const keys = {};
const WORLD_SIZE = 2500;

// --- HÀM HỖ TRỢ ---
function spawnMobs() {
    mobs = [];
    for(let i=0; i<20; i++) {
        mobs.push({
            x: Math.random() * WORLD_SIZE,
            y: Math.random() * WORLD_SIZE,
            hp: 100 + p.realm * 200,
            maxHp: 100 + p.realm * 200,
            speed: 100 + Math.random() * 50
        });
    }
}

function toggleMode() {
    const btn = document.getElementById("btn-toggle-mode");
    if (p.mode === "BE_QUAN") {
        p.mode = "HANH_TAU";
        btn.innerText = "BẾ QUAN";
        spawnMobs();
    } else {
        p.mode = "BE_QUAN";
        btn.innerText = "HÀNH TẨU";
        mobs = [];
        // Khi bế quan, đưa tọa độ về giữa màn hình để hiển thị nhân vật
        p.x = canvas.width / 2;
        p.y = canvas.height / 2;
    }
}

// --- VÒNG LẶP GAME ---
function loop() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const r = realms[p.realm];
    let gain = r.absorb * (p.mode === "BE_QUAN" ? 10 : 1);
    p.linhKhi += gain / 60;

    // Cập nhật UI
    document.getElementById("display-realm").innerText = r.name;
    document.getElementById("hp-text").innerText = Math.floor(p.hp) + "/" + p.maxHp;
    document.getElementById("progress-bar").style.width = Math.min(100, (p.linhKhi/r.need)*100) + "%";
    document.getElementById("hp-bar").style.width = (p.hp/p.maxHp)*100 + "%";
    document.getElementById("speed-tag").innerText = "+" + gain.toFixed(1) + " linh khí/s";

    if (p.mode === "HANH_TAU") {
        // DI CHUYỂN
        if (keys['w']) p.y -= p.speed / 60;
        if (keys['s']) p.y += p.speed / 60;
        if (keys['a']) p.x -= p.speed / 60;
        if (keys['d']) p.x += p.speed / 60;

        // VẼ MAP & CAMERA
        ctx.save();
        ctx.translate(-p.x + canvas.width/2, -p.y + canvas.height/2);

        // Vẽ Map
        if (mapImg.complete) {
            ctx.drawImage(mapImg, 0, 0, WORLD_SIZE, WORLD_SIZE);
        } else {
            ctx.fillStyle = "#1a1a1a"; ctx.fillRect(0,0,WORLD_SIZE,WORLD_SIZE);
        }

        // Vẽ Quái & AI đuổi
        mobs.forEach((m, i) => {
            let dx = p.x - m.x; let dy = p.y - m.y;
            let dist = Math.hypot(dx, dy);
            if (dist < 600) {
                m.x += (dx/dist) * m.speed / 60;
                m.y += (dy/dist) * m.speed / 60;
            }
            ctx.fillStyle = "#e74c3c";
            ctx.beginPath(); ctx.arc(m.x, m.y, 20, 0, Math.PI*2); ctx.fill();
            if (dist < 30) p.hp -= 0.1; 
        });

        // Vẽ Đạn
        bullets.forEach((b, i) => {
            b.x += b.vx; b.y += b.vy; b.life--;
            ctx.strokeStyle = b.color; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx*2, b.y - b.vy*2); ctx.stroke();
            
            mobs.forEach((m, mi) => {
                if (Math.hypot(b.x - m.x, b.y - m.y) < 30) {
                    m.hp -= r.atk; bullets.splice(i, 1);
                    if (m.hp <= 0) { m.x = -9999; p.linhKhi += 50; } // Giết quái cộng linh khí
                }
            });
            if (b.life <= 0) bullets.splice(i, 1);
        });

        // Vẽ Nhân vật (Hành tẩu)
        ctx.fillStyle = "#fff"; ctx.fillRect(p.x - 20, p.y - 20, 40, 40);
        ctx.restore();

    } else {
        // CHẾ ĐỘ BẾ QUAN
        ctx.fillStyle = "#0a0f14"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = r.color; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2, 100 + Math.sin(Date.now()/200)*10, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.fillRect(canvas.width/2 - 20, canvas.height/2 - 20, 40, 40);
    }

    requestAnimationFrame(loop);
}

// SỰ KIỆN
window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
    if (e.code === "Space") { // Đột phá
        if (p.linhKhi >= realms[p.realm].need) {
            p.linhKhi = 0;
            p.realm = Math.min(p.realm + 1, realms.length - 1);
            p.maxHp += 200; p.hp = p.maxHp;
            alert("ĐỘT PHÁ THÀNH CÔNG: " + realms[p.realm].name);
        }
    }
});
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
canvas.addEventListener("mousedown", e => {
    if (p.mode !== "HANH_TAU") return;
    const camX = p.x - canvas.width/2; const camY = p.y - canvas.height/2;
    const angle = Math.atan2(e.clientY + camY - p.y, e.clientX + camX - p.x);
    bullets.push({ x: p.x, y: p.y, vx: Math.cos(angle)*15, vy: Math.sin(angle)*15, life: 100, color: realms[p.realm].color });
});

loop();
