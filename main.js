const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// --- CẤU HÌNH HỆ THỐNG ---
const BASE_RATE = 10;
const SYSTEM = {
    INFINITY_RADIUS: 13, // Theo yêu cầu lưu trữ của bạn
    TIME_SCALE: 3        // Multiplier x3 đã thiết lập
};

const LINH_CAN = [
    { name: "Phế Linh Căn", mult: 0.5 },
    { name: "Hạ Phẩm", mult: 0.8 },
    { name: "Trung Phẩm", mult: 1.0 },
    { name: "Thượng Phẩm", mult: 1.3 },
    { name: "Thiên Linh Căn", mult: 1.7 },
    { name: "Thánh Linh Căn", mult: 2.2 }
];

const REALMS = [
    { name: "Luyện Khí", need: 100, absorb: 1.0, color: "#4facfe" },
    { name: "Trúc Cơ",   need: 500, absorb: 1.2, color: "#00ff88" },
    { name: "Kim Đan",   need: 2000, absorb: 1.5, color: "#f6d365" },
    { name: "Nguyên Anh",need: 10000, absorb: 2.0, color: "#ff0844" }
];

let player = {
    x: 0, y: 0, size: 40,
    linhKhi: 0,
    realmIdx: 0,
    linhCan: LINH_CAN[4], // Mặc định Thiên Linh Căn
    angle: 0
};

// --- KHỞI TẠO & RESIZE ---
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
}
window.addEventListener("resize", resize);
resize();

// --- LOGIC ---
function update(dt) {
    const realm = REALMS[player.realmIdx] || REALMS[REALMS.length - 1];
    
    // Công thức: BASE * Tư Chất * Cảnh Giới * Multiplier x3
    const gainPerSec = BASE_RATE * player.linhCan.mult * realm.absorb * SYSTEM.TIME_SCALE;
    
    player.linhKhi += dt * gainPerSec;
    player.angle += dt * 1.5;

    // Cập nhật UI nhanh
    document.getElementById("level-display").innerText = `Cảnh giới: ${realm.name}`;
    document.getElementById("linh-can-display").innerText = `Tư chất: ${player.linhCan.name}`;
    document.getElementById("spirit-count").innerText = `${Math.floor(player.linhKhi)} / ${realm.need}`;
    document.getElementById("speed-tag").innerText = `Tốc độ nạp: +${gainPerSec.toFixed(1)}/s`;
    
    const progress = (player.linhKhi / realm.need) * 100;
    const pb = document.getElementById("progress");
    pb.style.width = Math.min(progress, 100) + "%";
    pb.style.background = realm.color;
    pb.style.boxShadow = `0 0 15px ${realm.color}`;
}

function tryBreakthrough() {
    const realm = REALMS[player.realmIdx];
    if (realm && player.linhKhi >= realm.need) {
        player.linhKhi = 0;
        player.realmIdx++;
        // Hiệu ứng lóe sáng màn hình
        canvas.style.filter = "brightness(3)";
        setTimeout(() => canvas.style.filter = "brightness(1)", 150);
    }
}

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") tryBreakthrough();
});

// --- VẼ ---
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const realm = REALMS[player.realmIdx] || REALMS[REALMS.length - 1];

    ctx.save();
    ctx.translate(player.x, player.y);

    // Vòng Aura linh khí (Sử dụng INFINITY_RADIUS = 13)
    ctx.rotate(player.angle);
    ctx.beginPath();
    ctx.strokeStyle = realm.color;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 12]);
    ctx.arc(0, 0, player.size + SYSTEM.INFINITY_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    // Nhân vật (Khối tinh thể)
    ctx.rotate(-player.angle * 2);
    ctx.fillStyle = "white";
    ctx.shadowBlur = 20;
    ctx.shadowColor = realm.color;
    ctx.fillRect(-player.size/2, -player.size/2, player.size, player.size);
    
    ctx.restore();
}

let lastTime = 0;
function loop(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    if (dt < 0.1) { // Tránh nhảy dt quá lớn khi đổi tab
        update(dt);
        draw();
    }
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
