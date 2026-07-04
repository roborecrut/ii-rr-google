import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Mic, Calendar, TrendingUp, CheckCircle2, AlertCircle, XCircle, Play, Info, Square, RefreshCw, Volume2 } from 'lucide-react';

type StepId = 'template' | 'voice' | 'calendar' | 'analytics';

interface Step {
  id: StepId;
  title: string;
  shortDesc: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function InteractiveFlowSimulator() {
  const [activeStep, setActiveStep] = useState<StepId>('template');

  // Step 1: Template generator states
  const [selectedRole, setSelectedRole] = useState<'admin' | 'support' | 'sales'>('admin');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFields, setGeneratedFields] = useState<string[]>([]);

  // Step 2: Voice simulation states
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [aiStructuredText, setAiStructuredText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);

  // Step 3: Calendar simulation states
  const [selectedDay, setSelectedDay] = useState<string>('mon');

  const steps: Step[] = [
    {
      id: 'template',
      title: '1. ИИ Шаблон Отчета',
      shortDesc: 'Мгновенная генерация структуры',
      description: 'ИИ автоматически подбирает идеальные контрольные вопросы и подсказки в зависимости от специфики должности.',
      icon: <Sparkles size={18} />,
      color: 'from-amber-400 to-[#D99E41]'
    },
    {
      id: 'voice',
      title: '2. Сдача Голосом с ИИ',
      shortDesc: 'Авто-структурирование речи',
      description: 'Сотрудник наговаривает отчет. Наша нейросеть убирает мусорные слова и преобразует текст в идеальный деловой рапорт.',
      icon: <Mic size={18} />,
      color: 'from-sky-400 to-blue-500'
    },
    {
      id: 'calendar',
      title: '3. Календарь-Светофор',
      shortDesc: 'Визуальный контроль качества',
      description: 'Карточки отчетов подсвечиваются зеленым, желтым или красным в зависимости от Quality Score и соблюдения дедлайнов.',
      icon: <Calendar size={18} />,
      color: 'from-emerald-400 to-teal-500'
    },
    {
      id: 'analytics',
      title: '4. ИИ-Анализ и Графики',
      shortDesc: 'Автопоиск аномалий',
      description: 'ИИ анализирует графики продуктивности за неделю, выявляет скрытые аномалии и отправляет емкие саммари руководителю.',
      icon: <TrendingUp size={18} />,
      color: 'from-purple-400 to-indigo-500'
    }
  ];

  // Simulator animations trigger on tab change
  useEffect(() => {
    if (activeStep === 'template') {
      // Auto trigger small demo
      setGeneratedFields([]);
    } else if (activeStep === 'voice') {
      setVoiceState('idle');
      setRecordingSeconds(0);
      setTranscribedText('');
      setAiStructuredText('');
    }
  }, [activeStep]);

  // Step 1: Simulate field generation
  const handleGenerateTemplate = () => {
    setIsGenerating(true);
    setGeneratedFields([]);
    setTimeout(() => {
      setIsGenerating(false);
      if (selectedRole === 'admin') {
        setGeneratedFields([
          '💰 Дневная выручка (Числовое поле с ИИ-валидацией)',
          '👥 Поток гостей / Транзакции (Числовое поле)',
          '🧼 Оценка чистоты залов по чек-листу (Выбор 1-5)',
          '🚨 Технические инциденты и форс-мажоры (Развернутый текст)'
        ]);
      } else if (selectedRole === 'support') {
        setGeneratedFields([
          '🎫 Обработано входящих обращений (Числовое поле)',
          '⏱️ Среднее время ответа на тикет в минутах (Число)',
          '🛠️ Сложные баги, переданные инженерам (Текст)',
          '📝 План задач по баг-трекеру на завтра (Список)'
        ]);
      } else {
        setGeneratedFields([
          '🤝 Сумма закрытых сделок за смену в рублях (Число)',
          '📞 Количество совершенных звонков / лидов (Число)',
          '💔 Причины отказов клиентов (Выпадающий список)',
          '📈 Оценка загрузки воронки продаж (Текст)'
        ]);
      }
    }, 1200);
  };

  // Step 2: Simulate Voice Recording
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (voiceState === 'recording') {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 4) {
            clearInterval(timer);
            setVoiceState('processing');
            return 4;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [voiceState]);

