import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { CompanyInfo } from '../../types';

interface CabinetCompanyProps {
  company: CompanyInfo;
  setCompany: (val: CompanyInfo) => void;
  improveFieldWithAI: (fieldKey: 'name' | 'productDescription' | 'workSystemDescription', text: string) => void;
}

export default function CabinetCompany({
  company,
  setCompany,
  improveFieldWithAI
}: CabinetCompanyProps) {
  return (
    <div className="space-y-6 animate-fade-in" id="panel-company">
      <h3 className="text-xl font-bold text-white font-sans">Карточка организации</h3>
      <p className="text-xs text-slate-400">Опишите ваш бизнес и цели. Наша нейросеть будет использовать эти сведения для точной формулировки вопросов и рекомендаций.</p>

      <div className="p-6 rounded-2xl border border-white/5 bg-[#17344F]/40 space-y-6">
        {/* Field 1: Name */}
        <div className="space-y-1.5 relative">
          <label className="block text-xs text-slate-300 font-semibold">Название организации *</label>
          <div className="relative flex items-center">
            <input 
              type="text"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768]"
            />
            {company.name.length >= 10 && (
              <button 
                onClick={() => improveFieldWithAI('name', company.name)}
                className="absolute right-3 p-1.5 rounded-lg bg-[#E7C768] text-slate-900 hover:brightness-110 active:scale-90 transition-all shadow cursor-pointer flex items-center justify-center"
                title="Улучшить название с помощью ИИ"
              >
                <Sparkles size={13} className="animate-pulse" />
              </button>
            )}
          </div>
        </div>

        {/* Field 2: Product Description */}
        <div className="space-y-1.5 relative">
          <label className="block text-xs text-slate-300 font-semibold">Описание продукта или услуг *</label>
          <div className="relative flex items-center">
            <textarea 
              rows={3}
              value={company.productDescription}
              onChange={(e) => setCompany({ ...company, productDescription: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] resize-none"
            />
            {company.productDescription.length >= 10 && (
              <button 
                onClick={() => improveFieldWithAI('productDescription', company.productDescription)}
                className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-[#E7C768] text-slate-900 hover:brightness-110 active:scale-90 transition-all shadow cursor-pointer flex items-center justify-center"
                title="Оптимизировать описание с помощью ИИ"
              >
                <Sparkles size={13} className="animate-pulse" />
              </button>
            )}
          </div>
        </div>

        {/* Field 3: Work Format */}
        <div className="space-y-1.5 relative">
          <label className="block text-xs text-slate-300 font-semibold">Описание рабочего формата и системы обязанностей *</label>
          <div className="relative flex items-center">
            <textarea 
              rows={3}
              value={company.workSystemDescription}
              onChange={(e) => setCompany({ ...company, workSystemDescription: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] resize-none"
            />
            {company.workSystemDescription.length >= 10 && (
              <button 
                onClick={() => improveFieldWithAI('workSystemDescription', company.workSystemDescription)}
                className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-[#E7C768] text-slate-900 hover:brightness-110 active:scale-90 transition-all shadow cursor-pointer flex items-center justify-center"
                title="Улучшить систему с помощью ИИ"
              >
                <Sparkles size={13} className="animate-pulse" />
              </button>
            )}
          </div>
        </div>

        <div className="p-3 bg-amber-400/5 rounded-xl border border-amber-400/10 text-[10px] text-amber-200 leading-relaxed flex items-start gap-2 font-sans">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-[#E7C768]" />
          <span>Золотая иконка ИИ активируется автоматически при заполнении поля длиной от <strong>10 символов</strong>. Нажатие запускает нейросеть для оптимизации текста.</span>
        </div>
      </div>
    </div>
  );
}
