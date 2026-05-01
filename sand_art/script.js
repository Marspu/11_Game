// ==================== 沙画艺术应用 ====================

class SandArtApp {
    constructor() {
        this.canvas = document.getElementById('sandCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 画布尺寸
        this.canvasWidth = 1000;
        this.canvasHeight = 750;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        // 状态
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.pixelCount = 0;
        this.hue = 0; // 用于彩虹效果
        
        // 工具设置
        this.currentColor = '#ff69b4';
        this.brushSize = 8;
        this.sandEffect = 'normal';
        this.effectIntensity = 5;
        this.isEraser = false;
        this.bgColor = '#1a1a2e';
        
        // 初始化
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupColorPalette();
        this.setupEventListeners();
        this.loadPreset('twilight'); // 默认加载紫悦图案
    }
    
    setupCanvas() {
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    
    setupColorPalette() {
        const colors = [
            '#ff69b4', '#ff1493', '#ff85c2', '#dda0dd', '#ba55d3',
            '#9b59b6', '#8e44ad', '#3498db', '#2980b9', '#1abc9c',
            '#2ecc71', '#27ae60', '#f1c40f', '#f39c12', '#e67e22',
            '#e74c3c', '#c0392b', '#ecf0f1', '#bdc3c7', '#95a5a6',
            '#000000', '#ffffff', '#8B4513', '#FF6347', '#4169E1'
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
    }
    
    setupEventListeners() {
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
        
        // 触摸事件支持
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrawing(touch);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.draw(touch);
        });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
        
        // 工具控制
        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('brushSizeValue').textContent = this.brushSize;
        });
        
