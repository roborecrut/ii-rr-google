import React, { useState } from 'react';
import { User, Shield, Check, X, Mail, Sparkles, UserCheck } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';

interface CabinetEmployeesProps {
  currentUser: UserProfile | null;
  mockEmployees: UserProfile[];
  setMockEmployees: (val: UserProfile[]) => void;
  departments: any[];
  saveStateToServer: (updated: any) => void;
  // State elements
  company: any;
  templates: any;
  reports: any;
  transactions: any;
  notifications: any;
  tariff: any;
  crmCompanies: any;
}

export default function CabinetEmployees({
  currentUser,
  mockEmployees,
  setMockEmployees,
  departments,
  saveStateToServer,
  company,
  templates,
  reports,
  transactions,
  notifications,
  tariff,
  crmCompanies
}: CabinetEmployeesProps) {
  const [selectedEmp, setSelectedEmp] = useState<UserProfile | null>(null);

  // Editing state
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [editPosition, setEditPosition] = useState('');
  const [editTelegram, setEditTelegram] = useState('');

  const handleOpenEdit = (emp: UserProfile) => {
    // Only allow editing if currentUser is director or admin
    if (currentUser?.role !== UserRole.DIRECTOR && currentUser?.role !== UserRole.ADMIN && currentUser?.role !== UserRole.MANAGER) {
      alert('У вас нет прав для изменения карточек сотрудников.');
      return;
    }
    setSelectedEmp(emp);
    setEditName(emp.name);
    setEditRole(emp.role);
    setEditPosition(emp.position || '');
    setEditTelegram(emp.telegramHandle || '');
  };

  const handleSaveEmp = () => {
    if (!selectedEmp) return;

    const next = mockEmployees.map(e => {
      if (e.id === selectedEmp.id) {
        return {
          ...e,
          name: editName,
          role: editRole,
          position: editPosition,
          telegramHandle: editTelegram
        };
      }
      return e;
    });

    setMockEmployees(next);
    saveStateToServer({ 
      company, 
      departments, 
      templates, 
      reports, 
      transactions, 
      notifications, 
      tariff, 
      crmCompanies,
      mockEmployees: next 
    });

    setSelectedEmp(null);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="panel-employees">
      <div>
        <h3 className="text-xl font-bold text-white font-sans">Сотрудники и роли</h3>
        <p className="text-xs text-slate-400">Управляйте учетными записями, ролями и доступами сотрудников.</p>
      </div>

      {/* Direct Invite link banner */}
      <div className="p-4 rounded-2xl border border-sky-400/20 bg-sky-500/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-bold text-sky-300 uppercase tracking-widest font-mono">ИНДИВИДУАЛЬНАЯ ССЫЛКА ПРИГЛАШЕНИЯ СЛУЖАЩЕГО</span>
          <p className="text-xs text-slate-300">Передайте эту специальную ссылку сотруднику для автоматического вступления в ваш корпоративный отдел.</p>
        </div>
        <div className="flex gap-2">
          <code className="px-3 py-1.5 rounded bg-[#17344F]/50 border border-white/10 text-[10px] text-[#F4EE8E] font-mono select-all">
            {window.location.origin}/invite?org=rr-1552
          </code>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/invite?org=rr-1552`);
              alert('Ссылка для сотрудников скопирована!');
            }}
            className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-[10px] cursor-pointer transition-all"
          >
            Скопировать
          </button>
        </div>
      </div>

      {/* Employees Dynamic Table */}
      <div className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/40 overflow-hidden shadow-lg font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold">
                <th className="py-2 px-3">ID сотрудника</th>
                <th className="py-2 px-3">ФИО сотрудника</th>
                <th className="py-2 px-3">Системная Роль</th>
                <th className="py-2 px-3">Должность в компании</th>
                <th className="py-2 px-3">Учетная запись Telegram</th>
                <th className="py-2 px-3 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200 font-mono text-[11px]">
              {mockEmployees.map((emp) => (
                <tr 
                  key={emp.id} 
                  onClick={() => handleOpenEdit(emp)}
                  className="hover:bg-[#1E4468]/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3 text-amber-200 font-bold">#{emp.id}</td>
                  <td className="py-3 px-3 font-sans font-bold text-white group-hover:text-[#F4EE8E] transition-colors">{emp.name}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                      emp.role === UserRole.ADMIN ? 'bg-red-500/20 text-red-300 border border-red-500/10' :
                      emp.role === UserRole.DIRECTOR ? 'bg-purple-500/20 text-purple-300 border border-purple-500/10' :
                      emp.role === UserRole.MANAGER ? 'bg-amber-500/20 text-amber-300 border border-amber-500/10' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/10'
                    }`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300">{emp.position || '—'}</td>
                  <td className="py-3 px-3 text-sky-300">{emp.telegramHandle || '—'}</td>
                  <td className="py-3 px-3 text-right font-sans">
                    <span className="text-[#E7C768] hover:underline font-bold text-[10px]">Редактировать →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT EMPLOYEE DETAIL CARD MODAL */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17344F]/85 backdrop-blur-md animate-fade-in" id="employee-edit-modal">
          <div className="relative w-full max-w-md border border-amber-200/20 bg-gradient-to-b from-[#17344F] to-[#265582] rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden font-sans">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 to-white/5" />
            
            <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="text-amber-200" size={18} />
                <h4 className="text-sm font-bold text-[#F4EE8E]">Личная карточка #{selectedEmp.id}</h4>
              </div>
              <button 
                onClick={() => setSelectedEmp(null)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">ФИО Сотрудника *</label>
                <input 
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">E-mail (Только чтение)</label>
                <input 
                  type="text"
                  disabled
                  value={selectedEmp.email}
                  className="w-full px-3 py-2 rounded-xl bg-[#17344F]/30 border border-white/5 text-slate-400 text-xs font-mono select-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Системная Роль *</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
                >
                  <option value={UserRole.EMPLOYEE}>👨‍💻 EMPLOYEE (Сотрудник)</option>
                  <option value={UserRole.MANAGER}>👔 MANAGER (Руководитель)</option>
                  <option value={UserRole.DIRECTOR}>👑 DIRECTOR (Директор)</option>
                  <option value={UserRole.ADMIN}>🛡️ ADMIN (Администратор)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Должность в компании *</label>
                <input 
                  type="text"
                  required
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Telegram логин *</label>
                <input 
                  type="text"
                  required
                  value={editTelegram}
                  onChange={(e) => setEditTelegram(e.target.value)}
                  placeholder="@telegram_nick"
                  className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedEmp(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveEmp}
                className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={13} />
                Сохранить карточку
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
