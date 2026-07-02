import React from 'react';
import { Landmark, ArrowUpRight, TrendingUp } from 'lucide-react';
import { TariffState, Transaction, UserProfile } from '../../types';

interface CabinetTariffProps {
  tariff: TariffState;
  topUpSeats: number;
  setTopUpSeats: (val: number) => void;
  handleTopUpTariff: () => void;
  setTariff: (val: TariffState) => void;
  saveStateToServer: (updated: any) => void;
  currentUser: UserProfile | null;
  setCashOutTab: (val: 'bonus' | 'refund') => void;
  setWithdrawalAmount: (val: string) => void;
  setIsCashOutModalOpen: (val: boolean) => void;
  transactions: Transaction[];
  // Organization state for save syncs
  company: any;
  departments: any;
  templates: any;
  reports: any;
  notifications: any;
  crmCompanies: any;
  mockEmployees: any;
}

export default function CabinetTariff({
  tariff,
  topUpSeats,
  setTopUpSeats,
  handleTopUpTariff,
  setTariff,
  saveStateToServer,
  currentUser,
  setCashOutTab,
  setWithdrawalAmount,
  setIsCashOutModalOpen,
  transactions,
  company,
  departments,
  templates,
  reports,
  notifications,
  crmCompanies,
  mockEmployees
}: CabinetTariffProps) {
  return (
    <div className="space-y-6 animate-fade-in font-sans" id="panel-tariff">
      <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
        <TrendingUp className="text-amber-200" size={20} />
        <span>Управление корпоративным тарифом</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-[#17344F]/40 rounded-2xl border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Куплено сотрудников</span>
          <p className="text-2xl font-black text-[#F4EE8E] mt-1">{tariff.activeEmployeesCount} чел.</p>
        </div>
        <div className="p-4 bg-[#17344F]/40 rounded-2xl border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-sans">Оплачен до</span>
          <p className="text-base font-bold text-white mt-2 font-mono">{tariff.expiresAt} 18:00</p>
        </div>
        <div className="p-4 bg-[#17344F]/40 rounded-2xl border border-white/5">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Баланс организации</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{tariff.balance} ₽</p>
        </div>
      </div>

      {/* Top up container */}
      <div className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/40 space-y-4">
        <h4 className="text-sm font-semibold text-white">Докупить места сотрудников</h4>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full text-xs">
            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Количество мест (+290 ₽ / чел в мес)</label>
            <input 
              type="number" 
              min="1" 
              value={topUpSeats}
              onChange={(e) => setTopUpSeats(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl bg-[#1E4468]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-200/30"
            />
          </div>
          <button
            onClick={handleTopUpTariff}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase hover:brightness-110 active:scale-98 transition-all cursor-pointer h-10 flex items-center justify-center gap-1"
          >
            <ArrowUpRight size={13} />
            Активировать за {(topUpSeats * 290)} ₽
          </button>
        </div>

        <div className="pt-3.5 flex justify-between items-center text-xs border-t border-white/5">
          <button 
            onClick={() => {
              if (tariff.activeEmployeesCount > 1) {
                const nextTariff = { ...tariff, activeEmployeesCount: tariff.activeEmployeesCount - 1 };
                setTariff(nextTariff);
                alert('Лимит сотрудников успешно уменьшен на 1.');
                saveStateToServer({ company, departments, templates, reports, transactions, notifications, tariff: nextTariff, crmCompanies, mockEmployees });
              }
            }}
            className="text-slate-400 hover:text-slate-200 text-[10px] underline cursor-pointer"
          >
            Даунгрейд тарифа (уменьшить активные места)
          </button>

          <button 
            onClick={() => {
              setCashOutTab('bonus');
              setWithdrawalAmount(String(currentUser?.bonusesEarned || 2450));
              setIsCashOutModalOpen(true);
            }}
            className="text-[#F4EE8E] hover:text-[#E7C768] text-[11px] font-bold cursor-pointer flex items-center gap-1.5 bg-[#1E4468] px-3.5 py-1.5 rounded-xl border border-amber-200/20 active:scale-95 transition-all shadow"
          >
            <Landmark size={12} />
            Вывод бонусов / Возврат средств
          </button>
        </div>
      </div>

      {/* Transactions History */}
      <div className="space-y-3 pt-2">
        <h4 className="text-sm font-semibold text-white">История транзакций лицевого счета</h4>
        <div className="bg-[#17344F]/40 rounded-2xl border border-white/5 p-4 space-y-2.5 font-mono text-[10px]">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center border-b border-white/5 pb-2">
                <div>
                  <p className="text-slate-300 font-bold font-sans text-xs">{tx.description}</p>
                  <p className="text-slate-500 mt-0.5">{tx.date}</p>
                </div>
                <span className={`font-bold text-xs ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} ₽
                </span>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-4">Нет зарегистрированных платежей.</p>
          )}
        </div>
      </div>
    </div>
  );
}
