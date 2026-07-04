import React, { useState } from 'react';
import { User, Shield, Check, X, Mail, Sparkles, UserCheck, Plus, Trash2, BookOpen, Briefcase, Info, RefreshCw } from 'lucide-react';
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
  triggerAI?: (prompt: string, sys: string, cb: (text: string) => void, mascot?: any) => void;
}

// Role translation helper
export function translateRole(role: string): string {
  if (role === 'DIRECTOR') return 'Директор';
  if (role === 'ADMIN') return 'Администратор';
  if (role === 'MANAGER') return 'Руководитель';
  if (role === 'EMPLOYEE') return 'Сотрудник';
  return role;
}

// Job-specific duties templates for quick insertions
const DUTIES_TEMPLATES = {
  sales: {
    title: 'Менеджер по продажам',
    duties: [
      'Обработка входящих холодных и теплых заявок в CRM',
      'Проведение телефонных звонков и онлайн-презентаций',
      'Выполнение дневных планов по объему продаж',
      'Заполнение ежедневных ИИ-рапортов по клиентам'
    ]
  },
  dev: {
    title: 'Разработчик ПО',
    duties: [
      'Разработка модулей платформы и оптимизация запросов к БД',
      'Покрытие написанного функционала юнит-тестами',
      'Проведение code review коллег по команде',
      'Сдача суточных отчетов о прогрессе в тикетах'
    ]
  },
  marketing: {
    title: 'Трафик-маркетолог',
    duties: [
      'Запуск и оптимизация рекламных кампаний в Яндексе и соцсетях',
      'Мониторинг конверсий, расчет показателей CPL, CAC, ROMI',
      'Создание маркетинговых креативов и промо-постов',
      'Формирование еженедельного отчета по KPI по привлечению лидов'
    ]
  },
  head: {
    title: 'Руководитель отдела',
    duties: [
      'Управление рабочей нагрузкой и координация сотрудников',
      'Контроль ежедневных рапортов сотрудников в Telegram-каналах',
      'Настройка графиков смен в месячном календаре Ганта',
      'Анализ эффективности работы команды через ИИ-аналитику'
    ]
  }
};

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
  crmCompanies,
  triggerAI
}: CabinetEmployeesProps) {
  const [selectedEmp, setSelectedEmp] = useState<UserProfile | null>(null);

  // Dynamic custom duties templates
  const [customTemplates, setCustomTemplates] = useState<{title: string, duties: string[]}[]>(() => {
    try {
      const saved = localStorage.getItem('rr_custom_duty_templates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isAiGeneratingDuties, setIsAiGeneratingDuties] = useState(false);

  // Editing state
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [editPosition, setEditPosition] = useState('');
  const [editTelegram, setEditTelegram] = useState('');
  const [editDuties, setEditDuties] = useState<string[]>([]);
  const [newDutyInput, setNewDutyInput] = useState('');

  // Manual rewards state
  const [rewardCoins, setRewardCoins] = useState<number>(100);
  const [rewardReason, setRewardReason] = useState('');
  const [rewardBadge, setRewardBadge] = useState('🏆 Гордость компании');

  const handleGiveReward = () => {
    if (!selectedEmp) return;
    if (!rewardReason.trim()) {
      alert('Пожалуйста, введите повод или комментарий для награды!');
      return;
    }
    
    // Create new manual reward
    const newReward = {
      id: 'reward-' + Date.now(),
      date: new Date().toLocaleDateString('ru-RU'),
      coins: Number(rewardCoins) || 100,
      reason: rewardReason.trim(),
      badgeName: rewardBadge,
      senderName: currentUser?.name || 'Руководитель'
    };

    // Update this employee's profile
    const next = mockEmployees.map(e => {
      if (e.id === selectedEmp.id) {
        const currentRewards = (e as any).manualRewards || [];
        return {
          ...e,
          xp: ((e as any).xp || 500) + 150, // Give them 150 bonus XP too!
          coins: ((e as any).coins || 100) + newReward.coins,
          manualRewards: [...currentRewards, newReward]
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

    alert(`🎉 Сотрудник ${selectedEmp.name} успешно награжден знаком "${newReward.badgeName}" и получил +${newReward.coins} коинов!\nКомментарий: "${newReward.reason}"`);
    
    // Reset form
    setRewardReason('');
    setRewardCoins(100);
  };

  // Open editor
  const handleOpenEdit = (emp: UserProfile) => {
    if (currentUser?.role !== UserRole.DIRECTOR && currentUser?.role !== UserRole.ADMIN && currentUser?.role !== UserRole.MANAGER) {
      alert('У вас нет прав для изменения карточек сотрудников.');
      return;
    }
    setSelectedEmp(emp);
    setEditName(emp.name);
    setEditRole(emp.role);
    setEditPosition(emp.position || '');
    setEditTelegram(emp.telegramHandle || '');
    setEditDuties(emp.duties || []);
    setNewDutyInput('');
  };

  // Save current duties set as a custom position template
  const handleSaveAsTemplate = () => {
    if (!editPosition.trim()) {
      alert('Укажите название должности, чтобы сохранить её как шаблон.');
      return;
    }
    if (editDuties.length === 0) {
      alert('Нельзя сохранить шаблон с пустым списком обязанностей.');
      return;
    }
    const title = editPosition.trim();
    const exists = customTemplates.some(t => t.title.toLowerCase() === title.toLowerCase());
    if (exists) {
      if (!confirm(`Шаблон для должности "${title}" уже существует. Перезаписать его?`)) {
        return;
      }
    }
    const filtered = customTemplates.filter(t => t.title.toLowerCase() !== title.toLowerCase());
    const nextTemplates = [...filtered, { title, duties: [...editDuties] }];
    setCustomTemplates(nextTemplates);
    localStorage.setItem('rr_custom_duty_templates', JSON.stringify(nextTemplates));
    alert(`Шаблон для должности "${title}" успешно сохранен! Теперь вы можете быстро применить его для других сотрудников.`);
  };

  // Generate duties with AI assistance
  const handleAiGenerateDuties = () => {
    if (!editPosition.trim()) {
      alert('Пожалуйста, введите название должности в поле выше, чтобы ИИ понимал контекст генерации.');
      return;
    }
    if (!triggerAI) {
      alert('ИИ Ассистент временно недоступен.');
      return;
    }
    setIsAiGeneratingDuties(true);
    const prompt = `Сгенерируй профессиональный список из 4-5 ключевых должностных обязанностей для сотрудника на должности: "${editPosition.trim()}".
Обязанности должны быть четкими, конкретными, реалистичными и на русском языке. Напиши каждую обязанность с новой строки БЕЗ цифр, точек и маркеров (просто чистый текст). Пример:
Контроль выполнения планов продаж сотрудниками
Оптимизация рекламного бюджета в рекламных кабинетах`;

    triggerAI(
      prompt,
      "Ты — опытный HR-специалист и ИИ-помощник по управлению персоналом компании.",
      (response) => {
        setIsAiGeneratingDuties(false);
        if (!response) return;
        const lines = response
          .split('\n')
          .map(line => line.replace(/^[\s\d\.\-\*•]+/, '').trim())
          .filter(line => line.length > 3);
        if (lines.length > 0) {
          setEditDuties(prev => Array.from(new Set([...prev, ...lines])));
        }
      }
    );
  };

  // Quick insertion of duty templates
  const handleApplyTemplate = (type: 'sales' | 'dev' | 'marketing' | 'head') => {
    const selectedTemplate = DUTIES_TEMPLATES[type];
    if (selectedTemplate) {
      // Append unique duties
      const combined = Array.from(new Set([...editDuties, ...selectedTemplate.duties]));
      setEditDuties(combined);
    }
  };

  // Add individual custom duty
  const handleAddCustomDuty = () => {
    if (!newDutyInput.trim()) return;
    if (!editDuties.includes(newDutyInput.trim())) {
      setEditDuties([...editDuties, newDutyInput.trim()]);
    }
    setNewDutyInput('');
  };

  // Remove individual duty
  const handleRemoveDuty = (indexToRemove: number) => {
    setEditDuties(editDuties.filter((_, idx) => idx !== indexToRemove));
  };

  // Save changes
  const handleSaveEmp = () => {
    if (!selectedEmp) return;

    // Validate telegram is numeric
    if (editTelegram.trim() && !/^\-?\d+$/.test(editTelegram.trim()) && !editTelegram.startsWith('@')) {
      if (!confirm('Внимание: Telegram ID обычно состоит только из цифр (например, 123456789). Вы уверены, что хотите сохранить нечисловое значение?')) {
        return;
      }
    }

    const next = mockEmployees.map(e => {
      if (e.id === selectedEmp.id) {
        return {
          ...e,
          name: editName,
          role: editRole,
          position: editPosition,
          telegramHandle: editTelegram,
          duties: editDuties
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
        <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
          <UserCheck className="text-amber-200" size={20} />
          <span>Сотрудники, роли и должностные обязанности</span>
        </h3>
        <p className="text-xs text-slate-400">Управляйте учетными записями, должностями, системными ролями и персональными обязанностями персонала.</p>
      </div>

      {/* Direct Invite links container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans" id="invite-links-container">
        {/* Employee Invite Link */}
        <div className="p-4 rounded-2xl border border-sky-400/20 bg-sky-500/5 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-sky-300 uppercase tracking-widest font-mono">ССЫЛКА ДЛЯ СОТРУДНИКОВ</span>
            <span className="text-[10px] bg-sky-400/10 text-sky-300 px-2 py-0.5 rounded-full font-bold">Сотрудник</span>
          </div>
          <p className="text-xs text-slate-300">Передайте эту специальную ссылку сотруднику для автоматического вступления и назначения базовой роли.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-2.5 py-1.5 rounded bg-[#17344F]/50 border border-white/10 text-[9px] text-[#F4EE8E] font-mono truncate select-all">
              https://ii-rr.online/invite?org=rr-1552&role=employee
            </code>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`https://ii-rr.online/invite?org=rr-1552&role=employee`);
                alert('Индивидуальная ссылка для сотрудников скопирована!');
              }}
              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-[10px] cursor-pointer transition-all active:scale-95 shrink-0"
            >
              Скопировать
            </button>
          </div>
        </div>

        {/* Manager/Leader Invite Link */}
        <div className="p-4 rounded-2xl border border-amber-400/20 bg-amber-500/5 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest font-mono">ССЫЛКА ДЛЯ РУКОВОДИТЕЛЕЙ</span>
            <span className="text-[10px] bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded-full font-bold">Руководитель</span>
          </div>
          <p className="text-xs text-slate-300">Приглашение для начальников департаментов и руководителей с расширенным доступом к верификации отчетов.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-2.5 py-1.5 rounded bg-[#17344F]/50 border border-white/10 text-[9px] text-[#F4EE8E] font-mono truncate select-all">
              https://ii-rr.online/invite?org=rr-1552&role=manager
            </code>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`https://ii-rr.online/invite?org=rr-1552&role=manager`);
                alert('Индивидуальная ссылка для руководителей скопирована!');
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] cursor-pointer transition-all active:scale-95 shrink-0"
            >
              Скопировать
            </button>
          </div>
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
                <th className="py-2 px-3">Telegram ID (числовой)</th>
                <th className="py-2 px-3">Кол-во обязанностей</th>
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
                      {translateRole(emp.role)}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300">{emp.position || '—'}</td>
                  <td className="py-3 px-3 text-sky-300 font-mono">{emp.telegramHandle || '—'}</td>
                  <td className="py-3 px-3 text-center text-slate-400 font-sans">{(emp.duties || []).length}</td>
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
          <div className="relative w-full max-w-lg border border-amber-200/20 bg-gradient-to-b from-[#17344F] to-[#265582] rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-y-auto max-h-[90vh] font-sans space-y-5">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 to-white/5" />
            
            <div className="flex justify-between items-start border-b border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <UserCheck className="text-amber-200" size={18} />
                <h4 className="text-sm font-bold text-[#F4EE8E]">Редактор сотрудника #{selectedEmp.id}</h4>
              </div>
              <button 
                onClick={() => setSelectedEmp(null)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Системная Роль *</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] h-9"
                  >
                    <option value={UserRole.EMPLOYEE}>👨‍💻 {translateRole(UserRole.EMPLOYEE)} (EMPLOYEE)</option>
                    <option value={UserRole.MANAGER}>👔 {translateRole(UserRole.MANAGER)} (MANAGER)</option>
                    <option value={UserRole.DIRECTOR}>👑 {translateRole(UserRole.DIRECTOR)} (DIRECTOR)</option>
                    <option value={UserRole.ADMIN}>🛡️ {translateRole(UserRole.ADMIN)} (ADMIN)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">ID Telegram (числовой) *</label>
                  <input 
                    type="text"
                    required
                    value={editTelegram}
                    onChange={(e) => setEditTelegram(e.target.value)}
                    placeholder="Например: 8598472380"
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-mono"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">Укажите числовой ID для персональных ИИ-оповещений.</span>
                </div>
              </div>

              {/* SECTION: DUTIES & POSITION TEMPLATES */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-bold uppercase text-amber-200 tracking-wider flex items-center gap-1">
                    <BookOpen size={12} />
                    <span>Должностные обязанности сотрудника</span>
                  </h5>
                  <span className="text-[10px] text-slate-400">Всего: {editDuties.length}</span>
                </div>

                {/* Duty Templates quick insertions */}
                <div className="bg-[#17344F]/40 p-3 rounded-xl border border-white/5 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Шаблоны обязанностей по должностям:</span>
                    <button
                      type="button"
                      onClick={handleSaveAsTemplate}
                      className="px-2 py-0.5 rounded border border-amber-200/20 hover:border-amber-200/50 hover:bg-amber-400/10 text-[9px] text-[#F4EE8E] transition-colors cursor-pointer"
                    >
                      💾 Сохранить как шаблон
                    </button>
                  </div>
                  
                  {/* Default presets */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('sales')}
                      className="px-2 py-1 rounded bg-[#1E4468] hover:bg-amber-300 hover:text-slate-900 transition-colors text-[9px] font-medium cursor-pointer"
                    >
                      + Отдел продаж
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('dev')}
                      className="px-2 py-1 rounded bg-[#1E4468] hover:bg-amber-300 hover:text-slate-900 transition-colors text-[9px] font-medium cursor-pointer"
                    >
                      + Разработчик
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('marketing')}
                      className="px-2 py-1 rounded bg-[#1E4468] hover:bg-amber-300 hover:text-slate-900 transition-colors text-[9px] font-medium cursor-pointer"
                    >
                      + Маркетолог
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('head')}
                      className="px-2 py-1 rounded bg-[#1E4468] hover:bg-amber-300 hover:text-slate-900 transition-colors text-[9px] font-medium cursor-pointer"
                    >
                      + Руководитель
                    </button>
                  </div>

                  {/* Custom templates list */}
                  {customTemplates.length > 0 && (
                    <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                      <span className="text-[8px] text-slate-400 uppercase block font-semibold">Ваши сохраненные шаблоны:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {customTemplates.map((tpl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              const combined = Array.from(new Set([...editDuties, ...tpl.duties]));
                              setEditDuties(combined);
                            }}
                            className="px-2 py-1 rounded bg-amber-400/10 hover:bg-amber-400 text-amber-200 hover:text-slate-900 border border-amber-400/20 transition-colors text-[9px] font-semibold cursor-pointer"
                          >
                            + {tpl.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI assist button */}
                  <div className="pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={handleAiGenerateDuties}
                      disabled={isAiGeneratingDuties}
                      className="w-full py-1.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-indigo-400/30 hover:brightness-110 disabled:opacity-50 text-indigo-200 hover:text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      {isAiGeneratingDuties ? (
                        <>
                          <RefreshCw size={11} className="animate-spin" />
                          <span>Генерируем обязанности ИИ...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={11} className="text-purple-300" />
                          <span>Помощь нейросети RR в заполнении обязанностей</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Custom duty input bar */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDutyInput}
                    onChange={(e) => setNewDutyInput(e.target.value)}
                    placeholder="Введите отдельную обязанность вручную..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950/30 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDuty}
                    className="px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center cursor-pointer"
                  >
                    Добавить
                  </button>
                </div>

                {/* Duties list render */}
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {editDuties.length === 0 ? (
                    <div className="p-3 text-center border border-dashed border-white/10 rounded-xl text-slate-400 text-[10px]">
                      Обязанности еще не назначены. Введите обязанность вручную или воспользуйтесь шаблонами быстрого ввода выше.
                    </div>
                  ) : (
                    editDuties.map((duty, index) => (
                      <div key={index} className="p-2 rounded-lg bg-slate-900/40 border border-white/5 flex items-start justify-between gap-2">
                        <span className="text-[10px] text-slate-300 leading-normal">{duty}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDuty(index)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-0.5 shrink-0"
                          title="Удалить обязанность"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SECTION: MANUAL REWARDS BY MANAGEMENT */}
              <div className="border-t border-white/5 pt-4 space-y-3" id="manual-rewards-section">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-bold uppercase text-amber-200 tracking-wider flex items-center gap-1.5">
                    <span>🎉 Вручить персональную награду</span>
                  </h5>
                  <span className="text-[10px] bg-amber-400/10 text-amber-200 px-2 py-0.5 rounded-full font-bold">Бонусы</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#17344F]/50 border border-amber-400/20 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Тип награды / Орден</label>
                      <select
                        value={rewardBadge}
                        onChange={(e) => setRewardBadge(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#11293F] border border-white/10 text-white text-[11px] focus:outline-none"
                      >
                        <option value="🏆 Гордость компании">🏆 Гордость компании</option>
                        <option value="🚀 Космический рывок">🚀 Космический рывок</option>
                        <option value="🤝 Лучший наставник">🤝 Лучший наставник</option>
                        <option value="💡 Инновация месяца">💡 Инновация месяца</option>
                        <option value="🔥 Спаситель дедлайна">🔥 Спаситель дедлайна</option>
                        <option value="🌟 Сверхпродуктивность">🌟 Сверхпродуктивность</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Бонусные коины</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={rewardCoins}
                          min={10}
                          max={5000}
                          onChange={(e) => setRewardCoins(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#11293F] border border-white/10 text-white text-[11px] font-mono focus:outline-none"
                        />
                        <span className="text-[10px] text-[#F4EE8E] font-bold">🪙</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Текст благодарности (причина награды)</label>
                    <input
                      type="text"
                      value={rewardReason}
                      onChange={(e) => setRewardReason(e.target.value)}
                      placeholder="Например: За досрочное закрытие тяжелой сделки с клиентом"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#11293F] border border-white/10 text-white text-[11px] focus:outline-none placeholder-slate-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGiveReward}
                    className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-[#D99E41] hover:brightness-110 active:scale-[0.98] text-slate-950 font-extrabold text-[10px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>🎉 Наградить сотрудника!</span>
                  </button>
                </div>

                {/* Received Rewards History */}
                {((selectedEmp as any).manualRewards && (selectedEmp as any).manualRewards.length > 0) && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Ранее врученные ордена:</span>
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {(selectedEmp as any).manualRewards.map((rw: any) => (
                        <div key={rw.id} className="p-2 rounded-lg bg-[#11293F]/50 border border-white/5 flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[10px] text-[#F4EE8E]">{rw.badgeName}</span>
                              <span className="text-[8px] bg-amber-400/10 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">+{rw.coins} 🪙</span>
                            </div>
                            <p className="text-[9px] text-slate-400 leading-normal mt-0.5">"{rw.reason}"</p>
                            <span className="text-[8px] text-[#A6C4E0] block mt-0.5 font-sans">Вручил: {rw.senderName} • {rw.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 shrink-0 flex justify-end gap-2">
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
