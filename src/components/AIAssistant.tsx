import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, X, ChevronRight, HelpCircle, BookOpen } from 'lucide-react';
import { wikiFAQ } from '../data/wikiData';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

// Simple custom markdown renderer to style output in elegant UI layout
function parseMarkdownToUI(text: string) {
  if (!text) return null;
  
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Headers: ###, ##, #
    if (line.startsWith('### ')) {
      return <h4 key={idx} className="text-sm font-bold text-amber-200 mt-2 mb-1">{line.slice(4)}</h4>;
    }
    if (line.startsWith('## ') || line.startsWith('# ')) {
      const cleanLine = line.replace(/^#+\s+/, '');
      return <h3 key={idx} className="text-base font-bold text-amber-300 mt-3 mb-1">{cleanLine}</h3>;
    }
    
    // Lists: * or -
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const content = line.trim().substring(2);
      return (
        <div key={idx} className="flex items-start gap-1.5 my-1 pl-2">
          <span className="text-amber-300 mt-1">●</span>
          <span className="text-slate-100 text-sm">{content}</span>
        </div>
      );
    }
    
    // Bold / italic processing using custom regex replacement inside standard text
    let formattedText: React.ReactNode = line;
    const boldRegex = /\*\*(.*?)\*\*/g;
    
    if (boldRegex.test(line)) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      formattedText = parts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} className="text-[#F4EE8E] font-semibold">{part}</strong>;
        }
        return part;
      });
    }

    if (line.trim() === '') return <div key={idx} className="h-2" />;

    return <p key={idx} className="text-slate-200 text-sm leading-relaxed mb-1">{formattedText}</p>;
  });
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '**Привет!** Я твой умный ассистент **ИИ Рапорт RR**. 🤖\n\nЯ могу ответить на любые вопросы о сервисе, подсказать тарифы, помочь настроить отчеты или найти нужную информацию в Вики.\n\nЗадай мне свой вопрос ниже или выбери одну из частых тем!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'wiki'>('chat');
  const [wikiSearchQuery, setWikiSearchQuery] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef<HTMLDivElement>(null);

  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Monitor location changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    const interval = setInterval(() => {
      if (window.location.pathname !== currentPath) {
        setCurrentPath(window.location.pathname);
      }
    }, 500);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, [currentPath]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Click outside to close assistant
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (isOpen && assistantRef.current && !assistantRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle global event to open AI assistant
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-ai-assistant', handleOpenEvent);
    return () => {
      window.removeEventListener('open-ai-assistant', handleOpenEvent);
    };
  }, []);

  const quickQuestions = [
    "Что такое ИИ Рапорт?",
    "Какие тарифы есть?",
    "Как настроить Telegram?",
    "Как работает голосовой ввод?"
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsgId = Date.now().toString();
    const newMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 1. Check local Wiki FAQ for high relevance before querying neural network,
      // to give super-fast, accurate responses.
      const queryLower = textToSend.toLowerCase();
      const bestMatch = wikiFAQ.find(item => 
        queryLower.includes(item.question.toLowerCase()) || 
        item.question.toLowerCase().includes(queryLower) ||
        (queryLower.length > 5 && item.answer.toLowerCase().includes(queryLower))
      );

      let replyText = '';

      if (bestMatch && queryLower.length > 8) {
        // Found highly relevant local wiki question, return it with special prefix
        replyText = `**Вот что я нашел в нашей Базе Знаний:**\n\n**${bestMatch.question}**\n\n${bestMatch.answer}`;
      } else {
        // Query the Pro-Talk backend
        const wikiContext = wikiFAQ.slice(0, 5).map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
        
        const systemPrompt = `Ты — умный ИИ-помощник сервиса "ИИ Рапорт" (ii-rr.online). 
Твоя цель — вежливо и по делу консультировать пользователей сайта о возможностях, тарифах, преимуществах отчетов.
Используй следующую информацию из Вики для ответов:
${wikiContext}

Отвечай в дружелюбном стиле, используй форматирование Markdown (списки, жирный шрифт), чтобы текст выглядел красиво.`;

        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend,
            systemPrompt: systemPrompt
          })
        });

        if (!res.ok) throw new Error('Failed to fetch from AI API');
        const data = await res.json();
        replyText = data.text;
      }

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Извините, сейчас я испытываю временные трудности с подключением. Вы можете просмотреть ответы в нашей **Базе Знаний (Вики)** прямо в этом окне!',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter wiki items based on search
  const filteredWiki = wikiFAQ.filter(item => 
    item.question.toLowerCase().includes(wikiSearchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(wikiSearchQuery.toLowerCase())
  );

  const isCabinetPath = currentPath.startsWith('/cabinet');

  // Hide floating button on mobile in cabinet, or when the assistant is already open
  const shouldHideButton = isOpen || (isCabinetPath);

  return (
    <div className="fixed bottom-6 left-6 z-40" id="ai-assistant-root" ref={assistantRef}>
      {/* Floating Toggle Button */}
      {!shouldHideButton && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#E7C768] bg-gradient-to-r from-[#17344F] to-[#265582] text-white shadow-[0_8px_25px_rgba(23,52,79,0.5)] hover:scale-115 active:scale-95 transition-all cursor-pointer group relative animate-fade-in animate-gold-glow"
          id="ai-assistant-toggle-btn"
          title="AI Ассистент"
        >
          {/* Inner shimmer element to prevent overflow clipping of the badge */}
          <div className="absolute inset-0 rounded-full shimmer-effect pointer-events-none" />

          <img 
            src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR-Logo.png" 
            alt="RR AI" 
            className="w-8 h-8 object-contain group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 relative z-10"
            referrerPolicy="no-referrer"
          />

          {/* "AI" badge on top of logo and outside the circle boundary */}
          <span className="absolute -bottom-1 -right-1 z-25 flex items-center justify-center bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-[10px] font-black font-mono px-1 rounded-md border-2 border-[#17344F] shadow-[0_2px_8px_rgba(217,158,65,0.4)] h-4.5 min-w-5">
            AI
          </span>
        </button>
      )}

      {/* Dialog Window */}
      {isOpen && (
        <div 
          className={`fixed sm:absolute ${isCabinetPath ? 'bottom-24' : 'bottom-6'} left-4 right-4 sm:left-0 sm:right-auto w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[520px] rounded-3xl border border-amber-200/30 bg-gradient-to-b from-[#17344F] to-[#265582] shadow-2xl flex flex-col overflow-hidden animate-fade-in text-white`}
          id="ai-assistant-window"
        >
          {/* Header */}
          <div className="relative p-4 border-b border-white/10 flex items-center justify-between bg-[#17344F]/50">
            {/* Liquid glass effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent" />
            
            <div className="flex items-center gap-2.5 relative z-10">
              <img 
                src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR2.png" 
                alt="RR Friendly" 
                className="w-10 h-10 object-contain animate-pulse-slow animate-round"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-sm font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] bg-clip-text text-transparent font-sans">
                  ИИ Рапорт Ассистент
                </h4>
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Умный бот-советник
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              id="ai-assistant-close-btn"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs inside the Assistant */}
          <div className="flex border-b border-white/5 bg-[#17344F]/40 text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 font-semibold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'chat' ? 'border-[#E7C768] text-[#F4EE8E] bg-[#17344F]/20' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare size={13} />
              Диалог с ИИ
            </button>
            <button
              onClick={() => setActiveTab('wiki')}
              className={`flex-1 py-2.5 font-semibold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'wiki' ? 'border-[#E7C768] text-[#F4EE8E] bg-[#17344F]/20' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen size={13} />
              Вики База
            </button>
          </div>

          {/* Chat Tab Panel */}
          {activeTab === 'chat' ? (
            <>
              {/* Chat Log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#17344F]/20" id="ai-assistant-chatlog">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div 
                      className={`p-3.5 rounded-2xl shadow-md border ${
                        msg.sender === 'user' 
                          ? 'bg-[#1E4468]/90 border-amber-200/10 text-white rounded-tr-none' 
                          : 'bg-[#1E4468]/60 border-white/5 text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {parseMarkdownToUI(msg.text)}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-amber-200/70 animate-pulse pl-1">
                    <Sparkles size={14} className="animate-spin" />
                    <span>ИИ Рапорт подбирает наилучший ответ...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Questions Row */}
              <div className="p-2 border-t border-white/5 bg-[#17344F]/30 flex gap-1.5 overflow-x-auto scrollbar-none" id="ai-assistant-quick-questions">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="flex-shrink-0 px-3 py-1.5 text-[10px] rounded-full border border-amber-200/25 bg-[#1E4468]/50 hover:bg-[#1E4468] text-amber-100 active:scale-95 transition-all cursor-pointer font-sans whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="p-3 border-t border-white/10 bg-[#1E4468]/80 flex gap-2 items-center"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Задайте ваш вопрос..."
                  disabled={isLoading}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] transition-colors"
                  id="ai-assistant-input"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer"
                  id="ai-assistant-send-btn"
                >
                  <Send size={14} />
                </button>
              </form>
            </>
          ) : (
            /* Wiki/FAQ Tab Panel */
            <div className="flex-1 flex flex-col overflow-hidden" id="ai-assistant-wiki-panel">
              {/* Mini Wiki Search */}
              <div className="p-3 border-b border-white/5 bg-[#1E4468]/30">
                <input
                  type="text"
                  value={wikiSearchQuery}
                  onChange={(e) => setWikiSearchQuery(e.target.value)}
                  placeholder="Поиск по Базе Знаний..."
                  className="w-full px-3 py-1.5 rounded-xl bg-[#17344F]/40 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] transition-colors"
                />
              </div>

              {/* Wiki Scrollable List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#17344F]/20" id="ai-assistant-wiki-list">
                {filteredWiki.length > 0 ? (
                  filteredWiki.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-2xl bg-[#1E4468]/50 border border-white/5 hover:border-amber-100/15 transition-all cursor-pointer group"
                      onClick={() => {
                        setActiveTab('chat');
                        setMessages((prev) => [...prev, {
                          id: Date.now().toString(),
                          sender: 'user',
                          text: `Расскажи подробнее: ${item.question}`,
                          timestamp: new Date()
                        }, {
                          id: (Date.now() + 1).toString(),
                          sender: 'assistant',
                          text: `**${item.question}**\n\n${item.answer}`,
                          timestamp: new Date()
                        }]);
                      }}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#1E4468] text-amber-200 font-mono">
                          {item.category}
                        </span>
                        <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <h5 className="text-xs font-semibold mt-1.5 text-slate-100 font-sans group-hover:text-amber-100 transition-colors">
                        {item.question}
                      </h5>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Ничего не найдено по вашему запросу.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
