import React, { useState } from 'react';
import { Settings, Sparkles, User, ShieldCheck, ClipboardCheck, MessageSquare, Wrench } from 'lucide-react';

interface CabinetSettingsProps {
  promptRecs: string;
  setPromptRecs: (val: string) => void;
  promptSummary: string;
  setPromptSummary: (val: string) => void;
  promptFastFill: string;
  setPromptFastFill: (val: string) => void;
  promptManagerFeedback: string;
  setPromptManagerFeedback: (val: string) => void;
  promptFieldsGeneration: string;
  setPromptFieldsGeneration: (val: string) => void;
  onSavePrompts: (
    recs: string,
    summary: string,
    fastFill: string,
    managerFeedback: string,
    fieldsGen: string
  ) => void;
}

export default function CabinetSettings({
  promptRecs,
  setPromptRecs,
  promptSummary,
  setPromptSummary,
  promptFastFill,
  setPromptFastFill,
  promptManagerFeedback,
  setPromptManagerFeedback,
  promptFieldsGeneration,
  setPromptFieldsGeneration,
  onSavePrompts
}: CabinetSettingsProps) {
  // Local states to handle edits before saving
  const [localRecs, setLocalRecs] = useState(promptRecs);
  const [localSummary, setLocalSummary] = useState(promptSummary);
  const [localFastFill, setLocalFastFill] = useState(promptFastFill);
  const [localManagerFeedback, setLocalManagerFeedback] = useState(promptManagerFeedback);
  const [localFieldsGeneration, setLocalFieldsGeneration] = useState(promptFieldsGeneration);

  const handleSave = () => {
    onSavePrompts(
      localRecs,
      localSummary,
      localFastFill,
      localManagerFeedback,
      localFieldsGeneration
    );
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans" id="panel-settings">
      <div className="flex items-center gap-2">
        <Settings className="text-amber-200" size={20} />
        <h3 className="text-xl font-bold text-white">Параметры нейросети и сценарии ИИ</h3>
      </div>
      <p className="text-xs text-slate-400 -mt-3">
        Управляйте мета-инструкциями для всех генеративных функций RR. Ниже приведены все ИИ-сценарии в системе, разделенные по блокам ролей. Вы можете настроить индивидуальный промпт для каждого сценария.
      </p>

      <div className="space-y-6">
        
        {/* BLOCK 1: EMPLOYEE SCENARIOS */}
        <div className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/40 space-y-4">
          <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2 border-b border-white/5 pb-2">
            <User size={16} />
            <span>Блок Сотрудника (Сдача и автозаполнение отчетов)</span>
          </h4>

          {/* Prompt 1: Recommendations / Audit */}
          <div className="space-y-2">
            <label className="block text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <ClipboardCheck size={13} className="text-[#E7C768]" />
              <span>1. ИИ-Аудит и персональные рекомендации по смене</span>
            </label>
            <textarea 
              rows={3}
              value={localRecs}
              onChange={(e) => setLocalRecs(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-sans leading-relaxed"
            />
            <span className="text-[10px] text-slate-400 block">
              <strong>Сценарий:</strong> Запускается при сдаче отчета сотрудником. ИИ оценивает качество (Quality Score) и пишет персональные рекомендации (советы) для улучшения показателей. <span className="text-amber-200/80">(Исключение: индивидуальный промпт отчета в конструкторе имеет приоритет)</span>.
            </span>
          </div>

          {/* Prompt 2: Fast Fill */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#E7C768]" />
              <span>2. Умное автозаполнение полей по свободному тексту</span>
            </label>
            <textarea 
              rows={3}
              value={localFastFill}
              onChange={(e) => setLocalFastFill(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-sans leading-relaxed"
            />
            <span className="text-[10px] text-slate-400 block">
              <strong>Сценарий:</strong> Опция «Умное автозаполнение» в форме отчета. Сотрудник вводит/диктует свободный текст смены, а ИИ структурирует его и раскладывает данные в соответствующие поля формы.
            </span>
          </div>
        </div>

        {/* BLOCK 2: MANAGER SCENARIOS */}
        <div className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/40 space-y-4">
          <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2 border-b border-white/5 pb-2">
            <ShieldCheck size={16} />
            <span>Блок Руководителя (Оценка, ревизия и конструктор)</span>
          </h4>

          {/* Prompt 3: Boss feedback */}
          <div className="space-y-2">
            <label className="block text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <MessageSquare size={13} className="text-[#E7C768]" />
              <span>3. Генератор рецензии и обратной связи руководителя</span>
            </label>
            <textarea 
              rows={3}
              value={localManagerFeedback}
              onChange={(e) => setLocalManagerFeedback(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-sans leading-relaxed"
            />
            <span className="text-[10px] text-slate-400 block">
              <strong>Сценарий:</strong> Запускается в календаре отчетов при нажатии кнопки «Составить рецензию ИИ». ИИ помогает руководителю мгновенно написать конструктивную и мотивирующую обратную связь и поставить задачу на следующую смену.
            </span>
          </div>

          {/* Prompt 4: Report Fields generation */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <Wrench size={13} className="text-[#E7C768]" />
              <span>4. Автогенерация вопросов рапорта (Конструктор отчетов)</span>
            </label>
            <textarea 
              rows={3}
              value={localFieldsGeneration}
              onChange={(e) => setLocalFieldsGeneration(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-sans leading-relaxed"
            />
            <span className="text-[10px] text-slate-400 block">
              <strong>Сценарий:</strong> Функция «Улучшить структуру с ИИ» в Конструкторе отчетов. Помогает составить идеальные, отраслевые вопросы на основе лишь названия будущего отчета.
            </span>
          </div>
        </div>

        {/* BLOCK 3: DIRECTOR SCENARIOS */}
        <div className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/40 space-y-4">
          <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2 border-b border-white/5 pb-2">
            <Settings size={16} />
            <span>Блок Директора (Сводный анализ и глобальная аналитика)</span>
          </h4>

          {/* Prompt 5: Summary Analytics */}
          <div className="space-y-2">
            <label className="block text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#E7C768]" />
              <span>5. Сводный анализ показателей и саммари по отделу</span>
            </label>
            <textarea 
              rows={3}
              value={localSummary}
              onChange={(e) => setLocalSummary(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-sans leading-relaxed"
            />
            <span className="text-[10px] text-slate-400 block">
              <strong>Сценарий:</strong> Панель «Аналитика ИИ». Запускается директором или руководителем для формирования комплексной текстовой выжимки (достижения, блокеры, выводы) по всему отделу за выбранные даты.
            </span>
          </div>
        </div>

        {/* Global Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all cursor-pointer font-sans shadow-lg"
        >
          Сохранить параметры всех ИИ-сценариев
        </button>
      </div>
    </div>
  );
}
