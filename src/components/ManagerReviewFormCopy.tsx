import React, { useState, ReactNode } from 'react';
import { Paperclip, GripVertical, ChevronDown } from 'lucide-react';
import { FieldRow, FieldRowTop } from './FormComponents';
import { BizagiDevNotes, DevNoteItem, DraggableField, EditableText } from './EditableText';
import { Reorder, useDragControls } from "motion/react";

export interface ManagerReviewFormCopyProps {
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

export function ManagerReviewFormCopy({
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
}: ManagerReviewFormCopyProps) {
  const [activeTab, setActiveTab] = useState<'review' | 'contractInfo'>('review');
  const isBarterContract = typeof contractType === "string" && contractType.includes("تهاتر");

  const [decision, setDecision] = useState<string>('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<boolean>(false);

  const [order, setOrder] = useState(() => {
    const saved = localStorage.getItem('reviewFormCopy_order');
    return saved ? JSON.parse(saved) : ['decision', 'attachment', 'description'];
  });
  const [labels, setLabels] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('reviewFormCopy_labels');
    return saved ? JSON.parse(saved) : {
      decision: 'تصمیم اتخاذ شده:',
      attachment: 'ضمائم:',
      description: 'توضیحات:'
    };
  });

  const handleOrderChange = (newOrder: string[]) => {
    setOrder(newOrder);
    localStorage.setItem('reviewFormCopy_order', JSON.stringify(newOrder));
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
          localStorage.setItem('reviewFormCopy_labels', JSON.stringify(newLabels));
        }}
        className="w-full border border-blue-400 bg-blue-50/50 px-1 py-0.5 rounded text-[12px] font-bold text-gray-800 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
        onClick={e => e.stopPropagation()}
        placeholder={defaultLabel}
      />
    );
  };

  const [notes, setNotes] = useState<DevNoteItem[]>(() => {
    const saved = localStorage.getItem('senior_manager_review_notes_copy');
    if (saved) return JSON.parse(saved);
    return [
      {
        text: "در تب اطلاعات قرارداد امکان ویرایش به کاربر داده شود",
        targetId: "review-contract-info"
      },
      {
        text: "نمایش مشروط فیلدهای الحاقیه و قالب: فیلد 'الحاقیه' همیشه نمایش داده می‌شود، اما فیلد 'قالب‌دار' در قراردادهای تهاتری مخفی می‌گردد.",
        targetId: "review-contract-info",
        tabId: "contractInfo"
      },
      {
        text: "فیلد پیوست های تب اطلاعات قرارداد باید به این صورت باشد که بتوان به آن پیوست اضافه نمود ولی نمی توان پیوستی از آن حذف کرد",
        targetId: "review-contract-info"
      },
      {
        text: "محدودیت نوع قرارداد: فیلد نوع قرارداد در این فرم منحصراً شامل گزینه‌های تهاتر (تهاتر با نمایندگی فروش و خدمات پس از فروش، تهاتر تامین کنندگان و پیمانکاران) می‌باشد و غیرقابل ویرایش است.",
        targetId: "review-contract-type-container"
      },
      {
        text: "هشدار رد درخواست: در صورتی که تصمیم 'رد' انتخاب شود، یک باکس هشدار قرمز رنگ نمایش داده شود که کاربر را از مختومه شدن فرایند مطلع می‌کند",
        targetId: "review-decision"
      },
      {
        text: "گزینه‌های فیلد 'تصمیم اتخاذ شده' صرفاً جنبه اطلاع‌رسانی در جدول اقدامات داشته و هیچ‌گونه عملکرد سیستمی یا تغییر در فرایند ندارند.",
        targetId: "review-decision"
      }
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('senior_manager_review_notes_copy', JSON.stringify(notes));
  }, [notes]);

  const handleDevNoteAction = (targetId: string, tabId?: string) => {
    if (tabId) {
      setActiveTab(tabId as any);
    } else if (targetId === "review-contract-info" || targetId === "review-alerts-container" || targetId === "review-is-addendum-container" || targetId === "review-has-template-container" || targetId === "review-contract-type-container") {
      setActiveTab('contractInfo');
    } else {
      setActiveTab('review');
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

  const isDescriptionRequired = decision === 'رد' || decision === 'نیاز به اصلاح';

  const fieldComponents: Record<string, ReactNode> = {
    decision: (
          <FieldRow id="review-decision" label={renderLabel('decision', 'تصمیم اتخاذ شده:')} required hasValue={!!decision} labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]">
            <div className="flex items-center gap-6">
              {['تایید', 'رد', 'نیاز به اصلاح'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="decision_copy" 
                    value={option}
                    checked={decision === option}
                    onChange={() => setDecision(option)} 
                    className="w-[14px] h-[14px] text-[#b90000] focus:ring-[#b90000] border-gray-300" 
                  />
                  <span className="text-gray-700 text-sm">{option}</span>
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
    attachment: (
          <FieldRow label={renderLabel('attachment', 'ضمائم:')} labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]">
            <div 
              className="flex flex-col items-end w-full cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200 pb-1"
              onClick={() => setAttachment(true)}
            >
              <div className="flex items-center gap-1 group">
                <span className="text-gray-800">{attachment ? 'فایل بارگذاری شد' : 'فایل مربوطه را بارگذاری نمایید'}</span>
                <Paperclip size={14} className={`transition-transform group-hover:scale-110 ${attachment ? 'text-blue-500' : 'text-gray-500'}`} />
              </div>
            </div>
          </FieldRow>
    ),
    description: (
          <FieldRowTop id="review-description" label={renderLabel('description', 'توضیحات:')} required={isDescriptionRequired} hasValue={!!description} labelWidthClass="grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]">
            <textarea 
              className="w-full h-24 border border-gray-300 rounded-sm p-2 outline-none focus:border-red-500 shadow-inner resize-none text-sm disabled:bg-gray-50 disabled:text-gray-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </FieldRowTop>
    )
  };

  return (
    <div className="flex flex-col gap-4 text-gray-700 w-full max-w-4xl mx-auto xl:mr-0 pl-16 pt-4 pb-24">
      {/* Breadcrumb / Title Bar */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm px-4 py-3 flex items-center">
        <span className="text-gray-800 text-sm">
          <EditableText isTestMode={isTestMode} defaultText="درخواست انعقاد قرارداد" /> <span className="text-gray-400 mx-1">›</span> <EditableText isTestMode={isTestMode} defaultText="بررسی درخواست توسط ... (کپی)" />
        </span>
      </div>

      {/* Form Body */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button 
            className={`px-8 py-3 text-[13px] border-l border-gray-200 transition-colors ${activeTab === 'review' ? 'bg-white font-bold text-gray-800 relative z-10' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
            style={activeTab === 'review' ? { marginBottom: '-1px', borderBottom: '1px solid white' } : {}}
            onClick={() => setActiveTab('review')}
          >
            <EditableText isTestMode={isTestMode} defaultText="اعلام نظر" />
          </button>
          <button 
            className={`px-8 py-3 text-[13px] border-l border-gray-200 transition-colors ${activeTab === 'contractInfo' ? 'bg-white font-bold text-gray-800 relative z-10' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
            style={activeTab === 'contractInfo' ? { marginBottom: '-1px', borderBottom: '1px solid white' } : {}}
            onClick={() => setActiveTab('contractInfo')}
          >
            <EditableText isTestMode={isTestMode} defaultText="اطلاعات قرارداد" />
          </button>
        </div>

        {activeTab === 'review' && (
          <div className="p-6 pb-8 flex flex-col gap-6">
            <h2 className="text-[#005f77] font-bold text-[13px]">
              <EditableText isTestMode={isTestMode} defaultText="نتیجه بررسی مدیر ارشد واحد مربوطه" />
            </h2>
            
            <div className="grid grid-cols-2 text-[12px] text-gray-700">
              <div>
                <span className="font-semibold text-gray-500">
                  <EditableText isTestMode={isTestMode} defaultText="تصمیم گیرنده:" />
                </span>{' '}
                <EditableText isTestMode={isTestMode} defaultText="Mehrbod Adili" />
              </div>
              <div className="text-left font-mono text-gray-500">
                <EditableText isTestMode={isTestMode} defaultText="۰۳:۵۷  ۱۴۰۳/۵/۱۱" />
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

        {activeTab === 'contractInfo' && (
          <div id="review-contract-info" className="p-6 pb-8 flex flex-col text-[12px] text-gray-800">
            {/* Pink Warning Banner or Barter Specific Warning Info Box */}
            <div id="review-alerts-container" className="transition-all duration-300 rounded-sm">
                <div id="review-barter-alert" className="bg-amber-50 text-amber-950 border border-amber-300 p-4 rounded-sm text-xs md:text-sm font-semibold mb-6 leading-relaxed shadow-sm">
                  <div className="text-[#b90000] mb-2 font-bold flex items-center gap-1.5">
                    💡 جهت بررسی صورتجلسات تهاتر بارگذاری اسناد ذیل ضروری است:
                  </div>
                  <ul className="list-decimal list-inside space-y-1.5 pr-2 text-gray-800">
                    <li>قرار‌داد/صورتحساب/ فاکتور/چک مورد تهاتر</li>
                    <li><EditableText isTestMode={isTestMode} defaultText="قرارداد فروش" /></li>
                    <li><EditableText isTestMode={isTestMode} defaultText="فایل ورد تهاتر" /></li>
                  </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              {/* row 1 */}
              <div id="review-is-addendum-container" className="grid grid-cols-[180px_1fr] items-center p-1 rounded transition-all duration-300">
                <div className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="درخواست، الحاقیه است؟:" /></div>
                <div className="text-gray-600">
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
                    <option value="">- لطفاً انتخاب کنید...</option>
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
                    <div className="text-gray-600">
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
                        <option value="">- لطفاً انتخاب کنید...</option>
                        <option value="بله">بله</option>
                        <option value="خیر">خیر</option>
                      </select>
                    </div>
                  </div>
                  <div></div>
                </>
              )}

              {/* row 3 */}
              <div id="review-contract-type-container" className="grid grid-cols-[180px_1fr] items-center p-1 rounded transition-all duration-300">
                <div className="font-bold text-gray-800"><EditableText isTestMode={isTestMode} defaultText="نوع قرارداد:" /></div>
                <div className="text-gray-655">
                  <select 
                    value={contractType} 
                    disabled={true}
                    onChange={() => {}}
                    className="w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 bg-gray-100 text-gray-500 cursor-not-allowed text-xs shadow-sm"
                  >
                    <option value={contractType}>{contractType || "- لطفاً انتخاب کنید -"}</option>
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
                    className="w-full max-w-[250px] border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 text-xs shadow-sm"
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

            <div className="grid grid-cols-[auto_1fr] items-center mt-6 gap-x-2">
              <div className="font-bold text-gray-800 w-[180px]">
                <EditableText isTestMode={isTestMode} defaultText="ضمائم قرارداد:" />
              </div>
              <div className="text-gray-800">
                <EditableText isTestMode={isTestMode} defaultText="فایل مربوطه را بارگذاری نمایید" />
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center mt-4 gap-x-2">
              <div className="font-bold text-gray-800 w-[180px]">
                <EditableText isTestMode={isTestMode} defaultText="پیوست اولیه قرارداد:" />
              </div>
              {initialAttachment ? (
                <div className="text-teal-600 underline cursor-pointer text-[13px]" onClick={() => setInitialAttachment(false)}>
                  <EditableText isTestMode={isTestMode} defaultText="ثبت درخواست قرارداد.PNG" />
                </div>
              ) : (
                <div className="text-gray-500 cursor-pointer text-[13px] hover:text-teal-600" onClick={() => setInitialAttachment(true)}>
                  <EditableText isTestMode={isTestMode} defaultText="فایل مربوطه را بارگذاری نمایید" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center mt-4 gap-x-2">
              <div className="font-bold text-gray-800 w-[200px]">
                <EditableText isTestMode={isTestMode} defaultText="پیوست مدارک هویتی طرفین قرارداد:" />
              </div>
              {identityAttachment ? (
                <div className="text-teal-600 underline cursor-pointer text-[13px]" onClick={() => setIdentityAttachment(false)}>
                  <EditableText isTestMode={isTestMode} defaultText="ثبت درخواست قرارداد.PNG" />
                </div>
              ) : (
                <div className="text-gray-500 cursor-pointer text-[13px] hover:text-teal-600" onClick={() => setIdentityAttachment(true)}>
                  <EditableText isTestMode={isTestMode} defaultText="فایل مربوطه را بارگذاری نمایید" />
                </div>
              )}
            </div>

            {/* Table */}
            <div className="mt-8 border border-gray-300 rounded overflow-hidden shadow-sm">
              <div className="bg-[#cccccc] px-3 py-2 flex items-center gap-2 border-b border-gray-300 font-bold text-gray-700 text-xs">
                <ChevronDown size={14} className="text-gray-600" />
                <EditableText isTestMode={isTestMode} defaultText="اطلاعات اولیه طرف قرارداد" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-[#e6e6e6] text-gray-800 divide-x divide-x-reverse divide-gray-300 border-b border-gray-300 font-bold text-[10px]">
                      <th className="py-2.5 px-1 w-[9%] whitespace-nowrap"><EditableText isTestMode={isTestMode} defaultText="نوع طرف قرارداد" /></th>
                      <th className="py-2.5 px-1 w-[12%] whitespace-nowrap"><EditableText isTestMode={isTestMode} defaultText="نام و نام خانوادگی" /></th>
                      <th className="py-2.5 px-1 w-[9%] whitespace-nowrap"><EditableText isTestMode={isTestMode} defaultText="نام سازمان" /></th>
                      <th className="py-2.5 px-1 w-[9%] whitespace-nowrap"><EditableText isTestMode={isTestMode} defaultText="کد ملی" /></th>
                      <th className="py-2.5 px-1 w-[9%] whitespace-nowrap"><EditableText isTestMode={isTestMode} defaultText="کد اقتصادی" /></th>
                      <th className="py-2.5 px-1 w-[9%] whitespace-nowrap"><EditableText isTestMode={isTestMode} defaultText="شماره ثبت" /></th>
                      <th className="py-2.5 px-1 w-[8%] whitespace-nowrap"><EditableText isTestMode={isTestMode} defaultText="کد پستی" /></th>
                      <th className="py-2.5 px-1 w-[9%] whitespace-nowrap"><EditableText isTestMode={isTestMode} defaultText="شماره تلفن همراه" /></th>
                      <th className="py-2.5 px-1 w-[9%] whitespace-nowrap"><EditableText isTestMode={isTestMode} defaultText="شماره تماس ثابت" /></th>
                      <th className="py-2.5 px-1 w-[9%] whitespace-nowrap"><EditableText isTestMode={isTestMode} defaultText="آدرس" /></th>
                      <th className="py-2.5 px-1 w-[8%] whitespace-nowrap"><EditableText isTestMode={isTestMode} defaultText="نمایش صاحبان امضا" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {parties.map((party, index) => {
                      const updatePartyField = (field: string, val: any) => {
                        const newParties = [...parties];
                        newParties[index] = { ...newParties[index], [field]: val };
                        setParties(newParties);
                      };

                      return (
                        <tr key={party.id || index} className="divide-x divide-x-reverse divide-gray-200 border-b border-gray-200 bg-white text-[11px] h-10">
                          <td className="py-1 px-1">
                            <select 
                              value={party.type || 'حقوقی'} 
                              onChange={e => updatePartyField('type', e.target.value)} 
                              className="w-full border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-xs text-center"
                            >
                              <option value="حقیقی">حقیقی</option>
                              <option value="حقوقی">حقوقی</option>
                            </select>
                          </td>
                          <td className="py-1 px-1">
                            <input 
                              type="text" 
                              value={party.fullName || ''} 
                              onChange={e => updatePartyField('fullName', e.target.value)} 
                              className="w-full min-w-[70px] border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-center text-xs" 
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input 
                              type="text" 
                              value={party.orgName || ''} 
                              onChange={e => updatePartyField('orgName', e.target.value)} 
                              className="w-full min-w-[70px] border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-teal-650 bg-white text-center text-xs" 
                            />
                          </td>
                          <td className="py-1 px-1 tracking-wider">
                            <input 
                              type="text" 
                              value={party.type === 'حقیقی' ? (party.nationalId || '') : (party.orgNationalId || '')} 
                              onChange={e => updatePartyField(party.type === 'حقیقی' ? 'nationalId' : 'orgNationalId', e.target.value)} 
                              className="w-full min-w-[60px] border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-center dir-ltr text-xs" 
                            />
                          </td>
                          <td className="py-1 px-1 tracking-wider">
                            <input 
                              type="text" 
                              value={party.orgEconomicCode || ''} 
                              onChange={e => updatePartyField('orgEconomicCode', e.target.value)} 
                              className="w-full min-w-[60px] border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-center dir-ltr text-xs" 
                            />
                          </td>
                          <td className="py-1 px-1 tracking-wider">
                            <input 
                              type="text" 
                              value={party.orgRegNo || ''} 
                              onChange={e => updatePartyField('orgRegNo', e.target.value)} 
                              className="w-full min-w-[50px] border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-center dir-ltr text-xs" 
                            />
                          </td>
                          <td className="py-1 px-1 tracking-wider">
                            <input 
                              type="text" 
                              value={party.orgPostalCode || ''} 
                              onChange={e => updatePartyField('orgPostalCode', e.target.value)} 
                              className="w-full min-w-[50px] border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-center dir-ltr text-xs" 
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input 
                              type="text" 
                              value={party.mobile || ''} 
                              onChange={e => updatePartyField('mobile', e.target.value)} 
                              className="w-full min-w-[60px] border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-center dir-ltr text-xs" 
                            />
                          </td>
                          <td className="py-1 px-1 tracking-wider">
                            <input 
                              type="text" 
                              value={party.orgPhone || ''} 
                              onChange={e => updatePartyField('orgPhone', e.target.value)} 
                              className="w-full min-w-[60px] border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-center dir-ltr text-xs" 
                            />
                          </td>
                          <td className="py-1 px-1">
                            <input 
                              type="text" 
                              value={party.type === 'حقیقی' ? (party.address || '') : (party.orgAddress || '')} 
                              onChange={e => updatePartyField(party.type === 'حقیقی' ? 'address' : 'orgAddress', e.target.value)} 
                              className="w-full min-w-[80px] border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-teal-600 bg-white text-center text-xs" 
                            />
                          </td>
                          <td className="py-1 px-1">
                            <button className="bg-[#1f8783] text-white px-1 py-1 rounded-sm text-[9px] font-bold hover:bg-[#186a66] w-full">
                              <EditableText isTestMode={isTestMode} defaultText="نمایش صاحبان امضا" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-[#f0f0f0] h-10">
                      <td colSpan={11}></td>
                    </tr>
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
