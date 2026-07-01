import React, { useState } from 'react';
import { Sparkles, MessageSquare, Mic, ShieldAlert, Calendar, Users, Sliders, Check, HelpCircle, ArrowRight, MessageCircle } from 'lucide-react';
import TypewriterText from '../components/TypewriterText';
import VerticalReviewsCarousel from '../components/VerticalReviewsCarousel';

interface Review {
  id: string;
  name: string;
  company: string;
  text: string;
  aiResponse: string | null;
  officialResponse: string;
  date: string;
}

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onOpenLoginModal: () => void;
}

export default function LandingPage({ onNavigate, onOpenLoginModal }: LandingPageProps) {
  // Calculator state
  const [employeesCount, setEmployeesCount] = useState<number>(10);
  const [tariffType, setTariffType] = useState<'trial' | 'business'>('business');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      name: 'Александр',
      company: 'ООО «ТехноПром»',
      text: 'Внедрение ИИ Рапорта сэкономило руководителям до 10 часов в неделю! Сотрудники теперь заполняют план-факт голосом за пару минут, а ИИ выдает крутые рекомендации по качеству.',
      aiResponse: 'Благодарим за подробный отзыв! ИИ Рапорт рад помогать ООО «ТехноПром» экономить время и улучшать показатели качества смен за счет автоматического структурирования голоса.',
      officialResponse: 'Спасибо за доверие, Александр! Мы рады, что голосовой ввод освободил время ваших менеджеров. Работаем над улучшением алгоритма рекомендаций.',
      date: '12.06.2026'
    },
    {
      id: '2',
      name: 'Мария',
      company: 'Маркетинговое агентство «ГроуФлоу»',
      text: 'Главное УТП сервиса реально работает. Мои ребята получают ИИ рекомендации прямо после сдачи недельного отчета, и я вижу, как у них растет осознанность и качество работы без моего личного участия!',
      aiResponse: 'Мы рады, что наши индивидуальные ИИ-советы помогают повышать мотивацию сотрудников. Осознанность — ключ к росту эффективности отдела!',
      officialResponse: 'Приветствуем команду «ГроуФлоу»! Благодарим за отзыв о нашем главном УТП. В следующем обновлении добавим новые шаблоны аналитики.',
      date: '28.06.2026'
    },
    {
      id: '3',
      name: 'Дмитрий',
      company: 'Франшиза «ДодоПицца»',
      text: 'Специфика общепита — высокая текучесть и короткие смены. С помощью ИИ Рапортов мы настроили быстрый контроль закрытия смен. Администраторы наговаривают отчет в Телеграм, система переносит данные, и мы сразу видим пробелы.',
      aiResponse: 'Рады быть полезными для вашего ресторанного бизнеса! ИИ Рапорт идеально структурирует отчеты ресторанных смен, снижая нагрузку на управляющих.',
      officialResponse: 'Дмитрий, благодарим за отзыв! Мы гордимся тем, что помогаем оптимизировать операционку в общепите. Скоро выйдет интеграция с кассовым ПО.',
      date: '15.06.2026'
    },
    {
      id: '4',
      name: 'Елена',
      company: 'Кадровое агентство «HR-Партнер»',
      text: 'Используем систему для контроля ежедневных звонков и собеседований рекрутеров. ИИ отлично анализирует сложные текстовые сводки и выделяет ключевые метрики. Плюс ИИ-подсказки реально подтягивают дисциплину сотрудников.',
      aiResponse: 'Спасибо за доверие! Наш ИИ всегда готов анализировать звонки, контакты и воронки подбора, формируя точные аналитические выводы.',
      officialResponse: 'Елена, спасибо! Приятно слышать, что ИИ помогает кадровому сектору работать эффективнее. В планах — ИИ-оценка вовлеченности кандидатов.',
      date: '20.06.2026'
    },
    {
      id: '5',
      name: 'Сергей',
      company: 'Студия веб-разработки «КодАрт»',
      text: 'Раньше тратили кучу времени на созвоны по статусу проектов. Теперь разработчики просто отправляют краткий голосовой отчет вечером, а менеджеры получают готовую сводку с рисками от ИИ. Прозрачность выросла на 200%!',
      aiResponse: 'Экономия времени на дейли-митингах — одна из главных задач ИИ Рапорта. Рады, что разработчикам КодАрт зашел голосовой формат!',
      officialResponse: 'Сергей, привет команде КодАрт! Мы сами разработчики и знаем, как ценно время без лишних созвонов. Рады вашим успехам!',
      date: '25.06.2026'
    },
    {
      id: '6',
      name: 'Ольга',
      company: 'Логистическая компания «СмартЛайн»',
      text: 'Контролируем отчеты логистов по доставкам и инцидентам на дорогах. Благодаря ИИ аналитике мы стали замечать системные проблемы в рейсах на 2 дня раньше, чем раньше. Очень удобные графики работы и тарифы.',
      aiResponse: 'Отличный кейс использования в логистике! Быстрое выявление инцидентов позволяет экономить бюджеты на доставках. Спасибо за отзыв!',
      officialResponse: 'Ольга, благодарим за обратную связь! Логистические процессы требуют максимальной скорости реакции, и мы рады помогать вашей компании.',
      date: '29.06.2026'
    }
  ]);

  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewCompany, setNewReviewCompany] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [aiReviewReply, setAiReviewReply] = useState<string | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    setIsSubmittingReview(true);
    setAiReviewReply("ИИ Рапорт анализирует ваш отзыв...");

    // Simulate AI generation for the review reply
    setTimeout(async () => {
      let aiGeneratedReply = "Спасибо за ваш отзыв! Мы постоянно обучаем нейросеть ii_rr, чтобы отчетность становилась еще удобнее для вашего бизнеса.";
      
      try {
        const promptText = `Пользователь оставил отзыв на сервис ИИ Рапорт: "${newReviewText}". Напиши краткий, дружелюбный автоматический ответ от нейросети ИИ Рапорт на этот отзыв (1-2 предложения).`;
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText })
        });
        if (response.ok) {
          const data = await response.json();
          aiGeneratedReply = data.text;
        }
      } catch (err) {
        console.warn("Could not fetch actual AI review response:", err);
      }

      const newReviewItem: Review = {
        id: Date.now().toString(),
        name: newReviewName,
        company: newReviewCompany || 'Анонимная компания',
        text: newReviewText,
        aiResponse: aiGeneratedReply,
        officialResponse: 'Благодарим за обратную связь! Наша команда поддержки всегда на связи, чтобы сделать ИИ Рапорт еще полезнее для вас.',
        date: new Date().toLocaleDateString('ru-RU')
      };

      setReviews((prev) => [newReviewItem, ...prev]);
      setNewReviewName('');
      setNewReviewCompany('');
      setNewReviewText('');
      setIsSubmittingReview(false);
      setAiReviewReply(null);
    }, 2500);
  };

  // Pricing calculations
  const pricePerEmployee = 290;
  const businessMonthlyTotal = employeesCount * pricePerEmployee;

  return (
    <div className="w-full text-white bg-gradient-to-b from-[#17344F] via-[#1E4468] to-[#265582] font-sans selection:bg-amber-200 selection:text-slate-900" id="landing-page-root">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-24 md:py-32 bg-transparent px-4 sm:px-6" id="hero-section">
        {/* Apple Liquid Glass floating blur blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-amber-200/5 blur-[120px] pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-[300px] h-[300px] rounded-full bg-sky-500/10 blur-[80px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero text content */}
          <div className="lg:col-span-7 space-y-6 text-left animate-slide-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-200/30 bg-[#17344F]/60 text-amber-200 text-xs font-semibold tracking-wider uppercase font-mono shadow-md">
              <Sparkles size={13} className="text-amber-300 animate-spin" />
              <span>Главное УТП: ИИ Рекомендации сотрудникам</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-[#F4EE8E] bg-clip-text text-transparent">
              <TypewriterText text="ИИ Рапорт — отчеты, которые обучают" speed={40} />
            </h2>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
              Революционная система отчетности для сотрудников отделов. Голосовой и текстовый ввод, автоматическое структурирование рапортов ИИ и <strong className="text-amber-200 font-semibold">персональные умные рекомендации</strong> каждому сотруднику сразу после сдачи!
            </p>

            {/* Quick stats badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 text-left">
              <div className="p-3 rounded-2xl bg-[#17344F]/50 border border-white/5 backdrop-blur-md">
                <p className="text-xl font-bold text-amber-200 font-mono">2 минуты</p>
                <p className="text-[11px] text-slate-300">на заполнение с ИИ</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#17344F]/50 border border-white/5 backdrop-blur-md">
                <p className="text-xl font-bold text-amber-200 font-mono">100%</p>
                <p className="text-[11px] text-slate-300">персональный анализ</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#17344F]/50 border border-white/5 backdrop-blur-md col-span-2 sm:col-span-1">
                <p className="text-xl font-bold text-emerald-400 font-mono">15 минут</p>
                <p className="text-[11px] text-slate-300">напоминания в Telegram</p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={onOpenLoginModal}
                className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 shadow-[0_8px_25px_rgba(217,158,65,0.4)] hover:shadow-[0_12px_30px_rgba(217,158,65,0.6)] hover:brightness-110 active:scale-95 transition-all cursor-pointer text-sm flex items-center gap-2 font-sans"
                id="hero-cta-trial"
              >
                Попробовать 7 дней бесплатно
                <ArrowRight size={16} />
              </button>
              
              <button
                onClick={() => {
                  const el = document.getElementById('calculator-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-4 rounded-2xl font-bold border border-white/10 bg-[#1E4468]/40 hover:bg-[#1E4468]/60 transition-all text-sm cursor-pointer text-white"
                id="hero-cta-calc"
              >
                Рассчитать стоимость
              </button>
            </div>
          </div>

          {/* Hero Mascot representation */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative p-6 rounded-3xl bg-[#17344F]/40 border border-white/10 shadow-2xl backdrop-blur-md flex flex-col items-center max-w-sm w-full" id="hero-mascot-box">
              {/* Glass reflection */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10 rounded-3xl" />
              
              <img 
                src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR2.png" 
                alt="Приветливый Робот RR" 
                className="w-56 h-56 object-contain animate-pulse-slow drop-shadow-[0_0_20px_rgba(231,199,104,0.3)]"
                referrerPolicy="no-referrer"
              />
              <div className="relative bg-[#17344F]/85 border border-amber-200/20 rounded-2xl p-4.5 text-xs text-slate-100 italic mt-4 text-center leading-relaxed">
                "Привет! Я робот RR с ручкой и планшетом. Я помогу заполнить ваши отчеты за считанные секунды и дам полезные подсказки для вашей работы!"
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-[#17344F]/85" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CORE USP & FEATURES SECTION */}
      <section className="py-20 px-4 sm:px-6 bg-[#17344F]/20 backdrop-blur-sm" id="features-section">
        <div className="mx-auto max-w-7xl text-center space-y-12">
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#F4EE8E] bg-clip-text text-transparent">
              Система отчетности, которая помогает расти
            </h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              «ИИ Рапорт» — это не просто сборщик файлов. Это виртуальный ментор для каждого сотрудника вашей компании, который повышает общую продуктивность на 35%.
            </p>
          </div>

          {/* Bento-like feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
            
            {/* Main USP Box: Large */}
            <div className="md:col-span-7 rounded-3xl border border-white/10 bg-gradient-to-br from-[#17344F] to-[#265582] p-8 shadow-xl relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10" />
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-200">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <h4 className="text-xl font-extrabold text-[#F4EE8E] font-sans">Главное УТП: Персональные рекомендации ИИ</h4>
                <p className="text-slate-200 text-sm leading-relaxed">
                  После заполнения отчета (на день, неделю или месяц) ИИ моментально анализирует показатели сотрудника, сопоставляет их с обязанностями и выдает <strong className="text-amber-200">3 конкретные рекомендации</strong> по повышению продуктивности. Сотрудник обучается прямо во время работы!
                </p>
              </div>

              {/* Serious Mascot RR4 integration */}
              <div className="mt-8 flex items-center gap-4 bg-[#17344F]/40 p-4 rounded-2xl border border-white/5">
                <img 
                  src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR4.png" 
                  alt="Серьезный Робот RR" 
                  className="w-16 h-16 object-contain animate-pulse-slow flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs">
                  <p className="text-[#F4EE8E] font-bold">Серьезный наставник RR:</p>
                  <p className="text-slate-300 italic">"Я проверяю рапорты на содержательность, выставляю балл качества (Quality Score) и указываю на слабые места."</p>
                </div>
              </div>
            </div>

            {/* Voice typing box */}
            <div className="md:col-span-5 rounded-3xl border border-white/15 bg-gradient-to-br from-[#17344F] to-[#265582] p-8 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-sky-400/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Mic size={20} />
                </div>
                <h4 className="text-lg font-bold text-white">Голосовой отчет в один клик</h4>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Не тратьте время на печать. Нажмите микрофон и просто надиктуйте, что сделали. Наша нейросеть <code className="text-amber-200 font-mono font-semibold">ii_rr</code> уберет слова-паразиты, структурирует мысли и переведет рапорт в безупречный деловой стиль.
                </p>
              </div>
              <div className="pt-6 border-t border-white/5 mt-6 text-xs text-slate-400 font-mono">
                ✓ Снижает время отчетности с 20 до 2 минут
              </div>
            </div>

            {/* Reports structure types */}
            <div className="md:col-span-4 rounded-3xl border border-white/15 bg-gradient-to-br from-[#17344F] to-[#265582] p-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-200">
                  <Calendar size={18} />
                </div>
                <h4 className="text-base font-bold text-white">4 Типа Отчетов</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Планы на день (начало смены), Факт работы (конец смены), развернутые Отчеты за неделю и месяц. Вся отчетность фильтруется по удобному календарю для контроля периодов.
                </p>
              </div>
            </div>

            {/* For Managers and Directors */}
            <div className="md:col-span-4 rounded-3xl border border-white/15 bg-gradient-to-br from-[#17344F] to-[#265582] p-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Users size={18} />
                </div>
                <h4 className="text-base font-bold text-white">Саммари руководителю</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Забудьте про чтение сотен отчетов. ИИ соберет все рапорты ваших сотрудников в емкие саммари за любой период, подсветит проблемы, успехи и даст готовую сводную аналитику.
                </p>
              </div>
            </div>

            {/* Dynamic visual charts */}
            <div className="md:col-span-4 rounded-3xl border border-white/15 bg-gradient-to-br from-[#17344F] to-[#265582] p-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-purple-400/10 border border-purple-400/30 flex items-center justify-center text-purple-400">
                  <Sliders size={18} />
                </div>
                <h4 className="text-base font-bold text-white">Конструктор Форм</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Создавайте любые поля в удобном ИИ-конструкторе под специфику конкретного отдела за 5 секунд. ИИ сам подскажет лучшие формулировки вопросов и подсказок.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. TELEGRAM INTEGRATION & NOTIFICATIONS */}
      <section className="py-20 px-4 sm:px-6 bg-[#265582]/20 border-t border-b border-white/10 backdrop-blur-sm relative" id="telegram-section">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text and stats */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-semibold">
              <MessageCircle size={13} />
              <span>Интеграция с Telegram</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#F4EE8E] bg-clip-text text-transparent">
              Уведомления и напоминания в Telegram бот
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Не сдали вовремя отчет? Спустя <strong className="text-[#F4EE8E] font-semibold">15 минут</strong> после начала или завершения смены по личному графику наш бот напомнит сотруднику в личку. Уведомления и саммари отправляются в красивом разметке <code className="text-amber-200 font-mono bg-[#17344F]/50 px-1.5 py-0.5 rounded text-xs">Markdown</code> нового обновления Telegram прямо в групповой чат отдела!
            </p>

            {/* Megaphone Mascot RR3 */}
            <div className="flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#17344F]/90 to-[#265582]/90 border border-white/15 items-center">
              <img 
                src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR3.png" 
                alt="Робот RR Оповещения" 
                className="w-16 h-16 object-contain animate-pulse-slow flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs">
                <p className="text-[#F4EE8E] font-bold">Оповещатель RR с рупором:</p>
                <p className="text-slate-300 italic">"Бип-буп! Я никогда не просплю. Если отчет задерживается — я вежливо, но настойчиво напомню сотруднику в личные сообщения!"</p>
              </div>
            </div>
          </div>

          {/* Graphic mockup of Telegram message */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-3xl border border-sky-500/30 bg-gradient-to-br from-[#17344F] to-[#265582] p-6 shadow-2xl relative flex flex-col justify-between" id="telegram-mockup">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sky-400 animate-ping" />
                  <span className="text-xs font-bold font-mono tracking-wider text-sky-300 uppercase">TELEGRAM БОТ</span>
                </div>
                {/* Mascot RR7 looking at clock */}
                <img 
                  src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR7.png" 
                  alt="RR с часами" 
                  className="w-10 h-10 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-3 font-mono text-[11px] leading-relaxed text-slate-100">
                <p className="text-slate-400">🤖 [ИИ Рапорт Бот] · 18:15</p>
                <div className="bg-[#17344F]/85 border border-white/5 rounded-xl p-3 space-y-1.5 text-slate-200">
                  <p><strong className="text-[#F4EE8E]">🔔 НАПОМИНАНИЕ: ФАКТ ЗА СМЕНУ</strong></p>
                  <p>Привет, <span className="text-sky-300">Дмитрий</span>!</p>
                  <p>По вашему графику смена завершилась в 18:00. Вы забыли сдать отчет **Факт за день**.</p>
                  <p>⏳ Напоминание пришло в личку, так как прошло 15 минут.</p>
                  <p className="text-amber-100 italic">Пожалуйста, надиктуйте отчет голосом или напишите текстом.</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={onOpenLoginModal}
                  className="flex-1 py-2 text-center text-[10px] font-bold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-900 cursor-pointer transition-colors"
                >
                  Заполнить отчет 📋
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. PRICING & CALCULATOR SECTION */}
      <section className="py-20 px-4 sm:px-6 bg-[#17344F]/10 backdrop-blur-sm" id="calculator-section">
        <div className="mx-auto max-w-7xl text-center space-y-12">
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-200 text-xs font-semibold uppercase tracking-wider font-mono">
              Тарифы и калькулятор
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#F4EE8E] bg-clip-text text-transparent">
              Прозрачная стоимость без скрытых платежей
            </h3>
            <p className="text-slate-400 text-sm sm:text-base">
              Начните с бесплатного пробного периода и переходите на бизнес-тариф по мере масштабирования компании.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
            
            {/* Trial Card */}
            <div className="lg:col-span-5 rounded-3xl border-2 border-amber-200/30 bg-gradient-to-b from-[#17344F] to-[#265582] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full group">
              <div className="absolute top-0 right-0 p-2 text-[10px] font-bold tracking-widest text-[#F4EE8E] uppercase bg-amber-500/20 rounded-bl-xl border-l border-b border-amber-200/20 font-mono">
                ТРИАЛ
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-2xl font-bold text-white font-sans">Пробный период</h4>
                  <p className="text-slate-300 text-xs mt-1">Оцените все преимущества ИИ отчетности абсолютно бесплатно</p>
                </div>

                <div className="text-4xl font-black text-[#F4EE8E] font-sans">
                  0 ₽ <span className="text-xs text-slate-300 font-normal">/ 7 дней</span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Доступно бесплатно <strong className="text-[#F4EE8E]">50 отчетов</strong> сотрудников</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Без ограничений по числу сотрудников и отделов</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Без ограничений по количеству руководителей</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Бесплатное ИИ-создание должностей и рапортов</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Интеграция с Telegram и личный график</span>
                  </li>
                </ul>
              </div>

              {/* Joyful Mascot RR5 */}
              <div className="mt-8 flex items-center gap-4 bg-[#17344F]/40 p-4 rounded-2xl border border-white/5">
                <img 
                  src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR5.png" 
                  alt="Радостный Робот RR" 
                  className="w-14 h-14 object-contain animate-pulse-slow flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="text-[11px]">
                  <p className="text-[#F4EE8E] font-bold">Радостный RR:</p>
                  <p className="text-slate-300 italic">"Дарим сияние и 7 дней полной свободы! Регистрируйтесь, это ни к чему не обязывает!"</p>
                </div>
              </div>

              <button
                onClick={onOpenLoginModal}
                className="mt-6 w-full py-3.5 rounded-xl font-bold bg-white text-[#17344F] text-xs uppercase tracking-wider hover:bg-slate-100 active:scale-98 transition-all cursor-pointer font-sans text-center"
              >
                Запустить триал бесплатно
              </button>
            </div>

            {/* Business Card with Slider */}
            <div className="lg:col-span-7 rounded-3xl border border-white/15 bg-gradient-to-br from-[#17344F] to-[#265582] p-8 shadow-2xl flex flex-col justify-between h-full">
              
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl font-bold text-white font-sans">Тариф «Бизнес»</h4>
                    <p className="text-slate-400 text-xs mt-1">Оптимальное решение для эффективных команд любого масштаба</p>
                  </div>
                  <div className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Рекомендуем
                  </div>
                </div>

                <div className="bg-[#17344F]/40 p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-200">
                    <span>Количество сотрудников:</span>
                    <span className="font-mono text-base font-bold text-amber-200">{employeesCount} чел.</span>
                  </div>
                  
                  {/* Slider Control */}
                  <div className="relative pt-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="150" 
                      value={employeesCount}
                      onChange={(e) => setEmployeesCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#1E4468]/60 rounded-lg appearance-none cursor-pointer accent-[#D99E41]"
                      id="employees-slider"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>1</span>
                      <span>50</span>
                      <span>100</span>
                      <span>150+</span>
                    </div>
                  </div>

                  {/* Pricing summary */}
                  <div className="pt-4 border-t border-white/5 flex flex-wrap justify-between items-end gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400">Ставка за 1 сотрудника:</p>
                      <p className="text-lg font-bold text-white font-mono">290 ₽ / месяц</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Итого в месяц:</p>
                      <p className="text-2xl sm:text-3xl font-black text-[#F4EE8E] font-sans">
                        {businessMonthlyTotal.toLocaleString('ru-RU')} ₽ <span className="text-xs text-slate-300 font-normal">/ мес</span>
                      </p>
                    </div>
                  </div>
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Без лимита по отчетам</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Без лимита по отделам и шефам</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>ИИ-генерация структуры компании</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                    <span>Саммари и Сводная ИИ-аналитика</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenLoginModal}
                className="mt-8 w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 shadow-md transition-all cursor-pointer font-sans text-center"
              >
                Купить для {employeesCount} сотрудников
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE REVIEWS & FEEDBACK FORM */}
      <section className="py-20 px-4 sm:px-6 bg-[#265582]/10 border-t border-white/10 backdrop-blur-sm" id="reviews-section">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2">
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#F4EE8E] bg-clip-text text-transparent">
                Что говорят клиенты
              </h3>
              {/* Success Mascot RR6 next to title */}
              <img 
                src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR6.png" 
                alt="Успешный Робот RR" 
                className="w-12 h-12 object-contain animate-pulse-slow"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Реальные отзывы руководителей и владельцев бизнеса о качестве и удобстве сервиса. Напишите свой анонимный отзыв, и наш ИИ ответит на него мгновенно!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Reviews display list (Vertical Carousel with 2 preview blocks on each side) */}
            <div className="lg:col-span-7" id="reviews-carousel-container">
              <VerticalReviewsCarousel 
                reviews={reviews}
                activeIndex={activeReviewIndex}
                onChangeIndex={setActiveReviewIndex}
              />
            </div>

            {/* Submit review form */}
            <div className="lg:col-span-5 rounded-3xl border border-amber-200/30 bg-gradient-to-b from-[#17344F] to-[#265582] p-8 shadow-2xl relative overflow-hidden" id="review-form-box">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10" />
              
              <h4 className="text-lg font-bold text-white mb-1 font-sans">Оставить анонимный отзыв</h4>
              <p className="text-slate-300 text-xs mb-6">Ваше мнение улучшает качество работы нашего ИИ-алгоритма.</p>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Ваше имя *</label>
                  <input
                    type="text"
                    required
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="Например, Виталий"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Компания / Сфера деятельности</label>
                  <input
                    type="text"
                    value={newReviewCompany}
                    onChange={(e) => setNewReviewCompany(e.target.value)}
                    placeholder="Например, ООО «ПродОпт»"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Текст отзыва *</label>
                  <textarea
                    required
                    rows={4}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Поделитесь вашим впечатлением от использования сервиса ИИ Рапорт..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] transition-colors resize-none"
                  />
                </div>

                {isSubmittingReview && (
                  <div className="p-3 bg-amber-400/10 border border-amber-400/20 text-amber-200 text-xs rounded-xl flex items-center gap-2 animate-pulse">
                    <Sparkles size={14} className="animate-spin" />
                    <span>{aiReviewReply}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingReview || !newReviewName.trim() || !newReviewText.trim()}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer font-sans"
                >
                  Отправить отзыв
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
