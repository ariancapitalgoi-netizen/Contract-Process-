/**
 * UI Override Registry
 * 
 * This file serves as the "root source of truth" for UI customizations.
 * When a user edits text or hides elements via the "Edit Form" UI, 
 * the changes are automatically migrated here via the Save button.
 */

export type UIOverride = {
  text?: string;
  hidden?: boolean;
  styles?: any;
  customData?: any;
};

export const UI_OVERRIDES: Record<string, UIOverride> = {
  "نوع تهاتر": {
    "hidden": true
  },
  "تا تاریخ": {
    "hidden": true
  },
  "مبلغ (ریال)": {
    "hidden": true
  },
  "شماره قرارداد مرتبط": {
    "hidden": true
  },

  "بررسی درخواست توسط ...": {
    "text": "بررسی قرارداد توسط ..."
  },
  "بررسی قرارداد توسط مدیر مالی": {
    "text": "بررسی قرارداد توسط مدیر مالی (پارس)"
  },
  "Mehrbod Adili": {
    "text": "X"
  },
  "۰۳:۵۷  ۱۴۰۳/۵/۱۱": {
    "text": "XXX"
  },
  "فرم‌های فرآیند": {
    "text": "فرم‌های فرآیند انعقاد قرارداد"
  },
  "سامانه انعقاد قرارداد": {
    "text": "درخواست انعقاد قرارداد"
  },
  "درخواست انعقاد قرارداد": {
    "text": "درخواست انعقاد قراداد"
  },

  "راهنمای پویای توسعه و رول‌های فرآیند در بیزاجی (Bizagi Technical Notes)": {
    "text": "راهنما (Bizagi Technical Notes)"
  },
  "نتیجه بررسی مدیر ارشد واحد مربوطه": {
    "text": "نتیجه بررسی..."
  },
  "holding_finance_review_notes": {
    "customData": [
      {
        "text": "تغییر گزینه‌های تصمیم در قراردادهای تهاتری: در قراردادهای تهاتری، گزینه‌های 'تصمیم اتخاذ شده' به (تایید، بررسی توسط ذینفع، رد) تغییر می‌یابد.",
        "targetId": "holding-finance-manager-decision-row",
        "tabId": "opinion"
      },
      {
        "text": "فیلد جستجوی ذینفع: در صورت انتخاب 'بررسی توسط ذینفع' در قراردادهای تهاتری، فیلد جستجوی نام نمایش داده می‌شود.",
        "targetId": "holding-finance-manager-decision-row",
        "tabId": "opinion"
      },
      {
        "text": "اخطار رد درخواست: در صورت انتخاب گزینه 'رد'، بنر هشدار جهت آگاهی‌بخشی در خصوص مختومه شدن فرآیند نمایش داده می‌شود.",
        "targetId": "holding-finance-manager-decision-row",
        "tabId": "opinion"
      },
      {
        "text": "تغییر نام ضمائم در قراردادهای تهاتری تایید شده: در صورت تایید قرارداد تهاتر، عنوان فیلد ضمائم به 'ضمائم نهایی هلدینگ' تغییر می‌کند.",
        "targetId": "holding-finance-manager-attachment-row",
        "tabId": "opinion"
      },
      {
        "text": "عدم نمایش برآورد مالی در تهاتر: در صورتی که نوع قرارداد تهاتر باشد برآورد مالی نباید به کاربر نمایش داده شود",
        "targetId": "contract-type-info-row",
        "tabId": "contractInfo"
      },
      {
        "text": "در صورتی که قرارداد از نوع تهاتر باشد و به تایید رسیده باشد فیلد ضمائم نهایی هلدینگ الزامی و بنر راهنما به کاربر نمایش داده خواهد شد",
        "targetId": "holding-finance-manager-attachment-row",
        "tabId": "holding-finance-manager-attachment-row"
      },
      {
        "text": "نکتهگزینه‌های فیلد 'تصمیم اتخاذ شده' صرفاً جنبه اطلاع‌رسانی در جدول اقدامات داشته و هیچ‌گونه عملکرد سیستمی یا تغییر در فرایند ندارند. به جز \"رد\" درخواست.",
        "targetId": "holding-finance-manager-decision-row",
        "tabId": "holding-finance-manager-decision-row"
      }
    ]
  },
  "legal_summary_notes_v8": {
    "customData": [
      {
        "text": "نمایش ضمائم نهایی تیم‌های مالی در تهاتر: بر اساس تیم مالی انتخاب شده در مرحله قبل (پارس/هلدینگ/هر دو)، ضمائم تایید شده توسط آن‌ها در این بخش نمایش داده می‌شود.",
        "targetId": "legal-summary-barter-attachments-display",
        "tabId": "opinion"
      },
      {
        "text": "چک‌لیست تایید نهایی: در صورت انتخاب تصمیم 'تایید'، نمایش چک‌لیست اطمینان از درج شماره فرایند در فوتر قرارداد الزامی و اجباری می‌باشد.",
        "targetId": "legal-summary-process-number-check",
        "tabId": "opinion"
      },
      {
        "text": "نمایش بنر راهنما در تهاتر: در قراردادهای تهاتری، بنر هشدار در بالای بخش آپلود فایل‌های نهایی (PDF/WORD) جهت اطلاع کاربر از کاربرد این اسناد در چاپ نهایی نمایش داده می‌شود.",
        "targetId": "legal-summary-barter-warning-banner",
        "tabId": "opinion"
      },
      {
        "text": "انتخاب تیم مالی در تهاتر: در صورت انتخاب نوع قرارداد تهاتر و تصمیم اتخاذ شده 'نیاز به اصلاح واحد مالی'، فیلد 'درخواست مربوط به کدام تیم مالی است' نمایش داده شده و الزامی می‌باشد.",
        "targetId": "legal-summary-financial-team-field",
        "tabId": "opinion"
      },
      {
        "text": "طراحی تب اعلام نظر بر اساس تصویر: شامل سه باکس رنگی بازخورد، بخش تصمیم و دکمه‌های آپلود PDF/Word نهایی.",
        "targetId": "legal-summary-opinion-content",
        "tabId": "opinion"
      },
      {
        "text": "قابلیت ویرایش تب اطلاعات قرارداد: امکان ویرایش فیلدها در این تب فراهم شده است.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      },
      {
        "text": "محدودیت تغییر نوع قرارداد: در صورتی که نوع قرارداد تهاتری باشد، فیلد غیرقابل ویرایش است. همچنین در صورت انتخاب گزینه‌های خدمات یا کالا، امکان تغییر به گزینه‌های تهاتر وجود ندارد.",
        "targetId": "legal-summary-contract-type-field",
        "tabId": "contractInfo"
      },
      {
        "text": "مدیریت پیوست‌ها: امکان افزودن پیوست جدید وجود دارد اما حذف پیوست‌های قبلی میسر نیست.",
        "targetId": "legal-summary-attachments-section",
        "tabId": "contractInfo"
      },
      {
        "text": "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      }
    ]
  },
  "legal_summary_notes_v5": {
    "customData": [
      {
        "text": "نمایش بنر راهنما در تهاتر: در قراردادهای تهاتری، بنر هشدار در بالای بخش آپلود فایل‌های نهایی (PDF/WORD) جهت اطلاع کاربر از کاربرد این اسناد در چاپ نهایی نمایش داده می‌شود.",
        "targetId": "legal-summary-barter-warning-banner",
        "tabId": "opinion"
      },
      {
        "text": "انتخاب تیم مالی در تهاتر: در صورت انتخاب نوع قرارداد تهاتر و تصمیم اتخاذ شده 'نیاز به اصلاح واحد مالی'، فیلد 'درخواست مربوط به کدام تیم مالی است' نمایش داده شده و الزامی می‌باشد.",
        "targetId": "legal-summary-financial-team-field",
        "tabId": "opinion"
      },
      {
        "text": "طراحی تب اعلام نظر بر اساس تصویر: شامل سه باکس رنگی بازخورد، بخش تصمیم و دکمه‌های آپلود PDF/Word نهایی.",
        "targetId": "legal-summary-opinion-content",
        "tabId": "opinion"
      },
      {
        "text": "قابلیت ویرایش تب اطلاعات قرارداد: امکان ویرایش فیلدها در این تب فراهم شده است.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      },
      {
        "text": "محدودیت تغییر نوع قرارداد: در صورتی که نوع قرارداد تهاتری باشد، فیلد غیرقابل ویرایش است. همچنین در صورت انتخاب گزینه‌های خدمات یا کالا، امکان تغییر به گزینه‌های تهاتر وجود ندارد.",
        "targetId": "legal-summary-contract-type-field",
        "tabId": "contractInfo"
      },
      {
        "text": "مدیریت پیوست‌ها: امکان افزودن پیوست جدید وجود دارد اما حذف پیوست‌های قبلی میسر نیست.",
        "targetId": "legal-summary-attachments-section",
        "tabId": "contractInfo"
      },
      {
        "text": "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      }
    ]
  },
  "legal_review_notes": {
    "customData": [
      {
        "text": "انتخاب و الزامی بودن تیم مالی در تهاتر: پس از انتخاب نوع قرارداد تهاتر، فیلد تعیین تیم مالی به صورت یک لیست کشویی با گزینه‌های (مالی پارس، مالی هلدینگ، مالی پارس و هلدینگ) تغییر یافته و پر کردن آن الزامی (required) است.",
        "targetId": "legal-arianmehr-row"
      },
      {
        "text": "عدم نمایش برآورد مالی در تهاتر: در صورتی که نوع قرارداد تهاتر باشد و کاربر تصمیم 'تایید و عدم ارسال قرارداد به واحد مالی' را انتخاب کند، فیلد مربوط به برآورد مالی نباید نمایش داده شود.",
        "targetId": "legal-decision-row"
      }
    ]
  },
  "finManager_review_notes": {
    "customData": [
      {
        "text": "در صورتی که نوع قرارداد تهاتری باشد، گزینه «نیاز به اصلاح حقوقی» در فیلد تصمیم اتخاذ شده نباید نمایش داده شود.",
        "targetId": "fin-manager-decision-row"
      }
    ]
  },
  "legal_summary_notes_v10": {
    "customData": [
      {
        "text": "نمایش ضمائم نهایی تیم‌های مالی در تهاتر: بر اساس تیم مالی انتخاب شده در مرحله قبل (پارس/هلدینگ/هر دو)، ضمائم تایید شده توسط آن‌ها در این بخش نمایش داده می‌شود.",
        "targetId": "legal-summary-barter-attachments-display",
        "tabId": "opinion"
      },
      {
        "text": "چک‌لیست تایید نهایی: در صورت انتخاب تصمیم 'تایید'، نمایش چک‌لیست اطمینان از درج شماره فرایند در فوتر قرارداد الزامی و اجباری می‌باشد (Required).",
        "targetId": "legal-summary-process-number-check",
        "tabId": "opinion"
      },
      {
        "text": "نمایش بنر راهنما در تهاتر: در قراردادهای تهاتری، بنر هشدار در بالای بخش آپلود فایل‌های نهایی (PDF/WORD) جهت اطلاع کاربر از کاربرد این اسناد در چاپ نهایی نمایش داده می‌شود.",
        "targetId": "legal-summary-barter-warning-banner",
        "tabId": "opinion"
      },
      {
        "text": "انتخاب تیم مالی در تهاتر: در صورت انتخاب نوع قرارداد تهاتر و تصمیم اتخاذ شده 'نیاز به اصلاح واحد مالی'، فیلد 'درخواست مربوط به کدام تیم مالی است' نمایش داده شده و الزامی می‌باشد.",
        "targetId": "legal-summary-financial-team-field",
        "tabId": "opinion"
      },
      {
        "text": "نمایش مشروط زمان‌بندی در تهاتر: در صورتی که نوع قرارداد تهاتر باشد، چهار فیلد مربوط به زمان‌بندی قرارداد (زمان شروع نامشخص، زمان پایان نامشخص، برنامه زمانبندی شروع و برنامه زمانبندی پایان) در تب اعلام نظر حقوقی نمایش داده می‌شوند و فیلد تاریخ الزامی می باشد.",
        "targetId": "opinion-start-date-row",
        "tabId": "opinion"
      },
      {
        "text": "طراحی تب اعلام نظر بر اساس تصویر: شامل سه باکس رنگی بازخورد، بخش تصمیم و دکمه‌های آپلود PDF/Word نهایی.",
        "targetId": "legal-summary-opinion-content",
        "tabId": "opinion"
      },
      {
        "text": "قابلیت ویرایش تب اطلاعات قرارداد: امکان ویرایش فیلدها در این تب فراهم شده است.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      },
      {
        "text": "محدودیت تغییر نوع قرارداد: در صورتی که نوع قرارداد تهاتری باشد، فیلد غیرقابل ویرایش است. همچنین در صورت انتخاب گزینه‌های خدمات یا کالا، امکان تغییر به گزینه‌های تهاتر وجود ندارد.",
        "targetId": "legal-summary-contract-type-field",
        "tabId": "contractInfo"
      },
      {
        "text": "مدیریت پیوست‌ها: امکان افزودن پیوست جدید وجود دارد اما حذف پیوست‌های قبلی میسر نیست.",
        "targetId": "legal-summary-attachments-section",
        "tabId": "contractInfo"
      },
      {
        "text": "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      }
    ]
  },
  "senior_manager_review_notes_copy": {
    "customData": [
      {
        "text": "در تب اطلاعات قرارداد امکان ویرایش به کاربر داده شود",
        "targetId": "review-contract-info"
      },
      {
        "text": "فیلد پیوست های تب اطلاعات قرارداد باید به این صورت باشد که بتوان به آن پیوست اضافه نمود ولی نمی توان پیوستی از آن حذف کرد",
        "targetId": "review-contract-info"
      },
      {
        "text": "محدودیت نوع قرارداد: فیلد نوع قرارداد در این فرم منحصراً شامل گزینه‌های تهاتر (تهاتر با نمایندگی فروش و خدمات پس از فروش، تهاتر تامین کنندگان و پیمانکاران) می‌باشد و غیرقابل ویرایش است.",
        "targetId": "review-contract-type-container"
      },
      {
        "text": "هشدار رد درخواست: در صورتی که تصمیم 'رد' انتخاب شود، یک باکس هشدار قرمز رنگ نمایش داده شود که کاربر را از مختومه شدن فرایند مطلع می‌کند",
        "targetId": "review-decision"
      },
      {
        "text": "گزینه‌های فیلد 'تصمیم اتخاذ شده' صرفاً جنبه اطلاع‌رسانی در جدول اقدامات داشته و هیچ‌گونه عملکرد سیستمی یا تغییر در فرایند ندارند. به جز \"رد\" درخواست.",
        "targetId": "review-decision"
      }
    ]
  },
  "finance_review_notes": {
    "customData": [
      {
        "text": "تغییر گزینه‌های تصمیم در قراردادهای تهاتری: در قراردادهای تهاتری، گزینه‌های 'تصمیم اتخاذ شده' به (تایید، بررسی توسط ذینفع، رد) تغییر می‌یابد.",
        "targetId": "finance-decision-row",
        "tabId": "opinion"
      },
      {
        "text": "فیلد جستجوی ذینفع: در صورت انتخاب 'بررسی توسط ذینفع' در قراردادهای تهاتری، فیلد جستجوی نام نمایش داده می‌شود.",
        "targetId": "finance-decision-row",
        "tabId": "opinion"
      },
      {
        "text": "اخطار رد درخواست: در صورت انتخاب گزینه 'رد'، بنر هشدار جهت آگاهی‌بخشی در خصوص مختومه شدن فرآیند نمایش داده می‌شود.",
        "targetId": "finance-decision-row",
        "tabId": "opinion"
      },
      {
        "text": "تغییر نام ضمائم در قراردادهای تهاتری تایید شده: در صورت تایید قرارداد تهاتر، عنوان فیلد ضمائم به 'ضمائم نهایی آرین پارس' تغییر می‌کند.",
        "targetId": "finance-attachment-row",
        "tabId": "opinion"
      },
      {
        "text": "عدم نمایش برآورد مالی در تهاتر: در صورتی که نوع قرارداد تهاتر باشد برآورد مالی نباید به کاربر نمایش داده شود",
        "targetId": "contract-type-info-row",
        "tabId": "contractInfo"
      },
      {
        "text": "قابلیت ویرایش فیلدها در جدول اطلاعات طرف قرارداد: فیلدهای 'نوع تهاتر'، 'تا تاریخ'، 'مبلغ' و 'شماره قرارداد مرتبط' در این مرحله توسط کارشناس مالی قابل ویرایش می‌باشد.",
        "targetId": "finance-parties-table",
        "tabId": "contractInfo"
      }
    ]
  },
  "finance_review_notes_v2": {
    "customData": [
      {
        "text": "تغییر گزینه‌های تصمیم در قراردادهای تهاتری: در قراردادهای تهاتری، گزینه‌های 'تصمیم اتخاذ شده' به (تایید، بررسی توسط ذینفع، رد) تغییر می‌یابد.",
        "targetId": "finance-decision-row",
        "tabId": "opinion"
      },
      {
        "text": "فیلد جستجوی ذینفع: در صورت انتخاب 'بررسی توسط ذینفع' در قراردادهای تهاتری، فیلد جستجوی نام نمایش داده می‌شود.",
        "targetId": "finance-decision-row",
        "tabId": "opinion"
      },
      {
        "text": "اخطار رد درخواست: در صورت انتخاب گزینه 'رد'، بنر هشدار جهت آگاهی‌بخشی در خصوص مختومه شدن فرآیند نمایش داده می‌شود.",
        "targetId": "finance-decision-row",
        "tabId": "opinion"
      },
      {
        "text": "تغییر نام ضمائم در قراردادهای تهاتری تایید شده: در صورت تایید قرارداد تهاتر، عنوان فیلد ضمائم به 'ضمائم نهایی آرین پارس' تغییر کرده و الزامی (required) می‌گردد.",
        "targetId": "finance-attachment-row",
        "tabId": "opinion"
      },
      {
        "text": "نمایش بنر راهنما در ضمائم نهایی تهاتر: در صورتی که فیلد ضمائم نهایی آرین پارس نمایش داده شود، بنر آبی رنگ جهت راهنمایی کاربر برای بارگذاری نسخه نهایی قرارداد ظاهر می‌شود.",
        "targetId": "finance-barter-warning",
        "tabId": "opinion"
      },
      {
        "text": "عدم نمایش برآورد مالی در تهاتر: در صورتی که نوع قرارداد تهاتر باشد برآورد مالی نباید به کاربر نمایش داده شود",
        "targetId": "contract-type-info-row",
        "tabId": "contractInfo"
      },
      {
        "text": "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        "targetId": "contract-info-tab",
        "tabId": "contractInfo"
      }
    ]
  },
  "legal_summary_notes_v7": {
    "customData": [
      {
        "text": "چک‌لیست تایید نهایی: در صورت انتخاب تصمیم 'تایید'، نمایش چک‌لیست اطمینان از درج شماره فرایند در فوتر قرارداد الزامی و اجباری می‌باشد.",
        "targetId": "legal-summary-process-number-check",
        "tabId": "opinion"
      },
      {
        "text": "نمایش بنر راهنما در تهاتر: در قراردادهای تهاتری، بنر هشدار در بالای بخش آپلود فایل‌های نهایی (PDF/WORD) جهت اطلاع کاربر از کاربرد این اسناد در چاپ نهایی نمایش داده می‌شود.",
        "targetId": "legal-summary-barter-warning-banner",
        "tabId": "opinion"
      },
      {
        "text": "انتخاب تیم مالی در تهاتر: در صورت انتخاب نوع قرارداد تهاتر و تصمیم اتخاذ شده 'نیاز به اصلاح واحد مالی'، فیلد 'درخواست مربوط به کدام تیم مالی است' نمایش داده شده و الزامی می‌باشد.",
        "targetId": "legal-summary-financial-team-field",
        "tabId": "opinion"
      },
      {
        "text": "طراحی تب اعلام نظر بر اساس تصویر: شامل سه باکس رنگی بازخورد، بخش تصمیم و دکمه‌های آپلود PDF/Word نهایی.",
        "targetId": "legal-summary-opinion-content",
        "tabId": "opinion"
      },
      {
        "text": "قابلیت ویرایش تب اطلاعات قرارداد: امکان ویرایش فیلدها در این تب فراهم شده است.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      },
      {
        "text": "محدودیت تغییر نوع قرارداد: در صورتی که نوع قرارداد تهاتری باشد، فیلد غیرقابل ویرایش است. همچنین در صورت انتخاب گزینه‌های خدمات یا کالا، امکان تغییر به گزینه‌های تهاتر وجود ندارد.",
        "targetId": "legal-summary-contract-type-field",
        "tabId": "contractInfo"
      },
      {
        "text": "مدیریت پیوست‌ها: امکان افزودن پیوست جدید وجود دارد اما حذف پیوست‌های قبلی میسر نیست.",
        "targetId": "legal-summary-attachments-section",
        "tabId": "contractInfo"
      },
      {
        "text": "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      },
      {
        "text": "وقتی نوع قرارداد تهاتر است نیاز به ایجاد روکش در فرایند نمی باشد.",
        "targetId": "root",
        "tabId": "legal-summary-opinion-content"
      }
    ]
  },
  "legal_summary_notes_v4": {
    "customData": [
      {
        "text": "انتخاب تیم مالی در تهاتر: در صورت انتخاب نوع قرارداد تهاتر و تصمیم اتخاذ شده 'نیاز به اصلاح واحد مالی'، فیلد 'درخواست مربوط به کدام تیم مالی است' نمایش داده شده و الزامی می‌باشد.",
        "targetId": "legal-summary-financial-team-field",
        "tabId": "opinion"
      },
      {
        "text": "طراحی تب اعلام نظر بر اساس تصویر: شامل سه باکس رنگی بازخورد، بخش تصمیم و دکمه‌های آپلود PDF/Word نهایی.",
        "targetId": "legal-summary-opinion-content",
        "tabId": "opinion"
      },
      {
        "text": "قابلیت ویرایش تب اطلاعات قرارداد: امکان ویرایش فیلدها در این تب فراهم شده است.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      },
      {
        "text": "قابلیت ویرایش نوع قرارداد: فیلد نوع قرارداد در این فرم برای تمامی انواع قراردادها قابل ویرایش است.",
        "targetId": "legal-summary-contract-type-field",
        "tabId": "contractInfo"
      },
      {
        "text": "مدیریت پیوست‌ها: امکان افزودن پیوست جدید وجود دارد اما حذف پیوست‌های قبلی میسر نیست.",
        "targetId": "legal-summary-attachments-section",
        "tabId": "contractInfo"
      },
      {
        "text": "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      }
    ]
  },
  "legal_summary_notes_v11": {
    "customData": [
      {
        "text": "نمایش ضمائم نهایی تیم‌های مالی در تهاتر: بر اساس تیم مالی انتخاب شده در مرحله قبل (پارس/هلدینگ/هر دو)، ضمائم تایید شده توسط آن‌ها در این بخش نمایش داده می‌شود.",
        "targetId": "legal-summary-barter-attachments-display",
        "tabId": "opinion"
      },
      {
        "text": "نمایش بنر راهنما در تهاتر: در قراردادهای تهاتری، بنر هشدار در بالای بخش آپلود فایل‌های نهایی (PDF/WORD) جهت اطلاع کاربر از کاربرد این اسناد در چاپ نهایی نمایش داده می‌شود.",
        "targetId": "legal-summary-barter-warning-banner",
        "tabId": "opinion"
      },
      {
        "text": "انتخاب تیم مالی در تهاتر: در صورت انتخاب نوع قرارداد تهاتر و تصمیم اتخاذ شده 'نیاز به اصلاح واحد مالی'، فیلد 'درخواست مربوط به کدام تیم مالی است' نمایش داده شده و الزامی می‌باشد.",
        "targetId": "legal-summary-financial-team-field",
        "tabId": "opinion"
      },
      {
        "text": "نمایش مشروط زمان‌بندی در تهاتر: در صورتی که نوع قرارداد تهاتر باشد، چهار فیلد مربوط به زمان‌بندی قرارداد (زمان شروع نامشخص، زمان پایان نامشخص، برنامه زمانبندی شروع و برنامه زمانبندی پایان) در تب اعلام نظر حقوقی نمایش داده می‌شوند.",
        "targetId": "opinion-start-date-row",
        "tabId": "opinion"
      },
      {
        "text": "قابلیت ویرایش تب اطلاعات قرارداد: امکان ویرایش فیلدها در این تب فراهم شده است.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      },
      {
        "text": "محدودیت تغییر نوع قرارداد: در صورتی که نوع قرارداد تهاتری باشد، فیلد غیرقابل ویرایش است. همچنین در صورت انتخاب گزینه‌های خدمات یا کالا، امکان تغییر به گزینه‌های تهاتر وجود ندارد.",
        "targetId": "legal-summary-contract-type-field",
        "tabId": "contractInfo"
      },
      {
        "text": "مدیریت پیوست‌ها: امکان افزودن پیوست جدید وجود دارد اما حذف پیوست‌های قبلی میسر نیست.",
        "targetId": "legal-summary-attachments-section",
        "tabId": "contractInfo"
      },
      {
        "text": "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      }
    ]
  },
  "legal_summary_notes_v9": {
    "customData": [
      {
        "text": "نمایش ضمائم نهایی تیم‌های مالی در تهاتر: بر اساس تیم مالی انتخاب شده در مرحله قبل (پارس/هلدینگ/هر دو)، ضمائم تایید شده توسط آن‌ها در این بخش نمایش داده می‌شود.",
        "targetId": "legal-summary-barter-attachments-display",
        "tabId": "opinion"
      },
      {
        "text": "چک‌لیست تایید نهایی: در صورت انتخاب تصمیم 'تایید'، نمایش چک‌لیست اطمینان از درج شماره فرایند در فوتر قرارداد الزامی و اجباری می‌باشد (Required).",
        "targetId": "legal-summary-process-number-check",
        "tabId": "opinion"
      },
      {
        "text": "نمایش بنر راهنما در تهاتر: در قراردادهای تهاتری، بنر هشدار در بالای بخش آپلود فایل‌های نهایی (PDF/WORD) جهت اطلاع کاربر از کاربرد این اسناد در چاپ نهایی نمایش داده می‌شود.",
        "targetId": "legal-summary-barter-warning-banner",
        "tabId": "opinion"
      },
      {
        "text": "انتخاب تیم مالی در تهاتر: در صورت انتخاب نوع قرارداد تهاتر و تصمیم اتخاذ شده 'نیاز به اصلاح واحد مالی'، فیلد 'درخواست مربوط به کدام تیم مالی است' نمایش داده شده و الزامی می‌باشد.",
        "targetId": "legal-summary-financial-team-field",
        "tabId": "opinion"
      },
      {
        "text": "طراحی تب اعلام نظر بر اساس تصویر: شامل سه باکس رنگی بازخورد، بخش تصمیم و دکمه‌های آپلود PDF/Word نهایی.",
        "targetId": "legal-summary-opinion-content",
        "tabId": "opinion"
      },
      {
        "text": "قابلیت ویرایش تب اطلاعات قرارداد: امکان ویرایش فیلدها در این تب فراهم شده است.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      },
      {
        "text": "محدودیت تغییر نوع قرارداد: در صورتی که نوع قرارداد تهاتری باشد، فیلد غیرقابل ویرایش است. همچنین در صورت انتخاب گزینه‌های خدمات یا کالا، امکان تغییر به گزینه‌های تهاتر وجود ندارد.",
        "targetId": "legal-summary-contract-type-field",
        "tabId": "contractInfo"
      },
      {
        "text": "مدیریت پیوست‌ها: امکان افزودن پیوست جدید وجود دارد اما حذف پیوست‌های قبلی میسر نیست.",
        "targetId": "legal-summary-opinion-content",
        "tabId": "contractInfo"
      },
      {
        "text": "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      },
      {
        "text": "بر روی تمام روکش های قرارداد این جمله قید شود\nکاربر گرامی، توجه داشته باشید کاربرد این فرم صرفاً داخل سازمان است و نباید برای طرفین قرارداد خارج از سازمان ارسال شود.",
        "targetId": "legal-summary-barter-attachments-display",
        "tabId": "legal-summary-opinion-content"
      }
    ]
  },
  "legal_summary_notes_v3": {
    "customData": [
      {
        "text": "انتخاب تیم مالی در تهاتر: در صورت انتخاب نوع قرارداد تهاتر، فیلد 'درخواست مربوط به کدام تیم مالی است' نمایش داده شده و الزامی می‌باشد.",
        "targetId": "legal-summary-financial-team-field",
        "tabId": "contractInfo"
      },
      {
        "text": "طراحی تب اعلام نظر بر اساس تصویر: شامل سه باکس رنگی بازخورد، بخش تصمیم و دکمه‌های آپلود PDF/Word نهایی.",
        "targetId": "legal-summary-opinion-content",
        "tabId": "opinion"
      },
      {
        "text": "قابلیت ویرایش تب اطلاعات قرارداد: امکان ویرایش فیلدها در این تب فراهم شده است.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      },
      {
        "text": "قابلیت ویرایش نوع قرارداد: فیلد نوع قرارداد در این فرم برای تمامی انواع قراردادها قابل ویرایش است.",
        "targetId": "legal-summary-contract-type-field",
        "tabId": "contractInfo"
      },
      {
        "text": "مدیریت پیوست‌ها: امکان افزودن پیوست جدید وجود دارد اما حذف پیوست‌های قبلی میسر نیست.",
        "targetId": "legal-summary-attachments-section",
        "tabId": "contractInfo"
      },
      {
        "text": "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      }
    ]
  },
  "legal_summary_notes_v2": {
    "customData": [
      {
        "text": "قابلیت ویرایش تب اطلاعات قرارداد: امکان ویرایش فیلدها در این تب فراهم شده است.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      },
      {
        "text": "مدیریت پیوست‌ها: امکان افزودن پیوست جدید وجود دارد اما حذف پیوست‌های قبلی میسر نیست.",
        "targetId": "legal-summary-attachments-section",
        "tabId": "contractInfo"
      }
    ]
  },
  "legal_summary_notes_v6": {
    "customData": [
      {
        "text": "چک‌لیست تایید نهایی: در صورت انتخاب تصمیم 'تایید'، نمایش چک‌لیست اطمینان از درج شماره فرایند در فوتر قرارداد الزامی است.",
        "targetId": "legal-summary-process-number-check",
        "tabId": "opinion"
      },
      {
        "text": "نمایش بنر راهنما در تهاتر: در قراردادهای تهاتری، بنر هشدار در بالای بخش آپلود فایل‌های نهایی (PDF/WORD) جهت اطلاع کاربر از کاربرد این اسناد در چاپ نهایی نمایش داده می‌شود.",
        "targetId": "legal-summary-barter-warning-banner",
        "tabId": "opinion"
      },
      {
        "text": "انتخاب تیم مالی در تهاتر: در صورت انتخاب نوع قرارداد تهاتر و تصمیم اتخاذ شده 'نیاز به اصلاح واحد مالی'، فیلد 'درخواست مربوط به کدام تیم مالی است' نمایش داده شده و الزامی می‌باشد.",
        "targetId": "legal-summary-financial-team-field",
        "tabId": "opinion"
      },
      {
        "text": "طراحی تب اعلام نظر بر اساس تصویر: شامل سه باکس رنگی بازخورد، بخش تصمیم و دکمه‌های آپلود PDF/Word نهایی.",
        "targetId": "legal-summary-opinion-content",
        "tabId": "opinion"
      },
      {
        "text": "قابلیت ویرایش تب اطلاعات قرارداد: امکان ویرایش فیلدها در این تب فراهم شده است.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      },
      {
        "text": "محدودیت تغییر نوع قرارداد: در صورتی که نوع قرارداد تهاتری باشد، فیلد غیرقابل ویرایش است. همچنین در صورت انتخاب گزینه‌های خدمات یا کالا، امکان تغییر به گزینه‌های تهاتر وجود ندارد.",
        "targetId": "legal-summary-contract-type-field",
        "tabId": "contractInfo"
      },
      {
        "text": "مدیریت پیوست‌ها: امکان افزودن پیوست جدید وجود دارد اما حذف پیوست‌های قبلی میسر نیست.",
        "targetId": "legal-summary-attachments-section",
        "tabId": "contractInfo"
      },
      {
        "text": "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        "targetId": "legal-summary-contract-info-grid",
        "tabId": "contractInfo"
      }
    ]
  },
  "senior_manager_review_notes": {
    "customData": [
      {
        "text": "در تب اطلاعات قرارداد امکان ویرایش به کاربر داده شود",
        "targetId": "review-contract-info"
      },
      {
        "text": "فیلد پیوست های تب اطلاعات قرارداد باید به این صورت باشد که بتوان به آن پیوست اضافه نمود ولی نمی توان پیوستی از آن حذف کرد",
        "targetId": "review-contract-info"
      },
      {
        "text": "محدودیت نوع قرارداد: فیلد نوع قرارداد در این فرم غیر قابل ویرایش است.",
        "targetId": "review-contract-type-container"
      },
      {
        "text": "هشدار رد درخواست: در صورتی که تصمیم 'رد' انتخاب شود، یک باکس هشدار قرمز رنگ نمایش داده شود که کاربر را از مختومه شدن فرایند مطلع می‌کند",
        "targetId": "review-decision"
      }
    ]
  },
  "supplier_review_notes": {
    "customData": [
      {
        "text": "در صورتی که قرارداد از نوع تهاتر بود بنر نمایش داده شده در تب اطلاعات قرارداد متفاوت خواهد بود.",
        "targetId": "root",
        "tabId": "supplier-contract-info-tab"
      }
    ]
  }
};

/**
 * Helper to get an override for a given default text
 */
export function getUIOverride(defaultText: string): UIOverride | undefined {
  return UI_OVERRIDES[defaultText];
}

/**
 * Helper to get custom notes override
 */
export function getNotesOverride(key: string, defaultValue: any[]): any[] {
  return UI_OVERRIDES[key]?.customData || defaultValue;
}
