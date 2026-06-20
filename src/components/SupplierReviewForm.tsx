import React, { useState } from 'react';
import { EditableText, BizagiDevNotes, DevNoteItem, DraggableField } from './EditableText';
import { getNotesOverride } from '../lib/ui-registry';
import { Paperclip } from 'lucide-react';
import { FieldRow, FieldRowTop } from './FormComponents';
import { Reorder } from "motion/react";
import { JalaliDatePicker } from './JalaliDatePicker';

export interface SupplierReviewFormProps {
  isTestMode?: boolean;
  contractType: string;
  setContractType?: (v: string) => void;
  isAddendum?: boolean | null;
  setIsAddendum?: (v: boolean | null) => void;
  hasTemplate?: boolean | null;
  setHasTemplate?: (v: boolean | null) => void;
  company: string;
  setCompany?: (v: string) => void;
  subject: string;
  setSubject?: (v: string) => void;
  representative: string;
  setRepresentative?: (v: string) => void;
  noStartDate?: boolean;
  setNoStartDate?: (v: boolean) => void;
  noEndDate?: boolean;
  setNoEndDate?: (v: boolean) => void;
  startDate: string;
  setStartDate?: (v: string) => void;
  endDate: string;
  setEndDate?: (v: string) => void;
  hasTechnicalReport?: boolean;
  setHasTechnicalReport?: (v: boolean) => void;
  hasPrivateConditions?: boolean;
  setHasPrivateConditions?: (v: boolean) => void;
  requestDescription?: string;
  setRequestDescription?: (v: string) => void;
  privateConditionsDesc?: string;
  setPrivateConditionsDesc?: (v: string) => void;
  initialAttachment?: boolean;
  setInitialAttachment?: (v: boolean) => void;
  identityAttachment?: boolean;
  setIdentityAttachment?: (v: boolean) => void;
  parties?: any[];
  setParties?: (v: any[]) => void;
}

