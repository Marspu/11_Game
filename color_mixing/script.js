/**
 * 颜色魔法学院 - 儿童颜色混合实验室
 * 主要功能：
 * 1. 加色混合（RGB）- 光的混合
 * 2. 减色混合（CMY）- 颜料的混合
 * 3. 自定义颜色混合 - 任意三种颜色混合
 * 4. 交互式颜色轮
 * 5. 知识卡片
 * 6. 小测验游戏
 */

// ==================== 全局状态 ====================
const state = {
    currentMode: 'additive', // 'additive', 'subtractive', 或 'custom'
    colors: {
        additive: { red: 0, green: 0, blue: 0 },
        subtractive: { cyan: 0, magenta: 0, yellow: 0 }
    },
    custom: {
        colorCount: 2, // 2 或 3，表示混合的颜色数量
        colorA: '#ffff00',
        colorB: '#000000',
        colorC: '#ffffff',
        ratioA: 50,
        ratioB: 50,
        ratioC: 0,
        blendMode: 'average'
    },
    quiz: {
        currentQuestion: 0,
        score: 0,
        total: 0
    }
};

// ==================== 颜色数据 ====================
// 加色混合预设
const additivePresets = [
    { name: '红色', values: { red: 100, green: 0, blue: 0 }, color: '#ff0000' },
    { name: '绿色', values: { red: 0, green: 100, blue: 0 }, color: '#00ff00' },
    { name: '蓝色', values: { red: 0, green: 0, blue: 100 }, color: '#0000ff' },
    { name: '黄色', values: { red: 100, green: 100, blue: 0 }, color: '#ffff00' },
    { name: '青色', values: { red: 0, green: 100, blue: 100 }, color: '#00ffff' },
    { name: '品红', values: { red: 100, green: 0, blue: 100 }, color: '#ff00ff' },
    { name: '白色', values: { red: 100, green: 100, blue: 100 }, color: '#ffffff' },
    { name: '橙色', values: { red: 100, green: 50, blue: 0 }, color: '#ff8000' },
    { name: '粉色', values: { red: 100, green: 50, blue: 80 }, color: '#ff80c0' },
    { name: '紫色', values: { red: 50, green: 0, blue: 100 }, color: '#8000ff' }
];

// 减色混合预设
const subtractivePresets = [
    { name: '青色', values: { cyan: 100, magenta: 0, yellow: 0 }, color: '#00ffff' },
    { name: '品红', values: { cyan: 0, magenta: 100, yellow: 0 }, color: '#ff00ff' },
    { name: '黄色', values: { cyan: 0, magenta: 0, yellow: 100 }, color: '#ffff00' },
    { name: '红色', values: { cyan: 0, magenta: 100, yellow: 100 }, color: '#ff0000' },
    { name: '绿色', values: { cyan: 100, magenta: 0, yellow: 100 }, color: '#00ff00' },
    { name: '蓝色', values: { cyan: 100, magenta: 100, yellow: 0 }, color: '#0000ff' },
    { name: '黑色', values: { cyan: 100, magenta: 100, yellow: 100 }, color: '#000000' },
    { name: '橙色', values: { cyan: 0, magenta: 50, yellow: 100 }, color: '#ff8000' },
    { name: '棕色', values: { cyan: 30, magenta: 60, yellow: 80 }, color: '#804000' }
];

// 自定义混合预设（三种颜色组合）
const customPresets = [
    { 
        name: '黄 + 黑 + 白 = 米黄', 
        colorA: '#ffff00', colorB: '#000000', colorC: '#ffffff',
        ratioA: 60, ratioB: 20, ratioC: 20 
    },
    { 
        name: '红 + 白 + 黑 = 粉红', 
        colorA: '#ff0000', colorB: '#ffffff', colorC: '#000000',
        ratioA: 50, ratioB: 40, ratioC: 10 
    },
    { 
        name: '蓝 + 黄 + 白 = 浅绿', 
        colorA: '#0000ff', colorB: '#ffff00', colorC: '#ffffff',
        ratioA: 40, ratioB: 40, ratioC: 20 
    },
    { 
        name: '红 + 蓝 + 白 = 淡紫', 
        colorA: '#ff0000', colorB: '#0000ff', colorC: '#ffffff',
        ratioA: 40, ratioB: 40, ratioC: 20 
    },
    { 
        name: '橙 + 棕 + 黄 = 金棕', 
        colorA: '#ffa500', colorB: '#8b4513', colorC: '#ffff00',
        ratioA: 40, ratioB: 30, ratioC: 30 
    },
    { 
        name: '青 + 粉 + 白 = 淡紫红', 
        colorA: '#00ffff', colorB: '#ffc0cb', colorC: '#ffffff',
        ratioA: 40, ratioB: 40, ratioC: 20 
    },
    { 
        name: '绿 + 黄 + 白 = 嫩绿', 
        colorA: '#00ff00', colorB: '#ffff00', colorC: '#ffffff',
        ratioA: 40, ratioB: 40, ratioC: 20 
    },
    { 
        name: '红 + 黄 + 蓝 = 深灰', 
        colorA: '#ff0000', colorB: '#ffff00', colorC: '#0000ff',
        ratioA: 33, ratioB: 34, ratioC: 33 
    }
];

// 加色混合结果映射
const additiveColorNames = {
    '0,0,0': '黑色',
    '255,0,0': '红色',
    '0,255,0': '绿色',
    '0,0,255': '蓝色',
    '255,255,0': '黄色（红 + 绿）',
    '0,255,255': '青色（绿 + 蓝）',
    '255,0,255': '品红（红 + 蓝）',
    '255,255,255': '白色',
    '255,128,0': '橙色',
    '255,128,128': '粉色',
    '128,0,255': '紫色',
    '128,128,128': '灰色',
    '128,128,0': '橄榄色',
    '128,0,128': '深紫色',
    '0,128,128': '蓝绿色'
};

// 减色混合结果映射
const subtractiveColorNames = {
    '0,0,0': '白色（无颜料）',
    '255,0,0': '青色',
    '0,255,0': '品红',
    '0,0,255': '黄色',
    '0,255,255': '红色（品红 + 黄）',
    '255,0,255': '绿色（青 + 黄）',
    '255,255,0': '蓝色（青 + 品红）',
    '255,255,255': '黑色（全混合）',
    '0,128,128': '深红色',
    '128,0,128': '深绿色',
    '128,128,0': '深蓝色'
};

// 知识卡片内容
const additiveKnowledge = [
    {
        icon: '💡',
        title: '什么是加色混合？',
        content: '加色混合是指不同颜色的光叠加在一起时产生的混合效果。就像你用三个不同颜色的手电筒照在同一面墙上！'
    },
    {
        icon: '🔴🟢🔵',
        title: '三原色',
        content: '光的三原色是红色（Red）、绿色（Green）和蓝色（Blue）。这三种颜色的光可以混合出几乎所有其他颜色！'
    },
    {
        icon: '🌈',
        title: '有趣的发现',
        content: '红色光 + 绿色光 = 黄色光！这可能会让你惊讶，但在光的混合中，这是完全正确的！'
    },
    {
        icon: '⚪',
        title: '白光是怎么来的？',
        content: '当红、绿、蓝三种颜色的光都以最大强度混合时，就会产生白光！太阳光和白色 LED 灯都是这个原理。'
    },
    {
        icon: '📺',
        title: '生活中的应用',
        content: '电视、电脑和手机屏幕都使用 RGB 原理。每个像素点都有红、绿、蓝三个小灯，通过调节它们的亮度来显示各种颜色！'
    }
];

