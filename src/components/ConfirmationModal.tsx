import React from 'react';

export type ModalType = 'pause' | 'resume' | 'delete';

interface ConfirmationModalProps {
  isOpen: boolean;
  type: ModalType;
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal = ({
  isOpen,
  type,
  selectedCount,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const getModalContent = () => {
    switch (type) {
      case 'pause':
        return {
          title: 'Pause campaigns?',
          message: `You have ${selectedCount} ${selectedCount === 1 ? 'campaign' : 'campaigns'} selected. Pausing them will stop all ad delivery and spend until they're resumed.`,
          iconBg: 'bg-orange-500',
          icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="3" width="2" height="10" rx="0.5" fill="white"/>
              <rect x="9" y="3" width="2" height="10" rx="0.5" fill="white"/>
            </svg>
          ),
        };
      case 'resume':
        return {
          title: 'Resume campaigns?',
          message: `You have ${selectedCount} ${selectedCount === 1 ? 'campaign' : 'campaigns'} selected. Resuming them will restart ad delivery and spend based on their latest settings.`,
          iconBg: 'bg-blue-400',
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="2" fill="white"/>
              <path d="M10 4C10 4 6 6 6 10C6 14 10 16 10 16" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M10 2C10 2 4 5 4 10C4 15 10 18 10 18" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M10 6C10 6 8 7 8 10C8 13 10 14 10 14" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
          ),
        };
      case 'delete':
        return {
          title: 'Delete campaigns?',
          message: `You've selected ${selectedCount} ${selectedCount === 1 ? 'campaign' : 'campaigns'} to delete. This will permanently remove them and their related data. This can't be undone.`,
          iconBg: 'bg-red-500',
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V10M10 14H10.01" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="10" cy="4" r="1" fill="white"/>
            </svg>
          ),
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        onClick={onCancel}
      ></div>

      {/* Modal Container - Centered */}
      <div className="flex min-h-screen items-center justify-center px-4 py-4">
        {/* Modal */}
        <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg">
          <div className="bg-white px-6 pt-8 pb-6 sm:p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`${content.iconBg} w-16 h-16 rounded-full flex items-center justify-center`}>
                {content.icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
              {content.title}
            </h3>

            {/* Message */}
            <p className="text-sm text-gray-600 text-center mb-8">
              {content.message}
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
