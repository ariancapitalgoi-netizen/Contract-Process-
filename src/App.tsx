/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  useState,
  useEffect,
  ReactNode,
  createContext,
  useContext,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Paperclip,
  Calendar,
  X,
  GripVertical,
  BookOpen,
  MousePointer2,
  ChevronRight,
  ChevronLeft,
  Trash2,
} from "lucide-react";
import { JalaliDatePicker } from "./components/JalaliDatePicker";
import { Reorder, useDragControls } from "motion/react";

function parseJalaliOrGregorian(
  str: string,
): { days: number; parts?: { y: number; m: number; d: number } } | null {
  if (!str) return null;
  // Convert Persian digits to English digits
  const cleaned = str
    .trim()
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
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
          const isLeap = ((((year - 474) % 128) + 474 + 38) * 31) % 128 < 31;
          days += isLeap ? 366 : 365;
        }
        // count days for months prior to m
        for (let month = 1; month < m; month++) {
          if (month <= 6) days += 31;
          else if (month <= 11) days += 30;
          else {
            const isLeap = ((((y - 474) % 128) + 474 + 38) * 31) % 128 < 31;
            days += isLeap ? 30 : 29;
          }
        }
        days += d;
        return { days, parts: { y, m, d } };
      } else {
        // Gregorian date path
        const dObj = new Date(y, m - 1, d);
        if (!isNaN(dObj.getTime())) {
          return {
            days: Math.floor(dObj.getTime() / (1000 * 60 * 60 * 24)),
            parts: { y, m, d },
          };
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
  if (!val) return "";
  // Convert Persian numbers to English if any
  let englishDigits = val.replace(/[۰-۹]/g, (d) =>
    "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString(),
  );
  // Remove all non-digit characters
  let digitsOnly = englishDigits.replace(/\D/g, "");
  if (!digitsOnly) return "";
  // Format with thousand separators
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getTomanHelper(rialStr: string) {
  if (!rialStr) return "";
  const cleanNumStr = rialStr.replace(/,/g, "");
  if (!cleanNumStr || isNaN(Number(cleanNumStr))) return "";
  const rialVal = parseInt(cleanNumStr, 10);
  const tomanVal = Math.floor(rialVal / 10);
  return `(معادل ${tomanVal.toLocaleString("fa-IR")} تومان)`;
}

import { FieldRow, FieldRowTop } from "./components/FormComponents";
import { ManagerReviewForm } from "./components/ManagerReviewForm";
import { LegalReviewForm } from "./components/LegalReviewForm";
import { FinanceReviewForm } from "./components/FinanceReviewForm";
import { FinancialManagerReviewForm } from "./components/FinancialManagerReviewForm";
import { HoldingFinancialManagerReviewForm } from "./components/HoldingFinancialManagerReviewForm";
import { LegalSummaryForm } from "./components/LegalSummaryForm";
import { SoftwareGuide } from "./components/SoftwareGuide";
import { SupplierReviewForm } from "./components/SupplierReviewForm";
import { DynamicFormFields } from "./components/DynamicFormFields";
import {
  TestModeContext,
  useTestMode,
  EditableText,
  DevNoteItem,
  BizagiDevNotes,
  DraggableField,
} from "./components/EditableText";
import { UI_OVERRIDES } from "./lib/ui-registry";

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
    const saved = localStorage.getItem("formStatus_order");
    return saved
      ? JSON.parse(saved)
      : ["contractType", "isAddendum", "hasTemplate"];
  });

  const handleOrderChange = (newOrder: string[]) => {
    setOrder(newOrder);
    localStorage.setItem("formStatus_order", JSON.stringify(newOrder));
  };

  const isBarterContract =
    typeof contractType === "string" && contractType.includes("تهاتر");

  const statusNotes: DevNoteItem[] = [
    {
      text: "قاعده شرطی فیلد الحاقیه و نمایش مشروط قالب: فیلد 'درخواست، الحاقیه است؟' در تمامی قراردادها (حتی تهاتر) نمایش داده می‌شود، اما فیلد 'آیا قرارداد قالب‌دار است؟' در قراردادهای تهاتری مخفی شده و مقدار آن Null می‌گردد.",
      targetId: "status-contract-type",
    },
  ];

  const fieldComponents: Record<string, ReactNode> = {
    contractType: (
      <FieldRow
        id="status-contract-type"
        label={<EditableText defaultText="نوع قرارداد:" />}
        required
        hasValue={!!contractType}
        labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]"
      >
        <select
          className="w-full xl:w-1/2 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner"
          value={contractType}
          onChange={(e) => {
            const val = e.target.value;
            setContractType(val);
            if (
              val === "تهاتر با نمایندگی فروش و خدمات پس از فروش" ||
              val === "تهاتر تامین کنندگان و پیمانکاران"
            ) {
              setHasTemplate(null);
            }
          }}
        >
          <option value="">- لطفاً انتخاب کنید...</option>
          <option value="خدمات">خدمات</option>
          <option value="کالا">کالا</option>
          <option value="کالا و خدمات">کالا و خدمات</option>
          <option value="تهاتر با نمایندگی فروش و خدمات پس از فروش">
            تهاتر با نمایندگی فروش و خدمات پس از فروش
          </option>
          <option value="تهاتر تامین کنندگان و پیمانکاران">
            تهاتر تامین کنندگان و پیمانکاران
          </option>
        </select>
      </FieldRow>
    ),
    isAddendum: (
      <FieldRow
        id="status-is-addendum"
        label={<EditableText defaultText="درخواست، الحاقیه است؟:" />}
        required
        hasValue={isAddendum !== null}
        labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]"
      >
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="is_addendum"
              checked={isAddendum === true}
              onChange={() => setIsAddendum(true)}
              className="w-[14px] h-[14px] text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-gray-700 text-sm">
              <EditableText defaultText="بله" />
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="is_addendum"
              checked={isAddendum === false}
              onChange={() => setIsAddendum(false)}
              className="w-[14px] h-[14px] text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-gray-700 text-sm">
              <EditableText defaultText="خیر" />
            </span>
          </label>
        </div>
      </FieldRow>
    ),
    hasTemplate: !isBarterContract ? (
      <FieldRow
        id="status-has-template"
        label={<EditableText defaultText="آیا قرارداد قالب دار است؟:" />}
        required
        hasValue={hasTemplate !== null}
        labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]"
      >
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="has_template"
              checked={hasTemplate === true}
              onChange={() => setHasTemplate(true)}
              className="w-[14px] h-[14px] text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-gray-700 text-sm">
              <EditableText defaultText="بله" />
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="has_template"
              checked={hasTemplate === false}
              onChange={() => setHasTemplate(false)}
              className="w-[14px] h-[14px] text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-gray-700 text-sm">
              <EditableText defaultText="خیر" />
            </span>
          </label>
        </div>
      </FieldRow>
    ) : null,
  };

  return (
    <div className="flex flex-col gap-4 text-gray-700 w-full max-w-4xl mx-auto xl:mr-0 pl-16">
      {/* Breadcrumb / Title Bar */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 py-3 flex items-center">
        <span className="text-gray-800 text-sm">
          <EditableText
            isTestMode={isTestMode}
            defaultText="درخواست انعقاد قرارداد"
          />{" "}
          <span className="text-gray-400 mx-1">›</span>{" "}
          <EditableText
            isTestMode={isTestMode}
            defaultText="تعیین وضعیت قرارداد"
          />
        </span>
      </div>

      {/* Form Body */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 pb-8">
        <Reorder.Group
          axis="y"
          values={order}
          onReorder={handleOrderChange}
          className="flex flex-col gap-6 w-full"
        >
          {order.map((id) => {
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
  const [tempPartyType, setTempPartyType] = useState<string>("");
  const [tempFullName, setTempFullName] = useState<string>("");
  const [tempNationalId, setTempNationalId] = useState<string>("");
  const [tempJobTitle, setTempJobTitle] = useState<string>("");
  const [tempMobile, setTempMobile] = useState<string>("");
  const [tempAddress, setTempAddress] = useState<string>("");

  // States for Organization (حقوقی)
  const [tempOrgName, setTempOrgName] = useState<string>("");
  const [tempOrgNationalId, setTempOrgNationalId] = useState<string>("");
  const [tempOrgEconomicCode, setTempOrgEconomicCode] = useState<string>("");
  const [tempOrgRegNo, setTempOrgRegNo] = useState<string>("");
  const [tempOrgPhone, setTempOrgPhone] = useState<string>("");
  const [tempOrgPostalCode, setTempOrgPostalCode] = useState<string>("");
  const [tempOrgAddress, setTempOrgAddress] = useState<string>("");

  // States for Barter fields under Barter contracts (تهاتر)
  const [tempBarterType, setTempBarterType] = useState<string>("");
  const [tempBarterUntilDate, setTempBarterUntilDate] = useState<string>("");
  const [tempBarterAmount, setTempBarterAmount] = useState<string>("");
  const [tempBarterRelatedContract, setTempBarterRelatedContract] =
    useState<string>("");

  // Signer states under organization (صاحبان امضا)
  const [isSignersAccordionOpen, setIsSignersAccordionOpen] = useState(true);
  const [isAddingSigner, setIsAddingSigner] = useState(false);
  const [signerFullName, setSignerFullName] = useState("");
  const [signerPosition, setSignerPosition] = useState("");
  const [signerNationalId, setSignerNationalId] = useState("");
  const [signerMobile, setSignerMobile] = useState("");

  const resetPartyModal = () => {
    setIsModalOpen(false);
    setTempPartyType("");
    setTempFullName("");
    setTempNationalId("");
    setTempJobTitle("");
    setTempMobile("");
    setTempAddress("");

    setTempOrgName("");
    setTempOrgNationalId("");
    setTempOrgEconomicCode("");
    setTempOrgRegNo("");
    setTempOrgPhone("");
    setTempOrgPostalCode("");
    setTempOrgAddress("");

    setTempBarterType("");
    setTempBarterUntilDate("");
    setTempBarterAmount("");
    setTempBarterRelatedContract("");

    setTempSigners([]);
    setIsAddingSigner(false);
    setSignerFullName("");
    setSignerPosition("");
    setSignerNationalId("");
    setSignerMobile("");
  };

  const isBarterContract =
    typeof contractType === "string" && contractType.includes("تهاتر");

  // Calculate duration relative to start and end date
  let calculatedMonths = "";
  let calculatedDays = "";

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
          const mStart =
            y1 * 12 + m1 + (d1 - 1) / (m1 <= 6 ? 31 : m1 <= 11 ? 30 : 29);
          const mEnd =
            y2 * 12 + m2 + (d2 - 1) / (m2 <= 6 ? 31 : m2 <= 11 ? 30 : 29);
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
      targetId: "req-contract-type",
    },
    {
      text: "قاعده شرطی فیلد الحاقیه و نمایش مشروط قالب: فیلد 'درخواست، الحاقیه است؟' در تمامی قراردادها (حتی تهاتر) نمایش داده می‌شود، اما فیلد 'آیا قرارداد قالب‌دار است؟' در قراردادهای تهاتری مخفی شده و مقدار آن Null می‌گردد.",
      targetId: "req-contract-type",
    },
    {
      text: "الزامی بودن فیلدها: تمامی فیلدهای فرم افزودن اطلاعات اولیه طرف قرارداد الزامی هستند.",
      targetId: "party-modal-content",
    },
  ];

  return (
    <div className="flex flex-col gap-4 text-gray-700 w-full max-w-7xl mx-auto xl:mr-0 pl-16 pb-24">
      {/* Breadcrumb / Title Bar */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 py-3 flex items-center">
        <span className="text-gray-800 text-sm">
          <EditableText
            isTestMode={isTestMode}
            defaultText="درخواست انعقاد قرارداد"
          />{" "}
          <span className="text-gray-400 mx-1">›</span>{" "}
          <EditableText
            isTestMode={isTestMode}
            defaultText="ثبت درخواست قرارداد"
          />
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
                <EditableText
                  isTestMode={isTestMode}
                  defaultText="ثبت اطلاعات"
                />
              </div>
            </div>

            <div className="p-4" style={{ minHeight: "600px" }}>
              {/* Pink Warning Banner or Barter Specific Warning Info Box */}
              {!isBarterContract ? (
                <div className="bg-[#e79292] text-white px-4 py-2 border border-[#d27575] text-center rounded-sm text-xs font-semibold mb-6">
                  <span className="drop-shadow-sm text-[#501010]">
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="احتراماً به استحضار می‌رساند قراردادهایی که متولی خرید آن‌ها(خرید کالا و خدمات عمومی) بر عهده تیم تدارکات هلدینگ می‌باشد می‌بایست صرفا توسط آن تیم پیگیری و در سامانه انعقاد قرارداد ثبت گردد"
                    />
                  </span>
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-950 border border-amber-300 p-4 rounded-sm text-xs md:text-sm font-semibold mb-6 leading-relaxed shadow-sm">
                  <div className="text-[#b90000] mb-2 font-bold flex items-center gap-1.5">
                    💡 جهت بررسی صورتجلسات تهاتر بارگذاری اسناد ذیل ضروری است:
                  </div>
                  <ul className="list-decimal list-inside space-y-1.5 pr-2 text-gray-800">
                    <li>قرارداد/صورتحساب/ فاکتور/چک مورد تهاتر</li>
                    <li>
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="قرارداد فروش"
                      />
                    </li>
                    <li>
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="فایل ورد تهاتر"
                      />
                    </li>
                  </ul>
                </div>
              )}

              {/* Top Full Width Fields */}
              <div className="flex flex-col mb-4 xl:w-[70%] text-[11px] xl:text-[13px]">
                <FieldRow
                  id="req-is-addendum"
                  label={
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="درخواست، الحاقیه است؟:"
                    />
                  }
                  required
                  hasValue={isAddendum !== null}
                  labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]"
                >
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
                      <span className="text-gray-700 text-sm">
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="بله"
                        />
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="req_is_addendum"
                        checked={isAddendum === false}
                        onChange={() => setIsAddendum(false)}
                        className="w-[14px] h-[14px] text-[#b90000] focus:ring-[#b90000] border-gray-300"
                      />
                      <span className="text-gray-700 text-sm">
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="خیر"
                        />
                      </span>
                    </label>
                  </div>
                </FieldRow>

                {!isBarterContract && (
                  <div className="mt-1">
                    <FieldRow
                      id="req-is-template"
                      label={
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="آیا قرارداد قالب دار است؟:"
                        />
                      }
                      required
                      hasValue={hasTemplate !== null}
                      labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]"
                    >
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
                          <span className="text-gray-700 text-sm">
                            <EditableText
                              isTestMode={isTestMode}
                              defaultText="بله"
                            />
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="req_has_template"
                            checked={hasTemplate === false}
                            onChange={() => setHasTemplate(false)}
                            className="w-[14px] h-[14px] text-[#b90000] focus:ring-[#b90000] border-gray-300"
                          />
                          <span className="text-gray-700 text-sm">
                            <EditableText
                              isTestMode={isTestMode}
                              defaultText="خیر"
                            />
                          </span>
                        </label>
                      </div>
                    </FieldRow>
                  </div>
                )}
                <div className="mt-2">
                  <FieldRow
                    id="req-contract-type"
                    label={
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="نوع قرارداد:"
                      />
                    }
                    required
                    hasValue={!!contractType}
                    labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]"
                  >
                    <select
                      className="w-full xl:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner"
                      value={contractType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setContractType(val);
                        if (
                          val === "تهاتر با نمایندگی فروش و خدمات پس از فروش" ||
                          val === "تهاتر تامین کنندگان و پیمانکاران"
                        ) {
                          setHasTemplate(null);
                        }
                      }}
                    >
                      <option value="">- لطفاً انتخاب کنید...</option>
                      <option value="خدمات">خدمات</option>
                      <option value="کالا">کالا</option>
                      <option value="کالا و خدمات">کالا و خدمات</option>
                      <option value="تهاتر با نمایندگی فروش و خدمات پس از فروش">
                        تهاتر با نمایندگی فروش و خدمات پس از فروش
                      </option>
                      <option value="تهاتر تامین کنندگان و پیمانکاران">
                        تهاتر تامین کنندگان و پیمانکاران
                      </option>
                    </select>
                  </FieldRow>
                </div>
                <div>
                  <FieldRow
                    id="req-company"
                    label={
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="قرارداد مربوط به کدام شرکت است؟:"
                      />
                    }
                    required
                    hasValue={!!company}
                    labelWidthClass="grid-cols-[200px_1fr] md:grid-cols-[250px_1fr]"
                  >
                    <select
                      className="w-full xl:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    >
                      <option value="">- لطفاً انتخاب کنید...</option>
                      <option value="آرین دیزل پایا">آرین دیزل پایا</option>
                      <option value="آرین موتور پویا">آرین موتور پویا</option>
                      <option value="آرین پارس موتور">آرین پارس موتور</option>
                      <option value="آرین ماشین راهبرد">
                        آرین ماشین راهبرد
                      </option>
                      <option value="آرین تایر پویا">آرین تایر پویا</option>
                      <option value="هلدینگ آرین سرمایه">
                        هلدینگ آرین سرمایه
                      </option>
                      <option value="واسپاری آرین پارس">
                        واسپاری آرین پارس
                      </option>
                      <option value="آرین پارس توربو">آرین پارس توربو</option>
                      <option value="آرین انرژی تابان ماندگار">
                        آرین انرژی تابان ماندگار
                      </option>
                    </select>
                  </FieldRow>
                </div>
              </div>

              {/* 2 Column Form Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 xl:gap-x-8 text-[11px] xl:text-[13px] mt-6">
                {/* RTL Column 1 (Physically Right) */}
                <div className="flex flex-col">
                  <FieldRow
                    id="req-subject"
                    label={
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="موضوع قرارداد:"
                      />
                    }
                    required
                    hasValue={!!subject}
                  >
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 shadow-inner"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </FieldRow>
                  <FieldRow
                    id="req-start-date-none"
                    label={
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="زمان شروع مشخص ندارد:"
                      />
                    }
                  >
                    <input
                      type="checkbox"
                      className="w-[13px] h-[13px] rounded-sm cursor-pointer"
                      checked={noStartDate}
                      onChange={(e) => setNoStartDate(e.target.checked)}
                    />
                  </FieldRow>
                  {!noStartDate && (
                    <FieldRow
                      id="req-start-schedule"
                      label={
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="برنامه زمانبندی شروع:"
                        />
                      }
                    >
                      <JalaliDatePicker
                        value={startDate}
                        onChange={setStartDate}
                      />
                    </FieldRow>
                  )}
                  <FieldRow
                    id="req-duration-indicator"
                    label={
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="مدت قرارداد به ماه:"
                      />
                    }
                  >
                    <input
                      type="text"
                      readOnly
                      className="w-full border border-gray-300 rounded-sm px-2 py-1 bg-gray-50 outline-none text-gray-700 shadow-sm font-mono font-bold text-center"
                      value={calculatedMonths}
                      placeholder="محاسبه خودکار..."
                    />
                  </FieldRow>
                  <FieldRow
                    id="req-technical-report"
                    label={
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="گزارش توجیه فنی دارد؟:"
                      />
                    }
                  >
                    <input
                      type="checkbox"
                      className="w-[13px] h-[13px] rounded-sm cursor-pointer"
                      checked={hasTechnicalReport}
                      onChange={(e) => setHasTechnicalReport(e.target.checked)}
                    />
                  </FieldRow>

                  <FieldRowTop
                    label={
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="شرح درخواست:"
                      />
                    }
                  >
                    <textarea
                      className="w-full h-24 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 shadow-inner resize-none text-[11px]"
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                    ></textarea>
                  </FieldRowTop>

                  {/* Attachments Section */}
                  <div className="mt-6 flex flex-col">
                    <FieldRow
                      id="req-attachments"
                      label={
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="ضمائم قرارداد:"
                        />
                      }
                    >
                      <div className="flex flex-col items-end w-full cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200">
                        <div className="flex items-center gap-1 group">
                          <span className="text-gray-800">
                            <EditableText
                              isTestMode={isTestMode}
                              defaultText="فایل مربوطه را بارگذاری نمایید"
                            />
                          </span>
                          <Paperclip
                            size={14}
                            className="text-gray-500 transition-transform group-hover:scale-110"
                          />
                        </div>
                      </div>
                    </FieldRow>
                    <FieldRow
                      id="req-initial-attach"
                      label={
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="پیوست اولیه قرارداد:"
                        />
                      }
                      required
                      hasValue={initialAttachment}
                    >
                      <div
                        className="flex flex-col items-end w-full cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200 pb-1"
                        onClick={() => setInitialAttachment(true)}
                      >
                        <div className="flex items-center gap-1 group">
                          <span className="text-gray-800">
                            {initialAttachment
                              ? "فایل بارگذاری شد"
                              : "فایل مربوطه را بارگذاری نمایید"}
                          </span>
                          <Paperclip
                            size={14}
                            className={`transition-transform group-hover:scale-110 ${initialAttachment ? "text-blue-500" : "text-gray-500"}`}
                          />
                        </div>
                      </div>
                    </FieldRow>
                    <FieldRow
                      id="req-identity-attach"
                      label={
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="پیوست مدارک هویتی طرفین قرارداد:"
                        />
                      }
                      required
                      hasValue={identityAttachment}
                    >
                      <div
                        className="flex flex-col items-end w-full cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200 pb-1"
                        onClick={() => setIdentityAttachment(true)}
                      >
                        <div className="flex items-center gap-1 group">
                          <span className="text-gray-800">
                            {identityAttachment
                              ? "فایل بارگذاری شد"
                              : "فایل مربوطه را بارگذاری نمایید"}
                          </span>
                          <Paperclip
                            size={14}
                            className={`transition-transform group-hover:scale-110 ${identityAttachment ? "text-blue-500" : "text-gray-500"}`}
                          />
                        </div>
                      </div>
                    </FieldRow>
                  </div>
                </div>

                {/* RTL Column 2 (Physically Left) */}
                <div className="flex flex-col">
                  <FieldRow
                    id="req-representative"
                    label={
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="نماینده قرارداد:"
                      />
                    }
                    required
                    hasValue={!!representative}
                  >
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 shadow-inner"
                      value={representative}
                      onChange={(e) => setRepresentative(e.target.value)}
                    />
                  </FieldRow>
                  <FieldRow
                    id="req-end-date-none"
                    label={
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="زمان پایان مشخص ندارد:"
                      />
                    }
                  >
                    <input
                      type="checkbox"
                      className="w-[13px] h-[13px] rounded-sm cursor-pointer"
                      checked={noEndDate}
                      onChange={(e) => setNoEndDate(e.target.checked)}
                    />
                  </FieldRow>
                  {!noEndDate && (
                    <FieldRow
                      id="req-end-schedule"
                      label={
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="برنامه زمانبندی پایان:"
                        />
                      }
                    >
                      <JalaliDatePicker value={endDate} onChange={setEndDate} />
                    </FieldRow>
                  )}
                  <FieldRow
                    id="req-duration-days"
                    label={
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="مدت قرارداد به روز:"
                      />
                    }
                  >
                    <input
                      type="text"
                      readOnly
                      className="w-full border border-gray-300 rounded-sm px-2 py-1 bg-gray-50 outline-none text-gray-700 shadow-sm font-mono font-bold text-center"
                      value={calculatedDays}
                      placeholder="محاسبه خودکار..."
                    />
                  </FieldRow>
                  <FieldRow
                    id="req-special-conditions"
                    label={
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="شرایط خصوصی دارد؟:"
                      />
                    }
                  >
                    <input
                      type="checkbox"
                      className="w-[13px] h-[13px] rounded-sm cursor-pointer"
                      checked={hasPrivateConditions}
                      onChange={(e) =>
                        setHasPrivateConditions(e.target.checked)
                      }
                    />
                  </FieldRow>

                  <FieldRowTop
                    label={
                      <EditableText
                        isTestMode={isTestMode}
                        defaultText="توضیحات شرایط خصوصی:"
                      />
                    }
                  >
                    <textarea
                      className="w-full h-24 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 shadow-inner resize-none text-[11px]"
                      value={privateConditionsDesc}
                      onChange={(e) => setPrivateConditionsDesc(e.target.value)}
                    ></textarea>
                  </FieldRowTop>
                </div>
              </div>

              {/* اطلاعات اولیه طرف قرارداد Accordion */}
              <div
                id="party-info-accordion-barter"
                className="mt-4 border border-gray-300 shadow-sm rounded overflow-hidden animate-fade-in"
              >
                <div
                  className="bg-[#dcdcdc] flex items-center justify-between p-2 cursor-pointer font-bold border-b border-gray-300"
                  onClick={() => setIsPartyInfoOpen(!isPartyInfoOpen)}
                >
                  <div className="flex items-center gap-2 text-[11px] xl:text-[13px] text-gray-700">
                    {isPartyInfoOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="اطلاعات اولیه طرف قرارداد"
                    />
                  </div>
                </div>
                {isPartyInfoOpen && (
                  <div className="bg-[#f0f0f0]">
                    {parties.length === 0 ? (
                      <div className="p-5 flex items-center justify-center text-xs text-gray-600 border-b border-gray-300">
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="رکوردی یافت نشد"
                        />
                      </div>
                    ) : (
                      <div className="overflow-x-auto border-b border-gray-300">
                        <table className="w-full text-right border-collapse text-xs md:text-sm">
                          <thead>
                            <tr className="bg-[#eaeaea] border-b border-gray-300 text-gray-700 font-bold">
                              <th className="p-2.5">
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="ردیف"
                                />
                              </th>
                              <th className="p-2.5">
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="نوع طرف قرارداد"
                                />
                              </th>
                              <th className="p-2.5 text-left pl-6">
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="عملیات"
                                />
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {parties.map((p, idx) => (
                              <tr
                                key={p.id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="p-2.5 font-mono">{idx + 1}</td>
                                <td className="p-2.5 font-medium">
                                  <div className="font-bold text-gray-800">
                                    {p.type}
                                  </div>
                                  {p.type === "حقیقی" && p.fullName && (
                                    <div className="mt-1 text-[11px] text-gray-600 bg-neutral-50 border border-gray-200 rounded p-2.5 space-y-1 max-w-xl">
                                      <div>
                                        <span className="font-semibold text-gray-500">
                                          <EditableText
                                            isTestMode={isTestMode}
                                            defaultText="نام و نام خانوادگی:"
                                          />
                                        </span>{" "}
                                        {p.fullName}
                                      </div>
                                      {p.nationalId && (
                                        <div>
                                          <span className="font-semibold text-gray-500">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="کد ملی:"
                                            />
                                          </span>{" "}
                                          <span className="font-mono">
                                            {p.nationalId}
                                          </span>
                                        </div>
                                      )}
                                      {p.jobTitle && (
                                        <div>
                                          <span className="font-semibold text-gray-500">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="سمت سازمانی:"
                                            />
                                          </span>{" "}
                                          {p.jobTitle}
                                        </div>
                                      )}
                                      {p.mobile && (
                                        <div>
                                          <span className="font-semibold text-gray-500">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="تلفن همراه:"
                                            />
                                          </span>{" "}
                                          <span className="font-mono">
                                            {p.mobile}
                                          </span>
                                        </div>
                                      )}
                                      {p.address && (
                                        <div className="break-all">
                                          <span className="font-semibold text-gray-500">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="آدرس:"
                                            />
                                          </span>{" "}
                                          {p.address}
                                        </div>
                                      )}
                                      {isBarterContract &&
                                        (p.barterType ||
                                          p.barterUntilDate ||
                                          p.barterAmount ||
                                          p.barterRelatedContract) && (
                                          <div className="mt-2 border-t border-gray-200 pt-1.5 space-y-1 text-teal-850 bg-teal-50/50 p-2 rounded">
                                            <div className="font-semibold text-teal-850 flex items-center gap-1">
                                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                                              <EditableText
                                                isTestMode={isTestMode}
                                                defaultText="اطلاعات تهاتر:"
                                              />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                              {p.barterType && (
                                                <div>
                                                  <span className="font-medium text-gray-500">
                                                    <EditableText
                                                      isTestMode={isTestMode}
                                                      defaultText="نوع تهاتر:"
                                                    />
                                                  </span>{" "}
                                                  <span className="font-bold text-teal-800">
                                                    {p.barterType}
                                                  </span>
                                                </div>
                                              )}
                                              {p.barterUntilDate && (
                                                <div>
                                                  <span className="font-medium text-gray-500">
                                                    <EditableText
                                                      isTestMode={isTestMode}
                                                      defaultText="تا تاریخ:"
                                                    />
                                                  </span>{" "}
                                                  <span className="font-mono text-teal-850">
                                                    {p.barterUntilDate}
                                                  </span>
                                                </div>
                                              )}
                                              {p.barterAmount && (
                                                <div>
                                                  <span className="font-medium text-gray-500">
                                                    <EditableText
                                                      isTestMode={isTestMode}
                                                      defaultText="مبلغ (ریال):"
                                                    />
                                                  </span>{" "}
                                                  <span className="font-mono text-teal-850">
                                                    {p.barterAmount}
                                                  </span>
                                                </div>
                                              )}
                                              {p.barterRelatedContract && (
                                                <div>
                                                  <span className="font-medium text-gray-500">
                                                    <EditableText
                                                      isTestMode={isTestMode}
                                                      defaultText="شماره قرارداد مرتبط:"
                                                    />
                                                  </span>{" "}
                                                  <span className="font-mono text-teal-850">
                                                    {p.barterRelatedContract}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  )}

                                  {p.type === "حقوقی" && p.orgName && (
                                    <div className="mt-1 text-[11px] text-gray-600 bg-neutral-50 border border-gray-200 rounded p-2.5 space-y-1 max-w-xl">
                                      <div>
                                        <span className="font-semibold text-gray-500">
                                          <EditableText
                                            isTestMode={isTestMode}
                                            defaultText="نام سازمان:"
                                          />
                                        </span>{" "}
                                        {p.orgName}
                                      </div>
                                      {p.orgNationalId && (
                                        <div>
                                          <span className="font-semibold text-gray-500">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="شناسه ملی:"
                                            />
                                          </span>{" "}
                                          <span className="font-mono">
                                            {p.orgNationalId}
                                          </span>
                                        </div>
                                      )}
                                      {p.orgEconomicCode && (
                                        <div>
                                          <span className="font-semibold text-gray-500">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="کد اقتصادی:"
                                            />
                                          </span>{" "}
                                          <span className="font-mono">
                                            {p.orgEconomicCode}
                                          </span>
                                        </div>
                                      )}
                                      {p.orgRegNo && (
                                        <div>
                                          <span className="font-semibold text-gray-500">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="شماره ثبت:"
                                            />
                                          </span>{" "}
                                          <span className="font-mono">
                                            {p.orgRegNo}
                                          </span>
                                        </div>
                                      )}
                                      {p.orgPhone && (
                                        <div>
                                          <span className="font-semibold text-gray-500">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="شماره تماس ثابت:"
                                            />
                                          </span>{" "}
                                          <span className="font-mono">
                                            {p.orgPhone}
                                          </span>
                                        </div>
                                      )}
                                      {p.orgPostalCode && (
                                        <div>
                                          <span className="font-semibold text-gray-500">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="کد پستی:"
                                            />
                                          </span>{" "}
                                          <span className="font-mono">
                                            {p.orgPostalCode}
                                          </span>
                                        </div>
                                      )}
                                      {p.orgAddress && (
                                        <div className="break-all">
                                          <span className="font-semibold text-gray-500">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="آدرس:"
                                            />
                                          </span>{" "}
                                          {p.orgAddress}
                                        </div>
                                      )}
                                      {isBarterContract &&
                                        (p.barterType ||
                                          p.barterUntilDate ||
                                          p.barterAmount ||
                                          p.barterRelatedContract) && (
                                          <div className="mt-2 border-t border-gray-200 pt-1.5 space-y-1 text-teal-850 bg-teal-50/50 p-2 rounded">
                                            <div className="font-semibold text-teal-850 flex items-center gap-1">
                                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                                              <EditableText
                                                isTestMode={isTestMode}
                                                defaultText="اطلاعات تهاتر:"
                                              />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                                              {p.barterType && (
                                                <div>
                                                  <span className="font-medium text-gray-500">
                                                    <EditableText
                                                      isTestMode={isTestMode}
                                                      defaultText="نوع تهاتر:"
                                                    />
                                                  </span>{" "}
                                                  <span className="font-bold text-teal-800">
                                                    {p.barterType}
                                                  </span>
                                                </div>
                                              )}
                                              {p.barterUntilDate && (
                                                <div>
                                                  <span className="font-medium text-gray-500">
                                                    <EditableText
                                                      isTestMode={isTestMode}
                                                      defaultText="تا تاریخ:"
                                                    />
                                                  </span>{" "}
                                                  <span className="font-mono text-teal-850">
                                                    {p.barterUntilDate}
                                                  </span>
                                                </div>
                                              )}
                                              {p.barterAmount && (
                                                <div>
                                                  <span className="font-medium text-gray-500">
                                                    <EditableText
                                                      isTestMode={isTestMode}
                                                      defaultText="مبلغ (ریال):"
                                                    />
                                                  </span>{" "}
                                                  <span className="font-mono text-teal-850">
                                                    {p.barterAmount}
                                                  </span>
                                                </div>
                                              )}
                                              {p.barterRelatedContract && (
                                                <div>
                                                  <span className="font-medium text-gray-500">
                                                    <EditableText
                                                      isTestMode={isTestMode}
                                                      defaultText="شماره قرارداد مرتبط:"
                                                    />
                                                  </span>{" "}
                                                  <span className="font-mono text-teal-850">
                                                    {p.barterRelatedContract}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      {p.signers && p.signers.length > 0 && (
                                        <div className="mt-2 border-t border-gray-200 pt-1">
                                          <div className="font-semibold text-gray-700 mb-1">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="صاحبان امضا:"
                                            />
                                          </div>
                                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-600 font-mono">
                                            {p.signers.map((s, sidx) => (
                                              <div
                                                key={s.id}
                                                className="bg-white border border-gray-150 rounded px-1.5 py-0.5"
                                              >
                                                {sidx + 1}. {s.fullName} (
                                                {s.position}) - {s.nationalId}
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
                                      setParties(
                                        parties.filter(
                                          (item) => item.id !== p.id,
                                        ),
                                      );
                                    }}
                                    className="text-red-500 hover:text-red-700 font-bold hover:underline"
                                  >
                                    <EditableText
                                      isTestMode={isTestMode}
                                      defaultText="حذف"
                                    />
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
                        <Plus size={16} />
                        <span>
                          <EditableText
                            isTestMode={isTestMode}
                            defaultText="افزودن طرف قرارداد"
                          />
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Overlay for افزودن اطلاعات اولیه طرف قرارداد */}
              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity">
                  <div
                    className={`bg-[#f8f9fa] border border-gray-300 rounded shadow-2xl flex flex-col transition-all duration-300 ${isMaximized ? "w-[96vw] h-[93vh]" : "w-full max-w-2xl max-h-[90vh]"}`}
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-neutral-50">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-gray-800">
                          <EditableText
                            isTestMode={isTestMode}
                            defaultText="افزودن اطلاعات اولیه طرف قرارداد"
                          />
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="4 14 10 14 10 20" />
                            <polyline points="20 10 14 10 14 4" />
                            <line x1="14" y1="10" x2="21" y2="3" />
                            <line x1="10" y1="14" x2="3" y2="20" />
                          </svg>
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
                      <div
                        id="party-modal-content"
                        className="bg-white border border-gray-200 rounded-sm p-6 shadow-xs space-y-4"
                      >
                        <FieldRow
                          label={
                            <EditableText
                              isTestMode={isTestMode}
                              defaultText="نوع طرف قرارداد:"
                            />
                          }
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
                              label={
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="نام و نام خانوادگی:"
                                />
                              }
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input
                                type="text"
                                required
                                value={tempFullName}
                                onChange={(e) =>
                                  setTempFullName(e.target.value)
                                }
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs"
                              />
                            </FieldRow>

                            {/* Barter Fields Placeholder */}

                            <FieldRow
                              label={
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="کد ملی:"
                                />
                              }
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input
                                type="text"
                                required
                                value={tempNationalId}
                                onChange={(e) =>
                                  setTempNationalId(e.target.value)
                                }
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>

                            <FieldRow
                              label={
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="سمت سازمانی:"
                                />
                              }
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input
                                type="text"
                                required
                                value={tempJobTitle}
                                onChange={(e) =>
                                  setTempJobTitle(e.target.value)
                                }
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs"
                              />
                            </FieldRow>

                            <FieldRow
                              label={
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="شماره تلفن همراه:"
                                />
                              }
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
                              label={
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="آدرس :"
                                />
                              }
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
                              label={
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="نام سازمان:"
                                />
                              }
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
                              label={
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="کد ملی:"
                                />
                              }
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input
                                type="text"
                                value={tempOrgNationalId}
                                onChange={(e) =>
                                  setTempOrgNationalId(e.target.value)
                                }
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>

                            <FieldRow
                              label={
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="کد اقتصادی:"
                                />
                              }
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input
                                type="text"
                                value={tempOrgEconomicCode}
                                onChange={(e) =>
                                  setTempOrgEconomicCode(e.target.value)
                                }
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>

                            <FieldRow
                              label={
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="شماره ثبت:"
                                />
                              }
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input
                                type="text"
                                value={tempOrgRegNo}
                                onChange={(e) =>
                                  setTempOrgRegNo(e.target.value)
                                }
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>

                            <FieldRow
                              label={
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="شماره تماس ثابت:"
                                />
                              }
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input
                                type="text"
                                value={tempOrgPhone}
                                onChange={(e) =>
                                  setTempOrgPhone(e.target.value)
                                }
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>

                            <FieldRow
                              label={
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="کد پستی:"
                                />
                              }
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <input
                                type="text"
                                value={tempOrgPostalCode}
                                onChange={(e) =>
                                  setTempOrgPostalCode(e.target.value)
                                }
                                className="w-full md:w-2/3 border border-gray-300 rounded-sm px-2 py-1 outline-none focus:border-red-500 bg-white shadow-inner text-xs font-mono"
                              />
                            </FieldRow>

                            <FieldRow
                              label={
                                <EditableText
                                  isTestMode={isTestMode}
                                  defaultText="آدرس :"
                                />
                              }
                              labelWidthClass="grid-cols-[140px_1fr] md:grid-cols-[180px_1fr]"
                            >
                              <textarea
                                value={tempOrgAddress}
                                onChange={(e) =>
                                  setTempOrgAddress(e.target.value)
                                }
                                className="w-full h-16 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 bg-white shadow-inner text-xs resize-none"
                              />
                            </FieldRow>

                            {/* صاحبان امضا Inner Frame */}
                            <div className="mt-4 border border-gray-300 shadow-sm rounded overflow-hidden">
                              <div
                                className="bg-[#ccc] flex items-center justify-between p-2 cursor-pointer font-bold border-b border-gray-300 text-gray-800"
                                onClick={() =>
                                  setIsSignersAccordionOpen(
                                    !isSignersAccordionOpen,
                                  )
                                }
                              >
                                <div className="flex items-center gap-2 text-xs">
                                  {isSignersAccordionOpen ? (
                                    <ChevronUp size={14} />
                                  ) : (
                                    <ChevronDown size={14} />
                                  )}
                                  <EditableText
                                    isTestMode={isTestMode}
                                    defaultText="صاحبان امضا"
                                  />
                                </div>
                              </div>
                              {isSignersAccordionOpen && (
                                <div className="bg-[#e2e2e2]">
                                  {tempSigners.length === 0 ? (
                                    <div className="p-4 flex items-center justify-center text-xs text-gray-600 border-b border-gray-300 bg-[#eaeaea]">
                                      <EditableText
                                        isTestMode={isTestMode}
                                        defaultText="رکوردی یافت نشد"
                                      />
                                    </div>
                                  ) : (
                                    <div className="overflow-x-auto border-b border-gray-300">
                                      <table className="w-full text-right border-collapse text-[11px] md:text-xs bg-white">
                                        <thead>
                                          <tr className="bg-[#eaeaea] border-b border-gray-300 text-gray-750 font-bold">
                                            <th className="p-2">
                                              <EditableText
                                                isTestMode={isTestMode}
                                                defaultText="ردیف"
                                              />
                                            </th>
                                            <th className="p-2">
                                              <EditableText
                                                isTestMode={isTestMode}
                                                defaultText="نام و نام خانوادگی"
                                              />
                                            </th>
                                            <th className="p-2">
                                              <EditableText
                                                isTestMode={isTestMode}
                                                defaultText="سمت"
                                              />
                                            </th>
                                            <th className="p-2">
                                              <EditableText
                                                isTestMode={isTestMode}
                                                defaultText="کد ملی"
                                              />
                                            </th>
                                            <th className="p-2">
                                              <EditableText
                                                isTestMode={isTestMode}
                                                defaultText="همراه"
                                              />
                                            </th>
                                            <th className="p-2 text-left pl-4">
                                              <EditableText
                                                isTestMode={isTestMode}
                                                defaultText="عملیات"
                                              />
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-250">
                                          {tempSigners.map((sig, idx) => (
                                            <tr
                                              key={sig.id}
                                              className="hover:bg-gray-50 transition-colors"
                                            >
                                              <td className="p-2 font-mono">
                                                {idx + 1}
                                              </td>
                                              <td className="p-2 font-medium">
                                                {sig.fullName}
                                              </td>
                                              <td className="p-2">
                                                {sig.position}
                                              </td>
                                              <td className="p-2 font-mono">
                                                {sig.nationalId}
                                              </td>
                                              <td className="p-2 font-mono">
                                                {sig.mobile}
                                              </td>
                                              <td className="p-2 text-left pl-4">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setTempSigners(
                                                      tempSigners.filter(
                                                        (s) => s.id !== sig.id,
                                                      ),
                                                    );
                                                  }}
                                                  className="text-red-500 hover:text-red-700 font-bold"
                                                >
                                                  <EditableText
                                                    isTestMode={isTestMode}
                                                    defaultText="حذف"
                                                  />
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
                                      <div className="text-xs font-bold text-gray-750 pb-1 border-b border-neutral-100">
                                        <EditableText
                                          isTestMode={isTestMode}
                                          defaultText="افزودن امضاکننده جدید"
                                        />
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-[11px] text-gray-500 mb-1">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="نام و نام خانوادگی:"
                                            />
                                          </label>
                                          <input
                                            type="text"
                                            value={signerFullName}
                                            onChange={(e) =>
                                              setSignerFullName(e.target.value)
                                            }
                                            className="w-full border border-gray-300 rounded-sm px-2 py-1 outline-none text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] text-gray-500 mb-1">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="سمت:"
                                            />
                                          </label>
                                          <input
                                            type="text"
                                            value={signerPosition}
                                            onChange={(e) =>
                                              setSignerPosition(e.target.value)
                                            }
                                            className="w-full border border-gray-300 rounded-sm px-2 py-1 outline-none text-xs"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] text-gray-500 mb-1">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="کد ملی:"
                                            />
                                          </label>
                                          <input
                                            type="text"
                                            value={signerNationalId}
                                            onChange={(e) =>
                                              setSignerNationalId(
                                                e.target.value,
                                              )
                                            }
                                            className="w-full border border-gray-300 rounded-sm px-2 py-1 outline-none text-xs font-mono"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] text-gray-500 mb-1">
                                            <EditableText
                                              isTestMode={isTestMode}
                                              defaultText="تلفن همراه:"
                                            />
                                          </label>
                                          <input
                                            type="text"
                                            value={signerMobile}
                                            onChange={(e) =>
                                              setSignerMobile(e.target.value)
                                            }
                                            className="w-full border border-gray-300 rounded-sm px-2 py-1 outline-none text-xs font-mono"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setIsAddingSigner(false);
                                            setSignerFullName("");
                                            setSignerPosition("");
                                            setSignerNationalId("");
                                            setSignerMobile("");
                                          }}
                                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 text-xs font-bold transition-colors"
                                        >
                                          <EditableText
                                            isTestMode={isTestMode}
                                            defaultText="انصراف"
                                          />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (signerFullName.trim()) {
                                              setTempSigners([
                                                ...tempSigners,
                                                {
                                                  id: Date.now(),
                                                  fullName:
                                                    signerFullName.trim(),
                                                  position:
                                                    signerPosition.trim(),
                                                  nationalId:
                                                    signerNationalId.trim(),
                                                  mobile: signerMobile.trim(),
                                                },
                                              ]);
                                              setIsAddingSigner(false);
                                              setSignerFullName("");
                                              setSignerPosition("");
                                              setSignerNationalId("");
                                              setSignerMobile("");
                                            }
                                          }}
                                          disabled={!signerFullName.trim()}
                                          className={`px-3 py-1 rounded text-white text-xs font-bold transition-colors ${
                                            signerFullName.trim()
                                              ? "bg-[#1e6b7b] hover:bg-[#154d58] cursor-pointer"
                                              : "bg-gray-350 cursor-not-allowed"
                                          }`}
                                        >
                                          <EditableText
                                            isTestMode={isTestMode}
                                            defaultText="تایید"
                                          />
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
                                        <Plus size={16} />
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
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="انصراف"
                        />
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
                                fullName:
                                  tempPartyType === "حقیقی"
                                    ? tempFullName.trim()
                                    : undefined,
                                nationalId:
                                  tempPartyType === "حقیقی"
                                    ? tempNationalId.trim()
                                    : undefined,
                                jobTitle:
                                  tempPartyType === "حقیقی"
                                    ? tempJobTitle.trim()
                                    : undefined,
                                mobile:
                                  tempPartyType === "حقیقی"
                                    ? tempMobile.trim()
                                    : undefined,
                                address:
                                  tempPartyType === "حقیقی"
                                    ? tempAddress.trim()
                                    : undefined,
                                // حقوقی
                                orgName:
                                  tempPartyType === "حقوقی"
                                    ? tempOrgName.trim()
                                    : undefined,
                                orgNationalId:
                                  tempPartyType === "حقوقی"
                                    ? tempOrgNationalId.trim()
                                    : undefined,
                                orgEconomicCode:
                                  tempPartyType === "حقوقی"
                                    ? tempOrgEconomicCode.trim()
                                    : undefined,
                                orgRegNo:
                                  tempPartyType === "حقوقی"
                                    ? tempOrgRegNo.trim()
                                    : undefined,
                                orgPhone:
                                  tempPartyType === "حقوقی"
                                    ? tempOrgPhone.trim()
                                    : undefined,
                                orgPostalCode:
                                  tempPartyType === "حقوقی"
                                    ? tempOrgPostalCode.trim()
                                    : undefined,
                                orgAddress:
                                  tempPartyType === "حقوقی"
                                    ? tempOrgAddress.trim()
                                    : undefined,
                                signers:
                                  tempPartyType === "حقوقی" ? tempSigners : [],
                                // تهاتر
                                barterType: isBarterContract
                                  ? tempBarterType
                                  : undefined,
                                barterUntilDate: isBarterContract
                                  ? tempBarterUntilDate
                                  : undefined,
                                barterAmount: isBarterContract
                                  ? tempBarterAmount
                                  : undefined,
                                barterRelatedContract: isBarterContract
                                  ? tempBarterRelatedContract
                                  : undefined,
                              },
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
                          ((tempPartyType === "حقوقی" && tempOrgName.trim()) ||
                            (tempPartyType === "حقیقی" && tempFullName.trim()))
                            ? "bg-[#1e6b7b] hover:bg-[#154d58] cursor-pointer"
                            : "bg-gray-300 cursor-not-allowed text-gray-500"
                        }`}
                      >
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="ذخیره"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions Form */}
              <div className="mt-8">
                <FieldRow
                  id="req-consultant-review"
                  label={
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="آیا نیاز به بررسی مشاور می‌باشد؟:"
                    />
                  }
                  labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[180px_1fr]"
                >
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="needs_consultant"
                        className="w-[14px] h-[14px]"
                      />
                      <span className="text-gray-800">
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="بله"
                        />
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="needs_consultant"
                        className="w-[14px] h-[14px]"
                      />
                      <span className="text-gray-800">
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="خیر"
                        />
                      </span>
                    </label>
                  </div>
                </FieldRow>
              </div>

              <div className="mt-8 flex justify-center">
                <button className="bg-[#b90000] hover:bg-[#a00000] text-white px-8 py-2 rounded font-bold shadow-sm border border-red-900 transition-colors text-xs">
                  <EditableText
                    isTestMode={isTestMode}
                    defaultText="لغو درخواست"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Left Panel (الزامات کلیدی) */}
          <div className="w-full xl:w-[25%] flex flex-col border border-gray-300 rounded shadow-sm bg-white h-fit overflow-hidden">
            <div className="bg-gradient-to-b from-[#f9f9f9] to-[#eaeaea] flex items-center justify-between p-2 font-bold border-b border-gray-300 text-xs text-gray-800 cursor-default">
              <div className="flex items-center gap-2">
                <ChevronDown size={16} />
                <EditableText
                  isTestMode={isTestMode}
                  defaultText="الزامات کلیدی"
                />
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
                  "در صورت وجود کمیسیون معاملات، تمامی مستندات مربوطه (مانند صورت‌جلسه، فرم‌های مربوطه) در بخش ضمایم قرارداد ضمیمه شود",
                  "در صورت حقوقی بودن طرفین قرارداد، باید تصویر روزنامه رسمی در مدارک هویتی طرفین قرارداد ضمیمه گردد",
                  "در صورت حقیقی بودن طرفین قرارداد، باید تصویر کارت ملی در مدارک هویتی طرفین قرارداد ضمیمه گردد",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="text-[#a80000] font-bold text-[16px] leading-none shrink-0"
                      style={{ fontFamily: "Times New Roman" }}
                    >
                      ★
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bizagi Technical Notes */}
      <BizagiDevNotes
        notes={requestNotes}
        isTestMode={isTestMode}
        onAction={(id) => {
          if (id === "party-modal-content") {
            setIsModalOpen(true);
            setTimeout(() => {
              const el = document.getElementById(id);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.classList.add(
                  "ring-4",
                  "ring-[#b90000]",
                  "ring-offset-2",
                  "bg-red-50",
                  "scale-[1.01]",
                );
                setTimeout(() => {
                  el.classList.remove(
                    "ring-4",
                    "ring-[#b90000]",
                    "ring-offset-2",
                    "bg-red-50",
                    "scale-[1.01]",
                  );
                }, 2000);
              }
            }, 100);
          }
        }}
      />
    </div>
  );
}

export default function App() {
  const [activeForm, setActiveForm] = useState<string>(() => {
    const saved = localStorage.getItem("app_activeForm");
    return saved || "request";
  });
  const [contractType, setContractType] = useState<string>(() => {
    return localStorage.getItem("app_contractType") || "خرید کالا و خدمات";
  });
  const [isAddendum, setIsAddendum] = useState<boolean | null>(() => {
    const saved = localStorage.getItem("app_isAddendum");
    return saved === "true" ? true : saved === "false" ? false : null;
  });
  const [hasTemplate, setHasTemplate] = useState<boolean | null>(() => {
    const saved = localStorage.getItem("app_hasTemplate");
    return saved === "true" ? true : saved === "false" ? false : null;
  });
  const [company, setCompany] = useState<string>(() => {
    return localStorage.getItem("app_company") || "آرین موتور تابان";
  });
  const [subject, setSubject] = useState<string>(() => {
    return localStorage.getItem("app_subject") || "تهاتر نمایندگی";
  });
  const [representative, setRepresentative] = useState<string>(() => {
    return localStorage.getItem("app_representative") || "";
  });
  const [noStartDate, setNoStartDate] = useState<boolean>(() => {
    return localStorage.getItem("app_noStartDate") !== "false";
  });
  const [noEndDate, setNoEndDate] = useState<boolean>(() => {
    return localStorage.getItem("app_noEndDate") !== "false";
  });
  const [startDate, setStartDate] = useState<string>(() => {
    return localStorage.getItem("app_startDate") || "";
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return localStorage.getItem("app_endDate") || "";
  });
  const [hasTechnicalReport, setHasTechnicalReport] = useState<boolean>(() => {
    return localStorage.getItem("app_hasTechnicalReport") === "true";
  });
  const [hasPrivateConditions, setHasPrivateConditions] = useState<boolean>(
    () => {
      return localStorage.getItem("app_hasPrivateConditions") === "true";
    },
  );
  const [requestDescription, setRequestDescription] = useState<string>(() => {
    return localStorage.getItem("app_requestDescription") || "";
  });
  const [privateConditionsDesc, setPrivateConditionsDesc] = useState<string>(
    () => {
      return localStorage.getItem("app_privateConditionsDesc") || "";
    },
  );
  const [initialAttachment, setInitialAttachment] = useState<boolean>(() => {
    return localStorage.getItem("app_initialAttachment") === "true";
  });
  const [identityAttachment, setIdentityAttachment] = useState<boolean>(() => {
    return localStorage.getItem("app_identityAttachment") === "true";
  });

  const [tempSigners, setTempSigners] = useState<
    {
      id: number;
      fullName: string;
      position: string;
      nationalId: string;
      mobile: string;
    }[]
  >([]);

  const [parties, setParties] = useState<any[]>(() => {
    const saved = localStorage.getItem("app_parties");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 1,
        type: "حقوقی",
        orgName: "نمایندگی 258",
        orgNationalId: "02205522568",
        orgEconomicCode: "035656569656",
        orgRegNum: "032396522",
        orgPostalCode: "0323564161",
        mobile: "",
        orgPhone: "03232645113",
        orgAddress: "تهران-الله یاری",
        signers: [],
      },
    ];
  });

  const isDeployed =
    (import.meta as any).env?.PROD ||
    window.location.hostname.includes("ais-pre-") ||
    window.location.hostname.includes("pre-");

  const [isTestMode, setIsTestMode] = useState<boolean>(() => {
    if (isDeployed) return false;
    return localStorage.getItem("app_isTestMode") === "true";
  });

  const [executionMode, setExecutionMode] = useState<
    "STRICT" | "CONTROLLED" | "CREATIVE"
  >(() => {
    return (localStorage.getItem("app_executionMode") as any) || "STRICT";
  });

  const handleSetExecutionMode = (
    mode: "STRICT" | "CONTROLLED" | "CREATIVE",
  ) => {
    setExecutionMode(mode);
    localStorage.setItem("app_executionMode", mode);
  };

  const [isNavAccordionOpen, setIsNavAccordionOpen] = useState(true);

  // custom forms states
  const [customForms, setCustomForms] = useState<any[]>(() => {
    const saved = localStorage.getItem("app_custom_forms");
    let forms = [];
    if (saved) {
      try {
        forms = JSON.parse(saved);
      } catch (e) {}
    }

    // Root fix: Ensure essential forms are always present in the source code
    // This solves the persistence issue for published/shared versions
    const essentialForms = [
      {
        id: "finance-stakeholder-review",
        name: "بررسی ذینفع مالی پارس/هلدینگ",
        baseFormKey: "financeReview", // Using the robust FinanceReviewForm component
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=200",
        fields: []
      }
    ];

    // Merge logic: Add essential forms if they don't exist by ID
    essentialForms.forEach(ef => {
      if (!forms.find((f: any) => f.id === ef.id)) {
        forms.push(ef);
      } else {
        // If it exists, ensure it has the correct baseFormKey to preserve "unique features"
        const existing = forms.find((f: any) => f.id === ef.id);
        if (existing.baseFormKey === "reviewCopy") {
          existing.baseFormKey = "financeReview";
        }
      }
    });

    return forms;
  });

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [newFormBaseKey, setNewFormBaseKey] = useState("request");
  const [newFormImage, setNewFormImage] = useState<string>("");
  const [shouldCopy, setShouldCopy] = useState(false);
  const [modalFields, setModalFields] = useState<any[]>([]);
  const [deleteConfirmFormId, setDeleteConfirmFormId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    localStorage.setItem("app_custom_forms", JSON.stringify(customForms));
  }, [customForms]);

  const partiesStr = JSON.stringify(parties);

  useEffect(() => {
    localStorage.setItem("app_contractType", contractType || "");
    localStorage.setItem(
      "app_isAddendum",
      isAddendum === null ? "" : isAddendum.toString(),
    );
    localStorage.setItem(
      "app_hasTemplate",
      hasTemplate === null ? "" : hasTemplate.toString(),
    );
    localStorage.setItem("app_company", company || "");
    localStorage.setItem("app_subject", subject || "");
    localStorage.setItem("app_representative", representative || "");
    localStorage.setItem("app_noStartDate", noStartDate.toString());
    localStorage.setItem("app_noEndDate", noEndDate.toString());
    localStorage.setItem("app_startDate", startDate || "");
    localStorage.setItem("app_endDate", endDate || "");
    localStorage.setItem(
      "app_hasTechnicalReport",
      hasTechnicalReport.toString(),
    );
    localStorage.setItem(
      "app_hasPrivateConditions",
      hasPrivateConditions.toString(),
    );
    localStorage.setItem(
      "app_requestDescription",
      requestDescription || "",
    );
    localStorage.setItem(
      "app_privateConditionsDesc",
      privateConditionsDesc || "",
    );
    localStorage.setItem(
      "app_initialAttachment",
      initialAttachment.toString(),
    );
    localStorage.setItem(
      "app_identityAttachment",
      identityAttachment.toString(),
    );
    localStorage.setItem("app_parties", partiesStr);
  }, [
    contractType,
    isAddendum,
    hasTemplate,
    company,
    subject,
    representative,
    noStartDate,
    noEndDate,
    startDate,
    endDate,
    hasTechnicalReport,
    hasPrivateConditions,
    requestDescription,
    privateConditionsDesc,
    initialAttachment,
    identityAttachment,
    partiesStr,
  ]);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const handleSaveUIOverrides = async () => {
    setSaveStatus("saving");
    try {
      const mergedOverrides = { ...UI_OVERRIDES };

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('editable_text_')) {
          if (key.startsWith('editable_text_style_')) {
            const originalText = key.substring('editable_text_style_'.length);
            try {
              const styles = JSON.parse(localStorage.getItem(key) || '{}');
              if (!mergedOverrides[originalText]) mergedOverrides[originalText] = {};
              mergedOverrides[originalText].styles = styles;
              if (styles.display === 'none') {
                mergedOverrides[originalText].hidden = true;
              } else {
                delete mergedOverrides[originalText].hidden;
              }
            } catch (e) {}
          } else {
            const originalText = key.substring('editable_text_'.length);
            const modifiedText = localStorage.getItem(key);
            if (modifiedText && modifiedText !== originalText) {
              if (!mergedOverrides[originalText]) mergedOverrides[originalText] = {};
              mergedOverrides[originalText].text = modifiedText;
            }
          }
        }
      }

      const res = await fetch('/api/save-ui-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedOverrides)
      });
      
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 4000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 4000);
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  };

  const handleSetTestMode = (val: boolean) => {
    if (isDeployed) {
      setIsTestMode(false);
      localStorage.setItem("app_isTestMode", "false");
      return;
    }
    setIsTestMode(val);
    localStorage.setItem("app_isTestMode", val.toString());
  };

  const handleSetActiveForm = (val: string) => {
    setActiveForm(val);
    localStorage.setItem("app_activeForm", val);
  };

  const resolvedCustomForm = customForms.find((f) => f.id === activeForm);
  const resolvedBaseKey = resolvedCustomForm
    ? resolvedCustomForm.baseFormKey
    : activeForm;

  // File upload reader handler
  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFormImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <TestModeContext.Provider
      value={{
        isTestMode,
        setIsTestMode: handleSetTestMode,
        activeForm,
        isDeployed,
      }}
    >
      <div
        className="min-h-screen bg-[#e8e9ea] flex flex-col rtl font-sans"
        dir="rtl"
      >
        {/* Header bar mapping */}
        <div className="w-full bg-[#297c83] text-white py-2 px-4 flex flex-col md:flex-row gap-2 justify-between items-center shadow-md z-30">
          <h1 className="text-sm font-bold">
            <EditableText
              isTestMode={isTestMode}
              defaultText="درخواست انعقاد قرارداد"
            />
          </h1>

          {/* Execution Mode Selector in Header, only when isTestMode is active */}
          {isTestMode && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1 bg-[#1c5459] p-1 rounded-sm text-xs">
                <span className="text-gray-200 font-medium px-2 select-none text-[11px]">
                  حالت اجرای نرم‌افزار:
                </span>

                <button
                  id="mode-strict-btn"
                  onClick={() => handleSetExecutionMode("STRICT")}
                  className={`px-3 py-1 rounded-sm transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                    executionMode === "STRICT"
                      ? "bg-[#b90000] text-white shadow-sm scale-102 border border-red-400"
                      : "text-gray-300 hover:text-white hover:bg-[#22686e]"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${executionMode === "STRICT" ? "bg-white animate-pulse" : "bg-gray-400"}`}
                  />
                  سخت‌گیرانه (حالت ۱)
                </button>

                <button
                  id="mode-controlled-btn"
                  onClick={() => handleSetExecutionMode("CONTROLLED")}
                  className={`px-3 py-1 rounded-sm transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                    executionMode === "CONTROLLED"
                      ? "bg-[#d97706] text-white shadow-sm scale-102 border border-amber-400"
                      : "text-gray-300 hover:text-white hover:bg-[#22686e]"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${executionMode === "CONTROLLED" ? "bg-white" : "bg-gray-400"}`}
                  />
                  کنترل‌شده (حالت ۲)
                </button>

                <button
                  id="mode-creative-btn"
                  onClick={() => handleSetExecutionMode("CREATIVE")}
                  className={`px-3 py-1 rounded-sm transition-all flex items-center gap-1.5 font-bold cursor-pointer ${
                    executionMode === "CREATIVE"
                      ? "bg-[#059669] text-white shadow-sm scale-102 border border-emerald-400"
                      : "text-gray-300 hover:text-white hover:bg-[#22686e]"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${executionMode === "CREATIVE" ? "bg-white" : "bg-gray-400"}`}
                  />
                  خلاقیت آزاد (حالت ۳)
                </button>
              </div>

              {/* SAVE OVERRIDES CTA */}
              <button
                onClick={handleSaveUIOverrides}
                disabled={saveStatus === "saving"}
                className={`px-3 py-1 rounded-sm font-bold text-[11px] flex items-center gap-1.5 border shadow-sm transition-all cursor-pointer select-none active:scale-95 ${
                  saveStatus === "saving"
                    ? "bg-[#1c5459] text-gray-400 border-gray-600 cursor-not-allowed"
                    : saveStatus === "success"
                      ? "bg-emerald-600 text-white border-emerald-400"
                      : saveStatus === "error"
                        ? "bg-rose-700 text-white border-rose-500"
                        : "bg-[#ffea00] hover:bg-[#ffe000] text-amber-950 border-amber-400 hover:scale-102"
                }`}
              >
                {saveStatus === "saving" && (
                  <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
                <span>{saveStatus === "success" ? "✓" : saveStatus === "error" ? "❌" : "💾"}</span>
                <span>
                  {saveStatus === "saving" && "در حال ثبت..."}
                  {saveStatus === "success" && "تغییرات با موفقیت در کد ذخیره شد!"}
                  {saveStatus === "error" && "خطا در برقراری ارتباط!"}
                  {saveStatus === "idle" && "ذخیره‌سازی نهایی تغییرات (برای انتشار)"}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Mode Status Info Under-Header Bar */}
        {isTestMode && (
          <div
            id="mode-status-info"
            className={`w-full px-4 py-1.5 text-[11px] text-right border-b flex justify-between items-center transition-colors shadow-sm select-none ${
              executionMode === "STRICT"
                ? "bg-red-50 border-red-200 text-red-900"
                : executionMode === "CONTROLLED"
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold">قانون فعال:</span>
              <span>
                {executionMode === "STRICT" &&
                  "«اگر گفته نشده، وجود ندارد». هرگونه خلاقیت یا امکانات ناخواسته‌ای غیرفعال و ممنوع است."}
                {executionMode === "CONTROLLED" &&
                  "تنها گزینه‌های تاییدشده و توسعه محدود مجاز است. هر نوع نوآوری مستقل به تایید نیاز دارد."}
                {executionMode === "CREATIVE" &&
                  "ایده‌پردازی و ایجاد گزینه‌های آزمایشی نوآورانه آزاد است."}
              </span>
            </div>
            <div className="font-semibold text-[9px] opacity-75 hidden sm:block">
              {executionMode === "STRICT" && "STRICT MODE ACTIVE"}
              {executionMode === "CONTROLLED" && "CONTROLLED MODE ACTIVE"}
              {executionMode === "CREATIVE" && "CREATIVE MODE ACTIVE"}
            </div>
          </div>
        )}

        <div className="flex flex-row-reverse flex-1 overflow-hidden relative">
          {/* Sidebar Navigation */}
          <div
            className={`${isNavAccordionOpen ? "w-56" : "w-16"} bg-[#f8f9fa] border-r border-gray-300 shadow-sm shrink-0 relative z-20 hidden md:flex transition-all duration-300`}
          >
            <div className="flex-1 flex flex-col gap-2 p-4 pt-10 overflow-y-auto overflow-x-hidden custom-scrollbar pb-24">
              {isNavAccordionOpen && (
                <>
                  <div className="flex flex-col gap-2 mb-3 pb-2 border-b border-gray-300">
                    <div className="flex items-center justify-center gap-2 px-2">
                      <div className="w-2 h-2 rounded-full bg-[#b90000]"></div>
                      <span className="text-[16px] font-bold text-gray-800 text-center tracking-tight">
                        لیست فرمها
                      </span>
                    </div>

                    {/* Mode Selector Right in the List of Forms section */}
                    {false && isTestMode && (
                      <div className="mt-2 bg-white p-2 rounded border border-gray-200 shadow-xs flex flex-col gap-1 select-none text-right">
                        <div className="text-[10px] font-bold text-gray-400 mb-1 border-b border-gray-100 pb-0.5">
                          حالت اجرای نرم‌افزار (توسعه):
                        </div>

                        <button
                          id="mode-strict-btn"
                          onClick={() => handleSetExecutionMode("STRICT")}
                          className={`w-full px-2 py-1 rounded transition-all flex items-center gap-1.5 text-[10px] font-extrabold cursor-pointer justify-start text-right ${
                            executionMode === "STRICT"
                              ? "bg-[#b90000] text-white shadow-xs border border-red-400"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 bg-transparent"
                          }`}
                          title="STRICT MODE"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${executionMode === "STRICT" ? "bg-white animate-pulse" : "bg-red-600"}`}
                          />
                          سخت‌گیرانه (حالت ۱)
                        </button>

                        <button
                          id="mode-controlled-btn"
                          onClick={() => handleSetExecutionMode("CONTROLLED")}
                          className={`w-full px-2 py-1 rounded transition-all flex items-center gap-1.5 text-[10px] font-extrabold cursor-pointer justify-start text-right ${
                            executionMode === "CONTROLLED"
                              ? "bg-[#d97706] text-white shadow-xs border border-amber-400"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 bg-transparent"
                          }`}
                          title="CONTROLLED MODE"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${executionMode === "CONTROLLED" ? "bg-white" : "bg-amber-600"}`}
                          />
                          کنترل‌شده (حالت ۲)
                        </button>

                        <button
                          id="mode-creative-btn"
                          onClick={() => handleSetExecutionMode("CREATIVE")}
                          className={`w-full px-2 py-1 rounded transition-all flex items-center gap-1.5 text-[10px] font-extrabold cursor-pointer justify-start text-right ${
                            executionMode === "CREATIVE"
                              ? "bg-[#059669] text-white shadow-xs border border-emerald-400"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 bg-transparent"
                          }`}
                          title="CREATIVE MODE"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${executionMode === "CREATIVE" ? "bg-white" : "bg-emerald-600"}`}
                          />
                          خلاقیت آزاد (حالت ۳)
                        </button>

                        <div className="mt-1.5 text-[9px] text-gray-500 bg-gray-50 p-1.5 rounded leading-relaxed border border-gray-100">
                          {executionMode === "STRICT" &&
                            "«اگر گفته نشده، وجود ندارد». هرگونه خلاقیت یا امکان ناخواسته غیرفعال است."}
                          {executionMode === "CONTROLLED" &&
                            "تنها گزینه‌های تاییدشده مجاز است. هر نوع نوآوری به تایید نیاز دارد."}
                          {executionMode === "CREATIVE" &&
                            "ایده‌پردازی و ایجاد گزینه‌های آزمایشی نوآورانه آزاد است."}
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSetActiveForm("status")}
                    className={`px-4 py-3 text-right rounded text-sm transition-colors cursor-pointer select-none ${
                      activeForm === "status"
                        ? "bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold"
                        : "hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent"
                    }`}
                  >
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="تعیین وضعیت قرارداد"
                    />
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSetActiveForm("request")}
                    className={`px-4 py-3 text-right rounded text-sm transition-colors cursor-pointer select-none ${
                      activeForm === "request"
                        ? "bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold"
                        : "hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent"
                    }`}
                  >
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="ثبت درخواست قرارداد"
                    />
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSetActiveForm("review")}
                    className={`px-4 py-3 text-right rounded text-sm transition-colors cursor-pointer select-none ${
                      activeForm === "review"
                        ? "bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold"
                        : "hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent"
                    }`}
                  >
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="بررسی درخواست توسط ..."
                    />
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSetActiveForm("legalReview")}
                    className={`px-4 py-3 text-right rounded text-sm transition-colors cursor-pointer select-none ${
                      activeForm === "legalReview"
                        ? "bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold"
                        : "hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent"
                    }`}
                  >
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="بررسی قرارداد در حقوقی"
                    />
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSetActiveForm("financeReview")}
                    className={`px-4 py-3 text-right rounded text-sm transition-colors cursor-pointer select-none ${
                      activeForm === "financeReview"
                        ? "bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold"
                        : "hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent"
                    }`}
                  >
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="بررسی قرارداد توسط کارشناس مالی"
                    />
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSetActiveForm("reviewCopy")}
                    className={`px-4 py-3 text-right rounded text-sm transition-colors cursor-pointer select-none ${
                      activeForm === "reviewCopy"
                        ? "bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold"
                        : "hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent"
                    }`}
                  >
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="بررسی ذینفع مالی پارس/هلدینگ"
                    />
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSetActiveForm("finManagerReview")}
                    className={`px-4 py-3 text-right rounded text-sm transition-colors cursor-pointer select-none ${
                      activeForm === "finManagerReview"
                        ? "bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold"
                        : "hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent"
                    }`}
                  >
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="بررسی قرارداد توسط مدیر مالی"
                    />
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      handleSetActiveForm("holdingFinManagerReview")
                    }
                    className={`px-4 py-3 text-right rounded text-sm transition-colors cursor-pointer select-none ${
                      activeForm === "holdingFinManagerReview"
                        ? "bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold"
                        : "hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent"
                    }`}
                  >
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="بررسی قرارداد توسط مدیر مالی (هلدینگ)"
                    />
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSetActiveForm("legalSummary")}
                    className={`px-4 py-3 text-right rounded text-sm transition-colors cursor-pointer select-none ${
                      activeForm === "legalSummary"
                        ? "bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold"
                        : "hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent"
                    }`}
                  >
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="جمع بندی قرارداد در حقوقی"
                    />
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSetActiveForm("supplierReview")}
                    className={`px-4 py-3 text-right rounded text-sm transition-colors cursor-pointer select-none ${
                      activeForm === "supplierReview"
                        ? "bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold"
                        : "hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent"
                    }`}
                  >
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="بررسی قرارداد توسط تامین کننده/متقاضی"
                    />
                  </div>

                  {customForms.map((cf) => (
                    <div
                      key={cf.id}
                      className="group/cf relative flex items-center justify-between"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSetActiveForm(cf.id)}
                        className={`flex-1 flex items-center gap-2 pl-8 pr-4 py-3 text-right rounded text-sm transition-colors cursor-pointer select-none ${
                          activeForm === cf.id
                            ? "bg-[#fff1f1] text-[#a80000] border border-[#f4b8b8] shadow-sm font-bold"
                            : "hover:bg-gray-200 text-gray-700 bg-transparent border border-transparent"
                        }`}
                      >
                        {cf.image ? (
                          <img
                            src={cf.image}
                            className="w-5 h-5 rounded object-cover"
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded bg-red-100 flex items-center justify-center text-[#a80000] text-xs font-bold">
                            {cf.name.charAt(0)}
                          </div>
                        )}
                        <span className="truncate">{cf.name}</span>
                      </div>
                      {!isDeployed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmFormId(cf.id);
                          }}
                          className="absolute left-2 opacity-60 hover:opacity-100 p-1 text-red-600 hover:text-red-700 rounded bg-white hover:bg-red-50 border border-red-100 hover:border-red-300 shadow-xs transition-opacity cursor-pointer z-10"
                          title="حذف فرم سفارشی"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}

                  {!isDeployed && (
                    <div className="px-2 py-2 mt-1">
                      <button
                        onClick={() => {
                          setIsAddFormOpen(true);
                          setShouldCopy(false);
                          setNewFormBaseKey("blank");
                          setModalFields([]);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-[#a80000] border border-dashed border-red-300 hover:border-red-400 rounded text-xs font-extrabold transition-all shadow-xs cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>نمونه‌سازی فرم جدید</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {isNavAccordionOpen && (
                <div className="mt-auto pt-4 border-t border-gray-300 text-center text-[10px] text-gray-500 font-medium">
                  <div className="font-bold">
                    <EditableText
                      isTestMode={isTestMode}
                      defaultText="طراحی و توسعه مهربد عدیلی"
                    />
                  </div>
                  <div>Contract Conclusion LE-01-3-1</div>

                  {isTestMode && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSetActiveForm("guide")}
                      className={`mt-3 w-full px-2 py-1.5 rounded text-[11px] transition-all border flex items-center justify-center gap-2 cursor-pointer select-none ${
                        activeForm === "guide"
                          ? "bg-amber-100 text-amber-900 border-amber-400 font-bold shadow-sm"
                          : "bg-amber-50/50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      <BookOpen size={12} />
                      <span>
                        <EditableText
                          isTestMode={isTestMode}
                          defaultText="راهنمای راهبری"
                        />
                      </span>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setIsNavAccordionOpen(!isNavAccordionOpen)}
                className="absolute -right-3 top-24 flex items-center justify-center w-6 h-6 bg-white hover:bg-gray-50 rounded-full border border-gray-300 text-gray-400 hover:text-[#b90000] transition-all shadow-sm z-30 group"
                title={isNavAccordionOpen ? "بستن منو" : "بازکردن منو"}
              >
                <ChevronRight
                  size={12}
                  className={`transition-transform duration-300 ${isNavAccordionOpen ? "rotate-180" : "rotate-0"}`}
                />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 h-screen overflow-y-auto relative">
            <div className="p-4 md:p-8 pb-32">
              {/* Mobile Navigation Dropdown */}
              <div className="md:hidden mb-4">
                <select
                  className="w-full p-2 border border-gray-300 rounded shadow-sm bg-white font-bold text-gray-700"
                  value={activeForm}
                  onChange={(e) => handleSetActiveForm(e.target.value)}
                >
                  <option value="status">تعیین وضعیت قرارداد</option>
                  <option value="request">ثبت درخواست قرارداد</option>
                  <option value="review">بررسی درخواست توسط ...</option>
                  <option value="legalReview">بررسی قرارداد در حقوقی</option>
                  <option value="financeReview">
                    بررسی قرارداد توسط کارشناس مالی
                  </option>
                  <option value="holdingFinManagerReview">
                    بررسی قرارداد توسط مدیر مالی (هلدینگ)
                  </option>
                  <option value="reviewCopy">
                    بررسی ذینفع مالی پارس/هلدینگ
                  </option>
                  <option value="legalSummary">
                    جمع بندی قرارداد در حقوقی
                  </option>
                  <option value="supplierReview">
                    بررسی قرارداد توسط تامین کننده/متقاضی
                  </option>
                  {customForms.map((cf) => (
                    <option key={cf.id} value={cf.id}>
                      {cf.name} (سفارشی)
                    </option>
                  ))}
                  {isTestMode && <option value="guide">راهنمای راهبری</option>}
                </select>

                {/* Mode Selector for Mobile */}
                {isTestMode && (
                  <div className="hidden mt-2 bg-white p-2 rounded border border-gray-200 shadow-xs flex flex-col gap-1.5 select-none text-right">
                    <div className="text-[10px] font-bold text-gray-400 border-b border-gray-100 pb-0.5">
                      حالت اجرای نرم‌افزار (توسعه):
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleSetExecutionMode("STRICT")}
                        className={`px-1.5 py-1 rounded transition-all flex items-center justify-center gap-1.5 text-[9px] font-extrabold cursor-pointer border ${
                          executionMode === "STRICT"
                            ? "bg-[#b90000] text-white border-red-400"
                            : "text-gray-600 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        سخت‌گیرانه (۱)
                      </button>
                      <button
                        onClick={() => handleSetExecutionMode("CONTROLLED")}
                        className={`px-1.5 py-1 rounded transition-all flex items-center justify-center gap-1.5 text-[9px] font-extrabold cursor-pointer border ${
                          executionMode === "CONTROLLED"
                            ? "bg-[#d97706] text-white border-amber-400"
                            : "text-gray-600 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        کنترل‌شده (۲)
                      </button>
                      <button
                        onClick={() => handleSetExecutionMode("CREATIVE")}
                        className={`px-1.5 py-1 rounded transition-all flex items-center justify-center gap-1.5 text-[9px] font-extrabold cursor-pointer border ${
                          executionMode === "CREATIVE"
                            ? "bg-[#059669] text-white border-emerald-400"
                            : "text-gray-600 border-transparent hover:bg-gray-100"
                        }`}
                      >
                        خلاقیت آزاد (۳)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {resolvedCustomForm && (
                <div className="mb-6 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-center gap-4 text-right">
                  {resolvedCustomForm.image ? (
                    <img
                      src={resolvedCustomForm.image}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover border border-red-200 shadow-xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-[#a80000] text-white font-extrabold flex items-center justify-center text-xl shadow-xs shrink-0 select-none">
                      {resolvedCustomForm.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-[#b90000] text-white text-[9px] px-1.5 py-0.5 rounded-xs font-bold font-sans">
                        ایجاد شده در پروژه من
                      </span>
                      <h2 className="text-base font-black text-gray-800">
                        {resolvedCustomForm.name}
                      </h2>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      این فرم به صورت پویا از روی ساختار انحصاری{" "}
                      <span className="font-bold text-[#b90000]">
                        «
                        {resolvedCustomForm.baseFormKey === "status"
                          ? "تعیین وضعیت قرارداد"
                          : resolvedCustomForm.baseFormKey === "request"
                            ? "ثبت درخواست قرارداد"
                            : resolvedCustomForm.baseFormKey === "review"
                              ? "بررسی درخواست توسط ..."
                              : resolvedCustomForm.baseFormKey === "legalReview"
                                ? "بررسی قرارداد در حقوقی"
                                : resolvedCustomForm.baseFormKey ===
                                    "financeReview"
                                  ? "بررسی قرارداد توسط کارشناس مالی"
                                  : resolvedCustomForm.baseFormKey ===
                                      "reviewCopy"
                                    ? "بررسی ذینفع مالی پارس/هلدینگ"
                                    : resolvedCustomForm.baseFormKey ===
                                        "finManagerReview"
                                      ? "بررسی قرارداد توسط مدیر مالی"
                                      : resolvedCustomForm.baseFormKey ===
                                          "holdingFinManagerReview"
                                        ? "بررسی قرارداد توسط مدیر مالی (هلدینگ)"
                                        : resolvedCustomForm.baseFormKey ===
                                            "legalSummary"
                                          ? "جمع بندی قرارداد در حقوقی"
                                          : resolvedCustomForm.baseFormKey ===
                                              "supplierReview"
                                            ? "بررسی قرارداد توسط تامین کننده/متقاضی"
                                            : "فرم مبدا"}
                        »
                      </span>{" "}
                      کپی‌برداری و نمونه‌سازی شده است.
                    </p>
                  </div>

                  {!isDeployed && (
                    <button
                      onClick={() => {
                        setDeleteConfirmFormId(resolvedCustomForm.id);
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer border border-red-500 mr-auto self-start md:self-center"
                      title="حذف کامل این فرم اختصاصی"
                    >
                      <Trash2 size={13} />
                      <span>حذف کامل فرم</span>
                    </button>
                  )}
                </div>
              )}

              {resolvedBaseKey === "status" ? (
                <FormStatus
                  contractType={contractType}
                  setContractType={setContractType}
                  isAddendum={isAddendum}
                  setIsAddendum={setIsAddendum}
                  hasTemplate={hasTemplate}
                  setHasTemplate={setHasTemplate}
                  isTestMode={isTestMode}
                />
              ) : resolvedBaseKey === "review" ? (
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
              ) : resolvedBaseKey === "legalReview" ? (
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
              ) : resolvedBaseKey === "finManagerReview" ? (
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
              ) : resolvedBaseKey === "holdingFinManagerReview" ? (
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
              ) : resolvedBaseKey === "financeReview" ? (
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
              ) : resolvedBaseKey === "reviewCopy" ? (
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
              ) : resolvedBaseKey === "legalSummary" ? (
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
              ) : resolvedBaseKey === "supplierReview" ? (
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
              ) : resolvedBaseKey === "guide" ? (
                <SoftwareGuide />
              ) : resolvedBaseKey === "blank" ? (
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 text-right relative">
                  <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100">
                    <span className="w-2.5 h-6 bg-[#297c83] rounded-full"></span>
                    <h3 className="text-base font-black text-gray-800">
                      طراحی اختصاصی فرم جدید
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                    این فرم به عنوان یک{" "}
                    <span className="text-[#a80000] font-bold">
                      فرم تجاری کاملاً جدید و خام
                    </span>{" "}
                    ساخته شده است. بدنه و فیلدهای این فرم بر اساس ساختاری است که
                    شما در لحظه ساخت تعیین نموده‌اید یا به صورت پویا در زیر
                    اضافه می‌کنید.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6 border border-dashed border-gray-200 text-center text-xs text-gray-400">
                    <div className="font-bold text-gray-600 mb-1">
                      ساخت و چیدمان شخصی‌سازی شده
                    </div>
                    تمام فیلدها و اطلاعات ورودی تکمیل‌شده زیر، مستقیماً متعلق به
                    این فرم بوده و در حافظه ذخیره می‌گردند.
                  </div>
                </div>
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
              {activeForm !== "guide" && (
                <DynamicFormFields formId={activeForm} />
              )}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 md:right-56 bg-white border-t border-gray-300 py-3 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.08)] z-20">
          <div className="w-full max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-8">
            <div className="flex items-center gap-3">
              {!isDeployed && (
                <label className="flex items-center gap-2 cursor-pointer bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-200 shadow-sm transition-all hover:bg-red-100">
                  <input
                    type="checkbox"
                    checked={isTestMode}
                    onChange={(e) => handleSetTestMode(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500 border-red-300"
                  />
                  <span>ویرایش فرم (Bizagi Dev)</span>
                </label>
              )}
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

      {isAddFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto font-sans"
          dir="rtl"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden text-right leading-relaxed flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#297c83] to-[#1c5459] text-white p-4 flex justify-between items-center sm:flex-row-reverse select-none">
              <h3 className="text-base font-black">
                ساخت و نمونه‌سازی فرم تجاری جدید
              </h3>
              <button
                onClick={() => {
                  setIsAddFormOpen(false);
                  setNewFormName("");
                  setNewFormImage("");
                  setModalFields([]);
                }}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body with scrolling */}
            <div className="p-6 flex-1 overflow-y-auto space-y-5">
              {/* Step 1: Form Name */}
              <div className="space-y-1.5 text-right">
                <label className="block text-xs font-black text-gray-700">
                  نام فرم سفارشی:
                </label>
                <input
                  type="text"
                  placeholder="مثال: بررسی نهایی توسط قائم مقام مدیرعامل"
                  value={newFormName}
                  onChange={(e) => setNewFormName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 font-medium"
                />
              </div>

              {/* Step 2: Copy from Previous forms (OPTIONAL CHICE) */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-right space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer selection:bg-transparent">
                  <input
                    type="checkbox"
                    checked={shouldCopy}
                    onChange={(e) => {
                      setShouldCopy(e.target.checked);
                      if (e.target.checked) {
                        setNewFormBaseKey("request");
                      } else {
                        setNewFormBaseKey("blank");
                      }
                    }}
                    className="w-4 h-4 rounded text-[#297c83] focus:ring-[#297c83] border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs font-black text-gray-800">
                    مایل به کپی‌برداری ساختار از فرم‌های موجود هستم
                  </span>
                </label>

                {shouldCopy && (
                  <div
                    className="space-y-1.5 pt-3 border-t border-gray-200"
                    dir="rtl"
                  >
                    <label className="block text-[11px] font-black text-gray-700">
                      انتخاب فرم مبدأ جهت تکثیر ساختار:
                    </label>
                    <p className="text-[10px] text-gray-500 mb-1 leading-normal">
                      برای تسریع در طراحی، یکی از فرم‌های از پیش تعریف شده را به
                      عنوان مبنا انتخاب کنید. کلیه گام‌ها و اطلاعات آن در فرم
                      جدید تعبیه خواهند شد.
                    </p>
                    <select
                      value={newFormBaseKey}
                      onChange={(e) => setNewFormBaseKey(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:focus:border-[#297c83] bg-white font-medium text-gray-700"
                    >
                      <option value="status">تعیین وضعیت قرارداد</option>
                      <option value="request">ثبت درخواست قرارداد</option>
                      <option value="review">بررسی درخواست توسط ...</option>
                      <option value="legalReview">
                        بررسی قرارداد در حقوقی
                      </option>
                      <option value="financeReview">
                        بررسی قرارداد توسط کارشناس مالی
                      </option>
                      <option value="reviewCopy">
                        بررسی ذینفع مالی پارس/هلدینگ
                      </option>
                      <option value="finManagerReview">
                        بررسی قرارداد توسط مدیر مالی
                      </option>
                      <option value="holdingFinManagerReview">
                        بررسی قرارداد توسط مدیر مالی (هلدینگ)
                      </option>
                      <option value="legalSummary">
                        جمع بندی قرارداد در حقوقی
                      </option>
                      <option value="supplierReview">
                        بررسی قرارداد توسط تامین کننده/متقاضی
                      </option>
                      {customForms.length > 0 && (
                        <>
                          <option disabled className="text-gray-400">
                            ────────────────────────
                          </option>
                          {customForms.map((cf) => (
                            <option key={cf.id} value={cf.id}>
                              {cf.name} (فرم سفارشی ثبت‌شده)
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                )}
              </div>

              {/* Step 3: Interactive Dynamic Fields Builder */}
              <div className="space-y-3 p-4 rounded-lg border border-teal-100 bg-[#fbfdfd] text-right">
                <div className="flex justify-between items-center sm:flex-row-reverse">
                  <span className="text-xs font-black text-gray-800">
                    🛠️ ساخت فیلدها و کادرهای اختصاصی (در همین‌جا):
                  </span>
                  <button
                    onClick={() => {
                      const newField = {
                        id: `dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                        label: "",
                        type: "text",
                        required: false,
                      };
                      setModalFields([...modalFields, newField]);
                    }}
                    className="flex items-center gap-1 p-1 px-3 bg-[#297c83] text-white hover:bg-[#1f6065] rounded text-[10px] font-bold transition-all shadow-xs cursor-pointer select-none"
                  >
                    <Plus size={11} />
                    <span>افزودن فیلد جدید</span>
                  </button>
                </div>

                <p className="text-[10px] text-gray-500 leading-relaxed">
                  می‌توانید کادرهای ورودی، چک‌باکس‌ها یا تاریخ‌های اختصاصی مدنظر
                  خود را مستقیماً در همین بخش بسازید تا فرم نهایی با این فیلدها
                  نمونه‌سازی شود.
                </p>

                {modalFields.length === 0 ? (
                  <div className="text-center py-4 bg-white/60 border border-dashed border-gray-200 rounded text-[10px] text-gray-400 font-medium">
                    هنوز فیلدی اضافه‌ نکرده‌اید. با دکمه بالا اولین کادر سفارشی
                    را طراحی کنید.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {modalFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 space-y-2.5 relative shadow-xs"
                      >
                        <div className="flex justify-between items-center sm:flex-row-reverse">
                          <span className="text-[9px] bg-cyan-50 text-cyan-800 font-extrabold px-2 py-0.5 rounded-sm">
                            فیلد سفارشی {idx + 1}
                          </span>
                          <button
                            onClick={() => {
                              setModalFields(
                                modalFields.filter((f) => f.id !== field.id),
                              );
                            }}
                            className="text-gray-400 hover:text-red-500 cursor-pointer p-0.5"
                            title="حذف فیلد"
                          >
                            <X size={12} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-right">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-black text-gray-500">
                              عنوان فیلد:
                            </label>
                            <input
                              type="text"
                              placeholder="مثال: شماره پیگیری رسمی"
                              value={field.label}
                              onChange={(e) => {
                                const updated = [...modalFields];
                                updated[idx].label = e.target.value;
                                setModalFields(updated);
                              }}
                              className="w-full border border-gray-250 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#297c83] bg-white font-medium"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[9px] font-black text-gray-500">
                              نوع فیلد ورودی:
                            </label>
                            <select
                              value={field.type}
                              onChange={(e) => {
                                const updated = [...modalFields];
                                updated[idx].type = e.target.value;
                                setModalFields(updated);
                              }}
                              className="w-full border border-gray-250 rounded px-2.5 py-1 text-xs focus:outline-none bg-white font-medium text-gray-700"
                            >
                              <option value="text">متن کوتاه</option>
                              <option value="textarea">توضیحات چندخطی</option>
                              <option value="number">عدد</option>
                              <option value="date">تاریخ شمسی</option>
                              <option value="checkbox">
                                چک‌باکس (تاییدیه)
                              </option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 select-none">
                          <input
                            type="checkbox"
                            id={`req_${field.id}`}
                            checked={field.required}
                            onChange={(e) => {
                              const updated = [...modalFields];
                              updated[idx].required = e.target.checked;
                              setModalFields(updated);
                            }}
                            className="w-3.5 h-3.5 rounded text-[#297c83] focus:ring-[#297c83] border-gray-300 cursor-pointer"
                          />
                          <label
                            htmlFor={`req_${field.id}`}
                            className="text-[10px] text-gray-600 font-bold cursor-pointer"
                          >
                            فیلد اجباری است{" "}
                            <span className="text-red-500 font-black">
                              (علامت‌گذاری با خط قرمز کناری)
                            </span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 4: Form Image Add */}
              <div className="space-y-2 text-right text-sm font-sans" dir="rtl">
                <label className="block text-xs font-black text-gray-700 font-sans">
                  افزودن تصویر/نماد اختصاصی فرم:
                </label>
                <p className="text-[10px] text-gray-500 leading-normal">
                  می‌توانید تصویر دلخواه خود یا یکی از نمادهای آماده زیر را به
                  عنوان نماد شاخص این فرم در منوی ناوبری تعیین فرمایید:
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {/* File upload drag drop zone */}
                  <div className="border border-dashed border-gray-300 hover:border-[#297c83] rounded-lg p-3 text-center transition-colors relative cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[96px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <Plus size={20} className="text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-600">
                      بارگذاری تصویر از سیستم
                    </span>
                  </div>

                  {/* Preview or Preset Selection */}
                  <div className="border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center bg-gray-50 gap-2 min-h-[96px]">
                    {newFormImage ? (
                      <div className="relative">
                        <img
                          src={newFormImage}
                          alt="Form Icon Preview"
                          className="w-12 h-12 rounded object-cover border border-gray-200"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => setNewFormImage("")}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm cursor-pointer"
                          title="حذف تصویر"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-medium font-sans">
                        عدم انتخاب تصویر
                      </span>
                    )}
                    <span className="text-[9px] text-gray-400 font-bold font-sans">
                      پیش‌نمایش نماد
                    </span>
                  </div>
                </div>

                {/* Presets suggestions */}
                <div className="space-y-1 mt-2">
                  <span className="text-[9px] text-gray-400 font-bold block">
                    الگوهای آماده برای نماد فرم:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        setNewFormImage(
                          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=120&auto=format&fit=crop&q=60",
                        )
                      }
                      className="px-2 py-1 text-[9px] bg-sky-50 text-sky-800 hover:bg-sky-100 rounded border border-sky-200 transition-colors cursor-pointer"
                    >
                      💼 اداری / مدیریت
                    </button>
                    <button
                      onClick={() =>
                        setNewFormImage(
                          "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=120&auto=format&fit=crop&q=60",
                        )
                      }
                      className="px-2 py-1 text-[9px] bg-red-50 text-red-800 hover:bg-red-100 rounded border border-red-200 transition-colors cursor-pointer"
                    >
                      ⚖️ حقوقی / دادگستری
                    </button>
                    <button
                      onClick={() =>
                        setNewFormImage(
                          "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=60",
                        )
                      }
                      className="px-2 py-1 text-[9px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors cursor-pointer"
                    >
                      📊 مالی / حسابرسی
                    </button>
                    <button
                      onClick={() =>
                        setNewFormImage(
                          "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=120&auto=format&fit=crop&q=60",
                        )
                      }
                      className="px-2 py-1 text-[9px] bg-amber-50 text-amber-800 hover:bg-amber-100 rounded border border-amber-200 transition-colors cursor-pointer"
                      title="تامین کنندگان"
                    >
                      🤝 تامین / خرید
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="bg-gray-50 border-t border-gray-100 p-4 flex justify-end gap-2.5 sm:flex-row-reverse"
              dir="rtl"
            >
              <button
                onClick={() => {
                  if (!newFormName.trim()) {
                    alert("لطفاً نامی برای فرم جدید وارد کنید.");
                    return;
                  }
                  const resolveFormBaseKey = (key: string): string => {
                    if (key.startsWith("custom_")) {
                      const found = customForms.find((f) => f.id === key);
                      return found ? found.baseFormKey : "blank";
                    }
                    return key;
                  };

                  const updatedForm = {
                    id: `custom_${Date.now()}`,
                    name: newFormName.trim(),
                    baseFormKey: shouldCopy
                      ? resolveFormBaseKey(newFormBaseKey)
                      : "blank",
                    image: newFormImage || undefined,
                    createdAt: new Date().toISOString(),
                  };

                  // Clone dynamic custom fields from the origin base form if copying is requested
                  let copiedFields: any[] = [];
                  if (shouldCopy && newFormBaseKey) {
                    const savedBaseFields = localStorage.getItem(
                      `dynamic_fields_${newFormBaseKey}`,
                    );
                    if (savedBaseFields) {
                      try {
                        const parsed = JSON.parse(savedBaseFields);
                        if (Array.isArray(parsed)) {
                          copiedFields = parsed.map((f: any) => ({
                            ...f,
                            id: `dyn_${Date.now()}_${Math.floor(Math.random() * 100000)}_${f.id.replace(/dyn_|[0-9_]/g, "")}`,
                          }));
                        }
                      } catch (e) {
                        console.error("Error copying dynamic fields", e);
                      }
                    }
                  }

                  // Merge with newly designed fields from the builder modal
                  const allFields = [...copiedFields];
                  if (modalFields.length > 0) {
                    const processed = modalFields.map((f) => ({
                      ...f,
                      label: (f.label || "").trim() || "فیلد ثبت شده اختصاصی",
                    }));
                    allFields.push(...processed);
                  }

                  if (allFields.length > 0) {
                    localStorage.setItem(
                      `dynamic_fields_${updatedForm.id}`,
                      JSON.stringify(allFields),
                    );
                  }

                  setCustomForms((prev) => [...prev, updatedForm]);
                  handleSetActiveForm(updatedForm.id);
                  setNewFormName("");
                  setNewFormImage("");
                  setModalFields([]);
                  setIsAddFormOpen(false);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#297c83] hover:bg-[#1c5459] rounded-lg transition-colors shadow cursor-pointer"
              >
                ایجاد و ساخت فرم جدید
              </button>
              <button
                onClick={() => {
                  setIsAddFormOpen(false);
                  setNewFormName("");
                  setNewFormImage("");
                  setModalFields([]);
                }}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmFormId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto font-sans text-right animate-fade-in"
          dir="rtl"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-red-100 max-w-md w-full overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-red-700 to-[#a80000] text-white p-4 flex justify-between items-center sm:flex-row-reverse select-none">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Trash2 size={16} />
                <span>حذف قطعی فرم اختصاصی</span>
              </h3>
              <button
                onClick={() => setDeleteConfirmFormId(null)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-700 leading-relaxed">
                آیا از حذف کامل فرم سفارشی{" "}
                <span className="font-extrabold text-[#b90000]">
                  «
                  {customForms.find((f) => f.id === deleteConfirmFormId)
                    ?.name || "فرم جاری"}
                  »
                </span>{" "}
                اطمینان دارید؟
              </p>
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-[11px] text-red-800 leading-relaxed font-medium">
                ⚠️ <strong>توجه:</strong> با حذف این فرم، کلیه ساختارها، فیلدها
                و داده‌های ذخیره‌شده کاربران در آن به صورت قطعی پاک شده و آماده
                بازیابی نخواهد بود.
              </div>
            </div>

            <div
              className="bg-gray-50 border-t border-gray-150 p-4 flex justify-end gap-2.5 sm:flex-row-reverse"
              dir="rtl"
            >
              <button
                onClick={() => {
                  const idToDelete = deleteConfirmFormId;
                  setCustomForms((prev) =>
                    prev.filter((f) => f.id !== idToDelete),
                  );
                  localStorage.removeItem(`dynamic_fields_${idToDelete}`);
                  if (activeForm === idToDelete) {
                    handleSetActiveForm("request");
                  }
                  setDeleteConfirmFormId(null);
                }}
                className="px-5 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                بله، قطعاً حذف شود
              </button>
              <button
                onClick={() => setDeleteConfirmFormId(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-150 rounded-lg transition-colors cursor-pointer border border-gray-200 bg-white"
              >
                انصراف و لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </TestModeContext.Provider>
  );
}
