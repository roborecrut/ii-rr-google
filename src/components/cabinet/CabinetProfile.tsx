import React from 'react';
import { Save, Shield, CheckCircle, BookOpen, User, Landmark } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { translateRole } from './CabinetEmployees';

interface CabinetProfileProps {
  currentUser: UserProfile | null;
  telegramHandle: string;
  setTelegramHandle: (val: string) => void;
  userPosition: string;
  setUserPosition: (val: string) => void;
  onSaveProfile: () => void;
}

export default function CabinetProfile({
  currentUser,
  telegramHandle,
  setTelegramHandle,
  userPosition,
  setUserPosition,
  onSaveProfile
}: CabinetProfileProps) {
  // Construct referral link strictly based on user referralCode with official domain
  const refLink = currentUser 
    ? `https://ii-rr.online/invite?org=rr-1552&ref=${currentUser.referralCode}` 
    : `https://ii-rr.online/invite?org=rr-1552&ref=partner`;

  return (
    <div className="space-y-6 animate-fade-in" id="panel-profile">
      <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent font-sans">Личный профиль сотрудника</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info Form */}
        <div className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/40 space-y-4 font-sans">
          <h4 className="text-sm font-semibold text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
            <User size={14} />
            <span>Анкетные данные из Google</span>
          </h4>
          <div className="space-y-3 text-xs">
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">ФИО</span>
              <p className="text-sm font-bold text-slate-100">{currentUser?.name}</p>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Почта (E-mail)</span>
              <p className="text-sm font-semibold text-slate-300 font-mono">{currentUser?.email}</p>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Роль в системе</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#1E4468] text-amber-200 mt-1 inline-block">
                {translateRole(currentUser?.role || '')}
              </span>
            </div>
          </div>

          <hr className="border-white/5" />

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">ID Telegram (числовой для оповещений) *</label>
              <input 
                type="text" 
                value={telegramHandle} 
                onChange={(e) => setTelegramHandle(e.target.value)}
                placeholder="например: 8598472380"
                className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768] font-mono"
              />
              <span className="text-[9px] text-slate-400 mt-0.5 block">Введите числовое ID из Telegram, чтобы ИИ мог отсылать персональные уведомления.</span>
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Название должности *</label>
              <input 
                type="text" 
                value={userPosition} 
                onChange={(e) => setUserPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768]"
              />
            </div>
          </div>

          <button
            onClick={() => {
              // Validate telegram handle is numeric
              if (telegramHandle.trim() && !/^\-?\d+$/.test(telegramHandle.trim()) && !telegramHandle.startsWith('@')) {
                if (!confirm('Внимание: Telegram ID обычно состоит только из цифр. Вы уверены, что хотите сохранить нечисловое значение?')) {
                  return;
                }
              }
              onSaveProfile();
            }}
            className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Save size={13} />
            Сохранить изменения
          </button>
        </div>

        {/* Dynamic Duties Display Panel */}
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/40 space-y-3 font-sans">
            <h4 className="text-sm font-semibold text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
              <BookOpen size={14} />
              <span>Ваши должностные обязанности</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Персональный перечень должностных инструкций и обязанностей, закрепленный за вами руководством компании для выполнения рапортов.
            </p>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {!currentUser?.duties || currentUser.duties.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-white/10 bg-slate-950/20 text-center text-[10px] text-slate-400">
                  Обязанности еще не назначены. Обратитесь к руководителю, чтобы он закрепил должностные обязанности за вашей карточкой в панели «Сотрудники».
                </div>
              ) : (
                currentUser.duties.map((duty, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#1E4468]/40 border border-white/5 flex items-start gap-2.5 text-[11px] text-slate-200">
                    <CheckCircle size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                    <span className="leading-normal">{duty}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Referral program card */}
          {(currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.ADMIN) ? (
            <div className="p-5 rounded-2xl border border-amber-200/20 bg-gradient-to-b from-[#17344F] to-[#1E4468] space-y-4 font-sans">
              <h4 className="text-sm font-semibold text-[#F4EE8E] uppercase tracking-wide flex items-center gap-1.5">
                <Landmark size={14} />
                <span>Партнерская программа RR</span>
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                Приглашайте дружественные компании и получайте пожизненный бонус в размере <strong className="text-amber-100 text-sm">15%</strong> от всех их оплат на свой баланс!
              </p>

              <div className="bg-[#17344F]/50 p-4 rounded-xl border border-white/5 space-y-3">
                <div>
                  <span className="block text-[10px] text-slate-400">Ваша партнерская ссылка (ii-rr.online):</span>
                  <div className="flex items-center gap-1.5 mt-1 bg-[#1E4468]/60 p-2 rounded-lg border border-white/10">
                    <code className="text-[10px] text-amber-200 truncate flex-1 font-mono">{refLink}</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(refLink);
                        alert('Ссылка скопирована!');
                      }}
                      className="p-1.5 rounded bg-[#1E4468]/60 text-slate-300 hover:text-white text-[10px] transition-colors cursor-pointer font-sans"
                    >
                      Копировать
                    </button>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-400">Ваш промокод (Latin, lowercase):</span>
                  <p className="text-sm font-mono font-bold text-white mt-0.5">{currentUser?.referralCode || 'rrpartner'}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 bg-[#17344F]/30 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Приглашено</span>
                  <p className="text-base font-bold font-mono text-emerald-400 mt-1">{currentUser?.invitedUsersCount || 3} комп.</p>
                </div>
                <div className="p-3 bg-[#17344F]/30 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Бонусы на балансе</span>
                  <p className="text-base font-bold font-mono text-amber-200 mt-1">{currentUser?.bonusesEarned || 2450} ₽</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/20 flex flex-col items-center justify-center text-center space-y-2 font-sans py-8">
              <Shield size={20} className="text-slate-500" />
              <p className="text-slate-400 text-xs leading-normal">Партнерская программа и реферальная статистика доступны только для ролей «Директор» и «Администратор».</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
