import React, { useState, ReactNode } from 'react';
import { Paperclip, ChevronDown, ChevronUp } from 'lucide-react';
import { FieldRow, FieldRowTop } from './FormComponents';
import { BizagiDevNotes, DevNoteItem, DraggableField, EditableText } from './EditableText';
import { Reorder } from "motion/react";

export interface FinancialManagerReviewFormProps {
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

export function FinancialManagerReviewForm({
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
}: FinancialManagerReviewFormProps) {
  const [activeTab, setActiveTab] = useState<'opinion' | 'finance' | 'legal' | 'contractInfo'>('opinion');
  
  // States
  const [decision, setDecision] = useState(() => localStorage.getItem('finManager_decision') || '');
  const [attachment, setAttachment] = useState<boolean>(() => localStorage.getItem('finManager_attachment') === 'true');
  const [description, setDescription] = useState(() => localStorage.getItem('finManager_description') || '');
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(true);
  const isBarterContract = typeof contractType === "string" && contractType.includes("تهاتر");

  // States for Finance Specialist Tab
  const [finRiskGreen, setFinRiskGreen] = useState(() => localStorage.getItem('finSpec_riskGreen') || '');
  const [finRiskYellow, setFinRiskYellow] = useState(() => localStorage.getItem('finSpec_riskYellow') || '');
  const [finRiskRed, setFinRiskRed] = useState(() => localStorage.getItem('finSpec_riskRed') || '');
  const [finSpecDecision, setFinSpecDecision] = useState(() => localStorage.getItem('finSpec_decision') || 'تایید');
  const [finSpecAttachment, setFinSpecAttachment] = useState<boolean>(() => localStorage.getItem('finSpec_attachment') === 'true');
  const [finSpecDescription, setFinSpecDescription] = useState(() => localStorage.getItem('finSpec_description') || '');

  // States for Legal Tab
  const [legalRiskGreen, setLegalRiskGreen] = useState(() => localStorage.getItem('legalSpec_riskGreen') || '');
  const [legalRiskYellow, setLegalRiskYellow] = useState(() => localStorage.getItem('legalSpec_riskYellow') || '');
  const [legalRiskRed, setLegalRiskRed] = useState(() => localStorage.getItem('legalSpec_riskRed') || '');
  const [legalSpecDecision, setLegalSpecDecision] = useState(() => localStorage.getItem('legalSpec_decision') || 'تایید و ارسال قرارداد به واحد مالی');
  const [legalSpecAttachment, setLegalSpecAttachment] = useState<boolean>(() => localStorage.getItem('legalSpec_attachment') === 'true');

  const [order, setOrder] = useState(() => {
    const saved = localStorage.getItem('finManagerForm_order');
    return saved ? JSON.parse(saved) : ['decision', 'attachment', 'description'];
  });

  const [labels, setLabels] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('finManagerForm_labels');
    return saved ? JSON.parse(saved) : {
      decision: 'تصمیم اتخاذ شده:',
      attachment: 'ضمائم:',
      description: 'توضیحات:'
    };
  });

  // Save states
  React.useEffect(() => {
    localStorage.setItem('finManager_decision', decision);
    localStorage.setItem('finManager_attachment', attachment ? 'true' : 'false');
    localStorage.setItem('finManager_description', description);
    
    localStorage.setItem('finSpec_riskGreen', finRiskGreen);
    localStorage.setItem('finSpec_riskYellow', finRiskYellow);
    localStorage.setItem('finSpec_riskRed', finRiskRed);
    localStorage.setItem('finSpec_decision', finSpecDecision);
    localStorage.setItem('finSpec_attachment', finSpecAttachment ? 'true' : 'false');
    localStorage.setItem('finSpec_description', finSpecDescription);

    localStorage.setItem('legalSpec_riskGreen', legalRiskGreen);
    localStorage.setItem('legalSpec_riskYellow', legalRiskYellow);
    localStorage.setItem('legalSpec_riskRed', legalRiskRed);
    localStorage.setItem('legalSpec_decision', legalSpecDecision);
    localStorage.setItem('legalSpec_attachment', legalSpecAttachment ? 'true' : 'false');
  }, [decision, attachment, description, finRiskGreen, finRiskYellow, finRiskRed, finSpecDecision, finSpecAttachment, finSpecDescription, legalRiskGreen, legalRiskYellow, legalRiskRed, legalSpecDecision, legalSpecAttachment]);

  const handleOrderChange = (newOrder: string[]) => {
    setOrder(newOrder);
    localStorage.setItem('finManagerForm_order', JSON.stringify(newOrder));
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
          localStorage.setItem('finManagerForm_labels', JSON.stringify(newLabels));
        }}
        className="w-full border border-blue-400 bg-blue-50/50 px-1 py-0.5 rounded text-[11px] font-bold text-gray-800 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
        onClick={e => e.stopPropagation()}
        placeholder={defaultLabel}
      />
    );
  };

  const fieldComponents: Record<string, ReactNode> = {
    decision: (
      <FieldRow
        id="fin-manager-decision-row"
        label={renderLabel('decision', 'تصمیم اتخاذ شده:')}
        required
        hasValue={!!decision}
        labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]"
      >
        <div className="flex flex-wrap items-center gap-4 py-1">
          {[
            { value: 'تایید', label: 'تایید' },
            { value: 'نیاز به اصلاح مالی', label: 'نیاز به اصلاح مالی' },
            { value: 'نیاز به اصلاح حقوقی', label: 'نیاز به اصلاح حقوقی' }
          ].filter(opt => !((contractType || '').includes('تهاتر') && opt.value === 'نیاز به اصلاح حقوقی')).map((option) => (
            <label key={option.value} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="fin_manager_decision"
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
        id="fin-manager-attachment-row"
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
    description: (
      <FieldRowTop
        id="fin-manager-description-row"
        label={renderLabel('description', 'توضیحات:')}
        labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]"
      >
        <textarea
          className="w-full h-32 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 shadow-inner resize-none text-[12px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیحات..."
        ></textarea>
      </FieldRowTop>
    )
  };

  const [notes, setNotes] = useState<DevNoteItem[]>(() => {
    const saved = localStorage.getItem('finManager_review_notes');
    if (saved) return JSON.parse(saved);
    return [
      {
        text: "محدودیت تغییر نوع قرارداد: در صورتی که نوع قرارداد تهاتری باشد، فیلد غیرقابل ویرایش است. همچنین در صورت انتخاب گزینه‌های خدمات یا کالا، امکان تغییر به گزینه‌های تهاتر وجود ندارد.",
        targetId: "contract-info-tab",
        tabId: "contractInfo"
      },
      {
        text: "در صورتی که نوع قرارداد تهاتری باشد، گزینه «نیاز به اصلاح حقوقی» در فیلد تصمیم اتخاذ شده نباید نمایش داده شود.",
        targetId: "fin-manager-decision-row"
      },
      {
        text: "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        targetId: "contract-info-tab",
        tabId: "contractInfo"
      }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('finManager_review_notes', JSON.stringify(notes));
  }, [notes]);

  const handleDevNoteAction = (targetId: string, tabId?: string) => {
    if (tabId) {
      setActiveTab(tabId as any);
    } else if (targetId.includes('fin-manager-')) {
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
    }, 150);
  };

  return (
    <div className="flex flex-col gap-4 text-gray-700 w-full max-w-7xl mx-auto pt-4 pb-24" dir="rtl">
      {/* Breadcrumb / Title Bar */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 py-3 flex items-center justify-between">
        <span className="text-gray-800 text-xs md:text-sm">
          <EditableText isTestMode={isTestMode} defaultText="درخواست انعقاد قرارداد" /> <span className="text-gray-400 mx-1">›</span> <EditableText isTestMode={isTestMode} defaultText="بررسی قرارداد توسط مدیر مالی" />
        </span>
        <span className="text-gray-400 font-mono text-[10px] hidden md:inline">FORM_FIN_MANAGER_REVIEW</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden animate-fade-in">
        <div className="flex border-b border-gray-300 bg-[#f9f9f9]">
          {['اعلام نظر', 'کارشناس مالی', 'حقوقی', 'اطلاعات قرارداد'].map((tab, index) => {
            const keys: Array<'opinion' | 'finance' | 'legal' | 'contractInfo'> = ['opinion', 'finance', 'legal', 'contractInfo'];
            const tabKey = keys[index];
            return (
              <button
                key={tab}
                className={`px-6 py-2 border-l transition-all text-xs ${activeTab === tabKey ? 'border-b-2 border-b-[#b90000] bg-white font-bold text-gray-800' : 'border-b border-transparent text-gray-500 hover:bg-gray-100'}`}
                onClick={() => setActiveTab(tabKey)}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Right Content Area */}
          <div className="flex-1 p-4 md:p-6 border-l border-gray-100 flex flex-col gap-5">
            {activeTab === 'opinion' ? (
              <>
                <h3 className="text-[#005f77] font-bold text-[13px] mb-2">
                  <EditableText isTestMode={isTestMode} defaultText="نتیجه بررسی مدیر مالی در خصوص قرارداد" />
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px] text-gray-700 bg-gray-50/80 p-3 rounded-sm border border-gray-200/60 mb-4 leading-relaxed">
                  <div>
                    <span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="تصمیم‌گیرنده:" /></span>{' '}
                    <span className="font-bold text-gray-800">Mehrbod Adili</span>
                  </div>
                  <div className="md:text-right text-right">
                    <span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="زمان ثبت تصمیم:" /></span>{' '}
                    <span className="font-mono text-gray-800">۱۴۰۵/۰۳/۲۶ ۰۴:۴۸ ب.ظ</span>
                  </div>
                </div>

                <Reorder.Group axis="y" values={order} onReorder={handleOrderChange} className="flex flex-col gap-1">
                  {order.map(id => (
                    <DraggableField key={id} id={id} isTestMode={isTestMode}>
                      {fieldComponents[id]}
                    </DraggableField>
                  ))}
                </Reorder.Group>
              </>
            ) : activeTab === 'finance' ? (
              <div className="flex flex-col gap-6 animate-fade-in text-right" dir="rtl">
                {/* Risk boxes with headers exactly like screenshot */}
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col border border-[#00a86b] rounded-sm overflow-hidden shadow-sm">
                    <div className="bg-[#00a86b] text-white px-4 py-2 text-[12px] font-bold">
                      <EditableText isTestMode={isTestMode} defaultText="در صورت وجود در قرارداد منجر به بهینه شدن قرارداد شده و بهبود ایجاد می‌کند ولی رعایت آن الزامی نمی‌باشد" />
                    </div>
                    <textarea 
                      className="w-full min-h-[100px] p-3 text-[12px] outline-none resize-none bg-white font-medium text-gray-800" 
                      value={finRiskGreen}
                      onChange={(e) => setFinRiskGreen(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col border border-[#ffea00] rounded-sm overflow-hidden shadow-sm">
                    <div className="bg-[#ffea00] text-gray-900 px-4 py-2 text-[12px] font-bold">
                      <EditableText isTestMode={isTestMode} defaultText="ریسک مالی برای سازمان دارد و بهتر است رعایت شود" />
                    </div>
                    <textarea 
                      className="w-full min-h-[100px] p-3 text-[12px] outline-none resize-none bg-white font-medium text-gray-800" 
                      value={finRiskYellow}
                      onChange={(e) => setFinRiskYellow(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col border border-red-600 rounded-sm overflow-hidden shadow-sm">
                    <div className="bg-red-600 text-white px-4 py-2 text-[12px] font-bold">
                      <EditableText isTestMode={isTestMode} defaultText="ریسک مالی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشد" />
                    </div>
                    <textarea 
                      className="w-full min-h-[100px] p-3 text-[12px] outline-none resize-none bg-white font-medium text-gray-800" 
                      value={finRiskRed}
                      onChange={(e) => setFinRiskRed(e.target.value)}
                    />
                  </div>
                </div>

                {/* Finance Spec Result Area */}
                <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-6">
                  <h3 className="text-[#005f77] font-bold text-[13px]"><EditableText isTestMode={isTestMode} defaultText="نتیجه بررسی مالی در خصوص قرارداد" /></h3>
                  
                  <div className="flex flex-col gap-3 max-w-2xl mr-auto ml-0">
                    <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                      <div className="font-bold text-gray-800 text-[12px]">Mehrbod Adili</div>
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="تصمیم‌گیرنده:" /></div>
                    </div>
                    
                    <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                      <div className="font-mono text-gray-800 text-[12px]">۱۴۰۵/۰۳/۲۶ ۰۴:۴۸ ب.ظ</div>
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="زمان ثبت تصمیم:" /></div>
                    </div>

                    <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${finSpecDecision === 'تایید' ? 'border-red-600' : 'border-gray-400 group-hover:border-gray-600'}`}>
                            {finSpecDecision === 'تایید' && <div className="w-2 h-2 rounded-full bg-red-600" />}
                          </div>
                          <input 
                            type="radio" 
                            className="hidden" 
                            name="fin_spec_decision" 
                            checked={finSpecDecision === 'تایید'} 
                            onChange={() => setFinSpecDecision('تایید')}
                          />
                          <span className="text-[12px] font-medium text-gray-700"><EditableText isTestMode={isTestMode} defaultText="تایید" /></span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${finSpecDecision === 'نیاز به اصلاح' ? 'border-red-600' : 'border-gray-400 group-hover:border-gray-600'}`}>
                            {finSpecDecision === 'نیاز به اصلاح' && <div className="w-2 h-2 rounded-full bg-red-600" />}
                          </div>
                          <input 
                            type="radio" 
                            className="hidden" 
                            name="fin_spec_decision" 
                            checked={finSpecDecision === 'نیاز به اصلاح'} 
                            onChange={() => setFinSpecDecision('نیاز به اصلاح')}
                          />
                          <span className="text-[12px] font-medium text-gray-700"><EditableText isTestMode={isTestMode} defaultText="نیاز به اصلاح" /></span>
                        </label>
                      </div>
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="تصمیم اتخاذ شده:" /></div>
                    </div>

                    <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                      <div 
                        className="flex items-center justify-end gap-2 cursor-pointer group"
                        onClick={() => setFinSpecAttachment(!finSpecAttachment)}
                      >
                        <span className="text-[11px] text-gray-500 group-hover:text-red-600 transition-colors"><EditableText isTestMode={isTestMode} defaultText="فایل مربوطه را بارگذاری نمایید" /></span>
                        <Paperclip size={16} className={finSpecAttachment ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                      </div>
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="ضمائم:" /></div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <div className="text-gray-500 font-semibold text-[12px] text-right"><EditableText isTestMode={isTestMode} defaultText="توضیحات:" /></div>
                    <textarea 
                      className="w-full min-h-[120px] border border-gray-300 rounded-sm p-3 outline-none focus:border-red-400 shadow-inner text-[12px] transition-all" 
                      value={finSpecDescription}
                      onChange={(e) => setFinSpecDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : activeTab === 'legal' ? (
              <div className="flex flex-col gap-6 animate-fade-in text-right" dir="rtl">
                {/* Risk boxes for Legal Tab */}
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col border border-[#00a86b] rounded-sm overflow-hidden shadow-sm">
                    <div className="bg-[#00a86b] text-white px-4 py-2 text-[12px] font-bold">
                      <EditableText isTestMode={isTestMode} defaultText="در صورت وجود در قرارداد منجر به بهینه شدن قرارداد شده و بهبود ایجاد می‌کند ولی رعایت آن الزامی نمی‌باشد" />
                    </div>
                    <textarea 
                      className="w-full min-h-[100px] p-3 text-[12px] outline-none resize-none bg-white font-medium text-gray-800" 
                      value={legalRiskGreen}
                      onChange={(e) => setLegalRiskGreen(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col border border-[#ffea00] rounded-sm overflow-hidden shadow-sm">
                    <div className="bg-[#ffea00] text-gray-900 px-4 py-2 text-[12px] font-bold">
                      <EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی برای سازمان دارد و بهتر است رعایت شود" />
                    </div>
                    <textarea 
                      className="w-full min-h-[100px] p-3 text-[12px] outline-none resize-none bg-white font-medium text-gray-800" 
                      value={legalRiskYellow}
                      onChange={(e) => setLegalRiskYellow(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col border border-red-600 rounded-sm overflow-hidden shadow-sm">
                    <div className="bg-red-600 text-white px-4 py-2 text-[12px] font-bold">
                      <EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشد" />
                    </div>
                    <textarea 
                      className="w-full min-h-[100px] p-3 text-[12px] outline-none resize-none bg-white font-medium text-gray-800" 
                      value={legalRiskRed}
                      onChange={(e) => setLegalRiskRed(e.target.value)}
                    />
                  </div>
                </div>

                {/* Legal Spec Result Area */}
                <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-6">
                  <h3 className="text-[#005f77] font-bold text-[13px]"><EditableText isTestMode={isTestMode} defaultText="نتیجه بررسی اولیه حقوقی در خصوص قرارداد" /></h3>
                  
                  <div className="flex flex-col gap-3 max-w-2xl mr-auto ml-0">
                    <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                      <div className="font-bold text-gray-800 text-[12px]">Mehrbod Adili</div>
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="تصمیم‌گیرنده:" /></div>
                    </div>
                    
                    <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                      <div className="font-mono text-gray-800 text-[12px]">۱۴۰۵/۰۳/۲۶ ۰۲:۴۷ ب.ظ</div>
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="زمان ثبت تصمیم:" /></div>
                    </div>

                    <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                      <div className="font-bold text-gray-800 text-[12px]"><EditableText isTestMode={isTestMode} defaultText="تایید و ارسال قرارداد به واحد مالی" /></div>
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="تصمیم اتخاذ شده:" /></div>
                    </div>

                    <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                      <div 
                        className="flex items-center justify-end gap-2 cursor-pointer group"
                        onClick={() => setLegalSpecAttachment(!legalSpecAttachment)}
                      >
                        <span className="text-[11px] text-gray-500 group-hover:text-red-600 transition-colors"><EditableText isTestMode={isTestMode} defaultText="فایل مربوطه را بارگذاری نمایید" /></span>
                        <Paperclip size={16} className={legalSpecAttachment ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                      </div>
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="ضمائم:" /></div>
                    </div>

                    <div className="grid grid-cols-[1fr_140px] items-start gap-4">
                      <div className="text-[12px] text-gray-800"><EditableText isTestMode={isTestMode} defaultText="تایید و ارسال قرارداد به واحد مالی" /></div>
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="توضیحات:" /></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'contractInfo' ? (
              <div id="contract-info-tab" className="p-4 md:p-6 flex flex-col gap-6 text-[12px] text-gray-800 animate-fade-in text-right" dir="rtl">
                
                {/* Header read-only fields layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 bg-gray-50/40 p-4 rounded border border-gray-150">
                  
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 font-bold text-gray-800">
                    <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="درخواست، الحاقیه است؟:" /></span>
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

                  {!isBarterContract && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                      <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="آیا قرارداد قالب دار است؟:" /></span>
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
                  )}

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="نوع قرارداد:" /></span>
                    <select 
                      value={contractType} 
                      disabled
                      className="w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs cursor-not-allowed text-gray-500"
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
                      onChange={e => setCompany(e.target.value)} 
                      className="w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
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
                      onChange={e => setSubject(e.target.value)} 
                      className="w-full max-w-[500px] border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
                    />
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                    <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="نماینده قرارداد:" /></span>
                    <input 
                      type="text" 
                      value={representative} 
                      onChange={e => setRepresentative(e.target.value)} 
                      className="w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs"
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
            ) : null}
          </div>

          {/* Left Sidebar (Key Requirements) */}
          <div className="w-full lg:w-72 bg-[#fdfdfd] p-4 flex flex-col gap-4 border-t lg:border-t-0 border-gray-100 shrink-0">
            <div className="border border-gray-200 rounded-sm overflow-hidden shadow-sm">
              <div className="w-full bg-[#f2f4f6] px-3 py-2 flex items-center justify-between text-xs md:text-sm font-bold text-gray-800 border-b border-gray-200">
                <span><EditableText isTestMode={isTestMode} defaultText="الزامات کلیدی" /></span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
              <div className="p-3 bg-white space-y-4">
                <div className="space-y-3 text-[11px] md:text-xs leading-relaxed text-gray-800">
                  <div className="flex gap-1.5 items-start">
                    <span className="text-red-500 font-bold text-sm mt-0.5 text-right">*</span>
                    <p><EditableText isTestMode={isTestMode} defaultText="الزامات مالی قرارداد مورد بررسی قرار گرفته تا منجر به جرائم مالیاتی و یا بیمه‌ای نشود" /></p>
                  </div>
                  <div className="flex gap-1.5 items-start">
                    <span className="text-red-500 font-bold text-sm mt-0.5 text-right">*</span>
                    <p><EditableText isTestMode={isTestMode} defaultText="برحسب قرارداد، نوع و مقدار تضمین مالی مدنظر قرار گرفته و اعلام شود" /></p>
                  </div>
                  <div className="flex gap-1.5 items-start text-blue-800">
                    <span className="text-red-500 font-bold text-sm mt-0.5 text-right">*</span>
                    <p><EditableText isTestMode={isTestMode} defaultText="بازخورد ارائه شده با سه رنگ قرمز، زرد و سبز مشخص شده که مفهوم هر یک از رنگها عبارت است از:" /></p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-sm"><EditableText isTestMode={isTestMode} defaultText="قرمز:" /></span>
                    <p className="text-[10px] text-gray-700 leading-normal font-semibold"><EditableText isTestMode={isTestMode} defaultText="ریسک مالی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشد" /></p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 bg-[#ffea00] text-gray-900 text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-sm"><EditableText isTestMode={isTestMode} defaultText="زرد:" /></span>
                    <p className="text-[10px] text-gray-700 leading-normal font-semibold"><EditableText isTestMode={isTestMode} defaultText="ریسک مالی برای سازمان دارد و بهتر است رعایت شود" /></p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 bg-[#00a86b] text-white text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-sm"><EditableText isTestMode={isTestMode} defaultText="سبز:" /></span>
                    <p className="text-[10px] text-gray-700 leading-normal font-semibold"><EditableText isTestMode={isTestMode} defaultText="در صورت وجود در قرارداد منجر به بهینه شدن قرارداد شده و بهبود ایجاد می‌کند ولی رعایت آن الزامی نمی‌باشد" /></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <BizagiDevNotes 
        notes={notes} 
        isTestMode={isTestMode} 
        onAction={handleDevNoteAction} 
        onNotesChange={setNotes}
      />
    </div>
  );
}

