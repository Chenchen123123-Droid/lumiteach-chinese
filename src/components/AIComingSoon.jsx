import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import './AIComingSoon.css';

/**
 * AI备课即将上线页面
 */
function AIComingSoon({ onNavigate }) {
  const { lang } = useLanguage();

	const handleBack = () => {
		if (onNavigate) {
			onNavigate('tools');
		}
	};

	return (
		<div className="ai-coming-soon">
			<div className="coming-soon-card">
				<div className="coming-soon-badge">
					{lang === 'zh' ? '即将上线' : 'Coming Soon'}
				</div>

				<div className="coming-soon-icon">🤖</div>

				<h1 className="coming-soon-title">
					{lang === 'zh' ? 'AI备课' : 'AI Lesson Prep'}
				</h1>

				<p className="coming-soon-subtitle">
					{lang === 'zh'
						? '对外汉语老师专用的 AI 备课助手即将上线。'
						: 'An AI lesson planning assistant for Chinese teachers is coming soon.'}
				</p>

				<div className="coming-soon-features">
					<h3>{lang === 'zh' ? '未来功能' : 'Future Features'}</h3>
					<ul>
						<li>{lang === 'zh' ? '自动生成教案' : 'Generate lesson plans'}</li>
						<li>{lang === 'zh' ? '自动生成课堂活动' : 'Create classroom activities'}</li>
						<li>{lang === 'zh' ? '自动生成生词讲解' : 'Generate vocabulary explanations'}</li>
						<li>{lang === 'zh' ? '自动生成练习题' : 'Create exercises'}</li>
						<li>{lang === 'zh' ? '自动生成课后作业' : 'Generate homework'}</li>
						<li>{lang === 'zh' ? '根据 HSK 等级生成教学内容' : 'Build content by HSK level'}</li>
					</ul>
				</div>

				<p className="coming-soon-notice">
					{lang === 'zh'
						? '该功能正在开发中，欢迎先体验其他课堂工具。'
						: 'This feature is under development. You can explore other tools first.'}
				</p>

				<button className="coming-soon-btn" onClick={handleBack}>
					{lang === 'zh' ? '返回全部工具' : 'Explore All Tools'}
				</button>
			</div>
		</div>
	);
}

export default AIComingSoon;