const subtractiveKnowledge = [
    {
        icon: '🎨',
        title: '什么是减色混合？',
        content: '减色混合是指颜料或染料混合时产生的效果。每种颜料会"减去"（吸收）某些颜色的光，反射其他颜色的光。'
    },
    {
        icon: '🟦🟪🟨',
        title: '颜料三原色',
        content: '颜料的三原色是青色（Cyan）、品红（Magenta）和黄色（Yellow）。这就是打印机使用的 CMY 颜色系统！'
    },
    {
        icon: '⚫',
        title: '为什么混合会变黑？',
        content: '当所有颜料混合在一起时，它们会吸收几乎所有的光，所以我们看到的是深色或黑色。这就是为什么把很多颜料混在一起会变脏变黑！'
    },
    {
        icon: '🖨️',
        title: 'CMYK 是什么？',
        content: '打印机使用 CMYK 系统：青色、品红、黄色和黑色（Key）。黑色墨水单独添加，因为混合三种颜色产生的黑色不够纯。'
    },
    {
        icon: '🎭',
        title: '颜料 vs 光',
        content: '颜料混合和光混合是相反的！比如：颜料中青色 + 品红=蓝色，而光中红色 + 绿色=黄色。'
    }
];

const customKnowledge = [
    {
        icon: '🧪',
        title: '自由混合实验室',
        content: '在这里你可以选择任意三种颜色进行混合！试试黄色、黑色和白色混合会变成什么颜色？'
    },
    {
        icon: '🎨',
        title: '三种颜色混合',
        content: '通过调节三种颜色的比例，你可以创造出无数种颜色！就像真正的画家调色一样。'
    },
    {
        icon: '🎚️',
        title: '混合比例',
        content: '拖动滑块可以改变每种颜色的比例。比例总和不需要是 100%，系统会自动计算相对权重。'
    },
    {
        icon: '🔄',
        title: '混合模式',
        content: '不同的混合模式会产生不同效果：平均混合是简单混合，正片叠底会变暗，滤色会变亮，叠加会增强对比。'
    },
    {
        icon: '🌈',
        title: '颜色公式',
        content: '记住一些基本公式：红 + 黄=橙，蓝 + 黄=绿，红 + 蓝=紫。用这些公式可以调出你想要的任何颜色！'
    }
];

// 测验题目
const additiveQuizzes = [
    {
        question: '红色光 + 绿色光 = ？',
        options: ['黄色', '蓝色', '紫色', '橙色'],
        correct: 0,
        explanation: '正确！红色光和绿色光混合会产生黄色光。'
    },
    {
        question: '哪种颜色不是光的三原色？',
        options: ['红色', '绿色', '黄色', '蓝色'],
        correct: 2,
        explanation: '对的！光的三原色是红、绿、蓝，黄色是由红光和绿光混合而成的。'
    },
    {
        question: '红 + 绿 + 蓝三束光全部混合会得到什么颜色？',
        options: ['黑色', '棕色', '白色', '灰色'],
        correct: 2,
        explanation: '正确！三种原色光全部混合会产生白光！'
    },
    {
        question: '绿色光 + 蓝色光 = ？',
        options: ['黄色', '青色', '品红', '橙色'],
        correct: 1,
        explanation: '对！绿光和蓝光混合产生青色光。'
    },
    {
        question: '手机屏幕使用哪种颜色系统？',
        options: ['CMY', 'RGB', 'RYB', 'HSV'],
        correct: 1,
        explanation: '正确！手机、电视等屏幕都使用 RGB（红绿蓝）系统。'
    }
];

const subtractiveQuizzes = [
    {
        question: '青色颜料 + 品红颜料 = ？',
        options: ['绿色', '红色', '蓝色', '紫色'],
        correct: 2,
        explanation: '正确！青色和品红颜料混合产生蓝色！'
    },
    {
        question: '哪种颜色不是颜料的三原色？',
        options: ['青色', '品红', '黄色', '红色'],
        correct: 3,
        explanation: '对的！颜料三原色是青、品红、黄，红色是由品红和黄色混合而成的。'
    },
    {
        question: '三种颜料全部混合会得到什么颜色？',
        options: ['白色', '亮色', '深色/黑色', '透明'],
        correct: 2,
        explanation: '正确！所有颜料混合会吸收大部分光，产生深色或黑色。'
    },
    {
        question: '品红颜料 + 黄色颜料 = ？',
        options: ['红色', '绿色', '蓝色', '青色'],
        correct: 0,
        explanation: '对！品红和黄色颜料混合产生红色！'
    },
    {
        question: '打印机使用哪种颜色系统？',
        options: ['RGB', 'CMYK', 'HSV', 'LAB'],
        correct: 1,
        explanation: '正确！打印机使用 CMYK（青、品红、黄、黑）系统。'
    }
];

const customQuizzes = [
    {
        question: '黄色 + 黑色会混合成什么颜色？',
        options: ['暗黄色', '绿色', '棕色', '灰色'],
        correct: 0,
        explanation: '正确！黄色加黑色会得到暗黄色或橄榄黄色。'
    },
    {
        question: '红色 + 白色会混合成什么颜色？',
        options: ['深红', '粉红', '橙色', '紫色'],
        correct: 1,
        explanation: '对！红色加白色会得到粉红色！'
    },
    {
        question: '蓝色 + 黄色混合会得到？',
        options: ['红色', '绿色', '紫色', '橙色'],
        correct: 1,
        explanation: '正确！蓝色和黄色混合会产生绿色！'
    },
    {
        question: '哪种混合会让颜色变暗？',
        options: ['加白色', '加黑色', '加黄色', '加粉色'],
        correct: 1,
        explanation: '对！加黑色会让颜色变暗，加白色会让颜色变浅。'
    },
    {
        question: '红色 + 蓝色混合会得到？',
        options: ['绿色', '橙色', '紫色', '棕色'],
        correct: 2,
        explanation: '正确！红色和蓝色混合会产生紫色！'
    }
];

