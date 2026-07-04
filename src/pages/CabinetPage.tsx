import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, Building, Layers, Users, FileText, Calendar as CalendarIcon, 
  Clock, BarChart3, Settings, CreditCard, Shield, Send, Mic, Sparkles, 
  Plus, Trash2, Check, HelpCircle, Edit3, Save, ArrowUpRight, MessageSquare, AlertCircle, Share2, Bell, X, Landmark, Menu, Bot, LogOut
} from 'lucide-react';
import { 
  UserRole, UserProfile, CompanyInfo, Department, ReportTemplate, 
  SubmittedReport, EmployeeSchedule, TariffState, Transaction, NotificationItem 
} from '../types';
import AIOverlay from '../components/AIOverlay';

// Import newly refactored subpage components
import CabinetProfile from '../components/cabinet/CabinetProfile';
import CabinetCompany from '../components/cabinet/CabinetCompany';
import CabinetDepartments from '../components/cabinet/CabinetDepartments';
import CabinetEmployees from '../components/cabinet/CabinetEmployees';
import CabinetReportsBuilder from '../components/cabinet/CabinetReportsBuilder';
import CabinetFillReport from '../components/cabinet/CabinetFillReport';
import CabinetCalendar from '../components/cabinet/CabinetCalendar';
import CabinetScheduleGantt from '../components/cabinet/CabinetScheduleGantt';
import CabinetAnalytics from '../components/cabinet/CabinetAnalytics';
import CabinetNotifications from '../components/cabinet/CabinetNotifications';
import CabinetTariff from '../components/cabinet/CabinetTariff';
import CabinetSettings from '../components/cabinet/CabinetSettings';
import CabinetCRM from '../components/cabinet/CabinetCRM';

interface CabinetPageProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currentUser: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onLogout?: () => void;
}

// Initial default state if server has nothing saved
const DEFAULT_COMPANY: CompanyInfo = {
  name: 'ООО «РентРоп Системы»',
  productDescription: 'Платформа аренды робототехники и автоматизации отчетов.',
  workSystemDescription: 'Удаленный формат работы сотрудников с ежедневной сдачей планов в 9:00 и фактов в 18:00.'
};

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'dep-1', name: 'Отдел Разработки', managerId: 'mgr-1', employeeIds: ['emp-1', 'emp-2'], telegramChatId: '@rr_dev_chat', parentId: null },
  { id: 'dep-2', name: 'Отдел Маркетинга', managerId: 'mgr-2', employeeIds: ['emp-3'], telegramChatId: '@rr_marketing_chat', parentId: 'dep-1' },
  { id: 'dep-3', name: 'Отдел Продаж', managerId: 'mgr-3', employeeIds: ['emp-4'], telegramChatId: '@rr_sales_chat', parentId: 'dep-1' }
];

const DEFAULT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'tpl-1',
    departmentId: 'dep-1',
    title: 'План на день (Отдел Разработки)',
    type: 'PLAN_DAY',
    fields: [
      { id: 'q1', label: 'Каковы ваши главные задачи на сегодня?', type: 'voice', required: true },
      { id: 'q2', label: 'Какие трудности или зависимости могут возникнуть?', type: 'voice', required: false },
      { id: 'q3', label: 'Ожидаемые рабочие часы за смену (число)', type: 'number', required: true }
    ],
    employeeIds: ['emp-1', 'emp-2'],
    managerId: 'mgr-1',
    customPrompt: 'Проверь соответствие плана архитектурным стандартам и полноту декомпозиции задач.',
    reminderMinutes: 15,
    reminderText: 'Внимание! Напоминаем о сдаче ежедневного плана. Пожалуйста, заполните рапорт в течение 15 минут.'
  },
  {
    id: 'tpl-2',
    departmentId: 'dep-1',
    title: 'Факт за день (Отдел Разработки)',
    type: 'FACT_DAY',
    fields: [
      { id: 'q4', label: 'Что было сделано по факту за сегодня?', type: 'text_paragraph', required: true },
      { id: 'q5', label: 'Все ли задачи из плана выполнены?', type: 'checkbox', required: true },
      { id: 'q6', label: 'Загрузить скриншот коммита / пуллреквеста', type: 'image', required: false },
      { id: 'q7', label: 'Ссылка на ветку или задачу в Jira', type: 'text_short', required: false }
    ],
    employeeIds: ['emp-1', 'emp-2'],
    managerId: 'mgr-1',
    customPrompt: 'Обрати внимание на то, решены ли проблемы предыдущего дня и указаны ли конкретные коммиты/результаты.',
    reminderMinutes: 30,
    reminderText: 'Добрый вечер! Время сдавать факт за сегодня. Опоздание более 30 минут влияет на оценку.'
  },
  {
    id: 'tpl-3',
    departmentId: 'dep-2',
    title: 'Еженедельный отчет по рекламе (Отдел Маркетинга)',
    type: 'WEEKLY',
    fields: [
      { id: 'q8', label: 'Список запущенных рекламных кампаний и креативов за неделю', type: 'list', required: true },
      { id: 'q9', label: 'Итоговый расход рекламного бюджета (в рублях)', type: 'number', required: true },
      { id: 'q10', label: 'Количество полученных лидов и средний CPA', type: 'text_short', required: true },
      { id: 'q11', label: 'Загрузить еженедельный медиа-отчет (PDF/XLS)', type: 'document', required: false }
    ],
    employeeIds: ['emp-3'],
    managerId: 'mgr-2',
    customPrompt: 'Особое внимание удели стоимости лида (CPA), CTR рекламных кампаний и выполнению медиаплана.',
    reminderMinutes: 60,
    reminderText: 'Коллеги, не забываем предоставить недельный отчет по маркетингу. Срок сдачи истекает.'
  },
  {
    id: 'tpl-4',
    departmentId: 'dep-3',
    title: 'Ежемесячный аудит сделок и выручки (Отдел Продаж)',
    type: 'MONTHLY',
    fields: [
      { id: 'q12', label: 'Итоговая выручка за месяц по закрытым сделкам (руб)', type: 'number', required: true },
      { id: 'q13', label: 'Какая конверсия из лида в оплату была достигнута (%)', type: 'number', required: true },
      { id: 'q14', label: 'Список ключевых клиентов, заключивших договора', type: 'checkboxes', required: true },
      { id: 'q15', label: 'Загрузить скан подписанного акта сверки', type: 'photo', required: false },
      { id: 'q16', label: 'Главные выводы и узкие места в воронке продаж за месяц', type: 'text_paragraph', required: true }
    ],
    employeeIds: ['emp-4'],
    managerId: 'mgr-3',
    customPrompt: 'Проанализируй выполнение плана по выручке, конверсию на этапах воронки и средний чек.',
    reminderMinutes: 120,
    reminderText: 'Важно! Ждем ежемесячный отчет по продажам. Пожалуйста, загрузите акты сверки и показатели.'
  },
  {
    id: 'tpl-5',
    departmentId: 'dep-1',
    title: 'Рапорт о дежурстве (Служба Поддержки)',
    type: 'FACT_DAY',
    fields: [
      { id: 'q17', label: 'Количество принятых и обработанных обращений за смену', type: 'number', required: true },
      { id: 'q18', label: 'Были ли критические сбои оборудования или сервисов?', type: 'checkbox', required: true },
      { id: 'q19', label: 'Аудиозапись утренней передачи смены (голосовой отчет)', type: 'voice', required: false }
    ],
    employeeIds: ['emp-1'],
    managerId: 'mgr-1',
    customPrompt: 'Проверь среднее время ответа (SLA) и количество незакрытых тикетов повышенной сложности.',
    reminderMinutes: 15,
    reminderText: 'Системное уведомление: Напоминаем сдать утренний рапорт дежурной смены поддержки.'
  }
];

