import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faChevronDown, faCheck, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

interface AdvertiserMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
}

const AdvertiserMultiSelect = ({ value, onChange, options }: AdvertiserMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleOption = (option: string) => {
    if (option === 'All') {
      // Select all if not all are selected, otherwise clear all
      if (value.length === options.length) {
        onChange([]);
      } else {
        onChange([...options]);
      }
    } else {
      // Toggle individual option
      const newValue = value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option];
      onChange(newValue);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) {
      return 'All';
    }
    if (value.length === 1) {
      return value[0];
    }
    if (value.length === options.length) {
      return 'All';
    }
    return `${value.length} selected`;
  };

  const isAllSelected = value.length === options.length;
  const isOptionSelected = (option: string) => {
    if (option === 'All') {
      return isAllSelected;
    }
    return value.includes(option);
  };

  // Filter options based on search query, excluding "All" since it's handled separately
  const filteredOptions = options
    .filter(option => option !== 'All')
    .filter(option =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  return (
    <div ref={selectRef} className="relative inline-flex">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center border border-slate-200 rounded-lg shadow-sm bg-white overflow-hidden cursor-pointer hover:bg-slate-50 transition-colors"
        style={{ height: '36px' }}
      >
        {/* Left Segment - Read-Only Label */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white border-r border-slate-200" style={{ height: '36px', borderRadius: '8px 0 0 8px', width: '136px' }}>
          <FontAwesomeIcon icon={faBriefcase} className="text-slate-400 text-sm" />
          <span className="text-slate-600 text-sm font-medium">Advertiser</span>
        </div>

        {/* Right Segment - Display Value */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white" style={{ height: '36px', borderRadius: '0 8px 8px 0', width: '118px' }}>
          <span className="text-slate-900 text-sm" style={{ width: '100%', textAlign: 'left' }}>{getDisplayText()}</span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`text-slate-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {isOpen && (
        <div 
          className="absolute z-50 top-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-fade-in animate-slide-in-from-top" 
          style={{ minWidth: '256px', left: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-slate-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full px-3 py-2 pl-9 pr-3 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="py-1 max-h-60 overflow-auto">
            {/* All Option */}
            {(!searchQuery || 'all'.includes(searchQuery.toLowerCase())) && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleOption('All');
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                    isAllSelected
                      ? 'bg-blue-50 text-slate-900 font-medium'
                      : 'text-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 flex items-center justify-center border rounded ${
                    isAllSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-slate-300'
                  }`}>
                    {isAllSelected && (
                      <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                    )}
                  </div>
                  <span>All</span>
                </button>

                {/* Divider */}
                {filteredOptions.length > 0 && (
                  <div className="border-t border-slate-200 my-1"></div>
                )}
              </>
            )}

            {/* Individual Options */}
            {filteredOptions.map((option) => {
              const selected = isOptionSelected(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleOption(option);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                    selected
                      ? 'bg-blue-50 text-slate-900 font-medium'
                      : 'text-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 flex items-center justify-center border rounded ${
                    selected
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-slate-300'
                  }`}>
                    {selected && (
                      <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                    )}
                  </div>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertiserMultiSelect;
