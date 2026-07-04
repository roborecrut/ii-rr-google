import React, { useState } from 'react';
import { Clock, Calendar, Sparkles, Check, ChevronLeft, ChevronRight, RefreshCw, UserPlus, Sliders, Settings, HelpCircle, Save, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { UserProfile, UserRole, SubmittedReport } from '../../types';

interface CabinetScheduleGanttProps {
  currentUser: UserProfile | null;
  mockEmployees: UserProfile[];
  reports?: SubmittedReport[];
}

interface ShiftConfig {
  dayHours: string;     // custom per-employee, e.g. "09:00 - 18:00"
  nightHours: string;   // custom per-employee, e.g. "22:00 - 08:00"
  dailyHours: string;   // custom per-employee, e.g. "08:00 - 08:00" (суточная смена)
}

interface EmployeeSchedule {
  id: string;
  name: string;
  role: string;
  shiftConfig: ShiftConfig;
  shifts: {
    day: number;
    type: 'day' | 'night' | 'daily' | 'weekend' | 'vacation' | 'sick' | 'dayoff' | 'trip' | 'study' | 'remote';
    hours: string; // resolved time range
  }[];
}

export default function CabinetScheduleGantt({
  currentUser,
  mockEmployees,
  reports = []
}: CabinetScheduleGanttProps) {
  const isManager = currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.MANAGER || currentUser?.role === UserRole.ADMIN;

  // Calendar Year and Month states (Requirement 7)
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed, dynamically resolved

  const monthNamesRu = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // Calculate dynamic days in the selected month (Requirement 7)
  const getDaysInMonthCount = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const totalDays = getDaysInMonthCount(currentYear, currentMonth);
  const daysInMonth = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Helper to pre-populate shifts dynamically based on selected month (Requirement 7)
  const getInitialShiftsForMonth = (empId: string, monthDays: number[]) => {
    return monthDays.map(day => {
      let type: 'day' | 'night' | 'daily' | 'weekend' | 'vacation' | 'sick' | 'dayoff' | 'trip' | 'study' | 'remote' = 'weekend';
      let hours = 'Выходной';
      
      if (empId === 'emp-1') {
        const isWeekend = (day % 7 === 6 || day % 7 === 0);
        type = isWeekend ? 'weekend' : 'day';
        hours = isWeekend ? 'Выходной' : '09:00 - 18:00';
      } else if (empId === 'emp-2') {
        const isWeekend = (day % 7 === 3 || day % 7 === 4);
        type = isWeekend ? 'weekend' : 'day';
        hours = isWeekend ? 'Выходной' : '10:00 - 19:00';
      } else if (empId === 'emp-3') {
        const isDailyShift = (day % 4 === 1);
        type = isDailyShift ? 'daily' : 'weekend';
        hours = isDailyShift ? '08:30 - 08:30' : 'Выходной';
      } else if (empId === 'emp-4') {
        const isVacation = (day >= 5 && day <= 14);
        const isWeekend = (day % 7 === 6 || day % 7 === 0);
        type = isVacation ? 'vacation' : isWeekend ? 'weekend' : 'day';
        hours = isVacation ? 'Отпуск' : isWeekend ? 'Выходной' : '09:00 - 18:00';
      }
      
      return { day, type, hours };
    });
  };

  // Initial Gantt Schedule State for 30 calendar days
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([
    {
      id: 'emp-1',
      name: 'Иван Смирнов',
      role: 'Разработчик',
      shiftConfig: { dayHours: '09:00 - 18:00', nightHours: '21:00 - 07:00', dailyHours: '08:00 - 08:00' },
      shifts: []
    },
    {
      id: 'emp-2',
      name: 'Анна Петрова',
      role: 'Маркетолог',
      shiftConfig: { dayHours: '10:00 - 19:00', nightHours: '22:00 - 08:00', dailyHours: '09:00 - 09:00' },
      shifts: []
    },
    {
      id: 'emp-3',
      name: 'Сергей Федоров',
      role: 'Менеджер по продажам',
      shiftConfig: { dayHours: '09:00 - 18:00', nightHours: '20:00 - 06:00', dailyHours: '08:30 - 08:30' },
      shifts: []
    },
    {
      id: 'emp-4',
      name: 'Мария Сидорова',
      role: 'Контент-мейкер',
      shiftConfig: { dayHours: '09:00 - 18:00', nightHours: '22:00 - 08:00', dailyHours: '10:00 - 10:00' },
      shifts: []
    }
  ]);

  // Keep shifts synced with dynamic month selected (Requirement 7)
  React.useEffect(() => {
    setSchedules(prev => prev.map(emp => ({
      ...emp,
      shifts: getInitialShiftsForMonth(emp.id, daysInMonth)
    })));
  }, [currentMonth, currentYear, totalDays]);

  // Clicked cell for inline edit popover
  const [activeCellEdit, setActiveCellEdit] = useState<{ empId: string; day: number } | null>(null);
  
  // Selected employee for personal shift times editor panel
  const [editingConfigEmp, setEditingConfigEmp] = useState<EmployeeSchedule | null>(null);

  // Template-first selection state (Requirement 8)
  const [selectedAssignTemplate, setSelectedAssignTemplate] = useState<'5/2' | '2/2' | '1/3' | 'nights' | null>(null);
  
  // Local form state for custom time editing
  const [tempDayHours, setTempDayHours] = useState('');
  const [tempNightHours, setTempNightHours] = useState('');
  const [tempDailyHours, setTempDailyHours] = useState('');

  // Reminder settings states
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTimeType, setReminderTimeType] = useState<string>('before_shift');
  const [reminderTimeValue, setReminderTimeValue] = useState('30'); // minutes or hour string
  const [reminderChannel, setReminderChannel] = useState<string>('telegram');
  const [reminderText, setReminderText] = useState('Привет, {name}! Напоминаем, что сегодня у тебя смена {shift_type} ({shift_hours}). Пожалуйста, заполни рапорт в конце смены.');

  // Open the personal configuration editor
  const handleOpenConfig = (emp: EmployeeSchedule) => {
    if (!isManager) return;
    setEditingConfigEmp(emp);
    setTempDayHours(emp.shiftConfig.dayHours);
    setTempNightHours(emp.shiftConfig.nightHours);
    setTempDailyHours(emp.shiftConfig.dailyHours);

    // Initialize or load existing reminder configs
    const r = (emp as any).reminder || {
      enabled: true,
      timeType: 'before_shift',
      timeValue: '30',
      channel: 'telegram',
      text: 'Привет, {name}! Напоминаем, что сегодня у тебя смена {shift_type} ({shift_hours}). Пожалуйста, заполни рапорт в конце смены.'
    };
    setReminderEnabled(r.enabled);
    setReminderTimeType(r.timeType);
    setReminderTimeValue(r.timeValue);
    setReminderChannel(r.channel);
    setReminderText(r.text);
  };

  // Save personal shift times configuration
  const handleSaveConfig = () => {
    if (!editingConfigEmp) return;

    setSchedules(prev => prev.map(s => {
      if (s.id !== editingConfigEmp.id) return s;
      
      const updatedConfig = {
        dayHours: tempDayHours || '09:00 - 18:00',
        nightHours: tempNightHours || '22:00 - 08:00',
        dailyHours: tempDailyHours || '08:00 - 08:00'
      };

      // Also auto-update existing shift hour labels of the corresponding types to match new times
      const updatedShifts = s.shifts.map(sh => {
        if (sh.type === 'day') return { ...sh, hours: updatedConfig.dayHours };
        if (sh.type === 'night') return { ...sh, hours: updatedConfig.nightHours };
        if (sh.type === 'daily') return { ...sh, hours: updatedConfig.dailyHours };
        return sh;
      });

      return {
        ...s,
        shiftConfig: updatedConfig,
        shifts: updatedShifts,
        reminder: {
          enabled: reminderEnabled,
          timeType: reminderTimeType,
          timeValue: reminderTimeValue,
          channel: reminderChannel,
          text: reminderText
        }
      } as any;
    }));

    setEditingConfigEmp(null);
  };

  // Template autofill logic across the entire month (30 days)
  const handleApplyTemplate = (empId: string, templateType: '5/2' | '2/2' | '1/3' | 'nights') => {
    const targetEmp = schedules.find(s => s.id === empId);
    if (!targetEmp) return;

    const config = targetEmp.shiftConfig;
    let newShifts = [];

    if (templateType === '5/2') {
      newShifts = daysInMonth.map(day => {
        // Mon-Fri are days 1-5, 8-12, 15-19, 22-26, 29-30
        const isWeekend = (day % 7 === 6 || day % 7 === 0);
        return {
          day,
          type: isWeekend ? 'weekend' as const : 'day' as const,
          hours: isWeekend ? 'Выходной' : config.dayHours
        };
      });
    } else if (templateType === '2/2') {
      // 2 days day shift, 2 days weekend
      newShifts = daysInMonth.map(day => {
        const cycle = (day - 1) % 4;
        const isWork = (cycle === 0 || cycle === 1);
        return {
          day,
          type: isWork ? 'day' as const : 'weekend' as const,
          hours: isWork ? config.dayHours : 'Выходной'
        };
      });
    } else if (templateType === '1/3') {
      // 1 day 24-hour (суточная) shift, 3 days weekend
      newShifts = daysInMonth.map(day => {
        const cycle = (day - 1) % 4;
        const isDaily = (cycle === 0);
        return {
          day,
          type: isDaily ? 'daily' as const : 'weekend' as const,
          hours: isDaily ? config.dailyHours : 'Выходной'
        };
      });
    } else if (templateType === 'nights') {
      // Alternate 2 nights work, 2 days weekend
      newShifts = daysInMonth.map(day => {
        const cycle = (day - 1) % 4;
        const isNight = (cycle === 0 || cycle === 1);
        return {
          day,
          type: isNight ? 'night' as const : 'weekend' as const,
          hours: isNight ? config.nightHours : 'Выходной'
        };
      });
    }

    setSchedules(prev => prev.map(s => s.id === empId ? { ...s, shifts: newShifts } : s));
  };

  // Modify single day cell
  const handleUpdateCell = (empId: string, day: number, type: 'day' | 'night' | 'daily' | 'weekend' | 'vacation' | 'sick' | 'dayoff' | 'trip' | 'study' | 'remote') => {
    setSchedules(prev => prev.map(s => {
      if (s.id !== empId) return s;
      
      let resolvedHours = 'Выходной';
      if (type === 'day') resolvedHours = s.shiftConfig.dayHours;
      else if (type === 'night') resolvedHours = s.shiftConfig.nightHours;
      else if (type === 'daily') resolvedHours = s.shiftConfig.dailyHours;
      else if (type === 'vacation') resolvedHours = 'Отпуск';
      else if (type === 'sick') resolvedHours = 'Больничный';
      else if (type === 'dayoff') resolvedHours = 'Отгул';
      else if (type === 'trip') resolvedHours = 'Командировка';
      else if (type === 'study') resolvedHours = 'Обучение';
      else if (type === 'remote') resolvedHours = 'Удаленная работа';

      const nextShifts = s.shifts.map(sh => sh.day === day ? { ...sh, type, hours: resolvedHours } : sh);
      return { ...s, shifts: nextShifts };
    }));
    setActiveCellEdit(null);
  };

  // Requirement 7: Check real report submissions to determine attendance
  const getDayAttendance = (empName: string, day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

    // Find if a report exists for this employee on this date
    const dayReports = (reports || []).filter(r => {
      const repDate = r.timestamp.split('T')[0];
      const isSameEmp = r.employeeName.toLowerCase().includes(empName.toLowerCase());
      return repDate === dateStr && isSameEmp;
    });

    if (dayReports.length > 0) {
      // Analyze lateness based on report submission hour or low score
      const isLate = dayReports.some(r => {
        const dateObj = new Date(r.timestamp);
        const hour = dateObj.getHours(); // local hours
        return (r.templateTitle.toLowerCase().includes('план') && hour >= 11) || r.qualityScore < 45;
      });
      return isLate ? 'lateness' : 'worked';
    }

    // Check if the day is in the past
    const todayStr = new Date().toISOString().split('T')[0];
    const isPast = dateStr < todayStr;
    return isPast ? 'absence' : 'scheduled';
  };

  // Requirement 7: Calculate total worked days, lateness, and absences per employee
  const getEmployeeStats = (emp: EmployeeSchedule) => {
    let worked = 0;
    let lateness = 0;
    let absence = 0;

    emp.shifts.forEach(sh => {
      const status = getDayAttendance(emp.name, sh.day);
      if (status === 'worked') {
        worked++;
      } else if (status === 'lateness') {
        worked++;
        lateness++;
      } else if (status === 'absence') {
        // Only count absences for scheduled workdays
        if (sh.type === 'day' || sh.type === 'night' || sh.type === 'daily') {
          absence++;
        }
      }
    });

    return { worked, lateness, absence };
  };

  // Requirement 7: Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="panel-schedules">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <Calendar className="text-amber-200" size={20} />
            <span>Интерактивный календарь-расписание (с привязкой к датам)</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-1">
            {isManager 
              ? 'Контролируйте смены сотрудников, распределяйте отпуска, отслеживайте опоздания и пропуски по сданным рапортам.'
              : 'Ваше актуальное расписание рабочих смен, выходных и праздников, согласованное ИИ и руководством на месяц.'
            }
          </p>
        </div>

        {/* Month Selector Controls (Requirement 7) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#17344F]/60 p-1.5 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-[#1E4468] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Предыдущий месяц"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="px-4 text-xs font-bold font-sans text-center min-w-[120px] text-amber-200 select-none">
              {monthNamesRu[currentMonth]} {currentYear} г.
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-[#1E4468] text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Следующий месяц"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick jump to today indicator / button */}
          <button
            onClick={() => {
              setCurrentYear(today.getFullYear());
              setCurrentMonth(today.getMonth());
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold hover:bg-amber-400/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            title={`Перейти к текущей дате: ${today.toLocaleDateString('ru-RU')}`}
          >
            <Clock size={11} />
            <span>Сегодня</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[9px] text-slate-300 bg-[#17344F]/50 p-2 rounded-xl border border-white/5 font-sans">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span> Дневная (☀️)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-400"></span> Ночная (🌙)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-violet-500"></span> Суточная 24ч (⏳)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#17344F] border border-white/10"></span> Выходной</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-500"></span> Отпуск (🌴)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500"></span> Больничный (🤒)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-teal-500"></span> Отгул (☕)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-500"></span> Командировка (💼)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-pink-500"></span> Обучение (🎓)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-cyan-500"></span> Удаленка (💻)</span>
        </div>
      </div>

      {/* Today's Date Integration Panel (Requirement 7 & "привязка к сегодняшней дате") */}
      <div className="p-5 rounded-3xl border border-amber-300/20 bg-gradient-to-r from-[#17344F] via-[#1A3F61] to-[#1E4468] shadow-lg space-y-4" id="today-schedule-binding-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-200 tracking-wider block font-mono">АКТУАЛЬНЫЙ СТАТУС СМЕН НА СЕГОДНЯ</span>
              <h4 className="text-sm font-extrabold text-white font-sans">
                {today.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h4>
            </div>
          </div>
          <div className="text-[10px] text-slate-300 bg-slate-950/30 px-3 py-1 rounded-xl border border-white/5 font-sans flex items-center gap-1.5">
            <span className="text-amber-200 font-sans">Текущее время:</span>
            <span className="font-mono text-white font-bold">{today.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {schedules.map(emp => {
            const todayDay = today.getDate();
            const todayShift = emp.shifts.find(s => s.day === todayDay) || { type: 'weekend' as const, hours: 'Выходной' };
            
            let statusBadge = '';
            let statusText = '';
            let iconText = '';
            
            if (todayShift.type === 'day') {
              statusBadge = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
              statusText = `Дневная смена (${todayShift.hours})`;
              iconText = '☀️';
            } else if (todayShift.type === 'night') {
              statusBadge = 'bg-amber-400/15 border-amber-300/30 text-amber-300';
              statusText = `Ночная смена (${todayShift.hours})`;
              iconText = '🌙';
            } else if (todayShift.type === 'daily') {
              statusBadge = 'bg-violet-500/15 border-violet-500/30 text-violet-300';
              statusText = `Суточная смена (${todayShift.hours})`;
              iconText = '⏳';
            } else if (todayShift.type === 'vacation') {
              statusBadge = 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300';
              statusText = 'В отпуске 🌴';
              iconText = '🌴';
            } else if (todayShift.type === 'sick') {
              statusBadge = 'bg-red-500/15 border-red-500/30 text-red-300';
              statusText = 'Больничный 🤒';
              iconText = '🤒';
            } else if (todayShift.type === 'dayoff') {
              statusBadge = 'bg-teal-500/15 border-teal-500/30 text-teal-300';
              statusText = 'Отгул ☕';
              iconText = '☕';
            } else if (todayShift.type === 'trip') {
              statusBadge = 'bg-orange-500/15 border-orange-500/30 text-orange-300';
              statusText = 'Командировка 💼';
              iconText = '💼';
            } else if (todayShift.type === 'study') {
              statusBadge = 'bg-pink-500/15 border-pink-500/30 text-pink-300';
              statusText = 'Обучение 🎓';
              iconText = '🎓';
            } else if (todayShift.type === 'remote') {
              statusBadge = 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300';
              statusText = 'Удаленка 💻';
              iconText = '💻';
            } else {
              statusBadge = 'bg-[#17344F]/60 border-white/5 text-slate-400';
              statusText = 'Выходной';
              iconText = '🏠';
            }

            return (
              <div 
                key={`today-status-${emp.id}`} 
                className="p-3.5 rounded-2xl border border-white/5 bg-[#17344F]/30 flex items-center gap-3 shadow-inner hover:border-white/10 transition-colors"
              >
                <div className="text-xl shrink-0 bg-[#1E4468] p-2 rounded-xl border border-white/5 shadow-md">
                  {iconText}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <h5 className="font-sans font-bold text-white text-xs truncate leading-snug">{emp.name}</h5>
                  <span className="block text-[9px] text-slate-400 font-sans truncate">{emp.role}</span>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] border font-sans mt-1 ${statusBadge}`}>
                    {statusText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Gantt Timeline Container (Monthly view scrolling) */}
      <div className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-[#17344F]/40 shadow-xl overflow-x-auto" id="gantt-chart-viewport">
        <div className="min-w-[1250px] space-y-4">
          
          {/* Gantt Header Columns with dynamic date columns (Requirement 7) */}
          <div 
            className="grid gap-1.5 pb-2.5 border-b border-white/5 text-center text-[10px] font-bold text-slate-400 font-mono"
            style={{ gridTemplateColumns: `repeat(${8 + daysInMonth.length}, minmax(0, 1fr))` }}
          >
            <div className="col-span-6 text-left pl-2 font-sans font-bold text-xs">Сотрудник / Статистика</div>
            {daysInMonth.map(day => {
              const isTodayMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
              const isTodayDay = isTodayMonth && today.getDate() === day;
              return (
                <div 
                  key={day} 
                  className={`col-span-1 py-1 rounded font-bold transition-all text-center ${
                    isTodayDay 
                      ? 'bg-amber-400/25 text-amber-200 border-2 border-amber-400 ring-2 ring-amber-400/20 font-extrabold shadow-[0_0_10px_rgba(244,238,142,0.35)] scale-105' 
                      : 'bg-[#17344F]/30 border border-white/5'
                  }`} 
                  title={isTodayDay ? `Сегодня, ${day} ${monthNamesRu[currentMonth]}` : `День ${day}`}
                >
                  {day}
                </div>
              );
            })}
            <div className="col-span-2 text-right pr-2 font-sans">Итого</div>
          </div>

          {/* Gantt Rows per Employee */}
          <div className="space-y-3 pt-1">
            {schedules.map(emp => {
              // Calculate total active shift hours for summary
              const totalHours = emp.shifts.reduce((sum, s) => {
                if (s.type === 'day') return sum + 9;
                if (s.type === 'night') return sum + 10;
                if (s.type === 'daily') return sum + 24;
                return sum;
              }, 0);

              // Calculate worked days, latenesses, and absences based on dynamic reports
              const stats = getEmployeeStats(emp);

              // Check if this row belongs to currentUser if employee-mode
              const isOwnRow = !isManager && currentUser?.name === emp.name;
              
              return (
                <div 
                  key={emp.id} 
                  className={`grid gap-1.5 items-center p-2 rounded-2xl border transition-all ${
                    isOwnRow 
                      ? 'bg-[#1E4468]/60 border-amber-300/30 shadow-md ring-1 ring-amber-300/15' 
                      : 'bg-[#17344F]/10 border-white/5 hover:bg-[#17344F]/30'
                  }`}
                  style={{ gridTemplateColumns: `repeat(${8 + daysInMonth.length}, minmax(0, 1fr))` }}
                >
                  {/* Column 1: Employee Info & real worked/late/absence statistics (Requirement 7) */}
                  <div className="col-span-6 pl-2 flex items-center justify-between gap-1.5 overflow-hidden">
                    <div className="truncate pr-1">
                      <h5 className="text-[11px] font-bold text-white flex items-center gap-1 font-sans truncate">
                        {emp.name}
                        {isOwnRow && <span className="text-[8px] bg-amber-400/20 text-amber-200 px-1 rounded font-normal font-sans">Вы</span>}
                      </h5>
                      <span className="text-[9px] text-slate-400 font-sans truncate block">{emp.role}</span>
                      
                      {/* Attendance Stats Summary Badge (Requirement 7) */}
                      <div className="flex gap-2 text-[8px] font-mono mt-1 pt-0.5 border-t border-white/5">
                        <span className="text-emerald-400" title="Отработанные смены">🟢 {stats.worked}д</span>
                        <span className="text-amber-300" title="Опоздания">⚠️ {stats.lateness}оп</span>
                        <span className="text-red-400" title="Пропущенные смены">🔴 {stats.absence}пр</span>
                      </div>
                    </div>

                    {isManager && (
                      <button
                        onClick={() => handleOpenConfig(emp)}
                        className="p-1 rounded-lg bg-[#1E4468]/80 hover:bg-[#E7C768] hover:text-slate-900 border border-white/10 transition-all cursor-pointer text-slate-300 flex-shrink-0"
                        title="Настроить индивидуальное время смен"
                      >
                        <Settings size={12} />
                      </button>
                    )}
                  </div>

                  {/* Columns 2 to N: Timeline Days with Attendance statuses (Requirement 7) */}
                  {daysInMonth.map(day => {
                    const shift = emp.shifts.find(s => s.day === day) || { type: 'weekend' as const, hours: 'Выходной' };
                    const attendance = getDayAttendance(emp.name, day);
                    
                    // Style matching based on schedule and attendance logs
                    let barColor = 'bg-[#17344F]/40 text-slate-500 border-white/5';
                    let label = 'Вых';
                    
                    if (shift.type === 'day') {
                      barColor = 'bg-emerald-500 text-slate-950 border-emerald-400/10 font-bold';
                      label = '☀️';
                    } else if (shift.type === 'night') {
                      barColor = 'bg-amber-400 text-slate-950 border-amber-300/10 font-bold';
                      label = '🌙';
                    } else if (shift.type === 'daily') {
                      barColor = 'bg-violet-600 text-white border-violet-400/10 font-bold';
                      label = '24';
                    } else if (shift.type === 'vacation') {
                      barColor = 'bg-indigo-500 text-white border-indigo-400/10';
                      label = 'Отп';
                    } else if (shift.type === 'sick') {
                      barColor = 'bg-red-500 text-white border-red-400/10';
                      label = 'Блн';
                    } else if (shift.type === 'dayoff') {
                      barColor = 'bg-teal-500 text-white border-teal-400/10';
                      label = 'Отг';
                    } else if (shift.type === 'trip') {
                      barColor = 'bg-orange-500 text-white border-orange-400/10';
                      label = 'Ком';
                    } else if (shift.type === 'study') {
                      barColor = 'bg-pink-500 text-white border-pink-400/10';
                      label = 'Учб';
                    } else if (shift.type === 'remote') {
                      barColor = 'bg-cyan-500 text-slate-950 border-cyan-400/10';
                      label = 'Удл';
                    }

                    // Requirement 7: Absences are highlighted in red, lateness with an alarm, worked with a check
                    if (attendance === 'absence' && (shift.type === 'day' || shift.type === 'night' || shift.type === 'daily')) {
                      barColor = 'bg-red-500/15 border-red-500/40 text-red-400 font-extrabold';
                      label = '❌';
                    } else if (attendance === 'lateness') {
                      barColor = 'bg-amber-400/90 border-amber-300/40 text-slate-950 font-black';
                      label = '⚠️';
                    } else if (attendance === 'worked') {
                      // Add a green indicator visual border on top of standard workday color
                      barColor = barColor.replace('border-emerald-400/10', 'border-emerald-400') + ' ring-1 ring-emerald-300/40';
                    }

                    const isTodayMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
                    const isTodayDay = isTodayMonth && today.getDate() === day;
                    const isEditingThis = activeCellEdit?.empId === emp.id && activeCellEdit?.day === day;

                    return (
                      <div key={day} className={`col-span-1 relative ${isTodayDay ? 'ring-2 ring-amber-400/80 rounded' : ''}`}>
                        <div 
                          onClick={() => {
                            if (isManager) {
                              setActiveCellEdit(isEditingThis ? null : { empId: emp.id, day: day });
                            }
                          }}
                          className={`py-1.5 rounded text-[8px] text-center border font-mono select-none transition-all ${barColor} ${
                            isTodayDay ? 'border-amber-400 font-extrabold shadow-[0_0_5px_rgba(244,238,142,0.2)]' : ''
                          } ${
                            isManager ? 'hover:scale-110 hover:border-amber-400 cursor-pointer' : 'cursor-default'
                          }`}
                          title={`${emp.name}, День ${day}${isTodayDay ? ' (Сегодня)' : ''}: ${shift.hours}`}
                        >
                          {label}
                        </div>

                        {/* Inline editor popup for managers */}
                        {isEditingThis && isManager && (
                          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-300/30 p-2.5 rounded-xl z-50 shadow-2xl w-44 space-y-1.5 text-[9px] animate-fade-in font-sans">
                            <div className="flex justify-between items-center pb-1 border-b border-white/5">
                              <span className="font-bold text-slate-200">Смена на {day} число:</span>
                              <button onClick={() => setActiveCellEdit(null)} className="text-slate-400 hover:text-white">✕</button>
                            </div>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, day, 'day')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-emerald-300 flex justify-between"
                            >
                              <span>☀️ Дневная</span>
                              <span className="font-mono text-[8px]">{emp.shiftConfig.dayHours}</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, day, 'night')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-amber-300 flex justify-between"
                            >
                              <span>🌙 Ночная</span>
                              <span className="font-mono text-[8px]">{emp.shiftConfig.nightHours}</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, day, 'daily')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-violet-300 flex justify-between"
                            >
                              <span>⏳ Суточная 24ч</span>
                              <span className="font-mono text-[8px]">{emp.shiftConfig.dailyHours}</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, day, 'weekend')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-slate-300 flex justify-between"
                            >
                              <span>☕ Выходной</span>
                              <span>Вых</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, day, 'vacation')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-indigo-300 flex justify-between"
                            >
                              <span>🌴 Отпуск</span>
                              <span>Отп</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, day, 'sick')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-red-300 flex justify-between"
                            >
                              <span>🤒 Больничный</span>
                              <span>Блн</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, day, 'dayoff')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-teal-300 flex justify-between"
                            >
                              <span>☕ Отгул</span>
                              <span>Отг</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, day, 'trip')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-orange-300 flex justify-between"
                            >
                              <span>💼 Командировка</span>
                              <span>Ком</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, day, 'study')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-pink-300 flex justify-between"
                            >
                              <span>🎓 Обучение</span>
                              <span>Учб</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, day, 'remote')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-[#22D3EE] flex justify-between"
                            >
                              <span>💻 Удаленка</span>
                              <span>Удл</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Column 32: Total Summary */}
                  <div className="col-span-2 text-right pr-2 text-[10px] font-mono font-bold text-[#E7C768]">
                    {totalHours} ч.
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* INDIVIDUAL EMPLOYEE SHIFT TIMES EDITOR PANEL */}
      {editingConfigEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" id="shift-config-modal">
          <div className="relative w-full max-w-lg border border-[#E7C768]/20 bg-gradient-to-b from-[#17344F] to-[#1E4468] rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-y-auto max-h-[90vh] font-sans">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 to-white/5" />
            
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#F4EE8E]">Настройка времени смен по сотруднику</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Укажите индивидуальные интервалы для {editingConfigEmp.name}</p>
              </div>
              <button 
                onClick={() => setEditingConfigEmp(null)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">☀️ Дневная смена *</label>
                <input 
                  type="text"
                  required
                  value={tempDayHours}
                  onChange={(e) => setTempDayHours(e.target.value)}
                  placeholder="Например: 09:00 - 18:00"
                  className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">🌙 Ночная смена *</label>
                <input 
                  type="text"
                  required
                  value={tempNightHours}
                  onChange={(e) => setTempNightHours(e.target.value)}
                  placeholder="Например: 22:00 - 08:00"
                  className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">⏳ Суточная смена (24 часа) *</label>
                <input 
                  type="text"
                  required
                  value={tempDailyHours}
                  onChange={(e) => setTempDailyHours(e.target.value)}
                  placeholder="Например: 08:00 - 08:00 (след. день)"
                  className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
                />
              </div>

              {/* REMINDERS SECTION */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-[#F4EE8E] uppercase tracking-wider">Напоминания о графике</h5>
                    <p className="text-[9px] text-slate-400">Автоматическая рассылка уведомлений сотруднику</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={reminderEnabled} 
                      onChange={(e) => setReminderEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#F4EE8E] peer-checked:to-[#D99E41]"></div>
                  </label>
                </div>

                {reminderEnabled && (
                  <div className="space-y-3 p-3 rounded-2xl bg-white/5 border border-white/5 animate-fade-in text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-300 mb-1">Когда отправлять</label>
                        <select
                          value={reminderTimeType}
                          onChange={(e) => setReminderTimeType(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#17344F] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#E7C768]"
                        >
                          <option value="before_shift">За время до начала</option>
                          <option value="at_start">В момент начала</option>
                          <option value="before_end">За время до конца</option>
                          <option value="custom_time">В точное время</option>
                        </select>
                      </div>

                      {reminderTimeType === 'before_shift' || reminderTimeType === 'before_end' ? (
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-300 mb-1">Интервал</label>
                          <select
                            value={reminderTimeValue}
                            onChange={(e) => setReminderTimeValue(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#17344F] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#E7C768]"
                          >
                            <option value="15">15 минут</option>
                            <option value="30">30 минут</option>
                            <option value="60">1 час</option>
                            <option value="120">2 часа</option>
                            <option value="1440">Сутки (24 часа)</option>
                          </select>
                        </div>
                      ) : reminderTimeType === 'custom_time' ? (
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-slate-300 mb-1">Время (ЧЧ:ММ)</label>
                          <input
                            type="text"
                            value={reminderTimeValue}
                            onChange={(e) => setReminderTimeValue(e.target.value)}
                            placeholder="09:00"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#17344F] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#E7C768]"
                          />
                        </div>
                      ) : (
                        <div className="opacity-40">
                          <label className="block text-[9px] uppercase font-bold text-slate-300 mb-1">Интервал</label>
                          <input type="text" disabled value="Сразу" className="w-full px-2.5 py-1.5 rounded-lg bg-[#17344F] border border-white/10 text-white text-[11px]" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-300 mb-1">Куда отправлять (Канал)</label>
                      <select
                        value={reminderChannel}
                        onChange={(e) => setReminderChannel(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#17344F] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#E7C768]"
                      >
                        <option value="telegram">Telegram Бот / Группа (Рекомендуется)</option>
                        <option value="email">Электронная почта (Email)</option>
                        <option value="push">Всплывающее Push-уведомление</option>
                        <option value="all">Все доступные каналы</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-300 mb-1">Текст сообщения</label>
                      <textarea
                        rows={2}
                        value={reminderText}
                        onChange={(e) => setReminderText(e.target.value)}
                        placeholder="Текст уведомления..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#17344F] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#E7C768] resize-none font-sans"
                      />
                      <span className="text-[8px] text-slate-400 block mt-0.5">Доступные теги: {"{name}"} (имя), {"{shift_type}"} (смена), {"{shift_hours}"} (часы)</span>
                    </div>

                    {/* Live Preview Card */}
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-[#E7C768]/10 space-y-1">
                      <span className="text-[8px] font-bold text-[#E7C768] uppercase font-mono tracking-widest block">Предпросмотр уведомления ({reminderChannel === 'telegram' ? 'Telegram' : reminderChannel === 'email' ? 'Email' : 'Push'}):</span>
                      <p className="text-[10px] text-slate-200 font-sans italic leading-tight">
                        {reminderText
                          .replace('{name}', editingConfigEmp.name)
                          .replace('{shift_type}', 'Дневная')
                          .replace('{shift_hours}', tempDayHours || '09:00 - 18:00')
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingConfigEmp(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save size={13} />
                Сохранить время смен
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK TEMPLATES ASSIGNMENT FOR LEADERS (TEMPLATE-FIRST - Requirement 8) */}
      {isManager && (
        <div className="p-5 rounded-3xl border border-white/5 bg-[#17344F]/30 space-y-4 font-sans">
          <div className="flex items-center gap-1.5">
            <Sliders size={14} className="text-[#E7C768]" />
            <h4 className="text-xs font-bold text-[#F4EE8E] uppercase tracking-wider">
              Быстрое назначение графиков (Шаблон ➔ Выбор сотрудника):
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Сначала кликните по одному из шаблонов графиков работы ниже, а затем выберите сотрудника для назначения:
          </p>

          {/* Grid of Templates (Requirement 8) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: '5/2', title: '☀️ Пятидневка (5/2)', desc: 'Пять рабочих дней днем (09:00 - 18:00), выходные сб/вс' },
              { key: '2/2', title: '☀️ Два через два (2/2)', desc: 'Два рабочих дня днем (10:00 - 19:00), два выходных' },
              { key: '1/3', title: '⏳ Сутки трое (1/3)', desc: 'Суточная смена 24 часа, трое суток отдыха' },
              { key: 'nights', title: '🌙 Ночные смены 2/2', desc: 'Две ночных смены (22:00 - 08:00), два выходных' }
            ].map(tmpl => {
              const isSelected = selectedAssignTemplate === tmpl.key;
              return (
                <button
                  key={tmpl.key}
                  type="button"
                  onClick={() => setSelectedAssignTemplate(isSelected ? null : tmpl.key as any)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#E7C768]/15 border-[#E7C768] shadow-lg ring-1 ring-[#E7C768]/30' 
                      : 'bg-[#17344F]/50 border-white/5 hover:border-[#E7C768]/30 hover:bg-[#17344F]/80'
                  }`}
                >
                  <span className={`text-[11px] font-bold block ${isSelected ? 'text-amber-200' : 'text-white'}`}>
                    {tmpl.title}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-1 block leading-normal">{tmpl.desc}</span>
                  {isSelected && (
                    <span className="text-[8px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider mt-2.5 inline-block">
                      выбран
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Employee list picker for the selected template (Requirement 8) */}
          {selectedAssignTemplate && (
            <div className="p-4 rounded-2xl bg-[#1E4468]/30 border border-[#E7C768]/20 animate-fade-in space-y-3">
              <span className="text-[10px] font-bold text-amber-200 block uppercase tracking-wider">
                👉 Шаг 2: Кликните по сотруднику, чтобы применить шаблон &quot;
                {selectedAssignTemplate === '5/2' && 'Пятидневка 5/2'}
                {selectedAssignTemplate === '2/2' && 'Два через два 2/2'}
                {selectedAssignTemplate === '1/3' && 'Сутки через трое 1/3'}
                {selectedAssignTemplate === 'nights' && 'Ночные смены 2/2'}
                &quot;:
              </span>
              <div className="flex flex-wrap gap-2">
                {schedules.map(emp => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      handleApplyTemplate(emp.id, selectedAssignTemplate);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#17344F]/80 hover:bg-[#E7C768] hover:text-slate-900 text-slate-200 text-xs font-semibold border border-white/5 hover:border-transparent transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus size={12} />
                    <span>{emp.name}</span>
                    <span className="text-[9px] opacity-60 font-mono font-normal">({emp.role})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
