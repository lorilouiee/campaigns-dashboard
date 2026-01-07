import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (range: DateRange, preset: string, compareEnabled: boolean, compareRange?: DateRange) => void;
  currentValue: string;
  position: { top: number; left: number; width: number };
  compareEnabled?: boolean;
  isCompareMode?: boolean;
}

const PRESET_OPTIONS = [
  { value: 'custom', label: 'Custom' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last-7', label: 'Last 7 days' },
  { value: 'last-14', label: 'Last 14 days' },
  { value: 'last-30', label: 'Last 30 days' },
  { value: 'last-60', label: 'Last 60 days' },
];

const DatePickerModal = ({
  isOpen,
  onClose,
  onApply,
  currentValue,
  position,
  compareEnabled: initialCompareEnabled = false,
  isCompareMode = false,
}: DatePickerModalProps) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const [compareEnabled, setCompareEnabled] = useState(initialCompareEnabled);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null });
  const [compareRange, setCompareRange] = useState<DateRange>({ start: null, end: null });
  const [selectingStart, setSelectingStart] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize with current preset if it matches
      const preset = PRESET_OPTIONS.find((p) => currentValue.includes(p.label));
      if (preset && preset.value !== 'custom') {
        setSelectedPreset(preset.value);
        applyPreset(preset.value);
      } else {
        setSelectedPreset('custom');
        // Reset ranges when opening
        if (!isCompareMode) {
          setSelectedRange({ start: null, end: null });
        } else {
          setCompareRange({ start: null, end: null });
        }
      }
      setCompareEnabled(initialCompareEnabled);
    }
  }, [isOpen, currentValue, initialCompareEnabled, isCompareMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const applyPreset = (preset: string) => {
    const today = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (preset) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        start = yesterday;
        end = yesterday;
        break;
      case 'last-7':
        start = new Date(today);
        start.setDate(start.getDate() - 6);
        end = today;
        break;
      case 'last-14':
        start = new Date(today);
        start.setDate(start.getDate() - 13);
        end = today;
        break;
      case 'last-30':
        start = new Date(today);
        start.setDate(start.getDate() - 29);
        end = today;
        break;
      case 'last-60':
        start = new Date(today);
        start.setDate(start.getDate() - 59);
        end = today;
        break;
    }

    if (start && end) {
      setSelectedRange({ start, end });
      setCurrentMonth(start);
    }
  };

  const handlePresetClick = (preset: string) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      applyPreset(preset);
    } else {
      setSelectedRange({ start: null, end: null });
      setSelectingStart(true);
    }
  };

  const handleDateClick = (date: Date) => {
    if (isCompareMode) {
      // When in compare mode, update compareRange
      if (selectingStart || !compareRange.start) {
        setCompareRange({ start: date, end: null });
        setSelectingStart(false);
      } else {
        if (date < compareRange.start) {
          setCompareRange({ start: date, end: compareRange.start });
        } else {
          setCompareRange({ start: compareRange.start, end: date });
        }
        setSelectingStart(true);
      }
    } else if (compareEnabled && !selectingStart) {
      // When compare is enabled and selecting comparison range
      if (!compareRange.start) {
        setCompareRange({ start: date, end: null });
        setSelectingStart(false);
      } else {
        if (date < compareRange.start) {
          setCompareRange({ start: date, end: compareRange.start });
        } else {
          setCompareRange({ start: compareRange.start, end: date });
        }
        setSelectingStart(true);
      }
    } else {
      // Normal date range selection
      if (selectingStart || !selectedRange.start) {
        setSelectedRange({ start: date, end: null });
        setSelectingStart(false);
      } else {
        if (date < selectedRange.start) {
          setSelectedRange({ start: date, end: selectedRange.start });
        } else {
          setSelectedRange({ start: selectedRange.start, end: date });
        }
        setSelectingStart(true);
      }
    }
  };

  const handleApply = () => {
    const activeRange = isCompareMode ? compareRange : selectedRange;
    if (activeRange.start && activeRange.end) {
      onApply(selectedRange, selectedPreset, compareEnabled, compareRange);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };


  const renderCalendar = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const monthName = format(month, 'MMMM yyyy');

    const handleMonthNav = (direction: 'prev' | 'next') => {
      if (direction === 'prev') {
        setCurrentMonth(subMonths(currentMonth, 1));
      } else {
        setCurrentMonth(addMonths(currentMonth, 1));
      }
    };

    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => handleMonthNav('prev')}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-gray-600 text-sm" />
          </button>
          <h3 className="text-sm font-semibold text-gray-900">{monthName}</h3>
          <button
            onClick={() => handleMonthNav('next')}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-gray-600 text-sm" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-xs text-gray-500 text-center py-1 font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, month);
            // Determine which range to use for highlighting
            const activeRange = isCompareMode ? compareRange : (compareEnabled && !selectingStart ? compareRange : selectedRange);
            const isStart = activeRange.start && isSameDay(day, activeRange.start);
            const isEnd = activeRange.end && isSameDay(day, activeRange.end);
            const isInRange =
              activeRange.start &&
              activeRange.end &&
              isWithinInterval(day, {
                start: startOfDay(activeRange.start),
                end: endOfDay(activeRange.end),
              }) &&
              !isStart &&
              !isEnd;

            return (
              <button
                key={day.toString()}
                onClick={() => handleDateClick(day)}
                className={`
                  h-8 w-8 text-xs rounded transition-colors flex items-center justify-center
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                  ${isStart || isEnd
                    ? 'bg-blue-600 text-white font-semibold'
                    : isInRange
                    ? 'bg-blue-100 text-blue-900'
                    : isCurrentMonth
                    ? 'hover:bg-gray-100'
                    : ''
                  }
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 animate-fade-in animate-slide-in-from-top"
      style={{
        top: `${position.top + 8}px`,
        left: `${position.left}px`,
        width: 'max-content',
        minWidth: '700px',
        position: 'fixed',
      }}
    >
      {/* Top input fields */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        {isCompareMode ? (
          <>
            <div className="flex-1 relative">
              <input
                type="text"
                readOnly
                value={
                  compareRange.start && compareRange.end
                    ? `${format(compareRange.start, 'MMM d, yyyy')} - ${format(compareRange.end, 'MMM d, yyyy')}`
                    : 'Select date'
                }
                className="w-full px-3 py-2 pl-10 border-2 border-blue-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FontAwesomeIcon
                icon={faCalendar}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 relative">
              <input
                type="text"
                readOnly
                value={
                  selectedRange.start ? format(selectedRange.start, 'MMM d, yyyy') : 'Select date'
                }
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => {
                  if (!selectingStart && selectedRange.start) {
                    setSelectingStart(true);
                  }
                }}
              />
              <FontAwesomeIcon
                icon={faCalendar}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            {compareEnabled && (
              <>
                <span className="text-sm text-gray-500">VS</span>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    readOnly
                    value={
                      compareRange.start && compareRange.end
                        ? `${format(compareRange.start, 'MMM d, yyyy')} - ${format(compareRange.end, 'MMM d, yyyy')}`
                        : 'Select date'
                    }
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                      setSelectingStart(false);
                    }}
                  />
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </>
            )}
            {!compareEnabled && (
              <>
                <span className="text-sm text-gray-500">VS</span>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    readOnly
                    value={
                      selectedRange.end ? format(selectedRange.end, 'MMM d, yyyy') : 'Select date'
                    }
                    className="w-full px-3 py-2 pl-10 border-2 border-blue-500 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                      if (selectingStart && selectedRange.start) {
                        setSelectingStart(false);
                      }
                    }}
                  />
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex">
        {/* Left sidebar */}
        <div className="w-48 border-r border-gray-200 p-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Compare</span>
            <button
              onClick={() => setCompareEnabled(!compareEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                compareEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  compareEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="space-y-1">
            {PRESET_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePresetClick(option.value)}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  selectedPreset === option.value
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right panel - Calendars */}
        <div className="flex-1 p-6">
          <div className="flex gap-8">
            <div className="flex-1">{renderCalendar(currentMonth)}</div>
            {!isCompareMode && <div className="flex-1">{renderCalendar(addMonths(currentMonth, 1))}</div>}
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          disabled={
            isCompareMode
              ? !compareRange.start || !compareRange.end
              : compareEnabled
              ? !selectedRange.start || !selectedRange.end || !compareRange.start || !compareRange.end
              : !selectedRange.start || !selectedRange.end
          }
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default DatePickerModal;
