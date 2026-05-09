// ==================== 沙画艺术应用 · 真实粒子物理版 ====================

class SandArtApp {
    constructor() {
        // 双画布：背景（已堆积/烘焙的沙）+ 活动粒子层
        this.bgCanvas = document.getElementById('sandCanvas');
        this.bgCtx = this.bgCanvas.getContext('2d');
        this.particleCanvas = document.getElementById('particleCanvas');
        this.pCtx = this.particleCanvas.getContext('2d');

        // 画布尺寸
        this.canvasWidth = 1000;
        this.canvasHeight = 750;
        [this.bgCanvas, this.particleCanvas].forEach(c => {
            c.width = this.canvasWidth;
            c.height = this.canvasHeight;
        });

        // 状态
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.hue = 0;

        // 工具设置
        this.currentColor = '#ffb4a2';
        this.brushSize = 10;
        this.sandEffect = 'normal';
        this.isEraser = false;
        this.bgColor = '#1a1a2e';

        // 粒子物理
        this.particles = [];
        this.MAX_PARTICLES = 3000;
        this.gravity = 0.4;        // 0~1
        this.wind = 0;             // -1, 0, 1
        this.windStrength = 0.08;  // 风力的实际加速度系数
        this.colCellSize = 2;      // 堆积分辨率（列宽，像素）
        this.cols = Math.ceil(this.canvasWidth / this.colCellSize);
        this.groundY = new Float32Array(this.cols);  // 每列下一个粒子落点 Y（从底向上递减）
        this.resetGround();

        // 录制 / 回放
        this.recording = [];       // {t, type: 'down'|'move'|'up', x, y, color, size, effect, eraser}
        this.recordStartT = 0;
        this.isReplaying = false;
        this.replayTimers = [];

        this.init();
    }

    resetGround() {
        for (let i = 0; i < this.cols; i++) this.groundY[i] = this.canvasHeight;
    }

    init() {
        this.setupBackground();
        this.setupColorPalette();
        this.setupEventListeners();
        this.startPhysicsLoop();
        this.loadPreset('twilight');
    }

