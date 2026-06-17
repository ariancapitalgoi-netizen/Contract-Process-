import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

// Jalali calendar utilities
function isJalaliLeapYear(y: number): boolean {
  return ((((((y - 474) % 128) + 474) + 38) * 31) % 128) < 31;
}

function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  let gy = (jy <= 979) ? 621 : 1600;
  jy -= (jy <= 979) ? 0 : 979;
  
  let jy2 = jy + 1;
  let days = (365 * jy) + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + 78 + jd;
  
  if (jm <= 6) {
    days += (jm - 1) * 31;
  } else {
    days += (jm - 1) * 30 + 6;
  }
  
  let g_day_no = days + 365 * gy + Math.floor((gy - 1) / 4) - Math.floor((gy - 1) / 100) + Math.floor((gy - 1) / 400);
  let gy_est = Math.floor(g_day_no / 365.2425);
  let g_day_no_est = gy_est * 365 + Math.floor(gy_est / 4) - Math.floor(gy_est / 100) + Math.floor(gy_est / 400);
  let diff = g_day_no - g_day_no_est;
  
  if (diff < 0) {
    gy_est--;
    g_day_no_est = gy_est * 365 + Math.floor(gy_est / 4) - Math.floor(gy_est / 100) + Math.floor(gy_est / 400);
    diff = g_day_no - g_day_no_est;
  }
  
  let gd = diff + 1;
  const sal_g = [0, 31, ((gy_est % 4 === 0 && gy_est % 100 !== 0) || (gy_est % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 1;
  for (let i = 1; i <= 12; i++) {
    if (gd <= sal_g[i]) {
      gm = i;
      break;
    }
    gd -= sal_g[i];
  }
  
  return new Date(gy_est, gm - 1, gd);
}

function gregorianToJalali(g_y: number, g_m: number, g_d: number) {
  let g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  
  let gy = g_y - 1600;
  let gm = g_m - 1;
  let gd = g_d - 1;
  
  let g_day_no = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);
  
  for (let i = 0; i < gm; ++i) {
    g_day_no += g_days_in_month[i];
  }
  if (gm > 1 && ((g_y % 4 === 0 && g_y % 100 !== 0) || (g_y % 400 === 0))) {
    g_day_no++;
  }
  g_day_no += gd;
  
  let j_day_no = g_day_no - 79;
  let j_np = Math.floor(j_day_no / 12053);
  j_day_no %= 12053;
  
  let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
  j_day_no %= 1461;
  
  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }
  
  let jm = 0;
  for (let i = 0; i < 11 && j_day_no >= j_days_in_month[i]; ++i) {
    j_day_no -= j_days_in_month[i];
    jm = i + 1;
  }
  
  let jd = j_day_no + 1;
  return { y: jy, m: jm + 1, d: jd };
}

function getTodayJalali() {
  const t = new Date();
  return gregorianToJalali(t.getFullYear(), t.getMonth() + 1, t.getDate());
}

const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد",
  "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر",
  "دی", "بهمن", "اسفند"
];

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

interface JalaliDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
}

export function JalaliDatePicker({ value, onChange, placeholder = "yyyy/M/d", id, required }: JalaliDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsed current input value, or fallback to today
  const today = getTodayJalali();
  
  // Current view of the calendar (year and month)
  const [viewYear, setViewYear] = useState(today.y);
  const [viewMonth, setViewMonth] = useState(today.m);

  // Initialize view year and month based on active input value
  useEffect(() => {
    if (value) {
      // Clean up Persian digits
      const cleaned = value.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
      const parts = cleaned.split('/');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          setViewYear(y);
          setViewMonth(m);
        }
      }
    }
  }, [value, isOpen]);

  // Handle outside click to close picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Determine days in current view month
  let daysInMonth = 30;
  if (viewMonth <= 6) {
    daysInMonth = 31;
  } else if (viewMonth <= 11) {
    daysInMonth = 30;
  } else {
    daysInMonth = isJalaliLeapYear(viewYear) ? 30 : 29;
  }

  // Calculate the starting weekday (0 = Shanbeh, ..., 6 = Jomeh)
  const firstDaySec = jalaliToGregorian(viewYear, viewMonth, 1);
  const weekdayOfFirst = (firstDaySec.getDay() + 1) % 7;

  // Handle previous/next month buttons
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Generate years list for select dropdown
  const startYear = today.y - 10;
  const endYear = today.y + 10;
  const years = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  // Check if a day is currently selected
  const isSelected = (day: number) => {
    if (!value) return false;
    const cleaned = value.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
    const parts = cleaned.split('/');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      return y === viewYear && m === viewMonth && d === day;
    }
    return false;
  };

  // Check if a day is today
  const isToday = (day: number) => {
    return today.y === viewYear && today.m === viewMonth && today.d === day;
  };

  const selectDay = (day: number) => {
    onChange(`${viewYear}/${viewMonth}/${day}`);
    setIsOpen(false);
  };

  const selectToday = () => {
    onChange(`${today.y}/${today.m}/${today.d}`);
    setViewYear(today.y);
    setViewMonth(today.m);
    setIsOpen(false);
  };

  // Render the empty padding cells and the actual days
  const cells = [];
  for (let i = 0; i < weekdayOfFirst; i++) {
    cells.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const selected = isSelected(day);
    const todayFlag = isToday(day);
    cells.push(
      <button
        key={`day-${day}`}
        type="button"
        onClick={() => selectDay(day)}
        className={`h-8 w-8 text-xs font-semibold rounded-full flex items-center justify-center transition-all ${
          selected
            ? "bg-[#b90000] text-white shadow-md font-bold scale-110"
            : todayFlag
            ? "border border-[#b90000] text-[#b90000] bg-red-50 hover:bg-red-100"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full border border-gray-300 rounded-sm pr-9 pl-3 py-1 outline-none focus:border-red-500 text-left placeholder-gray-400 shadow-inner font-mono text-xs md:text-sm"
          dir="ltr"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <CalendarIcon size={14} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 right-0 bg-white border border-gray-300 rounded-sm shadow-xl p-3 w-64 select-none animate-fadeIn">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
              title="ماه بعد"
            >
              <ChevronRight size={16} />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Month Dropdown Selector */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-gray-50 border border-gray-200 rounded-sm text-xs px-1.5 py-0.5 text-gray-800 font-semibold outline-none focus:border-red-500"
              >
                {JALALI_MONTHS.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Year Dropdown Selector */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-gray-50 border border-gray-200 rounded-sm text-xs px-1.5 py-0.5 text-gray-800 font-semibold outline-none focus:border-red-500 font-mono"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-gray-100 text-gray-600 transition-colors"
              title="ماه قبل"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Weekday Labels Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-[10px] font-bold text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 justify-items-center mb-3">
            {cells}
          </div>

          {/* Footer Shortcuts */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
            <button
              type="button"
              onClick={selectToday}
              className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-gray-700 rounded-sm font-semibold transition-colors"
            >
              امروز
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 text-gray-500 hover:bg-gray-50 rounded-sm transition-colors flex items-center gap-0.5"
            >
              <X size={12} />
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
