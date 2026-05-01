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
        this.followMode = true; // 默认跟随模式
        
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
        
        // 键盘映射（自由模式使用）
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
        this.init();
    }
    
    init() {
        this.createPianoKeys();
        this.setupEventListeners();
        this.setupStaffCanvas();
        this.initAudio();
    }
    
    // 初始化音频上下文
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        // 确保音频上下文处于运行状态
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // 创建钢琴键
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
        
        // 添加点击事件
        document.querySelectorAll('.key').forEach(key => {
            key.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const noteName = key.dataset.note;
                this.playNote(noteName);
                key.classList.add('active');
                setTimeout(() => {
                    key.classList.remove('active');
                    this.stopNote(noteName);
                }, 500);
            });
        });
    }
    
    // 设置事件监听
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            
            if (e.key === ' ') {
                // 空格键 - 跟随模式弹奏当前音符
                e.preventDefault();
                if (this.followMode && this.currentSong) {
                    this.playCurrentNote();
                }
            } else {
                const key = e.key.toLowerCase();
                const noteName = this.keyMap[key];
                if (noteName) {
                    e.preventDefault();
                    if (this.followMode) {
                        // 跟随模式下，检查按的是否是当前音符
                        this.playCurrentNote();
                    } else {
                        // 自由模式，直接弹奏
                        this.playNote(noteName);
                        this.highlightKey(noteName, true);
                        setTimeout(() => {
                            this.highlightKey(noteName, false);
                            this.stopNote(noteName);
                        }, 500);
                    }
                }
            }
        });
        
        // 曲目选择
        document.querySelectorAll('.song-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.song-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectSong(btn.dataset.song);
            });
        });
        
        // 模式切换
        document.getElementById('freePlay').addEventListener('click', () => {
            this.followMode = false;
            document.getElementById('freePlay').classList.add('active');
            document.getElementById('followMode').classList.remove('active');
        });
        
        document.getElementById('followMode').addEventListener('click', () => {
            this.followMode = true;
            document.getElementById('followMode').classList.add('active');
            document.getElementById('freePlay').classList.remove('active');
        });
        
        // 音量控制
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
        });
        
        // 播放控制
        document.getElementById('playBtn').addEventListener('click', () => this.startPlayback());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pausePlayback());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopPlayback());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetPlayback());
    }
    
    // 设置五线谱画布
    setupStaffCanvas() {
        this.staffCanvas = document.getElementById('staffCanvas');
        this.staffCtx = this.staffCanvas.getContext('2d');
        this.resizeStaffCanvas();
        window.addEventListener('resize', () => this.resizeStaffCanvas());
        this.drawStaff();
    }
    
    resizeStaffCanvas() {
        const container = this.staffCanvas.parentElement;
        this.staffCanvas.width = container.clientWidth - 30;
        this.staffCanvas.height = 200;
        this.drawStaff();
    }
    
    // 绘制五线谱
    drawStaff() {
        const ctx = this.staffCtx;
        const width = this.staffCanvas.width;
        const height = this.staffCanvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const staffTop = 40;
        const lineSpacing = 15;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 5; i++) {
            const y = staffTop + i * lineSpacing;
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(width - 50, y);
            ctx.stroke();
        }
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '40px serif';
        ctx.fillText('𝄞', 55, staffTop + 45);
        
        if (this.currentSong) {
            this.drawSongNotes();
        }
    }
    
    // 绘制曲目音符
    drawSongNotes() {
        if (!this.currentSong) return;
        
        const ctx = this.staffCtx;
        const width = this.staffCanvas.width;
        const staffTop = 40;
        const lineSpacing = 15;
        
        const notePositions = {
            'C3': 10, 'D3': 8, 'E3': 6, 'F3': 4, 'G3': 2,
            'A3': 0, 'B3': -2, 'C4': -4, 'D4': -6, 'E4': -8,
            'F4': -10, 'G4': -12, 'A4': -14, 'B4': -16,
            'C5': -18, 'D5': -20, 'E5': -22, 'F5': -24, 'G5': -26,
            'C#3': 9, 'D#3': 7, 'F#3': 3, 'G#3': 1, 'A#3': -1,
            'C#4': -5, 'D#4': -7, 'F#4': -11, 'G#4': -13, 'A#4': -15,
            'C#5': -19, 'D#5': -21, 'D#5': -21
        };
        
        const totalNotes = this.currentSong.notes.length;
        const noteWidth = (width - 120) / totalNotes;
        
        this.currentSong.notes.forEach((noteData, index) => {
            const x = 80 + index * noteWidth;
            const y = staffTop + 50 + (notePositions[noteData.note] || 0) * lineSpacing / 2;
            
            const isPlayed = index < this.currentNoteIndex;
            const isCurrent = index === this.currentNoteIndex;
            
            ctx.fillStyle = isPlayed ? '#6b5ce7' : (isCurrent ? '#ffd93d' : 'rgba(255, 255, 255, 0.4)');
            
            ctx.beginPath();
            ctx.ellipse(x, y, 6, 4, -0.2, 0, Math.PI * 2);
            ctx.fill();
            
            if (isPlayed || isCurrent) {
                ctx.strokeStyle = ctx.fillStyle;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x + 5, y);
                ctx.lineTo(x + 5, y - 20);
                ctx.stroke();
            }
            
            if (isCurrent) {
                ctx.fillStyle = 'rgba(255, 217, 61, 0.3)';
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        const progress = totalNotes > 0 ? Math.round((this.currentNoteIndex / totalNotes) * 100) : 0;
        document.getElementById('progressInfo').textContent = `进度: ${progress}%`;
    }
    
    // 选择曲目
    selectSong(songId) {
        this.stopPlayback();
        this.currentSong = this.songs[songId];
        this.currentNoteIndex = 0;
        document.getElementById('currentSong').textContent = this.currentSong.name;
        this.drawStaff();
        this.highlightCurrentNote();
    }
    
    // 高亮当前音符对应的琴键
    highlightCurrentNote() {
        // 清除所有高亮
        document.querySelectorAll('.key').forEach(k => k.classList.remove('current'));
        
        if (!this.currentSong || this.currentNoteIndex >= this.currentSong.notes.length) return;
        
        const currentNote = this.currentSong.notes[this.currentNoteIndex].note;
        const key = document.querySelector(`.key[data-note="${currentNote}"]`);
        if (key) {
            key.classList.add('current');
        }
    }
    
    // 播放当前音符（跟随模式）
    playCurrentNote() {
        if (!this.currentSong) return;
        if (this.currentNoteIndex >= this.currentSong.notes.length) {
            this.currentNoteIndex = 0;
        }
        
        const noteData = this.currentSong.notes[this.currentNoteIndex];
        
        // 播放音符
        this.playNote(noteData.note);
        
        // 高亮琴键
        this.highlightKey(noteData.note, true);
        
        // 更新五线谱
        this.drawStaff();
        
        // 移动到下一个音符
        this.currentNoteIndex++;
        
        // 更新高亮
        this.highlightCurrentNote();
        
        // 计算持续时间
        const duration = noteData.duration * this.baseTempo;
        
        // 自动停止当前音符（在音符结束时）
        setTimeout(() => {
            this.highlightKey(noteData.note, false);
            this.stopNote(noteData.note);
        }, duration * 0.9);
    }
    
    // 自动播放
    startPlayback() {
        if (!this.currentSong) {
            alert('请先选择一个曲目！');
            return;
        }
        
        this.initAudio();
        this.isPlaying = true;
        this.isPaused = false;
        this.autoPlayNext();
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
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = this.isPaused ? '▶ 继续' : '⏸ 暂停';
        
        if (!this.isPaused) {
            this.autoPlayNext();
        } else {
            if (this.playTimeout) {
                clearTimeout(this.playTimeout);
            }
        }
    }
    
    stopPlayback() {
        this.isPlaying = false;
        this.isPaused = false;
        
        if (this.playTimeout) {
            clearTimeout(this.playTimeout);
        }
        
        Object.keys(this.activeOscillators).forEach(note => {
            this.stopNote(note);
        });
        
        document.querySelectorAll('.key').forEach(k => {
            k.classList.remove('active');
            k.classList.remove('current');
        });
        
        document.getElementById('pauseBtn').textContent = '⏸ 暂停';
        this.drawStaff();
    }
    
    resetPlayback() {
        this.stopPlayback();
        this.currentNoteIndex = 0;
        this.drawStaff();
        this.highlightCurrentNote();
    }
    
    // 播放音符 - 使用钢琴音色合成
    playNote(noteName) {
        this.initAudio();
        
        // 如果音符已在播放，先停止
        if (this.activeOscillators[noteName]) {
            this.stopNote(noteName);
        }
        
        const freq = this.noteFrequencies[noteName];
        if (!freq) return;
        
        const now = this.audioContext.currentTime;
        const oscillators = [];
        const gainNodes = [];
        
        // 钢琴音色合成 - 使用多个泛音
        // 基频
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(this.volume * 0.5, now + 0.005);
        gain1.gain.exponentialRampToValueAtTime(this.volume * 0.3, now + 0.05);
        gain1.gain.exponentialRampToValueAtTime(this.volume * 0.15, now + 0.3);
        gain1.gain.exponentialRampToValueAtTime(this.volume * 0.05, now + 1.0);
        osc1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        osc1.start(now);
        oscillators.push(osc1);
        gainNodes.push(gain1);
        
        // 第二泛音 (2倍频)
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(this.volume * 0.25, now + 0.005);
        gain2.gain.exponentialRampToValueAtTime(this.volume * 0.1, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(this.volume * 0.03, now + 0.5);
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        osc2.start(now);
        oscillators.push(osc2);
        gainNodes.push(gain2);
        
        // 第三泛音 (3倍频)
        const osc3 = this.audioContext.createOscillator();
        const gain3 = this.audioContext.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq * 3, now);
        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(this.volume * 0.12, now + 0.005);
        gain3.gain.exponentialRampToValueAtTime(this.volume * 0.05, now + 0.05);
        gain3.gain.exponentialRampToValueAtTime(this.volume * 0.01, now + 0.3);
        osc3.connect(gain3);
        gain3.connect(this.audioContext.destination);
        osc3.start(now);
        oscillators.push(osc3);
        gainNodes.push(gain3);
        
        // 第四泛音 (4倍频) - 更弱
        const osc4 = this.audioContext.createOscillator();
        const gain4 = this.audioContext.createGain();
        osc4.type = 'sine';
        osc4.frequency.setValueAtTime(freq * 4, now);
        gain4.gain.setValueAtTime(0, now);
        gain4.gain.linearRampToValueAtTime(this.volume * 0.06, now + 0.005);
        gain4.gain.exponentialRampToValueAtTime(this.volume * 0.02, now + 0.05);
        gain4.gain.exponentialRampToValueAtTime(this.volume * 0.005, now + 0.2);
        osc4.connect(gain4);
        gain4.connect(this.audioContext.destination);
        osc4.start(now);
        oscillators.push(osc4);
        gainNodes.push(gain4);
        
        // 添加一个三角形波增加丰富度
        const osc5 = this.audioContext.createOscillator();
        const gain5 = this.audioContext.createGain();
        osc5.type = 'triangle';
        osc5.frequency.setValueAtTime(freq, now);
        gain5.gain.setValueAtTime(0, now);
        gain5.gain.linearRampToValueAtTime(this.volume * 0.15, now + 0.005);
        gain5.gain.exponentialRampToValueAtTime(this.volume * 0.08, now + 0.1);
        gain5.gain.exponentialRampToValueAtTime(this.volume * 0.02, now + 0.5);
        osc5.connect(gain5);
        gain5.connect(this.audioContext.destination);
        osc5.start(now);
        oscillators.push(osc5);
        gainNodes.push(gain5);
        
        this.activeOscillators[noteName] = {
            oscillators,
            gainNodes,
            stopTime: now + 2.0 // 2秒后自动停止
        };
        
        // 设置自动停止
        oscillators.forEach(osc => {
            osc.stop(now + 2.0);
        });
    }
    
    // 停止音符
    stopNote(noteName) {
        if (!this.activeOscillators[noteName]) return;
        
        const { oscillators, gainNodes } = this.activeOscillators[noteName];
        const now = this.audioContext.currentTime;
        
        // 快速淡出（模拟钢琴制音器效果）
        gainNodes.forEach(gain => {
            gain.gain.cancelScheduledValues(now);
            gain.gain.setValueAtTime(gain.gain.value, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        });
        
        // 停止振荡器
        setTimeout(() => {
            oscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch(e) {}
            });
        }, 100);
        
        delete this.activeOscillators[noteName];
    }
    
    // 高亮琴键
    highlightKey(noteName, isActive) {
        const key = document.querySelector(`.key[data-note="${noteName}"]`);
        if (key) {
            key.classList.toggle('active', isActive);
        }
    }
}

// ==================== 启动应用 ====================

document.addEventListener('DOMContentLoaded', () => {
    new PianoApp();
});