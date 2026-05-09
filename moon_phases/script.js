/* ============================================================
   月球漫步者 · 交互逻辑
   ============================================================ */

// ---------- 月相数据 ----------
const phaseData = [
    { day: 1,  name: '新月',     icon: '🌑', light: 0    },
    { day: 2,  name: '蛾眉月',   icon: '🌒', light: 0.03 },
    { day: 3,  name: '蛾眉月',   icon: '🌒', light: 0.07 },
    { day: 4,  name: '蛾眉月',   icon: '🌒', light: 0.13 },
    { day: 5,  name: '蛾眉月',   icon: '🌒', light: 0.20 },
    { day: 6,  name: '蛾眉月',   icon: '🌒', light: 0.28 },
    { day: 7,  name: '上弦月',   icon: '🌓', light: 0.37 },
    { day: 8,  name: '上弦月',   icon: '🌓', light: 0.47 },
    { day: 9,  name: '盈凸月',   icon: '🌔', light: 0.57 },
    { day: 10, name: '盈凸月',   icon: '🌔', light: 0.67 },
    { day: 11, name: '盈凸月',   icon: '🌔', light: 0.77 },
    { day: 12, name: '盈凸月',   icon: '🌔', light: 0.86 },
    { day: 13, name: '盈凸月',   icon: '🌔', light: 0.94 },
    { day: 14, name: '接近满月', icon: '🌕', light: 0.99 },
    { day: 15, name: '满月',     icon: '🌕', light: 1    },
    { day: 16, name: '满月',     icon: '🌕', light: 0.99 },
    { day: 17, name: '亏凸月',   icon: '🌖', light: 0.94 },
    { day: 18, name: '亏凸月',   icon: '🌖', light: 0.86 },
    { day: 19, name: '亏凸月',   icon: '🌖', light: 0.77 },
    { day: 20, name: '亏凸月',   icon: '🌖', light: 0.67 },
    { day: 21, name: '亏凸月',   icon: '🌖', light: 0.57 },
    { day: 22, name: '下弦月',   icon: '🌗', light: 0.47 },
    { day: 23, name: '下弦月',   icon: '🌗', light: 0.37 },
    { day: 24, name: '残月',     icon: '🌘', light: 0.28 },
    { day: 25, name: '残月',     icon: '🌘', light: 0.20 },
    { day: 26, name: '残月',     icon: '🌘', light: 0.13 },
    { day: 27, name: '残月',     icon: '🌘', light: 0.07 },
    { day: 28, name: '残月',     icon: '🌘', light: 0.03 },
    { day: 29, name: '残月',     icon: '🌘', light: 0.01 },
    { day: 30, name: '新月',     icon: '🌑', light: 0    }
];

// 潮汐高度（按 8 个主相）和标签
const tideTable = [
    { range: [29, 2],   height: 0.95, label: '大潮', color: '#c5a3ff' }, // 新月
    { range: [3, 6],    height: 0.55, label: '中潮', color: '#a0d8f1' }, // 蛾眉
    { range: [7, 8],    height: 0.30, label: '小潮', color: '#a8e6cf' }, // 上弦
    { range: [9, 13],   height: 0.55, label: '中潮', color: '#a0d8f1' }, // 盈凸
    { range: [14, 16],  height: 0.95, label: '大潮', color: '#ffd56b' }, // 满月
    { range: [17, 21],  height: 0.55, label: '中潮', color: '#a0d8f1' }, // 亏凸
    { range: [22, 23],  height: 0.30, label: '小潮', color: '#a8e6cf' }, // 下弦
    { range: [24, 28],  height: 0.55, label: '中潮', color: '#a0d8f1' }  // 残月
];

function getTideForDay(day) {
    if (day <= 2 || day >= 29) return tideTable[0];
    if (day <= 6)   return tideTable[1];
    if (day <= 8)   return tideTable[2];
    if (day <= 13)  return tideTable[3];
    if (day <= 16)  return tideTable[4];
    if (day <= 21)  return tideTable[5];
    if (day <= 23)  return tideTable[6];
    return tideTable[7];
}

