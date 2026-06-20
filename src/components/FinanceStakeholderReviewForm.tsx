import React, { useState, ReactNode } from 'react';
import { Paperclip, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { FieldRow, FieldRowTop } from './FormComponents';
import { BizagiDevNotes, DevNoteItem, DraggableField, EditableText } from './EditableText';
import { getNotesOverride } from '../lib/ui-registry';
import { Reorder } from "motion/react";

export interface FinanceStakeholderReviewFormProps {
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

export function FinanceStakeholderReviewForm({
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
}: FinanceStakeholderReviewFormProps) {
  const [activeTab, setActiveTab] = useState<'opinion' | 'legal' | 'contractInfo'>('opinion');
  const isBarterContract = typeof contractType === "string" && contractType.includes("تهاتر");

  // Load Legal values for reference in legal tab (read-only)
  const legalGreen = localStorage.getItem('legal_greenComment') || '';
  const legalYellow = localStorage.getItem('legal_yellowComment') || '';
  const legalRed = localStorage.getItem('legal_redComment') || '';
  const legalDecision = localStorage.getItem('legal_decision') || 'تایید و ارسال قرارداد به واحد مالی';
  const legalAttachment = localStorage.getItem('legal_attachment') === 'true';

  // State specific to FinanceStakeholderReviewForm
  const [greenComment, setGreenComment] = useState(() => localStorage.getItem('stakeholder_greenComment') || '');
  const [yellowComment, setYellowComment] = useState(() => localStorage.getItem('stakeholder_yellowComment') || '');
  const [redComment, setRedComment] = useState(() => localStorage.getItem('stakeholder_redComment') || '');
  const [decision, setDecision] = useState(() => localStorage.getItem('stakeholder_decision') || 'تایید');
  const [attachment, setAttachment] = useState<boolean>(() => localStorage.getItem('stakeholder_attachment') === 'true');
  const [generalComment, setGeneralComment] = useState(() => localStorage.getItem('stakeholder_generalComment') || '');
  const [estimation, setEstimation] = useState(() => localStorage.getItem('stakeholder_estimation') || '');

  const [isRequirementsOpen, setIsRequirementsOpen] = useState(true);

  const [order, setOrder] = useState(() => {
    const saved = localStorage.getItem('stakeholderForm_order');
    return saved ? JSON.parse(saved) : ['decision', 'estimation', 'attachment', 'generalComment'];
  });

  const [labels, setLabels] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('stakeholderForm_labels');
    return saved ? JSON.parse(saved) : {
      decision: 'تصمیم اتخاذ شده:',
      estimation: 'برآورد مالی (ریال):',
      attachment: 'ضمائم نهایی هلدینگ:',
      generalComment: 'توضیحات:'
    };
  });

  // Save states to local storage
  React.useEffect(() => {
    localStorage.setItem('stakeholder_greenComment', greenComment);
    localStorage.setItem('stakeholder_yellowComment', yellowComment);
    localStorage.setItem('stakeholder_redComment', redComment);
    localStorage.setItem('stakeholder_decision', decision);
    localStorage.setItem('stakeholder_attachment', attachment ? 'true' : 'false');
    localStorage.setItem('stakeholder_generalComment', generalComment);
    localStorage.setItem('stakeholder_estimation', estimation);
  }, [greenComment, yellowComment, redComment, decision, attachment, generalComment, estimation]);

  const handleOrderChange = (newOrder: string[]) => {
    setOrder(newOrder);
    localStorage.setItem('stakeholderForm_order', JSON.stringify(newOrder));
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
          localStorage.setItem('stakeholderForm_labels', JSON.stringify(newLabels));
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
        el.classList.add('ring-4', 'ring-[#b90000]', 'ring-offset-2', 'bg-red-50', 'scale-[1.01]');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-[#b90000]', 'ring-offset-2', 'bg-red-50', 'scale-[1.01]');
        }, 2000);
      }
    }, 100);
  };

  const [notes, setNotes] = useState<DevNoteItem[]>(() => {
    if (isTestMode) {
      const saved = localStorage.getItem('stakeholder_review_notes');
      if (saved) return JSON.parse(saved);
    }
    const defaultNotes = [
      {
        text: "تصمیم اتخاذ شده: گزینه‌های تصمیم اتخاذ شده در این فرم منحصراً شامل تایید، نیاز به اصلاح و رد می‌باشد.",
        targetId: "stakeholder-decision-row"
      },
      {
        text: "ضمائم نهایی هلدینگ: فیلد ضمائم تحت عنوان 'ضمائم نهایی هلدینگ' بدون الزام به آپلود تعریف شده است.",
        targetId: "stakeholder-attachment-row"
      },
      {
        text: "عدم الزامی بودن ضمائم در تایید: در صورت انتخاب گزینه تایید هم بارگذاری ضمائم غیر الزامی و اختیاری می‌باشد.",
        targetId: "stakeholder-attachment-row"
      },
      {
        text: "قابلیت ویرایش تب اطلاعات قرارداد: فیلدهای اطلاعات قرارداد بر اساس دسترسی ذینفع مالی تعریف و نمایش داده می‌شوند.",
        targetId: "stakeholder-contract-info",
        tabId: "contractInfo"
      }
    ];
    return getNotesOverride('stakeholder_review_notes', defaultNotes);
  });

  const handleNotesChange = (newNotes: DevNoteItem[]) => {
    setNotes(newNotes);
    localStorage.setItem('stakeholder_review_notes', JSON.stringify(newNotes));
  };

  const fieldComponents: Record<string, ReactNode> = {
    decision: (
      <FieldRow
        id="stakeholder-decision-row"
        label={renderLabel('decision', 'تصمیم اتخاذ شده:')}
        required
        hasValue={!!decision}
        labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]"
      >
        <div className="flex flex-wrap items-center gap-4 py-1">
          {[
            { value: 'تایید', label: 'تایید' },
            { value: 'نیاز به اصلاح', label: 'نیاز به اصلاح' },
            { value: 'رد', label: 'رد' }
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="stakeholder_decision"
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
      </FieldRow>
    ),
    estimation: (
      !isBarterContract ? (
        <FieldRow
          id="stakeholder-estimation-row"
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
        <FieldRow
          id="stakeholder-attachment-row"
          label={renderLabel('attachment', 'ضمائم نهایی هلدینگ')}
          required={false}
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
        id="stakeholder-generalcomment-row"
        label={renderLabel('generalComment', 'توضیحات:')}
        labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]"
      >
        <textarea
          className="w-full h-20 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 shadow-inner resize-none text-[12px] disabled:bg-gray-50 disabled:text-gray-400"
          value={generalComment}
          onChange={(e) => setGeneralComment(e.target.value)}
          placeholder="توضیحات تکمیلی یا نهایی بررسی ذینفع مالی پارس/هلدینگ..."
        ></textarea>
      </FieldRowTop>
    )
  };

  return (
    <div className="flex flex-col gap-4 text-gray-700 w-full max-w-7xl mx-auto pt-4 pb-24" dir="rtl">
      {/* Breadcrumb / Title Bar */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 py-3 flex items-center justify-between">
        <span className="text-gray-800 text-xs md:text-sm">
          <EditableText isTestMode={isTestMode} defaultText="درخواست انعقاد قرارداد" /> <span className="text-gray-400 mx-1">›</span> <EditableText isTestMode={isTestMode} defaultText="بررسی ذینفع مالی پارس/هلدینگ" />
        </span>
        <span className="text-gray-400 font-mono text-[10px] hidden md:inline">FORM_STAKEHOLDER_REVIEW</span>
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
            
            {/* Right/Center Content section: Feedback boxes + outcomes */}
            <div className="flex-1 p-4 md:p-6 border-l border-gray-100 flex flex-col gap-5">
              
              {/* Feedback Textareas */}
              <div id="stakeholder-feedback-boxes" className="flex flex-col gap-4">
                
                {/* 1. Green comment block */}
                <div id="stakeholder-green-box" className="border border-green-500 rounded-sm overflow-hidden shadow-sm">
                  <div className="bg-[#00a86b] text-white px-3 py-1.5 text-center text-xs md:text-[13px] font-bold">
                    <EditableText isTestMode={isTestMode} defaultText="در صورت وجود در قرارداد منجر به بهینه شدن قرارداد شده و بهبود ایجاد می‌کند ولی رعایت آن الزامی نمی‌باشد" />
                  </div>
                  <textarea
                    className="w-full h-24 p-2.5 text-slate-800 outline-none focus:bg-emerald-50/20 text-xs md:text-sm font-sans resize-y shrink-0"
                    value={greenComment}
                    onChange={(e) => setGreenComment(e.target.value)}
                    placeholder="بازخوردهای سبز خود را وارد نمایید..."
                  ></textarea>
                </div>

                {/* 2. Yellow comment block */}
                <div id="stakeholder-yellow-box" className="border border-yellow-400 rounded-sm overflow-hidden shadow-sm">
                  <div className="bg-[#ffea00] text-[#4d3c00] px-3 py-1.5 text-center text-xs md:text-[13px] font-bold">
                    <EditableText isTestMode={isTestMode} defaultText="ریسک مالی برای سازمان دارد و بهتر است رعایت شود" />
                  </div>
                  <textarea
                    className="w-full h-24 p-2.5 text-slate-800 outline-none focus:bg-amber-50/30 text-xs md:text-sm font-sans resize-y shrink-0"
                    value={yellowComment}
                    onChange={(e) => setYellowComment(e.target.value)}
                    placeholder="بازخوردهای زرد ریسک متوسط مالی را وارد نمایید..."
                  ></textarea>
                </div>

                {/* 3. Red comment block */}
                <div id="stakeholder-red-box" className="border border-red-500 rounded-sm overflow-hidden shadow-sm">
                  <div className="bg-red-600 text-white px-3 py-1.5 text-center text-xs md:text-[13px] font-bold">
                    <EditableText isTestMode={isTestMode} defaultText="ریسک مالی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشد" />
                  </div>
                  <textarea
                    className="w-full h-24 p-2.5 text-slate-800 outline-none focus:bg-red-50/20 text-xs md:text-sm font-sans resize-y shrink-0"
                    value={redComment}
                    onChange={(e) => setRedComment(e.target.value)}
                    placeholder="بازخوردهای قرمز مالی با ریسک بالا و غیر قابل تغییر را وارد نمایید..."
                  ></textarea>
                </div>

              </div>

              {/* Finance decision section header */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-[#005f77] font-bold text-[13px] mb-4">
                  <EditableText isTestMode={isTestMode} defaultText="نتیجه بررسی مالی ذینفع مالی پارس/هلدینگ در خصوص قرارداد" />
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

            {/* General recommendation summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="border border-gray-200 bg-gray-50/60 p-3 rounded-sm text-xs">
                <span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="تصمیم اولیه واحد حقوقی:" /></span>{' '}
                <span className="font-bold text-gray-800">{legalDecision}</span>
              </div>
              <div className="border border-gray-200 bg-gray-50/60 p-3 rounded-sm flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="ضمیمه حقوقی:" /></span>
                <div className="flex items-center gap-1">
                  <span className="text-gray-700 font-bold">{legalAttachment ? 'بارگذاری شده' : 'ندارد'}</span>
                  <Paperclip size={12} className={legalAttachment ? 'text-blue-500' : 'text-gray-400'} />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Contract Info */}
        {activeTab === 'contractInfo' && (
          <div id="stakeholder-contract-info" className="p-4 md:p-6 flex flex-col gap-5">
            {/* Displaying standard non-editable form structure representing 'اطلاعات قرارداد' */}
            <div id="stakeholder-contract-info-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-[12px]">
              
              <FieldRow id="stakeholder-info-contract-type" label={<EditableText isTestMode={isTestMode} defaultText="نوع قرارداد:" />} required>
                <div className="py-1 font-semibold text-gray-800">{contractType || 'تهاتر با نمایندگی فروش و خدمات پس از فروش'}</div>
              </FieldRow>

              <FieldRow id="stakeholder-info-isaddendum" label={<EditableText isTestMode={isTestMode} defaultText="آیا الحاقیه است؟" />} required>
                <div className="py-1 font-semibold text-gray-800">{isAddendum ? 'بله' : 'خیر'}</div>
              </FieldRow>

              <FieldRow id="stakeholder-info-hastemplate" label={<EditableText isTestMode={isTestMode} defaultText="قالب‌دار:" />} required>
                <div className="py-1 font-semibold text-gray-800">{hasTemplate ? 'بله' : 'خیر'}</div>
              </FieldRow>

              <FieldRow id="stakeholder-info-company" label={<EditableText isTestMode={isTestMode} defaultText="طرف قرارداد:" />} required>
                <input
                  type="text"
                  disabled
                  value={company}
                  className="w-full border border-gray-200 rounded-sm p-1.5 outline-none bg-gray-50 text-gray-500 font-sans text-[11px]"
                />
              </FieldRow>

              <FieldRow id="stakeholder-info-subject" label={<EditableText isTestMode={isTestMode} defaultText="موضوع قرارداد:" />} required>
                <input
                  type="text"
                  disabled
                  value={subject}
                  className="w-full border border-gray-200 rounded-sm p-1.5 outline-none bg-gray-50 text-gray-500 font-sans text-[11px]"
                />
              </FieldRow>

              <FieldRow id="stakeholder-info-representative" label={<EditableText isTestMode={isTestMode} defaultText="نماینده مجاز:" />} required>
                <input
                  type="text"
                  disabled
                  value={representative}
                  className="w-full border border-gray-200 rounded-sm p-1.5 outline-none bg-gray-50 text-gray-500 font-sans text-[11px]"
                />
              </FieldRow>

              <FieldRow id="stakeholder-info-start-date" label={<EditableText isTestMode={isTestMode} defaultText="تاریخ شروع قرارداد:" />} required={!noStartDate}>
                <div className="py-1 font-mono text-gray-800">{noStartDate ? 'بدون تاریخ شروع' : (startDate || '۱۴۰۵/۰۳/۰۱')}</div>
              </FieldRow>

              <FieldRow id="stakeholder-info-end-date" label={<EditableText isTestMode={isTestMode} defaultText="تاریخ خاتمه قرارداد:" />} required={!noEndDate}>
                <div className="py-1 font-mono text-gray-800">{noEndDate ? 'بدون تاریخ خاتمه' : (endDate || '۱۴۰۶/۰۳/۰۱')}</div>
              </FieldRow>

              <FieldRow id="stakeholder-info-technical-report" label={<EditableText isTestMode={isTestMode} defaultText="گزارش فنی:" />} required>
                <div className="py-1 font-semibold text-gray-800">{hasTechnicalReport ? 'بله' : 'خیر'}</div>
              </FieldRow>

              <FieldRow id="stakeholder-info-private-conditions" label={<EditableText isTestMode={isTestMode} defaultText="شرایط خصوصی دارد؟" />} required>
                <div className="py-1 font-semibold text-gray-800">{hasPrivateConditions ? 'بله' : 'خیر'}</div>
              </FieldRow>
            </div>

            {hasPrivateConditions && (
              <FieldRowTop id="stakeholder-info-private-desc" label={<EditableText isTestMode={isTestMode} defaultText="شرح شرایط خصوصی:" />}>
                <textarea
                  disabled
                  value={privateConditionsDesc}
                  className="w-full h-16 border border-gray-200 rounded-sm p-2 outline-none bg-gray-50 text-gray-500 font-sans text-[11px] resize-none"
                />
              </FieldRowTop>
            )}

            <FieldRowTop id="stakeholder-info-request-desc" label={<EditableText isTestMode={isTestMode} defaultText="توضیحات درخواست:" />}>
              <textarea
                disabled
                value={requestDescription}
                className="w-full h-16 border border-gray-200 rounded-sm p-2 outline-none bg-gray-50 text-gray-500 font-sans text-[11px] resize-none"
              />
            </FieldRowTop>

            {/* Attachments Checklist */}
            <div id="stakeholder-info-attachments" className="border border-gray-200 rounded-sm p-4 bg-gray-50/40">
              <h4 className="text-gray-800 font-bold text-xs mb-3 border-b border-gray-200 pb-2 flex items-center gap-1.5">
                <Paperclip size={13} className="text-gray-500" />
                <EditableText isTestMode={isTestMode} defaultText="ضمائم و مدارک پیوست شده" />
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-sm shadow-sm">
                  <span className="text-[11px] text-gray-700 font-semibold"><EditableText isTestMode={isTestMode} defaultText="پیوست درخواست قرارداد اولیه:" /></span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-700 text-[11px] font-bold">{initialAttachment ? 'بارگذاری شده' : 'فایل موجود نیست'}</span>
                    <Paperclip size={13} className={initialAttachment ? 'text-emerald-500' : 'text-gray-400'} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-sm shadow-sm">
                  <span className="text-[11px] text-gray-700 font-semibold"><EditableText isTestMode={isTestMode} defaultText=" مدارک شناسایی طرف قرارداد:" /></span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-700 text-[11px] font-bold">{identityAttachment ? 'بارگذاری شده' : 'فایل موجود نیست'}</span>
                    <Paperclip size={13} className={identityAttachment ? 'text-emerald-500' : 'text-gray-400'} />
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>

      {/* Developer Interactive Technical Notes Area - ONLY in test mode */}
      {isTestMode && (
        <div id="stakeholder-technical-notes" className="mt-6">
          <BizagiDevNotes notes={notes} onAction={handleDevNoteAction} isTestMode={isTestMode} onNotesChange={handleNotesChange} />
        </div>
      )}
    </div>
  );
}
