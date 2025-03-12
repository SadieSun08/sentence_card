document.addEventListener('DOMContentLoaded', function() {
    const templateList = document.getElementById('templateList');
    const importButton = document.getElementById('importTemplate');
    const exportButton = document.getElementById('exportTemplate');

    // 预设模板数据
    const templates = [
        { name: '简约风格', theme: 'simple' },
        { name: '复古风格', theme: 'vintage' },
        { name: '现代风格', theme: 'modern' }
    ];

    // 加载预设模板
    templates.forEach((template, index) => {
        const li = document.createElement('li');
        li.className = 'template-item';
        li.textContent = template.name;
        li.dataset.index = index;
        li.addEventListener('click', function() {
            applyTemplate(template.styles);
        });
        templateList.appendChild(li);
    });

    // 导入模板功能
    importButton.addEventListener('click', function() {
        const importedTemplate = prompt('请输入模板JSON:');
        if (importedTemplate) {
            try {
                const template = JSON.parse(importedTemplate);
                applyTemplate(template.styles);
                alert('模板导入成功');
            } catch (e) {
                alert('模板格式错误');
            }
        }
    });

    // 导出模板功能
    exportButton.addEventListener('click', function() {
        const currentTemplate = {
            styles: {
                font: fontSelect.value,
                fontSize: fontSizeInput.value,
                fontColor: fontColorInput.value
            }
        };
        alert('导出模板JSON: ' + JSON.stringify(currentTemplate));
    });

    const backgroundColorInput = document.getElementById('backgroundColor');
    const backgroundImageInput = document.getElementById('backgroundImage');
    const backgroundColorLabel = document.getElementById('backgroundColorLabel');
    const backgroundImageLabel = document.getElementById('backgroundImageLabel');

    backgroundSelect.addEventListener('change', function() {
        const value = backgroundSelect.value;
        if (value === 'color' || value === 'gradient') {
            backgroundColorLabel.style.display = 'block';
            backgroundImageLabel.style.display = 'none';
        } else if (value === 'image' || value === 'custom') {
            backgroundColorLabel.style.display = 'none';
            backgroundImageLabel.style.display = 'block';
        } else {
            backgroundColorLabel.style.display = 'none';
            backgroundImageLabel.style.display = 'none';
        }
    });

    backgroundImageInput.addEventListener('change', function() {
        const file = backgroundImageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    const canvas = document.getElementById('cardCanvas');
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
            };
            reader.readAsDataURL(file);
        }
    });

    function updateCardPreview() {
        const canvas = document.getElementById('cardCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 应用背景颜色
        if (backgroundSelect.value === 'color' || backgroundSelect.value === 'gradient') {
            ctx.fillStyle = backgroundColorInput.value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 设置字体和对齐方式
        ctx.fillStyle = fontColorInput.value;
        ctx.font = `${fontSizeInput.value}px ${fontSelect.value}`;
        ctx.textAlign = textAlignSelect.value;

        // 处理长文本换行
        const text = document.getElementById('cardContent').innerText;
        const maxWidth = canvas.width - 20; // 留出边距
        const lineHeight = parseInt(fontSizeInput.value, 10) + 5;
        let y = 50; // 初始Y坐标
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, 10, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 10, y);
    }
});

// 生成金句卡片按钮逻辑
const generateButton = document.getElementById('generate');
generateButton.addEventListener('click', function() {
    chrome.storage.local.get('selectedText', function(data) {
        const cardContent = data.selectedText || '没有选中文字';
        const cardElement = document.getElementById('cardContent');
        cardElement.innerText = cardContent;
        cardElement.style.display = 'block'; // 确保卡片内容显示

        // 渲染卡片到 canvas
        const canvas = document.getElementById('cardCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f9f9f9'; // 背景颜色
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = fontColorInput.value; // 字体颜色
        ctx.font = `${fontSizeInput.value}px ${fontSelect.value}`;
        ctx.textAlign = textAlignSelect.value;
        ctx.fillText(cardContent, 10, 50);

        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'quote_card.png';
        link.href = canvas.toDataURL();
        link.textContent = '下载卡片';
        document.body.appendChild(link);
    });
});

// 样式定制逻辑
const backgroundSelect = document.getElementById('backgroundSelect');
const fontSelect = document.getElementById('fontSelect');
const fontSizeInput = document.getElementById('fontSize');
const fontColorInput = document.getElementById('fontColor');
const textAlignSelect = document.getElementById('textAlign');
const shadowEffectCheckbox = document.getElementById('shadowEffect');
const borderStyleInput = document.getElementById('borderStyle');
const watermarkInput = document.getElementById('watermark');

// 监听样式设置的变化，实时更新预览
function updateCardStyle() {
    updateCardPreview();
    console.log('更新卡片样式');
}

// 操作历史记录
const history = [];
let historyIndex = -1;

function saveHistory() {
    const state = {
        background: backgroundSelect.value,
        font: fontSelect.value,
        fontSize: fontSizeInput.value,
        fontColor: fontColorInput.value,
        textAlign: textAlignSelect.value,
        shadow: shadowEffectCheckbox.checked,
        border: borderStyleInput.value,
        watermark: watermarkInput.value
    };
    history.push(state);
    historyIndex++;
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        applyHistory(history[historyIndex]);
    }
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        applyHistory(history[historyIndex]);
    }
}

