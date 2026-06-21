import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './ClimbMountainQuiz.css';

// ============ Constants ============
const STORAGE_KEY = 'climb_mountain_rooms';
const SCENES = {
  snow: { name: 'Snow Mountain', emoji: '⛰️', bg: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)' },
  forest: { name: 'Forest', emoji: '🌲', bg: 'linear-gradient(180deg, #11998e 0%, #38ef7d 100%)' },
  volcano: { name: 'Volcano', emoji: '🌋', bg: 'linear-gradient(180deg, #f093fb 0%, #f5576c 100%)' }
};

const AVATARS = [
  { id: 'mouse', emoji: '🐭', name: 'Electric Mouse' },
  { id: 'lizard', emoji: '🦎', name: 'Fire Lizard' },
  { id: 'turtle', emoji: '🐢', name: 'Water Turtle' },
  { id: 'dino', emoji: '🦖', name: 'Plant Dino' },
  { id: 'fox', emoji: '🦊', name: 'Furry Fox' },
  { id: 'panda', emoji: '🐼', name: 'Panda' }
];

const MOCK_STUDENTS = ['Pikachu', 'Dragon', 'Turtle', 'Lily', 'Tom', 'Anna'];

// ============ Utilities ============
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============ Storage ============
function saveRoom(room) {
  try {
    const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    rooms[room.roomCode] = room;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  } catch (e) {
    console.error('Save room error:', e);
  }
}

function getRoom(roomCode) {
  try {
    const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return rooms[roomCode] || null;
  } catch (e) {
    return null;
  }
}

function updateRoom(roomCode, updates) {
  const room = getRoom(roomCode);
  if (room) {
    saveRoom({ ...room, ...updates, updatedAt: Date.now() });
  }
}