  // Simulate typing effect for the transcription and AI structured output
  useEffect(() => {
    if (voiceState === 'processing') {
      const transcription = 'Ну кароче... мы сегодня закрылись в плюс, выручка по кассе где-то 45 тысяч. Людей было полно, человек 120 прошли через нас. Около обеда, часа в два, отвалилась онлайн-касса на 15 минут, но мы не растерялись, перезагрузили роутер и сам терминал, и всё заработало.';
      setTimeout(() => {
        setTranscribedText(transcription);
        setVoiceState('done');
        setTypingIndex(0);
      }, 1500);
    }
  }, [voiceState]);

  const aiOutputText = `[ИИ-Обработка Рапорта компании]:
• Тема отчета: Сдача смены
• Выручка: 45 000 ₽ (Выполнено 102% от плана)
• Трафик: 120 человек
• Инциденты: В 14:00 зафиксирован сбой фискального накопителя онлайн-кассы на 15 минут. Проблема успешно локализована и решена сотрудником на месте путем перезагрузки сетевого и кассового оборудования. Потерь выручки нет.

📈 Оценка качества рапорта (Quality Score): 9.4 / 10 🟢`;

  useEffect(() => {
    if (voiceState === 'done' && typingIndex < aiOutputText.length) {
      const timeout = setTimeout(() => {
        setTypingIndex((prev) => prev + 4); // Fast typing simulation
      }, 20);
      return () => clearTimeout(timeout);
    }
  }, [voiceState, typingIndex]);

  const startVoiceRecording = () => {
    setVoiceState('recording');
    setRecordingSeconds(0);
    setTranscribedText('');
    setTypingIndex(0);
  };

