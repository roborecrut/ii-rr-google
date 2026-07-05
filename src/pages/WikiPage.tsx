import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, Sparkles, AlertCircle, BookOpen } from 'lucide-react';
import { wikiFAQ } from '../data/wikiData';

export default function WikiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Все');
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});
  
  // AI Smart Question state
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Group FAQ items by category
  const categories = ['Все', 'Общие вопросы', 'Заполнение отчетов', 'Конструктор и настройки', 'Тарифы и оплата', 'Аналитика и Саммари', 'Графики работы', 'Безопасность и аккаунты'];

  // Filter FAQ items
  const filteredFAQ = wikiFAQ.filter(item => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'Все' || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (idx: number) => {
    setExpandedIndices(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleAiSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsAiLoading(true);
    setAiAnswer(null);
    setAiError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customQuestion,
          systemPrompt: `Ты — умный ИИ-поиск и эксперт по базе знаний "ИИ Рапорт". Отвечай на вопрос пользователя развернуто и понятно, опираясь на следующую базу знаний вопросов и ответов:
${JSON.stringify(wikiFAQ, null, 2)}
Если в базе знаний нет точного ответа, дай вежливый и полезный ответ в контексте нашего продукта ИИ Рапорт.`
        })
      });

      if (!response.ok) throw new Error('Ошибка связи с ИИ-моделью');
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      setAiAnswer(data.text);
    } catch (err: any) {
      setAiError(err.message || 'Не удалось получить ответ от умного поиска. Пожалуйста, попробуйте позже.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen text-white bg-gradient-to-b from-[#17344F] via-[#1E4468] to-[#265582] font-sans selection:bg-amber-200 selection:text-slate-900 px-4 sm:px-6 py-12" id="wiki-page-root">
      <div className="mx-auto max-w-4xl space-y-10">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-200 text-xs font-semibold tracking-wide uppercase font-mono">
            <BookOpen size={13} />
            <span>Информационная Вики</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            <img 
              src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR8.png" 
              alt="Робот RR Вики" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain animate-pulse-slow drop-shadow-[0_0_8px_rgba(231,199,104,0.25)] flex-shrink-0"
              referrerPolicy="no-referrer"
            />
            <h2 className="text-[36px] font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-200 to-[#F4EE8E] bg-clip-text text-transparent text-center sm:text-left">
              База Знаний ИИ Рапорт RR
            </h2>
          </div>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Здесь собраны подробные ответы на 30 ключевых вопросов о работе системы, интеграции с Telegram, настройке графиков и тарифах.
          </p>
        </div>

        {/* AI SMART SEARCH ROW */}
        <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#17344F]/80 to-[#265582]/80 p-6 space-y-4" id="ai-smart-search-box">
          <h4 className="text-sm font-bold text-[#F4EE8E] uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Sparkles size={14} className="animate-pulse" />
            Умный ИИ-поиск по всей Базе Знаний
          </h4>
          
          <form onSubmit={handleAiSmartSearch} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Например: Как рассчитывается партнерский бонус и оферта?"
              className="flex-1 px-4 py-3 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] transition-colors"
            />
            <button
              type="submit"
              disabled={isAiLoading || !customQuestion.trim()}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
            >
              {isAiLoading ? (
                <>
                  <Sparkles size={14} className="animate-spin" />
                  Думаю...
                </>
              ) : (
                <>
                  Спросить ИИ
                  <Sparkles size={14} />
                </>
              )}
            </button>
          </form>
 
          {/* AI Response Display */}
          {aiAnswer && (
            <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-slate-100 text-sm leading-relaxed animate-fade-in" id="ai-search-response">
              <p className="font-bold text-amber-200 mb-1.5 flex items-center gap-1">🤖 Умный ИИ Помощник:</p>
              <div className="whitespace-pre-line text-slate-200 text-xs sm:text-sm">{aiAnswer}</div>
            </div>
          )}
 
          {aiError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2" id="ai-search-error">
              <AlertCircle size={14} className="mt-0.5" />
              <span>{aiError}</span>
            </div>
          )}
        </div>
 
        {/* Regular search and categories filter */}
        <div className="space-y-4" id="standard-faq-section">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between" id="faq-search-filters">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по ключевым словам..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#17344F]/40 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] transition-colors"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
 
            {/* Results counter */}
            <span className="text-xs text-slate-400 font-mono self-end sm:self-center">
              Найдено: {filteredFAQ.length} вопросов
            </span>
          </div>
 
          {/* Categories Dropdown Selection */}
          <div className="relative w-full" id="category-selector-dropdown">
            <label className="block text-[10px] font-bold text-amber-200 uppercase tracking-wider mb-2 font-mono">
              Выберите тему Базы Знаний:
            </label>
            <div className="relative">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full px-4.5 py-3 rounded-xl bg-[#1E4468]/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#E7C768] appearance-none cursor-pointer pr-10"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#17344F] text-white">
                    {cat}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Accordion List */}
          <div className="space-y-3" id="faq-accordions">
            {filteredFAQ.length > 0 ? (
              filteredFAQ.map((faq, index) => {
                const isExpanded = !!expandedIndices[index];
                return (
                  <div 
                    key={index} 
                    className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#17344F]/40 to-[#265582]/40 hover:from-[#17344F]/60 hover:to-[#265582]/60 transition-all overflow-hidden"
                    id={`faq-item-${index}`}
                  >
                    <button
                      onClick={() => toggleExpand(index)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 font-sans focus:outline-none cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1E4468] text-amber-200 font-mono tracking-wider uppercase">
                          {faq.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-100 transition-colors">
                          {faq.question}
                        </h4>
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#1E4468]/60 text-slate-300">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pt-1 text-slate-200 text-xs sm:text-sm leading-relaxed border-t border-white/5 bg-[#17344F]/30 animate-fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 rounded-3xl border border-white/5 bg-[#17344F]/20 text-slate-400 text-xs sm:text-sm">
                По вашему запросу вопросов не найдено. Попробуйте ввести другие ключевые слова или воспользуйтесь Умным ИИ-поиском!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
