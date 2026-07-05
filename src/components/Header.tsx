import React, { useState } from 'react';
import { ShieldCheck, BookOpen, User, LogOut, Layers, Menu, X, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currentUser: { name: string; role: UserRole; id: string } | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
}

export default function Header({
  currentPath,
  onNavigate,
  currentUser,
  onLogout,
  onOpenLoginModal
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-gradient-to-r from-[#17344F]/95 to-[#265582]/95 backdrop-blur-md text-white" id="app-header">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Logo and Brand */}
        <div 
          onClick={() => onNavigate('/')} 
          className="flex items-center gap-2.5 cursor-pointer group"
          id="header-logo-container"
        >
          <img 
            src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR-Logo.png" 
            alt="RR Logo" 
            className="w-9 h-9 object-contain group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(231,199,104,0.2)]"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-lg font-extrabold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] bg-clip-text text-transparent leading-none font-sans tracking-wide">
              ИИ РАПОРТ
            </h1>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('/')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              currentPath === '/' 
                ? 'bg-gradient-to-r from-[#17344F] to-[#265582] text-[#F4EE8E] border border-amber-200/20' 
                : 'text-slate-300 hover:text-white'
            }`}
            id="nav-home"
          >
            Главная
          </button>
          <button
            onClick={() => onNavigate('/wiki')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              currentPath === '/wiki' 
                ? 'bg-gradient-to-r from-[#17344F] to-[#265582] text-[#F4EE8E] border border-amber-200/20' 
                : 'text-slate-300 hover:text-white'
            }`}
            id="nav-wiki"
          >
            База знаний (Вики)
          </button>
          <button
            onClick={() => onNavigate('/blog')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              currentPath.startsWith('/blog') 
                ? 'bg-gradient-to-r from-[#17344F] to-[#265582] text-[#F4EE8E] border border-amber-200/20' 
                : 'text-slate-300 hover:text-white'
            }`}
            id="nav-blog"
          >
            Блог
          </button>
        </nav>

        {/* Right Section: Auth / Quick Dashboard */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Desktop view buttons */}
              <div className="hidden md:flex items-center gap-2">
                {/* Profile Shortcut */}
                <button
                  onClick={() => onNavigate('/cabinet/profile')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-[#1E4468]/60 hover:bg-[#1E4468] transition-colors cursor-pointer text-xs font-semibold text-amber-200"
                  id="header-profile-btn"
                >
                  <User size={13} />
                  <span>{currentUser.name} ({currentUser.role === UserRole.ADMIN ? 'Админ' : currentUser.role === UserRole.DIRECTOR ? 'Директор' : currentUser.role === UserRole.MANAGER ? 'Руководитель' : 'Сотрудник'})</span>
                </button>

                {/* Enter Cabinet */}
                <button
                  onClick={() => onNavigate('/cabinet')}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 font-sans shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                  id="header-cabinet-btn"
                >
                  <Layers size={13} />
                  Кабинет
                </button>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Выйти из аккаунта"
                  id="header-logout-btn"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:block">
              <button
                onClick={onOpenLoginModal}
                className="px-5 py-2 text-xs font-semibold rounded-xl border border-[#E7C768] bg-[#1E4468]/60 hover:bg-gradient-to-r hover:from-[#F4EE8E] hover:to-[#D99E41] hover:text-slate-900 transition-all duration-300 cursor-pointer flex items-center gap-1.5 font-sans"
                id="header-login-trigger-btn"
              >
                <User size={14} />
                Войти в систему
              </button>
            </div>
          )}

          {/* Mobile Menu Burger Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-white/10 bg-[#1E4468]/50 text-slate-200 hover:text-white hover:bg-[#1E4468] transition-all cursor-pointer"
            id="mobile-menu-burger-btn"
            title="Открыть меню"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE NAV OVERLAY */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-gradient-to-b from-[#17344F] to-[#265582] px-4 py-6 space-y-5 animate-fade-in text-left shadow-2xl relative z-50">
          {/* User profile info or login trigger */}
          {currentUser ? (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1E4468] border border-amber-200 flex items-center justify-center font-bold text-amber-200">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{currentUser.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {currentUser.id} • {currentUser.role === UserRole.ADMIN ? 'Админ' : currentUser.role === UserRole.DIRECTOR ? 'Директор' : currentUser.role === UserRole.MANAGER ? 'Руководитель' : 'Сотрудник'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('/cabinet');
                  }}
                  className="py-2 text-center text-xs font-bold rounded-xl bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 flex items-center justify-center gap-1.5"
                >
                  <Layers size={13} />
                  Кабинет
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="py-2 text-center text-xs font-bold rounded-xl border border-white/10 text-red-300 hover:bg-red-500/10 flex items-center justify-center gap-1.5"
                >
                  <LogOut size={13} />
                  Выйти
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLoginModal();
              }}
              className="w-full py-3 text-center text-xs font-bold rounded-xl bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 flex items-center justify-center gap-1.5"
            >
              <User size={14} />
              Войти в систему
            </button>
          )}

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-bold text-amber-200 uppercase tracking-wider px-3 mb-1">Навигация</h5>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('/');
              }}
              className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                currentPath === '/' ? 'bg-[#1E4468] text-[#F4EE8E]' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>🏠</span> Главная страница
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('/wiki');
              }}
              className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                currentPath === '/wiki' ? 'bg-[#1E4468] text-[#F4EE8E]' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>📚</span> База знаний (Вики)
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate('/blog');
              }}
              className={`w-full px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                currentPath.startsWith('/blog') ? 'bg-[#1E4468] text-[#F4EE8E]' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>✍️</span> Блог компании
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
