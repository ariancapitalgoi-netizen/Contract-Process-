import React, { useState, ReactNode } from 'react';
import { Paperclip, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { FieldRow, FieldRowTop } from './FormComponents';
import { BizagiDevNotes, DevNoteItem, DraggableField, EditableText } from './EditableText';
import { Reorder } from "motion/react";

export interface HoldingFinancialManagerReviewFormProps {
  isTestMode?: boolean;
  contractType: string;
  setContractType: (v: string) => void;
  isAddendum: boolean | null;
  setIsAddendum: (v: boolean | null) => void;
  hasTemplate: boolean | null;
  setHasTemplate: (v: boolean | null) => void;
  company: string;
  setCompany: (v: string) => void;
  subject: string;
  setSubject: (v: string) => void;
  representative: string;
  setRepresentative: (v: string) => void;
  noStartDate: boolean;
  setNoStartDate: (v: boolean) => void;
  noEndDate: boolean;
  setNoEndDate: (v: boolean) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  hasTechnicalReport: boolean;
  setHasTechnicalReport: (v: boolean) => void;
  hasPrivateConditions: boolean;
  setHasPrivateConditions: (v: boolean) => void;
  requestDescription: string;
  setRequestDescription: (v: string) => void;
  privateConditionsDesc: string;
  setPrivateConditionsDesc: (v: string) => void;
  initialAttachment: boolean;
  setInitialAttachment: (v: boolean) => void;
  identityAttachment: boolean;
  setIdentityAttachment: (v: boolean) => void;
  parties: any[];
  setParties: (v: any[]) => void;
}

export function HoldingFinancialManagerReviewForm({
  isTestMode = false,
  contractType,
  setContractType,
  isAddendum,
  setIsAddendum,
  hasTemplate,
  setHasTemplate,
  company,
  setCompany,
  subject,
  setSubject,
  representative,
  setRepresentative,
  noStartDate,
  setNoStartDate,
  noEndDate,
  setNoEndDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  hasTechnicalReport,
  setHasTechnicalReport,
  hasPrivateConditions,
  setHasPrivateConditions,
  requestDescription,
  setRequestDescription,
  privateConditionsDesc,
  setPrivateConditionsDesc,
  initialAttachment,
  setInitialAttachment,
  identityAttachment,
  setIdentityAttachment,
  parties,
  setParties
}: HoldingFinancialManagerReviewFormProps) {
  const [activeTab, setActiveTab] = useState<'opinion' | 'legal' | 'contractInfo'>('opinion');
  const isBarterContract = typeof contractType === "string" && contractType.includes("تهاتر");

  // Load Legal values for reference in legal tab (read-only)
  const legalGreen = localStorage.getItem('legal_greenComment') || '';
  const legalYellow = localStorage.getItem('legal_yellowComment') || '';
  const legalRed = localStorage.getItem('legal_redComment') || '';
  const legalDecision = localStorage.getItem('legal_decision') || 'تایید و ارسال قرارداد به واحد مالی';
  const legalAttachment = localStorage.getItem('legal_attachment') === 'true';

  // Holding Finance Manager specific form states
  const [greenComment, setGreenComment] = useState(() => localStorage.getItem('holdingFinManager_greenComment') || '');
  const [yellowComment, setYellowComment] = useState(() => localStorage.getItem('holdingFinManager_yellowComment') || '');
  const [redComment, setRedComment] = useState(() => localStorage.getItem('holdingFinManager_redComment') || '');
  const [decision, setDecision] = useState(() => localStorage.getItem('holdingFinManager_decision') || '');
  const [attachment, setAttachment] = useState<boolean>(() => localStorage.getItem('holdingFinManager_attachment') === 'true');
  const [generalComment, setGeneralComment] = useState(() => localStorage.getItem('holdingFinManager_generalComment') || '');
  const [stakeholderName, setStakeholderName] = useState(() => localStorage.getItem('holdingFinManager_stakeholderName') || '');
  const [estimation, setEstimation] = useState(() => localStorage.getItem('holdingFinManager_estimation') || '');

  const [isRequirementsOpen, setIsRequirementsOpen] = useState(true);

  const [order, setOrder] = useState(() => {
    const saved = localStorage.getItem('holdingFinManagerForm_order');
    return saved ? JSON.parse(saved) : ['decision', 'estimation', 'attachment', 'generalComment'];
  });

  const [labels, setLabels] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('holdingFinManagerForm_labels');
    return saved ? JSON.parse(saved) : {
      decision: 'تصمیم اتخاذ شده:',
      estimation: 'برآورد مالی (ریال):',
      attachment: 'ضمائم:',
      generalComment: 'توضیحات:'
    };
  });

  // Save states to local storage
  React.useEffect(() => {
    localStorage.setItem('holdingFinManager_greenComment', greenComment);
    localStorage.setItem('holdingFinManager_yellowComment', yellowComment);
    localStorage.setItem('holdingFinManager_redComment', redComment);
    localStorage.setItem('holdingFinManager_decision', decision);
    localStorage.setItem('holdingFinManager_attachment', attachment ? 'true' : 'false');
    localStorage.setItem('holdingFinManager_generalComment', generalComment);
    localStorage.setItem('holdingFinManager_stakeholderName', stakeholderName);
    localStorage.setItem('holdingFinManager_estimation', estimation);
  }, [greenComment, yellowComment, redComment, decision, attachment, generalComment, stakeholderName, estimation]);

  const handleOrderChange = (newOrder: string[]) => {
    setOrder(newOrder);
    localStorage.setItem('holdingFinManagerForm_order', JSON.stringify(newOrder));
  };

  const renderLabel = (id: string, defaultLabel: string) => {
    if (!isTestMode) return labels[id] || defaultLabel;
    return (
      <input
        type="text"
        value={labels[id] || ''}
        onChange={(e) => {
          const newLabels = { ...labels, [id]: e.target.value };
          setLabels(newLabels);
          localStorage.setItem('holdingFinManagerForm_labels', JSON.stringify(newLabels));
        }}
        className="w-full border border-blue-400 bg-blue-50/50 px-1 py-0.5 rounded text-[11px] font-bold text-gray-800 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
        onClick={e => e.stopPropagation()}
        placeholder={defaultLabel}
      />
    );
  };

  const handleDevNoteAction = (targetId: string, tabId?: string) => {
    if (tabId) {
      setActiveTab(tabId as any);
    } else if (targetId.includes('contract-') || targetId.startsWith('contract-info-')) {
      setActiveTab('contractInfo');
    } else if (targetId.includes('legal-')) {
      setActiveTab('legal');
    } else {
      setActiveTab('opinion');
    }
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-[#b90000]', 'ring-offset-2', 'bg-amber-50', 'scale-[1.01]', 'transition-all', 'duration-300');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-[#b90000]', 'ring-offset-2', 'bg-amber-50', 'scale-[1.01]', 'transition-all', 'duration-300');
        }, 2500);
      }
    }, 150);
  };

  const [notes, setNotes] = useState<DevNoteItem[]>(() => {
    const saved = localStorage.getItem('holding_finance_review_notes');
    if (saved) return JSON.parse(saved);
    return [
      {
        text: "محدودیت تغییر نوع قرارداد: در صورتی که نوع قرارداد تهاتری باشد، فیلد غیرقابل ویرایش است. همچنین در صورت انتخاب گزینه‌های خدمات یا کالا، امکان تغییر به گزینه‌های تهاتر وجود ندارد.",
        targetId: "contract-type-info-row",
        tabId: "contractInfo"
       },
      {
        text: "تغییر گزینه‌های تصمیم در قراردادهای تهاتری: در قراردادهای تهاتری، گزینه‌های 'تصمیم اتخاذ شده' به (تایید، بررسی توسط ذینفع، رد) تغییر می‌یابد.",
        targetId: "holding-finance-manager-decision-row",
        tabId: "opinion"
      },
      {
        text: "فیلد جستجوی ذینفع: در صورت انتخاب 'بررسی توسط ذینفع' در قراردادهای تهاتری، فیلد جستجوی نام نمایش داده می‌شود.",
        targetId: "holding-finance-manager-decision-row",
        tabId: "opinion"
      },
      {
        text: "اخطار رد درخواست: در صورت انتخاب گزینه 'رد'، بنر هشدار جهت آگاهی‌بخشی در خصوص مختومه شدن فرآیند نمایش داده می‌شود.",
        targetId: "holding-finance-manager-decision-row",
        tabId: "opinion"
      },
      {
        text: "تغییر نام ضمائم در قراردادهای تهاتری تایید شده: در صورت تایید قرارداد تهاتر، عنوان فیلد ضمائم به 'ضمائم نهایی هلدینگ' تغییر کرده و الزامی (required) می‌گردد.",
        targetId: "holding-finance-manager-attachment-row",
        tabId: "opinion"
      },
      {
        text: "نمایش بنر راهنما در ضمائم نهایی تهاتر: در صورتی که فیلد ضمائم نهایی هلدینگ نمایش داده شود، بنر آبی رنگ جهت راهنمایی کاربر برای بارگذاری نسخه نهایی قرارداد ظاهر می‌شود.",
        targetId: "holding-finance-barter-warning",
        tabId: "opinion"
      },
      {
        text: "عدم نمایش برآورد مالی در تهاتر: در صورتی که نوع قرارداد تهاتر باشد برآورد مالی نباید به کاربر نمایش داده شود",
        targetId: "contract-type-info-row",
        tabId: "contractInfo"
      },
      {
        text: "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        targetId: "contract-info-tab",
        tabId: "contractInfo"
      }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('holding_finance_review_notes', JSON.stringify(notes));
  }, [notes]);

  const fieldComponents: Record<string, ReactNode> = {
    decision: (
      <FieldRow
        id="holding-finance-manager-decision-row"
        label={renderLabel('decision', 'تصمیم اتخاذ شده:')}
        required
        hasValue={!!decision}
        labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]"
      >
        <div className="flex flex-wrap items-center gap-4 py-1">
          {(isBarterContract
            ? [
                { value: 'تایید', label: 'تایید' },
                { value: 'بررسی توسط ذینفع', label: 'بررسی توسط ذینفع' },
                { value: 'رد', label: 'رد' }
              ]
            : [
                { value: 'تایید', label: 'تایید' },
                { value: 'نیاز به اصلاح', label: 'نیاز به اصلاح' }
              ]
          ).map((option) => (
            <label key={option.value} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="holding_finance_manager_decision"
                value={option.value}
                checked={decision === option.value}
                onChange={() => setDecision(option.value)}
                className="w-[14px] h-[14px] text-[#b90000] focus:ring-[#b90000] border-gray-300"
              />
              <span className="text-gray-700 text-[11px] md:text-[12px]">{option.label}</span>
            </label>
          ))}
        </div>
        {decision === 'رد' && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-3 mt-3 rounded-sm text-[11px] font-bold leading-relaxed">
            کاربر گرامی، توجه داشته باشید در صورت رد این درخواست، فرایند مختومه شده و قابل بازیابی نخواهد بود؛ لذا خواهشمند است پیش از انتخاب دکمه ارسال، از تصمیم خود اطمینان حاصل نمایید.
          </div>
        )}
        {isBarterContract && decision === 'بررسی توسط ذینفع' && (
          <div className="w-full mt-3 pt-3 border-t border-gray-200">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 shadow-inner text-[12px]"
              value={stakeholderName}
              onChange={(e) => setStakeholderName(e.target.value)}
              placeholder="جستجوی نام همکار..."
            />
          </div>
        )}
      </FieldRow>
    ),
    estimation: (
      !isBarterContract ? (
        <FieldRow
          id="holding-finance-manager-estimation-row"
          label={renderLabel('estimation', 'برآورد مالی (ریال):')}
          labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="w-full max-w-xs border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 shadow-inner text-left font-mono text-[12px]"
              dir="ltr"
              value={estimation}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setEstimation(val ? Number(val).toLocaleString() : '');
              }}
              placeholder="0"
            />
          </div>
        </FieldRow>
      ) : null
    ),
    attachment: (
      <>
        {isBarterContract && decision === 'تایید' && (
          <div id="holding-finance-barter-warning" className="mb-4 bg-blue-50 text-blue-800 border-r-4 border-blue-600 p-3 rounded-sm text-[11px] font-bold shadow-sm animate-fade-in flex items-center gap-2">
            <Info size={16} className="shrink-0" />
            <EditableText isTestMode={isTestMode} defaultText="کاربر گرامی، توجه داشته باشید لازم است قرارداد نهایی خود را در این بخش بارگذاری نمایید." />
          </div>
        )}
        <FieldRow
          id="holding-finance-manager-attachment-row"
          label={(isBarterContract && decision === 'تایید') ? 'ضمائم نهایی هلدینگ' : renderLabel('attachment', 'ضمائم:')}
          required={isBarterContract && decision === 'تایید'}
          hasValue={attachment}
          labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]"
        >
          <div
            className="flex flex-col items-end w-full cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200 py-1"
            onClick={() => setAttachment(!attachment)}
          >
            <div className="flex items-center gap-1 group">
              <span className="text-gray-800 text-[11px]">{attachment ? 'فایل بارگذاری شد' : 'فایل مربوطه را بارگذاری نمایید'}</span>
              <Paperclip size={14} className={`transition-transform group-hover:scale-110 ${attachment ? 'text-blue-500' : 'text-gray-500'}`} />
            </div>
          </div>
        </FieldRow>
      </>
    ),
    generalComment: (
      <FieldRowTop
        id="holding-finance-manager-generalcomment-row"
        label={renderLabel('generalComment', 'توضیحات:')}
        labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]"
      >
        <textarea
          className="w-full h-20 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 shadow-inner resize-none text-[12px] disabled:bg-gray-50 disabled:text-gray-400"
          value={generalComment}
          onChange={(e) => setGeneralComment(e.target.value)}
          placeholder="توضیحات تکمیلی یا نهایی بررسی مالی مدیر هلدینگ..."
        ></textarea>
      </FieldRowTop>
    )
  };

  return (
    <div className="flex flex-col gap-4 text-gray-700 w-full max-w-7xl mx-auto pt-4 pb-24" dir="rtl">
      {/* Breadcrumb / Title Bar */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 py-3 flex items-center justify-between">
        <span className="text-gray-800 text-xs md:text-sm">
          <EditableText isTestMode={isTestMode} defaultText="درخواست انعقاد قرارداد" /> <span className="text-gray-400 mx-1">›</span> <EditableText isTestMode={isTestMode} defaultText="بررسی قرارداد توسط مدیر مالی (هلدینگ)" />
        </span>
        <span className="text-gray-400 font-mono text-[10px] hidden md:inline">FORM_HOLDING_FIN_MANAGER_REVIEW</span>
      </div>

      {/* Form Body Wrapper */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden animate-fade-in">
        {/* Tabs */}
        <div className="flex border-b border-gray-300 bg-[#f9f9f9]">
          <button
            className={`px-6 py-2 border-l transition-all text-xs ${activeTab === 'opinion' ? 'border-b-2 border-b-[#b90000] bg-white font-bold text-gray-800' : 'border-b border-transparent text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('opinion')}
          >
            <EditableText isTestMode={isTestMode} defaultText="اعلام نظر" />
          </button>
          <button
            className={`px-6 py-2 border-l transition-all text-xs ${activeTab === 'legal' ? 'border-b-2 border-b-[#b90000] bg-white font-bold text-gray-800' : 'border-b border-transparent text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('legal')}
          >
            <EditableText isTestMode={isTestMode} defaultText="حقوقی" />
          </button>
          <button
            className={`px-6 py-2 border-l transition-all text-xs ${activeTab === 'contractInfo' ? 'border-b-2 border-b-[#b90000] bg-white font-bold text-gray-800' : 'border-b border-transparent text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('contractInfo')}
          >
            <EditableText isTestMode={isTestMode} defaultText="اطلاعات قرارداد" />
          </button>
        </div>

        {/* Tab 1: Opinion Tab */}
        {activeTab === 'opinion' && (
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            
            {/* Right/Center Content section: The 3 big feedback boxes + outcomes */}
            <div className="flex-1 p-4 md:p-6 border-l border-gray-100 flex flex-col gap-5">
              
              {/* Feedback Textareas */}
              <div id="holding-finance-manager-feedback-boxes" className="flex flex-col gap-4">
                
                {/* 1. Green comment block */}
                <div id="holding-finance-manager-green-box" className="border border-green-500 rounded-sm overflow-hidden shadow-sm">
                  <div className="bg-[#00a86b] text-white px-3 py-1.5 text-center text-xs md:text-[13px] font-bold">
                    <EditableText isTestMode={isTestMode} defaultText="در صورت وجود در قرارداد منجر به بهینه شدن قرارداد شده و بهبود ایجاد می‌کند ولی رعایت آن الزامی نمی‌باشد" />
                  </div>
                  <textarea
                    className="w-full h-24 p-2.5 text-slate-800 outline-none focus:bg-emerald-50/20 text-xs md:text-sm font-sans resize-y animate-pulse-once"
                    value={greenComment}
                    onChange={(e) => setGreenComment(e.target.value)}
                    placeholder="بازخوردهای سبز خود را وارد نمایید..."
                  ></textarea>
                </div>

                {/* 2. Yellow comment block */}
                <div id="holding-finance-manager-yellow-box" className="border border-yellow-400 rounded-sm overflow-hidden shadow-sm">
                  <div className="bg-[#ffea00] text-[#4d3c00] px-3 py-1.5 text-center text-xs md:text-[13px] font-bold">
                    <EditableText isTestMode={isTestMode} defaultText="ریسک مالی برای سازمان دارد و بهتر است رعایت شود" />
                  </div>
                  <textarea
                    className="w-full h-24 p-2.5 text-slate-800 outline-none focus:bg-amber-50/30 text-xs md:text-sm font-sans resize-y"
                    value={yellowComment}
                    onChange={(e) => setYellowComment(e.target.value)}
                    placeholder="بازخوردهای زرد ریسک متوسط مالی را وارد نمایید..."
                  ></textarea>
                </div>

                {/* 3. Red comment block */}
                <div id="holding-finance-manager-red-box" className="border border-red-500 rounded-sm overflow-hidden shadow-sm">
                  <div className="bg-red-600 text-white px-3 py-1.5 text-center text-xs md:text-[13px] font-bold">
                    <EditableText isTestMode={isTestMode} defaultText="ریسک مالی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشد" />
                  </div>
                  <textarea
                    className="w-full h-24 p-2.5 text-slate-800 outline-none focus:bg-red-50/20 text-xs md:text-sm font-sans resize-y"
                    value={redComment}
                    onChange={(e) => setRedComment(e.target.value)}
                    placeholder="بازخوردهای قرمز مالی با ریسک بالا و غیر قابل تغییر را وارد نمایید..."
                  ></textarea>
                </div>

              </div>

              {/* Finance decision section header */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-[#005f77] font-bold text-[13px] mb-4">
                  <EditableText isTestMode={isTestMode} defaultText="نتیجه بررسی مالی مدیر هلدینگ در خصوص قرارداد" />
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px] text-gray-700 bg-gray-50/80 p-3 rounded-sm border border-gray-200/60 mb-4 leading-relaxed">
                  <div>
                    <span className="font-semibold text-gray-500">
                      <EditableText isTestMode={isTestMode} defaultText="تصمیم‌گیرنده:" />
                    </span>{' '}
                    <span className="font-bold text-gray-800">Mehrbod Adili</span>
                  </div>
                  <div className="md:text-right text-right">
                    <span className="font-semibold text-gray-500">
                      <EditableText isTestMode={isTestMode} defaultText="زمان ثبت تصمیم:" />
                    </span>{' '}
                    <span className="font-mono text-gray-800">۱۴۰۵/۰۳/۲۶ ۰۲:۴۶ ب.ظ</span>
                  </div>
                </div>

                {/* Reorderable Core Finance Review Field Row */}
                <Reorder.Group axis="y" values={order} onReorder={handleOrderChange} className="flex flex-col gap-1">
                  {order.map(id => (
                    <DraggableField key={id} id={id} isTestMode={isTestMode}>
                      {fieldComponents[id]}
                    </DraggableField>
                  ))}
                </Reorder.Group>

              </div>

            </div>

            {/* Left sidebar: Key Requirements (الزامات کلیدی) */}
            <div className="w-full lg:w-72 bg-[#fdfdfd] p-4 flex flex-col gap-4 border-t lg:border-t-0 border-gray-100 shrink-0">
              <div className="border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                
                {/* Expandable requirement panel header */}
                <button
                  onClick={() => setIsRequirementsOpen(!isRequirementsOpen)}
                  className="w-full bg-[#f2f4f6] hover:bg-[#e4ebf0] px-3 py-2 flex items-center justify-between text-xs md:text-sm font-bold text-gray-800 outline-none transition-colors border-b border-gray-200"
                >
                  <span className="flex items-center gap-1">
                    <EditableText isTestMode={isTestMode} defaultText="الزامات کلیدی" />
                  </span>
                  <ChevronDown size={14} className={`transform transition-transform ${isRequirementsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isRequirementsOpen && (
                  <div className="p-3 bg-white space-y-4">
                    
                    {/* Key Requirements List */}
                    <div className="space-y-3 text-[11px] md:text-xs leading-relaxed text-gray-800 pr-1">
                      <div className="flex gap-1.5 items-start">
                        <span className="text-red-600 font-bold text-sm mt-0.5">*</span>
                        <p><EditableText isTestMode={isTestMode} defaultText="الزامات مالی قرارداد مورد بررسی قرار گرفته تا منجر به جرائم مالیاتی و یا بیمه‌ای نشود" /></p>
                      </div>
                      <div className="flex gap-1.5 items-start">
                        <span className="text-red-600 font-bold text-sm mt-0.5">*</span>
                        <p><EditableText isTestMode={isTestMode} defaultText="برحسب قرارداد، نوع و مقدار تضمین مالی مدنظر قرار گرفته و اعلام شود" /></p>
                      </div>
                      <div className="flex gap-1.5 items-start">
                        <span className="text-red-600 font-bold text-sm mt-0.5">*</span>
                        <p><EditableText isTestMode={isTestMode} defaultText="بازخورد ارائه شده با سه رنگ قرمز، زرد و سبز مشخص شده که مفهوم هریک از رنگ‌ها عبارت است از" /></p>
                      </div>
                    </div>

                    {/* Color legends explained */}
                    <div className="border-t border-gray-100 pt-3 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-sm"><EditableText isTestMode={isTestMode} defaultText="قرمز" /></span>
                        <span className="text-[10px] md:text-[11px] text-gray-700 leading-normal"><EditableText isTestMode={isTestMode} defaultText="ریسک مالی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشد" /></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 bg-[#ffea00] text-amber-955 text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-sm"><EditableText isTestMode={isTestMode} defaultText="زرد" /></span>
                        <span className="text-[10px] md:text-[11px] text-gray-700 leading-normal"><EditableText isTestMode={isTestMode} defaultText="ریسک مالی برای سازمان دارد و بهتر است رعایت شود" /></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 bg-[#00a86b] text-white text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-sm"><EditableText isTestMode={isTestMode} defaultText="سبز" /></span>
                        <span className="text-[10px] md:text-[11px] text-gray-700 leading-normal"><EditableText isTestMode={isTestMode} defaultText="در صورت وجود در قرارداد منجر به بهینه شدن قرارداد شده و بهبود ایجاد می‌کند ولی رعایت آن الزامی نمی‌باشد" /></span>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Legal Tab (Read-Only reference of previous state) */}
        {activeTab === 'legal' && (
          <div className="p-4 md:p-6 flex flex-col gap-5">
            
            <div className="border-b border-gray-200 pb-3 mb-2">
              <h3 className="text-[#005f77] font-bold text-sm">
                <EditableText isTestMode={isTestMode} defaultText="نتیجه بررسی اولیه حقوقی در خصوص قرارداد" />
              </h3>
            </div>

            {/* Read-Only Colored Feedback Boxes from Legal */}
            <div className="flex flex-col gap-4">
              
              {/* Green */}
              <div className="border border-green-400 rounded-sm overflow-hidden bg-emerald-50/10">
                <div className="bg-emerald-600 text-white px-3 py-1 text-xs font-bold">
                  <EditableText isTestMode={isTestMode} defaultText="در صورت وجود در قرارداد منجر به بهینه شدن قرارداد شده و بهبود ایجاد می‌کند ولی رعایت آن الزامی نمی‌باشد" />
                </div>
                <div className="p-3 text-xs md:text-sm text-gray-800 min-h-[40px] whitespace-pre-wrap">
                  {legalGreen || <span className="text-gray-400 italic"><EditableText isTestMode={isTestMode} defaultText="طی این مرحله نظری ثبت نشده است" /></span>}
                </div>
              </div>

              {/* Yellow */}
              <div className="border border-yellow-300 rounded-sm overflow-hidden bg-amber-50/10">
                <div className="bg-[#ffea00] text-[#4d3c00] px-3 py-1 text-xs font-bold">
                  <EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی برای سازمان دارد و بهتر است رعایت شود" />
                </div>
                <div className="p-3 text-xs md:text-sm text-gray-800 min-h-[40px] whitespace-pre-wrap">
                  {legalYellow || <span className="text-gray-400 italic"><EditableText isTestMode={isTestMode} defaultText="طی این مرحله نظری ثبت نشده است" /></span>}
                </div>
              </div>

              {/* Red */}
              <div className="border border-red-400 rounded-sm overflow-hidden bg-red-50/10">
                <div className="bg-red-600 text-white px-3 py-1 text-xs font-bold">
                  <EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشد" />
                </div>
                <div className="p-3 text-xs md:text-sm text-gray-800 min-h-[40px] whitespace-pre-wrap">
                  {legalRed || <span className="text-gray-400 italic"><EditableText isTestMode={isTestMode} defaultText="طی این مرحله نظری ثبت نشده است" /></span>}
                </div>
              </div>

            </div>

            {/* Decision Details */}
            <div className="mt-4 bg-gray-50 border border-gray-200 p-4 rounded-sm space-y-3 text-xs md:text-[13px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 leading-relaxed">
                <div>
                  <span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="تصمیم‌گیرنده:" /></span>{' '}
                  <span className="font-bold text-gray-800">Mehrbod Adili</span>
                </div>
                <div className="md:text-right text-right">
                  <span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="زمان ثبت تصمیم:" /></span>{' '}
                  <span className="font-mono text-gray-800">۱۴۰۵/۰۳/۲۶ ۰۲:۴۷ ب.ظ</span>
                </div>
              </div>
              <div className="h-px bg-gray-200" />
              <div>
                <span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="تصمیم اتخاذ شده:" /></span>{' '}
                <span className="font-bold text-[#b90000]">{legalDecision}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="ضمائم:" /></span>{' '}
                <span className="font-medium text-gray-700">{legalAttachment ? 'فایل بارگذاری شد' : 'ضمائم در نظر حقوقی بارگذاری نشده است'}</span>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Contract Info Tab (Read-Only) */}
        {activeTab === 'contractInfo' && (
          <div id="contract-info-tab" className="p-4 md:p-6 flex flex-col gap-6 text-[12px] text-gray-800">
            
            {/* Header read-only fields layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 bg-gray-50/40 p-4 rounded border border-gray-150">
              
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="font-bold text-gray-800 text-[11px]"><EditableText isTestMode={isTestMode} defaultText="درخواست، الحاقیه است؟:" /></span>
                <span className="font-bold text-gray-800 text-[11px]">{isAddendum === true ? "بله" : (isAddendum === false ? "خیر" : "انتخاب نشده")}</span>
              </div>

              {!isBarterContract && (
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="font-bold text-gray-800 text-[11px]"><EditableText isTestMode={isTestMode} defaultText="آیا قرارداد قالب دار است؟:" /></span>
                  <span className="font-bold text-gray-800 text-[11px]">{hasTemplate === true ? "بله" : (hasTemplate === false ? "خیر" : "انتخاب نشده")}</span>
                </div>
              )}

              <div id="contract-type-info-row" className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="font-bold text-gray-800 text-[11px]"><EditableText isTestMode={isTestMode} defaultText="نوع قرارداد:" /></span>
                <span className="font-bold text-gray-800 text-[11px]">{contractType || "- انتخاب نشده -"}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="font-bold text-gray-800 text-[11px]"><EditableText isTestMode={isTestMode} defaultText="شرکت:" /></span>
                <span className="font-bold text-gray-800 text-[11px]">{company || "- انتخاب نشده -"}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 col-span-1 md:col-span-2">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="موضوع قرارداد:" /></span>
                <span className="font-bold text-gray-800 text-[11px]">{subject || '- ثبت نشده -'}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="نماینده قرارداد:" /></span>
                <span className="font-bold text-gray-800 text-[11px]">{representative || '- ثبت نشده -'}</span>
              </div>

              <div className="flex flex-col gap-1 border-b border-gray-100 py-1.5">
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="زمان شروع مشخص ندارد:" /></span>
                  <input type="checkbox" checked={noStartDate} disabled className="w-[14px] h-[14px] rounded-sm border-gray-300 text-teal-600 cursor-not-allowed" />
                </div>
                {!noStartDate && (
                  <div className="flex justify-between items-center w-full mt-1">
                    <span className="font-bold text-gray-400 text-[10px]"><EditableText isTestMode={isTestMode} defaultText="برنامه زمانبندی شروع:" /></span>
                    <span className="font-bold text-gray-800">{startDate || 'ثبت نشده'}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 border-b border-gray-100 py-1.5">
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="زمان پایان مشخص ندارد:" /></span>
                  <input type="checkbox" checked={noEndDate} disabled className="w-[14px] h-[14px] rounded-sm border-gray-300 text-teal-600 cursor-not-allowed" />
                </div>
                {!noEndDate && (
                  <div className="flex justify-between items-center w-full mt-1">
                    <span className="font-bold text-gray-400 text-[10px]"><EditableText isTestMode={isTestMode} defaultText="برنامه زمانبندی پایان:" /></span>
                    <span className="font-bold text-gray-800">{endDate || 'ثبت نشده'}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="گزارش توجیه فنی دارد؟:" /></span>
                <input type="checkbox" checked={hasTechnicalReport} disabled className="w-[14px] h-[14px] rounded-sm border-gray-300 text-teal-600 cursor-not-allowed" />
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="شرایط خصوصی دارد؟:" /></span>
                <input type="checkbox" checked={hasPrivateConditions} disabled className="w-[14px] h-[14px] rounded-sm border-gray-300 text-teal-600 cursor-not-allowed" />
              </div>

              <div className="flex flex-col gap-1 py-1.5 col-span-1 md:col-span-2">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="شرح درخواست:" /></span>
                <p className="bg-white p-2 border border-gray-150 rounded min-h-[40px] text-gray-700 text-xs whitespace-pre-wrap">{requestDescription || 'شرح ثبت نشده است'}</p>
              </div>

              {hasPrivateConditions && (
                <div className="flex flex-col gap-1 py-1.5 col-span-1 md:col-span-2">
                  <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="توضیحات شرایط خصوصی:" /></span>
                  <p className="bg-white p-2 border border-gray-150 rounded min-h-[40px] text-gray-700 text-xs whitespace-pre-wrap">{privateConditionsDesc || 'توضیحاتی ثبت نشده است'}</p>
                </div>
              )}

              <div className="flex justify-between items-center py-1.5 col-span-1 md:col-span-2">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="ضمائم قرارداد:" /></span>
                <span className="text-gray-700"><EditableText isTestMode={isTestMode} defaultText="فایل مربوطه را بارگذاری نمایید" /></span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 col-span-1 md:col-span-2">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="پیوست اولیه قرارداد:" /></span>
                <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">ثبت درخواست قرارداد.PNG</a>
              </div>

              <div className="flex justify-between items-center py-1.5 col-span-1 md:col-span-2">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="پیوست مدارک هویتی طرفين قرارداد:" /></span>
                <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 font-semibold hover:underline">ثبت درخواست قرارداد.PNG</a>
              </div>

            </div>

            {/* Primary Party Table Section */}
            <div className="mt-4">
              <div className="bg-[#e2e7ec] border border-gray-300 rounded-t-sm px-4 py-2 flex items-center justify-between font-bold text-gray-800 text-[12px]">
                <span><EditableText isTestMode={isTestMode} defaultText="اطلاعات اولیه طرف قرارداد" /></span>
              </div>

              <div className="overflow-x-auto border-x border-b border-gray-300 rounded-b-sm bg-white">
                <table className="w-full text-right border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-gray-150 text-gray-700 border-b border-gray-300 font-bold">
                      <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="نوع طرف قرارداد" /></th>
                      <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="نام و نام خانوادگی" /></th>
                      <th className="p-2 border-l border-gray-300 font-bold"><EditableText isTestMode={isTestMode} defaultText="نام سازمان" /></th>
                      <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="کد ملی" /></th>
                      <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="کد اقتصادی" /></th>
                      <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="شماره ثبت" /></th>
                      <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="کد پستی" /></th>
                      <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="شماره تلفن همراه" /></th>
                      <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="شماره تماس ثابت" /></th>
                      <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="آدرس" /></th>
                      <th className="p-2"><EditableText isTestMode={isTestMode} defaultText="نمایش صاحبان امضا" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {parties.map((party, idx) => (
                      <tr key={party.id || idx} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                        <td className="p-2 border-l border-gray-200">{party.type}</td>
                        <td className="p-2 border-l border-gray-200">{party.name || party.orgName || '-'}</td>
                        <td className="p-2 border-l border-gray-200 font-bold text-slate-900">{party.orgName || '-'}</td>
                        <td className="p-2 border-l border-gray-200 font-mono">{party.nationalId || party.orgNationalId || '-'}</td>
                        <td className="p-2 border-l border-gray-200 font-mono">{party.economicCode || party.orgEconomicCode || '-'}</td>
                        <td className="p-2 border-l border-gray-200 font-mono">{party.regNo || party.orgRegNo || '-'}</td>
                        <td className="p-2 border-l border-gray-200 font-mono">{party.postalCode || party.orgPostalCode || '-'}</td>
                        <td className="p-2 border-l border-gray-200 font-mono">{party.mobile || '-'}</td>
                        <td className="p-2 border-l border-gray-200 font-mono">{party.phone || party.orgPhone || '-'}</td>
                        <td className="p-2 border-l border-gray-200 leading-relaxed max-w-xs">{party.address || party.orgAddress || '-'}</td>
                        <td className="p-2 text-center">
                          <button className="bg-teal-700 hover:bg-teal-800 text-white rounded px-2.5 py-1 font-bold text-[10px] shadow-sm transition-colors cursor-pointer">
                            <EditableText isTestMode={isTestMode} defaultText="نمایش صاحبان امضا" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Bizagi Technical Notes for Holding Finance Manager Review */}
      <BizagiDevNotes 
        notes={notes} 
        isTestMode={isTestMode} 
        onAction={handleDevNoteAction} 
        onNotesChange={setNotes}
      />
    </div>
  );
}
