import React, { useState } from 'react';
import { Clock, Calendar, Sparkles, Check, ChevronLeft, ChevronRight, RefreshCw, UserPlus, Sliders, Settings, HelpCircle, Save, X } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';

interface CabinetScheduleGanttProps {
  currentUser: UserProfile | null;
  mockEmployees: UserProfile[];
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
    day: number; // 1-30
    type: 'day' | 'night' | 'daily' | 'weekend' | 'vacation';
    hours: string; // resolved time range
  }[];
}

export default function CabinetScheduleGantt({
  currentUser,
  mockEmployees
}: CabinetScheduleGanttProps) {
  const isManager = currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.MANAGER || currentUser?.role === UserRole.ADMIN;

  // Generate 30 days grid for the month view
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  // Initial Gantt Schedule State for 30 calendar days
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([
    {
      id: 'emp-1',
      name: 'Иван Смирнов',
      role: 'Разработчик',
      shiftConfig: { dayHours: '09:00 - 18:00', nightHours: '21:00 - 07:00', dailyHours: '08:00 - 08:00' },
      shifts: daysInMonth.map(day => {
        const isWeekend = (day % 7 === 6 || day % 7 === 0);
        return {
          day,
          type: isWeekend ? 'weekend' : 'day',
          hours: isWeekend ? 'Выходной' : '09:00 - 18:00'
        };
      })
    },
    {
      id: 'emp-2',
      name: 'Анна Петрова',
      role: 'Маркетолог',
      shiftConfig: { dayHours: '10:00 - 19:00', nightHours: '22:00 - 08:00', dailyHours: '09:00 - 09:00' },
      shifts: daysInMonth.map(day => {
        const isWeekend = (day % 7 === 3 || day % 7 === 4);
        return {
          day,
          type: isWeekend ? 'weekend' : 'day',
          hours: isWeekend ? 'Выходной' : '10:00 - 19:00'
        };
      })
    },
    {
      id: 'emp-3',
      name: 'Сергей Федоров',
      role: 'Менеджер по продажам',
      shiftConfig: { dayHours: '09:00 - 18:00', nightHours: '20:00 - 06:00', dailyHours: '08:30 - 08:30' },
      shifts: daysInMonth.map(day => {
        // Alternating 24h shift every 4 days (1/3 schedule)
        const isDailyShift = (day % 4 === 1);
        return {
          day,
          type: isDailyShift ? 'daily' : 'weekend',
          hours: isDailyShift ? '08:30 - 08:30' : 'Выходной'
        };
      })
    },
    {
      id: 'emp-4',
      name: 'Мария Сидорова',
      role: 'Контент-мейкер',
      shiftConfig: { dayHours: '09:00 - 18:00', nightHours: '22:00 - 08:00', dailyHours: '10:00 - 10:00' },
      shifts: daysInMonth.map(day => {
        const isVacation = (day >= 5 && day <= 14);
        const isWeekend = (day % 7 === 6 || day % 7 === 0);
        return {
          day,
          type: isVacation ? 'vacation' : isWeekend ? 'weekend' : 'day',
          hours: isVacation ? 'Отпуск' : isWeekend ? 'Выходной' : '09:00 - 18:00'
        };
      })
    }
  ]);

  // Clicked cell for inline edit popover
  const [activeCellEdit, setActiveCellEdit] = useState<{ empId: string; day: number } | null>(null);
  
  // Selected employee for personal shift times editor panel
  const [editingConfigEmp, setEditingConfigEmp] = useState<EmployeeSchedule | null>(null);
  
  // Local form state for custom time editing
  const [tempDayHours, setTempDayHours] = useState('');
  const [tempNightHours, setTempNightHours] = useState('');
  const [tempDailyHours, setTempDailyHours] = useState('');

  // Open the personal configuration editor
  const handleOpenConfig = (emp: EmployeeSchedule) => {
    if (!isManager) return;
    setEditingConfigEmp(emp);
    setTempDayHours(emp.shiftConfig.dayHours);
    setTempNightHours(emp.shiftConfig.nightHours);
    setTempDailyHours(emp.shiftConfig.dailyHours);
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
        shifts: updatedShifts
      };
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
  const handleUpdateCell = (empId: string, day: number, type: 'day' | 'night' | 'daily' | 'weekend' | 'vacation') => {
    setSchedules(prev => prev.map(s => {
      if (s.id !== empId) return s;
      
      let resolvedHours = 'Выходной';
      if (type === 'day') resolvedHours = s.shiftConfig.dayHours;
      else if (type === 'night') resolvedHours = s.shiftConfig.nightHours;
      else if (type === 'daily') resolvedHours = s.shiftConfig.dailyHours;
      else if (type === 'vacation') resolvedHours = 'Отпуск';

      const nextShifts = s.shifts.map(sh => sh.day === day ? { ...sh, type, hours: resolvedHours } : sh);
      return { ...s, shifts: nextShifts };
    }));
    setActiveCellEdit(null);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="panel-schedules">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <Clock className="text-amber-200" size={20} />
            <span>Календарь Ганта (Сменный график за месяц)</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            {isManager 
              ? 'Контролируйте смены сотрудников, распределяйте отпуска и настраивайте личные графики и суточные дежурства.'
              : 'Ваше актуальное расписание рабочих смен, выходных и праздников, согласованное ИИ и руководством на месяц.'
            }
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[9px] text-slate-300 bg-[#17344F]/50 p-2 rounded-xl border border-white/5 font-sans">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span> Дневная (☀️)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-400"></span> Ночная (🌙)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-violet-500"></span> Суточная 24ч (⏳)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#17344F] border border-white/10"></span> Выходной</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-500"></span> Отпуск</span>
        </div>
      </div>

      {/* Main Gantt Timeline Container (Monthly view scrolling) */}
      <div className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-[#17344F]/40 shadow-xl overflow-x-auto" id="gantt-chart-viewport">
        <div className="min-w-[1250px] space-y-4">
          
          {/* Gantt Header Columns (Days 1 to 30) */}
          <div 
            className="grid gap-1.5 pb-2.5 border-b border-white/5 text-center text-[10px] font-bold text-slate-400 font-mono"
            style={{ gridTemplateColumns: 'repeat(38, minmax(0, 1fr))' }}
          >
            <div className="col-span-6 text-left pl-2 font-sans font-bold text-xs">Сотрудник / Настройки</div>
            {daysInMonth.map(day => (
              <div key={day} className="col-span-1 py-1 rounded bg-[#17344F]/30 border border-white/5" title={`День ${day}`}>
                {day}
              </div>
            ))}
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
                  style={{ gridTemplateColumns: 'repeat(38, minmax(0, 1fr))' }}
                >
                  {/* Column 1: Employee Info & settings button */}
                  <div className="col-span-6 pl-2 flex items-center justify-between gap-1.5 overflow-hidden">
                    <div className="truncate">
                      <h5 className="text-[11px] font-bold text-white flex items-center gap-1 font-sans truncate">
                        {emp.name}
                        {isOwnRow && <span className="text-[8px] bg-amber-400/20 text-amber-200 px-1 rounded font-normal font-sans">Вы</span>}
                      </h5>
                      <span className="text-[9px] text-slate-400 font-sans truncate block">{emp.role}</span>
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

                  {/* Columns 2-31: Timeline Days */}
                  {daysInMonth.map(day => {
                    const shift = emp.shifts.find(s => s.day === day) || { type: 'weekend' as const, hours: 'Выходной' };
                    
                    // Style matching
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
                    }

                    const isEditingThis = activeCellEdit?.empId === emp.id && activeCellEdit?.day === day;

                    return (
                      <div key={day} className="col-span-1 relative">
                        <div 
                          onClick={() => {
                            if (isManager) {
                              setActiveCellEdit(isEditingThis ? null : { empId: emp.id, day: day });
                            }
                          }}
                          className={`py-1.5 rounded text-[8px] text-center border font-mono select-none transition-all ${barColor} ${
                            isManager ? 'hover:scale-110 hover:border-amber-400 cursor-pointer' : 'cursor-default'
                          }`}
                          title={`${emp.name}, День ${day}: ${shift.hours}`}
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
          <div className="relative w-full max-w-md border border-[#E7C768]/20 bg-gradient-to-b from-[#17344F] to-[#1E4468] rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden font-sans">
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

      {/* QUICK TEMPLATES ASSIGNMENT FOR LEADERS (MONTH-BASED) */}
      {isManager && (
        <div className="p-5 rounded-3xl border border-white/5 bg-[#17344F]/30 space-y-3 font-sans">
          <div className="flex items-center gap-1.5">
            <Sliders size={13} className="text-[#E7C768]" />
            <h4 className="text-xs font-bold text-[#F4EE8E] uppercase tracking-wider">
              Панель быстрой разметки сотрудников на месяц:
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">Выберите сотрудника и примените готовый месячный шаблон с его личным временем смен в один клик:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {schedules.map(emp => (
              <div key={emp.id} className="p-4 rounded-2xl border border-white/5 bg-[#17344F]/50 flex flex-col justify-between gap-3 shadow-md">
                <div>
                  <span className="text-[11px] font-bold text-white block">{emp.name}</span>
                  <span className="text-[8px] text-slate-400 block font-mono">
                    Смены:☀️{emp.shiftConfig.dayHours.split(' ')[0]} | 🌙{emp.shiftConfig.nightHours.split(' ')[0]} | ⏳{emp.shiftConfig.dailyHours.split(' ')[0]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[9px] font-bold">
                  <button 
                    onClick={() => handleApplyTemplate(emp.id, '5/2')}
                    className="py-1.5 rounded-lg bg-[#1E4468] hover:bg-[#E7C768] hover:text-slate-900 text-slate-300 border border-white/5 cursor-pointer transition-all"
                    title="Пятидневка дневная с выходными по сб/вс"
                  >
                    5/2 (Дн)
                  </button>
                  <button 
                    onClick={() => handleApplyTemplate(emp.id, '2/2')}
                    className="py-1.5 rounded-lg bg-[#1E4468] hover:bg-[#E7C768] hover:text-slate-900 text-slate-300 border border-white/5 cursor-pointer transition-all"
                    title="Два через два дневная"
                  >
                    2/2 (Дн)
                  </button>
                  <button 
                    onClick={() => handleApplyTemplate(emp.id, '1/3')}
                    className="py-1.5 rounded-lg bg-[#1E4468] hover:bg-[#E7C768] hover:text-slate-900 text-slate-300 border border-white/5 cursor-pointer transition-all"
                    title="Сутки через трое (24ч смена)"
                  >
                    1/3 (Сут)
                  </button>
                  <button 
                    onClick={() => handleApplyTemplate(emp.id, 'nights')}
                    className="py-1.5 rounded-lg bg-[#1E4468] hover:bg-[#E7C768] hover:text-slate-900 text-slate-300 border border-white/5 cursor-pointer transition-all"
                    title="Два через два ночные смены"
                  >
                    2/2 (Ноч)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
