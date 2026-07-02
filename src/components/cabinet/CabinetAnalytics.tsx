import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend, Cell } from 'recharts';
import { Sparkles, BarChart3, TrendingUp, AlertTriangle, Users, BookOpen, Volume2, Calendar, Award, RefreshCw, UserCheck } from 'lucide-react';
import { SubmittedReport, Department } from '../../types';

interface CabinetAnalyticsProps {
  reports: SubmittedReport[];
  departments: Department[];
  mockEmployees: any[];
  triggerAI: (prompt: string, sys: string, cb: (text: string) => void, mascot?: any) => void;
}

export default function CabinetAnalytics({
  reports,
  departments,
  mockEmployees = [],
  triggerAI
}: CabinetAnalyticsProps) {
  const [selectedAnalDept, setSelectedAnalDept] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [selectedDays, setSelectedDays] = useState(30);
  const [aiSummaryResult, setAiSummaryResult] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Filter reports according to selected department, employee, and days period (max 30 calendar days)
  const filteredReports = reports.filter(r => {
    // 1. Department filter
    if (selectedAnalDept !== 'All' && r.departmentId !== selectedAnalDept) return false;

    // 2. Employee filter (check ID or Name)
    if (selectedEmployee !== 'All') {
      const matchName = r.employeeName === selectedEmployee;
      const matchId = r.employeeId === selectedEmployee;
      if (!matchName && !matchId) return false;
    }

    // 3. Days filter (within last N calendar days)
    const reportDate = new Date(r.timestamp);
    const timeDiff = Date.now() - reportDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    if (daysDiff > selectedDays) return false;

    return true;
  });

  // Calculate Metrics
  const totalReportsCount = filteredReports.length;
  const avgQualityScore = totalReportsCount > 0 
    ? Math.round(filteredReports.reduce((sum, r) => sum + r.qualityScore, 0) / totalReportsCount)
    : 0;

  const voiceReportsCount = filteredReports.filter(r => r.voiceInputUsed).length;
  const voiceRate = totalReportsCount > 0 
    ? Math.round((voiceReportsCount / totalReportsCount) * 100)
    : 0;

  // Timeliness simulation: 80+ score or high scores are counted as "excellent timing"
  const excellentCount = filteredReports.filter(r => r.qualityScore >= 80).length;
  const excellentRate = totalReportsCount > 0 
    ? Math.round((excellentCount / totalReportsCount) * 100)
    : 0;

  // Prepare Trend Data (by timestamp date)
  const getTrendData = () => {
    const datesMap: Record<string, { count: number; totalScore: number }> = {};
    
    // Default mock week if no reports match filters to ensure beautiful rendering
    if (filteredReports.length === 0) {
      return [
        { date: '25.06', score: 82 },
        { date: '26.06', score: 85 },
        { date: '27.06', score: 79 },
        { date: '28.06', score: 88 },
        { date: '29.06', score: 91 },
        { date: '30.06', score: 89 },
        { date: '01.07', score: 94 },
      ];
    }

    filteredReports.forEach(r => {
      const dateStr = new Date(r.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
      if (!datesMap[dateStr]) {
        datesMap[dateStr] = { count: 0, totalScore: 0 };
      }
      datesMap[dateStr].count += 1;
      datesMap[dateStr].totalScore += r.qualityScore;
    });

    return Object.keys(datesMap).map(date => ({
      date,
      score: Math.round(datesMap[date].totalScore / datesMap[date].count)
    })).reverse(); // chronological order
  };

  const trendData = getTrendData();

  // Prepare Department distribution data
  const getDeptData = () => {
    return departments.map(d => {
      const deptCount = reports.filter(r => {
        if (r.departmentId !== d.id) return false;
        if (selectedEmployee !== 'All' && r.employeeName !== selectedEmployee) return false;
        const reportDate = new Date(r.timestamp);
        const daysDiff = (Date.now() - reportDate.getTime()) / (1000 * 3600 * 24);
        if (daysDiff > selectedDays) return false;
        return true;
      }).length;
      return {
        name: d.name,
        count: deptCount
      };
    });
  };

  const deptData = getDeptData();

  const handleGenerateSummary = () => {
    setIsSummaryLoading(true);
    
    const sysPrompt = `Ты — профессиональный финансовый и операционный аудитор компании. Твоя задача — составить глубокий, конструктивный аналитический SWOT-отчет по результатам рапортов сотрудников на русском языке. Ответ должен быть бодрым, вдохновляющим и четко структурированным.`;
    
    const selectedDeptName = selectedAnalDept === 'All' ? 'Все отделы' : departments.find(d => d.id === selectedAnalDept)?.name || selectedAnalDept;
    const selectedEmpName = selectedEmployee === 'All' ? 'Все сотрудники' : selectedEmployee;

    const promptText = `Проанализируй сводный набор последних отчетов сотрудников нашей компании за последние ${selectedDays} календарных дней.
ФИЛЬТРЫ АНАЛИЗА:
- Отдел: ${selectedDeptName}
- Сотрудник: ${selectedEmpName}
- Период анализа: последние ${selectedDays} дней (макс 30)

СПИСОК ОТФИЛЬТРОВАННЫХ ОТЧЕТОВ И ИХ ОЦЕНКА:
${filteredReports.length > 0 
  ? filteredReports.slice(0, 15).map(r => `- Сотрудник: ${r.employeeName}, Отдел: ${r.departmentName}, Шаблон: ${r.templateTitle}, Балл: ${r.qualityScore}/100, Краткий факт: ${r.aiSummary || 'В норме.'}`).join('\n')
  : 'Нет поданных рапортов за выбранный период.'
}

Пожалуйста, составь красивый, развернутый аналитический отчет (Саммари ИИ) в 3 логических разделах:
1. 📈 Ключевые результаты и тенденции организации за ${selectedDays} дн. по выбранным фильтрам.
2. 🔍 Проблемные зоны, инциденты или упущенные возможности сотрудников.
3. 🎯 3 Сильнейших инсайта / рекомендации от ИИ для руководства по оптимизации работы отделов.

Ответ напиши в деловом тоне, используя красивое форматирование.`;

    triggerAI(promptText, sysPrompt, (text) => {
      setAiSummaryResult(text);
      setIsSummaryLoading(false);
    }, 'happy');
  };

  return (
    <div className="space-y-6 animate-fade-in" id="panel-analytics">
      <div>
        <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
          <BarChart3 className="text-amber-200" size={20} />
          <span>ИИ Аналитика и Саммари</span>
        </h3>
        <p className="text-xs text-slate-400">Сводный интерактивный пульт управления показателями и ИИ-анализ эффективности сотрудников.</p>
      </div>

      {/* Dynamic Filter Section */}
      <div className="p-4 rounded-3xl border border-white/5 bg-[#17344F]/50 grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
        {/* Department Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Выбрать отдел</label>
          <select 
            value={selectedAnalDept}
            onChange={(e) => {
              setSelectedAnalDept(e.target.value);
              // Reset employee filter if department changes to keep consistent
              setSelectedEmployee('All');
            }}
            className="w-full px-3 py-2 rounded-xl bg-[#1E4468]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] h-10"
          >
            <option value="All">Все отделы</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {/* Employee Filter */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Выбрать сотрудника</label>
          <select 
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#1E4468]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] h-10"
          >
            <option value="All">Все сотрудники</option>
            {mockEmployees
              .filter(emp => selectedAnalDept === 'All' || emp.departmentId === selectedAnalDept)
              .map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name} ({emp.position})</option>
              ))
            }
          </select>
        </div>

        {/* Period Filter (1 to 30 days) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Период анализа</label>
            <span className="text-amber-200 font-bold text-[11px] font-mono">{selectedDays} {selectedDays === 1 ? 'день' : selectedDays < 5 ? 'дня' : 'дней'}</span>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="range" 
              min="1" 
              max="30" 
              value={selectedDays}
              onChange={(e) => setSelectedDays(parseInt(e.target.value) || 30)}
              className="flex-1 accent-amber-200 h-1.5 bg-[#17344F] rounded-lg cursor-pointer"
            />
            <input 
              type="number" 
              min="1" 
              max="30" 
              value={selectedDays}
              onChange={(e) => {
                const val = Math.max(1, Math.min(30, parseInt(e.target.value) || 30));
                setSelectedDays(val);
              }}
              className="w-12 px-2 py-1.5 text-center rounded-lg bg-[#1E4468]/60 border border-white/10 text-white text-xs font-mono focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="p-4 rounded-2xl bg-[#17344F]/40 border border-white/5 flex items-center gap-4 shadow-md">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-400">
            <BookOpen size={18} />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Отчетов подано</span>
            <span className="text-xl font-extrabold font-mono text-white">{totalReportsCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#17344F]/40 border border-white/5 flex items-center gap-4 shadow-md">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400">
            <Award size={18} />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ср. Оценка KPI</span>
            <span className="text-xl font-extrabold font-mono text-emerald-400">{avgQualityScore}/100</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#17344F]/40 border border-white/5 flex items-center gap-4 shadow-md">
          <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-300/20 text-amber-300">
            <Volume2 size={18} />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Голосовой ввод</span>
            <span className="text-xl font-extrabold font-mono text-amber-300">{voiceRate}%</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#17344F]/40 border border-white/5 flex items-center gap-4 shadow-md">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-400">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider font-sans">Качество работы</span>
            <span className="text-xl font-extrabold font-mono text-indigo-300">{excellentRate}%</span>
          </div>
        </div>
      </div>

      {/* Recharts Graphical Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        
        {/* Trend area chart */}
        <div className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-[#17344F]/40 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-400" />
            Тренды качества работы за {selectedDays} дн. (Динамика KPI)
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[60, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#17344F', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department workload bar chart */}
        <div className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-[#17344F]/40 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Users size={14} className="text-[#E7C768]" />
            Активность по отделам за {selectedDays} дн. (Количество рапортов)
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#17344F', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#E7C768" radius={[8, 8, 0, 0]}>
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#E7C768' : '#F4EE8E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI SWOT Summary Generator */}
      <div className="p-5 rounded-3xl border border-white/10 bg-[#17344F]/40 space-y-4" id="ai-swot-generator">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white font-sans flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-200 animate-pulse" />
              Комплексный ИИ-анализ эффективности за {selectedDays} дней
            </h4>
            <p className="text-xs text-slate-400">Нейросеть соберет все поданные сотрудниками рапорты по выбранным фильтрам за выбранный период.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleGenerateSummary}
              disabled={isSummaryLoading}
              className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 font-sans h-11 shadow-lg active:scale-95"
            >
              {isSummaryLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Формируем ИИ сводку...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Создать ИИ-Сводку ({selectedDays} дн.)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI summary text display block */}
        {aiSummaryResult ? (
          <div className="p-5 rounded-2xl bg-[#1E4468]/20 border border-amber-200/20 text-slate-100 text-xs sm:text-sm leading-relaxed whitespace-pre-line animate-fade-in font-sans" id="ai-summary-output">
            <div className="flex justify-between items-center pb-2.5 border-b border-white/5 mb-3">
              <h5 className="font-extrabold text-[#F4EE8E] uppercase tracking-wide flex items-center gap-1.5 text-xs">
                🤖 СВОДНЫЙ АУДИТ НЕЙРОСЕТИ ii_rr (за {selectedDays} дн.):
              </h5>
              <span className="text-[10px] text-slate-400">Фильтры: {selectedAnalDept === 'All' ? 'Все отделы' : 'Выбранный отдел'} / {selectedEmployee === 'All' ? 'Все сотрудники' : selectedEmployee}</span>
            </div>
            <div className="text-slate-200 text-xs leading-relaxed space-y-4 whitespace-pre-line">
              {aiSummaryResult}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-white/5 rounded-2xl bg-white/1 text-slate-500 text-xs font-sans">
            Нажмите кнопку «Создать ИИ-Сводку» для мгновенного аудита организации по заданным параметрам.
          </div>
        )}
      </div>
    </div>
  );
}
