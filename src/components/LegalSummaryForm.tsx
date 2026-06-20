import React, { useState, useEffect, ReactNode } from 'react';
import { Paperclip, ChevronDown, FileText, FileEdit } from 'lucide-react';
import { FieldRow, FieldRowTop } from './FormComponents';
import { BizagiDevNotes, DevNoteItem, DraggableField, EditableText } from './EditableText';
import { getNotesOverride } from '../lib/ui-registry';
import { Reorder } from "motion/react";

export interface LegalSummaryFormProps {
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
  tempSigners: any[];
  setTempSigners: (v: any[]) => void;
}

export function LegalSummaryForm({
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
  setParties,
  tempSigners,
  setTempSigners
}: LegalSummaryFormProps) {
  const [activeTab, setActiveTab] = useState<'opinion' | 'finance' | 'contractInfo'>('opinion');

  // Tab 1: Opinion States
  const [greenFeedback, setGreenFeedback] = useState(() => localStorage.getItem('legalSummary_green') || '');
  const [yellowFeedback, setYellowFeedback] = useState(() => localStorage.getItem('legalSummary_yellow') || '');
  const [redFeedback, setRedFeedback] = useState(() => localStorage.getItem('legalSummary_red') || '');
  const [decision, setDecision] = useState(() => localStorage.getItem('legalSummary_decision') || 'تایید');
  const [attachment, setAttachment] = useState<boolean>(() => localStorage.getItem('legalSummary_attachment') === 'true');
  const [description, setDescription] = useState(() => localStorage.getItem('legalSummary_description') || '');
  const [pdfAttached, setPdfAttached] = useState<boolean>(() => localStorage.getItem('legalSummary_pdfAttached') === 'true');
  const [wordAttached, setWordAttached] = useState<boolean>(() => localStorage.getItem('legalSummary_wordAttached') === 'true');
  const [financialTeam, setFinancialTeam] = useState(() => localStorage.getItem('legal_financeTeam') || '');
  const [footerCheck, setFooterCheck] = useState<boolean>(() => localStorage.getItem('legalSummary_footerCheck') === 'true');
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);

  // Load attachments from previous finance forms
  const parsFinanceAttachment = localStorage.getItem('finance_attachment') === 'true';
  const holdingFinanceAttachment = localStorage.getItem('holdingFinManager_attachment') === 'true';

  const [newSigner, setNewSigner] = useState({ fullName: '', position: '', nationalId: '', mobile: '' });
  
  // New Attachments state for Contract Info tab
  const [contractAttachments, setContractAttachments] = useState<{name: string, date: string}[]>(() => {
    const saved = localStorage.getItem('legalSummary_contractAttachments');
    return saved ? JSON.parse(saved) : [{ name: 'نسخه اولیه قرارداد.pdf', date: '۱۴۰۵/۰۳/۲۰' }];
  });

  const isBarterContract = contractType.includes("تهاتر");

  // Persistence
  React.useEffect(() => {
    localStorage.setItem('legalSummary_green', greenFeedback);
    localStorage.setItem('legalSummary_yellow', yellowFeedback);
    localStorage.setItem('legalSummary_red', redFeedback);
    localStorage.setItem('legalSummary_decision', decision);
    localStorage.setItem('legalSummary_attachment', attachment ? 'true' : 'false');
    localStorage.setItem('legalSummary_description', description);
    localStorage.setItem('legalSummary_pdfAttached', pdfAttached ? 'true' : 'false');
    localStorage.setItem('legalSummary_wordAttached', wordAttached ? 'true' : 'false');
    localStorage.setItem('legal_financeTeam', financialTeam);
    localStorage.setItem('legalSummary_footerCheck', footerCheck ? 'true' : 'false');
    localStorage.setItem('legalSummary_contractAttachments', JSON.stringify(contractAttachments));
  }, [greenFeedback, yellowFeedback, redFeedback, decision, attachment, description, pdfAttached, wordAttached, financialTeam, contractAttachments, footerCheck]);

  // Read-only data for Finance Tab (mocked based on FinancialManagerReviewForm logic)
  const finRiskGreen = localStorage.getItem('finSpec_riskGreen') || 'بررسی‌های لازم انجام شد.';
  const finRiskYellow = localStorage.getItem('finSpec_riskYellow') || 'ریسک نوسانات ارزی در نظر گرفته شود.';
  const finRiskRed = localStorage.getItem('finSpec_riskRed') || 'بدون ریسک حیاتی.';
  const finSpecDecision = localStorage.getItem('finSpec_decision') || 'تایید';
  const finSpecAttachment = localStorage.getItem('finSpec_attachment') === 'true';
  const finSpecDescription = localStorage.getItem('finSpec_description') || 'بررسی مالی مورد تایید است.';

  const handleDevNoteAction = (targetId: string, tabId?: string) => {
    if (tabId) {
      setActiveTab(tabId as any);
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

  const [notes, setNotes] = useState<DevNoteItem[]>(() => {
    if (isTestMode) {
      const saved = localStorage.getItem('legal_summary_notes_v11');
      if (saved) return JSON.parse(saved);
    }
    const defaultNotes = [
      {
        text: "نمایش ضمائم نهایی تیم‌های مالی در تهاتر: بر اساس تیم مالی انتخاب شده در مرحله قبل (پارس/هلدینگ/هر دو)، ضمائم تایید شده توسط آن‌ها در این بخش نمایش داده می‌شود.",
        targetId: "legal-summary-barter-attachments-display",
        tabId: "opinion"
      },
      {
        text: "نمایش بنر راهنما در تهاتر: در قراردادهای تهاتری، بنر هشدار در بالای بخش آپلود فایل‌های نهایی (PDF/WORD) جهت اطلاع کاربر از کاربرد این اسناد در چاپ نهایی نمایش داده می‌شود.",
        targetId: "legal-summary-barter-warning-banner",
        tabId: "opinion"
      },
      {
        text: "انتخاب تیم مالی در تهاتر: در صورت انتخاب نوع قرارداد تهاتر و تصمیم اتخاذ شده 'نیاز به اصلاح واحد مالی'، فیلد 'درخواست مربوط به کدام تیم مالی است' نمایش داده شده و الزامی می‌باشد.",
        targetId: "legal-summary-financial-team-field",
        tabId: "opinion"
      },
      {
        text: "نمایش مشروط زمان‌بندی در تهاتر: در صورتی که نوع قرارداد تهاتر باشد، چهار فیلد مربوط به زمان‌بندی قرارداد (زمان شروع نامشخص، زمان پایان نامشخص، برنامه زمانبندی شروع و برنامه زمانبندی پایان) در تب اعلام نظر حقوقی نمایش داده می‌شوند.",
        targetId: "opinion-start-date-row",
        tabId: "opinion"
      },
      {
        text: "طراحی تب اعلام نظر بر اساس تصویر: شامل سه باکس رنگی بازخورد، بخش تصمیم و دکمه‌های آپلود PDF/Word نهایی.",
        targetId: "legal-summary-opinion-content",
        tabId: "opinion"
      },
      {
        text: "قابلیت ویرایش تب اطلاعات قرارداد: امکان ویرایش فیلدها در این تب فراهم شده است.",
        targetId: "legal-summary-contract-info-grid",
        tabId: "contractInfo"
      },
      {
        text: "محدودیت تغییر نوع قرارداد: در صورتی که نوع قرارداد تهاتری باشد، فیلد غیرقابل ویرایش است. همچنین در صورت انتخاب گزینه‌های خدمات یا کالا، امکان تغییر به گزینه‌های تهاتر وجود ندارد.",
        targetId: "legal-summary-contract-type-field",
        tabId: "contractInfo"
      },
      {
        text: "مدیریت پیوست‌ها: امکان افزودن پیوست جدید وجود دارد اما حذف پیوست‌های قبلی میسر نیست.",
        targetId: "legal-summary-attachments-section",
        tabId: "contractInfo"
      },
      {
        text: "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        targetId: "legal-summary-contract-info-grid",
        tabId: "contractInfo"
      }
    ];
    return getNotesOverride('legal_summary_notes_v11', defaultNotes);
  });

  useEffect(() => {
    localStorage.setItem('legal_summary_notes_v11', JSON.stringify(notes));
  }, [notes]);

  const addAttachment = () => {
    const name = `پیوست جدید ${contractAttachments.length + 1}.pdf`;
    const date = '۱۴۰۵/۰۳/۲۶';
    setContractAttachments([...contractAttachments, { name, date }]);
  };

  return (
    <div className="flex flex-col gap-4 text-gray-700 w-full max-w-7xl mx-auto pt-4 pb-24" dir="rtl">
      {/* Breadcrumb */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 py-3 flex items-center justify-between">
        <span className="text-gray-800 text-xs md:text-sm">
          <EditableText isTestMode={isTestMode} defaultText="درخواست انعقاد قرارداد" /> <span className="text-gray-400 mx-1">›</span> <EditableText isTestMode={isTestMode} defaultText="جمع بندی قرارداد در حقوقی" />
        </span>
        <span className="text-gray-400 font-mono text-[10px] hidden md:inline">FORM_LEGAL_SUMMARY</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden animate-fade-in">
        {/* Tabs */}
        <div className="flex border-b border-gray-300 bg-[#f9f9f9]">
          {[
            { id: 'opinion', label: 'اعلام نظر' },
            { id: 'finance', label: 'مالی' },
            { id: 'contractInfo', label: 'اطلاعات قرارداد' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-6 py-2 border-l transition-all text-xs ${activeTab === tab.id ? 'border-b-2 border-b-[#b90000] bg-white font-bold text-gray-800' : 'border-b border-transparent text-gray-500 hover:bg-gray-100'}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Main Content Area */}
          <div className="flex-1 p-4 md:p-6 border-l border-gray-100 flex flex-col gap-6">
            
            {activeTab === 'opinion' && (
              <div id="legal-summary-opinion-content" className="flex flex-col gap-6 animate-fade-in">
                
                {/* Feedback Boxes */}
                <div className="flex flex-col gap-4">
                  <div className="border border-[#00a86b] rounded-sm overflow-hidden shadow-sm">
                    <div className="bg-[#00a86b] text-white px-4 py-2 text-[12px] font-bold text-center">
                      <EditableText isTestMode={isTestMode} defaultText="در صورت وجود در قرارداد منجر به بهینه شدن قرارداد شده و بهبود ایجاد می‌کند ولی رعایت آن الزامی نمی‌باشد" />
                    </div>
                    <textarea 
                      className="w-full h-24 p-3 text-[12px] outline-none resize-none bg-white font-medium text-gray-800" 
                      value={greenFeedback}
                      onChange={(e) => setGreenFeedback(e.target.value)}
                    />
                  </div>
                  
                  <div className="border border-[#ffea00] rounded-sm overflow-hidden shadow-sm">
                    <div className="bg-[#ffea00] text-gray-900 px-4 py-2 text-[12px] font-bold text-center">
                      <EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی برای سازمان دارد و بهتر است رعایت شود" />
                    </div>
                    <textarea 
                      className="w-full h-24 p-3 text-[12px] outline-none resize-none bg-white font-medium text-gray-800" 
                      value={yellowFeedback}
                      onChange={(e) => setYellowFeedback(e.target.value)}
                    />
                  </div>

                  <div className="border border-red-600 rounded-sm overflow-hidden shadow-sm">
                    <div className="bg-red-600 text-white px-4 py-2 text-[12px] font-bold text-center">
                      <EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشد" />
                    </div>
                    <textarea 
                      className="w-full h-24 p-3 text-[12px] outline-none resize-none bg-white font-medium text-gray-800" 
                      value={redFeedback}
                      onChange={(e) => setRedFeedback(e.target.value)}
                    />
                  </div>
                </div>

                {/* Outcome Section */}
                <div className="mt-4 pt-6 border-t border-gray-100">
                  <h3 className="text-[#005f77] font-bold text-[13px] mb-4"><EditableText isTestMode={isTestMode} defaultText="نتیجه بررسی مجدد حقوقی در خصوص قرارداد" /></h3>
                  
                  <div className="flex flex-col gap-3 max-w-2xl mr-auto ml-0">
                    <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="تصمیم‌گیرنده:" /></div>
                      <div className="font-bold text-gray-800 text-[12px]"><EditableText isTestMode={isTestMode} defaultText="واحد حقوقی" /></div>
                    </div>
                    {isBarterContract && decision === 'نیاز به اصلاح واحد مالی' && (
                      <div id="legal-summary-financial-team-field" className="grid grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] items-center gap-4 border-b border-gray-100 pb-3">
                        <div className={`text-gray-500 font-semibold text-[12px] ${!financialTeam ? 'border-r-[3px] border-red-600 pr-2' : 'pr-[11px]'}`}>
                          <EditableText isTestMode={isTestMode} defaultText="درخواست مربوط به کدام تیم مالی است؟:" />
                        </div>
                        <div>
                          <select 
                            required
                            className={`w-full max-w-[250px] p-1.5 border rounded-sm focus:outline-none focus:ring-1 focus:ring-[#b90000] text-xs ${!financialTeam ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
                            value={financialTeam}
                            onChange={(e) => setFinancialTeam(e.target.value)}
                          >
                            <option value="">- لطفاً انتخاب کنید...</option>
                            <option value="مالی پارس">مالی پارس</option>
                            <option value="مالی هلدینگ">مالی هلدینگ</option>
                            <option value="مالی پارس و هلدینگ">مالی پارس و هلدینگ</option>
                          </select>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="زمان ثبت تصمیم:" /></div>
                      <div className="font-mono text-gray-800 text-[12px] tracking-tighter">۱۴۰۵/۰۳/۲۶ ۱۱:۱۵ ق.ظ</div>
                    </div>

                    <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="تصمیم اتخاذ شده:" /></div>
                      <div className="flex flex-wrap items-center gap-5">
                        {[
                          { val: 'تایید', label: 'تایید' },
                          { val: 'نیاز به اصلاح واحد مالی', label: 'نیاز به اصلاح واحد مالی' },
                          { val: 'نیاز به اصلاح توسط متقاضی', label: 'نیاز به اصلاح توسط متقاضی' }
                        ].map((opt) => (
                          <label key={opt.val} className="flex items-center gap-2 cursor-pointer group">
                             <input 
                              type="radio" 
                              name="summary_decision" 
                              className="hidden"
                              checked={decision === opt.val}
                              onChange={() => setDecision(opt.val)}
                            />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${decision === opt.val ? 'border-red-600' : 'border-gray-300 group-hover:border-gray-400'}`}>
                              {decision === opt.val && <div className="w-2 h-2 rounded-full bg-red-600 shadow-sm" />}
                            </div>
                            <span className="text-[12px] font-medium text-gray-700 whitespace-nowrap"><EditableText isTestMode={isTestMode} defaultText={opt.label} /></span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr_140px] items-center gap-4">
                      <div 
                        className="flex items-center justify-end gap-2 cursor-pointer group"
                        onClick={() => setAttachment(!attachment)}
                      >
                        <span className="text-[11px] text-gray-500 group-hover:text-red-600"><EditableText isTestMode={isTestMode} defaultText="فایل مربوطه را بارگذاری نمایید" /></span>
                        <Paperclip size={16} className={attachment ? 'text-blue-600' : 'text-gray-400'} />
                      </div>
                      <div className="text-gray-500 font-semibold text-[12px]"><EditableText isTestMode={isTestMode} defaultText="ضمائم:" /></div>
                    </div>
                  </div>



                  {/* Contract Scheduling Fields Copied */}
                  {isBarterContract && (
                    <div className="mt-6 border border-gray-200 rounded-sm overflow-hidden bg-gray-50/50 p-4">
                      <h4 className="text-[#005f77] font-bold text-[12px] mb-4">
                        <EditableText isTestMode={isTestMode} defaultText="زمان‌بندی قرارداد" />
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
                        <div className="flex flex-col gap-2 bg-white p-3 rounded border border-gray-150 shadow-sm text-right lg:p-4" dir="rtl">
                          <div className="flex items-center gap-2 py-1 select-none">
                            <input 
                              type="checkbox" 
                              id="no-start-date-checkbox"
                              checked={noStartDate} 
                              onChange={(e) => setNoStartDate(e.target.checked)} 
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
                            />
                            <label htmlFor="no-start-date-checkbox" className="font-bold text-gray-700 cursor-pointer">
                              <EditableText isTestMode={isTestMode} defaultText="زمان شروع نامشخص" />
                            </label>
                          </div>
                          {!noStartDate && (
                            <div className="mt-1 animate-in slide-in-from-top-1 duration-200">
                              <FieldRow
                                id="opinion-start-date-row"
                                label={<EditableText isTestMode={isTestMode} defaultText="برنامه زمانبندی شروع:" />}
                                required={true}
                                hasValue={!!startDate}
                                labelWidthClass="grid-cols-[130px_1fr]"
                                noMargin={true}
                              >
                                <input 
                                  type="date" 
                                  required
                                  className={`w-full p-2 border rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#b90000] text-[12px] ${!startDate ? 'border-red-400 bg-red-50/30' : 'border-gray-300'}`}
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                                />
                              </FieldRow>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 bg-white p-3 rounded border border-gray-150 shadow-sm text-right lg:p-4" dir="rtl">
                          <div className="flex items-center gap-2 py-1 select-none">
                            <input 
                              type="checkbox" 
                              id="no-end-date-checkbox"
                              checked={noEndDate} 
                              onChange={(e) => setNoEndDate(e.target.checked)} 
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
                            />
                            <label htmlFor="no-end-date-checkbox" className="font-bold text-gray-700 cursor-pointer">
                              <EditableText isTestMode={isTestMode} defaultText="زمان پایان نامشخص" />
                            </label>
                          </div>
                          {!noEndDate && (
                            <div className="mt-1 animate-in slide-in-from-top-1 duration-200">
                              <FieldRow
                                id="opinion-end-date-row"
                                label={<EditableText isTestMode={isTestMode} defaultText="برنامه زمانبندی پایان:" />}
                                required={true}
                                hasValue={!!endDate}
                                labelWidthClass="grid-cols-[130px_1fr]"
                                noMargin={true}
                              >
                                <input 
                                  type="date" 
                                  required
                                  className={`w-full p-2 border rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#b90000] text-[12px] ${!endDate ? 'border-red-400 bg-red-50/30' : 'border-gray-300'}`}
                                  value={endDate}
                                  onChange={(e) => setEndDate(e.target.value)}
                                />
                              </FieldRow>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-2">
                    <textarea 
                      className="w-full h-32 border border-gray-300 rounded-sm p-4 outline-none focus:border-red-400 shadow-inner text-[12px] transition-all resize-none" 
                      placeholder="..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Collapsible comments */}
                  <div className="mt-8 border border-gray-200 rounded-sm">
                    <button 
                      onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                      className="w-full bg-[#cbd5e0] px-4 py-2 flex items-center justify-between text-[13px] font-bold text-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        <ChevronDown size={14} className={`transform transition-transform ${isCommentsOpen ? '' : '-rotate-90'}`} />
                        <EditableText isTestMode={isTestMode} defaultText="کامنت های واحد حقوقی به متقاضی" />
                      </span>
                    </button>
                    {isCommentsOpen && (
                      <div className="p-8 text-center text-[12px] text-gray-500 bg-gray-50">
                        <EditableText isTestMode={isTestMode} defaultText="رکوردی یافت نشد" />
                      </div>
                    )}
                  </div>

                  {/* Signers Table */}
                  <div className="mt-6 border border-gray-300 rounded-sm overflow-hidden">
                    <div className="bg-[#cbd5e1] border-b border-gray-300 px-4 py-2 font-bold text-gray-800 text-[12px]">
                      <EditableText isTestMode={isTestMode} defaultText="صاحبان امضا" />
                    </div>
                    <div className="overflow-x-auto bg-white">
                      <table className="w-full text-right border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700 border-b border-gray-300">
                            <th className="p-2 border-l border-gray-300 w-full"><EditableText isTestMode={isTestMode} defaultText="نام و نام خانوادگی" /></th>
                            <th className="p-2 w-12"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-blue-50/30">
                            <td className="p-2 border-l border-gray-200">
                              <input 
                                type="text" 
                                className="w-full p-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#b90000]"
                                value={newSigner.fullName}
                                onChange={(e) => setNewSigner({...newSigner, fullName: e.target.value})}
                                placeholder="نام و نام خانوادگی..."
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button 
                                onClick={() => {
                                  if (newSigner.fullName) {
                                    setTempSigners([...(tempSigners || []), { ...newSigner, id: Date.now() }]);
                                    setNewSigner({ fullName: '', position: '', nationalId: '', mobile: '' });
                                  }
                                }}
                                className="bg-[#002855] text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-blue-900 transition-shadow shadow-sm mx-auto"
                              >
                                +
                              </button>
                            </td>
                          </tr>
                          {(tempSigners || []).map((signer, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 border-b border-gray-200 animate-in slide-in-from-right-2 duration-300">
                              <td className="p-2 border-l border-gray-200 font-medium">{signer.fullName}</td>
                              <td className="p-2 text-center text-red-600 cursor-pointer hover:bg-red-50 font-bold text-lg" onClick={() => setTempSigners(tempSigners.filter((_, i) => i !== idx))}>×</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Upload Buttons */}
                  {/* Barter Finance Attachments Display */}
                  {isBarterContract && (financialTeam === 'مالی پارس' || financialTeam === 'مالی هلدینگ' || financialTeam === 'مالی پارس و هلدینگ') && (
                    <div id="legal-summary-barter-attachments-display" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                      {(financialTeam === 'مالی پارس' || financialTeam === 'مالی پارس و هلدینگ') && (
                        <div className="flex flex-col rounded-sm overflow-hidden border border-teal-700 bg-teal-50/30">
                          <div className="bg-teal-700 text-white text-center py-2 text-[12px] font-bold">
                            <EditableText isTestMode={isTestMode} defaultText="ضمائم نهایی آرین پارس" />
                          </div>
                          <div className="p-4 flex flex-col items-center justify-center gap-2 opacity-90">
                            <span className="text-[11px] text-teal-900 font-bold">
                              {parsFinanceAttachment ? 'فایل توسط کارشناس مالی پارس بارگذاری شده است' : 'فایلی یافت نشد'}
                            </span>
                            <Paperclip size={20} className={parsFinanceAttachment ? 'text-teal-700' : 'text-gray-400'} />
                          </div>
                        </div>
                      )}
                      {(financialTeam === 'مالی هلدینگ' || financialTeam === 'مالی پارس و هلدینگ') && (
                        <div className="flex flex-col rounded-sm overflow-hidden border border-teal-700 bg-teal-50/30">
                          <div className="bg-teal-700 text-white text-center py-2 text-[12px] font-bold">
                            <EditableText isTestMode={isTestMode} defaultText="ضمائم نهایی هلدینگ" />
                          </div>
                          <div className="p-4 flex flex-col items-center justify-center gap-2 opacity-90">
                            <span className="text-[11px] text-teal-900 font-bold">
                              {holdingFinanceAttachment ? 'فایل توسط مدیر مالی هلدینگ بارگذاری شده است' : 'فایلی یافت نشد'}
                            </span>
                            <Paperclip size={20} className={holdingFinanceAttachment ? 'text-teal-700' : 'text-gray-400'} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    {isBarterContract && (
                      <div id="legal-summary-barter-warning-banner" className="mb-4 bg-blue-50 text-blue-800 border border-blue-200 p-3 rounded-sm text-[11px] font-bold leading-relaxed flex items-start gap-2 shadow-sm animate-fade-in">
                        <div className="mt-0.5 shrink-0 px-1.5 py-0.5 bg-blue-100 rounded-full text-[10px] text-blue-700">!</div>
                        <EditableText 
                          isTestMode={isTestMode} 
                          defaultText="کاربر گرامی، توجه داشته باشید سند بارگذاری‌شده در این بخش، به‌منظور چاپ قرارداد و درج امضا استفاده خواهد شد، زیرا این قرارداد از نوع تهاتر است." 
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col rounded-sm overflow-hidden border border-[#002855]">
                        <div className="bg-[#002855] text-white text-center py-2 text-[12px] font-bold">
                          <EditableText isTestMode={isTestMode} defaultText="لطفا PDF قرارداد جمع بندی شده را آپلود نمایید" />
                        </div>
                        <div 
                          className="bg-[#cbd5e1] p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#b8c5d6] transition-colors"
                          onClick={() => setPdfAttached(!pdfAttached)}
                        >
                          <span className="text-[11px] text-[#002855] font-bold">
                            {pdfAttached ? 'فایل بارگذاری شد' : 'فایل مربوطه را بارگذاری نمایید'}
                          </span>
                          <FileText size={20} className={pdfAttached ? 'text-green-700' : 'text-slate-600'} />
                        </div>
                      </div>
                      <div className="flex flex-col rounded-sm overflow-hidden border border-[#002855]">
                        <div className="bg-[#002855] text-white text-center py-2 text-[12px] font-bold">
                          <EditableText isTestMode={isTestMode} defaultText="لطفا WORD قرارداد جمع بندی شده را آپلود نمایید" />
                        </div>
                        <div 
                          className="bg-[#cbd5e1] p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#b8c5d6] transition-colors"
                          onClick={() => setWordAttached(!wordAttached)}
                        >
                          <span className="text-[11px] text-[#002855] font-bold">
                            {wordAttached ? 'فایل بارگذاری شد' : 'فایل مربوطه را بارگذاری نمایید'}
                          </span>
                          <FileEdit size={20} className={wordAttached ? 'text-blue-700' : 'text-slate-600'} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="flex flex-col gap-6 animate-fade-in text-right" dir="rtl">
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

                <div className="mt-4 pt-6 border-t border-gray-100 flex flex-col gap-4">
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
              <div className="p-4 flex flex-col gap-6 text-[12px] text-gray-800 animate-fade-in text-right" dir="rtl">
                <div id="legal-summary-contract-info-grid" className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 bg-gray-50/40 p-5 rounded border border-gray-150 shadow-inner">
                  
                  <div className="flex flex-col gap-1.5 py-1">
                    <span className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="درخواست، الحاقیه است؟:" /></span>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#b90000] text-xs"
                      value={isAddendum === true ? "بله" : (isAddendum === false ? "خیر" : "")}
                      onChange={(e) => {
                        const val = e.target.value;
                        const isAdd = val === "" ? null : val === "بله";
                        setIsAddendum(isAdd);
                        if (isAdd === true) {
                          setHasTemplate(false);
                        }
                      }}
                    >
                      <option value="">- انتخاب کنید -</option>
                      <option value="بله">بله</option>
                      <option value="خیر">خیر</option>
                    </select>
                  </div>

                  {!isBarterContract && (
                    <div className="flex flex-col gap-1.5 py-1">
                      <span className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="آیا قرارداد قالب دار است؟:" /></span>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#b90000] text-xs"
                        value={hasTemplate === true ? "بله" : (hasTemplate === false ? "خیر" : "")}
                        onChange={(e) => {
                          const val = e.target.value;
                          const hasTemp = val === "" ? null : val === "بله";
                          setHasTemplate(hasTemp);
                          if (hasTemp === true) {
                            setIsAddendum(false);
                          }
                        }}
                      >
                        <option value="">- انتخاب کنید -</option>
                        <option value="بله">بله</option>
                        <option value="خیر">خیر</option>
                      </select>
                    </div>
                  )}

                  <div id="legal-summary-contract-type-field" className="flex flex-col gap-1.5 py-1">
                    <span className="font-bold text-gray-800">
                       <EditableText isTestMode={isTestMode} defaultText="نوع قرارداد:" />
                    </span>
                    <select 
                      className={`w-full p-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#b90000] text-xs ${isBarterContract ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white'}`}
                      value={contractType}
                      disabled={isBarterContract}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContractType(val);
                        if (val.includes("تهاتر")) {
                          setHasTemplate(null);
                        }
                      }}
                    >
                      <option value="">- انتخاب کنید -</option>
                      <option value="خدمات">خدمات</option>
                      <option value="کالا">کالا</option>
                      <option value="کالا و خدمات">کالا و خدمات</option>
                      <option value="تهاتر با نمایندگی فروش و خدمات پس از فروش" disabled={!isBarterContract && contractType !== ""}>تهاتر با نمایندگی فروش و خدمات پس از فروش</option>
                      <option value="تهاتر تامین کنندگان و پیمانکاران" disabled={!isBarterContract && contractType !== ""}>تهاتر تامین کنندگان و پیمانکاران</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 py-1">
                    <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="قرارداد مربوط به کدام شرکت است؟:" /></span>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-sm bg-white"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
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

                  <div className="flex flex-col gap-1.5 py-1 col-span-1 md:col-span-2">
                    <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="موضوع قرارداد:" /></span>
                    <input 
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-sm bg-white focus:ring-1 focus:ring-blue-400 outline-none"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 py-1">
                    <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="نماینده قرارداد:" /></span>
                    <input 
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-sm bg-white focus:ring-1 focus:ring-blue-400 outline-none"
                      value={representative}
                      onChange={(e) => setRepresentative(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 py-2">
                        <input type="checkbox" checked={noStartDate} onChange={(e) => setNoStartDate(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="زمان شروع نامشخص" /></span>
                      </div>
                      {!noStartDate && (
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-400 text-[10px]"><EditableText isTestMode={isTestMode} defaultText="برنامه زمانبندی شروع:" /></span>
                          <input 
                            type="date" 
                            className="w-full p-2 border border-gray-300 rounded-sm bg-white"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 py-2">
                        <input type="checkbox" checked={noEndDate} onChange={(e) => setNoEndDate(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                        <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="زمان پایان نامشخص" /></span>
                      </div>
                      {!noEndDate && (
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-gray-400 text-[10px]"><EditableText isTestMode={isTestMode} defaultText="برنامه زمانبندی پایان:" /></span>
                          <input 
                            type="date" 
                            className="w-full p-2 border border-gray-300 rounded-sm bg-white"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 py-2">
                      <input type="checkbox" checked={hasTechnicalReport} onChange={(e) => setHasTechnicalReport(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                      <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="گزارش توجیه فنی دارد؟" /></span>
                    </div>
                    <div className="flex items-center gap-2 py-2">
                      <input type="checkbox" checked={hasPrivateConditions} onChange={(e) => setHasPrivateConditions(e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                      <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="شرایط خصوصی دارد؟" /></span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 py-2 col-span-1 md:col-span-2">
                    <span className="font-bold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="شرح درخواست:" /></span>
                    <textarea 
                      className="w-full h-24 p-3 border border-gray-300 rounded-sm bg-white focus:ring-1 focus:ring-blue-400 outline-none resize-none"
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* Attachments Section */}
                <div id="legal-summary-attachments-section" className="mt-6 border border-gray-300 rounded-sm overflow-hidden bg-white shadow-sm">
                   <div className="bg-[#cbd5e1] border-b border-gray-300 px-4 py-2 flex items-center justify-between">
                      <span className="font-bold text-gray-800 text-[12px]"><EditableText isTestMode={isTestMode} defaultText="پیوست‌های قرارداد" /></span>
                      <button 
                        onClick={addAttachment}
                        className="bg-[#002855] text-white px-3 py-1 rounded text-[11px] font-bold hover:bg-[#003d7a] transition-colors"
                      >
                         <EditableText isTestMode={isTestMode} defaultText="افزودن پیوست جدید" />
                      </button>
                   </div>
                   <div className="p-4">
                      <div className="grid grid-cols-1 gap-2">
                         {contractAttachments.map((file, idx) => (
                           <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2 rounded-sm group">
                              <div className="flex items-center gap-3">
                                 <Paperclip size={14} className="text-blue-600" />
                                 <span className="text-[11px] font-bold text-gray-700">{file.name}</span>
                                 <span className="text-[10px] text-gray-400 mr-4">تاریخ آپلود: {file.date}</span>
                              </div>
                              <span className="text-[9px] text-gray-400 bg-gray-200/50 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <EditableText isTestMode={isTestMode} defaultText="غیرقابل حذف" />
                              </span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="mt-6 border border-gray-300 rounded-sm overflow-hidden">
                   <div className="bg-[#cbd5e1] border-b border-gray-300 px-4 py-2 font-bold text-gray-800 text-[12px]"><EditableText isTestMode={isTestMode} defaultText="اطلاعات اولیه طرف قرارداد" /></div>
                   <div className="overflow-x-auto bg-white">
                      <table className="w-full text-right border-collapse text-[11px]">
                         <thead>
                            <tr className="bg-gray-100 text-gray-700 border-b border-gray-300">
                               <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="نوع طرف" /></th>
                               <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="نام سازمان" /></th>
                               <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="شناسه ملی" /></th>
                               <th className="p-2 border-l border-gray-300"><EditableText isTestMode={isTestMode} defaultText="شماره موبایل" /></th>
                               <th className="p-2 text-center"><EditableText isTestMode={isTestMode} defaultText="جزئیات" /></th>
                            </tr>
                         </thead>
                         <tbody>
                            {parties.map((party, idx) => (
                               <tr key={idx} className="hover:bg-gray-50 border-b border-gray-200">
                                  <td className="p-2 border-l border-gray-200">{party.type}</td>
                                  <td className="p-2 border-l border-gray-200 font-bold">{party.orgName || party.name || '-'}</td>
                                  <td className="p-2 border-l border-gray-200 font-mono tracking-tight">{party.nationalId || party.orgNationalId || '-'}</td>
                                  <td className="p-2 border-l border-gray-200 font-mono">{party.mobile || '-'}</td>
                                  <td className="p-2 text-center">
                                     <button className="bg-teal-700 hover:bg-teal-800 text-white rounded px-2 py-0.5 text-[10px]"><EditableText isTestMode={isTestMode} defaultText="نمایش" /></button>
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

          {/* Left Sidebar - Key Requirements */}
          {activeTab === 'opinion' && (
            <div className="w-full lg:w-72 bg-[#fdfdfd] p-4 flex flex-col gap-4 border-t lg:border-t-0 border-gray-100 shrink-0">
              <div className="border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                <div className="bg-[#f2f4f6] px-3 py-2 flex items-center justify-between text-[13px] font-bold text-gray-800 border-b border-gray-200">
                  <span><EditableText isTestMode={isTestMode} defaultText="الزامات کلیدی" /></span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
                <div className="p-4 bg-white space-y-4">
                  <div className="space-y-3 text-[11px] leading-relaxed text-gray-800">
                    <div className="flex gap-1.5 items-start">
                      <span className="text-red-500 font-bold text-sm mt-0.5">*</span>
                      <p><EditableText isTestMode={isTestMode} defaultText="در صورت وجود قالب استاندارد برای موضوع قرارداد، بر اساس آخرین فرمت موجود در سازمان قرارداد تدوین شود" /></p>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="text-red-500 font-bold text-sm mt-0.5">*</span>
                      <p><EditableText isTestMode={isTestMode} defaultText="قبل از ارسال قرارداد به واحد مالی الزامات مربوط به قسمت مالی قرارداد از این واحد دریافت و در قرارداد قید شود" /></p>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="text-red-500 font-bold text-sm mt-0.5">*</span>
                      <p><EditableText isTestMode={isTestMode} defaultText="بازخورد ارائه شده با سه رنگ قرمز، زرد و سبز مشخص شده که مفهوم هر یک از رنگها عبارت است از:" /></p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3 space-y-2.5">
                    <div className="flex items-start gap-2">
                       <span className="shrink-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-sm"><EditableText isTestMode={isTestMode} defaultText="قرمز:" /></span>
                       <p className="text-[10px] text-gray-700 leading-normal font-semibold"><EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی بالایی برای سازمان دارد و قابل مذاکره نمی‌باشد" /></p>
                    </div>
                    <div className="flex items-start gap-2">
                       <span className="shrink-0 bg-[#ffea00] text-gray-900 text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-sm"><EditableText isTestMode={isTestMode} defaultText="زرد:" /></span>
                       <p className="text-[10px] text-gray-700 leading-normal font-semibold"><EditableText isTestMode={isTestMode} defaultText="ریسک حقوقی برای سازمان دارد و بهتر است رعایت شود" /></p>
                    </div>
                    <div className="flex items-start gap-2">
                       <span className="shrink-0 bg-[#00a86b] text-white text-[10px] px-2 py-0.5 rounded-sm font-bold shadow-sm"><EditableText isTestMode={isTestMode} defaultText="سبز:" /></span>
                       <p className="text-[10px] text-gray-700 leading-normal font-semibold"><EditableText isTestMode={isTestMode} defaultText="در صورت وجود در قرارداد منجر به بهینه شدن قرارداد شده و بهبود ایجاد می‌کند ولی رعایت آن الزامی نمی‌باشد" /></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