    setupBackground() {
        this.bgCtx.fillStyle = this.bgColor;
        this.bgCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    setupColorPalette() {
        // 明亮儿童风糖果色 + 经典色
        const colors = [
            '#ffb4a2', '#ff8a80', '#ffd56b', '#a8e6cf', '#a0d8f1', '#c5a3ff',
            '#ff69b4', '#ff1493', '#9b59b6', '#3498db', '#2ecc71', '#f1c40f',
            '#e67e22', '#e74c3c', '#1abc9c', '#8B4513', '#ffffff', '#000000'
        ];

        const palette = document.getElementById('colorPalette');
        colors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch' + (index === 0 ? ' active' : '');
            swatch.style.backgroundColor = color;
            swatch.dataset.color = color;
            swatch.addEventListener('click', () => this.selectColor(color, swatch));
            palette.appendChild(swatch);
        });
        this.currentColor = colors[0];
    }

    setupEventListeners() {
        // 在粒子层上接收事件，但因为它 pointer-events:none，所以挂在背景层
        const target = this.bgCanvas;

        target.addEventListener('mousedown', (e) => this.startDrawing(e));
        target.addEventListener('mousemove', (e) => {
            this.updateMousePos(e);
            this.draw(e);
        });
        target.addEventListener('mouseup', () => this.stopDrawing());
        target.addEventListener('mouseleave', () => this.stopDrawing());

        target.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        target.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        target.addEventListener('touchend', () => this.stopDrawing());

        // 工具控制
        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('brushSizeValue').textContent = this.brushSize;
        });

        document.getElementById('sandEffect').addEventListener('change', (e) => {
            this.sandEffect = e.target.value;
        });

        document.getElementById('customColor').addEventListener('input', (e) => {
            this.currentColor = e.target.value;
            this.updateActiveSwatch(null);
        });

        document.getElementById('bgColor').addEventListener('input', (e) => {
            this.bgColor = e.target.value;
            this.clearCanvas();
        });

        document.getElementById('gravity').addEventListener('input', (e) => {
            this.gravity = parseInt(e.target.value) / 100;
            document.getElementById('gravityValue').textContent = this.gravity.toFixed(2);
        });

        // 风向按钮组
        document.querySelectorAll('.wind-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.wind-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.wind = parseInt(btn.dataset.wind);
            });
        });

        // 工具按钮
        document.getElementById('eraser').addEventListener('click', (e) => {
            this.isEraser = !this.isEraser;
            e.currentTarget.classList.toggle('active', this.isEraser);
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('确定要清空画布吗？')) {
                this.clearCanvas();
                this.recording = [];
            }
        });

        document.getElementById('saveBtn').addEventListener('click', () => this.saveImage());
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('确定要重置图案吗？当前绘画将丢失。')) {
                this.loadPreset('twilight');
            }
        });

        document.getElementById('replayBtn').addEventListener('click', () => this.toggleReplay());

        // 预设图案按钮
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.loadPreset(btn.dataset.preset);
            });
        });

        // 导入图片
        document.getElementById('imageUpload').addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    this.clearCanvas();
                    // 等比例铺到画布中心
                    const ratio = Math.min(this.canvasWidth / img.width, this.canvasHeight / img.height);
                    const w = img.width * ratio;
                    const h = img.height * ratio;
                    this.bgCtx.drawImage(img, (this.canvasWidth - w) / 2, (this.canvasHeight - h) / 2, w, h);
                    // 重新计算 groundY（图片视为已堆积）
                    this.recomputeGroundFromBg();
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    updateMousePos(e) {
        const c = this.getCanvasCoords(e);
        document.getElementById('mousePos').textContent = `位置: ${Math.floor(c.x)}, ${Math.floor(c.y)}`;
    }

    selectColor(color, swatch) {
        this.currentColor = color;
        this.isEraser = false;
        document.getElementById('eraser').classList.remove('active');
        this.updateActiveSwatch(swatch);
        document.getElementById('customColor').value = color;
    }

    updateActiveSwatch(activeSwatch) {
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        if (activeSwatch) activeSwatch.classList.add('active');
    }

    getCanvasCoords(e) {
        const rect = this.bgCanvas.getBoundingClientRect();
        const scaleX = this.canvasWidth / rect.width;
        const scaleY = this.canvasHeight / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    startDrawing(e) {
        if (this.isReplaying) return;
        this.isDrawing = true;
        const c = this.getCanvasCoords(e);
        this.lastX = c.x;
        this.lastY = c.y;
        // 录制：第一笔时重置时间起点
        if (this.recording.length === 0) this.recordStartT = performance.now();
        this.record('down', c.x, c.y);
        this.draw(e);
    }

    draw(e) {
        if (!this.isDrawing || this.isReplaying) return;
        const c = this.getCanvasCoords(e);
        // 在 last -> current 之间插值，保证连续笔迹
        const dx = c.x - this.lastX;
        const dy = c.y - this.lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const step = Math.max(1, this.brushSize * 0.4);
        const n = Math.max(1, Math.ceil(dist / step));
        for (let i = 1; i <= n; i++) {
            const t = i / n;
            const x = this.lastX + dx * t;
            const y = this.lastY + dy * t;
            if (this.isEraser) this.applyEraser(x, y);
            else this.spawnSand(x, y);
        }
        this.record('move', c.x, c.y);
        this.lastX = c.x;
        this.lastY = c.y;
    }

    stopDrawing() {
        if (this.isDrawing) this.record('up', this.lastX, this.lastY);
        this.isDrawing = false;
    }

    record(type, x, y) {
        if (this.isReplaying) return;
        this.recording.push({
            t: performance.now() - this.recordStartT,
            type, x, y,
            color: this.currentColor,
            size: this.brushSize,
            effect: this.sandEffect,
            eraser: this.isEraser
        });
    }

    // ==================== 粒子生成 ====================

    spawnSand(x, y) {
        switch (this.sandEffect) {
            case 'sparkle':    this.spawnEffect(x, y, { count: 2.0, sparkle: true }); break;
            case 'rainbow':    this.spawnEffect(x, y, { count: 2.0, rainbow: true }); break;
            case 'glow':       this.spawnEffect(x, y, { count: 1.5, glow: true }); break;
            case 'pixel':      this.spawnPixel(x, y); break;
            case 'watercolor': this.spawnEffect(x, y, { count: 1.5, watercolor: true }); break;
            case 'normal':
            default:           this.spawnEffect(x, y, { count: 1.5 });
        }
    }

    spawnEffect(x, y, opts) {
        if (this.particles.length >= this.MAX_PARTICLES) return;
        const size = this.brushSize;
        const count = Math.min(
            Math.floor(size * opts.count),
            this.MAX_PARTICLES - this.particles.length
        );
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * size;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            let color;
            if (opts.rainbow) {
                const hue = (this.hue + Math.random() * 60) % 360;
                color = `hsl(${hue}, 80%, 60%)`;
            } else {
                color = this.adjustColor(this.currentColor, Math.random() * 24 - 12);
            }
            this.particles.push({
                x: px, y: py,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.2) * 0.5,
                r: Math.random() * 2 + (opts.watercolor ? 1.5 : 0.8),
                color,
                glow: !!opts.glow,
                sparkle: !!opts.sparkle && Math.random() < 0.3,
                life: 1
            });
        }
        if (opts.rainbow) this.hue = (this.hue + 2) % 360;
    }

    spawnPixel(x, y) {
        const size = this.brushSize;
        const grid = Math.max(3, Math.floor(size / 2));
        for (let gx = -size; gx <= size; gx += grid) {
            for (let gy = -size; gy <= size; gy += grid) {
                if (Math.sqrt(gx * gx + gy * gy) > size) continue;
                if (Math.random() > 0.7) continue;
                if (this.particles.length >= this.MAX_PARTICLES) return;
                this.particles.push({
                    x: x + gx, y: y + gy,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: 0,
                    r: grid * 0.5,
                    color: this.adjustColor(this.currentColor, Math.random() * 20 - 10),
                    pixel: true,
                    pixelSize: grid - 1,
                    life: 1
                });
            }
        }
    }

    applyEraser(x, y) {
        const size = this.brushSize * 2;
        // 在背景层擦除
        this.bgCtx.save();
        this.bgCtx.globalCompositeOperation = 'destination-out';
        this.bgCtx.beginPath();
        this.bgCtx.arc(x, y, size, 0, Math.PI * 2);
        this.bgCtx.fill();
        this.bgCtx.restore();
        // 重新填充背景色（让它显示底色而不是透明）
        this.bgCtx.save();
        this.bgCtx.globalCompositeOperation = 'destination-over';
        this.bgCtx.fillStyle = this.bgColor;
        this.bgCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.bgCtx.restore();
        // 重置该区域的 groundY
        const minCol = Math.max(0, Math.floor((x - size) / this.colCellSize));
        const maxCol = Math.min(this.cols - 1, Math.ceil((x + size) / this.colCellSize));
        for (let c = minCol; c <= maxCol; c++) this.groundY[c] = this.canvasHeight;
    }

    // ==================== 物理循环 ====================

    startPhysicsLoop() {
        const loop = () => {
            this.updateParticles();
            this.renderParticles();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    updateParticles() {
        const g = this.gravity;
        const w = this.wind * this.windStrength;
        const survivors = [];
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.vy += g;
            p.vx += w;
            p.vx *= 0.99;       // 空气阻力
            p.x += p.vx;
            p.y += p.vy;

            // 边界
            if (p.x < 0 || p.x >= this.canvasWidth) {
                continue; // 飞出去就丢弃
            }

            const col = Math.min(this.cols - 1, Math.max(0, Math.floor(p.x / this.colCellSize)));
            const floor = this.groundY[col];

            if (p.y >= floor - p.r) {
                // 着陆 -> 烘焙到背景层
                this.bakeParticle(p, col, floor);
                continue;
            }

            // 限制最大下落速度
            if (p.vy > 12) p.vy = 12;
            survivors.push(p);
        }
        this.particles = survivors;
        document.getElementById('particleCount').textContent =
            `活动粒子: ${this.particles.length}`;
    }

    bakeParticle(p, col, floor) {
        const drawY = floor - p.r;
        const ctx = this.bgCtx;
        if (p.pixel) {
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.floor(p.x), Math.floor(drawY - p.pixelSize / 2), p.pixelSize, p.pixelSize);
        } else if (p.glow) {
            const grad = ctx.createRadialGradient(p.x, drawY, 0, p.x, drawY, p.r * 3);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, drawY, p.r * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, drawY, p.r, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, drawY, p.r, 0, Math.PI * 2);
            ctx.fill();
            if (p.sparkle) {
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.beginPath();
                ctx.arc(p.x, drawY, p.r * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        // 更新该列地面高度（往上累积）
        const newFloor = floor - Math.max(1, p.r * 1.4);
        this.groundY[col] = Math.max(0, newFloor);
        // 让相邻列也略微抬升，模拟堆积坡度
        const slopeStep = Math.max(1, p.r);
        if (col > 0 && this.groundY[col - 1] > newFloor + slopeStep) {
            this.groundY[col - 1] = newFloor + slopeStep;
        }
        if (col < this.cols - 1 && this.groundY[col + 1] > newFloor + slopeStep) {
            this.groundY[col + 1] = newFloor + slopeStep;
        }
    }

    renderParticles() {
        this.pCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        for (const p of this.particles) {
            if (p.pixel) {
                this.pCtx.fillStyle = p.color;
                this.pCtx.fillRect(Math.floor(p.x), Math.floor(p.y), p.pixelSize, p.pixelSize);
            } else {
                this.pCtx.fillStyle = p.color;
                this.pCtx.beginPath();
                this.pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                this.pCtx.fill();
                if (p.sparkle) {
                    this.pCtx.fillStyle = 'rgba(255,255,255,0.85)';
                    this.pCtx.beginPath();
                    this.pCtx.arc(p.x, p.y, p.r * 0.4, 0, Math.PI * 2);
                    this.pCtx.fill();
                }
            }
        }
    }

    // ==================== 颜色工具 ====================

    adjustColor(hex, amount) {
        if (!hex.startsWith('#')) {
            // hsl 等直接返回
            return hex;
        }
        const num = parseInt(hex.slice(1), 16);
        let r = Math.min(255, Math.max(0, (num >> 16) + amount));
        let g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
        let b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
        return `rgb(${r|0}, ${g|0}, ${b|0})`;
    }

    // ==================== 画布操作 ====================

    clearCanvas() {
        this.particles = [];
        this.pCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.bgCtx.fillStyle = this.bgColor;
        this.bgCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.resetGround();
    }

    saveImage() {
        // 合成两层
        const out = document.createElement('canvas');
        out.width = this.canvasWidth;
        out.height = this.canvasHeight;
        const octx = out.getContext('2d');
        octx.drawImage(this.bgCanvas, 0, 0);
        octx.drawImage(this.particleCanvas, 0, 0);
        const link = document.createElement('a');
        link.download = `沙画作品_${Date.now()}.png`;
        link.href = out.toDataURL('image/png');
        link.click();
    }

    // 导入图片后，把背景按列扫描得到大致 groundY（找每列最上方的非背景色像素）
    recomputeGroundFromBg() {
        try {
            const img = this.bgCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
            const data = img.data;
            for (let c = 0; c < this.cols; c++) {
                const x = Math.min(this.canvasWidth - 1, c * this.colCellSize);
                let topY = this.canvasHeight;
                for (let y = 0; y < this.canvasHeight; y += 4) {
                    const idx = (y * this.canvasWidth + x) * 4;
                    const a = data[idx + 3];
                    if (a > 30) { topY = y; break; }
                }
                this.groundY[c] = topY;
            }
        } catch (err) {
            this.resetGround();
        }
    }

    // ==================== 回放 ====================

    toggleReplay() {
        if (this.isReplaying) {
            this.stopReplay();
        } else {
            this.startReplay();
        }
    }

    startReplay() {
        if (this.recording.length === 0) {
            alert('还没有可回放的笔触，先画几笔吧～');
            return;
        }
        this.isReplaying = true;
        const btn = document.getElementById('replayBtn');
        btn.classList.add('playing');
        btn.textContent = '⏹ 停止回放';

        // 清空背景但保留录制
        const recCopy = this.recording.slice();
        this.particles = [];
        this.pCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.bgCtx.fillStyle = this.bgColor;
        this.bgCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.resetGround();

        // 保存当前工具，然后让 spawn 用录制中的设置
        const savedColor = this.currentColor;
        const savedSize = this.brushSize;
        const savedEffect = this.sandEffect;
        const savedEraser = this.isEraser;

        let lastEvent = null;
        recCopy.forEach((ev) => {
            const timer = setTimeout(() => {
                this.currentColor = ev.color;
                this.brushSize = ev.size;
                this.sandEffect = ev.effect;
                this.isEraser = ev.eraser;

                if (ev.type === 'down') {
                    lastEvent = ev;
                    if (ev.eraser) this.applyEraser(ev.x, ev.y);
                    else this.spawnSand(ev.x, ev.y);
                } else if (ev.type === 'move' && lastEvent) {
                    const dx = ev.x - lastEvent.x;
                    const dy = ev.y - lastEvent.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const step = Math.max(1, ev.size * 0.4);
                    const n = Math.max(1, Math.ceil(dist / step));
                    for (let i = 1; i <= n; i++) {
                        const t = i / n;
                        const x = lastEvent.x + dx * t;
                        const y = lastEvent.y + dy * t;
                        if (ev.eraser) this.applyEraser(x, y);
                        else this.spawnSand(x, y);
                    }
                    lastEvent = ev;
                } else if (ev.type === 'up') {
                    lastEvent = null;
                }
            }, ev.t);
            this.replayTimers.push(timer);
        });

        // 结束计时
        const endT = recCopy[recCopy.length - 1].t + 800;
        this.replayTimers.push(setTimeout(() => {
            this.currentColor = savedColor;
            this.brushSize = savedSize;
            this.sandEffect = savedEffect;
            this.isEraser = savedEraser;
            this.stopReplay();
        }, endT));
    }

    stopReplay() {
        this.replayTimers.forEach(t => clearTimeout(t));
        this.replayTimers = [];
        this.isReplaying = false;
        const btn = document.getElementById('replayBtn');
        btn.classList.remove('playing');
        btn.textContent = '⏯️ 回放';
    }

    // ==================== 预设图案系统（直接绘制到 bgCanvas） ====================

    loadPreset(presetName) {
        // 重置画布与录制
        this.clearCanvas();
        this.recording = [];

        // 切换到背景层用 bgCtx 直接绘制（保留原有图形渲染逻辑）
        this.ctx = this.bgCtx;

        switch (presetName) {
            case 'twilight': this.drawTwilightSparkle(); break;
            case 'rainbow':  this.drawRainbowDash(); break;
            case 'pinkie':   this.drawPinkiePie(); break;
            case 'rarity':   this.drawRarity(); break;
            case 'flutter':  this.drawFluttershy(); break;
            case 'apple':    this.drawApplejack(); break;
        }

        // 把绘制结果当作"已堆积"，重算 groundY
        this.recomputeGroundFromBg();
    }

    // 以下绘制方法均使用 this.ctx（= bgCtx）

    drawPonyShape(cx, cy, bodyColor, shadowColor) {
        this.ctx.fillStyle = bodyColor;
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy, 55, 45, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy - 50, 32, 30, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = shadowColor;
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy + 8, 48, 38, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = bodyColor;
        const legPositions = [
            { x: cx - 28, y: cy + 38 },
            { x: cx - 10, y: cy + 38 },
            { x: cx + 10, y: cy + 38 },
            { x: cx + 28, y: cy + 38 }
        ];
        legPositions.forEach(pos => {
            this.ctx.beginPath();
            this.ctx.ellipse(pos.x, pos.y + 25, 9, 25, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawManeShape(cx, cy, colors, style) {
        colors.forEach((color, i) => {
            this.ctx.fillStyle = color;
            const offsetX = (i - colors.length / 2) * 14;

            switch (style) {
                case 'twilight':
                    this.ctx.beginPath();
                    this.ctx.ellipse(cx + offsetX - 12, cy - 12, 16, 28, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.beginPath();
                    this.ctx.ellipse(cx + offsetX + 12, cy + 8, 13, 22, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                case 'rainbow':
                    this.ctx.beginPath();
                    this.ctx.ellipse(cx + offsetX - 16, cy - 8, 19, 32, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.beginPath();
                    this.ctx.ellipse(cx + offsetX, cy - 18, 16, 27, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.beginPath();
                    this.ctx.ellipse(cx + offsetX + 16, cy + 2, 13, 22, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                case 'pinkie':
                    for (let j = 0; j < 5; j++) {
                        this.ctx.beginPath();
                        this.ctx.ellipse(
                            cx + offsetX + Math.cos(j * 1.2) * 22,
                            cy + Math.sin(j * 1.2) * 18 - 12,
                            16, 16, 0, 0, Math.PI * 2
                        );
                        this.ctx.fill();
                    }
                    break;
                case 'rarity':
                    this.ctx.beginPath();
                    this.ctx.ellipse(cx + offsetX - 12, cy, 17, 30, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.beginPath();
                    this.ctx.ellipse(cx + offsetX + 12, cy + 12, 15, 24, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                case 'fluttershy':
                    this.ctx.beginPath();
                    this.ctx.ellipse(cx + offsetX - 10, cy - 8, 15, 24, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.beginPath();
                    this.ctx.ellipse(cx + offsetX + 10, cy + 8, 13, 20, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                case 'applejack':
                    this.ctx.beginPath();
                    this.ctx.ellipse(cx + offsetX, cy - 12, 20, 27, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
            }
        });
    }

    drawHornShape(cx, cy, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 10, cy + 22);
        this.ctx.lineTo(cx, cy - 35);
        this.ctx.lineTo(cx + 10, cy + 22);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawWingsShape(cx, cy, color) {
        this.ctx.fillStyle = color;
        this.ctx.save();
        this.ctx.translate(cx - 45, cy - 25);
        this.ctx.rotate(-0.3);
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 38, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        this.ctx.save();
        this.ctx.translate(cx + 45, cy - 25);
        this.ctx.rotate(0.3);
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 38, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawEyesShape(leftX, leftY, rightX, rightY, irisColor) {
        const drawEye = (x, y) => {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, 13, 15, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = irisColor;
            this.ctx.beginPath();
            this.ctx.ellipse(x + 2, y, 8, 10, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.ellipse(x + 3, y, 5, 6, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.ellipse(x + 6, y - 4, 3, 3, 0, 0, Math.PI * 2);
            this.ctx.fill();
        };
        drawEye(leftX, leftY);
        drawEye(rightX, rightY);
    }

    drawCutieMarkShape(cx, cy, type, colors) {
        switch (type) {
            case 'star':
                this.drawStarShape(cx, cy, 16, colors[0]);
                this.drawStarShape(cx - 10, cy + 12, 9, colors[1]);
                this.drawStarShape(cx + 12, cy + 10, 7, colors[1]);
                break;
            case 'lightning':
                this.ctx.fillStyle = colors[0];
                this.ctx.beginPath();
                this.ctx.moveTo(cx - 6, cy - 18);
                this.ctx.lineTo(cx + 10, cy - 3);
                this.ctx.lineTo(cx + 2, cy - 3);
                this.ctx.lineTo(cx + 8, cy + 18);
                this.ctx.lineTo(cx - 10, cy + 3);
                this.ctx.lineTo(cx - 2, cy + 3);
                this.ctx.closePath();
                this.ctx.fill();
                break;
            case 'balloon':
                this.ctx.fillStyle = colors[0];
                this.ctx.beginPath();
                this.ctx.ellipse(cx, cy - 6, 14, 17, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = colors[1];
                this.ctx.beginPath();
                this.ctx.ellipse(cx, cy + 18, 4, 4, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = colors[1];
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(cx, cy + 12);
                this.ctx.lineTo(cx, cy + 30);
                this.ctx.stroke();
                break;
            case 'diamond':
                this.ctx.fillStyle = colors[0];
                this.ctx.beginPath();
                this.ctx.moveTo(cx, cy - 18);
                this.ctx.lineTo(cx + 14, cy);
                this.ctx.lineTo(cx, cy + 18);
                this.ctx.lineTo(cx - 14, cy);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.fillStyle = colors[1];
                this.ctx.beginPath();
                this.ctx.moveTo(cx, cy - 10);
                this.ctx.lineTo(cx + 7, cy);
                this.ctx.lineTo(cx, cy + 10);
                this.ctx.lineTo(cx - 7, cy);
                this.ctx.closePath();
                this.ctx.fill();
                break;
            case 'butterfly':
                this.ctx.fillStyle = colors[0];
                this.ctx.beginPath(); this.ctx.ellipse(cx - 12, cy, 12, 10, 0, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.beginPath(); this.ctx.ellipse(cx + 12, cy, 12, 10, 0, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.beginPath(); this.ctx.ellipse(cx, cy - 10, 7, 7, 0, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.beginPath(); this.ctx.ellipse(cx, cy + 10, 7, 7, 0, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.fillStyle = colors[1];
                this.ctx.beginPath(); this.ctx.ellipse(cx, cy, 4, 12, 0, 0, Math.PI * 2); this.ctx.fill();
                break;
            case 'apple':
                this.ctx.fillStyle = colors[0];
                this.ctx.beginPath();
                this.ctx.ellipse(cx, cy + 2, 14, 16, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = colors[1];
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.moveTo(cx, cy - 14);
                this.ctx.quadraticCurveTo(cx + 10, cy - 22, cx + 14, cy - 14);
                this.ctx.stroke();
                break;
        }
    }

    drawStarShape(cx, cy, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
            const nextAngle = ((i + 0.5) * 4 * Math.PI / 5) - Math.PI / 2;
            if (i === 0) this.ctx.moveTo(cx + Math.cos(angle) * size, cy + Math.sin(angle) * size);
            else this.ctx.lineTo(cx + Math.cos(angle) * size, cy + Math.sin(angle) * size);
            this.ctx.lineTo(cx + Math.cos(nextAngle) * size * 0.4, cy + Math.sin(nextAngle) * size * 0.4);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawStar(x, y, size, color) {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI / 2) - Math.PI / 2;
            const nextAngle = ((i + 0.5) * Math.PI / 2) - Math.PI / 2;
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
            this.ctx.lineTo(x + Math.cos(nextAngle) * size * 0.3, y + Math.sin(nextAngle) * size * 0.3);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    drawRainbowTail(cx, cy) {
        const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
        colors.forEach((color, i) => {
            this.ctx.fillStyle = color;
            const angle = i * 0.4 - 0.5;
            this.ctx.beginPath();
            this.ctx.ellipse(
                cx + Math.cos(angle) * i * 10,
                cy + Math.sin(angle) * i * 6 + i * 12,
                14 - i, 17 - i, 0, 0, Math.PI * 2
            );
            this.ctx.fill();
        });
    }

    drawSmileShape(cx, cy) {
        this.ctx.strokeStyle = '#ff1493';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 18, 0.2, Math.PI - 0.2);
        this.ctx.stroke();
        this.ctx.fillStyle = '#ff85c2';
        this.ctx.beginPath(); this.ctx.ellipse(cx - 28, cy + 8, 10, 6, 0, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.beginPath(); this.ctx.ellipse(cx + 28, cy + 8, 10, 6, 0, 0, Math.PI * 2); this.ctx.fill();
    }

    drawHatShape(cx, cy) {
        this.ctx.fillStyle = '#e67e22';
        this.ctx.beginPath(); this.ctx.ellipse(cx, cy + 12, 45, 10, 0, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.fillStyle = '#d35400';
        this.ctx.beginPath(); this.ctx.ellipse(cx, cy - 6, 28, 22, 0, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.beginPath(); this.ctx.ellipse(cx, cy + 3, 29, 5, 0, 0, Math.PI * 2); this.ctx.fill();
    }

    addSparkles(cx, cy, count, color) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 50 + Math.random() * 100;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            const size = 2 + Math.random() * 4;
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.drawStar(x, y, size * 1.5, 'rgba(255, 255, 255, 0.5)');
        }
    }

    addConfetti(cx, cy) {
        const colors = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#ff69b4', '#9b59b6'];
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 40 + Math.random() * 140;
            this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            const size = 2 + Math.random() * 4;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    addButterflies(cx, cy) {
        const colors = ['#ff69b4', '#f1c40f', '#3498db'];
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 60 + Math.random() * 100;
            this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            this.ctx.beginPath(); this.ctx.ellipse(x - 10, y, 10, 7, 0, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.ellipse(x + 10, y, 10, 7, 0, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.ellipse(x, y - 6, 5, 5, 0, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.ellipse(x, y + 6, 5, 5, 0, 0, Math.PI * 2); this.ctx.fill();
        }
    }

    drawTwilightSparkle() {
        const cx = this.canvasWidth / 2, cy = this.canvasHeight / 2;
        this.drawPonyShape(cx, cy, '#9b59b6', '#8e44ad');
        this.drawManeShape(cx, cy - 50, ['#3498db', '#9b59b6', '#8e44ad'], 'twilight');
        this.drawCutieMarkShape(cx + 60, cy + 25, 'star', ['#9b59b6', '#3498db']);
        this.drawHornShape(cx, cy - 72, '#e8d5f5');
        this.drawEyesShape(cx - 16, cy - 28, cx + 16, cy - 28, '#3498db');
        this.addSparkles(cx, cy, 20, '#f1c40f');
    }

    drawRainbowDash() {
        const cx = this.canvasWidth / 2, cy = this.canvasHeight / 2;
        this.drawPonyShape(cx, cy, '#3498db', '#2980b9');
        this.drawManeShape(cx, cy - 50, ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'], 'rainbow');
        this.drawCutieMarkShape(cx + 60, cy + 25, 'lightning', ['#3498db', '#ffffff']);
        this.drawWingsShape(cx, cy, '#ecf0f1');
        this.drawEyesShape(cx - 16, cy - 28, cx + 16, cy - 28, '#2c3e50');
        this.drawRainbowTail(cx + 65, cy + 35);
    }

    drawPinkiePie() {
        const cx = this.canvasWidth / 2, cy = this.canvasHeight / 2;
        this.drawPonyShape(cx, cy, '#ff69b4', '#ff1493');
        this.drawManeShape(cx, cy - 50, ['#ff69b4', '#f1c40f', '#ff85c2'], 'pinkie');
        this.drawCutieMarkShape(cx + 60, cy + 25, 'balloon', ['#ff69b4', '#f1c40f']);
        this.drawEyesShape(cx - 16, cy - 28, cx + 16, cy - 28, '#8e44ad');
        this.drawSmileShape(cx, cy - 12);
        this.addConfetti(cx, cy);
    }

    drawRarity() {
        const cx = this.canvasWidth / 2, cy = this.canvasHeight / 2;
        this.drawPonyShape(cx, cy, '#ecf0f1', '#bdc3c7');
        this.drawManeShape(cx, cy - 50, ['#3498db', '#9b59b6', '#8e44ad', '#2980b9'], 'rarity');
        this.drawCutieMarkShape(cx + 60, cy + 25, 'diamond', ['#3498db', '#ecf0f1']);
        this.drawHornShape(cx, cy - 72, '#ecf0f1');
        this.drawEyesShape(cx - 16, cy - 28, cx + 16, cy - 28, '#3498db');
        this.addSparkles(cx, cy, 25, '#f1c40f');
    }

    drawFluttershy() {
        const cx = this.canvasWidth / 2, cy = this.canvasHeight / 2;
        this.drawPonyShape(cx, cy, '#f1c40f', '#f39c12');
        this.drawManeShape(cx, cy - 50, ['#ff69b4', '#ff85c2', '#ff1493'], 'fluttershy');
        this.drawCutieMarkShape(cx + 60, cy + 25, 'butterfly', ['#ff69b4', '#f1c40f']);
        this.drawWingsShape(cx, cy, '#f1c40f');
        this.drawEyesShape(cx - 16, cy - 28, cx + 16, cy - 28, '#8e44ad');
        this.addButterflies(cx, cy);
    }

    drawApplejack() {
        const cx = this.canvasWidth / 2, cy = this.canvasHeight / 2;
        this.drawPonyShape(cx, cy, '#e67e22', '#d35400');
        this.drawManeShape(cx, cy - 50, ['#f1c40f', '#f39c12', '#e67e22'], 'applejack');
        this.drawCutieMarkShape(cx + 60, cy + 25, 'apple', ['#e74c3c', '#2ecc71']);
        this.drawHatShape(cx, cy - 60);
        this.drawEyesShape(cx - 16, cy - 28, cx + 16, cy - 28, '#8e44ad');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SandArtApp();
});
