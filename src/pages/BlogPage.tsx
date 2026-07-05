import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Search, Calendar, Clock, Share2, Sparkles, 
  ChevronRight, BookOpen, FileText, TrendingUp 
} from 'lucide-react';
import { BlogPost, UserProfile } from '../types';
import { DEFAULT_BLOG_POSTS } from '../data/defaultBlogPosts';
import MarkdownRenderer from '../components/MarkdownRenderer';
import CommentsSection from '../components/CommentsSection';

interface BlogPageProps {
  onNavigate: (path: string) => void;
  activePostId?: string;
  currentUser: UserProfile | null;
}

export default function BlogPage({ onNavigate, activePostId, currentUser }: BlogPageProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const categories = ['Все', 'ИИ в бизнесе', 'Мотивация', 'Технологии', 'Интеграции', 'ИИ-Коучинг'];

  // Load posts from localStorage on mount, falling back to default preloads
  useEffect(() => {
    const localPosts = localStorage.getItem('company_blog_posts');
    if (localPosts) {
      try {
        const parsed = JSON.parse(localPosts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBlogPosts(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse blog posts from localStorage, falling back to defaults', e);
      }
    }
    // Set and save default preloads
    setBlogPosts(DEFAULT_BLOG_POSTS);
    localStorage.setItem('company_blog_posts', JSON.stringify(DEFAULT_BLOG_POSTS));
  }, []);

  // Listen to changes in localStorage in case admin modifies blog posts in another tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'company_blog_posts' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setBlogPosts(parsed);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const activePost = blogPosts.find(p => p.id === activePostId);

  // SEO Injection Effect: Run when the active post ID changes, or path changes
  useEffect(() => {
    if (activePost) {
      document.title = `${activePost.title} | Блог ИИ Рапорт`;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', activePost.seoDesc);

      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', activePost.seoKeywords);
    } else {
      document.title = 'Блог и SEO База Знаний | ИИ Рапорт';
    }
  }, [activePostId, activePost]);

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#17344F] text-white pt-24 pb-20 px-4 sm:px-6 relative" id="blog-page-container">
      
      {/* Decorative stars / ambient circles */}
      <div className="absolute top-24 left-10 w-96 h-96 bg-amber-400/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Render Single Post Detail View */}
        {activePost ? (
          <motion.article 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8"
            id={`blog-post-detail-${activePost.id}`}
          >
            {/* Go Back button */}
            <button 
              onClick={() => onNavigate('/blog')}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-[#F4EE8E] transition-colors cursor-pointer bg-white/5 px-4 py-2 rounded-xl border border-white/10"
              id="btn-back-to-blogs"
            >
              <ArrowLeft size={14} />
              <span>Вернуться к списку блогов</span>
            </button>

            {/* Post Header */}
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs font-bold uppercase tracking-wider font-mono">
                {activePost.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight font-sans">
                {activePost.title}
              </h1>

              {/* Author & Meta */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-300 border-b border-white/10 pb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                    {activePost.author ? activePost.author[0] : '✍️'}
                  </div>
                  <div>
                    <p className="font-bold text-white">{activePost.author}</p>
                    <p className="text-[10px] text-slate-400">{activePost.authorRole}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  <span>{activePost.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" />
                  <span>{activePost.readTime} чтения</span>
                </div>
              </div>
            </div>

            {/* Post Main image banner */}
            {activePost.image && (
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl max-h-[380px] bg-slate-950">
                <img 
                  src={activePost.image} 
                  alt={activePost.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Content formatted in Markdown with Gold gradients & embeddings */}
            <div className="bg-gradient-to-b from-[#1E4468]/50 to-[#17344F]/50 border border-white/10 p-6 sm:p-10 rounded-3xl shadow-xl">
              <MarkdownRenderer content={activePost.content} />
            </div>

            {/* Social Share / CTR Actions Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1E4468] to-[#265582] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-left space-y-1">
                <h4 className="text-sm font-extrabold text-[#F4EE8E] font-sans">Понравилась статья?</h4>
                <p className="text-xs text-slate-300 leading-normal">
                  Внедрите голосовые отчеты и геймификацию с искусственным интеллектом в своей команде.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onNavigate('/')}
                  className="px-5 py-2.5 rounded-xl bg-[#F4EE8E] text-slate-900 text-xs font-extrabold hover:brightness-110 active:scale-95 transition-all cursor-pointer font-sans"
                >
                  Попробовать бесплатно
                </button>
              </div>
            </div>

            {/* Comments and reactions section */}
            <CommentsSection 
              entityId={`post-${activePost.id}`} 
              entityType="post" 
              entityTitle={activePost.title} 
              currentUser={currentUser} 
            />

          </motion.article>
        ) : (
          /* Render Blog Post Listing View */
          <div className="space-y-12" id="blog-list-view">
            
            {/* Header Title section */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-200 text-xs font-semibold uppercase tracking-wider font-mono">
                <BookOpen size={12} />
                <span>Блог компании ИИ Рапорт</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#F4EE8E] bg-clip-text text-transparent font-sans">
                База знаний и SEO блоги ИИ Рапорта
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Экспертные материалы, исследования влияния ИИ на розничную торговлю, полевые работы, автоматизацию кассовых отчетов и методики мотивации персонала.
              </p>
            </div>

            {/* Search & Filter bar layout */}
            <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-2xl bg-[#1E4468]/50 border border-white/10 gap-4" id="blog-search-filters">
              
              {/* Categories filters */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-950 font-extrabold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search text input */}
              <div className="relative w-full md:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Search size={14} />
                </span>
                <input 
                  type="text"
                  placeholder="Поиск статей в блоге..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-[#F4EE8E] transition-all font-mono"
                />
              </div>

            </div>

            {/* Grid of posts */}
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="blog-posts-grid">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col rounded-3xl bg-gradient-to-b from-[#1E4468]/80 to-[#17344F]/80 border border-white/10 overflow-hidden shadow-lg hover:border-amber-300/30 transition-all group cursor-pointer"
                    onClick={() => onNavigate(`/blog/post${post.id}`)}
                    id={`blog-card-${post.id}`}
                  >
                    {/* Image block */}
                    {post.image && (
                      <div className="relative h-48 overflow-hidden bg-slate-900">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-slate-900/85 border border-white/10 text-[#F4EE8E]">
                          {post.category}
                        </span>
                      </div>
                    )}

                    {/* Meta & Info details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> {post.date}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-[#F4EE8E] transition-colors font-sans line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                          {post.summary}
                        </p>
                      </div>

                      {/* Author row & Read link */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F4EE8E] to-[#D99E41] text-slate-900 text-[10px] font-bold flex items-center justify-center">
                            {post.author ? post.author[0] : '✍️'}
                          </div>
                          <span className="text-[10px] font-bold text-slate-300">{post.author}</span>
                        </div>

                        <span className="text-[10px] font-extrabold text-[#F4EE8E] flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                          <span>Читать</span>
                          <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>

                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl" id="blog-empty-state">
                <p className="text-sm text-slate-400">По вашему запросу статьи не найдены. Попробуйте изменить фильтр.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('Все'); }}
                  className="mt-4 px-4 py-2 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl hover:brightness-110 cursor-pointer"
                >
                  Сбросить фильтры
                </button>
              </div>
            )}

            {/* SEO Structured Content Section inside list page */}
            <div className="border-t border-white/10 pt-12 mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-300 text-xs sm:text-sm">
              <div className="space-y-3">
                <h4 className="text-white font-extrabold text-sm uppercase tracking-wider font-sans flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#F4EE8E]" />
                  Как публикации блогов помогают SEO-продвижению сервиса
                </h4>
                <p className="leading-relaxed">
                  Публикации в блоге детально разбирают боли линейного персонала и бизнеса: от медленной сдачи ежедневных планов до саботажа стандартов. Статьи оптимизированы под коммерческие ключевые запросы и помогают клиентам находить решения прямо в поисковых системах Яндекс и Google.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-white font-extrabold text-sm uppercase tracking-wider font-sans flex items-center gap-1.5">
                  <FileText size={14} className="text-sky-300" />
                  Уникальные фичи автоматизации рапортов
                </h4>
                <p className="leading-relaxed">
                  Мы регулярно выкладываем кейсы внедрения искусственного интеллекта на точках продаж. Читайте про то, как наши голосовые ИИ-обработчики интегрируются с мессенджерами, опрашивают сотрудников и формируют сводный Excel без рутины.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
