/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode, createContext, useContext } from 'react';
import { ChevronDown, ChevronUp, Plus, Paperclip, Calendar, X, GripVertical, BookOpen, MousePointer2, ChevronRight, ChevronLeft } from 'lucide-react';
import { JalaliDatePicker } from './components/JalaliDatePicker';
import { Reorder, useDragControls } from "motion/react";

function parseJalaliOrGregorian(str: string): { days: number; parts?: { y: number; m: number; d: number } } | null {
  if (!str) return null;
  // Convert Persian digits to English digits
  const cleaned = str.trim().replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
  const parts = cleaned.split(/[-/]/);
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      if (y > 1300 && y < 1500) {
        // Jalali date path
        let days = 0;
        // count days for years prior to y
        for (let year = 1; year < y; year++) {
          const isLeap = ((((((year - 474) % 128) + 474) + 38) * 31) % 128) < 31;
          days += isLeap ? 366 : 365;
        }
        // count days for months prior to m
        for (let month = 1; month < m; month++) {
          if (month <= 6) days += 31;
          else if (month <= 11) days += 30;
          else {
            const isLeap = ((((((y - 474) % 128) + 474) + 38) * 31) % 128) < 31;
            days += isLeap ? 30 : 29;
          }
        }
        days += d;
        return { days, parts: { y, m, d } };
      } else {
        // Gregorian date path
        const dObj = new Date(y, m - 1, d);
        if (!isNaN(dObj.getTime())) {
          return { days: Math.floor(dObj.getTime() / (1000 * 60 * 60 * 24)), parts: { y, m, d } };
        }
      }
    }
  }
  // Try default JavaScript date parsing
  const parsedTime = Date.parse(str);
  if (!isNaN(parsedTime)) {
    return { days: Math.floor(parsedTime / (1000 * 60 * 60 * 24)) };
  }
  return null;
}