const DEFAULT_REPORTS: SubmittedReport[] = [
  {
    id: 'rep-1',
    templateId: 'tpl-1',
    templateTitle: 'План на день (Разработка)',
    type: 'PLAN_DAY',
    employeeId: 'emp-1',
    employeeName: 'Иван Смирнов',
    departmentId: 'dep-1',
    departmentName: 'Отдел Разработки',
    timestamp: '2026-07-01T09:05:00Z',
    answers: {
      'q1': 'Написать роутинг Express сервера, связать с базой данных',
      'q2': 'Возможна задержка из-за настройки CORS заголовков',
      'q3': '8'
    },
    aiRecommendations: 'Отличный, четкий план. Рекомендую начать с CORS конфигурации в первую очередь, так как это частый блокер для фронтенда. Убедитесь, что настроили логирование ошибок для быстрого дебага.',
    qualityScore: 92,
    voiceInputUsed: false
  },
  {
    id: 'rep-2',
    templateId: 'tpl-2',
    templateTitle: 'Факт за день (Разработка)',
    type: 'FACT_DAY',
    employeeId: 'emp-1',
    employeeName: 'Иван Смирнов',
    departmentId: 'dep-1',
    departmentName: 'Отдел Разработки',
    timestamp: '2026-07-01T18:10:00Z',
    answers: {
      'q4': 'Написал роутер, связал со state.json. CORS настроен полностью.',
      'q5': true,
      'q6': '45'
    },
    aiRecommendations: 'Отличная работа по закрытию плана! Затраты в 45 минут на багфикс укладываются в норму. Рекомендуется покрыть новый роут базовыми юнит-тестами на следующей смене, чтобы избежать регрессии.',
    qualityScore: 95,
    voiceInputUsed: true
  }
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', amount: 5000, type: 'TOPUP', date: '2026-06-15 14:00', description: 'Пополнение баланса по карте через Робокассу' },
  { id: 'tx-2', amount: -1450, type: 'SPENT', date: '2026-06-20 00:00', description: 'Списание абонентской платы за 5 сотрудников' },
  { id: 'tx-3', amount: 435, type: 'REFERRAL', date: '2026-06-25 18:30', description: 'Зачисление 15% за реферала ООО «Нова»' }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  { id: 'nt-1', userId: 'usr-1', title: 'Рекомендация ИИ готова', message: 'ИИ сформировал рекомендации к вашему отчету "Факт за день". Оценка качества: 95/100.', timestamp: '2026-07-01 18:11', isRead: false, type: 'RECOMMENDATION' },
  { id: 'nt-2', userId: 'usr-1', title: 'Напоминание о сдаче', message: 'Напоминание: Сдайте отчет "План на день" в течение 15 минут!', timestamp: '2026-07-01 09:15', isRead: true, type: 'REMINDER' }
];

const DEFAULT_EMPLOYEES: UserProfile[] = [
  { id: '88371947', name: 'Иван Смирнов', role: UserRole.EMPLOYEE, email: 'smirnov@gmail.com', invitedUsersCount: 0, bonusesEarned: 0, referralCode: 'smirnov', position: 'Младший разработчик', telegramHandle: '@ivan_smirn' },
  { id: '92847164', name: 'Анна Петрова', role: UserRole.EMPLOYEE, email: 'petrova@gmail.com', invitedUsersCount: 0, bonusesEarned: 0, referralCode: 'petrova', position: 'Трафик-маркетолог', telegramHandle: '@anna_petr' },
  { id: '10284758', name: 'Сергей Федоров', role: UserRole.EMPLOYEE, email: 'fedorov@gmail.com', invitedUsersCount: 0, bonusesEarned: 0, referralCode: 'fedorov', position: 'Менеджер холодных продаж', telegramHandle: '@serg_sales' },
  { id: '77381948', name: 'Дмитрий Романов', role: UserRole.MANAGER, email: 'romanov@gmail.com', invitedUsersCount: 0, bonusesEarned: 0, referralCode: 'romanov', position: 'Начальник IT-департамента', telegramHandle: '@dm_manager' }
];

