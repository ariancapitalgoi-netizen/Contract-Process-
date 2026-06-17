import React, { useState, ReactNode } from 'react';
import { Paperclip, ChevronDown } from 'lucide-react';
import { FieldRow, FieldRowTop } from './FormComponents';
import { BizagiDevNotes, DevNoteItem, DraggableField, EditableText } from './EditableText';
import { Reorder } from "motion/react";

export interface LegalReviewFormProps {
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

export function LegalReviewForm({
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
}: LegalReviewFormProps) {
  const [activeTab, setActiveTab] = useState<'review' | 'contractInfo'>('review');
  const isBarterContract = typeof contractType === "string" && contractType.includes("تهاتر");

  // Legal-specific state loaded / saved in localStorage
  const [greenComment, setGreenComment] = useState(() => localStorage.getItem('legal_greenComment') || '');
  const [yellowComment, setYellowComment] = useState(() => localStorage.getItem('legal_yellowComment') || '');
  const [redComment, setRedComment] = useState(() => localStorage.getItem('legal_redComment') || '');
  
  const [decision, setDecision] = useState(() => localStorage.getItem('legal_decision') || '');
  const [isArianMehr, setIsArianMehr] = useState(() => localStorage.getItem('legal_isArianMehr') || 'خیر');
  const [financeTeam, setFinanceTeam] = useState(() => localStorage.getItem('legal_financeTeam') || '');
  const [attachment, setAttachment] = useState<boolean>(() => localStorage.getItem('legal_attachment') === 'true');
  const [generalComment, setGeneralComment] = useState(() => localStorage.getItem('legal_generalComment') || '');
  
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(true);
  const [isCommentsTableOpen, setIsCommentsTableOpen] = useState(true);

  const [order, setOrder] = useState(() => {
    const saved = localStorage.getItem('legalForm_order');
    return saved ? JSON.parse(saved) : ['decision', 'attachment', 'generalComment', 'arianMehrRow'];
  });

  const [labels, setLabels] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('legalForm_labels');
    return saved ? JSON.parse(saved) : {
      decision: 'تصمیم اتخاذ شده:',
      attachment: 'ضمائن:',
      generalComment: 'توضیحات کلی فرآیند:',
      arianMehrRow: 'درخواست مربوط به تیم مالی (آرین پارس مهر) است؟:',
      financeTeam: 'درخواست مربوط به کدام تیم مالی است؟:'
    };
  });

  // Persist legal states to localStorage
  React.useEffect(() => {
    localStorage.setItem('legal_greenComment', greenComment);
    localStorage.setItem('legal_yellowComment', yellowComment);
    localStorage.setItem('legal_redComment', redComment);
    localStorage.setItem('legal_decision', decision);
    localStorage.setItem('legal_isArianMehr', isArianMehr);
    localStorage.setItem('legal_financeTeam', financeTeam);
    localStorage.setItem('legal_attachment', attachment ? 'true' : 'false');
    localStorage.setItem('legal_generalComment', generalComment);
  }, [greenComment, yellowComment, redComment, decision, isArianMehr, financeTeam, attachment, generalComment]);

  const handleOrderChange = (newOrder: string[]) => {
    setOrder(newOrder);
    localStorage.setItem('legalForm_order', JSON.stringify(newOrder));
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
          localStorage.setItem('legalForm_labels', JSON.stringify(newLabels));
        }}
        className="w-full border border-blue-400 bg-blue-50/50 px-1 py-0.5 rounded text-[11px] font-bold text-gray-800 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
        onClick={e => e.stopPropagation()}
        placeholder={defaultLabel}
      />
    );
  };

  const [notes, setNotes] = useState<DevNoteItem[]>(() => {
    const saved = localStorage.getItem('legal_review_notes');
    if (saved) return JSON.parse(saved);
    return [
      {
        text: "محدودیت تغییر نوع قرارداد: در صورتی که نوع قرارداد تهاتری باشد، فیلد غیرقابل ویرایش است. همچنین در صورت انتخاب گزینه‌های خدمات یا کالا، امکان تغییر به گزینه‌های تهاتر وجود ندارد.",
        targetId: "review-contract-type-container",
        tabId: "contractInfo"
      },
      {
        text: "انتخاب و الزامی بودن تیم مالی در تهاتر: پس از انتخاب نوع قرارداد تهاتر، فیلد تعیین تیم مالی به صورت یک لیست کشویی با گزینه‌های (مالی پارس، مالی هلدینگ، مالی پارس و هلدینگ) تغییر یافته و پر کردن آن الزامی (required) است.",
        targetId: "legal-arianmehr-row"
      },
      {
        text: "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        targetId: "review-contract-info",
        tabId: "contractInfo"
      },
      {
        text: "عدم نمایش برآورد مالی در تهاتر: در صورتی که نوع قرارداد تهاتر باشد و کاربر تصمیم 'تایید و عدم ارسال قرارداد به واحد مالی' را انتخاب کند، فیلد مربوط به برآورد مالی نباید نمایش داده شود.",
        targetId: "legal-decision-row"
      }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('legal_review_notes', JSON.stringify(notes));
  }, [notes]);

  const handleDevNoteAction = (targetId: string, tabId?: string) => {
    if (tabId) {
      setActiveTab(tabId as any);
    } else {
      const isContractInfoTab = [
        "review-contract-info",
        "review-alerts-container",
        "review-is-addendum-container",
        "review-has-template-container",
        "review-contract-type-container"
      ].includes(targetId);

      if (isContractInfoTab) {
        setActiveTab('contractInfo');
      } else {
        setActiveTab('review');
      }
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

  const fieldComponents: Record<string, ReactNode> = {
    decision: (
      <FieldRow
        id="legal-decision-row"
        label={renderLabel('decision', 'تصمیم اتخاذ شده:')}
        required
        hasValue={!!decision}
        labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]"
      >
        <div className="flex flex-wrap items-center gap-4 py-1">
          {[
            { value: 'تایید و ارسال قرارداد به واحد مالی', label: 'تایید و ارسال قرارداد به واحد مالی' },
            { value: 'تایید و عدم ارسال قرارداد به واحد مالی', label: 'تایید و عدم ارسال قرارداد به واحد مالی' },
            { value: 'نیاز به اصلاح', label: 'نیاز به اصلاح' }
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="legal_decision"
                value={option.value}
                checked={decision === option.value}
                onChange={() => setDecision(option.value)}
                className="w-[14px] h-[14px] text-[#b90000] focus:ring-[#b90000] border-gray-300"
              />
              <span className="text-gray-700 text-[11px] md:text-[12px]">{option.label}</span>
            </label>
          ))}
        </div>
      </FieldRow>
    ),
    attachment: (
      <FieldRow
        id="legal-attachment-row"
        label={renderLabel('attachment', 'ضمائم:')}
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
    ),
    generalComment: (
      <FieldRowTop
        id="legal-generalcomment-row"
        label={renderLabel('generalComment', 'توضیحات:')}
        labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]"
      >
        <textarea
          className="w-full h-20 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 shadow-inner resize-none text-[12px] disabled:bg-gray-50 disabled:text-gray-400"
          value={generalComment}
          onChange={(e) => setGeneralComment(e.target.value)}
          placeholder="توضیحات تکمیلی یا نهایی بررسی حقوقی..."
        ></textarea>
      </FieldRowTop>
    ),
    arianMehrRow: isBarterContract ? (
      <FieldRow
        id="legal-arianmehr-row"
        label={renderLabel('financeTeam', 'درخواست مربوط به کدام تیم مالی است؟:')}
        required
        hasValue={!!financeTeam}
        labelWidthClass="grid-cols-[280px_1fr] md:grid-cols-[340px_1fr]"
      >
        <div className="text-gray-650 py-1 w-full">
          <select
            value={financeTeam}
            onChange={e => setFinanceTeam(e.target.value)}
            className="w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#b90000] text-xs shadow-sm"
          >
            <option value="">- لطفاً انتخاب کنید...</option>
            <option value="مالی پارس">مالی پارس</option>
            <option value="مالی هلدینگ">مالی هلدینگ</option>
            <option value="مالی پارس و هلدینگ">مالی پارس و هلدینگ</option>
          </select>
        </div>
      </FieldRow>
    ) : (
      <FieldRow
        id="legal-arianmehr-row"
        label={renderLabel('arianMehrRow', 'درخواست مربوط به تیم مالی (آرین پارس مهر) است؟:')}
        labelWidthClass="grid-cols-[280px_1fr] md:grid-cols-[340px_1fr]"
      >
        <div className="flex items-center gap-6 py-1">
          {['بله', 'خیر'].map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="legal_isArianMehr"
                value={option}
                checked={isArianMehr === option}
                onChange={() => setIsArianMehr(option)}
                className="w-[14px] h-[14px] text-[#b90000] focus:ring-[#b90000] border-gray-300"
              />
              <span className="text-gray-700 text-xs">{option}</span>
            </label>
          ))}
        </div>
      </FieldRow>
    )
  };

  return (
    <div className="flex flex-col gap-4 text-gray-700 w-full max-w-7xl mx-auto pt-4 pb-24">
      {/* Breadcrumb / Title Bar */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 py-3 flex items-center justify-between">
        <span className="text-gray-800 text-xs md:text-sm">
          <EditableText isTestMode={isTestMode} defaultText="درخواست انعقاد قرارداد" /> <span className="text-gray-400 mx-1">›</span> <EditableText isTestMode={isTestMode} defaultText="بررسی قرارداد در حقوقی" />
        </span>
        <span className="text-gray-400 font-mono text-[10px] hidden md:inline">FORM_LEGAL_REVIEW</span>
      </div>

      {/* Form Body Wrapper */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-300 bg-[#f9f9f9]">
          <button
            className={`px-6 py-2 border-l transition-all text-xs ${activeTab === 'review' ? 'border-b-2 border-b-[#b90000] bg-white font-bold text-gray-800' : 'border-b border-transparent text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('review')}
          >
            <EditableText isTestMode={isTestMode} defaultText="اعلام نظر" />
          </button>
          <button
            className={`px-6 py-2 border-l transition-all text-xs ${activeTab === 'contractInfo' ? 'border-b-2 border-b-[#b90000] bg-white font-bold text-gray-800' : 'border-b border-transparent text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('contractInfo')}
          >
            <EditableText isTestMode={isTestMode} defaultText="اطلاعات قرارداد" />
          </button>
        </div>

        {/* Tab 1: Review/Opinion Tab */}
        {activeTab === 'review' && (
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            
            {/* Right/Center Content section: The 3 big feedback boxes + outcomes */}
            <div className="flex-1 p-4 md:p-6 border-l border-gray-100 flex flex-col gap-5">
              
              {/* Feedback Textareas */}
              <div id="legal-feedback-boxes" className="flex flex-col gap-4">
                
                {/* 1. Green comment block */}
                <div className="border border-green-500 rounded-sm overflow-hidden shadow-sm">
                  <div className="bg-[#00a86b] text-white px-3 py-1.5 text-center text-xs md:text-[13px] font-bold">
                    <EditableText isTestMode={isTestMode} defaultText="در صورت وجود در قرارداد منجر به بهینه شدن قرارداد شده و بهبود ایجاد می‌کند ولی رعایت آن الزامی نمی‌باشد" />
                  </div>
                  <textarea
                    className="w-full h-24 p-2.5 text-slate-800 outline-none focus:bg-emerald-50/20 text-xs md:text-sm font-sans resize-y"
                    value={greenComment}
                    onChange={(e) => setGreenComment(e.target.value)}
                    placeholder="بازخوردهای سبز خود را وارد نمایید..."
                  ></textarea>
                </div>

                {/* 2. Yellow comment block */}
                <div className="border border-yellow-400 rounded-sm overflow-hidden shadow-sm">
                  <div className="bg-[#ffea00] text-[#4d3c00] px-3 py-1.5 text-center text-xs md:text-[13px] font-bold">
                    <EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی برای سازمان دارد و بهتر است رعایت شود" />
                  </div>
                  <textarea
                    className="w-full h-24 p-2.5 text-slate-800 outline-none focus:bg-amber-50/30 text-xs md:text-sm font-sans resize-y"
                    value={yellowComment}
                    onChange={(e) => setYellowComment(e.target.value)}
                    placeholder="بازخوردهای زرد ریسک متوسط را وارد نمایید..."
                  ></textarea>
                </div>

                {/* 3. Red comment block */}
                <div className="border border-red-500 rounded-sm overflow-hidden shadow-sm">
                  <div className="bg-red-600 text-white px-3 py-1.5 text-center text-xs md:text-[13px] font-bold">
                    <EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشد" />
                  </div>
                  <textarea
                    className="w-full h-24 p-2.5 text-slate-800 outline-none focus:bg-red-50/20 text-xs md:text-sm font-sans resize-y"
                    value={redComment}
                    onChange={(e) => setRedComment(e.target.value)}
                    placeholder="بازخوردهای قرمز با ریسک بالا و غیر قابل تغییر را وارد نمایید..."
                  ></textarea>
                </div>

              </div>

              {/* Legal decision section header */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-[#005f77] font-bold text-[13px] mb-4">
                  <EditableText isTestMode={isTestMode} defaultText="نتیجه بررسی اولیه حقوقی در خصوص قرارداد" />
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px] text-gray-700 bg-gray-50/80 p-3 rounded-sm border border-gray-200/60 mb-4 leading-relaxed">
                  <div>
                    <span className="font-semibold text-gray-500">
                      <EditableText isTestMode={isTestMode} defaultText="تصمیم‌گیرنده:" />
                    </span>{' '}
                    <span className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="واحد حقوقی هلدینگ" /></span>
                  </div>
                  <div className="md:text-right text-right">
                    <span className="font-semibold text-gray-500">
                      <EditableText isTestMode={isTestMode} defaultText="زمان ثبت تصمیم:" />
                    </span>{' '}
                    <span className="font-mono text-gray-800">۱۴۰۵/۰۳/۲۶</span>
                  </div>
                </div>

                {/* Reorderable Core Legal Review Field Row */}
                <Reorder.Group axis="y" values={order} onReorder={handleOrderChange} className="flex flex-col gap-1">
                  {order.map(id => (
                    <DraggableField key={id} id={id} isTestMode={isTestMode}>
                      {fieldComponents[id]}
                    </DraggableField>
                  ))}
                </Reorder.Group>

                {/* Collapsible Panel: Comments to Applicant */}
                <div className="mt-6 border border-gray-200 rounded-sm">
                  <button
                    onClick={() => setIsCommentsTableOpen(!isCommentsTableOpen)}
                    className="w-full bg-[#e2e7ec] hover:bg-[#d6dde4] px-4 py-2 flex items-center justify-between text-xs md:text-sm font-bold text-gray-800 outline-none transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <EditableText isTestMode={isTestMode} defaultText="کامنت‌های واحد حقوقی به متقاضی" />
                    </span>
                    <ChevronDown size={16} className={`transform transition-transform ${isCommentsTableOpen ? '' : '-rotate-90'}`} />
                  </button>
                  
                  {isCommentsTableOpen && (
                    <div className="p-4 text-center text-gray-500 text-xs bg-gray-50 font-medium">
                      <EditableText isTestMode={isTestMode} defaultText="رکوردی یافت نشد" />
                    </div>
                  )}
                </div>

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
                        <p><EditableText isTestMode={isTestMode} defaultText="در صورت وجود قالب استاندارد برای موضوع قرارداد، بر اساس آخرین فرمت موجود در سازمان قرارداد تدوین شود" /></p>
                      </div>
                      <div className="flex gap-1.5 items-start">
                        <span className="text-red-600 font-bold text-sm mt-0.5">*</span>
                        <p><EditableText isTestMode={isTestMode} defaultText="قبل از ارسال قرارداد به واحد مالی الزامات مربوط به قسمت مالی قرارداد از این واحد دریافت و در قرارداد قید شود" /></p>
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
                        <span className="text-[10px] md:text-[11px] text-gray-700 leading-normal"><EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشند" /></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 bg-[#ffea00] text-amber-955 text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-sm"><EditableText isTestMode={isTestMode} defaultText="زرد" /></span>
                        <span className="text-[10px] md:text-[11px] text-gray-700 leading-normal"><EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی برای سازمان دارد و بهتر است رعایت شود" /></span>
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

        {/* Tab 2: Contract Info Tab */}
        {activeTab === 'contractInfo' && (
          <div id="review-contract-info" className="p-6 pb-8 flex flex-col text-[12px] text-gray-800">
            {/* Warning Info Box */}
            <div id="review-alerts-container" className="transition-all duration-300 rounded-sm">
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              {/* row 1 */}
              <div id="review-is-addendum-container" className="grid grid-cols-[180px_1fr] items-center p-1 rounded transition-all duration-300">
                <div className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="درخواست، الحاقیه است؟:" /></div>
                <div className="text-gray-650">
                  <select 
                    value={isAddendum === true ? "بله" : (isAddendum === false ? "خیر" : "")} 
                    onChange={e => {
                      const val = e.target.value;
                      const isAdd = val === "" ? null : val === "بله";
                      setIsAddendum(isAdd);
                      if (isAdd === true) {
                        setHasTemplate(false);
                      }
                    }} 
                    className="w-full max-w-[150px] border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#b90000] text-xs"
                  >
                    <option value="">- انتخاب کنید -</option>
                    <option value="بله">بله</option>
                    <option value="خیر">خیر</option>
                  </select>
                </div>
              </div>
              <div></div>

              {/* row 2 */}
              {!isBarterContract && (
                <>
                  <div id="review-has-template-container" className="grid grid-cols-[180px_1fr] items-center p-1 rounded transition-all duration-300">
                    <div className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="آیا قرارداد قالب دار است؟:" /></div>
                    <div className="text-gray-65 tracking-normal">
                      <select 
                        value={hasTemplate === true ? "بله" : (hasTemplate === false ? "خیر" : "")} 
                        onChange={e => {
                          const val = e.target.value;
                          const hasTemp = val === "" ? null : val === "بله";
                          setHasTemplate(hasTemp);
                          if (hasTemp === true) {
                            setIsAddendum(false);
                          }
                        }} 
                        className="w-full max-w-[150px] border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#b90000] text-xs"
                      >
                        <option value="">- انتخاب کنید -</option>
                        <option value="بله">بله</option>
                        <option value="خیر">خیر</option>
                      </select>
                    </div>
                  </div>
                  <div></div>
                </>
              )}

              {/* row 3 */}
              <div id="review-contract-type-container" className="grid grid-cols-[180px_1fr] items-center p-1 rounded transition-all duration-305">
                <div className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="نوع قرارداد:" /></div>
                <div className="text-gray-600">
                  <select 
                    value={contractType} 
                    disabled={isBarterContract}
                    onChange={e => {
                      const val = e.target.value;
                      setContractType(val);
                      if (val.includes("تهاتر")) {
                        setHasTemplate(null);
                      }
                    }} 
                    className={`w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#b90000] text-xs shadow-sm ${isBarterContract ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white'}`}
                  >
                    <option value="">- انتخاب کنید -</option>
                    <option value="خدمات">خدمات</option>
                    <option value="کالا">کالا</option>
                    <option value="کالا و خدمات">کالا و خدمات</option>
                    <option value="تهاتر با نمایندگی فروش و خدمات پس از فروش" disabled={!isBarterContract && contractType !== ""}>تهاتر با نمایندگی فروش و خدمات پس از فروش</option>
                    <option value="تهاتر تامین کنندگان و پیمانکاران" disabled={!isBarterContract && contractType !== ""}>تهاتر تامین کنندگان و پیمانکاران</option>
                  </select>
                </div>
              </div>
              <div></div>

              {/* row 4 */}
              <div className="grid grid-cols-[180px_1fr] items-center">
                <div className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="قرارداد مربوط به کدام شرکت است؟:" /></div>
                <div className="text-gray-600">
                  <select 
                    value={company} 
                    onChange={e => setCompany(e.target.value)} 
                    className="w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#b90000] text-xs shadow-sm"
                  >
                    <option value="">- انتخاب کنید -</option>
                    <option value="آرین دیزل پایا">آرین دیزل پایا</option>
                    <option value="آرین موتور پویا">آرین موتور پویا</option>
                    <option value="آرین پارس موتور">آرین پارس موتور</option>
                    <option value="آرین ماشین راهبرد">آرین ماشین راهبرد</option>
                    <option value="آرین تایر پویا">آرین تایر پویا</option>
                    <option value="هلدینگ آرین سرمایه">هلدینگ آرین سرمایه</option>
                    <option value="واسپاری آرین پارس">واسپاری آرین پارس</option>
                    <option value="آرین پارس توربو">آرین پارس توربو</option>
                    <option value="آرین انرژی تابان ماندگار">آرین انرژی تابان ماندگار</option>
                  </select>
                </div>
              </div>
              <div></div>

              {/* row 5 */}
              <div className="grid grid-cols-[180px_1fr] items-center">
                <div className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="موضوع قرارداد:" /></div>
                <div className="text-gray-600">
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-[180px_1fr] items-center pl-8">
                <div className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="نماینده قرارداد:" /></div>
                <div className="text-gray-600">
                  <input type="text" value={representative} onChange={e => setRepresentative(e.target.value)} className="w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-xs" />
                </div>
              </div>
              
              {/* row 6 */}
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[180px_1fr] items-center">
                  <div className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="زمان شروع مشخص ندارد:" /></div>
                  <div className="text-gray-600 text-right"><input type="checkbox" checked={noStartDate} onChange={e => setNoStartDate(e.target.checked)} className="w-[14px] h-[14px] rounded-sm border-gray-300 text-teal-600 focus:ring-teal-600 mb-0.5 cursor-pointer" /></div>
                </div>
                {!noStartDate && (
                  <div className="grid grid-cols-[180px_1fr] items-center">
                    <div className="font-bold text-gray-500 text-[10px]"><EditableText isTestMode={isTestMode} defaultText="برنامه زمانبندی شروع:" /></div>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full max-w-[200px] border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-xs" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 pl-8">
                <div className="grid grid-cols-[180px_1fr] items-center">
                  <div className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="زمان پایان مشخص ندارد:" /></div>
                  <div className="text-gray-600 text-right"><input type="checkbox" checked={noEndDate} onChange={e => setNoEndDate(e.target.checked)} className="w-[14px] h-[14px] rounded-sm border-gray-300 text-teal-600 focus:ring-teal-600 mb-0.5 cursor-pointer" /></div>
                </div>
                {!noEndDate && (
                  <div className="grid grid-cols-[180px_1fr] items-center">
                    <div className="font-bold text-gray-500 text-[10px]"><EditableText isTestMode={isTestMode} defaultText="برنامه زمانبندی پایان:" /></div>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full max-w-[200px] border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-xs" />
                  </div>
                )}
              </div>

              {/* row 7 */}
              <div className="grid grid-cols-[180px_1fr] items-center">
                <div className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="گزارش توجیه فنی دارد؟:" /></div>
                <div className="text-gray-600 text-right"><input type="checkbox" checked={hasTechnicalReport} onChange={e => setHasTechnicalReport(e.target.checked)} className="w-[14px] h-[14px] rounded-sm border-gray-300 text-teal-600 focus:ring-teal-600 cursor-pointer" /></div>
              </div>
              <div className="grid grid-cols-[180px_1fr] items-center pl-8">
                <div className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="شرایط خصوصی دارد؟:" /></div>
                <div className="text-gray-600 text-right"><input type="checkbox" checked={hasPrivateConditions} onChange={e => setHasPrivateConditions(e.target.checked)} className="w-[14px] h-[14px] rounded-sm border-gray-300 text-teal-600 focus:ring-teal-600 cursor-pointer" /></div>
              </div>

              {/* row 8 */}
              <div className="grid grid-cols-[180px_1fr] items-center">
                <div className="font-bold text-gray-800 flex self-start mt-2"><EditableText isTestMode={isTestMode} defaultText="شرح درخواست:" /></div>
                <div className="text-gray-600">
                  <textarea value={requestDescription} onChange={e => setRequestDescription(e.target.value)} rows={2} className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-[180px_1fr] items-center pl-8">
                <div className="font-bold text-gray-800 flex self-start mt-2"><EditableText isTestMode={isTestMode} defaultText="توضیحات شرایط خصوصی:" /></div>
                <div className="text-gray-600">
                  <textarea value={privateConditionsDesc} onChange={e => setPrivateConditionsDesc(e.target.value)} rows={2} className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-xs" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bizagi Technical Notes for Legal Review */}
      <BizagiDevNotes 
        notes={notes} 
        isTestMode={isTestMode} 
        onAction={handleDevNoteAction} 
        onNotesChange={setNotes}
      />
    </div>
  );
}
