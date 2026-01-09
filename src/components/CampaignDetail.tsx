import { useMemo, useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faGear, faCopy, faPause, faPlay, faChartLine, faLayerGroup, faCog, faTable, faGripVertical, faDownload, faPlus, faBullhorn, faChevronRight, faXmark, faChevronDown, faCircle, faFilter, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Campaign } from '../types';
import GraphView from './GraphView';
import PacingProgressBar from './PacingProgressBar';
import AlertBadge from './AlertBadge';
import LayoutSettingsDrawer from './LayoutSettingsDrawer';
import DateRangeSelect from './DateRangeSelect';

interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
  onEdit?: (campaign: Campaign) => void;
  onDuplicate?: (campaign: Campaign) => void;
  onPause?: (campaign: Campaign) => void;
}


const CampaignDetail = ({ campaign, onBack, onEdit, onDuplicate, onPause }: CampaignDetailProps) => {
  const [adGroupSearchQuery, setAdGroupSearchQuery] = useState('');
  const [adGroupViewMode, setAdGroupViewMode] = useState<'table' | 'card'>('table');
  const [adGroupFilter, setAdGroupFilter] = useState('All');
  const [dateRange, setDateRange] = useState('Last 7 days');
  const [isGraphVisible, setIsGraphVisible] = useState(true);
  const [isLayoutSettingsOpen, setIsLayoutSettingsOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterConditions, setFilterConditions] = useState<Array<{ id: string; field: string; operator: string; value: string | string[] }>>([
    { id: '1', field: '', operator: 'equals', value: '' },
  ]);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  // Generate metrics for the campaign
  const generateCampaignMetrics = (campaign: Campaign) => {
    const seed = parseInt(campaign.id) || 1;
    const random = (seed * 0.12345) % 1;
    const baseMultiplier = 0.5 + (random * 1.5);
    
    const impressions = Math.floor(500000 + (campaign.budget * 0.8 * baseMultiplier));
    const clicks = Math.floor(impressions * (0.02 + random * 0.03));
    const conversions = Math.floor(clicks * (0.05 + random * 0.1));
    const revenue = Math.floor(conversions * (50 + random * 100));
    const cost = Math.floor(campaign.budget * (0.3 + random * 0.4));
    const spend = cost;
    
    return {
      impressions,
      clicks,
      conversions,
      revenue,
      cost,
      spend,
    };
  };

  // Generate ad groups for the campaign
  const getAdGroups = (campaign: Campaign) => {
    const adGroupCount = 3 + (parseInt(campaign.id) % 5);
    const baseName = campaign.name.includes("Beekeeper's") ? "Beekeeper's" : 
                     campaign.name.includes("Olly") ? "Olly" : 
                     campaign.name.split(' - ')[1] || campaign.name.split(' - ')[0] || "Campaign";
    
    const weights: number[] = [];
    let totalWeight = 0;
    for (let i = 0; i < adGroupCount; i++) {
      const weight = 0.5 + Math.random() * 1.5;
      weights.push(weight);
      totalWeight += weight;
    }
    
    const adGroups = Array.from({ length: adGroupCount }, (_, i) => {
      const weight = weights[i];
      const budgetRatio = weight / totalWeight;
      const budget = Math.floor(campaign.budget * budgetRatio);
      const unspentBudget = Math.floor(campaign.unspentBudget * budgetRatio);
      const pacingVariation = (Math.random() - 0.5) * 20;
      const pacingRatio = Math.max(0, Math.min(100, campaign.pacingRatio + pacingVariation));
      const roasVariation = (Math.random() - 0.5) * 1.0;
      const roas = Math.max(0, campaign.roas + roasVariation);
      
      const alerts: any[] = [];
      // Generate only one alert per ad group
      const alertChance = Math.random();
      if (alertChance < 0.6) {
        // Single alert
        const alertTypes: any[] = ['great-pacing', 'budget-recommendation', 'high-roas', 'ends-soon', 'ad-groups'];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const alertTexts: Record<string, string> = {
          'great-pacing': 'Great pacing',
          'budget-recommendation': 'Budget recom.',
          'high-roas': 'High ROAS goal',
          'ends-soon': 'Ends in 3 days',
          'ad-groups': 'Ad groups (2+)'
        };
        const alertColors: Record<string, 'green' | 'orange' | 'red'> = {
          'great-pacing': 'green',
          'budget-recommendation': 'orange',
          'high-roas': 'red',
          'ends-soon': 'red',
          'ad-groups': 'red'
        };
        alerts.push({
          type: alertType,
          text: alertTexts[alertType],
          color: alertColors[alertType]
        });
      }
      
      const adGroupName = campaign.name.includes("Beekeeper's") 
        ? `2024 - Beekeeper's - Sponsored Product/${String(i + 1).padStart(2, '0')}`
        : `${baseName} - Sponsored Product/${String(i + 1).padStart(2, '0')}`;
      
      return {
        id: `${campaign.id}-adgroup-${i + 1}`,
        name: adGroupName,
        campaignId: campaign.campaignId || campaign.id,
        budget,
        unspentBudget,
        pacingRatio: Math.round(pacingRatio),
        roas: Math.round(roas * 10) / 10,
        alerts,
        status: campaign.status || 'active',
      };
    });
    
    const totalBudget = adGroups.reduce((sum, ag) => sum + ag.budget, 0);
    const totalUnspent = adGroups.reduce((sum, ag) => sum + ag.unspentBudget, 0);
    if (adGroups.length > 0) {
      adGroups[adGroups.length - 1].budget += campaign.budget - totalBudget;
      adGroups[adGroups.length - 1].unspentBudget += campaign.unspentBudget - totalUnspent;
    }
    
    return adGroups;
  };

  const metrics = useMemo(() => generateCampaignMetrics(campaign), [campaign]);
  const adGroups = useMemo(() => getAdGroups(campaign), [campaign]);

  // Filter dropdown logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

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

  const addFilter = () => {
    setFilterConditions([
      ...filterConditions,
      { id: Date.now().toString(), field: '', operator: 'equals', value: '' },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilterConditions(filterConditions.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, key: string, value: string | string[]) => {
    setFilterConditions(
      filterConditions.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const handleApplyFilters = () => {
    console.log('Applied filters:', filterConditions);
    setIsFilterDropdownOpen(false);
  };

  const handleClearAllFilters = () => {
    setFilterConditions([{ id: '1', field: '', operator: 'equals', value: '' }]);
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

  // MultiSelectInput component for pacing ratio
  const MultiSelectInput = ({ values, options, onChange }: { values: string[]; options: string[]; onChange: (values: string[]) => void }) => {
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
  
  // Filter ad groups by search query
  const filteredAdGroups = useMemo(() => {
    let filtered = adGroups;
    if (adGroupSearchQuery) {
      const query = adGroupSearchQuery.toLowerCase();
      filtered = filtered.filter(ag => 
        ag.name.toLowerCase().includes(query) || 
        ag.id.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [adGroups, adGroupSearchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // Calculate trend (mock - in real app would compare periods)
  const calculateTrend = (current: number, seed: number) => {
    const random = (seed * 0.1) % 1;
    return (random - 0.5) * 30; // Random trend between -15% and +15%
  };

  const revenueTrend = calculateTrend(metrics.revenue, parseInt(campaign.id));
  const impressionsTrend = calculateTrend(metrics.impressions, parseInt(campaign.id) + 3);
  const clicksTrend = calculateTrend(metrics.clicks, parseInt(campaign.id) + 4);
  const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0;
  const ctrTrend = calculateTrend(ctr, parseInt(campaign.id) + 5);

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-200" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Navigation Header */}
      <div className="bg-white sticky top-0 z-10">
        <div className="px-6 py-4 bg-slate-50">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 pb-4" style={{ borderBottom: '1px solid rgba(229, 231, 235, 1)' }}>
            <button
              onClick={onBack}
              className="hover:text-slate-700 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faBullhorn} className="text-sm text-slate-500" />
              <span>Campaigns</span>
            </button>
            <FontAwesomeIcon icon={faChevronRight} className="text-xs text-slate-400" />
            <span className="text-slate-500 truncate max-w-md">{campaign.name}</span>
          </div>

          {/* Campaign Header */}
          <div className="flex items-start justify-between gap-4 mt-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-medium text-gray-900">
                  {campaign.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  <FontAwesomeIcon icon={faCircle} className="text-[6px]" style={{ opacity: 0.6 }} />
                  Active
                </span>
              </div>
              <div className="text-sm text-slate-500 font-mono">
                {campaign.campaignId}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ width: '100%' }}>
        <div className="px-6 py-6" style={{ width: '100%' }}>
          {/* Graph Controls Row */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {/* Date Range Selector */}
              <DateRangeSelect
                value={dateRange}
                onChange={(value) => setDateRange(value)}
                className="w-auto"
              />
              {/* Filter Button */}
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

                          {/* Value Input/Select */}
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
            <div className="flex items-center gap-2">
              {/* Show Graph Toggle */}
              <button
                onClick={() => setIsGraphVisible(!isGraphVisible)}
                className="px-4 py-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faChartLine} className="text-xs" />
                <span>{isGraphVisible ? 'Hide graph' : 'Show graph'}</span>
              </button>
              {/* Edit Campaign Button */}
              <button
                onClick={() => onEdit?.(campaign)}
                className="px-4 py-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faGear} className="text-xs" />
                <span>Edit campaign</span>
              </button>
            </div>
          </div>

          {/* Performance Graph */}
          {isGraphVisible && (
            <div className="bg-white border border-slate-200 rounded-xl p-0 mb-6">
              <GraphView isVisible={true} compareEnabled={false} dateRange={dateRange} />
            </div>
          )}

          {/* Ad Groups Section */}
          <div className="space-y-6">
                {/* Action Bar */}
                <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden shadow-sm" style={{ boxShadow: 'none' }}>
                  <div className="px-6 py-4 flex items-center gap-4">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                      style={{ height: '36px' }}
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-sm" />
                      <span>New ad group</span>
                    </button>
                    <input
                      type="text"
                      value={adGroupSearchQuery}
                      onChange={(e) => setAdGroupSearchQuery(e.target.value)}
                      placeholder="Filter ad groups, access quick actions..."
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      style={{ height: '36px', maxWidth: '375px' }}
                    />
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => setIsLayoutSettingsOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md bg-white hover:bg-gray-50 transition-colors text-sm"
                        style={{ height: '36px' }}
                      >
                        <FontAwesomeIcon icon={faGear} className="text-slate-500 text-sm" />
                        <span className="text-slate-700">Layout settings</span>
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md bg-white hover:bg-gray-50 transition-colors text-sm"
                        style={{ height: '36px' }}
                      >
                        <FontAwesomeIcon icon={faDownload} className="text-slate-500 text-sm" />
                        <span className="text-slate-700">Export CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Ad Groups Table */}
                  <div className="overflow-x-auto" style={{ paddingTop: '24px', paddingBottom: '24px', paddingLeft: '24px', paddingRight: '24px', marginLeft: '24px', marginRight: '24px', marginBottom: '24px', border: '1px solid rgba(229, 231, 235, 1)', borderRadius: '8px' }}>
                    <table className="w-full">
                      <thead className="bg-white border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            <input type="checkbox" className="rounded border-slate-300" />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Ad group name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Alerts
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Budget
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Unspent budget
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Pacing ratio
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            ROAS
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {filteredAdGroups.map((adGroup) => (
                          <tr key={adGroup.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input type="checkbox" className="rounded border-slate-300" />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap relative">
                              <div className="flex items-center gap-3">
                                {adGroup.status === 'paused' ? (
                                  <div 
                                    className="relative flex-shrink-0" 
                                    style={{ width: '15px', height: '15px' }}
                                    title="Paused"
                                  >
                                    <div className="absolute inset-0 bg-orange-500 rounded-full flex items-center justify-center">
                                      <div className="flex items-center justify-center gap-0.5" style={{ paddingLeft: '1px' }}>
                                        <div className="bg-white rounded-sm" style={{ width: '2px', height: '6px' }}></div>
                                        <div className="bg-white rounded-sm" style={{ width: '2px', height: '6px' }}></div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="15" 
                                    height="10" 
                                    viewBox="0 0 15 10" 
                                    fill="none" 
                                    className="text-sm text-blue-600 flex-shrink-0"
                                    title="Active"
                                  >
                                    <path 
                                      d="M4.78385 2.21627C4.52604 2.01054 4.13021 2.03659 3.90104 2.297C2.59036 3.78789 2.59036 6.21367 3.90104 7.70586C4.02443 7.84664 4.19766 7.91825 4.37135 7.91825C4.51758 7.91825 4.6651 7.86698 4.78385 7.76281C5.04331 7.53495 5.06901 7.14015 4.84089 6.88078C3.93021 5.84484 3.93021 4.15942 4.84089 3.12297C5.07031 2.86211 5.04427 2.46627 4.78385 2.21627ZM13.3542 0.311585C13.0654 -0.0472689 12.5409 -0.1043 12.1828 0.182992C11.8234 0.471012 11.7661 0.996012 12.0538 1.35487C12.8906 2.39856 13.3333 3.65898 13.3333 5.00013C13.3333 6.34127 12.8911 7.60195 12.0539 8.62252C11.7661 8.98138 11.8236 9.50638 12.1829 9.7944C12.3359 9.94023 12.5208 10.0001 12.7031 10.0001C12.9473 10.0001 13.1891 9.89351 13.3536 9.68841C14.4167 8.36471 15 6.70065 15 5.00013C15 3.29961 14.4167 1.63554 13.3542 0.311585ZM1.66667 5.00013C1.66667 3.65898 2.10885 2.3983 2.94609 1.37773C3.23385 1.01888 3.17641 0.493877 2.81711 0.205856C2.45904 -0.079821 1.93456 -0.0236232 1.64576 0.33445C0.584375 1.63554 0 3.29961 0 5.00013C0 6.70013 0.584375 8.36471 1.64557 9.68763C1.81042 9.89336 2.05208 10.0001 2.29609 10.0001C2.47919 10.0001 2.66302 9.93992 2.81693 9.81703C3.1763 9.52901 3.23359 9.00401 2.94591 8.64515C2.10885 7.60169 1.66667 6.34127 1.66667 5.00013ZM11.099 2.297C10.8717 2.0375 10.4766 2.01237 10.2159 2.24005C9.95643 2.46791 9.93073 2.8627 10.1589 3.12208C11.0695 4.15802 11.0695 5.84343 10.1589 6.87989C9.93078 7.1395 9.95643 7.53406 10.2159 7.76192C10.3348 7.86609 10.4818 7.91737 10.6284 7.91737C10.8023 7.91737 10.9753 7.84575 11.0987 7.70497C12.4089 6.21367 12.4089 3.78659 11.099 2.297ZM7.5 3.54179C6.69531 3.54179 6.04167 4.19544 6.04167 5.00013C6.04167 5.80481 6.69531 6.45846 7.5 6.45846C8.30469 6.45846 8.95833 5.80481 8.95833 5.00013C8.95833 4.19544 8.30469 3.54179 7.5 3.54179Z" 
                                      fill="#367DFE"
                                    />
                                  </svg>
                                )}
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {adGroup.name}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-0.5">{adGroup.id}</div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  // TODO: Handle ad group settings
                                  console.log('Settings clicked for:', adGroup.id);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-white border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center"
                                style={{ width: '28px', height: '28px' }}
                                aria-label="Ad group settings"
                                title="Settings"
                              >
                                <FontAwesomeIcon icon={faGear} className="text-slate-600 text-sm" />
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {adGroup.alerts.length > 0 ? (
                                  adGroup.alerts.map((alert: any, alertIndex: number) => (
                                    <AlertBadge key={alertIndex} alert={alert} />
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(adGroup.budget)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(adGroup.unspentBudget)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                                  {adGroup.pacingRatio}%
                                </span>
                                <div className="flex-1 relative h-2 bg-gray-200 rounded-full overflow-hidden" style={{ width: '100px' }}>
                                  <div
                                    className={`h-full transition-all duration-300 rounded-full ${
                                      adGroup.pacingRatio <= 30
                                        ? 'bg-red-500'
                                        : adGroup.pacingRatio <= 50
                                        ? 'bg-orange-500'
                                        : 'bg-green-500'
                                    }`}
                                    style={{
                                      width: `${Math.min(adGroup.pacingRatio, 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {adGroup.roas.toFixed(1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
          </div>
        </div>
      </div>
      <LayoutSettingsDrawer
        isOpen={isLayoutSettingsOpen}
        onClose={() => setIsLayoutSettingsOpen(false)}
        currentFormat={adGroupViewMode}
        onSave={(format) => {
          setAdGroupViewMode(format);
        }}
      />
    </div>
  );
};

export default CampaignDetail;