// ==================== DOM 元素 ====================
const elements = {
    modeButtons: document.querySelectorAll('.mode-btn'),
    modeTitle: document.getElementById('mode-title'),
    modeDescription: document.getElementById('mode-description'),
    sliders: document.querySelectorAll('.color-slider'),
    sliderValues: {
        red: document.getElementById('red-value'),
        green: document.getElementById('green-value'),
        blue: document.getElementById('blue-value')
    },
    labels: {
        red: document.getElementById('red-label'),
        green: document.getElementById('green-label'),
        blue: document.getElementById('blue-label')
    },
    standardControls: document.getElementById('standard-controls'),
    customControls: document.getElementById('custom-controls'),
    customResultInfo: document.getElementById('custom-result-info'),
    presetSection: document.getElementById('preset-section'),
    colorWheelSection: document.getElementById('color-wheel-section'),
    knowledgeSection: document.getElementById('knowledge-section'),
    quizSection: document.getElementById('quiz-section'),
    // 自定义混合元素 - 三种颜色
    colorAPicker: document.getElementById('color-a-picker'),
    colorBPicker: document.getElementById('color-b-picker'),
    colorCPicker: document.getElementById('color-c-picker'),
    ratioASlider: document.getElementById('ratio-a-slider'),
    ratioBSlider: document.getElementById('ratio-b-slider'),
    ratioCSlider: document.getElementById('ratio-c-slider'),
    ratioAValue: document.getElementById('ratio-a-value'),
    ratioBValue: document.getElementById('ratio-b-value'),
    ratioCValue: document.getElementById('ratio-c-value'),
    colorAPreview: document.getElementById('color-a-preview'),
    colorBPreview: document.getElementById('color-b-preview'),
    colorCPreview: document.getElementById('color-c-preview'),
    hexADisplay: document.getElementById('hex-a-display'),
    hexBDisplay: document.getElementById('hex-b-display'),
    hexCDisplay: document.getElementById('hex-c-display'),
    formulaDotA: document.getElementById('formula-dot-a'),
    formulaDotB: document.getElementById('formula-dot-b'),
    formulaDotC: document.getElementById('formula-dot-c'),
    formulaResultDot: document.getElementById('formula-result-dot'),
    blendModeSelect: document.getElementById('blend-mode-select'),
    resultFormula: document.getElementById('result-formula'),
    colorValues: document.getElementById('color-values'),
    // 通用元素
    mixingCircle: document.getElementById('mixing-circle'),
    resultColorName: document.getElementById('result-color-name'),
    mixingResult: document.getElementById('mixing-result'),
    presetButtons: document.getElementById('preset-buttons'),
    colorWheel: document.getElementById('color-wheel'),
    colorLegend: document.getElementById('color-legend'),
    knowledgeCards: document.getElementById('knowledge-cards'),
    quizQuestion: document.getElementById('quiz-question'),
    quizOptions: document.getElementById('quiz-options'),
    quizFeedback: document.getElementById('quiz-feedback'),
    quizNextBtn: document.getElementById('quiz-next-btn'),
    quizScore: document.getElementById('quiz-score'),
    // 生活物品匹配元素
    realWorldMatch: document.getElementById('real-world-match'),
    matchEmoji: document.getElementById('match-emoji'),
    matchName: document.getElementById('match-name'),
    matchDescription: document.getElementById('match-description')
};

// ==================== 初始化 ====================
function init() {
    setupModeSwitching();
    setupSliders();
    setupCustomMixing();
    setupPresetButtons();
    drawColorWheel();
    renderLegend();
    renderKnowledgeCards();
    loadQuiz();
    updateDisplay();
}

// ==================== 模式切换 ====================
function setupModeSwitching() {
    elements.modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            if (mode === state.currentMode) return;
            
            state.currentMode = mode;
            
            // 更新按钮状态
            elements.modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新界面
            updateModeUI();
            
            // 根据模式显示/隐藏控制
            if (mode === 'custom') {
                elements.standardControls.classList.add('hidden');
                elements.customControls.classList.remove('hidden');
                elements.customResultInfo.classList.remove('hidden');
            } else {
                elements.standardControls.classList.remove('hidden');
                elements.customControls.classList.add('hidden');
                elements.customResultInfo.classList.add('hidden');
                
                // 重置滑块
                resetSliders();
            }
            
            // 更新预设按钮
            setupPresetButtons();
            
            // 更新颜色轮和图例
            if (mode !== 'custom') {
                elements.colorWheelSection.classList.remove('hidden');
                drawColorWheel();
                renderLegend();
            } else {
                elements.colorWheelSection.classList.add('hidden');
            }
            
            // 更新知识卡片
            renderKnowledgeCards();
            
            // 加载新测验
            loadQuiz();
            
            // 更新显示
            updateDisplay();
        });
    });
}

function updateModeUI() {
    const isAdditive = state.currentMode === 'additive';
    const isCustom = state.currentMode === 'custom';
    
    if (isCustom) {
        elements.modeTitle.textContent = '✨ 自由混合实验室';
        elements.modeDescription.textContent = '选择任意三种颜色，调节比例，创造属于你的独特颜色！';
        return;
    }
    
    elements.modeTitle.textContent = isAdditive ? '💡 光的魔法' : '🎨 颜料的魔法';
    elements.modeDescription.textContent = isAdditive 
        ? '当不同颜色的光叠加在一起时，会产生新的颜色！就像用手电筒做实验一样。'
        : '当不同颜料混合在一起时，会产生新的颜色！就像用水彩画画一样。';
    
    // 更新标签
    if (isAdditive) {
        elements.labels.red.textContent = '红光';
        elements.labels.green.textContent = '绿光';
        elements.labels.blue.textContent = '蓝光';
        document.querySelector('.color-dot.red').className = 'color-dot red';
        document.querySelector('.color-dot.green').className = 'color-dot green';
        document.querySelector('.color-dot.blue').className = 'color-dot blue';
    } else {
        elements.labels.red.textContent = '青色';
        elements.labels.green.textContent = '品红';
        elements.labels.blue.textContent = '黄色';
        document.querySelector('.color-dot.red').className = 'color-dot cyan';
        document.querySelector('.color-dot.green').className = 'color-dot magenta';
        document.querySelector('.color-dot.blue').className = 'color-dot yellow';
    }
    
    // 更新滑块渐变
    updateSliderGradients();
}

function updateSliderGradients() {
    const isAdditive = state.currentMode === 'additive';
    
    if (isAdditive) {
        elements.sliders[0].style.background = 'linear-gradient(to right, #000, #ff4757)';
        elements.sliders[1].style.background = 'linear-gradient(to right, #000, #2ed573)';
        elements.sliders[2].style.background = 'linear-gradient(to right, #000, #3742fa)';
    } else {
        elements.sliders[0].style.background = 'linear-gradient(to right, #fff, #00d2d3)';
        elements.sliders[1].style.background = 'linear-gradient(to right, #fff, #ff6b9d)';
        elements.sliders[2].style.background = 'linear-gradient(to right, #fff, #ffa502)';
    }
}

function resetSliders() {
    elements.sliders.forEach(slider => {
        slider.value = 0;
    });
    
    if (state.currentMode === 'additive') {
        state.colors.additive = { red: 0, green: 0, blue: 0 };
    } else {
        state.colors.subtractive = { cyan: 0, magenta: 0, yellow: 0 };
    }
    
    updateSliderValues();
}

// ==================== 滑块控制 ====================
function setupSliders() {
    elements.sliders.forEach(slider => {
        slider.addEventListener('input', handleSliderChange);
    });
}

function handleSliderChange(e) {
    const color = e.target.dataset.color;
    const value = parseInt(e.target.value);
    
    if (state.currentMode === 'additive') {
        state.colors.additive[color] = value;
    } else {
        const cmyMap = { red: 'cyan', green: 'magenta', blue: 'yellow' };
        state.colors.subtractive[cmyMap[color]] = value;
    }
    
    updateSliderValues();
    updateDisplay();
}

