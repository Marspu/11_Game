(() => {
    'use strict';

    const STEPS_TO_GOAL = 10;
    const LS_KEY = 'math_adventure_best_v1';

    const state = {
        mode: null,
        level: 0,
        score: 0,
        combo: 0,
        lives: 3,
        correctCount: 0,
        maxCombo: 0,
        currentAnswer: 0,
        locked: false
    };

    const $ = id => document.getElementById(id);
    const menu = $('menuScreen');
    const game = $('gameScreen');
    const resultMask = $('resultMask');

    // ========== 菜单 ==========
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => startGame(btn.dataset.mode));
    });
    $('backMenuBtn').addEventListener('click', goMenu);
    $('backFromResult').addEventListener('click', () => {
        resultMask.hidden = true;
        goMenu();
    });
    $('playAgainBtn').addEventListener('click', () => {
        resultMask.hidden = true;
        startGame(state.mode);
    });

    function showBestScore() {
        const best = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
        const maxBest = Math.max(0, ...Object.values(best).map(Number).filter(Number.isFinite));
        if (maxBest > 0) {
            $('bestScoreBox').hidden = false;
            $('bestScoreVal').textContent = maxBest;
        }
    }
    showBestScore();

    function goMenu() {
        game.hidden = true;
        menu.hidden = false;
        showBestScore();
    }

    // ========== 开始游戏 ==========
    function startGame(mode) {
        state.mode = mode;
        state.level = 1;
        state.score = 0;
        state.combo = 0;
        state.lives = 3;
        state.correctCount = 0;
        state.maxCombo = 0;
        state.locked = false;
        menu.hidden = true;
        game.hidden = false;
        updateHUD();
        updateTrack();
        nextQuestion();
    }

    function updateHUD() {
        $('levelVal').textContent = state.level + ' / ' + STEPS_TO_GOAL;
        $('livesVal').textContent = '❤️'.repeat(state.lives) + '🖤'.repeat(Math.max(0, 3 - state.lives));
        $('scoreVal').textContent = state.score;
        $('comboVal').textContent = state.combo;
    }

    function updateTrack() {
        const pct = Math.min(100, ((state.level - 1) / STEPS_TO_GOAL) * 100);
        $('trackProgress').style.width = pct + '%';
        $('trackSquirrel').style.left = pct + '%';
    }

    // ========== 题目生成 ==========
    function genQuestion(mode) {
        let a, b, op, ans;
        if (mode === 'add10') {
            a = rand(1, 9); b = rand(0, 10 - a); op = '+'; ans = a + b;
        } else if (mode === 'sub10') {
            a = rand(2, 10); b = rand(1, a); op = '-'; ans = a - b;
        } else if (mode === 'add20') {
            a = rand(5, 15); b = rand(1, 20 - a); op = '+'; ans = a + b;
        } else {
            if (Math.random() < 0.5) {
                a = rand(1, 10); b = rand(0, 10); op = '+'; ans = a + b;
            } else {
                a = rand(2, 15); b = rand(1, a); op = '-'; ans = a - b;
            }
        }
        return { a, b, op, ans };
    }

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function nextQuestion() {
        const q = genQuestion(state.mode);
        state.currentAnswer = q.ans;
        state.locked = false;

        // 视觉分组（松果/胡萝卜/蘑菇/花）
        const visualEmojis = ['🌰', '🥕', '🍄', '🌸', '🍎', '🍇', '🍓'];
        const emoji = visualEmojis[rand(0, visualEmojis.length - 1)];
        renderVisual(q, emoji);

        $('questionEq').innerHTML =
            `${q.a} <span class="vis-op-inline">${q.op}</span> ${q.b} = <span class="eq-blank">?</span>`;

        // 生成 4 个答案选项
        const answers = new Set([q.ans]);
        while (answers.size < 4) {
            const offset = rand(-4, 4);
            const cand = q.ans + offset;
            if (cand >= 0 && cand !== q.ans) answers.add(cand);
        }
        const arr = [...answers].sort(() => Math.random() - 0.5);
        const grid = $('answerGrid');
        grid.innerHTML = '';
        arr.forEach(n => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = n;
            btn.addEventListener('click', () => submitAnswer(n, btn));
            grid.appendChild(btn);
        });
    }

    function renderVisual(q, emoji) {
        const vis = $('questionVisual');
        vis.innerHTML = '';

        const g1 = document.createElement('div');
        g1.className = 'vis-group';
        for (let i = 0; i < q.a; i++) {
            const e = document.createElement('span');
            e.className = 'vis-item';
            e.textContent = emoji;
            e.style.animationDelay = (i * 0.04) + 's';
            g1.appendChild(e);
        }

        const opEl = document.createElement('span');
        opEl.className = 'vis-op';
        opEl.textContent = q.op;

        const g2 = document.createElement('div');
        g2.className = 'vis-group';
        const showB = q.op === '-' ? q.b : q.b;
        for (let i = 0; i < showB; i++) {
            const e = document.createElement('span');
            e.className = 'vis-item';
            e.textContent = q.op === '-' ? '❌' : emoji;
            e.style.animationDelay = ((q.a + i) * 0.04) + 's';
            g2.appendChild(e);
        }

        vis.appendChild(g1);
        vis.appendChild(opEl);
        vis.appendChild(g2);
    }

    // ========== 回答 ==========
    function submitAnswer(n, btn) {
        if (state.locked) return;
        state.locked = true;

        const blank = document.querySelector('.eq-blank');
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(b => b.disabled = true);

        if (n === state.currentAnswer) {
            btn.classList.add('correct');
            blank.classList.add('filled');
            blank.textContent = n;
            state.combo++;
            state.maxCombo = Math.max(state.maxCombo, state.combo);
            state.correctCount++;
            const gained = 10 + Math.min(state.combo, 10) * 2;
            state.score += gained;
            state.level++;
            showToast(state.combo >= 3 ? `连击 × ${state.combo}！` : '答对啦！', 'good');
            hopSquirrel();
            updateHUD();
            updateTrack();

            setTimeout(() => {
                if (state.level > STEPS_TO_GOAL) finishGame(true);
                else nextQuestion();
            }, 900);
        } else {
            btn.classList.add('wrong');
            blank.classList.add('wrong');
            blank.textContent = n;
            state.combo = 0;
            state.lives--;
            showToast('再试试 ＞﹏＜', 'miss');
            updateHUD();

            setTimeout(() => {
                if (state.lives <= 0) finishGame(false);
                else {
                    buttons.forEach(b => {
                        if (Number(b.textContent) === state.currentAnswer) b.classList.add('correct');
                    });
                    setTimeout(() => nextQuestion(), 900);
                }
            }, 800);
        }
    }

    function hopSquirrel() {
        const sq = $('trackSquirrel');
        sq.classList.remove('hop');
        void sq.offsetWidth;
        sq.classList.add('hop');
    }

    function showToast(text, type) {
        const t = document.createElement('div');
        t.className = 'toast ' + type;
        t.textContent = text;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 1200);
    }

    // ========== 结算 ==========
    function finishGame(won) {
        if (won) {
            $('resultEmoji').textContent = '🏆';
            $('resultTitle').textContent = '通关啦！真厉害！';
            const stars =
                state.maxCombo >= 8 && state.lives === 3 ? '⭐⭐⭐' :
                state.maxCombo >= 5 || state.lives >= 2 ? '⭐⭐' : '⭐';
            $('resultStars').textContent = stars;
            launchConfetti();
        } else {
            $('resultEmoji').textContent = '🐿️';
            $('resultTitle').textContent = '差一点就到啦！';
            $('resultStars').textContent = '⭐'.repeat(Math.max(1, Math.floor(state.correctCount / 4)));
        }
        $('rCorrect').textContent = state.correctCount;
        $('rCombo').textContent = state.maxCombo;
        $('rScore').textContent = state.score;

        // 保存最高分
        const best = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
        if (!best[state.mode] || state.score > best[state.mode]) {
            best[state.mode] = state.score;
            localStorage.setItem(LS_KEY, JSON.stringify(best));
        }

        setTimeout(() => { resultMask.hidden = false; }, 600);
    }

    function launchConfetti() {
        const colors = ['#ffb4a2', '#a8e6cf', '#a0d8f1', '#ffd56b', '#c5a3ff', '#ff8a80'];
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
})();
