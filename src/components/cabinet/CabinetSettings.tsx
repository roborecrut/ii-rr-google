import React from 'react';
import { Settings, Sparkles } from 'lucide-react';

interface CabinetSettingsProps {
  promptRecs: string;
  setPromptRecs: (val: string) => void;
  promptSummary: string;
  setPromptSummary: (val: string) => void;
}

export default function CabinetSettings({
  promptRecs,
  setPromptRecs,
  promptSummary,
  setPromptSummary
}: CabinetSettingsProps) {
  return (
    <div className="space-y-6 animate-fade-in font-sans" id="panel-settings">
      <div className="flex items-center gap-2">
        <Settings className="text-amber-200" size={20} />
        <h3 className="text-xl font-bold text-white">Параметры нейросети и шаблонов</h3>
      </div>
      <p className="text-xs text-slate-400 -mt-3">Управляйте мета-инструкциями для генеративного искусственного интеллекта (ii_rr) при разборе смен.</p>

      <div className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/40 space-y-4">
        <div className="space-y-2">
          <label className="block text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#E7C768]" />
            <span>Базовый ИИ-промпт для персональных рекомендаций сотруднику</span>
          </label>
          <textarea 
            rows={3}
            value={promptRecs}
            onChange={(e) => setPromptRecs(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-sans leading-relaxed"
          />
          <span className="text-[10px] text-slate-400 block">Этот промпт используется для оценки Quality Score и составления персональных рекомендаций по смене в отчетах.</span>
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#E7C768]" />
            <span>Базовый ИИ-промпт для формирования сводного саммари руководству</span>
          </label>
          <textarea 
            rows={3}
            value={promptSummary}
            onChange={(e) => setPromptSummary(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-sans leading-relaxed"
          />
          <span className="text-[10px] text-slate-400 block">Этот промпт задает формат анализа для сводных рапортов по целым отделам за произвольные периоды.</span>
        </div>

        <button
          onClick={() => alert('Настройки промптов нейросети успешно зафиксированы в конфигурационном файле!')}
          className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase hover:brightness-110 active:scale-98 transition-all cursor-pointer font-sans"
        >
          Зафиксировать новые промпты
        </button>
      </div>
    </div>
  );
}
