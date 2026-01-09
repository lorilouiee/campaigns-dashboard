import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faFilter,
  faChevronRight,
  faChevronDown,
  faTableCells,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import * as Select from '@radix-ui/react-select';
import DateRangeSelect from './DateRangeSelect';
import MultiSelect from './MultiSelect';
import FilterModal from './FilterModal';
import GraphView from './GraphView';

interface DashboardToolbarProps {
  dateRange?: string;
  onDateRangeChange?: (value: string) => void;
  advertisers?: string[];
  onAdvertisersChange?: (values: string[]) => void;
  viewBy?: string;
  onViewByChange?: (value: string) => void;
}

const DashboardToolbar = ({
  dateRange = 'Last 7 days',
  onDateRangeChange,
  advertisers = [],
  onAdvertisersChange,
  viewBy = 'Campaigns',
  onViewByChange,
}: DashboardToolbarProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const advertiserOptions = ['Proctor & Gamble', 'Unilever', 'Nestle', 'Coca-Cola'];
  const viewByOptions = ['Campaigns', 'Ad Groups', 'Ads', 'Keywords'];

  const handleFilterApply = (filters: any[]) => {
    console.log('Applied filters:', filters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    console.log('Cleared all filters');
  };

  return (
    <>
      <div className="bg-slate-50 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left side controls */}
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <DateRangeSelect
              value={dateRange}
              onChange={onDateRangeChange || (() => {})}
              className="w-auto"
            />

            {/* Advertiser MultiSelect */}
            <div className="flex items-center border border-slate-200 rounded-md shadow-sm bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-r border-slate-200 bg-slate-50">
                <FontAwesomeIcon icon={faBriefcase} className="text-slate-500 text-sm" />
                <span className="text-sm text-slate-700 font-medium">Advertiser</span>
              </div>
              <MultiSelect
                options={advertiserOptions}
                selected={advertisers}
                onChange={onAdvertisersChange || (() => {})}
                placeholder="All"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-md shadow-sm bg-white hover:bg-slate-50 transition-colors text-sm"
            >
              <FontAwesomeIcon icon={faFilter} className="text-slate-500 text-sm" />
              <span className="text-slate-700">Filter</span>
              <FontAwesomeIcon icon={faChevronRight} className="text-slate-400 text-xs" />
            </button>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* View By Split Select */}
            <div className="flex items-center border border-slate-200 rounded-md shadow-sm bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-r border-slate-200 bg-slate-50">
                <FontAwesomeIcon icon={faTableCells} className="text-slate-500 text-sm" />
                <span className="text-sm text-slate-700 font-medium">View by</span>
              </div>
              <Select.Root
                value={viewBy}
                onValueChange={onViewByChange || (() => {})}
              >
                <Select.Trigger className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 transition-colors outline-none text-sm min-w-[120px] cursor-pointer">
                  <Select.Value className="text-slate-700" />
                  <Select.Icon className="ml-auto">
                    <FontAwesomeIcon icon={faChevronDown} className="text-slate-400 text-xs" />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="bg-white border border-slate-200 rounded-md shadow-lg z-50 min-w-[200px] overflow-hidden">
                    <Select.Viewport className="p-1">
                      {viewByOptions.map((option) => (
                        <Select.Item
                          key={option}
                          value={option}
                          className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer outline-none rounded data-[highlighted]:bg-slate-50"
                        >
                          <Select.ItemText>{option}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Show Graph Button */}
            <button
              onClick={() => setIsGraphVisible(!isGraphVisible)}
              className={`flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-md shadow-sm bg-white hover:bg-slate-50 transition-colors text-sm ${
                isGraphVisible ? 'border-blue-600' : ''
              }`}
            >
              <FontAwesomeIcon icon={faEye} className="text-blue-600 text-sm" />
              <span className="text-blue-600 font-medium">Show graph</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={handleFilterApply}
        onClearAll={handleClearFilters}
      />

      {/* Graph View */}
      <div className="px-6">
        <GraphView isVisible={isGraphVisible} />
      </div>
    </>
  );
};

export default DashboardToolbar;
