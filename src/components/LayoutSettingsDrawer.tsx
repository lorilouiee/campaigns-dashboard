import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTable, faGripVertical, faLock, faSearch } from '@fortawesome/free-solid-svg-icons';

interface LayoutSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentFormat?: 'table' | 'card';
  onSave?: (format: 'table' | 'card', selectedColumns: Column[]) => void;
}

interface Column {
  id: string;
  name: string;
  isLocked?: boolean;
}

const availableColumns: Column[] = [
  { id: 'conversion-rate', name: 'Conversion rate' },
  { id: 'cost-per-transaction', name: 'Cost per transaction' },
  { id: 'exposed-transactions', name: 'Exposed transactions' },
  { id: 'exposed-units', name: 'Exposed units' },
  { id: 'exposed-revenue', name: 'Exposed revenue' },
  { id: 'exposed-roas', name: 'Exposed ROAS' },
  { id: 'clicked-transactions', name: 'Clicked transactions' },
  { id: 'clicked-units', name: 'Clicked units' },
  { id: 'clicked-revenue', name: 'Clicked revenue' },
  { id: 'clicked-roas', name: 'Clicked ROAS' },
  { id: 'viewed-units', name: 'Viewed units' },
  { id: 'viewed-transactions', name: 'Viewed transactions' },
];

const defaultSelectedColumns: Column[] = [
  { id: 'status', name: 'Status', isLocked: true },
  { id: 'impressions', name: 'Impressions' },
  { id: 'clicks', name: 'Clicks' },
  { id: 'cost', name: 'Cost' },
  { id: 'transactions', name: 'Transactions' },
  { id: 'units', name: 'Units' },
  { id: 'revenue', name: 'Revenue' },
  { id: 'roas', name: 'ROAS' },
  { id: 'cpc', name: 'CPC' },
  { id: 'ctr', name: 'CTR' },
];

const LayoutSettingsDrawer = ({ isOpen, onClose, currentFormat = 'table', onSave }: LayoutSettingsDrawerProps) => {
  const [format, setFormat] = useState<'table' | 'card'>(currentFormat);
  const [selectedColumns, setSelectedColumns] = useState<Column[]>(defaultSelectedColumns);
  const [columnSearch, setColumnSearch] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormat(currentFormat);
    }
  }, [isOpen, currentFormat]);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation after mount - use setTimeout to ensure initial render completes
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const filteredAvailableColumns = availableColumns.filter((col) =>
    col.name.toLowerCase().includes(columnSearch.toLowerCase()) &&
    !selectedColumns.some((selected) => selected.id === col.id)
  );

  const handleToggleColumn = (column: Column) => {
    if (selectedColumns.some((col) => col.id === column.id)) {
      // Remove column (unless locked)
      if (!column.isLocked) {
        setSelectedColumns(selectedColumns.filter((col) => col.id !== column.id));
      }
    } else {
      // Add column
      setSelectedColumns([...selectedColumns, column]);
    }
  };

  const handleRemoveColumn = (columnId: string) => {
    const column = selectedColumns.find((col) => col.id === columnId);
    if (column && !column.isLocked) {
      setSelectedColumns(selectedColumns.filter((col) => col.id !== columnId));
    }
  };

  const handleClearAll = () => {
    // Keep only locked columns
    setSelectedColumns(selectedColumns.filter((col) => col.isLocked));
  };

  const handleRevertToDefault = () => {
    setFormat('table');
    setSelectedColumns(defaultSelectedColumns);
    setColumnSearch('');
  };

  const handleSave = () => {
    if (onSave) {
      onSave(format, selectedColumns);
    }
    onClose();
  };

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
            <h2 className="text-lg font-semibold text-gray-900">Layout settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Format Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Format</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormat('table')}
                  className={`flex items-center gap-2 px-4 py-1.5 border rounded-2xl transition-colors ${
                    format === 'table'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FontAwesomeIcon icon={faTable} className="text-sm" />
                  <span className="text-sm font-medium">Table</span>
                </button>
                <button
                  onClick={() => setFormat('card')}
                  className={`flex items-center gap-2 px-4 py-1.5 border rounded-2xl transition-colors ${
                    format === 'card'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Card</span>
                </button>
              </div>
            </div>

            {/* Columns Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Columns</label>

              {/* Search Bar */}
              <div className="relative mb-4">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                />
                <input
                  type="text"
                  value={columnSearch}
                  onChange={(e) => setColumnSearch(e.target.value)}
                  placeholder="Search columns"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Column Panels */}
              <div className="grid grid-cols-2 gap-4">
                {/* Available Columns */}
                <div>
                  <div className="rounded-md p-3 max-h-[400px] overflow-y-auto">
                    {filteredAvailableColumns.length === 0 ? (
                      <div className="text-sm text-gray-400 text-center py-4">
                        No columns available
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredAvailableColumns.map((column) => (
                          <label
                            key={column.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => handleToggleColumn(column)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{column.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Columns */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-700">
                      {selectedColumns.length} selected
                    </div>
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="rounded-md p-3 h-full overflow-y-auto">
                    {selectedColumns.length === 0 ? (
                      <div className="text-sm text-gray-400 text-center py-4">
                        No columns selected
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedColumns.map((column) => (
                          <div
                            key={column.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded group"
                          >
                            {!column.isLocked && (
                              <FontAwesomeIcon
                                icon={faGripVertical}
                                className="text-gray-400 text-xs cursor-move"
                              />
                            )}
                            {column.isLocked && (
                              <FontAwesomeIcon
                                icon={faLock}
                                className="text-gray-400 text-xs"
                              />
                            )}
                            <span className="flex-1 text-sm text-gray-700">{column.name}</span>
                            {!column.isLocked && (
                              <button
                                onClick={() => handleRemoveColumn(column.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
                              >
                                <FontAwesomeIcon icon={faTimes} className="text-xs" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
            <button
              onClick={handleRevertToDefault}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Revert to default
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LayoutSettingsDrawer;