// 月相小知识
const triviaMap = {
    '新月':     '看不到月亮哦！这是因为月亮和太阳在天空的同一边，黑黑的那面对着我们。这时海水会被太阳和月亮一起拉，形成大潮！',
    '蛾眉月':   '月亮像一根弯弯的眉毛，挂在傍晚的西边天空。它会越长越胖，朝着满月前进～',
    '上弦月':   '半个月亮挂天上！亮的部分像字母 D，傍晚就能看到，半夜就落下了。',
    '盈凸月':   '月亮变得胖胖的，已经超过一半被照亮了，再过几天就要变满月啦！',
    '接近满月': '差一点就是满月啦！晚上抬头看，月亮又大又亮。',
    '满月':     '月亮最圆最亮的时候！海水会被月亮拉得高高的，叫做"大潮"。传说月圆夜还会有许多童话故事呢～',
    '亏凸月':   '满月过后，月亮的右边开始一点点变暗，就像被慢慢咬掉一口的饼干。',
    '下弦月':   '另一半月亮！亮的部分像字母 C，要等到半夜或凌晨才能看到。',
    '残月':     '月亮消失前最后的样子，弯弯的，挂在凌晨的东方天空，再过几天就是新月啦。'
};

// ---------- 状态 ----------
let currentDay = 15;
let currentDate = new Date();
let selectedLunarDay = 15;

// ---------- DOM ----------
const moonEl = document.getElementById('moon');
const moonLabel = document.getElementById('moonLabel');
const spaceView = document.getElementById('spaceView');
const viewedMoon = document.getElementById('viewedMoon');
const phaseNameEl = document.getElementById('phaseName');
const dayDisplayEl = document.getElementById('dayDisplay');
const daySlider = document.getElementById('daySlider');
const tideMarker = document.getElementById('tideMarker');
const tideLabelEl = document.getElementById('tideLabel');
const tideFill = document.getElementById('tideFill');
const tideWaveFront = document.getElementById('tideWaveFront');
const tideWaveBack = document.getElementById('tideWaveBack');

// ---------- 星空 ----------
function createStars() {
    const c = document.getElementById('stars');
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 180; i++) {
        const s = document.createElement('span');
        const size = Math.random() * 2.5 + 0.5;
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 100 + '%';
        s.style.opacity = Math.random() * 0.8 + 0.2;
        s.style.animationDelay = (Math.random() * 3) + 's';
        s.style.animationDuration = (Math.random() * 3 + 2) + 's';
        frag.appendChild(s);
    }
    c.appendChild(frag);
}

// ---------- 农历显示 ----------
const cnNum = ['一','二','三','四','五','六','七','八','九','十'];
function getChineseDay(day) {
    if (day === 10) return '初十';
    if (day === 20) return '二十';
    if (day === 30) return '三十';
    if (day < 10)  return '初' + cnNum[day - 1];
    if (day < 20)  return '十' + cnNum[day - 11];
    return '二十' + cnNum[day - 21];
}

// ---------- 太空视角：月球位置 ----------
function dayToAngle(day) {
    // day 1 = 新月（在太阳和地球之间，月亮在地球左侧/太阳侧）
    // day 15 = 满月（在地球右侧，地球处于太阳与月球之间）
    // 角度用从地球中心起，0°=正右(满月)，180°=正左(新月)
    const t = (day - 1) / 29; // 0..1
    // day1 -> 180°, day15 -> 0°/360°, day30 -> 180°（回到新月）
    // 用 cos：day1->-1，day15->1，day30->-1
    return 180 - t * 360; // 角度（度）
}

function positionMoon(day) {
    const orbitRadius = 140;
    const rect = spaceView.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const angleDeg = dayToAngle(day);
    const rad = angleDeg * Math.PI / 180;
    const mx = cx + Math.cos(rad) * orbitRadius;
    const my = cy - Math.sin(rad) * orbitRadius;
    moonEl.style.left = (mx - 22) + 'px';
    moonEl.style.top  = (my - 22) + 'px';
}

// 反向：从鼠标位置算 day
function pointerToDay(clientX, clientY) {
    const rect = spaceView.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = cy - clientY; // 翻 y
    let angle = Math.atan2(dy, dx) * 180 / Math.PI; // -180..180，0=右
    // 反推 day：angle = 180 - t*360 → t = (180 - angle)/360
    let t = (180 - angle) / 360;
    t = ((t % 1) + 1) % 1; // 归一到 0..1
    let day = Math.round(t * 29) + 1;
    if (day < 1) day = 1;
    if (day > 30) day = 30;
    return day;
}