function updateSliderValues() {
    if (state.currentMode === 'additive') {
        elements.sliderValues.red.textContent = state.colors.additive.red + '%';
        elements.sliderValues.green.textContent = state.colors.additive.green + '%';
        elements.sliderValues.blue.textContent = state.colors.additive.blue + '%';
    } else {
        elements.sliderValues.red.textContent = state.colors.subtractive.cyan + '%';
        elements.sliderValues.green.textContent = state.colors.subtractive.magenta + '%';
        elements.sliderValues.blue.textContent = state.colors.subtractive.yellow + '%';
    }
}

// ==================== 自定义混合功能 - 支持两种或三种颜色 ====================
function setupCustomMixing() {
    // 颜色数量选择按钮
    document.querySelectorAll('.color-count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const count = parseInt(btn.dataset.count);
            if (count === state.custom.colorCount) return;
            
            state.custom.colorCount = count;
            
            // 更新按钮状态
            document.querySelectorAll('.color-count-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 显示/隐藏颜色 C
            const colorCGroup = document.getElementById('color-c-group');
            if (count === 3) {
                colorCGroup.classList.remove('hidden');
                // 设置为非零值以便混合
                if (state.custom.ratioC === 0) {
                    state.custom.ratioC = 33;
                    elements.ratioCSlider.value = 33;
                    elements.ratioCValue.textContent = '33%';
                }
            } else {
                colorCGroup.classList.add('hidden');
                state.custom.ratioC = 0;
                elements.ratioCSlider.value = 0;
                elements.ratioCValue.textContent = '0%';
            }
            
            updateCustomDisplay();
        });
    });
    
    // 颜色选择器 A
    elements.colorAPicker.addEventListener('input', (e) => {
        state.custom.colorA = e.target.value;
        elements.colorAPreview.style.background = e.target.value;
        elements.hexADisplay.textContent = e.target.value.toUpperCase();
        elements.formulaDotA.style.background = e.target.value;
        updateCustomDisplay();
    });
    
    // 颜色选择器 B
    elements.colorBPicker.addEventListener('input', (e) => {
        state.custom.colorB = e.target.value;
        elements.colorBPreview.style.background = e.target.value;
        elements.hexBDisplay.textContent = e.target.value.toUpperCase();
        elements.formulaDotB.style.background = e.target.value;
        updateCustomDisplay();
    });
    
    // 颜色选择器 C
    elements.colorCPicker.addEventListener('input', (e) => {
        state.custom.colorC = e.target.value;
        elements.colorCPreview.style.background = e.target.value;
        elements.hexCDisplay.textContent = e.target.value.toUpperCase();
        elements.formulaDotC.style.background = e.target.value;
        updateCustomDisplay();
    });
    
    // 比例滑块 A
    elements.ratioASlider.addEventListener('input', (e) => {
        state.custom.ratioA = parseInt(e.target.value);
        elements.ratioAValue.textContent = state.custom.ratioA + '%';
        updateCustomDisplay();
    });
    
    // 比例滑块 B
    elements.ratioBSlider.addEventListener('input', (e) => {
        state.custom.ratioB = parseInt(e.target.value);
        elements.ratioBValue.textContent = state.custom.ratioB + '%';
        updateCustomDisplay();
    });
    
    // 比例滑块 C
    elements.ratioCSlider.addEventListener('input', (e) => {
        state.custom.ratioC = parseInt(e.target.value);
        elements.ratioCValue.textContent = state.custom.ratioC + '%';
        updateCustomDisplay();
    });
    
    // 混合模式
    elements.blendModeSelect.addEventListener('change', (e) => {
        state.custom.blendMode = e.target.value;
        updateCustomDisplay();
    });
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function blendThreeColors(colorA, colorB, colorC, ratioA, ratioB, ratioC, blendMode) {
    const rgbA = hexToRgb(colorA);
    const rgbB = hexToRgb(colorB);
    const rgbC = hexToRgb(colorC);
    
    // 计算总比例用于归一化
    const totalRatio = ratioA + ratioB + ratioC;
    
    if (totalRatio === 0) {
        return { r: 0, g: 0, b: 0, hex: '#000000' };
    }
    
    // 归一化比例
    const normA = ratioA / totalRatio;
    const normB = ratioB / totalRatio;
    const normC = ratioC / totalRatio;
    
    let r, g, b;
    
    switch (blendMode) {
        case 'average':
            // 简单平均混合（按权重）
            r = rgbA.r * normA + rgbB.r * normB + rgbC.r * normC;
            g = rgbA.g * normA + rgbB.g * normB + rgbC.g * normC;
            b = rgbA.b * normA + rgbB.b * normB + rgbC.b * normC;
            break;
            
        case 'weighted':
            // 权重混合（与 average 相同，但保留扩展性）
            r = rgbA.r * normA + rgbB.r * normB + rgbC.r * normC;
            g = rgbA.g * normA + rgbB.g * normB + rgbC.g * normC;
            b = rgbA.b * normA + rgbB.b * normB + rgbC.b * normC;
            break;
            
        case 'multiply':
            // 正片叠底（变暗）- 三种颜色
            const multiplyR = (rgbA.r * rgbB.r * rgbC.r) / (255 * 255);
            const multiplyG = (rgbA.g * rgbB.g * rgbC.g) / (255 * 255);
            const multiplyB = (rgbA.b * rgbB.b * rgbC.b) / (255 * 255);
            r = multiplyR * normA + rgbA.r * normB + rgbA.r * normC;
            g = multiplyG * normA + rgbA.g * normB + rgbA.g * normC;
            b = multiplyB * normA + rgbA.b * normB + rgbA.b * normC;
            break;
            
        case 'screen':
            // 滤色（变亮）- 三种颜色
            const screenR = 255 - ((255 - rgbA.r) * (255 - rgbB.r) * (255 - rgbC.r)) / (255 * 255);
            const screenG = 255 - ((255 - rgbA.g) * (255 - rgbB.g) * (255 - rgbC.g)) / (255 * 255);
            const screenB = 255 - ((255 - rgbA.b) * (255 - rgbB.b) * (255 - rgbC.b)) / (255 * 255);
            r = screenR * normA + rgbA.r * normB + rgbA.r * normC;
            g = screenG * normA + rgbA.g * normB + rgbA.g * normC;
            b = screenB * normA + rgbA.b * normB + rgbA.b * normC;
            break;
            
        case 'overlay':
            // 叠加 - 先混合 A 和 B，再与 C 混合
            const overlayMixAB_r = rgbA.r < 128 
                ? (2 * rgbA.r * rgbB.r) / 255 
                : 255 - (2 * (255 - rgbA.r) * (255 - rgbB.r)) / 255;
            const overlayMixAB_g = rgbA.g < 128 
                ? (2 * rgbA.g * rgbB.g) / 255 
                : 255 - (2 * (255 - rgbA.g) * (255 - rgbB.g)) / 255;
            const overlayMixAB_b = rgbA.b < 128 
                ? (2 * rgbA.b * rgbB.b) / 255 
                : 255 - (2 * (255 - rgbA.b) * (255 - rgbB.b)) / 255;
            
            const overlayMixABC_r = overlayMixAB_r < 128 
                ? (2 * overlayMixAB_r * rgbC.r) / 255 
                : 255 - (2 * (255 - overlayMixAB_r) * (255 - rgbC.r)) / 255;
            const overlayMixABC_g = overlayMixAB_g < 128 
                ? (2 * overlayMixAB_g * rgbC.g) / 255 
                : 255 - (2 * (255 - overlayMixAB_g) * (255 - rgbC.g)) / 255;
            const overlayMixABC_b = overlayMixAB_b < 128 
                ? (2 * overlayMixAB_b * rgbC.b) / 255 
                : 255 - (2 * (255 - overlayMixAB_b) * (255 - rgbC.b)) / 255;
            
            r = overlayMixABC_r;
            g = overlayMixABC_g;
            b = overlayMixABC_b;
            break;
            
        default:
            r = rgbA.r * normA + rgbB.r * normB + rgbC.r * normC;
            g = rgbA.g * normA + rgbB.g * normB + rgbC.g * normC;
            b = rgbA.b * normA + rgbB.b * normB + rgbC.b * normC;
    }
    
    return { r, g, b, hex: rgbToHex(r, g, b) };
}

