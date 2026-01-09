import { useState, useMemo, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPencil,
  faHouse,
  faRotateLeft,
  faLink,
  faCopy as faCopyIcon,
  faTrash,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { TabFilter, FiltersState, SavedView, ViewTab } from '../types';

interface HeaderProps {
  activeViewId: string;
  onViewChange: (viewId: string, filters: FiltersState) => void;
  currentFilters: FiltersState;
  onSaveView: (name: string, filters: FiltersState, isDefault: boolean) => void;
  onRenameView: (viewId: string, newName: string) => void;
  onToggleDefault: (viewId: string) => void;
  onCopyLink: (viewId: string) => void;
  onDuplicateView: (viewId: string) => void;
  onDeleteView: (viewId: string) => void;
  savedViews: SavedView[];
  getViewCampaignCount: (filters: FiltersState) => number;
}

// Deep comparison function for filters
const deepEqual = (obj1: FiltersState, obj2: FiltersState): boolean => {
  if (obj1 === obj2) return true;
  
  if (obj1.searchQuery !== obj2.searchQuery) return false;
  if (obj1.dateRange !== obj2.dateRange) return false;
  if (obj1.viewBy !== obj2.viewBy) return false;
  if (obj1.activeTab !== obj2.activeTab) return false;
  
  // Compare advertiser arrays
  const adv1 = Array.isArray(obj1.advertiser) ? obj1.advertiser : [];
  const adv2 = Array.isArray(obj2.advertiser) ? obj2.advertiser : [];
  if (adv1.length !== adv2.length) return false;
  if (!adv1.every((val, idx) => val === adv2[idx])) return false;
  
  return true;
};

const Header = ({ 
  activeViewId, 
  onViewChange, 
  currentFilters, 
  onSaveView,
  onRenameView,
  onToggleDefault,
  onCopyLink,
  onDuplicateView,
  onDeleteView,
  savedViews,
  getViewCampaignCount
}: HeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewName, setViewName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingViewId, setEditingViewId] = useState<string | null>(null);
  const [contextMenuViewId, setContextMenuViewId] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewToDelete, setViewToDelete] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Static tabs (cannot be deleted)
  const staticTabs: ViewTab[] = [
    { id: 'all', name: 'All Campaigns', count: 200, isCustom: false },
    { id: 'underpacing', name: 'Underpacing campaigns', count: 50, isCustom: false },
    { id: 'underperforming', name: 'Underperforming campaigns', count: 50, isCustom: false },
    { id: 'all-proctor-gamble', name: 'All proctor and gamble', count: 50, isCustom: false },
  ];

  // Combine all views: default saved views first, then static tabs, then other saved views
  const allViews = useMemo(() => {
    // Convert saved views to ViewTab format with campaign counts
    const savedViewTabs: ViewTab[] = savedViews.map((view) => ({
      id: view.id,
      name: view.name,
      isCustom: true,
      isDefault: view.isDefault,
      filters: view.filters,
      count: getViewCampaignCount(view.filters),
    }));

    const defaultViews = savedViewTabs.filter(v => v.isDefault);
    const nonDefaultSavedViews = savedViewTabs.filter(v => !v.isDefault);
    const staticTabsList = staticTabs;
    
    return [...defaultViews, ...staticTabsList, ...nonDefaultSavedViews];
  }, [savedViews, getViewCampaignCount]);

  // Check if current view is modified
  const isViewModified = useMemo(() => {
    const activeView = allViews.find(v => v.id === activeViewId);
    if (!activeView || !activeView.filters) return false;
    
    return !deepEqual(currentFilters, activeView.filters);
  }, [activeViewId, currentFilters, allViews]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenuViewId(null);
        setContextMenuPosition(null);
      }
    };

    if (contextMenuViewId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenuViewId]);

  const handleTabClick = (view: ViewTab, event: React.MouseEvent<HTMLButtonElement>) => {
    // Only show context menu for custom saved views (not static tabs)
    if (view.isCustom && activeViewId === view.id) {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      
      setContextMenuViewId(view.id);
      setContextMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
      return;
    }

    // Normal tab click behavior
    if (view.filters) {
      // Restore saved view filters
      onViewChange(view.id, view.filters);
    } else {
      // Static tab - create filter state based on tab ID
      const tabFilter = view.id as TabFilter;
      const staticFilters: FiltersState = {
        searchQuery: currentFilters.searchQuery,
        dateRange: currentFilters.dateRange,
        advertiser: currentFilters.advertiser,
        viewBy: currentFilters.viewBy,
        activeTab: tabFilter,
      };
      onViewChange(view.id, staticFilters);
    }
    
    // Close context menu if open
    setContextMenuViewId(null);
    setContextMenuPosition(null);
  };

  const handleRename = () => {
    const view = savedViews.find(v => v.id === contextMenuViewId);
    if (view) {
      setViewName(view.name);
      setIsEditMode(true);
      setEditingViewId(view.id);
      setIsDefault(view.isDefault);
      setIsModalOpen(true);
      setContextMenuViewId(null);
      setContextMenuPosition(null);
    }
  };

  const handleMakeDefault = () => {
    if (contextMenuViewId) {
      onToggleDefault(contextMenuViewId);
      setContextMenuViewId(null);
      setContextMenuPosition(null);
    }
  };

  const handleCopyLink = () => {
    if (contextMenuViewId) {
      onCopyLink(contextMenuViewId);
      setContextMenuViewId(null);
      setContextMenuPosition(null);
    }
  };

  const handleDuplicate = () => {
    if (contextMenuViewId) {
      onDuplicateView(contextMenuViewId);
      setContextMenuViewId(null);
      setContextMenuPosition(null);
    }
  };

  const handleDelete = () => {
    if (contextMenuViewId) {
      setViewToDelete(contextMenuViewId);
      setShowDeleteModal(true);
      setContextMenuViewId(null);
      setContextMenuPosition(null);
    }
  };

  const confirmDelete = () => {
    if (viewToDelete) {
      onDeleteView(viewToDelete);
      setViewToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setViewToDelete(null);
    setShowDeleteModal(false);
  };

  const getActiveView = () => {
    return savedViews.find(v => v.id === contextMenuViewId);
  };


  return (
    <>
      <div className="bg-white" style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}>
        <div className="px-8 py-6" style={{ backgroundColor: '#F7F8FC', boxSizing: 'content-box', width: '1424px' }}>
          <h1 className="text-2xl font-medium text-gray-900 mb-4">Campaigns</h1>
          <div 
            className="flex items-center gap-6 w-full overflow-x-auto" 
            style={{ 
              height: 'fit-content', 
              borderBottom: '1px solid rgba(229, 231, 235, 1)',
              scrollbarWidth: 'thin',
            }}
          >
            {allViews.map((view) => {
              const isActive = activeViewId === view.id;
              const showModified = isActive && isViewModified && view.isCustom;
              
              return (
                <div key={view.id} className="relative" ref={(el) => {
                  if (el) {
                    const button = el.querySelector('button');
                    if (button) tabRefs.current[view.id] = button;
                  }
                }}>
                <button
                  onClick={(e) => handleTabClick(view, e)}
                  className={`flex items-center justify-center gap-2 px-0 pb-2 transition-colors flex-shrink-0 ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  style={{
                    borderTop: 'none',
                    borderRight: 'none',
                    borderLeft: 'none',
                    borderBottom: isActive ? '1px solid rgba(37, 99, 235, 1)' : 'none',
                    borderImage: 'none',
                    fontWeight: 400,
                    fontSize: '14px',
                    marginBottom: isActive ? '-1px' : '0',
                    position: isActive ? 'relative' : 'static',
                    zIndex: isActive ? 1 : 'auto',
                  }}
                >
                  <span 
                    style={{ 
                      fontWeight: 400, 
                      fontSize: '14px', 
                      color: isActive ? 'rgba(37, 99, 235, 1)' : undefined 
                    }}
                  >
                    {view.name}
                    {showModified && (
                      <span style={{ marginLeft: '4px', color: 'rgba(37, 99, 235, 1)' }}>•</span>
                    )}
                  </span>
                  {view.count !== undefined && (
                    <span
                      className={`px-2 rounded-full text-xs font-medium ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600'
                      }`}
                      style={{
                        display: 'flex',
                        height: '24px',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        backgroundColor: isActive ? undefined : 'rgba(229, 231, 235, 1)'
                      }}
                    >
                      {view.count}
                    </span>
                  )}
                </button>
                </div>
              );
            })}
            <button 
              className="text-gray-600 hover:text-gray-900 text-sm font-normal flex-shrink-0"
              style={{ height: '34px' }}
              onClick={() => setIsModalOpen(true)}
            >
              + New view
            </button>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenuViewId && contextMenuPosition && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-white border border-slate-200 rounded-lg shadow-lg"
          style={{
            top: `${contextMenuPosition.top}px`,
            left: `${contextMenuPosition.left}px`,
            minWidth: '180px',
          }}
        >
          <div className="py-1">
            <button
              onClick={handleRename}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <FontAwesomeIcon icon={faPencil} className="text-slate-400 text-sm" />
              <span>Rename view</span>
            </button>
            {getActiveView()?.isDefault ? (
              <button
                onClick={handleMakeDefault}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              >
                <FontAwesomeIcon icon={faRotateLeft} className="text-slate-400 text-sm" />
                <span>Remove as default</span>
              </button>
            ) : (
              <button
                onClick={handleMakeDefault}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              >
                <FontAwesomeIcon icon={faHouse} className="text-slate-400 text-sm" />
                <span>Make default</span>
              </button>
            )}
            <button
              onClick={handleCopyLink}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <FontAwesomeIcon icon={faLink} className="text-slate-400 text-sm" />
              <span>Copy link</span>
            </button>
            <button
              onClick={handleDuplicate}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <FontAwesomeIcon icon={faCopyIcon} className="text-slate-400 text-sm" />
              <span>Duplicate</span>
            </button>
            <div className="border-t border-slate-100 my-1"></div>
            <button
              onClick={handleDelete}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <FontAwesomeIcon icon={faTrash} className="text-slate-400 text-sm" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
          onClick={cancelDelete}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-8"
            style={{
              width: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                backgroundColor: 'rgba(254, 242, 242, 1)',
              }}
            >
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="text-red-600"
                style={{
                  fontSize: '32px',
                  color: 'rgba(220, 38, 38, 1)',
                }}
              />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Delete view?</h2>
            <p className="text-sm text-slate-600 mb-6 text-center">
              Deleting this view can't be undone.
            </p>
            <div className="flex justify-center gap-3 w-full">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
          onClick={() => {
            setIsModalOpen(false);
            setViewName('');
            setIsDefault(false);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-8"
            style={{
              width: '464px',
              height: '282px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              {isEditMode ? 'Rename view' : 'Name your view'}
            </h2>
            
            <div className="mb-4 flex-1">
              <label className="block text-sm text-slate-500 mb-2">Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={viewName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 150) {
                      setViewName(value);
                    }
                  }}
                  className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter view name"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                  {viewName.length}/150
                </span>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="default-view"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="default-view" className="ml-2 text-sm text-gray-700">
                Set as default view
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-auto">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setViewName('');
                  setIsDefault(false);
                  setIsEditMode(false);
                  setEditingViewId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (viewName.trim()) {
                    if (isEditMode && editingViewId) {
                      onRenameView(editingViewId, viewName.trim());
                    } else {
                      onSaveView(viewName.trim(), currentFilters, isDefault);
                    }
                    setIsModalOpen(false);
                    setViewName('');
                    setIsDefault(false);
                    setIsEditMode(false);
                    setEditingViewId(null);
                  }
                }}
                disabled={!viewName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isEditMode ? 'Save' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