export default function CabinetPage({
  currentPath,
  onNavigate,
  currentUser,
  onUpdateUser,
  onLogout
}: CabinetPageProps) {
  // Active Tab state
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App Data States (synced with backend state.json)
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [departments, setDepartments] = useState<Department[]>(DEFAULT_DEPARTMENTS);
  const [templates, setTemplates] = useState<ReportTemplate[]>(DEFAULT_TEMPLATES);
  const [reports, setReports] = useState<SubmittedReport[]>(DEFAULT_REPORTS);
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [tariff, setTariff] = useState<TariffState>({ activeEmployeesCount: 15, expiresAt: '2026-08-01', balance: 3550 });
  const [mockEmployees, setMockEmployees] = useState<UserProfile[]>(DEFAULT_EMPLOYEES);

  // CRM Data (Admins Only)
  const [crmCompanies, setCrmCompanies] = useState<any[]>([
    { id: 'crm-c1', name: 'ООО «РентРоп Системы»', departmentsCount: 3, employeesCount: 4, status: 'Активен (Бизнес)', referrals: 2, balance: 3550, inn: '7714285910', address: 'г. Москва, Пресненская наб. 12', email: 'rentrop@systems.ru' },
    { id: 'crm-c2', name: 'ООО «ТехноСофт»', departmentsCount: 2, employeesCount: 12, status: 'Триал (5 дней)', referrals: 0, balance: 0, inn: '7805194830', address: 'г. Санкт-Петербург, Московский пр. 45', email: 'tech@soft-it.ru' },
    { id: 'crm-c3', name: 'ИП Воробьев А.П.', departmentsCount: 1, employeesCount: 2, status: 'Завершен', referrals: 1, balance: 120, inn: '503294810234', address: 'г. Одинцово, ул. Парковая 8', email: 'vorobiev@mail.ru' }
  ]);
  const [editingCrmCompany, setEditingCrmCompany] = useState<any | null>(null);

  // AI Overlay status
  const [isAiActive, setIsAiActive] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiCountdown, setAiCountdown] = useState(120);
  const [aiMascot, setAiMascot] = useState<'welcome' | 'bell' | 'serious' | 'happy' | 'success' | 'clock' | 'test' | 'sad'>('welcome');

  // Form and settings states
  const [telegramHandle, setTelegramHandle] = useState(currentUser?.telegramHandle || '@my_telegram');
  const [userPosition, setUserPosition] = useState(currentUser?.position || 'Старший специалист');
  const [topUpSeats, setTopUpSeats] = useState(5);
  const [promptRecs, setPromptRecs] = useState('Анализируй содержательность отчета, оценивай Quality Score от 1 до 100 и пиши 3 совета для улучшения работы.');
  const [promptSummary, setPromptSummary] = useState('Обобщи выполненные задачи, выпиши все блокеры и сформируй сводку для директора.');
  const [promptFastFill, setPromptFastFill] = useState('На основе свободного текста пользователя заполни соответствующие поля формы отчета. Извлеки задачи, результаты и статус.');
  const [promptManagerFeedback, setPromptManagerFeedback] = useState('Ты — мудрый и опытный генеральный директор. Проанализируй этот отчет сотрудника и составь краткую, конструктивную, мотивирующую рецензию/обратную связь.');
  const [promptFieldsGeneration, setPromptFieldsGeneration] = useState('Ты — профессиональный ИИ-методолог по отчетности. Сгенерируй список важнейших вопросов для рапорта на основе темы отчета.');

  // Custom informational withdrawal/refund window state
  const [isCashOutModalOpen, setIsCashOutModalOpen] = useState(false);
  const [cashOutTab, setCashOutTab] = useState<'bonus' | 'refund'>('bonus');
  const [withdrawalAmount, setWithdrawalAmount] = useState('2000');
  const [payoutMethod, setPayoutMethod] = useState('card');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // Synchronize route paths like /cabinet/profile with activeTab state
  useEffect(() => {
    const parts = currentPath.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart !== 'cabinet' && lastPart !== 'admin' && lastPart !== 'manager' && lastPart !== 'employee') {
      setActiveTab(lastPart);
    }
  }, [currentPath]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    const userSlug = currentUser ? currentUser.id : 'user';
    onNavigate(`/cabinet/${userSlug}/${tab}`);
  };

  // Load state from backend on mount
  useEffect(() => {
    async function loadState() {
      try {
        const res = await fetch('/api/state/load');
        if (res.ok) {
          const data = await res.json();
          if (data && data.company) {
            setCompany(data.company);
            setDepartments(data.departments || DEFAULT_DEPARTMENTS);
            setTemplates(data.templates || DEFAULT_TEMPLATES);
            setReports(data.reports || DEFAULT_REPORTS);
            setTransactions(data.transactions || DEFAULT_TRANSACTIONS);
            setNotifications(data.notifications || DEFAULT_NOTIFICATIONS);
            setTariff(data.tariff || { activeEmployeesCount: 15, expiresAt: '2026-08-01', balance: 3550 });
            setMockEmployees(data.mockEmployees || DEFAULT_EMPLOYEES);
            if (data.crmCompanies) setCrmCompanies(data.crmCompanies);
            if (data.promptRecs) setPromptRecs(data.promptRecs);
            if (data.promptSummary) setPromptSummary(data.promptSummary);
            if (data.promptFastFill) setPromptFastFill(data.promptFastFill);
            if (data.promptManagerFeedback) setPromptManagerFeedback(data.promptManagerFeedback);
            if (data.promptFieldsGeneration) setPromptFieldsGeneration(data.promptFieldsGeneration);
          }
        }
      } catch (err) {
        console.error('Failed to load application state from server:', err);
      }
    }
    loadState();
  }, []);

  const handleSavePrompts = (recs: string, summary: string, fastFill: string, managerFeedback: string, fieldsGen: string) => {
    setPromptRecs(recs);
    setPromptSummary(summary);
    setPromptFastFill(fastFill);
    setPromptManagerFeedback(managerFeedback);
    setPromptFieldsGeneration(fieldsGen);
    saveStateToServer({
      company,
      departments,
      templates,
      reports,
      transactions,
      notifications,
      tariff,
      crmCompanies,
      mockEmployees,
      promptRecs: recs,
      promptSummary: summary,
      promptFastFill: fastFill,
      promptManagerFeedback: managerFeedback,
      promptFieldsGeneration: fieldsGen
    });
    alert('Настройки промптов нейросети успешно зафиксированы и сохранены!');
  };

  // Save state helper
  const saveStateToServer = async (updatedData: any) => {
    try {
      await fetch('/api/state/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (err) {
      console.error('Failed to save state to server:', err);
    }
  };

  // Helper to trigger AI process
  const triggerAI = (promptText: string, sysPrompt: string, onGenerated: (text: string) => void, mascotType: typeof aiMascot = 'welcome') => {
    setIsAiActive(true);
    setAiLoading(true);
    setAiError(null);
    setAiCountdown(120);
    setAiMascot(mascotType);

    const timer = setInterval(() => {
      setAiCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAiLoading(false);
          setAiError('ИИ-сервис превысил лимит ожидания 120 секунд. Пожалуйста, перезапустите процесс.');
          setAiMascot('sad');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText, systemPrompt: sysPrompt, userId: currentUser?.id })
    })
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((data) => {
        clearInterval(timer);
        if (data.error) throw new Error(data.error);
        setAiLoading(false);
        onGenerated(data.text);
        setTimeout(() => {
          setIsAiActive(false);
        }, 1500);
      })
      .catch((err) => {
        clearInterval(timer);
        setAiLoading(false);
        setAiError('Ошибка связи с нейросетью. Убедитесь, что лимиты не исчерпаны, и запустите повторно.');
        setAiMascot('sad');
      });
  };

  // Profile Save
  const handleSaveProfile = () => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      telegramHandle,
      position: userPosition,
    };
    onUpdateUser(updatedUser);

    const notificationItem: NotificationItem = {
      id: Date.now().toString(),
      userId: currentUser.id,
      title: 'Профиль обновлен',
      message: 'Изменения в вашем профиле (телеграм, должность) успешно применены.',
      timestamp: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isRead: false,
      type: 'SYSTEM'
    };

    const newNotifications = [notificationItem, ...notifications];
    setNotifications(newNotifications);
    saveStateToServer({ company, departments, templates, reports, transactions, notifications: newNotifications, tariff, crmCompanies, mockEmployees });
  };

  // Improve text via AI helper
  const improveFieldWithAI = (fieldKey: 'name' | 'productDescription' | 'workSystemDescription', currentText: string) => {
    const sysPrompt = `Ты — бизнес-аналитик и копирайтер. Твоя задача — улучшить описание компании или продукта, сделать его профессиональным, емким, структурированным и солидным. Пиши строго на русском языке, без лишней воды.`;
    const promptText = `Улучши следующее описание для компании: "${currentText}". Сделай его стильным и профессиональным в 2-3 предложениях.`;

    triggerAI(promptText, sysPrompt, (improvedText) => {
      setCompany((prev) => {
        const next = { ...prev, [fieldKey]: improvedText };
        saveStateToServer({ company: next, departments, templates, reports, transactions, notifications, tariff, crmCompanies, mockEmployees });
        return next;
      });
    }, 'welcome');
  };

  // Tariff calculator actions
  const handleTopUpTariff = () => {
    const cost = topUpSeats * 290;
    if (tariff.balance < cost) {
      alert(`Недостаточно средств. Пожалуйста, пополните баланс на ${(cost - tariff.balance)} рублей через Робокассу.`);
      return;
    }

    const nextBalance = tariff.balance - cost;
    const nextTariff = {
      ...tariff,
      activeEmployeesCount: tariff.activeEmployeesCount + topUpSeats,
      balance: nextBalance
    };
    setTariff(nextTariff);

    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      amount: -cost,
      type: 'SPENT',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      description: `Увеличение тарифа на +${topUpSeats} сотрудников`
    };
    const nextTxs = [newTx, ...transactions];
    setTransactions(nextTxs);

    saveStateToServer({ company, departments, templates, reports, transactions: nextTxs, notifications, tariff: nextTariff, crmCompanies, mockEmployees });
  };

  // CRM edit actions
  const handleCrmChange = (id: string, key: string, val: any) => {
    const updated = crmCompanies.map(c => c.id === id ? { ...c, [key]: val } : c);
    setCrmCompanies(updated);
    saveStateToServer({ company, departments, templates, reports, transactions, notifications, tariff, crmCompanies: updated, mockEmployees });
  };

  // Notification action handler
  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    saveStateToServer({ company, departments, templates, reports, transactions, notifications: updated, tariff, crmCompanies, mockEmployees });
  };

  // Partner Bonus Cash-out submission
  const handleCashOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Пожалуйста, введите корректную сумму.');
      return;
    }

    if (cashOutTab === 'bonus') {
      const bonuses = currentUser?.bonusesEarned || 2450;
      if (amount > bonuses) {
        alert('Запрашиваемая сумма превышает доступный баланс бонусов.');
        return;
      }

      // Update current user bonus state
      if (currentUser) {
        onUpdateUser({
          ...currentUser,
          bonusesEarned: bonuses - amount
        });
      }

      // Record transaction
      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        amount: -amount,
        type: 'SPENT',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        description: `Вывод партнерских бонусов (${payoutMethod === 'card' ? 'Карта' : payoutMethod === 'qiwi' ? 'QIWI' : 'USDT TRC20'})`
      };
      setTransactions([newTx, ...transactions]);

      // Trigger AI notification audit
      const newNotif: NotificationItem = {
        id: 'nt-' + Date.now(),
        userId: currentUser?.id || 'usr-1',
        title: 'Заявка на вывод бонусов принята',
        message: `Ваша заявка на вывод ${amount} ₽ успешно сформирована и обрабатывается финансовым отделом. Реквизиты: ${payoutDetails || 'по умолчанию'}.`,
        timestamp: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isRead: false,
        type: 'SYSTEM'
      };
      setNotifications([newNotif, ...notifications]);
      setIsCashOutModalOpen(false);
      alert('Заявка на вывод бонусных средств успешно отправлена! Ожидайте зачисления в течение 24 часов.');

    } else {
      // Refund flow
      if (amount > tariff.balance) {
        alert('Запрашиваемая сумма возврата превышает текущий баланс личного кабинета.');
        return;
      }

      const nextTariff = {
        ...tariff,
        balance: tariff.balance - amount
      };
      setTariff(nextTariff);

      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        amount: -amount,
        type: 'SPENT',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        description: `Оформление возврата подписки на расчетный счет`
      };
      setTransactions([newTx, ...transactions]);

      const newNotif: NotificationItem = {
        id: 'nt-' + Date.now(),
        userId: currentUser?.id || 'usr-1',
        title: 'Запрос на возврат средств',
        message: `Возврат на сумму ${amount} ₽ по причине: "${refundReason || 'Не указана'}" успешно зарегистрирован. Средства будут возвращены на исходную банковскую карту.`,
        timestamp: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isRead: false,
        type: 'SYSTEM'
      };
      setNotifications([newNotif, ...notifications]);
      setIsCashOutModalOpen(false);
      alert('Заявка на возврат средств успешно отправлена. Согласно оферте, транзакция будет осуществлена в течение 3 банковских дней.');
    }
  };

  // Calculated unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="w-full text-white bg-transparent font-sans p-4 sm:p-6 min-h-screen relative" id="cabinet-root">
      
      {/* DEDICATED CABINET HEADER FOR DESKTOP */}
      <div className="hidden lg:flex items-center justify-between p-4 bg-gradient-to-r from-[#17344F]/95 to-[#265582]/95 backdrop-blur-md border border-white/10 rounded-2xl mb-6 mx-auto max-w-7xl shadow-xl" id="desktop-cabinet-header">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => onNavigate('/')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img 
              src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR-Logo.png" 
              alt="RR Logo" 
              className="w-8 h-8 object-contain group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(231,199,104,0.2)]"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-sm font-extrabold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] bg-clip-text text-transparent leading-none tracking-wider font-sans">
                ИИ РАПОРТ
              </h1>
              <p className="text-[9px] text-slate-400 uppercase font-mono mt-0.5 tracking-widest font-semibold">Личный кабинет</p>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* Company Badge */}
          <div className="text-xs text-slate-300 font-sans flex items-center gap-1.5 bg-[#17344F]/60 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
            <Building size={12} className="text-[#E7C768]" />
            <span className="font-semibold text-slate-200">{company.name}</span>
          </div>
        </div>

        {/* Right Section: Navigation back, user status and Logout */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('/')}
            className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-[#1E4468]/40 hover:bg-[#1E4468]/80 text-slate-200 hover:text-white text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5"
            id="cabinet-back-home-btn"
          >
            ← Вернуться на главную
          </button>

          <div className="h-6 w-px bg-white/10" />

          {/* User profile capsule */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1E4468] border border-[#E7C768] flex items-center justify-center font-bold text-xs text-[#F4EE8E]">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-none text-white">{currentUser?.name}</p>
              <p className="text-[9px] text-amber-200 mt-1 leading-none font-mono">
                {currentUser?.role === UserRole.ADMIN ? 'Глобальный Админ' : currentUser?.role === UserRole.DIRECTOR ? 'Директор' : currentUser?.role === UserRole.MANAGER ? 'Руководитель' : 'Сотрудник'}
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl border border-white/10 text-slate-300 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Выйти из личного кабинета"
              id="cabinet-header-logout"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>

      {/* DEVELOPMENT MOCK ROLE SELECTOR BAR */}
      <div className="mx-auto max-w-7xl mb-6 p-4 rounded-2xl bg-[#1E4468]/30 border border-amber-200/25 flex flex-wrap items-center justify-between gap-4" id="role-selector-bar">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-200 animate-spin" size={16} />
          <div>
            <span className="text-xs font-bold text-amber-100 uppercase tracking-wide">Панель тестирования:</span>
            <p className="text-[10px] text-slate-300 font-mono">Переключайте роли для мгновенного просмотра разных интерфейсов личного кабинета!</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.values(UserRole).map((r) => {
            const isActive = currentUser?.role === r;
            return (
              <button
                key={r}
                onClick={() => {
                  if (currentUser) {
                    onUpdateUser({ ...currentUser, role: r });
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 border-amber-200' 
                    : 'bg-[#1E4468]/60 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {r === UserRole.ADMIN ? '🛡️ Админ' : r === UserRole.DIRECTOR ? '👑 Директор' : r === UserRole.MANAGER ? '👔 Руководитель' : '👨‍💻 Сотрудник'}
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE HEADER (FIXED/STICKY AT THE TOP WITH FLUSH EDGES) */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-[#17344F]/95 backdrop-blur-md border-b border-white/10 -mx-4 -mt-4 mb-5 shadow-lg" id="mobile-cabinet-header">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Открыть меню"
        >
          <Menu size={20} />
        </button>
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#F4EE8E] font-mono">
          {activeTab === 'profile' ? 'Профиль' :
           activeTab === 'company' ? 'Компания' :
           activeTab === 'departments' ? 'Отделы' :
           activeTab === 'employees' ? 'Сотрудники' :
           activeTab === 'reports_builder' ? 'Конструктор' :
           activeTab === 'fill_report' ? 'Заполнение' :
           activeTab === 'calendar' ? 'Календарь' :
           activeTab === 'schedules_builder' ? 'Графики' :
           activeTab === 'employee_schedule' ? 'Мой график' :
           activeTab === 'analytics' ? 'Аналитика' :
           activeTab === 'notifications' ? 'Оповещения' :
           activeTab === 'tariff' ? 'Тариф' :
           activeTab === 'settings' ? 'Промпты' :
           activeTab === 'crm' ? 'CRM' : 'ИИ Рапорт'}
        </span>
        <div className="w-8 h-8 rounded-full bg-[#1E4468] border border-[#E7C768] flex items-center justify-center font-bold text-xs text-[#F4EE8E]">
          {currentUser?.name.charAt(0) || 'U'}
        </div>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" id="mobile-menu-drawer">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="relative w-4/5 max-w-xs bg-[#17344F]/95 backdrop-blur-xl border-r border-white/10 h-full p-5 flex flex-col justify-between overflow-y-auto z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#17344F]/80 border border-[#E7C768] flex items-center justify-center font-extrabold text-[#F4EE8E]">
                    {currentUser?.name.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{currentUser?.name || 'Пользователь'}</h4>
                    <p className="text-[9px] text-slate-400 font-mono">ID: {currentUser?.id || '88371947'}</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-col gap-1 text-xs">
                {/* Profile Tab */}
                <button
                  onClick={() => { handleTabClick('profile'); setIsMobileMenuOpen(false); }}
                  className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                    activeTab === 'profile' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                  }`}
                >
                  <User size={15} />
                  Профиль
                </button>

                {/* Company (Directors and Admins Only) */}
                {(currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.ADMIN) && (
                  <button
                    onClick={() => { handleTabClick('company'); setIsMobileMenuOpen(false); }}
                    className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === 'company' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                    }`}
                  >
                    <Building size={15} />
                    Компания
                  </button>
                )}

                {/* Departments (All except Employee) */}
                {currentUser?.role !== UserRole.EMPLOYEE && (
                  <button
                    onClick={() => { handleTabClick('departments'); setIsMobileMenuOpen(false); }}
                    className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === 'departments' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                    }`}
                  >
                    <Layers size={15} />
                    Отделы
                  </button>
                )}

                {/* Employees (All except Employee) */}
                {currentUser?.role !== UserRole.EMPLOYEE && (
                  <button
                    onClick={() => { handleTabClick('employees'); setIsMobileMenuOpen(false); }}
                    className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === 'employees' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                    }`}
                  >
                    <Users size={15} />
                    Сотрудники
                  </button>
                )}

                {/* Reports Template Builder (All except Employee) */}
                {currentUser?.role !== UserRole.EMPLOYEE && (
                  <button
                    onClick={() => { handleTabClick('reports_builder'); setIsMobileMenuOpen(false); }}
                    className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === 'reports_builder' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                    }`}
                  >
                    <Edit3 size={15} />
                    Конструктор отчетов
                  </button>
                )}

                {/* Fill Reports (Employee Only) */}
                {currentUser?.role === UserRole.EMPLOYEE && (
                  <button
                    onClick={() => { handleTabClick('fill_report'); setIsMobileMenuOpen(false); }}
                    className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === 'fill_report' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                    }`}
                  >
                    <FileText size={15} />
                    Заполнить отчет
                  </button>
                )}

                {/* Calendar History (All) */}
                <button
                  onClick={() => { handleTabClick('calendar'); setIsMobileMenuOpen(false); }}
                  className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                    activeTab === 'calendar' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                  }`}
                >
                  <CalendarIcon size={15} />
                  Календарь отчетов
                </button>

                {/* Work Schedules (Managers / Directors / Admins) */}
                {currentUser?.role !== UserRole.EMPLOYEE && (
                  <button
                    onClick={() => { handleTabClick('schedules_builder'); setIsMobileMenuOpen(false); }}
                    className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === 'schedules_builder' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                    }`}
                  >
                    <Clock size={15} />
                    Графики работы
                  </button>
                )}

                {/* Read-Only Work Schedule (Employee Only) */}
                {currentUser?.role === UserRole.EMPLOYEE && (
                  <button
                    onClick={() => { handleTabClick('employee_schedule'); setIsMobileMenuOpen(false); }}
                    className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === 'employee_schedule' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                    }`}
                  >
                    <Clock size={15} />
                    Мой график работы
                  </button>
                )}

                {/* Analytics (All except Employee) */}
                {currentUser?.role !== UserRole.EMPLOYEE && (
                  <button
                    onClick={() => { handleTabClick('analytics'); setIsMobileMenuOpen(false); }}
                    className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === 'analytics' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                    }`}
                  >
                    <BarChart3 size={15} />
                    Аналитика ИИ
                  </button>
                )}

                {/* Notifications (All) */}
                <button
                  onClick={() => {
                    handleTabClick('notifications');
                    handleMarkAllNotificationsRead();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                    activeTab === 'notifications' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                  }`}
                >
                  <Bell size={15} />
                  <span>Уведомления</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white font-extrabold font-mono text-[9px] px-2 py-0.5 rounded-full">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Tariff (Directors and Admins Only) */}
                {(currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.ADMIN) && (
                  <button
                    onClick={() => { handleTabClick('tariff'); setIsMobileMenuOpen(false); }}
                    className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === 'tariff' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                    }`}
                  >
                    <CreditCard size={15} />
                    Тариф
                  </button>
                )}

                {/* Settings Prompts (Directors only) */}
                {(currentUser?.role === UserRole.DIRECTOR) && (
                  <button
                    onClick={() => { handleTabClick('settings'); setIsMobileMenuOpen(false); }}
                    className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === 'settings' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                    }`}
                  >
                    <Settings size={15} />
                    Настройки ИИ
                  </button>
                )}

                {/* CRM (Admins only) */}
                {(currentUser?.role === UserRole.ADMIN) && (
                  <button
                    onClick={() => { handleTabClick('crm'); setIsMobileMenuOpen(false); }}
                    className={`w-full px-4 py-2.5 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                      activeTab === 'crm' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                    }`}
                  >
                    <Shield size={15} />
                    CRM Админа
                  </button>
                )}
              </nav>
            </div>
            
            <div className="pt-4 border-t border-white/5 text-center text-[10px] text-slate-500 font-mono">
              ИИ Рапорт © 2026
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20 lg:pb-0" id="cabinet-layout-grid">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="hidden lg:block lg:col-span-3 rounded-2xl border border-white/10 bg-[#17344F]/40 p-4 space-y-4" id="cabinet-sidebar">
          
          <div className="p-3 border-b border-white/5 text-center sm:text-left flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#17344F]/80 border border-[#E7C768] flex items-center justify-center font-extrabold text-[#F4EE8E] overflow-hidden shadow-inner">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">{currentUser?.name || 'Пользователь'}</h4>
              <p className="text-[10px] text-slate-400 font-mono">ID: {currentUser?.id || '88371947'}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1 text-xs">
            {/* Profile Tab */}
            <button
              onClick={() => handleTabClick('profile')}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
              }`}
            >
              <User size={15} />
              Профиль
            </button>

            {/* Company (Directors and Admins Only) */}
            {(currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.ADMIN) && (
              <button
                onClick={() => handleTabClick('company')}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                  activeTab === 'company' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                }`}
              >
                <Building size={15} />
                Компания
              </button>
            )}

            {/* Departments (All except Employee) */}
            {currentUser?.role !== UserRole.EMPLOYEE && (
              <button
                onClick={() => handleTabClick('departments')}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                  activeTab === 'departments' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                }`}
              >
                <Layers size={15} />
                Отделы
              </button>
            )}

            {/* Employees (All except Employee) */}
            {currentUser?.role !== UserRole.EMPLOYEE && (
              <button
                onClick={() => handleTabClick('employees')}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                  activeTab === 'employees' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                }`}
              >
                <Users size={15} />
                Сотрудники
              </button>
            )}

            {/* Reports Template Builder (All except Employee) */}
            {currentUser?.role !== UserRole.EMPLOYEE && (
              <button
                onClick={() => handleTabClick('reports_builder')}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                  activeTab === 'reports_builder' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                }`}
              >
                <Edit3 size={15} />
                Конструктор отчетов
              </button>
            )}

            {/* Fill Reports (Employee Only) */}
            {currentUser?.role === UserRole.EMPLOYEE && (
              <button
                onClick={() => handleTabClick('fill_report')}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                  activeTab === 'fill_report' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                }`}
              >
                <FileText size={15} />
                Заполнить отчет
              </button>
            )}

            {/* Calendar History (All) */}
            <button
              onClick={() => handleTabClick('calendar')}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                activeTab === 'calendar' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
              }`}
            >
              <CalendarIcon size={15} />
              Календарь отчетов
            </button>

            {/* Work Schedules (Managers / Directors / Admins) */}
            {currentUser?.role !== UserRole.EMPLOYEE && (
              <button
                onClick={() => handleTabClick('schedules_builder')}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                  activeTab === 'schedules_builder' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                }`}
              >
                <Clock size={15} />
                Графики работы
              </button>
            )}

            {/* Read-Only Work Schedule (Employee Only) */}
            {currentUser?.role === UserRole.EMPLOYEE && (
              <button
                onClick={() => handleTabClick('employee_schedule')}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                  activeTab === 'employee_schedule' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                }`}
              >
                <Clock size={15} />
                Мой график работы
              </button>
            )}

            {/* Analytics (All except Employee) */}
            {currentUser?.role !== UserRole.EMPLOYEE && (
              <button
                onClick={() => handleTabClick('analytics')}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                  activeTab === 'analytics' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                }`}
              >
                <BarChart3 size={15} />
                Аналитика ИИ
              </button>
            )}

            {/* Notifications (All) */}
            <button
              onClick={() => {
                handleTabClick('notifications');
                handleMarkAllNotificationsRead();
              }}
              className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                activeTab === 'notifications' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
              }`}
            >
              <Bell size={15} />
              <span>Уведомления</span>
              {unreadNotificationsCount > 0 && (
                <span className="ml-auto bg-red-500 text-white font-extrabold font-mono text-[9px] px-2 py-0.5 rounded-full animate-bounce">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Tariff (Directors and Admins Only) */}
            {(currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.ADMIN) && (
              <button
                onClick={() => handleTabClick('tariff')}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                  activeTab === 'tariff' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                }`}
              >
                <CreditCard size={15} />
                Тариф
              </button>
            )}

            {/* Settings Prompts (Directors only) */}
            {(currentUser?.role === UserRole.DIRECTOR) && (
              <button
                onClick={() => handleTabClick('settings')}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                  activeTab === 'settings' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                }`}
              >
                <Settings size={15} />
                Настройки ИИ
              </button>
            )}

            {/* CRM (Admins only) */}
            {(currentUser?.role === UserRole.ADMIN) && (
              <button
                onClick={() => handleTabClick('crm')}
                className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all cursor-pointer ${
                  activeTab === 'crm' ? 'bg-[#1E4468] text-[#F4EE8E] border-l-4 border-[#E7C768]' : 'text-slate-300 hover:bg-[#1E4468]/50 hover:text-white'
                }`}
              >
                <Shield size={15} />
                CRM Админа
              </button>
            )}
          </nav>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="lg:col-span-9 rounded-2xl border border-white/10 bg-[#17344F]/40 p-6 shadow-xl relative min-h-[500px]" id="cabinet-main-panel">
          
          {/* Glass layout reflection */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-transparent rounded-2xl" />

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {/* Tab 1: PROFILE */}
          {activeTab === 'profile' && (
            <CabinetProfile 
              currentUser={currentUser}
              telegramHandle={telegramHandle}
              setTelegramHandle={setTelegramHandle}
              userPosition={userPosition}
              setUserPosition={setUserPosition}
              onSaveProfile={handleSaveProfile}
            />
          )}

          {/* Tab 2: COMPANY */}
          {activeTab === 'company' && (
            <CabinetCompany 
              company={company}
              setCompany={setCompany}
              improveFieldWithAI={improveFieldWithAI}
            />
          )}

          {/* Tab 3: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <CabinetDepartments 
              departments={departments}
              setDepartments={setDepartments}
              saveStateToServer={saveStateToServer}
              company={company}
              templates={templates}
              reports={reports}
              transactions={transactions}
              notifications={notifications}
              tariff={tariff}
              crmCompanies={crmCompanies}
              mockEmployees={mockEmployees}
            />
          )}

          {/* Tab 4: EMPLOYEES */}
          {activeTab === 'employees' && (
            <CabinetEmployees 
              currentUser={currentUser}
              mockEmployees={mockEmployees}
              setMockEmployees={(val) => {
                setMockEmployees(val);
                saveStateToServer({ company, departments, templates, reports, transactions, notifications, tariff, crmCompanies, mockEmployees: val });
              }}
              departments={departments}
              saveStateToServer={saveStateToServer}
              company={company}
              templates={templates}
              reports={reports}
              transactions={transactions}
              notifications={notifications}
              tariff={tariff}
              crmCompanies={crmCompanies}
              triggerAI={triggerAI}
            />
          )}

          {/* Tab 5: REPORTS CONSTRUCTOR */}
          {activeTab === 'reports_builder' && (
            <CabinetReportsBuilder 
              departments={departments}
              templates={templates}
              setTemplates={(val) => {
                setTemplates(val);
                saveStateToServer({ company, departments, templates: val, reports, transactions, notifications, tariff, crmCompanies, mockEmployees });
              }}
              triggerAI={triggerAI}
              saveStateToServer={saveStateToServer}
              company={company}
              reports={reports}
              transactions={transactions}
              notifications={notifications}
              tariff={tariff}
              crmCompanies={crmCompanies}
              promptFieldsGeneration={promptFieldsGeneration}
            />
          )}

          {/* Tab 6: FILL ACTIVE REPORT (Employee Only) */}
          {activeTab === 'fill_report' && (
            <CabinetFillReport 
              currentUser={currentUser}
              templates={templates}
              reports={reports}
              setReports={(val) => {
                setReports(val);
                saveStateToServer({ company, departments, templates, reports: val, transactions, notifications, tariff, crmCompanies, mockEmployees });
              }}
              notifications={notifications}
              setNotifications={(val) => {
                setNotifications(val);
                saveStateToServer({ company, departments, templates, reports, transactions, notifications: val, tariff, crmCompanies, mockEmployees });
              }}
              departments={departments}
              triggerAI={triggerAI}
              saveStateToServer={saveStateToServer}
              company={company}
              transactions={transactions}
              tariff={tariff}
              crmCompanies={crmCompanies}
              mockEmployees={mockEmployees}
              promptRecs={promptRecs}
              promptFastFill={promptFastFill}
            />
          )}

          {/* Tab 7: CALENDAR */}
          {activeTab === 'calendar' && (
            <CabinetCalendar 
              reports={reports}
              setReports={(val) => {
                setReports(val);
                saveStateToServer({ company, departments, templates, reports: val, transactions, notifications, tariff, crmCompanies, mockEmployees });
              }}
              departments={departments}
              mockEmployees={mockEmployees}
              currentUser={currentUser}
              triggerAI={triggerAI}
              saveStateToServer={saveStateToServer}
              company={company}
              templates={templates}
              transactions={transactions}
              notifications={notifications}
              tariff={tariff}
              crmCompanies={crmCompanies}
              promptManagerFeedback={promptManagerFeedback}
            />
          )}

          {/* Tab 8: SCHEDULES BUILDER / READ-ONLY SCHEDULE */}
          {(activeTab === 'schedules_builder' || activeTab === 'employee_schedule') && (
            <CabinetScheduleGantt 
              currentUser={currentUser}
              mockEmployees={mockEmployees}
              reports={reports}
            />
          )}

          {/* Tab 9: ANALYTICS (AI Summary generation) */}
          {activeTab === 'analytics' && (
            <CabinetAnalytics 
              reports={reports}
              departments={departments}
              triggerAI={triggerAI}
              mockEmployees={mockEmployees}
              promptSummary={promptSummary}
            />
          )}

          {/* Tab 10: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <CabinetNotifications 
              notifications={notifications}
              handleMarkAllNotificationsRead={handleMarkAllNotificationsRead}
            />
          )}

          {/* Tab 11: TARIFF */}
          {activeTab === 'tariff' && (
            <CabinetTariff 
              tariff={tariff}
              topUpSeats={topUpSeats}
              setTopUpSeats={setTopUpSeats}
              handleTopUpTariff={handleTopUpTariff}
              setTariff={setTariff}
              saveStateToServer={saveStateToServer}
              currentUser={currentUser}
              setCashOutTab={setCashOutTab}
              setWithdrawalAmount={setWithdrawalAmount}
              setIsCashOutModalOpen={setIsCashOutModalOpen}
              transactions={transactions}
              company={company}
              departments={departments}
              templates={templates}
              reports={reports}
              notifications={notifications}
              crmCompanies={crmCompanies}
              mockEmployees={mockEmployees}
            />
          )}

          {/* Tab 12: SETTINGS (Directors only) */}
          {activeTab === 'settings' && (
            <CabinetSettings 
              promptRecs={promptRecs}
              setPromptRecs={setPromptRecs}
              promptSummary={promptSummary}
              setPromptSummary={setPromptSummary}
              promptFastFill={promptFastFill}
              setPromptFastFill={setPromptFastFill}
              promptManagerFeedback={promptManagerFeedback}
              setPromptManagerFeedback={setPromptManagerFeedback}
              promptFieldsGeneration={promptFieldsGeneration}
              setPromptFieldsGeneration={setPromptFieldsGeneration}
              onSavePrompts={handleSavePrompts}
            />
          )}

          {/* Tab 13: CRM (Admin only) - Interactive Kanban Board with Detailed Company Editor */}
          {activeTab === 'crm' && (
            <CabinetCRM 
              crmCompanies={crmCompanies}
              setCrmCompanies={setCrmCompanies}
              editingCrmCompany={editingCrmCompany}
              setEditingCrmCompany={setEditingCrmCompany}
              saveStateToServer={saveStateToServer}
              company={company}
              departments={departments}
              templates={templates}
              reports={reports}
              transactions={transactions}
              notifications={notifications}
              tariff={tariff}
              mockEmployees={mockEmployees}
            />
          )}

          </motion.div>
        </main>
      </div>

      {/* AI PROCESSING OVERLAY DIALOG */}
      <AIOverlay 
        isOpen={isAiActive}
        isLoading={aiLoading}
        error={aiError}
        countdown={aiCountdown}
        mascotType={aiMascot}
        onClose={() => setIsAiActive(false)}
        onRetry={() => {
          setIsAiActive(false);
          alert('Перезапуск ИИ-запроса...');
        }}
      />

      {/* 👑 CUSTOM INFORMATIONAL REFUND AND CASH-OUT MODAL DIALOG */}
      {isCashOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17344F]/75 backdrop-blur-md animate-fade-in font-sans" id="cashout-modal-overlay">
          <div className="relative w-full max-w-lg border border-amber-200/20 bg-gradient-to-b from-[#17344F] to-[#265582] rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6" id="cashout-modal-content">
            
            <button 
              onClick={() => setIsCashOutModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors p-1"
            >
              <X size={18} />
            </button>

            {/* Modal title */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#F4EE8E] flex items-center gap-2">
                <Landmark size={20} className="text-amber-200 animate-pulse" />
                <span>Финансовый пульт: Выводы и Возвраты</span>
              </h3>
              <p className="text-xs text-slate-300">Официальные расчетные операции по реферальной программе и абонентской плате.</p>
            </div>

            {/* Modal Internal Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#17344F]/80 rounded-xl border border-white/5">
              <button 
                type="button"
                onClick={() => {
                  setCashOutTab('bonus');
                  setWithdrawalAmount(String(currentUser?.bonusesEarned || 2450));
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  cashOutTab === 'bonus' 
                    ? 'bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Вывод бонусов
              </button>
              <button 
                type="button"
                onClick={() => {
                  setCashOutTab('refund');
                  setWithdrawalAmount('1500');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  cashOutTab === 'refund' 
                    ? 'bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Оформить возврат
              </button>
            </div>

            {/* NEW ENHANCED INFORMATIONAL HELP WINDOW */}
            <div className="p-4 rounded-2xl bg-[#1E4468]/50 border border-amber-300/10 text-[11px] space-y-1.5 text-slate-200">
              <p className="font-bold text-[#F4EE8E] flex items-center gap-1.5">
                <Landmark size={12} className="text-[#E7C768]" />
                Справка по расчетным регламентам ii-rr.online:
              </p>
              {cashOutTab === 'bonus' ? (
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li><strong>Начисление:</strong> 15% от всех пополнений приглашенных по реферальной ссылке.</li>
                  <li><strong>Сроки выплаты:</strong> Финансовый отдел производит перевод в течение 24 часов.</li>
                  <li><strong>Комиссия за перевод:</strong> 0% (платформа берет эквайринг на себя).</li>
                  <li><strong>Лимиты:</strong> Минимальная сумма вывода составляет 500 ₽.</li>
                </ul>
              ) : (
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li><strong>Адресат возврата:</strong> Перевод осуществляется на реквизиты плательщика.</li>
                  <li><strong>Баланс:</strong> Возвращается неиспользованный остаток подписки за вычетом активных дней.</li>
                  <li><strong>Сроки зачисления:</strong> От 1 до 3 банковских дней (зависит от банка-эмитента).</li>
                </ul>
              )}
            </div>

            <form onSubmit={handleCashOutSubmit} className="space-y-4">
              {cashOutTab === 'bonus' ? (
                /* BONUS WITHDRAWAL PANEL */
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-200/10 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Доступные бонусы:</span>
                      <strong className="text-amber-200 font-mono text-sm">{currentUser?.bonusesEarned || 2450} ₽</strong>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Вывод бонусов осуществляется в течение 24 часов на указанные реквизиты без удерживания комиссий. Минимальная сумма вывода — 500 ₽.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Сумма вывода (₽)</label>
                      <input 
                        type="number"
                        required
                        min="500"
                        max={currentUser?.bonusesEarned || 2450}
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Платежный шлюз</label>
                      <select 
                        value={payoutMethod}
                        onChange={(e) => setPayoutMethod(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-slate-300 text-xs focus:outline-none"
                      >
                        <option value="card">💳 Банковская карта РФ</option>
                        <option value="qiwi">🥝 QIWI кошелек</option>
                        <option value="crypto">🪙 USDT (TRC-20)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Номер карты или адрес кошелька *</label>
                    <input 
                      type="text"
                      required
                      placeholder={payoutMethod === 'card' ? '4276 •••• •••• 1234' : payoutMethod === 'qiwi' ? '+7 999 123-45-67' : 'T9yZzZ...'}
                      value={payoutDetails}
                      onChange={(e) => setPayoutDetails(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* SUBSCRIPTION REFUND PANEL */
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl bg-red-400/5 border border-red-500/15 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Оплаченный баланс:</span>
                      <strong className="text-red-300 font-mono text-sm">{tariff.balance} ₽</strong>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-relaxed">
                      Согласно условиям оферты, вы можете в любое время осуществить возврат неиспользованного баланса подписки на расчетный счет. Время обработки транзакции банком-эквайером — до 3 дней.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Сумма возврата (₽)</label>
                      <input 
                        type="number"
                        required
                        min="1"
                        max={tariff.balance}
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white font-mono text-xs focus:outline-none animate-fade-in"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Укажите причину возврата *</label>
                      <textarea 
                        rows={2}
                        required
                        placeholder="Например: Смена формата работы команды, сокращение штата сотрудников"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all cursor-pointer font-sans"
              >
                {cashOutTab === 'bonus' ? 'Заказать выплату бонусов' : 'Оформить возврат на карту'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVBAR */}
      <div className="fixed bottom-3 left-2.5 right-2.5 z-40 lg:hidden flex gap-2 items-center animate-slide-in-bottom" id="mobile-bottom-navbar-container">
        {/* Left Part: Long panel with 4 icons */}
        <nav className="flex-1 bg-[#17344F]/95 backdrop-blur-md border border-white/10 rounded-2xl flex justify-around py-1.5 px-0.5 shadow-2xl h-14 items-center" id="mobile-bottom-navbar">
          {currentUser?.role === UserRole.EMPLOYEE ? (
            <>
              <button
                onClick={() => handleTabClick('fill_report')}
                className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'fill_report' ? 'text-[#F4EE8E] bg-[#1E4468]/50' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={15} />
                <span className="text-[8px] font-bold truncate max-w-full">Ввод</span>
              </button>
              <button
                onClick={() => handleTabClick('employee_schedule')}
                className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'employee_schedule' ? 'text-[#F4EE8E] bg-[#1E4468]/50' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock size={15} />
                <span className="text-[8px] font-bold truncate max-w-full">График</span>
              </button>
              <button
                onClick={() => handleTabClick('calendar')}
                className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'calendar' ? 'text-[#F4EE8E] bg-[#1E4468]/50' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarIcon size={15} />
                <span className="text-[8px] font-bold truncate max-w-full">Рапорты</span>
              </button>
              <button
                onClick={() => handleTabClick('profile')}
                className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'profile' ? 'text-[#F4EE8E] bg-[#1E4468]/50' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User size={15} />
                <span className="text-[8px] font-bold truncate max-w-full">Профиль</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleTabClick('calendar')}
                className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'calendar' ? 'text-[#F4EE8E] bg-[#1E4468]/50' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarIcon size={15} />
                <span className="text-[8px] font-bold truncate max-w-full">Рапорты</span>
              </button>
              <button
                onClick={() => handleTabClick('employees')}
                className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'employees' ? 'text-[#F4EE8E] bg-[#1E4468]/50' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users size={15} />
                <span className="text-[8px] font-bold truncate max-w-full">Команда</span>
              </button>
              <button
                onClick={() => handleTabClick('analytics')}
                className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'analytics' ? 'text-[#F4EE8E] bg-[#1E4468]/50' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 size={15} />
                <span className="text-[8px] font-bold truncate max-w-full">Анализ</span>
              </button>
              <button
                onClick={() => handleTabClick('profile')}
                className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'profile' ? 'text-[#F4EE8E] bg-[#1E4468]/50' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User size={15} />
                <span className="text-[8px] font-bold truncate max-w-full">Профиль</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Part: Round circular AI assistant button with gold glowing border */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-ai-assistant'));
          }}
          className="w-12 h-12 rounded-full border border-[#E7C768] bg-gradient-to-br from-[#1E4468] to-[#17344F] flex flex-col items-center justify-center shadow-[0_0_12px_rgba(231,199,104,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer text-amber-200 shrink-0 select-none relative group"
          id="mobile-ai-navbar-btn"
          title="ИИ Ассистент"
        >
          {/* Subtle gold glow pulse background */}
          <span className="absolute inset-0 rounded-full bg-amber-400/10 animate-ping pointer-events-none" />
          <Bot size={18} className="animate-pulse text-[#F4EE8E]" />
          <span className="text-[7.5px] font-extrabold text-amber-200 leading-none mt-0.5">ИИ Бот</span>
        </button>
      </div>

    </div>
  );
}