function updateCustomDisplay() {
    const { colorA, colorB, colorC, ratioA, ratioB, ratioC, blendMode } = state.custom;
    const result = blendThreeColors(colorA, colorB, colorC, ratioA, ratioB, ratioC, blendMode);
    const colorName = getColorName(result.r, result.g, result.b);
    
    elements.mixingCircle.style.background = result.hex;
    elements.resultColorName.textContent = colorName;
    elements.resultColorName.style.color = getContrastColor(result.r, result.g, result.b);
    
    // 更新公式显示
    const modeNames = {
        average: '平均混合',
        weighted: '权重混合',
        multiply: '正片叠底',
        screen: '滤色',
        overlay: '叠加'
    };
    
    elements.resultFormula.textContent = 
        `${colorA} (${ratioA}%) + ${colorB} (${ratioB}%) + ${colorC} (${ratioC}%) → ${colorName}`;
    elements.resultFormula.style.color = result.hex;
    elements.resultFormula.style.textShadow = '0 0 10px rgba(0,0,0,0.3)';
    
    elements.colorValues.innerHTML = `
        <div class="color-value-item">
            <span>RGB: (${Math.round(result.r)}, ${Math.round(result.g)}, ${Math.round(result.b)})</span>
        </div>
        <div class="color-value-item">
            <span class="hex-value">${result.hex.toUpperCase()}</span>
        </div>
        <div class="color-value-item">
            <span>模式：${modeNames[blendMode]}</span>
        </div>
    `;
    
    elements.mixingResult.textContent = `混合成了 ${colorName}！`;
    
    // 更新公式圆点
    elements.formulaDotA.style.background = colorA;
    elements.formulaDotB.style.background = colorB;
    elements.formulaDotC.style.background = colorC;
    elements.formulaResultDot.style.background = result.hex;
}

// ==================== 颜色计算 ====================
function calculateColor() {
    if (state.currentMode === 'additive') {
        const { red, green, blue } = state.colors.additive;
        const r = Math.round(red * 2.55);
        const g = Math.round(green * 2.55);
        const b = Math.round(blue * 2.55);
        return { r, g, b, hex: rgbToHex(r, g, b) };
    } else {
        const { cyan, magenta, yellow } = state.colors.subtractive;
        const r = Math.round(255 * (1 - cyan / 100));
        const g = Math.round(255 * (1 - magenta / 100));
        const b = Math.round(255 * (1 - yellow / 100));
        return { r, g, b, hex: rgbToHex(r, g, b) };
    }
}

function getColorName(r, g, b) {
    const key = `${Math.round(r)},${Math.round(g)},${Math.round(b)}`;
    
    if (state.currentMode === 'additive') {
        if (additiveColorNames[key]) return additiveColorNames[key];
        
        const tolerance = 30;
        for (const [rgbKey, name] of Object.entries(additiveColorNames)) {
            const [tr, tg, tb] = rgbKey.split(',').map(Number);
            if (Math.abs(r - tr) <= tolerance && 
                Math.abs(g - tg) <= tolerance && 
                Math.abs(b - tb) <= tolerance) {
                return name;
            }
        }
        
        return describeColor(r, g, b);
    } else if (state.currentMode === 'subtractive') {
        if (subtractiveColorNames[key]) return subtractiveColorNames[key];
        
        const tolerance = 30;
        for (const [rgbKey, name] of Object.entries(subtractiveColorNames)) {
            const [tr, tg, tb] = rgbKey.split(',').map(Number);
            if (Math.abs(r - tr) <= tolerance && 
                Math.abs(g - tg) <= tolerance && 
                Math.abs(b - tb) <= tolerance) {
                return name;
            }
        }
        
        return describeColor(r, g, b);
    } else {
        return describeColor(r, g, b);
    }
}

function describeColor(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if (max === min) {
        if (max < 50) return '深灰色';
        if (max > 200) return '浅灰色';
        return '灰色';
    }
    
    let hue;
    if (max === r) {
        hue = ((g - b) / (max - min)) * 60;
        if (hue < 0) hue += 360;
    } else if (max === g) {
        hue = ((b - r) / (max - min)) * 60 + 120;
    } else {
        hue = ((r - g) / (max - min)) * 60 + 240;
    }
    
    const saturation = max === 0 ? 0 : ((max - min) / max) * 100;
    const lightness = ((max + min) / 2) / 255 * 100;
    
    let colorName;
    if (hue < 15 || hue >= 345) colorName = '红色';
    else if (hue < 45) colorName = '橙色';
    else if (hue < 75) colorName = '黄色';
    else if (hue < 165) colorName = '绿色';
    else if (hue < 195) colorName = '青色';
    else if (hue < 255) colorName = '蓝色';
    else if (hue < 285) colorName = '紫色';
    else colorName = '品红';
    
    if (lightness < 30) return '深' + colorName;
    if (lightness > 70) return '浅' + colorName;
    if (saturation < 30) return '灰' + colorName;
    
    return colorName;
}

// ==================== 更新显示 ====================
function updateDisplay() {
    if (state.currentMode === 'custom') {
        updateCustomDisplay();
        return;
    }
    
    const color = calculateColor();
    const colorName = getColorName(color.r, color.g, color.b);
    
    elements.mixingCircle.style.background = color.hex;
    elements.resultColorName.textContent = colorName;
    elements.resultColorName.style.color = getContrastColor(color.r, color.g, color.b);
    
    const isAdditive = state.currentMode === 'additive';
    const values = isAdditive 
        ? state.colors.additive 
        : state.colors.subtractive;
    const valueList = Object.values(values);
    const allZero = valueList.every(v => v === 0);
    const allMax = valueList.every(v => v === 100);
    
    if (allZero) {
        elements.mixingResult.textContent = isAdditive 
            ? '没有光，所以是黑色的！' 
            : '没有颜料，所以是白色的！';
    } else if (allMax) {
        elements.mixingResult.textContent = isAdditive 
            ? '所有光都全开了！混合成了白色！' 
            : '所有颜料都混合了！变成了深色！';
    } else {
        const activeColors = Object.entries(values)
            .filter(([_, v]) => v > 0)
            .map(([name, v]) => {
                const cn = {
                    red: '红', green: '绿', blue: '蓝',
                    cyan: '青', magenta: '品红', yellow: '黄'
                }[name];
                return `${cn}(${v}%)`;
            })
            .join(' + ');
        elements.mixingResult.textContent = `${activeColors} = ${colorName}`;
    }
}

