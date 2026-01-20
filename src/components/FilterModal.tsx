import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faTrash,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import * as Select from '@radix-ui/react-select';

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterCondition[]) => void;
  onClearAll: () => void;
}

const fieldOptions = [
  'Campaign Name',
  'Advertiser',
  'Budget',
  'ROAS',
  'Pacing Ratio',
  'Status',
];

const operatorOptions = [
  'Equals',
  'Not equals',
  'Contains',
  'Does not contain',
  'Greater than',
  'Less than',
];

const FilterModal = ({ isOpen, onClose, onApply, onClearAll }: FilterModalProps) => {
  const [filters, setFilters] = useState<FilterCondition[]>([
    { id: '1', field: '', operator: 'Equals', value: '' },
  ]);

  const addFilter = () => {
    setFilters([
      ...filters,
      { id: Date.now().toString(), field: '', operator: 'Equals', value: '' },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, key: keyof FilterCondition, value: string) => {
    setFilters(
      filters.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const handleApply = () => {
    onApply(filters.filter((f) => f.field && f.value));
    onClose();
  };

  const handleClearAll = () => {
    setFilters([{ id: '1', field: '', operator: 'Equals', value: '' }]);
    onClearAll();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            In each view show records
          </h2>
          <button
            onClick={handleClearAll}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>

        {/* Filter Conditions */}
        <div className="p-6 space-y-4">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-3">
              <span className="text-sm text-gray-700 font-medium min-w-[60px]">
                Where
              </span>

              {/* Field Select */}
              <Select.Root
                value={filter.field}
                onValueChange={(value) => updateFilter(filter.id, 'field', value)}
              >
                <Select.Trigger className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 outline-none text-sm min-w-[180px] cursor-pointer">
                  <Select.Value placeholder="Select" className="text-gray-700" />
                  <Select.Icon>
                    <FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-xs" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px] overflow-hidden">
                    <Select.Viewport className="p-1">
                      {fieldOptions.map((option) => (
                        <Select.Item
                          key={option}
                          value={option}
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none rounded data-[highlighted]:bg-gray-50"
                        >
                          <Select.ItemText>{option}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>

              {/* Operator Select */}
              <Select.Root
                value={filter.operator}
                onValueChange={(value) => updateFilter(filter.id, 'operator', value)}
              >
                <Select.Trigger className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 outline-none text-sm min-w-[140px] cursor-pointer">
                  <Select.Value className="text-gray-700" />
                  <Select.Icon>
                    <FontAwesomeIcon icon={faChevronDown} className="text-gray-400 text-xs" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px] overflow-hidden">
                    <Select.Viewport className="p-1">
                      {operatorOptions.map((option) => (
                        <Select.Item
                          key={option}
                          value={option}
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none rounded data-[highlighted]:bg-gray-50"
                        >
                          <Select.ItemText>{option}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>

              {/* Value Input */}
              <input
                type="text"
                value={filter.value}
                onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                placeholder="Enter value..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />

              {/* Delete Button */}
              <button
                onClick={() => removeFilter(filter.id)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FontAwesomeIcon icon={faTrash} className="text-sm" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={addFilter}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            <FontAwesomeIcon icon={faPlus} className="text-sm" />
            <span>Add filter</span>
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            Apply filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