        document.getElementById('effectIntensity').addEventListener('input', (e) => {
            this.effectIntensity = parseInt(e.target.value);
            document.getElementById('intensityValue').textContent = this.effectIntensity;
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
        
        // 工具按钮
        document.getElementById('eraser').addEventListener('click', (e) => {
            this.isEraser = !this.isEraser;
            e.target.classList.toggle('active');
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('确定要清空画布吗？')) {
                this.clearCanvas();
            }
        });
        
        document.getElementById('saveBtn').addEventListener('click', () => this.saveImage());
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('确定要重置图案吗？当前绘画将丢失。')) {
                this.loadPreset('twilight');
            }
        });
        
        // 预设图案按钮
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.loadPreset(preset);
            });
        });
        
        // 鼠标位置追踪
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor(e.clientX - rect.left);
            const y = Math.floor(e.clientY - rect.top);
            document.getElementById('mousePos').textContent = `位置: ${x}, ${y}`;
            document.getElementById('pixelCount').textContent = `像素数: ${this.pixelCount.toLocaleString()}`;
        });
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
        if (activeSwatch) {
            activeSwatch.classList.add('active');
        }
    }
    
    getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvasWidth / rect.width;
        const scaleY = this.canvasHeight / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const coords = this.getCanvasCoords(e);
        this.lastX = coords.x;
        this.lastY = coords.y;
        this.draw(e);
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const coords = this.getCanvasCoords(e);
        const x = coords.x;
        const y = coords.y;
        
        if (this.isEraser) {
            this.drawEraser(x, y);
        } else {
            this.drawSand(x, y);
        }
        
        this.lastX = x;
        this.lastY = y;
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    // ==================== 沙画绘制引擎 ====================
    
    drawSand(x, y) {
        switch (this.sandEffect) {
            case 'normal': this.drawNormalSand(x, y); break;
            case 'sparkle': this.drawSparkleSand(x, y); break;
            case 'rainbow': this.drawRainbowSand(x, y); break;
            case 'glow': this.drawGlowSand(x, y); break;
            case 'pixel': this.drawPixelSand(x, y); break;
            case 'watercolor': this.drawWatercolorSand(x, y); break;
        }
    }
    
    drawNormalSand(x, y) {
        const size = this.brushSize;
        const particleCount = Math.floor(size * 1.5);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * size;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            const particleSize = Math.random() * 2 + 0.5;
            const color = this.adjustColor(this.currentColor, Math.random() * 20 - 10);
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(px, py, particleSize, 0, Math.PI * 2);
            this.ctx.fill();
            this.pixelCount++;
        }
    }
    
    drawSparkleSand(x, y) {
        const size = this.brushSize;
        const particleCount = Math.floor(size * 2);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * size;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            const particleSize = Math.random() * 3 + 0.5;
            const color = this.adjustColor(this.currentColor, Math.random() * 30 - 15);
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(px, py, particleSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            if (Math.random() < 0.3) {
                const sparkleSize = particleSize * 2;
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.beginPath();
                this.ctx.arc(px, py, sparkleSize * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
                this.drawStar(px, py, sparkleSize, 'rgba(255, 255, 255, 0.6)');
            }
            this.pixelCount++;
        }
    }
    
    drawRainbowSand(x, y) {
        const size = this.brushSize;
        const particleCount = Math.floor(size * 2);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * size;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            const particleSize = Math.random() * 2.5 + 0.5;
            const hue = (this.hue + Math.random() * 60) % 360;
            const saturation = 70 + Math.random() * 30;
            const lightness = 50 + Math.random() * 20;
            
            this.ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            this.ctx.beginPath();
            this.ctx.arc(px, py, particleSize, 0, Math.PI * 2);
            this.ctx.fill();
            this.pixelCount++;
        }
        this.hue = (this.hue + 2) % 360;
    }
    
    drawGlowSand(x, y) {
        const size = this.brushSize;
        const particleCount = Math.floor(size * 1.5);
        
        for (let i = 0; i < particleCount / 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * size * 1.5;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            const gradient = this.ctx.createRadialGradient(px, py, 0, px, py, size * 0.8);
            gradient.addColorStop(0, this.currentColor + '60');
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(px, py, size * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * size;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            const particleSize = Math.random() * 2 + 0.5;
            
            this.ctx.fillStyle = this.currentColor;
            this.ctx.beginPath();
            this.ctx.arc(px, py, particleSize, 0, Math.PI * 2);
            this.ctx.fill();
            this.pixelCount++;
        }
    }
    
    drawPixelSand(x, y) {
        const size = this.brushSize;
        const gridSize = Math.max(4, Math.floor(size / 2));
        
        for (let gx = -size; gx <= size; gx += gridSize) {
            for (let gy = -size; gy <= size; gy += gridSize) {
                const dist = Math.sqrt(gx * gx + gy * gy);
                if (dist <= size && Math.random() < 0.7) {
                    const px = x + gx;
                    const py = y + gy;
                    const color = this.adjustColor(this.currentColor, Math.random() * 15 - 7);
                    
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(
                        Math.floor(px / gridSize) * gridSize,
                        Math.floor(py / gridSize) * gridSize,
                        gridSize - 1, gridSize - 1
                    );
                    this.pixelCount++;
                }
            }
        }
    }
    
    drawWatercolorSand(x, y) {
        const size = this.brushSize;
        
        for (let layer = 3; layer >= 0; layer--) {
            const layerSize = size + layer * 3;
            const particleCount = Math.floor(size * 0.8);
            const alpha = (0.15 - layer * 0.03) * 255;
            
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * layerSize;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                const particleSize = Math.random() * 4 + 1;
                
                this.ctx.fillStyle = this.currentColor + Math.floor(alpha).toString(16).padStart(2, '0');
                this.ctx.beginPath();
                this.ctx.arc(px, py, particleSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        const particleCount = Math.floor(size * 1.2);
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * size;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            const particleSize = Math.random() * 2 + 0.5;
            
            this.ctx.fillStyle = this.adjustColor(this.currentColor, Math.random() * 15 - 7);
            this.ctx.beginPath();
            this.ctx.arc(px, py, particleSize, 0, Math.PI * 2);
            this.ctx.fill();
            this.pixelCount++;
        }
    }
    
    drawEraser(x, y) {
        const size = this.brushSize * 2;
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
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
    
    // ==================== 颜色工具 ====================
    
    adjustColor(hex, amount) {
        const num = parseInt(hex.replace('#', ''), 16);
        let r = Math.min(255, Math.max(0, (num >> 16) + amount));
        let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // ==================== 画布操作 ====================
    
    clearCanvas() {
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.pixelCount = 0;
        document.getElementById('pixelCount').textContent = `像素数: ${this.pixelCount.toLocaleString()}`;
    }
    
    saveImage() {
        const link = document.createElement('a');
        link.download = `沙画作品_${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
    
    // ==================== 预设图案系统 ====================
    
    loadPreset(presetName) {
        this.clearCanvas();
        // 保存当前沙画效果设置
        const savedEffect = this.sandEffect;
        const savedSize = this.brushSize;
        const savedColor = this.currentColor;
        
        // 使用普通沙子效果绘制图案
        this.sandEffect = 'normal';
        
        switch (presetName) {
            case 'twilight': this.drawTwilightSparkle(); break;
            case 'rainbow': this.drawRainbowDash(); break;
            case 'pinkie': this.drawPinkiePie(); break;
            case 'rarity': this.drawRarity(); break;
            case 'flutter': this.drawFluttershy(); break;
            case 'apple': this.drawApplejack(); break;
        }
        
        // 恢复设置
        this.sandEffect = savedEffect;
        this.brushSize = savedSize;
        this.currentColor = savedColor;
    }
    
    // 绘制小马身体（使用填充形状而非沙画效果）
    drawPonyShape(cx, cy, bodyColor, shadowColor) {
        // 身体主体
        this.ctx.fillStyle = bodyColor;
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy, 55, 45, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 头部
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy - 50, 32, 30, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 身体阴影
        this.ctx.fillStyle = shadowColor;
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy + 8, 48, 38, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 腿
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
    
    // 绘制鬃毛
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
    
    // 绘制角
    drawHornShape(cx, cy, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 10, cy + 22);
        this.ctx.lineTo(cx, cy - 35);
        this.ctx.lineTo(cx + 10, cy + 22);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    // 绘制翅膀
    drawWingsShape(cx, cy, color) {
        this.ctx.fillStyle = color;
        // 左翅膀
        this.ctx.save();
        this.ctx.translate(cx - 45, cy - 25);
        this.ctx.rotate(-0.3);
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 38, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        // 右翅膀
        this.ctx.save();
        this.ctx.translate(cx + 45, cy - 25);
        this.ctx.rotate(0.3);
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 38, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    // 绘制眼睛
    drawEyesShape(leftX, leftY, rightX, rightY, irisColor) {
        // 左眼
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.ellipse(leftX, leftY, 13, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = irisColor;
        this.ctx.beginPath();
        this.ctx.ellipse(leftX + 2, leftY, 8, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.ellipse(leftX + 3, leftY, 5, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 高光
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.ellipse(leftX + 6, leftY - 4, 3, 3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 右眼
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.ellipse(rightX, rightY, 13, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = irisColor;
        this.ctx.beginPath();
        this.ctx.ellipse(rightX + 2, rightY, 8, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.ellipse(rightX + 3, rightY, 5, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.ellipse(rightX + 6, rightY - 4, 3, 3, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // 绘制可爱标记
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
                this.ctx.beginPath();
                this.ctx.ellipse(cx - 12, cy, 12, 10, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.ellipse(cx + 12, cy, 12, 10, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.ellipse(cx, cy - 10, 7, 7, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.ellipse(cx, cy + 10, 7, 7, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = colors[1];
                this.ctx.beginPath();
                this.ctx.ellipse(cx, cy, 4, 12, 0, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'apple':
                this.ctx.fillStyle = colors[0];
                this.ctx.beginPath();
                this.ctx.ellipse(cx, cy + 2, 14, 16, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = colors[1];
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
            if (i === 0) {
                this.ctx.moveTo(cx + Math.cos(angle) * size, cy + Math.sin(angle) * size);
            } else {
                this.ctx.lineTo(cx + Math.cos(angle) * size, cy + Math.sin(angle) * size);
            }
            this.ctx.lineTo(cx + Math.cos(nextAngle) * size * 0.4, cy + Math.sin(nextAngle) * size * 0.4);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    // 绘制彩虹尾巴
    drawRainbowTail(cx, cy) {
        const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
        colors.forEach((color, i) => {
            this.ctx.fillStyle = color;
            const angle = i * 0.4 - 0.5;
            this.ctx.beginPath();
            this.ctx.ellipse(
                cx + Math.cos(angle) * i * 10,
                cy + Math.sin(angle) * i * 6 + i * 12,
                14 - i, 17 - i,
                0, 0, Math.PI * 2
            );
            this.ctx.fill();
        });
    }
    
    // 绘制笑容
    drawSmileShape(cx, cy) {
        this.ctx.strokeStyle = '#ff1493';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 18, 0.2, Math.PI - 0.2);
        this.ctx.stroke();
        
        // 腮红
        this.ctx.fillStyle = '#ff85c2';
        this.ctx.beginPath();
        this.ctx.ellipse(cx - 28, cy + 8, 10, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(cx + 28, cy + 8, 10, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // 绘制帽子
    drawHatShape(cx, cy) {
        // 帽檐
        this.ctx.fillStyle = '#e67e22';
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy + 12, 45, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 帽身
        this.ctx.fillStyle = '#d35400';
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy - 6, 28, 22, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 带子
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy + 3, 29, 5, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // 添加装饰闪光
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
            
            // 星形闪光
            this.drawStar(x, y, size * 1.5, 'rgba(255, 255, 255, 0.5)');
        }
    }
    
    // 添加彩色纸屑
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
    
    // 添加蝴蝶
    addButterflies(cx, cy) {
        const colors = ['#ff69b4', '#f1c40f', '#3498db'];
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 60 + Math.random() * 100;
            this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            
            // 蝴蝶形状
            this.ctx.beginPath();
            this.ctx.ellipse(x - 10, y, 10, 7, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.ellipse(x + 10, y, 10, 7, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.ellipse(x, y - 6, 5, 5, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.ellipse(x, y + 6, 5, 5, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // ==================== 小马宝莉角色绘制 ====================
    
    // 紫悦 (Twilight Sparkle)
    drawTwilightSparkle() {
        const cx = this.canvasWidth / 2;
        const cy = this.canvasHeight / 2;
        
        this.drawPonyShape(cx, cy, '#9b59b6', '#8e44ad');
        this.drawManeShape(cx, cy - 50, ['#3498db', '#9b59b6', '#8e44ad'], 'twilight');
        this.drawCutieMarkShape(cx + 60, cy + 25, 'star', ['#9b59b6', '#3498db']);
        this.drawHornShape(cx, cy - 72, '#e8d5f5');
        this.drawEyesShape(cx - 16, cy - 28, cx + 16, cy - 28, '#3498db');
        this.addSparkles(cx, cy, 20, '#f1c40f');
    }
    
    // 云宝 (Rainbow Dash)
    drawRainbowDash() {
        const cx = this.canvasWidth / 2;
        const cy = this.canvasHeight / 2;
        
        this.drawPonyShape(cx, cy, '#3498db', '#2980b9');
        this.drawManeShape(cx, cy - 50, ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'], 'rainbow');
        this.drawCutieMarkShape(cx + 60, cy + 25, 'lightning', ['#3498db', '#ffffff']);
        this.drawWingsShape(cx, cy, '#ecf0f1');
        this.drawEyesShape(cx - 16, cy - 28, cx + 16, cy - 28, '#2c3e50');
        this.drawRainbowTail(cx + 65, cy + 35);
    }
    
    // 萍琪派 (Pinkie Pie)
    drawPinkiePie() {
        const cx = this.canvasWidth / 2;
        const cy = this.canvasHeight / 2;
        
        this.drawPonyShape(cx, cy, '#ff69b4', '#ff1493');
        this.drawManeShape(cx, cy - 50, ['#ff69b4', '#f1c40f', '#ff85c2'], 'pinkie');
        this.drawCutieMarkShape(cx + 60, cy + 25, 'balloon', ['#ff69b4', '#f1c40f']);
        this.drawEyesShape(cx - 16, cy - 28, cx + 16, cy - 28, '#8e44ad');
        this.drawSmileShape(cx, cy - 12);
        this.addConfetti(cx, cy);
    }
    
    // 珍奇 (Rarity)
    drawRarity() {
        const cx = this.canvasWidth / 2;
        const cy = this.canvasHeight / 2;
        
        this.drawPonyShape(cx, cy, '#ecf0f1', '#bdc3c7');
        this.drawManeShape(cx, cy - 50, ['#3498db', '#9b59b6', '#8e44ad', '#2980b9'], 'rarity');
        this.drawCutieMarkShape(cx + 60, cy + 25, 'diamond', ['#3498db', '#ecf0f1']);
        this.drawHornShape(cx, cy - 72, '#ecf0f1');
        this.drawEyesShape(cx - 16, cy - 28, cx + 16, cy - 28, '#3498db');
        this.addSparkles(cx, cy, 25, '#f1c40f');
    }
    
    // 柔柔 (Fluttershy)
    drawFluttershy() {
        const cx = this.canvasWidth / 2;
        const cy = this.canvasHeight / 2;
        
        this.drawPonyShape(cx, cy, '#f1c40f', '#f39c12');
        this.drawManeShape(cx, cy - 50, ['#ff69b4', '#ff85c2', '#ff1493'], 'fluttershy');
        this.drawCutieMarkShape(cx + 60, cy + 25, 'butterfly', ['#ff69b4', '#f1c40f']);
        this.drawWingsShape(cx, cy, '#f1c40f');
        this.drawEyesShape(cx - 16, cy - 28, cx + 16, cy - 28, '#8e44ad');
        this.addButterflies(cx, cy);
    }
    
    // 苹果嘉儿 (Applejack)
    drawApplejack() {
        const cx = this.canvasWidth / 2;
        const cy = this.canvasHeight / 2;
        
        this.drawPonyShape(cx, cy, '#e67e22', '#d35400');
        this.drawManeShape(cx, cy - 50, ['#f1c40f', '#f39c12', '#e67e22'], 'applejack');
        this.drawCutieMarkShape(cx + 60, cy + 25, 'apple', ['#e74c3c', '#2ecc71']);
        this.drawHatShape(cx, cy - 60);
        this.drawEyesShape(cx - 16, cy - 28, cx + 16, cy - 28, '#8e44ad');
    }
}

// ==================== 启动应用 ====================

document.addEventListener('DOMContentLoaded', () => {
    new SandArtApp();
});