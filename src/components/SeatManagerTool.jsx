import React, { useState, useEffect, useCallback } from 'react';
import './SeatManagerTool.css';

// localStorage keys
const SHARED_LISTS_KEY = 'classroom_shared_lists';
const SEAT_CLASSES_KEY = 'seat_manager_classes';

// Default translations
const translations = {
  zh: {
    title: '座位管理工具',
    seatManager: 'Seat Manager',
    class: '班级',
    newClass: '新建班级',
    deleteClass: '删除班级',
    className: '班级名称',
    addStudents: '添加学生',
    studentList: '学生名单',
    studentPlaceholder: '每行输入一个学生名字，例如：\nKevin\nSophie\nMegan\nSamuel\nYuki\nAnna 王\n\n也支持逗号分隔',
    commaSupported: '支持逗号分隔',
    studentCount: '学生数量',
    addToClass: '添加到当前班级',
    importFromPicker: '从点名神器导入名单',
    layoutSettings: '布局设置',
    rows: '行数',
    cols: '列数',
    podiumPosition: '讲台方向',
    top: '上方',
    bottom: '下方',
    left: '左侧',
    right: '右侧',
    generateSeats: '生成座位表',
    arrangement: '排列方式',
    inOrder: '按顺序排列',
    randomArrangement: '随机排列',
    randomizeSeats: '随机排座',
    clearSeats: '清空座位',
    fullClear: '完全清空',
    print: '打印',
    exportPDF: '导出 PDF',
    save: '保存',
    resetClass: '重置当前班级',
    totalSeats: '总座位',
    availableSeats: '可用座位',
    emptySeats: '空座',
    assigned: '已安排',
    unassigned: '未安排',
    lockedSeats: '锁定座位',
    setEmpty: '设为空座',
    restoreSeat: '恢复座位',
    lock: '锁定',
    unlock: '解锁',
    podium: '讲台',
    whiteboard: '白板',
    unassignedStudents: '未安排学生',
    autoAssign: '自动安排未安排学生',
    notEnoughSeats: '座位不足',
    pleaseAddStudents: '请先添加学生',
    pleaseGenerateSeats: '请先生成座位表',
    confirmRegenerate: '重新生成会覆盖当前座位安排，是否继续？',
    noStudents: '名单为空，请先输入学生名字',
    onlyOneClass: '不能删除最后一个班级',
    confirmDelete: '确定要删除此班级吗？',
    student: '人',
    emptySeatTip: '这是空座，不能放置学生',
    lockedSeatTip: '该座位已锁定，请先解锁',
    saved: '已保存',
    pdfNotAvailable: '请先安装 html2canvas 和 jspdf 以启用 PDF 导出'
  },
  en: {
    title: 'Seat Manager',
    seatManager: 'Seat Manager',
    class: 'Class',
    newClass: 'New Class',
    deleteClass: 'Delete Class',
    className: 'Class Name',
    addStudents: 'Add Students',
    studentList: 'Student List',
    studentPlaceholder: 'Enter one student name per line, e.g.:\nKevin\nSophie\nMegan\nSamuel\nYuki\nAnna Wang\n\nComma separated is also supported',
    commaSupported: 'Comma separated names supported',
    studentCount: 'Students',
    addToClass: 'Add to Current Class',
    importFromPicker: 'Import from Lucky Picker',
    layoutSettings: 'Layout Settings',
    rows: 'Rows',
    cols: 'Columns',
    podiumPosition: 'Podium Position',
    top: 'Top',
    bottom: 'Bottom',
    left: 'Left',
    right: 'Right',
    generateSeats: 'Generate Seat Chart',
    arrangement: 'Arrangement',
    inOrder: 'In Order',
    randomArrangement: 'Random',
    randomizeSeats: 'Randomize Seats',
    clearSeats: 'Clear Seats',
    fullClear: 'Clear All',
    print: 'Print',
    exportPDF: 'Export PDF',
    save: 'Save',
    resetClass: 'Reset Class',
    totalSeats: 'Total Seats',
    availableSeats: 'Available Seats',
    emptySeats: 'Empty Seats',
    assigned: 'Assigned',
    unassigned: 'Unassigned',
    lockedSeats: 'Locked Seats',
    setEmpty: 'Set Empty',
    restoreSeat: 'Restore Seat',
    lock: 'Lock',
    unlock: 'Unlock',
    podium: 'Podium',
    whiteboard: 'Whiteboard',
    unassignedStudents: 'Unassigned Students',
    autoAssign: 'Auto Assign',
    notEnoughSeats: 'Not enough seats',
    pleaseAddStudents: 'Please add students first',
    pleaseGenerateSeats: 'Please generate a seat chart first',
    confirmRegenerate: 'Regenerating will overwrite the current seat chart. Continue?',
    noStudents: 'The list is empty. Please enter student names first.',
    onlyOneClass: 'Cannot delete the last class',
    confirmDelete: 'Are you sure you want to delete this class?',
    student: '',
    emptySeatTip: 'This is an empty seat and cannot accept students',
    lockedSeatTip: 'This seat is locked. Please unlock first.',
    saved: 'Saved',
    pdfNotAvailable: 'Please install html2canvas and jspdf to enable PDF export'
  }
};