// ---------- 月相 SVG ----------
function createMoonSVG(illumination, waxing, size = 220) {
    const r = size / 2;
    const c = size / 2;
    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${size} ${size}">`;
    // 暗部
    svg += `<defs>
        <radialGradient id="lit" cx="40%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#fffaf0"/>
          <stop offset="60%" stop-color="#e8e8ec"/>
          <stop offset="100%" stop-color="#b8b8c8"/>
        </radialGradient>
    </defs>`;
    svg += `<circle cx="${c}" cy="${c}" r="${r - 1}" fill="#1a1a2e"/>`;

    if (illumination >= 0.99) {
        svg += `<circle cx="${c}" cy="${c}" r="${r - 1}" fill="url(#lit)"/>`;
    } else if (illumination > 0.01) {
        if (illumination <= 0.5) {
            const sweep = illumination * 2;
            if (waxing) {
                svg += `<path d="M ${c} ${c - r} A ${r} ${r} 0 0 1 ${c} ${c + r} A ${r * sweep} ${r} 0 0 0 ${c} ${c - r} Z" fill="url(#lit)"/>`;
            } else {
                svg += `<path d="M ${c} ${c + r} A ${r} ${r} 0 0 1 ${c} ${c - r} A ${r * sweep} ${r} 0 0 0 ${c} ${c + r} Z" fill="url(#lit)"/>`;
            }
        } else {
            svg += `<circle cx="${c}" cy="${c}" r="${r - 1}" fill="url(#lit)"/>`;
            const darkR = (1 - illumination) * 2 * r;
            const darkOffset = (1 - illumination) * r;
            if (waxing) {
                svg += `<ellipse cx="${c - darkOffset}" cy="${c}" rx="${darkR / 2}" ry="${r}" fill="#1a1a2e"/>`;
            } else {
                svg += `<ellipse cx="${c + darkOffset}" cy="${c}" rx="${darkR / 2}" ry="${r}" fill="#1a1a2e"/>`;
            }
        }
    }
    // 陨石坑
    svg += `
      <circle cx="${c + r * 0.2}" cy="${c - r * 0.3}" r="${r * 0.07}" fill="rgba(120,120,140,0.45)"/>
      <circle cx="${c - r * 0.3}" cy="${c + r * 0.2}" r="${r * 0.1}"  fill="rgba(120,120,140,0.45)"/>
      <circle cx="${c + r * 0.1}" cy="${c + r * 0.4}" r="${r * 0.06}" fill="rgba(120,120,140,0.4)"/>
      <circle cx="${c - r * 0.15}" cy="${c - r * 0.2}" r="${r * 0.05}" fill="rgba(120,120,140,0.4)"/>
    `;
    svg += `</svg>`;
    return svg;
}

// ---------- 潮汐：海浪 path ----------
function buildWavePath(amplitude, phase, baseline, width = 400, height = 160) {
    // amplitude 0..1（相对值）, baseline 0..1（水位高，1=高）
    const baseY = height - baseline * (height - 20) - 10;
    const amp = amplitude * 18;
    let d = `M 0 ${height} L 0 ${baseY.toFixed(1)} `;
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width;
        const y = baseY + Math.sin((i / steps) * Math.PI * 3 + phase) * amp;
        d += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    d += `L ${width} ${height} Z`;
    return d;
}

let waveAnimPhase = 0;
let currentTide = tideTable[4];
function updateTide(day) {
    const t = getTideForDay(day);
    currentTide = t;
    tideLabelEl.textContent = t.label;
    tideFill.style.width = (t.height * 100) + '%';
    // marker 高度
    const stageH = 160;
    const bottom = t.height * (stageH - 30) + 6;
    tideMarker.style.bottom = bottom + 'px';
}

function animateWaves() {
    waveAnimPhase += 0.04;
    const h = currentTide.height;
    const amp = h; // 越高潮，浪越大
    tideWaveFront.setAttribute('d', buildWavePath(amp, waveAnimPhase,        h));
    tideWaveBack .setAttribute('d', buildWavePath(amp * 0.7, waveAnimPhase + 1.6, h * 0.92));
    requestAnimationFrame(animateWaves);
}

// ---------- 主更新 ----------
function updateMoonPhase(day, opts = {}) {
    day = Math.max(1, Math.min(30, day));
    currentDay = day;
    const phase = phaseData[day - 1];

    // 太空视角：月球位置
    if (!opts.skipMoonPos) positionMoon(day);
    moonLabel.textContent = phase.icon + ' ' + phase.name;

    // 地球视角
    const waxing = day <= 15;
    if (phase.light <= 0.005) {
        viewedMoon.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 220 220"><circle cx="110" cy="110" r="108" fill="#1a1a2e"/></svg>`;
    } else {
        viewedMoon.innerHTML = createMoonSVG(phase.light, waxing, 220);
    }
    phaseNameEl.textContent = phase.icon + ' ' + phase.name;

    // 滑块/日期
    daySlider.value = day;
    dayDisplayEl.textContent = getChineseDay(day);

    // 潮汐
    updateTide(day);

    // 卡片高亮
    document.querySelectorAll('.phase-card').forEach(c => {
        c.classList.toggle('active', parseInt(c.dataset.day, 10) === phase.day);
    });
}

