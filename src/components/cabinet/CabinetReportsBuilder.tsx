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
  promptFieldsGeneration?: string;
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
  crmCompanies,
  promptFieldsGeneration
}: CabinetReportsBuilderProps) {
  // Form states
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTplTitle, setNewTplTitle] = useState('');
  const [newTplDept, setNewTplDept] = useState('');
  const [newTplType, setNewTplType] = useState<ReportType>('PLAN_DAY');
  const [tplFields, setTplFields] = useState<ReportField[]>([
    { id: '3000000001', label: 'Какие задачи запланированы на сегодня?', type: 'voice', required: true }
  ]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [reminderText, setReminderText] = useState('Внимание! Напоминаем о необходимости сдать отчет.');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');

  const handleAddTplField = () => {
    setTplFields([
      ...tplFields,
      { id: (3000000000 + Math.floor(100000 + Math.random() * 900000)).toString(), label: '', type: 'text', required: true }
    ]);
  };

  const handleRemoveTplField = (idx: number) => {
    if (tplFields.length <= 1) {
      alert('В шаблоне отчета должен быть как минимум один вопрос!');
      return;
    }
    setTplFields(tplFields.filter((_, i) => i !== idx));
  };

  const handleTplFieldChange = (idx: number, key: 'label' | 'type' | 'options', value: any) => {
    const next = [...tplFields];
    next[idx] = { ...next[idx], [key]: value };
    setTplFields(next);
  };

  const handleAIImproveFields = () => {
    if (!newTplTitle.trim()) return;

    const basePrompt = promptFieldsGeneration || 'Ты — профессиональный ИИ-методолог по отчетности в компаниях. Твоя задача — сгенерировать 3 важнейших вопроса для рапорта на основе темы отчета.';
    const sysPrompt = `${basePrompt} Ответ верни СТРОГО в виде JSON-массива строк, без лишнего форматирования и без markdown.
Пример формата вывода: ["Вопрос 1", "Вопрос 2", "Вопрос 3"]`;
    
    const promptText = `Сгенерируй 3 эффективных и конкретных вопроса для шаблона отчета с названием "${newTplTitle}".`;

    triggerAI(promptText, sysPrompt, (text) => {
      try {
        // Clean markdown response block if any
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);
        if (Array.isArray(parsed)) {
          const generatedFields = parsed.slice(0, 5).map((q, idx) => ({
            id: (3000000000 + Math.floor(100000 + Math.random() * 900000) + idx).toString(),
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
            id: (3000000000 + Math.floor(100000 + Math.random() * 900000) + idx).toString(),
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
            fields: tplFields,
            customPrompt: customPrompt.trim() || undefined,
            reminderMinutes: reminderMinutes,
            reminderText: reminderText.trim() || undefined
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
      setCustomPrompt('');
      setReminderMinutes(15);
      setReminderText('Внимание! Напоминаем о необходимости сдать отчет.');
      alert('Шаблон отчета успешно обновлен!');
    } else {
      // CREATE MODE: Add new template
      const newTpl: ReportTemplate = {
        id: (2000000000 + Math.floor(100000 + Math.random() * 900000)).toString(),
        departmentId: newTplDept,
        title: newTplTitle.trim(),
        type: newTplType,
        fields: tplFields,
        employeeIds: [],
        managerId: '1048275916', // Alexey Ivanov Default
        customPrompt: customPrompt.trim() || undefined,
        reminderMinutes: reminderMinutes,
        reminderText: reminderText.trim() || undefined
      };

      const next = [...templates, newTpl];
      setTemplates(next);
      saveStateToServer({ company, departments, templates: next, reports, transactions, notifications, tariff, crmCompanies });

      // Reset
      setNewTplTitle('');
      setNewTplDept('');
      setNewTplType('PLAN_DAY');
      setTplFields([{ id: 'f1', label: 'Какие задачи запланированы на сегодня?', type: 'voice', required: true }]);
      setCustomPrompt('');
      setReminderMinutes(15);
      setReminderText('Внимание! Напоминаем о необходимости сдать отчет.');
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
    setCustomPrompt(tpl.customPrompt || '');
    setReminderMinutes(tpl.reminderMinutes || 15);
    setReminderText(tpl.reminderText || 'Внимание! Напоминаем о необходимости сдать отчет.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTemplateId(null);
    setNewTplTitle('');
    setNewTplDept('');
    setNewTplType('PLAN_DAY');
    setTplFields([{ id: 'f1', label: 'Какие задачи запланированы на сегодня?', type: 'voice', required: true }]);
    setCustomPrompt('');
    setReminderMinutes(15);
    setReminderText('Внимание! Напоминаем о необходимости сдать отчет.');
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

      {/* Top Dropdown for fast fill/generate */}
      {!editingTemplateId && (
        <div className="p-4 rounded-2xl border border-amber-400/20 bg-[#17344F]/50 space-y-2.5 relative" id="quick-fill-template-container">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-amber-400/5 to-transparent rounded-2xl" />
          <label className="block text-xs font-bold text-[#F4EE8E] font-sans uppercase tracking-wider relative z-10 flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-200 animate-pulse" />
            <span>Быстрое заполнение полей из готового шаблона:</span>
          </label>
          <p className="text-[10px] text-slate-400 relative z-10">
            Выберите шаблон, чтобы скопировать его вопросы и настройки в форму ниже для мгновенной сборки нового отчета (без редактирования оригинала).
          </p>
          
          <div className="relative z-10">
            <input
              type="text"
              value={templateSearchQuery}
              onChange={(e) => setTemplateSearchQuery(e.target.value)}
              placeholder="🔍 Быстрый поиск готового шаблона по названию или отделу..."
              className="w-full px-4 py-2 rounded-xl bg-[#11293F] border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] font-sans"
            />
          </div>

          <select
            onChange={(e) => {
              const selectedId = e.target.value;
              if (!selectedId) return;
              const tpl = templates.find(t => t.id === selectedId);
              if (tpl) {
                setNewTplTitle(`${tpl.title} (Копия)`);
                setNewTplDept(tpl.departmentId);
                setNewTplType(tpl.type);
                // Assign new unique IDs to the loaded fields
                setTplFields(tpl.fields.map((f, i) => ({
                  ...f,
                  id: (3000000000 + Math.floor(100000 + Math.random() * 900000) + i).toString()
                })));
                setCustomPrompt(tpl.customPrompt || '');
                setReminderMinutes(tpl.reminderMinutes || 15);
                setReminderText(tpl.reminderText || 'Внимание! Напоминаем о необходимости сдать отчет.');
                setEditingTemplateId(null); // Keep edit mode null so it creates a new template!
              }
            }}
            value=""
            className="w-full px-4 py-2.5 rounded-xl bg-[#17344F] border border-white/10 text-[#F4EE8E] font-bold text-xs focus:outline-none focus:border-[#E7C768] cursor-pointer font-sans relative z-10"
          >
            <option value="" className="text-slate-400">
              {templateSearchQuery ? `-- Выберите из отфильтрованных (${templates.filter(t => {
                const query = templateSearchQuery.toLowerCase();
                const deptName = (departments.find(d => d.id === t.departmentId)?.name || 'Общий отдел').toLowerCase();
                return t.title.toLowerCase().includes(query) || deptName.includes(query);
              }).length}) --` : '-- Нажмите для выбора шаблона-основы --'}
            </option>
            {templates
              .filter(tpl => {
                if (!templateSearchQuery.trim()) return true;
                const query = templateSearchQuery.toLowerCase();
                const deptName = (departments.find(d => d.id === tpl.departmentId)?.name || 'Общий отдел').toLowerCase();
                return tpl.title.toLowerCase().includes(query) || deptName.includes(query);
              })
              .map(tpl => {
                const deptName = departments.find(d => d.id === tpl.departmentId)?.name || 'Общий отдел';
                return (
                  <option key={tpl.id} value={tpl.id} className="bg-[#11293F] text-[#F4EE8E]">
                    {tpl.title} ({deptName} • {tpl.fields.length} вопросов)
                  </option>
                );
              })}
          </select>
        </div>
      )}

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

        {/* Requirements 3 & 9: Custom Prompt for AI recommendations and Reminders constructor */}
        <div className="p-4 rounded-xl bg-[#11293F] border border-white/5 space-y-4 font-sans">
          <h4 className="text-xs font-bold text-[#F4EE8E] tracking-wider uppercase">⚙️ Настройки проверки ИИ и напоминаний</h4>
          
          <div>
            <label className="block text-xs text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
              <span>Инструкция для ИИ (промпт проверки отчета)</span>
              <span className="text-[10px] text-slate-400 font-normal">(Рекомендации, на что ИИ должен обращать внимание)</span>
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Например: Проверить полноту плана, соответствие KPI и поставить оценку качества."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768] resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1 font-semibold">
                Отправка напоминания при опоздании (минут после дедлайна)
              </label>
              <input
                type="number"
                min={1}
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(parseInt(e.target.value) || 15)}
                className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1 font-semibold">
                Текст сообщения-напоминания
              </label>
              <input
                type="text"
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                placeholder="Внимание! Напоминаем о сдаче отчета."
                className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768]"
              />
            </div>
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
            <div key={idx} className="bg-[#17344F]/40 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2 items-center">
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
                  <option value="text_paragraph">📝 Текст абзац</option>
                  <option value="text_short">✍️ Текст кратко</option>
                  <option value="list">📋 Список</option>
                  <option value="checkboxes">☑️ Чекбоксы</option>
                  <option value="voice">🎤 Голосовой ввод</option>
                  <option value="number">🔢 Число</option>
                  <option value="image">📁 Картинка (загрузка)</option>
                  <option value="photo">📷 Сделать фото (камера)</option>
                  <option value="document">📄 Документ (PDF/Office)</option>
                  <option value="checkbox">✔️ Да/Нет чекбокс</option>
                  <option value="select">🔽 Выпадающий список</option>
                  <option value="geolocation">📍 Геолокация</option>
                </select>
                <button 
                  type="button" 
                  onClick={() => handleRemoveTplField(idx)}
                  className="p-2 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Dynamic preview / settings for each field type */}
              <div className="mt-2.5 p-3 rounded-xl bg-[#11293F]/50 border border-white/5 space-y-2.5 animate-fade-in text-[11px] font-sans">
                {/* 1. Options Editor for select, checkboxes, and list */}
                {(field.type === 'select' || field.type === 'checkboxes' || field.type === 'list') && (
                  <div className="space-y-1">
                    <label className="block text-[9px] text-[#F4EE8E] font-bold uppercase tracking-wider">
                      {field.type === 'select' && 'Варианты выбора в выпадающем списке (через запятую):'}
                      {field.type === 'checkboxes' && 'Значения чекбоксов / Список вариантов (через запятую):'}
                      {field.type === 'list' && 'Предустановленные пункты списка по умолчанию (через запятую, необязательно):'}
                    </label>
                    <input
                      type="text"
                      required={field.type === 'select' || field.type === 'checkboxes'}
                      placeholder={
                        field.type === 'select' ? "Например: Отлично, В норме, Есть замечания, Авария" :
                        field.type === 'checkboxes' ? "Например: Выполнено в срок, Имеются блокеры, Требует внимания, Перенесено" :
                        "Например: Задача 1, Задача 2, Задача 3 (необязательно)"
                      }
                      value={field.options ? field.options.join(', ') : ''}
                      onChange={(e) => {
                        const opts = e.target.value.split(',').map(o => o.trim()).filter(Boolean);
                        handleTplFieldChange(idx, 'options', opts);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#17344F]/60 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768]"
                    />
                  </div>
                )}

                {/* 2. Visual interactive simulation of the field form */}
                <div className="space-y-1.5 pt-1 border-t border-white/5">
                  <span className="block text-[9px] text-slate-400 uppercase font-mono tracking-widest">Визуальная модель заполнения для сотрудников:</span>
                  
                  {field.type === 'text_paragraph' && (
                    <textarea 
                      rows={2} 
                      disabled 
                      placeholder="[Сотрудник введет длинный развернутый ответ на несколько абзацев...]" 
                      className="w-full px-3 py-2 rounded-lg bg-[#17344F]/30 border border-white/5 text-slate-400 text-xs resize-none" 
                    />
                  )}

                  {field.type === 'text_short' && (
                    <input 
                      type="text" 
                      disabled 
                      placeholder="[Сотрудник введет краткий ответ в одну строчку...]" 
                      className="w-full px-3 py-2 rounded-lg bg-[#17344F]/30 border border-white/5 text-slate-400 text-xs" 
                    />
                  )}

                  {field.type === 'list' && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5">
                        <input type="text" disabled placeholder="Добавить пункт..." className="flex-1 px-3 py-1.5 rounded-lg bg-[#17344F]/30 border border-white/5 text-slate-400 text-xs" />
                        <button type="button" disabled className="px-3 py-1 rounded bg-amber-400/20 text-amber-200 text-xs font-bold border border-amber-400/20">+</button>
                      </div>
                      <div className="bg-[#17344F]/20 p-2.5 rounded-lg border border-white/5 space-y-1">
                        {field.options && field.options.length > 0 ? (
                          field.options.map((opt, oIdx) => (
                            <div key={oIdx} className="text-xs text-slate-300 flex items-center gap-2">
                              <span className="text-amber-300 font-bold">{oIdx + 1}.</span> {opt}
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 italic block">Сотрудник сможет интерактивно добавлять и удалять элементы списка по очереди</span>
                        )}
                      </div>
                    </div>
                  )}

                  {field.type === 'checkboxes' && (
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-1.5">
                        {field.options && field.options.length > 0 ? (
                          field.options.map((opt, oIdx) => (
                            <span key={oIdx} className="px-2.5 py-1 rounded-full bg-[#17344F]/40 border border-white/10 text-slate-300 text-xs flex items-center gap-1.5">
                              <span className="inline-block w-3 h-3 rounded border border-white/30" /> {opt}
                            </span>
                          ))
                        ) : (
                          ['Выполнено в срок', 'Качество подтверждено', 'Имеются блокеры'].map((opt, oIdx) => (
                            <span key={oIdx} className="px-2.5 py-1 rounded-full bg-[#17344F]/40 border border-white/10 text-slate-400 text-xs flex items-center gap-1.5">
                              <span className="inline-block w-3 h-3 rounded border border-white/30" /> {opt}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {field.type === 'voice' && (
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center gap-2.5 text-red-300">
                      <span className="text-xl animate-pulse shrink-0">🎤</span>
                      <div className="text-xs leading-tight">
                        <strong className="text-red-200 block">Интеллектуальный голосовой рапорт:</strong> 
                        Сотрудники записывают рапорт устно. Наш ИИ переводит в структурированный текст.
                      </div>
                    </div>
                  )}

                  {field.type === 'number' && (
                    <input 
                      type="number" 
                      disabled 
                      placeholder="[Сотрудник введет числовое значение (например, количество встреч, сумма, KPI)...]" 
                      className="w-full px-3 py-2 rounded-lg bg-[#17344F]/30 border border-white/5 text-slate-400 text-xs font-mono" 
                    />
                  )}

                  {(field.type === 'image' || field.type === 'photo' || field.type === 'document') && (
                    <div className="p-3 rounded-lg bg-[#17344F]/30 border border-dashed border-white/10 flex items-center justify-center gap-2 text-slate-400">
                      <span className="text-base">📁</span>
                      <span className="text-xs">
                        {field.type === 'image' && 'Загрузка картинок/изображений с жесткого диска или галереи'}
                        {field.type === 'photo' && 'Снимок со встроенной веб-камеры / камеры телефона (для оперативного контроля на месте)'}
                        {field.type === 'document' && 'Загрузка рабочих файлов (отчетов PDF, Excel, Word)'}
                      </span>
                    </div>
                  )}

                  {field.type === 'checkbox' && (
                    <div className="flex items-center gap-2.5 py-1">
                      <input type="checkbox" disabled className="w-4 h-4 rounded bg-[#17344F]/40 border-white/10 cursor-not-allowed" />
                      <span className="text-xs text-slate-400">Простое подтверждение (Да, выполнено / Да, ознакомлен)</span>
                    </div>
                  )}

                  {field.type === 'select' && (
                    <div className="space-y-1.5">
                      <select disabled className="w-full px-3 py-2 rounded-lg bg-[#17344F]/30 border border-white/5 text-slate-300 text-xs">
                        <option value="">-- Нажмите для выбора одного из вариантов --</option>
                        {field.options && field.options.length > 0 ? (
                          field.options.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))
                        ) : (
                          ['В штатном режиме', 'Выполнено на 100%', 'Есть замечания'].map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))
                        )}
                      </select>
                    </div>
                  )}

                  {field.type === 'geolocation' && (
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center gap-2.5 text-amber-300">
                      <span className="text-xl animate-pulse shrink-0">📍</span>
                      <div className="text-xs leading-tight">
                        <strong className="text-amber-200 block">Автоматический контроль присутствия:</strong> 
                        Получение точных GPS координат сотрудника с его согласия. Менеджеру доступна карта и точность замера.
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
