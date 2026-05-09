(() => {
    'use strict';

    const $ = id => document.getElementById(id);

    // ========== Tab 切换 ==========
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });
    function switchMode(mode) {
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === mode);
        });
        $('memorySection').hidden = mode !== 'memory';
        $('habitatSection').hidden = mode !== 'habitat';
        $('resultMask').hidden = true;
        if (mode === 'memory') initMemory();
        else initHabitat();
    }

    // ============================================================
    // 记忆翻牌
    // ============================================================
    const memoryAnimals = ['🐶','🐱','🐰','🦊','🐼','🦁','🐯','🐻'];

    const memState = {
        flipped: [],
        matched: 0,
        moves: 0,
        locked: false
    };

    function initMemory() {
        const grid = $('memoryGrid');
        grid.innerHTML = '';
        const cards = [...memoryAnimals, ...memoryAnimals];
        shuffle(cards);
        memState.flipped = [];
        memState.matched = 0;
        memState.moves = 0;
        memState.locked = false;
        $('moveCount').textContent = 0;
        $('matchCount').textContent = 0;
        $('totalPairs').textContent = memoryAnimals.length;

        cards.forEach((animal, idx) => {
            const card = document.createElement('div');
            card.className = 'mem-card';
            card.dataset.animal = animal;
            card.dataset.idx = idx;
            card.innerHTML = `
                <div class="mem-card-inner">
                    <div class="mem-front"></div>
                    <div class="mem-back">${animal}</div>
                </div>
            `;
            card.addEventListener('click', () => flipCard(card));
            grid.appendChild(card);
        });
    }

    function flipCard(card) {
        if (memState.locked) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
        card.classList.add('flipped');
        memState.flipped.push(card);

        if (memState.flipped.length === 2) {
            memState.moves++;
            $('moveCount').textContent = memState.moves;
            const [a, b] = memState.flipped;
            if (a.dataset.animal === b.dataset.animal) {
                a.classList.add('matched');
                b.classList.add('matched');
                memState.matched++;
                $('matchCount').textContent = memState.matched;
                memState.flipped = [];
                if (memState.matched === memoryAnimals.length) {
                    setTimeout(() => finishMemory(), 500);
                }
            } else {
                memState.locked = true;
                setTimeout(() => {
                    a.classList.remove('flipped');
                    b.classList.remove('flipped');
                    memState.flipped = [];
                    memState.locked = false;
                }, 900);
            }
        }
    }

    function finishMemory() {
        const stars = memState.moves <= 12 ? '⭐⭐⭐' : memState.moves <= 18 ? '⭐⭐' : '⭐';
        $('resultTitle').textContent = `全部找到啦！${stars}`;
        $('resultDesc').textContent = `用了 ${memState.moves} 次翻动～`;
        $('resultMask').hidden = false;
        launchConfetti();
    }

    $('memReset').addEventListener('click', initMemory);

    // ============================================================
    // 栖息地匹配
    // ============================================================
    // 6 个栖息地，每个 2-3 只动物
    const habitats = [
        { id: 'forest',  name: '森林', emoji: '🌳', animals: ['🐻','🦌','🐿️','🦉'] },
        { id: 'ocean',   name: '海洋', emoji: '🌊', animals: ['🐠','🐙','🐳','🦀'] },
        { id: 'farm',    name: '农场', emoji: '🚜', animals: ['🐄','🐷','🐔','🐑'] },
        { id: 'savanna', name: '草原', emoji: '🌾', animals: ['🦁','🐘','🦒','🦓'] },
        { id: 'arctic',  name: '冰原', emoji: '❄️', animals: ['🐧','🐻‍❄️','🦭'] },
        { id: 'sky',     name: '天空', emoji: '☁️', animals: ['🦅','🦜','🕊️'] }
    ];

    const habState = {
        score: 0,
        total: 0,
        placed: {}  // animal -> habitatId
    };

    function initHabitat() {
        habState.score = 0;
        habState.placed = {};
        $('habitatScore').textContent = 0;

        // 渲染栖息地区
        const zonesEl = $('habitatZones');
        zonesEl.innerHTML = '';
        habitats.forEach(h => {
            const zone = document.createElement('div');
            zone.className = 'zone';
            zone.dataset.habitat = h.id;
            zone.innerHTML = `
                <span class="zone-bg-emoji">${h.emoji}</span>
                <div class="zone-title">${h.name}</div>
                <div class="zone-residents" data-residents="${h.id}"></div>
            `;
            zonesEl.appendChild(zone);
            registerDropZone(zone);
        });

        // 收集所有动物 → 打乱
        const allAnimals = [];
        habitats.forEach(h => {
            h.animals.forEach(a => allAnimals.push({ animal: a, habitat: h.id }));
        });
        habState.total = allAnimals.length;
        shuffle(allAnimals);

        const pool = $('animalPool');
        pool.innerHTML = '';
        allAnimals.forEach(item => {
            const tok = document.createElement('div');
            tok.className = 'animal-token';
            tok.draggable = true;
            tok.textContent = item.animal;
            tok.dataset.animal = item.animal;
            tok.dataset.correct = item.habitat;
            registerDraggable(tok);
            pool.appendChild(tok);
        });
    }

    function registerDraggable(el) {
        el.addEventListener('dragstart', e => {
            el.classList.add('dragging');
            e.dataTransfer.setData('text/plain', el.dataset.animal);
            e.dataTransfer.effectAllowed = 'move';
        });
        el.addEventListener('dragend', () => el.classList.remove('dragging'));

        // 触屏支持
        let ghost = null, currentZone = null;
        el.addEventListener('touchstart', e => {
            e.preventDefault();
            ghost = el.cloneNode(true);
            ghost.style.position = 'fixed';
            ghost.style.zIndex = '3000';
            ghost.style.pointerEvents = 'none';
            ghost.style.opacity = '0.85';
            document.body.appendChild(ghost);
            el.classList.add('dragging');
            moveGhost(e.touches[0]);
        }, { passive: false });
        el.addEventListener('touchmove', e => {
            if (!ghost) return;
            e.preventDefault();
            const t = e.touches[0];
            moveGhost(t);
            const target = document.elementFromPoint(t.clientX, t.clientY);
            const zone = target?.closest('.zone');
            if (zone !== currentZone) {
                if (currentZone) currentZone.classList.remove('drop-hover');
                if (zone) zone.classList.add('drop-hover');
                currentZone = zone;
            }
        }, { passive: false });
        el.addEventListener('touchend', e => {
            if (!ghost) return;
            const t = e.changedTouches[0];
            const target = document.elementFromPoint(t.clientX, t.clientY);
            const zone = target?.closest('.zone');
            ghost.remove(); ghost = null;
            el.classList.remove('dragging');
            if (currentZone) currentZone.classList.remove('drop-hover');
            currentZone = null;
            if (zone) handleDrop(zone, el);
        });

        function moveGhost(point) {
            ghost.style.left = (point.clientX - 30) + 'px';
            ghost.style.top  = (point.clientY - 30) + 'px';
        }
    }

    function registerDropZone(zone) {
        zone.addEventListener('dragover', e => {
            e.preventDefault();
            zone.classList.add('drop-hover');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('drop-hover'));
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('drop-hover');
            const animal = e.dataTransfer.getData('text/plain');
            const tok = document.querySelector(`.animal-token[data-animal="${animal}"]:not(.placed)`);
            if (tok) handleDrop(zone, tok);
        });
    }

    function handleDrop(zone, tok) {
        const correct = tok.dataset.correct;
        const target = zone.dataset.habitat;
        if (correct === target) {
            // 放进去
            const residents = zone.querySelector(`[data-residents="${target}"]`);
            const span = document.createElement('span');
            span.className = 'zone-resident';
            span.textContent = tok.dataset.animal;
            residents.appendChild(span);
            tok.remove();
            habState.score++;
            $('habitatScore').textContent = habState.score;
            if (habState.score === habState.total) {
                setTimeout(() => finishHabitat(), 500);
            }
        } else {
            // 错误反馈
            zone.style.animation = 'shake 0.4s';
            setTimeout(() => zone.style.animation = '', 400);
            tok.style.animation = 'shake 0.4s';
            setTimeout(() => tok.style.animation = '', 400);
        }
    }

    function finishHabitat() {
        $('resultTitle').textContent = '所有动物都回家啦！';
        $('resultDesc').textContent = `你认识好多小动物哦～`;
        $('resultMask').hidden = false;
        launchConfetti();
    }

    $('habReset').addEventListener('click', initHabitat);

    // ========== 公共 ==========
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function launchConfetti() {
        const colors = ['#ffb4a2', '#a8e6cf', '#a0d8f1', '#ffd56b', '#c5a3ff'];
        const root = $('confettiRoot');
        root.innerHTML = '';
        for (let i = 0; i < 60; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-piece';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.background = colors[i % colors.length];
            p.style.animationDelay = (Math.random() * 0.5) + 's';
            p.style.animationDuration = (2 + Math.random() * 2) + 's';
            p.style.transform = `rotate(${Math.random() * 360}deg)`;
            root.appendChild(p);
        }
        setTimeout(() => { root.innerHTML = ''; }, 4500);
    }

    // ========== 弹窗按钮 ==========
    $('playAgainBtn').addEventListener('click', () => {
        $('resultMask').hidden = true;
        const isMemory = !$('memorySection').hidden;
        if (isMemory) initMemory();
        else initHabitat();
    });
    $('switchModeBtn').addEventListener('click', () => {
        $('resultMask').hidden = true;
        const newMode = $('memorySection').hidden ? 'memory' : 'habitat';
        switchMode(newMode);
    });

    // ========== 初始化 ==========
    initMemory();
})();
