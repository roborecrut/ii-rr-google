import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Trash2, Edit3, Save, Eye, X, HelpCircle, 
  Sparkles, Bold, Italic, Heading, Quote, List, Code, Link as LinkIcon, 
  Image as ImageIcon, Video, Folder, Calendar, User, Search
} from 'lucide-react';
import { BlogPost } from '../../types';
import { DEFAULT_BLOG_POSTS } from '../../data/defaultBlogPosts';
import MarkdownRenderer from '../MarkdownRenderer';

export default function CabinetBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ИИ в бизнесе');
  const [author, setAuthor] = useState('Администратор');
  const [authorRole, setAuthorRole] = useState('Редактор базы знаний');
  const [image, setImage] = useState('');
  const [summary, setSummary] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [content, setContent] = useState('');

  // Load posts on mount
  useEffect(() => {
    const local = localStorage.getItem('company_blog_posts');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPosts(parsed);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setPosts(DEFAULT_BLOG_POSTS);
  }, []);

  // Sync back helper
  const syncPosts = (updatedPosts: BlogPost[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('company_blog_posts', JSON.stringify(updatedPosts));
    // Trigger storage event to update other views if open
    window.dispatchEvent(new Event('storage'));
  };

  // Drag and drop photo simulation / FileReader converter
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper for formatting selected text in the Markdown textarea
  const handleFormat = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('blog-content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const replacement = prefix + (selectedText || '') + suffix;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    
    setContent(newValue);

    // Focus and restore cursor selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length, 
        start + prefix.length + (selectedText ? selectedText.length : 0)
      );
    }, 10);
  };

  const handleEditClick = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreatingNew(false);
    setTitle(post.title);
    setCategory(post.category);
    setAuthor(post.author);
    setAuthorRole(post.authorRole);
    setImage(post.image);
    setSummary(post.summary);
    setSeoDesc(post.seoDesc);
    setSeoKeywords(post.seoKeywords);
    setContent(post.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateNewClick = () => {
    setEditingPost(null);
    setIsCreatingNew(true);
    setTitle('');
    setCategory('ИИ в бизнесе');
    setAuthor('Григорий РентРоп');
    setAuthorRole('CEO ИИ Рапорт');
    setImage('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80');
    setSummary('');
    setSeoDesc('');
    setSeoKeywords('');
    setContent(`## Введение в новую тему\n\nНапишите здесь вводный абзац о решении болей бизнеса с помощью ИИ Рапорта...\n\n> **Главная мысль поста**\n> Качественные голосовые отчеты позволяют снизить нагрузку и мотивировать сотрудников через Магазин Благ.\n\n## Основной раздел статьи\n\nЗдесь можно описать детальную методологию. Используйте списки:\n- Первое преимущество решения\n- Второе преимущество интеграции\n- Эффективный тайм-менеджмент\n\n### Пример интеграции\n\n🗣️ **Голос:** "Запустили смену, продали 3 лицензии."\n🤖 **ИИ Раскладка:** Выручка зафиксирована.\n\nУспешного внедрения технологий!`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingPost(null);
    setIsCreatingNew(false);
    setShowPreview(false);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Пожалуйста, введите заголовок статьи.');
      return;
    }
    if (!content.trim()) {
      alert('Пожалуйста, введите содержание статьи.');
      return;
    }

    const calculatedReadTime = `${Math.max(2, Math.ceil(content.split(/\s+/).length / 150))} мин`;
    const formattedDate = new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    if (editingPost) {
      // Edit existing
      const updated = posts.map(p => p.id === editingPost.id ? {
        ...p,
        title,
        category,
        author,
        authorRole,
        image,
        summary: summary || title.slice(0, 150) + '...',
        seoDesc: seoDesc || title,
        seoKeywords: seoKeywords || category,
        content,
        readTime: calculatedReadTime,
        date: p.date || formattedDate
      } : p);
      syncPosts(updated);
      alert('Пост успешно сохранен и обновлен!');
    } else {
      // Create new
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title,
        category,
        author,
        authorRole,
        image,
        summary: summary || title.slice(0, 150) + '...',
        seoDesc: seoDesc || title,
        seoKeywords: seoKeywords || category,
        content,
        readTime: calculatedReadTime,
        date: formattedDate
      };
      syncPosts([newPost, ...posts]);
      alert('Новый пост успешно опубликован в блоге!');
    }

    handleCancel();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы действительно хотите безвозвратно удалить этот пост из блога?')) {
      const filtered = posts.filter(p => p.id !== id);
      syncPosts(filtered);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="admin-blog-posts-root">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-extrabold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] bg-clip-text text-transparent font-sans">
            Управление Постами и SEO Базой Знаний
          </h2>
          <p className="text-[11px] text-slate-400 font-mono mt-1">Добавление, редактирование и SEO-оптимизация статей компании</p>
        </div>
        
        {!isCreatingNew && !editingPost && (
          <button
            onClick={handleCreateNewClick}
            className="px-4 py-2 bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] hover:brightness-110 active:scale-95 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
            id="admin-btn-create-post"
          >
            <Plus size={15} />
            <span>Создать пост</span>
          </button>
        )}
      </div>

      {/* CREATE OR EDIT FORM */}
      {(isCreatingNew || editingPost) && (
        <div className="p-5 rounded-2xl bg-[#1E4468]/30 border border-amber-200/20 space-y-6" id="blog-editor-form">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200 flex items-center gap-1.5">
              <Sparkles size={14} />
              {editingPost ? 'Редактирование статьи' : 'Создание новой статьи'}
            </span>
            <button 
              onClick={handleCancel}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Заголовок статьи</label>
              <input 
                type="text"
                placeholder="Например: Как автоматизировать отчеты за 5 минут"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#17344F]/60 border border-white/10 text-white focus:outline-none focus:border-[#F4EE8E] transition-all"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Категория</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#17344F]/60 border border-white/10 text-white focus:outline-none focus:border-[#F4EE8E] transition-all"
              >
                <option value="ИИ в бизнесе">ИИ в бизнесе</option>
                <option value="Мотивация">Мотивация</option>
                <option value="Технологии">Технологии</option>
                <option value="Интеграции">Интеграции</option>
                <option value="ИИ-Коучинг">ИИ-Коучинг</option>
              </select>
            </div>

            {/* Author */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Автор</label>
              <input 
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#17344F]/60 border border-white/10 text-white focus:outline-none focus:border-[#F4EE8E] transition-all"
              />
            </div>

            {/* Author Role */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Должность автора</label>
              <input 
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#17344F]/60 border border-white/10 text-white focus:outline-none focus:border-[#F4EE8E] transition-all"
              />
            </div>
          </div>

          {/* Photo upload zone (simulation base64) */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Обложка статьи</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <input 
                  type="text"
                  placeholder="Вставьте URL картинки..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#17344F]/60 border border-white/10 text-white focus:outline-none focus:border-[#F4EE8E] transition-all"
                />
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">или загрузите файл с компьютера:</span>
                  <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-bold text-amber-200 transition-all">
                    Выбрать файл
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                  </label>
                </div>
              </div>

              {image && (
                <div className="relative rounded-xl overflow-hidden border border-white/10 h-24 bg-slate-950 flex items-center justify-center">
                  <img src={image} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  <button 
                    onClick={() => setImage('')}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-black/90 text-white"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SEO and Summary Fields */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Краткое описание (Summary для списков)</label>
              <textarea 
                placeholder="Краткое интригующее введение для карточки статьи..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#17344F]/60 border border-white/10 text-white focus:outline-none focus:border-[#F4EE8E] transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#E7C768] uppercase tracking-wider">SEO Description (Мета-тег)</label>
                <input 
                  type="text"
                  placeholder="Заполните описание для продвижения в Яндекс/Google"
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#17344F]/60 border border-amber-200/10 text-white focus:outline-none focus:border-[#F4EE8E] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#E7C768] uppercase tracking-wider">SEO Keywords (Ключевые слова)</label>
                <input 
                  type="text"
                  placeholder="голосовые отчеты, ии в торговле, ритейл автоматизация"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#17344F]/60 border border-amber-200/10 text-white focus:outline-none focus:border-[#F4EE8E] transition-all"
                />
              </div>
            </div>
          </div>

          {/* MARKDOWN EDITOR ROW WITH TOOLBAR */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#17344F]/60 p-2 rounded-t-xl border-t border-x border-white/10">
              <span className="text-[10px] font-bold text-slate-300 uppercase">Редактор контента (Markdown)</span>
              
              {/* TOOLBAR FOR TEXT WRAPPING */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => handleFormat('**', '**')}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded"
                  title="Жирный текст (**)"
                >
                  <Bold size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('*', '*')}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded"
                  title="Курсив (*)"
                >
                  <Italic size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('## ')}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded text-[11px] font-bold"
                  title="Заголовок 2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('### ')}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded text-[11px] font-bold"
                  title="Заголовок 3"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('> ')}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded"
                  title="Цитата (>)"
                >
                  <Quote size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('- ')}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded"
                  title="Список (-)"
                >
                  <List size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('```javascript\n', '\n```')}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded"
                  title="Блок кода (```)"
                >
                  <Code size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('[Текст ссылки](', ')')}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded"
                  title="Ссылка"
                >
                  <LinkIcon size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleFormat('![Описание](', ')')}
                  className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded"
                  title="Картинка"
                >
                  <ImageIcon size={13} />
                </button>

                {/* HTML VIDEO / DOC EMBEDS SELECTORS */}
                <div className="h-4 w-px bg-white/10 my-auto mx-1" />
                
                <button
                  type="button"
                  onClick={() => handleFormat('<iframe src="https://rutube.ru/play/embed/ecfa0ea2bd452178fb012cb7f7cf5429" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>')}
                  className="p-1 text-[#E7C768] hover:text-white hover:bg-[#F4EE8E]/10 rounded text-[10px] font-bold"
                  title="Вставить видео RuTube"
                >
                  📺 RuTube
                </button>
                
                <button
                  type="button"
                  onClick={() => handleFormat('<iframe src="https://vk.com/video_ext.php?oid=-220311234&id=456239120&hash=bc123" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>')}
                  className="p-1 text-sky-400 hover:text-white hover:bg-sky-400/10 rounded text-[10px] font-bold"
                  title="Вставить видео VK"
                >
                  🎬 VK
                </button>

                <button
                  type="button"
                  onClick={() => handleFormat('<iframe src="https://docs.google.com/document/d/e/2PACX-1vT1gB8f59R8k_f_b/pub?embedded=true" width="100%" height="100%"></iframe>')}
                  className="p-1 text-emerald-400 hover:text-white hover:bg-emerald-400/10 rounded text-[10px] font-bold"
                  title="Вставить Google Doc"
                >
                  📄 Google Doc
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              {/* Text Area */}
              <div className={`${showPreview ? 'xl:col-span-6' : 'xl:col-span-12'}`}>
                <textarea 
                  id="blog-content-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  placeholder="Пишите длинный текст статьи в формате Markdown..."
                  className="w-full px-3 py-3 text-xs rounded-b-xl bg-[#17344F]/40 border-b border-x border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-[#F4EE8E] font-mono leading-relaxed"
                />
              </div>

              {/* Live Preview Side (Toggled) */}
              {showPreview && (
                <div className="xl:col-span-6 p-4 rounded-xl bg-[#17344F]/60 border border-amber-200/10 max-h-[360px] overflow-y-auto">
                  <span className="text-[9px] text-[#E7C768] font-mono uppercase block mb-3 pb-1 border-b border-white/5">Предпросмотр форматирования</span>
                  <MarkdownRenderer content={content} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  showPreview ? 'bg-[#1E4468] text-white border border-white/10' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Eye size={12} />
                <span>{showPreview ? 'Скрыть предпросмотр' : 'Показать предпросмотр'}</span>
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} />
              <span>{editingPost ? 'Сохранить изменения' : 'Опубликовать'}</span>
            </button>
          </div>

        </div>
      )}

      {/* POSTS LIST VIEW */}
      {!isCreatingNew && !editingPost && (
        <div className="space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search size={14} />
            </span>
            <input 
              type="text"
              placeholder="Поиск по статьям в базе знаний..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-[#F4EE8E] transition-all font-mono"
            />
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  className="p-4 rounded-xl bg-[#17344F]/40 border border-white/10 hover:border-amber-200/20 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-400/10 text-amber-200 uppercase border border-amber-400/20">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar size={11} />
                        {post.date}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{post.summary}</p>
                    
                    {/* SEO badge */}
                    <div className="pt-2 flex flex-wrap gap-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950/50 border border-sky-400/20 text-sky-300 font-mono">
                        SEO: {post.seoKeywords ? post.seoKeywords.split(',')[0] : 'не заданы'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[10px]">
                      <User size={11} className="text-[#E7C768]" />
                      {post.author}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(post)}
                        className="p-1.5 text-slate-300 hover:text-[#F4EE8E] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                        title="Редактировать статью"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Удалить"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#17344F]/20 border border-white/5 rounded-2xl">
              <p className="text-xs text-slate-400">Посты не найдены. Создайте первый пост прямо сейчас!</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