function getContrastColor(r, g, b) {
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000' : '#fff';
}

// ==================== 预设按钮 ====================
function setupPresetButtons() {
    let presets;
    if (state.currentMode === 'additive') {
        presets = additivePresets;
    } else if (state.currentMode === 'subtractive') {
        presets = subtractivePresets;
    } else {
        presets = customPresets;
    }
    
    elements.presetButtons.innerHTML = presets.map(preset => {
        if (state.currentMode === 'custom') {
            return `
                <button class="preset-btn" 
                        style="background: linear-gradient(135deg, ${preset.colorA}, ${preset.colorB}, ${preset.colorC})"
                        data-preset='custom-${preset.name}'
                        data-color-a="${preset.colorA}"
                        data-color-b="${preset.colorB}"
                        data-color-c="${preset.colorC}"
                        data-ratio-a="${preset.ratioA}"
                        data-ratio-b="${preset.ratioB}"
                        data-ratio-c="${preset.ratioC}">
                    ${preset.name}
                </button>
            `;
        } else {
            return `
                <button class="preset-btn" 
                        style="background: ${preset.color}"
                        data-values='${JSON.stringify(preset.values)}'>
                    ${preset.name}
                </button>
            `;
        }
    }).join('');
    
    elements.presetButtons.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (state.currentMode === 'custom') {
                const colorA = btn.dataset.colorA;
                const colorB = btn.dataset.colorB;
                const colorC = btn.dataset.colorC;
                const ratioA = parseInt(btn.dataset.ratioA);
                const ratioB = parseInt(btn.dataset.ratioB);
                const ratioC = parseInt(btn.dataset.ratioC);
                
                state.custom.colorA = colorA;
                state.custom.colorB = colorB;
                state.custom.colorC = colorC;
                state.custom.ratioA = ratioA;
                state.custom.ratioB = ratioB;
                state.custom.ratioC = ratioC;
                
                elements.colorAPicker.value = colorA;
                elements.colorBPicker.value = colorB;
                elements.colorCPicker.value = colorC;
                elements.ratioASlider.value = ratioA;
                elements.ratioBSlider.value = ratioB;
                elements.ratioCSlider.value = ratioC;
                elements.colorAPreview.style.background = colorA;
                elements.colorBPreview.style.background = colorB;
                elements.colorCPreview.style.background = colorC;
                elements.hexADisplay.textContent = colorA.toUpperCase();
                elements.hexBDisplay.textContent = colorB.toUpperCase();
                elements.hexCDisplay.textContent = colorC.toUpperCase();
                elements.ratioAValue.textContent = ratioA + '%';
                elements.ratioBValue.textContent = ratioB + '%';
                elements.ratioCValue.textContent = ratioC + '%';
                elements.formulaDotA.style.background = colorA;
                elements.formulaDotB.style.background = colorB;
                elements.formulaDotC.style.background = colorC;
                
                updateCustomDisplay();
            } else {
                const values = JSON.parse(btn.dataset.values);
                applyPreset(values);
            }
        });
    });
}

function applyPreset(values) {
    if (state.currentMode === 'additive') {
        state.colors.additive = { ...values };
        document.getElementById('red-slider').value = values.red;
        document.getElementById('green-slider').value = values.green;
        document.getElementById('blue-slider').value = values.blue;
    } else {
        state.colors.subtractive = { ...values };
        const cmyMap = { cyan: 'red', magenta: 'green', yellow: 'blue' };
        document.getElementById('red-slider').value = values.cyan || 0;
        document.getElementById('green-slider').value = values.magenta || 0;
        document.getElementById('blue-slider').value = values.yellow || 0;
    }
    
    updateSliderValues();
    updateDisplay();
}

// ==================== 颜色轮 ====================
function drawColorWheel() {
    if (state.currentMode === 'custom') return;
    
    const canvas = elements.colorWheel;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (state.currentMode === 'additive') {
        drawAdditiveColorWheel(ctx, centerX, centerY, radius);
    } else {
        drawSubtractiveColorWheel(ctx, centerX, centerY, radius);
    }
}

function drawAdditiveColorWheel(ctx, centerX, centerY, radius) {
    const colors = [
        { angle: 0, color: '#ff0000', name: '红' },
        { angle: 60, color: '#ffff00', name: '黄' },
        { angle: 120, color: '#00ff00', name: '绿' },
        { angle: 180, color: '#00ffff', name: '青' },
        { angle: 240, color: '#0000ff', name: '蓝' },
        { angle: 300, color: '#ff00ff', name: '品红' }
    ];
    
    for (let i = 0; i < 6; i++) {
        const startAngle = (colors[i].angle - 30) * Math.PI / 180;
        const endAngle = (colors[i].angle + 30) * Math.PI / 180;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, colors[i].color);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    colors.forEach(c => {
        const angle = c.angle * Math.PI / 180;
        const labelRadius = radius * 0.75;
        const x = centerX + Math.cos(angle) * labelRadius;
        const y = centerY + Math.sin(angle) * labelRadius;
        ctx.fillStyle = getContrastColorFromHex(c.color);
        ctx.fillText(c.name, x, y);
    });
}

function drawSubtractiveColorWheel(ctx, centerX, centerY, radius) {
    const colors = [
        { angle: 0, color: '#ffff00', name: '黄' },
        { angle: 60, color: '#ff0000', name: '红' },
        { angle: 120, color: '#ff00ff', name: '品红' },
        { angle: 180, color: '#0000ff', name: '蓝' },
        { angle: 240, color: '#00ffff', name: '青' },
        { angle: 300, color: '#00ff00', name: '绿' }
    ];
    
    for (let i = 0; i < 6; i++) {
        const startAngle = (colors[i].angle - 30) * Math.PI / 180;
        const endAngle = (colors[i].angle + 30) * Math.PI / 180;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, colors[i].color);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#333333';
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    colors.forEach(c => {
        const angle = c.angle * Math.PI / 180;
        const labelRadius = radius * 0.75;
        const x = centerX + Math.cos(angle) * labelRadius;
        const y = centerY + Math.sin(angle) * labelRadius;
        ctx.fillStyle = getContrastColorFromHex(c.color);
        ctx.fillText(c.name, x, y);
    });
}

function getContrastColorFromHex(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return getContrastColor(r, g, b);
}