// ---------- 拖拽月球 ----------
let isDragging = false;
function onPointerDown(e) {
    e.preventDefault();
    isDragging = true;
    moonEl.classList.add('dragging');
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
}
function onPointerMove(e) {
    if (!isDragging) return;
    const day = pointerToDay(e.clientX, e.clientY);
    updateMoonPhase(day);
}
function onPointerUp() {
    isDragging = false;
    moonEl.classList.remove('dragging');
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
}
moonEl.addEventListener('pointerdown', onPointerDown);
moonEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   { updateMoonPhase(currentDay + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') { updateMoonPhase(currentDay - 1); e.preventDefault(); }
});

// ---------- 滑块 ----------
daySlider.addEventListener('input', (e) => {
    updateMoonPhase(parseInt(e.target.value, 10));
});

// ---------- 快捷按钮 ----------
document.querySelectorAll('[data-set]').forEach(btn => {
    btn.addEventListener('click', () => updateMoonPhase(parseInt(btn.dataset.set, 10)));
});

// ---------- 月相卡片 + 小知识弹窗 ----------
const triviaMask = document.getElementById('triviaMask');
const triviaIcon = document.getElementById('triviaIcon');
const triviaTitle = document.getElementById('triviaTitle');
const triviaText = document.getElementById('triviaText');

function openTrivia(name, icon) {
    triviaIcon.textContent = icon;
    triviaTitle.textContent = name;
    triviaText.textContent = triviaMap[name] || '点击不同月相去发现属于它的小秘密吧～';
    triviaMask.hidden = false;
}
function closeTrivia() { triviaMask.hidden = true; }
document.getElementById('triviaClose').addEventListener('click', closeTrivia);
triviaMask.addEventListener('click', (e) => { if (e.target === triviaMask) closeTrivia(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTrivia(); });

function createPhaseCards() {
    const phases = [
        { day: 1,  desc: '看不到月亮' },
        { day: 3,  desc: '像眉毛一样细' },
        { day: 7,  desc: '右边亮，像 D' },
        { day: 10, desc: '大部分亮了' },
        { day: 15, desc: '圆圆的月亮' },
        { day: 20, desc: '开始变缺了' },
        { day: 22, desc: '左边亮，像 C' },
        { day: 27, desc: '只剩一点点' }
    ];
    const container = document.getElementById('phaseCards');
    container.innerHTML = '';
    phases.forEach(p => {
        const info = phaseData[p.day - 1];
        const card = document.createElement('div');
        card.className = 'phase-card';
        card.dataset.day = info.day;
        card.innerHTML = `
            <div class="moon-mini">${createMoonSVG(info.light, p.day <= 15, 64)}</div>
            <div class="pname">${info.icon} ${info.name}</div>
            <div class="pdesc">${p.desc}</div>
        `;
        card.addEventListener('click', () => {
            updateMoonPhase(p.day);
            openTrivia(info.name, info.icon);
        });
        container.appendChild(card);
    });
}

// ---------- 日历 ----------
function getLunarDay(date) {
    const knownNewMoon = new Date(2024, 0, 11);
    const diffDays = Math.floor((date.getTime() - knownNewMoon.getTime()) / 86400000);
    const cycle = 29.53;
    let d = (diffDays % cycle) + 1;
    if (d < 1) d += cycle;
    if (d > 30) d -= 30;
    return Math.floor(d);
}
const lunarMonthNames = ['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];

function renderCalendar() {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    document.getElementById('currentMonth').textContent = `${y}年 ${lunarMonthNames[m]}`;
    const firstDay = new Date(y, m, 1).getDay();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));
    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        const lunar = getLunarDay(new Date(y, m, day));
        const ph = phaseData[lunar - 1] || phaseData[0];
        cell.innerHTML = `<span class="date">${day}</span><span class="moon-icon">${ph.icon}</span>`;
        if (lunar === selectedLunarDay) cell.classList.add('selected');
        cell.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day').forEach(c => c.classList.remove('selected'));
            cell.classList.add('selected');
            selectedLunarDay = lunar;
            updateMoonPhase(lunar);
        });
        grid.appendChild(cell);
    }
}
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// 视图大小变化时重定位月球
window.addEventListener('resize', () => positionMoon(currentDay));

// ---------- 启动 ----------
createStars();
createPhaseCards();
renderCalendar();
// 等布局完成再定位月球
requestAnimationFrame(() => updateMoonPhase(15));
animateWaves();
