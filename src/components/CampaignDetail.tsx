import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faGear, faCopy, faPause, faPlay, faChartLine, faLayerGroup, faCog } from '@fortawesome/free-solid-svg-icons';
import { Campaign } from '../types';
import GraphView from './GraphView';
import PacingProgressBar from './PacingProgressBar';
import AlertBadge from './AlertBadge';

interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
  onEdit?: (campaign: Campaign) => void;
  onDuplicate?: (campaign: Campaign) => void;
  onPause?: (campaign: Campaign) => void;
}

type TabType = 'overview' | 'ad-groups' | 'settings';

const CampaignDetail = ({ campaign, onBack, onEdit, onDuplicate, onPause }: CampaignDetailProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
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
      if (Math.random() < 0.3) {
        const alertTypes: any[] = ['great-pacing', 'budget-recommendation', 'high-roas'];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const alertTexts: Record<string, string> = {
          'great-pacing': 'Great pacing',
          'budget-recommendation': 'Budget recom.',
          'high-roas': 'High ROAS goal'
        };
        const alertColors: Record<string, 'green' | 'orange' | 'red'> = {
          'great-pacing': 'green',
          'budget-recommendation': 'orange',
          'high-roas': 'red'
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate trend (mock - in real app would compare periods)
  const calculateTrend = (current: number, seed: number) => {
    const random = (seed * 0.1) % 1;
    return (random - 0.5) * 30; // Random trend between -15% and +15%
  };

  const revenueTrend = calculateTrend(metrics.revenue, parseInt(campaign.id));
  const roasTrend = calculateTrend(campaign.roas, parseInt(campaign.id) + 1);
  const spendTrend = calculateTrend(metrics.spend, parseInt(campaign.id) + 2);

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-in fade-in duration-200">
      {/* Navigation Header - Apple Style */}
      <div className="bg-white border-b border-slate-200/60 sticky top-0 z-10">
        <div className="px-6 py-4">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <button
              onClick={onBack}
              className="hover:text-slate-700 transition-colors flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              <span>Campaigns</span>
            </button>
            <span>/</span>
            <span className="text-slate-900 font-medium truncate max-w-md">{campaign.name}</span>
          </div>

          {/* Title and Actions Row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h1 
                  className="text-3xl font-bold text-gray-900 truncate" 
                  style={{ letterSpacing: '-0.025em', lineHeight: '1.2' }}
                >
                  {campaign.name}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    campaign.status === 'active'
                      ? 'bg-green-50 text-green-700 border border-green-200/50'
                      : 'bg-orange-50 text-orange-700 border border-orange-200/50'
                  }`}
                >
                  {campaign.status === 'active' ? 'Active' : 'Paused'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="font-mono">{campaign.campaignId}</span>
                {campaign.advertiser && (
                  <>
                    <span>•</span>
                    <span>{campaign.advertiser}</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons - Apple Style Ghost Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onEdit?.(campaign)}
                className="px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all text-sm font-medium text-slate-700 flex items-center gap-2 shadow-sm hover:shadow"
              >
                <FontAwesomeIcon icon={faGear} className="text-xs" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDuplicate?.(campaign)}
                className="px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all text-sm font-medium text-slate-700 flex items-center gap-2 shadow-sm hover:shadow"
              >
                <FontAwesomeIcon icon={faCopy} className="text-xs" />
                <span>Duplicate</span>
              </button>
              <button
                onClick={() => onPause?.(campaign)}
                className="px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all text-sm font-medium text-slate-700 flex items-center gap-2 shadow-sm hover:shadow"
              >
                <FontAwesomeIcon 
                  icon={campaign.status === 'active' ? faPause : faPlay} 
                  className="text-xs" 
                />
                <span>{campaign.status === 'active' ? 'Pause' : 'Resume'}</span>
              </button>
            </div>
          </div>

          {/* Campaign Settings - Always Visible in Header */}
          <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Budget</div>
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(campaign.budget)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Pacing</div>
                <div className="text-sm font-semibold text-gray-900">{campaign.pacingRatio}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Unspent</div>
                <div className="text-sm font-semibold text-gray-900">{formatCurrency(campaign.unspentBudget)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">End Date</div>
                <div className="text-sm font-semibold text-gray-900">Dec 31, 2025</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Pacing Strategy</div>
                <div className="text-sm font-semibold text-gray-900">Evenly</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Bid Automation</div>
                <div className="text-sm font-semibold text-gray-900">On</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation - Apple Style */}
        <div className="w-64 bg-white border-r border-slate-200/60 flex-shrink-0 overflow-y-auto">
          <nav className="p-4">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FontAwesomeIcon icon={faChartLine} className="text-sm" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('ad-groups')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'ad-groups'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FontAwesomeIcon icon={faLayerGroup} className="text-sm" />
                <span>Ad Groups</span>
                <span className="ml-auto text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {adGroups.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FontAwesomeIcon icon={faCog} className="text-sm" />
                <span>Settings</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 max-w-6xl">
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <>
                {/* Hero Metrics - Apple Card Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Revenue Card */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-slate-600 mb-3" style={{ letterSpacing: '0.01em' }}>
                      Revenue
                    </div>
                    <div 
                      className="text-3xl font-bold text-gray-900 mb-3" 
                      style={{ letterSpacing: '-0.03em', lineHeight: '1.1' }}
                    >
                      {formatCurrency(metrics.revenue)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          revenueTrend >= 0
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <span>{revenueTrend >= 0 ? '↑' : '↓'}</span>
                        <span>{Math.abs(revenueTrend).toFixed(1)}%</span>
                      </div>
                      <span className="text-xs text-slate-500">vs last period</span>
                    </div>
                  </div>

                  {/* ROAS Card */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-slate-600 mb-3" style={{ letterSpacing: '0.01em' }}>
                      ROAS
                    </div>
                    <div 
                      className="text-3xl font-bold text-gray-900 mb-3" 
                      style={{ letterSpacing: '-0.03em', lineHeight: '1.1' }}
                    >
                      {campaign.roas.toFixed(2)}x
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          roasTrend >= 0
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <span>{roasTrend >= 0 ? '↑' : '↓'}</span>
                        <span>{Math.abs(roasTrend).toFixed(1)}%</span>
                      </div>
                      <span className="text-xs text-slate-500">vs last period</span>
                    </div>
                  </div>

                  {/* Spend Card */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-slate-600 mb-3" style={{ letterSpacing: '0.01em' }}>
                      Spend
                    </div>
                    <div 
                      className="text-3xl font-bold text-gray-900 mb-3" 
                      style={{ letterSpacing: '-0.03em', lineHeight: '1.1' }}
                    >
                      {formatCurrency(metrics.spend)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          spendTrend >= 0
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <span>{spendTrend >= 0 ? '↑' : '↓'}</span>
                        <span>{Math.abs(spendTrend).toFixed(1)}%</span>
                      </div>
                      <span className="text-xs text-slate-500">vs last period</span>
                    </div>
                  </div>
                </div>

                {/* Performance Graph - Full Width Card */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900" style={{ letterSpacing: '-0.01em' }}>
                      Performance Overview
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Track key metrics over time</p>
                  </div>
                  <GraphView isVisible={true} compareEnabled={false} />
                </div>
              </>
            )}

            {activeTab === 'ad-groups' && (
              <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-semibold text-gray-900" style={{ letterSpacing: '-0.01em' }}>
                    Ad Groups
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{adGroups.length} ad groups in this campaign</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {adGroups.map((adGroup) => (
                    <div
                      key={adGroup.id}
                      className="px-6 py-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            {adGroup.status === 'paused' ? (
                              <div 
                                className="relative flex-shrink-0" 
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
                                className="text-sm text-blue-600 flex-shrink-0"
                                title="Active"
                              >
                                <path 
                                  d="M4.78385 2.21627C4.52604 2.01054 4.13021 2.03659 3.90104 2.297C2.59036 3.78789 2.59036 6.21367 3.90104 7.70586C4.02443 7.84664 4.19766 7.91825 4.37135 7.91825C4.51758 7.91825 4.6651 7.86698 4.78385 7.76281C5.04331 7.53495 5.06901 7.14015 4.84089 6.88078C3.93021 5.84484 3.93021 4.15942 4.84089 3.12297C5.07031 2.86211 5.04427 2.46627 4.78385 2.21627ZM13.3542 0.311585C13.0654 -0.0472689 12.5409 -0.1043 12.1828 0.182992C11.8234 0.471012 11.7661 0.996012 12.0538 1.35487C12.8906 2.39856 13.3333 3.65898 13.3333 5.00013C13.3333 6.34127 12.8911 7.60195 12.0539 8.62252C11.7661 8.98138 11.8236 9.50638 12.1829 9.7944C12.3359 9.94023 12.5208 10.0001 12.7031 10.0001C12.9473 10.0001 13.1891 9.89351 13.3536 9.68841C14.4167 8.36471 15 6.70065 15 5.00013C15 3.29961 14.4167 1.63554 13.3542 0.311585ZM1.66667 5.00013C1.66667 3.65898 2.10885 2.3983 2.94609 1.37773C3.23385 1.01888 3.17641 0.493877 2.81711 0.205856C2.45904 -0.079821 1.93456 -0.0236232 1.64576 0.33445C0.584375 1.63554 0 3.29961 0 5.00013C0 6.70013 0.584375 8.36471 1.64557 9.68763C1.81042 9.89336 2.05208 10.0001 2.29609 10.0001C2.47919 10.0001 2.66302 9.93992 2.81693 9.81703C3.1763 9.52901 3.23359 9.00401 2.94591 8.64515C2.10885 7.60169 1.66667 6.34127 1.66667 5.00013ZM11.099 2.297C10.8717 2.0375 10.4766 2.01237 10.2159 2.24005C9.95643 2.46791 9.93073 2.8627 10.1589 3.12208C11.0695 4.15802 11.0695 5.84343 10.1589 6.87989C9.93078 7.1395 9.95643 7.53406 10.2159 7.76192C10.3348 7.86609 10.4818 7.91737 10.6284 7.91737C10.8023 7.91737 10.9753 7.84575 11.0987 7.70497C12.4089 6.21367 12.4089 3.78659 11.099 2.297ZM7.5 3.54179C6.69531 3.54179 6.04167 4.19544 6.04167 5.00013C6.04167 5.80481 6.69531 6.45846 7.5 6.45846C8.30469 6.45846 8.95833 5.80481 8.95833 5.00013C8.95833 4.19544 8.30469 3.54179 7.5 3.54179Z" 
                                  fill="#367DFE"
                                />
                              </svg>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 truncate">
                                {adGroup.name}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">{adGroup.campaignId}</div>
                            </div>
                          </div>
                          {adGroup.alerts.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {adGroup.alerts.map((alert: any, alertIndex: number) => (
                                <AlertBadge key={alertIndex} alert={alert} />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-6 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">Budget</div>
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(adGroup.budget)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">Pacing</div>
                            <div className="text-sm font-semibold text-gray-900">
                              {adGroup.pacingRatio}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">ROAS</div>
                            <div className="text-sm font-semibold text-gray-900">
                              {adGroup.roas.toFixed(2)}x
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-semibold text-gray-900" style={{ letterSpacing: '-0.01em' }}>
                    Campaign Settings
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Manage campaign configuration and preferences</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {/* Budget */}
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-slate-900 mb-0.5">Budget</div>
                      <div className="text-xs text-slate-500">Total allocated budget</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(campaign.budget)}
                    </div>
                  </div>

                  {/* Pacing */}
                  <div className="px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-slate-900 mb-0.5">Pacing</div>
                        <div className="text-xs text-slate-500">Current pacing ratio</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {campaign.pacingRatio}%
                      </div>
                    </div>
                    <PacingProgressBar ratio={campaign.pacingRatio} />
                  </div>

                  {/* Unspent Budget */}
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-slate-900 mb-0.5">Unspent Budget</div>
                      <div className="text-xs text-slate-500">Remaining budget</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 text-right">
                      {formatCurrency(campaign.unspentBudget)}
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-slate-900 mb-0.5">End Date</div>
                      <div className="text-xs text-slate-500">Campaign end date</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 text-right">
                      Dec 31, 2025
                    </div>
                  </div>

                  {/* Pacing Strategy */}
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-slate-900 mb-0.5">Pacing Strategy</div>
                      <div className="text-xs text-slate-500">Budget distribution</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 text-right">
                      Evenly
                    </div>
                  </div>

                  {/* Bid Automation */}
                  <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-slate-900 mb-0.5">Bid Automation</div>
                      <div className="text-xs text-slate-500">Automated bidding</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 text-right">
                      On
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
