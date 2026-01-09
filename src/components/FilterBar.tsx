import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye,
  faEyeSlash,
  faFilter,
  faChevronDown,
  faTableCells,
  faPlus,
  faTrash,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import DateRangeSelect from './DateRangeSelect';
import AdvertiserMultiSelect from './AdvertiserMultiSelect';
import { FiltersState } from '../types';

// MultiSelectInput component for pacing ratio
interface MultiSelectInputProps {
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
}

const MultiSelectInput = ({ values, options, onChange }: MultiSelectInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const multiSelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (multiSelectRef.current && !multiSelectRef.current.contains(event.target as Node)) {
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

  const toggleOption = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter(v => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  const displayText = values.length === 0 ? 'Select...' : `${values.length} selected`;

  return (
    <div ref={multiSelectRef} className="relative" style={{ width: '160px' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 outline-none text-sm text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500"
      >
        <span className={values.length === 0 ? 'text-slate-400' : 'text-slate-900'}>{displayText}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-slate-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden min-w-[160px] max-h-60 overflow-auto">
          <div className="py-1">
            {options.map((option) => {
              const selected = values.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option);
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

interface FilterBarProps {
  filters: FiltersState;
  onFilterChange: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  onNewCampaign: () => void;
  advertisers: string[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  isGraphVisible: boolean;
  onToggleGraph: () => void;
  compareEnabled?: boolean;
  onCompareChange?: (enabled: boolean) => void;
  compareDateRange?: string;
  onCompareDateRangeChange?: (value: string) => void;
}


const viewByOptions = [
  { value: 'all', label: 'All' },
  { value: 'campaigns', label: 'Campaigns' },
  { value: 'ad groups', label: 'Ad Groups' },
];

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string | string[];
}

const fieldOptions = [
  { value: 'startDate', label: 'Start Date' },
  { value: 'endDate', label: 'End Date' },
  { value: 'budget', label: 'Budget' },
  { value: 'campaignId', label: 'Campaign ID' },
  { value: 'pacingRatio', label: 'Pacing Ratio' },
];

const operatorOptions = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not equals' },
  { value: 'greaterThan', label: 'Greater than' },
  { value: 'lessThan', label: 'Less than' },
];

const pacingRatioOptions = ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'];

const FilterBar = ({
  filters,
  onFilterChange,
  advertisers,
  onClearFilters,
  isGraphVisible,
  onToggleGraph,
  compareEnabled = false,
  onCompareChange,
  compareDateRange,
  onCompareDateRangeChange,
}: FilterBarProps) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([
    { id: '1', field: '', operator: 'equals', value: '' },
  ]);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const [isViewByDropdownOpen, setIsViewByDropdownOpen] = useState(false);
  const viewByDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (viewByDropdownRef.current && !viewByDropdownRef.current.contains(event.target as Node)) {
        setIsViewByDropdownOpen(false);
      }
    };

    if (isFilterDropdownOpen || isViewByDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen, isViewByDropdownOpen]);

  // Convert advertiser to array format for multi-select
  const advertiserValue = Array.isArray(filters.advertiser) 
    ? filters.advertiser 
    : filters.advertiser === 'All' || !filters.advertiser
    ? []
    : [filters.advertiser];

  const handleAdvertiserChange = (value: string[]) => {
    onFilterChange('advertiser', value);
  };

  const addFilter = () => {
    setFilterConditions([
      ...filterConditions,
      { id: Date.now().toString(), field: '', operator: 'equals', value: '' },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilterConditions(filterConditions.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, key: keyof FilterCondition, value: string | string[]) => {
    setFilterConditions(
      filterConditions.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const handleApplyFilters = () => {
    // Apply filter logic here
    console.log('Applied filters:', filterConditions);
    setIsFilterDropdownOpen(false);
  };

  const handleClearAllFilters = () => {
    setFilterConditions([{ id: '1', field: '', operator: 'equals', value: '' }]);
    onClearFilters();
  };

  const isFieldMultiselect = (field: string) => {
    return field === 'pacingRatio';
  };

  const isFieldNumeric = (field: string) => {
    return field === 'budget' || field === 'campaignId';
  };

  const isFieldDate = (field: string) => {
    return field === 'startDate' || field === 'endDate';
  };

  return (
    <div className="px-6 py-4" style={{ boxSizing: 'content-box', width: '1424px' }}>
      <div className="flex items-center justify-between" style={{ width: '100%', boxSizing: 'content-box', backgroundColor: 'rgba(255, 255, 255, 0)', background: 'unset' }}>
        <div className="flex items-center gap-4">
          <DateRangeSelect
            value={filters.dateRange}
            onChange={(value, compareEnabled) => {
              onFilterChange('dateRange', value);
              if (onCompareChange && compareEnabled !== undefined) {
                onCompareChange(compareEnabled);
              }
            }}
            compareEnabled={compareEnabled}
            onCompareChange={onCompareChange}
            compareDateRange={compareDateRange}
            onCompareDateRangeChange={onCompareDateRangeChange}
          />
          <AdvertiserMultiSelect
            value={advertiserValue}
            onChange={handleAdvertiserChange}
            options={advertisers}
          />
          <div ref={filterDropdownRef} className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-md bg-white hover:bg-gray-50 transition-colors text-sm"
              style={{ width: '176px', boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.03)' }}
            >
              <FontAwesomeIcon icon={faFilter} className="text-slate-500 text-sm" />
              <span className="text-slate-700" style={{ width: '100%', textAlign: 'left' }}>Filter</span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`text-slate-400 text-xs transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isFilterDropdownOpen && (
              <div 
                className="absolute z-50 top-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
                style={{ minWidth: '600px', left: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-900">
                    In each view show records
                  </h2>
                  <button
                    onClick={handleClearAllFilters}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                </div>

                {/* Filter Conditions */}
                <div className="p-4 space-y-4">
                  {filterConditions.map((filter, index) => (
                    <div key={filter.id} className="flex items-center gap-3">
                      <span className="text-sm text-slate-700 font-medium" style={{ width: '60px' }}>
                        {index === 0 ? 'Where' : 'And'}
                      </span>

                      {/* Field Select */}
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 outline-none text-sm cursor-pointer focus:ring-2 focus:ring-blue-500"
                        style={{ width: '160px' }}
                      >
                        <option value="">Select</option>
                        {fieldOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {/* Operator Select */}
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 outline-none text-sm cursor-pointer focus:ring-2 focus:ring-blue-500"
                        style={{ width: '160px' }}
                      >
                        {operatorOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {/* Value Input/Select - Always visible, changes based on field */}
                      {isFieldMultiselect(filter.field) ? (
                        <MultiSelectInput
                          values={Array.isArray(filter.value) ? filter.value : []}
                          options={pacingRatioOptions}
                          onChange={(values) => updateFilter(filter.id, 'value', values)}
                        />
                      ) : isFieldDate(filter.field) ? (
                        <input
                          type="date"
                          value={typeof filter.value === 'string' ? filter.value : ''}
                          onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 outline-none text-sm focus:ring-2 focus:ring-blue-500"
                          style={{ width: '160px' }}
                        />
                      ) : (
                        <input
                          type={isFieldNumeric(filter.field) ? 'number' : 'text'}
                          value={typeof filter.value === 'string' ? filter.value : ''}
                          onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                          placeholder="Enter value..."
                          className="px-3 py-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 outline-none text-sm focus:ring-2 focus:ring-blue-500"
                          style={{ width: '160px' }}
                        />
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeFilter(filter.id)}
                        className="text-slate-400 hover:text-slate-600 p-2 flex-shrink-0"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-slate-200">
                  <button
                    onClick={addFilter}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-sm" />
                    <span>Add filter</span>
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    Apply filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div ref={viewByDropdownRef} className="relative inline-flex">
            <div className="inline-flex items-center border border-slate-200 rounded-lg shadow-sm bg-white overflow-hidden">
              {/* Left Segment - Read-Only Label */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white border-r border-slate-200" style={{ height: '36px', borderRadius: '8px 0 0 8px' }}>
                <FontAwesomeIcon icon={faTableCells} className="text-slate-400 text-sm" />
                <span className="text-slate-600 text-sm font-medium">View by</span>
              </div>

              {/* Right Segment - Select Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsViewByDropdownOpen(!isViewByDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                  style={{ height: '36px', borderRadius: '0 8px 8px 0', borderBottomWidth: '1px' }}
                >
                  <span className="text-slate-900 text-sm" style={{ width: '100%', textAlign: 'left' }}>
                    {viewByOptions.find(opt => opt.value === filters.viewBy)?.label || filters.viewBy}
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-slate-400 text-xs transition-transform ${isViewByDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            </div>
            
            {isViewByDropdownOpen && (
              <div className="absolute z-50 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden min-w-[120px]" style={{ top: 'calc(100% + 8px)', right: 0 }}>
                <div className="py-1">
                  {viewByOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onFilterChange('viewBy', option.value);
                        setIsViewByDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        filters.viewBy === option.value
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onToggleGraph}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-md bg-white hover:bg-gray-50 transition-colors text-sm"
            style={{ width: '130px', height: '36px' }}
          >
            <FontAwesomeIcon
              icon={isGraphVisible ? faEyeSlash : faEye}
              className={isGraphVisible ? 'text-blue-600 text-sm' : 'text-slate-500 text-sm'}
            />
            <span
              className={isGraphVisible ? 'text-blue-600 font-medium' : 'text-slate-700'}
              style={{ width: 'fit-content' }}
            >
              {isGraphVisible ? 'Hide graph' : 'Show graph'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