function SeatManagerTool() {
  // Language state
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'zh';
  });
  const t = translations[lang] || translations.zh;

  // Class management state
  const [classes, setClasses] = useState([]);
  const [activeClassId, setActiveClassId] = useState(null);
  const [newClassName, setNewClassName] = useState('');

  // Student input state
  const [studentInput, setStudentInput] = useState('');

  // Layout settings
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);
  const [podiumPosition, setPodiumPosition] = useState('top');
  const [arrangement, setArrangement] = useState('inOrder');

  // Drag state
  const [draggedSeat, setDraggedSeat] = useState(null);
  const [dragOverSeat, setDragOverSeat] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalSeats: 0,
    availableSeats: 0,
    emptySeats: 0,
    assigned: 0,
    unassigned: 0,
    lockedSeats: 0
  });

  // Load data on mount
  useEffect(() => {
    loadClasses();
  }, []);

  // Update stats when class changes
  useEffect(() => {
    calculateStats();
  }, [classes, activeClassId]);

  // Load classes from localStorage
  const loadClasses = useCallback(() => {
    let savedData = null;

    try {
      const saved = localStorage.getItem(SEAT_CLASSES_KEY);
      if (saved) {
        savedData = JSON.parse(saved);
        setClasses(savedData.classes || []);
        setActiveClassId(savedData.activeClassId || null);
      }
    } catch (e) {
      console.error('Error loading classes:', e);
      savedData = null;
    }

    // Create default class if none exists
    if (!savedData?.classes?.length) {
      const defaultClass = {
        id: 'class_' + Date.now(),
        name: lang === 'en' ? 'Default Class' : '默认班级',
        students: [],
        rows: 5,
        cols: 6,
        podiumPosition: 'top',
        seats: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setClasses([defaultClass]);
      setActiveClassId(defaultClass.id);
      saveClasses([defaultClass], defaultClass.id);
    }
  }, [lang]);

  // Save classes to localStorage
  const saveClasses = useCallback((classesToSave, activeId) => {
    try {
      const data = {
        activeClassId: activeId || activeClassId,
        classes: classesToSave
      };
      localStorage.setItem(SEAT_CLASSES_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving classes:', e);
    }
  }, [activeClassId]);

  // Get current class
  const currentClass = classes.find(c => c.id === activeClassId);

  // Calculate statistics
  const calculateStats = useCallback(() => {
    if (!currentClass) {
      setStats({
        totalSeats: 0,
        availableSeats: 0,
        emptySeats: 0,
        assigned: 0,
        unassigned: 0,
        lockedSeats: 0
      });
      return;
    }

    const seats = currentClass.seats || [];
    const totalSeats = rows * cols;
    const emptySeats = seats.filter(s => s.isEmpty).length;
    const lockedSeats = seats.filter(s => s.isLocked && !s.isEmpty).length;
    const assigned = seats.filter(s => s.student && !s.isEmpty).length;
    const availableSeats = totalSeats - emptySeats;
    const unassigned = (currentClass.students || []).length - assigned;

    setStats({
      totalSeats,
      availableSeats,
      emptySeats,
      assigned: Math.max(0, assigned),
      unassigned: Math.max(0, unassigned),
      lockedSeats
    });
  }, [currentClass, rows, cols]);

  // Update class in state
  const updateClass = useCallback((updates) => {
    if (!activeClassId) return;

    setClasses(prev => {
      const updated = prev.map(c => {
        if (c.id === activeClassId) {
          return { ...c, ...updates, updatedAt: Date.now() };
        }
        return c;
      });
      saveClasses(updated, activeClassId);
      return updated;
    });
  }, [activeClassId, saveClasses]);

  // Create new class
  const handleNewClass = useCallback(() => {
    if (!newClassName.trim()) return;

    const newClass = {
      id: 'class_' + Date.now(),
      name: newClassName.trim(),
      students: [],
      rows,
      cols,
      podiumPosition,
      seats: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setClasses(prev => {
      const updated = [...prev, newClass];
      setActiveClassId(newClass.id);
      setNewClassName('');
      saveClasses(updated, newClass.id);
      return updated;
    });
  }, [newClassName, rows, cols, podiumPosition, saveClasses]);

  // Delete class
  const handleDeleteClass = useCallback(() => {
    if (classes.length <= 1) {
      alert(t.onlyOneClass);
      return;
    }

    if (!window.confirm(t.confirmDelete)) return;

    setClasses(prev => {
      const updated = prev.filter(c => c.id !== activeClassId);
      setActiveClassId(updated[0]?.id);
      saveClasses(updated, updated[0]?.id);
      return updated;
    });
  }, [classes, activeClassId, saveClasses, t]);

  // Add students to class
  const handleAddStudents = useCallback(() => {
    if (!studentInput.trim()) return;

    // Parse input
    let newStudents = studentInput
      .replace(/[,，；；]/g, '\n')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s);

    // Remove duplicates
    const existingStudents = currentClass?.students || [];
    newStudents = newStudents.filter(s => !existingStudents.includes(s));

    if (newStudents.length === 0) {
      setStudentInput('');
      return;
    }

    updateClass({
      students: [...existingStudents, ...newStudents]
    });
    setStudentInput('');
  }, [studentInput, currentClass, updateClass]);

  // Remove student from class
  const handleRemoveStudent = useCallback((studentName) => {
    if (!currentClass) return;

    const updatedStudents = currentClass.students.filter(s => s !== studentName);
    const updatedSeats = (currentClass.seats || []).map(seat => {
      if (seat.student === studentName) {
        return { ...seat, student: '', isEmpty: false };
      }
      return seat;
    });

    updateClass({
      students: updatedStudents,
      seats: updatedSeats
    });
  }, [currentClass, updateClass]);

  // Import from lucky picker
  const handleImportFromPicker = useCallback(() => {
    let sharedData = null;
    let luckyData = null;

    // Try to read shared lists first
    try {
      const shared = localStorage.getItem(SHARED_LISTS_KEY);
      if (shared) sharedData = JSON.parse(shared);
    } catch (e) {}

    // Then try lucky picker
    try {
      const lucky = localStorage.getItem('lumi_lucky_picker_lists');
      if (lucky) luckyData = JSON.parse(lucky);
    } catch (e) {}

    const lists = sharedData?.lists || luckyData?.lists || [];

    if (lists.length === 0) {
      alert(lang === 'en' ? 'No lists found in Lucky Picker' : '点名神器中没有找到名单');
      return;
    }

    // Use first list
    const firstList = lists[0];
    const students = firstList.students || [];

    if (!students.length) {
      alert(lang === 'en' ? 'Selected list is empty' : '所选名单为空');
      return;
    }

    // Add students
    const existingStudents = currentClass?.students || [];
    const newStudents = students.filter(s => !existingStudents.includes(s));

    updateClass({
      students: [...existingStudents, ...newStudents]
    });
  }, [currentClass, updateClass, lang]);

  // Generate seat chart
  const handleGenerateSeats = useCallback(() => {
    if (!currentClass?.students?.length) {
      alert(t.pleaseAddStudents);
      return;
    }

    const totalSeats = rows * cols;
    let studentsList = [...currentClass.students];

    // Shuffle if random
    if (arrangement === 'random') {
      for (let i = studentsList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [studentsList[i], studentsList[j]] = [studentsList[j], studentsList[i]];
      }
    }

    // Create seats
    const newSeats = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const student = studentsList[r * cols + c] || '';
        newSeats.push({
          id: `r${r}c${c}`,
          row: r,
          col: c,
          student: student,
          isEmpty: !student,
          isLocked: false
        });
      }
    }

    updateClass({
      seats: newSeats,
      rows,
      cols
    });
  }, [currentClass, rows, cols, arrangement, updateClass, t]);

  // Randomize seats
  const handleRandomizeSeats = useCallback(() => {
    if (!currentClass?.seats?.length) return;

    const seats = [...currentClass.seats];

    // Get movable students and seats
    const movableSeats = seats.filter(s => !s.isEmpty && !s.isLocked && s.student);
    const movableStudents = movableSeats.map(s => s.student);

    // Shuffle students
    for (let i = movableStudents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [movableStudents[i], movableStudents[j]] = [movableStudents[j], movableStudents[i]];
    }

    // Assign back
    let idx = 0;
    const updatedSeats = seats.map(seat => {
      if (!seat.isEmpty && !seat.isLocked && seat.student) {
        return { ...seat, student: movableStudents[idx++] };
      }
      return seat;
    });

    updateClass({ seats: updatedSeats });
  }, [currentClass, updateClass]);

  // Clear seats
  const handleClearSeats = useCallback(() => {
    if (!currentClass?.seats?.length) return;

    const updatedSeats = currentClass.seats.map(seat => {
      if (!seat.isLocked) {
        return { ...seat, student: '', isEmpty: arrangement === 'random' };
      }
      return seat;
    });

    updateClass({ seats: updatedSeats });
  }, [currentClass, arrangement, updateClass]);

  // Toggle empty seat
  const handleToggleEmpty = useCallback((seatId) => {
    if (!currentClass?.seats?.length) return;

    const updatedSeats = currentClass.seats.map(seat => {
      if (seat.id === seatId) {
        const newIsEmpty = !seat.isEmpty;
        return {
          ...seat,
          isEmpty: newIsEmpty,
          isLocked: newIsEmpty ? false : seat.isLocked,
          student: newIsEmpty ? '' : seat.student
        };
      }
      return seat;
    });

    updateClass({ seats: updatedSeats });
  }, [currentClass, updateClass]);

  // Toggle lock
  const handleToggleLock = useCallback((seatId) => {
    if (!currentClass?.seats?.length) return;

    const updatedSeats = currentClass.seats.map(seat => {
      if (seat.id === seatId && !seat.isEmpty) {
        return { ...seat, isLocked: !seat.isLocked };
      }
      return seat;
    });

    updateClass({ seats: updatedSeats });
  }, [currentClass, updateClass]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e, seat) => {
    if (seat.isLocked || seat.isEmpty) {
      e.preventDefault();
      return;
    }
    setDraggedSeat(seat);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e, seat) => {
    e.preventDefault();
    if (seat.isEmpty || seat.isLocked) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }
    setDragOverSeat(seat);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverSeat(null);
  }, []);

  const handleDrop = useCallback((e, targetSeat) => {
    e.preventDefault();
    setDragOverSeat(null);

    if (!draggedSeat || !currentClass?.seats?.length) return;
    if (targetSeat.isEmpty || targetSeat.isLocked) return;
    if (draggedSeat.isLocked || draggedSeat.isEmpty) return;

    const updatedSeats = currentClass.seats.map(seat => {
      if (seat.id === draggedSeat.id) {
        return { ...seat, student: targetSeat.student };
      }
      if (seat.id === targetSeat.id) {
        return { ...seat, student: draggedSeat.student };
      }
      return seat;
    });

    updateClass({ seats: updatedSeats });
    setDraggedSeat(null);
  }, [draggedSeat, currentClass, updateClass]);

  const handleDragEnd = useCallback(() => {
    setDraggedSeat(null);
    setDragOverSeat(null);
  }, []);

  // Print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Export PDF
  const handleExportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const printArea = document.querySelector('.seat-preview-area');
      if (!printArea) return;

      const canvas = await html2canvas(printArea, {
        scale: 2,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save('seat-chart.pdf');
    } catch (e) {
      console.error('PDF export error:', e);
      alert(t.pdfNotAvailable);
    }
  }, [t]);

  // Auto assign unassigned students
  const handleAutoAssign = useCallback(() => {
    if (!currentClass?.seats?.length) return;

    const unassigned = currentClass.students.filter(name => {
      return !currentClass.seats.some(s => s.student === name);
    });

    if (!unassigned.length) return;

    const availableSeats = currentClass.seats.filter(s => !s.isEmpty && !s.isLocked && !s.student);
    const updatedSeats = [...currentClass.seats];

    unassigned.forEach((student, idx) => {
      if (idx < availableSeats.length) {
        const seatIdx = updatedSeats.findIndex(s => s.id === availableSeats[idx].id);
        if (seatIdx >= 0) {
          updatedSeats[seatIdx] = { ...updatedSeats[seatIdx], student };
        }
      }
    });

    updateClass({ seats: updatedSeats });
  }, [currentClass, updateClass]);

  // Get unassigned students
  const unassignedStudents = currentClass?.students?.filter(name => {
    return !currentClass.seats?.some(s => s.student === name);
  }) || [];

  // Render seat grid
  const renderSeatGrid = () => {
    if (!currentClass?.seats?.length) return null;

    const gridStyle = {
      gridTemplateColumns: `repeat(${cols}, 1fr)`
    };

    return (
      <div className="seat-grid" style={gridStyle}>
        {currentClass.seats.map(seat => (
          <div
            key={seat.id}
            className={`seat-card ${seat.isEmpty ? 'seat-empty' : ''} ${seat.isLocked ? 'seat-locked' : ''} ${dragOverSeat?.id === seat.id ? 'drag-over' : ''} ${draggedSeat?.id === seat.id ? 'dragging' : ''}`}
            draggable={!seat.isEmpty && !seat.isLocked}
            onDragStart={(e) => handleDragStart(e, seat)}
            onDragOver={(e) => handleDragOver(e, seat)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, seat)}
            onDragEnd={handleDragEnd}
            title={seat.student}
          >
            <div className="seat-content">
              {seat.isEmpty ? (
                <span className="empty-label">{lang === 'en' ? 'Empty' : '空座'}</span>
              ) : (
                <span className="student-name">{seat.student}</span>
              )}
            </div>
            <div className="seat-actions">
              {!seat.isEmpty && (
                <button
                  className="seat-action-btn lock-btn"
                  onClick={(e) => { e.stopPropagation(); handleToggleLock(seat.id); }}
                  title={seat.isLocked ? t.unlock : t.lock}
                >
                  {seat.isLocked ? '🔒' : '🔓'}
                </button>
              )}
              <button
                className="seat-action-btn empty-btn"
                onClick={(e) => { e.stopPropagation(); handleToggleEmpty(seat.id); }}
                title={seat.isEmpty ? t.restoreSeat : t.setEmpty}
              >
                {seat.isEmpty ? '♻️' : '⭕'}
              </button>
            </div>
            {seat.isLocked && <div className="lock-icon">🔒</div>}
          </div>
        ))}
      </div>
    );
  };

  // Render podium
  const renderPodium = () => {
    const podiumClass = `podium podium-${podiumPosition}`;
    const podiumText = `${t.podium} / ${t.whiteboard}`;

    return <div className={podiumClass}>{podiumText}</div>;
  };

  return (
    <div className="seat-manager-tool">
      {/* Left sidebar */}
      <div className="seat-manager-sidebar">
        {/* Class management */}
        <div className="sidebar-section">
          <h3>{t.class}</h3>
          <select
            className="class-select"
            value={activeClassId || ''}
            onChange={(e) => setActiveClassId(e.target.value)}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="class-actions">
            <input
              type="text"
              className="class-name-input"
              placeholder={t.className}
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
            />
            <button className="btn-new-class" onClick={handleNewClass}>
              + {t.newClass}
            </button>
            <button className="btn-delete-class" onClick={handleDeleteClass}>
              {t.deleteClass}
            </button>
          </div>
        </div>

        {/* Student list */}
        <div className="sidebar-section">
          <h3>{t.studentList}</h3>
          <textarea
            className="student-input"
            placeholder={t.studentPlaceholder}
            value={studentInput}
            onChange={(e) => setStudentInput(e.target.value)}
          />
          <div className="student-count">
            {t.studentCount}: {currentClass?.students?.length || 0} {t.student}
          </div>
          <div className="student-actions">
            <button className="btn-add-students" onClick={handleAddStudents}>
              {t.addToClass}
            </button>
            <button className="btn-import" onClick={handleImportFromPicker}>
              {t.importFromPicker}
            </button>
          </div>
          {currentClass?.students?.length > 0 && (
            <div className="student-list">
              {currentClass.students.map((student, idx) => (
                <div key={idx} className="student-tag">
                  <span>{student}</span>
                  <button onClick={() => handleRemoveStudent(student)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Layout settings */}
        <div className="sidebar-section">
          <h3>{t.layoutSettings}</h3>
          <div className="layout-inputs">
            <div className="layout-row">
              <label>{t.rows}</label>
              <input
                type="number"
                min="1"
                max="12"
                value={rows}
                onChange={(e) => setRows(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
              />
            </div>
            <div className="layout-row">
              <label>{t.cols}</label>
              <input
                type="number"
                min="1"
                max="12"
                value={cols}
                onChange={(e) => setCols(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
              />
            </div>
          </div>
          <div className="layout-row">
            <label>{t.podiumPosition}</label>
            <select
              value={podiumPosition}
              onChange={(e) => setPodiumPosition(e.target.value)}
            >
              <option value="top">{t.top}</option>
              <option value="bottom">{t.bottom}</option>
              <option value="left">{t.left}</option>
              <option value="right">{t.right}</option>
            </select>
          </div>
          <div className="layout-row">
            <label>{t.arrangement}</label>
            <select
              value={arrangement}
              onChange={(e) => setArrangement(e.target.value)}
            >
              <option value="inOrder">{t.inOrder}</option>
              <option value="random">{t.randomArrangement}</option>
            </select>
          </div>
          <button className="btn-generate" onClick={handleGenerateSeats}>
            {t.generateSeats}
          </button>
        </div>

        {/* Quick actions */}
        <div className="sidebar-section">
          <div className="quick-actions">
            <button className="btn-random" onClick={handleRandomizeSeats} disabled={!currentClass?.seats?.length}>
              {t.randomizeSeats}
            </button>
            <button className="btn-clear" onClick={handleClearSeats} disabled={!currentClass?.seats?.length}>
              {t.clearSeats}
            </button>
            <button className="btn-print" onClick={handlePrint}>
              {t.print}
            </button>
            <button className="btn-pdf" onClick={handleExportPDF}>
              {t.exportPDF}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="sidebar-section stats-section">
          <div className="stat-item">
            <span className="stat-label">{t.totalSeats}</span>
            <span className="stat-value">{stats.totalSeats}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t.availableSeats}</span>
            <span className="stat-value">{stats.availableSeats}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t.emptySeats}</span>
            <span className="stat-value">{stats.emptySeats}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t.assigned}</span>
            <span className="stat-value">{stats.assigned}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t.unassigned}</span>
            <span className="stat-value">{stats.unassigned}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t.lockedSeats}</span>
            <span className="stat-value">{stats.lockedSeats}</span>
          </div>
        </div>
      </div>

      {/* Right preview area */}
      <div className="seat-preview-area">
        <div className="preview-header">
          <h2>{currentClass?.name || t.title}</h2>
        </div>

        {renderPodium()}

        {currentClass?.seats?.length > 0 ? (
          <>
            {renderSeatGrid()}

            {/* Unassigned students */}
            {unassignedStudents.length > 0 && (
              <div className="unassigned-section">
                <h4>{t.unassignedStudents} ({unassignedStudents.length})</h4>
                <div className="unassigned-list">
                  {unassignedStudents.map((student, idx) => (
                    <div key={idx} className="unassigned-tag">{student}</div>
                  ))}
                </div>
                <button className="btn-auto-assign" onClick={handleAutoAssign}>
                  {t.autoAssign}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="preview-empty">
            <p>{t.pleaseGenerateSeats}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SeatManagerTool;