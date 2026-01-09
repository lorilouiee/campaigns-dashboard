import { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faDownload } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import CampaignsTable from './components/CampaignsTable';
import GraphView from './components/GraphView';
import NewCampaignModal from './components/NewCampaignModal';
import Toast from './components/Toast';
import LayoutSettingsDrawer from './components/LayoutSettingsDrawer';
import BulkActionBar from './components/BulkActionBar';
import ConfirmationModal, { ModalType } from './components/ConfirmationModal';
import ChangeHistoryDrawer from './components/ChangeHistoryDrawer';
import AdjustBudgetModal from './components/AdjustBudgetModal';
import CampaignSettingsDrawer from './components/CampaignSettingsDrawer';
import CampaignDetail from './components/CampaignDetail';
import { mockCampaigns, getUniqueAdvertisers } from './data/mockCampaigns';
import { FiltersState, Campaign, SavedView, Alert } from './types';

const defaultFilters: FiltersState = {
  searchQuery: '',
  dateRange: 'Last 7 days',
  advertiser: [],
  viewBy: 'Campaigns',
  activeTab: 'all',
};

const STORAGE_KEY = 'campaigns-dashboard-saved-views';

function App() {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string>('all');
  const [showToast, setShowToast] = useState(false);
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareDateRange, setCompareDateRange] = useState<string>('');
  const [isLayoutSettingsOpen, setIsLayoutSettingsOpen] = useState(false);
  const [isChangeHistoryOpen, setIsChangeHistoryOpen] = useState(false);
  const [isAdjustBudgetOpen, setIsAdjustBudgetOpen] = useState(false);
  const [isCampaignSettingsOpen, setIsCampaignSettingsOpen] = useState(false);
  const [selectedCampaignForSettings, setSelectedCampaignForSettings] = useState<Campaign | null>(null);
  const [alertContext, setAlertContext] = useState<Alert | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: ModalType | null;
  }>({
    isOpen: false,
    type: null,
  });
  const [filteredToSelectedIds, setFilteredToSelectedIds] = useState<Set<string> | null>(null);
  const [campaignStatuses, setCampaignStatuses] = useState<Map<string, 'active' | 'paused'>>(new Map());
  const [campaignBudgets, setCampaignBudgets] = useState<Map<string, number>>(new Map());
  const [layoutFormat, setLayoutFormat] = useState<'table' | 'card'>('table');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Load saved views from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedViews: SavedView[] = JSON.parse(stored);
        setSavedViews(parsedViews);
        
        // Find and load default view
        const defaultView = parsedViews.find(v => v.isDefault);
        if (defaultView) {
          setFilters(defaultView.filters);
          setActiveViewId(defaultView.id);
        }
      }
    } catch (error) {
      console.error('Error loading saved views from localStorage:', error);
    }
  }, []);

  // Persist saved views to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedViews));
    } catch (error) {
      console.error('Error saving views to localStorage:', error);
    }
  }, [savedViews]);

  const advertisers = useMemo(() => getUniqueAdvertisers(mockCampaigns), []);

  // Function to calculate campaign count for any filter state
  const getViewCampaignCount = useMemo(() => {
    return (viewFilters: FiltersState): number => {
      let filtered = [...mockCampaigns];

      // Filter by search query
      if (viewFilters.searchQuery) {
        filtered = filtered.filter(
          (campaign) =>
            campaign.name.toLowerCase().includes(viewFilters.searchQuery.toLowerCase()) ||
            campaign.campaignId.toLowerCase().includes(viewFilters.searchQuery.toLowerCase())
        );
      }

      // Filter by advertiser
      if (viewFilters.advertiser) {
        if (Array.isArray(viewFilters.advertiser)) {
          if (viewFilters.advertiser.length > 0) {
            filtered = filtered.filter((campaign) => 
              campaign.advertiser && viewFilters.advertiser.includes(campaign.advertiser)
            );
          }
        } else if (viewFilters.advertiser !== 'All') {
          filtered = filtered.filter((campaign) => campaign.advertiser === viewFilters.advertiser);
        }
      }

      // Filter by tab
      switch (viewFilters.activeTab) {
        case 'underpacing':
          filtered = filtered.filter((campaign) => campaign.pacingRatio < 50);
          break;
        case 'underperforming':
          filtered = filtered.filter((campaign) => campaign.roas < 3);
          break;
        case 'all-proctor-gamble':
          filtered = filtered.filter((campaign) => campaign.advertiser === 'Proctor & Gamble');
          break;
        default:
          break;
      }

      return filtered.length;
    };
  }, []);

  const filteredCampaigns = useMemo(() => {
    let filtered = [...mockCampaigns].map(campaign => {
      const updatedBudget = campaignBudgets.get(campaign.id);
      return {
        ...campaign,
        status: campaignStatuses.get(campaign.id) || campaign.status || 'active',
        budget: updatedBudget !== undefined ? updatedBudget : campaign.budget,
      };
    });

    // If filtering to selected campaigns, only show those
    if (filteredToSelectedIds && filteredToSelectedIds.size > 0) {
      filtered = filtered.filter((campaign) => filteredToSelectedIds!.has(campaign.id));
    }

    // Filter by search query
    if (filters.searchQuery) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          campaign.campaignId.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Filter by advertiser
    if (filters.advertiser) {
      if (Array.isArray(filters.advertiser)) {
        if (filters.advertiser.length > 0) {
          filtered = filtered.filter((campaign) => 
            campaign.advertiser && filters.advertiser.includes(campaign.advertiser)
          );
        }
      } else if (filters.advertiser !== 'All') {
        filtered = filtered.filter((campaign) => campaign.advertiser === filters.advertiser);
      }
    }

    // Filter by tab
    switch (filters.activeTab) {
      case 'underpacing':
        filtered = filtered.filter((campaign) => campaign.pacingRatio < 50);
        break;
      case 'underperforming':
        filtered = filtered.filter((campaign) => campaign.roas < 3);
        break;
      case 'all-proctor-gamble':
        filtered = filtered.filter((campaign) => campaign.advertiser === 'Proctor & Gamble');
        break;
      default:
        break;
    }

    return filtered;
  }, [filters, filteredToSelectedIds, campaignStatuses, campaignBudgets]);

  const hasActiveFilters = useMemo(() => {
    const advertiserIsActive = Array.isArray(filters.advertiser) 
      ? filters.advertiser.length > 0
      : filters.advertiser !== defaultFilters.advertiser && filters.advertiser !== 'All';
    
    return (
      filters.searchQuery !== '' ||
      filters.dateRange !== defaultFilters.dateRange ||
      advertiserIsActive ||
      filters.activeTab !== defaultFilters.activeTab
    );
  }, [filters]);

  const updateFilter = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSelectedCampaigns(new Set());
    setActiveViewId('all');
    setFilteredToSelectedIds(null);
  };

  const handleSaveView = (name: string, viewFilters: FiltersState, isDefault: boolean) => {
    const newView: SavedView = {
      id: Date.now().toString(),
      name,
      filters: { ...viewFilters },
      isDefault,
      createdAt: new Date().toISOString(),
      isCustom: true,
    };

    setSavedViews((prev) => {
      // If this is set as default, unset all other defaults
      const updated = prev.map((view) => ({ ...view, isDefault: false }));
      
      if (isDefault) {
        // Insert at the beginning if default
        return [newView, ...updated];
      } else {
        // Append to the end if not default
        return [...updated, newView];
      }
    });

    // If set as default, apply the filters immediately and set as active
    if (isDefault) {
      setFilters(viewFilters);
      setActiveViewId(newView.id);
    } else {
      // Set as active view
      setActiveViewId(newView.id);
    }

    // Show toast notification
    setShowToast(true);
  };

  const handleViewChange = (viewId: string, viewFilters: FiltersState) => {
    setFilters(viewFilters);
    setActiveViewId(viewId);
  };

  const handleRenameView = (viewId: string, newName: string) => {
    setSavedViews((prev) =>
      prev.map((view) => (view.id === viewId ? { ...view, name: newName } : view))
    );
  };

  const handleToggleDefault = (viewId: string) => {
    setSavedViews((prev) => {
      const view = prev.find((v) => v.id === viewId);
      if (!view) return prev;

      const isCurrentlyDefault = view.isDefault;
      
      if (isCurrentlyDefault) {
        // Remove as default - move to end
        return prev.map((v) => (v.id === viewId ? { ...v, isDefault: false } : v));
      } else {
        // Make default - unset all others and this one becomes default
        const updated = prev.map((v) => ({ ...v, isDefault: false }));
        const targetView = updated.find((v) => v.id === viewId);
        if (targetView) {
          targetView.isDefault = true;
          // Move to beginning
          const withoutTarget = updated.filter((v) => v.id !== viewId);
          return [targetView, ...withoutTarget];
        }
        return updated;
      }
    });
  };

  const handleCopyLink = (viewId: string) => {
    // Mock action - in a real app, this would generate a shareable URL
    const url = `${window.location.origin}/views/${viewId}`;
    navigator.clipboard.writeText(url).then(() => {
      console.log('Link copied to clipboard:', url);
      // Could show a toast here
    });
  };

  const handleDuplicateView = (viewId: string) => {
    const viewToDuplicate = savedViews.find((v) => v.id === viewId);
    if (viewToDuplicate) {
      const newView: SavedView = {
        id: Date.now().toString(),
        name: `${viewToDuplicate.name} - copy`,
        filters: { ...viewToDuplicate.filters },
        isDefault: false,
        createdAt: new Date().toISOString(),
        isCustom: true,
      };
      setSavedViews((prev) => [...prev, newView]);
      setActiveViewId(newView.id);
      setFilters(newView.filters);
    }
  };

  const handleDeleteView = (viewId: string) => {
    setSavedViews((prev) => prev.filter((view) => view.id !== viewId));
    
    // If deleted view was active, switch to next available view or 'all'
    if (activeViewId === viewId) {
      const remainingViews = savedViews.filter((v) => v.id !== viewId);
      if (remainingViews.length > 0) {
        const nextView = remainingViews[0];
        setActiveViewId(nextView.id);
        setFilters(nextView.filters);
      } else {
        setActiveViewId('all');
        setFilters(defaultFilters);
      }
    }
  };

  const handleNewCampaign = () => {
    setIsModalOpen(true);
  };

  const handleLayoutSettings = () => {
    setIsLayoutSettingsOpen(true);
  };

  const handleExportCSV = () => {
    console.log('Export CSV clicked');
  };

  const handleRowClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleBackFromDetail = () => {
    setSelectedCampaign(null);
  };

  const handleShowConfirmation = (type: ModalType) => {
    setConfirmationModal({ isOpen: true, type });
  };

  const handleConfirmAction = () => {
    if (!confirmationModal.type) return;

    switch (confirmationModal.type) {
      case 'pause':
        console.log('Pause selected campaigns:', Array.from(selectedCampaigns));
        setCampaignStatuses((prev) => {
          const next = new Map(prev);
          selectedCampaigns.forEach((id) => {
            next.set(id, 'paused');
          });
          return next;
        });
        break;
      case 'resume':
        console.log('Resume selected campaigns:', Array.from(selectedCampaigns));
        setCampaignStatuses((prev) => {
          const next = new Map(prev);
          selectedCampaigns.forEach((id) => {
            next.set(id, 'active');
          });
          return next;
        });
        break;
      case 'delete':
        console.log('Delete selected campaigns:', Array.from(selectedCampaigns));
        // TODO: Implement actual delete logic
        setSelectedCampaigns(new Set());
        break;
    }
    setConfirmationModal({ isOpen: false, type: null });
  };

  const handleCancelAction = () => {
    setConfirmationModal({ isOpen: false, type: null });
  };

  const handleFilterToSelected = () => {
    if (selectedCampaigns.size === 0) return;
    
    // Filter to only show selected campaigns
    setFilteredToSelectedIds(new Set(selectedCampaigns));
    
    // Clear the search query and other filters to show only selected campaigns
    updateFilter('searchQuery', '');
    updateFilter('advertiser', []);
    updateFilter('activeTab', 'all');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCampaigns(new Set(filteredCampaigns.map((c) => c.id)));
    } else {
      setSelectedCampaigns(new Set());
    }
  };

  const handleSelectCampaign = (campaignId: string, checked: boolean) => {
    setSelectedCampaigns((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(campaignId);
      } else {
        next.delete(campaignId);
      }
      return next;
    });
  };

  const isAllSelected =
    filteredCampaigns.length > 0 &&
    filteredCampaigns.every((campaign) => selectedCampaigns.has(campaign.id));

  const isIndeterminate =
    selectedCampaigns.size > 0 &&
    selectedCampaigns.size < filteredCampaigns.length;

  // If a campaign is selected, show the detail view
  if (selectedCampaign) {
    return (
      <div className="h-full flex flex-col">
        {/* Top Bar - Full Width Blue Header */}
        <div className="w-full h-16 bg-blue-600 flex items-center flex-shrink-0">
        </div>
        
        {/* Body Wrapper - Contains Detail View */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          <div className="flex-1 bg-slate-50 overflow-hidden">
            <CampaignDetail
              campaign={selectedCampaign}
              onBack={handleBackFromDetail}
              onEdit={(campaign) => {
                setSelectedCampaignForSettings(campaign);
                setAlertContext(null);
                setIsCampaignSettingsOpen(true);
              }}
              onDuplicate={(campaign) => {
                console.log('Duplicate campaign:', campaign);
                // TODO: Implement duplicate logic
              }}
              onPause={(campaign) => {
                setCampaignStatuses((prev) => {
                  const next = new Map(prev);
                  const newStatus = campaign.status === 'active' ? 'paused' : 'active';
                  next.set(campaign.id, newStatus);
                  // Update selected campaign status
                  setSelectedCampaign({ ...campaign, status: newStatus });
                  return next;
                });
              }}
            />
          </div>
        </div>
        <CampaignSettingsDrawer
          isOpen={isCampaignSettingsOpen}
          onClose={() => {
            setIsCampaignSettingsOpen(false);
            setSelectedCampaignForSettings(null);
            setAlertContext(null);
          }}
          campaign={selectedCampaignForSettings}
          alertContext={alertContext}
          onSave={(campaignId, updates) => {
            // Update campaign data in state
            if (updates.status) {
              setCampaignStatuses((prev) => {
                const next = new Map(prev);
                next.set(campaignId, updates.status!);
                return next;
              });
              // Update selected campaign if it's the same one
              if (selectedCampaign && selectedCampaign.id === campaignId) {
                setSelectedCampaign({ ...selectedCampaign, status: updates.status });
              }
            }
            if (updates.budget) {
              setCampaignBudgets((prev) => {
                const next = new Map(prev);
                next.set(campaignId, updates.budget!);
                return next;
              });
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar - Full Width Blue Header */}
      <div className="w-full h-16 bg-blue-600 flex items-center flex-shrink-0">
      </div>
      
      {/* Body Wrapper - Contains Sidebar and Main Content */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar />
        <div className="flex-1 bg-slate-50 overflow-y-auto overflow-x-hidden">
          <Header
            activeViewId={activeViewId}
            onViewChange={handleViewChange}
            currentFilters={filters}
            onSaveView={handleSaveView}
            onRenameView={handleRenameView}
            onToggleDefault={handleToggleDefault}
            onCopyLink={handleCopyLink}
            onDuplicateView={handleDuplicateView}
            onDeleteView={handleDeleteView}
            savedViews={savedViews}
            getViewCampaignCount={getViewCampaignCount}
          />
          <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onNewCampaign={handleNewCampaign}
            advertisers={advertisers}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            isGraphVisible={isGraphVisible}
            onToggleGraph={() => setIsGraphVisible((v) => !v)}
            compareEnabled={compareEnabled}
            onCompareChange={setCompareEnabled}
            compareDateRange={compareDateRange}
            onCompareDateRangeChange={setCompareDateRange}
          />
          <div className="px-6" style={{ boxSizing: 'content-box', backgroundColor: 'unset' }}>
            <GraphView isVisible={isGraphVisible} compareEnabled={compareEnabled} dateRange={filters.dateRange} />
          </div>
          <div className="px-6 py-6" style={{ boxSizing: 'content-box', backgroundColor: 'unset' }}>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ boxShadow: 'none' }}>
              <div className="flex items-center gap-4 px-6 pt-6 pb-4">
                <button
                  onClick={handleNewCampaign}
                  className="text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  style={{ backgroundColor: 'rgba(54, 125, 254, 1)', height: '36px', padding: '8px 16px', borderRadius: '8px' }}
                >
                  <span className="text-lg">+</span>
                  <span>New Campaign</span>
                </button>
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => updateFilter('searchQuery', e.target.value)}
                  placeholder="Filter ad groups, access quick actions..."
                  className="px-4 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  style={{ width: '375px', height: '36px' }}
                />
                <div className="ml-auto flex items-center gap-4">
                  <button
                    onClick={handleLayoutSettings}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md bg-white hover:bg-gray-50 transition-colors text-sm"
                    style={{ height: '36px' }}
                  >
                    <FontAwesomeIcon icon={faGear} className="text-slate-500 text-sm" />
                    <span className="text-slate-700">Layout settings</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md bg-white hover:bg-gray-50 transition-colors text-sm"
                    style={{ height: '36px' }}
                  >
                    <FontAwesomeIcon icon={faDownload} className="text-slate-500 text-sm" />
                    <span className="text-slate-700">Export CSV</span>
                  </button>
                </div>
              </div>
              <BulkActionBar
                selectedCount={selectedCampaigns.size}
                onClose={() => {
                  setSelectedCampaigns(new Set());
                  setFilteredToSelectedIds(null);
                }}
                onPause={() => handleShowConfirmation('pause')}
                onResume={() => handleShowConfirmation('resume')}
                onFilterToSelected={handleFilterToSelected}
                onAdjustBudget={() => {
                  setIsAdjustBudgetOpen(true);
                }}
                onDelete={() => handleShowConfirmation('delete')}
              />
              <CampaignsTable
                campaigns={filteredCampaigns}
                onRowClick={handleRowClick}
                selectedCampaigns={selectedCampaigns}
                onSelectAll={handleSelectAll}
                onSelectCampaign={handleSelectCampaign}
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                compareEnabled={compareEnabled}
                compareDateRange={compareDateRange}
                layoutFormat={layoutFormat}
                onSettingsClick={(campaign) => {
                  setSelectedCampaignForSettings(campaign);
                  setAlertContext(null); // Clear alert context when opening via settings button
                  setIsCampaignSettingsOpen(true);
                }}
                onAlertClick={(campaign, alert) => {
                  setSelectedCampaignForSettings(campaign);
                  setAlertContext(alert); // Set alert context when clicking alert badge
                  setIsCampaignSettingsOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <NewCampaignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <LayoutSettingsDrawer
        isOpen={isLayoutSettingsOpen}
        onClose={() => setIsLayoutSettingsOpen(false)}
        currentFormat={layoutFormat}
        onSave={(format) => {
          setLayoutFormat(format);
        }}
      />
      <ChangeHistoryDrawer
        isOpen={isChangeHistoryOpen}
        onClose={() => setIsChangeHistoryOpen(false)}
        selectedCampaignIds={selectedCampaigns}
        campaigns={mockCampaigns}
      />
      <AdjustBudgetModal
        isOpen={isAdjustBudgetOpen}
        onClose={() => setIsAdjustBudgetOpen(false)}
        selectedCampaignIds={selectedCampaigns}
        campaigns={mockCampaigns}
        onSave={(updates) => {
          // Update campaign budgets in state
          setCampaignBudgets((prev) => {
            const next = new Map(prev);
            updates.forEach((newBudget, campaignId) => {
              next.set(campaignId, newBudget);
            });
            return next;
          });
          setSelectedCampaigns(new Set());
        }}
      />
      <CampaignSettingsDrawer
        isOpen={isCampaignSettingsOpen}
        onClose={() => {
          setIsCampaignSettingsOpen(false);
          setSelectedCampaignForSettings(null);
          setAlertContext(null); // Clear alert context when closing
        }}
        campaign={selectedCampaignForSettings}
        alertContext={alertContext}
        onSave={(campaignId, updates) => {
          // Update campaign data in state
          if (updates.status) {
            setCampaignStatuses((prev) => {
              const next = new Map(prev);
              next.set(campaignId, updates.status!);
              return next;
            });
          }
          if (updates.budget) {
            setCampaignBudgets((prev) => {
              const next = new Map(prev);
              next.set(campaignId, updates.budget!);
              return next;
            });
          }
        }}
      />
      <Toast
        message="View saved"
        description="Access it anytime to track performance or make updates."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      {confirmationModal.type && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          type={confirmationModal.type}
          selectedCount={selectedCampaigns.size}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </div>
  );
}

export default App;
