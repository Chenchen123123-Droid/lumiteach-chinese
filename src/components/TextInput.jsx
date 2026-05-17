import React from 'react';
import './TextInput.css';

/**
 * 课文输入组件
 * 用于输入中文课文文本
 */
function TextInput({ value, onChange, placeholder }) {
  return (
    <div className="text-input-container">
      <label className="input-label">输入课文内容</label>
      <textarea
        className="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "请输入中文课文，例如：&#10;今天天气很好，我们去公园玩。公园里有很多人，有的在跑步，有的在跳舞。"}
        rows={6}
      />
      <div className="input-hint">
        <span className="char-count">{value.length} 字</span>
        <span className="hint-text">输入课文后，选择下方的游戏类型开始生成</span>
      </div>
    </div>
  );
}

export default TextInput;
