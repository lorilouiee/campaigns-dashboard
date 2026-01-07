import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

interface BulkActionBarProps {
  selectedCount: number;
  onClose: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onFilterToSelected?: () => void;
  onAdjustBudget?: () => void;
  onDelete?: () => void;
}

const BulkActionBar = ({
  selectedCount,
  onClose,
  onPause,
  onResume,
  onFilterToSelected,
  onAdjustBudget,
  onDelete,
}: BulkActionBarProps) => {
  const handlePause = () => {
    console.log('Pause campaigns');
    onPause?.();
  };

  const handleResume = () => {
    console.log('Resume campaigns');
    onResume?.();
  };

  const handleFilterToSelected = () => {
    console.log('Filter to selected campaigns');
    onFilterToSelected?.();
  };

  const handleAdjustBudget = () => {
    onAdjustBudget?.();
  };

  const handleDelete = () => {
    console.log('Delete campaigns');
    onDelete?.();
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 px-6 py-4 flex items-center gap-6 m-6 rounded-xl">
      {/* Selected count */}
      <span className="text-sm font-semibold text-gray-900">
        {selectedCount} {selectedCount === 1 ? 'selected' : 'selected'}
      </span>

      {/* Separator */}
      <div className="w-px h-5 bg-gray-300" />

      {/* Action buttons */}
      <button
        onClick={handlePause}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
      >
        Pause
      </button>

      <div className="w-px h-5 bg-gray-300" />

      <button
        onClick={handleResume}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
      >
        Resume
      </button>

      <div className="w-px h-5 bg-gray-300" />

      <button
        onClick={handleFilterToSelected}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
      >
        Filter to selected campaigns
      </button>

      <div className="w-px h-5 bg-gray-300" />

      <button
        onClick={handleAdjustBudget}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
      >
        Adjust budget
      </button>

      <div className="w-px h-5 bg-gray-300" />

      <button
        onClick={handleDelete}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
      >
        <FontAwesomeIcon icon={faTrash} className="text-xs" />
        <span>Delete campaigns</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
      >
        <FontAwesomeIcon 
          icon={faTimes} 
          className="text-xs" 
          style={{ width: '12px', height: '16px' }}
        />
      </button>
    </div>
  );
};

export default BulkActionBar;
