import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './HanziWorksheetGenerator.css';

/**
 * 汉字字帖生成器
 * 功能：输入汉字，自动生成可打印的田字格/米字格练习字帖
 */

// 内置简易拼音映射表（后续可替换为专业拼音库）
const PINYIN_MAP = {
  '你': 'nǐ', '好': 'hǎo', '我': 'wǒ', '是': 'shì', '的': 'de',
  '不': 'bù', '了': 'le', '在': 'zài', '人': 'rén', '有': 'yǒu',
  '中': 'zhōng', '国': 'guó', '学': 'xué', '生': 'shēng', '老': 'lǎo',
  '师': 'shī', '春': 'chūn', '眠': 'mián', '觉': 'jué', '晓': 'xiǎo',
  '处': 'chù', '闻': 'wén', '啼': 'tí', '鸟': 'niǎo', '天': 'tiān',
  '气': 'qì', '今': 'jīn', '明': 'míng', '日': 'rì', '月': 'yuè',
  '水': 'shuǐ', '火': 'huǒ', '山': 'shān', '口': 'kǒu', '大': 'dà',
  '小': 'xiǎo', '多': 'duō', '少': 'shǎo', '上': 'shàng', '下': 'xià',
  '左': 'zuǒ', '右': 'yòu', '吃': 'chī', '喝': 'hē', '看': 'kàn',
  '说': 'shuō', '听': 'tīng', '写': 'xiě', '读': 'dú', '家': 'jiā',
  '校': 'xiào', '朋': 'péng', '友': 'yǒu', '苹': 'píng', '果': 'guǒ',
  '香': 'xiāng', '蕉': 'jiāo', '橘': 'jú', '子': 'zi', '东': 'dōng',
  '西': 'xī', '南': 'nán', '北': 'běi', '前': 'qián', '后': 'hòu',
  '来': 'lái', '去': 'qù', '高': 'gāo', '矮': 'ǎi', '长': 'cháng',
  '短': 'duǎn', '远': 'yuǎn', '近': 'jìn', '快': 'kuài', '慢': 'màn',
  '白': 'bái', '黑': 'hēi', '红': 'hóng', '黄': 'huáng', '蓝': 'lán',
  '绿': 'lǜ', '青': 'qīng', '紫': 'zǐ', '花': 'huā', '草': 'cǎo',
  '树': 'shù', '叶': 'yè', '根': 'gēn', '土': 'tǔ', '风': 'fēng',
  '雨': 'yǔ', '雪': 'xuě', '云': 'yún', '星': 'xīng', '阳': 'yáng',
  '地': 'dì', '海': 'hǎi', '河': 'hé', '湖': 'hú', '江': 'jiāng',
  '男': 'nán', '女': 'nǚ', '爸': 'bà', '妈': 'mā', '哥': 'gē',
  '姐': 'jiě', '弟': 'dì', '妹': 'mèi', '爷': 'yé', '奶': 'nǎi',
  '叔': 'shū', '姨': 'yí', '书': 'shū', '本': 'běn', '笔': 'bǐ',
  '纸': 'zhǐ', '桌': 'zhuō', '椅': 'yǐ', '床': 'chuáng', '门': 'mén',
  '窗': 'chuāng', '房': 'fáng', '屋': 'wū', '车': 'chē', '路': 'lù',
  '桥': 'qiáo', '船': 'chuán', '飞': 'fēi', '机': 'jī', '走': 'zǒu',
  '跑': 'pǎo', '跳': 'tiào', '站': 'zhàn', '坐': 'zuò', '睡': 'shuì',
  '醒': 'xǐng', '爱': 'ài', '想': 'xiǎng', '思': 'sī', '念': 'niàn',
  '记': 'jì', '忘': 'wàng', '会': 'huì', '能': 'néng', '可': 'kě',
  '要': 'yào', '得': 'dé', '把': 'bǎ', '被': 'bèi', '让': 'ràng',
  '给': 'gěi', '对': 'duì', '错': 'cuò', '真': 'zhēn', '假': 'jiǎ',
  '新': 'xīn', '旧': 'jiù', '忙': 'máng', '闲': 'xián', '难': 'nán',
  '易': 'yì', '重': 'zhòng', '轻': 'qīng', '冷': 'lěng', '热': 'rè',
  '温': 'wēn', '凉': 'liáng', '酸': 'suān', '甜': 'tián', '苦': 'kǔ',
  '辣': 'là', '咸': 'xián', '淡': 'dàn', '坏': 'huài', '美': 'měi',
  '丑': 'chǒu', '胖': 'pàng', '瘦': 'shòu', '年': 'nián', '岁': 'suì',
  '夏': 'xià', '秋': 'qiū', '冬': 'dōng', '早': 'zǎo', '晚': 'wǎn',
  '午': 'wǔ', '时': 'shí', '分': 'fēn', '秒': 'miǎo', '刻': 'kè',
  '点': 'diǎn', '半': 'bàn', '一': 'yī', '二': 'èr', '三': 'sān',
  '四': 'sì', '五': 'wǔ', '六': 'liù', '七': 'qī', '八': 'bā',
  '九': 'jiǔ', '十': 'shí', '百': 'bǎi', '千': 'qiān', '万': 'wàn',
  '零': 'líng', '第': 'dì', '谁': 'shuí', '什': 'shén', '么': 'me',
  '怎': 'zěn', '吗': 'ma', '呢': 'ne', '吧': 'ba', '啊': 'a',
  '哦': 'ó', '呀': 'ya', '哪': 'nǎ', '几': 'jǐ', '很': 'hěn',
  '更': 'gèng', '最': 'zuì', '还': 'hái', '也': 'yě', '都': 'dōu',
  '只': 'zhǐ', '就': 'jiù', '才': 'cái', '又': 'yòu', '已': 'yǐ',
  '正': 'zhèng', '刚': 'gāng', '将': 'jiāng', '常': 'cháng', '往': 'wǎng',
  '从': 'cóng', '向': 'xiàng', '到': 'dào', '过': 'guò', '出': 'chū',
  '入': 'rù', '回': 'huí', '进': 'jìn', '退': 'tuì', '开': 'kāi',
  '关': 'guān', '始': 'shǐ', '终': 'zhōng', '总': 'zǒng', '先': 'xiān',
  '次': 'cì', '每': 'měi', '各': 'gè', '别': 'bié'
};

