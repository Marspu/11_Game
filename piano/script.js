// ==================== 键盘钢琴应用 ====================

class PianoApp {
    constructor() {
        this.audioContext = null;
        this.volume = 0.7;
        this.activeOscillators = {};
        this.currentSong = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.playTimeout = null;
        this.currentNoteIndex = 0;
        this.followMode = false; // 默认自由弹奏

        // 音符频率映射
        this.noteFrequencies = {
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61,
            'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
            'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
            'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
            'C#3': 138.59, 'D#3': 155.56, 'F#3': 185.00, 'G#3': 207.65, 'A#3': 233.08,
            'C#4': 277.18, 'D#4': 311.13, 'F#4': 369.99, 'G#4': 415.30, 'A#4': 466.16,
            'C#5': 554.37, 'D#5': 622.25, 'F#5': 739.99, 'G#5': 830.61, 'A#5': 932.33
        };

        // 键盘映射
        this.keyMap = {
            'a': 'C4', 's': 'D4', 'd': 'E4', 'f': 'F4', 'g': 'G4', 'h': 'A4', 'j': 'B4',
            'k': 'C5', 'l': 'D5',
            'w': 'C#4', 'e': 'D#4', 't': 'F#4', 'y': 'G#4', 'u': 'A#4', 'o': 'C#5', 'p': 'D#5',
            'z': 'C3', 'x': 'D3', 'c': 'E3', 'v': 'F3', 'b': 'G3', 'n': 'A3', 'm': 'B3'
        };

        // 经典曲目数据
        this.songs = {
            twinkle: {
                name: '小星星',
                notes: [
                    { note: 'C4', duration: 1 }, { note: 'C4', duration: 1 },
                    { note: 'G4', duration: 1 }, { note: 'G4', duration: 1 },
                    { note: 'A4', duration: 1 }, { note: 'A4', duration: 1 },
                    { note: 'G4', duration: 2 },
                    { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 },
                    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'D4', duration: 1 }, { note: 'D4', duration: 1 },
                    { note: 'C4', duration: 2 },
                    { note: 'G4', duration: 1 }, { note: 'G4', duration: 1 },
                    { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 },
                    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'D4', duration: 2 },
                    { note: 'G4', duration: 1 }, { note: 'G4', duration: 1 },
                    { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 },
                    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'D4', duration: 2 },
                    { note: 'C4', duration: 1 }, { note: 'C4', duration: 1 },
                    { note: 'G4', duration: 1 }, { note: 'G4', duration: 1 },
                    { note: 'A4', duration: 1 }, { note: 'A4', duration: 1 },
                    { note: 'G4', duration: 2 },
                    { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 },
                    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'D4', duration: 1 }, { note: 'D4', duration: 1 },
                    { note: 'C4', duration: 2 },
                ]
            },
            happy_birthday: {
                name: '生日快乐',
                notes: [
                    { note: 'G4', duration: 0.75 }, { note: 'G4', duration: 0.25 },
                    { note: 'A4', duration: 1 }, { note: 'G4', duration: 1 },
                    { note: 'C5', duration: 1 }, { note: 'B4', duration: 2 },
                    { note: 'G4', duration: 0.75 }, { note: 'G4', duration: 0.25 },
                    { note: 'A4', duration: 1 }, { note: 'G4', duration: 1 },
                    { note: 'D5', duration: 1 }, { note: 'C5', duration: 2 },
                    { note: 'G4', duration: 0.75 }, { note: 'G4', duration: 0.25 },
                    { note: 'G5', duration: 1 }, { note: 'E5', duration: 1 },
                    { note: 'C5', duration: 1 }, { note: 'B4', duration: 1 },
                    { note: 'A4', duration: 2 },
                    { note: 'F5', duration: 0.75 }, { note: 'F5', duration: 0.25 },
                    { note: 'E5', duration: 1 }, { note: 'C5', duration: 1 },
                    { note: 'D5', duration: 1 }, { note: 'C5', duration: 2 },
                ]
            },
            ode_to_joy: {
                name: '欢乐颂',
                notes: [
                    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'F4', duration: 1 }, { note: 'G4', duration: 1 },
                    { note: 'G4', duration: 1 }, { note: 'F4', duration: 1 },
                    { note: 'E4', duration: 1 }, { note: 'D4', duration: 1 },
                    { note: 'C4', duration: 1 }, { note: 'C4', duration: 1 },
                    { note: 'D4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'E4', duration: 1.5 }, { note: 'D4', duration: 0.5 },
                    { note: 'D4', duration: 2 },
                    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'F4', duration: 1 }, { note: 'G4', duration: 1 },
                    { note: 'G4', duration: 1 }, { note: 'F4', duration: 1 },
                    { note: 'E4', duration: 1 }, { note: 'D4', duration: 1 },
                    { note: 'C4', duration: 1 }, { note: 'C4', duration: 1 },
                    { note: 'D4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'D4', duration: 1.5 }, { note: 'C4', duration: 0.5 },
                    { note: 'C4', duration: 2 },
                ]
            },
            fur_elise: {
                name: '致爱丽丝',
                notes: [
                    { note: 'E5', duration: 0.5 }, { note: 'D#5', duration: 0.5 },
                    { note: 'E5', duration: 0.5 }, { note: 'D#5', duration: 0.5 },
                    { note: 'E5', duration: 0.5 }, { note: 'B4', duration: 0.5 },
                    { note: 'D5', duration: 0.5 }, { note: 'C5', duration: 0.5 },
                    { note: 'A4', duration: 1.5 }, { note: 'C4', duration: 0.5 },
                    { note: 'E4', duration: 0.5 }, { note: 'A4', duration: 0.5 },
                    { note: 'B4', duration: 1.5 }, { note: 'E4', duration: 0.5 },
                    { note: 'G#4', duration: 0.5 }, { note: 'B4', duration: 0.5 },
                    { note: 'C5', duration: 1.5 }, { note: 'E4', duration: 0.5 },
                    { note: 'E5', duration: 0.5 }, { note: 'D#5', duration: 0.5 },
                    { note: 'E5', duration: 0.5 }, { note: 'D#5', duration: 0.5 },
                    { note: 'E5', duration: 0.5 }, { note: 'B4', duration: 0.5 },
                    { note: 'D5', duration: 0.5 }, { note: 'C5', duration: 0.5 },
                    { note: 'A4', duration: 1.5 }, { note: 'C4', duration: 0.5 },
                    { note: 'E4', duration: 0.5 }, { note: 'A4', duration: 0.5 },
                    { note: 'B4', duration: 1.5 }, { note: 'E4', duration: 0.5 },
                    { note: 'C5', duration: 0.5 }, { note: 'B4', duration: 0.5 },
                    { note: 'A4', duration: 2 },
                ]
            },
            jingle_bells: {
                name: '铃儿响叮当',
                notes: [
                    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'E4', duration: 2 },
                    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'E4', duration: 2 },
                    { note: 'E4', duration: 1 }, { note: 'G4', duration: 1 },
                    { note: 'C4', duration: 1 }, { note: 'D4', duration: 1 },
                    { note: 'E4', duration: 4 },
                    { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 },
                    { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 },
                    { note: 'F4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'E4', duration: 1 }, { note: 'E4', duration: 0.5 },
                    { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 1 },
                    { note: 'D4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'D4', duration: 2 }, { note: 'G4', duration: 2 },
                    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'E4', duration: 2 },
                    { note: 'E4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'E4', duration: 2 },
                    { note: 'E4', duration: 1 }, { note: 'G4', duration: 1 },
                    { note: 'C4', duration: 1 }, { note: 'D4', duration: 1 },
                    { note: 'E4', duration: 4 },
                    { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 },
                    { note: 'F4', duration: 1 }, { note: 'F4', duration: 1 },
                    { note: 'F4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'E4', duration: 1 }, { note: 'E4', duration: 0.5 },
                    { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 1 },
                    { note: 'D4', duration: 1 }, { note: 'E4', duration: 1 },
                    { note: 'D4', duration: 2 }, { note: 'C4', duration: 2 },
                ]
            }
        };

        this.baseTempo = 400; // 基础速度（毫秒）

        // 跟弹挑战 / 音符雨 状态
        this.rain = {
            active: false,
            startTime: 0,
            leadTime: 2200,            // 音符从顶部落到判定线的时间
            notes: [],                 // [{note, hitTime, duration, hit, judged}]
            stage: null,
            canvas: null,
            ctx: null,
            rafId: null,
            keyCenters: {},            // note -> x center (px in stage)
            stageWidth: 0,
            stageHeight: 0,
            score: 0,
            combo: 0,
            maxCombo: 0,
            perfectCount: 0,
            goodCount: 0,
            missCount: 0,
            hitCount: 0,
            totalCount: 0,
            endedAt: 0
        };

        // 评分窗口（毫秒）
        this.PERFECT_WINDOW = 100;
        this.GOOD_WINDOW = 250;

        this.init();
    }

    init() {
        this.createPianoKeys();
        this.setupEventListeners();
        this.setupStaffCanvas();
        this.setupRainCanvas();
        this.initAudio();
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // ===== 创建钢琴键 =====
    createPianoKeys() {
        const piano = document.getElementById('piano');
        piano.innerHTML = '';

        const whiteNotes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'];
        const blackNotes = {
            'C3': 'C#3', 'D3': 'D#3',
            'F3': 'F#3', 'G3': 'G#3', 'A3': 'A#3',
            'C4': 'C#4', 'D4': 'D#4',
            'F4': 'F#4', 'G4': 'G#4', 'A4': 'A#4',
            'C5': 'C#5', 'D5': 'D#5'
        };

        let whiteKeyIndex = 0;

        whiteNotes.forEach((noteName) => {
            const whiteKey = document.createElement('div');
            whiteKey.className = 'key key-white';
            whiteKey.dataset.note = noteName;

            const keyLabel = Object.entries(this.keyMap).find(([k, v]) => v === noteName);
            if (keyLabel) {
                whiteKey.innerHTML = `<span class="key-label">${keyLabel[0].toUpperCase()}</span>`;
            }

            piano.appendChild(whiteKey);

            if (blackNotes[noteName]) {
                const blackKey = document.createElement('div');
                blackKey.className = 'key key-black';
                blackKey.dataset.note = blackNotes[noteName];

                const blackKeyLabel = Object.entries(this.keyMap).find(([k, v]) => v === blackNotes[noteName]);
                if (blackKeyLabel) {
                    blackKey.innerHTML = `<span class="key-label">${blackKeyLabel[0].toUpperCase()}</span>`;
                }

                blackKey.style.left = (whiteKeyIndex * 52 + 38) + 'px';
                piano.appendChild(blackKey);
            }

            whiteKeyIndex++;
        });

        // 鼠标点击
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const noteName = key.dataset.note;
                this.handleNotePress(noteName, key);
            });
        });
    }

    // 统一的音符按下处理
    handleNotePress(noteName, keyEl) {
        this.playNote(noteName);
        if (keyEl) {
            keyEl.classList.add('active');
            setTimeout(() => keyEl.classList.remove('active'), 180);
        }
        // 跟弹挑战 - 评分判定
        if (this.followMode && this.rain.active) {
            this.judgePress(noteName);
        }
        setTimeout(() => this.stopNote(noteName), 500);
    }

    // ===== 事件监听 =====
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            const key = e.key.toLowerCase();
            const noteName = this.keyMap[key];
            if (noteName) {
                e.preventDefault();
                const keyEl = document.querySelector(`.key[data-note="${noteName}"]`);
                this.handleNotePress(noteName, keyEl);
            }
        });

        document.querySelectorAll('.song-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.song-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectSong(btn.dataset.song);
            });
        });

        document.getElementById('freePlay').addEventListener('click', () => {
            this.followMode = false;
            document.getElementById('freePlay').classList.add('active');
            document.getElementById('followMode').classList.remove('active');
            document.getElementById('hud').hidden = true;
            this.stopRain();
        });

        document.getElementById('followMode').addEventListener('click', () => {
            this.followMode = true;
            document.getElementById('followMode').classList.add('active');
            document.getElementById('freePlay').classList.remove('active');
            document.getElementById('hud').hidden = false;
            this.resetHud();
        });

        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
        });

        document.getElementById('playBtn').addEventListener('click', () => this.startPlayback());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pausePlayback());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopPlayback());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetPlayback());

        // 结算页
        document.getElementById('rRetry').addEventListener('click', () => {
            this.hideResultModal();
            this.startPlayback();
        });
        document.getElementById('rClose').addEventListener('click', () => this.hideResultModal());
    }

    // ===== 五线谱 =====
    setupStaffCanvas() {
        this.staffCanvas = document.getElementById('staffCanvas');
        this.staffCtx = this.staffCanvas.getContext('2d');
        this.resizeStaffCanvas();
        window.addEventListener('resize', () => {
            this.resizeStaffCanvas();
            this.resizeRainCanvas();
        });
        this.drawStaff();
    }

    resizeStaffCanvas() {
        const container = this.staffCanvas.parentElement;
        this.staffCanvas.width = container.clientWidth - 40;
        this.staffCanvas.height = 200;
        this.drawStaff();
    }

    drawStaff() {
        const ctx = this.staffCtx;
        const width = this.staffCanvas.width;
        const height = this.staffCanvas.height;
        ctx.clearRect(0, 0, width, height);

        const staffTop = 50;
        const lineSpacing = 16;

        // 五线
        ctx.strokeStyle = '#c5a3ff66';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
            const y = staffTop + i * lineSpacing;
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(width - 30, y);
            ctx.stroke();
        }

        // 高音谱号
        ctx.fillStyle = '#8b5fbf';
        ctx.font = 'bold 50px serif';
        ctx.fillText('𝄞', 55, staffTop + 50);

        if (this.currentSong) this.drawSongNotes();
    }

    drawSongNotes() {
        if (!this.currentSong) return;

        const ctx = this.staffCtx;
        const width = this.staffCanvas.width;
        const staffTop = 50;
        const lineSpacing = 16;

        const notePositions = {
            'C3': 10, 'D3': 8, 'E3': 6, 'F3': 4, 'G3': 2,
            'A3': 0, 'B3': -2, 'C4': -4, 'D4': -6, 'E4': -8,
            'F4': -10, 'G4': -12, 'A4': -14, 'B4': -16,
            'C5': -18, 'D5': -20, 'E5': -22, 'F5': -24, 'G5': -26,
            'C#3': 9, 'D#3': 7, 'F#3': 3, 'G#3': 1, 'A#3': -1,
            'C#4': -5, 'D#4': -7, 'F#4': -11, 'G#4': -13, 'A#4': -15,
            'C#5': -19, 'D#5': -21
        };

        const totalNotes = this.currentSong.notes.length;
        const startX = 110;
        const noteWidth = (width - startX - 30) / Math.max(totalNotes, 1);

        this.currentSong.notes.forEach((noteData, index) => {
            const x = startX + index * noteWidth;
            const y = staffTop + 64 + (notePositions[noteData.note] || 0) * lineSpacing / 2;

            const isPlayed = index < this.currentNoteIndex;
            const isCurrent = index === this.currentNoteIndex;

            let color = '#c5a3ff66';
            if (isPlayed) color = '#4caf85';
            if (isCurrent) color = '#e8a93e';

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(x, y, 6, 4.5, -0.2, 0, Math.PI * 2);
            ctx.fill();

            // 符干
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(x + 5, y);
            ctx.lineTo(x + 5, y - 22);
            ctx.stroke();

            if (isCurrent) {
                ctx.fillStyle = 'rgba(232, 169, 62, 0.25)';
                ctx.beginPath();
                ctx.arc(x, y, 13, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        const progress = totalNotes > 0 ? Math.round((this.currentNoteIndex / totalNotes) * 100) : 0;
        document.getElementById('progressInfo').textContent = `进度: ${progress}%`;
    }

    selectSong(songId) {
        this.stopPlayback();
        this.currentSong = this.songs[songId];
        this.currentNoteIndex = 0;
        document.getElementById('currentSong').textContent = this.currentSong.name;
        this.drawStaff();
        this.highlightCurrentNote();
        if (this.followMode) this.resetHud();
    }

    highlightCurrentNote() {
        document.querySelectorAll('.key').forEach(k => k.classList.remove('current'));
        if (!this.currentSong || this.currentNoteIndex >= this.currentSong.notes.length) return;
        const currentNote = this.currentSong.notes[this.currentNoteIndex].note;
        const key = document.querySelector(`.key[data-note="${currentNote}"]`);
        if (key) key.classList.add('current');
    }

    // ===== 播放控制 =====
    startPlayback() {
        if (!this.currentSong) {
            alert('请先选择一个曲目！');
            return;
        }
        this.initAudio();
        this.isPlaying = true;
        this.isPaused = false;
        this.currentNoteIndex = 0;

        if (this.followMode) {
            this.startRain();
        } else {
            this.autoPlayNext();
        }
    }

    autoPlayNext() {
        if (!this.isPlaying || this.isPaused) return;
        if (!this.currentSong) return;

        if (this.currentNoteIndex >= this.currentSong.notes.length) {
            this.stopPlayback();
            return;
        }

        const noteData = this.currentSong.notes[this.currentNoteIndex];
        this.playNote(noteData.note);
        this.highlightKey(noteData.note, true);
        this.drawStaff();
        this.highlightCurrentNote();

        const duration = noteData.duration * this.baseTempo;
        this.playTimeout = setTimeout(() => {
            this.highlightKey(noteData.note, false);
            this.stopNote(noteData.note);
            this.currentNoteIndex++;
            this.autoPlayNext();
        }, duration);
    }

    pausePlayback() {
        if (!this.isPlaying) return;
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? '▶ 继续' : '⏸ 暂停';

        if (this.followMode && this.rain.active) {
            // 简化处理：暂停时停止音符雨循环（保持当前画面）；继续时按下重置
            if (this.isPaused) {
                cancelAnimationFrame(this.rain.rafId);
            } else {
                // 调整起始时间以便继续播放
                this.rain.startTime = performance.now() - (this.rain.pausedElapsed || 0);
                this.rain.rafId = requestAnimationFrame(() => this.tickRain());
            }
            if (this.isPaused) {
                this.rain.pausedElapsed = performance.now() - this.rain.startTime;
            }
        } else if (!this.isPaused) {
            this.autoPlayNext();
        } else if (this.playTimeout) {
            clearTimeout(this.playTimeout);
        }
    }

    stopPlayback() {
        this.isPlaying = false;
        this.isPaused = false;
        if (this.playTimeout) clearTimeout(this.playTimeout);

        Object.keys(this.activeOscillators).forEach(note => this.stopNote(note));
        document.querySelectorAll('.key').forEach(k => {
            k.classList.remove('active');
            k.classList.remove('current');
            k.classList.remove('hit');
        });

        document.getElementById('pauseBtn').textContent = '⏸ 暂停';
        this.stopRain();
        this.drawStaff();
    }

    resetPlayback() {
        this.stopPlayback();
        this.currentNoteIndex = 0;
        this.drawStaff();
        this.highlightCurrentNote();
        this.resetHud();
    }

    // ===== 音符雨 / 跟弹挑战 =====
    setupRainCanvas() {
        this.rain.stage = document.getElementById('rainStage');
        this.rain.canvas = document.getElementById('rainCanvas');
        this.rain.ctx = this.rain.canvas.getContext('2d');
        this.resizeRainCanvas();
    }

    resizeRainCanvas() {
        if (!this.rain.canvas) return;
        const stage = this.rain.stage;
        const rect = stage.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.rain.stageWidth = rect.width;
        this.rain.stageHeight = rect.height;
        this.rain.canvas.width = rect.width * dpr;
        this.rain.canvas.height = rect.height * dpr;
        this.rain.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.computeKeyCenters();
    }

    computeKeyCenters() {
        const stageRect = this.rain.stage.getBoundingClientRect();
        const piano = document.getElementById('piano');
        const pianoRect = piano.getBoundingClientRect();
        // 偏移：piano 与 rain-stage 都居中于 piano-container；它们 min-width 一致，所以左对齐相同
        const offsetX = pianoRect.left - stageRect.left;

        document.querySelectorAll('.key').forEach(key => {
            const r = key.getBoundingClientRect();
            const cx = r.left - pianoRect.left + r.width / 2 + offsetX;
            this.rain.keyCenters[key.dataset.note] = {
                x: cx,
                width: r.width,
                isBlack: key.classList.contains('key-black')
            };
        });
    }

    startRain() {
        if (!this.currentSong) return;
        this.computeKeyCenters();
        this.resetHud();

        const r = this.rain;
        r.active = true;
        r.notes = this.currentSong.notes.map((nd, i) => {
            // 计算每个音符的 hitTime（从开始播放后的累计毫秒）
            let cum = 0;
            for (let j = 0; j < i; j++) cum += this.currentSong.notes[j].duration * this.baseTempo;
            return {
                note: nd.note,
                hitTime: cum,
                duration: nd.duration * this.baseTempo,
                judged: false,
                judgement: null
            };
        });
        r.totalCount = r.notes.length;
        r.startTime = performance.now() + r.leadTime; // 给玩家时间看到第一颗音符
        r.endedAt = r.notes[r.notes.length - 1].hitTime + 800;
        r.rafId = requestAnimationFrame(() => this.tickRain());
        document.getElementById('totalCount').textContent = r.totalCount;
    }

    stopRain() {
        const r = this.rain;
        r.active = false;
        if (r.rafId) cancelAnimationFrame(r.rafId);
        r.rafId = null;
        if (r.ctx) r.ctx.clearRect(0, 0, r.stageWidth, r.stageHeight);
    }

    tickRain() {
        const r = this.rain;
        if (!r.active) return;

        const now = performance.now();
        const elapsed = now - r.startTime; // 当前曲目时间（毫秒，可能为负）

        const ctx = r.ctx;
        ctx.clearRect(0, 0, r.stageWidth, r.stageHeight);

        const hitY = r.stageHeight - 6;       // 判定线
        const topY = -20;
        const blockH = 28;

        // 自动 miss 检测 + 推进 currentNoteIndex
        for (const n of r.notes) {
            if (!n.judged && elapsed - n.hitTime > this.GOOD_WINDOW) {
                n.judged = true;
                n.judgement = 'miss';
                this.applyJudgement('miss');
            }
        }
        // 设置 currentNoteIndex 为下一个未判定的音符
        const nextIdx = r.notes.findIndex(n => !n.judged);
        this.currentNoteIndex = nextIdx === -1 ? r.notes.length : nextIdx;

        // 绘制每个可见音符
        for (const n of r.notes) {
            if (n.judged && n.judgement !== 'miss') continue; // 已击中的隐藏
            const remaining = n.hitTime - elapsed;
            // 屏幕停留：从 hitTime - leadTime 出现，到 hitTime + 200 消失
            if (remaining > r.leadTime || remaining < -250) continue;

            const progress = 1 - remaining / r.leadTime; // 0 -> 1
            const y = topY + progress * (hitY - topY);
            const center = r.keyCenters[n.note];
            if (!center) continue;
            const w = Math.max(center.width - 6, 18);
            const x = center.x - w / 2;

            // 颜色：白键音符 vs 黑键音符
            let fill, stroke;
            if (center.isBlack) {
                fill = '#c5a3ff';
                stroke = '#8b5fbf';
            } else {
                // 不同音名换色，营造彩色雨
                const palette = [
                    ['#ffb4a2', '#e07a5f'],
                    ['#ffd56b', '#e8a93e'],
                    ['#a8e6cf', '#4caf85'],
                    ['#a0d8f1', '#4f9bd1'],
                    ['#c5a3ff', '#8b5fbf'],
                    ['#ff8a80', '#e85a5a']
                ];
                const idx = (n.note.charCodeAt(0) - 65) % palette.length;
                [fill, stroke] = palette[Math.abs(idx)];
            }

            // miss 颜色变灰
            if (n.judged && n.judgement === 'miss') {
                fill = '#e0d8d0';
                stroke = '#a09da8';
            }

            // 圆角矩形
            const radius = 8;
            ctx.fillStyle = fill;
            ctx.strokeStyle = stroke;
            ctx.lineWidth = 2;
            this.roundRect(ctx, x, y, w, blockH, radius);
            ctx.fill();
            ctx.stroke();

            // 顶部高光
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            this.roundRect(ctx, x + 3, y + 3, w - 6, 6, 3);
            ctx.fill();

            // 临近判定线时给键位加 current 提示
            if (Math.abs(remaining) < 150 && !n.judged) {
                const keyEl = document.querySelector(`.key[data-note="${n.note}"]`);
                if (keyEl) keyEl.classList.add('current');
            }
        }

        // 清除已经过时的 current 提示
        document.querySelectorAll('.key.current').forEach(k => {
            const noteName = k.dataset.note;
            const upcoming = r.notes.find(n => n.note === noteName && !n.judged && Math.abs(n.hitTime - elapsed) < 150);
            if (!upcoming) k.classList.remove('current');
        });

        // 更新进度
        const progress = r.totalCount > 0 ? Math.round((this.currentNoteIndex / r.totalCount) * 100) : 0;
        document.getElementById('progressInfo').textContent = `进度: ${progress}%`;

        // 结束判定
        if (elapsed > r.endedAt) {
            this.finishRain();
            return;
        }

        r.rafId = requestAnimationFrame(() => this.tickRain());
    }

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    judgePress(noteName) {
        const r = this.rain;
        if (!r.active) return;
        const now = performance.now();
        const elapsed = now - r.startTime;

        // 找出窗口内最接近、且匹配的未判定音符
        let best = null;
        let bestAbs = Infinity;
        for (const n of r.notes) {
            if (n.judged || n.note !== noteName) continue;
            const delta = Math.abs(n.hitTime - elapsed);
            if (delta <= this.GOOD_WINDOW && delta < bestAbs) {
                best = n;
                bestAbs = delta;
            }
        }

        if (!best) return; // 误触不计

        if (bestAbs <= this.PERFECT_WINDOW) {
            best.judged = true;
            best.judgement = 'perfect';
            this.applyJudgement('perfect');
        } else {
            best.judged = true;
            best.judgement = 'good';
            this.applyJudgement('good');
        }

        // 击中反馈：键位短暂闪烁
        const keyEl = document.querySelector(`.key[data-note="${noteName}"]`);
        if (keyEl) {
            keyEl.classList.add('hit');
            setTimeout(() => keyEl.classList.remove('hit'), 220);
        }
    }

    applyJudgement(type) {
        const r = this.rain;
        if (type === 'perfect') {
            r.perfectCount++;
            r.hitCount++;
            r.combo++;
            r.score += 100 + Math.min(r.combo, 20) * 5;
            this.showJudgeToast('Perfect!', 'judge-perfect');
        } else if (type === 'good') {
            r.goodCount++;
            r.hitCount++;
            r.combo++;
            r.score += 50 + Math.min(r.combo, 20) * 2;
            this.showJudgeToast('Good', 'judge-good');
        } else {
            r.missCount++;
            r.combo = 0;
            this.showJudgeToast('Miss', 'judge-miss');
        }
        if (r.combo > r.maxCombo) r.maxCombo = r.combo;
        this.updateHud();
    }

    showJudgeToast(text, cls) {
        const el = document.getElementById('judgeToast');
        el.textContent = text;
        el.className = 'judge-toast';
        // 强制 reflow 以重启动画
        void el.offsetWidth;
        el.classList.add('show', cls);
    }

    updateHud() {
        const r = this.rain;
        const comboEl = document.getElementById('comboValue');
        const scoreEl = document.getElementById('scoreValue');
        comboEl.textContent = r.combo;
        scoreEl.textContent = r.score;
        document.getElementById('hitCount').textContent = r.hitCount;
        document.getElementById('totalCount').textContent = r.totalCount;
        // 弹一下
        comboEl.parentElement.classList.remove('pulse');
        scoreEl.parentElement.classList.remove('pulse');
        void comboEl.offsetWidth;
        comboEl.parentElement.classList.add('pulse');
        scoreEl.parentElement.classList.add('pulse');
    }

    resetHud() {
        const r = this.rain;
        r.score = 0; r.combo = 0; r.maxCombo = 0;
        r.perfectCount = 0; r.goodCount = 0; r.missCount = 0;
        r.hitCount = 0;
        r.totalCount = this.currentSong ? this.currentSong.notes.length : 0;
        document.getElementById('comboValue').textContent = 0;
        document.getElementById('scoreValue').textContent = 0;
        document.getElementById('hitCount').textContent = 0;
        document.getElementById('totalCount').textContent = r.totalCount;
    }

    finishRain() {
        this.stopRain();
        this.isPlaying = false;
        this.showResultModal();
    }

    showResultModal() {
        const r = this.rain;
        const accuracy = r.totalCount > 0 ? (r.perfectCount * 1 + r.goodCount * 0.5) / r.totalCount : 0;
        let stars = 0;
        if (accuracy >= 0.9) stars = 3;
        else if (accuracy >= 0.7) stars = 2;
        else if (accuracy >= 0.4) stars = 1;

        document.getElementById('rScore').textContent = r.score;
        document.getElementById('rCombo').textContent = r.maxCombo;
        document.getElementById('rPerfect').textContent = r.perfectCount;
        document.getElementById('rGood').textContent = r.goodCount;
        document.getElementById('rMiss').textContent = r.missCount;

        const starEls = document.querySelectorAll('#resultStars .star');
        starEls.forEach((s, i) => {
            s.classList.remove('lit');
            if (i < stars) {
                setTimeout(() => s.classList.add('lit'), 200 + i * 250);
            }
        });

        document.getElementById('resultModal').hidden = false;
    }

    hideResultModal() {
        document.getElementById('resultModal').hidden = true;
    }

    // ===== 音频合成（保留原逻辑） =====
    playNote(noteName) {
        this.initAudio();
        if (this.activeOscillators[noteName]) this.stopNote(noteName);

        const freq = this.noteFrequencies[noteName];
        if (!freq) return;

        const now = this.audioContext.currentTime;
        const oscillators = [];
        const gainNodes = [];

        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.005);
        gain1.gain.exponentialRampToValueAtTime(this.volume * 0.3, now + 0.05);
        gain1.gain.exponentialRampToValueAtTime(this.volume * 0.15, now + 0.3);
        gain1.gain.exponentialRampToValueAtTime(this.volume * 0.05, now + 1.0);
        osc1.connect(gain1); gain1.connect(this.audioContext.destination);
        osc1.start(now); oscillators.push(osc1); gainNodes.push(gain1);

        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(this.volume * 0.25, now + 0.005);
        gain2.gain.exponentialRampToValueAtTime(this.volume * 0.1, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(this.volume * 0.03, now + 0.5);
        osc2.connect(gain2); gain2.connect(this.audioContext.destination);
        osc2.start(now); oscillators.push(osc2); gainNodes.push(gain2);

        const osc3 = this.audioContext.createOscillator();
        const gain3 = this.audioContext.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq * 3, now);
        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(this.volume * 0.12, now + 0.005);
        gain3.gain.exponentialRampToValueAtTime(this.volume * 0.05, now + 0.05);
        gain3.gain.exponentialRampToValueAtTime(this.volume * 0.01, now + 0.3);
        osc3.connect(gain3); gain3.connect(this.audioContext.destination);
        osc3.start(now); oscillators.push(osc3); gainNodes.push(gain3);

        const osc4 = this.audioContext.createOscillator();
        const gain4 = this.audioContext.createGain();
        osc4.type = 'sine';
        osc4.frequency.setValueAtTime(freq * 4, now);
        gain4.gain.setValueAtTime(0, now);
        gain4.gain.linearRampToValueAtTime(this.volume * 0.06, now + 0.005);
        gain4.gain.exponentialRampToValueAtTime(this.volume * 0.02, now + 0.05);
        gain4.gain.exponentialRampToValueAtTime(this.volume * 0.005, now + 0.2);
        osc4.connect(gain4); gain4.connect(this.audioContext.destination);
        osc4.start(now); oscillators.push(osc4); gainNodes.push(gain4);

        const osc5 = this.audioContext.createOscillator();
        const gain5 = this.audioContext.createGain();
        osc5.type = 'triangle';
        osc5.frequency.setValueAtTime(freq, now);
        gain5.gain.setValueAtTime(0, now);
        gain5.gain.linearRampToValueAtTime(this.volume * 0.15, now + 0.005);
        gain5.gain.exponentialRampToValueAtTime(this.volume * 0.08, now + 0.1);
        gain5.gain.exponentialRampToValueAtTime(this.volume * 0.02, now + 0.5);
        osc5.connect(gain5); gain5.connect(this.audioContext.destination);
        osc5.start(now); oscillators.push(osc5); gainNodes.push(gain5);

        this.activeOscillators[noteName] = { oscillators, gainNodes, stopTime: now + 2.0 };
        oscillators.forEach(osc => osc.stop(now + 2.0));
    }

    stopNote(noteName) {
        if (!this.activeOscillators[noteName]) return;
        const { oscillators, gainNodes } = this.activeOscillators[noteName];
        const now = this.audioContext.currentTime;
        gainNodes.forEach(gain => {
            gain.gain.cancelScheduledValues(now);
            gain.gain.setValueAtTime(gain.gain.value, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        });
        setTimeout(() => {
            oscillators.forEach(osc => { try { osc.stop(); } catch(e) {} });
        }, 100);
        delete this.activeOscillators[noteName];
    }

    highlightKey(noteName, isActive) {
        const key = document.querySelector(`.key[data-note="${noteName}"]`);
        if (key) key.classList.toggle('active', isActive);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PianoApp();
});
