import React from 'react';
import { BookOpen, Info, CheckCircle2, ChevronLeft } from 'lucide-react';

const GUIDE_SECTIONS = [
  {
    title: "قواعد عمومی پلتفرم",
    items: [
      "به صورت پیش‌فرض، هر درخواستی در پرامپت مربوط به فرمی است که در پیش‌نمایش باز است (مگر به فرم دیگر اشاره شود).",
      "تمامی فیلدها در فرم 'اطلاعات اولیه طرف قرارداد' اجباری هستند و با خط قرمز در کنار فیلد مشخص می‌شوند."
    ]
  },
  {
    title: "تب‌های مشترک و اطلاعات قرارداد",
    items: [
      "تب اطلاعات قرارداد در اکثر فرم‌ها قابلیت ویرایش دارد.",
      "فیلد 'نوع قرارداد' در اکثر فرم‌ها قابلیت ویرایش دارد (در فرم جمع‌بندی حقوقی کاملاً باز است).",
      "در قراردادهای تهاتری، فیلد 'آیا قرارداد قالب‌دار است؟' مخفی شده و مقدار آن Null می‌گردد.",
      "فیلد 'درخواست، الحاقیه است؟' در تمامی انواع قراردادها (حتی تهاتر) نمایش داده می‌شود.",
      "در قراردادهای تهاتری، فیلد 'برآورد مالی' برای حفظ محرمانگی نمایش داده نمی‌شود."
    ]
  },
  {
    title: "فرم کارشناس مالی",
    items: [
      "قابلیت ویرایش فیلدهای 'نوع تهاتر'، 'تا تاریخ'، 'مبلغ (ریال)' و 'شماره قرارداد مرتبط' در جدول طرف قرارداد.",
      "نمایش فیلد جستجوی نام در صورت انتخاب گزینه 'بررسی توسط ذینفع' در قراردادهای تهاتری.",
      "تغییر عنوان فیلد ضمائم به 'ضمائم نهایی آرین پارس' و الزامی شدن آن در صورت تایید قرارداد تهاتر.",
      "نمایش بنر راهنمای آبی رنگ جهت بارگذاری نسخه نهایی قرارداد در حالت تهاتر."
    ]
  },
  {
    title: "فرم مدیر مالی (هلدینگ)",
    items: [
      "تغییر عنوان فیلد ضمائم به 'ضمائم نهایی هلدینگ' و الزامی شدن آن در صورت تایید قرارداد تهاتر.",
      "نمایش بنر راهنمای آبی رنگ جهت بارگذاری نسخه نهایی قرارداد در حالت تهاتر.",
      "نمایش فیلد جستجوی نام در زمان انتخاب 'بررسی توسط ذینفع'."
    ]
  },
  {
    title: "فرم جمع‌بندی حقوقی (Legal Summary)",
    items: [
      "دارای سه تب: اعلام نظر (Opinon)، مالی (Financial Info) و اطلاعات قرارداد.",
      "تب اعلام نظر شامل سه باکس رنگی بازخورد: بهبود، ریسک متوسط و ریسک بالا.",
      "نمایش خودکار ضمائم نهایی پارس/هلدینگ بر اساس تیم مالی انتخاب شده در قراردادهای تهاتری.",
      "الزامی بودن تایید چک‌لیست درج شماره فرایند در فوتر قرارداد در صورت تصمیم 'تایید'.",
      "نمایش بنر هشدار جهت استفاده از اسناد بارگذاری شده در چاپ نهایی قراردادهای تهاتری.",
      "امکان آپلود نسخه‌های نهایی PDF و Word قرارداد در انتهای فرم."
    ]
  },
  {
    title: "راهنمای توسعه‌دهنده (AGENTS.md)",
    items: [
      "فیلدهای فرم 'اطلاعات اولیه طرف قرارداد' (افزودن اطلاعات اولیه طرف قرارداد) همگی اجباری هستند.",
      "تمام فیلدهای ورودی باید قبل از ثبت، برای اطمینان از صحت و وجود مقدار بررسی (Validate) شوند.",
      "فیلدهای اجباری باید از طریق متدولوژی فنی بیزاجی با خط قرمز پهن در حاشیه سمت راست فیلد (یا تنظیم required به true روی FieldRow) مشخص شوند.",
      "به عنوان پیش‌فرض، هرگونه تغییر درخواستی (بصری یا عملکردی) با توجه به فرمی که هم‌اکنون در پیش‌نمایش در حال اجراست تفسیر و پیاده‌سازی می‌گردد."
    ]
  }
];

