import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Campaign } from '../types';

export interface ChangeEntry {
  id: string;
  campaignId: string;
  campaignName: string;
  date: string;
  type: 'Status' | 'Budget' | 'Budget type' | 'End date' | 'Pacing';
  oldValue: string;
  newValue: string;
  user: string;
}

interface ChangeHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCampaignIds: Set<string>;
  campaigns: Campaign[];
}

// Mock change history data
const mockChangeHistory: ChangeEntry[] = [
  {
    id: '1',
    campaignId: '02940214',
    campaignName: "2024 - Beekeeper's - Sponsored Product",
    date: '2025-11-14',
    type: 'Status',
    oldValue: 'Active',
    newValue: 'Paused',
    user: 'ryan.barr@koddi.com',
  },
  {
    id: '2',
    campaignId: '02940214',
    campaignName: "2024 - Beekeeper's - Sponsored Product",
    date: '2025-11-14',
    type: 'Budget',
    oldValue: '$1,234.56',
    newValue: '$2,000.00',
    user: 'ryan.barr@koddi.com',
  },
  {
    id: '3',
    campaignId: '02940215',
    campaignName: "2024 - Beekeeper's - Sponsored Product",
    date: '2025-11-03',
    type: 'Budget type',
    oldValue: 'Monthly',
    newValue: 'Daily',
    user: 'ryan.barr@koddi.com',
  },
  {
    id: '4',
    campaignId: '02940215',
    campaignName: "2024 - Beekeeper's - Sponsored Product",
    date: '2025-11-03',
    type: 'Budget',
    oldValue: '$1,234.56',
    newValue: '$2,000.00',
    user: 'ryan.barr@koddi.com',
  },
  {
    id: '5',
    campaignId: '02940216',
    campaignName: "2024 - Beekeeper's - Sponsored Product",
    date: '2025-11-03',
    type: 'End date',
    oldValue: 'Dec 1, 2025',
    newValue: 'Always On',
    user: 'ryan.barr@koddi.com',
  },
  {
    id: '6',
    campaignId: '02940217',
    campaignName: "2024 - Beekeeper's - Sponsored Product",
    date: '2025-11-02',
    type: 'Pacing',
    oldValue: 'ASAP',
    newValue: 'Evenly',
    user: 'ryan.barr@koddi.com',
  },
];

const ChangeHistoryDrawer = ({
  isOpen,
  onClose,
  selectedCampaignIds,
  campaigns,
}: ChangeHistoryDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter changes to only show selected campaigns if any are selected
  const filteredChanges = useMemo(() => {
    let changes = mockChangeHistory;

    // If campaigns are selected, filter by those campaign IDs
    if (selectedCampaignIds.size > 0) {
      const selectedIds = Array.from(selectedCampaignIds);
      // Get campaign IDs for selected campaigns
      const selectedCampaignIdsSet = new Set(
        campaigns
          .filter((campaign) => selectedIds.includes(campaign.id))
          .map((campaign) => campaign.campaignId)
      );
      
      changes = changes.filter((change) =>
        selectedCampaignIdsSet.has(change.campaignId)
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      changes = changes.filter(
        (change) =>
          change.date.toLowerCase().includes(query) ||
          change.user.toLowerCase().includes(query) ||
          change.campaignName.toLowerCase().includes(query) ||
          change.campaignId.toLowerCase().includes(query) ||
          change.type.toLowerCase().includes(query) ||
          change.oldValue.toLowerCase().includes(query) ||
          change.newValue.toLowerCase().includes(query)
      );
    }

    return changes;
  }, [selectedCampaignIds, campaigns, searchQuery]);

  // Group changes by date
  const groupedChanges = useMemo(() => {
    const groups: { [key: string]: ChangeEntry[] } = {};
    filteredChanges.forEach((change) => {
      if (!groups[change.date]) {
        groups[change.date] = [];
      }
      groups[change.date].push(change);
    });
    return groups;
  }, [filteredChanges]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const sortedDates = Object.keys(groupedChanges).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black z-40 transition-opacity"
        style={{ opacity: 0.25 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[600px] bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Change history</h2>
              {selectedCampaignIds.size > 0 && (
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {selectedCampaignIds.size} {selectedCampaignIds.size === 1 ? 'campaign' : 'campaigns'}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-6 pt-4 pb-3 border-b border-slate-200">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Date, user, campaign attributes"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {sortedDates.length === 0 ? (
              <div className="text-sm text-gray-400 text-center py-8">
                No changes found
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                <div className="space-y-8">
                  {sortedDates.map((date, dateIndex) => {
                    const changes = groupedChanges[date];
                    const isMostRecent = dateIndex === 0;

                    return (
                      <div key={date} className="relative">
                        {/* Date marker */}
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isMostRecent ? 'bg-blue-500' : 'bg-gray-400'
                            } z-10 relative`}
                            style={{ marginLeft: '-2px' }}
                          ></div>
                          <span className="text-sm font-medium text-gray-600">
                            {formatDate(date)}
                          </span>
                        </div>

                        {/* Changes for this date */}
                        <div className="ml-6 space-y-4">
                          {changes.map((change) => (
                            <div
                              key={change.id}
                              className="bg-white border border-slate-200 rounded-md p-4"
                            >
                              {/* Campaign name */}
                              <div className="mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {change.campaignName}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({change.campaignId})
                                </span>
                              </div>

                              {/* Change details */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-gray-900 mb-1">
                                    {change.type}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <span>{change.oldValue}</span>
                                    <span className="mx-2 text-gray-400">→</span>
                                    <span>{change.newValue}</span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500 ml-4">
                                  {change.user}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangeHistoryDrawer;
