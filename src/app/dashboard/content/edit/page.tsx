'use client';

export const dynamic = 'force-dynamic';

import Sidebar from '@/components/Sidebar';
import { UserButton, useUser } from '@clerk/nextjs';
import { ArrowLeft, CheckCircle, FileText, Globe, Save, Type, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Page {
	id: string;
	title: string;
	slug: string;
	content: string;
	published: boolean;
}

export default function EditPageContent() {
	const { user, isLoaded } = useUser();
	const router = useRouter();
	const searchParams = useSearchParams();
	const pageId = searchParams.get('id');
	const isNew = searchParams.get('new') === 'true';

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

	const [page, setPage] = useState<Page>({
		id: '',
		title: '',
		slug: '',
		content: '',
		published: false
	});

	useEffect(() => {
		if (isLoaded && user) {
			if (isNew) {
				// Новая страница
				setPage({
					id: `page-${Date.now()}`,
					title: '',
					slug: '',
					content: '',
					published: false
				});
				setLoading(false);
			} else if (pageId) {
				loadPage(pageId);
			}
		}
	}, [isLoaded, user, pageId, isNew]);

	const loadPage = async (id: string) => {
		try {
			const response = await fetch('/api/files/get?filename=config.json');
			if (response.ok) {
				const { data } = await response.json();
				const foundPage = data.pages?.find((p: Page) => p.id === id);
				if (foundPage) {
					setPage(foundPage);
				}
			}
		} catch (error) {
			console.error('Error loading page:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		// Валидация
		if (!page.title.trim()) {
			setMessage({ type: 'error', text: 'Введите название страницы' });
			return;
		}
		if (!page.slug.trim()) {
			setMessage({ type: 'error', text: 'Введите slug (URL)' });
			return;
		}

		try {
			setSaving(true);
			setMessage(null);

			// Получаем текущий config
			const response = await fetch('/api/files/get?filename=config.json');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let currentData: any = {};

			if (response.ok) {
				const result = await response.json();
				currentData = result.data || {};
			}

			const pages = currentData.pages || [];

			// Обновляем или добавляем страницу
			const pageIndex = pages.findIndex((p: Page) => p.id === page.id);
			if (pageIndex >= 0) {
				pages[pageIndex] = page;
			} else {
				pages.push(page);
			}

			const updatedData = {
				...currentData,
				pages
			};

			// Сохраняем
			const saveResponse = await fetch('/api/files/save', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					filename: 'config.json',
					data: updatedData
				}),
			});


			if (!saveResponse.ok) {
				throw new Error('Не удалось сохранить страницу');
			}

			setMessage({
				type: 'success',
				text: 'Страница успешно сохранена!'
			});

			// Перенаправляем на список страниц через 1 сек
			setTimeout(() => {
				router.push('/dashboard/content');
			}, 1000);
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Ошибка сохранения'
			});
		} finally {
			setSaving(false);
		}
	};

	const generateSlug = (title: string) => {
		// Простая транслитерация для slug
		const slug = title
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9\-]/g, '');
		setPage({ ...page, slug: `/${slug}` });
	};

	if (!isLoaded || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
					<p className="text-gray-600">Пожалуйста, войдите в систему</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900">
			<Sidebar />
			
			{/* Main Content */}
			<div className="lg:pl-64">
				{/* Header */}
				<header className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30">
					<div className="px-6 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-4">
								<Link
									href="/dashboard/content"
									className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
								>
									<ArrowLeft className="h-5 w-5" />
								</Link>
								<div>
									<h1 className="text-2xl font-bold text-white">
										{isNew ? 'Новая страница' : 'Редактирование страницы'}
									</h1>
									<p className="text-gray-400 text-sm mt-1">Создайте или отредактируйте страницу сайта</p>
								</div>
							</div>
							<div className="flex items-center space-x-4">
								<button
									onClick={handleSave}
									disabled={saving}
									className="gradient-button flex items-center space-x-3 text-white font-semibold py-3 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								>
									<Save className="h-5 w-5" />
									<span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
								</button>
								<UserButton 
									afterSignOutUrl="/"
									appearance={{
										elements: {
											avatarBox: "w-10 h-10",
											userButtonPopoverCard: "bg-gray-800 border-gray-700",
											userButtonPopoverActionButton: "text-gray-300 hover:bg-gray-700",
										}
									}}
								/>
							</div>
						</div>
					</div>
				</header>

				{/* Main Content */}
				<main className="p-6 max-w-4xl">
					{/* Уведомления */}
					{message && (
						<div className={`mb-6 p-6 rounded-2xl border animate-slide-up ${
							message.type === 'success' 
								? 'bg-green-500/10 border-green-500/20' 
								: 'bg-red-500/10 border-red-500/20'
						}`}>
							<div className="flex items-start space-x-4">
								{message.type === 'success' ? (
									<CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
								) : (
									<XCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
								)}
								<p className={message.type === 'success' ? 'text-green-300' : 'text-red-300'}>
									{message.text}
								</p>
							</div>
						</div>
					)}

					{/* Форма */}
					<div className="glass rounded-2xl p-8 space-y-8 animate-fade-in">
						{/* Название */}
						<div>
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
									<FileText className="h-5 w-5 text-white" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-white">
										Название страницы <span className="text-red-400">*</span>
									</label>
									<p className="text-gray-400 text-xs">Введите название - slug сгенерируется автоматически</p>
								</div>
							</div>
							<input
								type="text"
								value={page.title}
								onChange={(e) => setPage({ ...page, title: e.target.value })}
								onBlur={() => !page.slug && generateSlug(page.title)}
								className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
								placeholder="Главная страница"
							/>
						</div>

						{/* Slug */}
						<div>
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
									<Globe className="h-5 w-5 text-white" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-white">
										URL (slug) <span className="text-red-400">*</span>
									</label>
									<p className="text-gray-400 text-xs">Например: /, /about, /services</p>
								</div>
							</div>
							<input
								type="text"
								value={page.slug}
								onChange={(e) => setPage({ ...page, slug: e.target.value })}
								className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
								placeholder="/about"
							/>
						</div>

						{/* Контент */}
						<div>
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
									<Type className="h-5 w-5 text-white" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-white">
										Контент
									</label>
									<p className="text-gray-400 text-xs">Можно использовать HTML теги для форматирования</p>
								</div>
							</div>
							<textarea
								value={page.content}
								onChange={(e) => setPage({ ...page, content: e.target.value })}
								rows={12}
								className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-all duration-200 resize-none"
								placeholder="Напишите текст страницы..."
							/>
						</div>

						{/* Опубликовано */}
						<div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-xl">
							<input
								type="checkbox"
								id="published"
								checked={page.published}
								onChange={(e) => setPage({ ...page, published: e.target.checked })}
								className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
							/>
							<label htmlFor="published" className="text-sm text-white">
								Опубликовать страницу (если не отмечено - страница будет черновиком)
							</label>
						</div>
				</div>

					{/* Подсказка */}
					<div className="mt-6 glass rounded-2xl p-6">
						<div className="flex items-start space-x-4">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
								<span className="text-white text-lg">💡</span>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-white mb-3">Форматирование текста</h3>
								<div className="text-sm text-gray-400 space-y-2 font-mono">
									<p>&lt;h2&gt;Заголовок&lt;/h2&gt;</p>
									<p>&lt;p&gt;Параграф текста&lt;/p&gt;</p>
									<p>&lt;strong&gt;Жирный&lt;/strong&gt;</p>
									<p>&lt;em&gt;Курсив&lt;/em&gt;</p>
									<p>&lt;a href=&quot;...&quot;&gt;Ссылка&lt;/a&gt;</p>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