// ==================== 图例 ====================
function renderLegend() {
    if (state.currentMode === 'custom') return;
    
    if (state.currentMode === 'additive') {
        elements.colorLegend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #ff0000"></div>
                <div>
                    <div class="legend-text">红色 (Red)</div>
                    <div class="legend-formula">原色</div>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #00ff00"></div>
                <div>
                    <div class="legend-text">绿色 (Green)</div>
                    <div class="legend-formula">原色</div>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #0000ff"></div>
                <div>
                    <div class="legend-text">蓝色 (Blue)</div>
                    <div class="legend-formula">原色</div>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ffff00"></div>
                <div>
                    <div class="legend-text">黄色</div>
                    <div class="legend-formula">红 + 绿</div>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #00ffff"></div>
                <div>
                    <div class="legend-text">青色</div>
                    <div class="legend-formula">绿 + 蓝</div>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ff00ff"></div>
                <div>
                    <div class="legend-text">品红色</div>
                    <div class="legend-formula">红 + 蓝</div>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ffffff; border: 1px solid #ddd"></div>
                <div>
                    <div class="legend-text">白色</div>
                    <div class="legend-formula">红 + 绿 + 蓝</div>
                </div>
            </div>
        `;
    } else {
        elements.colorLegend.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #00ffff"></div>
                <div>
                    <div class="legend-text">青色 (Cyan)</div>
                    <div class="legend-formula">原色</div>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ff00ff"></div>
                <div>
                    <div class="legend-text">品红 (Magenta)</div>
                    <div class="legend-formula">原色</div>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ffff00"></div>
                <div>
                    <div class="legend-text">黄色 (Yellow)</div>
                    <div class="legend-formula">原色</div>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ff0000"></div>
                <div>
                    <div class="legend-text">红色</div>
                    <div class="legend-formula">品红 + 黄</div>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #00ff00"></div>
                <div>
                    <div class="legend-text">绿色</div>
                    <div class="legend-formula">青 + 黄</div>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #0000ff"></div>
                <div>
                    <div class="legend-text">蓝色</div>
                    <div class="legend-formula">青 + 品红</div>
                </div>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #000000"></div>
                <div>
                    <div class="legend-text">黑色</div>
                    <div class="legend-formula">青 + 品红 + 黄</div>
                </div>
            </div>
        `;
    }
}

// ==================== 知识卡片 ====================
function renderKnowledgeCards() {
    let knowledge;
    if (state.currentMode === 'additive') {
        knowledge = additiveKnowledge;
    } else if (state.currentMode === 'subtractive') {
        knowledge = subtractiveKnowledge;
    } else {
        knowledge = customKnowledge;
    }
    
    elements.knowledgeCards.innerHTML = knowledge.map(card => `
        <div class="knowledge-card">
            <div class="icon">${card.icon}</div>
            <h4>${card.title}</h4>
            <p>${card.content}</p>
        </div>
    `).join('');
}

// ==================== 测验 ====================
function loadQuiz() {
    state.quiz.currentQuestion = 0;
    state.quiz.score = 0;
    state.quiz.total = 0;
    updateQuizScore();
    showQuizQuestion();
}

function showQuizQuestion() {
    let quizzes;
    if (state.currentMode === 'additive') {
        quizzes = additiveQuizzes;
    } else if (state.currentMode === 'subtractive') {
        quizzes = subtractiveQuizzes;
    } else {
        quizzes = customQuizzes;
    }
    
    const question = quizzes[state.quiz.currentQuestion % quizzes.length];
    
    elements.quizQuestion.textContent = question.question;
    elements.quizOptions.innerHTML = question.options.map((option, i) => `
        <div class="quiz-option" data-index="${i}">${option}</div>
    `).join('');
    
    elements.quizFeedback.className = 'quiz-feedback';
    elements.quizFeedback.textContent = '';
    elements.quizNextBtn.classList.add('hidden');
    
    elements.quizOptions.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', () => handleQuizAnswer(option, question));
    });
}

function handleQuizAnswer(selectedOption, question) {
    const selectedIndex = parseInt(selectedOption.dataset.index);
    const isCorrect = selectedIndex === question.correct;
    
    elements.quizOptions.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.add('disabled');
        if (parseInt(opt.dataset.index) === question.correct) {
            opt.classList.add('correct');
        } else if (opt === selectedOption && !isCorrect) {
            opt.classList.add('wrong');
        }
    });
    
    elements.quizFeedback.textContent = isCorrect ? '🎉 太棒了！答对了！' : '😅 哎呀，答错了。' + question.explanation;
    elements.quizFeedback.className = `quiz-feedback show ${isCorrect ? 'correct' : 'wrong'}`;
    
    state.quiz.total++;
    if (isCorrect) state.quiz.score++;
    updateQuizScore();
    
    elements.quizNextBtn.classList.remove('hidden');
}

function updateQuizScore() {
    elements.quizScore.textContent = `得分：${state.quiz.score} / ${state.quiz.total}`;
}

elements.quizNextBtn.addEventListener('click', () => {
    state.quiz.currentQuestion++;
    showQuizQuestion();
});

// ==================== 生活物品匹配数据库 ====================
// 按颜色范围匹配的生活物品
const realWorldColors = [
    // 红色系
    { r: 255, g: 0, b: 0, emoji: '🍎', name: '像红苹果一样红', description: '这是鲜艳的红色，就像成熟的苹果' },
    { r: 220, g: 20, b: 60, emoji: '🌹', name: '像玫瑰一样红', description: '这是深红色，就像盛开的红玫瑰' },
    { r: 255, g: 69, b: 0, emoji: '🦞', name: '像龙虾一样红', description: '这是橙红色，就像煮熟的龙虾' },
    
    // 橙色系
    { r: 255, g: 165, b: 0, emoji: '🍊', name: '像橙子一样橙', description: '这是温暖的橙色，就像新鲜的橙子' },
    { r: 255, g: 140, b: 0, emoji: '🦊', name: '像狐狸一样橙', description: '这是橙棕色，就像狐狸的毛皮' },
    
    // 黄色系
    { r: 255, g: 255, b: 0, emoji: '🌻', name: '像向日葵一样黄', description: '这是明亮的黄色，就像盛开的向日葵' },
    { r: 255, g: 215, b: 0, emoji: '🏆', name: '像奖杯一样金黄', description: '这是金黄色，象征胜利和荣耀' },
    { r: 255, g: 255, b: 100, emoji: '🐤', name: '像小鸡一样嫩黄', description: '这是淡黄色，就像刚出生的小鸡' },
    
    // 绿色系
    { r: 0, g: 255, b: 0, emoji: '🌿', name: '像嫩叶一样绿', description: '这是鲜绿色，就像春天的嫩叶' },
    { r: 34, g: 139, b: 34, emoji: '🌲', name: '像松树一样绿', description: '这是深绿色，就像常青的松树' },
    { r: 144, g: 238, b: 144, emoji: '🥬', name: '像生菜一样绿', description: '这是浅绿色，就像新鲜的生菜' },
    { r: 0, g: 128, b: 0, emoji: '🐢', name: '像乌龟一样绿', description: '这是橄榄绿，就像乌龟的外壳' },
    
    // 青色系
    { r: 0, g: 255, b: 255, emoji: '💎', name: '像宝石一样青', description: '这是青色，就像珍贵的蓝宝石' },
    { r: 64, g: 224, b: 208, emoji: '🏊', name: '像泳池一样青', description: '这是青绿色，就像清澈的泳池水' },
    
    // 蓝色系
    { r: 0, g: 0, b: 255, emoji: '💙', name: '像蓝宝石一样蓝', description: '这是纯蓝色，就像珍贵的蓝宝石' },
    { r: 30, g: 144, b: 255, emoji: '🦋', name: '像蝴蝶一样蓝', description: '这是天蓝色，就像美丽的蓝蝴蝶' },
    { r: 70, g: 130, b: 180, emoji: '🌊', name: '像海洋一样蓝', description: '这是钢蓝色，就像深邃的海洋' },
    { r: 100, g: 149, b: 237, emoji: '☁️', name: '像天空一样蓝', description: '这是矢车菊蓝，就像晴朗的天空' },
    
    // 紫色系
    { r: 128, g: 0, b: 128, emoji: '🍇', name: '像葡萄一样紫', description: '这是紫色，就像成熟的葡萄' },
    { r: 147, g: 112, b: 219, emoji: '🦄', name: '像独角兽一样紫', description: '这是淡紫色，充满梦幻色彩' },
    { r: 216, g: 191, b: 216, emoji: '🌸', name: '像樱花一样粉紫', description: '这是淡紫粉色，就像春天的樱花' },
    
    // 粉色系
    { r: 255, g: 192, b: 203, emoji: '🐷', name: '像小猪一样粉', description: '这是粉红色，就像可爱的小猪' },
    { r: 255, g: 105, b: 180, emoji: '🎀', name: '像丝带一样粉', description: '这是亮粉色，就像漂亮的丝带' },
    { r: 219, g: 112, b: 147, emoji: '🌺', name: '像木槿花一样粉', description: '这是淡紫红色，就像热带的花朵' },
    
    // 棕色系
    { r: 165, g: 42, b: 42, emoji: '🐻', name: '像棕熊一样棕', description: '这是棕色，就像强壮的棕熊' },
    { r: 210, g: 180, b: 140, emoji: '🥐', name: '像羊角包一样棕', description: '这是黄褐色，就像刚烤好的羊角包' },
    { r: 244, g: 164, b: 96, emoji: '🦌', name: '像小鹿一样棕', description: '这是沙棕色，就像可爱的小鹿' },
    
    // 黑白色系
    { r: 0, g: 0, b: 0, emoji: '🌑', name: '像夜空一样黑', description: '这是黑暗的颜色' },
    { r: 50, g: 50, b: 50, emoji: '⚫', name: '像煤炭一样黑', description: '这是深灰色，就像燃烧的煤炭' },
    { r: 128, g: 128, b: 128, emoji: '🐘', name: '像大象一样灰', description: '这是灰色，就像温和的大象' },
    { r: 192, g: 192, b: 192, emoji: '🐭', name: '像小老鼠一样灰', description: '这是银灰色，就像机灵的小老鼠' },
    { r: 211, g: 211, b: 211, emoji: '☁️', name: '像云朵一样白', description: '这是浅灰色，就像天空中的云朵' },
    { r: 240, g: 240, b: 240, emoji: '🕊️', name: '像鸽子一样白', description: '这是灰白色，就像和平的白鸽' },
    { r: 255, g: 255, b: 255, emoji: '❄️', name: '像雪花一样白', description: '这是纯白色，就像冬天的雪花' }
];

