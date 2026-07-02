import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles, Send, Mic, CheckCircle, ThumbsUp, MessageSquare, AlertTriangle, Plus, Trash, X } from 'lucide-react';
import { SubmittedReport, UserProfile, UserRole, Department } from '../../types';

interface CabinetCalendarProps {
  currentUser: UserProfile | null;
  reports: SubmittedReport[];
  setReports: (val: SubmittedReport[]) => void;
  departments: Department[];
  mockEmployees: UserProfile[];
  saveStateToServer: (updated: any) => void;
  triggerAI: (prompt: string, sys: string, cb: (text: string) => void, mascot?: any) => void;
  // Sync state items
  company: any;
  templates: any;
  transactions: any;
  notifications: any;
  tariff: any;
  crmCompanies: any;
}

export default function CabinetCalendar({
  currentUser,
  reports,
  setReports,
  departments,
  mockEmployees,
  saveStateToServer,
  triggerAI,
  company,
  templates,
  transactions,
  notifications,
  tariff,
  crmCompanies
}: CabinetCalendarProps) {
  // Calendar states
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed, so 6 is July

  // Filters
  const [calendarFilterDept, setCalendarFilterDept] = useState('All');
  const [calendarFilterEmp, setCalendarFilterEmp] = useState('All');

  // Selected report for manager review card
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // New interactive modal states
  const [activeModalDate, setActiveModalDate] = useState<string | null>(null);
  const [modalReportIdx, setModalReportIdx] = useState<number>(0);

  // Manager interactive states
  const [managerComment, setManagerComment] = useState('');
  const [managerTask, setManagerTask] = useState('');
  const [fieldComments, setFieldComments] = useState<Record<string, string>>({});
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  // Recording Simulation for Comments
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);

  // Month names
  const monthNamesRu = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // Recording interval
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Handle reactions
  const handleAddReaction = (reaction: string) => {
    if (!selectedReport) return;
    setSelectedReaction(reaction);

    const updated = reports.map(r => {
      if (r.id === selectedReport.id) {
        return {
          ...r,
          managerReaction: reaction
        };
      }
      return r;
    });

    setReports(updated);
    saveStateToServer({ company, departments, templates, reports: updated, transactions, notifications, tariff, crmCompanies });
  };

  // Handle voice recording simulation for manager comments
  const toggleManagerVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      setManagerComment(prev => prev + ' Смена зафиксирована. Отличные финансовые показатели за вчерашний день, план по выручке перевыполнен. Задачи на сегодня утверждены. Продолжаем в том же духе!');
    } else {
      setIsRecording(true);
      setRecordTimer(0);
    }
  };

  // Save review items
  const handleSaveReview = () => {
    if (!selectedReport) return;

    const updated = reports.map(r => {
      if (r.id === selectedReport.id) {
        return {
          ...r,
          managerComment: managerComment || r.managerComment,
          managerTask: managerTask || r.managerTask,
          fieldComments: { ...r.fieldComments, ...fieldComments },
          isReviewedByManager: true
        };
      }
      return r;
    });

    setReports(updated);
    saveStateToServer({ company, departments, templates, reports: updated, transactions, notifications, tariff, crmCompanies });
    alert('Ваша рецензия (комментарий, задачи и реакции) успешно сохранена!');
  };

  // AI draft feedback helper
  const handleAIBossFeedback = () => {
    if (!selectedReport) return;

    const sysPrompt = `Ты — опытный, мудрый генеральный директор компании. Твоя задача — прочитать отчет сотрудника и составить короткий, мотивирующий, но деловой отзыв руководителя на русском языке (1-2 предложения). Можешь похвалить за высокие показатели или подсказать решение проблем, если они указаны.`;
    const promptText = `Отчет сотрудника ${selectedReport.employeeName} (${selectedReport.templateTitle}):
${Object.entries(selectedReport.answers).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
Напиши профессиональный отзыв начальника.`;

    triggerAI(promptText, sysPrompt, (text) => {
      setManagerComment(text.trim());
    }, 'happy');
  };

  // Generate days in grid
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    // Find the starting day of the week (0 = Sunday, we shift to Monday-start)
    let startDayOfWeek = date.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday

    // Padding for previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ dayNum: null, dateStr: null });
    }

    // Days in current month
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      days.push({
        dayNum: d,
        dateStr: `${year}-${monthStr}-${dayStr}`
      });
    }

    return days;
  };

  const daysGrid = getDaysInMonth(currentYear, currentMonth);

  // Navigation of month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedReport(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedReport(null);
  };

  // Filter reports
  const filteredSubmittedReports = reports.filter(r => {
    // Dept filter
    if (calendarFilterDept !== 'All' && r.departmentId !== calendarFilterDept) return false;
    // Employee filter
    if (calendarFilterEmp !== 'All' && !r.employeeName.includes(calendarFilterEmp)) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="panel-calendar">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white font-sans">Календарь отчетов</h3>
          <p className="text-xs text-slate-400">Интерактивный календарный аудит сданных рапортов с оценкой ИИ и пультом руководителя.</p>
        </div>
        
        {/* Navigation Month buttons */}
        <div className="flex items-center gap-2 bg-[#17344F]/60 border border-white/10 p-1.5 rounded-xl self-start sm:self-center">
          <button 
            onClick={prevMonth}
            className="p-1.5 hover:bg-[#1E4468]/50 text-slate-300 hover:text-white rounded-lg cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold font-sans text-[#F4EE8E] px-2 min-w-[100px] text-center">
            {monthNamesRu[currentMonth]} {currentYear}
          </span>
          <button 
            onClick={nextMonth}
            className="p-1.5 hover:bg-[#1E4468]/50 text-slate-300 hover:text-white rounded-lg cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl border border-white/5 bg-[#17344F]/40 flex flex-wrap gap-4 items-center justify-between text-xs">
        <div className="flex flex-wrap gap-2">
          <select 
            value={calendarFilterDept}
            onChange={(e) => setCalendarFilterDept(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#1E4468]/60 border border-white/10 text-slate-300 focus:outline-none"
          >
            <option value="All">Все отделы</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <select 
            value={calendarFilterEmp}
            onChange={(e) => setCalendarFilterEmp(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#1E4468]/60 border border-white/10 text-slate-300 focus:outline-none"
          >
            <option value="All">Все сотрудники</option>
            <option value="Иван">Иван Смирнов</option>
            <option value="Анна">Анна Петрова</option>
            <option value="Сергей">Сергей Федоров</option>
          </select>
        </div>

        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span> ≥80 Баллов</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 block"></span> 50-79 Баллов</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 block"></span> &lt;50 Баллов</span>
        </div>
      </div>

      {/* Real Calendar Grid */}
      <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#17344F]/40 shadow-xl" id="interactive-calendar-wrapper">
        {/* Days Header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-white/5">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div className="text-red-400/80">Сб</div>
          <div className="text-red-400/80">Вс</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 pt-3">
          {daysGrid.map((day, idx) => {
            if (!day.dayNum) {
              return <div key={`empty-${idx}`} className="aspect-square bg-transparent rounded-xl" />;
            }

            // Find reports submitted on this date
            const dayReports = filteredSubmittedReports.filter(r => {
              const repDate = r.timestamp.split('T')[0];
              return repDate === day.dateStr;
            });

            return (
              <div 
                key={day.dateStr}
                className={`aspect-square p-2 rounded-xl border flex flex-col justify-between transition-all relative select-none ${
                  dayReports.length > 0 
                    ? 'bg-[#1E4468]/60 border-amber-400/20 hover:border-amber-400/50 cursor-pointer shadow-md hover:scale-102' 
                    : 'bg-[#17344F]/20 border-white/5 text-slate-500 hover:border-slate-400/20 hover:bg-[#17344F]/40 cursor-pointer'
                }`}
                onClick={() => {
                  setActiveModalDate(day.dateStr);
                  setModalReportIdx(0);
                  if (dayReports.length > 0) {
                    const rep = dayReports[0];
                    setSelectedReport(rep);
                    setManagerComment(rep.managerComment || '');
                    setManagerTask(rep.managerTask || '');
                    setFieldComments(rep.fieldComments || {});
                    setSelectedReaction(rep.managerReaction || null);
                  } else {
                    setSelectedReport(null);
                  }
                }}
              >
                <span className={`text-[11px] font-bold ${dayReports.length > 0 ? 'text-white' : 'text-slate-500'}`}>
                  {day.dayNum}
                </span>

                {/* Report status markers inside the cell */}
                <div className="flex flex-wrap gap-1 mt-1 justify-end">
                  {dayReports.map((rep, rIdx) => {
                    let dotColor = 'bg-emerald-400';
                    if (rep.qualityScore < 50) dotColor = 'bg-red-400';
                    else if (rep.qualityScore < 80) dotColor = 'bg-amber-300';
                    
                    return (
                      <span 
                        key={rep.id} 
                        className={`w-2 h-2 rounded-full ${dotColor} block animate-pulse`} 
                        title={`${rep.employeeName}: ${rep.templateTitle} (${rep.qualityScore}/100)`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DETAILED DATE REPORTS VIEWER */}
      {activeModalDate && (() => {
        // Find reports for the selected modal date
        const dayReports = filteredSubmittedReports.filter(r => {
          const repDate = r.timestamp.split('T')[0];
          return repDate === activeModalDate;
        });

        const formattedDate = new Date(activeModalDate).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in" id="calendar-date-modal">
            <div className="relative w-full max-w-5xl h-[85vh] border border-white/10 bg-gradient-to-b from-[#17344F] to-[#1E4468] rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col overflow-hidden font-sans">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 to-white/5" />
              
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="text-[#E7C768]" size={20} />
                  <div>
                    <h4 className="text-base font-bold text-[#F4EE8E]">Аудит отчетов за {formattedDate}</h4>
                    <p className="text-[10px] text-slate-300">Просмотр, ИИ-анализ и рецензирование всех поступивших рапортов за день.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModalDate(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden relative z-10">
                {dayReports.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#1E4468]/40 border border-white/5 flex items-center justify-center text-slate-400">
                      <CalendarIcon size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-300">Сданных отчетов не найдено</p>
                      <p className="text-xs text-slate-400 max-w-sm">В этот календарный день сотрудники не отправляли рапорты или они не соответствуют выбранным фильтрам.</p>
                    </div>
                    <button
                      onClick={() => setActiveModalDate(null)}
                      className="px-4 py-2 bg-[#E7C768] text-slate-900 font-bold rounded-xl text-xs hover:brightness-110 transition-all cursor-pointer"
                    >
                      Закрыть календарь
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Left Pane: Reports list (1/4 width) */}
                    <div className="w-full md:w-1/4 border-r border-white/10 pr-4 overflow-y-auto space-y-2 max-h-[60vh] md:max-h-none">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Рапорты ({dayReports.length})</span>
                      <div className="space-y-2">
                        {dayReports.map((rep, idx) => {
                          const isActive = idx === modalReportIdx;
                          let scoreColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
                          if (rep.qualityScore < 50) scoreColor = 'text-red-400 border-red-500/20 bg-red-500/5';
                          else if (rep.qualityScore < 80) scoreColor = 'text-amber-300 border-amber-300/20 bg-amber-500/5';

                          return (
                            <button
                              key={rep.id}
                              onClick={() => {
                                setModalReportIdx(idx);
                                setSelectedReport(rep);
                                setManagerComment(rep.managerComment || '');
                                setManagerTask(rep.managerTask || '');
                                setFieldComments(rep.fieldComments || {});
                                setSelectedReaction(rep.managerReaction || null);
                              }}
                              className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex flex-col gap-1 cursor-pointer ${
                                isActive 
                                  ? 'bg-[#1E4468] border-[#E7C768] text-white shadow-lg ring-1 ring-[#E7C768]/10' 
                                  : 'bg-[#17344F]/40 border-white/5 text-slate-300 hover:bg-[#17344F]/80'
                              }`}
                            >
                              <div className="flex justify-between items-center gap-1.5 w-full">
                                <span className="font-bold truncate text-[11px]">{rep.employeeName}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] border font-mono ${scoreColor}`}>
                                  {rep.qualityScore}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 truncate">{rep.templateTitle}</span>
                              <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono mt-1 pt-1 border-t border-white/5">
                                <span>{new Date(rep.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                                {rep.isReviewedByManager ? (
                                  <span className="text-emerald-400 font-bold">● Проверен</span>
                                ) : (
                                  <span className="text-amber-400">● Ожидает</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Pane: Report details & audit panel (3/4 width) */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-xs max-h-[60vh] md:max-h-none">
                      {selectedReport && (
                        <>
                          {/* Report Header Info */}
                          <div className="flex justify-between items-start border-b border-white/10 pb-4 flex-wrap gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1E4468] text-amber-200 font-mono font-bold uppercase border border-amber-200/20">
                                  {selectedReport.type}
                                </span>
                                <span className="text-xs text-[#E7C768] font-bold">{selectedReport.departmentName}</span>
                              </div>
                              <h5 className="text-sm font-bold text-white mt-1">
                                {selectedReport.templateTitle} — {selectedReport.employeeName}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-mono">ID рапорта: #{selectedReport.id} | Сдано в {new Date(selectedReport.timestamp).toLocaleString('ru-RU')}</p>
                            </div>
                            
                            {/* Score Card */}
                            <div className="text-center bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                              <span className="block text-[8px] text-emerald-300 uppercase tracking-wider font-bold">Оценка ИИ</span>
                              <span className="text-sm font-extrabold font-mono text-emerald-400">{selectedReport.qualityScore}/100</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Answers Panel */}
                            <div className="space-y-4">
                              {/* Executive Summary */}
                              <div className="p-4 rounded-2xl border border-amber-200/15 bg-[#17344F]/80 space-y-1.5">
                                <h6 className="text-xs font-bold text-[#F4EE8E] flex items-center gap-1">
                                  🤖 Быстрый факт от ИИ:
                                </h6>
                                <p className="text-slate-200 leading-relaxed italic text-[11.5px]">
                                  "{selectedReport.aiSummary || 'Смена зафиксирована успешно. Инцидентов не зафиксировано, показатели соответствуют нормативам.'}"
                                </p>
                              </div>

                              <div className="space-y-2">
                                <h6 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ответы в анкете:</h6>
                                <div className="p-4 rounded-2xl border border-white/5 bg-[#17344F]/50 space-y-3">
                                  {Object.entries(selectedReport.answers).map(([key, val]) => (
                                    <div key={key} className="border-b border-white/5 pb-2.5 last:border-none last:pb-0">
                                      <p className="font-semibold text-slate-400">Вопрос: {key}</p>
                                      <p className="text-slate-100 text-[11px] mt-0.5 whitespace-pre-line leading-relaxed">{String(val)}</p>
                                      
                                      {/* Inline boss comment */}
                                      {fieldComments[key] && (
                                        <div className="mt-1.5 p-1.5 rounded bg-amber-400/5 border-l-2 border-[#E7C768] text-amber-200 text-[10px]">
                                          <strong>Заметка босса:</strong> {fieldComments[key]}
                                        </div>
                                      )}

                                      {/* Add comment input for leaders */}
                                      {(currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.MANAGER || currentUser?.role === UserRole.ADMIN) && (
                                        <div className="flex gap-1.5 mt-2">
                                          <input 
                                            type="text" 
                                            placeholder="Прокомментировать этот пункт..." 
                                            value={fieldComments[key] || ''}
                                            onChange={(e) => setFieldComments({ ...fieldComments, [key]: e.target.value })}
                                            className="flex-1 px-2.5 py-1 rounded bg-[#17344F]/50 border border-white/10 text-white text-[10px] focus:outline-none focus:border-[#E7C768]"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Recommendations & Manager Controls */}
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <h6 className="text-xs font-bold text-slate-300 flex items-center gap-1">
                                  <Sparkles size={11} className="text-[#E7C768]" />
                                  Персональные советы ИИ:
                                </h6>
                                <div className="p-4 rounded-2xl border border-amber-200/10 bg-[#1E4468]/20 italic leading-relaxed text-slate-200 whitespace-pre-line text-[11px]">
                                  {selectedReport.aiRecommendations}
                                </div>
                              </div>

                              {/* Review Action panel */}
                              {(currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.MANAGER || currentUser?.role === UserRole.ADMIN) && (
                                <div className="p-4 rounded-2xl border border-[#E7C768]/20 bg-[#17344F]/70 space-y-4 font-sans">
                                  <h6 className="text-xs font-bold text-[#F4EE8E] uppercase tracking-wider">
                                    ✍️ Оценка и обратная связь директора:
                                  </h6>

                                  {/* Reactions */}
                                  <div className="space-y-1.5">
                                    <span className="block text-[10px] text-slate-400">Поставить одобрительную реакцию:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {['🔥 Огонь', '👏 Класс', '❤️ Супер', '✅ Принято', '⚠️ Внимание'].map(react => (
                                        <button 
                                          key={react}
                                          type="button"
                                          onClick={() => handleAddReaction(react)}
                                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                            selectedReaction === react 
                                              ? 'bg-[#E7C768] text-slate-900 border-[#E7C768]' 
                                              : 'bg-[#1E4468]/50 text-slate-300 border-white/5 hover:text-white'
                                          }`}
                                        >
                                          {react}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Voice & Written Comments */}
                                  <div className="space-y-1.5">
                                    <label className="block text-[10px] text-slate-400">Вердикт шефа сотруднику:</label>
                                    <div className="relative flex items-center">
                                      <textarea
                                        rows={2}
                                        value={managerComment}
                                        onChange={(e) => setManagerComment(e.target.value)}
                                        placeholder="Обратная связь руководителю или надиктуйте голосом..."
                                        className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768] resize-none pr-10"
                                      />
                                      <button
                                        type="button"
                                        onClick={toggleManagerVoice}
                                        className={`absolute right-2 bottom-2 p-1.5 rounded-full border cursor-pointer transition-colors ${
                                          isRecording 
                                            ? 'bg-red-500 border-red-400 text-white animate-pulse' 
                                            : 'bg-[#1E4468]/50 border-white/10 text-slate-300 hover:text-white'
                                        }`}
                                        title={isRecording ? 'Завершить запись' : 'Наговорить голосом'}
                                      >
                                        <Mic size={11} />
                                      </button>
                                    </div>

                                    {isRecording && (
                                      <span className="text-[9px] text-red-400 font-mono animate-pulse block">
                                        🎤 Идет симуляция записи голоса... {recordTimer}s
                                      </span>
                                    )}

                                    <div className="flex gap-2">
                                      <button 
                                        type="button"
                                        onClick={handleAIBossFeedback}
                                        className="px-2.5 py-1 rounded bg-[#E7C768]/15 hover:bg-[#E7C768]/30 border border-[#E7C768]/30 text-[#F4EE8E] text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                      >
                                        <Sparkles size={10} />
                                        Написать ИИ-отзыв за меня
                                      </button>
                                    </div>
                                  </div>

                                  {/* Task delegation */}
                                  <div className="space-y-1.5">
                                    <label className="block text-[10px] text-slate-400">Делегировать задачу на основе рапорта:</label>
                                    <input 
                                      type="text"
                                      value={managerTask}
                                      onChange={(e) => setManagerTask(e.target.value)}
                                      placeholder="Например: Усилить продажи до 15:00."
                                      className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768]"
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={handleSaveReview}
                                    className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 active:scale-98 transition-all"
                                  >
                                    <CheckCircle size={12} />
                                    Сохранить рецензию и аудит
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