  // Step 3: Calendar details database
  const calendarData: Record<string, {
    title: string;
    submitted: string;
    status: 'green' | 'yellow' | 'red';
    score: string;
    text: string;
    aiFeedback: string;
  }> = {
    mon: {
      title: 'Понедельник, 15 Июня',
      submitted: 'Сдан в 18:02 (Вовремя)',
      status: 'green',
      score: '9.8',
      text: 'Все столики обслужены по регламенту. Чистота 5/5. Закрыли смену без происшествий.',
      aiFeedback: 'Превосходная сдача смены! Оценка содержательности идеальная. Вы проявили высокую дисциплину.'
    },
    tue: {
      title: 'Вторник, 16 Июня',
      submitted: 'Сдан в 18:05 (Вовремя)',
      status: 'green',
      score: '9.5',
      text: 'Выручка 48 000 руб. Все задачи по чек-листу выполнены. Передала смену Марии.',
      aiFeedback: 'Отличный рапорт. Все числовые метрики сходятся с кассовыми. Рекомендуем продолжать в том же духе!'
    },
    wed: {
      title: 'Среда, 17 Июня',
      submitted: 'Сдан в 23:45 (Опоздание 5 часов)',
      status: 'yellow',
      score: '6.2',
      text: 'Смена прошла нормально. Выручка 41 000. Простите, забыл сдать отчет вовремя из-за уборки.',
      aiFeedback: '⚠️ Отчет принят, но зафиксировано нарушение дедлайна сдачи на 5 часов. Пожалуйста, сдавайте отчетность сразу по окончании смены.'
    },
    thu: {
      title: 'Четверг, 18 Июня',
      submitted: 'Сдан в 18:10 (Вовремя)',
      status: 'red',
      score: '3.5',
      text: 'В 15:00 во всем квартале выключили свет. Гости ушли, кассы погасли. Выручка всего 12 000. Сидели в темноте 2 часа.',
      aiFeedback: '🚨 КРИТИЧЕСКАЯ АНОМАЛИЯ: Отключение электроснабжения. Рекомендация для директора: Разработать аварийный протокол и закупить резервные источники питания для терминалов.'
    },
    fri: {
      title: 'Пятница, 19 Июня',
      submitted: 'Сдан в 18:00 (Вовремя)',
      status: 'yellow',
      score: '7.0',
      text: 'Выручка рекордная — 72 000. Было очень много людей, все устали.',
      aiFeedback: 'Слишком краткий рапорт при рекордной выручке. Опущены важные пункты: остатки на складе и инциденты на кухне. Оценка снижена.'
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="interactive-simulator">
      
      {/* Left side: Navigation steps controllers */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`p-4.5 rounded-2xl text-left border transition-all cursor-pointer flex gap-4 items-start relative group ${
                isActive
                  ? 'bg-gradient-to-r from-[#1E4468] to-[#17344F] border-amber-200/45 shadow-[0_10px_30px_rgba(23,52,79,0.3)]'
                  : 'bg-[#17344F]/40 border-white/5 hover:bg-[#1E4468]/20 hover:border-white/10'
              }`}
            >
              {/* Highlight bar */}
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-[#F4EE8E] to-[#D99E41] rounded-r-md" />
              )}
              
              <div className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${
                isActive 
                  ? 'bg-gradient-to-br from-[#F4EE8E] to-[#D99E41] text-slate-900 shadow-md' 
                  : 'bg-white/5 text-slate-300 group-hover:text-amber-200'
              }`}>
                {step.icon}
              </div>

              <div className="space-y-1">
                <h4 className={`text-sm font-extrabold ${isActive ? 'text-[#F4EE8E]' : 'text-white'}`}>
                  {step.title}
                </h4>
                <p className={`text-[11px] font-medium leading-relaxed ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
                  {isActive ? step.description : step.shortDesc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right side: Active simulator terminal screen */}
      <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-[#17344F]/80 p-6 relative shadow-2xl flex flex-col justify-between min-h-[420px] overflow-hidden" id="simulator-screen">
        {/* Liquid reflection overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10" />
        
        {/* Step 1 Screen: TEMPLATE BUILDER */}
        {activeStep === 'template' && (
          <div className="space-y-4 h-full flex flex-col justify-between animate-fade-in">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-mono tracking-widest text-amber-200 uppercase flex items-center gap-1.5">
                  <Sparkles size={11} className="animate-pulse" />
                  Шаг 1: Конструктор шаблонов ИИ
                </span>
                <span className="text-[9px] font-mono text-emerald-400">● Режим генерации</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Выберите должность, и наш ИИ за мгновение составит оптимизированный шаблон отчета для этой специфики с умными подсказками.
              </p>

              {/* Roles choice row */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#17344F] rounded-xl border border-white/5">
                {[
                  { id: 'admin', label: 'Администратор' },
                  { id: 'support', label: 'Техподдержка' },
                  { id: 'sales', label: 'Продажи' }
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role.id as any);
                      setGeneratedFields([]);
                    }}
                    className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all ${
                      selectedRole === role.id 
                        ? 'bg-[#1E4468] text-[#F4EE8E] border border-amber-200/20' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display list of generated fields */}
            <div className="flex-1 my-4 bg-[#17344F]/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-center min-h-[160px]">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center gap-2 text-xs text-amber-200 animate-pulse">
                  <RefreshCw className="animate-spin text-[#D99E41]" size={20} />
                  <span>ИИ конструирует поля шаблона...</span>
                </div>
              ) : generatedFields.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] font-bold text-amber-200 uppercase font-mono tracking-wider">
                    Сгенерированные поля для должности:
                  </p>
                  <div className="space-y-2">
                    {generatedFields.map((field, idx) => (
                      <div 
                        key={idx} 
                        className="px-3 py-2 bg-[#1E4468]/50 border border-white/5 rounded-xl text-xs text-slate-200 flex justify-between items-center animate-slide-in-bottom"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <span>{field}</span>
                        <span className="text-[9px] font-mono text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-200/20">
                          ИИ-подсказка
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-xs text-slate-400 italic">Нажмите кнопку ниже, чтобы запустить генерацию полей ИИ</p>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerateTemplate}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans"
            >
              <Sparkles size={13} className="animate-pulse" />
              Сгенерировать структуру с ИИ
            </button>
          </div>
        )}

        {/* Step 2 Screen: VOICE TRANSCRIPTION */}
        {activeStep === 'voice' && (
          <div className="space-y-4 h-full flex flex-col justify-between animate-fade-in">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-[10px] font-mono tracking-widest text-sky-300 uppercase flex items-center gap-1.5">
                  <Mic size={11} className="text-sky-400" />
                  Шаг 2: Голосовой ввод отчета с ИИ
                </span>
                <span className="text-[9px] font-mono text-sky-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Голосовой модуль активен
                </span>
              </div>
            </div>

            <div className="flex-1 my-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch min-h-[220px]">
              {/* Left Column: Voice Wave Input */}
              <div className="bg-[#17344F]/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between items-center text-center">
                {voiceState === 'idle' && (
                  <div className="my-auto space-y-3">
                    <button
                      onClick={startVoiceRecording}
                      className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 hover:scale-110 hover:bg-sky-500/20 active:scale-95 transition-all cursor-pointer mx-auto"
                    >
                      <Mic size={26} />
                    </button>
                    <p className="text-[11px] text-slate-300 max-w-[140px] mx-auto leading-normal">
                      Нажмите, чтобы запустить симуляцию голосовой диктовки
                    </p>
                  </div>
                )}

                {voiceState === 'recording' && (
                  <div className="my-auto space-y-4 w-full">
                    {/* Glowing pulsating wave bars */}
                    <div className="flex justify-center items-end gap-1 h-12">
                      {[1, 2, 3, 4, 5, 4, 3, 2, 4, 5, 6, 4, 3, 5, 2, 4].map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-gradient-to-t from-sky-400 to-amber-200 rounded-full animate-bounce"
                          style={{
                            height: `${h * 15}%`,
                            animationDelay: `${i * 80}ms`,
                            animationDuration: '0.6s'
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-xs font-mono text-sky-300">
                      Запись: <strong className="text-white">00:0{recordingSeconds}</strong>
                    </div>
                    <p className="text-[10px] text-slate-400">Говорите в микрофон...</p>
                  </div>
                )}

                {voiceState === 'processing' && (
                  <div className="my-auto space-y-2">
                    <RefreshCw className="animate-spin text-sky-400 mx-auto mb-2" size={22} />
                    <p className="text-xs text-sky-300">Очистка шума и структурирование...</p>
                  </div>
                )}

                {voiceState === 'done' && (
                  <div className="my-auto space-y-3 w-full text-left">
                    <span className="text-[8px] font-mono uppercase bg-sky-500/15 text-sky-300 px-2 py-0.5 rounded border border-sky-500/10">
                      Распознанный голос
                    </span>
                    <p className="text-[10px] text-slate-300 leading-relaxed italic bg-[#17344F]/80 p-2.5 rounded-xl border border-white/5">
                      "{transcribedText}"
                    </p>
                    <button
                      onClick={startVoiceRecording}
                      className="text-[9px] font-bold text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={9} /> Перезаписать голосом
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: AI Transformed Clean Report Output */}
              <div className="bg-[#17344F]/50 border border-amber-200/10 rounded-2xl p-4 flex flex-col justify-between overflow-hidden">
                <div className="space-y-1.5 h-full flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-amber-200 uppercase tracking-wider flex items-center gap-1 font-bold">
                    <Sparkles size={10} className="text-amber-200" />
                    РЕЗУЛЬТАТ ИИ РАПОРТА
                  </span>
                  
                  <div className="flex-1 bg-[#17344F] p-3 rounded-xl border border-white/5 font-mono text-[10px] text-slate-200 overflow-y-auto leading-relaxed h-[140px] whitespace-pre-wrap">
                    {voiceState === 'done' ? (
                      aiOutputText.slice(0, typingIndex)
                    ) : (
                      <span className="text-slate-500 italic flex items-center justify-center h-full text-center">
                        Результат ИИ появится после завершения диктовки
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 Screen: TRAFFIC LIGHT CALENDAR */}
        {activeStep === 'calendar' && (
          <div className="space-y-4 h-full flex flex-col justify-between animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-[10px] font-mono tracking-widest text-emerald-300 uppercase flex items-center gap-1.5">
                  <Calendar size={11} className="text-emerald-400" />
                  Шаг 3: Дисциплинарный Календарь-Светофор
                </span>
                <span className="text-[9px] font-mono text-emerald-400">● Календарная сетка</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">
                Нажмите на дни недели ниже, чтобы прочитать сданные отчеты с оценкой качества (светофором) и рекомендациями ИИ-наставника.
              </p>
            </div>

            {/* Calendar cards list */}
            <div className="grid grid-cols-5 gap-2 my-1">
              {[
                { id: 'mon', day: 'ПН', score: '9.8', dot: 'bg-emerald-400 shadow-emerald-400/50' },
                { id: 'tue', day: 'ВТ', score: '9.5', dot: 'bg-emerald-400 shadow-emerald-400/50' },
                { id: 'wed', day: 'СР', score: '6.2', dot: 'bg-amber-400 shadow-amber-400/50 animate-pulse' },
                { id: 'thu', day: 'ЧТ', score: '3.5', dot: 'bg-red-500 shadow-red-500/50 animate-ping' },
                { id: 'fri', day: 'ПТ', score: '7.0', dot: 'bg-amber-400 shadow-amber-400/50' }
              ].map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-between gap-1 transition-all cursor-pointer ${
                    selectedDay === day.id
                      ? 'bg-[#1E4468] border-[#E7C768] text-white shadow-md transform scale-102'
                      : 'bg-[#17344F] border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-bold">{day.day}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${day.dot} shadow-[0_0_8px_3px_rgba(0,0,0,0.15)]`} />
                  <span className="text-[9px] font-mono font-bold text-[#F4EE8E]">{day.score}</span>
                </button>
              ))}
            </div>

            {/* Selected day report detail */}
            <div className="bg-[#17344F]/60 border border-white/5 p-4 rounded-2xl space-y-2.5 animate-fade-in text-left">
              <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-1.5">
                <span className="text-slate-300 font-bold">{calendarData[selectedDay].title}</span>
                <span className="text-amber-200">{calendarData[selectedDay].submitted}</span>
              </div>

              <div className="space-y-1">
                <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Рапорт сотрудника:</p>
                <p className="text-[11px] text-slate-200 leading-relaxed italic">
                  "{calendarData[selectedDay].text}"
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#1E4468]/50 border border-amber-300/10 space-y-1">
                <p className="text-[8px] uppercase tracking-wider text-amber-200 font-bold flex items-center gap-1">
                  <Sparkles size={8} /> ИИ-РАЗБОР НАСТАВНИКА RR:
                </p>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  {calendarData[selectedDay].aiFeedback}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 Screen: AI ANALYTICS & CHARTS */}
        {activeStep === 'analytics' && (
          <div className="space-y-4 h-full flex flex-col justify-between animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-[10px] font-mono tracking-widest text-purple-300 uppercase flex items-center gap-1.5">
                  <TrendingUp size={11} className="text-purple-400" />
                  Шаг 4: Сводная ИИ-Аналитика отдела
                </span>
                <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Инсайты готовы
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Нейросеть агрегирует ежедневные отчеты в еженедельные графики и мгновенно находит аномалии производительности.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch my-1">
              {/* Left CSS mini performance chart */}
              <div className="md:col-span-5 bg-[#17344F]/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between items-center min-h-[140px]">
                <span className="text-[8px] font-mono uppercase text-slate-400 font-bold">Эффективность отдела %</span>
                
                {/* CSS Columns with transition on mount */}
                <div className="flex justify-around items-end gap-2.5 w-full h-20 pt-2">
                  {[
                    { label: 'ПН', height: '98%', color: 'bg-emerald-400' },
                    { label: 'ВТ', height: '95%', color: 'bg-emerald-400' },
                    { label: 'СР', height: '62%', color: 'bg-amber-400' },
                    { label: 'ЧТ', height: '35%', color: 'bg-red-500' },
                    { label: 'ПТ', height: '70%', color: 'bg-amber-400' }
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full bg-white/5 h-16 rounded-md relative flex items-end">
                        <div 
                          className={`w-full rounded-md ${bar.color} transition-all duration-1000 ease-out shadow-sm`}
                          style={{ height: bar.height }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-slate-400">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: AI Executive Insights summary */}
              <div className="md:col-span-7 bg-[#17344F]/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between text-left">
                <div className="space-y-2.5">
                  <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-slate-200 space-y-1">
                    <p className="text-[8px] uppercase tracking-wider text-red-400 font-bold flex items-center gap-1">
                      <AlertCircle size={9} /> ИИ ОБНАРУЖИЛ АНОМАЛИЮ:
                    </p>
                    <p className="text-[9px] leading-relaxed">
                      Эффективность заведения упала на 65% в четверг. Причина: аварийное отключение электроснабжения на 2 часа. Средняя эффективность в штатные дни — 87.6%.
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-200 space-y-1">
                    <p className="text-[8px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={9} /> СВОДКА ДЛЯ ДИРЕКТОРА:
                    </p>
                    <p className="text-[9px] leading-relaxed text-slate-300">
                      Все сотрудники сдали отчеты за неделю. Средний балл по отделу составил 8.4/10. Лидер смены — Виктория (Green Zone, 9.8). Дисциплинарных нарушений, кроме опоздания в среду, не выявлено.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global info overlay footer inside screen */}
        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400 font-sans">
          <span>⚙️ ИИ Симулятор RR v2.6.4</span>
          <span>Надежная работа без сбоев</span>
        </div>
      </div>

    </div>
  );
}