// 查找最接近的生活物品匹配
function findRealWorldMatch(r, g, b) {
    let closest = null;
    let minDistance = Infinity;
    
    for (const color of realWorldColors) {
        const distance = Math.sqrt(
            Math.pow(r - color.r, 2) +
            Math.pow(g - color.g, 2) +
            Math.pow(b - color.b, 2)
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            closest = color;
        }
    }
    
    // 如果距离太远，返回一个通用的描述
    if (minDistance > 100) {
        return {
            emoji: '🎨',
            name: '独特的颜色',
            description: '这是你创造的独特颜色！'
        };
    }
    
    return closest;
}

// 更新生活物品匹配显示
function updateRealWorldMatch(r, g, b) {
    const match = findRealWorldMatch(r, g, b);
    
    elements.matchEmoji.textContent = match.emoji;
    elements.matchName.textContent = match.name;
    elements.matchDescription.textContent = match.description;
}

// ==================== 更新显示（包含生活物品匹配） ====================
function updateDisplayWithMatch() {
    if (state.currentMode === 'custom') {
        updateCustomDisplay();
        return;
    }
    
    const color = calculateColor();
    const colorName = getColorName(color.r, color.g, color.b);
    
    elements.mixingCircle.style.background = color.hex;
    elements.resultColorName.textContent = colorName;
    elements.resultColorName.style.color = getContrastColor(color.r, color.g, color.b);
    
    // 更新生活物品匹配
    updateRealWorldMatch(color.r, color.g, color.b);
    
    const isAdditive = state.currentMode === 'additive';
    const values = isAdditive 
        ? state.colors.additive 
        : state.colors.subtractive;
    const valueList = Object.values(values);
    const allZero = valueList.every(v => v === 0);
    const allMax = valueList.every(v => v === 100);
    
    if (allZero) {
        elements.mixingResult.textContent = isAdditive 
            ? '没有光，所以是黑色的！' 
            : '没有颜料，所以是白色的！';
    } else if (allMax) {
        elements.mixingResult.textContent = isAdditive 
            ? '所有光都全开了！混合成了白色！' 
            : '所有颜料都混合了！变成了深色！';
    } else {
        const activeColors = Object.entries(values)
            .filter(([_, v]) => v > 0)
            .map(([name, v]) => {
                const cn = {
                    red: '红', green: '绿', blue: '蓝',
                    cyan: '青', magenta: '品红', yellow: '黄'
                }[name];
                return `${cn}(${v}%)`;
            })
            .join(' + ');
        elements.mixingResult.textContent = `${activeColors} = ${colorName}`;
    }
}

// 覆盖原有的 updateCustomDisplay 函数以包含生活物品匹配
const originalUpdateCustomDisplay = updateCustomDisplay;
updateCustomDisplay = function() {
    const { colorA, colorB, colorC, ratioA, ratioB, ratioC, blendMode } = state.custom;
    const result = blendThreeColors(colorA, colorB, colorC, ratioA, ratioB, ratioC, blendMode);
    const colorName = getColorName(result.r, result.g, result.b);
    
    elements.mixingCircle.style.background = result.hex;
    elements.resultColorName.textContent = colorName;
    elements.resultColorName.style.color = getContrastColor(result.r, result.g, result.b);
    
    // 更新公式显示
    const modeNames = {
        average: '平均混合',
        weighted: '权重混合',
        multiply: '正片叠底',
        screen: '滤色',
        overlay: '叠加'
    };
    
    elements.resultFormula.textContent = 
        `${colorA} (${ratioA}%) + ${colorB} (${ratioB}%) + ${colorC} (${ratioC}%) → ${colorName}`;
    elements.resultFormula.style.color = result.hex;
    elements.resultFormula.style.textShadow = '0 0 10px rgba(0,0,0,0.3)';
    
    elements.colorValues.innerHTML = `
        <div class="color-value-item">
            <span>RGB: (${Math.round(result.r)}, ${Math.round(result.g)}, ${Math.round(result.b)})</span>
        </div>
        <div class="color-value-item">
            <span class="hex-value">${result.hex.toUpperCase()}</span>
        </div>
        <div class="color-value-item">
            <span>模式：${modeNames[blendMode]}</span>
        </div>
    `;
    
    elements.mixingResult.textContent = `混合成了 ${colorName}！`;
    
    // 更新公式圆点
    elements.formulaDotA.style.background = colorA;
    elements.formulaDotB.style.background = colorB;
    elements.formulaDotC.style.background = colorC;
    elements.formulaResultDot.style.background = result.hex;
    
    // 更新生活物品匹配
    updateRealWorldMatch(result.r, result.g, result.b);
};

// 覆盖原有的 updateDisplay 函数
updateDisplay = updateDisplayWithMatch;

// ==================== 启动应用 ====================
document.addEventListener('DOMContentLoaded', init);
