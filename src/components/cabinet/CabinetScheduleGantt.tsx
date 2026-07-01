import React, { useState } from 'react';
import { Clock, Calendar, Sparkles, Check, ChevronLeft, ChevronRight, RefreshCw, UserPlus, Sliders } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';

interface CabinetScheduleGanttProps {
  currentUser: UserProfile | null;
  mockEmployees: UserProfile[];
}

interface EmployeeSchedule {
  id: string;
  name: string;
  role: string;
  shifts: {
    day: number; // 1-7 (Mon-Sun)
    type: 'day' | 'night' | 'weekend' | 'vacation';
    hours: string;
  }[];
}

export default function CabinetScheduleGantt({
  currentUser,
  mockEmployees
}: CabinetScheduleGanttProps) {
  const isManager = currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.MANAGER || currentUser?.role === UserRole.ADMIN;

  const daysOfWeek = [
    { num: 1, name: 'Пн', label: 'Понедельник' },
    { num: 2, name: 'Вт', label: 'Вторник' },
    { num: 3, name: 'Ср', label: 'Среда' },
    { num: 4, name: 'Чт', label: 'Четверг' },
    { num: 5, name: 'Пт', label: 'Пятница' },
    { num: 6, name: 'Сб', label: 'Суббота' },
    { num: 7, name: 'Вс', label: 'Воскресенье' },
  ];

  // Initial Gantt Schedule State
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([
    {
      id: 'emp-1',
      name: 'Иван Смирнов',
      role: 'Разработчик',
      shifts: [
        { day: 1, type: 'day', hours: '09:00 - 18:00' },
        { day: 2, type: 'day', hours: '09:00 - 18:00' },
        { day: 3, type: 'day', hours: '09:00 - 18:00' },
        { day: 4, type: 'day', hours: '09:00 - 18:00' },
        { day: 5, type: 'day', hours: '09:00 - 18:00' },
        { day: 6, type: 'weekend', hours: 'Выходной' },
        { day: 7, type: 'weekend', hours: 'Выходной' },
      ]
    },
    {
      id: 'emp-2',
      name: 'Анна Петрова',
      role: 'Маркетолог',
      shifts: [
        { day: 1, type: 'day', hours: '10:00 - 19:00' },
        { day: 2, type: 'day', hours: '10:00 - 19:00' },
        { day: 3, type: 'weekend', hours: 'Выходной' },
        { day: 4, type: 'weekend', hours: 'Выходной' },
        { day: 5, type: 'day', hours: '10:00 - 19:00' },
        { day: 6, type: 'day', hours: '10:00 - 19:00' },
        { day: 7, type: 'weekend', hours: 'Выходной' },
      ]
    },
    {
      id: 'emp-3',
      name: 'Сергей Федоров',
      role: 'Менеджер по продажам',
      shifts: [
        { day: 1, type: 'night', hours: '20:00 - 06:00' },
        { day: 2, type: 'night', hours: '20:00 - 06:00' },
        { day: 3, type: 'weekend', hours: 'Выходной' },
        { day: 4, type: 'day', hours: '09:00 - 18:00' },
        { day: 5, type: 'day', hours: '09:00 - 18:00' },
        { day: 6, type: 'weekend', hours: 'Выходной' },
        { day: 7, type: 'weekend', hours: 'Выходной' },
      ]
    },
    {
      id: 'emp-4',
      name: 'Мария Сидорова',
      role: 'Контент-мейкер',
      shifts: [
        { day: 1, type: 'vacation', hours: 'Отпуск' },
        { day: 2, type: 'vacation', hours: 'Отпуск' },
        { day: 3, type: 'vacation', hours: 'Отпуск' },
        { day: 4, type: 'vacation', hours: 'Отпуск' },
        { day: 5, type: 'vacation', hours: 'Отпуск' },
        { day: 6, type: 'weekend', hours: 'Выходной' },
        { day: 7, type: 'weekend', hours: 'Выходной' },
      ]
    }
  ]);

  const [activeCellEdit, setActiveCellEdit] = useState<{ empId: string; day: number } | null>(null);

  // Template autofill logic
  const handleApplyTemplate = (empId: string, templateType: '5/2' | '2/2' | '6/1' | 'nights') => {
    let newShifts: { day: number; type: 'day' | 'night' | 'weekend' | 'vacation'; hours: string }[] = [];

    if (templateType === '5/2') {
      newShifts = [
        { day: 1, type: 'day', hours: '09:00 - 18:00' },
        { day: 2, type: 'day', hours: '09:00 - 18:00' },
        { day: 3, type: 'day', hours: '09:00 - 18:00' },
        { day: 4, type: 'day', hours: '09:00 - 18:00' },
        { day: 5, type: 'day', hours: '09:00 - 18:00' },
        { day: 6, type: 'weekend', hours: 'Выходной' },
        { day: 7, type: 'weekend', hours: 'Выходной' },
      ];
    } else if (templateType === '2/2') {
      newShifts = [
        { day: 1, type: 'day', hours: '08:00 - 20:00' },
        { day: 2, type: 'day', hours: '08:00 - 20:00' },
        { day: 3, type: 'weekend', hours: 'Выходной' },
        { day: 4, type: 'weekend', hours: 'Выходной' },
        { day: 5, type: 'day', hours: '08:00 - 20:00' },
        { day: 6, type: 'day', hours: '08:00 - 20:00' },
        { day: 7, type: 'weekend', hours: 'Выходной' },
      ];
    } else if (templateType === '6/1') {
      newShifts = [
        { day: 1, type: 'day', hours: '09:00 - 17:00' },
        { day: 2, type: 'day', hours: '09:00 - 17:00' },
        { day: 3, type: 'day', hours: '09:00 - 17:00' },
        { day: 4, type: 'day', hours: '09:00 - 17:00' },
        { day: 5, type: 'day', hours: '09:00 - 17:00' },
        { day: 6, type: 'day', hours: '09:00 - 17:00' },
        { day: 7, type: 'weekend', hours: 'Выходной' },
      ];
    } else if (templateType === 'nights') {
      newShifts = [
        { day: 1, type: 'night', hours: '22:00 - 08:00' },
        { day: 2, type: 'night', hours: '22:00 - 08:00' },
        { day: 3, type: 'weekend', hours: 'Выходной' },
        { day: 4, type: 'weekend', hours: 'Выходной' },
        { day: 5, type: 'night', hours: '22:00 - 08:00' },
        { day: 6, type: 'night', hours: '22:00 - 08:00' },
        { day: 7, type: 'weekend', hours: 'Выходной' },
      ];
    }

    setSchedules(prev => prev.map(s => s.id === empId ? { ...s, shifts: newShifts } : s));
  };

  // Modify single day cell
  const handleUpdateCell = (empId: string, day: number, type: 'day' | 'night' | 'weekend' | 'vacation', hours: string) => {
    setSchedules(prev => prev.map(s => {
      if (s.id !== empId) return s;
      const nextShifts = s.shifts.map(sh => sh.day === day ? { ...sh, type, hours } : sh);
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
            <span>Календарь Ганта (График смен)</span>
          </h3>
          <p className="text-xs text-slate-400">
            {isManager 
              ? 'Контролируйте смены сотрудников, распределяйте отпуска и настраивайте таймлайны в реальном времени.'
              : 'Ваше актуальное расписание рабочих смен, выходных и праздников, согласованное ИИ и руководством.'
            }
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] text-slate-300 bg-[#17344F]/50 p-2 rounded-xl border border-white/5 font-sans">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Дневная (09:00-18:00)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400"></span> Ночная (22:00-08:00)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-600"></span> Выходной</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Отпуск</span>
        </div>
      </div>

      {/* Main Gantt Timeline Container */}
      <div className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-[#17344F]/40 shadow-xl overflow-x-auto" id="gantt-chart-viewport">
        <div className="min-w-[800px] space-y-4">
          
          {/* Gantt Header Columns */}
          <div className="grid grid-cols-12 gap-2 pb-2.5 border-b border-white/5 text-center text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
            <div className="col-span-3 text-left pl-2">Сотрудник / Должность</div>
            {daysOfWeek.map(d => (
              <div key={d.num} className="col-span-1" title={d.label}>
                {d.name}
              </div>
            ))}
            <div className="col-span-2 text-right pr-2">Итого часов</div>
          </div>

          {/* Gantt Rows per Employee */}
          <div className="space-y-3 pt-2">
            {schedules.map(emp => {
              // Calculate total active shift hours for summary
              const totalHours = emp.shifts.reduce((sum, s) => {
                if (s.type === 'day') return sum + 9;
                if (s.type === 'night') return sum + 10;
                return sum;
              }, 0);

              // Check if this row belongs to currentUser if employee-mode
              const isOwnRow = !isManager && currentUser?.name === emp.name;
              
              // Skip others if employee mode and only want to highlight self, or let employee see colleagues too
              return (
                <div 
                  key={emp.id} 
                  className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl border transition-all ${
                    isOwnRow 
                      ? 'bg-[#1E4468]/60 border-amber-300/30 shadow-md ring-1 ring-amber-300/15' 
                      : 'bg-[#17344F]/20 border-white/5 hover:bg-[#17344F]/40'
                  }`}
                >
                  {/* Column 1: Info */}
                  <div className="col-span-3 pl-2">
                    <h5 className="text-xs font-bold text-white flex items-center gap-1 font-sans">
                      {emp.name}
                      {isOwnRow && <span className="text-[8px] bg-amber-400/20 text-amber-200 px-1 rounded">Вы</span>}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-sans">{emp.role}</span>
                  </div>

                  {/* Columns 2-8: Timeline Days */}
                  {daysOfWeek.map(d => {
                    const shift = emp.shifts.find(s => s.day === d.num) || { type: 'weekend', hours: 'Выходной' };
                    
                    // Style matching
                    let barColor = 'bg-slate-600/60 text-slate-300 border-slate-500/10';
                    if (shift.type === 'day') barColor = 'bg-emerald-500 text-slate-900 border-emerald-400/20 font-bold';
                    else if (shift.type === 'night') barColor = 'bg-amber-400 text-slate-900 border-amber-300/20 font-bold';
                    else if (shift.type === 'vacation') barColor = 'bg-indigo-500 text-white border-indigo-400/20';

                    const isEditingThis = activeCellEdit?.empId === emp.id && activeCellEdit?.day === d.num;

                    return (
                      <div key={d.num} className="col-span-1 relative">
                        <div 
                          onClick={() => {
                            if (isManager) {
                              setActiveCellEdit(isEditingThis ? null : { empId: emp.id, day: d.num });
                            }
                          }}
                          className={`py-2 px-1 rounded-xl text-[9px] text-center border font-sans truncate transition-all cursor-pointer select-none ${barColor} ${
                            isManager ? 'hover:scale-105 active:scale-95' : 'cursor-default'
                          }`}
                          title={`${emp.name}, ${d.label}: ${shift.hours}`}
                        >
                          {shift.type === 'day' ? '9-18' : shift.type === 'night' ? '22-08' : shift.type === 'vacation' ? 'Отпуск' : 'Вых'}
                        </div>

                        {/* Inline editor popup for managers */}
                        {isEditingThis && isManager && (
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-300/30 p-3 rounded-xl z-50 shadow-2xl w-44 space-y-2 text-[10px] animate-fade-in font-sans">
                            <span className="block font-bold text-slate-200 pb-1 border-b border-white/5">Изменить смену:</span>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, d.num, 'day', '09:00 - 18:00')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-emerald-300 flex justify-between"
                            >
                              <span>☀️ Дневная</span>
                              <span>9:00</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, d.num, 'night', '22:00 - 08:00')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-amber-300 flex justify-between"
                            >
                              <span>🌙 Ночная</span>
                              <span>22:00</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, d.num, 'weekend', 'Выходной')}
                              className="w-full text-left py-1 px-1.5 rounded hover:bg-[#1E4468] text-slate-300 flex justify-between"
                            >
                              <span>☕ Выходной</span>
                              <span>Вых</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateCell(emp.id, d.num, 'vacation', 'Отпуск')}
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

                  {/* Column 9: Total Summary */}
                  <div className="col-span-2 text-right pr-2 text-xs font-mono font-bold text-[#E7C768]">
                    {totalHours} ч.
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* QUICK TEMPLATES ASSIGNMENT FOR LEADERS */}
      {isManager && (
        <div className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/30 space-y-3">
          <h4 className="text-xs font-bold text-[#F4EE8E] uppercase tracking-wider flex items-center gap-1 font-sans">
            <Sliders size={13} />
            Панель быстрой разметки сотрудников:
          </h4>
          <p className="text-[11px] text-slate-400">Выберите сотрудника ниже и примените автоматический недельный шаблон одним кликом:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            {schedules.map(emp => (
              <div key={emp.id} className="p-3 rounded-xl border border-white/5 bg-[#17344F]/50 flex flex-col justify-between gap-2.5 font-sans">
                <div>
                  <span className="text-[10px] font-bold text-white block">{emp.name}</span>
                  <span className="text-[8px] text-slate-400 block">{emp.role}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9px] font-bold">
                  <button 
                    onClick={() => handleApplyTemplate(emp.id, '5/2')}
                    className="py-1 rounded bg-[#1E4468]/60 text-slate-300 hover:text-white border border-white/5 cursor-pointer"
                  >
                    5/2 (Дн)
                  </button>
                  <button 
                    onClick={() => handleApplyTemplate(emp.id, '2/2')}
                    className="py-1 rounded bg-[#1E4468]/60 text-slate-300 hover:text-white border border-white/5 cursor-pointer"
                  >
                    2/2 (Дн)
                  </button>
                  <button 
                    onClick={() => handleApplyTemplate(emp.id, '6/1')}
                    className="py-1 rounded bg-[#1E4468]/60 text-slate-300 hover:text-white border border-white/5 cursor-pointer"
                  >
                    6/1 (Дн)
                  </button>
                  <button 
                    onClick={() => handleApplyTemplate(emp.id, 'nights')}
                    className="py-1 rounded bg-[#1E4468]/60 text-slate-300 hover:text-white border border-white/5 cursor-pointer"
                  >
                    Ночной
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
