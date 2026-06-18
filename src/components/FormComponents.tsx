import { useState, useEffect } from 'react';
import { useTestMode } from './EditableText';

function getLabelText(label: any): string {
  if (typeof label === 'string') return label;
  if (label?.props?.defaultText) return label.props.defaultText;
  if (label?.props?.children) {
    if (Array.isArray(label.props.children)) {
      return label.props.children.map(getLabelText).join('');
    }
    return getLabelText(label.props.children);
  }
  return '';
}

export function FieldRow({ id, label, required: initialRequired, hasValue, children, noMargin = false, labelWidthClass = "grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]" }: any) {
  const { isTestMode, activeForm } = useTestMode();
  
  const labelText = getLabelText(label);
  const fieldId = id || (labelText ? `auto-field-${labelText.replace(/\s+/g, '-')}` : null);

  const storageFormPrefix = activeForm ? `${activeForm}_` : '';
  const mandatoryKey = `field_mandatory_${storageFormPrefix}${fieldId}`;
  const hiddenKey = `field_hidden_${storageFormPrefix}${fieldId}`;

  const [isMandatory, setIsMandatory] = useState<boolean>(() => {
    if (!fieldId) return initialRequired || false;
    const saved = localStorage.getItem(mandatoryKey);
    return saved !== null ? saved === 'true' : (initialRequired || false);
  });
  
  const [isHidden, setIsHidden] = useState<boolean>(() => {
    if (!fieldId) return false;
    const saved = localStorage.getItem(hiddenKey);
    return saved !== null ? saved === 'true' : false;
  });

  useEffect(() => {
    if (fieldId) {
      const handleStorage = () => {
        const saved = localStorage.getItem(mandatoryKey);
        if (saved !== null) setIsMandatory(saved === 'true');
        const hiddenSaved = localStorage.getItem(hiddenKey);
        if (hiddenSaved !== null) setIsHidden(hiddenSaved === 'true');
      };
      const eventHandler = (e: any) => {
        if (e.detail.id === fieldId && e.detail.activeForm === activeForm) setIsMandatory(e.detail.value);
      };
      const hiddenHandler = (e: any) => {
        if (e.detail.id === fieldId && e.detail.activeForm === activeForm) setIsHidden(e.detail.value);
      };
      window.addEventListener('storage', handleStorage);
      window.addEventListener('field_mandatory_change', eventHandler);
      window.addEventListener('field_hidden_change', hiddenHandler);
      return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('field_mandatory_change', eventHandler);
        window.removeEventListener('field_hidden_change', hiddenHandler);
      };
    }
  }, [fieldId, activeForm, mandatoryKey, hiddenKey]);

  const toggleMandatory = (e: any) => {
    e.stopPropagation();
    if (!isTestMode || !fieldId) return;
    const newValue = !isMandatory;
    setIsMandatory(newValue);
    localStorage.setItem(mandatoryKey, String(newValue));
    window.dispatchEvent(new CustomEvent('field_mandatory_change', { detail: { id: fieldId, activeForm, value: newValue } }));
  };

  const toggleHidden = (e: any) => {
    e.stopPropagation();
    if (!isTestMode || !fieldId) return;
    const newValue = !isHidden;
    setIsHidden(newValue);
    localStorage.setItem(hiddenKey, String(newValue));
    window.dispatchEvent(new CustomEvent('field_hidden_change', { detail: { id: fieldId, activeForm, value: newValue } }));
  };

  if (!isTestMode && isHidden) return null;

  const showRedLine = isMandatory && !hasValue;

  return (
    <div id={fieldId} className={`grid ${labelWidthClass} gap-4 items-center ${noMargin ? '' : 'mb-3'} rounded p-1 transition-all duration-300 relative group  ${isHidden ? 'opacity-50 grayscale bg-gray-100' : ''}`}>
      <div className={`text-right flex items-center gap-1 ${showRedLine ? 'border-r-[3px] border-red-600 pr-2' : 'pr-[11px]'}`}>
        {isTestMode && fieldId && (
          <div className="opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex flex-col gap-1 items-stretch z-10 scale-95 shrink-0">
            <button 
              onClick={toggleMandatory} 
              className={`p-0.5 px-1 rounded font-bold text-[9px] border cursor-pointer ${isMandatory ? 'border-red-400 text-red-600 bg-red-50 hover:bg-red-100' : 'border-gray-300 text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
              title={isMandatory ? "فیلد اجباری است (کلیک برای تغییر)" : "فیلد اختیاری است (کلیک برای تغییر)"}
            >
              {isMandatory ? 'اجباری*' : 'اختیاری'}
            </button>
            <button 
              onClick={toggleHidden} 
              className={`p-0.5 px-1 rounded font-bold text-[9px] border cursor-pointer ${isHidden ? 'border-[#a80000] text-[#a80000] bg-red-50/50 hover:bg-red-50' : 'border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
              title={isHidden ? "فیلد مخفی (کلیک برای نمایش)" : "حذف/مخفی‌سازی (کلیک برای حذف)"}
            >
              {isHidden ? 'مخفی' : 'حذف/مخفی'}
            </button>
          </div>
        )}
        <span className="font-bold text-gray-800 text-[12px] whitespace-nowrap">{label}</span>
      </div>
      <div className="flex items-center justify-start text-sm text-gray-700 w-full min-w-0">
        {children}
      </div>
    </div>
  )
}

export function FieldRowTop({ id, label, required: initialRequired, hasValue, children, labelWidthClass = "grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]" }: any) {
  const { isTestMode, activeForm } = useTestMode();
  
  const labelText = getLabelText(label);
  const fieldId = id || (labelText ? `auto-field-top-${labelText.replace(/\s+/g, '-')}` : null);

  const storageFormPrefix = activeForm ? `${activeForm}_` : '';
  const mandatoryKey = `field_mandatory_${storageFormPrefix}${fieldId}`;
  const hiddenKey = `field_hidden_${storageFormPrefix}${fieldId}`;

  const [isMandatory, setIsMandatory] = useState<boolean>(() => {
    if (!fieldId) return initialRequired || false;
    const saved = localStorage.getItem(mandatoryKey);
    return saved !== null ? saved === 'true' : (initialRequired || false);
  });
  
  const [isHidden, setIsHidden] = useState<boolean>(() => {
    if (!fieldId) return false;
    const saved = localStorage.getItem(hiddenKey);
    return saved !== null ? saved === 'true' : false;
  });

  useEffect(() => {
    if (fieldId) {
      const handleStorage = () => {
        const saved = localStorage.getItem(mandatoryKey);
        if (saved !== null) setIsMandatory(saved === 'true');
        const hiddenSaved = localStorage.getItem(hiddenKey);
        if (hiddenSaved !== null) setIsHidden(hiddenSaved === 'true');
      };
      const eventHandler = (e: any) => {
        if (e.detail.id === fieldId && e.detail.activeForm === activeForm) setIsMandatory(e.detail.value);
      };
      const hiddenHandler = (e: any) => {
        if (e.detail.id === fieldId && e.detail.activeForm === activeForm) setIsHidden(e.detail.value);
      };
      window.addEventListener('storage', handleStorage);
      window.addEventListener('field_mandatory_change', eventHandler);
      window.addEventListener('field_hidden_change', hiddenHandler);
      return () => {
        window.removeEventListener('storage', handleStorage);
        window.removeEventListener('field_mandatory_change', eventHandler);
        window.removeEventListener('field_hidden_change', hiddenHandler);
      };
    }
  }, [fieldId, activeForm, mandatoryKey, hiddenKey]);

  const toggleMandatory = (e: any) => {
    e.stopPropagation();
    if (!isTestMode || !fieldId) return;
    const newValue = !isMandatory;
    setIsMandatory(newValue);
    localStorage.setItem(mandatoryKey, String(newValue));
    window.dispatchEvent(new CustomEvent('field_mandatory_change', { detail: { id: fieldId, activeForm, value: newValue } }));
  };

  const toggleHidden = (e: any) => {
    e.stopPropagation();
    if (!isTestMode || !fieldId) return;
    const newValue = !isHidden;
    setIsHidden(newValue);
    localStorage.setItem(hiddenKey, String(newValue));
    window.dispatchEvent(new CustomEvent('field_hidden_change', { detail: { id: fieldId, activeForm, value: newValue } }));
  };

  if (!isTestMode && isHidden) return null;

  const showRedLine = isMandatory && !hasValue;

  return (
    <div id={fieldId} className={`grid ${labelWidthClass} gap-4 mb-3 items-start rounded p-1 transition-all duration-300 relative group ${isHidden ? 'opacity-50 grayscale bg-gray-100' : ''}`}>
      <div className={`text-right pt-[6px] flex items-start gap-1 ${showRedLine ? 'border-r-[3px] border-red-600 pr-2' : 'pr-[11px]'}`}>
        {isTestMode && fieldId && (
          <div className="opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex flex-col gap-1 items-stretch z-10 scale-95 shrink-0">
            <button 
              onClick={toggleMandatory} 
              className={`p-0.5 px-1 rounded font-bold text-[9px] border cursor-pointer ${isMandatory ? 'border-red-400 text-red-600 bg-red-50 hover:bg-red-100' : 'border-gray-300 text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
              title={isMandatory ? "فیلد اجباری است (کلیک برای تغییر)" : "فیلد اختیاری است (کلیک برای تغییر)"}
            >
              {isMandatory ? 'اجباری*' : 'اختیاری'}
            </button>
            <button 
              onClick={toggleHidden} 
              className={`p-0.5 px-1 rounded font-bold text-[9px] border cursor-pointer ${isHidden ? 'border-[#a80000] text-[#a80000] bg-red-50/50 hover:bg-red-50' : 'border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
              title={isHidden ? "فیلد مخفی (کلیک برای نمایش)" : "حذف/مخفی‌سازی (کلیک برای حذف)"}
            >
              {isHidden ? 'مخفی' : 'حذف/مخفی'}
            </button>
          </div>
        )}
        <span className="font-bold text-gray-800 text-[12px] whitespace-nowrap mt-[2px]">{label}</span>
      </div>
      <div className="flex items-center justify-start text-sm text-gray-700 w-full min-w-0">
        {children}
      </div>
    </div>
  )
}
