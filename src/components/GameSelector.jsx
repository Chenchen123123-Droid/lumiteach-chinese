import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './GameSelector.css';

/**
 * 游戏选择组件
 * 用于选择要生成的游戏类型
 * 使用 LanguageContext 获取翻译
 */

// 游戏配置的多语言（保留5种语言支持）
const gameTranslations = {
  'zh-CN': {
    // 新增工具
    slingshot: {
      name: '弹弓大作战',
      description: '输入主题或批量导入题目，把A/B选择题变成弹弓射击挑战',
      difficulty: ['课堂互动'],
      features: ['A/B选择题', '动画音效', '词汇复习']
    },
    typing: {
      name: '中文输入挑战',
      description: '老师导入词库，学生根据提示输入中文，限时挑战打字速度',
      difficulty: ['个人挑战'],
      features: ['中文输入', '听写练习', '排行榜']
    },
    snake: {
      name: '成语贪吃蛇',
      description: '控制小蛇按顺序吃掉汉字，完成成语挑战',
      difficulty: ['课堂游戏'],
      features: ['成语复习', '汉字顺序', '词语记忆']
    },
    disappearing: {
      name: '课文消失挑战',
      description: '逐轮隐藏文字，锻炼学生的记忆和复述能力',
      difficulty: ['初级', '中级', '高级'],
      features: ['隐藏20%~80%', '记忆训练', '朗读练习']
    },
    sentence: {
      name: '句子排序游戏',
      description: '打乱句子顺序，让学生重新排列',
      difficulty: ['初级', '中级'],
      features: ['拖拽排序', '逻辑思维', '语法练习']
    },
    matching: {
      name: '词语配对游戏',
      description: '将中文词语与对应的拼音或解释配对',
      difficulty: ['初级', '中级'],
      features: ['词语配对', '词汇记忆', '趣味互动']
    },
    gomoku: {
      name: '教学五子棋',
      description: '输入词语生成棋盘，两玩家轮流下棋，先连成五个获胜',
      difficulty: ['初级', '中级', '高级'],
      features: ['双人对战', '五连胜负', '词汇复习']
    },
    gacha: {
      name: '词语扭蛋机',
      description: '输入词语，随机抽取展示，适合课堂互动和词汇练习',
      difficulty: ['初级', '中级'],
      features: ['随机抽词', '趣味互动', '朗读练习']
    },
    guesschar: {
      name: '猜字大挑战',
      description: '答案被方块遮挡，逐步揭晓让学生猜词，适合课堂互动',
      difficulty: ['初级', '中级', '高级', '挑战'],
      features: ['逐步揭晓', '猜词互动', '投屏友好']
    },
    pinyinwheel: {
      name: '拼音大转盘',
      description: '随机生成声母、韵母和声调组合，练习拼音发音',
      difficulty: ['初级', '中级'],
      features: ['拼音练习', '随机组合', '语音朗读']
    },
    pinyinguess: {
      name: '看拼音猜汉字',
      description: '显示拼音让学生猜汉字，老师点击揭晓答案',
      difficulty: ['初级', '中级', '高级'],
      features: ['拼音认读', '汉字练习', '投屏友好']
    },
    luckybox: {
      name: '词语幸运盒',
      description: '每轮显示3个词语和3个神秘盒，开奖时随机分配分数',
      difficulty: ['初级', '中级'],
      features: ['随机开奖', '积分游戏', '趣味互动']
    },
    minesweeper: {
      name: '词语扫雷',
      description: '两队轮流点击格子，点到安全格得分，点到地雷不得分',
      difficulty: ['初级', '中级', '高级'],
      features: ['两队对抗', '扫雷玩法', '积分竞赛']
    },
    worksheet: {
      name: '汉字字帖生成器',
      description: '输入汉字生成可打印的田字格/米字格练习字帖',
      difficulty: ['备课工具'],
      features: ['A4打印', '米字格', '田字格', 'PDF导出']
    },
    luckypicker: {
      name: '点名神器',
      description: '转盘抽人、随机点名、分组对抗，课堂互动必备',
      difficulty: ['课堂必备'],
      features: ['转盘抽奖', '随机点名', '智能分组']
    },
    seatmanager: {
      name: '座位管理工具',
      description: '创建班级座位表，支持拖拽换座、空座设置、锁定座位',
      difficulty: ['课堂管理'],
      features: ['拖拽换座', '空座设置', '锁定座位', 'PDF导出']
    },
    hanzicomponent: {
      name: '汉字部首词卡生成器',
      description: '输入汉字，自动拆分部件结构，生成可打印的彩色词卡',
      difficulty: ['备课工具'],
      features: ['自动拆字', '彩色词卡', 'A4打印', 'PDF导出']
    },
    chineseuno: {
      name: '中文 UNO 卡牌生成器',
      description: '输入中文词表，一键生成 UNO 风格卡牌',
      difficulty: ['备课工具'],
      features: ['快速模式', '完整模式', '功能牌', 'PDF导出']
    },
    wordcloud: {
      name: '词云生成器',
      description: '输入词语，自动生成精美词云图片',
      difficulty: ['备课展示'],
      features: ['多种形状', '配色方案', 'PNG下载', '课堂友好']
    },
    spotit: {
      name: 'Spot It 卡牌生成器',
      description: '输入词语生成圆形 Spot It 找相同词卡牌，适合课堂词汇游戏',
      difficulty: ['备课工具'],
      features: ['标准模式', '自由模式', 'PDF导出', '黑白/彩色']
    }
  },
  'zh-TW': {
    // 新增工具
    slingshot: {
      name: '彈弓大作戰',
      description: '輸入主題或批量導入題目，把A/B選擇題變成彈弓射擊挑戰',
      difficulty: ['課堂互動'],
      features: ['A/B選擇題', '動畫音效', '詞彙複習']
    },
    typing: {
      name: '中文輸入挑戰',
      description: '老師導入詞庫，學生根據提示輸入中文，限時挑戰打字速度',
      difficulty: ['個人挑戰'],
      features: ['中文輸入', '聽寫練習', '排行榜']
    },
    snake: {
      name: '成語貪吃蛇',
      description: '控制小蛇按順序吃掉漢字，完成成語挑戰',
      difficulty: ['課堂遊戲'],
      features: ['成語複習', '漢字順序', '詞語記憶']
    },
    disappearing: {
      name: '課文消失挑戰',
      description: '逐輪隱藏文字，鍛鍊學生的記憶和複述能力',
      difficulty: ['初級', '中級', '高級'],
      features: ['隱藏20%~80%', '記憶訓練', '朗讀練習']
    },
    sentence: {
      name: '句子排序遊戲',
      description: '打亂句子順序，讓學生重新排列',
      difficulty: ['初級', '中級'],
      features: ['拖拽排序', '邏輯思維', '語法練習']
    },
    matching: {
      name: '詞語配對遊戲',
      description: '將中文詞語與對應的拼音或解釋配對',
      difficulty: ['初級', '中級'],
      features: ['詞語配對', '詞彙記憶', '趣味互動']
    },
    gomoku: {
      name: '教學五子棋',
      description: '輸入詞語生成棋盤，兩玩家輪流下棋，先連成五個獲勝',
      difficulty: ['初級', '中級', '高級'],
      features: ['雙人對戰', '五連勝負', '詞彙複習']
    },
    gacha: {
      name: '詞語扭蛋機',
      description: '輸入詞語，隨機抽取展示，適合課堂互動和詞彙練習',
      difficulty: ['初級', '中級'],
      features: ['隨機抽詞', '趣味互動', '朗讀練習']
    },
    guesschar: {
      name: '猜字大挑戰',
      description: '答案被方塊遮擋，逐步揭曉讓學生猜詞，適合課堂互動',
      difficulty: ['初級', '中級', '高級', '挑戰'],
      features: ['逐步揭曉', '猜詞互動', '投屏友好']
    },
    pinyinwheel: {
      name: '拼音大轉盤',
      description: '隨機生成聲母、韻母和聲調組合，練習拼音發音',
      difficulty: ['初級', '中級'],
      features: ['拼音練習', '隨機組合', '語音朗讀']
    },
    pinyinguess: {
      name: '看拼音猜漢字',
      description: '顯示拼音讓學生猜漢字，老師點擊揭曉答案',
      difficulty: ['初級', '中級', '高級'],
      features: ['拼音認讀', '漢字練習', '投屏友好']
    },
    luckybox: {
      name: '詞語幸運盒',
      description: '每輪顯示3個詞語和3個神秘盒，開獎時隨機分配分數',
      difficulty: ['初級', '中級'],
      features: ['隨機開獎', '積分遊戲', '趣味互動']
    },
    minesweeper: {
      name: '詞語掃雷',
      description: '兩隊輪流點擊格子，點到安全格得分，點到地雷不得分',
      difficulty: ['初級', '中級', '高級'],
      features: ['兩隊對抗', '掃雷玩法', '積分競賽']
    },
    worksheet: {
      name: '漢字字帖生成器',
      description: '輸入漢字生成可打印的田字格/米字格練習字帖',
      difficulty: ['備課工具'],
      features: ['A4打印', '米字格', '田字格', 'PDF導出']
    },
    luckypicker: {
      name: '點名神器',
      description: '轉盤抽人、隨機點名、分組對抗，課堂互動必備',
      difficulty: ['課堂必備'],
      features: ['轉盤抽獎', '隨機點名', '智能分組']
    },
    seatmanager: {
      name: '座位管理工具',
      description: '建立班級座位表，支持拖曳換座、空座設定、鎖定座位',
      difficulty: ['課堂管理'],
      features: ['拖曳換座', '空座設定', '鎖定座位', 'PDF導出']
    },
    hanzicomponent: {
      name: '漢字部首詞卡生成器',
      description: '輸入漢字，自動拆分部件結構，生成可打印的彩色詞卡',
      difficulty: ['備課工具'],
      features: ['自動拆字', '彩色詞卡', 'A4打印', 'PDF導出']
    },
    chineseuno: {
      name: '中文 UNO 卡牌生成器',
      description: '輸入中文詞表，一鍵生成 UNO 風格卡牌',
      difficulty: ['備課工具'],
      features: ['快速模式', '完整模式', '功能牌', 'PDF導出']
    },
    wordcloud: {
      name: '詞雲生成器',
      description: '輸入詞語，自動生成精美詞雲圖片',
      difficulty: ['備課展示'],
      features: ['多種形狀', '配色方案', 'PNG下載', '課堂友好']
    },
    spotit: {
      name: 'Spot It 卡牌生成器',
      description: '輸入詞語生成圓形 Spot It 找相同詞卡牌，適合課堂詞彙遊戲',
      difficulty: ['備課工具'],
      features: ['標準模式', '自由模式', 'PDF導出', '黑白/彩色']
    }
  },
  'en': {
    // New tools
    slingshot: {
      name: 'Slingshot Quiz Battle',
      description: 'Turn A/B quiz questions into a slingshot shooting challenge with animation',
      difficulty: ['Classroom Game'],
      features: ['A/B Quiz', 'Animation', 'Vocabulary Review']
    },
    typing: {
      name: 'Chinese Typing Challenge',
      description: 'Students type Chinese from prompts in a timed typing challenge',
      difficulty: ['Personal Challenge'],
      features: ['Chinese Typing', 'Dictation', 'Leaderboard']
    },
    snake: {
      name: 'Idiom Snake Game',
      description: 'Control a snake to collect Chinese characters in the correct order',
      difficulty: ['Classroom Game'],
      features: ['Idiom Review', 'Character Order', 'Vocabulary']
    },
    disappearing: {
      name: 'Text Disappearing Challenge',
      description: 'Progressively hide text to train students\' memory and retelling skills',
      difficulty: ['Beginner', 'Intermediate', 'Advanced'],
      features: ['Hide 20%~80%', 'Memory Training', 'Reading Practice']
    },
    sentence: {
      name: 'Sentence Ordering Game',
      description: 'Shuffle sentence order for students to rearrange',
      difficulty: ['Beginner', 'Intermediate'],
      features: ['Drag & Drop', 'Logical Thinking', 'Grammar Practice']
    },
    matching: {
      name: 'Word Matching Game',
      description: 'Match Chinese words with corresponding pinyin or definitions',
      difficulty: ['Beginner', 'Intermediate'],
      features: ['Word Matching', 'Vocabulary Memory', 'Fun Interaction']
    },
    gomoku: {
      name: 'Teaching Gomoku',
      description: 'Generate board with words, two players take turns, first to connect five wins',
      difficulty: ['Beginner', 'Intermediate', 'Advanced'],
      features: ['Two Players', 'Five in a Row', 'Vocabulary Review']
    },
    gacha: {
      name: 'Word Gacha Machine',
      description: 'Enter words and randomly draw them, perfect for classroom interaction',
      difficulty: ['Beginner', 'Intermediate'],
      features: ['Random Draw', 'Fun Interaction', 'Reading Practice']
    },
    guesschar: {
      name: 'Guess Character Challenge',
      description: 'Answer hidden by blocks, reveal gradually for students to guess',
      difficulty: ['Beginner', 'Intermediate', 'Advanced', 'Challenge'],
      features: ['Gradual Reveal', 'Guessing Game', 'Projector Friendly']
    },
    pinyinwheel: {
      name: 'Pinyin Wheel',
      description: 'Randomly generate initial, final, and tone combinations for pinyin practice',
      difficulty: ['Beginner', 'Intermediate'],
      features: ['Pinyin Practice', 'Random Combo', 'Audio Reading']
    },
    pinyinguess: {
      name: 'Guess Hanzi from Pinyin',
      description: 'Show pinyin for students to guess the hanzi, teacher reveals the answer',
      difficulty: ['Beginner', 'Intermediate', 'Advanced'],
      features: ['Pinyin Reading', 'Hanzi Practice', 'Projector Friendly']
    },
    luckybox: {
      name: 'Lucky Word Box',
      description: 'Each round shows 3 words and 3 mystery boxes, randomly assign scores when revealed',
      difficulty: ['Beginner', 'Intermediate'],
      features: ['Random Reveal', 'Score Game', 'Fun Interaction']
    },
    minesweeper: {
      name: 'Word Minesweeper',
      description: 'Two teams take turns clicking cells, safe cells score points, mines do not',
      difficulty: ['Beginner', 'Intermediate', 'Advanced'],
      features: ['Team Battle', 'Minesweeper', 'Score Competition']
    },
    worksheet: {
      name: 'Hanzi Worksheet Generator',
      description: 'Generate printable Tianzi/Mizi grid practice sheets',
      difficulty: ['备课工具'],
      features: ['A4 Print', 'Tianzi Grid', 'Mizi Grid', 'PDF Export']
    },
    luckypicker: {
      name: 'Lucky Picker',
      description: 'Wheel spin, random draw, group mode - essential classroom tool',
      difficulty: ['Classroom Essential'],
      features: ['Wheel Spin', 'Random Draw', 'Smart Group']
    },
    seatmanager: {
      name: 'Seat Manager',
      description: 'Create class seat charts with drag-and-drop seating, empty seats, and lock features',
      difficulty: ['Classroom Management'],
      features: ['Drag & Drop', 'Empty Seats', 'Lock Seats', 'PDF Export']
    },
    hanzicomponent: {
      name: 'Hanzi Component Flashcard Generator',
      description: 'Enter Hanzi to generate component structure flashcards for printing',
      difficulty: ['Planning Tool'],
      features: ['Auto Components', 'Color Cards', 'A4 Print', 'PDF Export']
    },
    chineseuno: {
      name: 'Chinese UNO Card Generator',
      description: 'Generate UNO-style cards from Chinese word lists',
      difficulty: ['Planning Tool'],
      features: ['Quick Mode', 'Full Game', 'Special Cards', 'PDF Export']
    },
    wordcloud: {
      name: 'Word Cloud Generator',
      description: 'Generate beautiful word cloud images from word lists',
      difficulty: ['Presentation Tool'],
      features: ['Multiple Shapes', 'Color Palettes', 'PNG Download', 'Classroom Ready']
    },
    spotit: {
      name: 'Spot It Card Generator',
      description: 'Generate printable circle Spot It matching cards for classroom',
      difficulty: ['Planning Tool'],
      features: ['Standard Mode', 'Free Mode', 'PDF Export', 'Color/B&W']
    }
  },
  'ko': {
    disappearing: {
      name: '텍스트 사라짐 도전',
      description: '점진적으로 텍스트를 숨겨 학생의 기억력과 재진술 능력을 훈련합니다',
      difficulty: ['초급', '중급', '고급'],
      features: ['20%~80% 숨기기', '기억력 훈련', '읽기 연습']
    },
    sentence: {
      name: '문장 순서 맞추기',
      description: '문장 순서를 섞어 학생이 다시 배열하게 합니다',
      difficulty: ['초급', '중급'],
      features: ['드래그 정렬', '논리적 사고', '문법 연습']
    },
    matching: {
      name: '단어 매칭 게임',
      description: '중국어 단어와 해당 병음 또는 정의를 매칭합니다',
      difficulty: ['초급', '중급'],
      features: ['단어 매칭', '어휘 기억', '재미있는 인터랙션']
    },
    gomoku: {
      name: '교육용 오목',
      description: '단어로 보드를 생성하고 두 플레이어가 번갈아 두며, 먼저 5개 연결하면 승리',
      difficulty: ['초급', '중급', '고급'],
      features: ['2인 대전', '오목 승부', '어휘 복습']
    },
    gacha: {
      name: '단어 가챠 기계',
      description: '단어를 입력하고 무작위로 뽑기, 교실 인터랙션에 적합',
      difficulty: ['초급', '중급'],
      features: ['무작위 뽑기', '재미있는 인터랙션', '읽기 연습']
    },
    guesschar: {
      name: '글자 맞추기 챌린지',
      description: '블록으로 가려진 정답을 점진적으로 공개하며 학생이 맞추는 게임',
      difficulty: ['초급', '중급', '고급', '도전'],
      features: ['점진적 공개', '맞추기 게임', '프로젝터 친화적']
    },
    pinyinwheel: {
      name: '병음 룰렛',
      description: '초성, 중성, 성조를 무작위로 조합하여 병음 발음 연습',
      difficulty: ['초급', '중급'],
      features: ['병음 연습', '무작위 조합', '음성 읽기']
    },
    pinyinguess: {
      name: '병음으로 한자 맞추기',
      description: '병음을 보고 한자를 맞추게 하고, 선생님이 정답을 공개',
      difficulty: ['초급', '중급', '고급'],
      features: ['병음 읽기', '한자 연습', '프로젝터 친화적']
    },
    luckybox: {
      name: '단어 럭키 박스',
      description: '각 라운드에서 3개의 단어와 3개의 미스터리 박스를 표시, 공개 시 무작위 점수 배정',
      difficulty: ['초급', '중급'],
      features: ['무작위 공개', '점수 게임', '재미있는 인터랙션']
    },
    minesweeper: {
      name: '단어 지뢰찾기',
      description: '두 팀이 번갈아 클릭하며, 안전한 칸은 점수 획득, 지뢰는 점수 없음',
      difficulty: ['초급', '중급', '고급'],
      features: ['팀 대결', '지뢰찾기', '점수 경쟁']
    },
    worksheet: {
      name: '한자练习지 생성기',
      description: '한자를 입력하여 인쇄 가능한 천자격/미자격 联系지 생성',
      difficulty: ['계획 도구'],
      features: ['A4 인쇄', '천자격', '미자격', 'PDF 내보내기']
    },
    luckypicker: {
      name: '럭키 피커',
      description: '룰렛, 무작위 추첨, 그룹 모드 - 교실 필수 도구',
      difficulty: ['교실 필수'],
      features: ['룰렛', '무작위 추첨', '스마트 그룹']
    },
    seatmanager: {
      name: '좌석 관리 도구',
      description: '클래스 좌석표 작성, 드래그 앤 드롭 좌석 이동, 공석 설정',
      difficulty: ['교실 관리'],
      features: ['드래그 이동', '공석 설정', '좌석 잠금', 'PDF 내보내기']
    },
    hanzicomponent: {
      name: '한자 部首 플래시카드 생성기',
      description: '한자를 입력하여 구성 부재 구조 플래시카드 생성',
      difficulty: ['계획 도구'],
      features: ['자동 분해', '컬러 카드', 'A4 인쇄', 'PDF 내보내기']
    },
    wordcloud: {
      name: '단어 클라우드 생성기',
      description: '단어 목록에서 아름다운 클라우드 이미지 생성',
      difficulty: ['演示 도구'],
      features: ['여러 모양', '컬러 팔레트', 'PNG 출력', '수업 준비']
    },
    spotit: {
      name: 'Spot It 카드 생성기',
      description: '단어를 입력하여 Spot It 매칭 카드 생성, 교실 어휘 게임에 적합',
      difficulty: ['계획 도구'],
      features: ['표준 모드', '자유 모드', 'PDF 내보내기', '컬러/흑백']
    }
  },
  'ja': {
    disappearing: {
      name: 'テキスト消失チャレンジ',
      description: '徐々にテキストを隠して、学生の記憶力と復唱能力を鍛えます',
      difficulty: ['初級', '中級', '上級'],
      features: ['20%~80%非表示', '記憶トレーニング', '読み上げ練習']
    },
    sentence: {
      name: '文順序ゲーム',
      description: '文の順序をシャッフルして、学生が並べ直します',
      difficulty: ['初級', '中級'],
      features: ['ドラッグ＆ドロップ', '論理的思考', '文法練習']
    },
    matching: {
      name: '単語マッチングゲーム',
      description: '中国語単語と対応するピンインまたは定義をマッチング',
      difficulty: ['初級', '中級'],
      features: ['単語マッチング', '語彙記憶', '楽しいインタラクション']
    },
    gomoku: {
      name: '教育用五目並べ',
      description: '単語でボードを生成し、二人のプレイヤーが交互に打ち、先に五つ並べた方が勝ち',
      difficulty: ['初級', '中級', '上級'],
      features: ['二人対戦', '五目並べ', '語彙復習']
    },
    gacha: {
      name: '単語ガチャ',
      description: '単語を入力してランダムに引く、教室のインタラクションに最適',
      difficulty: ['初級', '中級'],
      features: ['ランダムドロー', '楽しいインタラクション', '読み上げ練習']
    },
    guesschar: {
      name: '漢字当てチャレンジ',
      description: 'ブロックで隠された答えを徐々に公開し、学生に当てさせるゲーム',
      difficulty: ['初級', '中級', '上級', 'チャレンジ'],
      features: ['段階的公開', '当てゲーム', 'プロジェクター対応']
    },
    pinyinwheel: {
      name: 'ピンインルーレット',
      description: '声母、韻母、声調をランダムに組み合わせてピンイン発音練習',
      difficulty: ['初級', '中級'],
      features: ['ピンイン練習', 'ランダム組合せ', '音声読み上げ']
    },
    pinyinguess: {
      name: 'ピンインで漢字を当て',
      description: 'ピンインを表示して学生に漢字を当てさせ、先生が正解を公開',
      difficulty: ['初級', '中級', '上級'],
      features: ['ピンイン読み', '漢字練習', 'プロジェクター対応']
    },
    luckybox: {
      name: '単語ラッキーボックス',
      description: '各ラウンドで3つの単語と3つのミステリーボックスを表示、公開時にランダムにスコアを割り当て',
      difficulty: ['初級', '中級'],
      features: ['ランダム公開', 'スコアゲーム', '楽しいインタラクション']
    },
    minesweeper: {
      name: '単語マインスイーパー',
      description: '2チームが交代でマスをクリック、安全なマスは得点、地雷は得点なし',
      difficulty: ['初級', '中級', '上級'],
      features: ['チーム対戦', 'マインスイーパー', '得点競争']
    },
    worksheet: {
      name: '漢字練習シート作成',
      description: '漢字を入力して印刷可能な田字格/米字格練習シートを生成',
      difficulty: ['备课ツール'],
      features: ['A4印刷', '田字格', '米字格', 'PDF出力']
    },
    luckypicker: {
      name: 'ラッキーピッカー',
      description: 'ルーレット、ランダム抽選、グループモード - 教室必須ツール',
      difficulty: ['教室必須'],
      features: ['ルーレット', 'ランダム抽選', 'スマートグループ']
    },
    seatmanager: {
      name: '座席管理ツール',
      description: 'クラス座席表の作成、ドラッグ＆ドロップで座席変更、空席設定',
      difficulty: ['教室管理'],
      features: ['ドラッグ移動', '空席設定', '座席ロック', 'PDF出力']
    },
    hanzicomponent: {
      name: '漢字部首フラッシュカード作成',
      description: '漢字を入力して部首構造フラッシュカードを生成',
      difficulty: ['备课ツール'],
      features: ['自動分解', 'カラーカード', 'A4印刷', 'PDF出力']
    },
    chineseuno: {
      name: '中国UNOカード作成',
      description: '中国語リストからUNOスタイルカードを生成',
      difficulty: ['备课ツール'],
      features: ['クイックモード', 'フルゲーム', 'Special Cards', 'PDF出力']
    },
    wordcloud: {
      name: '単語クラウド作成',
      description: '単語リストから美しいクラウド画像を生成',
      difficulty: ['演示ツール'],
      features: ['複数の形状', 'カラーパレット', 'PNG出力', '授業用']
    },
    spotit: {
      name: 'Spot It カード作成',
      description: 'Spot It マ칭カード生成, 교실 어휘 활동에 적합',
      difficulty: ['备课ツール'],
      features: ['標準モード', 'フリーモード', 'PDF出力', 'カラー/白黒']
    }
  }
};

