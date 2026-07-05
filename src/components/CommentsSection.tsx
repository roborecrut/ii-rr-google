import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Heart, Send, Sparkles, User, CornerDownRight, Smile, Bot } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface Comment {
  id: string;
  author: string;
  authorRole?: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
  reactions: Record<string, number>;
  userReactions?: Record<string, boolean>; // track which emojis this local user clicked on this comment
  replies: Comment[];
}

interface CommentsSectionProps {
  entityId: string;
  entityType: 'post' | 'review';
  entityTitle?: string;
  currentUser: UserProfile | null;
}

// Available emojis for reactions
const EMOJI_OPTIONS = ['👍', '❤️', '🚀', '🔥', '👏', '🤦'];

export default function CommentsSection({
  entityId,
  entityType,
  entityTitle = '',
  currentUser
}: CommentsSectionProps) {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  
  // New Comment Form states
  const [anonName, setAnonName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply states
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyAnonName, setReplyAnonName] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // AI Typing simulation indicator
  const [aiTyping, setAiTyping] = useState(false);

  // Load reactions & comments on mount / change entityId
  useEffect(() => {
    const savedReactions = localStorage.getItem(`rr_reactions_${entityId}`);
    const savedUserReactions = localStorage.getItem(`rr_user_reactions_${entityId}`);
    const savedComments = localStorage.getItem(`rr_comments_${entityId}`);

    // Load or generate default reactions
    if (savedReactions) {
      try {
        setReactions(JSON.parse(savedReactions));
      } catch (e) {
        setReactions(generateDefaultReactions());
      }
    } else {
      const def = generateDefaultReactions();
      setReactions(def);
      localStorage.setItem(`rr_reactions_${entityId}`, JSON.stringify(def));
    }

    if (savedUserReactions) {
      try {
        setUserReactions(JSON.parse(savedUserReactions));
      } catch (e) {
        setUserReactions({});
      }
    } else {
      setUserReactions({});
    }

    // Load or generate default comments
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (e) {
        const def = generateDefaultComments();
        setComments(def);
        localStorage.setItem(`rr_comments_${entityId}`, JSON.stringify(def));
      }
    } else {
      const def = generateDefaultComments();
      setComments(def);
      localStorage.setItem(`rr_comments_${entityId}`, JSON.stringify(def));
    }
  }, [entityId]);

  // Helper to generate default reactions based on entity ID to keep it stable but realistic
  const generateDefaultReactions = (): Record<string, number> => {
    const num = parseInt(entityId.replace(/[^0-9]/g, '')) || 5;
    return {
      '👍': (num * 3) % 17 + 2,
      '❤️': (num * 2) % 13 + 1,
      '🚀': (num * 7) % 11 + 1,
      '🔥': (num * 5) % 9 + 2,
      '👏': (num * 4) % 12 + 3,
      '🤦': (num) % 3
    };
  };

  // Helper to generate default comments for a rich default experience
  const generateDefaultComments = (): Comment[] => {
    const isPost = entityType === 'post';
    const postComments: Comment[] = [
      {
        id: `c-default-1-${entityId}`,
        author: 'Михаил Котов',
        authorRole: 'Директор по развитию',
        authorAvatar: 'МК',
        text: isPost 
          ? 'Потрясающий разбор темы! Нам очень актуально внедрение голосовых ИИ-рапортов, так как линейный персонал постоянно жалуется на неудобные интерфейсы и тратит кучу времени в конце смены.'
          : 'Абсолютно согласен с автором отзыва! Мы внедрили ИИ Рапорт всего пару недель назад, и экономия времени руководителей уже превысила все ожидания.',
        timestamp: 'Вчера в 14:20',
        reactions: { '👍': 4, '❤️': 2 },
        replies: [
          {
            id: `c-default-1-r1-${entityId}`,
            author: 'Григорий РентРоп',
            authorRole: 'CEO ИИ Рапорт',
            authorAvatar: 'ГР',
            text: 'Михаил, спасибо за доверие! Рад, что наш продукт помогает оптимизировать операционные процессы в вашей компании.',
            timestamp: 'Вчера в 15:05',
            reactions: { '👍': 2, '❤️': 1 },
            replies: []
          }
        ]
      },
      {
        id: `c-default-2-${entityId}`,
        author: 'Анна Кравцова',
        authorRole: 'HR-директор сети РитейлГрупп',
        authorAvatar: 'АК',
        text: isPost
          ? 'Отличный материал! Особенно зацепил раздел про геймификацию и Магазин Благ. Мотивировать сотрудников за хорошие вовремя сданные рапорты — это гениально!'
          : 'Интересный кейс! ИИ-автокомментарии к отчетам действительно разгружают менеджеров. Нашим сотрудникам очень нравится получать конструктивную обратную связь.',
        timestamp: 'Сегодня в 09:12',
        reactions: { '👍': 5, '👏': 3, '🚀': 1 },
        replies: []
      }
    ];

    // Add a default AI feedback comment to show off the system!
    postComments.push({
      id: `c-default-ai-${entityId}`,
      author: 'ИИ Ассистент Рапорт',
      authorRole: 'Автоматический ИИ Эксперт',
      authorAvatar: '🤖',
      text: isPost
        ? `Проанализировал статью "${entityTitle || 'этого поста'}". Основные выводы: внедрение ИИ Рапорта снижает человеческий фактор на 90% и делает сбор данных полностью прозрачным. Задавайте ваши вопросы по интеграции в комментариях!`
        : `Проанализировал данный отзыв и сопутствующие обсуждения. ИИ Рапорт успешно решает задачу повышения дисциплины и экономии операционного времени менеджеров.`,
      timestamp: 'Сегодня в 10:00',
      reactions: { '👍': 6, '🚀': 4, '🔥': 3 },
      replies: []
    });

    return postComments;
  };

  // Sync state back to localStorage
  const saveCommentsToStorage = (updatedComments: Comment[]) => {
    setComments(updatedComments);
    localStorage.setItem(`rr_comments_${entityId}`, JSON.stringify(updatedComments));
  };

  const saveReactionsToStorage = (updatedReactions: Record<string, number>, updatedUserReactions: Record<string, boolean>) => {
    setReactions(updatedReactions);
    setUserReactions(updatedUserReactions);
    localStorage.setItem(`rr_reactions_${entityId}`, JSON.stringify(updatedReactions));
    localStorage.setItem(`rr_user_reactions_${entityId}`, JSON.stringify(updatedUserReactions));
  };

  // Main Entity reaction toggle
  const handleToggleEntityReaction = (emoji: string) => {
    const isAlreadyReacted = !!userReactions[emoji];
    const updatedUserReactions = { ...userReactions, [emoji]: !isAlreadyReacted };
    const updatedReactions = {
      ...reactions,
      [emoji]: (reactions[emoji] || 0) + (isAlreadyReacted ? -1 : 1)
    };
    saveReactionsToStorage(updatedReactions, updatedUserReactions);
  };

  // Triggering server-side AI auto comment response via Gemini API
  const triggerAiAutoCommentResponse = async (userCommentText: string, currentCommentsList: Comment[]) => {
    setAiTyping(true);
    try {
      const prompt = `Пользователь оставил комментарий к нашей публикации ("${entityTitle}"): "${userCommentText}". 
Напиши краткий, остроумный, профессиональный автоматический ответ от "ИИ Ассистента Рапорт" (1-2 предложения), помогая ответить на комментарий или благодаря за обратную связь.`;
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemPrompt: 'Ты — ИИ Ассистент Рапорт, встроенный бот поддержки в блоге и отзывах. Твои комментарии должны быть полезными, экспертными, вежливыми, с легкой долей технологического оптимизма.'
        })
      });

      let aiText = `Спасибо за комментарий! Мы рады, что функции ИИ Рапорта вызывают интерес. Работаем над расширением возможностей ИИ ежедневно!`;
      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          aiText = data.text;
        }
      }

      const aiComment: Comment = {
        id: `c-ai-auto-${Date.now()}`,
        author: 'ИИ Ассистент Рапорт',
        authorRole: 'Автоматический ИИ Эксперт',
        authorAvatar: '🤖',
        text: aiText,
        timestamp: 'Только что',
        reactions: { '👍': 1, '🔥': 1 },
        replies: []
      };

      // Append AI reply to comments list
      const updated = [...currentCommentsList, aiComment];
      saveCommentsToStorage(updated);
    } catch (e) {
      console.error('Failed to trigger AI comment response', e);
    } finally {
      setAiTyping(false);
    }
  };

  // Handle posting a main comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = commentText.trim();
    if (!cleanText) return;

    let authorName = anonName.trim();
    let authorRoleText = 'Анонимный читатель';
    let avatarInitials = 'А';

    if (currentUser) {
      authorName = currentUser.name;
      authorRoleText = currentUser.position || 'Пользователь платформы';
      avatarInitials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    } else {
      if (!authorName) {
        authorName = 'Анонимный гость';
      }
      avatarInitials = authorName.charAt(0).toUpperCase();
    }

    const newComment: Comment = {
      id: `c-user-${Date.now()}`,
      author: authorName,
      authorRole: authorRoleText,
      authorAvatar: avatarInitials,
      text: cleanText,
      timestamp: 'Только что',
      reactions: {},
      replies: []
    };

    const updatedComments = [...comments, newComment];
    saveCommentsToStorage(updatedComments);
    setCommentText('');
    setAnonName('');

    // Trigger immediate AI auto feedback if not already AI speaking
    if (authorName !== 'ИИ Ассистент Рапорт') {
      await triggerAiAutoCommentResponse(cleanText, updatedComments);
    }
  };

  // Handle posting a reply to comment
  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    const cleanText = replyText.trim();
    if (!cleanText) return;

    let authorName = replyAnonName.trim();
    let authorRoleText = 'Анонимный читатель';
    let avatarInitials = 'А';

    if (currentUser) {
      authorName = currentUser.name;
      authorRoleText = currentUser.position || 'Пользователь платформы';
      avatarInitials = currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    } else {
      if (!authorName) {
        authorName = 'Анонимный гость';
      }
      avatarInitials = authorName.charAt(0).toUpperCase();
    }

    const newReply: Comment = {
      id: `c-user-reply-${Date.now()}`,
      author: authorName,
      authorRole: authorRoleText,
      authorAvatar: avatarInitials,
      text: cleanText,
      timestamp: 'Только что',
      reactions: {},
      replies: []
    };

    // Deep update function to insert reply in nested tree
    const insertReplyDeep = (list: Comment[]): Comment[] => {
      return list.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            replies: [...item.replies, newReply]
          };
        }
        if (item.replies.length > 0) {
          return {
            ...item,
            replies: insertReplyDeep(item.replies)
          };
        }
        return item;
      });
    };

    const updated = insertReplyDeep(comments);
    saveCommentsToStorage(updated);
    setReplyText('');
    setReplyAnonName('');
    setActiveReplyId(null);
  };

  // Comment reaction toggle helper
  const handleToggleCommentReaction = (commentId: string, emoji: string) => {
    const toggleReactionDeep = (list: Comment[]): Comment[] => {
      return list.map(item => {
        if (item.id === commentId) {
          const userHasReacted = item.userReactions?.[emoji] || false;
          const updatedUserReactions = {
            ...(item.userReactions || {}),
            [emoji]: !userHasReacted
          };
          const updatedReactions = {
            ...item.reactions,
            [emoji]: (item.reactions[emoji] || 0) + (userHasReacted ? -1 : 1)
          };
          return {
            ...item,
            reactions: updatedReactions,
            userReactions: updatedUserReactions
          };
        }
        if (item.replies.length > 0) {
          return {
            ...item,
            replies: toggleReactionDeep(item.replies)
          };
        }
        return item;
      });
    };

    const updated = toggleReactionDeep(comments);
    saveCommentsToStorage(updated);
  };

  // Recursive Comment tree renderer
  const renderCommentItem = (item: Comment, isNested = false) => {
    const isAi = item.author.toLowerCase().includes('ии') || item.authorRole?.toLowerCase().includes('ии');
    
    return (
      <div 
        key={item.id} 
        className={`group space-y-2.5 transition-all duration-300 ${
          isNested ? 'pl-4 sm:pl-8 border-l border-white/10 mt-3 pt-1 pb-1' : 'border-b border-white/5 pb-4 last:border-0'
        }`}
        id={`comment-card-${item.id}`}
      >
        <div className="flex items-start gap-2.5">
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${
            isAi 
              ? 'bg-gradient-to-tr from-amber-400 to-amber-200 border border-amber-300 text-slate-900 shadow-lg shadow-amber-500/10'
              : 'bg-[#1E4468] border border-white/10 text-amber-200'
          }`}>
            {isAi ? <Bot size={14} className="animate-pulse" /> : item.authorAvatar || item.author[0]}
          </div>

          {/* Author metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-xs font-bold ${isAi ? 'text-amber-200 flex items-center gap-1 font-mono' : 'text-white'}`}>
                  {isAi && <Sparkles size={11} className="text-amber-300 animate-spin-slow" />}
                  {item.author}
                </span>
                {item.authorRole && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${
                    isAi 
                      ? 'bg-amber-400/10 border-amber-400/20 text-amber-300' 
                      : 'bg-white/5 border-white/5 text-slate-400'
                  }`}>
                    {item.authorRole}
                  </span>
                )}
              </div>
              <span className="text-[9px] text-slate-400 font-mono">{item.timestamp}</span>
            </div>

            {/* Comment Text */}
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mt-1 font-sans whitespace-pre-line select-text">
              {item.text}
            </p>

            {/* Actions: Reaction list & Reply trigger */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Emojis selection overlay */}
              <div className="flex items-center gap-1 bg-[#17344F]/40 border border-white/5 px-2 py-0.5 rounded-full">
                {EMOJI_OPTIONS.slice(0, 4).map(emoji => {
                  const count = item.reactions[emoji] || 0;
                  const isReacted = item.userReactions?.[emoji] || false;
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleToggleCommentReaction(item.id, emoji)}
                      className={`text-[11px] transition-all flex items-center gap-0.5 hover:scale-115 cursor-pointer ${
                        isReacted ? 'grayscale-0 font-bold scale-105 filter drop-shadow-[0_0_2px_rgba(231,199,104,0.5)]' : 'grayscale hover:grayscale-0'
                      }`}
                      title={emoji}
                    >
                      <span>{emoji}</span>
                      {count > 0 && <span className="text-[9px] text-slate-400">{count}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Reply Trigger button */}
              <button
                onClick={() => {
                  setActiveReplyId(activeReplyId === item.id ? null : item.id);
                  setReplyText('');
                }}
                className="text-[10px] text-slate-400 hover:text-amber-200 font-bold transition-colors flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <CornerDownRight size={11} />
                <span>Ответить</span>
              </button>
            </div>

            {/* Inline Reply Input form (toggled) */}
            {activeReplyId === item.id && (
              <form 
                onSubmit={(e) => handleSubmitReply(e, item.id)} 
                className="mt-3.5 p-3 rounded-xl bg-[#17344F]/40 border border-amber-200/10 space-y-3.5 animate-fade-in"
                id={`reply-form-${item.id}`}
              >
                <div className="flex items-center gap-1 text-[10px] text-amber-200 font-bold uppercase tracking-wider">
                  <CornerDownRight size={11} />
                  <span>Ваш ответ для {item.author}:</span>
                </div>

                {!currentUser && (
                  <div>
                    <input
                      type="text"
                      required
                      value={replyAnonName}
                      onChange={(e) => setReplyAnonName(e.target.value)}
                      placeholder="Ваше имя *"
                      className="w-full sm:w-64 px-3 py-1.5 text-xs rounded-lg bg-[#17344F]/60 border border-white/10 text-white focus:outline-none focus:border-[#E7C768]"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Напишите ответ..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-[#17344F]/60 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-[#E7C768]"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-lg bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </form>
            )}

            {/* Render child replies */}
            {item.replies && item.replies.length > 0 && (
              <div className="space-y-1">
                {item.replies.map(reply => renderCommentItem(reply, true))}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#1E4468]/60 to-[#17344F]/60 p-5 sm:p-7 space-y-6 shadow-xl"
      id={`comments-section-${entityId}`}
    >
      
      {/* 1. REACTIONS ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 select-none">
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">Оцените {entityType === 'post' ? 'публикацию' : 'отзыв'}:</h4>
          <p className="text-[10px] text-slate-400">Нажмите на эмодзи ниже, чтобы выразить эмоцию к материалу</p>
        </div>

        {/* Big emoji buttons with counters */}
        <div className="flex flex-wrap gap-2" id="entity-reactions-row">
          {EMOJI_OPTIONS.map(emoji => {
            const count = reactions[emoji] || 0;
            const isReacted = !!userReactions[emoji];
            return (
              <button
                key={emoji}
                onClick={() => handleToggleEntityReaction(emoji)}
                className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
                  isReacted
                    ? 'bg-amber-400/10 border-amber-200 text-amber-200 scale-105 shadow-md shadow-amber-200/10'
                    : 'bg-[#17344F]/40 border-white/5 text-slate-300 hover:text-white'
                }`}
              >
                <span className="text-sm">{emoji}</span>
                {count > 0 && <span className="text-[10px] font-mono">{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. COMMENTS LIST */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
            <MessageSquare size={15} className="text-[#E7C768]" />
            <span>Обсуждение и комментарии ({comments.length})</span>
          </h4>
          {aiTyping && (
            <span className="text-[10px] text-amber-200 animate-pulse font-mono flex items-center gap-1">
              <Sparkles size={11} className="animate-spin-slow" />
              ИИ пишет автокомментарий...
            </span>
          )}
        </div>

        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin">
          {comments.length > 0 ? (
            comments.map(c => renderCommentItem(c))
          ) : (
            <p className="text-center py-6 text-xs text-slate-400">Здесь пока нет комментариев. Напишите свой первый комментарий ниже!</p>
          )}
        </div>
      </div>

      {/* 3. NEW COMMENT FORM */}
      <div className="border-t border-white/5 pt-5">
        <h5 className="text-xs font-bold uppercase tracking-wider text-amber-200 mb-3.5 flex items-center gap-1">
          <Smile size={13} />
          <span>Написать комментарий:</span>
        </h5>

        <form onSubmit={handleSubmitComment} className="space-y-3.5">
          {currentUser ? (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Вы авторизованы как <strong className="text-white">{currentUser.name}</strong> ({currentUser.position || 'Пользователь'})</span>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Ваше имя *</label>
              <input 
                type="text"
                required
                value={anonName}
                onChange={(e) => setAnonName(e.target.value)}
                placeholder="Представьтесь (например: Николай)"
                className="w-full sm:w-72 px-3 py-2 text-xs rounded-xl bg-[#17344F]/50 border border-white/10 text-white focus:outline-none focus:border-[#E7C768] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Сообщение *</label>
            <textarea 
              required
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Введите текст комментария..."
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-[#E7C768] transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] hover:brightness-110 text-slate-900 text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
          >
            <span>Отправить комментарий</span>
            <Send size={12} />
          </button>
        </form>
      </div>

    </div>
  );
}
