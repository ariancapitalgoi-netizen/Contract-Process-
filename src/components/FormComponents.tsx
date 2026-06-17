export function FieldRow({ id, label, required, hasValue, children, noMargin = false, labelWidthClass = "grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]" }: any) {
  const showRedLine = required && !hasValue;
  return (
    <div id={id} className={`grid ${labelWidthClass} gap-4 items-center ${noMargin ? '' : 'mb-3'} rounded p-1 transition-all duration-300`}>
      <div className={`text-right ${showRedLine ? 'border-r-[3px] border-red-600 pr-2' : 'pr-[11px]'}`}>
        <span className="font-bold text-gray-800 text-[12px] whitespace-nowrap">{label}</span>
      </div>
      <div className="flex items-center justify-start text-sm text-gray-700 w-full min-w-0">
        {children}
      </div>
    </div>
  )
}

export function FieldRowTop({ id, label, required, hasValue, children, labelWidthClass = "grid-cols-[160px_1fr] md:grid-cols-[200px_1fr]" }: any) {
  const showRedLine = required && !hasValue;
  return (
    <div id={id} className={`grid ${labelWidthClass} gap-4 mb-3 items-start rounded p-1 transition-all duration-300`}>
      <div className={`text-right pt-[6px] ${showRedLine ? 'border-r-[3px] border-red-600 pr-2' : 'pr-[11px]'}`}>
        <span className="font-bold text-gray-800 text-[12px] whitespace-nowrap">{label}</span>
      </div>
      <div className="flex items-start justify-start text-sm text-gray-700 w-full min-w-0">
        {children}
      </div>
    </div>
  )
}