const selectTitleTranslations = {
  zh: '选择游戏类型',
  'zh-CN': '选择游戏类型',
  'zh-TW': '選擇遊戲類型',
  en: 'Select Game Type',
  ko: '게임 유형 선택',
  ja: 'ゲームタイプを選択'
};

const difficultyLabelTranslations = {
  zh: '难度',
  'zh-CN': '难度',
  'zh-TW': '難度',
  en: 'Level',
  ko: '난이도',
  ja: '難易度'
};

function GameSelector({ selectedGame, onGameSelect, language = 'zh' }) {
  const games = [
    // 新增游戏
    { id: 'slingshot', icon: '🎯' },
    { id: 'typing', icon: '⌨️' },
    { id: 'snake', icon: '🐍' },
    // 原有游戏
    { id: 'disappearing', icon: '🎯' },
    { id: 'sentence', icon: '🔄' },
    { id: 'matching', icon: '👥' },
    { id: 'gomoku', icon: '♟️' },
    { id: 'gacha', icon: '🔮' },
    { id: 'guesschar', icon: '🧩' },
    { id: 'pinyinwheel', icon: '🎡' },
    { id: 'pinyinguess', icon: '🔤' },
    { id: 'luckybox', icon: '🎁' },
    { id: 'minesweeper', icon: '💣' },
    { id: 'worksheet', icon: '📝' },
    { id: 'luckypicker', icon: '🎲' },
    { id: 'seatmanager', icon: '🪑' },
    { id: 'hanzicomponent', icon: '🧱' },
    { id: 'chineseuno', icon: '🃏' },
    { id: 'wordcloud', icon: '☁️' },
    { id: 'spotit', icon: '🎴' }
  ];

  // 语言映射：将新的 'zh' 映射到旧的 'zh-CN'
  const mapLang = (lang) => {
    if (lang === 'zh') return 'zh-CN';
    return lang;
  };

  const getGameInfo = (gameId) => {
    const mappedLang = mapLang(language);
    return gameTranslations[mappedLang]?.[gameId] || gameTranslations['zh-CN'][gameId];
  };

  return (
    <div className="game-selector">
      <h2 className="selector-title">{selectTitleTranslations[language] || selectTitleTranslations['zh']}</h2>
      <div className="game-grid">
        {games.map((game) => {
          const gameInfo = getGameInfo(game.id);
          return (
            <div
              key={game.id}
              className={`game-card ${selectedGame === game.id ? 'selected' : ''}`}
              onClick={() => onGameSelect(game.id)}
            >
              <div className="game-card-header">
                <div className="game-icon">{game.icon}</div>
                <h3 className="game-name">{gameInfo.name}</h3>
              </div>
              <p className="game-description">{gameInfo.description}</p>
              <div className="game-features">
                <span className="difficulty">{difficultyLabelTranslations[language] || difficultyLabelTranslations['zh']}：{gameInfo.difficulty.join('、')}</span>
                <div className="features">
                  {gameInfo.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GameSelector;
