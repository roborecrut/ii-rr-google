import React from 'react';
import { ShieldCheck, Calendar, FileText } from 'lucide-react';

export default function OfertaPage() {
  return (
    <div className="w-full min-h-screen text-slate-300 bg-gradient-to-b from-[#17344F] via-[#1E4468] to-[#265582] font-sans selection:bg-amber-200 selection:text-slate-900 px-4 sm:px-6 py-12" id="oferta-page-root">
      <div className="mx-auto max-w-3xl space-y-8 bg-gradient-to-br from-[#17344F]/90 to-[#265582]/90 border border-white/20 p-8 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent" />

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 text-amber-200 px-3 py-1 rounded-full text-xs font-mono">
            <FileText size={13} />
            <span>ОФИЦИАЛЬНЫЙ ДОКУМЕНТ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-sans">
            Публичная оферта ИИ Рапорт
          </h2>
          <p className="text-xs text-slate-500">Редакция от 1 июля 2026 года · Москва, РФ</p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300">
          <p>
            Настоящий документ представляет собой официальное предложение Общества с ограниченной ответственностью «РентРоп» (далее — Исполнитель) заключить Договор об оказании услуг по предоставлению доступа к программному комплексу «ИИ Рапорт RR» (ii-rr.online) на изложенных ниже условиях.
          </p>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">1. Термины и определения</h4>
            <p>
              <strong>Исполнитель</strong> — ООО «РентРоп» (ИНН 7726477438, ОГРН 1217700234157, адрес: 115191, г. Москва, пер. Духовской, д. 17, стр. 15, помещ. 11Н/2).
            </p>
            <p>
              <strong>Заказчик</strong> — любое юридическое или физическое лицо, осуществившее акцепт оферты путем регистрации учетной записи или внесения абонентской платы.
            </p>
            <p>
              <strong>Сервис «ИИ Рапорт»</strong> — облачное программное обеспечение, размещенное на домене ii-rr.online, предназначенное для заполнения и анализа отчетов с помощью ИИ.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">2. Предмет договора</h4>
            <p>
              Исполнитель обязуется предоставить Заказчику неисключительную лицензию (доступ) к Сервису, а также услуги по ИИ-обработке отчетов, а Заказчик обязуется принять и оплатить услуги в соответствии с выбранным тарифом.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">3. Стоимость услуг и порядок расчетов</h4>
            <p>
              Тариф «Бизнес» составляет <strong>290 (двести девяносто) рублей</strong> за одного сотрудника в месяц. Оплата производится в рублях через платежный агрегатор Робокасса.
            </p>
            <p>
              Предоставляется бесплатный триал-период на 7 дней после регистрации с лимитом в 50 заполненных отчетов.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">4. Реферальная программа</h4>
            <p>
              Заказчики с ролью «Директор» могут участвовать в реферальной программе, привлекая новых клиентов. Бонус составляет <strong>15%</strong> от всех оплат привлеченного реферала и зачисляется на партнерский баланс в личном кабинете. Бонусы могут быть выведены на банковские реквизиты Заказчика по обращению в техподдержку.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">5. Конфиденциальность данных</h4>
            <p>
              Исполнитель обязуется соблюдать строгую конфиденциальность в отношении информации, вносимой сотрудниками Заказчика в отчеты. Данные обрабатываются нейросетью ii_rr исключительно в целях формирования рекомендаций и сводных саммари.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 text-center">
          <p className="text-[11px] text-slate-500">
            По вопросам партнерства или поддержки пишите на: <a href="mailto:info@arenda-ropa.com" className="text-amber-300">info@arenda-ropa.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
