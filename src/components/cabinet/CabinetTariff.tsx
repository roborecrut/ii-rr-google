import React from 'react';
import { Landmark, ArrowUpRight, TrendingUp } from 'lucide-react';
import { TariffState, Transaction, UserProfile } from '../../types';
import TariffCalculator from '../TariffCalculator';

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

      {/* Unified Tariff & ROI Calculator */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-white">Расчет и активация корпоративного тарифа</h4>
        <TariffCalculator 
          initialEmployees={tariff.activeEmployeesCount || 10}
          actionButtonText="Активировать подписку"
          onAction={(selectedEmployees, selectedMonths, totalCost) => {
            if (tariff.balance < totalCost) {
              alert(`Недостаточно средств. Ваш баланс: ${tariff.balance} ₽. Необходимая сумма: ${totalCost} ₽. Пожалуйста, пополните баланс на ${(totalCost - tariff.balance)} ₽ через Робокассу.`);
              return;
            }

            const nextBalance = tariff.balance - totalCost;
            
            // Calculate new expiration date
            const currentExpiry = new Date(tariff.expiresAt || new Date().toISOString().split('T')[0]);
            const today = new Date();
            const baseDate = currentExpiry > today ? currentExpiry : today;
            const nextExpiry = new Date(baseDate);
            nextExpiry.setMonth(nextExpiry.getMonth() + selectedMonths);
            const nextExpiryStr = nextExpiry.toISOString().split('T')[0];

            const nextTariff = {
              ...tariff,
              activeEmployeesCount: selectedEmployees,
              expiresAt: nextExpiryStr,
              balance: nextBalance
            };
            setTariff(nextTariff);

            // Save transaction
            const newTx: Transaction = {
              id: 'tx-' + Date.now(),
              amount: -totalCost,
              type: 'SPENT',
              date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              description: `Активация тарифа: ${selectedEmployees} сотр. на ${selectedMonths} мес. со скидкой`
            };
            const nextTxs = [newTx, ...transactions];
            
            alert(`Тариф успешно активирован! Количество сотрудников: ${selectedEmployees} чел. Подписка продлена до ${nextExpiryStr}. Списано ${totalCost} ₽.`);
            
            saveStateToServer({ 
              company, 
              departments, 
              templates, 
              reports, 
              transactions: nextTxs, 
              notifications, 
              tariff: nextTariff, 
              crmCompanies, 
              mockEmployees 
            });
          }}
        />

        {/* Additional actions */}
        <div className="p-4 rounded-2xl border border-white/5 bg-[#17344F]/40 flex flex-wrap justify-between items-center gap-3 text-xs">
          <button 
            onClick={() => {
              if (tariff.activeEmployeesCount > 1) {
                const nextTariff = { ...tariff, activeEmployeesCount: tariff.activeEmployeesCount - 1 };
                setTariff(nextTariff);
                alert('Лимит сотрудников успешно уменьшен на 1.');
                saveStateToServer({ company, departments, templates, reports, transactions, notifications, tariff: nextTariff, crmCompanies, mockEmployees });
              }
            }}
            className="text-slate-400 hover:text-slate-200 text-xs underline cursor-pointer"
          >
            Даунгрейд тарифа (уменьшить активные места на 1)
          </button>

          <button 
            onClick={() => {
              setCashOutTab('bonus');
              setWithdrawalAmount(String(currentUser?.bonusesEarned || 2450));
              setIsCashOutModalOpen(true);
            }}
            className="text-[#F4EE8E] hover:text-[#E7C768] text-xs font-bold cursor-pointer flex items-center gap-1.5 bg-[#1E4468] px-3.5 py-1.5 rounded-xl border border-amber-200/20 active:scale-95 transition-all shadow"
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
