import React from 'react';
import { Save, Shield } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';

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
  // Construct referral link strictly based on user referralCode
  const refLink = currentUser 
    ? `${window.location.origin}?ref=${currentUser.referralCode}` 
    : `${window.location.origin}?ref=partner`;

  return (
    <div className="space-y-6 animate-fade-in" id="panel-profile">
      <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent font-sans">Личный профиль сотрудника</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info Form */}
        <div className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/40 space-y-4">
          <h4 className="text-sm font-semibold text-amber-200 uppercase tracking-wide font-sans">Анкетные данные из Google</h4>
          <div className="space-y-3">
            <div>
              <span className="block text-[10px] text-slate-400">ФИО</span>
              <p className="text-sm font-bold text-slate-100">{currentUser?.name}</p>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Почта (E-mail)</span>
              <p className="text-sm font-semibold text-slate-300 font-mono">{currentUser?.email}</p>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Роль в системе</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1E4468] text-amber-200 font-sans mt-1 inline-block">
                {currentUser?.role}
              </span>
            </div>
          </div>

          <hr className="border-white/5" />

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Ник в Telegram (для бота оповещений) *</label>
              <input 
                type="text" 
                value={telegramHandle} 
                onChange={(e) => setTelegramHandle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768]"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Название должности *</label>
              <input 
                type="text" 
                value={userPosition} 
                onChange={(e) => setUserPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768]"
              />
            </div>
          </div>

          <button
            onClick={onSaveProfile}
            className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all cursor-pointer font-sans flex items-center justify-center gap-1.5"
          >
            <Save size={13} />
            Сохранить изменения
          </button>
        </div>

        {/* Referral program card */}
        {(currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.ADMIN) ? (
          <div className="p-5 rounded-2xl border border-amber-200/20 bg-gradient-to-b from-[#17344F] to-[#1E4468] space-y-4">
            <h4 className="text-sm font-semibold text-[#F4EE8E] uppercase tracking-wide font-sans">Партнерская программа RR</h4>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              Приглашайте дружественные компании и получайте пожизненный бонус в размере <strong className="text-amber-100 text-sm">15%</strong> от всех их оплат на свой баланс!
            </p>

            <div className="bg-[#17344F]/50 p-4 rounded-xl border border-white/5 space-y-3">
              <div>
                <span className="block text-[10px] text-slate-400">Ваша партнерская ссылка:</span>
                <div className="flex items-center gap-1.5 mt-1 bg-[#1E4468]/60 p-2 rounded-lg border border-white/10">
                  <code className="text-[10px] text-amber-200 truncate flex-1 font-mono">{refLink}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(refLink);
                      alert('Ссылка скопирована!');
                    }}
                    className="p-1.5 rounded bg-[#1E4468]/60 text-slate-300 hover:text-white text-[10px] font-sans transition-colors cursor-pointer"
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
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-[#17344F]/30 rounded-xl">
                <span className="text-[9px] text-slate-400 uppercase">Приглашено</span>
                <p className="text-lg font-bold font-mono text-emerald-400">{currentUser?.invitedUsersCount || 3} комп.</p>
              </div>
              <div className="p-3 bg-[#17344F]/30 rounded-xl">
                <span className="text-[9px] text-slate-400 uppercase">Бонусы на балансе</span>
                <p className="text-lg font-bold font-mono text-amber-200">{currentUser?.bonusesEarned || 2450} ₽</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-white/5 bg-[#17344F]/20 flex flex-col items-center justify-center text-center space-y-2">
            <Shield size={24} className="text-slate-500" />
            <p className="text-slate-400 text-xs">Партнерская программа и реферальная статистика доступны только для ролей «Директор» и «Администратор».</p>
          </div>
        )}
      </div>
    </div>
  );
}
