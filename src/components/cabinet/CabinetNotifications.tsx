import React from 'react';
import { Sparkles, CheckCheck } from 'lucide-react';
import { NotificationItem } from '../../types';

interface CabinetNotificationsProps {
  notifications: NotificationItem[];
  handleMarkAllNotificationsRead: () => void;
}

export default function CabinetNotifications({
  notifications,
  handleMarkAllNotificationsRead
}: CabinetNotificationsProps) {
  return (
    <div className="space-y-6 animate-fade-in font-sans" id="panel-notifications">
      <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
        <div>
          <h3 className="text-xl font-bold text-white">Уведомления и Напоминания</h3>
          <p className="text-xs text-slate-400">Получайте мгновенные выводы от ИИ и системные сообщения об активности команды.</p>
        </div>
        <button 
          onClick={handleMarkAllNotificationsRead}
          className="px-3 py-1.5 rounded-lg bg-[#1E4468] hover:bg-[#1E4468]/80 text-xs font-semibold border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <CheckCheck size={13} />
          Отметить все прочитанными
        </button>
      </div>
      
      <div className="space-y-3" id="notifications-list">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-4 rounded-2xl border flex items-start gap-3.5 relative overflow-hidden transition-all ${
                notif.type === 'RECOMMENDATION' 
                  ? 'bg-amber-400/5 border-amber-200/15' 
                  : 'bg-[#17344F]/40 border-white/5'
              }`}
            >
              <div className="p-2 rounded-xl bg-[#17344F]/50 text-amber-200">
                <Sparkles size={14} />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                  <span className="text-[9px] text-slate-500 font-mono">{notif.timestamp}</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">{notif.message}</p>
              </div>
              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-red-500 mt-2 block shrink-0" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 rounded-3xl border border-white/5 bg-[#17344F]/10 text-slate-500 text-xs font-sans">
            Список пуст. Новых уведомлений нет.
          </div>
        )}
      </div>
    </div>
  );
}
