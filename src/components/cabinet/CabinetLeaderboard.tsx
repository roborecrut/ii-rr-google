import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, Flame, Coins, Award, Zap, Search, 
  ChevronRight, ShoppingBag, CheckCircle2, Star, Target,
  ArrowUpRight, HelpCircle, Gift, Sparkles, User
} from 'lucide-react';
import { UserProfile, SubmittedReport, UserRole } from '../../types';

interface CabinetLeaderboardProps {
  currentUser: UserProfile | null;
  mockEmployees: UserProfile[];
  reports: SubmittedReport[];
  onNavigateTab: (tab: string) => void;
}

// Fixed Achievements list to show in rewards/badges help
const SYSTEM_BADGES = [
  { id: 'early', name: 'Ранняя пташка', desc: 'Сдал рапорт до 11:00 утра', icon: '🌅', color: 'from-amber-400 to-orange-500' },
  { id: 'perfect_week', name: 'Дисциплина сталь', desc: '7 рапортов без пропусков подряд', icon: '🛡️', color: 'from-blue-400 to-indigo-500' },
  { id: 'ai_wizard', name: 'ИИ-Синтез', desc: 'Использовал ИИ для рерайтинга и улучшения качества', icon: '🔮', color: 'from-purple-400 to-pink-500' },
  { id: 'golden_report', name: 'Золотой рапорт', desc: 'Оценка Quality Score 95%+', icon: '🥇', color: 'from-yellow-400 to-amber-500' }
];

const DEFAULT_STORE_ITEMS = [
  { id: 'day_off', name: 'Один дополнительный день отпуска/отгула', cost: 1800, type: 'VACATION', desc: 'Согласуется с руководителем в течение 24 часов.', icon: '🏖️' },
  { id: 'remote_week', name: 'Неделя полностью удаленной работы', cost: 1200, type: 'WORK', desc: 'Работайте из любой точки мира целую рабочую неделю.', icon: '💻' },
  { id: 'branded_hoodie', name: 'Лимитированный брендированный худи ИИ РАПОРТ', cost: 2500, type: 'MERCH', desc: 'Удобный оверсайз худи с вышивкой и золотым логотипом.', icon: '🧥' },
  { id: 'corporate_lunch', name: 'Премиум-ланч из ресторана за счет компании', cost: 500, type: 'FOOD', desc: 'Закажем доставку любого сета прямо в офис или домой.', icon: '🍣' },
  { id: 'ceo_coaching', name: 'Личная 30-мин сессия менторинга с Директором', cost: 3000, type: 'EDUCATION', desc: 'Обсуждение карьерного трека и ваших проектов тет-а-тет.', icon: '🧠' },
  { id: 'star_badge', name: 'Корона лучшего сотрудника в профиле на месяц', cost: 350, type: 'STATUS', desc: 'Выделяет ваш профиль золотой светящейся аурой во всех рапортах.', icon: '👑' }
];

