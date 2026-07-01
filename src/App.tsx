import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import WikiPage from './pages/WikiPage';
import OfertaPage from './pages/OfertaPage';
import CabinetPage from './pages/CabinetPage';
import AIAssistant from './components/AIAssistant';
import { UserRole, UserProfile } from './types';
import { Sparkles, Mail, Lock, UserCheck } from 'lucide-react';

export default function App() {
  // Simple browser routing state syncing with window.location.pathname
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Auth states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // Check if there is a cached user in localstorage
    const saved = localStorage.getItem('rr_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    // Default mock user profile with an 8-digit ID
    return {
      id: '48275916',
      name: 'Алексей Иванов',
      email: 'alex.director@example.com',
      role: UserRole.DIRECTOR,
      telegramHandle: '@alex_rr_dir',
      position: 'Генеральный директор',
      referralCode: 'alexdirector',
      bonusesEarned: 2450,
      invitedUsersCount: 3
    };
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');

  // Handle path navigation across the applet
  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync back/forward browser buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update user state helper
  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    localStorage.setItem('rr_user', JSON.stringify(updated));
  };

  // Logout trigger
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rr_user');
    handleNavigate('/');
  };

  // Google Login / Registration submit
  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a random 8-digit numeric ID string as requested: "создавай порядковый номер пользователя в системе как ID в виде 8значного числа."
    const generatedId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const cleanEmail = loginEmail.trim() || 'user@example.com';
    const cleanName = loginName.trim() || 'Новый Пользователь';
    
    // Special rule check: "По-умолчанию админ с почтой shishkarnem@gmail.com и админ может поменять роль руководителю на админа."
    let assignedRole = UserRole.EMPLOYEE;
    if (cleanEmail.toLowerCase() === 'shishkarnem@gmail.com') {
      assignedRole = UserRole.ADMIN;
    } else {
      // Allow choosing, default to Director for quick testing if name contains "директор" or email starts with dir
      if (cleanEmail.includes('dir') || cleanName.toLowerCase().includes('директор')) {
        assignedRole = UserRole.DIRECTOR;
      }
    }

    const newUser: UserProfile = {
      id: generatedId,
      name: cleanName,
      email: cleanEmail,
      role: assignedRole,
      telegramHandle: '@' + cleanEmail.split('@')[0],
      position: assignedRole === UserRole.ADMIN ? 'Глобальный администратор' : assignedRole === UserRole.DIRECTOR ? 'Генеральный директор' : 'Сотрудник отдела',
      referralCode: cleanName.toLowerCase().replace(/[^a-z]/g, '') || 'partner' + generatedId.slice(-4),
      bonusesEarned: 0,
      invitedUsersCount: 0
    };

    handleUpdateUser(newUser);
    setIsLoginModalOpen(false);
    setLoginEmail('');
    setLoginName('');
    handleNavigate('/cabinet');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#17344F] via-[#1E4468] to-[#265582] text-white selection:bg-amber-200 selection:text-slate-900 overflow-x-hidden">
      
      {/* GLOBAL HEADER */}
      <Header 
        currentPath={currentPath}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* DYNAMIC CONTENT ROUTER */}
      <div className="flex-1 w-full">
        {currentPath === '/' && (
          <LandingPage 
            onNavigate={handleNavigate}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}
        {currentPath === '/wiki' && (
          <WikiPage />
        )}
        {currentPath === '/oferta' && (
          <OfertaPage />
        )}
        {currentPath.startsWith('/cabinet') && (
          <CabinetPage 
            currentPath={currentPath}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </div>

      {/* GLOBAL FOOTER (not shown on active cabinet subpages to save spacing, but shown on main paths) */}
      {!currentPath.startsWith('/cabinet') && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* GLOBAL FLOATING AI ASSISTANT WIKI BOT (Visible on all pages, left bottom corner) */}
      <AIAssistant />

      {/* AUTH REGISTRATION GOOGLE MOCK MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17344F]/75 backdrop-blur-sm animate-fade-in" id="auth-modal-container">
          <div className="relative w-full max-w-md border border-amber-200/20 bg-gradient-to-b from-[#17344F] to-[#265582] rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden" id="auth-modal-box">
            
            {/* Liquid glass aesthetic effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10" />

            <div className="text-center space-y-3 mb-6 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#17344F] border border-amber-200 flex items-center justify-center mx-auto text-[#E7C768]">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-[#F4EE8E] font-sans">Авторизация ИИ Рапорт</h3>
              <p className="text-xs text-slate-300">Вход по умолчанию свободный. Заполните форму, и система сгенерирует ваш личный 8-значный ID!</p>
            </div>

            <form onSubmit={handleGoogleLogin} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Ваше полное имя *</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="Например: Иван Смирнов"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] transition-colors"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">👤</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Электронная почта (E-mail) *</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="shishkarnem@gmail.com (для админа)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] transition-colors"
                  />
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1E4468]/40 border border-amber-200/10 text-[11px] text-slate-200 leading-relaxed space-y-1 font-sans">
                <p className="font-bold text-[#F4EE8E] flex items-center gap-1">💡 Подсказка для проверки:</p>
                <p>• Введите почту <strong className="text-white font-mono">shishkarnem@gmail.com</strong> для входа под ролью <strong className="text-amber-200">Администратора (CRM)</strong>.</p>
                <p>• Любая другая почта зарегистрирует вас с ролью Сотрудника или Директора.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer font-sans text-center"
                >
                  Зарегистрироваться через Google
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
