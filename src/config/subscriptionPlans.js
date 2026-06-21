/**
 * 订阅方案配置
 * 定义 Free / Pro / School 三档会员
 */

export const subscriptionPlans = {
  free: {
    id: 'free',
    nameZh: '免费版',
    nameEn: 'Free',
    priceZh: '¥0',
    priceEn: 'Free',
    descriptionZh: '适合体验基础课堂互动工具',
    descriptionEn: 'For trying basic classroom interaction tools',
    buttonZh: '免费开始',
    buttonEn: 'Start for Free',
    featuresZh: [
      '课堂互动游戏基础版',
      '基础点名功能',
      '词云生成基础版',
      '本地草稿保存'
    ],
    featuresEn: [
      'Basic classroom games',
      'Basic picker tool',
      'Basic word cloud',
      'Local draft save'
    ]
  },
  pro_monthly: {
    id: 'pro_monthly',
    nameZh: 'Pro 月卡',
    nameEn: 'Pro Monthly',
    priceZh: '¥39/月',
    priceEn: '$9.99/mo',
    descriptionZh: '适合高频上课和备课的中文老师',
    descriptionEn: 'For Chinese teachers who teach regularly',
    buttonZh: '立即订阅',
    buttonEn: 'Subscribe',
    recommended: false,
    featuresZh: [
      '全部课堂互动游戏',
      '汉字字帖PDF导出',
      '中文UNO卡牌生成',
      '座位管理工具',
      '汉字部首词卡',
      '更多高级模板',
      '后续AI功能优先体验'
    ],
    featuresEn: [
      'All classroom games',
      'Hanzi worksheet PDF export',
      'Chinese UNO card generator',
      'Seat management tool',
      'Hanzi component flashcards',
      'Advanced templates',
      'Early AI feature access'
    ]
  },
  pro_yearly: {
    id: 'pro_yearly',
    nameZh: 'Pro 年卡',
    nameEn: 'Pro Yearly',
    priceZh: '¥299/年',
    priceEn: '$79.99/yr',
    descriptionZh: '适合高频上课和备课的中文老师，年付更优惠',
    descriptionEn: 'For Chinese teachers, save 35%',
    buttonZh: '年付省40%',
    buttonEn: 'Save 35%',
    recommended: true,
    featuresZh: [
      '全部课堂互动游戏',
      '汉字字帖PDF导出',
      '中文UNO卡牌生成',
      '座位管理工具',
      '汉字部首词卡',
      '更多高级模板',
      '后续AI功能优先体验',
      '专属客服支持'
    ],
    featuresEn: [
      'All classroom games',
      'Hanzi worksheet PDF export',
      'Chinese UNO card generator',
      'Seat management tool',
      'Hanzi component flashcards',
      'Advanced templates',
      'Early AI feature access',
      'Priority support'
    ]
  },
  school: {
    id: 'school',
    nameZh: '机构版',
    nameEn: 'School',
    priceZh: '联系报价',
    priceEn: 'Custom pricing',
    descriptionZh: '适合中文学校、培训机构和教学团队',
    descriptionEn: 'For Chinese schools and teaching teams',
    buttonZh: '联系我们',
    buttonEn: 'Contact Us',
    featuresZh: [
      '多老师账号管理',
      '机构共享资源库',
      '班级学生管理',
      '团队协作功能',
      '定制开发支持',
      'API接口开放'
    ],
    featuresEn: [
      'Multi-teacher accounts',
      'Shared resource library',
      'Student management',
      'Team collaboration',
      'Custom development',
      'API access'
    ]
  }
};

export default subscriptionPlans;