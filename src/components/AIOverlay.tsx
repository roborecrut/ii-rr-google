import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, X } from 'lucide-react';

interface AIOverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  onRetry?: () => void;
  isLoading: boolean;
  error: string | null;
  countdown: number;
  mascotType?: 'welcome' | 'bell' | 'serious' | 'happy' | 'success' | 'clock' | 'test' | 'sad';
}

const MASCOTS = {
  welcome: 'https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR2.png', // friendly RR with tablet/pen
  bell: 'https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR3.png',    // notifications with megaphone
  serious: 'https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR4.png', // crossed arms
  happy: 'https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR5.png',   // dancing/joyful
  success: 'https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR6.png', // success everything worked
  clock: 'https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR7.png',   // looking at clock
  test: 'https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR8.png',    // question mark & clock for tests/FAQ
  sad: 'https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR9.png',     // broken/sad RR when error
};

const WAITING_PHRASES = [
  "Связываюсь с главным процессором ИИ...",
  "Оптимизирую нейросети для вашего отчета...",
  "Робот RR полирует формулировки...",
  "Анализирую показатели эффективности...",
  "Сравниваю план с фактом...",
  "Формирую индивидуальные рекомендации для вас...",
  "Затачиваю цифровой карандаш для записи...",
  "Проверяю орфографию и деловой стиль текста...",
  "Сдуваю космическую пыль со серверов...",
  "Подсчитываю баллы качества заполнения...",
  "Изучаю ваш индивидуальный рабочий график...",
  "Ищу скрытые резервы повышения вашей эффективности...",
  "Готовлю порцию профессионального вдохновения...",
  "Конструирую идеальную структуру рапорта...",
  "Перевожу мысли в структурированный текст...",
  "Применяю стандарты Apple Liquid Glass к тексту...",
  "Интегрирую полезные подсказки в Telegram...",
  "Проверяю баланс и реферальные бонусы...",
  "Маскот RR одобрительно кивает вашему прогрессу...",
  "Почти готово! Финализирую рекомендации..."
];

export default function AIOverlay({
  isOpen,
  onClose,
  onRetry,
  isLoading,
  error,
  countdown,
  mascotType = 'welcome'
}: AIOverlayProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Cycle through waiting phrases every 4 seconds when loading
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % WAITING_PHRASES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

  const currentMascot = error ? MASCOTS.sad : MASCOTS[mascotType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17344F]/85 backdrop-blur-md animate-fade-in" id="ai-overlay-container">
      <div className="relative w-full max-w-lg overflow-hidden border border-amber-200/30 shadow-2xl rounded-3xl bg-gradient-to-b from-[#17344F] to-[#265582] p-8 text-white flex flex-col items-center" id="ai-overlay-card">
        
        {/* Close Button if error or not strictly loading */}
        {(!isLoading || error) && onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white rounded-full bg-[#1E4468]/40 hover:bg-[#1E4468]/70 transition-all border border-white/10"
            id="ai-overlay-close-btn"
          >
            <X size={18} />
          </button>
        )}

        {/* Liquid glass reflection effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10" />

        {/* Mascot image with pulse animation */}
        <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
          <img 
            src={currentMascot} 
            alt="Mascot RR" 
            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(231,199,104,0.3)] animate-pulse-slow"
            referrerPolicy="no-referrer"
            id="ai-overlay-mascot"
          />
          {isLoading && !error && (
            <div className="absolute inset-0 border-4 border-amber-200/20 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
          )}
        </div>

        {error ? (
          /* Error State */
          <div className="text-center w-full flex flex-col items-center animate-fade-in" id="ai-overlay-error-state">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 mb-4 animate-bounce">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-yellow-100 to-amber-300 bg-clip-text text-transparent font-sans">
              Произошла ошибка
            </h3>
            <p className="text-slate-200 text-sm mb-6 max-w-xs leading-relaxed">
              {error || "ИИ-сервис временно недоступен или превышено время ожидания."}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-6 py-3 font-semibold rounded-xl border border-amber-200 bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 shadow-[0_4px_15px_rgba(217,158,65,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer font-sans"
                id="ai-overlay-retry-btn"
              >
                <RefreshCw size={16} className="animate-spin-reverse" />
                Запустить повторно
              </button>
            )}
          </div>
        ) : (
          /* Loading / Active State */
          <div className="text-center w-full flex flex-col items-center animate-fade-in" id="ai-overlay-loading-state">
            {/* Bubble Dialog */}
            <div className="relative bg-[#17344F]/80 border border-amber-100/20 rounded-2xl p-4 mb-6 max-w-md w-full shadow-lg text-slate-100 text-sm italic leading-relaxed" id="ai-overlay-bubble">
              <p className="animate-pulse">{WAITING_PHRASES[phraseIndex]}</p>
              {/* Bubble Speech Arrow */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-[#17344F]/80" />
            </div>

            {/* Countdown and Visual Loader */}
            <div className="flex flex-col items-center gap-2" id="ai-overlay-countdown-container">
              <div className="text-3xl font-mono font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] bg-clip-text text-transparent">
                {countdown}s
              </div>
              <p className="text-xs text-slate-300 font-sans tracking-wide uppercase">
                Время ожидания (макс. 120 сек)
              </p>
              
              {/* Progress bar */}
              <div className="w-48 h-1.5 bg-[#17344F]/60 rounded-full mt-2 overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] transition-all duration-1000" 
                  style={{ width: `${(countdown / 120) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
