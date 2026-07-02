import React from 'react';
import { Landmark, Plus, Building, X, Check } from 'lucide-react';

interface CabinetCRMProps {
  crmCompanies: any[];
  setCrmCompanies: (val: any[]) => void;
  editingCrmCompany: any | null;
  setEditingCrmCompany: (val: any | null) => void;
  saveStateToServer: (updated: any) => void;
  // Core states for saving
  company: any;
  departments: any;
  templates: any;
  reports: any;
  transactions: any;
  notifications: any;
  tariff: any;
  mockEmployees: any;
}

export default function CabinetCRM({
  crmCompanies,
  setCrmCompanies,
  editingCrmCompany,
  setEditingCrmCompany,
  saveStateToServer,
  company,
  departments,
  templates,
  reports,
  transactions,
  notifications,
  tariff,
  mockEmployees
}: CabinetCRMProps) {
  return (
    <div className="space-y-6 animate-fade-in font-sans" id="panel-crm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <Landmark className="text-amber-200" size={20} />
            <span>CRM Панель глобального Администратора</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Глобальный пульт B2B: контролируйте тарифные статусы клиентов, лимиты, налоговые реквизиты и балансы лицевых счетов организаций.
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => {
            const newId = 'crm-c' + Date.now().toString().slice(-4);
            const newComp = {
              id: newId,
              name: 'Новый клиент (Организация)',
              departmentsCount: 1,
              employeesCount: 5,
              status: 'Триал (5 дней)',
              referrals: 0,
              balance: 0,
              inn: '7700000000',
              address: 'Не указан',
              email: 'info@new-client.ru'
            };
            const next = [...crmCompanies, newComp];
            setCrmCompanies(next);
            saveStateToServer({ company, departments, templates, reports, transactions, notifications, tariff, crmCompanies: next, mockEmployees });
            setEditingCrmCompany(newComp);
          }}
          className="px-4 py-2 bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 font-bold rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus size={14} />
          Регистрация компании
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="crm-kanban-board">
        
        {/* Column 1: Trial Period */}
        <div className="flex flex-col rounded-3xl bg-[#17344F]/40 border border-white/5 p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-[#E7C768] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Пробный период (Триал)
            </span>
            <span className="text-[10px] font-mono bg-[#1E4468]/60 text-slate-300 px-2 py-0.5 rounded-full">
              {crmCompanies.filter(c => c.status.includes('Триал')).length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
            {crmCompanies.filter(c => c.status.includes('Триал')).map(comp => (
              <div 
                key={comp.id}
                onClick={() => setEditingCrmCompany({ ...comp })}
                className="p-4 rounded-2xl border border-white/10 bg-slate-950/25 hover:bg-[#1E4468]/50 hover:border-amber-200/30 transition-all cursor-pointer space-y-3 font-sans group relative"
              >
                <div>
                  <h4 className="font-bold text-white text-xs group-hover:text-amber-200 transition-colors truncate">{comp.name}</h4>
                  <span className="text-[9px] text-slate-400 font-mono">ID: #{comp.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 font-mono">
                  <div className="bg-[#17344F]/40 p-1.5 rounded">
                    <span className="block text-slate-500 text-[8px] uppercase">Отделов</span>
                    <strong>{comp.departmentsCount || 0}</strong>
                  </div>
                  <div className="bg-[#17344F]/40 p-1.5 rounded">
                    <span className="block text-slate-500 text-[8px] uppercase">Сотрудников</span>
                    <strong>{comp.employeesCount || 0}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-2">
                  <span className="text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded text-[9px] font-bold">{comp.status}</span>
                  <span className="text-emerald-400 font-bold font-mono">{comp.balance || 0} ₽</span>
                </div>
              </div>
            ))}
            {crmCompanies.filter(c => c.status.includes('Триал')).length === 0 && (
              <p className="text-center text-slate-500 text-[11px] py-8">Пусто</p>
            )}
          </div>
        </div>

        {/* Column 2: Active Premium Users */}
        <div className="flex flex-col rounded-3xl bg-[#17344F]/40 border border-white/5 p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Активные подписки (Бизнес)
            </span>
            <span className="text-[10px] font-mono bg-[#1E4468]/60 text-slate-300 px-2 py-0.5 rounded-full">
              {crmCompanies.filter(c => c.status.includes('Активен')).length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
            {crmCompanies.filter(c => c.status.includes('Активен')).map(comp => (
              <div 
                key={comp.id}
                onClick={() => setEditingCrmCompany({ ...comp })}
                className="p-4 rounded-2xl border border-white/10 bg-slate-950/25 hover:bg-[#1E4468]/50 hover:border-amber-200/30 transition-all cursor-pointer space-y-3 group relative"
              >
                <div>
                  <h4 className="font-bold text-white text-xs group-hover:text-amber-200 transition-colors truncate">{comp.name}</h4>
                  <span className="text-[9px] text-slate-400 font-mono">ID: #{comp.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 font-mono">
                  <div className="bg-[#17344F]/40 p-1.5 rounded">
                    <span className="block text-slate-500 text-[8px] uppercase">Отделов</span>
                    <strong>{comp.departmentsCount || 0}</strong>
                  </div>
                  <div className="bg-[#17344F]/40 p-1.5 rounded">
                    <span className="block text-slate-500 text-[8px] uppercase">Сотрудников</span>
                    <strong>{comp.employeesCount || 0}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-2">
                  <span className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded text-[9px] font-bold">{comp.status}</span>
                  <span className="text-emerald-400 font-bold font-mono">{comp.balance || 0} ₽</span>
                </div>
              </div>
            ))}
            {crmCompanies.filter(c => c.status.includes('Активен')).length === 0 && (
              <p className="text-center text-slate-500 text-[11px] py-8">Пусто</p>
            )}
          </div>
        </div>

        {/* Column 3: Expired / Ended */}
        <div className="flex flex-col rounded-3xl bg-[#17344F]/40 border border-white/5 p-4 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              Архив / Завершено
            </span>
            <span className="text-[10px] font-mono bg-[#1E4468]/60 text-slate-300 px-2 py-0.5 rounded-full">
              {crmCompanies.filter(c => !c.status.includes('Триал') && !c.status.includes('Активен')).length}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
            {crmCompanies.filter(c => !c.status.includes('Триал') && !c.status.includes('Активен')).map(comp => (
              <div 
                key={comp.id}
                onClick={() => setEditingCrmCompany({ ...comp })}
                className="p-4 rounded-2xl border border-white/10 bg-slate-950/25 hover:bg-[#1E4468]/50 hover:border-amber-200/30 transition-all cursor-pointer space-y-3 group relative"
              >
                <div>
                  <h4 className="font-bold text-white text-xs group-hover:text-amber-200 transition-colors truncate">{comp.name}</h4>
                  <span className="text-[9px] text-slate-400 font-mono">ID: #{comp.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 font-mono">
                  <div className="bg-[#17344F]/40 p-1.5 rounded">
                    <span className="block text-slate-500 text-[8px] uppercase">Отделов</span>
                    <strong>{comp.departmentsCount || 0}</strong>
                  </div>
                  <div className="bg-[#17344F]/40 p-1.5 rounded">
                    <span className="block text-slate-500 text-[8px] uppercase">Сотрудников</span>
                    <strong>{comp.employeesCount || 0}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-2">
                  <span className="text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded text-[9px] font-bold">{comp.status}</span>
                  <span className="text-slate-400 font-bold font-mono">{comp.balance || 0} ₽</span>
                </div>
              </div>
            ))}
            {crmCompanies.filter(c => !c.status.includes('Триал') && !c.status.includes('Активен')).length === 0 && (
              <p className="text-center text-slate-500 text-[11px] py-8">Пусто</p>
            )}
          </div>
        </div>

      </div>

      {/* CRM ADVANCED DETAILED COMPANY EDITOR MODAL */}
      {editingCrmCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17344F]/85 backdrop-blur-md animate-fade-in" id="crm-company-modal">
          <div className="relative w-full max-w-xl border border-amber-200/20 bg-gradient-to-b from-[#17344F] to-[#265582] rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-y-auto max-h-[90vh] space-y-5">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 to-white/5" />
            
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <Building className="text-amber-200" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-[#F4EE8E]">Карточка организации: {editingCrmCompany.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Системный идентификатор: #{editingCrmCompany.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setEditingCrmCompany(null)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Editor Form fields */}
            <div className="space-y-4 text-xs">
              
              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Название организации *</label>
                <input 
                  type="text"
                  required
                  value={editingCrmCompany.name}
                  onChange={(e) => setEditingCrmCompany({ ...editingCrmCompany, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
                />
              </div>

              {/* INN & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">ИНН налогоплательщика</label>
                  <input 
                    type="text"
                    value={editingCrmCompany.inn || '7700123456'}
                    onChange={(e) => setEditingCrmCompany({ ...editingCrmCompany, inn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Адрес электронной почты (B2B)</label>
                  <input 
                    type="email"
                    value={editingCrmCompany.email || 'partner@rr-systems.ru'}
                    onChange={(e) => setEditingCrmCompany({ ...editingCrmCompany, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-mono"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Фактический юридический адрес</label>
                <input 
                  type="text"
                  value={editingCrmCompany.address || 'г. Москва, ул. Ленина, д. 4'}
                  onChange={(e) => setEditingCrmCompany({ ...editingCrmCompany, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
                />
              </div>

              {/* Department counts and Employee counts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Лимит отделов</label>
                  <input 
                    type="number"
                    value={editingCrmCompany.departmentsCount}
                    onChange={(e) => setEditingCrmCompany({ ...editingCrmCompany, departmentsCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Лимит сотрудников</label>
                  <input 
                    type="number"
                    value={editingCrmCompany.employeesCount}
                    onChange={(e) => setEditingCrmCompany({ ...editingCrmCompany, employeesCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Рефералов привлечено</label>
                  <input 
                    type="number"
                    value={editingCrmCompany.referrals || 0}
                    onChange={(e) => setEditingCrmCompany({ ...editingCrmCompany, referrals: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-mono"
                  />
                </div>
              </div>

              {/* Status and Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Тарифный статус подписки *</label>
                  <select
                    value={editingCrmCompany.status}
                    onChange={(e) => setEditingCrmCompany({ ...editingCrmCompany, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] h-9"
                  >
                    <option value="Активен (Бизнес)">Активен (Бизнес)</option>
                    <option value="Триал (5 дней)">Триал (5 дней)</option>
                    <option value="Завершен">Завершен / Приостановлен</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Лицевой баланс (₽)</label>
                  <input 
                    type="number"
                    value={editingCrmCompany.balance}
                    onChange={(e) => setEditingCrmCompany({ ...editingCrmCompany, balance: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-mono text-emerald-300 font-bold"
                  />
                </div>
              </div>

            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Вы действительно хотите удалить компанию "${editingCrmCompany.name}" из базы?`)) {
                    const next = crmCompanies.filter(c => c.id !== editingCrmCompany.id);
                    setCrmCompanies(next);
                    saveStateToServer({ company, departments, templates, reports, transactions, notifications, tariff, crmCompanies: next, mockEmployees });
                    setEditingCrmCompany(null);
                  }
                }}
                className="px-3.5 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs transition-colors cursor-pointer"
              >
                Удалить организацию
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCrmCompany(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = crmCompanies.map(c => c.id === editingCrmCompany.id ? editingCrmCompany : c);
                    setCrmCompanies(next);
                    saveStateToServer({ company, departments, templates, reports, transactions, notifications, tariff, crmCompanies: next, mockEmployees });
                    setEditingCrmCompany(null);
                  }}
                  className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={13} />
                  Сохранить изменения
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
