import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Users, Check, X, Building, Info, MessageSquare } from 'lucide-react';
import { Department, UserProfile, UserRole } from '../../types';

interface CabinetDepartmentsProps {
  departments: Department[];
  setDepartments: (val: Department[]) => void;
  saveStateToServer: (updated: any) => void;
  // All state needed for syncing with state.json
  company: any;
  templates: any;
  reports: any;
  transactions: any;
  notifications: any;
  tariff: any;
  crmCompanies: any;
  // Optional mock user database to choose employees from
  mockEmployees: UserProfile[];
}

export default function CabinetDepartments({
  departments,
  setDepartments,
  saveStateToServer,
  company,
  templates,
  reports,
  transactions,
  notifications,
  tariff,
  crmCompanies,
  mockEmployees
}: CabinetDepartmentsProps) {
  const [newDepName, setNewDepName] = useState('');
  const [newDepChat, setNewDepChat] = useState('');
  const [newDepParent, setNewDepParent] = useState<string>('none');

  // Selected department for the detailed Modal
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingChat, setEditingChat] = useState('');
  const [editingParent, setEditingParent] = useState<string>('none');
  const [quickEmployeeId, setQuickEmployeeId] = useState('');

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepName.trim() || !newDepChat.trim()) return;

    const newDep: Department = {
      id: 'dep-' + Date.now().toString().slice(-6),
      name: newDepName.trim(),
      managerId: '48275916', // ALEXEY IVANOV by default
      employeeIds: [],
      telegramChatId: newDepChat.trim(),
      parentId: newDepParent === 'none' ? null : newDepParent
    };

    const next = [...departments, newDep];
    setDepartments(next);
    saveStateToServer({ company, departments: next, templates, reports, transactions, notifications, tariff, crmCompanies });

    setNewDepName('');
    setNewDepChat('');
    setNewDepParent('none');
  };

  const handleOpenDeptDetails = (dep: Department) => {
    setSelectedDept(dep);
    setEditingName(dep.name);
    setEditingChat(dep.telegramChatId);
    setEditingParent(dep.parentId || 'none');
    setQuickEmployeeId('');
  };

  const handleSaveChanges = () => {
    if (!selectedDept) return;
    const updated = departments.map(d => {
      if (d.id === selectedDept.id) {
        return {
          ...d,
          name: editingName,
          telegramChatId: editingChat,
          parentId: editingParent === 'none' ? null : editingParent
        };
      }
      return d;
    });

    setDepartments(updated);
    saveStateToServer({ company, departments: updated, templates, reports, transactions, notifications, tariff, crmCompanies });
    setSelectedDept(null);
  };

  const handleAddEmployeeToDept = () => {
    if (!selectedDept || !quickEmployeeId) return;
    
    // Check if employee is already in department
    if (selectedDept.employeeIds.includes(quickEmployeeId)) {
      alert('Сотрудник уже состоит в этом отделе!');
      return;
    }

    const updated = departments.map(d => {
      if (d.id === selectedDept.id) {
        return {
          ...d,
          employeeIds: [...d.employeeIds, quickEmployeeId]
        };
      }
      return d;
    });

    setDepartments(updated);
    saveStateToServer({ company, departments: updated, templates, reports, transactions, notifications, tariff, crmCompanies });
    
    // Sync local selectedDept state
    setSelectedDept({
      ...selectedDept,
      employeeIds: [...selectedDept.employeeIds, quickEmployeeId]
    });
    setQuickEmployeeId('');
  };

  const handleRemoveEmployeeFromDept = (empId: string) => {
    if (!selectedDept) return;
    const updated = departments.map(d => {
      if (d.id === selectedDept.id) {
        return {
          ...d,
          employeeIds: d.employeeIds.filter(id => id !== empId)
        };
      }
      return d;
    });

    setDepartments(updated);
    saveStateToServer({ company, departments: updated, templates, reports, transactions, notifications, tariff, crmCompanies });

    // Sync local selectedDept state
    setSelectedDept({
      ...selectedDept,
      employeeIds: selectedDept.employeeIds.filter(id => id !== empId)
    });
  };

  return (
    <div className="space-y-6 animate-fade-in" id="panel-departments">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white font-sans">Структура и Отделы</h3>
          <p className="text-xs text-slate-400">Управляйте подразделениями, привязывайте Telegram-чаты и сотрудников к отделам.</p>
        </div>
      </div>

      {/* Form to Add Dept */}
      <form onSubmit={handleAddDept} className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/40 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Название отдела *</label>
          <input 
            type="text" 
            required 
            value={newDepName} 
            onChange={(e) => setNewDepName(e.target.value)}
            placeholder="Например: Отдел Продаж"
            className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768]"
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Telegram Chat ID *</label>
          <input 
            type="text" 
            required
            value={newDepChat} 
            onChange={(e) => setNewDepChat(e.target.value)}
            placeholder="@sales_reports_chat"
            className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768]"
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Подчиняется отделу</label>
          <select 
            value={newDepParent}
            onChange={(e) => setNewDepParent(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] h-9"
          >
            <option value="none">Корень (Нет)</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="py-2.5 px-4 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer font-sans flex items-center justify-center gap-1.5 h-9"
        >
          <Plus size={14} />
          Добавить отдел
        </button>
      </form>

      {/* Grid of tiles showing connections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="departments-tiles-grid">
        {departments.map((dep) => {
          const parentName = dep.parentId ? departments.find(d => d.id === dep.parentId)?.name : null;
          return (
            <div 
              key={dep.id} 
              onClick={() => handleOpenDeptDetails(dep)}
              className="p-5 rounded-2xl border border-white/10 bg-[#17344F]/40 hover:bg-[#1E4468]/50 hover:border-[#E7C768]/30 flex flex-col justify-between group relative cursor-pointer transition-all duration-300 shadow-md select-none" 
              id={`dept-tile-${dep.id}`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#F4EE8E] text-sm group-hover:text-white transition-colors">{dep.name}</h4>
                    {parentName && (
                      <span className="text-[9px] bg-[#1E4468]/60 text-slate-300 border border-white/5 px-2 py-0.5 rounded-full inline-block">
                        ↑ {parentName}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Stop opening details dialog
                      if (confirm(`Вы действительно хотите удалить отдел "${dep.name}"?`)) {
                        const next = departments.filter(d => d.id !== dep.id);
                        setDepartments(next);
                        saveStateToServer({ company, departments: next, templates, reports, transactions, notifications, tariff, crmCompanies });
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                    title="Удалить отдел"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                
                <div className="text-[11px] space-y-1 text-slate-300 font-mono">
                  <p><strong className="text-slate-400">Telegram чат:</strong> {dep.telegramChatId}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400 font-sans">
                <span className="flex items-center gap-1 text-slate-300">
                  <Users size={11} className="text-slate-400" />
                  Сотрудников: {dep.employeeIds.length}
                </span>
                <span className="text-[#E7C768] font-bold text-[9px] uppercase tracking-wider">Редактировать →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DEPARTMENT MODAL (INFO + EDIT + STAFF MEMBERS) */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17344F]/80 backdrop-blur-md animate-fade-in" id="dept-details-modal">
          <div className="relative w-full max-w-2xl border border-amber-200/20 bg-gradient-to-b from-[#17344F] to-[#1E4468] rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Reflective shine */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 to-white/5" />
            
            <div className="flex justify-between items-start border-b border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1E4468] border border-amber-200/30 flex items-center justify-center text-[#E7C768]">
                  <Building size={16} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#F4EE8E]">Отдел: {selectedDept.name}</h4>
                  <p className="text-[10px] text-slate-400">Редактирование параметров и привязка сотрудников</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDept(null)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 font-sans">
              
              {/* Form parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Название отдела</label>
                  <input 
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Telegram Chat ID</label>
                  <input 
                    type="text"
                    value={editingChat}
                    onChange={(e) => setEditingChat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Подчиняется отделу</label>
                  <select 
                    value={editingParent}
                    onChange={(e) => setEditingParent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] h-9"
                  >
                    <option value="none">Корень (Нет)</option>
                    {departments.filter(d => d.id !== selectedDept.id).map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Staff Management Section */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h5 className="text-xs font-bold uppercase text-amber-200 tracking-wider flex items-center gap-1.5">
                  <Users size={13} />
                  <span>Состав отдела ({selectedDept.employeeIds.length} сотрудников)</span>
                </h5>

                {/* Add employee to department select bar */}
                <div className="flex gap-2 bg-[#17344F]/40 p-3 rounded-xl border border-white/5 items-center">
                  <div className="flex-1">
                    <span className="block text-[9px] text-slate-400 mb-1 font-bold">Выберите сотрудника для добавления:</span>
                    <select
                      value={quickEmployeeId}
                      onChange={(e) => setQuickEmployeeId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#1E4468] border border-white/10 text-white text-xs focus:outline-none h-8"
                    >
                      <option value="">-- Выберите из списка --</option>
                      {mockEmployees
                        .filter(e => !selectedDept.employeeIds.includes(e.id))
                        .map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({e.position || 'Сотрудник'})</option>
                        ))
                      }
                    </select>
                  </div>
                  <button
                    onClick={handleAddEmployeeToDept}
                    disabled={!quickEmployeeId}
                    className="mt-4 px-4 py-1.5 rounded-lg font-bold bg-[#E7C768] text-slate-900 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs h-8 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    Добавить
                  </button>
                </div>

                {/* List of current employees */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {selectedDept.employeeIds.length === 0 ? (
                    <div className="p-4 rounded-xl border border-white/5 bg-[#17344F]/20 text-center col-span-2 text-slate-400 text-xs">
                      В этом отделе пока нет привязанных сотрудников. Добавьте сотрудников из списка выше!
                    </div>
                  ) : (
                    selectedDept.employeeIds.map(empId => {
                      const emp = mockEmployees.find(e => e.id === empId);
                      return (
                        <div key={empId} className="p-3 rounded-xl border border-white/5 bg-[#1E4468]/50 flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{emp ? emp.name : `Сотрудник ID: ${empId}`}</p>
                            <p className="text-[10px] text-slate-400 truncate">{emp ? emp.position : 'Должность не указана'}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveEmployeeFromDept(empId)}
                            className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors shrink-0"
                            title="Исключить из отдела"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            <div className="border-t border-white/10 pt-4 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setSelectedDept(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={13} />
                Сохранить настройки
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