// ============ Default Questions ============
const DEFAULT_QUESTIONS = [
  { id: 'q1', type: 'multiple_choice', question: '春节是几月几号？', options: ['1月1日', '农历正月初一', '10月1日', '5月1日'], answerIndex: 1, answer: '农历正月初一', explanation: '春节是农历正月初一。', points: 10, difficulty: 'HSK1' },
  { id: 'q2', type: 'multiple_choice', question: '"你好"用英语怎么说？', options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'], answerIndex: 0, answer: 'Hello', explanation: '"你好"的意思是 Hello。', points: 10, difficulty: 'HSK1' },
  { id: 'q3', type: 'true_false', question: '北京是中国的首都。', options: ['对', '错'], answerIndex: 0, answer: '对', explanation: '北京确实是中国的首都。', points: 10, difficulty: 'HSK1' },
  { id: 'q4', type: 'multiple_choice', question: '"朋友"是什么意思？', options: ['Family', 'Friend', 'Teacher', 'Student'], answerIndex: 1, answer: 'Friend', explanation: '"朋友" means friend in English.', points: 10, difficulty: 'HSK1' },
  { id: 'q5', type: 'multiple_choice', question: '汉字"山"的意思是什么？', options: ['Water', 'Fire', 'Mountain', 'Tree'], answerIndex: 2, answer: 'Mountain', explanation: '"山" means mountain.', points: 10, difficulty: 'HSK1' }
];

// ============ Main Component ============
function ClimbMountainQuiz() {
  const { lang } = useLanguage();
  const isZh = lang === 'zh';

  // View states: setup, lobby, playing, ended
  const [view, setView] = useState('setup');
  const [role, setRole] = useState(null); // 'teacher' | 'student'

  // Setup states
  const [scene, setScene] = useState('snow');
  const [mode, setMode] = useState('teacher_led');
  const [questionTab, setQuestionTab] = useState('manual');
  const [questions, setQuestions] = useState([]);
  const [manualQuestion, setManualQuestion] = useState({ question: '', options: ['', '', '', ''], answerIndex: 0, points: 10 });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLevel, setAiLevel] = useState('HSK2');
  const [aiCount, setAiCount] = useState('10');
  const [aiQuestionTypes, setAiQuestionTypes] = useState(['multiple_choice']);
  const [aiResult, setAiResult] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Room states
  const [roomCode, setRoomCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [studentId, setStudentId] = useState('');
  const [room, setRoom] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);
  const [gameTimer, setGameTimer] = useState(0);
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const timerRef = useRef(null);
  const pollRef = useRef(null);

  // ============ Texts ============
  const t = {
    title: isZh ? '爬山竞赛' : 'Climb the Mountain Quiz',
    subtitle: isZh
      ? '创建一个课堂答题竞赛，学生答对题目就向山顶前进。'
      : 'Create a classroom quiz race where students move up the mountain.',
    createRoom: isZh ? '创建房间' : 'Create Room',
    joinRoom: isZh ? '加入房间' : 'Join Room',
    joinTitle: isZh ? '加入爬山' : 'Join the Climb!',
    roomCodeLabel: isZh ? '输入房间码' : 'Room Code',
    userName: isZh ? '输入昵称' : 'Your Name',
    selectAvatar: isZh ? '选择角色' : 'Select Avatar',
    startClimbing: isZh ? '开始爬山' : 'Start Climbing',
    back: isZh ? '返回' : 'Back',

    // Setup
    gameSettings: isZh ? '游戏设置' : 'Game Settings',
    questionSource: isZh ? '题目来源' : 'Question Source',
    scene: isZh ? '场景' : 'Scene',
    gameMode: isZh ? '游戏模式' : 'Game Mode',
    teacherLed: isZh ? '老师控制' : 'Teacher-Led',
    teacherLedDesc: isZh ? '老师点击下一题' : 'Teacher clicks Next',
    selfPaced: isZh ? '学生自测' : 'Self-Paced',
    selfPacedDesc: isZh ? '自动进入下一题' : 'Auto advance',
    next: isZh ? '下一步' : 'Next',

    // Question tabs
    aiTopic: isZh ? 'AI主题生成' : 'AI Topic',
    fromText: isZh ? '根据文本生成' : 'From Text',
    manual: isZh ? '手动输入' : 'Manual Input',
    topic: isZh ? '主题' : 'Topic',
    topicPlaceholder: isZh ? '例如：HSK3 天气、中国节日、学校生活' : 'e.g., HSK3 Weather, Chinese Festivals',
    hskLevel: isZh ? 'HSK等级' : 'HSK Level',
    questionCount: isZh ? '题目数量' : 'Question Count',
    questionTypes: isZh ? '题型' : 'Question Types',
    generateQuestions: isZh ? 'AI生成题目' : 'Generate Questions',
    generating: isZh ? '正在生成...' : 'Generating...',
    regenerate: isZh ? '重新生成' : 'Regenerate',
    addQuestion: isZh ? '添加题目' : 'Add Question',
    confirmAndCreate: isZh ? '确认并创建房间' : 'Confirm and Create',
    copyPrompt: isZh ? '复制提示词' : 'Copy Prompt',
    pasteResult: isZh ? '粘贴AI结果' : 'Paste AI Result',
    importResult: isZh ? '导入结果' : 'Import Result',
    pasteText: isZh ? '粘贴课文' : 'Paste Text Here',
    generateFromText: isZh ? '根据文本生成' : 'Generate from Text',
    generateSuccess: isZh ? '题目生成成功' : 'Questions generated successfully',
    generateFailed: isZh ? 'AI生成失败，请稍后再试' : 'AI generation failed, please try again',
    aiNotConfigured: isZh ? 'AI接口暂未配置，请先使用手动导入题目' : 'AI API is not configured. Please use manual input.',
    aiWarning: isZh ? 'AI生成题目会消耗接口额度。请先审核题目后再开始游戏。' : 'AI question generation uses API credits. Please review questions before starting.',
    question: isZh ? '题目' : 'Question',
    options: isZh ? '选项' : 'Options',
    correctOption: isZh ? '正确答案' : 'Correct',
    points: isZh ? '分值' : 'Points',
    explanation: isZh ? '解释' : 'Explanation',
    delete: isZh ? '删除' : 'Delete',
    clearAll: isZh ? '清空全部' : 'Clear All',
    useExamples: isZh ? '使用示例' : 'Use Examples',

    // Review
    reviewTitle: isZh ? '审核题目' : 'Review Questions',
    totalQuestions: isZh ? '共 {n} 道题' : '{n} Questions',
    launch: isZh ? '创建房间' : 'Create Room',
    editQuestion: isZh ? '编辑' : 'Edit',

    // Lobby
    lobbyTitle: isZh ? '等待加入' : 'Waiting for Players',
    roomCodeText: isZh ? '房间码' : 'Room Code',
    scanQR: isZh ? '扫码加入' : 'Scan to Join',
    shareLink: isZh ? '分享链接' : 'Share Link',
    copyLink: isZh ? '复制链接' : 'Copy Link',
    copyCode: isZh ? '复制房间码' : 'Copy Code',
    addMockStudent: isZh ? '添加模拟学生' : 'Add Mock Student',
    students: isZh ? '学生列表' : 'Students',
    startGame: isZh ? '开始游戏' : 'Start Game',
    waitingForTeacher: isZh ? '等待老师开始游戏...' : 'Waiting for teacher...',
    noStudents: isZh ? '还没有学生加入' : 'No students yet',

    // Game
    questionNum: isZh ? '第 {n}/{total} 题' : 'Question {n}/{total}',
    score: isZh ? '分数' : 'Score',
    time: isZh ? '时间' : 'Time',
    submit: isZh ? '提交' : 'Submit',
    waitTeacher: isZh ? '等待老师...' : 'Waiting for teacher...',
    correctFeedback: isZh ? '答对了！' : 'Correct!',
    wrongFeedback: isZh ? '答错了' : 'Wrong!',
    nextQuestion: isZh ? '下一题' : 'Next Question',
    showAnswer: isZh ? '显示答案' : 'Show Answer',
    endGame: isZh ? '结束游戏' : 'End Game',

    // Results
    gameOver: isZh ? '游戏结束' : 'Game Over',
    champion: isZh ? '冠军' : 'Champion',
    ranking: isZh ? '排名' : 'Ranking',
    finalScore: isZh ? '最终得分' : 'Final Score',
    accuracy: isZh ? '正确率' : 'Accuracy',
    playAgain: isZh ? '再玩一次' : 'Play Again',
    backToSetup: isZh ? '返回编辑' : 'Back to Setup',
    backToTools: isZh ? '返回全部工具' : 'Back to Tools',

    // Errors
    noQuestions: isZh ? '请先添加题目' : 'Please add questions first',
    enterNameError: isZh ? '请输入昵称' : 'Please enter your name',
    roomNotFound: isZh ? '房间不存在' : 'Room not found',
    localDemo: isZh ? '本地演示版' : 'Local Demo Mode'
  };

  // ============ Effects ============
  useEffect(() => {
    if (view === 'lobby' || view === 'playing' || view === 'ended') {
      pollRoom();
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [view, roomCode]);

  useEffect(() => {
    if (view === 'playing' && room?.status === 'playing') {
      timerRef.current = setInterval(() => {
        setGameTimer(prev => prev + 1);
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [view, room?.status]);

  // ============ Functions ============
  const pollRoom = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      const updatedRoom = getRoom(roomCode);
      if (updatedRoom) {
        setRoom(updatedRoom);
        if (updatedRoom.status === 'ended' && view === 'playing') {
          setView('ended');
        }
      }
    }, 1000);
  }, [roomCode, view]);

  const handleGenerateQuestions = async () => {
    if (!aiPrompt.trim()) {
      alert(isZh ? '请输入主题' : 'Please enter a topic');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/deepseek-generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: aiPrompt,
          level: aiLevel,
          count: aiCount,
          questionTypes: aiQuestionTypes
        })
      });

      const data = await response.json();

      if (data.success && data.questions && Array.isArray(data.questions)) {
        const newQuestions = data.questions.map((q, i) => ({
          ...q,
          id: `ai_${generateId()}`
        }));

        setQuestions(prev => [...prev, ...newQuestions]);
        alert(`${t.generateSuccess} (${newQuestions.length})`);
      } else {
        const errorMsg = data.error || t.generateFailed;
        if (errorMsg.includes('not configured')) {
          alert(t.aiNotConfigured);
        } else {
          alert(errorMsg);
        }
      }
    } catch (error) {
      console.error('Generate questions error:', error);
      alert(t.generateFailed);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateQuestions = async () => {
    // Clear existing AI-generated questions and regenerate
    setQuestions(prev => prev.filter(q => !q.id.startsWith('ai_')));
    await handleGenerateQuestions();
  };

  const handleAddManualQuestion = () => {
    if (!manualQuestion.question.trim()) {
      alert(isZh ? '请输入题目' : 'Please enter a question');
      return;
    }
    const filteredOptions = manualQuestion.options.filter(o => o.trim());
    if (filteredOptions.length < 2) {
      alert(isZh ? '请至少输入2个选项' : 'Please enter at least 2 options');
      return;
    }

    const newQuestion = {
      id: `manual_${generateId()}`,
      type: filteredOptions.length === 2 ? 'true_false' : 'multiple_choice',
      question: manualQuestion.question,
      options: filteredOptions,
      answerIndex: manualQuestion.answerIndex,
      answer: filteredOptions[manualQuestion.answerIndex],
      explanation: '',
      points: manualQuestion.points,
      difficulty: 'HSK1'
    };

    setQuestions(prev => [...prev, newQuestion]);
    setManualQuestion({ question: '', options: ['', '', '', ''], answerIndex: 0, points: 10 });
  };

  const handleUseExamples = () => {
    setQuestions(DEFAULT_QUESTIONS);
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleCreateRoom = () => {
    if (questions.length === 0) {
      alert(t.noQuestions);
      return;
    }

    const code = generateRoomCode();
    const newRoom = {
      roomCode: code,
      status: 'lobby',
      mode,
      scene,
      questions,
      currentQuestionIndex: 0,
      students: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    saveRoom(newRoom);
    setRoomCode(code);
    setRoom(newRoom);
    setView('lobby');
  };

  const handleAddMockStudent = () => {
    const availableMock = MOCK_STUDENTS.filter(
      name => !room?.students?.some(s => s.name === name)
    );
    if (availableMock.length === 0) return;

    const mockStudent = {
      id: generateId(),
      name: availableMock[0],
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      score: 0,
      currentQuestionIndex: 0,
      answers: [],
      progress: 0,
      joinedAt: Date.now(),
      isMock: true
    };

    const updatedRoom = {
      ...room,
      students: [...(room.students || []), mockStudent]
    };
    saveRoom(updatedRoom);
    setRoom(updatedRoom);
  };

  const handleStartGame = () => {
    const updatedRoom = { ...room, status: 'playing', startedAt: Date.now() };
    saveRoom(updatedRoom);
    setRoom(updatedRoom);
    setView('playing');
    setGameTimer(0);
  };

  const handleJoinRoom = () => {
    if (!joinName.trim()) {
      alert(t.enterNameError);
      return;
    }

    const targetRoom = getRoom(roomCode);
    if (!targetRoom) {
      alert(t.roomNotFound);
      return;
    }

    const student = {
      id: generateId(),
      name: joinName,
      avatar: selectedAvatar,
      score: 0,
      currentQuestionIndex: 0,
      answers: [],
      progress: 0,
      joinedAt: Date.now(),
      isMock: false
    };

    setStudentId(student.id);
    const updatedRoom = {
      ...targetRoom,
      students: [...(targetRoom.students || []), student]
    };
    saveRoom(updatedRoom);
    setRoom(updatedRoom);
    setRole('student');
    setView(targetRoom.status === 'playing' ? 'playing' : 'lobby');
  };

  const handleSubmitAnswer = (answerIndex) => {
    if (!room || !room.questions) return;

    const currentQuestion = room.questions[room.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.answerIndex;
    const pointsEarned = isCorrect ? currentQuestion.points : 0;

    const studentAnswer = {
      questionId: currentQuestion.id,
      selectedIndex: answerIndex,
      isCorrect,
      pointsEarned,
      answeredAt: Date.now()
    };

    const updatedStudents = (room.students || []).map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          score: s.score + pointsEarned,
          currentQuestionIndex: room.currentQuestionIndex + 1,
          answers: [...s.answers, studentAnswer],
          progress: ((s.score + pointsEarned) / (room.questions.length * 10)) * 100
        };
      }
      return s;
    });

    const updatedRoom = { ...room, students: updatedStudents };
    saveRoom(updatedRoom);
    setRoom(updatedRoom);
    setCurrentAnswer(answerIndex);
    setShowResult(true);

    if (mode === 'self_paced') {
      setTimeout(() => {
        handleNextQuestion();
      }, 1500);
    } else {
      setShowWaiting(true);
    }
  };

  const handleNextQuestion = () => {
    if (!room) return;

    const nextIndex = room.currentQuestionIndex + 1;
    if (nextIndex >= room.questions.length) {
      const updatedRoom = { ...room, status: 'ended' };
      saveRoom(updatedRoom);
      setRoom(updatedRoom);
      setView('ended');
    } else {
      const updatedRoom = { ...room, currentQuestionIndex: nextIndex };
      saveRoom(updatedRoom);
      setRoom(updatedRoom);
    }

    setCurrentAnswer(null);
    setShowResult(false);
    setShowWaiting(false);
    setRevealedAnswer(false);
  };

  const handleShowAnswer = () => {
    setRevealedAnswer(true);
  };

  const handleEndGame = () => {
    const updatedRoom = { ...room, status: 'ended' };
    saveRoom(updatedRoom);
    setRoom(updatedRoom);
    setView('ended');
  };

  const handleReset = () => {
    setView('setup');
    setRole(null);
    setRoomCode('');
    setRoom(null);
    setQuestions([]);
    setCurrentAnswer(null);
    setShowResult(false);
    setShowWaiting(false);
    setGameTimer(0);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/tools/climb-mountain/student?room=${roomCode}`;
    navigator.clipboard.writeText(link);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  // ============ Render Setup ============
  const renderSetup = () => (
    <div className="climb-setup">
      <h1 className="climb-title">{t.title}</h1>
      <p className="climb-subtitle">{t.subtitle}</p>

      <div className="setup-content">
        {/* Left: Settings */}
        <div className="setup-section">
          <h3>{t.gameSettings}</h3>

          <div className="setting-group">
            <label>{t.scene}</label>
            <div className="scene-buttons">
              {Object.entries(SCENES).map(([key, s]) => (
                <button
                  key={key}
                  className={`scene-btn ${scene === key ? 'active' : ''}`}
                  onClick={() => setScene(key)}
                >
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <label>{t.gameMode}</label>
            <div className="mode-buttons">
              <button
                className={`mode-btn ${mode === 'teacher_led' ? 'active' : ''}`}
                onClick={() => setMode('teacher_led')}
              >
                <span className="mode-name">{t.teacherLed}</span>
                <span className="mode-desc">{t.teacherLedDesc}</span>
              </button>
              <button
                className={`mode-btn ${mode === 'self_paced' ? 'active' : ''}`}
                onClick={() => setMode('self_paced')}
              >
                <span className="mode-name">{t.selfPaced}</span>
                <span className="mode-desc">{t.selfPacedDesc}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Questions */}
        <div className="setup-section">
          <h3>{t.questionSource}</h3>

          <div className="question-tabs">
            <button
              className={`tab-btn ${questionTab === 'ai' ? 'active' : ''}`}
              onClick={() => setQuestionTab('ai')}
            >
              {t.aiTopic}
            </button>
            <button
              className={`tab-btn ${questionTab === 'text' ? 'active' : ''}`}
              onClick={() => setQuestionTab('text')}
            >
              {t.fromText}
            </button>
            <button
              className={`tab-btn ${questionTab === 'manual' ? 'active' : ''}`}
              onClick={() => setQuestionTab('manual')}
            >
              {t.manual}
            </button>
          </div>

          <div className="question-content">
            {questionTab === 'ai' && (
              <div className="ai-tab">
                <div className="input-group">
                  <label>{t.topic}</label>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={t.topicPlaceholder}
                  />
                </div>

                <div className="input-group">
                  <label>{t.hskLevel}</label>
                  <select
                    value={aiLevel}
                    onChange={(e) => setAiLevel(e.target.value)}
                    className="puzzle-select"
                  >
                    <option value="HSK1">HSK 1</option>
                    <option value="HSK2">HSK 2</option>
                    <option value="HSK3">HSK 3</option>
                    <option value="HSK4">HSK 4</option>
                    <option value="HSK5">HSK 5</option>
                    <option value="HSK6">HSK 6</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>{t.questionCount}</label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(e.target.value)}
                    className="puzzle-select"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>{t.questionTypes}</label>
                  <div className="checkbox-group">
                    <label className="puzzle-checkbox">
                      <input
                        type="checkbox"
                        checked={aiQuestionTypes.includes('multiple_choice')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAiQuestionTypes([...aiQuestionTypes, 'multiple_choice']);
                          } else {
                            setAiQuestionTypes(aiQuestionTypes.filter(t => t !== 'multiple_choice'));
                          }
                        }}
                      />
                      <span>{isZh ? '单选题' : 'Multiple Choice'}</span>
                    </label>
                    <label className="puzzle-checkbox">
                      <input
                        type="checkbox"
                        checked={aiQuestionTypes.includes('true_false')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAiQuestionTypes([...aiQuestionTypes, 'true_false']);
                          } else {
                            setAiQuestionTypes(aiQuestionTypes.filter(t => t !== 'true_false'));
                          }
                        }}
                      />
                      <span>{isZh ? '判断题' : 'True/False'}</span>
                    </label>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={handleGenerateQuestions}
                  disabled={isGenerating || aiQuestionTypes.length === 0}
                >
                  {isGenerating ? t.generating : t.generateQuestions}
                </button>

                <div className="ai-warning">{t.aiWarning}</div>
              </div>
            )}

            {questionTab === 'text' && (
              <div className="text-tab">
                <div className="coming-soon">
                  {isZh
                    ? '根据文本生成题目功能即将推出，敬请期待...'
                    : 'Generating questions from text is coming soon. Stay tuned!'}
                </div>
              </div>
            )}

            {questionTab === 'manual' && (
              <div className="manual-tab">
                <div className="input-group">
                  <label>{t.question}</label>
                  <input
                    type="text"
                    value={manualQuestion.question}
                    onChange={(e) => setManualQuestion(q => ({ ...q, question: e.target.value }))}
                    placeholder={isZh ? '输入题目...' : 'Enter question...'}
                  />
                </div>

                <div className="options-group">
                  <label>{t.options}</label>
                  {manualQuestion.options.map((opt, i) => (
                    <div key={i} className="option-row">
                      <input
                        type="radio"
                        name="correct"
                        checked={manualQuestion.answerIndex === i}
                        onChange={() => setManualQuestion(q => ({ ...q, answerIndex: i }))}
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...manualQuestion.options];
                          newOpts[i] = e.target.value;
                          setManualQuestion(q => ({ ...q, options: newOpts }));
                        }}
                        placeholder={`${isZh ? '选项' : 'Option'} ${i + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="input-group">
                  <label>{t.points}</label>
                  <input
                    type="number"
                    value={manualQuestion.points}
                    onChange={(e) => setManualQuestion(q => ({ ...q, points: parseInt(e.target.value) || 10 }))}
                    min="1"
                    max="100"
                  />
                </div>

                <div className="btn-row">
                  <button className="btn-secondary" onClick={handleAddManualQuestion}>
                    {t.addQuestion}
                  </button>
                  <button className="btn-outline" onClick={handleUseExamples}>
                    {t.useExamples}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Questions List */}
      {questions.length > 0 && reviewMode && (
        <div className="review-section">
          <h2>{t.reviewTitle}</h2>
          <div className="review-count">
            {t.totalQuestions.replace('{n}', questions.length)}
          </div>

          {questions.map((q, i) => (
            <div key={q.id} className="review-card">
              <span className="q-index">{i + 1}</span>
              <div className="q-text">{q.question}</div>
              <div className="q-options">
                {q.options.map((opt, j) => (
                  <div key={j} className={`q-option ${j === q.answerIndex ? 'is-correct' : ''}`}>
                    {String.fromCharCode(65 + j)}. {opt}
                    {j === q.answerIndex && ' ✓'}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <div className="q-explanation">{t.explanation}: {q.explanation}</div>
              )}
              <button className="q-delete" onClick={() => handleDeleteQuestion(q.id)}>
                {t.delete}
              </button>
            </div>
          ))}

          <div className="review-actions">
            <button className="btn-secondary" onClick={handleRegenerateQuestions} disabled={isGenerating}>
              {isGenerating ? t.generating : t.regenerate}
            </button>
            <button className="btn-primary" onClick={() => { setReviewMode(false); handleCreateRoom(); }}>
              {t.confirmAndCreate}
            </button>
          </div>
        </div>
      )}

      {questions.length > 0 && !reviewMode && (
        <div className="questions-list">
          <h3>{t.totalQuestions.replace('{n}', questions.length)}</h3>
          {questions.slice(0, 5).map((q, i) => (
            <div key={q.id} className="question-item">
              <div className="q-num">{i + 1}</div>
              <div className="q-content">
                <div className="q-text">{q.question}</div>
                <div className="q-options">
                  {q.options.map((opt, j) => (
                    <span key={j} className={`q-opt ${j === q.answerIndex ? 'correct' : ''}`}>
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
              <button className="btn-delete" onClick={() => handleDeleteQuestion(q.id)}>
                {t.delete}
              </button>
            </div>
          ))}
          {questions.length > 5 && (
            <div className="questions-more">
              +{questions.length - 5} {isZh ? '更多...' : 'more...'}
            </div>
          )}
        </div>
      )}

      {questions.length > 0 && !reviewMode && (
        <div className="setup-actions">
          <button className="btn-secondary" onClick={() => setReviewMode(true)}>
            {t.reviewTitle}
          </button>
          <button className="btn-primary large" onClick={() => { setReviewMode(true); }}>
            {t.launch}
          </button>
        </div>
      )}

      {questions.length === 0 && (
        <div className="setup-actions">
          <button className="btn-primary large" onClick={handleCreateRoom} disabled={questions.length === 0}>
            {t.createRoom}
          </button>
        </div>
      )}
    </div>
  );

  // ============ Render Lobby ============
  const renderLobby = () => (
    <div className="climb-lobby">
      <h2>{t.lobbyTitle}</h2>

      <div className="room-info">
        <div className="room-code-box">
          <label>{t.roomCodeText}</label>
          <div className="code-display">{roomCode}</div>
          <button className="btn-outline" onClick={handleCopyCode}>
            {t.copyCode}
          </button>
        </div>

        <div className="room-link">
          <label>{t.shareLink}</label>
          <code>{window.location.origin}/tools/climb-mountain/student?room={roomCode}</code>
          <button className="btn-outline" onClick={handleCopyLink}>
            {t.copyLink}
          </button>
        </div>
      </div>

      <div className="demo-notice">{t.localDemo}</div>

      <div className="students-section">
        <h3>{t.students}</h3>
        <button className="btn-secondary" onClick={handleAddMockStudent}>
          {t.addMockStudent}
        </button>

        <div className="students-list">
          {(!room?.students || room.students.length === 0) ? (
            <div className="no-students">{t.noStudents}</div>
          ) : (
            room.students.map((s, i) => (
              <div key={s.id} className="student-item">
                <span className="student-avatar">{s.avatar?.emoji}</span>
                <span className="student-name">{s.name}</span>
                {s.isMock && <span className="mock-badge">Mock</span>}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lobby-actions">
        <button className="btn-secondary" onClick={handleReset}>
          {t.back}
        </button>
        <button
          className="btn-primary large"
          onClick={handleStartGame}
          disabled={!room?.students || room.students.length === 0}
        >
          {t.startGame}
        </button>
      </div>
    </div>
  );

  // ============ Render Join ============
  const renderJoin = () => (
    <div className="climb-join">
      <h2>{t.joinTitle}</h2>

      <div className="join-form">
        <div className="input-group">
          <label>{t.enterCode}</label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={4}
            placeholder="XXXX"
          />
        </div>

        <div className="input-group">
          <label>{t.enterName}</label>
          <input
            type="text"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            placeholder={isZh ? '你的名字' : 'Your name'}
          />
        </div>

        <div className="input-group">
          <label>{t.selectAvatar}</label>
          <div className="avatar-grid">
            {AVATARS.map(a => (
              <button
                key={a.id}
                className={`avatar-btn ${selectedAvatar.id === a.id ? 'selected' : ''}`}
                onClick={() => setSelectedAvatar(a)}
              >
                <span className="avatar-emoji">{a.emoji}</span>
                <span className="avatar-name">{isZh ? a.name.split(' ')[0] : a.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="join-actions">
        <button className="btn-secondary" onClick={handleReset}>
          {t.back}
        </button>
        <button className="btn-primary" onClick={handleJoinRoom}>
          {t.startClimbing}
        </button>
      </div>
    </div>
  );

  // ============ Render Playing ============
  const renderPlaying = () => {
    const currentQ = room?.questions?.[room.currentQuestionIndex];
    const myStudent = room?.students?.find(s => s.id === studentId);
    const maxScore = (room?.questions?.length || 1) * 10;

    return (
      <div className={`climb-game scene-${scene}`}>
        {/* Header */}
        <div className="game-header">
          <div className="header-left">
            <span className="question-counter">
              {t.questionNum
                .replace('{n}', (room.currentQuestionIndex + 1))
                .replace('{total}', room.questions.length)}
            </span>
            <span className="timer">{formatTime(gameTimer)}</span>
          </div>
          <div className="header-right">
            {myStudent && (
              <span className="my-score">{t.score}: {myStudent.score}</span>
            )}
          </div>
        </div>

        {/* Mountain Scene */}
        <div className="mountain-scene">
          <div className="mountain-path">
            {(room?.students || []).map((s, i) => {
              const progress = s.progress || ((s.score / maxScore) * 100);
              return (
                <div
                  key={s.id}
                  className="climber"
                  style={{ bottom: `${10 + (i * 15)}%`, left: `${Math.min(progress, 90)}%` }}
                  title={s.name}
                >
                  <span className="climber-avatar">{s.avatar?.emoji}</span>
                  <span className="climber-name">{s.name}</span>
                  <span className="climber-score">{s.score}</span>
                </div>
              );
            })}
            <div className="finish-flag">🏁</div>
          </div>
        </div>

        {/* Question Panel */}
        <div className="question-panel">
          {currentQ ? (
            <>
              <div className="question-text">{currentQ.question}</div>
              <div className="options-grid">
                {currentQ.options.map((opt, i) => {
                  let state = '';
                  if (showResult) {
                    if (i === currentQ.answerIndex) state = 'correct';
                    else if (i === currentAnswer && i !== currentQ.answerIndex) state = 'wrong';
                  } else if (currentAnswer === i) {
                    state = 'selected';
                  }

                  return (
                    <button
                      key={i}
                      className={`option-btn ${state}`}
                      onClick={() => !showResult && !currentAnswer && handleSubmitAnswer(i)}
                      disabled={showResult || currentAnswer !== null}
                    >
                      <span className="opt-label">{String.fromCharCode(65 + i)}</span>
                      <span className="opt-text">{opt}</span>
                      {revealedAnswer && i === currentQ.answerIndex && <span className="correct-badge">✓</span>}
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <div className={`result-banner ${currentAnswer === currentQ.answerIndex ? 'correct' : 'wrong'}`}>
                  {currentAnswer === currentQ.answerIndex ? t.correctFeedback : t.wrongFeedback}
                  {currentAnswer !== currentQ.answerIndex && (
                    <span> {currentQ.answer}: {currentQ.options[currentQ.answerIndex]}</span>
                  )}
                </div>
              )}

              {showWaiting && (
                <div className="waiting-banner">{t.waitTeacher}</div>
              )}
            </>
          ) : (
            <div className="no-question">Loading...</div>
          )}
        </div>

        {/* Teacher Controls */}
        {role === 'teacher' && (
          <div className="teacher-controls">
            <button className="btn-primary" onClick={handleNextQuestion}>
              {t.nextQuestion}
            </button>
            <button className="btn-secondary" onClick={handleShowAnswer}>
              {t.showAnswer}
            </button>
            <button className="btn-danger" onClick={handleEndGame}>
              {t.endGame}
            </button>
          </div>
        )}

        {/* Leaderboard */}
        <div className="leaderboard">
          <h4>{t.ranking}</h4>
          {room?.students?.sort((a, b) => b.score - a.score).map((s, i) => (
            <div key={s.id} className={`rank-item ${i === 0 ? 'gold' : ''}`}>
              <span className="rank-num">{i + 1}</span>
              <span className="rank-avatar">{s.avatar?.emoji}</span>
              <span className="rank-name">{s.name}</span>
              <span className="rank-score">{s.score}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============ Render Ended ============
  const renderEnded = () => {
    const sorted = [...(room?.students || [])].sort((a, b) => b.score - a.score);
    const champion = sorted[0];

    return (
      <div className="climb-ended">
        <h2>{t.gameOver}</h2>

        {champion && (
          <div className="champion">
            <span className="champion-avatar">{champion.avatar?.emoji}</span>
            <span className="champion-crown">👑</span>
            <div className="champion-info">
              <div className="champion-name">{champion.name}</div>
              <div className="champion-score">{champion.score} {t.score}</div>
            </div>
          </div>
        )}

        <div className="final-ranking">
          <h3>{t.ranking}</h3>
          {sorted.map((s, i) => (
            <div key={s.id} className={`final-rank-item ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
              <span className="rank-num">#{i + 1}</span>
              <span className="rank-avatar">{s.avatar?.emoji}</span>
              <span className="rank-name">{s.name}</span>
              <span className="rank-score">{s.score}</span>
              <span className="rank-accuracy">
                {s.answers?.filter(a => a.isCorrect).length || 0}/{s.answers?.length || 0}
              </span>
            </div>
          ))}
        </div>

        <div className="ended-actions">
          <button className="btn-secondary" onClick={handleReset}>
            {t.backToSetup}
          </button>
          <button className="btn-primary" onClick={() => window.location.href = '/tools'}>
            {t.backToTools}
          </button>
        </div>
      </div>
    );
  };

  // ============ Main Render ============
  return (
    <div className="climb-container">
      {/* Role Selection */}
      {view === 'setup' && !role && (
        <div className="role-selection">
          <h1 className="climb-title">{t.title}</h1>
          <p className="climb-subtitle">{t.subtitle}</p>

          <div className="role-buttons">
            <button className="role-btn teacher" onClick={() => setRole('teacher')}>
              <span className="role-icon">👨‍🏫</span>
              <span className="role-name">{isZh ? '我是老师' : "I'm a Teacher"}</span>
              <span className="role-desc">{isZh ? '创建游戏房间' : 'Create a game room'}</span>
            </button>
            <button className="role-btn student" onClick={() => setRole('student')}>
              <span className="role-icon">👨‍🎓</span>
              <span className="role-name">{isZh ? '我是学生' : "I'm a Student"}</span>
              <span className="role-desc">{isZh ? '加入游戏房间' : 'Join a game room'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Teacher Flow */}
      {role === 'teacher' && view === 'setup' && renderSetup()}
      {role === 'teacher' && view === 'lobby' && renderLobby()}
      {role === 'teacher' && (view === 'playing' || view === 'ended') && (room?.status === 'playing' ? renderPlaying() : room?.status === 'ended' ? renderEnded() : renderLobby())}

      {/* Student Flow */}
      {role === 'student' && view === 'setup' && renderJoin()}
      {role === 'student' && view === 'lobby' && (
        <div className="waiting-room">
          <h2>{t.waitingForTeacher}</h2>
          <div className="waiting-info">
            <span>{t.roomCodeLabel}: {roomCode}</span>
          </div>
          <button className="btn-secondary" onClick={handleReset}>
            {t.back}
          </button>
        </div>
      )}
      {role === 'student' && view === 'playing' && renderPlaying()}
      {role === 'student' && view === 'ended' && renderEnded()}
    </div>
  );
}

export default ClimbMountainQuiz;