export function SoftwareGuide() {
  return (
    <div className="flex flex-col gap-6 text-gray-700 w-full max-w-7xl mx-auto pt-4 pb-24 animate-fade-in" dir="rtl">
      {/* Breadcrumb/Header */}
      <div className="bg-gradient-to-r from-[#005f77] to-[#008ba3] border border-cyan-800 rounded-sm shadow-md px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6" />
          <div className="flex flex-col">
            <h1 className="font-bold text-[16px]">راهنمای فنی نرم‌افزار و بیزنس رول‌ها</h1>
            <p className="text-[10px] opacity-80 font-mono">BIZAGI_PROCESS_DOCUMENTATION_V1</p>
          </div>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded text-[11px] font-bold backdrop-blur-sm border border-white/20">
          فقط قابل رویت در حالت تست
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GUIDE_SECTIONS.map((section, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#005f77]" />
              <h2 className="font-bold text-[13px] text-gray-800">{section.title}</h2>
            </div>
            <div className="p-5 flex flex-col gap-4 bg-gradient-to-b from-white to-gray-50/30 flex-1">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex gap-3 items-start group">
                  <div className="mt-1 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[12px] leading-relaxed text-gray-700 font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-4 flex items-start gap-3">
        <div className="bg-amber-100 p-2 rounded-full text-amber-700">
          <Info size={18} />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="font-bold text-[13px] text-amber-800">نکته برای توسعه‌دهنده</h4>
          <p className="text-[12px] text-amber-700 leading-relaxed">
            این مستندات مستقیماً از روی رول‌های پیاده‌سازی شده در کد اصلی استخراج شده است. هرگونه تغییر در عملکرد فرم‌ها باید در این بخش نیز به‌روزرسانی شود تا یکپارچگی راهنما حفظ گردد.
          </p>
        </div>
      </div>

      {/* Dedicated Developer Guide Panel */}
      <div id="developer-guide-panel" className="bg-gradient-to-l from-red-50/70 to-white border border-red-200 rounded-sm p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-red-100">
          <div className="w-6 h-6 bg-[#b90000] rounded-full flex items-center justify-center text-white text-xs font-bold font-mono">D</div>
          <h3 className="font-bold text-[14px] text-gray-800">راهنمای ارشد توسعه‌دهنده (AGENTS.md & Developer Guide)</h3>
          <span className="bg-red-100 text-[#b90000] px-2 py-0.5 rounded text-[10px] font-bold font-mono">STANDARDS</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-[12px] text-gray-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b90000]"></span>
              فیلدهای الزامی و اعتبارسنجی (Mandatory Fields)
            </h4>
            <ul className="list-disc pr-5 text-[11px] text-gray-600 leading-relaxed flex flex-col gap-1">
              <li>تمامی مشخصات و فیلدهای فرم <strong>اطلاعات اولیه طرف قرارداد</strong> کاملاً اجباری (Mandatory) می‌باشند.</li>
              <li>انجام اعتبارسنجی دقیق روی تمامی این متغیرها قبل از ارسال فرم‌ها الزامی است.</li>
              <li>طبق سند فنی بیزاجی، مشخص‌سازی این فیلدها با تعبیه خط قرمز پهن در کناره‌ عمودی فیلدها صورت می‌پذیرد.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-[12px] text-gray-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b90000]"></span>
              سیاق پرامپت‌ها و ساختار فرم فعال (Context Rules)
            </h4>
            <ul className="list-disc pr-5 text-[11px] text-gray-600 leading-relaxed flex flex-col gap-1">
              <li>مفروضات تغییرات همگی به صورت پیش‌فرض ناظر بر فرم فعال جاری در بستر iframe لایو ران خواهند بود.</li>
              <li>تناسب کامل استایل بدنه با نگاشت هویت بصری سازمان (گروه آرین پارس موتور) همواره رعایت می‌شود.</li>
              <li>رنگ‌بندی پایه‌ای سازمانی بر مبنای زرشکی تیره صریح <code className="bg-gray-100 px-1 rounded text-red-700 font-mono text-[10px]">#b90000</code> بنا نهاده شده است.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
