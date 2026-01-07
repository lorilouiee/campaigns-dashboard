import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Campaign } from '../types';

interface AdjustBudgetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCampaignIds: Set<string>;
  campaigns: Campaign[];
  onSave?: (updates: Map<string, number>) => void;
}

const AdjustBudgetDrawer = ({
  isOpen,
  onClose,
  selectedCampaignIds,
  campaigns,
  onSave,
}: AdjustBudgetDrawerProps) => {
  const [percentage, setPercentage] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      setPercentage('');
    }
  }, [isOpen]);

  // Get selected campaigns
  const selectedCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => selectedCampaignIds.has(campaign.id));
  }, [campaigns, selectedCampaignIds]);

  // Calculate new budgets based on percentage
  const budgetUpdates = useMemo(() => {
    if (!percentage || selectedCampaigns.length === 0) {
      return new Map<string, { original: number; new: number; campaign: Campaign }>();
    }

    const percent = parseFloat(percentage);
    if (isNaN(percent)) {
      return new Map<string, { original: number; new: number; campaign: Campaign }>();
    }

    const updates = new Map<string, { original: number; new: number; campaign: Campaign }>();
    selectedCampaigns.forEach((campaign) => {
      const original = campaign.budget;
      const newBudget = Math.round(original * (1 + percent / 100));
      updates.set(campaign.id, {
        original,
        new: newBudget,
        campaign,
      });
    });

    return updates;
  }, [percentage, selectedCampaigns]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSave = () => {
    if (onSave && budgetUpdates.size > 0) {
      const updates = new Map<string, number>();
      budgetUpdates.forEach((value, key) => {
        updates.set(key, value.new);
      });
      onSave(updates);
    }
    onClose();
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty, numbers, and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPercentage(value);
    }
  };

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
              <h2 className="text-xl font-bold text-gray-900">Adjust budget</h2>
              {selectedCampaignIds.size > 0 && (
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {selectedCampaignIds.size} {selectedCampaignIds.size === 1 ? 'campaign' : 'campaigns'} selected
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

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Increase budget by section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Increase budget by
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={percentage}
                  onChange={handlePercentageChange}
                  placeholder="0"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
            </div>

            {/* Affected campaigns section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Affected campaigns
              </h3>

              {selectedCampaigns.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-4">
                  No campaigns selected
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedCampaigns.map((campaign) => {
                    const update = budgetUpdates.get(campaign.id);
                    const originalBudget = campaign.budget;
                    const newBudget = update ? update.new : originalBudget;

                    return (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="text-sm text-gray-600">
                          {campaign.name}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(originalBudget)} → {formatCurrency(newBudget)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!percentage || budgetUpdates.size === 0}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdjustBudgetDrawer;
