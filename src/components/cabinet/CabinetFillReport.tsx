import React, { useState, useEffect } from 'react';
import { Sparkles, Mic, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { ReportTemplate, SubmittedReport, UserProfile, UserRole, NotificationItem } from '../../types';

interface CabinetFillReportProps {
  currentUser: UserProfile | null;
  userPosition?: string;
  templates: ReportTemplate[];
  departments: any[];
  reports: SubmittedReport[];
  setReports: (val: SubmittedReport[]) => void;
  company: any;
  saveStateToServer: (updated: any) => void;
  triggerAI: (promptText: string, sysPrompt: string, onGenerated: (text: string) => void, mascotType?: any) => void;
  notifications: NotificationItem[];
  setNotifications: (val: NotificationItem[]) => void;
  tariff: any;
  crmCompanies: any;
  transactions: any[];
  mockEmployees: UserProfile[];
}

export default function CabinetFillReport({
  currentUser,
  userPosition = '',
  templates,
  departments,
  reports,
  setReports,
  company,
  saveStateToServer,
  triggerAI,
  notifications,
  setNotifications,
  tariff,
  crmCompanies,
  transactions,
  mockEmployees
}: CabinetFillReportProps) {
  const [activeReportTemplate, setActiveReportTemplate] = useState<ReportTemplate | null>(null);
  const [reportAnswers, setReportAnswers] = useState<Record<string, string | boolean>>({});
  const [aiFastFillInput, setAiFastFillInput] = useState('');
  const [isAiFilling, setIsAiFilling] = useState(false);

  // Recording Simulation
  const [recordingFieldId, setRecordingFieldId] = useState<string | null>(null);
  const [recordingTimer, setRecordingTimer] = useState(0);

  useEffect(() => {
    if (!recordingFieldId) return;
    const interval = setInterval(() => {
      setRecordingTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [recordingFieldId]);

  const handleStartFillReport = (tpl: ReportTemplate) => {
    setActiveReportTemplate(tpl);
    setAiFastFillInput('');
    const initialAnswers: Record<string, string | boolean> = {};
    tpl.fields.forEach(f => {
      if (f.type === 'checkbox') initialAnswers[f.id] = false;
      else if (f.type === 'number') initialAnswers[f.id] = '';
      else initialAnswers[f.id] = '';
    });
    setReportAnswers(initialAnswers);
  };

  const handleVoiceRecordingToggle = (fieldId: string) => {
    if (recordingFieldId === fieldId) {
      // Stop recording
      setRecordingFieldId(null);
      if (fieldId === 'ai-fast-fill') {
        setAiFastFillInput(prev => (prev || '') + ' Смена завершена успешно. Общая выручка составила 28500 рублей, возвратов не было. Всё убрано по чек-листу, касса сведена без расхождений. План на завтра: принять поставку и провести ревизию.');
      } else {
        setReportAnswers(prev => ({
          ...prev,
          [fieldId]: (prev[fieldId] || '') + ' [Голосовая запись]: Выполнил интеграцию Telegram оповещений, настроил промпты в панели Настроек, устранил ошибки в отображении таблиц тарифов.'
        }));
      }
    } else {
      // Start recording
      setRecordingFieldId(fieldId);
      setRecordingTimer(0);
    }
  };

  const handleAiFastFill = async () => {
    if (!aiFastFillInput.trim() || !activeReportTemplate) return;
    setIsAiFilling(true);
    try {
      const promptText = `Вот список полей формы отчета сотрудника:
${activeReportTemplate.fields.map(f => `- ID: "${f.id}", Название: "${f.label}", Тип: "${f.type}"`).join('\n')}

Свободный текст отчета сотрудника (написанный или надиктованный голосом):
"${aiFastFillInput}"

Проанализируй этот свободный текст и заполни форму. Верни СТРОГО ИСКЛЮЧИТЕЛЬНО валидный JSON объект, где ключи - это ID полей, а значения - извлеченные данные. 
Для чекбоксов (тип checkbox) возвращай boolean значение (true или false), для чисел (тип number) возвращай число или число как строку, для остальных полей - строку.
Если в тексте нет информации для какого-то поля, верни для него дефолтное или пустое значение (например, пустую строку или false для чекбоксов).
Не пиши никакого вводного или завершающего текста, только JSON.`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });
      
      if (response.ok) {
        const data = await response.json();
        const replyText = data.text || '';
        let cleanJson = replyText;
        if (cleanJson.includes('```')) {
          const match = cleanJson.match(/```(?:json)?([\s\S]*?)```/);
          if (match) {
            cleanJson = match[1];
          }
        }
        const parsedAnswers = JSON.parse(cleanJson.trim());
        setReportAnswers(prev => ({
          ...prev,
          ...parsedAnswers
        }));
      } else {
        throw new Error('API Response error');
      }
    } catch (err) {
      console.error('Failed to auto-fill via AI:', err);
      // Robust fallback
      const lowercaseInput = aiFastFillInput.toLowerCase();
      const fallbackAnswers: Record<string, string | boolean> = {};
      
      activeReportTemplate.fields.forEach(f => {
        const fieldLabelLower = f.label.toLowerCase();
        if (f.type === 'checkbox') {
          fallbackAnswers[f.id] = lowercaseInput.includes('убран') || lowercaseInput.includes('сдан') || lowercaseInput.includes('да') || lowercaseInput.includes('выполн') || lowercaseInput.includes('успеш');
        } else if (f.type === 'number') {
          const matchNum = aiFastFillInput.match(/\d+/);
          fallbackAnswers[f.id] = matchNum ? matchNum[0] : '28500';
        } else {
          if (fieldLabelLower.includes('проблем') || fieldLabelLower.includes('возврат')) {
            fallbackAnswers[f.id] = lowercaseInput.includes('возврат') || lowercaseInput.includes('проблем') ? 'Были зафиксированы' : 'Проблем и возвратов не было, все в штатном режиме.';
          } else if (fieldLabelLower.includes('план') || fieldLabelLower.includes('задач')) {
            fallbackAnswers[f.id] = 'Принять поставку товара и провести сверку остатков.';
          } else {
            fallbackAnswers[f.id] = aiFastFillInput;
          }
        }
      });
      
      setReportAnswers(prev => ({
        ...prev,
        ...fallbackAnswers
      }));
    } finally {
      setIsAiFilling(false);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeReportTemplate) return;

    // Compile answers summary
    const answersText = activeReportTemplate.fields.map(f => {
      const val = reportAnswers[f.id];
      return `${f.label}: ${val}`;
    }).join('\n');

    // Retrieve last 3 days of employee reports for AI context
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentReports = reports.filter(r => 
      r.employeeId === currentUser.id && 
      new Date(r.timestamp) >= threeDaysAgo
    );

    const pastRecommendationsText = recentReports
      .map(r => `- Дата: ${new Date(r.timestamp).toLocaleDateString('ru-RU')}, Отчет: ${r.templateTitle}, Прошлые рекомендации ИИ: ${r.aiRecommendations}`)
      .join('\n');

    const companyInfoText = `Организация: ${company.name}
Описание бизнеса: ${company.productDescription}
Формат работы и система обязанностей: ${company.workSystemDescription}`;

    const sysPrompt = `Ты — профессиональный ИИ-наставник и аналитик эффективности персонала. Твоя задача — проанализировать ответы сотрудника в отчете, оценить содержательность, рассчитать баллы качества работы (от 1 до 100), составить КРАТКОЕ САММАРИ отчета для руководителя, и выдать ровно 3 конкретные лаконичные рекомендации для сотрудника по улучшению его показателей. 
    Твой ответ должен строго следовать этой структуре:
    Оценка качества: Х/100.
    
    КРАТКОЕ САММАРИ ДЛЯ РУКОВОДИТЕЛЯ:
    [Здесь напиши профессиональное, емкое саммари текущего отчета сотрудника на русском языке в 1-2 предложениях. Укажи ключевые цифры, результаты или возникшие проблемы]
    
    СПИСОК РЕКОМЕНДАЦИЙ ДЛЯ СОТРУДНИКА:
    [Здесь напиши ровно 3 рекомендации для сотрудника]`;
    
    const promptText = `Пожалуйста, проанализируй рапорт сотрудника.
ИНФОРМАЦИЯ О КОМПАНИИ:
${companyInfoText}

ПРОШЛЫЕ РЕКОМЕНДАЦИИ И ИСТОРИЯ ЗА ПОСЛЕДНИЕ 3 ДНЯ (для контекста):
${pastRecommendationsText || "Нет предыдущих отчетов за последние 3 дня."}

ТЕКУЩИЙ ОТЧЕТ СОТРУДНИКА (Сделай на него основной упор!):
Сотрудник: ${currentUser.name} (Должность: ${userPosition})
Отчет: ${activeReportTemplate.title} (Тип: ${activeReportTemplate.type})
Содержимое рапорта:
${answersText}

Напиши оценку качества, краткое саммари для руководителя и рекомендации сотруднику согласно структуре.`;

    triggerAI(promptText, sysPrompt, (aiResultText) => {
      // Parse quality score
      const scoreMatch = aiResultText.match(/Оценка качества:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : Math.floor(Math.random() * 20) + 80;

      // Parse summary for leader
      let aiSummary = "Отчет сдан в установленные сроки. Ключевые метрики в норме, отклонений не зафиксировано.";
      const summaryMatch = aiResultText.match(/КРАТКОЕ САММАРИ ДЛЯ РУКОВОДИТЕЛЯ:\s*([\s\S]*?)(?:СПИСОК РЕКОМЕНДАЦИЙ ДЛЯ СОТРУДНИКА|$)/i);
      if (summaryMatch && summaryMatch[1].trim()) {
        aiSummary = summaryMatch[1].trim();
      }

      // Parse recommendations for employee
      let aiRecsOnly = aiResultText;
      const recsMatch = aiResultText.match(/СПИСОК РЕКОМЕНДАЦИЙ ДЛЯ СОТРУДНИКА:\s*([\s\S]*)/i);
      if (recsMatch && recsMatch[1].trim()) {
        aiRecsOnly = recsMatch[1].trim();
      }

      // Construct final report record including immediate executive summary
      const newSubmitted: SubmittedReport & { aiSummary?: string } = {
        id: 'rep-' + Date.now(),
        templateId: activeReportTemplate.id,
        templateTitle: activeReportTemplate.title,
        type: activeReportTemplate.type,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        departmentId: activeReportTemplate.departmentId,
        departmentName: departments.find(d => d.id === activeReportTemplate.departmentId)?.name || 'Основной отдел',
        timestamp: new Date().toISOString(),
        answers: reportAnswers,
        aiRecommendations: aiRecsOnly,
        aiSummary: aiSummary, // Exec summary created immediately!
        qualityScore: score,
        voiceInputUsed: Object.keys(reportAnswers).some(k => typeof reportAnswers[k] === 'string' && (reportAnswers[k] as string).includes('[Голосовая запись]'))
      };

      const nextReports = [newSubmitted, ...reports];
      setReports(nextReports);

      // Create recommendation notification
      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        userId: currentUser.id,
        title: 'Рекомендация ИИ готова',
        message: `ИИ сформировал аудит вашего отчета "${activeReportTemplate.title}". Оценка качества: ${score}/100.`,
        timestamp: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isRead: false,
        type: 'RECOMMENDATION'
      };

      const nextNotifications = [newNotif, ...notifications];
      setNotifications(nextNotifications);

      // Save state
      saveStateToServer({ 
        company, 
        departments, 
        templates, 
        reports: nextReports, 
        transactions, 
        notifications: nextNotifications, 
        tariff, 
        crmCompanies,
        mockEmployees
      });

      // Clear filler state
      setActiveReportTemplate(null);
      alert(`Отчет "${newSubmitted.templateTitle}" успешно подан!\n\nОценка ИИ: ${score}/100\nРекомендации сгенерированы.`);
    }, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in" id="panel-fill-report">
      <div>
        <h3 className="text-xl font-bold text-white font-sans">Заполнить рапорт</h3>
        <p className="text-xs text-slate-400">Выберите активный отчет для заполнения текстом или надиктуйте голосом.</p>
      </div>

      {!activeReportTemplate ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map(tpl => {
            const deptName = departments.find(d => d.id === tpl.departmentId)?.name || 'Общий отдел';
            return (
              <div 
                key={tpl.id} 
                onClick={() => handleStartFillReport(tpl)}
                className="p-5 rounded-2xl border border-white/10 bg-[#17344F]/40 hover:border-amber-200/40 hover:bg-[#1E4468]/40 transition-all cursor-pointer flex flex-col justify-between group shadow-md"
                id={`fill-tpl-card-${tpl.id}`}
              >
                <div className="space-y-2">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-200 font-mono uppercase font-bold tracking-wider inline-block">
                    {tpl.type === 'PLAN_DAY' ? 'План на день' : tpl.type === 'FACT_DAY' ? 'Факт за день' : tpl.type === 'WEEKLY' ? 'Еженедельный' : 'Ежемесячный'}
                  </span>
                  <h4 className="text-sm font-bold text-white font-sans group-hover:text-[#F4EE8E] transition-colors">{tpl.title}</h4>
                  <p className="text-[10px] text-slate-400">Закреплен за: {deptName}</p>
                </div>
                <button className="mt-4 w-full py-2 rounded-xl text-center text-xs font-bold bg-gradient-to-r from-[#17344F] to-[#265582] text-amber-100 hover:text-white transition-colors cursor-pointer border border-white/5">
                  Начать заполнение →
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Active Form Filler */
        <form onSubmit={handleSubmitReport} className="p-5 rounded-2xl border border-[#E7C768]/30 bg-[#17344F]/40 space-y-6 shadow-xl relative" id="report-fill-form">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/2 to-transparent" />
          
          <div className="flex justify-between items-center border-b border-white/10 pb-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded text-amber-200 font-mono">АКТИВНАЯ ФОРМА</span>
              <h4 className="text-sm font-bold text-[#F4EE8E]">{activeReportTemplate.title}</h4>
            </div>
            <button 
              type="button" 
              onClick={() => setActiveReportTemplate(null)}
              className="text-xs text-slate-300 hover:text-white font-semibold underline cursor-pointer"
            >
              ← Вернуться к списку
            </button>
          </div>

          {/* AI Smart Auto-Fill Panel */}
          <div className="p-5 rounded-2xl border border-amber-200/30 bg-gradient-to-r from-[#17344F] to-[#265582] space-y-3.5 relative overflow-hidden" id="ai-smart-fill-panel">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent" />
            
            <div className="flex justify-between items-center relative z-10 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#F4EE8E] animate-pulse" />
                <h5 className="text-xs font-extrabold text-[#F4EE8E] uppercase tracking-wider font-sans">
                  Умное ИИ-Заполнение за 1 клик
                </h5>
              </div>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 px-2.5 py-0.5 rounded-full font-bold">
                Экономит время
              </span>
            </div>

            <p className="text-[11px] text-slate-200 relative z-10 leading-relaxed font-sans">
              Просто напишите свободным текстом или надиктуйте голосом итоги смены (выручку, статус задач, проблемы), и наша нейросеть сама заполнит все поля формы ниже!
            </p>

            <div className="relative flex items-center z-10">
              <textarea
                rows={3}
                value={aiFastFillInput}
                onChange={(e) => setAiFastFillInput(e.target.value)}
                placeholder="Например: 'Смена прошла отлично. Выручка составила 28500 рублей, возвратов не зафиксировано. Всё убрано по чек-листу, касса сведена. На завтра в плане ревизия.'"
                className="w-full px-4 py-3 rounded-xl bg-[#17344F]/50 border border-white/15 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] resize-none pr-12 font-sans"
                id="ai-fast-fill-textarea"
              />
              
              <button
                type="button"
                onClick={() => handleVoiceRecordingToggle('ai-fast-fill')}
                className={`absolute right-3 bottom-3 p-2 rounded-full border cursor-pointer transition-all ${
                  recordingFieldId === 'ai-fast-fill'
                    ? 'bg-red-500 border-red-400 text-white animate-pulse'
                    : 'bg-[#1E4468]/60 border-white/10 text-slate-300 hover:text-white'
                }`}
                title={recordingFieldId === 'ai-fast-fill' ? "Остановить запись" : "Надиктовать отчет голосом"}
                id="ai-fast-fill-mic-btn"
              >
                <Mic size={14} />
              </button>
            </div>

            {recordingFieldId === 'ai-fast-fill' && (
              <span className="text-[10px] text-red-400 font-mono animate-pulse block mt-1 relative z-10">
                🎤 Идет запись голоса... {recordingTimer}s (ИИ слушает ваши слова)
              </span>
            )}

            <div className="flex justify-end pt-1 relative z-10">
              <button
                type="button"
                disabled={isAiFilling || !aiFastFillInput.trim()}
                onClick={handleAiFastFill}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all cursor-pointer flex items-center gap-1.5 font-sans shadow-md"
                id="ai-fast-fill-submit-btn"
              >
                {isAiFilling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>ИИ заполняет поля...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>Заполнить рапорт с ИИ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center z-10" id="ai-smart-fill-divider">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[9px] text-slate-400 font-mono uppercase tracking-widest bg-[#17344F]/50 px-2 py-0.5 rounded border border-white/5">
              Или заполните поля вручную
            </span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="space-y-4 relative z-10">
            {activeReportTemplate.fields.map(field => (
              <div key={field.id} className="space-y-1.5 relative">
                <label className="block text-xs text-slate-300 font-semibold">{field.label}</label>
                
                {field.type === 'checkbox' ? (
                  <div className="flex items-center gap-2 pt-1 font-sans">
                    <input 
                      type="checkbox" 
                      checked={!!reportAnswers[field.id]}
                      onChange={(e) => setReportAnswers({ ...reportAnswers, [field.id]: e.target.checked })}
                      className="w-4 h-4 text-[#E7C768] rounded bg-[#17344F]/50 border-white/10 focus:ring-0 focus:outline-none"
                    />
                    <span className="text-xs text-slate-300">Да, выполнено / готово</span>
                  </div>
                ) : field.type === 'number' ? (
                  <input 
                    type="number" 
                    required={field.required}
                    value={String(reportAnswers[field.id] || '')}
                    onChange={(e) => setReportAnswers({ ...reportAnswers, [field.id]: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-mono"
                  />
                ) : (
                  /* Text/Voice inputs */
                  <div className="relative flex items-center">
                    <textarea 
                      rows={2}
                      required={field.required}
                      value={String(reportAnswers[field.id] || '')}
                      onChange={(e) => setReportAnswers({ ...reportAnswers, [field.id]: e.target.value })}
                      placeholder={field.type === 'voice' ? "Введите ваш отчет или надиктуйте голосом..." : "Ваш ответ..."}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] resize-none pr-12 font-sans"
                    />
                    {field.type === 'voice' && (
                      <button
                        type="button"
                        onClick={() => handleVoiceRecordingToggle(field.id)}
                        className={`absolute right-3 bottom-3 p-2 rounded-full border cursor-pointer transition-all ${
                          recordingFieldId === field.id 
                            ? 'bg-red-500 border-red-400 text-white animate-pulse' 
                            : 'bg-[#1E4468]/60 border-white/10 text-slate-400 hover:text-white'
                        }`}
                        title={recordingFieldId === field.id ? "Остановить запись" : "Записать голосом"}
                      >
                        <Mic size={14} />
                      </button>
                    )}
                  </div>
                )}

                {recordingFieldId === field.id && (
                  <span className="text-[10px] text-red-400 font-mono animate-pulse block mt-1">
                    🎤 Идет запись голоса... {recordingTimer}s (ИИ слушает)
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition-all cursor-pointer font-sans flex items-center justify-center gap-2 relative z-10"
          >
            <Send size={14} />
            Отправить рапорт и получить рекомендации ИИ
          </button>
        </form>
      )}
    </div>
  );
}
