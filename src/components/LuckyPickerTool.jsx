import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './LuckyPickerTool.css';

/**
 * 点名神器 / Lucky Picker
 * 功能：随机点名、抽奖、分组
 */

const STORAGE_KEY = 'lumi_lucky_picker_lists';

// 翻译
const translations = {
  zh: {
    title: '点名神器',
    subtitle: "Teacher's Lucky Picker",
    myLists: '我的名单',
    defaultList: '默认名单',
    newList: '新建名单',
    deleteList: '删除名单',
    enterNames: '输入学生名单',
    enterNamesPlaceholder: '每行输入一个学生名字，例如：\nKevin\nSophie\nMegan\nSamuel\nYuki\nAnna 王',
    entered: '已输入',
    people: '人',
    saveList: '保存名单',
    saved: '保存成功',
    editAgain: '再次修改',
    startPicking: '开始点名',
    wheelMode: '转轮模式',
    drawMode: '抽奖模式',
    groupMode: '随机分组',
    spin: '开始转动',
    spinAgain: '再抽一次',
    resetPicked: '重置已点过',
    startDraw: '开始抽取',
    drawAgain: '再抽一次',
    numToPick: '抽取人数',
    generateGroups: '生成分组',
    regroup: '重新分组',
    removeAfterPicked: '抽过后不再重复',
    picked: '已点过',
    pickHistory: '抽取记录',
    clearHistory: '清空记录',
    fullscreen: '全屏上课',
    backToSettings: '返回设置',
    selected: '抽中',
    congratulations: '恭喜抽中',
    group: '组',
    members: '人',
    listEmpty: '名单为空，请先输入学生名字',
    allPicked: '所有学生都已经抽过啦',
    notEnoughStudents: '剩余学生不足，请重置已点过名单',
    notEnoughForGroup: '学生人数不足以分成这么多组',
    wheelPick: '转轮抽中',
    drawPick: '抽奖抽中',
    randomGroup: '随机分组',
    confirmDelete: '确定要删除此名单吗？',
    listName: '名单名称',
    create: '创建',
    cancel: '取消'
  },
  en: {
    title: 'Lucky Picker',
    subtitle: "Teacher's Lucky Picker",
    myLists: 'My Lists',
    defaultList: 'Default List',
    newList: 'New List',
    deleteList: 'Delete List',
    enterNames: 'Enter Student List',
    enterNamesPlaceholder: 'Enter one student name per line, e.g.:\nKevin\nSophie\nMegan\nSamuel\nYuki\nAnna Wang',
    entered: 'Entered',
    people: 'students',
    saveList: 'Save List',
    saved: 'Saved Successfully',
    editAgain: 'Edit Again',
    startPicking: 'Start Picking',
    wheelMode: 'Wheel Mode',
    drawMode: 'Draw Mode',
    groupMode: 'Random Groups',
    spin: 'Spin',
    spinAgain: 'Spin Again',
    resetPicked: 'Reset Picked',
    startDraw: 'Start Draw',
    drawAgain: 'Draw Again',
    numToPick: 'Number to Pick',
    generateGroups: 'Generate Groups',
    regroup: 'Regroup',
    removeAfterPicked: 'Remove after picked',
    picked: 'Picked',
    pickHistory: 'Pick History',
    clearHistory: 'Clear History',
    fullscreen: 'Fullscreen',
    backToSettings: 'Back to Settings',
    selected: 'Selected',
    congratulations: 'Congratulations!',
    group: 'Group',
    members: '',
    listEmpty: 'The list is empty. Please enter student names first.',
    allPicked: 'All students have been picked.',
    notEnoughStudents: 'Not enough students left. Please reset picked students.',
    notEnoughForGroup: 'Not enough students for this many groups.',
    wheelPick: 'Wheel pick',
    drawPick: 'Draw pick',
    randomGroup: 'Random groups',
    confirmDelete: 'Are you sure you want to delete this list?',
    listName: 'List Name',
    create: 'Create',
    cancel: 'Cancel'
  }
};