export function SupplierReviewForm({
  isTestMode = false,
  contractType,
  setContractType,
  isAddendum = null,
  setIsAddendum,
  hasTemplate = null,
  setHasTemplate,
  company,
  setCompany,
  subject,
  setSubject,
  representative,
  setRepresentative,
  noStartDate = false,
  setNoStartDate,
  noEndDate = false,
  setNoEndDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  hasTechnicalReport = false,
  setHasTechnicalReport,
  hasPrivateConditions = false,
  setHasPrivateConditions,
  requestDescription = '',
  setRequestDescription,
  privateConditionsDesc = '',
  setPrivateConditionsDesc,
  parties = []
}: SupplierReviewFormProps) {
  // Ordered exactly: اعلام نظر, حقوقی, مالی, اطلاعات قرارداد
  const [activeTab, setActiveTab] = useState<'opinion' | 'legal' | 'finance' | 'contractInfo'>('opinion');

  const isBarterContract = typeof contractType === "string" && contractType.includes("تهاتر");

  const [supplierDecision, setSupplierDecision] = useState<string>(() => localStorage.getItem('supplier_decision') || 'تایید');
  const [supplierDescription, setSupplierDescription] = useState(() => localStorage.getItem('supplier_description') || 'بررسی انجام شد. مورد تایید است.');
  const [supplierAttachment, setSupplierAttachment] = useState<boolean>(() => localStorage.getItem('supplier_attachment') === 'true');
  const [submissionDate, setSubmissionDate] = useState(() => localStorage.getItem('supplier_submissionDate') || '');
  const [responseDate, setResponseDate] = useState(() => localStorage.getItem('supplier_responseDate') || '');

  const [order, setOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('supplierForm_order');
    return saved ? JSON.parse(saved) : ['decision', 'attachment', 'submissionDate', 'responseDate', 'description'];
  });

  const [labels, setLabels] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('supplierForm_labels');
    return saved ? JSON.parse(saved) : {
      decision: 'تصمیم اتخاذ شده:',
      attachment: 'ضمائم:',
      submissionDate: 'زمان ارسال قرارداد برای تامین کننده:',
      responseDate: 'زمان دریافت پاسخ از تامین کننده:',
      description: 'توضیحات:'
    };
  });

  React.useEffect(() => {
    localStorage.setItem('supplier_decision', supplierDecision);
    localStorage.setItem('supplier_description', supplierDescription);
    localStorage.setItem('supplier_attachment', supplierAttachment ? 'true' : 'false');
    localStorage.setItem('supplier_submissionDate', submissionDate);
    localStorage.setItem('supplier_responseDate', responseDate);
  }, [supplierDecision, supplierDescription, supplierAttachment, submissionDate, responseDate]);

  const handleOrderChange = (newOrder: string[]) => {
    setOrder(newOrder);
    localStorage.setItem('supplierForm_order', JSON.stringify(newOrder));
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
          localStorage.setItem('supplierForm_labels', JSON.stringify(newLabels));
        }}
        className="w-full border border-blue-400 bg-blue-50/50 px-1 py-0.5 rounded text-[12px] font-bold text-gray-800 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
        onClick={e => e.stopPropagation()}
        placeholder={defaultLabel}
      />
    );
  };

  const finRiskGreen = localStorage.getItem('finSpec_riskGreen') || 'بررسی‌های لازم انجام شد.';
  const finRiskYellow = localStorage.getItem('finSpec_riskYellow') || 'ریسک نوسانات ارزی در نظر گرفته شود.';
  const finRiskRed = localStorage.getItem('finSpec_riskRed') || 'بدون ریسک حیاتی.';
  const finSpecDecision = localStorage.getItem('finSpec_decision') || 'تایید';
  const finSpecAttachment = localStorage.getItem('finSpec_attachment') === 'true';
  const finSpecDescription = localStorage.getItem('finSpec_description') || 'بررسی مالی مورد تایید است.';

  const legalGreen = localStorage.getItem('legal_greenComment') || 'بررسی حقوقی تایید شده و طبق ضوابط می‌باشد.';
  const legalYellow = localStorage.getItem('legal_yellowComment') || 'نیاز به شفاف‌سازی بند ۳ جریمه تاخیر.';
  const legalRed = localStorage.getItem('legal_redComment') || 'بدون ریسک با اهمیت بالا.';
  const legalDecision = localStorage.getItem('legal_decision') || 'تایید و ارسال قرارداد به واحد مالی';
  const legalAttachment = localStorage.getItem('legal_attachment') === 'true';

  const [notes, setNotes] = useState<DevNoteItem[]>(() => {
    if (isTestMode) {
      const saved = localStorage.getItem('supplier_review_notes');
      if (saved) return JSON.parse(saved);
    }
    const defaultNotes = [
      {
        text: "فرم 'بررسی قرارداد توسط تامین کننده/متقاضی' طبق سفارش با ۴ تب اصلی ایجاد شده است.",
        targetId: "supplier-review-container"
      },
      {
        text: "ترتیب تب‌ها منطبق بر نیازمندی مشتری: ۱. اعلام نظر، ۲. حقوقی، ۳. مالی، ۴. اطلاعات قرارداد می‌باشد.",
        targetId: "supplier-tabs"
      },
      {
        text: "هیچ‌گونه فیلد، ورودی یا کنترلر متغیری تحت هریک از تب‌ها وجود ندارد تا بستر تمیز و بدون شلوغی حفظ شود.",
        targetId: "supplier-tabs"
      },
      {
        text: "توضیحات تهاتر: چنانچه قرارداد تهاتر باشد، بنر هشدار نمایش داده شده و روکش (Overlay) مخصوص قرارداد برای صحه‌گذاری داخلی ایجاد می‌شود که نباید به طرف خارجی ارائه گردد.",
        targetId: "supplier-contract-info-tab"
      }
    ];
    return getNotesOverride('supplier_review_notes', defaultNotes);
  });

  React.useEffect(() => {
    localStorage.setItem('supplier_review_notes', JSON.stringify(notes));
  }, [notes]);

  const handleDevNoteAction = (targetId: string, tabId?: string) => {
    if (tabId) {
      setActiveTab(tabId as any);
    }
  };

  const isDescriptionRequired = supplierDecision === 'رد' || supplierDecision === 'نیاز به اصلاح';

  const fieldComponents: Record<string, React.ReactNode> = {
    decision: (
      <FieldRow id="supplier-decision" label={renderLabel('decision', 'تصمیم اتخاذ شده:')} required hasValue={!!supplierDecision} labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]">
        <div className="flex items-center gap-6">
          {['تایید', 'رد', 'نیاز به اصلاح'].map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="supplierDecision" 
                value={option}
                checked={supplierDecision === option}
                onChange={() => setSupplierDecision(option)} 
                className="w-[14px] h-[14px] text-[#b90000] focus:ring-[#b90000] border-gray-300" 
              />
              <span className="text-gray-700 text-sm">{option}</span>
            </label>
          ))}
        </div>
        {supplierDecision === 'رد' && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-3 mt-3 rounded-sm text-[11px] font-bold leading-relaxed w-full">
            کاربر گرامی، توجه داشته باشید در صورت رد این درخواست، فرایند مختومه شده و قابل بازیابی نخواهد بود؛ لذا خواهشمند است پیش از انتخاب دکمه ارسال، از تصمیم خود اطمینان حاصل نمایید.
          </div>
        )}
      </FieldRow>
    ),
    attachment: (
      <FieldRow label={renderLabel('attachment', 'ضمائم:')} labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]">
        <div 
          className="flex flex-col items-end w-full cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200 pb-1"
          onClick={() => setSupplierAttachment(true)}
        >
          <div className="flex items-center gap-1 group">
            <span className="text-gray-800">{supplierAttachment ? 'فایل بارگذاری شد' : 'فایل مربوطه را بارگذاری نمایید'}</span>
            <Paperclip size={14} className={`transition-transform group-hover:scale-110 ${supplierAttachment ? 'text-blue-500' : 'text-gray-500'}`} />
          </div>
        </div>
      </FieldRow>
    ),
    description: (
      <FieldRowTop id="supplier-description-row" label={renderLabel('description', 'توضیحات:')} required={isDescriptionRequired} hasValue={!!supplierDescription} labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]">
        <textarea 
          className="w-full h-24 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 shadow-inner resize-none text-sm"
          value={supplierDescription}
          onChange={(e) => setSupplierDescription(e.target.value)}
        ></textarea>
      </FieldRowTop>
    ),
    submissionDate: (
      <FieldRow id="supplier-submission-date" label={renderLabel('submissionDate', 'زمان ارسال قرارداد برای تامین کننده:')} hasValue={!!submissionDate} labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]">
        <div className="w-[180px]">
          <JalaliDatePicker value={submissionDate} onChange={setSubmissionDate} />
        </div>
      </FieldRow>
    ),
    responseDate: (
      <FieldRow id="supplier-response-date" label={renderLabel('responseDate', 'زمان دریافت پاسخ از تامین کننده:')} hasValue={!!responseDate} labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]">
        <div className="w-[180px]">
          <JalaliDatePicker value={responseDate} onChange={setResponseDate} />
        </div>
      </FieldRow>
    )
  };

  return (
    <div id="supplier-review-container" className="flex flex-col gap-4 text-gray-700 w-full max-w-4xl mx-auto xl:mr-0 pl-16 pt-4 pb-24">
      {/* Breadcrumb / Title Bar */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 py-3 flex items-center">
        <span className="text-gray-800 text-sm font-medium">
          <EditableText isTestMode={isTestMode} defaultText="درخواست انعقاد قرارداد" />{' '}
          <span className="text-gray-400 mx-1">›</span>{' '}
          <EditableText isTestMode={isTestMode} defaultText="بررسی قرارداد توسط تامین کننده/متقاضی" />
        </span>
      </div>

      {/* Form Body Card */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        {/* Tabs - Ordered exactly: اعلام نظر, حقوقی, مالی, اطلاعات قرارداد */}
        <div id="supplier-tabs" className="flex border-b border-gray-300 bg-[#f9f9f9] overflow-x-auto">
          <button
            className={`px-6 py-3 border-l transition-all text-xs whitespace-nowrap ${
              activeTab === 'opinion'
                ? 'border-b-2 border-b-[#b90000] bg-white font-bold text-gray-800'
                : 'border-b border-transparent text-gray-500 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('opinion')}
          >
            <EditableText isTestMode={isTestMode} defaultText="اعلام نظر" />
          </button>
          
          <button
            className={`px-6 py-3 border-l transition-all text-xs whitespace-nowrap ${
              activeTab === 'legal'
                ? 'border-b-2 border-b-[#b90000] bg-white font-bold text-gray-800'
                : 'border-b border-transparent text-gray-500 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('legal')}
          >
            <EditableText isTestMode={isTestMode} defaultText="حقوقی" />
          </button>
          
          <button
            className={`px-6 py-3 border-l transition-all text-xs whitespace-nowrap ${
              activeTab === 'finance'
                ? 'border-b-2 border-b-[#b90000] bg-white font-bold text-gray-800'
                : 'border-b border-transparent text-gray-500 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('finance')}
          >
            <EditableText isTestMode={isTestMode} defaultText="مالی" />
          </button>

          <button
            className={`px-6 py-3 border-l transition-all text-xs whitespace-nowrap ${
              activeTab === 'contractInfo'
                ? 'border-b-2 border-b-[#b90000] bg-white font-bold text-gray-800'
                : 'border-b border-transparent text-gray-500 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('contractInfo')}
          >
            <EditableText isTestMode={isTestMode} defaultText="اطلاعات قرارداد" />
          </button>
        </div>

        {/* Tab Contents - No fields (inputs/selects/textareas) inside as requested */}
        {activeTab === 'opinion' && (
          <div className="p-6 pb-8 flex flex-col gap-6 text-right" dir="rtl">
            <h2 className="text-[#005f77] font-bold text-[13px]">
              <EditableText isTestMode={isTestMode} defaultText="نتیجه بررسی تامین کننده/متقاضی در خصوص قرارداد" />
            </h2>
            
            <div className="grid grid-cols-2 text-[12px] text-gray-700">
              <div>
                <span className="font-semibold text-gray-500">
                  <EditableText isTestMode={isTestMode} defaultText="تصمیم گیرنده:" />
                </span>{' '}
                <EditableText isTestMode={isTestMode} defaultText="تامین کننده/متقاضی" />
              </div>
              <div className="text-left font-mono text-gray-500">
                <EditableText isTestMode={isTestMode} defaultText="۱۲:۳۰ ۱۴۰۵/۰۳/۲۷" />
              </div>
            </div>

            <Reorder.Group axis="y" values={order} onReorder={handleOrderChange} className="flex flex-col gap-2">
              {order.map(id => (
                <DraggableField key={id} id={id} isTestMode={isTestMode}>
                  {fieldComponents[id]}
                </DraggableField>
              ))}
            </Reorder.Group>

          </div>
        )}

        {activeTab === 'legal' && (
          <div className="p-6 flex flex-col gap-6 animate-fade-in text-right" dir="rtl">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col border border-emerald-400 rounded-sm overflow-hidden shadow-sm bg-gray-50/10">
                <div className="bg-emerald-600 text-white px-4 py-2 text-[12px] font-bold">
                  <EditableText isTestMode={isTestMode} defaultText="در صورت وجود در قرارداد منجر به بهینه شدن قرارداد شده و بهبود ایجاد می‌کند ولی رعایت آن الزامی نمی‌باشد" />
                </div>
                <div className="p-3 text-[12px] min-h-[60px] text-gray-800 whitespace-pre-wrap">{legalGreen || <span className="text-gray-400 italic"><EditableText isTestMode={isTestMode} defaultText="طی این مرحله نظری ثبت نشده است" /></span>}</div>
              </div>
              <div className="flex flex-col border border-yellow-300 rounded-sm overflow-hidden shadow-sm bg-gray-50/10">
                <div className="bg-[#ffea00] text-[#4d3c00] px-4 py-2 text-[12px] font-bold">
                  <EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی برای سازمان دارد و بهتر است رعایت شود" />
                </div>
                <div className="p-3 text-[12px] min-h-[60px] text-gray-800 whitespace-pre-wrap">{legalYellow || <span className="text-gray-400 italic"><EditableText isTestMode={isTestMode} defaultText="طی این مرحله نظری ثبت نشده است" /></span>}</div>
              </div>
              <div className="flex flex-col border border-red-400 rounded-sm overflow-hidden shadow-sm bg-gray-50/10">
                <div className="bg-red-600 text-white px-4 py-2 text-[12px] font-bold">
                  <EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشد" />
                </div>
                <div className="p-3 text-[12px] min-h-[60px] text-gray-800 whitespace-pre-wrap">{legalRed || <span className="text-gray-400 italic"><EditableText isTestMode={isTestMode} defaultText="طی این مرحله نظری ثبت نشده است" /></span>}</div>
              </div>
            </div>

            <div className="mt-4 pt-6 border-t border-gray-150 flex flex-col gap-4">
              <h3 className="text-[#005f77] font-bold text-[13px] border-r-4 border-r-[#005f77] pr-2.5">
                <EditableText isTestMode={isTestMode} defaultText="نتیجه بررسی اولیه حقوقی در خصوص قرارداد" />
              </h3>
              <div className="bg-slate-50 border border-slate-150 rounded-sm p-4 flex flex-col gap-3.5 max-w-2xl">
                <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                  <div className="font-bold text-gray-800 text-[12px]"><EditableText isTestMode={isTestMode} defaultText="واحد حقوقی هلدینگ" /></div>
                  <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="تصمیم‌گیرنده:" /></div>
                </div>
                <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                  <div className="font-mono text-gray-800 text-[12px]">۱۴۰۵/۰۳/۲۶ ۰۲:۴۷ ب.ظ</div>
                  <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="زمان ثبت تصمیم:" /></div>
                </div>
                <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                  <div className="font-bold text-[#b90000] text-[12px]">{legalDecision}</div>
                  <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="تصمیم اتخاذ شده:" /></div>
                </div>
                <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[11px] text-gray-500">{legalAttachment ? 'فایل بارگذاری شد' : 'ضمائم در نظر حقوقی بارگذاری نشده است'}</span>
                    <Paperclip size={16} className={legalAttachment ? 'text-blue-600' : 'text-gray-400'} />
                  </div>
                  <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="ضمائم:" /></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="p-6 flex flex-col gap-6 animate-fade-in text-right" dir="rtl">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col border border-[#00a86b] rounded-sm overflow-hidden shadow-sm bg-gray-50/20">
                <div className="bg-[#00a86b] text-white px-4 py-2 text-[12px] font-bold">
                  <EditableText isTestMode={isTestMode} defaultText="در صورت وجود در قرارداد منجر به بهینه شدن قرارداد شده و بهبود ایجاد می‌کند ولی رعایت آن الزامی نمی‌باشد" />
                </div>
                <div className="p-3 text-[12px] min-h-[60px] text-gray-800 whitespace-pre-wrap">{finRiskGreen}</div>
              </div>
              <div className="flex flex-col border border-[#ffea00] rounded-sm overflow-hidden shadow-sm bg-gray-50/20">
                <div className="bg-[#ffea00] text-gray-900 px-4 py-2 text-[12px] font-bold">
                  <EditableText isTestMode={isTestMode} defaultText="ریسک مالی برای سازمان دارد و بهتر است رعایت شود" />
                </div>
                <div className="p-3 text-[12px] min-h-[60px] text-gray-800 whitespace-pre-wrap">{finRiskYellow}</div>
              </div>
              <div className="flex flex-col border border-red-600 rounded-sm overflow-hidden shadow-sm bg-gray-50/20">
                <div className="bg-red-600 text-white px-4 py-2 text-[12px] font-bold">
                  <EditableText isTestMode={isTestMode} defaultText="ریسک مالی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشد" />
                </div>
                <div className="p-3 text-[12px] min-h-[60px] text-gray-800 whitespace-pre-wrap">{finRiskRed}</div>
              </div>
            </div>

            <div className="mt-4 pt-6 border-t border-gray-150 flex flex-col gap-4">
              <h3 className="text-[#005f77] font-bold text-[13px] border-r-4 border-r-[#005f77] pr-2.5">
                <EditableText isTestMode={isTestMode} defaultText="نتیجه بررسی مالی در خصوص قرارداد" />
              </h3>
              <div className="bg-slate-50 border border-slate-150 rounded-sm p-4 flex flex-col gap-3.5 max-w-2xl">
                <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                  <div className="font-bold text-gray-800 text-[12px]">Mehrbod Adili</div>
                  <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="تصمیم‌گیرنده:" /></div>
                </div>
                <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                  <div className="font-mono text-gray-800 text-[12px]">۱۴۰۵/۰۳/۲۶ ۰۴:۴۸ ب.ظ</div>
                  <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="زمان ثبت تصمیم:" /></div>
                </div>
                <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                  <div className="font-bold text-[#b90000] text-[12px]">{finSpecDecision}</div>
                  <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="تصمیم اتخاذ شده:" /></div>
                </div>
                <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[11px] text-gray-500">{finSpecAttachment ? 'فایل بارگذاری شد' : 'ضمیمه ندارد'}</span>
                    <Paperclip size={16} className={finSpecAttachment ? 'text-blue-600' : 'text-gray-400'} />
                  </div>
                  <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="ضمائم:" /></div>
                </div>
                <div className="grid grid-cols-[1fr_140px] items-start gap-4">
                  <div className="text-[12px] text-gray-700 text-right leading-relaxed">{finSpecDescription}</div>
                  <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="توضیحات:" /></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contractInfo' && (
          <div id="supplier-contract-info-tab" className="p-4 md:p-6 flex flex-col gap-6 text-[12px] text-gray-800 animate-fade-in text-right" dir="rtl">
            
            {/* Download Banner Section */}
            {isBarterContract ? (
              <div className="bg-yellow-100 p-4 rounded text-yellow-900 border border-yellow-200 text-sm mb-4" dir="rtl">
                کاربر گرامی، توجه داشته باشید این قرارداد از نوع تهاتر است. در صورت تأیید، آن را برای چاپ به مرحله بعدی ارسال نمایید. همچنین توجه نمایید که نرم افزار در این مرحله روکشی بر روی اصل قرارداد ایجاد میکند. این روکش به منزله سندی است که نشان میدهد قرارداد مراحل تأیید خود را در فرایند انعقاد قرارداد در بیزاجی طی کرده است و باید برای صحه گذاری به امضاکنندگان داخلی سازمان ارائه شود؛ با این حال، این روکش نباید به خارج از سازمان ارائه گردد.
              </div>
            ) : (
              <>
                <div className="bg-red-100 p-4 rounded text-red-900 border border-red-200 text-sm mb-4" dir="rtl">
                  کاربر گرامی ، قرارداد پیوست شده در این مرحله جمع بندی شده است . لازم است نظر طرف پیمان و تایید مدیران واحد متقاضی مطابق فرایند دریافت گردد و پس از آن در مرحله نهایی سازی ، نسخه نهایی قرارداد به شما ارائه خواهد شد
                </div>

                <div className="mb-6" dir="rtl">
                  <div className="bg-[#001550] text-white p-3 font-semibold rounded-t text-sm text-center">
                    جهت دانلود قرارداد بر روی لینک زیر کلیک نمایید
                  </div>
                  <div className="bg-[#d0deeb] p-3 rounded-b text-center border-t border-white">
                    <a href="#" onClick={e => e.preventDefault()} className="text-blue-700 underline text-sm">My Google AI Studio App.pdf</a>
                  </div>
                </div>
              </>
            )}

            {/* Header read-only fields layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 bg-gray-50/40 p-4 rounded border border-gray-150">
              
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 font-bold text-gray-800">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="درخواست، الحاقیه است؟:" /></span>
                <select 
                  value={isAddendum === true ? "بله" : (isAddendum === false ? "خیر" : "")} 
                  disabled
                  className="w-full max-w-[150px] border border-gray-300 rounded px-2 py-1 bg-gray-50/70 text-gray-500 cursor-not-allowed focus:outline-none text-xs"
                >
                  <option value="">- انتخاب کنید -</option>
                  <option value="بله">بله</option>
                  <option value="خیر">خیر</option>
                </select>
              </div>

              {!isBarterContract && (
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="آیا قرارداد قالب دار است؟:" /></span>
                  <select 
                    value={hasTemplate === true ? "بله" : (hasTemplate === false ? "خیر" : "")} 
                    disabled
                    className="w-full max-w-[150px] border border-gray-300 rounded px-2 py-1 bg-gray-50/70 text-gray-500 cursor-not-allowed focus:outline-none text-xs"
                  >
                    <option value="">- انتخاب کنید -</option>
                    <option value="بله">بله</option>
                    <option value="خیر">خیر</option>
                  </select>
                </div>
              )}

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="نوع قرارداد:" /></span>
                <select 
                  value={contractType} 
                  disabled
                  className="w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 bg-gray-50/70 text-gray-500 cursor-not-allowed focus:outline-none text-xs"
                >
                  <option value="">- انتخاب کنید -</option>
                  <option value="خدمات">خدمات</option>
                  <option value="کالا">کالا</option>
                  <option value="کالا و خدمات">کالا و خدمات</option>
                  <option value="تهاتر با نمایندگی فروش و خدمات پس از فروش" disabled={!isBarterContract && contractType !== ""}>تهاتر با نمایندگی فروش و خدمات پس از فروش</option>
                  <option value="تهاتر تامین کنندگان و پیمانکاران" disabled={!isBarterContract && contractType !== ""}>تهاتر تامین کنندگان و پیمانکاران</option>
                </select>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="شرکت:" /></span>
                <select 
                  value={company}
                  disabled
                  className="w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 bg-gray-50/70 text-gray-500 cursor-not-allowed focus:outline-none text-xs"
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

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100 col-span-1 md:col-span-2">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="موضوع قرارداد:" /></span>
                <input 
                  type="text" 
                  value={subject} 
                  disabled
                  className="w-full max-w-[500px] border border-gray-300 rounded px-2 py-1 bg-gray-50/70 text-gray-500 cursor-not-allowed focus:outline-none text-xs"
                />
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="نماینده قرارداد:" /></span>
                <input 
                  type="text" 
                  value={representative} 
                  disabled
                  className="w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 bg-gray-50/70 text-gray-500 cursor-not-allowed focus:outline-none text-xs"
                />
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
                  <span className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="زمان پایان مشخص ندارد:" /></span>
                  <input type="checkbox" checked={noEndDate} disabled className="w-[14px] h-[14px] rounded-sm border-gray-300 text-[#b90000] cursor-not-allowed" />
                </div>
                {!noEndDate && (
                  <div className="flex justify-between items-center w-full mt-1">
                    <span className="font-bold text-gray-400 text-[10px]"><EditableText isTestMode={isTestMode} defaultText="برنامه زمانبندی پایان:" /></span>
                    <span className="font-bold text-gray-800">{endDate || 'ثبت نشده'}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="گزارش توجیه فنی دارد؟:" /></span>
                <input type="checkbox" checked={hasTechnicalReport} disabled className="w-[14px] h-[14px] rounded-sm border-gray-300 text-[#b90000] cursor-not-allowed" />
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="شرایط خصوصی دارد؟:" /></span>
                <input type="checkbox" checked={hasPrivateConditions} disabled className="w-[14px] h-[14px] rounded-sm border-gray-300 text-[#b90000] cursor-not-allowed" />
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
                      <th className="p-2 border-l border-gray-300 text-right"><EditableText isTestMode={isTestMode} defaultText="نوع طرف قرارداد" /></th>
                      <th className="p-2 border-l border-gray-300 text-right"><EditableText isTestMode={isTestMode} defaultText="نام و نام خانوادگی" /></th>
                      <th className="p-2 border-l border-gray-300 text-right font-bold"><EditableText isTestMode={isTestMode} defaultText="نام سازمان" /></th>
                      <th className="p-2 border-l border-gray-300 text-right"><EditableText isTestMode={isTestMode} defaultText="کد ملی" /></th>
                      <th className="p-2 border-l border-gray-300 text-right"><EditableText isTestMode={isTestMode} defaultText="کد اقتصادی" /></th>
                      <th className="p-2 border-l border-gray-300 text-right"><EditableText isTestMode={isTestMode} defaultText="شماره ثبت" /></th>
                      <th className="p-2 border-l border-gray-300 text-right"><EditableText isTestMode={isTestMode} defaultText="کد پستی" /></th>
                      <th className="p-2 border-l border-gray-300 text-right"><EditableText isTestMode={isTestMode} defaultText="شماره تلفن همراه" /></th>
                      <th className="p-2 border-l border-gray-300 text-right"><EditableText isTestMode={isTestMode} defaultText="شماره تماس ثابت" /></th>
                      <th className="p-2 border-l border-gray-300 text-right"><EditableText isTestMode={isTestMode} defaultText="آدرس" /></th>
                      <th className="p-2 text-center"><EditableText isTestMode={isTestMode} defaultText="نمایش صاحبان امضا" /></th>
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

      {/* Bizagi Technical Notes */}
      <BizagiDevNotes 
        notes={notes} 
        isTestMode={isTestMode} 
        onAction={handleDevNoteAction} 
        onNotesChange={setNotes}
      />
    </div>
  );
}
