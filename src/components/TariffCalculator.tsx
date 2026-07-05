import React, { useState } from 'react';
import { Sparkles, Calendar, Users, Coins, Clock, TrendingUp, ArrowRight } from 'lucide-react';

interface TariffCalculatorProps {
  onAction?: (employees: number, months: number, totalCost: number) => void;
  actionButtonText?: string;
  className?: string;
  initialEmployees?: number;
}

export default function TariffCalculator({
  onAction,
  actionButtonText = 'Купить подписку',
  className = '',
  initialEmployees = 15
}: TariffCalculatorProps) {
  const [employees, setEmployees] = useState<number>(initialEmployees);
  const [months, setMonths] = useState<number>(1);
  const [managerHourlyRate, setManagerHourlyRate] = useState<number>(1500);
  const [hoursSpentManual, setHoursSpentManual] = useState<number>(1.5);

  const pricePerEmployee = 290;
  
  // Calculate discount percentage based on selected duration
  let discountPercent = 0;
  if (months === 3) discountPercent = 10;
  else if (months === 6) discountPercent = 20;
  else if (months === 12) discountPercent = 30;

  // Pricing calculations
  const baseMonthlyPrice = employees * pricePerEmployee;
  const discountedMonthlyPrice = Math.round(baseMonthlyPrice * (1 - discountPercent / 100));
  const totalPeriodCost = discountedMonthlyPrice * months;
  const basePeriodCost = baseMonthlyPrice * months;

  // ROI calculations
  const hoursSavedPerMonth = Math.max(1, Math.round((hoursSpentManual - 0.1) * employees * 4.3));
  const budgetSavedPerMonth = Math.round(hoursSavedPerMonth * managerHourlyRate);
  const netSavingPerMonth = budgetSavedPerMonth - discountedMonthlyPrice;
  const roiPercent = discountedMonthlyPrice > 0 ? Math.round((netSavingPerMonth / discountedMonthlyPrice) * 100) : 0;

  const durations = [
    { value: 1, label: '1 месяц', discount: 0 },
    { value: 3, label: '3 мес (-10%)', discount: 10 },
    { value: 6, label: '6 мес (-20%)', discount: 20 },
    { value: 12, label: '12 мес (-30%)', discount: 30 },
  ];

  return (
    <div 
      className={`w-full bg-[#17344F]/35 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-8 space-y-6 text-left ${className}`} 
      id="unified-tariff-calculator"
    >
      {/* Title block */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[#F4EE8E] text-[10px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
          Интеллектуальный расчет окупаемости
        </div>
        <h4 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          ИИ-Калькулятор выгоды и окупаемости (ROI)
        </h4>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
          Рассчитайте точную выгоду от автоматизации сбора отчетов, саммаризации и авто-KPI для вашей команды.
        </p>
      </div>

      {/* Main Grid: Left Column for Inputs, Right Column for Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: Inputs (sliders and duration selector) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Period selector */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                <Calendar size={15} className="text-[#E7C768]" />
                Период подписки (длительность):
              </span>
              {discountPercent > 0 && (
                <span className="text-[10px] font-bold text-[#F4EE8E] bg-amber-500/20 px-2 py-0.5 rounded-md font-mono">
                  Скидка -{discountPercent}%
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {durations.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setMonths(d.value)}
                  className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${
                    months === d.value
                      ? 'bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] border-[#F4EE8E] text-slate-900 shadow-lg shadow-amber-500/10 scale-[1.02]'
                      : 'bg-[#1E4468]/30 border-white/10 text-slate-200 hover:bg-[#1E4468]/50 hover:border-white/20'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Employees slider */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                <Users size={15} className="text-[#E7C768]" />
                Количество сотрудников на контроле:
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#F4EE8E] bg-[#1E4468]/50 px-2.5 py-1 rounded-lg border border-white/5 self-start sm:self-auto shrink-0">
                {employees} чел.
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="150" 
              step="1"
              value={employees}
              onChange={(e) => setEmployees(parseInt(e.target.value) || 1)}
              className="w-full h-1.5 bg-[#1E4468]/40 rounded-lg appearance-none cursor-pointer accent-[#D99E41]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
              <span>1 сотр.</span>
              <span>75 сотр.</span>
              <span>150+ сотр.</span>
            </div>
          </div>

          {/* Hourly rate slider */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                <Coins size={15} className="text-[#E7C768]" />
                Ставка часа руководителя <span className="text-slate-400 font-normal text-[11px] ml-0.5">(необязательно)</span>:
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-200 bg-[#1E4468]/30 px-2.5 py-1 rounded-lg border border-white/5 self-start sm:self-auto shrink-0">
                {managerHourlyRate.toLocaleString('ru-RU')} ₽ / ч
              </span>
            </div>
            <input 
              type="range" 
              min="500" 
              max="5000" 
              step="100"
              value={managerHourlyRate}
              onChange={(e) => setManagerHourlyRate(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#1E4468]/40 rounded-lg appearance-none cursor-pointer accent-[#D99E41]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
              <span>500 ₽</span>
              <span>2 500 ₽</span>
              <span>5 000 ₽</span>
            </div>
          </div>

          {/* Time spent manual slider */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                <Clock size={15} className="text-[#E7C768]" />
                Время на отчеты 1 сотрудника в неделю <span className="text-slate-400 font-normal text-[11px] ml-0.5">(необязательно)</span>:
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-200 bg-[#1E4468]/30 px-2.5 py-1 rounded-lg border border-white/5 self-start sm:self-auto shrink-0">
                {hoursSpentManual} ч.
              </span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="5.0" 
              step="0.1"
              value={hoursSpentManual}
              onChange={(e) => setHoursSpentManual(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#1E4468]/40 rounded-lg appearance-none cursor-pointer accent-[#D99E41]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono px-0.5">
              <span>30 мин</span>
              <span>2.5 ч</span>
              <span>5 ч</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Results & Checkout */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Efficiency indicators */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1E4468]/20 border border-white/5 space-y-3.5">
            <h5 className="text-xs font-bold text-[#F4EE8E] flex items-center gap-1.5 tracking-wide uppercase">
              <TrendingUp size={14} />
              Расчет эффективности
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Сбережем времени</span>
                <span className="text-base sm:text-lg font-black text-[#F4EE8E] font-mono block">
                  ~{hoursSavedPerMonth} ч <span className="text-[10px] font-normal text-slate-300">/ мес</span>
                </span>
                <span className="text-[9px] text-emerald-400 font-medium block">✓ Свобода от рутины</span>
              </div>
              <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Высвобожденный бюджет</span>
                <span className="text-base sm:text-lg font-black text-emerald-400 font-mono block">
                  {budgetSavedPerMonth.toLocaleString('ru-RU')} ₽ <span className="text-[10px] font-normal text-slate-300">/ мес</span>
                </span>
                <span className="text-[9px] text-amber-200 font-medium block">✓ Окупаемость ИИ</span>
              </div>
            </div>
          </div>

          {/* Pricing calculations details */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <h5 className="text-xs font-bold text-white tracking-wide uppercase">Стоимость</h5>
            <div className="space-y-2 text-xs text-slate-200">
              <div className="flex justify-between items-start gap-4 py-1.5 border-b border-white/5">
                <span className="text-slate-300">Базовый тариф за {employees} сотр. (без скидки):</span>
                <span className="font-mono text-white text-right shrink-0">{baseMonthlyPrice.toLocaleString('ru-RU')} ₽ / мес</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between items-start gap-4 py-1.5 border-b border-white/5 text-amber-200 font-bold">
                  <span>Скидка за длительность ({discountPercent}%):</span>
                  <span className="font-mono text-right shrink-0">-{Math.round(baseMonthlyPrice * (discountPercent / 100)).toLocaleString('ru-RU')} ₽ / мес</span>
                </div>
              )}
              <div className="flex justify-between items-start gap-4 py-1.5 font-bold text-white">
                <span>Стоимость с учетом скидки:</span>
                <span className="font-mono text-[#F4EE8E] text-right shrink-0">{discountedMonthlyPrice.toLocaleString('ru-RU')} ₽ / мес</span>
              </div>
              {months > 1 && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-amber-400/5 border border-amber-400/10 font-bold text-white mt-1 gap-2">
                  <span className="text-xs">Итого к оплате за {months} мес:</span>
                  <span className="font-mono text-[#F4EE8E] text-sm sm:text-base text-right shrink-0">{totalPeriodCost.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
            </div>
          </div>

          {/* Net Saving & ROI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Net Saving */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider block">
                Чистая экономия времени и бюджета
              </span>
              <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                +{netSavingPerMonth.toLocaleString('ru-RU')} ₽ <span className="text-[10px] font-normal text-emerald-200">/ мес</span>
              </div>
              <p className="text-[10px] text-emerald-100/70 leading-normal">
                За вычетом стоимости ИИ подписки.
              </p>
            </div>

            {/* ROI */}
            <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex flex-col justify-between space-y-2">
              <span className="text-[9px] text-amber-200 font-bold uppercase tracking-wider block">
                Окупаемость ROI
              </span>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-950 font-black text-xs sm:text-sm font-mono shadow-md self-start">
                ROI {roiPercent}%
              </div>
              <p className="text-[9px] text-amber-100/70 leading-snug">
                Окупаемость вложений в первый же месяц.
              </p>
            </div>

          </div>

          {/* CTA Button */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={() => onAction && onAction(employees, months, totalPeriodCost)}
              className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-[#F4EE8E] via-[#D99E41] to-[#E7C768] text-slate-950 hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer font-sans shadow-lg shadow-amber-500/10 flex items-center justify-between gap-3 text-left shimmer-effect"
              id="tariff-calculator-purchase-btn"
            >
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm uppercase tracking-widest font-black leading-none">
                  {actionButtonText}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1.5 font-mono leading-none">
                  На {months} {months === 1 ? 'мес.' : months < 5 ? 'мес.' : 'мес.'} за {totalPeriodCost.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <ArrowRight size={16} className="shrink-0 text-slate-950 bg-white/25 p-0.5 rounded-full" />
            </button>

            <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-start gap-2.5">
              <Sparkles className="text-[#F4EE8E] shrink-0 mt-0.5" size={14} />
              <p className="text-[10px] text-slate-300 leading-normal">
                Внедрение ИИ Рапорт окупается за первую неделю использования, избавляя руководство от операционной рутины контроля.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
