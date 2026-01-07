import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Popover from '@radix-ui/react-popover';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  className = '',
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const displayValue = selected.length === 0 
    ? placeholder 
    : selected.length === 1 
    ? selected[0]
    : `${selected.length} selected`;

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          className={`flex items-center justify-between px-3 py-2 bg-white hover:bg-slate-50 transition-colors outline-none text-sm min-w-[120px] cursor-pointer border-0 w-full ${className}`}
        >
          <span className={selected.length === 0 ? 'text-slate-500' : 'text-slate-700'}>
            {displayValue}
          </span>
          <FontAwesomeIcon icon={faChevronDown} className="text-slate-400 text-xs ml-2" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white border border-slate-200 rounded-md shadow-lg z-50 min-w-[200px] p-1"
          sideOffset={4}
        >
          <div className="max-h-60 overflow-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <div
                  key={option}
                  className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer rounded"
                  onClick={() => toggleOption(option)}
                >
                  <Checkbox.Root
                    checked={isSelected}
                    onCheckedChange={() => toggleOption(option)}
                    className="flex h-4 w-4 items-center justify-center rounded border border-slate-300 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mr-2"
                  >
                    <Checkbox.Indicator className="text-white">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <span className="text-sm text-slate-700">{option}</span>
                </div>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default MultiSelect;