export default function CabinetLeaderboard({
  currentUser,
  mockEmployees,
  reports,
  onNavigateTab
}: CabinetLeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'streak' | 'xp'>('all');
  const [activeTabStore, setActiveTabStore] = useState<'leaderboard' | 'quests' | 'store'>('leaderboard');
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [userCoins, setUserCoins] = useState<number>(1450); // Initial coins balance for current user

  const [storeItems, setStoreItems] = useState(() => {
    const saved = localStorage.getItem('rr_store_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_STORE_ITEMS;
      }
    }
    return DEFAULT_STORE_ITEMS;
  });
  const [storeSubTab, setStoreSubTab] = useState<'view' | 'edit'>('view');

  // New item states for admin editor
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState<number>(500);
  const [newItemType, setNewItemType] = useState('MERCH');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemIcon, setNewItemIcon] = useState('🎁');

  const handleAddStoreItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemDesc.trim()) {
      alert('Пожалуйста, заполните название и описание привилегии!');
      return;
    }
    const newItem = {
      id: 'store-' + Date.now(),
      name: newItemName.trim(),
      cost: Number(newItemCost) || 100,
      type: newItemType,
      desc: newItemDesc.trim(),
      icon: newItemIcon.trim() || '🎁'
    };
    const nextItems = [...storeItems, newItem];
    setStoreItems(nextItems);
    localStorage.setItem('rr_store_items', JSON.stringify(nextItems));
    
    // reset form
    setNewItemName('');
    setNewItemCost(500);
    setNewItemType('MERCH');
    setNewItemDesc('');
    setNewItemIcon('🎁');
    setStoreSubTab('view');
    alert(`Привилегия "${newItem.name}" успешно добавлена в Магазин Благ!`);
  };

  const handleDeleteStoreItem = (itemId: string) => {
    if (!confirm('Вы действительно хотите удалить эту привилегию из магазина?')) return;
    const nextItems = storeItems.filter((item: any) => item.id !== itemId);
    setStoreItems(nextItems);
    localStorage.setItem('rr_store_items', JSON.stringify(nextItems));
  };

  // Calculate user stats from actual reports to make it live and gamified!
  const currentUserReports = reports.filter(r => r.employeeId === currentUser?.id);
  const reportsCount = currentUserReports.length;
  
  // Calculate average quality score or default to 90
  const avgQualityScore = reportsCount > 0 
    ? Math.round(currentUserReports.reduce((acc, r) => acc + (r.qualityScore || 85), 0) / reportsCount)
    : 88;

  // Let's compute points / XP dynamically:
  // Submitting reports = 100 XP each. Quality score multiplier. Mock base XP for historic data.
  const calculatedCurrentUserXp = 500 + (reportsCount * 120) + (avgQualityScore * 5);
  const calculatedCurrentUserStreak = reportsCount > 0 ? Math.min(reportsCount + 2, 9) : 4; // Mock realistic streak based on reports filled
  const currentUserLevel = Math.floor(calculatedCurrentUserXp / 500) + 1;
  const xpNeededForNextLevel = 500;
  const currentLevelProgress = calculatedCurrentUserXp % 500;
  const progressPercent = Math.min(Math.round((currentLevelProgress / xpNeededForNextLevel) * 100), 100);

  // Map other mock employees and inject realistic gamified fields
  const gamifiedEmployeesList = mockEmployees.map((emp, index) => {
    // Generate stable values based on employee ID so it's consistent
    const idNum = parseInt(emp.id) || index;
    const baseReports = (idNum % 10) + 12;
    const baseStreak = (idNum % 7) + 1;
    const baseQuality = 80 + (idNum % 18);
    const baseBonus = (idNum % 5) * 150 + 200;

    // Calculate XP
    const empReports = reports.filter(r => r.employeeId === emp.id).length || baseReports;
    const finalReportsCount = emp.id === currentUser?.id ? reportsCount : empReports;
    const finalStreak = emp.id === currentUser?.id ? calculatedCurrentUserStreak : baseStreak;
    const finalQualityAvg = emp.id === currentUser?.id ? avgQualityScore : baseQuality;
    const finalXp = emp.id === currentUser?.id ? calculatedCurrentUserXp : (400 + (finalReportsCount * 120) + (finalQualityAvg * 5));
    const finalLevel = Math.floor(finalXp / 500) + 1;

    // Badges list
    const badges: typeof SYSTEM_BADGES = [];
    if (finalQualityAvg >= 93) badges.push(SYSTEM_BADGES[3]);
    if (finalStreak >= 6) badges.push(SYSTEM_BADGES[1]);
    if (idNum % 2 === 0) badges.push(SYSTEM_BADGES[2]);
    if (idNum % 3 === 0) badges.push(SYSTEM_BADGES[0]);
    if (badges.length === 0) badges.push(SYSTEM_BADGES[2]); // fallback

    return {
      ...emp,
      xp: finalXp,
      level: finalLevel,
      streak: finalStreak,
      reportsSubmitted: finalReportsCount,
      qualityScoreAvg: finalQualityAvg,
      coins: finalXp - 300 > 0 ? Math.round((finalXp - 300) * 0.8) : 100,
      badges
    };
  });

  // Sort employees by XP
  const sortedEmployees = [...gamifiedEmployeesList].sort((a, b) => b.xp - a.xp);

  // Find rank of the current user
  const currentUserRank = sortedEmployees.findIndex(emp => emp.id === currentUser?.id) + 1 || 3;

  // Filter list by search term
  const filteredEmployees = sortedEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (emp.position || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Podium (Top 3)
  const firstPlace = sortedEmployees[0];
  const secondPlace = sortedEmployees[1];
  const thirdPlace = sortedEmployees[2];

  // Daily Quests State (mocked interactive buttons)
  const [completedQuests, setCompletedQuests] = useState<string[]>(reportsCount > 0 ? ['daily_report'] : []);
  const [questSuccessMsg, setQuestSuccessMsg] = useState<string | null>(null);

  const handleClaimQuest = (questId: string, xpReward: number, coinReward: number) => {
    if (completedQuests.includes(questId)) return;
    setCompletedQuests(prev => [...prev, questId]);
    setUserCoins(prev => prev + coinReward);
    
    setQuestSuccessMsg(`+${xpReward} XP и +${coinReward} монет успешно начислены на баланс геймификации! Вы повышаете мотивацию!`);
    setTimeout(() => setQuestSuccessMsg(null), 4000);
  };

  const handleBuyReward = (rewardId: string, cost: number, name: string) => {
    if (userCoins < cost) {
      alert(`Недостаточно корпоративных монет! У вас ${userCoins} 🪙, а требуется ${cost} 🪙. Заполняйте рапорты вовремя и собирайте комбо-стрики для заработка!`);
      return;
    }
    setUserCoins(prev => prev - cost);
    setSelectedReward(name);
  };

  return (
    <div className="space-y-6" id="leaderboard-section-root">
      
      {/* HEADER BLOCK WITH SUBTITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4" id="leaderboard-header-row">
        <div>
          <h2 className="text-xl font-bold text-[#F4EE8E] flex items-center gap-2 font-sans">
            <Trophy className="text-[#E7C768] animate-bounce" size={20} />
            Лига Профессионалов & Рейтинг
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Геймифицированная система мотивации сотрудников. Заполняйте рапорты вовремя, увеличивайте ценность ИИ, зарабатывайте достижения и обменивайте коины на корпоративные бонусы!
          </p>
        </div>

        {/* INNER TABS SELECTOR */}
        <div className="flex bg-[#17344F]/80 p-1 rounded-xl border border-white/5 self-start sm:self-auto" id="leaderboard-tab-pill">
          <button
            onClick={() => setActiveTabStore('leaderboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTabStore === 'leaderboard' ? 'bg-[#1E4468] text-[#F4EE8E]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy size={13} />
            Лига
          </button>
          <button
            onClick={() => setActiveTabStore('quests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTabStore === 'quests' ? 'bg-[#1E4468] text-[#F4EE8E]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target size={13} />
            Квесты
          </button>
          <button
            onClick={() => setActiveTabStore('store')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTabStore === 'store' ? 'bg-[#1E4468] text-[#F4EE8E]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag size={13} />
            Магазин Благ
          </button>
        </div>
      </div>

      {/* RECENT CLAIM SUCCESS BANNER */}
      {questSuccessMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg"
          id="quest-success-banner"
        >
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{questSuccessMsg}</span>
        </motion.div>
      )}

      {/* USER GAMIFIED STATUS CARD (PERSONAL COCKPIT) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1E4468]/60 to-[#17344F]/90 border border-amber-200/15 relative overflow-hidden shadow-2xl" id="leaderboard-user-panel">
        {/* Glow decoration */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#E7C768]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* User profile with rank */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#1E4468] border-2 border-[#E7C768] flex items-center justify-center text-[#F4EE8E] text-2xl font-black shadow-lg">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-[10px] w-6 h-6 rounded-full border-2 border-[#17344F] flex items-center justify-center shadow">
                {currentUserRank}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-[9px] bg-[#E7C768]/15 text-amber-200 font-extrabold px-2 py-0.5 rounded-full border border-amber-400/20 tracking-wider">
                УРОВЕНЬ {currentUserLevel} • ТИР {currentUserLevel >= 4 ? 'ЛЕГЕНДА' : currentUserLevel >= 3 ? 'ЭКСПЕРТ' : 'ПРОФИ'}
              </span>
              <h3 className="text-sm font-bold text-white leading-tight">{currentUser?.name}</h3>
              <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Star size={10} className="text-amber-300" />
                Личная дисциплина: {avgQualityScore}% Quality Score
              </p>
            </div>
          </div>

          {/* Level Progress bar */}
          <div className="md:col-span-4 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Ваш Прогресс XP</span>
              <span className="text-amber-200 font-mono">{calculatedCurrentUserXp} XP / {currentUserLevel * 500}</span>
            </div>
            <div className="w-full bg-[#17344F] rounded-full h-2.5 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-amber-400 via-[#F4EE8E] to-amber-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              До уровня {currentUserLevel + 1} осталось <strong className="text-slate-200 font-mono">{currentUserLevel * 500 - calculatedCurrentUserXp} XP</strong>
            </p>
          </div>

          {/* Stats Capsule Column */}
          <div className="md:col-span-4 grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#17344F]/80 border border-white/5 text-center flex flex-col justify-center items-center shadow-inner">
              <div className="flex items-center gap-1">
                <Flame size={14} className="text-orange-500 animate-pulse" />
                <span className="text-white text-base font-black font-mono">{calculatedCurrentUserStreak}</span>
              </div>
              <span className="text-[9px] text-slate-400 uppercase font-bold mt-1 tracking-wider leading-none">Стрик (дней)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#17344F]/80 border border-white/5 text-center flex flex-col justify-center items-center shadow-inner">
              <div className="flex items-center gap-1">
                <Coins size={14} className="text-[#E7C768]" />
                <span className="text-amber-200 text-base font-black font-mono">{userCoins}</span>
              </div>
              <span className="text-[9px] text-slate-400 uppercase font-bold mt-1 tracking-wider leading-none">Баланс монет</span>
            </div>
          </div>
        </div>
      </div>

      {/* IF CHOSEN "LEADERBOARD" TAB */}
      {activeTabStore === 'leaderboard' && (
        <div className="space-y-6 animate-fade-in" id="leaderboard-tab-content">
          
          {/* TOP 3 PODIUM HERO CONTAINER */}
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto pt-6 pb-2 items-end text-center" id="podium-container">
            
            {/* 2nd Place */}
            {secondPlace && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-slate-700 border-2 border-slate-300 flex items-center justify-center text-white text-base font-black shadow-lg">
                    {secondPlace.name.charAt(0)}
                  </div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 font-bold text-[9px] px-2 py-0.5 rounded-full shadow">
                    #2
                  </div>
                </div>
                <div className="mt-2.5">
                  <h4 className="text-[11px] font-bold text-slate-100 truncate max-w-[90px] mx-auto">{secondPlace.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{secondPlace.xp} XP</p>
                </div>
                {/* Visual block */}
                <div className="w-full bg-slate-400/10 border border-slate-300/15 h-20 rounded-t-xl mt-3 flex items-center justify-center shadow-inner">
                  <span className="text-slate-400 text-lg font-black font-mono">II</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {firstPlace && (
              <div className="flex flex-col items-center z-10 -mt-6">
                <Trophy className="text-[#E7C768] h-6 w-6 animate-pulse mb-1" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-amber-200 flex items-center justify-center text-slate-950 text-xl font-black shadow-2xl shadow-amber-500/10 ring-4 ring-amber-400/20">
                    {firstPlace.name.charAt(0)}
                  </div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#E7C768] text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg">
                    ЧЕМПИОН
                  </div>
                </div>
                <div className="mt-2.5">
                  <h4 className="text-xs font-extrabold text-amber-200 truncate max-w-[110px] mx-auto">{firstPlace.name}</h4>
                  <p className="text-[10px] text-amber-100 font-mono mt-0.5 flex items-center justify-center gap-0.5 font-bold">
                    <Zap size={10} />
                    {firstPlace.xp} XP
                  </p>
                </div>
                {/* Visual block */}
                <div className="w-full bg-amber-400/10 border border-amber-200/20 h-28 rounded-t-xl mt-3 flex items-center justify-center shadow-2xl relative">
                  <span className="text-[#E7C768] text-2xl font-black font-mono">I</span>
                  <div className="absolute top-2 w-full text-[9px] text-amber-400 uppercase tracking-widest font-bold">Лига ИИ</div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {thirdPlace && (
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[#1E4468] border-2 border-amber-600/50 flex items-center justify-center text-white text-base font-black shadow-lg">
                    {thirdPlace.name.charAt(0)}
                  </div>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-700/80 text-amber-100 font-bold text-[9px] px-2 py-0.5 rounded-full shadow">
                    #3
                  </div>
                </div>
                <div className="mt-2.5">
                  <h4 className="text-[11px] font-bold text-slate-200 truncate max-w-[90px] mx-auto">{thirdPlace.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{thirdPlace.xp} XP</p>
                </div>
                {/* Visual block */}
                <div className="w-full bg-amber-700/10 border border-amber-700/15 h-16 rounded-t-xl mt-3 flex items-center justify-center shadow-inner">
                  <span className="text-amber-600 text-base font-black font-mono">III</span>
                </div>
              </div>
            )}

          </div>

          {/* SEARCH BAR & LIST */}
          <div className="space-y-4" id="leaderboard-table-block">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between" id="leaderboard-controls">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider self-start">Все участники ({sortedEmployees.length})</h3>
              
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Поиск сотрудника..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-[#E7C768] transition-colors"
                />
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* LEADERBOARD TABLE */}
            <div className="rounded-2xl border border-white/10 overflow-x-auto bg-[#17344F]/20 scrollbar-thin scrollbar-thumb-white/10 touch-pan-x" id="leaderboard-table-container">
              <table className="w-full text-left border-collapse text-xs min-w-[580px]" id="leaderboard-table">
                <thead>
                  <tr className="bg-[#17344F]/60 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">
                    <th className="py-3 px-4 w-12 text-center">Ранг</th>
                    <th className="py-3 px-4">Сотрудник</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Роль / Отдел</th>
                    <th className="py-3 px-4 text-center">Стрик</th>
                    <th className="py-3 px-4 text-center">Рапорты</th>
                    <th className="py-3 px-4 text-right">Очки XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEmployees.map((emp, idx) => {
                    const originalIndex = sortedEmployees.findIndex(e => e.id === emp.id) + 1;
                    const isSelf = emp.id === currentUser?.id;
                    
                    return (
                      <tr 
                        key={emp.id} 
                        className={`hover:bg-[#1E4468]/30 transition-colors ${
                          isSelf ? 'bg-amber-400/5 hover:bg-amber-400/10 border-l-4 border-[#E7C768]' : ''
                        }`}
                      >
                        {/* Rank cell */}
                        <td className="py-3 px-4 text-center font-bold whitespace-nowrap">
                          {originalIndex === 1 ? (
                            <span className="text-lg">🥇</span>
                          ) : originalIndex === 2 ? (
                            <span className="text-lg">🥈</span>
                          ) : originalIndex === 3 ? (
                            <span className="text-lg">🥉</span>
                          ) : (
                            <span className="text-slate-400 font-mono">{originalIndex}</span>
                          )}
                        </td>

                        {/* Name Cell */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#17344F] border border-white/10 flex items-center justify-center font-bold text-white relative shrink-0">
                              {emp.name.charAt(0)}
                              {emp.xp > 1800 && (
                                <span className="absolute -top-1 -right-1" title="Топ рапортер">🌟</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {emp.name}
                                {isSelf && (
                                  <span className="text-[8px] bg-[#E7C768] text-slate-900 font-extrabold px-1.5 py-0.5 rounded uppercase">ВЫ</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-sans mt-0.5">{emp.position || 'Сотрудник'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Department cell */}
                        <td className="py-3 px-4 hidden sm:table-cell text-slate-300 whitespace-nowrap">
                          <span className="text-[10px] bg-[#1E4468]/40 px-2.5 py-1 rounded-lg border border-white/5">
                            {emp.role === UserRole.ADMIN ? 'Администратор' : emp.role === UserRole.DIRECTOR ? 'Директор' : emp.role === UserRole.MANAGER ? 'Руководитель' : 'Сотрудник'}
                          </span>
                        </td>

                        {/* Streak cell */}
                        <td className="py-3 px-4 text-center font-bold whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <Flame size={12} className={emp.streak >= 5 ? 'text-orange-500' : 'text-slate-500'} />
                            <span className="font-mono text-white">{emp.streak} дн</span>
                          </div>
                        </td>

                        {/* Reports Count Cell */}
                        <td className="py-3 px-4 text-center font-mono text-slate-300 whitespace-nowrap">
                          {emp.reportsSubmitted}
                        </td>

                        {/* XP points cell */}
                        <td className="py-3 px-4 text-right font-black text-amber-200 font-mono text-sm whitespace-nowrap">
                          {emp.xp}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Сотрудники по вашему запросу не найдены.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Achievements/Badges help block */}
            <div className="p-4 rounded-xl bg-[#1E4468]/20 border border-white/5 space-y-3" id="achievements-help">
              <h4 className="text-xs font-bold text-[#F4EE8E] flex items-center gap-1.5 uppercase tracking-wide">
                <Award size={14} className="text-amber-300" />
                Служебные достижения и знаки отличия
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Достижения выдаются автоматически нейросетью ИИ Рапорт при соблюдении регламентов и повышают ваш еженедельный множитель наград!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {SYSTEM_BADGES.map((badge) => (
                  <div key={badge.id} className="p-3 rounded-xl bg-[#17344F]/50 border border-white/5 flex items-start gap-2.5 shadow-sm">
                    <span className="text-xl shrink-0 p-1 bg-[#17344F] rounded-lg border border-white/10">{badge.icon}</span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-slate-200">{badge.name}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* IF CHOSEN "QUESTS" TAB */}
      {activeTabStore === 'quests' && (
        <div className="space-y-4 animate-fade-in" id="quests-tab-content">
          <div className="p-4 rounded-xl bg-[#1E4468]/30 border border-amber-200/10 space-y-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-amber-200" />
              Ежедневные & Еженедельные Задачи
            </h3>
            <p className="text-[11px] text-slate-400">
              Выполняйте эти простые задания каждый день во время заполнения отчетов, чтобы заработать опыт (XP) и корпоративные коины.
            </p>
          </div>

          <div className="space-y-3" id="quests-list">
            
            {/* Quest 1 */}
            <div className="p-4 rounded-xl bg-[#17344F]/40 border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-white/10 transition-colors">
              <div className="flex gap-3 items-start">
                <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-200 border border-amber-400/20 text-lg">
                  📝
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
                    Сдать сегодняшний отчет
                    {reportsCount > 0 ? (
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-300 font-bold px-2 py-0.5 rounded">Выполнено сегодня</span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/15 text-amber-300 font-bold px-2 py-0.5 rounded">В ожидании</span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">Отправьте ежедневный рапорт за рабочую смену. Повышает дисциплину команды.</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-300">
                    <span className="flex items-center gap-1"><Zap size={11} className="text-amber-400" /> +120 XP</span>
                    <span className="flex items-center gap-1"><Coins size={11} className="text-[#E7C768]" /> +80 монет</span>
                  </div>
                </div>
              </div>
              
              {reportsCount > 0 ? (
                <div className="p-2 text-emerald-400 flex items-center gap-1.5 self-end sm:self-auto font-bold text-xs">
                  <CheckCircle2 size={16} /> Готово
                </div>
              ) : (
                <button
                  onClick={() => onNavigateTab('fill_report')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-[#D99E41] hover:brightness-110 active:scale-95 text-slate-900 text-xs font-extrabold transition-all cursor-pointer shadow-md self-end sm:self-auto"
                >
                  Перейти к заполнению
                </button>
              )}
            </div>

            {/* Quest 2 */}
            <div className="p-4 rounded-xl bg-[#17344F]/40 border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-white/10 transition-colors">
              <div className="flex gap-3 items-start">
                <div className="p-2.5 rounded-xl bg-purple-400/10 text-purple-200 border border-purple-400/20 text-lg">
                  🤖
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
                    Использовать рерайт ИИ
                    {completedQuests.includes('ai_polish') ? (
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-300 font-bold px-2 py-0.5 rounded">Выполнено</span>
                    ) : (
                      <span className="text-[9px] bg-slate-500/20 text-slate-400 font-bold px-2 py-0.5 rounded">Доступно</span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">Примените генеративное улучшение отчета с помощью ИИ РАПОРТ перед отправкой.</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-300">
                    <span className="flex items-center gap-1"><Zap size={11} className="text-amber-400" /> +50 XP</span>
                    <span className="flex items-center gap-1"><Coins size={11} className="text-[#E7C768]" /> +30 монет</span>
                  </div>
                </div>
              </div>
              
              {completedQuests.includes('ai_polish') ? (
                <div className="p-2 text-emerald-400 flex items-center gap-1.5 self-end sm:self-auto font-bold text-xs">
                  <CheckCircle2 size={16} /> Готово
                </div>
              ) : (
                <button
                  onClick={() => handleClaimQuest('ai_polish', 50, 30)}
                  className="px-4 py-2 rounded-xl bg-[#1E4468]/60 hover:bg-[#1E4468]/90 text-[#F4EE8E] border border-[#E7C768]/30 text-xs font-extrabold transition-all cursor-pointer self-end sm:self-auto"
                >
                  Выполнить квест (симулировать)
                </button>
              )}
            </div>

            {/* Quest 3 */}
            <div className="p-4 rounded-xl bg-[#17344F]/40 border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-white/10 transition-colors">
              <div className="flex gap-3 items-start">
                <div className="p-2.5 rounded-xl bg-rose-400/10 text-rose-200 border border-rose-400/20 text-lg">
                  🎯
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
                    Золотой Стандарт качества
                    {completedQuests.includes('golden_score') ? (
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-300 font-bold px-2 py-0.5 rounded">Выполнено</span>
                    ) : (
                      <span className="text-[9px] bg-slate-500/20 text-slate-400 font-bold px-2 py-0.5 rounded">Доступно</span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">Добейтесь оценки качества Quality Score от ИИ выше 90% для любого рапорта.</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-300">
                    <span className="flex items-center gap-1"><Zap size={11} className="text-amber-400" /> +100 XP</span>
                    <span className="flex items-center gap-1"><Coins size={11} className="text-[#E7C768]" /> +60 монет</span>
                  </div>
                </div>
              </div>
              
              {completedQuests.includes('golden_score') ? (
                <div className="p-2 text-emerald-400 flex items-center gap-1.5 self-end sm:self-auto font-bold text-xs">
                  <CheckCircle2 size={16} /> Готово
                </div>
              ) : (
                <button
                  onClick={() => handleClaimQuest('golden_score', 100, 60)}
                  className="px-4 py-2 rounded-xl bg-[#1E4468]/60 hover:bg-[#1E4468]/90 text-[#F4EE8E] border border-[#E7C768]/30 text-xs font-extrabold transition-all cursor-pointer self-end sm:self-auto"
                >
                  Завершить (симулировать)
                </button>
              )}
            </div>

            {/* Quest 4 */}
            <div className="p-4 rounded-xl bg-[#17344F]/40 border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-white/10 transition-colors">
              <div className="flex gap-3 items-start">
                <div className="p-2.5 rounded-xl bg-indigo-400/10 text-indigo-200 border border-indigo-400/20 text-lg">
                  🔥
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
                    Дисциплина — Неделя на связи
                    {completedQuests.includes('streak_week') ? (
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-300 font-bold px-2 py-0.5 rounded">Выполнено</span>
                    ) : (
                      <span className="text-[9px] bg-slate-500/20 text-slate-400 font-bold px-2 py-0.5 rounded">Доступно</span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">Поддерживайте непрерывный 5-дневный цикл сдачи ежедневных рапортов.</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-300">
                    <span className="flex items-center gap-1"><Zap size={11} className="text-amber-400" /> +200 XP</span>
                    <span className="flex items-center gap-1"><Coins size={11} className="text-[#E7C768]" /> +120 монет</span>
                  </div>
                </div>
              </div>
              
              {completedQuests.includes('streak_week') ? (
                <div className="p-2 text-emerald-400 flex items-center gap-1.5 self-end sm:self-auto font-bold text-xs">
                  <CheckCircle2 size={16} /> Готово
                </div>
              ) : (
                <button
                  onClick={() => handleClaimQuest('streak_week', 200, 120)}
                  className="px-4 py-2 rounded-xl bg-[#1E4468]/60 hover:bg-[#1E4468]/90 text-[#F4EE8E] border border-[#E7C768]/30 text-xs font-extrabold transition-all cursor-pointer self-end sm:self-auto"
                >
                  Получить XP за стрик
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* IF CHOSEN "REWARD STORE" TAB */}
      {activeTabStore === 'store' && (
        <div className="space-y-5 animate-fade-in" id="store-tab-content">
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-400/10 to-[#1E4468]/40 border border-[#E7C768]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <Gift size={14} className="text-[#E7C768]" />
                <span>Корпоративный Магазин Благ & Привилегий</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Тратьте заработанные корпоративные коины на реальные привилегии, согласованные администрацией компании.
              </p>
            </div>
            
            <div className="px-3.5 py-1.5 rounded-xl bg-[#17344F] border border-[#E7C768]/30 flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Баланс:</span>
              <Coins size={12} className="text-[#E7C768]" />
              <strong className="text-[#F4EE8E] font-mono text-xs">{userCoins} коинов</strong>
            </div>
          </div>

          {/* Admin/Director Store Switcher Sub-tabs */}
          {(currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.ADMIN) && (
            <div className="flex gap-2 p-1.5 bg-[#11293F] border border-white/5 rounded-xl max-w-sm" id="store-admin-tabs">
              <button
                type="button"
                onClick={() => setStoreSubTab('view')}
                className={`flex-1 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  storeSubTab === 'view' ? 'bg-[#1E4468] text-[#F4EE8E] shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🛒 Витрина благ</span>
              </button>
              <button
                type="button"
                onClick={() => setStoreSubTab('edit')}
                className={`flex-1 py-1.5 px-3.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  storeSubTab === 'edit' ? 'bg-[#1E4468] text-[#F4EE8E] shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🛠️ Редактор магазина</span>
                <span className="text-[8px] bg-amber-400/20 text-amber-200 font-extrabold px-1.5 py-0.5 rounded uppercase">Панель</span>
              </button>
            </div>
          )}

          {/* REWARD PURCHASE CONFIRMATION OVERLAY MODAL (SIMULATED) */}
          {selectedReward && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex flex-col gap-2 shadow-2xl animate-fade-in" id="reward-purchased-success">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Привилегия успешно куплена!
              </div>
              <p className="text-slate-300">
                Ваша заявка на благо <strong>"{selectedReward}"</strong> принята! Руководитель и бухгалтер уведомлены по почте. Ожидайте подтверждения в течение рабочего дня.
              </p>
              <button 
                onClick={() => setSelectedReward(null)} 
                className="self-start mt-1 text-[10px] underline hover:text-white"
              >
                Закрыть уведомление
              </button>
            </div>
          )}

          {/* VIEW MODE: Showcase items */}
          {storeSubTab === 'view' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in" id="store-items-grid">
              {storeItems.map((item: any) => {
                const canAfford = userCoins >= item.cost;
                return (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-xl bg-[#17344F]/40 border transition-all flex flex-col justify-between hover:scale-[1.01] ${
                      canAfford ? 'border-white/10 hover:border-[#E7C768]/40' : 'border-white/5 opacity-80'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-2xl p-1 bg-[#17344F] border border-white/5 rounded-lg">{item.icon}</span>
                        <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-slate-400 font-mono tracking-wider font-semibold uppercase">{item.type}</span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white leading-tight">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1">
                        <Coins size={12} className="text-[#E7C768]" />
                        <span className="text-amber-200 font-mono text-xs font-extrabold">{item.cost} коинов</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {(currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.ADMIN) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteStoreItem(item.id)}
                            title="Удалить товар"
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-colors"
                          >
                            🗑️
                          </button>
                        )}
                        <button
                          onClick={() => handleBuyReward(item.id, item.cost, item.name)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide cursor-pointer transition-all ${
                            canAfford 
                              ? 'bg-gradient-to-r from-amber-400 to-[#D99E41] text-slate-900 hover:brightness-110 active:scale-95 shadow'
                              : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                          }`}
                        >
                          Приобрести
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* EDIT PANEL MODE */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="store-editor-panel">
              {/* Add form */}
              <div className="lg:col-span-1 p-4 rounded-xl bg-[#17344F]/50 border border-white/10 space-y-4">
                <h4 className="text-xs font-extrabold text-[#F4EE8E] uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <span>➕ Добавить привилегию</span>
                </h4>
                
                <form onSubmit={handleAddStoreItem} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Название блага</label>
                    <input
                      type="text"
                      required
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Например: Абонемент в спортзал на месяц"
                      className="w-full px-3 py-2 rounded-xl bg-[#11293F] border border-white/10 text-white placeholder-slate-500 font-sans focus:outline-none focus:border-[#E7C768]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Стоимость в коинах</label>
                    <input
                      type="number"
                      required
                      min={50}
                      max={100000}
                      value={newItemCost}
                      onChange={(e) => setNewItemCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#11293F] border border-white/10 text-white font-mono focus:outline-none focus:border-[#E7C768]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Эмодзи-иконка</label>
                      <select
                        value={newItemIcon}
                        onChange={(e) => setNewItemIcon(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#11293F] border border-white/10 text-white focus:outline-none"
                      >
                        <option value="🎁">🎁 Подарок</option>
                        <option value="💻">💻 Техника</option>
                        <option value="🏖️">🏖️ Отдых</option>
                        <option value="🧥">🧥 Мерч</option>
                        <option value="🍣">🍣 Еда</option>
                        <option value="🧠">🧠 Ментор</option>
                        <option value="👑">👑 Статус</option>
                        <option value="🍕">🍕 Пицца</option>
                        <option value="✈️">✈️ Поездка</option>
                        <option value="🎟️">🎟️ Билет</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Тип/Категория</label>
                      <select
                        value={newItemType}
                        onChange={(e) => setNewItemType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#11293F] border border-white/10 text-white focus:outline-none"
                      >
                        <option value="VACATION">ОТПУСК</option>
                        <option value="WORK">УСЛОВИЯ</option>
                        <option value="MERCH">МЕРЧ</option>
                        <option value="FOOD">ЕДА</option>
                        <option value="EDUCATION">ОБУЧЕНИЕ</option>
                        <option value="STATUS">СТАТУС</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Описание привилегии</label>
                    <textarea
                      required
                      rows={3}
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      placeholder="Напишите кратко, как получить это благо..."
                      className="w-full px-3 py-2 rounded-xl bg-[#11293F] border border-white/10 text-white placeholder-slate-500 font-sans focus:outline-none focus:border-[#E7C768] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#D99E41] text-slate-900 font-extrabold text-xs transition-all hover:brightness-110 active:scale-95 cursor-pointer shadow"
                  >
                    🚀 Опубликовать в Магазине
                  </button>
                </form>
              </div>

              {/* Existing items list and manager */}
              <div className="lg:col-span-2 p-4 rounded-xl bg-[#17344F]/30 border border-white/10 space-y-3">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center justify-between border-b border-white/5 pb-2">
                  <span>Редактирование каталога ({storeItems.length})</span>
                  <span className="text-[10px] text-slate-400 lowercase font-normal">кликните на иконку корзины для удаления</span>
                </h4>

                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                  {storeItems.map((item: any) => (
                    <div key={item.id} className="p-3 rounded-xl bg-[#17344F]/50 border border-white/5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl p-1 bg-[#11293F] border border-white/10 rounded-lg shrink-0">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-200 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[9px] bg-white/5 text-slate-400 px-2 py-0.5 rounded font-mono font-bold uppercase">{item.type}</span>
                        <span className="text-[#F4EE8E] font-mono text-xs font-bold">{item.cost} 🪙</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteStoreItem(item.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-colors cursor-pointer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {storeItems.length === 0 && (
                    <p className="py-8 text-center text-slate-500 text-xs">Каталог магазина пуст. Добавьте первый товар!</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
