import { useState, useEffect } from 'react';
import { Campaign } from '../types';

interface AdjustBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCampaignIds: Set<string>;
  campaigns: Campaign[];
  onSave?: (updates: Map<string, number>) => void;
}

const AdjustBudgetModal = ({
  isOpen,
  onClose,
  selectedCampaignIds,
  campaigns,
  onSave,
}: AdjustBudgetModalProps) => {
  const [percentage, setPercentage] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      setPercentage('');
    }
  }, [isOpen]);

  // Get selected campaigns
  const selectedCampaigns = campaigns.filter((campaign) => 
    selectedCampaignIds.has(campaign.id)
  );

  // Calculate new budgets based on percentage
  const calculateBudgetUpdates = (): Map<string, number> => {
    if (!percentage || selectedCampaigns.length === 0) {
      return new Map();
    }

    const percent = parseFloat(percentage);
    if (isNaN(percent)) {
      return new Map();
    }

    const updates = new Map<string, number>();
    selectedCampaigns.forEach((campaign) => {
      const original = campaign.budget;
      const newBudget = Math.round(original * (1 + percent / 100));
      updates.set(campaign.id, newBudget);
    });

    return updates;
  };

  const handleSave = () => {
    const updates = calculateBudgetUpdates();
    if (onSave && updates.size > 0) {
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

  const isSaveDisabled = !percentage || isNaN(parseFloat(percentage)) || selectedCampaigns.length === 0;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        onClick={onClose}
      />

      {/* Modal Container - Centered */}
      <div className="flex min-h-screen items-center justify-center px-4 py-4">
        {/* Modal */}
        <div className="relative bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all w-full max-w-md">
          <div className="bg-white px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Increase budget</h2>
                {selectedCampaignIds.size > 0 && (
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {selectedCampaignIds.size} campaigns selected
                  </span>
                )}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={percentage}
                  onChange={handlePercentageChange}
                  placeholder="0"
                  className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                  %
                </span>
              </div>
            </div>

            {/* Footer - Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaveDisabled}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdjustBudgetModal;