function formatNumberWithCommas(val: string) {
  if (!val) return '';
  // Convert Persian numbers to English if any
  let englishDigits = val.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
  // Remove all non-digit characters
  let digitsOnly = englishDigits.replace(/\D/g, '');
  if (!digitsOnly) return '';
  // Format with thousand separators
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getTomanHelper(rialStr: string) {
  if (!rialStr) return '';
  const cleanNumStr = rialStr.replace(/,/g, '');
  if (!cleanNumStr || isNaN(Number(cleanNumStr))) return '';
  const rialVal = parseInt(cleanNumStr, 10);
  const tomanVal = Math.floor(rialVal / 10);
  return `(معادل ${tomanVal.toLocaleString('fa-IR')} تومان)`;
}

import { FieldRow, FieldRowTop } from './components/FormComponents';
import { ManagerReviewForm } from './components/ManagerReviewForm';
import { LegalReviewForm } from './components/LegalReviewForm';
import { FinanceReviewForm } from './components/FinanceReviewForm';
import { FinancialManagerReviewForm } from './components/FinancialManagerReviewForm';
import { HoldingFinancialManagerReviewForm } from './components/HoldingFinancialManagerReviewForm';
import { ManagerReviewFormCopy } from './components/ManagerReviewFormCopy';
import { LegalSummaryForm } from './components/LegalSummaryForm';
import { SoftwareGuide } from './components/SoftwareGuide';
import { SupplierReviewForm } from './components/SupplierReviewForm';
import { 
  TestModeContext, 
  useTestMode, 
  EditableText, 
  DevNoteItem, 
  BizagiDevNotes, 
  DraggableField 
} from './components/EditableText';

function FormStatus({
  contractType,
  setContractType,
  isAddendum,
  setIsAddendum,
  hasTemplate,
  setHasTemplate,
}: {
  contractType: string;
  setContractType: (v: string) => void;
  isAddendum: boolean | null;
  setIsAddendum: (v: boolean | null) => void;
  hasTemplate: boolean | null;
  setHasTemplate: (v: boolean | null) => void;
  isTestMode?: boolean;
}) {
  const { isTestMode } = useTestMode();
  const [order, setOrder] = useState(() => {
    const saved = localStorage.getItem('formStatus_order');
    return saved ? JSON.parse(saved) : ['contractType', 'isAddendum', 'hasTemplate'];
  });

  const handleOrderChange = (newOrder: string[]) => {
    setOrder(newOrder);
    localStorage.setItem('formStatus_order', JSON.stringify(newOrder));
  };

  const isBarterContract = typeof contractType === "string" && contractType.includes("تهاتر");

  const statusNotes: DevNoteItem[] = [
    {
      text: "قاعده شرطی فیلد الحاقیه و نمایش مشروط قالب: فیلد 'درخواست، الحاقیه است؟' در تمامی قراردادها (حتی تهاتر) نمایش داده می‌شود، اما فیلد 'آیا قرارداد قالب‌دار است؟' در قراردادهای تهاتری مخفی شده و مقدار آن Null می‌گردد.",
      targetId: "status-contract-type"
    }
  ];

  const fieldComponents: Record<string, ReactNode> = {
    contractType: (
            <FieldRow id="status-contract-type" label={<EditableText defaultText="نوع قرارداد:" />} required hasValue={!!contractType} labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]">
              <select 
                className="w-full xl:w-1/2 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner"
                value={contractType}
                onChange={(e) => {
                  const val = e.target.value;
                  setContractType(val);
                  if (val === "تهاتر با نمایندگی فروش و خدمات پس از فروش" || val === "تهاتر تامین کنندگان و پیمانکاران") {
                    setHasTemplate(null);
                  }
                }}
              >
                <option value="">- لطفاً انتخاب کنید...</option>
                <option value="خدمات">خدمات</option>
                <option value="کالا">کالا</option>
                <option value="کالا و خدمات">کالا و خدمات</option>
                <option value="تهاتر با نمایندگی فروش و خدمات پس از فروش">تهاتر با نمایندگی فروش و خدمات پس از فروش</option>
                <option value="تهاتر تامین کنندگان و پیمانکاران">تهاتر تامین کنندگان و پیمانکاران</option>
              </select>
            </FieldRow>
    ),
    isAddendum: (
                <FieldRow id="status-is-addendum" label={<EditableText defaultText="درخواست، الحاقیه است؟:" />} required hasValue={isAddendum !== null} labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="is_addendum" 
                        checked={isAddendum === true}
                        onChange={() => setIsAddendum(true)} 
                        className="w-[14px] h-[14px] text-blue-600 focus:ring-blue-500 border-gray-300" 
                      />
                      <span className="text-gray-700 text-sm"><EditableText defaultText="بله" /></span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="is_addendum" 
                        checked={isAddendum === false}
                        onChange={() => setIsAddendum(false)} 
                        className="w-[14px] h-[14px] text-blue-600 focus:ring-blue-500 border-gray-300" 
                      />
                      <span className="text-gray-700 text-sm"><EditableText defaultText="خیر" /></span>
                    </label>
                  </div>
                </FieldRow>
    ),
    hasTemplate: !isBarterContract ? (
                <FieldRow id="status-has-template" label={<EditableText defaultText="آیا قرارداد قالب دار است؟:" />} required hasValue={hasTemplate !== null} labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="has_template" 
                        checked={hasTemplate === true}
                        onChange={() => setHasTemplate(true)} 
                        className="w-[14px] h-[14px] text-blue-600 focus:ring-blue-500 border-gray-300" 
                      />
                      <span className="text-gray-700 text-sm"><EditableText defaultText="بله" /></span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="has_template" 
                        checked={hasTemplate === false}
                        onChange={() => setHasTemplate(false)} 
                        className="w-[14px] h-[14px] text-blue-600 focus:ring-blue-500 border-gray-300" 
                      />
                      <span className="text-gray-700 text-sm"><EditableText defaultText="خیر" /></span>
                    </label>
                  </div>
                </FieldRow>
    ) : null
  };

  return (
    <div className="flex flex-col gap-4 text-gray-700 w-full max-w-4xl mx-auto xl:mr-0 pl-16">
      {/* Breadcrumb / Title Bar */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 py-3 flex items-center">
        <span className="text-gray-800 text-sm">
          <EditableText isTestMode={isTestMode} defaultText="درخواست انعقاد قرارداد" /> <span className="text-gray-400 mx-1">›</span> <EditableText isTestMode={isTestMode} defaultText="تعیین وضعیت قرارداد" />
        </span>
      </div>

      {/* Form Body */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 pb-8">
        <Reorder.Group axis="y" values={order} onReorder={handleOrderChange} className="flex flex-col gap-6 w-full">
          {order.map(id => {
            const comp = fieldComponents[id];
            if (!comp) return null;
            return (
              <DraggableField key={id} id={id} isTestMode={isTestMode}>
                {comp}
              </DraggableField>
            );
          })}
        </Reorder.Group>

        <div className="mt-12 flex justify-center">
          <button className="bg-[#b90000] hover:bg-[#a00000] text-white px-8 py-2 rounded font-medium shadow-sm transition-colors text-sm">
            <EditableText isTestMode={isTestMode} defaultText="لغو درخواست" />
          </button>
        </div>
      </div>

      {/* Bizagi Technical Notes */}
      <BizagiDevNotes notes={statusNotes} isTestMode={isTestMode} />
    </div>
  );
}

function FormRequest({
  contractType,
  setContractType,
  isAddendum,
  setIsAddendum,
  hasTemplate,
  setHasTemplate,
  isTestMode = false,
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
  setTempSigners,
}: {
  contractType: string;
  setContractType: (v: string) => void;
  isAddendum: boolean | null;
  setIsAddendum: (v: boolean | null) => void;
  hasTemplate: boolean | null;
  setHasTemplate: (v: boolean | null) => void;
  isTestMode?: boolean;
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
}) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [isPartyInfoOpen, setIsPartyInfoOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [tempPartyType, setTempPartyType] = useState<string>('');
  const [tempFullName, setTempFullName] = useState<string>('');
  const [tempNationalId, setTempNationalId] = useState<string>('');
  const [tempJobTitle, setTempJobTitle] = useState<string>('');
  const [tempMobile, setTempMobile] = useState<string>('');
  const [tempAddress, setTempAddress] = useState<string>('');

  // States for Organization (حقوقی)
  const [tempOrgName, setTempOrgName] = useState<string>('');
  const [tempOrgNationalId, setTempOrgNationalId] = useState<string>('');
  const [tempOrgEconomicCode, setTempOrgEconomicCode] = useState<string>('');
  const [tempOrgRegNo, setTempOrgRegNo] = useState<string>('');
  const [tempOrgPhone, setTempOrgPhone] = useState<string>('');
  const [tempOrgPostalCode, setTempOrgPostalCode] = useState<string>('');
  const [tempOrgAddress, setTempOrgAddress] = useState<string>('');

  // States for Barter fields under Barter contracts (تهاتر)
  const [tempBarterType, setTempBarterType] = useState<string>('');
  const [tempBarterUntilDate, setTempBarterUntilDate] = useState<string>('');
  const [tempBarterAmount, setTempBarterAmount] = useState<string>('');
  const [tempBarterRelatedContract, setTempBarterRelatedContract] = useState<string>('');

  // Signer states under organization (صاحبان امضا)
  const [isSignersAccordionOpen, setIsSignersAccordionOpen] = useState(true);
  const [isAddingSigner, setIsAddingSigner] = useState(false);
  const [signerFullName, setSignerFullName] = useState('');
  const [signerPosition, setSignerPosition] = useState('');
  const [signerNationalId, setSignerNationalId] = useState('');
  const [signerMobile, setSignerMobile] = useState('');

  const resetPartyModal = () => {
    setIsModalOpen(false);
    setTempPartyType('');
    setTempFullName('');
    setTempNationalId('');
    setTempJobTitle('');
    setTempMobile('');
    setTempAddress('');
    
    setTempOrgName('');
    setTempOrgNationalId('');
    setTempOrgEconomicCode('');
    setTempOrgRegNo('');
    setTempOrgPhone('');
    setTempOrgPostalCode('');
    setTempOrgAddress('');

    setTempBarterType('');
    setTempBarterUntilDate('');
    setTempBarterAmount('');
    setTempBarterRelatedContract('');
    
    setTempSigners([]);
    setIsAddingSigner(false);
    setSignerFullName('');
    setSignerPosition('');
    setSignerNationalId('');
    setSignerMobile('');
  };



  const isBarterContract = typeof contractType === "string" && contractType.includes("تهاتر");

  // Calculate duration relative to start and end date
  let calculatedMonths = '';
  let calculatedDays = '';
  
  if (!noStartDate && !noEndDate && startDate && endDate) {
    const pStart = parseJalaliOrGregorian(startDate);
    const pEnd = parseJalaliOrGregorian(endDate);
    if (pStart && pEnd) {
      const diffDays = pEnd.days - pStart.days;
      if (diffDays >= 0) {
        calculatedDays = diffDays.toString();
        
        let diffMonths = 0;
        if (pStart.parts && pEnd.parts) {
          const { y: y1, m: m1, d: d1 } = pStart.parts;
          const { y: y2, m: m2, d: d2 } = pEnd.parts;
          const mStart = y1 * 12 + m1 + (d1 - 1) / (m1 <= 6 ? 31 : (m1 <= 11 ? 30 : 29));
          const mEnd = y2 * 12 + m2 + (d2 - 1) / (m2 <= 6 ? 31 : (m2 <= 11 ? 30 : 29));
          diffMonths = mEnd - mStart;
        } else {
          diffMonths = diffDays / 30.4375;
        }
        calculatedMonths = parseFloat(diffMonths.toFixed(1)).toString();
      }
    }
  }

  const requestNotes: DevNoteItem[] = [
    {
      text: "سوئیچ هوشمند بنرهای راهنما: با انتخاب گزینه‌های 'تهاتر'، بنر عمومی صورتی تدارکات مخفی شده و بجای آن باکس هشدارِ بارگذاری مدارک سه‌گانه تهاتر (فاکتور/چک، قرارداد فروش و فایل ورد) ظاهر می‌گردد.",
      targetId: "req-contract-type"
    },
    {
      text: "قاعده شرطی فیلد الحاقیه و نمایش مشروط قالب: فیلد 'درخواست، الحاقیه است؟' در تمامی قراردادها (حتی تهاتر) نمایش داده می‌شود، اما فیلد 'آیا قرارداد قالب‌دار است؟' در قراردادهای تهاتری مخفی شده و مقدار آن Null می‌گردد.",
      targetId: "req-contract-type"
    },
    {
      text: "الزامی بودن فیلدها: تمامی فیلدهای فرم افزودن اطلاعات اولیه طرف قرارداد الزامی هستند.",
      targetId: "party-modal-content"
    }
  ];

  return (
    <div className="flex flex-col gap-4 text-gray-700 w-full max-w-7xl mx-auto xl:mr-0 pl-16 pb-24">
      
      {/* Breadcrumb / Title Bar */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 py-3 flex items-center">
        <span className="text-gray-800 text-sm">
          <EditableText isTestMode={isTestMode} defaultText="درخواست انعقاد قرارداد" /> <span className="text-gray-400 mx-1">›</span> <EditableText isTestMode={isTestMode} defaultText="ثبت درخواست قرارداد" />
        </span>
      </div>

      <div className="bg-[#f0f0f0] border border-gray-200 rounded-sm shadow-sm p-3">
        
        {/* Main Content Layout */}
        <div className="flex flex-col xl:flex-row gap-3">
          
          {/* Right Area (Tabs & Form) - Physically rendered first in DOM, so in RTL it's on the right */}
          <div className="w-full xl:w-[75%] flex flex-col gap-0 border border-gray-300 rounded shadow-sm bg-white overflow-hidden z-10">
            {/* Tabs */}
            <div className="flex border-b border-gray-300 bg-[#f9f9f9]">
              <div className="px-6 py-2 border-l border-b-2 border-b-[#b90000] bg-white font-bold text-xs text-gray-800 inline-flex items-end">
                <EditableText isTestMode={isTestMode} defaultText="ثبت اطلاعات" />
              </div>
            </div>

            <div className="p-4" style={{ minHeight: '600px' }}>
              {/* Pink Warning Banner or Barter Specific Warning Info Box */}
              {!isBarterContract ? (
                <div className="bg-[#e79292] text-white px-4 py-2 border border-[#d27575] text-center rounded-sm text-xs font-semibold mb-6">
                  <span className="drop-shadow-sm text-[#501010]"><EditableText isTestMode={isTestMode} defaultText="احتراماً به استحضار می‌رساند قراردادهایی که متولی خرید آن‌ها(خرید کالا و خدمات عمومی) بر عهده تیم تدارکات هلدینگ می‌باشد می‌بایست صرفا توسط آن تیم پیگیری و در سامانه انعقاد قرارداد ثبت گردد" /></span>
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-950 border border-amber-300 p-4 rounded-sm text-xs md:text-sm font-semibold mb-6 leading-relaxed shadow-sm">
                  <div className="text-[#b90000] mb-2 font-bold flex items-center gap-1.5">
                    💡 جهت بررسی صورتجلسات تهاتر بارگذاری اسناد ذیل ضروری است:
                  </div>
                  <ul className="list-decimal list-inside space-y-1.5 pr-2 text-gray-800">
                    <li>قرارداد/صورتحساب/ فاکتور/چک مورد تهاتر</li>
                    <li><EditableText isTestMode={isTestMode} defaultText="قرارداد فروش" /></li>
                    <li><EditableText isTestMode={isTestMode} defaultText="فایل ورد تهاتر" /></li>
                  </ul>
                </div>
              )}

              {/* Top Full Width Fields */}
              <div className="flex flex-col mb-4 xl:w-[70%] text-[11px] xl:text-[13px]">
                <FieldRow id="req-is-addendum" label={<EditableText isTestMode={isTestMode} defaultText="درخواست، الحاقیه است؟:" />} required hasValue={isAddendum !== null} labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="req_is_addendum" 
                        checked={isAddendum === true}
                        onChange={() => {
                          setIsAddendum(true);
                          setHasTemplate(false);
                        }} 
                        className="w-[14px] h-[14px] text-[#b90000] focus:ring-[#b90000] border-gray-300" 
                      />
                      <span className="text-gray-700 text-sm"><EditableText isTestMode={isTestMode} defaultText="بله" /></span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="req_is_addendum" 
                        checked={isAddendum === false}
                        onChange={() => setIsAddendum(false)} 
                        className="w-[14px] h-[14px] text-[#b90000] focus:ring-[#b90000] border-gray-300" 
                      />
                      <span className="text-gray-700 text-sm"><EditableText isTestMode={isTestMode} defaultText="خیر" /></span>
                    </label>
                  </div>
                </FieldRow>

                {!isBarterContract && (
                  <div className="mt-1">
                    <FieldRow id="req-is-template" label={<EditableText isTestMode={isTestMode} defaultText="آیا قرارداد قالب دار است؟:" />} required hasValue={hasTemplate !== null} labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]">
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="req_has_template" 
                            checked={hasTemplate === true}
                            onChange={() => {
                              setHasTemplate(true);
                              setIsAddendum(false);
                            }} 
                            className="w-[14px] h-[14px] text-[#b90000] focus:ring-[#b90000] border-gray-300" 
                          />
                          <span className="text-gray-700 text-sm"><EditableText isTestMode={isTestMode} defaultText="بله" /></span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="req_has_template" 
                            checked={hasTemplate === false}
                            onChange={() => setHasTemplate(false)} 
                            className="w-[14px] h-[14px] text-[#b90000] focus:ring-[#b90000] border-gray-300" 
                          />
                          <span className="text-gray-700 text-sm"><EditableText isTestMode={isTestMode} defaultText="خیر" /></span>
                        </label>
                      </div>
                    </FieldRow>
                  </div>
                )}
                <div className="mt-2">
                  <FieldRow id="req-contract-type" label={<EditableText isTestMode={isTestMode} defaultText="نوع قرارداد:" />} required hasValue={!!contractType} labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]">
                    <select 
                      className="w-full xl:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner"
                      value={contractType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContractType(val);
                        if (val === "تهاتر با نمایندگی فروش و خدمات پس از فروش" || val === "تهاتر تامین کنندگان و پیمانکاران") {
                          setHasTemplate(null);
                        }
                      }}
                    >
                      <option value="">- لطفاً انتخاب کنید...</option>
                      <option value="خدمات">خدمات</option>
                      <option value="کالا">کالا</option>
                      <option value="کالا و خدمات">کالا و خدمات</option>
                      <option value="تهاتر با نمایندگی فروش و خدمات پس از فروش">تهاتر با نمایندگی فروش و خدمات پس از فروش</option>
                      <option value="تهاتر تامین کنندگان و پیمانکاران">تهاتر تامین کنندگان و پیمانکاران</option>
                    </select>
                  </FieldRow>
                </div>
                <div>
                  <FieldRow id="req-company" label={<EditableText isTestMode={isTestMode} defaultText="قرارداد مربوط به کدام شرکت است؟:" />} required hasValue={!!company} labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]">
                    <select 
                      className="w-full xl:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    >
                      <option value="">- لطفاً انتخاب کنید...</option>
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
                  </FieldRow>
                </div>
              </div>

              {/* 2 Column Form Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 xl:gap-x-8 text-[11px] xl:text-[13px] mt-6">
                
                {/* RTL Column 1 (Physically Right) */}
                <div className="flex flex-col">
                  <FieldRow id="req-subject" label={<EditableText isTestMode={isTestMode} defaultText="موضوع قرارداد:" />} required hasValue={!!subject}>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 shadow-inner"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </FieldRow>
                  <FieldRow label={<EditableText isTestMode={isTestMode} defaultText="زمان شروع مشخص ندارد:" />}>
                    <input 
                      type="checkbox" 
                      className="w-[13px] h-[13px] rounded-sm cursor-pointer" 
                      checked={noStartDate}
                      onChange={(e) => setNoStartDate(e.target.checked)}
                    />
                  </FieldRow>
                  {!noStartDate && (
                    <FieldRow label={<EditableText isTestMode={isTestMode} defaultText="برنامه زمانبندی شروع:" />}>
                      <JalaliDatePicker value={startDate} onChange={setStartDate} />
                    </FieldRow>
                  )}
                  <FieldRow id="req-duration-indicator" label={<EditableText isTestMode={isTestMode} defaultText="مدت قرارداد به ماه:" />}>
                    <input 
                      type="text" 
                      readOnly 
                      className="w-full border border-gray-300 rounded-sm px-2 py-1 bg-gray-50 outline-none text-gray-700 shadow-sm font-mono font-bold text-center" 
                      value={calculatedMonths} 
                      placeholder="محاسبه خودکار..."
                    />
                  </FieldRow>
                  <FieldRow label={<EditableText isTestMode={isTestMode} defaultText="گزارش توجیه فنی دارد؟:" />}>
                    <input 
                      type="checkbox" 
                      className="w-[13px] h-[13px] rounded-sm cursor-pointer" 
                      checked={hasTechnicalReport} 
                      onChange={e => setHasTechnicalReport(e.target.checked)} 
                    />
                  </FieldRow>
                  
                  <FieldRowTop label={<EditableText isTestMode={isTestMode} defaultText="شرح درخواست:" />}>
                    <textarea 
                      className="w-full h-24 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 shadow-inner resize-none text-[11px]"
                      value={requestDescription}
                      onChange={e => setRequestDescription(e.target.value)}
                    ></textarea>
                  </FieldRowTop>
                  
                  {/* Attachments Section */}
                  <div className="mt-6 flex flex-col">
                    <FieldRow label={<EditableText isTestMode={isTestMode} defaultText="ضمائم قرارداد:" />}>
                      <div className="flex flex-col items-end w-full cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200">
                        <div className="flex items-center gap-1 group">
                          <span className="text-gray-800"><EditableText isTestMode={isTestMode} defaultText="فایل مربوطه را بارگذاری نمایید" /></span>
                          <Paperclip size={14} className="text-gray-500 transition-transform group-hover:scale-110" />
                        </div>
                      </div>
                    </FieldRow>
                    <FieldRow id="req-initial-attach" label={<EditableText isTestMode={isTestMode} defaultText="پیوست اولیه قرارداد:" />} required hasValue={initialAttachment}>
                      <div 
                        className="flex flex-col items-end w-full cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200 pb-1"
                        onClick={() => setInitialAttachment(true)}
                      >
                        <div className="flex items-center gap-1 group">
                          <span className="text-gray-800">{initialAttachment ? 'فایل بارگذاری شد' : 'فایل مربوطه را بارگذاری نمایید'}</span>
                          <Paperclip size={14} className={`transition-transform group-hover:scale-110 ${initialAttachment ? 'text-blue-500' : 'text-gray-500'}`} />
                        </div>
                      </div>
                    </FieldRow>
                    <FieldRow id="req-identity-attach" label={<EditableText isTestMode={isTestMode} defaultText="پیوست مدارک هویتی طرفین قرارداد:" />} required hasValue={identityAttachment}>
                      <div 
                        className="flex flex-col items-end w-full cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200 pb-1"
                        onClick={() => setIdentityAttachment(true)}
                      >
                        <div className="flex items-center gap-1 group">
                          <span className="text-gray-800">{identityAttachment ? 'فایل بارگذاری شد' : 'فایل مربوطه را بارگذاری نمایید'}</span>
                          <Paperclip size={14} className={`transition-transform group-hover:scale-110 ${identityAttachment ? 'text-blue-500' : 'text-gray-500'}`} />
                        </div>
                      </div>
                    </FieldRow>
                  </div>
                </div>

                {/* RTL Column 2 (Physically Left) */}
                <div className="flex flex-col">
                  <FieldRow id="req-representative" label={<EditableText isTestMode={isTestMode} defaultText="نماینده قرارداد:" />} required hasValue={!!representative}>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 shadow-inner"
                      value={representative}
                      onChange={(e) => setRepresentative(e.target.value)}
                    />
                  </FieldRow>
                  <FieldRow label={<EditableText isTestMode={isTestMode} defaultText="زمان پایان مشخص ندارد:" />}>
                    <input 
                      type="checkbox" 
                      className="w-[13px] h-[13px] rounded-sm cursor-pointer" 
                      checked={noEndDate}
                      onChange={(e) => setNoEndDate(e.target.checked)}
                    />
                  </FieldRow>
                  {!noEndDate && (
                    <FieldRow label={<EditableText isTestMode={isTestMode} defaultText="برنامه زمانبندی پایان:" />}>
                      <JalaliDatePicker value={endDate} onChange={setEndDate} />
                    </FieldRow>
                  )}
                  <FieldRow label={<EditableText isTestMode={isTestMode} defaultText="مدت قرارداد به روز:" />}>
                    <input 
                      type="text" 
                      readOnly 
                      className="w-full border border-gray-300 rounded-sm px-2 py-1 bg-gray-50 outline-none text-gray-700 shadow-sm font-mono font-bold text-center" 
                      value={calculatedDays} 
                      placeholder="محاسبه خودکار..."
                    />
                  </FieldRow>
                  <FieldRow label={<EditableText isTestMode={isTestMode} defaultText="شرایط خصوصی دارد؟:" />}>
                    <input 
                      type="checkbox" 
                      className="w-[13px] h-[13px] rounded-sm cursor-pointer" 
                      checked={hasPrivateConditions} 
                      onChange={e => setHasPrivateConditions(e.target.checked)} 
                    />
                  </FieldRow>
                  
                  <FieldRowTop label={<EditableText isTestMode={isTestMode} defaultText="توضیحات شرایط خصوصی:" />}>
                    <textarea 
                      className="w-full h-24 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 shadow-inner resize-none text-[11px]"
                      value={privateConditionsDesc}
                      onChange={e => setPrivateConditionsDesc(e.target.value)}
                    ></textarea>
                  </FieldRowTop>
                </div>
              </div>

              {/* اطلاعات اولیه طرف قرارداد Accordion */}
              <div id="party-info-accordion-barter" className="mt-4 border border-gray-300 shadow-sm rounded overflow-hidden animate-fade-in">
                <div 
                  className="bg-[#dcdcdc] flex items-center justify-between p-2 cursor-pointer font-bold border-b border-gray-300" 
                  onClick={() => setIsPartyInfoOpen(!isPartyInfoOpen)}
                >
                  <div className="flex items-center gap-2 text-[11px] xl:text-[13px] text-gray-700">
                    {isPartyInfoOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    <EditableText isTestMode={isTestMode} defaultText="اطلاعات اولیه طرف قرارداد" />
                  </div>
                </div>
                {isPartyInfoOpen && (
                  <div className="bg-[#f0f0f0]">
                    {parties.length === 0 ? (
                      <div className="p-5 flex items-center justify-center text-xs text-gray-600 border-b border-gray-300">
                        <EditableText isTestMode={isTestMode} defaultText="رکوردی یافت نشد" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto border-b border-gray-300">
                        <table className="w-full text-right border-collapse text-xs md:text-sm">
                          <thead>
                            <tr className="bg-[#eaeaea] border-b border-gray-300 text-gray-700 font-bold">
                              <th className="p-2.5"><EditableText isTestMode={isTestMode} defaultText="ردیف" /></th>
                              <th className="p-2.5"><EditableText isTestMode={isTestMode} defaultText="نوع طرف قرارداد" /></th>
                              <th className="p-2.5 text-left pl-6"><EditableText isTestMode={isTestMode} defaultText="عملیات" /></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {parties.map((p, idx) => (
                              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-2.5 font-mono">{idx + 1}</td>
                                <td className="p-2.5 font-medium">
                                  <div className="font-bold text-gray-800">{p.type}</div>
                                  {p.type === "حقیقی" && p.fullName && (
                                    <div className="mt-1 text-[11px] text-gray-600 bg-neutral-50 border border-gray-200 rounded p-2.5 space-y-1 max-w-xl">
                                      <div><span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="نام و نام خانوادگی:" /></span> {p.fullName}</div>
                                      {p.nationalId && <div><span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="کد ملی:" /></span> <span className="font-mono">{p.nationalId}</span></div>}
                                      {p.jobTitle && <div><span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="سمت سازمانی:" /></span> {p.jobTitle}</div>}
                                      {p.mobile && <div><span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="تلفن همراه:" /></span> <span className="font-mono">{p.mobile}</span></div>}
                                      {p.address && <div className="break-all"><span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="آدرس:" /></span> {p.address}</div>}
                                      {isBarterContract && (p.barterType || p.barterUntilDate || p.barterAmount || p.barterRelatedContract) && (
                                        <div className="mt-2 border-t border-gray-200 pt-1.5 space-y-1 text-teal-850 bg-teal-50/50 p-2 rounded">
                                          <div className="font-semibold text-teal-850 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                                            <EditableText isTestMode={isTestMode} defaultText="اطلاعات تهاتر:" />
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                            {p.barterType && <div><span className="font-medium text-gray-500"><EditableText isTestMode={isTestMode} defaultText="نوع تهاتر:" /></span> <span className="font-bold text-teal-800">{p.barterType}</span></div>}
                                            {p.barterUntilDate && <div><span className="font-medium text-gray-500"><EditableText isTestMode={isTestMode} defaultText="تا تاریخ:" /></span> <span className="font-mono text-teal-850">{p.barterUntilDate}</span></div>}
                                            {p.barterAmount && <div><span className="font-medium text-gray-500"><EditableText isTestMode={isTestMode} defaultText="مبلغ (ریال):" /></span> <span className="font-mono text-teal-850">{p.barterAmount}</span></div>}
                                            {p.barterRelatedContract && <div><span className="font-medium text-gray-500"><EditableText isTestMode={isTestMode} defaultText="شماره قرارداد مرتبط:" /></span> <span className="font-mono text-teal-850">{p.barterRelatedContract}</span></div>}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {p.type === "حقوقی" && p.orgName && (
                                    <div className="mt-1 text-[11px] text-gray-600 bg-neutral-50 border border-gray-200 rounded p-2.5 space-y-1 max-w-xl">
                                      <div><span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="نام سازمان:" /></span> {p.orgName}</div>
                                      {p.orgNationalId && <div><span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="شناسه ملی:" /></span> <span className="font-mono">{p.orgNationalId}</span></div>}
                                      {p.orgEconomicCode && <div><span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="کد اقتصادی:" /></span> <span className="font-mono">{p.orgEconomicCode}</span></div>}
                                      {p.orgRegNo && <div><span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="شماره ثبت:" /></span> <span className="font-mono">{p.orgRegNo}</span></div>}
                                      {p.orgPhone && <div><span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="شماره تماس ثابت:" /></span> <span className="font-mono">{p.orgPhone}</span></div>}
                                      {p.orgPostalCode && <div><span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="کد پستی:" /></span> <span className="font-mono">{p.orgPostalCode}</span></div>}
                                      {p.orgAddress && <div className="break-all"><span className="font-semibold text-gray-500"><EditableText isTestMode={isTestMode} defaultText="آدرس:" /></span> {p.orgAddress}</div>}
                                      {isBarterContract && (p.barterType || p.barterUntilDate || p.barterAmount || p.barterRelatedContract) && (
                                        <div className="mt-2 border-t border-gray-200 pt-1.5 space-y-1 text-teal-850 bg-teal-50/50 p-2 rounded">
                                          <div className="font-semibold text-teal-850 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                                            <EditableText isTestMode={isTestMode} defaultText="اطلاعات تهاتر:" />
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                            {p.barterType && <div><span className="font-medium text-gray-500"><EditableText isTestMode={isTestMode} defaultText="نوع تهاتر:" /></span> <span className="font-bold text-teal-800">{p.barterType}</span></div>}
                                            {p.barterUntilDate && <div><span className="font-medium text-gray-500"><EditableText isTestMode={isTestMode} defaultText="تا تاریخ:" /></span> <span className="font-mono text-teal-850">{p.barterUntilDate}</span></div>}
                                            {p.barterAmount && <div><span className="font-medium text-gray-500"><EditableText isTestMode={isTestMode} defaultText="مبلغ (ریال):" /></span> <span className="font-mono text-teal-850">{p.barterAmount}</span></div>}
                                            {p.barterRelatedContract && <div><span className="font-medium text-gray-500"><EditableText isTestMode={isTestMode} defaultText="شماره قرارداد مرتبط:" /></span> <span className="font-mono text-teal-850">{p.barterRelatedContract}</span></div>}
                                          </div>
                                        </div>
                                      )}
                                      {p.signers && p.signers.length > 0 && (
                                        <div className="mt-2 border-t border-gray-200 pt-1">
                                          <div className="font-semibold text-gray-700 mb-1"><EditableText isTestMode={isTestMode} defaultText="صاحبان امضا:" /></div>
                                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-600 font-mono">
                                            {p.signers.map((s, sidx) => (
                                              <div key={s.id} className="bg-white border border-gray-150 rounded px-1.5 py-0.5">
                                                {sidx + 1}. {s.fullName} ({s.position}) - {s.nationalId}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="p-2.5 text-left pl-6 align-top">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setParties(parties.filter(item => item.id !== p.id));
                                    }}
                                    className="text-red-500 hover:text-red-700 font-bold hover:underline"
                                  >
                                    <EditableText isTestMode={isTestMode} defaultText="حذف" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="p-2 flex justify-end">
                      <button 
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-1 hover:bg-gray-300 rounded text-gray-650 border border-transparent hover:border-gray-300 transition-colors flex items-center gap-1 text-xs font-bold"
                      >
                        <Plus size={16}/>
                        <span><EditableText isTestMode={isTestMode} defaultText="افزودن طرف قرارداد" /></span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Overlay for افزودن اطلاعات اولیه طرف قرارداد */}
              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity">
                  <div className={`bg-[#f8f9fa] border border-gray-300 rounded shadow-2xl flex flex-col transition-all duration-300 ${isMaximized ? 'w-[96vw] h-[93vh]' : 'w-full max-w-2xl max-h-[90vh]'}`}>
                    
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-neutral-50">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-gray-800">
                          <EditableText isTestMode={isTestMode} defaultText="افزودن اطلاعات اولیه طرف قرارداد" />
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Maximize Toggle */}
                        <button 
                          type="button" 
                          onClick={() => setIsMaximized(!isMaximized)}
                          className="text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
                          title={isMaximized ? "کوچک کردن" : "بزرگ کردن"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="10" y1="14" x2="3" y2="20"/></svg>
                        </button>
                        
                        {/* Close button */}
                        <button 
                          type="button" 
                          onClick={resetPartyModal}
                          className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
                          title="بستن"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Modal Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                      <div id="party-modal-content" className="bg-white border border-gray-200 rounded-sm p-6 shadow-xs space-y-4">
                        <FieldRow 
                          label={<EditableText isTestMode={isTestMode} defaultText="نوع طرف قرارداد:" />} 
                          required 
                          hasValue={!!tempPartyType} 
                          labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                        >
                          <select 
                            value={tempPartyType}
                            onChange={(e) => setTempPartyType(e.target.value)}
                            className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs"
                          >
                            <option value="">- لطفاً انتخاب کنید...</option>
                            <option value="-----">---------</option>
                            <option value="حقوقی">حقوقی</option>
                            <option value="حقیقی">حقیقی</option>
                          </select>
                        </FieldRow>
 
                        {tempPartyType === "حقیقی" && (
                          <div className="border-t border-gray-100 pt-4 space-y-3">
                            <FieldRow 
                              label={<EditableText isTestMode={isTestMode} defaultText="نام و نام خانوادگی:" />} 
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input 
                                type="text" 
                                required
                                value={tempFullName}
                                onChange={(e) => setTempFullName(e.target.value)}
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs"
                              />
                            </FieldRow>

                             {/* Barter Fields Placeholder */}


 
                            <FieldRow 
                              label={<EditableText isTestMode={isTestMode} defaultText="کد ملی:" />} 
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input 
                                type="text" 
                                required
                                value={tempNationalId}
                                onChange={(e) => setTempNationalId(e.target.value)}
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>
 
                            <FieldRow 
                              label={<EditableText isTestMode={isTestMode} defaultText="سمت سازمانی:" />} 
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input 
                                type="text" 
                                required
                                value={tempJobTitle}
                                onChange={(e) => setTempJobTitle(e.target.value)}
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs"
                              />
                            </FieldRow>
 
                            <FieldRow 
                              label={<EditableText isTestMode={isTestMode} defaultText="شماره تلفن همراه:" />} 
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input 
                                type="text" 
                                required
                                value={tempMobile}
                                onChange={(e) => setTempMobile(e.target.value)}
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>
 
                            <FieldRow 
                              label={<EditableText isTestMode={isTestMode} defaultText="آدرس :" />} 
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <textarea 
                                value={tempAddress}
                                required
                                onChange={(e) => setTempAddress(e.target.value)}
                                className="w-full h-16 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 bg-white shadow-inner text-xs resize-none"
                              />
                            </FieldRow>


                          </div>
                        )}

                        {tempPartyType === "حقوقی" && (
                          <div className="border-t border-gray-100 pt-4 space-y-3">
                            <FieldRow 
                              label={<EditableText isTestMode={isTestMode} defaultText="نام سازمان:" />} 
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input 
                                type="text" 
                                value={tempOrgName}
                                onChange={(e) => setTempOrgName(e.target.value)}
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs"
                              />
                            </FieldRow>

                            <FieldRow 
                              label={<EditableText isTestMode={isTestMode} defaultText="کد ملی:" />} 
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input 
                                type="text" 
                                value={tempOrgNationalId}
                                onChange={(e) => setTempOrgNationalId(e.target.value)}
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>

                            <FieldRow 
                              label={<EditableText isTestMode={isTestMode} defaultText="کد اقتصادی:" />} 
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input 
                                type="text" 
                                value={tempOrgEconomicCode}
                                onChange={(e) => setTempOrgEconomicCode(e.target.value)}
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>

                            <FieldRow 
                              label={<EditableText isTestMode={isTestMode} defaultText="شماره ثبت:" />} 
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input 
                                type="text" 
                                value={tempOrgRegNo}
                                onChange={(e) => setTempOrgRegNo(e.target.value)}
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>

                            <FieldRow 
                               label={<EditableText isTestMode={isTestMode} defaultText="شماره تماس ثابت:" />} 
                               labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input 
                                type="text" 
                                value={tempOrgPhone}
                                onChange={(e) => setTempOrgPhone(e.target.value)}
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>

                            <FieldRow 
                               label={<EditableText isTestMode={isTestMode} defaultText="کد پستی:" />} 
                               labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input 
                                type="text" 
                                value={tempOrgPostalCode}
                                onChange={(e) => setTempOrgPostalCode(e.target.value)}
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>

                            <FieldRow 
                              label={<EditableText isTestMode={isTestMode} defaultText="آدرس :" />} 
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <textarea 
                                value={tempOrgAddress}
                                onChange={(e) => setTempOrgAddress(e.target.value)}
                                className="w-full h-16 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 bg-white shadow-inner text-xs resize-none"
                              />
                            </FieldRow>



                            {/* صاحبان امضا Inner Frame */}
                            <div className="mt-4 border border-gray-300 shadow-sm rounded overflow-hidden">
                              <div 
                                className="bg-[#ccc] flex items-center justify-between p-2 cursor-pointer font-bold border-b border-gray-300 text-gray-800" 
                                onClick={() => setIsSignersAccordionOpen(!isSignersAccordionOpen)}
                              >
                                <div className="flex items-center gap-2 text-xs">
                                  {isSignersAccordionOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                                  <EditableText isTestMode={isTestMode} defaultText="صاحبان امضا" />
                                </div>
                              </div>
                              {isSignersAccordionOpen && (
                                <div className="bg-[#e2e2e2]">
                                  {tempSigners.length === 0 ? (
                                    <div className="p-4 flex items-center justify-center text-xs text-gray-600 border-b border-gray-300 bg-[#eaeaea]">
                                      <EditableText isTestMode={isTestMode} defaultText="رکوردی یافت نشد" />
                                    </div>
                                  ) : (
                                    <div className="overflow-x-auto border-b border-gray-300">
                                      <table className="w-full text-right border-collapse text-[11px] md:text-xs bg-white">
                                        <thead>
                                          <tr className="bg-[#eaeaea] border-b border-gray-300 text-gray-750 font-bold">
                                            <th className="p-2"><EditableText isTestMode={isTestMode} defaultText="ردیف" /></th>
                                            <th className="p-2"><EditableText isTestMode={isTestMode} defaultText="نام و نام خانوادگی" /></th>
                                            <th className="p-2"><EditableText isTestMode={isTestMode} defaultText="سمت" /></th>
                                            <th className="p-2"><EditableText isTestMode={isTestMode} defaultText="کد ملی" /></th>
                                            <th className="p-2"><EditableText isTestMode={isTestMode} defaultText="همراه" /></th>
                                            <th className="p-2 text-left pl-4"><EditableText isTestMode={isTestMode} defaultText="عملیات" /></th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-250">
                                          {tempSigners.map((sig, idx) => (
                                            <tr key={sig.id} className="hover:bg-gray-50 transition-colors">
                                              <td className="p-2 font-mono">{idx + 1}</td>
                                              <td className="p-2 font-medium">{sig.fullName}</td>
                                              <td className="p-2">{sig.position}</td>
                                              <td className="p-2 font-mono">{sig.nationalId}</td>
                                              <td className="p-2 font-mono">{sig.mobile}</td>
                                              <td className="p-2 text-left pl-4">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setTempSigners(tempSigners.filter(s => s.id !== sig.id));
                                                  }}
                                                  className="text-red-500 hover:text-red-700 font-bold"
                                                >
                                                  <EditableText isTestMode={isTestMode} defaultText="حذف" />
                                                </button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}

                                  {/* Signer creation area */}
                                  {isAddingSigner ? (
                                    <div className="bg-white border-b border-gray-300 p-4 space-y-3">
                                      <div className="text-xs font-bold text-gray-750 pb-1 border-b border-neutral-100"><EditableText isTestMode={isTestMode} defaultText="افزودن امضاکننده جدید" /></div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-[11px] text-gray-500 mb-1"><EditableText isTestMode={isTestMode} defaultText="نام و نام خانوادگی:" /></label>
                                          <input 
                                            type="text" 
                                            value={signerFullName}
                                            onChange={(e) => setSignerFullName(e.target.value)}
                                            className="w-full border border-gray-300 rounded-sm px-2 py-1 outline-none text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] text-gray-500 mb-1"><EditableText isTestMode={isTestMode} defaultText="سمت:" /></label>
                                          <input 
                                            type="text" 
                                            value={signerPosition}
                                            onChange={(e) => setSignerPosition(e.target.value)}
                                            className="w-full border border-gray-300 rounded-sm px-2 py-1 outline-none text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] text-gray-500 mb-1"><EditableText isTestMode={isTestMode} defaultText="کد ملی:" /></label>
                                          <input 
                                            type="text" 
                                            value={signerNationalId}
                                            onChange={(e) => setSignerNationalId(e.target.value)}
                                            className="w-full border border-gray-300 rounded-sm px-2 py-1 outline-none text-xs font-mono"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] text-gray-500 mb-1"><EditableText isTestMode={isTestMode} defaultText="تلفن همراه:" /></label>
                                          <input 
                                            type="text" 
                                            value={signerMobile}
                                            onChange={(e) => setSignerMobile(e.target.value)}
                                            className="w-full border border-gray-300 rounded-sm px-2 py-1 outline-none text-xs font-mono"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                                        <button 
                                          type="button"
                                          onClick={() => {
                                            setIsAddingSigner(false);
                                            setSignerFullName('');
                                            setSignerPosition('');
                                            setSignerNationalId('');
                                            setSignerMobile('');
                                          }}
                                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 text-xs font-bold transition-colors"
                                        >
                                          <EditableText isTestMode={isTestMode} defaultText="انصراف" />
                                        </button>
                                        <button 
                                          type="button"
                                          onClick={() => {
                                            if (signerFullName.trim()) {
                                              setTempSigners([
                                                ...tempSigners,
                                                {
                                                  id: Date.now(),
                                                  fullName: signerFullName.trim(),
                                                  position: signerPosition.trim(),
                                                  nationalId: signerNationalId.trim(),
                                                  mobile: signerMobile.trim()
                                                }
                                              ]);
                                              setIsAddingSigner(false);
                                              setSignerFullName('');
                                              setSignerPosition('');
                                              setSignerNationalId('');
                                              setSignerMobile('');
                                            }
                                          }}
                                          disabled={!signerFullName.trim()}
                                          className={`px-3 py-1 rounded text-white text-xs font-bold transition-colors ${
                                            signerFullName.trim() ? "bg-[#1e6b7b] hover:bg-[#154d58] cursor-pointer" : "bg-gray-350 cursor-not-allowed"
                                          }`}
                                        >
                                          <EditableText isTestMode={isTestMode} defaultText="تایید" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-1 px-2.5 flex justify-end">
                                      <button 
                                        type="button"
                                        onClick={() => setIsAddingSigner(true)}
                                        className="h-7 w-7 flex items-center justify-center hover:bg-neutral-300 rounded transition-colors text-gray-700 border border-transparent hover:border-gray-400"
                                      >
                                        <Plus size={16}/>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Modal Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-neutral-50 flex justify-start gap-3">
                      <button 
                        type="button"
                        onClick={resetPartyModal}
                        className="bg-[#1e6b7b] hover:bg-[#154d58] text-white px-6 py-2 rounded text-xs font-bold transition-colors"
                      >
                        <EditableText isTestMode={isTestMode} defaultText="انصراف" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          if (tempPartyType && tempPartyType !== "-----") {
                            setParties([
                              ...parties, 
                              { 
                                id: Date.now(), 
                                type: tempPartyType,
                                // حقیقی
                                fullName: tempPartyType === "حقیقی" ? tempFullName.trim() : undefined,
                                nationalId: tempPartyType === "حقیقی" ? tempNationalId.trim() : undefined,
                                jobTitle: tempPartyType === "حقیقی" ? tempJobTitle.trim() : undefined,
                                mobile: tempPartyType === "حقیقی" ? tempMobile.trim() : undefined,
                                address: tempPartyType === "حقیقی" ? tempAddress.trim() : undefined,
                                // حقوقی
                                orgName: tempPartyType === "حقوقی" ? tempOrgName.trim() : undefined,
                                orgNationalId: tempPartyType === "حقوقی" ? tempOrgNationalId.trim() : undefined,
                                orgEconomicCode: tempPartyType === "حقوقی" ? tempOrgEconomicCode.trim() : undefined,
                                orgRegNo: tempPartyType === "حقوقی" ? tempOrgRegNo.trim() : undefined,
                                orgPhone: tempPartyType === "حقوقی" ? tempOrgPhone.trim() : undefined,
                                orgPostalCode: tempPartyType === "حقوقی" ? tempOrgPostalCode.trim() : undefined,
                                orgAddress: tempPartyType === "حقوقی" ? tempOrgAddress.trim() : undefined,
                                signers: tempPartyType === "حقوقی" ? tempSigners : [],
                                // تهاتر
                                barterType: isBarterContract ? tempBarterType : undefined,
                                barterUntilDate: isBarterContract ? tempBarterUntilDate : undefined,
                                barterAmount: isBarterContract ? tempBarterAmount : undefined,
                                barterRelatedContract: isBarterContract ? tempBarterRelatedContract : undefined,
                              }
                            ]);
                            resetPartyModal();
                          }
                        }}
                        disabled={
                          !tempPartyType || 
                          tempPartyType === "-----" || 
                          (tempPartyType === "حقوقی" && !tempOrgName.trim()) || 
                          (tempPartyType === "حقیقی" && !tempFullName.trim())
                        }
                        className={`px-6 py-2 rounded text-white text-xs font-bold transition-colors ${
                          tempPartyType && 
                          tempPartyType !== "-----" && 
                          ((tempPartyType === "حقوقی" && tempOrgName.trim()) || (tempPartyType === "حقیقی" && tempFullName.trim()))
                            ? 'bg-[#1e6b7b] hover:bg-[#154d58] cursor-pointer' 
                            : 'bg-gray-300 cursor-not-allowed text-gray-500'
                        }`}
                      >
                        <EditableText isTestMode={isTestMode} defaultText="ذخیره" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions Form */}
              <div className="mt-8">
                <FieldRow label={<EditableText isTestMode={isTestMode} defaultText="آیا نیاز به بررسی مشاور می‌باشد؟:" />} labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[180px_1fr]">
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="needs_consultant" className="w-[14px] h-[14px]" />
                      <span className="text-gray-800"><EditableText isTestMode={isTestMode} defaultText="بله" /></span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="needs_consultant" className="w-[14px] h-[14px]" />
                      <span className="text-gray-800"><EditableText isTestMode={isTestMode} defaultText="خیر" /></span>
                    </label>
                  </div>
                </FieldRow>
              </div>

              <div className="mt-8 flex justify-center">
                <button className="bg-[#b90000] hover:bg-[#a00000] text-white px-8 py-2 rounded font-bold shadow-sm border border-red-900 transition-colors text-xs">
                  <EditableText isTestMode={isTestMode} defaultText="لغو درخواست" />
                </button>
              </div>

            </div>
          </div>

          {/* Left Panel (الزامات کلیدی) */}
          <div className="w-full xl:w-[25%] flex flex-col border border-gray-300 rounded shadow-sm bg-white h-fit overflow-hidden">
            <div className="bg-gradient-to-b from-[#f9f9f9] to-[#eaeaea] flex items-center justify-between p-2 font-bold border-b border-gray-300 text-xs text-gray-800 cursor-default">
              <div className="flex items-center gap-2">
                <ChevronDown size={16}/>
                <EditableText isTestMode={isTestMode} defaultText="الزامات کلیدی" />
              </div>
            </div>
            <div className="p-5 bg-white text-[11px] xl:text-[12px] text-gray-800 leading-relaxed font-semibold">
              <ul className="flex flex-col gap-5">
                {[
                  "نوع قرارداد در هنگام اعلام درخواست به واحد حقوقی تعریف شود",
                  "درصورت وجود قالب استاندارد از آن استفاده شود",
                  "نام افراد و یا سازمان‌های طرف قرارداد به‌صورت کامل بیان شود",
                  "موضوع قرارداد به‌صورت کامل بیان شود",
                  "اطلاعات عمومی قرارداد به‌صورت کامل بیان شود",
                  "خرید کالا و خدمات در گروه متوسط به بالا الزام به بستن قرارداد دارد",
                  "خرید خدمات الزام به بستن قرارداد دارد",
                  "در صورت وجود کمیسیون معاملات، تمامی مستندات مربوطه (مانند صورت‌جلسه، فرم‌های مربوطه) در بخش ضمایم قرارداد ضمیمه شود",
                  "در صورت حقوقی بودن طرفین قرارداد، باید تصویر روزنامه رسمی در مدارک هویتی طرفین قرارداد ضمیمه گردد",
                  "در صورت حقیقی بودن طرفین قرارداد، باید تصویر کارت ملی در مدارک هویتی طرفین قرارداد ضمیمه گردد",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#a80000] font-bold text-[16px] leading-none shrink-0" style={{ fontFamily: 'Times New Roman' }}>★</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Bizagi Technical Notes */}
      <BizagiDevNotes notes={requestNotes} isTestMode={isTestMode} onAction={(id) => {
        if (id === "party-modal-content") {
            setIsModalOpen(true);
            setTimeout(() => {
                const el = document.getElementById(id);                
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.classList.add('ring-4', 'ring-[#b90000]', 'ring-offset-2', 'bg-red-50', 'scale-[1.01]');
                  setTimeout(() => {
                    el.classList.remove('ring-4', 'ring-[#b90000]', 'ring-offset-2', 'bg-red-50', 'scale-[1.01]');
                  }, 2000);
                }
            }, 100);
        }
      }} />
    </div>
  )
}

export default function App() {
  const [activeForm, setActiveForm] = useState<'status' | 'request' | 'review' | 'legalReview' | 'financeReview' | 'finManagerReview' | 'holdingFinManagerReview' | 'reviewCopy' | 'legalSummary' | 'guide' | 'supplierReview'>(() => {
    const saved = localStorage.getItem('app_activeForm');
    return (saved as 'status' | 'request' | 'review' | 'legalReview' | 'financeReview' | 'finManagerReview' | 'holdingFinManagerReview' | 'reviewCopy' | 'legalSummary' | 'guide' | 'supplierReview') || 'request';
  });
  const [contractType, setContractType] = useState<string>(() => localStorage.getItem('app_contractType') || 'خرید کالا و خدمات');
  const [isAddendum, setIsAddendum] = useState<boolean | null>(() => {
    const saved = localStorage.getItem('app_isAddendum');
    return saved === 'true' ? true : (saved === 'false' ? false : false);
  });
  const [hasTemplate, setHasTemplate] = useState<boolean | null>(() => {
    const saved = localStorage.getItem('app_hasTemplate');
    return saved === 'true' ? true : (saved === 'false' ? false : false);
  });
  const [company, setCompany] = useState<string>(() => localStorage.getItem('app_company') || 'آرین موتور تابان');
  const [subject, setSubject] = useState<string>(() => localStorage.getItem('app_subject') || 'تهاتر نمایندگی');
  const [representative, setRepresentative] = useState<string>(() => localStorage.getItem('app_representative') || '');
  const [noStartDate, setNoStartDate] = useState<boolean>(() => localStorage.getItem('app_noStartDate') !== 'false');
  const [noEndDate, setNoEndDate] = useState<boolean>(() => localStorage.getItem('app_noEndDate') !== 'false');
  const [startDate, setStartDate] = useState<string>(() => localStorage.getItem('app_startDate') || '');
  const [endDate, setEndDate] = useState<string>(() => localStorage.getItem('app_endDate') || '');
  const [hasTechnicalReport, setHasTechnicalReport] = useState<boolean>(() => localStorage.getItem('app_hasTechnicalReport') === 'true');
  const [hasPrivateConditions, setHasPrivateConditions] = useState<boolean>(() => localStorage.getItem('app_hasPrivateConditions') === 'true');
  const [requestDescription, setRequestDescription] = useState<string>(() => localStorage.getItem('app_requestDescription') || '');
  const [privateConditionsDesc, setPrivateConditionsDesc] = useState<string>(() => localStorage.getItem('app_privateConditionsDesc') || '');
  const [initialAttachment, setInitialAttachment] = useState<boolean>(() => localStorage.getItem('app_initialAttachment') === 'true');
  const [identityAttachment, setIdentityAttachment] = useState<boolean>(() => localStorage.getItem('app_identityAttachment') === 'true');
  
  const [tempSigners, setTempSigners] = useState<{
    id: number;
    fullName: string;
    position: string;
    nationalId: string;
    mobile: string;
  }[]>([]);
  
  const [parties, setParties] = useState<any[]>(() => {
    const saved = localStorage.getItem('app_parties');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 1,
        type: 'حقوقی',
        orgName: 'نمایندگی 258',
        orgNationalId: '02205522568',
        orgEconomicCode: '035656569656',
        orgRegNo: '032396522',
        orgPostalCode: '0323564161',
        mobile: '',
        orgPhone: '03232645113',
        orgAddress: 'تهران-الله یاری',
        signers: []
      }
    ];
  });

  const [isTestMode, setIsTestMode] = useState<boolean>(() => {
    return localStorage.getItem('app_isTestMode') === 'true';
  });

  const [isNavAccordionOpen, setIsNavAccordionOpen] = useState(true);

  const partiesStr = JSON.stringify(parties);

  useEffect(() => {
    localStorage.setItem('app_contractType', contractType || '');
    localStorage.setItem('app_isAddendum', isAddendum === null ? '' : isAddendum.toString());
    localStorage.setItem('app_hasTemplate', hasTemplate === null ? '' : hasTemplate.toString());
    localStorage.setItem('app_company', company || '');
    localStorage.setItem('app_subject', subject || '');
    localStorage.setItem('app_representative', representative || '');
    localStorage.setItem('app_noStartDate', noStartDate.toString());
    localStorage.setItem('app_noEndDate', noEndDate.toString());
    localStorage.setItem('app_startDate', startDate || '');
    localStorage.setItem('app_endDate', endDate || '');
    localStorage.setItem('app_hasTechnicalReport', hasTechnicalReport.toString());
    localStorage.setItem('app_hasPrivateConditions', hasPrivateConditions.toString());
    localStorage.setItem('app_requestDescription', requestDescription || '');
    localStorage.setItem('app_privateConditionsDesc', privateConditionsDesc || '');
    localStorage.setItem('app_initialAttachment', initialAttachment.toString());
    localStorage.setItem('app_identityAttachment', identityAttachment.toString());
    localStorage.setItem('app_parties', partiesStr);
  }, [
    contractType, isAddendum, hasTemplate, company, subject, representative,
    noStartDate, noEndDate, startDate, endDate, hasTechnicalReport, hasPrivateConditions,
    requestDescription, privateConditionsDesc, initialAttachment, identityAttachment, partiesStr
  ]);

  const handleSetTestMode = (val: boolean) => {
    setIsTestMode(val);
    localStorage.setItem('app_isTestMode', val.toString());
  };

  const handleSetActiveForm = (val: 'status' | 'request' | 'review' | 'legalReview' | 'financeReview' | 'finManagerReview' | 'holdingFinManagerReview' | 'reviewCopy' | 'legalSummary' | 'guide' | 'supplierReview') => {
    setActiveForm(val);
    localStorage.setItem('app_activeForm', val);
  };

  return (
    <TestModeContext.Provider value={{ isTestMode, setIsTestMode: handleSetTestMode }}>
      <div className="min-h-screen bg-[#e8e9ea] flex flex-col rtl font-sans" dir="rtl">
      {/* Header bar mapping */}
      <div className="w-full bg-[#297c83] text-white py-2 px-4 flex justify-between items-center shadow-md z-30">
        <h1 className="text-sm font-bold">
          <EditableText isTestMode={isTestMode} defaultText="درخواست انعقاد قرارداد" />
        </h1>
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
      {/* Sidebar Navigation */}
      <div className={`${isNavAccordionOpen ? 'w-56' : 'w-16'} bg-[#f8f9fa] border-l border-gray-300 shadow-sm shrink-0 relative z-20 hidden md:flex transition-all duration-300`}>
        <div className="flex-1 flex flex-col gap-2 p-4 pt-10 overflow-y-auto overflow-x-hidden custom-scrollbar pb-24">
          {isNavAccordionOpen && (
            <>
              <div className="flex items-center justify-center gap-2 mb-3 px-2 pb-2 border-b border-gray-300">
                <div className="w-2 h-2 rounded-full bg-[#b90000]"></div>
                <span className="text-[16px] font-bold text-gray-800 text-center tracking-tight">لیست فرمها</span>
              </div>
            <button
              onClick={() => handleSetActiveForm('status')}
              className={`px-4 py-3 text-right rounded text-sm transition-colors ${
                activeForm === 'status' 
                  ? 'bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold' 
                  : 'hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent'
              }`}
            >
              <EditableText isTestMode={isTestMode} defaultText="تعیین وضعیت قرارداد" />
            </button>
            
            <button
              onClick={() => handleSetActiveForm('request')}
              className={`px-4 py-3 text-right rounded text-sm transition-colors ${
                activeForm === 'request' 
                  ? 'bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold' 
                  : 'hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent'
              }`}
            >
              <EditableText isTestMode={isTestMode} defaultText="ثبت درخواست قرارداد" />
            </button>
            
            <button
              onClick={() => handleSetActiveForm('review')}
              className={`px-4 py-3 text-right rounded text-sm transition-colors ${
                activeForm === 'review' 
                  ? 'bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold' 
                  : 'hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent'
              }`}
            >
              <EditableText isTestMode={isTestMode} defaultText="بررسی درخواست توسط ..." />
            </button>

            <button
              onClick={() => handleSetActiveForm('legalReview')}
              className={`px-4 py-3 text-right rounded text-sm transition-colors ${
                activeForm === 'legalReview' 
                  ? 'bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold' 
                  : 'hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent'
              }`}
            >
              <EditableText isTestMode={isTestMode} defaultText="بررسی قرارداد در حقوقی" />
            </button>

            <button
              onClick={() => handleSetActiveForm('financeReview')}
              className={`px-4 py-3 text-right rounded text-sm transition-colors ${
                activeForm === 'financeReview' 
                  ? 'bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold' 
                  : 'hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent'
              }`}
            >
              <EditableText isTestMode={isTestMode} defaultText="بررسی قرارداد توسط کارشناس مالی" />
            </button>

            <button
              onClick={() => handleSetActiveForm('reviewCopy')}
              className={`px-4 py-3 text-right rounded text-sm transition-colors ${
                activeForm === 'reviewCopy' 
                  ? 'bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold' 
                  : 'hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent'
              }`}
            >
              <EditableText isTestMode={isTestMode} defaultText="بررسی درخواست توسط ... (کپی)" />
            </button>
            <button
              onClick={() => handleSetActiveForm('finManagerReview')}
              className={`px-4 py-3 text-right rounded text-sm transition-colors ${
                activeForm === 'finManagerReview' 
                  ? 'bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold' 
                  : 'hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent'
              }`}
            >
              <EditableText isTestMode={isTestMode} defaultText="بررسی قرارداد توسط مدیر مالی" />
            </button>

            <button
              onClick={() => handleSetActiveForm('holdingFinManagerReview')}
              className={`px-4 py-3 text-right rounded text-sm transition-colors ${
                activeForm === 'holdingFinManagerReview' 
                  ? 'bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold' 
                  : 'hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent'
              }`}
            >
              <EditableText isTestMode={isTestMode} defaultText="بررسی قرارداد توسط مدیر مالی (هلدینگ)" />
            </button>

            <button
              onClick={() => handleSetActiveForm('legalSummary')}
              className={`px-4 py-3 text-right rounded text-sm transition-colors ${
                activeForm === 'legalSummary' 
                  ? 'bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold' 
                  : 'hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent'
              }`}
            >
              <EditableText isTestMode={isTestMode} defaultText="جمع بندی قرارداد در حقوقی" />
            </button>

            <button
              onClick={() => handleSetActiveForm('supplierReview')}
              className={`px-4 py-3 text-right rounded text-sm transition-colors ${
                activeForm === 'supplierReview' 
                  ? 'bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold' 
                  : 'hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent'
              }`}
            >
              <EditableText isTestMode={isTestMode} defaultText="بررسی قرارداد توسط تامین کننده/متقاضی" />
            </button>
          </>
        )}
        
        {isNavAccordionOpen && (
          <div className="mt-auto pt-4 border-t border-gray-300 text-center text-[10px] text-gray-500 font-medium">
            <p className="font-bold"><EditableText isTestMode={isTestMode} defaultText="طراحی و توسعه مهربد عدیلی" /></p>
            <p>Contract Conclusion LE-01-3-1</p>
            
            {isTestMode && (
              <button
                onClick={() => handleSetActiveForm('guide')}
                className={`mt-3 w-full px-2 py-1.5 rounded text-[11px] transition-all border flex items-center justify-center gap-2 ${
                  activeForm === 'guide' 
                    ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-sm' 
                    : 'bg-amber-50/50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <BookOpen size={12} />
                <span><EditableText isTestMode={isTestMode} defaultText="راهنمای راهبری" /></span>
              </button>
            )}
          </div>
        )}
        </div>
      </div>

      <button
          onClick={() => setIsNavAccordionOpen(!isNavAccordionOpen)}
          className="absolute -left-3 top-24 flex items-center justify-center w-6 h-6 bg-white hover:bg-gray-50 rounded-full border border-gray-300 text-gray-400 hover:text-[#b90000] transition-all shadow-sm z-30 group"
          title={isNavAccordionOpen ? "بستن منو" : "بازکردن منو"}
        >
          {isNavAccordionOpen ? <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />}
        </button>

      {/* Main Content Area */}
      <div className="flex-1 h-screen overflow-y-auto relative">
        <div className="p-4 md:p-8 pb-32">
          
          {/* Mobile Navigation Dropdown */}
          <div className="md:hidden mb-4">
             <select 
               className="w-full p-2 border border-gray-300 rounded shadow-sm bg-white font-bold text-gray-700"
               value={activeForm}
               onChange={(e) => handleSetActiveForm(e.target.value as 'status' | 'request' | 'review' | 'legalReview' | 'financeReview' | 'finManagerReview' | 'holdingFinManagerReview' | 'reviewCopy' | 'legalSummary' | 'guide' | 'supplierReview')}
             >
               <option value="status">تعیین وضعیت قرارداد</option>
               <option value="request">ثبت درخواست قرارداد</option>
               <option value="review">بررسی درخواست توسط ...</option>
               <option value="legalReview">بررسی قرارداد در حقوقی</option>
               <option value="financeReview">بررسی قرارداد توسط کارشناس مالی</option>
               <option value="holdingFinManagerReview">بررسی قرارداد توسط مدیر مالی (هلدینگ)</option>
               <option value="reviewCopy">بررسی درخواست توسط ... (کپی)</option>
               <option value="legalSummary">جمع بندی قرارداد در حقوقی</option>
               <option value="supplierReview">بررسی قرارداد توسط تامین کننده/متقاضی</option>
               {isTestMode && <option value="guide">راهنمای راهبری</option>}
             </select>
          </div>

          {activeForm === 'status' ? (
            <FormStatus 
              contractType={contractType}
              setContractType={setContractType}
              isAddendum={isAddendum}
              setIsAddendum={setIsAddendum}
              hasTemplate={hasTemplate}
              setHasTemplate={setHasTemplate}
              isTestMode={isTestMode}
            />
          ) : activeForm === 'review' ? (
            <ManagerReviewForm 
              isTestMode={isTestMode} 
              contractType={contractType}
              setContractType={setContractType}
              isAddendum={isAddendum}
              setIsAddendum={setIsAddendum}
              hasTemplate={hasTemplate}
              setHasTemplate={setHasTemplate}
              company={company}
              setCompany={setCompany}
              subject={subject}
              setSubject={setSubject}
              representative={representative}
              setRepresentative={setRepresentative}
              noStartDate={noStartDate}
              setNoStartDate={setNoStartDate}
              noEndDate={noEndDate}
              setNoEndDate={setNoEndDate}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              hasTechnicalReport={hasTechnicalReport}
              setHasTechnicalReport={setHasTechnicalReport}
              hasPrivateConditions={hasPrivateConditions}
              setHasPrivateConditions={setHasPrivateConditions}
              requestDescription={requestDescription}
              setRequestDescription={setRequestDescription}
              privateConditionsDesc={privateConditionsDesc}
              setPrivateConditionsDesc={setPrivateConditionsDesc}
              initialAttachment={initialAttachment}
              setInitialAttachment={setInitialAttachment}
              identityAttachment={identityAttachment}
              setIdentityAttachment={setIdentityAttachment}
              parties={parties}
              setParties={setParties}
            />
          ) : activeForm === 'legalReview' ? (
            <LegalReviewForm 
              isTestMode={isTestMode} 
              contractType={contractType}
              setContractType={setContractType}
              isAddendum={isAddendum}
              setIsAddendum={setIsAddendum}
              hasTemplate={hasTemplate}
              setHasTemplate={setHasTemplate}
              company={company}
              setCompany={setCompany}
              subject={subject}
              setSubject={setSubject}
              representative={representative}
              setRepresentative={setRepresentative}
              noStartDate={noStartDate}
              setNoStartDate={setNoStartDate}
              noEndDate={noEndDate}
              setNoEndDate={setNoEndDate}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              hasTechnicalReport={hasTechnicalReport}
              setHasTechnicalReport={setHasTechnicalReport}
              hasPrivateConditions={hasPrivateConditions}
              setHasPrivateConditions={setHasPrivateConditions}
              requestDescription={requestDescription}
              setRequestDescription={setRequestDescription}
              privateConditionsDesc={privateConditionsDesc}
              setPrivateConditionsDesc={setPrivateConditionsDesc}
              initialAttachment={initialAttachment}
              setInitialAttachment={setInitialAttachment}
              identityAttachment={identityAttachment}
              setIdentityAttachment={setIdentityAttachment}
              parties={parties}
              setParties={setParties}
            />
          ) : activeForm === 'finManagerReview' ? (
            <FinancialManagerReviewForm
              isTestMode={isTestMode}
              contractType={contractType}
              setContractType={setContractType}
              isAddendum={isAddendum}
              setIsAddendum={setIsAddendum}
              hasTemplate={hasTemplate}
              setHasTemplate={setHasTemplate}
              company={company}
              setCompany={setCompany}
              subject={subject}
              setSubject={setSubject}
              representative={representative}
              setRepresentative={setRepresentative}
              noStartDate={noStartDate}
              setNoStartDate={setNoStartDate}
              noEndDate={noEndDate}
              setNoEndDate={setNoEndDate}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              hasTechnicalReport={hasTechnicalReport}
              setHasTechnicalReport={setHasTechnicalReport}
              hasPrivateConditions={hasPrivateConditions}
              setHasPrivateConditions={setHasPrivateConditions}
              requestDescription={requestDescription}
              setRequestDescription={setRequestDescription}
              privateConditionsDesc={privateConditionsDesc}
              setPrivateConditionsDesc={setPrivateConditionsDesc}
              initialAttachment={initialAttachment}
              setInitialAttachment={setInitialAttachment}
              identityAttachment={identityAttachment}
              setIdentityAttachment={setIdentityAttachment}
              parties={parties}
              setParties={setParties}
            />
          ) : activeForm === 'holdingFinManagerReview' ? (
            <HoldingFinancialManagerReviewForm
              isTestMode={isTestMode}
              contractType={contractType}
              setContractType={setContractType}
              isAddendum={isAddendum}
              setIsAddendum={setIsAddendum}
              hasTemplate={hasTemplate}
              setHasTemplate={setHasTemplate}
              company={company}
              setCompany={setCompany}
              subject={subject}
              setSubject={setSubject}
              representative={representative}
              setRepresentative={setRepresentative}
              noStartDate={noStartDate}
              setNoStartDate={setNoStartDate}
              noEndDate={noEndDate}
              setNoEndDate={setNoEndDate}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              hasTechnicalReport={hasTechnicalReport}
              setHasTechnicalReport={setHasTechnicalReport}
              hasPrivateConditions={hasPrivateConditions}
              setHasPrivateConditions={setHasPrivateConditions}
              requestDescription={requestDescription}
              setRequestDescription={setRequestDescription}
              privateConditionsDesc={privateConditionsDesc}
              setPrivateConditionsDesc={setPrivateConditionsDesc}
              initialAttachment={initialAttachment}
              setInitialAttachment={setInitialAttachment}
              identityAttachment={identityAttachment}
              setIdentityAttachment={setIdentityAttachment}
              parties={parties}
              setParties={setParties}
            />
          ) : activeForm === 'financeReview' ? (
            <FinanceReviewForm 
              isTestMode={isTestMode} 
              contractType={contractType}
              setContractType={setContractType}
              isAddendum={isAddendum}
              setIsAddendum={setIsAddendum}
              hasTemplate={hasTemplate}
              setHasTemplate={setHasTemplate}
              company={company}
              setCompany={setCompany}
              subject={subject}
              setSubject={setSubject}
              representative={representative}
              setRepresentative={setRepresentative}
              noStartDate={noStartDate}
              setNoStartDate={setNoStartDate}
              noEndDate={noEndDate}
              setNoEndDate={setNoEndDate}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              hasTechnicalReport={hasTechnicalReport}
              setHasTechnicalReport={setHasTechnicalReport}
              hasPrivateConditions={hasPrivateConditions}
              setHasPrivateConditions={setHasPrivateConditions}
              requestDescription={requestDescription}
              setRequestDescription={setRequestDescription}
              privateConditionsDesc={privateConditionsDesc}
              setPrivateConditionsDesc={setPrivateConditionsDesc}
              initialAttachment={initialAttachment}
              setInitialAttachment={setInitialAttachment}
              identityAttachment={identityAttachment}
              setIdentityAttachment={setIdentityAttachment}
              parties={parties}
              setParties={setParties}
            />
          ) : activeForm === 'reviewCopy' ? (
            <ManagerReviewFormCopy 
              isTestMode={isTestMode} 
              contractType={contractType}
              setContractType={setContractType}
              isAddendum={isAddendum}
              setIsAddendum={setIsAddendum}
              hasTemplate={hasTemplate}
              setHasTemplate={setHasTemplate}
              company={company}
              setCompany={setCompany}
              subject={subject}
              setSubject={setSubject}
              representative={representative}
              setRepresentative={setRepresentative}
              noStartDate={noStartDate}
              setNoStartDate={setNoStartDate}
              noEndDate={noEndDate}
              setNoEndDate={setNoEndDate}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              hasTechnicalReport={hasTechnicalReport}
              setHasTechnicalReport={setHasTechnicalReport}
              hasPrivateConditions={hasPrivateConditions}
              setHasPrivateConditions={setHasPrivateConditions}
              requestDescription={requestDescription}
              setRequestDescription={setRequestDescription}
              privateConditionsDesc={privateConditionsDesc}
              setPrivateConditionsDesc={setPrivateConditionsDesc}
              initialAttachment={initialAttachment}
              setInitialAttachment={setInitialAttachment}
              identityAttachment={identityAttachment}
              setIdentityAttachment={setIdentityAttachment}
              parties={parties}
              setParties={setParties}
            />
          ) : activeForm === 'legalSummary' ? (
            <LegalSummaryForm
              isTestMode={isTestMode} 
              contractType={contractType}
              setContractType={setContractType}
              isAddendum={isAddendum}
              setIsAddendum={setIsAddendum}
              hasTemplate={hasTemplate}
              setHasTemplate={setHasTemplate}
              company={company}
              setCompany={setCompany}
              subject={subject}
              setSubject={setSubject}
              representative={representative}
              setRepresentative={setRepresentative}
              noStartDate={noStartDate}
              setNoStartDate={setNoStartDate}
              noEndDate={noEndDate}
              setNoEndDate={setNoEndDate}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              hasTechnicalReport={hasTechnicalReport}
              setHasTechnicalReport={setHasTechnicalReport}
              hasPrivateConditions={hasPrivateConditions}
              setHasPrivateConditions={setHasPrivateConditions}
              requestDescription={requestDescription}
              setRequestDescription={setRequestDescription}
              privateConditionsDesc={privateConditionsDesc}
              setPrivateConditionsDesc={setPrivateConditionsDesc}
              initialAttachment={initialAttachment}
              setInitialAttachment={setInitialAttachment}
              identityAttachment={identityAttachment}
              setIdentityAttachment={setIdentityAttachment}
              parties={parties}
              setParties={setParties}
              tempSigners={tempSigners}
              setTempSigners={setTempSigners}
            />
          ) : activeForm === 'supplierReview' ? (
            <SupplierReviewForm
              isTestMode={isTestMode}
              contractType={contractType}
              setContractType={setContractType}
              isAddendum={isAddendum}
              setIsAddendum={setIsAddendum}
              hasTemplate={hasTemplate}
              setHasTemplate={setHasTemplate}
              company={company}
              setCompany={setCompany}
              subject={subject}
              setSubject={setSubject}
              representative={representative}
              setRepresentative={setRepresentative}
              noStartDate={noStartDate}
              setNoStartDate={setNoStartDate}
              noEndDate={noEndDate}
              setNoEndDate={setNoEndDate}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              hasTechnicalReport={hasTechnicalReport}
              setHasTechnicalReport={setHasTechnicalReport}
              hasPrivateConditions={hasPrivateConditions}
              setHasPrivateConditions={setHasPrivateConditions}
              requestDescription={requestDescription}
              setRequestDescription={setRequestDescription}
              privateConditionsDesc={privateConditionsDesc}
              setPrivateConditionsDesc={setPrivateConditionsDesc}
              initialAttachment={initialAttachment}
              setInitialAttachment={setInitialAttachment}
              identityAttachment={identityAttachment}
              setIdentityAttachment={setIdentityAttachment}
              parties={parties}
              setParties={setParties}
            />
          ) : activeForm === 'guide' ? (
            <SoftwareGuide />
          ) : (
            <FormRequest 
              contractType={contractType}
              setContractType={setContractType}
              isAddendum={isAddendum}
              setIsAddendum={setIsAddendum}
              hasTemplate={hasTemplate}
              setHasTemplate={setHasTemplate}
              isTestMode={isTestMode}
              company={company}
              setCompany={setCompany}
              subject={subject}
              setSubject={setSubject}
              representative={representative}
              setRepresentative={setRepresentative}
              noStartDate={noStartDate}
              setNoStartDate={setNoStartDate}
              noEndDate={noEndDate}
              setNoEndDate={setNoEndDate}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              hasTechnicalReport={hasTechnicalReport}
              setHasTechnicalReport={setHasTechnicalReport}
              hasPrivateConditions={hasPrivateConditions}
              setHasPrivateConditions={setHasPrivateConditions}
              requestDescription={requestDescription}
              setRequestDescription={setRequestDescription}
              privateConditionsDesc={privateConditionsDesc}
              setPrivateConditionsDesc={setPrivateConditionsDesc}
              initialAttachment={initialAttachment}
              setInitialAttachment={setInitialAttachment}
              identityAttachment={identityAttachment}
              setIdentityAttachment={setIdentityAttachment}
              parties={parties}
              setParties={setParties}
              tempSigners={tempSigners}
              setTempSigners={setTempSigners}
            />
          )}
        </div>
      </div>
      </div>
        
        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 md:right-56 bg-white border-t border-gray-300 py-3 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.08)] z-20">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-8">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 shadow-sm transition-all hover:bg-red-100">
                <input 
                  type="checkbox" 
                  checked={isTestMode} 
                  onChange={(e) => handleSetTestMode(e.target.checked)} 
                  className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500 border-red-300" 
                />
                <span>ویرایش فرم (Bizagi Dev)</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button className="bg-[#297c83] hover:bg-[#1f6065] text-white px-8 py-2.5 rounded shadow-sm border border-[#1b5155] transition-colors text-[13px]">
                <EditableText isTestMode={isTestMode} defaultText="ذخیره" />
              </button>
              <button className="bg-[#297c83] hover:bg-[#1f6065] text-white px-8 py-2.5 rounded shadow-sm border border-[#1b5155] transition-colors text-[13px]">
                <EditableText isTestMode={isTestMode} defaultText="ارسال" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TestModeContext.Provider>
  );
}
