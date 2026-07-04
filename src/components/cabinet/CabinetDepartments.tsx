import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit2, Users, Check, X, Building, Info, MessageSquare, HelpCircle, Activity, Link, Share2, Landmark, RefreshCw, GripVertical } from 'lucide-react';
import { Department, UserProfile, UserRole } from '../../types';

interface CabinetDepartmentsProps {
  departments: Department[];
  setDepartments: (val: Department[]) => void;
  saveStateToServer: (updated: any) => void;
  // All state needed for syncing with state.json
  company: any;
  templates: any;
  reports: any;
  transactions: any;
  notifications: any;
  tariff: any;
  crmCompanies: any;
  // Optional mock user database to choose employees from
  mockEmployees: UserProfile[];
}

export default function CabinetDepartments({
  departments,
  setDepartments,
  saveStateToServer,
  company,
  templates,
  reports,
  transactions,
  notifications,
  tariff,
  crmCompanies,
  mockEmployees
}: CabinetDepartmentsProps) {
  // Local state for adding a department
  const [newDepName, setNewDepName] = useState('');
  const [newDepChat, setNewDepChat] = useState('');
  const [newDepParent, setNewDepParent] = useState<string>('none');

  // Currently opened department details modal
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingChat, setEditingChat] = useState('');
  const [editingParent, setEditingParent] = useState<string>('none');
  const [quickEmployeeId, setQuickEmployeeId] = useState('');

  // Telegram test state
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Drag and Drop State for 2D Tree Sandbox
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedDeptId, setDraggedDeptId] = useState<string | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });

  // Fallback default coordinates if not set
  const getCoordinates = (dep: Department, index: number) => {
    const x = dep.x !== undefined ? dep.x : 100 + (index % 3) * 320;
    const y = dep.y !== undefined ? dep.y : 80 + Math.floor(index / 3) * 180;
    return { x, y };
  };

  // Initialize coordinates if they are undefined
  useEffect(() => {
    const missingCoords = departments.some(d => d.x === undefined || d.y === undefined);
    if (missingCoords) {
      const updated = departments.map((d, i) => {
        if (d.x === undefined || d.y === undefined) {
          // Pre-defined values for default departments or procedural grid
          let defaultX = 100 + (i % 3) * 320;
          let defaultY = 80 + Math.floor(i / 3) * 180;
          if (d.id === 'dep-1') { defaultX = 450; defaultY = 40; }
          else if (d.id === 'dep-2') { defaultX = 150; defaultY = 240; }
          else if (d.id === 'dep-3') { defaultX = 750; defaultY = 240; }

          return { ...d, x: defaultX, y: defaultY };
        }
        return d;
      });
      setDepartments(updated);
    }
  }, [departments]);

  // Handle Telegram Chat test message call
  const handleTestTelegram = async (chatId: string) => {
    if (!chatId.trim()) {
      setTelegramTestResult({ success: false, message: 'Пожалуйста, введите ID чата для проверки.' });
      return;
    }
    setIsTestingTelegram(true);
    setTelegramTestResult(null);

    try {
      const res = await fetch('/api/telegram/test-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramTestResult({ success: true, message: data.message });
      } else {
        setTelegramTestResult({ success: false, message: data.error || 'Не удалось привязать бота.' });
      }
    } catch (err) {
      setTelegramTestResult({ success: false, message: 'Сетевая ошибка. Проверьте подключение к серверу.' });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  // Adding Department
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepName.trim() || !newDepChat.trim()) return;

    // Generate coordinate below parent or randomized slightly
    let pX = 350;
    let pY = 150;
    if (newDepParent !== 'none') {
      const parent = departments.find(d => d.id === newDepParent);
      if (parent) {
        pX = (parent.x || 300) + (Math.random() * 100 - 50);
        pY = (parent.y || 100) + 160;
      }
    }

    const newDep: Department = {
      id: 'dep-' + Date.now().toString().slice(-6),
      name: newDepName.trim(),
      managerId: '48275916',
      employeeIds: [],
      telegramChatId: newDepChat.trim(),
      parentId: newDepParent === 'none' ? null : newDepParent,
      x: pX,
      y: pY
    };

    const next = [...departments, newDep];
    setDepartments(next);
    saveStateToServer({ company, departments: next, templates, reports, transactions, notifications, tariff, crmCompanies });

    setNewDepName('');
    setNewDepChat('');
    setNewDepParent('none');
    setTelegramTestResult(null);
  };

  // Open department config modal
  const handleOpenDeptDetails = (dep: Department) => {
    setSelectedDept(dep);
    setEditingName(dep.name);
    setEditingChat(dep.telegramChatId);
    setEditingParent(dep.parentId || 'none');
    setQuickEmployeeId('');
    setTelegramTestResult(null);
  };

  const handleSaveChanges = () => {
    if (!selectedDept) return;
    const updated = departments.map(d => {
      if (d.id === selectedDept.id) {
        return {
          ...d,
          name: editingName,
          telegramChatId: editingChat,
          parentId: editingParent === 'none' ? null : editingParent
        };
      }
      return d;
    });

    setDepartments(updated);
    saveStateToServer({ company, departments: updated, templates, reports, transactions, notifications, tariff, crmCompanies });
    setSelectedDept(null);
  };

  const handleAddEmployeeToDept = () => {
    if (!selectedDept || !quickEmployeeId) return;
    if (selectedDept.employeeIds.includes(quickEmployeeId)) {
      alert('Сотрудник уже состоит в этом отделе!');
      return;
    }

    const updated = departments.map(d => {
      if (d.id === selectedDept.id) {
        return {
          ...d,
          employeeIds: [...d.employeeIds, quickEmployeeId]
        };
      }
      return d;
    });

    setDepartments(updated);
    saveStateToServer({ company, departments: updated, templates, reports, transactions, notifications, tariff, crmCompanies });
    
    setSelectedDept({
      ...selectedDept,
      employeeIds: [...selectedDept.employeeIds, quickEmployeeId]
    });
    setQuickEmployeeId('');
  };

  const handleRemoveEmployeeFromDept = (empId: string) => {
    if (!selectedDept) return;
    const updated = departments.map(d => {
      if (d.id === selectedDept.id) {
        return {
          ...d,
          employeeIds: d.employeeIds.filter(id => id !== empId)
        };
      }
      return d;
    });

    setDepartments(updated);
    saveStateToServer({ company, departments: updated, templates, reports, transactions, notifications, tariff, crmCompanies });

    setSelectedDept({
      ...selectedDept,
      employeeIds: selectedDept.employeeIds.filter(id => id !== empId)
    });
  };

  // Drag start handler for node positioning
  const handleNodeDragStart = (e: React.MouseEvent, depId: string) => {
    e.stopPropagation();
    const dep = departments.find(d => d.id === depId);
    if (!dep || !canvasRef.current) return;

    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const nodeX = dep.x !== undefined ? dep.x : 0;
    const nodeY = dep.y !== undefined ? dep.y : 0;

    // Calculate relative cursor position inside the card node
    const cursorX = e.clientX - canvasBounds.left - nodeX;
    const cursorY = e.clientY - canvasBounds.top - nodeY;

    setDraggedDeptId(depId);
    setDragStartOffset({ x: cursorX, y: cursorY });
  };

  // Touch start handler for mobile positioning
  const handleNodeTouchStart = (e: React.TouchEvent, depId: string) => {
    e.stopPropagation();
    const dep = departments.find(d => d.id === depId);
    if (!dep || !canvasRef.current) return;

    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const nodeX = dep.x !== undefined ? dep.x : 0;
    const nodeY = dep.y !== undefined ? dep.y : 0;

    const touch = e.touches[0];
    const cursorX = touch.clientX - canvasBounds.left - nodeX;
    const cursorY = touch.clientY - canvasBounds.top - nodeY;

    setDraggedDeptId(depId);
    setDragStartOffset({ x: cursorX, y: cursorY });
  };

  // Drag move handler on the general sandbox canvas
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggedDeptId || !canvasRef.current) return;
    const canvasBounds = canvasRef.current.getBoundingClientRect();

    // New calculated positions within limits
    const newX = Math.max(20, Math.min(e.clientX - canvasBounds.left - dragStartOffset.x, 1050));
    const newY = Math.max(20, Math.min(e.clientY - canvasBounds.top - dragStartOffset.y, 650));

    const updated = departments.map(d => {
      if (d.id === draggedDeptId) {
        return { ...d, x: newX, y: newY };
      }
      return d;
    });
    setDepartments(updated);
  };

  // Touch move handler on the general sandbox canvas
  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    if (!draggedDeptId || !canvasRef.current) return;
    
    // Prevent default scrolling behaviour only when actively dragging a department card
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];

    // New calculated positions within limits
    const newX = Math.max(20, Math.min(touch.clientX - canvasBounds.left - dragStartOffset.x, 1050));
    const newY = Math.max(20, Math.min(touch.clientY - canvasBounds.top - dragStartOffset.y, 650));

    const updated = departments.map(d => {
      if (d.id === draggedDeptId) {
        return { ...d, x: newX, y: newY };
      }
      return d;
    });
    setDepartments(updated);
  };

  // Drag release
  const handleCanvasMouseUp = () => {
    if (draggedDeptId) {
      setDraggedDeptId(null);
      // Save finalized layout state to server persistence
      saveStateToServer({ company, departments, templates, reports, transactions, notifications, tariff, crmCompanies });
    }
  };

  // Touch release
  const handleCanvasTouchEnd = () => {
    if (draggedDeptId) {
      setDraggedDeptId(null);
      // Save finalized layout state to server persistence
      saveStateToServer({ company, departments, templates, reports, transactions, notifications, tariff, crmCompanies });
    }
  };

  // Manual fast parent update helper directly from card pulldowns
  const handleDirectParentChange = (depId: string, parentId: string) => {
    const updated = departments.map(d => {
      if (d.id === depId) {
        return { ...d, parentId: parentId === 'none' ? null : parentId };
      }
      return d;
    });
    setDepartments(updated);
    saveStateToServer({ company, departments: updated, templates, reports, transactions, notifications, tariff, crmCompanies });
  };

  return (
    <div className="space-y-6 animate-fade-in" id="panel-departments">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <Building className="text-amber-200" size={20} />
            <span>Дерево связи отделов и Каналы</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Интерактивный 2D-органайзер: перетаскивайте карточки отделов мышкой, настраивайте иерархию связей и привязывайте Telegram чаты для публикации отчетов.
          </p>
        </div>
      </div>

      {/* SECTION 1: Telegram Setup Guidelines and New Department Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Telegram Bot Instructions Card */}
        <div className="p-5 rounded-3xl border border-white/5 bg-[#17344F]/30 space-y-3 lg:col-span-1">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#F4EE8E] flex items-center gap-1">
            <Info size={12} />
            Инструкция по настройке бота:
          </span>
          <div className="text-[11px] text-slate-300 space-y-2.5 leading-relaxed font-sans">
            <p>Чтобы бот отправлял рапорты в нужный рабочий чат:</p>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-400">
              <li>Добавьте официального бота платформы в чат как участника.</li>
              <li>Сделайте его <strong>администратором</strong> с правом отправки текстовых сообщений.</li>
              <li>Скопируйте ID чата. Для публичных супергрупп подходит юзернейм (например, <code className="text-[#F4EE8E] font-mono">@sales_reports_chat</code>).</li>
              <li>Для приватных групповых чатов укажите числовой ID с минусом, например: <code className="text-[#F4EE8E] font-mono">-1003999311216</code>.</li>
            </ol>
            <div className="pt-2">
              <span className="block text-[9px] text-slate-500 font-bold uppercase">Встроенный токен для тестов:</span>
              <p className="p-1.5 rounded bg-slate-950/40 text-[9px] font-mono select-all text-sky-300 border border-white/5 truncate">
                8598472380:AAEfgSiqsOJx4mA3Jk5DKYW8AUFgLGV4Sc8
              </p>
            </div>
          </div>
        </div>

        {/* Create Department Form with Live Verification */}
        <div className="p-5 rounded-3xl border border-white/10 bg-[#17344F]/40 lg:col-span-2 space-y-4">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">Создать новое подразделение:</span>
          
          <form onSubmit={handleAddDept} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Название отдела *</label>
              <input 
                type="text" 
                required 
                value={newDepName} 
                onChange={(e) => setNewDepName(e.target.value)}
                placeholder="Отдел Продаж"
                className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Telegram Chat ID / Юзернейм *</label>
              <input 
                type="text" 
                required
                value={newDepChat} 
                onChange={(e) => setNewDepChat(e.target.value)}
                placeholder="Например, -1003999311216"
                className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#E7C768] font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Иерархия (Подчиняется)</label>
              <select 
                value={newDepParent}
                onChange={(e) => setNewDepParent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#17344F]/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] h-9"
              >
                <option value="none">Корень (Главный отдел)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleTestTelegram(newDepChat)}
                disabled={isTestingTelegram || !newDepChat.trim()}
                className="px-3 py-1.5 rounded-lg border border-sky-400/30 text-sky-300 text-[10px] font-bold hover:bg-sky-400/10 cursor-pointer disabled:opacity-45 flex items-center gap-1"
              >
                {isTestingTelegram ? (
                  <>
                    <RefreshCw className="animate-spin" size={10} />
                    Связь проверяется...
                  </>
                ) : (
                  <>
                    <Share2 size={10} />
                    Проверить отправку в Telegram
                  </>
                )}
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer font-sans flex items-center gap-1.5"
              >
                <Plus size={13} />
                Добавить отдел в структуру
              </button>
            </div>
          </form>

          {/* Test connection alert block */}
          {telegramTestResult && (
            <div className={`p-3 rounded-xl border text-xs animate-fade-in ${
              telegramTestResult.success 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}>
              {telegramTestResult.success ? '✅ ' : '❌ '}
              {telegramTestResult.message}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: THE INTERACTIVE 2D TREE CONNECTIVITY STAGE */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Activity size={12} className="text-amber-200" />
            Интерактивный холст структуры (Drag and Drop):
          </span>
          <span className="text-[10px] text-slate-500">Зажмите карточку для перемещения по холсту. На мобильных можно прокручивать холст пальцем.</span>
        </div>

        <div className="w-full overflow-auto border border-white/10 rounded-3xl bg-slate-950/45 shadow-inner" id="departments-stage-scroll-wrapper">
          <div 
            ref={canvasRef}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onTouchMove={handleCanvasTouchMove}
            onTouchEnd={handleCanvasTouchEnd}
            className="relative w-[1300px] h-[750px] cursor-grab active:cursor-grabbing select-none"
            id="departments-stage-canvas"
          >
            {/* SVG Backplate to Draw Connecting Lines */}
            <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
              <defs>
                <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F4EE8E" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#D99E41" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              
              {/* Draw connections from parent coords to child coords */}
              {departments.map(dep => {
                if (!dep.parentId) return null;
                const parent = departments.find(d => d.id === dep.parentId);
                if (!parent) return null;

                const startCoords = getCoordinates(parent, departments.indexOf(parent));
                const endCoords = getCoordinates(dep, departments.indexOf(dep));

                // Center coordinates inside 260px wide cards and 140px tall cards
                const startX = startCoords.x + 130;
                const startY = startCoords.y + 70;
                const endX = endCoords.x + 130;
                const endY = endCoords.y + 70;

                return (
                  <g key={`link-${dep.id}`}>
                    {/* Glowing connector stroke */}
                    <path 
                      d={`M ${startX} ${startY} C ${startX} ${(startY + endY) / 2}, ${endX} ${(startY + endY) / 2}, ${endX} ${endY}`} 
                      fill="none" 
                      stroke="url(#glow-grad)" 
                      strokeWidth="2" 
                      strokeDasharray="5 5" 
                      className="animate-pulse"
                    />
                    {/* Interactive dot at the end */}
                    <circle cx={endX} cy={endY} r="4" fill="#D99E41" />
                  </g>
                );
              })}
            </svg>

            {/* Absolute Drag-and-Drop Department Cards */}
            {departments.map((dep, idx) => {
              const coords = getCoordinates(dep, idx);
              const parentName = dep.parentId ? departments.find(d => d.id === dep.parentId)?.name : null;
              const isDraggingThis = draggedDeptId === dep.id;

              return (
                <div
                  key={dep.id}
                  style={{
                    left: `${coords.x}px`,
                    top: `${coords.y}px`,
                    width: '260px'
                  }}
                  className={`absolute z-10 p-4 rounded-2xl border bg-[#17344F]/90 shadow-xl flex flex-col justify-between select-none transition-shadow ${
                    isDraggingThis 
                      ? 'border-amber-300 ring-2 ring-amber-300/30 shadow-2xl scale-102 opacity-95' 
                      : 'border-white/10 hover:border-amber-200/50 hover:bg-[#1E4468]/95'
                  }`}
                >
                {/* Drag Handle Row */}
                <div 
                  onMouseDown={(e) => handleNodeDragStart(e, dep.id)}
                  onTouchStart={(e) => handleNodeTouchStart(e, dep.id)}
                  onTouchMove={handleCanvasTouchMove}
                  onTouchEnd={handleCanvasTouchEnd}
                  style={{ touchAction: 'none' }}
                  className="flex items-center gap-2 pb-1.5 border-b border-white/5 mb-2 cursor-grab active:cursor-grabbing hover:bg-white/5 p-1 rounded-lg transition-colors shrink-0 select-none"
                  title="Зажмите и тащите для перемещения"
                >
                  <GripVertical size={14} className="text-amber-400 shrink-0" />
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-200/80 font-mono">Перетащить блок</span>
                </div>

                {/* Header */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-bold text-[#F4EE8E] text-xs truncate" title={dep.name}>
                      {dep.name}
                    </h4>
                    
                    {/* Delete button */}
                    <button
                      type="button"
                      onMouseDown={(e) => e.stopPropagation()} // Prevent dragging triggers
                      onClick={() => {
                        if (confirm(`Вы действительно хотите удалить отдел "${dep.name}"?`)) {
                          const next = departments.filter(d => d.id !== dep.id);
                          setDepartments(next);
                          saveStateToServer({ company, departments: next, templates, reports, transactions, notifications, tariff, crmCompanies });
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-red-400 rounded cursor-pointer shrink-0 transition-colors"
                      title="Удалить этот отдел"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Manual Line Connect option (combobox inside the card!) */}
                  <div className="pt-1.5 flex items-center gap-1 text-[9px] text-slate-400">
                    <Link size={10} className="text-amber-200" />
                    <span>Родитель:</span>
                    <select
                      onMouseDown={(e) => e.stopPropagation()} // Stop dragging trigger
                      value={dep.parentId || 'none'}
                      onChange={(e) => handleDirectParentChange(dep.id, e.target.value)}
                      className="bg-slate-900/60 border border-white/5 rounded text-[9px] text-slate-300 px-1 py-0.5 focus:outline-none focus:border-amber-300 cursor-pointer max-w-[120px] truncate"
                    >
                      <option value="none">Корень (Нет)</option>
                      {departments.filter(d => d.id !== dep.id).map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Details Body */}
                <div className="mt-3 text-[10px] space-y-1 text-slate-300 font-mono border-t border-white/5 pt-2">
                  <div className="truncate flex items-center gap-1" title={dep.telegramChatId}>
                    <span className="text-slate-500 font-sans">Чат:</span>
                    <span className="text-sky-300 truncate font-mono">{dep.telegramChatId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 font-sans">Сотрудников:</span>
                    <span className="text-emerald-400 font-bold">{dep.employeeIds.length}</span>
                  </div>
                </div>

                {/* Edit Controls Trigger */}
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()} // Stop drag trigger
                  onClick={() => handleOpenDeptDetails(dep)}
                  className="mt-3 pt-2 border-t border-white/5 w-full text-center text-[9px] font-bold text-amber-200 uppercase tracking-wider hover:text-white cursor-pointer flex items-center justify-center gap-1"
                >
                  <Edit2 size={9} />
                  Редактировать параметры
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>

      {/* SECTION 3: DEPARTMENT PARAMETERS DETAILS MODAL (INFO + EDIT + STAFF MEMBERS) */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17344F]/80 backdrop-blur-md animate-fade-in" id="dept-details-modal">
          <div className="relative w-full max-w-2xl border border-white/10 bg-gradient-to-b from-[#17344F] to-[#1E4468] rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 to-white/5" />
            
            <div className="flex justify-between items-start border-b border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1E4468] border border-amber-200/30 flex items-center justify-center text-[#E7C768]">
                  <Building size={16} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#F4EE8E]">Отдел: {selectedDept.name}</h4>
                  <p className="text-[10px] text-slate-400">Редактирование параметров и привязка сотрудников</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDept(null)}
                className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 font-sans">
              
              {/* Form parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Название отдела</label>
                  <input 
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Telegram Chat ID</label>
                  <input 
                    type="text"
                    value={editingChat}
                    onChange={(e) => setEditingChat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Подчиняется отделу</label>
                  <select 
                    value={editingParent}
                    onChange={(e) => setEditingParent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#17344F]/60 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E7C768] h-9"
                  >
                    <option value="none">Корень (Нет)</option>
                    {departments.filter(d => d.id !== selectedDept.id).map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bot Check inside Modal */}
              <div className="p-4 rounded-xl border border-white/5 bg-[#17344F]/40 space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Быстрая проверка отправки:</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleTestTelegram(editingChat)}
                    disabled={isTestingTelegram || !editingChat.trim()}
                    className="px-3.5 py-1.5 rounded-lg border border-sky-400/40 text-sky-200 text-[10px] font-bold hover:bg-sky-400/15 cursor-pointer disabled:opacity-45 flex items-center gap-1.5"
                  >
                    {isTestingTelegram ? (
                      <>
                        <RefreshCw className="animate-spin" size={11} />
                        Доставка в Telegram...
                      </>
                    ) : (
                      <>
                        <Share2 size={11} />
                        Отправить проверочный рапорт ботом
                      </>
                    )}
                  </button>
                  <span className="text-[9.5px] text-slate-400">Нажмите для отправки мгновенного сигнала в указанный ID.</span>
                </div>
                
                {telegramTestResult && (
                  <p className={`text-xs p-2.5 rounded-lg border ${
                    telegramTestResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
                  }`}>
                    {telegramTestResult.message}
                  </p>
                )}
              </div>

              {/* Staff Management Section */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h5 className="text-xs font-bold uppercase text-amber-200 tracking-wider flex items-center gap-1.5">
                  <Users size={13} />
                  <span>Состав отдела ({selectedDept.employeeIds.length} сотрудников)</span>
                </h5>

                {/* Add employee to department select bar */}
                <div className="flex gap-2 bg-[#17344F]/40 p-3 rounded-xl border border-white/5 items-center">
                  <div className="flex-1">
                    <span className="block text-[9px] text-slate-400 mb-1 font-bold">Выберите сотрудника для добавления:</span>
                    <select
                      value={quickEmployeeId}
                      onChange={(e) => setQuickEmployeeId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#1E4468] border border-white/10 text-white text-xs focus:outline-none h-8"
                    >
                      <option value="">-- Выберите из списка --</option>
                      {mockEmployees
                        .filter(e => !selectedDept.employeeIds.includes(e.id))
                        .map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({e.position || 'Сотрудник'})</option>
                        ))
                      }
                    </select>
                  </div>
                  <button
                    onClick={handleAddEmployeeToDept}
                    disabled={!quickEmployeeId}
                    className="mt-4 px-4 py-1.5 rounded-lg font-bold bg-[#E7C768] text-slate-900 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs h-8 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    Добавить
                  </button>
                </div>

                {/* List of current employees */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {selectedDept.employeeIds.length === 0 ? (
                    <div className="p-4 rounded-xl border border-white/5 bg-[#17344F]/20 text-center col-span-2 text-slate-400 text-xs">
                      В этом отделе пока нет привязанных сотрудников. Добавьте сотрудников из списка выше!
                    </div>
                  ) : (
                    selectedDept.employeeIds.map(empId => {
                      const emp = mockEmployees.find(e => e.id === empId);
                      return (
                        <div key={empId} className="p-3 rounded-xl border border-white/5 bg-[#1E4468]/50 flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{emp ? emp.name : `Сотрудник ID: ${empId}`}</p>
                            <p className="text-[10px] text-slate-400 truncate">{emp ? emp.position : 'Должность не указана'}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveEmployeeFromDept(empId)}
                            className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-colors shrink-0"
                            title="Исключить из отдела"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            <div className="border-t border-white/10 pt-4 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setSelectedDept(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={13} />
                Сохранить настройки
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
