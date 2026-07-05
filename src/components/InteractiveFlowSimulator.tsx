import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Mic, Calendar, TrendingUp, CheckCircle2, AlertCircle, XCircle, 
  Play, Pause, Info, Square, RefreshCw, Volume2, Clock, Award, ThumbsUp, Bell, 
  Trophy, Send, UserCheck, Flame, MessageSquare, MapPin, Smile, FileText, 
  HelpCircle, Phone, Coins, Check, Sliders, ChevronRight, Share2, Shield, Eye, ArrowRight
} from 'lucide-react';

type StepId = 
  | 'creation_system' 
  | 'employee_comfort' 
  | 'schedules_shifts' 
  | 'ai_scores' 
  | 'manager_reactions' 
  | 'reminders' 
  | 'gamification' 
  | 'ai_analytics' 
  | 'telegram_delivery';

interface Step {
  id: StepId;
  title: string;
  shortDesc: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function InteractiveFlowSimulator() {
  const [activeStep, setActiveStep] = useState<StepId>('creation_system');
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [autoplayProgress, setAutoplayProgress] = useState(0);

  // Auto-running timer for scenario steps
  const [scenarioTick, setScenarioTick] = useState(0);

  // Steps definition for all 9 key modules
  const steps: Step[] = [
    {
      id: 'creation_system',
      title: '1. Умное Создание',
      shortDesc: 'Сбор голоса, фото и геолокации',
      description: 'Сотрудник наговаривает отчет голосом, прикрепляет фото выполненных работ и файлов, а GPS фиксирует точные координаты сдачи.',
      icon: <Sparkles size={16} />,
      color: 'from-amber-400 to-[#D99E41]'
    },
    {
      id: 'employee_comfort',
      title: '2. Комфорт Сотрудников',
      shortDesc: 'Сдача отчета за 2 минуты без рутины',
      description: 'Больше нет скучных бланков. Свободная речь автоматически структурируется ИИ по нужным полям шаблона.',
      icon: <Smile size={16} />,
      color: 'from-sky-400 to-blue-500'
    },
    {
      id: 'schedules_shifts',
      title: '3. Графики и Смены',
      shortDesc: 'Гибкий календарь выходов и замен',
      description: 'Контролируйте смены, больничные и отгулы. ИИ сопоставляет графики с фактической сдачей рапортов.',
      icon: <Calendar size={16} />,
      color: 'from-emerald-400 to-teal-500'
    },
    {
      id: 'ai_scores',
      title: '4. Оценки и Рекомендации',
      shortDesc: 'Quality Score и ИИ-наставничество',
      description: 'Нейросеть оценивает отчет на содержательность и выдает 3 индивидуальных совета для роста сотрудника.',
      icon: <Award size={16} />,
      color: 'from-purple-400 to-indigo-500'
    },
    {
      id: 'manager_reactions',
      title: '5. Реакции с ИИ',
      shortDesc: 'Рецензии в один клик для лидера',
      description: 'Директор получает краткие саммари отчетов и отправляет умную обратную связь одной кнопкой.',
      icon: <ThumbsUp size={16} />,
      color: 'from-pink-400 to-rose-500'
    },
    {
      id: 'reminders',
      title: '6. Контроль Сроков',
      shortDesc: 'Умный бот-оповещатель в Telegram',
      description: 'Спустя 15 минут после завершения смены бот вежливо напомнит в Telegram о забытом отчете.',
      icon: <Bell size={16} />,
      color: 'from-red-400 to-orange-500'
    },
    {
      id: 'gamification',
      title: '7. Награды и Мотивация',
      shortDesc: 'Личные streaks и Магазин Благ',
      description: 'Сотрудники зарабатывают баллы, соревнуются в рейтингах и обменивают монеты на реальные призы.',
      icon: <Trophy size={16} />,
      color: 'from-yellow-400 to-amber-500'
    },
    {
      id: 'ai_analytics',
      title: '8. Аналитика Периодов',
      shortDesc: 'Поиск скрытых аномалий и сводки',
      description: 'ИИ агрегирует отчеты за неделю, находит сбои в бизнес-процессах и формирует емкие бизнес-инсайты.',
      icon: <TrendingUp size={16} />,
      color: 'from-violet-400 to-fuchsia-500'
    },
    {
      id: 'telegram_delivery',
      title: '9. Отправка в Telegram',
      shortDesc: 'Доставка в чаты отделов и личку',
      description: 'Мгновенная доставка готовых отчетов и уведомлений в Telegram-группу вашей команды с красивой Markdown разметкой.',
      icon: <Send size={16} />,
      color: 'from-blue-400 to-sky-500'
    }
  ];

  // Steps sequence helper
  const stepOrder: StepId[] = [
    'creation_system',
    'employee_comfort',
    'schedules_shifts',
    'ai_scores',
    'manager_reactions',
    'reminders',
    'gamification',
    'ai_analytics',
    'telegram_delivery'
  ];

  // Main Autoplay Effect
  useEffect(() => {
    if (!isAutoplay) return;

    const intervalTime = 100; // Tick every 100ms
    const totalTicks = 80; // 8 seconds per step (80 * 100ms)

    const timer = setInterval(() => {
      setAutoplayProgress((prev) => {
        if (prev >= 100) {
          // Go to next step
          const currentIndex = stepOrder.indexOf(activeStep);
          const nextIndex = (currentIndex + 1) % stepOrder.length;
          setActiveStep(stepOrder[nextIndex]);
          setScenarioTick(0);
          return 0;
        }
        return prev + (100 / totalTicks);
      });

      setScenarioTick((prev) => prev + 1);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAutoplay, activeStep]);

  // Restart scenario ticks when active step changes manually
  const handleStepSelect = (stepId: StepId) => {
    setActiveStep(stepId);
    setScenarioTick(0);
    setAutoplayProgress(0);
  };

  // Dynamic values based on scenario ticks (0 to 80 ticks)
  // Step 1 states
  const step1Uploading = scenarioTick < 25;
  const step1Processing = scenarioTick >= 25 && scenarioTick < 50;
  const step1Done = scenarioTick >= 50;

  // Step 2 states
  const typedTextLength = Math.min(Math.floor(scenarioTick * 2.5), 140);
  const rawSpeechText = "Закончил смену на точке. Выручка составила 42500 рублей, кассу закрыл без расхождений. Витрина в порядке, все ценники обновил. Завтра нужно принять поставку в 10 утра.";
  const simulatedTypedSpeech = rawSpeechText.slice(0, typedTextLength);
  const step2Parsed = scenarioTick >= 45;

  // Step 3 states
  const scheduleCycle = Math.floor(scenarioTick / 25) % 3; // 3 states: Work, Sick, Vacation

  // Step 4 states
  const displayedScore = scenarioTick < 10 ? 0 : Math.min(Math.floor((scenarioTick - 10) * 2.7), 94);
  const showTips = scenarioTick >= 40;

  // Step 5 states
  const reactionCycle = Math.floor(scenarioTick / 25) % 3; // 3 states: praise, critique, support
  const reactionType = reactionCycle;

  // Step 6 states
  const showNotification = scenarioTick >= 35;
  const timeString = scenarioTick < 15 ? "17:59" : scenarioTick < 35 ? "18:00" : "18:15";

  // Step 7 states
  const coinAdd = scenarioTick >= 45;
  const bonusClaimed = scenarioTick >= 45;
  const streakCount = scenarioTick >= 45 ? 13 : 12;

  // Step 8 states
  const laserPosition = (scenarioTick % 40) * 2.5; // moves from 0 to 100% and loops twice
  const showAnomalyDiagnosis = scenarioTick >= 40;

  // Step 9 states
  const messageDelivered = scenarioTick >= 40;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="interactive-simulator">
      
      {/* Autoplay / Manual Control Header */}
      <div className="col-span-1 lg:col-span-12 flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#1E4468]/50 to-[#265582]/50 border border-white/10 gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-400/10 text-amber-200 border border-amber-400/20 animate-pulse">
            <Sparkles size={18} />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-extrabold text-[#F4EE8E] flex items-center gap-1.5 font-sans">
              Интерактивный симулятор «ИИ-Автопилот»
            </h4>
            <p className="text-[11px] text-slate-300 leading-normal">
              Посмотрите весь рабочий цикл в реальном времени, как это происходит в личном кабинете сотрудника и директора.
            </p>
          </div>
        </div>

        {/* Play / Pause Toggle button */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-slate-400 font-mono">Текущий режим:</p>
            <p className="text-xs text-emerald-400 font-bold font-mono">
              {isAutoplay ? '🤖 Авто-презентация' : '🖱️ Ручной выбор'}
            </p>
          </div>
          
          <button
            onClick={() => setIsAutoplay(!isAutoplay)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-sans cursor-pointer transition-all border border-amber-200/30 bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-950 hover:brightness-110 active:scale-95"
            id="autoplay-toggle-btn"
          >
            {isAutoplay ? (
              <>
                <Pause size={13} fill="currentColor" />
                <span>Пауза</span>
              </>
            ) : (
              <>
                <Play size={13} fill="currentColor" />
                <span>Автозапуск</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation controls for all 9 steps with progress bars (Vertical list for both mobile and desktop) */}
      <div className="col-span-1 lg:col-span-5 flex flex-col gap-2 max-h-[450px] lg:max-h-[640px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10" id="simulator-steps-list">
        {steps.map((step, idx) => {
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => handleStepSelect(step.id)}
              className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex gap-3.5 items-start relative overflow-hidden group ${
                isActive
                  ? 'bg-gradient-to-r from-[#1E4468]/90 via-[#234E75]/90 to-[#265582]/90 border-[#F4EE8E]/40 shadow-xl scale-[1.01]'
                  : 'bg-gradient-to-r from-[#17344F]/40 to-[#265582]/40 border-white/5 hover:from-[#1E4468]/40 hover:to-[#265582]/40 hover:border-white/10'
              }`}
              id={`step-btn-${step.id}`}
            >
              {/* Autoplay loading indicator background line */}
              {isActive && isAutoplay && (
                <div 
                  className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-[#F4EE8E] to-amber-500 transition-all duration-100 ease-linear"
                  style={{ width: `${autoplayProgress}%` }}
                />
              )}

              {/* Left visual accent bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#F4EE8E] to-[#D99E41]" />
              )}
              
              <div className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${
                isActive 
                  ? 'bg-gradient-to-br from-[#F4EE8E] to-[#D99E41] text-slate-900 shadow-md ring-2 ring-amber-400/20' 
                  : 'bg-[#1E4468]/60 text-slate-300 group-hover:text-[#F4EE8E] group-hover:bg-[#1E4468]'
              }`}>
                {step.icon}
              </div>

              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs font-extrabold tracking-wide ${isActive ? 'text-[#F4EE8E]' : 'text-white group-hover:text-amber-200'}`}>
                    {step.title}
                  </h4>
                  {isActive && (
                    <span className="text-[8px] font-mono px-1.5 py-0.5 bg-amber-400/10 text-amber-200 rounded-md animate-pulse border border-amber-400/20">
                      Идет симуляция
                    </span>
                  )}
                </div>
                <p className={`text-[10px] font-medium leading-relaxed ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>
                  {isActive ? step.description : step.shortDesc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right Column: Dynamic CABINET mockup showcase */}
      <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-gradient-to-b from-[#1E4468] via-[#234E75] to-[#265582] p-6 relative shadow-2xl flex flex-col justify-between min-h-[560px] overflow-hidden" id="simulator-terminal">
        
        {/* Absolute liquid glow spots inside the terminal */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-200/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Simulated Browser Header / App Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 relative z-10" id="cabinet-simulator-bar">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/85 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/85 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/85 block" />
            </div>
            <span className="text-[10px] text-[#F4EE8E] font-bold font-mono ml-2 bg-white/10 px-2.5 py-0.5 rounded-md border border-[#F4EE8E]/20">
              Личный кабинет
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10">
            <span className="text-[9px] text-[#F4EE8E] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              РЕЖИМ: ОНЛАЙН-КАБИНЕТ
            </span>
          </div>
        </div>

        {/* SCREEN CONTENT AREA (ANIME-TRANSITIONS) */}
        <div className="flex-1 flex flex-col justify-between relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-between"
            >
              
              {/* STEP 1: MULTIMEDIA CREATION (HIGH FIDELITY) */}
              {activeStep === 'creation_system' && (
                <div className="space-y-4 text-left h-full flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-300 animate-spin-slow" />
                      Мультимодальный захват данных смены
                    </h5>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Сотрудник приступает к сдаче отчета. Он может одновременно записывать аудио, подгружать подтверждающие документы и прикреплять фотоотчеты.
                    </p>
                  </div>

                  {/* Real visual indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-1">
                    
                    {/* Voice recorder simulation panel */}
                    <div className="bg-white/10 border border-white/15 rounded-2xl p-3 flex items-center justify-between shadow-md">
                      <div className="space-y-1">
                        <span className="text-[9px] text-[#F4EE8E] font-mono block uppercase">1. Голосовая запись:</span>
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          <Mic size={12} className="text-red-400 animate-pulse" />
                          {step1Uploading ? 'Запись аудио...' : 'Аудиофайл готов'}
                        </span>
                        <span className="text-[8px] text-slate-300 block">Размер: 2.4 Мб • Формат: .mp3</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 3, 2, 4, 5, 2, 3, 1].map((val, idx) => (
                          <span 
                            key={idx} 
                            className="w-1 rounded-full bg-amber-400 transition-all duration-200" 
                            style={{ 
                               height: step1Uploading ? `${val * 4}px` : '4px',
                               opacity: step1Uploading ? 1 : 0.4
                            }} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Files & Photos list panel */}
                    <div className="bg-white/10 border border-white/15 rounded-2xl p-3 space-y-1.5 shadow-md">
                      <span className="text-[9px] text-[#F4EE8E] font-mono block uppercase">2. Медиафайлы и документы:</span>
                      
                      <div className="flex items-center justify-between text-[10px] bg-white/10 px-2 py-1 rounded-lg border border-white/10">
                        <span className="text-slate-100 flex items-center gap-1">📸 photo_check.jpg</span>
                        <span className="text-emerald-400 font-bold font-mono">100% ✓</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] bg-white/10 px-2 py-1 rounded-lg border border-white/10">
                        <span className="text-slate-100 flex items-center gap-1">📊 sales_data.xlsx</span>
                        <span className="text-emerald-400 font-bold font-mono">100% ✓</span>
                      </div>
                    </div>

                  </div>

                  {/* Geolocation visual card */}
                  <div className="flex items-center gap-2 bg-white/10 border border-white/15 p-2.5 rounded-xl shadow-md">
                    <MapPin size={14} className="text-sky-400 animate-bounce" />
                    <div className="text-[10px]">
                      <p className="text-white font-bold">📍 Автоматическая геолокация:</p>
                      <p className="text-[#F4EE8E] font-mono">Широта: 55.7558° • Долгота: 37.6173° (Точка ТЦ «Атриум» – Подтверждена)</p>
                    </div>
                  </div>

                  {/* Dynamic Fuser visual progress block */}
                  <div className="bg-white/15 border border-white/20 p-3 rounded-2xl min-h-[110px] flex flex-col justify-center text-center shadow-lg">
                    {step1Uploading ? (
                      <div className="space-y-1">
                        <p className="text-[10px] text-amber-200 animate-pulse font-mono uppercase tracking-wider">▲ ОЖИДАНИЕ ЗАВЕРШЕНИЯ ЗАПИСИ И ЗАГРУЗКИ ФАЙЛОВ</p>
                        <p className="text-[9px] text-slate-300">В демо-режиме загрузка и синхронизация происходят автоматически...</p>
                      </div>
                    ) : step1Processing ? (
                      <div className="space-y-2">
                        <RefreshCw className="animate-spin text-amber-300 mx-auto" size={18} />
                        <p className="text-xs text-amber-200 font-mono animate-pulse">ИИ-Объединение: Анализ аудиоспектра, компьютерное зрение на фото...</p>
                        <div className="w-1/2 mx-auto bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full w-2/3 animate-pulse" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-left font-mono text-[10px] leading-relaxed text-slate-100">
                        <p className="text-[#F4EE8E] font-bold flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-400" />
                          ИНФОРМАЦИОННЫЙ ПАКЕТ СФОРМИРОВАН:
                        </p>
                        <p>🎙️ <span className="text-slate-300">Голос:</span> "Смена успешно завершена, инкассация проведена, багов кассы нет."</p>
                        <p>📸 <span className="text-slate-300">Зрение:</span> На фото распознаны чистые полки и правильные ценники (100% совпадение).</p>
                        <p>📂 <span className="text-slate-300">Файлы:</span> Кассовые итоги из <span className="text-amber-200">sales_data.xlsx</span> извлечены и сверены.</p>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-300 text-center italic">
                    Все типы данных сливаются воедино. Система не допустит пустых отчетов!
                  </div>
                </div>
              )}

              {/* STEP 2: EMPLOYEE COMFORT (HIGH FIDELITY) */}
              {activeStep === 'employee_comfort' && (
                <div className="space-y-4 text-left h-full flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Smile size={14} className="text-sky-400" />
                      Интерфейс Быстрого Заполнения
                    </h5>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Сотруднику не нужно искать нужные поля и таблицы. ИИ парсит свободную речь и сам вносит цифры и текст в форму.
                    </p>
                  </div>

                  {/* Simulated text input typing automatically */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] text-[#F4EE8E] font-bold uppercase tracking-wider font-mono">Голосовой поток / свободный ввод:</label>
                      <span className="text-[8px] px-1.5 py-0.5 bg-sky-500/20 text-sky-300 rounded font-mono">Идет транскрибация...</span>
                    </div>
                    <div className="w-full p-2.5 rounded-xl bg-white/10 border border-white/15 text-[11px] text-white font-mono min-h-[64px] relative shadow-inner">
                      {simulatedTypedSpeech}
                      <span className="animate-ping text-sky-300 absolute ml-0.5 font-black">|</span>
                    </div>
                  </div>

                  {/* Smart Extracted form values rendering */}
                  <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-300">ПОЛЯ ШАБЛОНА ИИ:</span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
                        <RefreshCw size={10} className="animate-spin" /> Автораспределение
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-5 text-[10px] text-slate-200 font-semibold">💰 Фактическая выручка:</span>
                        <div className="col-span-7">
                          {step2Parsed ? (
                            <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-[10px] font-mono font-bold text-amber-200 bg-white/15 px-2 py-0.5 rounded border border-[#F4EE8E]/20">
                              42 500 ₽
                            </motion.span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono italic">Ожидание извлечения...</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-5 text-[10px] text-slate-200 font-semibold">🚨 Проблемы / Расхождения:</span>
                        <div className="col-span-7">
                          {step2Parsed ? (
                            <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                              Расхождений нет ✓
                            </motion.span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono italic">Ожидание извлечения...</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 items-center gap-2">
                        <span className="col-span-5 text-[10px] text-slate-200 font-semibold">📋 План на завтра:</span>
                        <div className="col-span-7">
                          {step2Parsed ? (
                            <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-[10px] font-mono text-[#F4EE8E] bg-white/15 px-2 py-0.5 rounded border border-white/10 block truncate">
                              Принять поставку в 10:00
                            </motion.span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono italic">Ожидание извлечения...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic text-center">
                    ✓ Устраняет человеческий фактор. Сотрудник тратит минимум сил, а директор получает чистые данные.
                  </p>
                </div>
              )}

              {/* STEP 3: SCHEDULES & SHIFTS (HIGH FIDELITY) */}
              {activeStep === 'schedules_shifts' && (
                <div className="space-y-4 text-left h-full flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Calendar size={14} className="text-emerald-400" />
                      Контроль выходов и замен по графику
                    </h5>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Интеллектуальный планировщик связывает график смен с отчетами. Если сотрудник заболел или ушел в отпуск, система автоматически перестраивает циклы сдачи рапортов.
                    </p>
                  </div>

                  {/* Autopilot Status Indicator */}
                  <div className="p-3 bg-white/10 border border-white/15 rounded-2xl space-y-2 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-300 font-mono uppercase tracking-wider">Текущая ситуация в симуляции:</span>
                      <span className="text-[9px] font-mono text-[#F4EE8E] font-bold animate-pulse">● Сценарий меняется автоматически</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className={`p-2 rounded-xl text-center border transition-all ${
                        scheduleCycle === 0 
                          ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 font-bold' 
                          : 'bg-white/5 border-white/5 text-slate-400'
                      }`}>
                        <p className="text-xs">💼 Смена</p>
                        <p className="text-[8px] font-mono mt-0.5">Ожидается отчет</p>
                      </div>

                      <div className={`p-2 rounded-xl text-center border transition-all ${
                        scheduleCycle === 1 
                          ? 'bg-red-500/20 border-red-400/40 text-red-300 font-bold' 
                          : 'bg-white/5 border-white/5 text-slate-400'
                      }`}>
                        <p className="text-xs">🤒 Больничный</p>
                        <p className="text-[8px] font-mono mt-0.5">Отчет отключен</p>
                      </div>

                      <div className={`p-2 rounded-xl text-center border transition-all ${
                        scheduleCycle === 2 
                          ? 'bg-blue-500/20 border-blue-400/40 text-blue-300 font-bold' 
                          : 'bg-white/5 border-white/5 text-slate-400'
                      }`}>
                        <p className="text-xs">✈️ Отпуск</p>
                        <p className="text-[8px] font-mono mt-0.5">Отчет отключен</p>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Schedule Grid */}
                  <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 space-y-2.5 shadow-md">
                    <span className="text-[10px] text-[#F4EE8E] font-bold block">Сетка замен и выходов на сегодня:</span>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between bg-white/15 p-2.5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px]">ИС</div>
                          <span className="text-xs text-slate-100">Игорь Сидоров (Администратор)</span>
                        </div>
                        {scheduleCycle === 0 && (
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-400/20 text-emerald-300 rounded border border-emerald-400/30 animate-pulse">Смена: 09:00 - 18:00</span>
                        )}
                        {scheduleCycle === 1 && (
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-red-400/20 text-red-300 rounded border border-red-400/30">🤒 Заболел (Замена: А. Иванов)</span>
                        )}
                        {scheduleCycle === 2 && (
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-sky-400/20 text-sky-300 rounded border border-sky-400/30">✈️ В отпуске до 15.07</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5 opacity-80">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-lg bg-slate-600 text-white flex items-center justify-center font-bold text-[10px]">АП</div>
                          <span className="text-xs text-slate-200">Анна Петрова (Кассир)</span>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-400/20 text-emerald-300 rounded border border-emerald-400/20">Смена: 09:00 - 21:00</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-300 italic text-center">
                    ИИ-Уведомления отправляются только тем, кто действительно находится на смене!
                  </p>
                </div>
              )}

              {/* STEP 4: AI SCORES & ADVICES (HIGH FIDELITY) */}
              {activeStep === 'ai_scores' && (
                <div className="space-y-4 text-left h-full flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Award size={14} className="text-purple-400" />
                      ИИ-Коуч: Оценка Quality Score
                    </h5>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Нейросеть мгновенно сканирует текст, сверяет его с требованиями регламента компании и рассчитывает уровень содержательности по 100-балльной шкале.
                    </p>
                  </div>

                  {/* Radial progress simulator */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-1">
                    
                    <div className="md:col-span-5 flex flex-col items-center justify-center bg-white/10 border border-white/15 p-4 rounded-2xl shadow-md">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                          <circle 
                            cx="48" 
                            cy="48" 
                            r="40" 
                            stroke="#E7C768" 
                            strokeWidth="6" 
                            fill="transparent" 
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * displayedScore) / 100}
                            className="transition-all duration-100"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-black text-amber-200">{displayedScore}</span>
                          <span className="text-[8px] text-slate-300 font-mono">из 100 баллов</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 mt-2 flex items-center gap-1">
                        ● Идеальный отчет
                      </span>
                    </div>

                    <div className="md:col-span-7 bg-white/10 border border-white/15 p-3.5 rounded-2xl space-y-2 text-[10.5px] shadow-md">
                      <span className="text-[8px] font-mono font-bold text-[#F4EE8E] uppercase tracking-wider block">⚡ Автоматический разбор ИИ:</span>
                      
                      {showTips ? (
                        <motion.ul initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-1.5 text-slate-100">
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-300">💡</span>
                            <span>Выручка и инкассация расписаны в полном объеме.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-amber-300">💡</span>
                            <span>Отличная декомпозиция плана на завтрашний день.</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400">✓</span>
                            <span className="text-emerald-400">Начислен бонус +15 монет в рейтинг за сдачу вовремя.</span>
                          </li>
                        </motion.ul>
                      ) : (
                        <div className="py-4 text-center text-slate-400 italic">Идет анализ содержания...</div>
                      )}
                    </div>

                  </div>

                  <p className="text-[10px] text-slate-300 italic text-center">
                    Обучение сотрудников происходит прямо во время сдачи. Руководитель не тратит на это ни секунды!
                  </p>
                </div>
              )}

              {/* STEP 5: MANAGER REACTIONS (HIGH FIDELITY) */}
              {activeStep === 'manager_reactions' && (
                <div className="space-y-4 text-left h-full flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <ThumbsUp size={14} className="text-pink-400" />
                      1-Click Быстрая Рецензия от лидера
                    </h5>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Директор видит краткое саммари и может отправить теплое ИИ-напутствие или аналитическое замечание в один клик.
                    </p>
                  </div>

                  {/* Visual selector simulation */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className={`p-2 rounded-xl text-center text-[10px] font-bold border transition-all ${
                      reactionType === 0 ? 'bg-pink-500/20 border-pink-400/40 text-pink-300' : 'bg-white/5 border-white/5 text-slate-400'
                    }`}>
                      👏 Похвалить ИИ
                    </div>
                    <div className={`p-2 rounded-xl text-center text-[10px] font-bold border transition-all ${
                      reactionType === 1 ? 'bg-white/15 border-white/20 text-[#F4EE8E]' : 'bg-white/5 border-white/5 text-slate-400'
                    }`}>
                      ✍️ Разобрать ошибки
                    </div>
                    <div className={`p-2 rounded-xl text-center text-[10px] font-bold border transition-all ${
                      reactionType === 2 ? 'bg-sky-500/20 border-sky-400/40 text-sky-300' : 'bg-white/5 border-white/5 text-slate-400'
                    }`}>
                      ✊ Поддержать
                    </div>
                  </div>

                  {/* AI Generated Review Output */}
                  <div className="bg-white/10 border border-white/15 p-4 rounded-2xl space-y-3 shadow-md">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-2">
                      <img 
                        src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR4.png" 
                        alt="Директор" 
                        className="w-8 h-8 object-contain rounded-full bg-[#1E4468] border border-pink-400/30"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">Александр Иванов (Генеральный Директор)</p>
                        <p className="text-[8px] text-pink-300 font-mono">Генерация рецензии ИИ: {reactionType === 0 ? 'Похвала' : reactionType === 1 ? 'Конструктив' : 'Поддержка'}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      {reactionType === 0 
                        ? '"Отличный отчет по закрытию смены! Начислил тебе +50 бонусных баллов за чистоту на витринах и аккуратность с кассой. Молодец!"'
                        : reactionType === 1
                        ? '"Отчет принят. Но обратите внимание: завтра на приемке проверьте все штрихкоды тщательно. Спасибо за деталку!"'
                        : '"Вижу, работы было много. Спасибо за честный рапорт и вовремя сданные кассовые данные. Команда гордится тобой!"'}
                    </p>
                  </div>

                  <p className="text-[10px] text-slate-400 italic text-center">
                    Один клик — и сотрудник видит внимание руководителя, что повышает лояльность в разы!
                  </p>
                </div>
              )}

              {/* STEP 6: REMINDERS & DEADLINES (HIGH FIDELITY) */}
              {activeStep === 'reminders' && (
                <div className="space-y-4 text-left h-full flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Bell size={14} className="text-red-400 animate-bounce" />
                      Контроль дедлайнов и оповещения бота
                    </h5>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Если смена закончилась, а отчета нет, система ждет ровно 15 минут, а затем вежливо, но настойчиво напоминает сотруднику в личный Telegram.
                    </p>
                  </div>

                  {/* Cool phone screen mockup simulating real push message */}
                  <div className="flex justify-center my-1">
                    <div className="w-full max-w-xs bg-gradient-to-b from-white/15 to-white/10 border-[3px] border-white/20 rounded-3xl p-3.5 shadow-xl relative overflow-hidden text-center min-h-[160px] flex flex-col justify-between">
                      <div className="flex justify-between items-center text-[8px] text-slate-300 font-mono mb-2">
                        <span>📱 TELEGRAM BOT</span>
                        <span>{timeString}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-[11px] text-slate-200 font-mono">Смена завершилась в 18:00</span>
                        </div>

                        {showNotification ? (
                          <motion.div 
                            initial={{ opacity: 0, y: 15 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-2 text-left space-y-1 shadow-md"
                          >
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center text-[8px]">🤖</div>
                              <p className="text-[9px] font-bold text-white">ИИ Рапорт Бот · Личные сообщения</p>
                            </div>
                            <p className="text-[8px] text-[#F4EE8E] leading-normal font-mono">
                              "Иван, привет! Прошло 15 минут после смены. Пожалуйста, отправьте отчет. Вы можете просто надиктовать его голосом!"
                            </p>
                          </motion.div>
                        ) : (
                          <div className="py-3 text-[10px] text-slate-400 italic">Счетчик тикает... Ожидание 15 минут задержки...</div>
                        )}
                      </div>

                      <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mt-2" />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-300 italic text-center">
                    ✓ Освобождает менеджеров от необходимости "выбивать" отчеты в конце дня вручную.
                  </p>
                </div>
              )}

              {/* STEP 7: GAMIFICATION (HIGH FIDELITY) */}
              {activeStep === 'gamification' && (
                <div className="space-y-4 text-left h-full flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Trophy size={14} className="text-yellow-400" />
                      Геймификация и Магазин Благ
                    </h5>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      За каждый вовремя сданный отчет начисляются монеты. Личные комбо-дни (streaks) стимулируют регулярность и азарт.
                    </p>
                  </div>

                  {/* Live Stats display with coin growth */}
                  <div className="grid grid-cols-3 gap-3 my-1">
                    <div className="p-3 bg-white/10 border border-white/15 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">
                      <Flame size={20} className="text-orange-500 animate-pulse" />
                      <span className="text-[9px] text-slate-300 uppercase mt-1 font-mono">Комбо-дни:</span>
                      <strong className="text-[#F4EE8E] text-sm">{streakCount} дн 🔥</strong>
                    </div>

                    <div className="p-3 bg-white/10 border border-white/15 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-md">
                      <Coins size={20} className="text-[#E7C768] animate-bounce" />
                      <span className="text-[9px] text-slate-300 uppercase mt-1 font-mono">Баланс:</span>
                      <strong className="text-white text-sm">
                        {coinAdd ? '2 600' : '2 450'} 🪙
                      </strong>
                    </div>

                    <div className="p-3 bg-white/10 border border-white/15 rounded-2xl flex flex-col items-center justify-center text-center shadow-md">
                      <Trophy size={20} className="text-yellow-400" />
                      <span className="text-[9px] text-slate-300 uppercase mt-1 font-mono">Рейтинг:</span>
                      <strong className="text-[#F4EE8E] text-xs">Топ-3 отдела 🥉</strong>
                    </div>
                  </div>

                  {/* Confetti Simulated Unlock Card */}
                  <div className="bg-white/15 border border-[#F4EE8E]/20 p-3 rounded-2xl flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🎁</span>
                      <div className="text-[10px]">
                        <p className="text-white font-bold">Доступен приз в Магазине Благ:</p>
                        <p className="text-[#F4EE8E]">"Фирменное худи RR" или "Дополнительный отгул"</p>
                      </div>
                    </div>
                    {bonusClaimed ? (
                      <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-xl">Получено! ✓</span>
                    ) : (
                      <span className="text-[9px] font-bold bg-amber-400 text-slate-950 px-2.5 py-1 rounded-xl animate-pulse shadow">Разблокировано</span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-300 italic text-center">
                    Сотрудники обожают соревноваться. Сдача отчетов превращается в увлекательную игру!
                  </p>
                </div>
              )}

              {/* STEP 8: AI ANALYTICS (HIGH FIDELITY) */}
              {activeStep === 'ai_analytics' && (
                <div className="space-y-4 text-left h-full flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-violet-400" />
                      ИИ-Анализ периодов и поиск аномалий
                    </h5>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Директору больше не нужно читать сотни отчетов за неделю. ИИ анализирует тексты рапортов, строит график производительности и автоматически подсвечивает сбои.
                    </p>
                  </div>

                  {/* Beautiful chart with moving laser line */}
                  <div className="bg-white/10 border border-white/15 p-4 rounded-2xl relative overflow-hidden shadow-md">
                    
                    {/* Laser scanning line effect */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)] z-10"
                      style={{ left: `${laserPosition}%` }}
                    />

                    <div className="flex justify-between items-center text-[9px] text-slate-300 font-mono mb-2">
                      <span>📊 СВОДНЫЙ СТАТУС ВЫПОЛНЕНИЯ ПЛАНОВ ПО ДНЯМ</span>
                      <span>Неделя 26</span>
                    </div>

                    <div className="flex justify-around items-end gap-3 h-20 pt-2 relative">
                      {[
                        { label: 'ПН', val: '92%', color: 'bg-emerald-400/90' },
                        { label: 'ВТ', val: '96%', color: 'bg-emerald-400/90' },
                        { label: 'СР', val: '38%', color: 'bg-rose-500 animate-pulse' }, // Anomaly day
                        { label: 'ЧТ', val: '89%', color: 'bg-emerald-400/90' },
                        { label: 'ПТ', val: '94%', color: 'bg-emerald-400/90' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1 flex-1 z-20">
                          <span className="text-[8px] font-mono text-[#F4EE8E]">{item.val}</span>
                          <div className="w-full bg-white/10 h-14 rounded-lg relative overflow-hidden flex items-end">
                            <div className={`w-full rounded-t-md transition-all duration-300 ${item.color}`} style={{ height: item.val }} />
                          </div>
                          <span className="text-[9px] font-mono font-bold text-slate-200">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Diagnosis box */}
                  <div className="min-h-[64px] flex flex-col justify-center">
                    {showAnomalyDiagnosis ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-rose-500/15 border border-rose-500/25 rounded-xl text-[10px] text-slate-100 shadow-md animate-pulse"
                      >
                        <p className="font-bold text-rose-300 flex items-center gap-1 uppercase tracking-wider font-mono">
                          <AlertCircle size={10} /> ОБНАРУЖЕНА СИСТЕМНАЯ АНОМАЛИЯ В СРЕДУ (38%):
                        </p>
                        <p className="mt-0.5">
                          Из ИИ-саммари отчетов кассиров: "Сбой фискального накопителя ККМ №3, ремонт занял 5 часов". Рекомендация ИИ: Обновить прошивку ККМ для предотвращения зависаний.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="text-center text-[10px] text-slate-400 italic">Идет автоматический поиск скрытых аномалий за период...</div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-300 italic text-center">
                    Готовый диагноз бизнеса вместо десятков таблиц в Excel!
                  </p>
                </div>
              )}

              {/* STEP 9: TELEGRAM DELIVERY (HIGH FIDELITY) */}
              {activeStep === 'telegram_delivery' && (
                <div className="space-y-4 text-left h-full flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Send size={14} className="text-sky-400 animate-pulse" />
                      Мгновенная доставка отчетов в Telegram
                    </h5>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Система формирует красивую Markdown-сводку и отправляет в групповой чат отдела. Директор видит всю картину дня прямо на ходу в телефоне.
                    </p>
                  </div>

                  {/* Simulated Telegram message layout with double checkmark */}
                  <div className="bg-white/10 rounded-2xl border border-sky-400/20 p-4 space-y-3 relative shadow-md">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[9px] font-mono text-sky-300 font-bold tracking-wider">ГРУППА ОТДЕЛА (TELEGRAM)</span>
                      <span className="text-[8px] text-slate-300 font-mono">18:02</span>
                    </div>

                    <div className="space-y-1.5 text-[10.5px] font-mono text-slate-100">
                      <p className="text-sky-300 font-bold flex items-center gap-1 text-[11px]">
                        🤖 [ИИ Рапорт Бот] Сводка за смену:
                      </p>
                      <div className="border-l-2 border-amber-300 pl-3.5 space-y-1 bg-white/10 p-2 rounded-xl border border-white/10">
                        <p><strong className="text-white">👤 Сотрудник:</strong> Иван Смирнов</p>
                        <p><strong className="text-white">📊 Категория:</strong> Администратор точки</p>
                        <p><strong className="text-white">💰 Фактическая Выручка:</strong> 42 500 ₽ (План выполнен ✓)</p>
                        <p><strong className="text-white">📈 Качество (Quality Score):</strong> 94/100</p>
                        <p className="text-slate-200 text-[10px] italic">"Смена сдана без происшествий. Витрина чистая, ценники заменены, завтра утром жду поставку товара."</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-300">
                      <span>✓ Все участники группы оповещены</span>
                      <div className="flex items-center gap-1">
                        <span>Доставлено</span>
                        {messageDelivered ? (
                          <span className="text-emerald-400 font-bold">✓✓</span>
                        ) : (
                          <span className="text-slate-400">✓</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#F4EE8E] italic text-center">
                    Вся команда находится в едином информационном поле без установки лишних приложений.
                  </p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dynamic visual footer of terminal screen */}
        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-400 font-mono" id="simulator-terminal-footer">
          <span>⚙️ ИИ Симулятор RR v2.8</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Авто-симуляция в реальном времени
          </span>
        </div>

      </div>

    </div>
  );
}
