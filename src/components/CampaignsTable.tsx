import { useState, Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Campaign, Alert } from '../types';
import AlertBadge from './AlertBadge';
import PacingProgressBar from './PacingProgressBar';

interface CampaignsTableProps {
  campaigns: Campaign[];
  onRowClick?: (campaign: Campaign) => void;
  selectedCampaigns: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectCampaign: (campaignId: string, checked: boolean) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  compareEnabled?: boolean;
  compareDateRange?: string;
  layoutFormat?: 'table' | 'card';
  onSettingsClick?: (campaign: Campaign) => void;
  onAlertClick?: (campaign: Campaign, alert: Alert) => void;
}

const CampaignsTable = ({
  campaigns,
  onRowClick,
  selectedCampaigns,
  onSelectAll,
  onSelectCampaign,
  isAllSelected,
  isIndeterminate,
  compareEnabled = false,
  compareDateRange,
  layoutFormat = 'table',
  onSettingsClick,
  onAlertClick,
}: CampaignsTableProps) => {
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [selectedAdGroups, setSelectedAdGroups] = useState<Set<string>>(new Set());

  // Generate fake ad groups for each campaign with full data
  const getAdGroups = (campaign: Campaign) => {
    const adGroupCount = 3 + (parseInt(campaign.id) % 5); // 3-7 ad groups per campaign
    // Extract the base name from campaign (e.g., "Beekeeper's" from "2024 - Beekeeper's - Sponsored Product")
    const baseName = campaign.name.includes("Beekeeper's") ? "Beekeeper's" : 
                     campaign.name.includes("Olly") ? "Olly" : 
                     campaign.name.split(' - ')[1] || campaign.name.split(' - ')[0] || "Campaign";
    
    // Distribute campaign budget and unspent budget across ad groups
    // Use weighted distribution to make it realistic
    const weights: number[] = [];
    let totalWeight = 0;
    for (let i = 0; i < adGroupCount; i++) {
      const weight = 0.5 + Math.random() * 1.5; // Random weight between 0.5 and 2.0
      weights.push(weight);
      totalWeight += weight;
    }
    
    // Calculate ad group values that sum to campaign values
    const adGroups = Array.from({ length: adGroupCount }, (_, i) => {
      const weight = weights[i];
      const budgetRatio = weight / totalWeight;
      const budget = Math.floor(campaign.budget * budgetRatio);
      const unspentBudget = Math.floor(campaign.unspentBudget * budgetRatio);
      
      // Pacing ratio can vary per ad group but should average close to campaign pacing
      const pacingVariation = (Math.random() - 0.5) * 20; // ±10% variation
      const pacingRatio = Math.max(0, Math.min(100, campaign.pacingRatio + pacingVariation));
      
      // ROAS can vary per ad group
      const roasVariation = (Math.random() - 0.5) * 1.0; // ±0.5 variation
      const roas = Math.max(0, campaign.roas + roasVariation);
      
      // Generate alerts for some ad groups (30% chance)
      const alerts: Alert[] = [];
      if (Math.random() < 0.3) {
        const alertTypes: Alert['type'][] = ['great-pacing', 'budget-recommendation', 'high-roas'];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const alertTexts = {
          'great-pacing': 'Great pacing',
          'budget-recommendation': 'Budget recom.',
          'high-roas': 'High ROAS goal'
        };
        const alertColors = {
          'great-pacing': 'green' as const,
          'budget-recommendation': 'orange' as const,
          'high-roas': 'red' as const
        };
        alerts.push({
          type: alertType,
          text: alertTexts[alertType],
          color: alertColors[alertType]
        });
      }
      
      return {
        id: `${campaign.id}-adgroup-${i + 1}`,
        name: `${baseName} - Sponsored Product ${String(i + 1).padStart(2, '0')}`,
        campaignId: campaign.id,
        budget,
        unspentBudget,
        pacingRatio: Math.round(pacingRatio),
        roas: Math.round(roas * 10) / 10, // Round to 1 decimal
        alerts,
        status: campaign.status || 'active',
      };
    });
    
    // Adjust last ad group to ensure totals match exactly
    const totalBudget = adGroups.reduce((sum, ag) => sum + ag.budget, 0);
    const totalUnspent = adGroups.reduce((sum, ag) => sum + ag.unspentBudget, 0);
    if (adGroups.length > 0) {
      adGroups[adGroups.length - 1].budget += campaign.budget - totalBudget;
      adGroups[adGroups.length - 1].unspentBudget += campaign.unspentBudget - totalUnspent;
    }
    
    return adGroups;
  };

  const toggleCampaignExpansion = (campaignId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCampaigns(prev => {
      const next = new Set(prev);
      if (next.has(campaignId)) {
        next.delete(campaignId);
      } else {
        next.add(campaignId);
      }
      return next;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate random metrics for a campaign based on its ID (for consistent values)
  const generateCampaignMetrics = (campaign: Campaign) => {
    // Use campaign ID as seed for consistent random values
    const seed = parseInt(campaign.id) || 1;
    const random = (seed * 0.12345) % 1;
    
    // Generate metrics based on campaign budget and seed
    const baseMultiplier = 0.5 + (random * 1.5); // 0.5x to 2x variation
    
    const impressions = Math.floor(500000 + (campaign.budget * 0.8 * baseMultiplier));
    const clicks = Math.floor(impressions * (0.02 + random * 0.03)); // 2-5% CTR
    const conversions = Math.floor(clicks * (0.05 + random * 0.1)); // 5-15% conversion rate
    const revenue = Math.floor(conversions * (50 + random * 100)); // $50-$150 per conversion
    const cost = Math.floor(campaign.budget * (0.3 + random * 0.4)); // 30-70% of budget spent
    
    return {
      impressions,
      clicks,
      conversions,
      revenue,
      cost,
    };
  };

  // Helper function to calculate delta for comparison (mock comparison data)
  // In a real app, this would come from actual comparison period data
  const calculateDelta = (baseValue: number, seed?: number) => {
    // Use seed for consistent random values per campaign
    const random = seed ? (seed * 0.1) % 1 : Math.random();
    const deltaPercent = (random - 0.5) * 50; // Random delta between -25% and +25%
    const deltaValue = Math.floor(baseValue * (deltaPercent / 100));
    return {
      deltaValue: deltaValue,
      deltaPercent: Math.abs(deltaPercent),
      isPositive: deltaValue >= 0,
    };
  };

  // Calculate clicks and delta for comparison (mock comparison data)
  // In a real app, this would come from actual comparison period data
  const calculateClicksData = (campaign: Campaign) => {
    // Mock: generate average clicks and delta for demonstration
    // In real implementation, this would compare actual clicks from two periods
    const baseClicks = Math.floor(campaign.budget * 0.1); // Mock average clicks based on budget
    const delta = calculateDelta(baseClicks, parseInt(campaign.id));
    return {
      averageClicks: baseClicks,
      deltaValue: delta.deltaValue,
      deltaPercent: delta.deltaPercent,
      isPositive: delta.isPositive,
    };
  };

  // Calculate comparison data for budget
  const calculateBudgetData = (campaign: Campaign) => {
    return calculateDelta(campaign.budget, parseInt(campaign.id) + 1);
  };

  // Calculate comparison data for unspent budget
  const calculateUnspentBudgetData = (campaign: Campaign) => {
    return calculateDelta(campaign.unspentBudget, parseInt(campaign.id) + 2);
  };

  // Calculate comparison data for pacing ratio
  const calculatePacingRatioData = (campaign: Campaign) => {
    const delta = calculateDelta(campaign.pacingRatio, parseInt(campaign.id) + 3);
    return {
      ...delta,
      deltaValue: delta.deltaValue, // Pacing ratio is a percentage, so delta is in percentage points
    };
  };

  // Calculate comparison data for ROAS
  const calculateROASData = (campaign: Campaign) => {
    const delta = calculateDelta(campaign.roas * 10, parseInt(campaign.id) + 4);
    return {
      deltaValue: delta.deltaValue / 10, // ROAS is typically a decimal
      deltaPercent: delta.deltaPercent,
      isPositive: delta.isPositive,
    };
  };

  // Component to render change indicator
  const ChangeIndicator = ({ deltaValue, deltaPercent, isPositive, formatValue }: {
    deltaValue: number;
    deltaPercent: number;
    isPositive: boolean;
    formatValue?: (value: number) => string;
  }) => {
    const formattedValue = formatValue 
      ? formatValue(Math.abs(deltaValue))
      : new Intl.NumberFormat('en-US').format(Math.abs(deltaValue));
    
    return (
      <div className="flex items-center gap-2">
        <span 
          className={`text-sm font-normal ${isPositive ? 'text-green-700' : 'text-red-700'}`}
          style={{ width: '65px' }}
        >
          {isPositive ? '+' : '-'}{formattedValue}
        </span>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-2xl text-xs font-medium h-8 inline-flex"
          style={{
            backgroundColor: isPositive ? '#D1FAE5' : '#FEE2E2',
            color: isPositive ? '#065F46' : '#991B1B',
          }}
        >
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{deltaPercent.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  // Card view rendering
  if (layoutFormat === 'card') {
    return (
      <div className="p-6 space-y-4">
          {campaigns.map((campaign) => {
            const isExpanded = expandedCampaigns.has(campaign.id);
            const adGroups = getAdGroups(campaign);
            const metrics = generateCampaignMetrics(campaign);
            
            return (
              <div
                key={campaign.id}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onRowClick?.(campaign)}
              >
                {/* Card Header */}
                <div className="p-4 flex items-center gap-4" style={{ marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.has(campaign.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelectCampaign(campaign.id, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick?.(campaign);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {campaign.status === 'paused' ? (
                        <div 
                          className="relative" 
                          style={{ width: '15px', height: '10px' }}
                          title="Paused"
                        >
                          <div className="absolute inset-0 bg-orange-500 rounded-full flex items-center justify-center" style={{ width: '15px', height: '15px' }}>
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
                          className="text-sm text-blue-600"
                          title="Active"
                        >
                          <path 
                            d="M4.78385 2.21627C4.52604 2.01054 4.13021 2.03659 3.90104 2.297C2.59036 3.78789 2.59036 6.21367 3.90104 7.70586C4.02443 7.84664 4.19766 7.91825 4.37135 7.91825C4.51758 7.91825 4.6651 7.86698 4.78385 7.76281C5.04331 7.53495 5.06901 7.14015 4.84089 6.88078C3.93021 5.84484 3.93021 4.15942 4.84089 3.12297C5.07031 2.86211 5.04427 2.46627 4.78385 2.21627ZM13.3542 0.311585C13.0654 -0.0472689 12.5409 -0.1043 12.1828 0.182992C11.8234 0.471012 11.7661 0.996012 12.0538 1.35487C12.8906 2.39856 13.3333 3.65898 13.3333 5.00013C13.3333 6.34127 12.8911 7.60195 12.0539 8.62252C11.7661 8.98138 11.8236 9.50638 12.1829 9.7944C12.3359 9.94023 12.5208 10.0001 12.7031 10.0001C12.9473 10.0001 13.1891 9.89351 13.3536 9.68841C14.4167 8.36471 15 6.70065 15 5.00013C15 3.29961 14.4167 1.63554 13.3542 0.311585ZM1.66667 5.00013C1.66667 3.65898 2.10885 2.3983 2.94609 1.37773C3.23385 1.01888 3.17641 0.493877 2.81711 0.205856C2.45904 -0.079821 1.93456 -0.0236232 1.64576 0.33445C0.584375 1.63554 0 3.29961 0 5.00013C0 6.70013 0.584375 8.36471 1.64557 9.68763C1.81042 9.89336 2.05208 10.0001 2.29609 10.0001C2.47919 10.0001 2.66302 9.93992 2.81693 9.81703C3.1763 9.52901 3.23359 9.00401 2.94591 8.64515C2.10885 7.60169 1.66667 6.34127 1.66667 5.00013ZM11.099 2.297C10.8717 2.0375 10.4766 2.01237 10.2159 2.24005C9.95643 2.46791 9.93073 2.8627 10.1589 3.12208C11.0695 4.15802 11.0695 5.84343 10.1589 6.87989C9.93078 7.1395 9.95643 7.53406 10.2159 7.76192C10.3348 7.86609 10.4818 7.91737 10.6284 7.91737C10.8023 7.91737 10.9753 7.84575 11.0987 7.70497C12.4089 6.21367 12.4089 3.78659 11.099 2.297ZM7.5 3.54179C6.69531 3.54179 6.04167 4.19544 6.04167 5.00013C6.04167 5.80481 6.69531 6.45846 7.5 6.45846C8.30469 6.45846 8.95833 5.80481 8.95833 5.00013C8.95833 4.19544 8.30469 3.54179 7.5 3.54179Z" 
                            fill="#367DFE"
                          />
                        </svg>
                      )}
                      <div className="text-base font-semibold text-gray-900">
                        {campaign.name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{campaign.campaignId}</div>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center"
                    style={{ width: '28px', height: '28px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettingsClick?.(campaign);
                    }}
                    aria-label="Campaign settings"
                  >
                    <FontAwesomeIcon icon={faGear} className="text-slate-500 text-sm" />
                  </button>
                </div>

                {/* Campaign Settings Badges */}
                <div className="pr-4 pb-4 flex items-center gap-3 flex-wrap" style={{ paddingLeft: 0, marginLeft: '36px', marginBottom: '16px', marginTop: '26px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettingsClick?.(campaign);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-2xl text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Jan 1 - Dec 31, 2025</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettingsClick?.(campaign);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-2xl text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Weekly • {formatCurrency(campaign.budget)}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettingsClick?.(campaign);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-2xl text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Bid automation: On</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettingsClick?.(campaign);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-2xl text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Pacing: Evenly</span>
                  </button>
                </div>

                {/* Performance Metrics */}
                <div className="pl-9 pr-4 pb-4 flex items-center gap-6 flex-wrap ml-9">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-600">Impressions</div>
                      <div className="text-base font-medium text-gray-900">{new Intl.NumberFormat('en-US').format(metrics.impressions)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-2 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-600">Clicks</div>
                      <div className="text-base font-medium text-gray-900">{new Intl.NumberFormat('en-US').format(metrics.clicks)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-600">Conversions</div>
                      <div className="text-base font-medium text-gray-900">{new Intl.NumberFormat('en-US').format(metrics.conversions)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-600">Revenue</div>
                      <div className="text-base font-medium text-gray-900">{formatCurrency(metrics.revenue)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-600">Cost</div>
                      <div className="text-base font-medium text-gray-900">{formatCurrency(metrics.cost)}</div>
                    </div>
                  </div>
                </div>


                {/* Ad Groups Accordion */}
                <div className="border-t border-slate-200 bg-white">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCampaignExpansion(campaign.id, e);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white"
                  >
                    <span className="text-sm font-medium text-gray-700">Assigned ad groups</span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-full">
                        {adGroups.length} Ad groups
                      </span>
                      <FontAwesomeIcon
                        icon={isExpanded ? faChevronDown : faChevronRight}
                        className="text-gray-400 text-sm"
                      />
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2">
                      {adGroups.map((adGroup) => (
                        <div
                          key={adGroup.id}
                          className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          {adGroup.status === 'paused' ? (
                            <div 
                              className="relative" 
                              style={{ width: '15px', height: '10px' }}
                              title="Paused"
                            >
                              <div className="absolute inset-0 bg-orange-500 rounded-full flex items-center justify-center" style={{ width: '15px', height: '15px' }}>
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
                              className="text-sm text-blue-600"
                              title="Active"
                            >
                              <path 
                                d="M4.78385 2.21627C4.52604 2.01054 4.13021 2.03659 3.90104 2.297C2.59036 3.78789 2.59036 6.21367 3.90104 7.70586C4.02443 7.84664 4.19766 7.91825 4.37135 7.91825C4.51758 7.91825 4.6651 7.86698 4.78385 7.76281C5.04331 7.53495 5.06901 7.14015 4.84089 6.88078C3.93021 5.84484 3.93021 4.15942 4.84089 3.12297C5.07031 2.86211 5.04427 2.46627 4.78385 2.21627ZM13.3542 0.311585C13.0654 -0.0472689 12.5409 -0.1043 12.1828 0.182992C11.8234 0.471012 11.7661 0.996012 12.0538 1.35487C12.8906 2.39856 13.3333 3.65898 13.3333 5.00013C13.3333 6.34127 12.8911 7.60195 12.0539 8.62252C11.7661 8.98138 11.8236 9.50638 12.1829 9.7944C12.3359 9.94023 12.5208 10.0001 12.7031 10.0001C12.9473 10.0001 13.1891 9.89351 13.3536 9.68841C14.4167 8.36471 15 6.70065 15 5.00013C15 3.29961 14.4167 1.63554 13.3542 0.311585ZM1.66667 5.00013C1.66667 3.65898 2.10885 2.3983 2.94609 1.37773C3.23385 1.01888 3.17641 0.493877 2.81711 0.205856C2.45904 -0.079821 1.93456 -0.0236232 1.64576 0.33445C0.584375 1.63554 0 3.29961 0 5.00013C0 6.70013 0.584375 8.36471 1.64557 9.68763C1.81042 9.89336 2.05208 10.0001 2.29609 10.0001C2.47919 10.0001 2.66302 9.93992 2.81693 9.81703C3.1763 9.52901 3.23359 9.00401 2.94591 8.64515C2.10885 7.60169 1.66667 6.34127 1.66667 5.00013ZM11.099 2.297C10.8717 2.0375 10.4766 2.01237 10.2159 2.24005C9.95643 2.46791 9.93073 2.8627 10.1589 3.12208C11.0695 4.15802 11.0695 5.84343 10.1589 6.87989C9.93078 7.1395 9.95643 7.53406 10.2159 7.76192C10.3348 7.86609 10.4818 7.91737 10.6284 7.91737C10.8023 7.91737 10.9753 7.84575 11.0987 7.70497C12.4089 6.21367 12.4089 3.78659 11.099 2.297ZM7.5 3.54179C6.69531 3.54179 6.04167 4.19544 6.04167 5.00013C6.04167 5.80481 6.69531 6.45846 7.5 6.45846C8.30469 6.45846 8.95833 5.80481 8.95833 5.00013C8.95833 4.19544 8.30469 3.54179 7.5 3.54179Z" 
                                fill="#367DFE"
                              />
                            </svg>
                          )}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{adGroup.name}</div>
                            <div className="text-xs text-gray-500">{campaign.campaignId}</div>
                          </div>
                          {adGroup.alerts.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {adGroup.alerts.map((alert, index) => (
                                <AlertBadge 
                                  key={index} 
                                  alert={alert}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAlertClick?.(campaign, alert);
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    );
  }

  // Table view (existing code)
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden my-6 mx-6" style={{ boxShadow: 'none' }}>
      <div 
        className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent" 
        style={{ width: '100%' }}
      >
        <table 
          className={compareEnabled ? 'min-w-[1200px]' : ''}
          style={{ tableLayout: 'auto', width: '100%' }}
        >
          <thead className="bg-white border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-5 text-left bg-white sticky left-0 z-20" 
                  style={{ backgroundColor: 'rgba(255, 255, 255, 1)', width: '50px' }}
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="px-6 py-5 text-left text-sm font-medium text-gray-700 bg-white sticky z-20 border-r border-slate-200" 
                  style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', width: '250px', left: '50px', boxShadow: 'rgba(0, 0, 0, 0.05) 5px 0px 5px -5px' }}
                >
                  <span className="pr-4 w-full block" style={{ width: '125px' }}>Campaign name</span>
                </th>
                <th className="px-6 py-5 text-left text-sm font-medium text-gray-700" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', width: '150px' }}>
                  <span className="border-r border-gray-200 pr-4 block" style={{ width: '150px' }}>Alerts</span>
                </th>
                <th className="px-6 py-5 text-left text-sm font-medium text-gray-700" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', width: '150px' }}>
                  <span className={compareEnabled ? "border-r border-gray-200 pr-4 block" : "border-r border-gray-200 pr-4 block"} style={{ width: '150px' }}>Budget</span>
                </th>
                {compareEnabled && (
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-700" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', width: '225px' }}>
                    <div>
                      <div style={{ width: '225px' }}>Change in budget</div>
                      {compareDateRange && (
                        <div className="text-xs text-gray-400 font-normal mt-1">{compareDateRange}</div>
                      )}
                    </div>
                  </th>
                )}
                <th className="px-6 py-5 text-left text-sm font-medium text-gray-700" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', width: '150px' }}>
                  <span className={compareEnabled ? "border-r border-gray-200 pr-4 w-full block" : "border-r border-gray-200 pr-4 w-full block"}>Unspent budget</span>
                </th>
                {compareEnabled && (
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-700" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', width: '225px' }}>
                    <div>
                      <div style={{ width: '225px' }}>Change in unspent budget</div>
                      {compareDateRange && (
                        <div className="text-xs text-gray-400 font-normal mt-1">{compareDateRange}</div>
                      )}
                    </div>
                  </th>
                )}
                <th className="px-6 py-5 text-left text-sm font-medium text-gray-700" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', width: '233px' }}>
                  <span className={compareEnabled ? "border-r border-gray-200 pr-4 w-full block" : "border-r border-gray-200 pr-4 w-full block"}>Pacing ratio</span>
                </th>
                {compareEnabled && (
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-700" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', width: '225px' }}>
                    <div>
                      <div style={{ width: '225px' }}>Change in pacing ratio</div>
                      {compareDateRange && (
                        <div className="text-xs text-gray-400 font-normal mt-1">{compareDateRange}</div>
                      )}
                    </div>
                  </th>
                )}
                <th className="px-6 py-5 text-left text-sm font-medium text-gray-700" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', width: '100px' }}>
                  <span className={compareEnabled ? "border-r border-gray-200 pr-4 w-full block" : ""}>ROAS</span>
                </th>
                {compareEnabled && (
                  <th className="px-6 py-5 text-left text-sm font-medium text-gray-700" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', width: '225px' }}>
                    <div>
                      <div style={{ width: '225px' }}>Change in ROAS</div>
                      {compareDateRange && (
                        <div className="text-xs text-gray-400 font-normal mt-1">{compareDateRange}</div>
                      )}
                    </div>
                  </th>
                )}
                {compareEnabled && (
                  <>
                    <th className="px-6 py-5 text-left text-sm font-medium text-gray-700" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', width: '120px' }}>
                      <span className="border-r border-gray-200 pr-4 w-full block">Clicks</span>
                    </th>
                    <th className="px-6 py-5 text-left text-sm font-medium text-gray-700" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', width: '225px' }}>
                      <div>
                        <div style={{ width: '225px' }}>Change in clicks</div>
                        {compareDateRange && (
                          <div className="text-xs text-gray-400 font-normal mt-1">{compareDateRange}</div>
                        )}
                      </div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
          <tbody className="bg-white">
            {campaigns.map((campaign) => {
              const isExpanded = expandedCampaigns.has(campaign.id);
              const adGroups = getAdGroups(campaign);
              return (
                <Fragment key={campaign.id}>
                  <tr
                    className="group cursor-pointer transition-colors hover:bg-slate-50"
                    onClick={() => onRowClick?.(campaign)}
                  >
                <td 
                  className="px-6 py-5 bg-white sticky left-0 z-10 group-hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleCampaignExpansion(campaign.id, e)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                      title={expandedCampaigns.has(campaign.id) ? 'Collapse ad groups' : 'Expand ad groups'}
                    >
                      <FontAwesomeIcon
                        icon={expandedCampaigns.has(campaign.id) ? faChevronDown : faChevronRight}
                        className="text-xs"
                      />
                    </button>
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.has(campaign.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectCampaign(campaign.id, e.target.checked);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </td>
                <td 
                  className="px-6 py-5 bg-white sticky z-10 group-hover:bg-slate-50 transition-colors relative"
                  style={{ left: '50px' }}
                >
                  <div className="flex items-center gap-2">
                    {campaign.status === 'paused' ? (
                      <div 
                        className="relative" 
                        style={{ width: '15px', height: '10px' }}
                        title="Paused"
                      >
                        <div className="absolute inset-0 bg-orange-500 rounded-full flex items-center justify-center" style={{ width: '15px', height: '15px' }}>
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
                        className="text-sm text-blue-600"
                        title="Active"
                      >
                        <path 
                          d="M4.78385 2.21627C4.52604 2.01054 4.13021 2.03659 3.90104 2.297C2.59036 3.78789 2.59036 6.21367 3.90104 7.70586C4.02443 7.84664 4.19766 7.91825 4.37135 7.91825C4.51758 7.91825 4.6651 7.86698 4.78385 7.76281C5.04331 7.53495 5.06901 7.14015 4.84089 6.88078C3.93021 5.84484 3.93021 4.15942 4.84089 3.12297C5.07031 2.86211 5.04427 2.46627 4.78385 2.21627ZM13.3542 0.311585C13.0654 -0.0472689 12.5409 -0.1043 12.1828 0.182992C11.8234 0.471012 11.7661 0.996012 12.0538 1.35487C12.8906 2.39856 13.3333 3.65898 13.3333 5.00013C13.3333 6.34127 12.8911 7.60195 12.0539 8.62252C11.7661 8.98138 11.8236 9.50638 12.1829 9.7944C12.3359 9.94023 12.5208 10.0001 12.7031 10.0001C12.9473 10.0001 13.1891 9.89351 13.3536 9.68841C14.4167 8.36471 15 6.70065 15 5.00013C15 3.29961 14.4167 1.63554 13.3542 0.311585ZM1.66667 5.00013C1.66667 3.65898 2.10885 2.3983 2.94609 1.37773C3.23385 1.01888 3.17641 0.493877 2.81711 0.205856C2.45904 -0.079821 1.93456 -0.0236232 1.64576 0.33445C0.584375 1.63554 0 3.29961 0 5.00013C0 6.70013 0.584375 8.36471 1.64557 9.68763C1.81042 9.89336 2.05208 10.0001 2.29609 10.0001C2.47919 10.0001 2.66302 9.93992 2.81693 9.81703C3.1763 9.52901 3.23359 9.00401 2.94591 8.64515C2.10885 7.60169 1.66667 6.34127 1.66667 5.00013ZM11.099 2.297C10.8717 2.0375 10.4766 2.01237 10.2159 2.24005C9.95643 2.46791 9.93073 2.8627 10.1589 3.12208C11.0695 4.15802 11.0695 5.84343 10.1589 6.87989C9.93078 7.1395 9.95643 7.53406 10.2159 7.76192C10.3348 7.86609 10.4818 7.91737 10.6284 7.91737C10.8023 7.91737 10.9753 7.84575 11.0987 7.70497C12.4089 6.21367 12.4089 3.78659 11.099 2.297ZM7.5 3.54179C6.69531 3.54179 6.04167 4.19544 6.04167 5.00013C6.04167 5.80481 6.69531 6.45846 7.5 6.45846C8.30469 6.45846 8.95833 5.80481 8.95833 5.00013C8.95833 4.19544 8.30469 3.54179 7.5 3.54179Z" 
                          fill="#367DFE"
                        />
                      </svg>
                    )}
                    <div style={{ width: '275px' }}>
                      <div className="text-sm font-normal text-gray-900">
                        {campaign.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{campaign.campaignId}</div>
                    </div>
                  </div>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center"
                    style={{ width: '28px', height: '28px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettingsClick?.(campaign);
                    }}
                    aria-label="Campaign settings"
                  >
                    <FontAwesomeIcon icon={faGear} className="text-slate-500 text-sm" />
                  </button>
                </td>
                <td className="px-6 py-5 group-hover:bg-slate-50 transition-colors">
                  <div className="flex flex-wrap gap-2">
                    {campaign.alerts.map((alert, index) => (
                      <AlertBadge 
                        key={index} 
                        alert={alert}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAlertClick?.(campaign, alert);
                        }}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-gray-900 font-normal group-hover:bg-slate-50 transition-colors" style={{ width: '125px' }}>
                  {formatCurrency(campaign.budget)}
                </td>
                {compareEnabled && (() => {
                  const budgetData = calculateBudgetData(campaign);
                  return (
                    <td className="px-6 py-5 group-hover:bg-slate-50 transition-colors">
                      <ChangeIndicator
                        deltaValue={budgetData.deltaValue}
                        deltaPercent={budgetData.deltaPercent}
                        isPositive={budgetData.isPositive}
                        formatValue={(value) => formatCurrency(value)}
                      />
                    </td>
                  );
                })()}
                <td className="px-6 py-5 text-sm text-gray-900 font-normal group-hover:bg-slate-50 transition-colors">
                  {formatCurrency(campaign.unspentBudget)}
                </td>
                {compareEnabled && (() => {
                  const unspentBudgetData = calculateUnspentBudgetData(campaign);
                  return (
                    <td className="px-6 py-5 group-hover:bg-slate-50 transition-colors">
                      <ChangeIndicator
                        deltaValue={unspentBudgetData.deltaValue}
                        deltaPercent={unspentBudgetData.deltaPercent}
                        isPositive={unspentBudgetData.isPositive}
                        formatValue={(value) => formatCurrency(value)}
                      />
                    </td>
                  );
                })()}
                <td className="px-6 py-5 group-hover:bg-slate-50 transition-colors">
                  <PacingProgressBar ratio={campaign.pacingRatio} />
                </td>
                {compareEnabled && (() => {
                  const pacingRatioData = calculatePacingRatioData(campaign);
                  return (
                    <td className="px-6 py-5 group-hover:bg-slate-50 transition-colors">
                      <ChangeIndicator
                        deltaValue={pacingRatioData.deltaValue}
                        deltaPercent={pacingRatioData.deltaPercent}
                        isPositive={pacingRatioData.isPositive}
                        formatValue={(value) => `${value.toFixed(0)}%`}
                      />
                    </td>
                  );
                })()}
                <td className="px-6 py-5 text-sm text-gray-900 font-normal group-hover:bg-slate-50 transition-colors">
                  {campaign.roas}
                </td>
                {compareEnabled && (() => {
                  const roasData = calculateROASData(campaign);
                  return (
                    <td className="px-6 py-5 group-hover:bg-slate-50 transition-colors">
                      <ChangeIndicator
                        deltaValue={roasData.deltaValue}
                        deltaPercent={roasData.deltaPercent}
                        isPositive={roasData.isPositive}
                        formatValue={(value) => value.toFixed(2)}
                      />
                    </td>
                  );
                })()}
                {compareEnabled && (() => {
                  const clicksData = calculateClicksData(campaign);
                  const formattedClicks = new Intl.NumberFormat('en-US').format(clicksData.averageClicks);
                  return (
                    <>
                      <td className="px-6 py-5 text-sm text-gray-900 font-normal group-hover:bg-slate-50 transition-colors">
                        {formattedClicks}
                      </td>
                      <td className="px-6 py-5 group-hover:bg-slate-50 transition-colors">
                        <ChangeIndicator
                          deltaValue={clicksData.deltaValue}
                          deltaPercent={clicksData.deltaPercent}
                          isPositive={clicksData.isPositive}
                        />
                      </td>
                    </>
                  );
                })()}
                  </tr>
                  {/* Nested Ad Group Rows */}
                  {isExpanded && adGroups.map((adGroup) => (
                    <tr
                      key={adGroup.id}
                      className="bg-white group hover:bg-slate-50 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <td className="px-6 py-3 bg-white sticky left-0 z-10 group-hover:bg-slate-50 transition-colors">
                      </td>
                      <td 
                        className="px-6 py-3 bg-white sticky z-10 group-hover:bg-slate-50 transition-colors"
                        style={{ left: '50px' }}
                      >
                        <div className="flex items-center gap-2 ml-7 pl-7">
                          {/* Status icon */}
                          {adGroup.status === 'paused' ? (
                            <div 
                              className="relative" 
                              style={{ width: '15px', height: '10px' }}
                              title="Paused"
                            >
                              <div className="absolute inset-0 bg-orange-500 rounded-full flex items-center justify-center" style={{ width: '15px', height: '15px' }}>
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
                              className="text-sm text-blue-600"
                              title="Active"
                            >
                              <path 
                                d="M4.78385 2.21627C4.52604 2.01054 4.13021 2.03659 3.90104 2.297C2.59036 3.78789 2.59036 6.21367 3.90104 7.70586C4.02443 7.84664 4.19766 7.91825 4.37135 7.91825C4.51758 7.91825 4.6651 7.86698 4.78385 7.76281C5.04331 7.53495 5.06901 7.14015 4.84089 6.88078C3.93021 5.84484 3.93021 4.15942 4.84089 3.12297C5.07031 2.86211 5.04427 2.46627 4.78385 2.21627ZM13.3542 0.311585C13.0654 -0.0472689 12.5409 -0.1043 12.1828 0.182992C11.8234 0.471012 11.7661 0.996012 12.0538 1.35487C12.8906 2.39856 13.3333 3.65898 13.3333 5.00013C13.3333 6.34127 12.8911 7.60195 12.0539 8.62252C11.7661 8.98138 11.8236 9.50638 12.1829 9.7944C12.3359 9.94023 12.5208 10.0001 12.7031 10.0001C12.9473 10.0001 13.1891 9.89351 13.3536 9.68841C14.4167 8.36471 15 6.70065 15 5.00013C15 3.29961 14.4167 1.63554 13.3542 0.311585ZM1.66667 5.00013C1.66667 3.65898 2.10885 2.3983 2.94609 1.37773C3.23385 1.01888 3.17641 0.493877 2.81711 0.205856C2.45904 -0.079821 1.93456 -0.0236232 1.64576 0.33445C0.584375 1.63554 0 3.29961 0 5.00013C0 6.70013 0.584375 8.36471 1.64557 9.68763C1.81042 9.89336 2.05208 10.0001 2.29609 10.0001C2.47919 10.0001 2.66302 9.93992 2.81693 9.81703C3.1763 9.52901 3.23359 9.00401 2.94591 8.64515C2.10885 7.60169 1.66667 6.34127 1.66667 5.00013ZM11.099 2.297C10.8717 2.0375 10.4766 2.01237 10.2159 2.24005C9.95643 2.46791 9.93073 2.8627 10.1589 3.12208C11.0695 4.15802 11.0695 5.84343 10.1589 6.87989C9.93078 7.1395 9.95643 7.53406 10.2159 7.76192C10.3348 7.86609 10.4818 7.91737 10.6284 7.91737C10.8023 7.91737 10.9753 7.84575 11.0987 7.70497C12.4089 6.21367 12.4089 3.78659 11.099 2.297ZM7.5 3.54179C6.69531 3.54179 6.04167 4.19544 6.04167 5.00013C6.04167 5.80481 6.69531 6.45846 7.5 6.45846C8.30469 6.45846 8.95833 5.80481 8.95833 5.00013C8.95833 4.19544 8.30469 3.54179 7.5 3.54179Z" 
                                fill="#367DFE"
                              />
                            </svg>
                          )}
                          <div style={{ width: '275px' }}>
                            <div className="text-sm font-normal text-gray-900 pl-4">
                              {adGroup.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 pl-4">{campaign.campaignId}</div>
                          </div>
                        </div>
                      </td>
                      {/* Alerts */}
                      <td className="px-6 py-3 bg-white group-hover:bg-slate-50 transition-colors">
                        <div className="flex flex-wrap gap-2">
                          {adGroup.alerts.map((alert, index) => {
                            // Find the parent campaign for this ad group
                            const parentCampaign = campaigns.find(c => c.id === campaign.id);
                            return (
                              <AlertBadge 
                                key={index} 
                                alert={alert}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (parentCampaign) {
                                    onAlertClick?.(parentCampaign, alert);
                                  }
                                }}
                              />
                            );
                          })}
                        </div>
                      </td>
                      {/* Budget */}
                      <td className="px-6 py-3 text-sm text-gray-900 font-normal bg-white group-hover:bg-slate-50 transition-colors" style={{ width: '125px' }}>
                        {formatCurrency(adGroup.budget)}
                      </td>
                      {/* Change in budget */}
                      {compareEnabled && (() => {
                        const budgetData = calculateDelta(adGroup.budget, parseInt(adGroup.id.replace(/\D/g, '')));
                        return (
                          <td className="px-6 py-3 bg-white group-hover:bg-slate-50 transition-colors">
                            <ChangeIndicator
                              deltaValue={budgetData.deltaValue}
                              deltaPercent={budgetData.deltaPercent}
                              isPositive={budgetData.isPositive}
                              formatValue={(value) => formatCurrency(value)}
                            />
                          </td>
                        );
                      })()}
                      {/* Unspent budget */}
                      <td className="px-6 py-3 text-sm text-gray-900 font-normal bg-white group-hover:bg-slate-50 transition-colors">
                        {formatCurrency(adGroup.unspentBudget)}
                      </td>
                      {/* Change in unspent budget */}
                      {compareEnabled && (() => {
                        const unspentBudgetData = calculateDelta(adGroup.unspentBudget, parseInt(adGroup.id.replace(/\D/g, '')) + 1);
                        return (
                          <td className="px-6 py-3 bg-white group-hover:bg-slate-50 transition-colors">
                            <ChangeIndicator
                              deltaValue={unspentBudgetData.deltaValue}
                              deltaPercent={unspentBudgetData.deltaPercent}
                              isPositive={unspentBudgetData.isPositive}
                              formatValue={(value) => formatCurrency(value)}
                            />
                          </td>
                        );
                      })()}
                      {/* Pacing ratio */}
                      <td className="px-6 py-3 bg-white group-hover:bg-slate-50 transition-colors">
                        <PacingProgressBar ratio={adGroup.pacingRatio} />
                      </td>
                      {/* Change in pacing ratio */}
                      {compareEnabled && (() => {
                        const pacingRatioData = calculateDelta(adGroup.pacingRatio, parseInt(adGroup.id.replace(/\D/g, '')) + 2);
                        return (
                          <td className="px-6 py-3 bg-white group-hover:bg-slate-50 transition-colors">
                            <ChangeIndicator
                              deltaValue={pacingRatioData.deltaValue}
                              deltaPercent={pacingRatioData.deltaPercent}
                              isPositive={pacingRatioData.isPositive}
                              formatValue={(value) => `${value.toFixed(0)}%`}
                            />
                          </td>
                        );
                      })()}
                      {/* ROAS */}
                      <td className="px-6 py-3 text-sm text-gray-900 font-normal bg-white group-hover:bg-slate-50 transition-colors">
                        {adGroup.roas}
                      </td>
                      {/* Change in ROAS */}
                      {compareEnabled && (() => {
                        const roasData = calculateDelta(adGroup.roas * 10, parseInt(adGroup.id.replace(/\D/g, '')) + 3);
                        return (
                          <td className="px-6 py-3 bg-white group-hover:bg-slate-50 transition-colors">
                            <ChangeIndicator
                              deltaValue={roasData.deltaValue / 10}
                              deltaPercent={roasData.deltaPercent}
                              isPositive={roasData.isPositive}
                              formatValue={(value) => value.toFixed(2)}
                            />
                          </td>
                        );
                      })()}
                      {/* Clicks and change in clicks */}
                      {compareEnabled && (() => {
                        const baseClicks = Math.floor(adGroup.budget * 0.1);
                        const clicksData = calculateDelta(baseClicks, parseInt(adGroup.id.replace(/\D/g, '')) + 4);
                        const formattedClicks = new Intl.NumberFormat('en-US').format(baseClicks);
                        return (
                          <>
                            <td className="px-6 py-3 text-sm text-gray-900 font-normal bg-white group-hover:bg-slate-50 transition-colors">
                              {formattedClicks}
                            </td>
                            <td className="px-6 py-3 bg-white group-hover:bg-slate-50 transition-colors">
                              <ChangeIndicator
                                deltaValue={clicksData.deltaValue}
                                deltaPercent={clicksData.deltaPercent}
                                isPositive={clicksData.isPositive}
                              />
                            </td>
                          </>
                        );
                      })()}
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignsTable;
