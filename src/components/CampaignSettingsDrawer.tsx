import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendar, faFolderOpen, faChevronDown, faChevronUp, faPencil, faDownload, faMagnifyingGlass, faTh } from '@fortawesome/free-solid-svg-icons';
import { Campaign, Alert } from '../types';
import AlertBadge from './AlertBadge';

interface Creative {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  metadata: {
    id: string;
    status: string;
    description: string;
    type: string;
    adPlacement: string;
    adFormat: string;
    dimensions: string;
    lastModified: string;
    assignedAdGroups: number;
  };
}

interface CampaignSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onSave?: (campaignId: string, updates: Partial<Campaign>) => void;
  alertContext?: Alert | null;
}

const CampaignSettingsDrawer = ({
  isOpen,
  onClose,
  campaign,
  onSave,
  alertContext,
}: CampaignSettingsDrawerProps) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'creatives' | 'history'>('settings');
  const [isAnimating, setIsAnimating] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [status, setStatus] = useState<'active' | 'paused'>('active');
  const [startDate, setStartDate] = useState('');
  const [endDateType, setEndDateType] = useState<'date' | 'always-on'>('date');
  const [endDate, setEndDate] = useState('');
  const [cadence, setCadence] = useState('Weekly');
  const [budget, setBudget] = useState('');
  const [pacing, setPacing] = useState('Evenly');
  const [roasGoal, setRoasGoal] = useState('');
  const [expandedCreativeId, setExpandedCreativeId] = useState<string | null>(null);
  const [expandedAdGroupsCreativeId, setExpandedAdGroupsCreativeId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const roasGoalRef = React.useRef<HTMLDivElement>(null);
  const budgetRef = React.useRef<HTMLDivElement>(null);
  const pacingRef = React.useRef<HTMLDivElement>(null);
  const endDateRef = React.useRef<HTMLDivElement>(null);
  
  // Mock creative data
  const [creatives] = useState<Creative[]>([
    {
      id: '1',
      name: 'Yes_Chef_Bag.png',
      imageUrl: 'https://placehold.co/1700x350/0066FF/FFFFFF?text=THE+YES+CHEF+BAG',
      thumbnailUrl: 'https://placehold.co/96x96/0066FF/FFFFFF?text=Yes_Chef_Bag',
      metadata: {
        id: '1857392',
        status: 'Active',
        description: 'this is an ad for GoPuff',
        type: 'PNG Image',
        adPlacement: 'Onsite Display',
        adFormat: 'Carousel',
        dimensions: '1700x350',
        lastModified: 'Dec 25, 2024 12:01 AM',
        assignedAdGroups: 4,
      },
    },
    {
      id: '2',
      name: 'Sunday_Series.png',
      imageUrl: 'https://placehold.co/1700x350/0066FF/FFFFFF?text=THE+SUNDAY+SCARIES',
      thumbnailUrl: 'https://placehold.co/96x96/0066FF/FFFFFF?text=Sunday',
      metadata: {
        id: '1857393',
        status: 'Active',
        description: 'Sunday series creative',
        type: 'PNG Image',
        adPlacement: 'Onsite Display',
        adFormat: 'Carousel',
        dimensions: '1700x350',
        lastModified: 'Dec 24, 2024 10:30 AM',
        assignedAdGroups: 4,
      },
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (campaign) {
      setCampaignName(campaign.name);
      setStatus(campaign.status || 'active');
      setBudget(campaign.budget.toLocaleString('en-US'));
      setRoasGoal(campaign.roas.toString());
      // Set default dates (you can customize these)
      setStartDate('2025-01-01');
      setEndDate('2025-01-01');
    }
  }, [campaign]);

  // Switch to Settings tab when alert context is provided and scroll to the relevant field
  useEffect(() => {
    if (alertContext && isOpen) {
      setActiveTab('settings');
      // Wait for tab switch and DOM update, then scroll to the callout
      const timeoutId = setTimeout(() => {
        const field = getFieldForAlert(alertContext);
        let refToScroll: React.RefObject<HTMLDivElement> | null = null;
        
        switch (field) {
          case 'roas-goal':
            refToScroll = roasGoalRef;
            break;
          case 'budget':
            refToScroll = budgetRef;
            break;
          case 'pacing':
            refToScroll = pacingRef;
            break;
          case 'end-date':
            refToScroll = endDateRef;
            break;
        }
        
        if (refToScroll?.current) {
          // Get the scrollable container (the content div)
          const scrollableContainer = refToScroll.current.closest('.overflow-y-auto');
          if (scrollableContainer) {
            const calloutTop = refToScroll.current.offsetTop;
            const containerHeight = scrollableContainer.clientHeight;
            const scrollPosition = calloutTop - (containerHeight / 2) + (refToScroll.current.offsetHeight / 2);
            scrollableContainer.scrollTo({
              top: Math.max(0, scrollPosition),
              behavior: 'smooth'
            });
          } else {
            // Fallback to scrollIntoView
            refToScroll.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [alertContext, isOpen]);

  // Set first creative as expanded by default when Creatives tab is active
  useEffect(() => {
    if (activeTab === 'creatives' && creatives.length > 0) {
      // Always set first creative as expanded when entering Creatives mode
      if (!expandedCreativeId || !creatives.find(c => c.id === expandedCreativeId)) {
        setExpandedCreativeId(creatives[0].id);
      }
    }
  }, [activeTab, creatives]);

  // Get the active creative for preview
  const activeCreative = creatives.find(c => c.id === expandedCreativeId) || creatives[0];

  const handleSave = () => {
    if (campaign && onSave) {
      const budgetValue = parseFloat(budget.replace(/,/g, ''));
      onSave(campaign.id, {
        name: campaignName,
        status: status,
        budget: isNaN(budgetValue) ? campaign.budget : budgetValue,
      });
    }
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to determine which field should show the callout
  const getFieldForAlert = (alert: Alert | null | undefined): string | null => {
    if (!alert) return null;
    switch (alert.type) {
      case 'high-roas':
        return 'roas-goal';
      case 'budget-recommendation':
        return 'budget';
      case 'ends-soon':
        return 'end-date';
      case 'great-pacing':
        return 'pacing';
      case 'ad-groups':
        return null; // No specific field for ad-groups alert
      default:
        return null;
    }
  };

  // Helper function to get callout message
  const getCalloutMessage = (alert: Alert | null | undefined): string | null => {
    if (!alert) return null;
    switch (alert.type) {
      case 'high-roas':
        return 'Your projected revenue grows by $1,000,000 — a 22% increase.';
      case 'budget-recommendation':
        return 'Consider increasing your budget to maximize performance.';
      case 'ends-soon':
        return 'This campaign is ending soon. Consider extending the end date.';
      case 'great-pacing':
        return 'Your campaign is pacing well and on track to meet its goals.';
      default:
        return null;
    }
  };

  if (!isOpen || !campaign) {
    return null;
  }

  const activeField = getFieldForAlert(alertContext);
  const calloutMessage = getCalloutMessage(alertContext);

  // Standard drawer mode for all tabs
  const showPreviewOverlay = activeTab === 'creatives' && expandedCreativeId && activeCreative;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black z-40 transition-opacity"
        style={{ opacity: 0.25 }}
        onClick={onClose}
      />

      {/* Preview Overlay - Shows large image next to drawer when Creatives tab is active */}
      {showPreviewOverlay && (
        <div
          className={`fixed top-0 right-[600px] h-full w-[calc(100vw-600px)] z-[45] flex flex-col transform transition-opacity duration-300 ease-in-out ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            marginTop: '24px',
            marginBottom: '24px',
            marginLeft: '24px',
            backgroundColor: 'rgba(247, 248, 252, 0.85)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 border-b border-slate-200" style={{ height: '116px', paddingTop: '16px', paddingBottom: '16px', backgroundColor: 'rgba(241, 245, 249, 1)', background: 'unset' }}>
            <span className="text-sm font-medium text-gray-900">
              {activeCreative.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Handle gallery view
                }}
                className="flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors border border-slate-200"
                style={{ width: '28px', height: '28px', padding: '0' }}
                title="Gallery view"
              >
                <FontAwesomeIcon icon={faTh} className="text-sm" />
              </button>
              <button
                onClick={() => {
                  // Handle download
                }}
                className="flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors border border-slate-200"
                style={{ width: '28px', height: '28px', padding: '0' }}
                title="Download"
              >
                <FontAwesomeIcon icon={faDownload} className="text-sm" />
              </button>
            </div>
          </div>
          
          {/* Image Container */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto" style={{ backgroundColor: 'unset', background: 'unset' }}>
            <img
              src={activeCreative.imageUrl}
              alt={activeCreative.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[600px] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 bg-gray-50">
            <div className="flex items-center justify-between px-6 pt-4 pb-6">
              <h2 className="text-xl font-bold text-gray-900 truncate pr-4">
                {campaign.name}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors flex-shrink-0"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 px-6 pb-4" style={{ backgroundColor: 'unset', background: 'unset' }}>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center justify-center px-3 py-1.5 text-sm font-medium transition-all rounded-3xl ${
                  activeTab === 'settings'
                    ? 'text-blue-600 bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{ width: '100%' }}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab('creatives')}
                className={`flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium transition-all rounded-3xl ${
                  activeTab === 'creatives'
                    ? 'text-blue-600 bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{ width: '100%' }}
              >
                Creatives
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center justify-center w-full px-3 py-1.5 text-sm font-medium transition-all rounded-md ${
                  activeTab === 'history'
                    ? 'text-blue-600 bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                History
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0 bg-white">
            {activeTab === 'settings' && (
              <div className="space-y-4 pb-4">
                {/* Campaign name */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign name
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Status */}
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'active' | 'paused')}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white pr-8"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Flight dates */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Flight dates
                  </label>
                  
                  {/* Start date */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start date
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon 
                        icon={faCalendar} 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                      />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {/* End date */}
                  <div ref={endDateRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End date
                    </label>
                    <div className="space-y-3 mb-6">
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="endDateType"
                          value="date"
                          checked={endDateType === 'date'}
                          onChange={(e) => setEndDateType(e.target.value as 'date' | 'always-on')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="relative flex-1">
                          <FontAwesomeIcon 
                            icon={faCalendar} 
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
                          />
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={endDateType !== 'date'}
                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-400"
                          />
                        </div>
                      </label>
                      <label className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="endDateType"
                          value="always-on"
                          checked={endDateType === 'always-on'}
                          onChange={(e) => setEndDateType(e.target.value as 'date' | 'always-on')}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Always on</span>
                      </label>
                    </div>
                    {activeField === 'end-date' && alertContext && calloutMessage && (
                      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                        <AlertBadge alert={alertContext} />
                        <p className="text-sm text-blue-900">{calloutMessage}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget */}
                <div ref={budgetRef} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Budget
                  </label>
                  
                  {/* Cadence */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cadence
                    </label>
                    <div className="relative">
                      <select
                        value={cadence}
                        onChange={(e) => setCadence(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white pr-8"
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Budget amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">$</span>
                        <input
                          type="text"
                          value={budget}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9,]/g, '');
                            setBudget(value);
                          }}
                          className="w-full pl-6 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="1,000,000"
                        />
                      </div>
                      <div className="px-3 py-2 border border-slate-200 rounded-md bg-gray-50 text-sm text-gray-600 min-w-[60px] text-center">
                        USD
                      </div>
                    </div>
                    {activeField === 'budget' && alertContext && calloutMessage && (
                      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                        <AlertBadge alert={alertContext} />
                        <p className="text-sm text-blue-900">{calloutMessage}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pacing */}
                <div ref={pacingRef} className="bg-white border border-slate-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pacing
                  </label>
                  <div className="relative">
                    <select
                      value={pacing}
                      onChange={(e) => setPacing(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white pr-8"
                    >
                      <option value="Evenly">Evenly</option>
                      <option value="Front-loaded">Front-loaded</option>
                      <option value="Back-loaded">Back-loaded</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {activeField === 'pacing' && alertContext && calloutMessage && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                      <AlertBadge alert={alertContext} />
                      <p className="text-sm text-blue-900">{calloutMessage}</p>
                    </div>
                  )}
                </div>

                {/* ROAS Goal */}
                <div ref={roasGoalRef} className="bg-white border border-slate-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ROAS Goal
                  </label>
                  <input
                    type="text"
                    value={roasGoal}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setRoasGoal(value);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="4"
                  />
                  {activeField === 'roas-goal' && alertContext && calloutMessage && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                      <AlertBadge alert={alertContext} />
                      <p className="text-sm text-blue-900">{calloutMessage}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'creatives' && (
              <div className="space-y-4 pb-4">
                {creatives.map((creative) => {
                  const isExpanded = expandedCreativeId === creative.id;
                  return (
                    <div
                      key={creative.id}
                      className="border border-slate-200 rounded-md overflow-hidden bg-white"
                    >
                      {/* Accordion Header */}
                      <div 
                        onClick={() => setExpandedCreativeId(isExpanded ? null : creative.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${
                          isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <img
                          src={creative.thumbnailUrl}
                          alt={creative.name}
                          className="w-16 h-16 object-cover rounded border border-slate-200 flex-shrink-0"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {creative.name}
                          </span>
                          {!isExpanded && (
                            <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-full">
                              {creative.metadata.assignedAdGroups} Ad groups
                            </span>
                          )}
                        </div>
                        <FontAwesomeIcon
                          icon={isExpanded ? faChevronUp : faChevronDown}
                          className="text-gray-400 text-xs"
                        />
                      </div>

                      {/* Accordion Content - Expanded */}
                      {isExpanded && (
                        <div className="px-4 py-4 bg-white border-t border-slate-200">
                          <div className="space-y-4 mb-4">
                            {/* Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name
                              </label>
                              <input
                                type="text"
                                value={creative.name}
                                onChange={(e) => {
                                  // Handle name change
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>

                            {/* ID */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                ID
                              </label>
                              <input
                                type="text"
                                value={creative.metadata.id}
                                onChange={(e) => {
                                  // Handle ID change
                                }}
                                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                          </div>

                          {/* Status */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Status
                            </label>
                            <input
                              type="text"
                              value={creative.metadata.status}
                              onChange={(e) => {
                                // Handle status change
                              }}
                              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {/* Description */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <input
                              type="text"
                              value={creative.metadata.description}
                              onChange={(e) => {
                                // Handle description change
                              }}
                              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {/* Type */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Type
                            </label>
                            <input
                              type="text"
                              value={creative.metadata.type}
                              onChange={(e) => {
                                // Handle type change
                              }}
                              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {/* Ad Placement */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ad Placement
                            </label>
                            <input
                              type="text"
                              value={creative.metadata.adPlacement}
                              onChange={(e) => {
                                // Handle ad placement change
                              }}
                              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {/* Ad Format */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ad Format
                            </label>
                            <input
                              type="text"
                              value={creative.metadata.adFormat}
                              onChange={(e) => {
                                // Handle ad format change
                              }}
                              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {/* Dimensions */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dimensions
                            </label>
                            <input
                              type="text"
                              value={creative.metadata.dimensions}
                              onChange={(e) => {
                                // Handle dimensions change
                              }}
                              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>

                          {/* Last Modified Date */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Modified Date
                            </label>
                            <input
                              type="text"
                              value={creative.metadata.lastModified}
                              onChange={(e) => {
                                // Handle last modified change
                              }}
                              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Assigned Ad Groups Accordion - Separate from creative accordion */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 px-4 py-4 bg-white">
                          <button
                            type="button"
                            onClick={() => setExpandedAdGroupsCreativeId(
                              expandedAdGroupsCreativeId === creative.id ? null : creative.id
                            )}
                            className="w-full flex items-center justify-between px-3 py-2 transition-colors"
                            style={{ borderWidth: '0px', borderColor: 'rgba(0, 0, 0, 0)', borderStyle: 'none', borderImage: 'none', backgroundColor: 'unset', background: 'unset' }}
                          >
                            <span className="text-sm font-medium text-gray-700">
                              Assigned ad groups
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-full">
                                {creative.metadata.assignedAdGroups} Ad groups
                              </span>
                              <FontAwesomeIcon
                                icon={expandedAdGroupsCreativeId === creative.id ? faChevronUp : faChevronDown}
                                className="text-blue-600 text-xs"
                              />
                            </div>
                          </button>
                          {expandedAdGroupsCreativeId === creative.id && (
                            <div className="mt-2 px-3 py-2 bg-white border border-slate-200 rounded-md">
                              {/* Ad groups content can go here */}
                              <div className="text-sm text-gray-600">
                                Ad groups list would appear here
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6 pb-4">
                {/* Search Bar */}
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                  />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Date, user, campaign attributes"
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* History Log */}
                <div className="space-y-6">
                  {/* NOV 14, 2025 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">NOV 14, 2025</h3>
                    <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">Status:</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Active</span>
                            <span className="text-sm text-gray-400">→</span>
                            <span className="text-sm text-gray-600">Paused</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">by ryan.barr@koddi.com</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">Budget:</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">$1,234.56</span>
                            <span className="text-sm text-gray-400">→</span>
                            <span className="text-sm text-gray-600">$2,000.00</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">by ryan.barr@koddi.com</div>
                      </div>
                    </div>
                  </div>

                  {/* NOV 3, 2025 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">NOV 3, 2025</h3>
                    <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">Budget type:</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Monthly</span>
                            <span className="text-sm text-gray-400">→</span>
                            <span className="text-sm text-gray-600">Daily</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">by ryan.barr@koddi.com</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">Budget:</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">$1,234.56</span>
                            <span className="text-sm text-gray-400">→</span>
                            <span className="text-sm text-gray-600">$2,000.00</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">by ryan.barr@koddi.com</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">End date:</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Dec 1, 2025</span>
                            <span className="text-sm text-gray-400">→</span>
                            <span className="text-sm text-gray-600">Always On</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">by ryan.barr@koddi.com</div>
                      </div>
                    </div>
                  </div>

                  {/* NOV 2, 2025 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">NOV 2, 2025</h3>
                    <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 mb-1">Pacing:</div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">ASAP</span>
                            <span className="text-sm text-gray-400">→</span>
                            <span className="text-sm text-gray-600">Evenly</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">by ryan.barr@koddi.com</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CampaignSettingsDrawer;
