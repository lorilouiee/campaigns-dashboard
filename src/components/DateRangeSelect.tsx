import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import DatePickerModal from './DatePickerModal';
import { format } from 'date-fns';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangeSelectProps {
  value: string;
  onChange: (value: string, compareEnabled?: boolean) => void;
  className?: string;
  compareEnabled?: boolean;
  onCompareChange?: (enabled: boolean) => void;
  compareDateRange?: string;
  onCompareDateRangeChange?: (value: string) => void;
}

const DateRangeSelect = ({ 
  value, 
  onChange, 
  className = '',
  compareEnabled = false,
  onCompareChange,
  compareDateRange,
  onCompareDateRangeChange,
}: DateRangeSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openButton, setOpenButton] = useState<'primary' | 'compare' | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const compareButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const activeRef = openButton === 'primary' ? primaryButtonRef : compareButtonRef;
    if (isOpen && activeRef.current) {
      const rect = activeRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen, openButton]);

  const formatDateRange = (start: Date, end: Date): string => {
    return `${format(start, 'MM/dd')}-${format(end, 'MM/dd/yy')}`;
  };

  const handleApply = (range: DateRange, preset: string, compareEnabled: boolean, compareRange?: DateRange) => {
    if (range.start && range.end) {
      let formattedValue = '';
      
      if (preset === 'custom') {
        formattedValue = formatDateRange(range.start, range.end);
      } else {
        // Map preset values to display labels
        const presetMap: Record<string, string> = {
          'today': 'Today',
          'yesterday': 'Yesterday',
          'last-7': 'Last 7 days',
          'last-14': 'Last 14 days',
          'last-30': 'Last 30 days',
          'last-60': 'Last 60 days',
        };
        formattedValue = presetMap[preset] || 'Custom';
      }
      
      onChange(formattedValue, compareEnabled);
      if (onCompareChange) {
        onCompareChange(compareEnabled);
      }
      
      // Handle comparison date range
      if (compareEnabled && compareRange && compareRange.start && compareRange.end && onCompareDateRangeChange) {
        const compareFormatted = formatDateRange(compareRange.start, compareRange.end);
        onCompareDateRangeChange(compareFormatted);
      }
    }
  };

  const handleButtonClick = (buttonType: 'primary' | 'compare') => {
    setOpenButton(buttonType);
    setIsOpen(true);
  };

  // Show comparison mode UI when comparison is enabled and dates are applied
  if (compareEnabled && compareDateRange) {
    return (
      <>
        <div className={`flex items-center ${className || ''}`}>
          <div className="relative" style={{ width: '192px' }}>
            <button
              ref={primaryButtonRef}
              type="button"
              onClick={() => handleButtonClick('primary')}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-l-md shadow-sm bg-white hover:bg-slate-50 transition-colors text-sm w-full justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ height: '36px', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendar} className="text-slate-500 text-sm" />
                <span className={value ? 'text-slate-700' : 'text-slate-500'}>
                  {value || 'Last 7 days'}
                </span>
              </div>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`text-slate-400 text-xs transition-transform ${isOpen && openButton === 'primary' ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
          <span 
            className="text-slate-600 text-sm font-medium"
            style={{ 
              borderTop: '1px solid #e2e8f0', 
              borderBottom: '1px solid #e2e8f0',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              paddingTop: '4px',
              paddingBottom: '4px',
              paddingLeft: '8px',
              paddingRight: '8px'
            }}
          >
            VS
          </span>
          <div className="relative" style={{ width: '192px' }}>
            <button
              ref={compareButtonRef}
              type="button"
              onClick={() => handleButtonClick('compare')}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-r-md shadow-sm bg-white hover:bg-slate-50 transition-colors text-sm w-full justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ height: '36px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendar} className="text-slate-500 text-sm" />
                <span className={compareDateRange ? 'text-slate-700' : 'text-slate-500'}>
                  {compareDateRange || 'Select date'}
                </span>
              </div>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`text-slate-400 text-xs transition-transform ${isOpen && openButton === 'compare' ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        <DatePickerModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setOpenButton(null);
          }}
          onApply={(range, preset, compareEnabled, compareRange) => {
            handleApply(range, preset, compareEnabled, compareRange);
            setIsOpen(false);
            setOpenButton(null);
          }}
          currentValue={openButton === 'compare' ? compareDateRange || '' : value}
          position={position}
          compareEnabled={compareEnabled}
          isCompareMode={openButton === 'compare'}
        />
      </>
    );
  }

  // Default single date range selector
  return (
    <>
      <div className={`relative ${className || 'w-full'}`}>
        <button
          ref={primaryButtonRef}
          type="button"
          onClick={() => handleButtonClick('primary')}
          className={`flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-md shadow-sm bg-white hover:bg-slate-50 transition-colors text-sm ${className?.includes('w-auto') ? 'w-auto' : 'w-full'} justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          style={{ height: '36px' }}
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendar} className="text-slate-500 text-sm" />
            <span className={value ? 'text-slate-700' : 'text-slate-500'}>
              {value || 'Last 7 days'}
            </span>
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`text-slate-400 text-xs transition-transform ${isOpen && openButton === 'primary' ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <DatePickerModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setOpenButton(null);
        }}
        onApply={(range, preset, compareEnabled, compareRange) => {
          handleApply(range, preset, compareEnabled, compareRange);
          setIsOpen(false);
          setOpenButton(null);
        }}
        currentValue={value}
        position={position}
        compareEnabled={compareEnabled}
        isCompareMode={false}
      />
    </>
  );
};

export default DateRangeSelect;
