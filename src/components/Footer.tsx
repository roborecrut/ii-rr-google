import React from 'react';
import { ExternalLink, MessageCircle, CreditCard, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="w-full border-t border-white/10 bg-gradient-to-b from-[#17344F] to-[#265582] text-slate-300 py-10 px-4 sm:px-6 relative" id="app-footer">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Logo and Copyright */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img 
                src="https://rjhtauzookkvlipvqpvr.supabase.co/storage/v1/object/public/Logos/RR-Logo.png" 
                alt="RR Logo" 
                className="w-8 h-8 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-extrabold text-[#F4EE8E] text-base tracking-wide font-sans">ИИ РАПОРТ RR</span>
            </div>
            <p className="text-xs text-slate-400">
              © 2026 ИИ Рапорт RR. Все права защищены.<br />
              Умные решения для автоматизации корпоративной отчетности с поддержкой нейросетей.
            </p>
            
            {/* Payment systems indicators */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-sans" id="payment-methods">
              <span className="text-slate-500 mr-1 flex items-center gap-1"><CreditCard size={12} /> Принимаем к оплате:</span>
              <span className="px-2 py-0.5 rounded bg-[#1E4468]/60 border border-white/10 text-slate-300 font-semibold">МИР</span>
              <span className="px-2 py-0.5 rounded bg-[#1E4468]/60 border border-white/10 text-slate-300 font-semibold">Visa</span>
              <span className="px-2 py-0.5 rounded bg-[#1E4468]/60 border border-white/10 text-slate-300 font-semibold">Mastercard</span>
              <span className="px-2 py-0.5 rounded bg-[#1E4468]/60 border border-amber-200/20 text-[#E7C768] font-bold">Робокасса</span>
            </div>
          </div>

          {/* Requisites */}
          <div className="flex flex-col gap-2 text-xs">
            <h5 className="font-semibold text-slate-100 uppercase tracking-wider mb-1 text-xs">Реквизиты оператора</h5>
            <p className="font-semibold text-slate-300">ООО «РентРоп»</p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Юридический адрес: 115191, г. Москва, пер. Духовской, д. 17, стр. 15, помещ. 11Н/2<br />
              ОГРН: 1217700234157 · ИНН: 7726477438
            </p>
            <p className="text-slate-400 text-[11px] mt-1">
              E-mail: <a href="mailto:info@arenda-ropa.com" className="hover:text-amber-300 transition-colors">info@arenda-ropa.com</a>
            </p>
            <button 
              onClick={() => onNavigate('/oferta')}
              className="text-[#E7C768] hover:underline text-[11px] text-left mt-1 cursor-pointer flex items-center gap-1 font-sans"
            >
              <Shield size={11} />
              Публичная оферта сервиса
            </button>
            <button 
              onClick={() => onNavigate('/blog')}
              className="text-[#E7C768] hover:underline text-[11px] text-left mt-1 cursor-pointer flex items-center gap-1 font-sans"
              id="footer-blog-link"
            >
              <span>✍️</span>
              Блог и SEO база знаний
            </button>
          </div>

          {/* Action Links & External integrations */}
          <div className="flex flex-col gap-3">
            <h5 className="font-semibold text-slate-100 uppercase tracking-wider text-xs">Продукты и Поддержка</h5>
            
            <div className="flex flex-col gap-2">
              {/* Product link */}
              <a 
                href="https://rent-rop.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] text-slate-900 text-[11px] font-bold hover:brightness-110 shadow-sm active:scale-98 transition-all font-sans border border-amber-200/40"
                id="footer-product-btn"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E4468]" />
                  Продукт компании РентРОП
                </span>
                <ExternalLink size={10} className="text-slate-900" />
              </a>

              {/* Support channel button */}
              <a 
                href="https://t.me/+Qr9hu55w7tEwNjZi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#1E4468] text-slate-100 hover:bg-[#265582] text-[11px] font-semibold active:scale-98 transition-all font-sans border border-white/10"
                id="footer-support-btn"
              >
                <span className="flex items-center gap-1.5 text-[#F4EE8E]">
                  <MessageCircle size={12} className="text-[#F4EE8E]" />
                  Чат техподдержки Telegram
                </span>
                <ExternalLink size={10} className="text-slate-300" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>ИИ Рапорт — революционная система автоматической отчетности и рекомендаций.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0 font-sans">
            <span className="hover:text-slate-300 cursor-pointer">ii-rr.ru</span>
            <span className="text-[#F4EE8E] font-semibold">ii-rr.online (основной)</span>
            <span className="hover:text-slate-300 cursor-pointer">www.ii-rr.online</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
