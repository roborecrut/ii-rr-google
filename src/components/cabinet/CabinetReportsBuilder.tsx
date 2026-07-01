import React, { useState } from 'react';
import { Sparkles, Trash2, Edit3, Check, X, RefreshCw } from 'lucide-react';
import { ReportTemplate, ReportField, Department, ReportType } from '../../types';

interface CabinetReportsBuilderProps {
  templates: ReportTemplate[];
  setTemplates: (val: ReportTemplate[]) => void;
  departments: Department[];
  saveStateToServer: (updated: any) => void;
  triggerAI: (promptText: string, sysPrompt: string, onGenerated: (text: string) => void, mascotType?: any) => void;
  // State elements
  company: any;
  reports: any;
  transactions: any;
  notifications: any;
  tariff: any;
  crmCompanies: any;
}

export default function CabinetReportsBuilder({
  templates,
  setTemplates,
  departments,
  saveStateToServer,
  triggerAI,
  company,
  reports,
  transactions,
  notifications,
  tariff,
  crmCompanies
}: CabinetReportsBuilderProps) {
  // Form states
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTplTitle, setNewTplTitle] = useState('');
  const [newTplDept, setNewTplDept] = useState('');
  const [newTplType, setNewTplType] = useState<ReportType>('PLAN_DAY');
  const [tplFields, setTplFields] = useState<ReportField[]>([
    { id: 'f1', label: 'Какие задачи запланированы на сегодня?', type: 'voice', required: true }
  ]);

  const handleAddTplField = () => {
    setTplFields([
      ...tplFields,
      { id: 'field_' + Math.random().toString(36).slice(2, 6), label: '', type: 'text', required: true }
    ]);
  };

  const handleRemoveTplField = (idx: number) => {
    if (tplFields.length <= 1) {
      alert('В шаблоне отчета должен быть как минимум один вопрос!');
      return;
    }
    setTplFields(tplFields.filter((_, i) => i !== idx));
  };

  const handleTplFieldChange = (idx: number, key: 'label' | 'type', value: any) => {
    const next = [...tplFields];
    next[idx] = { ...next[idx], [key]: value };
    setTplFields(next);
  };

  const handleAIImproveFields = () => {
    if (!newTplTitle.trim()) return;

    const sysPrompt = `Ты — профессиональный ИИ-методолог по отчетности в компаниях. Твоя задача — сгенерировать 3 важнейших вопроса для рапорта на основе темы отчета. Ответ верни СТРОГО в виде JSON-массива строк, без лишнего форматирования и без markdown.
Пример формата вывода: ["Вопрос 1", "Вопрос 2", "Вопрос 3"]`;
    
    const promptText = `Сгенерируй 3 эффективных и конкретных вопроса для шаблона отчета с названием "${newTplTitle}".`;

    triggerAI(promptText, sysPrompt, (text) => {
      try {
        // Clean markdown response block if any
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);
        if (Array.isArray(parsed)) {
          const generatedFields = parsed.slice(0, 5).map((q, idx) => ({
            id: 'ai_' + idx + '_' + Math.random().toString(36).slice(2, 5),
            label: q.toString(),
            type: 'voice' as const,
            required: true
          }));
          setTplFields(generatedFields);
        }
      } catch (e) {
        // Fallback default parser if JSON is broken
        const lines = text.split('\n').map(l => l.replace(/^\d+[\.\)\s]+/, '').trim()).filter(Boolean);
        if (lines.length > 0) {
          const generatedFields = lines.slice(0, 3).map((q, idx) => ({
            id: 'ai_' + idx + '_' + Math.random().toString(36).slice(2, 5),
            label: q,
            type: 'voice' as const,
            required: true
          }));
          setTplFields(generatedFields);
        }
      }
    }, 'happy');
  };

  const handleSubmitTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplTitle.trim() || !newTplDept) return;

    if (editingTemplateId) {
      // EDIT MODE: Update existing template
      const updated = templates.map(t => {
        if (t.id === editingTemplateId) {
          return {
            ...t,
            title: newTplTitle.trim(),
            departmentId: newTplDept,
            type: newTplType,
            fields: tplFields
          };
        }
        return t;
      });

      setTemplates(updated);
      saveStateToServer({ company, departments, templates: updated, reports, transactions, notifications, tariff, crmCompanies });
      
      // Reset
      setEditingTemplateId(null);
      setNewTplTitle('');
      setNewTplDept('');
      setNewTplType('PLAN_DAY');
      setTplFields([{ id: 'f1', label: 'Какие задачи запланированы на сегодня?', type: 'voice', required: true }]);
      alert('Шаблон отчета успешно обновлен!');
    } else {
      // CREATE MODE: Add new template
      const newTpl: ReportTemplate = {
        id: 'tpl-' + Date.now().toString().slice(-6),
        departmentId: newTplDept,
        title: newTplTitle.trim(),
        type: newTplType,
        fields: tplFields,
        employeeIds: [],
        managerId: '48275916' // Alexey Ivanov Default
      };

      const next = [...templates, newTpl];
      setTemplates(next);
      saveStateToServer({ company, departments, templates: next, reports, transactions, notifications, tariff, crmCompanies });

      // Reset
      setNewTplTitle('');
      setNewTplDept('');
      setNewTplType('PLAN_DAY');
      setTplFields([{ id: 'f1', label: 'Какие задачи запланированы на сегодня?', type: 'voice', required: true }]);
      alert('Новый шаблон отчета успешно добавлен!');
    }
  };

  // Load selected template for editing
  const handleLoadTemplateToEdit = (tpl: ReportTemplate) => {
    setEditingTemplateId(tpl.id);
    setNewTplTitle(tpl.title);
    setNewTplDept(tpl.departmentId);
    setNewTplType(tpl.type);
    setTplFields(tpl.fields.length > 0 ? tpl.fields : [{ id: 'f1', label: 'Ваш вопрос?', type: 'voice', required: true }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTemplateId(null);
    setNewTplTitle('');
    setNewTplDept('');
    setNewTplType('PLAN_DAY');
    setTplFields([{ id: 'f1', label: 'Какие задачи запланированы на сегодня?', type: 'voice', required: true }]);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="panel-reports-builder">
      <div>
        <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
          <Edit3 className="text-amber-200" size={20} />
          <span>{editingTemplateId ? 'Редактирование шаблона отчета' : 'ИИ Конструктор отчетов'}</span>
        </h3>
        <p className="text-xs text-slate-400">
          {editingTemplateId 
            ? 'Измените поля, тип или заголовок отчета и нажмите «Сохранить изменения».' 
            : 'Создавайте уникальные шаблоны рапортов с автоматическими оптимизациями вопросов от ИИ.'
          }
        </p>
      </div>

      <form onSubmit={handleSubmitTemplate} className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/40 space-y-4">
        {editingTemplateId && (
          <div className="bg-amber-400/10 border border-amber-400/20 p-3 rounded-xl flex justify-between items-center text-xs font-sans">
            <span className="text-amber-200 font-semibold">⚡ Вы редактируете существующий шаблон ID: {editingTemplateId}</span>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-2.5 py-1 rounded bg-[#17344F]/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Отменить редактирование
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
          <div>
            <label className="block text-xs text-slate-300 mb-1 font-semibold">Название отчета *</label>
            <input 
              type="text" 
              required
              value={newTplTitle}
              onChange={(e) => setNewTplTitle(e.target.value)}
              placeholder="Например: План на день (Продажи)"
              className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768]"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1 font-semibold">Закрепленный отдел *</label>
            <select 
              required
              value={newTplDept}
              onChange={(e) => setNewTplDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-[#E7C768] h-9"
            >
              <option value="">Выберите отдел...</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1 font-semibold">Периодичность / Тип *</label>
            <select 
              value={newTplType}
              onChange={(e) => setNewTplType(e.target.value as ReportType)}
              className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-slate-300 text-xs focus:outline-none focus:border-[#E7C768] h-9"
            >
              <option value="PLAN_DAY">План на день (начало смены)</option>
              <option value="FACT_DAY">Факт за день (конец смены)</option>
              <option value="WEEKLY">Отчет за неделю</option>
              <option value="MONTHLY">Отчет за месяц</option>
            </select>
          </div>
        </div>

        {/* AI optimization trigger for fields formulation */}
        {newTplTitle.length >= 5 && (
          <button
            type="button"
            onClick={handleAIImproveFields}
            className="px-4 py-2 rounded-xl border border-amber-200/40 bg-gradient-to-r from-[#F4EE8E]/20 to-[#D99E41]/20 text-[#F4EE8E] text-xs font-semibold hover:brightness-110 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Sparkles size={13} className="animate-pulse" />
            Сгенерировать вопросы с помощью ИИ по названию
          </button>
        )}

        {/* Custom Fields Constructor */}
        <div className="space-y-3 pt-2 font-sans">
          <span className="block text-xs font-bold text-slate-300">Список вопросов в отчете:</span>
          {tplFields.map((field, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-[#17344F]/40 p-3 rounded-xl border border-white/5">
              <input 
                type="text" 
                required
                value={field.label}
                onChange={(e) => handleTplFieldChange(idx, 'label', e.target.value)}
                placeholder="Напишите формулировку вопроса"
                className="flex-1 px-3 py-2 rounded-lg bg-[#17344F]/50 border border-white/5 text-white text-xs focus:outline-none focus:border-[#E7C768]"
              />
              <select 
                value={field.type}
                onChange={(e) => handleTplFieldChange(idx, 'type', e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-[#17344F]/50 border border-white/5 text-slate-300 text-xs focus:outline-none focus:border-[#E7C768] h-8"
              >
                <option value="text">Текст (письменный)</option>
                <option value="voice">Текст / Голосовой ввод</option>
                <option value="number">Числовое значение</option>
                <option value="checkbox">Да/Нет чекбокс</option>
              </select>
              <button 
                type="button" 
                onClick={() => handleRemoveTplField(idx)}
                className="p-2 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddTplField}
            className="py-1.5 px-4 rounded-xl border border-white/10 bg-[#17344F]/50 text-slate-300 text-xs hover:bg-[#17344F]/80 transition-colors cursor-pointer"
          >
            + Добавить свой вопрос
          </button>
        </div>

        <hr className="border-white/5" />

        <button
          type="submit"
          className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer font-sans"
        >
          {editingTemplateId ? 'Сохранить изменения в шаблоне' : 'Создать новый шаблон отчета'}
        </button>
      </form>

      {/* Lists of templates created */}
      <div className="space-y-4 pt-4" id="created-templates-list">
        <h4 className="text-sm font-semibold text-white font-sans">Существующие шаблоны организации (Нажмите для редактирования)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map(tpl => {
            const deptName = departments.find(d => d.id === tpl.departmentId)?.name || 'Неизвестный отдел';
            const isSelected = editingTemplateId === tpl.id;
            return (
              <div 
                key={tpl.id} 
                onClick={() => handleLoadTemplateToEdit(tpl)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-md ${
                  isSelected 
                    ? 'bg-[#1E4468]/90 border-amber-300/60 ring-2 ring-amber-300/30' 
                    : 'bg-[#17344F]/40 border-white/5 hover:border-amber-200/30 hover:bg-[#1E4468]/50'
                }`}
                id={`tpl-card-${tpl.id}`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] px-2 py-0.5 rounded-full bg-[#1E4468] text-amber-200 font-mono uppercase font-bold tracking-wider">
                      {tpl.type === 'PLAN_DAY' ? 'План на день' : tpl.type === 'FACT_DAY' ? 'Факт за день' : tpl.type === 'WEEKLY' ? 'Еженедельный' : 'Ежемесячный'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Вопросов: {tpl.fields.length}</span>
                  </div>
                  <h5 className="font-bold text-white text-xs sm:text-sm leading-tight group-hover:text-[#F4EE8E] transition-colors">{tpl.title}</h5>
                </div>

                <div className="mt-4 pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400 font-sans">
                  <span>Отдел: <strong className="text-slate-300">{deptName}</strong></span>
                  <span className="text-amber-200/80 font-bold group-hover:text-amber-200">Редактировать →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
