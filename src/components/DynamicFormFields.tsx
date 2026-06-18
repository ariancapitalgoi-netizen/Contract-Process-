import React, { useState, useEffect } from 'react';
import { Plus, X, Settings2 } from 'lucide-react';
import { useTestMode, EditableText } from './EditableText';
import { FieldRow } from './FormComponents';
import { JalaliDatePicker } from './JalaliDatePicker';

export type DynamicFieldInfo = {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'checkbox';
  required: boolean;
};

export function DynamicFormFields({ formId }: { formId: string }) {
  const { isTestMode } = useTestMode();
  const [fields, setFields] = useState<DynamicFieldInfo[]>(() => {
    const saved = localStorage.getItem(`dynamic_fields_${formId}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem(`dynamic_fields_${formId}`);
      if (saved) {try { setFields(JSON.parse(saved)); } catch (e) {}}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [formId]);

  const saveFields = (newFields: DynamicFieldInfo[]) => {
    setFields(newFields);
    localStorage.setItem(`dynamic_fields_${formId}`, JSON.stringify(newFields));
  };

  const addField = () => {
    const newField: DynamicFieldInfo = {
      id: `dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      label: 'عنوان فیلد جدید',
      type: 'text',
      required: false,
    };
    saveFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<DynamicFieldInfo>) => {
    saveFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    if (confirm('آیا از حذف این فیلد اطمینان دارید؟')) {
      saveFields(fields.filter(f => f.id !== id));
    }
  };

  const [activeSettings, setActiveSettings] = useState<string | null>(null);

  if (fields.length === 0 && !isTestMode) return null;

  return (
    <div className="mt-6 mb-4 border-t border-gray-200 pt-4 relative">
      {fields.length > 0 && <div className="text-xs font-bold text-gray-500 mb-4 px-2">فیلدهای سفارشی:</div>}
      
      {fields.map(field => (
        <div key={field.id} className="relative group/dynamic mb-2">
          <FieldRow 
            id={field.id} 
            label={<EditableText isTestMode={isTestMode} defaultText={field.label} onChange={(v) => updateField(field.id, { label: v })} />}
            required={field.required}
            hasValue={!!fieldValues[field.id] && fieldValues[field.id] !== ''}
          >
            <div className="w-full relative px-2 py-1">
              {field.type === 'text' && (
                <input 
                  type="text" 
                  value={fieldValues[field.id] || ''} 
                  onChange={e => setFieldValues({...fieldValues, [field.id]: e.target.value})}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                />
              )}
              {field.type === 'textarea' && (
                <textarea 
                  value={fieldValues[field.id] || ''} 
                  onChange={e => setFieldValues({...fieldValues, [field.id]: e.target.value})}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 min-h-[60px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                />
              )}
              {field.type === 'number' && (
                <input 
                  type="number" 
                  value={fieldValues[field.id] || ''} 
                  onChange={e => setFieldValues({...fieldValues, [field.id]: e.target.value})}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                />
              )}
              {field.type === 'date' && (
                <div className="max-w-[200px]">
                  <JalaliDatePicker 
                    value={fieldValues[field.id] || ''} 
                    onChange={v => setFieldValues({...fieldValues, [field.id]: v})}
                  />
                </div>
              )}
              {field.type === 'checkbox' && (
                <div className="flex items-center h-[34px]">
                  <input 
                    type="checkbox" 
                    checked={fieldValues[field.id] || false} 
                    onChange={e => setFieldValues({...fieldValues, [field.id]: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 shadow-sm"
                  />
                  <span className="mr-2 text-sm text-gray-700 font-medium">تایید</span>
                </div>
              )}
            </div>
          </FieldRow>

          {isTestMode && (
            <div className="absolute top-[4px] left-[4px] flex items-center gap-1.5 z-20 opacity-90 md:opacity-50 hover:opacity-100 transition-opacity">
              <button 
                onClick={() => deleteField(field.id)} 
                className="p-1 cursor-pointer bg-red-50 border border-red-200 text-red-600 rounded hover:bg-red-100 transition-colors shadow-xs" 
                title="حذف کامل این فیلد"
              >
                <X size={13} />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setActiveSettings(activeSettings === field.id ? null : field.id)} 
                  className={`p-1 cursor-pointer bg-white border rounded hover:bg-blue-50 transition-colors shadow-xs ${activeSettings === field.id ? 'border-blue-400 text-blue-600 bg-blue-50/50' : 'border-gray-200 text-gray-500'}`} 
                  title="تنظیمات فیلد"
                >
                  <Settings2 size={13} />
                </button>
                {activeSettings === field.id && (
                  <div className="absolute top-7 left-0 w-48 bg-white border border-gray-200 rounded shadow-xl p-3 z-50 text-right">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-1">
                      <span className="text-[10px] font-bold text-gray-600">تنظیمات فیلد سفارشی</span>
                      <button onClick={() => setActiveSettings(null)} className="text-gray-400 hover:text-red-500 cursor-pointer"><X size={12} /></button>
                    </div>
                    
                    <div className="flex flex-col gap-3 mt-3">
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-500">نوع فیلد:</span>
                        <select 
                          value={field.type} 
                          onChange={e => updateField(field.id, { type: e.target.value as any })}
                          className="w-full border border-gray-300 rounded text-xs p-1 min-h-[26px] bg-white text-gray-700"
                        >
                          <option value="text">متن کوتاه</option>
                          <option value="textarea">توضیحات (چند خطی)</option>
                          <option value="number">عدد</option>
                          <option value="date">تاریخ</option>
                          <option value="checkbox">چک‌باکس</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input 
                          type="checkbox" 
                          checked={field.required}
                          onChange={e => updateField(field.id, { required: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-[10px] text-gray-700 font-medium">اجباری (دارای خط قرمز)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {isTestMode && (
        <div className="mt-4 flex justify-center border-t border-dashed border-gray-300 pt-4">
          <button 
            onClick={addField}
            className="flex items-center gap-1.5 bg-white text-blue-600 border border-blue-200 shadow-sm hover:bg-blue-50 hover:border-blue-300 px-4 py-1.5 rounded-full text-[11px] font-bold transition-all"
          >
            <Plus size={14} />
            افزودن فیلد جدید به این فرم
          </button>
        </div>
      )}
      
      {/* Invisible overlay to close settings when clicking outside */}
      {activeSettings && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveSettings(null)} />
      )}
    </div>
  );
}