function LuckyPickerTool() {
  // 语言状态
  const [lang, setLang] = useState('zh');
  const t = translations[lang];

  // 名单管理状态
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [rawNames, setRawNames] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  // 功能状态
  const [currentMode, setCurrentMode] = useState('wheel'); // wheel, draw, group
  const [removeAfterPicked, setRemoveAfterPicked] = useState(false);
  const [pickedStudents, setPickedStudents] = useState([]);
  const [pickHistory, setPickHistory] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [spinResult, setSpinResult] = useState(null);
  const [drawCount, setDrawCount] = useState(1);
  const [groupCount, setGroupCount] = useState(2);
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState('');

  const wheelRef = useRef(null);

  // 当前名单
  const activeList = useMemo(() => {
    return lists.find(l => l.id === activeListId);
  }, [lists, activeListId]);

  // 当前名单学生
  const students = useMemo(() => {
    return activeList?.students || [];
  }, [activeList]);

  // 可用学生（去除已点过的）
  const availableStudents = useMemo(() => {
    if (!removeAfterPicked) return students;
    return students.filter(s => !pickedStudents.includes(s));
  }, [students, pickedStudents, removeAfterPicked]);

  // 解析名字
  const parseNames = useCallback((text) => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter((name, index, arr) => arr.indexOf(name) === index); // 去重
  }, []);

  // 加载名单
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setLists(data.lists || []);
        setActiveListId(data.activeListId || null);
      } else {
        // 创建默认名单
        const defaultList = {
          id: 'default',
          name: t.defaultList,
          students: []
        };
        setLists([defaultList]);
        setActiveListId('default');
      }
    } catch {
      const defaultList = {
        id: 'default',
        name: t.defaultList,
        students: []
      };
      setLists([defaultList]);
      setActiveListId('default');
    }
  }, []);

  // 保存名单
  const saveLists = useCallback((newLists, newActiveId) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        lists: newLists,
        activeListId: newActiveId
      }));
    } catch {
      // localStorage 不可用
    }
  }, []);

  // 保存当前名单
  const handleSaveList = useCallback(() => {
    if (!activeListId) return;
    const names = parseNames(rawNames);
    const updatedLists = lists.map(l =>
      l.id === activeListId ? { ...l, students: names } : l
    );
    setLists(updatedLists);
    saveLists(updatedLists, activeListId);
    setShowSaveModal(true);
  }, [activeListId, lists, rawNames, parseNames, saveLists]);

  // 切换名单
  const handleSelectList = useCallback((listId) => {
    setActiveListId(listId);
    const list = lists.find(l => l.id === listId);
    if (list) {
      setRawNames(list.students.join('\n'));
    }
    setPickedStudents([]);
    setPickHistory([]);
    setSelectedStudents([]);
    setSpinResult(null);
    setGroups([]);
    setMessage('');
    saveLists(lists, listId);
  }, [lists, saveLists]);

  // 创建新名单
  const handleCreateList = useCallback(() => {
    if (!newListName.trim()) return;
    const newId = 'list_' + Date.now();
    const newList = {
      id: newId,
      name: newListName.trim(),
      students: []
    };
    const updatedLists = [...lists, newList];
    setLists(updatedLists);
    setActiveListId(newId);
    setRawNames('');
    setPickedStudents([]);
    setNewListName('');
    setShowNewListModal(false);
    saveLists(updatedLists, newId);
  }, [newListName, lists, saveLists]);

  // 删除名单
  const handleDeleteList = useCallback(() => {
    if (!activeListId || lists.length <= 1) return;
    if (!window.confirm(t.confirmDelete)) return;
    const updatedLists = lists.filter(l => l.id !== activeListId);
    const newActiveId = updatedLists[0]?.id || null;
    setLists(updatedLists);
    setActiveListId(newActiveId);
    if (newActiveId) {
      const list = updatedLists.find(l => l.id === newActiveId);
      setRawNames(list?.students.join('\n') || '');
    }
    setPickedStudents([]);
    saveLists(updatedLists, newActiveId);
  }, [activeListId, lists, t, saveLists]);

  // 转轮
  const handleSpin = useCallback(() => {
    if (availableStudents.length === 0) {
      setMessage(t.allPicked);
      return;
    }
    setSpinning(true);
    setSpinResult(null);
    setMessage('');

    // 随机选中
    const winner = availableStudents[Math.floor(Math.random() * availableStudents.length)];

    // 动画时间
    setTimeout(() => {
      setSpinning(false);
      setSpinResult(winner);
      setSelectedStudents([winner]);

      if (removeAfterPicked) {
        setPickedStudents(prev => [...prev, winner]);
      }

      setPickHistory(prev => [{
        type: 'wheel',
        students: [winner],
        time: new Date().toLocaleTimeString()
      }, ...prev]);
    }, 3000);
  }, [availableStudents, removeAfterPicked, t]);

  // 抽奖
  const handleDraw = useCallback(() => {
    if (availableStudents.length === 0) {
      setMessage(t.allPicked);
      return;
    }
    if (availableStudents.length < drawCount) {
      setMessage(t.notEnoughStudents);
      return;
    }

    setDrawing(true);
    setSelectedStudents([]);
    setMessage('');

    // 动画
    let count = 0;
    const maxCount = 15;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableStudents.length);
      setSelectedStudents([availableStudents[randomIndex]]);
      count++;
      if (count >= maxCount) {
        clearInterval(interval);

        // 最终结果
        const shuffled = [...availableStudents].sort(() => Math.random() - 0.5);
        const winners = shuffled.slice(0, drawCount);
        setSelectedStudents(winners);

        if (removeAfterPicked) {
          setPickedStudents(prev => [...prev, ...winners]);
        }

        setPickHistory(prev => [{
          type: 'draw',
          students: winners,
          time: new Date().toLocaleTimeString()
        }, ...prev]);

        setDrawing(false);
      }
    }, 100);
  }, [availableStudents, drawCount, removeAfterPicked, t]);

  // 生成分组
  const handleGenerateGroups = useCallback(() => {
    if (students.length < groupCount) {
      setMessage(t.notEnoughForGroup);
      return;
    }

    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const result = [];
    const baseSize = Math.floor(shuffled.length / groupCount);
    const remainder = shuffled.length % groupCount;

    let index = 0;
    for (let i = 0; i < groupCount; i++) {
      const size = baseSize + (i < remainder ? 1 : 0);
      result.push(shuffled.slice(index, index + size));
      index += size;
    }

    setGroups(result);
    setPickHistory(prev => [{
      type: 'group',
      groups: result,
      time: new Date().toLocaleTimeString()
    }, ...prev]);
    setMessage('');
  }, [students, groupCount, t]);

  // 重置已点过
  const handleResetPicked = useCallback(() => {
    setPickedStudents([]);
    setSelectedStudents([]);
    setSpinResult(null);
    setMessage('');
  }, []);

  // 清空记录
  const handleClearHistory = useCallback(() => {
    setPickHistory([]);
  }, []);

  // 全屏
  const handleFullscreen = useCallback(() => {
    const elem = document.querySelector('.lp-main-content');
    if (elem && elem.requestFullscreen) {
      elem.requestFullscreen();
    }
  }, []);

  // 计算转盘扇区颜色
  const wheelColors = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
    '#AA96DA', '#FCBAD3', '#A8D8EA', '#FF9F43', '#5F27CD',
    '#00D2D3', '#FF9FF3', '#54A0FF', '#5F27CD', '#C8D6E5'
  ];

  // 计算每个扇区的角度
  const sectorAngle = availableStudents.length > 0 ? 360 / availableStudents.length : 360;

  // 返回设置
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="lucky-picker-tool">
      {/* 顶部栏 */}
      <div className="lp-topbar">
        <div className="lp-topbar-left">
          <h1 className="lp-title">{t.title}</h1>
          <span className="lp-subtitle">{t.subtitle}</span>
        </div>
        <div className="lp-topbar-right">
          <select
            className="lp-lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="zh">🇨🇳 中文</option>
            <option value="en">🇺🇸 English</option>
          </select>
          <button className="lp-btn lp-btn-fullscreen" onClick={handleFullscreen}>
            ⛶ {t.fullscreen}
          </button>
          <button className="lp-btn lp-btn-back" onClick={handleBack}>
            ← {t.backToSettings}
          </button>
        </div>
      </div>

      <div className="lp-content">
        {/* 左侧：名单管理 */}
        <div className="lp-sidebar">
          <div className="lp-sidebar-section">
            <h3 className="lp-sidebar-title">📋 {t.myLists}</h3>
            <div className="lp-list-tabs">
              {lists.map(list => (
                <div
                  key={list.id}
                  className={`lp-list-tab ${activeListId === list.id ? 'active' : ''}`}
                  onClick={() => handleSelectList(list.id)}
                >
                  <span className="lp-list-name">{list.name}</span>
                  <span className="lp-list-count">{list.students.length} {t.people}</span>
                </div>
              ))}
            </div>
            <div className="lp-list-actions">
              <button
                className="lp-btn lp-btn-sm"
                onClick={() => setShowNewListModal(true)}
              >
                ➕ {t.newList}
              </button>
              {lists.length > 1 && (
                <button
                  className="lp-btn lp-btn-sm lp-btn-danger"
                  onClick={handleDeleteList}
                >
                  🗑 {t.deleteList}
                </button>
              )}
            </div>
          </div>

          <div className="lp-sidebar-section">
            <h3 className="lp-sidebar-title">✏️ {t.enterNames}</h3>
            <textarea
              className="lp-names-input"
              value={rawNames}
              onChange={(e) => setRawNames(e.target.value)}
              placeholder={t.enterNamesPlaceholder}
              rows={8}
            />
            <div className="lp-names-info">
              {t.entered}：{parseNames(rawNames).length} {t.people}
            </div>
            <button className="lp-btn lp-btn-primary" onClick={handleSaveList}>
              💾 {t.saveList}
            </button>
          </div>

          <div className="lp-sidebar-section">
            <label className="lp-checkbox">
              <input
                type="checkbox"
                checked={removeAfterPicked}
                onChange={(e) => setRemoveAfterPicked(e.target.checked)}
              />
              <span>{t.removeAfterPicked}</span>
            </label>

            {pickedStudents.length > 0 && (
              <div className="lp-picked-info">
                <div className="lp-picked-label">{t.picked}：{pickedStudents.length} {t.people}</div>
                <div className="lp-picked-names">{pickedStudents.join(', ')}</div>
                <button className="lp-btn lp-btn-sm lp-btn-warning" onClick={handleResetPicked}>
                  🔄 {t.resetPicked}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 中间：主功能区 */}
        <div className="lp-main-content">
          {/* 模式切换 */}
          <div className="lp-mode-tabs">
            <button
              className={`lp-mode-tab ${currentMode === 'wheel' ? 'active' : ''}`}
              onClick={() => setCurrentMode('wheel')}
            >
              🎯 {t.wheelMode}
            </button>
            <button
              className={`lp-mode-tab ${currentMode === 'draw' ? 'active' : ''}`}
              onClick={() => setCurrentMode('draw')}
            >
              🎰 {t.drawMode}
            </button>
            <button
              className={`lp-mode-tab ${currentMode === 'group' ? 'active' : ''}`}
              onClick={() => setCurrentMode('group')}
            >
              👥 {t.groupMode}
            </button>
          </div>

          {/* 转轮模式 */}
          {currentMode === 'wheel' && (
            <div className="lp-wheel-area">
              {students.length === 0 ? (
                <div className="lp-empty-message">{t.listEmpty}</div>
              ) : (
                <>
                  <div className="lp-wheel-container">
                    <div className="lp-wheel-pointer">▼</div>
                    <div
                      ref={wheelRef}
                      className={`lp-wheel ${spinning ? 'spinning' : ''}`}
                      style={{
                        '--sectors': availableStudents.length,
                        '--sector-angle': `${sectorAngle}deg`
                      }}
                    >
                      {availableStudents.map((student, index) => (
                        <div
                          key={index}
                          className="lp-wheel-sector"
                          style={{
                            background: wheelColors[index % wheelColors.length],
                            transform: `rotate(${index * sectorAngle}deg)`
                          }}
                        >
                          <span style={{ transform: `rotate(${sectorAngle / 2}deg)` }}>
                            {student}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="lp-wheel-center">
                      {spinning ? '...' : t.title}
                    </div>
                  </div>

                  {spinResult && (
                    <div className="lp-result-card lp-result-gold">
                      <div className="lp-result-label">{t.congratulations}</div>
                      <div className="lp-result-name">{spinResult}</div>
                    </div>
                  )}

                  {message && <div className="lp-message">{message}</div>}

                  <div className="lp-actions">
                    <button
                      className="lp-btn lp-btn-spin"
                      onClick={handleSpin}
                      disabled={spinning || availableStudents.length === 0}
                    >
                      {spinning ? '🎡...' : (spinResult ? t.spinAgain : t.spin)}
                    </button>
                    {pickedStudents.length > 0 && (
                      <button className="lp-btn lp-btn-warning" onClick={handleResetPicked}>
                        🔄 {t.resetPicked}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 抽奖模式 */}
          {currentMode === 'draw' && (
            <div className="lp-draw-area">
              {students.length === 0 ? (
                <div className="lp-empty-message">{t.listEmpty}</div>
              ) : (
                <>
                  <div className="lp-draw-count">
                    <span className="lp-draw-label">{t.numToPick}：</span>
                    {[1, 2, 3, 5].map(n => (
                      <button
                        key={n}
                        className={`lp-count-btn ${drawCount === n ? 'active' : ''}`}
                        onClick={() => setDrawCount(n)}
                        disabled={n > availableStudents.length}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <div className="lp-draw-display">
                    {drawing ? (
                      <div className="lp-draw-scrolling">
                        {selectedStudents[0] || '...'}
                      </div>
                    ) : selectedStudents.length > 0 ? (
                      <div className="lp-draw-result">
                        <div className="lp-result-label">{t.selected}：</div>
                        <div className="lp-result-names">
                          {selectedStudents.map((s, i) => (
                            <span key={i} className="lp-result-name">{s}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="lp-draw-placeholder">
                        {t.startDraw}
                      </div>
                    )}
                  </div>

                  {message && <div className="lp-message">{message}</div>}

                  <div className="lp-actions">
                    <button
                      className="lp-btn lp-btn-draw"
                      onClick={handleDraw}
                      disabled={drawing || availableStudents.length === 0 || availableStudents.length < drawCount}
                    >
                      {drawing ? '🎰...' : (selectedStudents.length > 0 ? t.drawAgain : t.startDraw)}
                    </button>
                    {pickedStudents.length > 0 && (
                      <button className="lp-btn lp-btn-warning" onClick={handleResetPicked}>
                        🔄 {t.resetPicked}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 随机分组 */}
          {currentMode === 'group' && (
            <div className="lp-group-area">
              {students.length === 0 ? (
                <div className="lp-empty-message">{t.listEmpty}</div>
              ) : (
                <>
                  <div className="lp-group-count">
                    <span className="lp-group-label">{t.groupMode}：</span>
                    <input
                      type="number"
                      className="lp-group-input"
                      value={groupCount}
                      onChange={(e) => setGroupCount(Math.max(2, Math.min(students.length, parseInt(e.target.value) || 2)))}
                      min={2}
                      max={students.length}
                    />
                    <span>{t.group}</span>
                  </div>

                  {groups.length > 0 && (
                    <div className="lp-groups-display">
                      {groups.map((group, i) => (
                        <div key={i} className="lp-group-card">
                          <div className="lp-group-header">
                            {t.group} {i + 1}
                            <span className="lp-group-size">({group.length} {t.members})</span>
                          </div>
                          <div className="lp-group-members">
                            {group.map((member, j) => (
                              <span key={j} className="lp-group-member">{member}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {message && <div className="lp-message">{message}</div>}

                  <div className="lp-actions">
                    <button
                      className="lp-btn lp-btn-group"
                      onClick={handleGenerateGroups}
                      disabled={students.length < groupCount}
                    >
                      {groups.length > 0 ? t.regroup : t.generateGroups}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 右侧：记录 */}
        <div className="lp-history-panel">
          <h3 className="lp-history-title">📜 {t.pickHistory}</h3>
          {pickHistory.length === 0 ? (
            <div className="lp-history-empty">{t.clearHistory}</div>
          ) : (
            <div className="lp-history-list">
              {pickHistory.map((record, i) => (
                <div key={i} className="lp-history-item">
                  <div className="lp-history-time">{record.time}</div>
                  <div className="lp-history-content">
                    {record.type === 'wheel' && (
                      <span>🎯 {t.wheelPick}: {record.students.join(', ')}</span>
                    )}
                    {record.type === 'draw' && (
                      <span>🎰 {t.drawPick}: {record.students.join(', ')}</span>
                    )}
                    {record.type === 'group' && (
                      <span>👥 {t.randomGroup}: {record.groups.length} {t.group}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {pickHistory.length > 0 && (
            <button className="lp-btn lp-btn-sm lp-btn-danger" onClick={handleClearHistory}>
              🗑 {t.clearHistory}
            </button>
          )}
        </div>
      </div>

      {/* 保存成功弹窗 */}
      {showSaveModal && (
        <div className="lp-modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-icon">✅</div>
            <div className="lp-modal-title">{t.saved}</div>
            <div className="lp-modal-actions">
              <button className="lp-btn" onClick={() => setShowSaveModal(false)}>
                {t.editAgain}
              </button>
              <button
                className="lp-btn lp-btn-primary"
                onClick={() => {
                  setShowSaveModal(false);
                  setCurrentMode('wheel');
                }}
              >
                {t.startPicking}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新建名单弹窗 */}
      {showNewListModal && (
        <div className="lp-modal-overlay" onClick={() => setShowNewListModal(false)}>
          <div className="lp-modal" onClick={e => e.stopPropagation()}>
            <div className="lp-modal-title">{t.newList}</div>
            <input
              type="text"
              className="lp-modal-input"
              placeholder={t.listName}
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              autoFocus
            />
            <div className="lp-modal-actions">
              <button className="lp-btn" onClick={() => setShowNewListModal(false)}>
                {t.cancel}
              </button>
              <button
                className="lp-btn lp-btn-primary"
                onClick={handleCreateList}
                disabled={!newListName.trim()}
              >
                {t.create}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LuckyPickerTool;
