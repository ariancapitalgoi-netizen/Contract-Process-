import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { X, MousePointer2, GripVertical, BookOpen, Settings2 } from 'lucide-react';
import { Reorder, useDragControls } from "motion/react";

// Root context for Test Mode to be used across all forms
export const TestModeContext = createContext<{ 
  isTestMode: boolean; 
  setIsTestMode: (val: boolean) => void;
  activeForm?: string;
  isDeployed?: boolean;
}>({
  isTestMode: false,
  setIsTestMode: () => {},
  activeForm: undefined,
  isDeployed: false,
});

export const useTestMode = () => useContext(TestModeContext);

import { getUIOverride } from '../lib/ui-registry';

export function EditableText({ isTestMode: isTestModeProp, defaultText, className, onChange }: { isTestMode?: boolean, defaultText: string, className?: string, onChange?: (val: string) => void }) {
  const { isTestMode: isTestModeCtx } = useTestMode();
  // Prefer explicit prop if provided, otherwise fallback to context
  const isTestMode = isTestModeProp !== undefined ? isTestModeProp : isTestModeCtx;
  
  const override = getUIOverride(defaultText);

  const [text, setText] = useState(() => {
    const saved = localStorage.getItem(`editable_text_${defaultText}`);
    if (saved !== null) return saved;
    if (override?.text) return override.text;
    return defaultText;
  });

  const [styles, setStyles] = useState<React.CSSProperties>(() => {
    const saved = localStorage.getItem(`editable_text_style_${defaultText}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    
    // Root fix: Check the registry
    if (override?.hidden) {
      return { display: 'none' };
    }
    if (override?.styles) {
      return override.styles;
    }

    const globalSaved = localStorage.getItem('global_editable_text_style');
    if (globalSaved) {
      try { return JSON.parse(globalSaved); } catch (e) {}
    }
    return {};
  });

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedText = localStorage.getItem(`editable_text_${defaultText}`);
      setText(savedText !== null ? savedText : defaultText);

      let newStyles = {};
      const globalSaved = localStorage.getItem('global_editable_text_style');
      if (globalSaved) {
        try { newStyles = JSON.parse(globalSaved); } catch(e) {}
      }
      const savedStyles = localStorage.getItem(`editable_text_style_${defaultText}`);
      if (savedStyles) {
        try { newStyles = JSON.parse(savedStyles); } catch(e) {}
      }
      setStyles(newStyles);
    };

    const eventHandler = (e: Event) => {
      if (e instanceof CustomEvent && e.detail.defaultText === defaultText) {
        setText(e.detail.value);
      }
    };

    const styleEventHandler = (e: Event) => {
      if (e instanceof CustomEvent && e.detail.defaultText === defaultText) {
        setStyles(e.detail.value);
      }
    };

    const globalStyleEventHandler = (e: Event) => {
      if (e instanceof CustomEvent) {
        setStyles(e.detail.value);
        localStorage.removeItem(`editable_text_style_${defaultText}`);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('editable_text_changed', eventHandler);
    window.addEventListener('editable_text_style_changed', styleEventHandler);
    window.addEventListener('global_editable_style_changed', globalStyleEventHandler);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('editable_text_changed', eventHandler);
      window.removeEventListener('editable_text_style_changed', styleEventHandler);
      window.removeEventListener('global_editable_style_changed', globalStyleEventHandler);
    };
  }, [defaultText]);

  const updateStyle = (key: keyof React.CSSProperties, value: string) => {
    const newStyles = { ...styles, [key]: value };
    if (!value) delete newStyles[key];
    setStyles(newStyles);
    localStorage.setItem(`editable_text_style_${defaultText}`, JSON.stringify(newStyles));
    window.dispatchEvent(new CustomEvent('editable_text_style_changed', { 
      detail: { defaultText, value: newStyles } 
    }));
  };

  const applyGlobally = () => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این استایل به تمامی متون برنامه اعمال شود؟')) {
      localStorage.setItem('global_editable_text_style', JSON.stringify(styles));
      // Remove all specific keys to allow global to apply everywhere
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('editable_text_style_')) {
          localStorage.removeItem(k);
        }
      }
      window.dispatchEvent(new CustomEvent('global_editable_style_changed', { 
        detail: { value: styles } 
      }));
    }
  };

  if (!isTestMode) return <span className={className} style={styles}>{text}</span>;

  return (
    <span className="relative inline-flex items-center group/editable">
      <input
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          localStorage.setItem(`editable_text_${defaultText}`, e.target.value);
          window.dispatchEvent(new CustomEvent('editable_text_changed', { 
            detail: { defaultText, value: e.target.value } 
          }));
          if (onChange) onChange(e.target.value);
        }}
        style={styles}
        className={`bg-blue-50/50 border border-blue-400 rounded px-1 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-full ${className}`}
        onClick={(e) => e.stopPropagation()}
      />
      
      <span 
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setShowSettings(!showSettings);
        }}
        className="opacity-0 group-hover/editable:opacity-100 absolute -right-6 top-1/2 -translate-y-1/2 p-1 bg-white border border-gray-300 rounded shadow-sm text-gray-500 hover:text-blue-600 transition-all z-20 cursor-pointer"
        title="تنظیمات استایل"
      >
        <Settings2 size={12} />
      </span>

      {showSettings && (
        <span 
          className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="flex justify-between items-center mb-2 border-b border-gray-100 pb-1">
            <span className="text-[10px] font-bold text-gray-600">تنظیمات متن</span>
            <span 
              role="button"
              tabIndex={0}
              onClick={() => setShowSettings(false)} 
              className="text-gray-400 hover:text-red-500 cursor-pointer flex"
            >
              <X size={12} />
            </span>
          </span>
          
          <span className="flex flex-col gap-2">
            <span className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">سایز فونت:</label>
              <select 
                value={styles.fontSize || ''} 
                onChange={(e) => updateStyle('fontSize', e.target.value)}
                className="w-full border border-gray-300 rounded px-1 min-h-[22px] text-[10px] bg-white"
              >
                <option value="">پیش‌فرض</option>
                <option value="10px">10px</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
              </select>
            </span>
            
            <span className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">رنگ متن:</label>
              <span className="flex items-center gap-1">
                <input 
                  type="color" 
                  value={styles.color || '#000000'} 
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                />
                <span 
                  role="button"
                  tabIndex={0}
                  onClick={() => updateStyle('color', '')}
                  className="text-[9px] text-gray-400 hover:text-red-500 border border-gray-200 rounded px-1 cursor-pointer"
                >حذف رنگ</span>
              </span>
            </span>

            <span className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">رنگ پس‌زمینه:</label>
              <span className="flex items-center gap-1">
                <input 
                  type="color" 
                  value={styles.backgroundColor || '#ffffff'} 
                  onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                />
                <span 
                  role="button"
                  tabIndex={0}
                  onClick={() => updateStyle('backgroundColor', '')}
                  className="text-[9px] text-gray-400 hover:text-red-500 border border-gray-200 rounded px-1 cursor-pointer"
                >حذف رنگ</span>
              </span>
            </span>

            <span className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">نوع فونت:</label>
              <select 
                value={styles.fontFamily || ''} 
                onChange={(e) => updateStyle('fontFamily', e.target.value)}
                className="w-full border border-gray-300 rounded px-1 min-h-[22px] text-[10px] bg-white"
              >
                <option value="">پیش‌فرض</option>
                <option value="Vazirmatn, sans-serif">وزیرمتن</option>
                <option value="Tahoma, sans-serif">تاهوما</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Georgia, serif">Georgia</option>
              </select>
            </span>
            
            <span className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500">وزن فونت:</label>
              <select 
                value={styles.fontWeight || ''} 
                onChange={(e) => updateStyle('fontWeight', e.target.value)}
                className="w-full border border-gray-300 rounded px-1 min-h-[22px] text-[10px] bg-white"
              >
                <option value="">پیش‌فرض</option>
                <option value="normal">عادی (Normal)</option>
                <option value="bold">ضخیم (Bold)</option>
                <option value="100">بسیار نازک (100)</option>
                <option value="300">نازک (300)</option>
                <option value="500">متوسط (500)</option>
                <option value="700">پررنگ (700)</option>
                <option value="900">بسیار پررنگ (900)</option>
              </select>
            </span>
          </span>
          
          <button 
            onClick={applyGlobally}
            className="w-full mt-3 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 py-1.5 rounded text-[10px] font-bold transition-colors"
          >
            اعمال روی تمام متون
          </button>
        </span>
      )}
    </span>
  );
}

export interface DevNoteItem {
  text: string;
  targetId: string;
  tabId?: string;
}

export function BizagiDevNotes({ notes, onAction, isTestMode = false, onNotesChange }: { notes: DevNoteItem[], onAction?: (id: string, tabId?: string) => void, isTestMode?: boolean, onNotesChange?: (newNotes: DevNoteItem[]) => void }) {
  const [activePicker, setActivePicker] = useState<{ index: number; field: 'targetId' | 'tabId' } | null>(null);

  const scrollToAndHighlight = (id: string, tabId?: string) => {
    if (isTestMode && !activePicker) return; // Disable scrolling while editing unless picking
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-[#b90000]', 'ring-offset-2', 'bg-red-50', 'scale-[1.01]');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-[#b90000]', 'ring-offset-2', 'bg-red-50', 'scale-[1.01]');
      }, 2000);
    } else if (onAction) {
      onAction(id, tabId);
    }
  };

  const handleUpdate = (index: number, field: keyof DevNoteItem, value: string) => {
    if (!onNotesChange) return;
    const newNotes = [...notes];
    newNotes[index] = { ...newNotes[index], [field]: value };
    onNotesChange(newNotes);
  };

  const handleAdd = () => {
    if (!onNotesChange) return;
    onNotesChange([...notes, { text: 'نکته جدید', targetId: '' }]);
  };

  const handleRemove = (index: number) => {
    if (!onNotesChange) return;
    onNotesChange(notes.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (!activePicker) return;

    const handleGlobalClick = (e: MouseEvent) => {
      // Find the closest element with an ID
      let target = e.target as HTMLElement | null;
      
      // Don't pick IDs from the notes editor itself
      if (target?.closest('.bizagi-notes-editor')) return;

      while (target && !target.id && target !== document.body) {
        target = target.parentElement;
      }

      if (target && target.id) {
        e.preventDefault();
        e.stopPropagation();
        handleUpdate(activePicker.index, activePicker.field, target.id);
        setActivePicker(null);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePicker(null);
    };

    // Style injection for highlighting ID elements
    const styleId = 'bizagi-picker-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      [id]:not(.bizagi-notes-editor [id]) {
        outline: 2px dashed #3b82f6 !important;
        outline-offset: 2px !important;
        cursor: crosshair !important;
        position: relative !important;
      }
      [id]:not(.bizagi-notes-editor [id]):hover {
        background-color: rgba(59, 130, 246, 0.1) !important;
      }
      [id]:not(.bizagi-notes-editor [id])::after {
        content: "#" attr(id);
        position: absolute;
        top: -18px;
        left: 0;
        background: #3b82f6;
        color: white;
        font-size: 8px;
        padding: 1px 4px;
        border-radius: 2px;
        white-space: nowrap;
        pointer-events: none;
        z-index: 10000;
        font-family: monospace;
      }
    `;

    window.addEventListener('click', handleGlobalClick, true);
    window.addEventListener('keydown', handleEsc);
    
    // Change cursor to indicate picking mode
    document.body.style.cursor = 'crosshair';
    
    return () => {
      window.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('keydown', handleEsc);
      const style = document.getElementById(styleId);
      if (style) style.remove();
      document.body.style.cursor = 'default';
    };
  }, [activePicker, notes, onNotesChange]);

  return (
    <div className={`mt-8 border border-neutral-300 bg-neutral-50 rounded-sm p-5 shadow-sm transition-all ${activePicker ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
      {activePicker && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-[9999] animate-bounce">
          حالت انتخاب شناسه فعال است. روی یک فیلد یا بخش در فرم کلیک کنید (Esc برای لغو)
        </div>
      )}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-300 pb-2">
        <div className="w-5 h-5 bg-[#b90000] rounded-sm flex items-center justify-center text-white shrink-0 font-mono text-[10px] font-bold">B</div>
        <EditableText 
           isTestMode={isTestMode} 
           defaultText="راهنمای پویای توسعه و رول‌های فرآیند در بیزاجی (Bizagi Technical Notes)" 
           className="font-bold text-[13px] text-gray-800 flex-1 whitespace-nowrap overflow-hidden text-ellipsis" 
        />
        {isTestMode && onNotesChange && (
          <button 
            onClick={handleAdd}
            className="text-[10px] bg-[#b90000] text-white px-2 py-1 rounded-sm font-bold hover:bg-red-700 transition-colors"
          >
            <EditableText isTestMode={isTestMode} defaultText="افزودن نکته فنی" />
          </button>
        )}
      </div>
      {notes.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded p-6 text-center text-xs text-gray-500">
          توضیحات و قوانین فنی برای این فرم ثبت نشده است.
        </div>
      ) : (
        <>
          <p className="text-[11px] text-gray-600 mb-4 leading-relaxed">
            {isTestMode ? "در حالت ویرایش، می‌توانید متن نکات و شناسه‌های مربوطه را تغییر دهید. شناسه‌ها برای قابلیت اسکرول خودکار استفاده می‌شوند." : "توسعه‌دهنده گرامی فرآیند بیزاجی؛ مستندات قواعد پویای این فرم بر اساس آخرین فرآیندهای مورد تایید در لیست زیر قید شده است. با کلیک بر روی هر مستند، به فیلد مربوطه اسکرول و فوکوس خواهد شد:"}
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed text-gray-700">
            {notes.map((note, index) => (
              <li 
                key={index} 
                onClick={() => scrollToAndHighlight(note.targetId, note.tabId)}
                className={`flex items-start gap-2 bg-white border border-gray-200 rounded p-3 transition-all shadow-xs group ${!isTestMode ? 'hover:bg-neutral-100 hover:border-gray-300 cursor-pointer hover:-translate-y-0.5' : ''}`}
              >
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-200 group-hover:bg-[#b90000] text-gray-700 group-hover:text-white font-bold font-sans text-[11px] transition-colors">
                    {index + 1}
                  </span>
                  {isTestMode && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="حذف نکته"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col gap-1 w-full">
                  {!isTestMode ? (
                    <>
                      <span className="font-semibold text-gray-800 group-hover:text-[#b90000] transition-colors">{note.text}</span>
                      <span className="text-[10px] text-gray-400 select-none group-hover:text-[#b90000]/70">📌 جهت ارجاع و فوکوس به فیلد، کلیک کنید</span>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 bizagi-notes-editor" onClick={e => e.stopPropagation()}>
                      <textarea
                        className="w-full border border-blue-200 bg-blue-50/30 p-1.5 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-400 min-h-[60px]"
                        value={note.text}
                        onChange={(e) => handleUpdate(index, 'text', e.target.value)}
                        placeholder="متن نکته فنی..."
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[9px] text-gray-400 font-bold">Target ID:</label>
                          <div className="flex gap-1">
                            <input
                               type="text"
                               className={`flex-1 border border-blue-200 bg-blue-50/30 px-1 py-0.5 rounded text-[10px] font-mono focus:outline-none ${activePicker?.index === index && activePicker?.field === 'targetId' ? 'ring-2 ring-blue-500' : ''}`}
                               value={note.targetId}
                               onChange={(e) => handleUpdate(index, 'targetId', e.target.value)}
                               placeholder="row-id..."
                            />
                            <button
                              onClick={() => setActivePicker({ index, field: 'targetId' })}
                              className={`p-1 rounded border transition-colors ${activePicker?.index === index && activePicker?.field === 'targetId' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'}`}
                              title="انتخاب از روی فرم"
                            >
                              <MousePointer2 size={10} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <label className="text-[9px] text-gray-400 font-bold">Tab ID (Optional):</label>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              className={`flex-1 border border-blue-200 bg-blue-50/30 px-1 py-0.5 rounded text-[10px] font-mono focus:outline-none ${activePicker?.index === index && activePicker?.field === 'tabId' ? 'ring-2 ring-blue-500' : ''}`}
                              value={note.tabId || ''}
                              onChange={(e) => handleUpdate(index, 'tabId', e.target.value)}
                              placeholder="tab-id..."
                            />
                            <button
                              onClick={() => setActivePicker({ index, field: 'tabId' })}
                              className={`p-1 rounded border transition-colors ${activePicker?.index === index && activePicker?.field === 'tabId' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'}`}
                              title="انتخاب از روی فرم"
                            >
                              <MousePointer2 size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function DraggableField({ id, isTestMode, children }: { id: string, isTestMode: boolean, children: ReactNode, key?: any }) {
  const controls = useDragControls();
  
  return (
    <Reorder.Item value={id} dragListener={false} dragControls={controls} className="relative group">
      {isTestMode && (
        <div 
          className="absolute -right-8 top-0 cursor-grab active:cursor-grabbing p-1 bg-gray-100 border border-gray-200 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-50 shadow-sm z-10"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical size={16} />
        </div>
      )}
      <div className={isTestMode ? "border border-dashed border-blue-300 rounded-sm p-2 bg-blue-50/10" : ""}>
        {children}
      </div>
    </Reorder.Item>
  );
}