/**
 * 获取汉字拼音（后续可替换为专业拼音库）
 */
function getPinyin(char) {
  return PINYIN_MAP[char] || '';
}

/**
 * 提取中文汉字
 */
function extractChineseCharacters(text) {
  return text.match(/[一-鿿]/g) || [];
}

function HanziWorksheetGenerator() {
  // 设置状态
  const [content, setContent] = useState('春眠不觉晓\n处处闻啼鸟');
  const [gridType, setGridType] = useState('mi'); // mi, tian, square, none
  const [cellsPerRow, setCellsPerRow] = useState(10);
  const [tracingCopies, setTracingCopies] = useState(2);
  const [opacity, setOpacity] = useState(0.35);
  const [fontSize, setFontSize] = useState(42);
  const [textColor, setTextColor] = useState('#000000');
  const [gridColor, setGridColor] = useState('#222222');
  const [showPinyin, setShowPinyin] = useState(true);
  const [showStrokeAnimation, setShowStrokeAnimation] = useState(false);
  const [hiddenStrokeRatio, setHiddenStrokeRatio] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const worksheetRef = useRef(null);

  // 提取汉字
  const characters = useMemo(() => extractChineseCharacters(content), [content]);

  // 生成练习行
  const generateRows = useCallback(() => {
    return characters.map(char => ({
      char,
      pinyin: showPinyin ? getPinyin(char) : ''
    }));
  }, [characters, showPinyin]);

  const rows = useMemo(() => generateRows(), [generateRows]);

  // 依据格子尺寸计算分页，保证内容不会压到页脚或超出 A4 页面。
  const cellSize = Math.floor(700 / cellsPerRow);
  const rowsPerPage = Math.max(1, Math.floor(820 / (cellSize + 8)));
  const pages = useMemo(() => {
    const result = [];
    for (let index = 0; index < rows.length; index += rowsPerPage) {
      result.push(rows.slice(index, index + rowsPerPage));
    }
    return result.length ? result : [[]];
  }, [rows, rowsPerPage]);

  // 获取汉字数量
  const charCount = characters.length;

  // 重置设置
  const resetSettings = () => {
    setContent('');
    setGridType('mi');
    setCellsPerRow(10);
    setTracingCopies(2);
    setOpacity(0.35);
    setFontSize(42);
    setTextColor('#000000');
    setGridColor('#222222');
    setShowPinyin(true);
    setShowStrokeAnimation(false);
    setHiddenStrokeRatio(0);
    setSelectedCharacter(null);
  };

  // 打印
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // 导出PDF（使用html2canvas + jspdf）
  const exportPDF = useCallback(async () => {
    if (!worksheetRef.current) return;

    // 动态导入库
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const pages = worksheetRef.current.querySelectorAll('.worksheet-page');
      const pdf = new jsPDF('p', 'mm', 'a4');

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save('hanzi-worksheet.pdf');
    } catch (error) {
      console.error('PDF导出失败:', error);
      alert('PDF导出失败，请确保已安装 html2canvas 和 jspdf');
    }
  }, []);

  // 渲染格子
  const renderGridCell = (type, size) => {
    const cellStyle = {
      width: `${size}px`,
      height: `${size}px`,
      borderColor: gridColor
    };

    switch (type) {
      case 'mi':
        return (
          <svg width={size} height={size} className="grid-svg">
            {/* 外框 */}
            <rect x="0" y="0" width={size} height={size} fill="none" stroke={gridColor} strokeWidth="1" />
            {/* 横中线 */}
            <line x1="0" y1={size / 2} x2={size} y2={size / 2} stroke={gridColor} strokeWidth="0.5" />
            {/* 竖中线 */}
            <line x1={size / 2} y1="0" x2={size / 2} y2={size} stroke={gridColor} strokeWidth="0.5" />
            {/* 对角线1 */}
            <line x1="0" y1="0" x2={size} y2={size} stroke={gridColor} strokeWidth="0.5" />
            {/* 对角线2 */}
            <line x1={size} y1="0" x2="0" y2={size} stroke={gridColor} strokeWidth="0.5" />
          </svg>
        );
      case 'tian':
        return (
          <svg width={size} height={size} className="grid-svg">
            {/* 外框 */}
            <rect x="0" y="0" width={size} height={size} fill="none" stroke={gridColor} strokeWidth="1" />
            {/* 横中线 */}
            <line x1="0" y1={size / 2} x2={size} y2={size / 2} stroke={gridColor} strokeWidth="0.5" />
            {/* 竖中线 */}
            <line x1={size / 2} y1="0" x2={size / 2} y2={size} stroke={gridColor} strokeWidth="0.5" />
          </svg>
        );
      case 'square':
        return (
          <svg width={size} height={size} className="grid-svg">
            <rect x="0" y="0" width={size} height={size} fill="none" stroke={gridColor} strokeWidth="1" />
          </svg>
        );
      case 'none':
        return <div className="grid-cell-none"></div>;
      default:
        return null;
    }
  };

  // 渲染描红字（带随机隐藏笔画效果）
  const renderTracingChar = (char, size) => {
    const charStyle = {
      fontSize: `${size * 0.85}px`,
      color: textColor,
      opacity: opacity,
      lineHeight: 1
    };

    // 如果有隐藏比例，添加遮挡效果
    if (hiddenStrokeRatio > 0) {
      const obstacles = [];
      const numObstacles = Math.ceil(hiddenStrokeRatio / 10); // 每10%一个遮挡块

      for (let i = 0; i < numObstacles; i++) {
        const left = Math.random() * 60 + 15;
        const top = Math.random() * 60 + 15;
        const width = Math.random() * 15 + 10;
        const height = Math.random() * 15 + 10;
        obstacles.push({ left, top, width, height });
      }

      return (
        <div className="tracing-char-container" style={{ width: size, height: size }}>
          <span style={charStyle}>{char}</span>
          <div className="stroke-obstacles">
            {obstacles.map((obs, i) => (
              <div
                key={i}
                className="stroke-obstacle"
                style={{
                  left: `${obs.left}%`,
                  top: `${obs.top}%`,
                  width: `${obs.width}%`,
                  height: `${obs.height}%`
                }}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="tracing-char-container" style={{ width: size, height: size }}>
        <span style={charStyle}>{char}</span>
      </div>
    );
  };

  // 笔顺动画
  const renderStrokeAnimation = () => {
    if (!selectedCharacter || !showStrokeAnimation) return null;

    return (
      <div className="stroke-animation-panel">
        <div className="stroke-animation-header">
          <span>笔顺演示：{selectedCharacter}</span>
          <span className="stroke-hint">（简化版动画占位）</span>
        </div>
        <div className="stroke-animation-demo" style={{ fontSize: '120px', color: textColor }}>
          {selectedCharacter}
        </div>
        <div className="stroke-animation-controls">
          <button className="btn-stroke-play">▶ 播放笔顺</button>
        </div>
        <p className="stroke-note">
          💡 提示：后续可接入 Hanzi Writer 实现真实笔顺动画
        </p>
      </div>
    );
  };

  // 返回设置（通过App状态控制，这里简单返回）
  const handleBack = () => {
    // 这个组件不管理返回逻辑，由父组件App控制
    window.history.back();
  };

  return (
    <div className="hanzi-worksheet-generator">
      {/* 左侧设置面板 */}
      <div className="worksheet-settings">
        <div className="settings-header">
          <h2 className="settings-title">📝 汉字字帖生成器</h2>
          <p className="settings-description">
            输入汉字，自动生成可打印的田字格/米字格练习字帖
          </p>
        </div>

        <div className="settings-form">
          {/* 内容输入 */}
          <div className="form-group">
            <label className="form-label">汉字内容</label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入要练习的汉字或句子，例如：\n春眠不觉晓\n处处闻啼鸟"
              rows={6}
            />
            <div className="form-info">
              <span className="char-count">汉字数量：{charCount}</span>
            </div>
          </div>

          {/* 格子类型 */}
          <div className="form-group">
            <label className="form-label">格子类型</label>
            <div className="radio-group">
              {[
                { value: 'mi', label: '米字格' },
                { value: 'tian', label: '田字格' },
                { value: 'square', label: '方格' },
                { value: 'none', label: '无格线' }
              ].map(opt => (
                <label key={opt.value} className="radio-label">
                  <input
                    type="radio"
                    name="gridType"
                    value={opt.value}
                    checked={gridType === opt.value}
                    onChange={(e) => setGridType(e.target.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 每行格子数量 */}
          <div className="form-group">
            <label className="form-label">每行格子：{cellsPerRow}</label>
            <input
              type="range"
              min={6}
              max={14}
              value={cellsPerRow}
              onChange={(e) => setCellsPerRow(Number(e.target.value))}
              className="form-slider"
            />
            <div className="slider-labels">
              <span>6</span>
              <span>14</span>
            </div>
          </div>

          {/* 描红数量 */}
          <div className="form-group">
            <label className="form-label">描红数量：{tracingCopies}</label>
            <input
              type="range"
              min={0}
              max={Math.min(10, cellsPerRow)}
              value={tracingCopies}
              onChange={(e) => setTracingCopies(Number(e.target.value))}
              className="form-slider"
            />
            <div className="slider-labels">
              <span>0</span>
              <span>{Math.min(10, cellsPerRow)}</span>
            </div>
          </div>

          {/* 描红透明度 */}
          <div className="form-group">
            <label className="form-label">描红透明度：{Math.round(opacity * 100)}%</label>
            <input
              type="range"
              min={10}
              max={100}
              value={Math.round(opacity * 100)}
              onChange={(e) => setOpacity(Number(e.target.value) / 100)}
              className="form-slider"
            />
            <div className="slider-labels">
              <span>浅</span>
              <span>深</span>
            </div>
          </div>

          {/* 字体大小 */}
          <div className="form-group">
            <label className="form-label">字体大小：{fontSize}px</label>
            <input
              type="range"
              min={24}
              max={72}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="form-slider"
            />
            <div className="slider-labels">
              <span>24</span>
              <span>72</span>
            </div>
          </div>

          {/* 文字颜色 */}
          <div className="form-group">
            <label className="form-label">文字颜色</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="form-color"
              />
              <span className="color-value">{textColor}</span>
            </div>
          </div>

          {/* 格线颜色 */}
          <div className="form-group">
            <label className="form-label">格线颜色</label>
            <div className="color-input-wrapper">
              <input
                type="color"
                value={gridColor}
                onChange={(e) => setGridColor(e.target.value)}
                className="form-color"
              />
              <span className="color-value">{gridColor}</span>
            </div>
          </div>

          {/* 显示拼音 */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showPinyin}
                onChange={(e) => setShowPinyin(e.target.checked)}
              />
              <span>显示拼音</span>
            </label>
            <p className="form-hint">自动拼音可能存在多音字误差，后续可手动校正</p>
          </div>

          {/* 笔顺动画 */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showStrokeAnimation}
                onChange={(e) => setShowStrokeAnimation(e.target.checked)}
              />
              <span>笔顺动画演示</span>
            </label>
            <p className="form-hint">点击预览中的汉字可查看笔顺演示</p>
          </div>

          {/* 隐藏笔画比例 */}
          <div className="form-group">
            <label className="form-label">隐藏笔画比例：{hiddenStrokeRatio}%</label>
            <input
              type="range"
              min={0}
              max={80}
              value={hiddenStrokeRatio}
              onChange={(e) => setHiddenStrokeRatio(Number(e.target.value))}
              className="form-slider"
            />
            <div className="slider-labels">
              <span>0%</span>
              <span>80%</span>
            </div>
            <p className="form-hint">用于记忆测试，遮挡部分笔画</p>
          </div>

          {/* 按钮组 */}
          <div className="form-buttons">
            <button className="btn-reset" onClick={resetSettings}>
              🔄 重置
            </button>
            <button className="btn-print" onClick={handlePrint}>
              🖨 打印
            </button>
            <button className="btn-pdf" onClick={exportPDF}>
              📄 导出PDF
            </button>
          </div>
        </div>

        {/* 笔顺动画区域 */}
        {renderStrokeAnimation()}
      </div>

      {/* 右侧预览区域 */}
      <div className="worksheet-preview">
        <div className="preview-header">
          <h3>📄 字帖预览</h3>
          <span className="page-info">共 {pages.length} 页</span>
        </div>

        <div className="preview-scroll" ref={worksheetRef}>
          {charCount === 0 ? (
            <div className="preview-empty">
              <p>请输入汉字内容生成字帖</p>
            </div>
          ) : (
            pages.map((pageRows, pageIndex) => (
              <div key={pageIndex} className="worksheet-page">
                {/* 页眉 */}
                <div className="worksheet-header">
                  <h1>汉字练习字帖</h1>
                  <div className="header-info">
                    <span>姓名：__________</span>
                    <span>日期：__________</span>
                  </div>
                </div>

                {/* 练习内容 */}
                <div className="worksheet-content">
                  {pageRows.map((row, rowIndex) => (
                    <div key={rowIndex} className="practice-row">
                      {/* 拼音 */}
                      {showPinyin && row.pinyin && (
                        <div className="row-pinyin">{row.pinyin}</div>
                      )}

                      {/* 格子行 */}
                      <div
                        className="cells-row"
                        style={{ gridTemplateColumns: `repeat(${cellsPerRow}, ${cellSize}px)` }}
                      >
                        {Array.from({ length: cellsPerRow }).map((_, cellIndex) => {
                          const isTracing = cellIndex < tracingCopies;
                          return (
                            <div
                              key={cellIndex}
                              className={`cell ${isTracing ? 'cell-tracing' : 'cell-empty'}`}
                              style={{ width: cellSize, height: cellSize }}
                              onClick={() => {
                                if (isTracing && showStrokeAnimation) {
                                  setSelectedCharacter(row.char);
                                }
                              }}
                            >
                              {renderGridCell(gridType, cellSize)}
                              {isTracing && renderTracingChar(row.char, cellSize)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 页脚 */}
                <div className="worksheet-footer">
                  Page {pageIndex + 1} / {pages.length}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default HanziWorksheetGenerator;