function applyHistory(state) {
    backgroundSelect.value = state.background;
    fontSelect.value = state.font;
    fontSizeInput.value = state.fontSize;
    fontColorInput.value = state.fontColor;
    textAlignSelect.value = state.textAlign;
    shadowEffectCheckbox.checked = state.shadow;
    borderStyleInput.value = state.border;
    watermarkInput.value = state.watermark;
    updateCardPreview();
}

// 快捷操作工具栏
const toolbar = document.createElement('div');
toolbar.innerHTML = `
    <button id="undo">撤销</button>
    <button id="redo">重做</button>
`;
document.body.insertBefore(toolbar, document.body.firstChild);

document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);

// 保存用户偏好设置
function savePreferences() {
    const preferences = {
        background: backgroundSelect.value,
        font: fontSelect.value,
        fontSize: fontSizeInput.value,
        fontColor: fontColorInput.value,
        textAlign: textAlignSelect.value,
        shadow: shadowEffectCheckbox.checked,
        border: borderStyleInput.value,
        watermark: watermarkInput.value
    };
    chrome.storage.local.set({ preferences });
}

// 加载用户偏好设置
chrome.storage.local.get('preferences', function(data) {
    if (data.preferences) {
        applyHistory(data.preferences);
    }
});

// 监听样式设置的变化，保存历史和偏好
[backgroundSelect, fontSelect, fontSizeInput, fontColorInput, textAlignSelect, shadowEffectCheckbox, borderStyleInput, watermarkInput].forEach(element => {
    element.addEventListener('change', () => {
        saveHistory();
        savePreferences();
        updateCardStyle();
    });
});

// 初始化
saveHistory();
updateCardPreview();

// 导出设置
const imageFormatSelect = document.getElementById('imageFormat');
const imageQualityInput = document.getElementById('imageQuality');
const exportWidthInput = document.getElementById('exportWidth');
const exportHeightInput = document.getElementById('exportHeight');
const exportButton = document.getElementById('exportImages');

exportButton.addEventListener('click', function() {
    const format = imageFormatSelect.value;
    const quality = parseFloat(imageQualityInput.value);
    const width = parseInt(exportWidthInput.value, 10);
    const height = parseInt(exportHeightInput.value, 10);

    // 批量导出逻辑
    exportCardImages(format, quality, width, height);
});

function exportCardImages(format, quality, width, height) {
    const canvas = document.getElementById('cardCanvas');
    const ctx = canvas.getContext('2d');

    // 设置导出尺寸
    canvas.width = width;
    canvas.height = height;

    // 应用背景颜色
    if (backgroundSelect.value === 'color' || backgroundSelect.value === 'gradient') {
        ctx.fillStyle = backgroundColorInput.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 设置字体和对齐方式
    ctx.fillStyle = fontColorInput.value;
    ctx.font = `${fontSizeInput.value}px ${fontSelect.value}`;
    ctx.textAlign = textAlignSelect.value;

    // 处理长文本换行
    const text = document.getElementById('cardContent').innerText;
    const maxWidth = canvas.width - 20; // 留出边距
    const lineHeight = parseInt(fontSizeInput.value, 10) + 5;
    let y = 50; // 初始Y坐标
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, 10, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, 10, y);

    // 导出图片
    const dataURL = canvas.toDataURL(`image/${format}`, quality);
    const link = document.createElement('a');
    link.download = `quote_card.${format}`;
    link.href = dataURL;
    link.click();
}

function applyTemplate(styles) {
    fontSelect.value = styles.font;
    fontSizeInput.value = styles.fontSize;
    fontColorInput.value = styles.fontColor;
    updateCardPreview();
} 